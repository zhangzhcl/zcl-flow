import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join, isAbsolute, dirname } from 'path';
import { mkdirSync } from 'fs';
import { WorkflowsModule } from './workflows/workflows.module';
import { ExecutionsModule } from './executions/executions.module';
import { EngineModule } from './engine/engine.module';
import { ModelsModule } from './models/models.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TriggersModule } from './triggers/triggers.module';
import { AiModule } from './ai/ai.module';
import { AgentsModule } from './agents/agents.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AuthGuard } from './auth/auth.guard';
import { WorkflowEntity } from './workflows/workflow.entity';
import { ExecutionEntity } from './executions/execution.entity';
import { NodeExecutionEntity } from './executions/node-execution.entity';
import { ModelConfigEntity } from './models/model-config.entity';
import { UserEntity } from './auth/user.entity';
import { TriggerEntity } from './triggers/trigger.entity';
import {
  AgentConversationEntity,
  AgentEntity,
  AgentMessageEntity,
} from './agents/agent.entity';
import { KnowledgeBaseEntity } from './knowledge/knowledge-base.entity';
import { KnowledgeChunkEntity } from './knowledge/knowledge-chunk.entity';
import { KnowledgeAssetEntity } from './knowledge/knowledge-asset.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const raw = config.get<string>('DATABASE_PATH', 'data/zcl-flow.sqlite');
        const dbPath = isAbsolute(raw) ? raw : join(process.cwd(), raw);
        mkdirSync(dirname(dbPath), { recursive: true });
        return {
          type: 'better-sqlite3' as const,
          database: dbPath,
          entities: [
            WorkflowEntity,
            ExecutionEntity,
            NodeExecutionEntity,
            ModelConfigEntity,
            UserEntity,
            TriggerEntity,
            AgentEntity,
            AgentConversationEntity,
            AgentMessageEntity,
            KnowledgeBaseEntity,
            KnowledgeChunkEntity,
            KnowledgeAssetEntity,
          ],
          synchronize: true,
        };
      },
    }),
    EventsModule,
    AuthModule,
    WorkflowsModule,
    ExecutionsModule,
    EngineModule,
    ModelsModule,
    TriggersModule,
    AiModule,
    AgentsModule,
    KnowledgeModule,
  ],
  providers: [
    // Every route requires a valid bearer token unless marked @Public().
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
