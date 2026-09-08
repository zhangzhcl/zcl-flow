import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import {
  CreateWorkflowDto,
  ImportWorkflowDto,
  RunWorkflowDto,
  UpdateWorkflowDto,
} from './workflow.dto';
import { EngineService } from '../engine/engine.service';
import { ExecutionQueueService } from '../engine/execution-queue.service';
import { CurrentUser } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/auth.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(
    private readonly workflows: WorkflowsService,
    private readonly engine: EngineService,
    private readonly queue: ExecutionQueueService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.workflows.findAll(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.workflows.findOne(id, user.sub);
  }

  /** Portable JSON envelope, downloaded by the client as a .json file. */
  @Get(':id/export')
  exportOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.workflows.exportOne(id, user.sub);
  }

  @Post()
  create(@Body() dto: CreateWorkflowDto, @CurrentUser() user: JwtPayload) {
    return this.workflows.create(dto, user.sub);
  }

  /** Creates a workflow from a previously exported envelope. */
  @Post('import')
  importOne(@Body() dto: ImportWorkflowDto, @CurrentUser() user: JwtPayload) {
    return this.workflows.importOne(dto, user.sub);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.workflows.duplicate(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.workflows.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.workflows.remove(id, user.sub);
  }

  /**
   * Runs a workflow. Async by default when `async: true` is passed: the caller
   * gets a `queued` execution immediately and tracks it over the SSE stream.
   */
  @Post(':id/run')
  async run(
    @Param('id') id: string,
    @Body() dto: RunWorkflowDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const workflow = await this.workflows.findOne(id, user.sub);
    if (dto.debug) {
      // Debug runs are always async: they pause indefinitely, so control flows
      // over the SSE stream plus the /executions/:id/debug REST endpoints.
      const execution = await this.queue.enqueue(workflow, dto.input ?? {}, {
        debug: dto.debug,
      });
      return { ...execution, nodes: [] };
    }
    if (dto.async) {
      const execution = await this.queue.enqueue(workflow, dto.input ?? {});
      return { ...execution, nodes: [] };
    }
    return this.engine.run(workflow, dto.input ?? {});
  }
}
