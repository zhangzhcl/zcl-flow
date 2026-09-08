import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EngineService } from '../engine/engine.service';
import { WorkflowsService } from '../workflows/workflows.service';
import {
  AgentConversationEntity,
  AgentEntity,
  AgentMessageEntity,
} from './agent.entity';
import { ChatWithAgentDto, CreateAgentDto, CreateConversationDto, UpdateAgentDto } from './agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agents: Repository<AgentEntity>,
    @InjectRepository(AgentConversationEntity)
    private readonly conversations: Repository<AgentConversationEntity>,
    @InjectRepository(AgentMessageEntity)
    private readonly messages: Repository<AgentMessageEntity>,
    private readonly workflows: WorkflowsService,
    private readonly engine: EngineService,
  ) {}

  findAll(ownerId: string): Promise<AgentEntity[]> {
    return this.agents.find({ where: { ownerId }, order: { updatedAt: 'DESC' } });
  }

  async findOne(id: string, ownerId: string): Promise<AgentEntity> {
    const agent = await this.agents.findOneBy({ id });
    if (!agent) throw new NotFoundException(`Agent ${id} not found`);
    if (agent.ownerId !== ownerId) throw new ForbiddenException('You do not have access to this agent');
    return agent;
  }

  async create(dto: CreateAgentDto, ownerId: string): Promise<AgentEntity> {
    const workflow = await this.workflows.findOne(dto.workflowId, ownerId);
    const agent = this.agents.create({
      ownerId,
      workflowId: workflow.id,
      name: dto.name?.trim() || workflow.name,
      description: dto.description ?? workflow.description ?? '',
      systemPrompt: dto.systemPrompt ?? '',
      status: dto.status ?? 'published',
    });
    return this.agents.save(agent);
  }

  async update(id: string, dto: UpdateAgentDto, ownerId: string): Promise<AgentEntity> {
    const agent = await this.findOne(id, ownerId);
    if (dto.name !== undefined) agent.name = dto.name;
    if (dto.description !== undefined) agent.description = dto.description;
    if (dto.systemPrompt !== undefined) agent.systemPrompt = dto.systemPrompt;
    if (dto.status !== undefined) agent.status = dto.status;
    return this.agents.save(agent);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const agent = await this.findOne(id, ownerId);
    const conversations = await this.conversations.find({ where: { agentId: agent.id, ownerId } });
    for (const conversation of conversations) {
      await this.messages.delete({ conversationId: conversation.id });
    }
    if (conversations.length) await this.conversations.remove(conversations);
    await this.agents.remove(agent);
  }

  async listConversations(agentId: string, ownerId: string): Promise<AgentConversationEntity[]> {
    await this.findOne(agentId, ownerId);
    return this.conversations.find({ where: { agentId, ownerId }, order: { updatedAt: 'DESC' } });
  }

  async createConversation(
    agentId: string,
    dto: CreateConversationDto,
    ownerId: string,
  ): Promise<AgentConversationEntity> {
    await this.findOne(agentId, ownerId);
    const conversation = this.conversations.create({
      ownerId,
      agentId,
      title: dto.title?.trim() || 'New conversation',
    });
    return this.conversations.save(conversation);
  }

  async getConversation(agentId: string, conversationId: string, ownerId: string) {
    await this.findOne(agentId, ownerId);
    const conversation = await this.conversations.findOneBy({ id: conversationId });
    if (!conversation || conversation.agentId !== agentId || conversation.ownerId !== ownerId) {
      throw new NotFoundException('Conversation not found');
    }
    const messages = await this.messages.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
    return { ...conversation, messages };
  }

  async chat(agentId: string, dto: ChatWithAgentDto, ownerId: string) {
    const agent = await this.findOne(agentId, ownerId);
    if (agent.status !== 'published') throw new ForbiddenException('Agent is not published');
    const workflow = await this.workflows.findOne(agent.workflowId, ownerId);

    let conversation = dto.conversationId
      ? await this.conversations.findOneBy({ id: dto.conversationId })
      : null;
    if (conversation && (conversation.agentId !== agent.id || conversation.ownerId !== ownerId)) {
      throw new NotFoundException('Conversation not found');
    }
    if (!conversation) {
      conversation = await this.createConversation(agent.id, { title: this.titleFromMessage(dto.message) }, ownerId);
    }

    const historyBefore = await this.messages.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
    });

    const userMessage = await this.messages.save(
      this.messages.create({
        conversationId: conversation.id,
        role: 'user',
        content: dto.message,
        metadata: null,
      }),
    );

    const execution = await this.engine.run(workflow, {
      message: dto.message,
      input: dto.message,
      conversationId: conversation.id,
      agent: { id: agent.id, name: agent.name, systemPrompt: agent.systemPrompt },
      history: historyBefore.map((item) => ({ role: item.role, content: item.content })),
    });

    const reply = this.extractReply(execution.output, execution.error);
    const assistantMessage = await this.messages.save(
      this.messages.create({
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
        metadata: { executionId: execution.id, status: execution.status },
      }),
    );
    conversation.updatedAt = new Date();
    await this.conversations.save(conversation);

    return { conversationId: conversation.id, userMessage, assistantMessage, execution };
  }

  private titleFromMessage(message: string): string {
    const compact = message.replace(/\s+/g, ' ').trim();
    return compact.slice(0, 40) || 'New conversation';
  }

  private extractReply(output: Record<string, unknown> | null, error?: string | null): string {
    if (error) return this.formatWorkflowFailure(error);
    if (!output) return '';
    const value = output.reply ?? output.text ?? output.result;
    if (value == null) return JSON.stringify(output, null, 2);
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  }

  private formatWorkflowFailure(error: string): string {
    if (error.includes('LLM request timed out')) {
      return `Workflow failed: ${error}\n\nSuggestion: The model provider responded too slowly. You can retry this message, simplify the workflow prompt, or increase LLM_TIMEOUT in server/.env for slower providers such as DeepSeek.`;
    }
    return `Workflow failed: ${error}`;
  }
}
