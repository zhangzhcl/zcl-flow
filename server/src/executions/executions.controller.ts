import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ExecutionsService } from './executions.service';
import { StatsService } from './stats.service';
import { ExecutionQueueService } from '../engine/execution-queue.service';
import { ExecutionEventsService } from '../events/execution-events.service';
import { CurrentUser } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/auth.service';

@Controller('executions')
export class ExecutionsController {
  constructor(
    private readonly executions: ExecutionsService,
    private readonly events: ExecutionEventsService,
    private readonly stats: StatsService,
    private readonly queue: ExecutionQueueService,
  ) {}

  @Get()
  findByWorkflow(
    @Query('workflowId') workflowId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!workflowId) {
      return this.executions.findAll(user.sub);
    }
    return this.executions.findByWorkflow(workflowId, user.sub);
  }

  /**
   * Server-sent stream of live execution progress for the current account.
   *
   * Declared before `:id` so the literal path wins the route match.
   * EventSource cannot set headers, so the guard also accepts the token via
   * the `access_token` query parameter for this route.
   */
  @Sse('stream')
  stream(
    @CurrentUser() user: JwtPayload,
    @Query('executionId') executionId?: string,
  ): Observable<{ data: string }> {
    return this.events.sseStream(user.sub, executionId);
  }

  /** Operations dashboard data, optionally scoped to a single workflow. */
  @Get('stats')
  async overview(
    @CurrentUser() user: JwtPayload,
    @Query('days') days?: string,
    @Query('workflowId') workflowId?: string,
  ) {
    if (workflowId) {
      await this.stats.assertWorkflowOwner(workflowId, user.sub);
    }
    const stats = await this.stats.compute(user.sub, {
      days: days ? Number(days) : undefined,
      workflowId: workflowId || undefined,
    });
    return { ...stats, queue: this.queue.stats };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.executions.findOneWithNodes(id, user.sub);
  }

  /** Child runs created by sub-workflow / loop nodes. */
  @Get(':id/children')
  async children(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.executions.findOwned(id, user.sub);
    return this.executions.findChildren(id, user.sub);
  }

  /** Cancels a queued or running execution. */
  @Post(':id/cancel')
  @HttpCode(202)
  async cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const execution = await this.executions.findOwned(id, user.sub);
    if (execution.status !== 'queued' && execution.status !== 'running') {
      throw new BadRequestException(
        `Execution already finished with status "${execution.status}"`,
      );
    }
    const cancelled = await this.queue.cancel(id);
    if (!cancelled) {
      // Not tracked here: the row is stale (e.g. left over from a restart).
      execution.status = 'cancelled';
      execution.error = 'Execution cancelled';
      execution.finishedAt = new Date();
      await this.executions.updateExecution(execution);
    }
    return { id, status: 'cancelled' };
  }
}
