import { Body, Controller, Post } from '@nestjs/common';
import { GenerateWorkflowDto } from './ai.dto';
import { WorkflowGeneratorService } from './workflow-generator.service';

@Controller('ai')
export class AiController {
  constructor(private readonly generator: WorkflowGeneratorService) {}

  @Post('workflow-draft')
  generateWorkflowDraft(@Body() dto: GenerateWorkflowDto) {
    return this.generator.generate(dto.prompt);
  }
}
