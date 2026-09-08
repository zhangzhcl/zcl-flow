import { Module } from '@nestjs/common';
import { LlmModule } from '../llm/llm.module';
import { ModelsModule } from '../models/models.module';
import { AiController } from './ai.controller';
import { WorkflowGeneratorService } from './workflow-generator.service';

@Module({
  imports: [LlmModule, ModelsModule],
  controllers: [AiController],
  providers: [WorkflowGeneratorService],
})
export class AiModule {}
