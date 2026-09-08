import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionsService } from '../executions/executions.service';
import { ExecutionEntity, ExecutionTrigger } from '../executions/execution.entity';
import { ExecutionEventsService } from '../events/execution-events.service';
import { WorkflowEntity } from '../workflows/workflow.entity';
import {
  ExecutionCancelledError,
  FlowDocument,
  FlowEdge,
  FlowNode,
  NodeExecutor,
  RunContext,
} from './engine.types';
import { GraphScheduler, SkipReason } from './graph-scheduler';
import { DebugConfig, DebugSession, DebugSessionService, NodeMock } from './debug-session';
import { NestedRunResult, WorkflowRunner } from './workflow-runner';
import {
  AggregateExecutor,
  AssignExecutor,
  BatchExecutor,
  ClassifyExecutor,
  CodeExecutor,
  ConditionExecutor,
  DataCreateExecutor,
  DataDeleteExecutor,
  DataQueryExecutor,
  DataUpdateExecutor,
  DelayExecutor,
  EndExecutor,
  HttpExecutor,
  JsonExtractExecutor,
  JsonParseExecutor,
  JsonStringifyExecutor,
  KnowledgeRetrieveExecutor,
  KnowledgeWriteExecutor,
  KnowledgeAnswerExecutor,
  BreakExecutor,
  DocParseExecutor,
  ImageQaExecutor,
  OcrExecutor,
  PythonExecutor,
  VideoUnderstandExecutor,
  AudioSummaryExecutor,
  LlmExecutor,
  LoopExecutor,
  NotifyExecutor,
  QuestionExecutor,
  SqlCustomExecutor,
  StartExecutor,
  SubflowExecutor,
  SwitchExecutor,
  TemplateExecutor,
  TextProcessExecutor,
  TextStringExecutor,
  VariableExecutor,
} from './node-executors';

/** Extra metadata describing how a run was started. */
export interface RunOptions {
  triggerType?: ExecutionTrigger;
  triggerId?: string | null;
  /** Cancels the run when aborted. */
  signal?: AbortSignal;
  /** Set for sub-workflow runs so they can be linked to the parent. */
  parentExecutionId?: string | null;
  /** Sub-workflow nesting depth. */
  depth?: number;
  /** Workflow ids already on the call stack (recursion guard). */
  callStack?: string[];
  /** Pre-created execution row, used by the async queue. */
  execution?: ExecutionEntity;
  /** Interactive debug options; when present the run is pausable/steppable. */
  debug?: DebugConfig;
}

/** Bound live-progress emitter for one execution. */
type EmitFn = (
  type: Parameters<ExecutionEventsService['emit']>[0]['type'],
  payload: Record<string, unknown>,
) => void;

/**
 * Workflow execution engine.
 *
 * Traverses the FlowGram document with a dependency-aware scheduler
 * (see GraphScheduler), executing each node with its registered executor and
 * persisting per-node records for full observability.
 */
@Injectable()
export class EngineService implements WorkflowRunner {
  private readonly logger = new Logger(EngineService.name);
  private readonly executors = new Map<string, NodeExecutor>();

