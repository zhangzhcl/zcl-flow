import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('knowledge_bases')
export class KnowledgeBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  /** References a ModelConfigEntity with type='embedding'. */
  @Column({ type: 'varchar', nullable: true })
  embeddingModelConfigId: string | null;

  /** Character(s) used to split text before applying size-based chunking. Escape sequences \n \t accepted. */
  @Column({ type: 'varchar', default: '\\n' })
  chunkSeparator: string;

  @Column({ type: 'int', default: 1024 })
  chunkSize: number;

  @Column({ type: 'int', default: 50 })
  chunkOverlap: number;

  /** Replace consecutive whitespace/tabs/newlines during ingestion. */
  @Column({ type: 'boolean', default: true })
  preprocessWhitespace: boolean;

  /** Strip URLs and email addresses during ingestion. */
  @Column({ type: 'boolean', default: false })
  preprocessUrls: boolean;

  /** 'embedding' = use vector similarity; 'keyword' = term-frequency only. */
  @Column({ type: 'varchar', default: 'hybrid' })
  searchMode: 'vector' | 'fulltext' | 'hybrid';

  @Column({ type: 'int', default: 5 })
  topK: number;

  @Column({ type: 'real', default: 0.0 })
  scoreThreshold: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
