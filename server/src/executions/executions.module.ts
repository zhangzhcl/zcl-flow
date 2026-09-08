import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionEntity } from './execution.entity';
import { NodeExecutionEntity } from './node-execution.entity';
import { ExecutionsService } from './executions.service';
import { StatsService } from './stats.service';
import { ExecutionsController } from './executions.controller';
import { EngineModule } from '../engine/engine.module';

/**
 * forwardRef: the engine needs ExecutionsService to persist runs, while this
 * module needs the engine's queue to cancel them.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ExecutionEntity, NodeExecutionEntity]),
    forwardRef(() => EngineModule),
  ],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, StatsService],
  exports: [ExecutionsService, StatsService],
})
export class ExecutionsModule {}