  constructor(
    private readonly config: ConfigService,
    private readonly executionsService: ExecutionsService,
    private readonly events: ExecutionEventsService,
    private readonly debugSessions: DebugSessionService,
    startExecutor: StartExecutor,
    endExecutor: EndExecutor,
    llmExecutor: LlmExecutor,
    codeExecutor: CodeExecutor,
    conditionExecutor: ConditionExecutor,
    httpExecutor: HttpExecutor,
    templateExecutor: TemplateExecutor,
    variableExecutor: VariableExecutor,
    delayExecutor: DelayExecutor,
    switchExecutor: SwitchExecutor,
    subflowExecutor: SubflowExecutor,
    loopExecutor: LoopExecutor,
    batchExecutor: BatchExecutor,
    jsonExtractExecutor: JsonExtractExecutor,
    jsonStringifyExecutor: JsonStringifyExecutor,
    jsonParseExecutor: JsonParseExecutor,
    classifyExecutor: ClassifyExecutor,
    textProcessExecutor: TextProcessExecutor,
    textStringExecutor: TextStringExecutor,
    aggregateExecutor: AggregateExecutor,
    notifyExecutor: NotifyExecutor,
    assignExecutor: AssignExecutor,
    questionExecutor: QuestionExecutor,
    knowledgeRetrieveExecutor: KnowledgeRetrieveExecutor,
    knowledgeWriteExecutor: KnowledgeWriteExecutor,
    sqlCustomExecutor: SqlCustomExecutor,
    dataCreateExecutor: DataCreateExecutor,
    dataQueryExecutor: DataQueryExecutor,
    dataUpdateExecutor: DataUpdateExecutor,
    dataDeleteExecutor: DataDeleteExecutor,
    knowledgeAnswerExecutor: KnowledgeAnswerExecutor,
    breakExecutor: BreakExecutor,
    docParseExecutor: DocParseExecutor,
    imageQaExecutor: ImageQaExecutor,
    ocrExecutor: OcrExecutor,
    pythonExecutor: PythonExecutor,
    videoUnderstandExecutor: VideoUnderstandExecutor,
    audioSummaryExecutor: AudioSummaryExecutor,
  ) {
    for (const executor of [
      startExecutor,
      endExecutor,
      llmExecutor,
      codeExecutor,
      conditionExecutor,
      httpExecutor,
      templateExecutor,
      variableExecutor,
      delayExecutor,
      switchExecutor,
      subflowExecutor,
      loopExecutor,
      batchExecutor,
      jsonExtractExecutor,
      jsonStringifyExecutor,
      jsonParseExecutor,
      classifyExecutor,
      textProcessExecutor,
      textStringExecutor,
      aggregateExecutor,
      notifyExecutor,
      assignExecutor,
      questionExecutor,
      knowledgeRetrieveExecutor,
      knowledgeWriteExecutor,
      sqlCustomExecutor,
      dataCreateExecutor,
      dataQueryExecutor,
      dataUpdateExecutor,
      dataDeleteExecutor,
      knowledgeAnswerExecutor,
      breakExecutor,
      docParseExecutor,
      imageQaExecutor,
      ocrExecutor,
      pythonExecutor,
      videoUnderstandExecutor,
      audioSummaryExecutor,
    ]) {
      this.executors.set(executor.type, executor);
    }
  }

  /** Creates the execution row without running it (used by the async queue). */
  createPendingExecution(
    workflow: WorkflowEntity,
    input: Record<string, unknown>,
    options: RunOptions = {},
  ): Promise<ExecutionEntity> {
    return this.executionsService.createExecution({
      workflowId: workflow.id,
      ownerId: workflow.ownerId,
      status: 'queued',
      triggerType: options.triggerType ?? 'manual',
      triggerId: options.triggerId ?? null,
      parentExecutionId: options.parentExecutionId ?? null,
      input,
    });
  }

  async run(
    workflow: WorkflowEntity,
    input: Record<string, unknown>,
    options: RunOptions = {},
  ): Promise<NestedRunResult> {
    const startedAt = Date.now();
    const execution =
      options.execution ?? (await this.createPendingExecution(workflow, input, options));

    execution.status = 'running';
    await this.executionsService.updateExecution(execution);

    const emit: EmitFn = (type, payload) =>
      this.events.emit({
        type,
        ownerId: workflow.ownerId,
        workflowId: workflow.id,
        executionId: execution.id,
        payload,
      });

    emit('execution.started', {
      triggerType: execution.triggerType,
      parentExecutionId: execution.parentExecutionId,
      input,
    });

    const ctx: RunContext = {
      input,
      outputs: {},
      variables: {},
      signal: options.signal,
      ownerId: workflow.ownerId,
      depth: options.depth ?? 0,
      callStack: [...(options.callStack ?? []), workflow.id],
      executionId: execution.id,
    };

    // Interactive debug runs register a session so the debug REST API can
    // pause / step / stop this execution; it is torn down once the run ends.
    const session = options.debug
      ? this.debugSessions.create(execution.id, workflow.ownerId, options.debug)
      : undefined;

    try {
      const document = this.parseDocument(workflow.definition);
      ctx.edges = document.edges;
      execution.output = await this.traverse(document, ctx, execution.id, emit, session);
      execution.status = 'success';
    } catch (error: any) {
      if (error instanceof ExecutionCancelledError || options.signal?.aborted) {
        execution.status = 'cancelled';
        execution.error = 'Execution cancelled';
      } else {
        this.logger.error(`Execution ${execution.id} failed: ${error?.message}`);
        execution.status = 'failed';
        execution.error = String(error?.message ?? error);
      }
    } finally {
      if (session) this.debugSessions.remove(execution.id);
    }

    execution.durationMs = Date.now() - startedAt;
    execution.finishedAt = new Date();
    await this.executionsService.updateExecution(execution);

    emit('execution.finished', {
      status: execution.status,
      output: execution.output,
      error: execution.error,
      durationMs: execution.durationMs,
    });

    return this.executionsService.findOneWithNodes(execution.id);
  }

