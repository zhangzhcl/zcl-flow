import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowEntity } from './workflow.entity';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { EngineModule } from '../engine/engine.module';
import { TriggerEntity } from '../triggers/trigger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowEntity, TriggerEntity]), EngineModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
