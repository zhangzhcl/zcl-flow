import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Workflow definition persisted as FlowGram document JSON.
 * Each workflow belongs to exactly one account (ownerId).
 */
@Entity('workflows')
export class WorkflowEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', default: '' })
  ownerId: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  /** FlowGram document JSON: { nodes: [], edges: [] } */
  @Column({ type: 'simple-json', nullable: true })
  definition: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
