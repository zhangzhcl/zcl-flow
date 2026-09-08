/**
 * Shared engine types for workflow graph execution.
 */

export interface FlowNode {
  id: string;
  type: string;
  data?: Record<string, any>;
  blocks?: FlowNode[];
  edges?: FlowEdge[];
}

export interface FlowEdge {
  sourceNodeID: string;
  targetNodeID: string;
  sourcePortID?: string;
  targetPortID?: string;
}

export interface FlowDocument {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

/** Runtime context shared across node executors during one run. */
export interface RunContext {
  /** Workflow-level input variables. */
  input: Record<string, unknown>;
  /** Outputs of every executed node, keyed by node id. */
  outputs: Record<string, Record<string, unknown>>;
  /** Flat variable pool for template interpolation. */
  variables: Record<string, unknown>;
  /** Aborted when the run is cancelled or times out. */
  signal?: AbortSignal;
  /** Account that owns the run; sub-workflow calls are checked against it. */
  ownerId: string;
  /** Sub-workflow nesting depth (0 for a top-level run). */
  depth: number;
  /** Workflow ids on the current call stack, used to reject recursion. */
  callStack: string[];
  /** Execution this context belongs to, so child runs can be linked to it. */
  executionId: string;
  /**
   * Edges of the current document. Lets an executor inspect graph topology
   * (e.g. the aggregate node merges the outputs of its direct predecessors).
   */
  edges?: FlowEdge[];
  /**
   * All nodes of the current document. Used by loop executors to locate body
   * nodes without requiring a separate sub-workflow entity.
   */
  nodes?: FlowNode[];
}

export interface NodeResult {
  output: Record<string, unknown>;
  /** For branching nodes: which port (branch) to follow. */
  branch?: string;
}

export interface NodeExecutor {
  readonly type: string;
  execute(node: FlowNode, ctx: RunContext): Promise<NodeResult>;
}

/** Thrown when a run is cancelled; mapped to the `cancelled` status. */
export class ExecutionCancelledError extends Error {
  constructor(message = 'Execution cancelled') {
    super(message);
    this.name = 'ExecutionCancelledError';
  }
}

/** Throws if the run has been cancelled. Call before any expensive step. */
export function assertNotCancelled(ctx: RunContext): void {
  if (ctx.signal?.aborted) {
    throw new ExecutionCancelledError();
  }
}
