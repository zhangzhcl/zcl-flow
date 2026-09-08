import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { AgentStatus } from './agent.entity';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  workflowId: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsIn(['draft', 'published', 'archived'])
  @IsOptional()
  status?: AgentStatus;
}

export class UpdateAgentDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsIn(['draft', 'published', 'archived'])
  @IsOptional()
  status?: AgentStatus;
}

export class CreateConversationDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;
}

export class ChatWithAgentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}
