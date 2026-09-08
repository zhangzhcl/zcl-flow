import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowEntity } from './workflow.entity';
import {
  CreateWorkflowDto,
  ImportWorkflowDto,
  UpdateWorkflowDto,
  WorkflowExport,
} from './workflow.dto';
import { TriggerEntity } from '../triggers/trigger.entity';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly repo: Repository<WorkflowEntity>,
    @InjectRepository(TriggerEntity)
    private readonly triggers: Repository<TriggerEntity>,
  ) {}

  findAll(ownerId: string): Promise<WorkflowEntity[]> {
    return this.repo.find({ where: { ownerId }, order: { updatedAt: 'DESC' } });
  }

  /** Loads a workflow and enforces ownership. */
  async findOne(id: string, ownerId: string): Promise<WorkflowEntity> {
    const workflow = await this.repo.findOneBy({ id });
    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }
    if (workflow.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have access to this workflow');
    }
    return workflow;
  }

  create(dto: CreateWorkflowDto, ownerId: string): Promise<WorkflowEntity> {
    const workflow = this.repo.create({
      ownerId,
      name: dto.name,
      description: dto.description ?? '',
      definition: dto.definition ?? null,
    });
    return this.repo.save(workflow);
  }

  async update(
    id: string,
    dto: UpdateWorkflowDto,
    ownerId: string,
  ): Promise<WorkflowEntity> {
    const workflow = await this.findOne(id, ownerId);
    if (dto.name !== undefined) workflow.name = dto.name;
    if (dto.description !== undefined) workflow.description = dto.description;
    if (dto.definition !== undefined) workflow.definition = dto.definition;
    return this.repo.save(workflow);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const workflow = await this.findOne(id, ownerId);
    // Cascade: triggers are meaningless without their workflow.
    const orphans = await this.triggers.find({ where: { workflowId: id } });
    if (orphans.length) await this.triggers.remove(orphans);
    await this.repo.remove(workflow);
  }

  /** Builds the portable JSON envelope for a workflow. */
  async exportOne(id: string, ownerId: string): Promise<WorkflowExport> {
    const workflow = await this.findOne(id, ownerId);
    return {
      format: 'zcl-flow/workflow',
      version: 1,
      exportedAt: new Date().toISOString(),
      name: workflow.name,
      description: workflow.description,
      definition: workflow.definition,
    };
  }

  /**
   * Creates a workflow from an exported envelope. Triggers are intentionally
   * not imported: webhook secrets and schedules must be re-issued explicitly.
   */
  async importOne(dto: ImportWorkflowDto, ownerId: string): Promise<WorkflowEntity> {
    if (dto.format && dto.format !== 'zcl-flow/workflow') {
      throw new BadRequestException(`Unsupported workflow format "${dto.format}"`);
    }
    const definition = dto.definition ?? null;
    if (definition && !Array.isArray((definition as any).nodes)) {
      throw new BadRequestException('Invalid workflow file: "definition.nodes" must be an array');
    }
    return this.create(
      {
        name: await this.uniqueName(dto.name, ownerId),
        description: dto.description ?? '',
        definition: definition ?? undefined,
      },
      ownerId,
    );
  }

  /** Deep-copies a workflow (definition only) under a new name. */
  async duplicate(id: string, ownerId: string): Promise<WorkflowEntity> {
    const source = await this.findOne(id, ownerId);
    return this.create(
      {
        name: await this.uniqueName(`${source.name} copy`, ownerId),
        description: source.description,
        definition: source.definition ?? undefined,
      },
      ownerId,
    );
  }

  /** Appends a numeric suffix until the name is free for this account. */
  private async uniqueName(base: string, ownerId: string): Promise<string> {
    const trimmed = base.slice(0, 110).trim() || 'Workflow';
    const existing = new Set(
      (await this.repo.find({ where: { ownerId }, select: { name: true } })).map(
        (item) => item.name,
      ),
    );
    if (!existing.has(trimmed)) return trimmed;
    for (let i = 2; i < 1000; i += 1) {
      const candidate = `${trimmed} ${i}`;
      if (!existing.has(candidate)) return candidate;
    }
    return `${trimmed} ${Date.now()}`;
  }
}
