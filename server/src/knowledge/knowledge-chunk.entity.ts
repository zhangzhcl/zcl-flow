import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('knowledge_chunks')
export class KnowledgeChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  knowledgeBaseId: string;

  @Column({ type: 'text' })
  content: string;

  /** Stored as a JSON float array; null means not yet embedded. */
  @Column({ type: 'text', nullable: true })
  embedding: string | null;

  @Column({ type: 'varchar', default: '' })
  sourceTitle: string;

  @Column({ type: 'text', default: '{}' })
  metadata: string;

  @CreateDateColumn()
  createdAt: Date;
}
