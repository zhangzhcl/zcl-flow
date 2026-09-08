import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { WorkflowEntity } from '../workflows/workflow.entity';
import { NestedRunOptions, NestedRunResult, WorkflowRunner } from './workflow-runner';

/**
 * Concrete WorkflowRunner backed by EngineService.
 *
 * The engine's sub-workflow / loop executors depend on the WORKFLOW_RUNNER
 * token, while EngineService depends on those very executors. Wiring the token
 * straight to EngineService would therefore create a DI cycle that Nest cannot
 * resolve. Instead we hold a ModuleRef and resolve the engine lazily, at call
 * time, long after every provider has been instantiated.
 */
@Injectable()
export class WorkflowRunnerProvider implements WorkflowRunner {
  constructor(private readonly moduleRef: ModuleRef) {}

  async run(
    workflow: WorkflowEntity,
    input: Record<string, unknown>,
    options?: NestedRunOptions,
  ): Promise<NestedRunResult> {
    // Dynamic import keeps this file out of the static engine.service cycle.
    const { EngineService } = await import('./engine.service');
    const engine = this.moduleRef.get(EngineService, { strict: false });
    return engine.run(workflow, input, options);
  }
}