  private parseDocument(definition: Record<string, unknown> | null): FlowDocument {
    const nodes = (definition?.nodes as FlowNode[]) ?? [];
    const edges = (definition?.edges as FlowEdge[]) ?? [];
    if (!nodes.length) {
      throw new Error('Workflow definition is empty: add nodes before running');
    }
    if (!nodes.some((node) => node.type === 'start')) {
      throw new Error('Workflow must contain a start node');
    }
    return { nodes, edges };
  }

  private async traverse(
    document: FlowDocument,
    ctx: RunContext,
    executionId: string,
    emit: EmitFn,
    session?: DebugSession,
  ): Promise<Record<string, unknown>> {
    const startNode = document.nodes.find((node) => node.type === 'start')!;
    let finalOutput: Record<string, unknown> = {};

    const scheduler = new GraphScheduler(
      document,
      {
        checkpoint: () => {
          if (ctx.signal?.aborted) throw new ExecutionCancelledError();
        },
        execute: async (node) => {
          if (session) {
            // Pauses here when stepping or on a breakpoint; throws if stopped.
            await session.beforeNode(node, ctx, emit);
            const mock = session.getMock(node.id);
            if (mock) {
              const output = { ...mock.output, mock: true };
              ctx.outputs[node.id] = output;
              if (node.type === 'end' || node.type === 'send_message') finalOutput = output;
              await this.recordMock(node, mock, output, executionId, emit);
              return { branch: mock.branch };
            }
          }
          const { output, branch } = await this.executeNode(node, ctx, executionId, emit);
          ctx.outputs[node.id] = output;
          if (node.type === 'end' || node.type === 'send_message') finalOutput = output;
          return { branch };
        },
        skip: (node, reason) => this.recordSkip(node, reason, executionId, emit),
      },
      {
        maxNodes: Number(this.config.get('MAX_NODES_PER_RUN', 100)),
        // Debug runs are strictly serial so single-stepping is deterministic.
        parallelism: session ? 1 : Number(this.config.get('MAX_PARALLEL_NODES', 4)),
      },
    );

    await scheduler.run(startNode);
    return finalOutput;
  }

  /** Persists a node whose real executor was bypassed by a debug mock. */
  private async recordMock(
    node: FlowNode,
    mock: NodeMock,
    output: Record<string, unknown>,
    executionId: string,
    emit: EmitFn,
  ): Promise<void> {
    await this.executionsService.createNodeExecution({
      executionId,
      nodeId: node.id,
      nodeType: node.type,
      status: 'success',
      input: node.data ?? {},
      output,
      durationMs: 0,
    });
    emit('node.finished', {
      nodeId: node.id,
      nodeType: node.type,
      title: String(node.data?.title ?? node.id),
      status: 'success',
      mock: true,
      branch: mock.branch ?? null,
      output,
      durationMs: 0,
    });
  }

  /** Persists a node that never ran (unreachable or on an untaken branch). */
  private async recordSkip(
    node: FlowNode,
    reason: SkipReason,
    executionId: string,
    emit: EmitFn,
  ): Promise<void> {
    await this.executionsService.createNodeExecution({
      executionId,
      nodeId: node.id,
      nodeType: node.type,
      status: 'skipped',
      input: node.data ?? {},
      output: { reason },
      durationMs: 0,
    });
    emit('node.finished', {
      nodeId: node.id,
      nodeType: node.type,
      title: String(node.data?.title ?? node.id),
      status: 'skipped',
      reason,
      durationMs: 0,
    });
  }

