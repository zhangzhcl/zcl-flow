import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EngineModule } from '../engine/engine.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import {
  AgentConversationEntity,
  AgentEntity,
  AgentMessageEntity,
} from './agent.entity';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, AgentConversationEntity, AgentMessageEntity]),
    forwardRef(() => WorkflowsModule),
    EngineModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
