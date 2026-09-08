import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionsModule } from '../executions/executions.module';
import { LlmModule } from '../llm/llm.module';
import { ModelsModule } from '../models/models.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { WorkflowEntity } from '../workflows/workflow.entity';
import { EngineService } from './engine.service';
import { ExecutionQueueService } from './execution-queue.service';
import { DebugSessionService } from './debug-session';
import { DebugController } from './debug.controller';
import { WORKFLOW_RUNNER } from './workflow-runner';
import { WorkflowRunnerProvider } from './workflow-runner-provider';
import {
  AggregateExecutor,
  AssignExecutor,
  BatchExecutor,
  ClassifyExecutor,
  CodeExecutor,
  ConditionBranchExecutor,
  ConditionExecutor,
  ConditionLoopExecutor,
  DataCreateExecutor,
  DataDeleteExecutor,
  DataQueryExecutor,
  DataUpdateExecutor,
  DelayExecutor,
  EndExecutor,
  HttpExecutor,
  JsonExtractExecutor,
  JsonParseExecutor,
  JsonStringifyExecutor,
  KnowledgeRetrieveExecutor,
  KnowledgeWriteExecutor,
  KnowledgeAnswerExecutor,
  ListLoopExecutor,
  BreakExecutor,
  DocParseExecutor,
  ImageQaExecutor,
  OcrExecutor,
  PythonExecutor,
  VideoUnderstandExecutor,
  AudioSummaryExecutor,
  ParameterExtractorExecutor,
  HumanInputExecutor,
  MemoryExecutor,
  LlmExecutor,
  LoopExecutor,
  NotifyExecutor,
  SendMessageExecutor,
  QuestionExecutor,
  SqlCustomExecutor,
  StartExecutor,
  SubflowExecutor,
  SwitchExecutor,
  TemplateExecutor,
  TextProcessExecutor,
  TextStringExecutor,
  VariableExecutor,
} from './node-executors';

/**
 * The sub-workflow / loop executors call back into EngineService, which in turn
 * owns the executor registry. forwardRef resolves that intentional cycle.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowEntity]),
    forwardRef(() => ExecutionsModule),
    LlmModule,
    ModelsModule,
    KnowledgeModule,
  ],
  controllers: [DebugController],
  providers: [
    EngineService,
    ExecutionQueueService,
    DebugSessionService,
    {
      provide: WORKFLOW_RUNNER,
      useClass: WorkflowRunnerProvider,
    },
    StartExecutor,
    EndExecutor,
    LlmExecutor,
    CodeExecutor,
    ConditionExecutor,
    ConditionBranchExecutor,
    ConditionLoopExecutor,
    ListLoopExecutor,
    HttpExecutor,
    TemplateExecutor,
    VariableExecutor,
    DelayExecutor,
    SwitchExecutor,
    SubflowExecutor,
    LoopExecutor,
    BatchExecutor,
    JsonExtractExecutor,
    JsonStringifyExecutor,
    JsonParseExecutor,
    ClassifyExecutor,
    TextProcessExecutor,
    TextStringExecutor,
    AggregateExecutor,
    NotifyExecutor,
    SendMessageExecutor,
    AssignExecutor,
    QuestionExecutor,
    KnowledgeRetrieveExecutor,
    KnowledgeWriteExecutor,
    SqlCustomExecutor,
    DataCreateExecutor,
    DataQueryExecutor,
    DataUpdateExecutor,
    DataDeleteExecutor,
    KnowledgeAnswerExecutor,
    BreakExecutor,
    DocParseExecutor,
    ImageQaExecutor,
    OcrExecutor,
    PythonExecutor,
    VideoUnderstandExecutor,
    AudioSummaryExecutor,
    ParameterExtractorExecutor,
    HumanInputExecutor,
    MemoryExecutor,
  ],
  exports: [EngineService, ExecutionQueueService, DebugSessionService],
})
export class EngineModule {}
