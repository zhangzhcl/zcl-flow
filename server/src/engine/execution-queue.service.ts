import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionEntity } from '../executions/execution.entity';
import { ExecutionsService } from '../executions/executions.service';
import { ExecutionEventsService } from '../events/execution-events.service';
import { WorkflowEntity } from '../workflows/workflow.entity';
import { EngineService, RunOptions } from './engine.service';

interface QueueItem {
  execution: ExecutionEntity;
  workflow: WorkflowEntity;
  input: Record<string, unknown>;
  options: RunOptions;
}

/**
 * Bounded queue for asynchronous workflow runs.
 *
 * A synchronous `POST /run` holds an HTTP connection for the whole duration of
 * the workflow, which breaks down as soon as a run takes minutes (LLM chains,
 * loops). Callers now get an execution id immediately and follow progress over
 * the SSE stream. Concurrency is capped so a burst of webhooks cannot exhaust
 * the process.
 */
@Injectable()
export class ExecutionQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(ExecutionQueueService.name);
  private readonly queue: QueueItem[] = [];
  /** executionId -> abort controller of a queued or running execution. */
  private readonly controllers = new Map<string, AbortController>();
  private active = 0;

  constructor(
    private readonly engine: EngineService,
    private readonly executions: ExecutionsService,
    private readonly events: ExecutionEventsService,
    private readonly config: ConfigService,
  ) {}

  onModuleDestroy(): void {
    for (const controller of this.controllers.values()) controller.abort();
    this.controllers.clear();
  }

  private get concurrency(): number {
    return Math.max(1, Number(this.config.get('MAX_CONCURRENT_RUNS', 4)));
  }

  /** Queues a run and returns the `queued` execution row straight away. */
  async enqueue(
    workflow: WorkflowEntity,
    input: Record<string, unknown>,
    options: RunOptions = {},
  ): Promise<ExecutionEntity> {
    const execution = await this.engine.createPendingExecution(workflow, input, options);
    const controller = new AbortController();
    this.controllers.set(execution.id, controller);

    this.queue.push({
      execution,
      workflow,
      input,
      options: { ...options, signal: controller.signal, execution },
    });

    this.events.emit({
      type: 'execution.started',
      ownerId: workflow.ownerId,
      workflowId: workflow.id,
      executionId: execution.id,
      payload: { status: 'queued', triggerType: execution.triggerType, input },
    });

    // Snapshot before draining: the engine mutates the same entity instance as
    // soon as the run starts, which would otherwise leak `running` into the
    // response body of this call.
    const snapshot = { ...execution } as ExecutionEntity;

    // setImmediate (not a bare `void`) so the HTTP response is serialised first.
    setImmediate(() => void this.drain());
    return snapshot;
  }

  /**
   * Cancels a queued or running execution.
   * Returns false when the execution is unknown to this process (already done).
   */
  async cancel(executionId: string): Promise<boolean> {
    const controller = this.controllers.get(executionId);
    if (!controller) return false;
    controller.abort();

    // Still waiting for a slot: no engine run will ever touch it, so the queue
    // owner has to finalise the row here.
    const index = this.queue.findIndex((item) => item.execution.id === executionId);
    if (index >= 0) {
      const [item] = this.queue.splice(index, 1);
      this.controllers.delete(executionId);
      item.execution.status = 'cancelled';
      item.execution.error = 'Execution cancelled before it started';
      item.execution.finishedAt = new Date();
      await this.executions.updateExecution(item.execution);
      this.events.emit({
        type: 'execution.finished',
        ownerId: item.workflow.ownerId,
        workflowId: item.workflow.id,
        executionId,
        payload: { status: 'cancelled' },
      });
    }
    return true;
  }

  /** True while the execution is queued or running in this process. */
  isActive(executionId: string): boolean {
    return this.controllers.has(executionId);
  }

  get stats(): { queued: number; running: number; concurrency: number } {
    return { queued: this.queue.length, running: this.active, concurrency: this.concurrency };
  }

  /** Starts as many queued runs as the concurrency budget allows. */
  private async drain(): Promise<void> {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.active += 1;
      void this.execute(item);
    }
  }

  private async execute(item: QueueItem): Promise<void> {
    try {
      await this.engine.run(item.workflow, item.input, item.options);
    } catch (error: any) {
      // The engine already persists failures; this only catches infrastructure
      // level surprises so the worker slot is never leaked.
      this.logger.error(
        `Queued execution ${item.execution.id} crashed: ${error?.message ?? error}`,
      );
    } finally {
      this.controllers.delete(item.execution.id);
      this.active -= 1;
      void this.drain();
    }
  }
}
