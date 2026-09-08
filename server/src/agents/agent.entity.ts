import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type AgentStatus = 'draft' | 'published' | 'archived';
export type AgentMessageRole = 'user' | 'assistant';

@Entity('agents')
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  ownerId: string;

  @Index()
  @Column({ type: 'varchar' })
  workflowId: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'text', default: '' })
  systemPrompt: string;

  @Column({ type: 'varchar', default: 'published' })
  status: AgentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('agent_conversations')
export class AgentConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  ownerId: string;

  @Index()
  @Column({ type: 'varchar' })
  agentId: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('agent_messages')
export class AgentMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  conversationId: string;

  @Column({ type: 'varchar' })
  role: AgentMessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
