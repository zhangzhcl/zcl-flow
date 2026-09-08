import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { DebugConfig } from '../engine/debug-session';


export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  definition?: Record<string, unknown>;
}

export class UpdateWorkflowDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  definition?: Record<string, unknown>;
}

export class RunWorkflowDto {
  @IsObject()
  @IsOptional()
  input?: Record<string, unknown>;

  /**
   * Queue the run and return immediately with a `queued` execution.
   * Progress is then followed over the SSE stream.
   */
  @IsBoolean()
  @IsOptional()
  async?: boolean;

  /**
   * Interactive debug options (breakpoints / mocks / pauseOnStart). When
   * present the run is always queued and driven over the debug REST API.
   */
  @IsObject()
  @IsOptional()
  debug?: DebugConfig;
}

/** Portable workflow envelope produced by `GET /workflows/:id/export`. */
export interface WorkflowExport {
  /** Format discriminator so imports can be validated cheaply. */
  format: 'zcl-flow/workflow';
  version: 1;
  exportedAt: string;
  name: string;
  description: string;
  definition: Record<string, unknown> | null;
}

export class ImportWorkflowDto {
  @IsString()
  @IsOptional()
  format?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  definition?: Record<string, unknown>;
}
