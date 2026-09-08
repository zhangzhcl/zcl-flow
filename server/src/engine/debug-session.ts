import { Injectable } from '@nestjs/common';
import * as vm from 'vm';
import { ExecutionCancelledError, FlowNode, RunContext } from './engine.types';
import { interpolate } from './template.util';

/** A user-provided stand-in output for one node, applied during a debug run. */
export interface NodeMock {
  output: Record<string, unknown>;
  /** For branching nodes: which port to follow when the node is mocked. */
  branch?: string;
}

/** Debug options supplied when starting a debug run. */
export interface DebugConfig {
  /** Node ids that pause the run before they execute. */
  breakpoints?: string[];
  /** Optional boolean expressions that must pass for a breakpoint to pause. */
  conditions?: Record<string, string>;
  /** Per-node mock outputs that skip the real executor. */
  mocks?: Record<string, NodeMock>;
  /** Pause before the very first node (default true). */
  pauseOnStart?: boolean;
}

/** Variable snapshot captured each time the run pauses. */
export interface DebugSnapshot {
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
  outputs: Record<string, Record<string, unknown>>;
}

/** Narrow emitter used by the session; the engine's emit is assignable to it. */
type DebugEmitFn = (
  type: 'debug.paused' | 'debug.resumed',
  payload: Record<string, unknown>,
) => void;

interface Gate {
  resolve: () => void;
  reject: (error: Error) => void;
}

/** Evaluate a debug breakpoint expression in the same sandbox style as condition nodes. */
function evaluateBreakpointCondition(expression: string, node: FlowNode, ctx: RunContext): boolean {
  const trimmed = expression.trim();
  if (!trimmed) return true;
  try {
    const resolved = String(interpolate(trimmed, ctx) ?? 'false');
    const sandbox = {
      input: ctx.input,
      nodes: ctx.outputs,
      variables: ctx.variables,
      current: { id: node.id, type: node.type, data: node.data ?? {} },
    };
    const context = vm.createContext(sandbox, {
      codeGeneration: { strings: false, wasm: false },
    });
    return Boolean(new vm.Script(`(${resolved})`).runInContext(context, { timeout: 1000 }));
  } catch {
    return false;
  }
}

/**
 * Interactive control state for one debug run.
 *
 * The engine calls `beforeNode` ahead of every node execution. When the run is
 * single-stepping or the node carries a breakpoint, the session emits a
 * `debug.paused` event (with a full variable snapshot for the monitor) and then
 * blocks on a promise "gate" until the user issues step / continue / stop over
 * the debug REST API. This yields classic debugger semantics without touching
 * the topological scheduler: the run simply awaits between nodes.
 */
export class DebugSession {
  readonly breakpoints = new Set<string>();
  readonly conditions = new Map<string, string>();
  readonly mocks = new Map<string, NodeMock>();
  /** When true the run pauses before the next node (single-step mode). */
  private stepRequested: boolean;
  private gate: Gate | null = null;
  private stopped = false;
  pausedNodeId: string | null = null;
  stepCount = 0;
  private lastSnapshot: DebugSnapshot | null = null;

  constructor(
    readonly executionId: string,
    readonly ownerId: string,
    config: DebugConfig,
  ) {
    for (const id of config.breakpoints ?? []) this.breakpoints.add(id);
    for (const [nodeId, expression] of Object.entries(config.conditions ?? {})) {
      if (expression.trim()) this.conditions.set(nodeId, expression);
    }
    for (const [nodeId, mock] of Object.entries(config.mocks ?? {})) {
      this.mocks.set(nodeId, mock);
    }
    this.stepRequested = config.pauseOnStart ?? true;
  }

  /** Captures the observable state of the run for the variable monitor. */
  private snapshot(ctx: RunContext): DebugSnapshot {
    return {
      input: { ...ctx.input },
      variables: { ...ctx.variables },
      outputs: { ...ctx.outputs },
    };
  }

  /**
   * Pauses before `node` when stepping or on a breakpoint, blocking until the
   * user resumes. Throws when the run has been stopped so the engine unwinds
   * into the `cancelled` status.
   */
  async beforeNode(node: FlowNode, ctx: RunContext, emit: DebugEmitFn): Promise<void> {
    if (this.stopped) throw new ExecutionCancelledError('Debug run stopped');

    const condition = this.conditions.get(node.id);
    const breakpointMatched = this.breakpoints.has(node.id) && (!condition || evaluateBreakpointCondition(condition, node, ctx));
    const shouldPause = this.stepRequested || breakpointMatched;
    if (!shouldPause) return;

    this.pausedNodeId = node.id;
    this.stepCount += 1;
    this.lastSnapshot = this.snapshot(ctx);
    emit('debug.paused', {
      nodeId: node.id,
      nodeType: node.type,
      title: String(node.data?.title ?? node.id),
      step: this.stepCount,
      snapshot: this.lastSnapshot,
    });

    await new Promise<void>((resolve, reject) => {
      this.gate = { resolve, reject };
    });
    this.gate = null;

    if (this.stopped) throw new ExecutionCancelledError('Debug run stopped');
    this.pausedNodeId = null;
    emit('debug.resumed', { nodeId: node.id });
  }

  getMock(nodeId: string): NodeMock | undefined {
    return this.mocks.get(nodeId);
  }

  /** Executes exactly one more node, then pauses again. */
  step(): void {
    this.stepRequested = true;
    this.gate?.resolve();
  }

  /** Runs freely until the next breakpoint (or the end). */
  continueRun(): void {
    this.stepRequested = false;
    this.gate?.resolve();
  }

  /**
   * Aborts a paused run by rejecting the gate. The engine maps the resulting
   * ExecutionCancelledError to the `cancelled` status. The debug controller
   * additionally aborts the queue signal so an in-flight (non-paused) node is
   * interrupted too.
   */
  stop(): void {
    this.stopped = true;
    this.gate?.reject(new ExecutionCancelledError('Debug run stopped'));
  }

  /** Live-updates breakpoints / mocks while a run is in flight. */
  update(config: DebugConfig): void {
    if (config.breakpoints) {
      this.breakpoints.clear();
      for (const id of config.breakpoints) this.breakpoints.add(id);
    }
    if (config.conditions) {
      this.conditions.clear();
      for (const [nodeId, expression] of Object.entries(config.conditions)) {
        if (expression.trim()) this.conditions.set(nodeId, expression);
      }
    }
    if (config.mocks) {
      this.mocks.clear();
      for (const [nodeId, mock] of Object.entries(config.mocks)) {
        this.mocks.set(nodeId, mock);
      }
    }
  }

  getState() {
    return {
      executionId: this.executionId,
      pausedNodeId: this.pausedNodeId,
      step: this.stepCount,
      breakpoints: [...this.breakpoints],
      conditions: Object.fromEntries(this.conditions),
      mocks: Object.fromEntries(this.mocks),
      snapshot: this.lastSnapshot,
      stopped: this.stopped,
    };
  }
}

/**
 * Registry of live debug sessions keyed by execution id. Sessions are created
 * by the engine when a debug run starts and removed when it finishes, so a
 * missing entry simply means "not a debug run (or already done)".
 */
@Injectable()
export class DebugSessionService {
  private readonly sessions = new Map<string, DebugSession>();

  create(executionId: string, ownerId: string, config: DebugConfig): DebugSession {
    const session = new DebugSession(executionId, ownerId, config);
    this.sessions.set(executionId, session);
    return session;
  }

  get(executionId: string): DebugSession | undefined {
    return this.sessions.get(executionId);
  }

  remove(executionId: string): void {
    this.sessions.delete(executionId);
  }
}
