import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Binary image attached to a knowledge base. Bytes live on disk under
 * `data/uploads/<id><ext>`; only metadata is stored here. The sha1 of the
 * bytes is the dedup key within one knowledge base.
 */
@Entity('knowledge_assets')
@Index(['knowledgeBaseId', 'sha1'], { unique: true })
export class KnowledgeAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  knowledgeBaseId: string;

  @Column({ type: 'varchar' })
  sha1: string;

  @Column({ type: 'varchar', default: '' })
  fileName: string;

  @Column({ type: 'varchar' })
  mimeType: string;

  @Column({ type: 'integer' })
  size: number;

  @CreateDateColumn()
  createdAt: Date;
}
