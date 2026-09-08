import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TriggerType = 'webhook' | 'cron';
export type TriggerLastStatus = 'idle' | 'success' | 'failed';

/**
 * An automation entry point for a workflow.
 *
 * - `webhook`: exposes `POST /api/hooks/:token`, callable without a session.
 * - `cron`: fired by the in-process scheduler on a minute heartbeat.
 */
@Entity('triggers')
export class TriggerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  workflowId: string;

  @Index()
  @Column({ type: 'varchar', default: '' })
  ownerId: string;

  @Column({ type: 'varchar', default: 'webhook' })
  type: TriggerType;

  @Column({ type: 'varchar', length: 120, default: '' })
  name: string;

  /** Secret path segment for webhooks. Empty for cron triggers. */
  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  token: string | null;

  /** 5-field cron expression. Empty for webhook triggers. */
  @Column({ type: 'varchar', default: '' })
  cronExpression: string;

  /**
   * Optional HMAC-SHA256 shared secret for webhooks. When set, callers must
   * send `X-ZCL-Flow-Signature: sha256=<hex>` over the raw request body.
   */
  @Column({ type: 'varchar', nullable: true })
  secret: string | null;

  /**
   * Queue the run instead of executing it inside the request.
   * Recommended for long workflows so the caller is not kept waiting.
   */
  @Column({ type: 'boolean', default: false })
  async: boolean;

  /** Static input payload used by cron runs (webhooks use the request body). */
  @Column({ type: 'simple-json', nullable: true })
  payload: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'integer', default: 0 })
  triggerCount: number;

  @Column({ type: 'varchar', default: 'idle' })
  lastStatus: TriggerLastStatus;

  @Column({ type: 'datetime', nullable: true })
  lastTriggeredAt: Date | null;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
