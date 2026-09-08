import { ForbiddenException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ExecutionEntity } from './execution.entity';
import { NodeExecutionEntity } from './node-execution.entity';

@Injectable()
export class ExecutionsService implements OnModuleInit {
  private readonly logger = new Logger(ExecutionsService.name);

  constructor(
    @InjectRepository(ExecutionEntity)
    private readonly executions: Repository<ExecutionEntity>,
    @InjectRepository(NodeExecutionEntity)
    private readonly nodeExecutions: Repository<NodeExecutionEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const orphans = await this.reconcileOrphans();
    if (orphans) {
      this.logger.warn(`Marked ${orphans} interrupted execution(s) as failed on startup`);
    }
  }

  /**
   * Top-level runs of a workflow. Sub-workflow runs are excluded so the history
   * list stays readable; they are reachable by drilling into the parent.
   */
  findByWorkflow(workflowId: string, ownerId: string): Promise<ExecutionEntity[]> {
    return this.executions.find({
      where: { workflowId, ownerId, parentExecutionId: IsNull() },
      order: { startedAt: 'DESC' },
      take: 50,
    });
  }

  async findOneWithNodes(id: string, ownerId?: string) {
    const execution = await this.executions.findOneBy({ id });
    if (!execution) {
      throw new NotFoundException(`Execution ${id} not found`);
    }
    if (ownerId !== undefined && execution.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have access to this execution');
    }
    const nodes = await this.nodeExecutions.find({
      where: { executionId: id },
      order: { startedAt: 'ASC' },
    });
    return { ...execution, nodes };
  }

  /** All top-level runs across all workflows for the owner, for the logs page. */
  findAll(ownerId: string, limit = 100): Promise<ExecutionEntity[]> {
    return this.executions.find({
      where: { ownerId, parentExecutionId: IsNull() },
      order: { startedAt: 'DESC' },
      take: limit,
    });
  }

  /** Child runs spawned by sub-workflow / loop nodes of one execution. */
  findChildren(parentExecutionId: string, ownerId: string): Promise<ExecutionEntity[]> {
    return this.executions.find({
      where: { parentExecutionId, ownerId },
      order: { startedAt: 'ASC' },
      take: 200,
    });
  }

  createExecution(data: Partial<ExecutionEntity>): Promise<ExecutionEntity> {
    return this.executions.save(this.executions.create(data));
  }

  updateExecution(execution: ExecutionEntity): Promise<ExecutionEntity> {
    return this.executions.save(execution);
  }

  createNodeExecution(data: Partial<NodeExecutionEntity>): Promise<NodeExecutionEntity> {
    return this.nodeExecutions.save(this.nodeExecutions.create(data));
  }

  /** Loads an execution for cancellation, enforcing ownership. */
  async findOwned(id: string, ownerId: string): Promise<ExecutionEntity> {
    const execution = await this.executions.findOneBy({ id });
    if (!execution) {
      throw new NotFoundException(`Execution ${id} not found`);
    }
    if (execution.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have access to this execution');
    }
    return execution;
  }

  /**
   * Marks runs left in a non-terminal state by an unclean shutdown as failed.
   * Called on boot: without it those rows would spin forever in the UI.
   */
  async reconcileOrphans(): Promise<number> {
    const result = await this.executions
      .createQueryBuilder()
      .update(ExecutionEntity)
      .set({
        status: 'failed',
        error: 'Interrupted: the server restarted while this run was in progress',
        finishedAt: () => 'CURRENT_TIMESTAMP',
      })
      .where('status IN (:...states)', { states: ['queued', 'running'] })
      .execute();
    return result.affected ?? 0;
  }
}
