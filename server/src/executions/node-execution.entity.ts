import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { ExecutionStatus } from './execution.entity';

/**
 * Per-node execution record inside a workflow run.
 */
@Entity('node_executions')
export class NodeExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  executionId: string;

  @Column({ type: 'varchar' })
  nodeId: string;

  @Column({ type: 'varchar' })
  nodeType: string;

  @Column({ type: 'varchar', default: 'running' })
  status: ExecutionStatus | 'skipped';

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
}
