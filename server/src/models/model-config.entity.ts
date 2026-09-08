import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * User-managed LLM provider configuration (OpenAI-compatible).
 * The apiKey is stored server-side only and always masked in API responses.
 */
@Entity('model_configs')
export class ModelConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'varchar', default: 'https://api.openai.com/v1' })
  baseUrl: string;

  @Column({ type: 'varchar' })
  model: string;

  @Column({ type: 'varchar', default: '' })
  apiKey: string;

  @Column({ type: 'float', nullable: true })
  temperature: number | null;

  /** 'llm' for chat completion, 'embedding' for vector embedding. */
  @Column({ type: 'varchar', default: 'llm' })
  type: 'llm' | 'embedding';

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/** API-safe view: apiKey replaced by a masked preview. */
export interface ModelConfigView {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  maskedKey: string;
  hasKey: boolean;
  temperature: number | null;
  type: 'llm' | 'embedding';
  isDefault: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toView(entity: ModelConfigEntity): ModelConfigView {
  const { apiKey, ...rest } = entity;
  const maskedKey =
    apiKey.length > 8
      ? `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`
      : apiKey
        ? '****'
        : '';
  return { ...rest, maskedKey, hasKey: Boolean(apiKey) };
}
