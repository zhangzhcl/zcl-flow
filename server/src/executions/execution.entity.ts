import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ExecutionStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
export type ExecutionTrigger = 'manual' | 'webhook' | 'cron';

/**
 * A single run of a workflow.
 */
@Entity('executions')
export class ExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  workflowId: string;

  /** Denormalised owner id so execution history can be filtered directly. */
  @Index()
  @Column({ type: 'varchar', default: '' })
  ownerId: string;

  @Column({ type: 'varchar', default: 'running' })
  status: ExecutionStatus;

  /** How the run was started, so history can distinguish automation from manual tests. */
  @Column({ type: 'varchar', default: 'manual' })
  triggerType: ExecutionTrigger;

  /** Trigger that produced the run, when applicable. */
  @Column({ type: 'varchar', nullable: true })
  triggerId: string | null;

  /**
   * Parent run when this execution came from a sub-workflow node.
   * The history list only shows top-level runs (null parent).
   */
  @Index()
  @Column({ type: 'varchar', nullable: true })
  parentExecutionId: string | null;

  @Column({ type: 'simple-json', nullable: true })
  input: Record<string, unknown> | null;

  @Column({ type: 'simple-json', nullable: true })
  output: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'integer', default: 0 })
  durationMs: number;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  finishedAt: Date | null;
}