  private async executeNode(
    node: FlowNode,
    ctx: RunContext,
    executionId: string,
    emit: EmitFn,
  ) {
    const executor = this.executors.get(node.type);
    const nodeStarted = Date.now();
    const title = String(node.data?.title ?? node.id);

    if (!executor) {
      await this.executionsService.createNodeExecution({
        executionId,
        nodeId: node.id,
        nodeType: node.type,
        status: 'skipped',
        input: node.data ?? {},
        output: { reason: 'no-executor' },
        durationMs: 0,
      });
      emit('node.finished', {
        nodeId: node.id,
        nodeType: node.type,
        title,
        status: 'skipped',
        reason: 'no-executor',
        durationMs: 0,
      });
      return { output: {}, branch: undefined as string | undefined };
    }

    const onError = node.data?.onError as
      | { strategy?: string; retryCount?: number; retryDelayMs?: number }
      | undefined;
    const strategy = onError?.strategy ?? 'fail';
    const maxAttempts = strategy === 'retry' ? Math.min(Math.max(Number(onError?.retryCount ?? 3), 1), 10) + 1 : 1;
    const retryDelayMs = Math.min(Math.max(Number(onError?.retryDelayMs ?? 1000), 0), 30000);

    emit('node.started', { nodeId: node.id, nodeType: node.type, title });

    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await executor.execute(node, ctx);
        await this.executionsService.createNodeExecution({
          executionId,
          nodeId: node.id,
          nodeType: node.type,
          status: 'success',
          input: node.data ?? {},
          output: result.output,
          durationMs: Date.now() - nodeStarted,
        });
        emit('node.finished', {
          nodeId: node.id,
          nodeType: node.type,
          title,
          status: 'success',
          branch: result.branch ?? null,
          output: result.output,
          durationMs: Date.now() - nodeStarted,
        });
        return result;
      } catch (error: any) {
        if (error instanceof ExecutionCancelledError) {
          const message = String(error?.message ?? error);
          await this.executionsService.createNodeExecution({
            executionId,
            nodeId: node.id,
            nodeType: node.type,
            status: 'cancelled',
            input: node.data ?? {},
            output: null,
            error: message,
            durationMs: Date.now() - nodeStarted,
          });
          emit('node.finished', {
            nodeId: node.id,
            nodeType: node.type,
            title,
            status: 'cancelled',
            error: message,
            durationMs: Date.now() - nodeStarted,
          });
          throw error;
        }
        lastError = error;
        if (strategy === 'retry' && attempt < maxAttempts) {
          emit('node.retrying', {
            nodeId: node.id,
            nodeType: node.type,
            title,
            attempt,
            maxAttempts,
            delayMs: retryDelayMs,
          });
          await new Promise((res) => setTimeout(res, retryDelayMs));
          continue;
        }
        break;
      }
    }

    const message = String(lastError?.message ?? lastError);
    if (strategy === 'skip') {
      await this.executionsService.createNodeExecution({
        executionId,
        nodeId: node.id,
        nodeType: node.type,
        status: 'skipped',
        input: node.data ?? {},
        output: {},
        error: message,
        durationMs: Date.now() - nodeStarted,
      });
      emit('node.finished', {
        nodeId: node.id,
        nodeType: node.type,
        title,
        status: 'skipped',
        error: message,
        output: {},
        durationMs: Date.now() - nodeStarted,
      });
      return { output: {}, branch: undefined as string | undefined };
    }

    await this.executionsService.createNodeExecution({
      executionId,
      nodeId: node.id,
      nodeType: node.type,
      status: 'failed',
      input: node.data ?? {},
      output: null,
      error: message,
      durationMs: Date.now() - nodeStarted,
    });
    emit('node.finished', {
      nodeId: node.id,
      nodeType: node.type,
      title,
      status: 'failed',
      error: message,
      durationMs: Date.now() - nodeStarted,
    });
    throw new Error(`Node "${title}" (${node.type}) failed: ${message}`);
  }
}
