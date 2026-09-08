import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { TriggerType } from './trigger.entity';

export class CreateTriggerDto {
  @IsString()
  @IsNotEmpty()
  workflowId: string;

  @IsIn(['webhook', 'cron'])
  type: TriggerType;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  /** Required when `type === 'cron'`. */
  @IsString()
  @IsOptional()
  cronExpression?: string;

  @IsObject()
  @IsOptional()
  payload?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  /** Queue the run instead of executing it inside the webhook request. */
  @IsBoolean()
  @IsOptional()
  async?: boolean;

  /** Generate an HMAC signing secret for this webhook. */
  @IsBoolean()
  @IsOptional()
  requireSignature?: boolean;
}

export class UpdateTriggerDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  cronExpression?: string;

  @IsObject()
  @IsOptional()
  payload?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  async?: boolean;

  /** true issues a new secret, false clears it. */
  @IsBoolean()
  @IsOptional()
  requireSignature?: boolean;
}

/** Trigger shape returned to clients, enriched with scheduling metadata. */
export interface TriggerView {
  id: string;
  workflowId: string;
  type: TriggerType;
  name: string;
  cronExpression: string;
  payload: Record<string, unknown> | null;
  enabled: boolean;
  async: boolean;
  triggerCount: number;
  lastStatus: string;
  lastTriggeredAt: Date | null;
  lastError: string | null;
  createdAt: Date;
  /** Absolute callback path for webhooks, e.g. `/api/hooks/<token>`. */
  webhookPath: string | null;
  /** Next scheduled fire time for cron triggers. */
  nextRunAt: string | null;
  /** Whether signature verification is enforced. */
  signatureRequired: boolean;
  /**
   * Signing secret. Returned only by the create / rotate endpoints so it can be
   * copied once; the list endpoint always omits it.
   */
  secret?: string;
}

