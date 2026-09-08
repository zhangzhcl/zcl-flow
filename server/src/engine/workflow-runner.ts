import type { ExecutionTrigger } from '../executions/execution.entity';
import type { WorkflowEntity } from '../workflows/workflow.entity';

/** Injection token for the workflow runner (see WorkflowRunnerProvider). */
export const WORKFLOW_RUNNER = 'sf:workflow-runner';

export interface NestedRunOptions {
  signal?: AbortSignal;
  parentExecutionId?: string | null;
  depth?: number;
  callStack?: string[];
  triggerType?: ExecutionTrigger;
}

export interface NestedRunResult {
  id: string;
  status: string;
  output: Record<string, unknown> | null;
  error: string | null;
  durationMs?: number;
}

/**
 * Narrow contract the sub-workflow / loop executors need from the engine.
 *
 * Declaring it here breaks the import cycle that would otherwise exist between
 * `engine.service.ts` and `node-executors.ts`. That cycle is not merely a style
 * issue: a circular CommonJS import makes one module observe the other as
 * `undefined` while decorators are evaluated, so the emitted
 * `design:paramtypes` metadata is corrupted and Nest silently injects nothing.
 */
export interface WorkflowRunner {
  run(
    workflow: WorkflowEntity,
    input: Record<string, unknown>,
    options?: NestedRunOptions,
  ): Promise<NestedRunResult>;
}
