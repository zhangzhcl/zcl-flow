import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EngineModule } from '../engine/engine.module';
import { WorkflowEntity } from '../workflows/workflow.entity';
import { TriggerEntity } from './trigger.entity';
import { TriggersService } from './triggers.service';
import { TriggersController, WebhooksController } from './triggers.controller';

/**
 * Depends on the workflow repository directly (instead of WorkflowsService)
 * to keep the module graph acyclic: WorkflowsModule also needs TriggersService
 * for cascade delete.
 */
@Module({
  imports: [TypeOrmModule.forFeature([TriggerEntity, WorkflowEntity]), EngineModule],
  controllers: [TriggersController, WebhooksController],
  providers: [TriggersService],
  exports: [TriggersService],
})
export class TriggersModule {}
