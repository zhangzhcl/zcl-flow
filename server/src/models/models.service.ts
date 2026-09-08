import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelConfigEntity, ModelConfigView, toView } from './model-config.entity';
import { CreateModelConfigDto, UpdateModelConfigDto } from './model-config.dto';
import { LlmService, ResolvedLlmConfig } from '../llm/llm.service';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(ModelConfigEntity)
    private readonly repo: Repository<ModelConfigEntity>,
    private readonly llm: LlmService,
  ) {}

  async findAll(): Promise<ModelConfigView[]> {
    const items = await this.repo.find({ order: { createdAt: 'ASC' } });
    return items.map(toView);
  }

  private async findEntity(id: string): Promise<ModelConfigEntity> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Model config ${id} not found`);
    return entity;
  }

  async create(dto: CreateModelConfigDto): Promise<ModelConfigView> {
    if (dto.isDefault) await this.clearDefault();
    const count = await this.repo.count();
    const entity = this.repo.create({
      name: dto.name,
      model: dto.model,
      baseUrl: dto.baseUrl?.trim() || 'https://api.openai.com/v1',
      apiKey: dto.apiKey ?? '',
      temperature: dto.temperature ?? null,
      type: dto.type ?? 'llm',
      // First config automatically becomes the default.
      isDefault: dto.isDefault ?? count === 0,
      enabled: dto.enabled ?? true,
    });
    return toView(await this.repo.save(entity));
  }

  async update(id: string, dto: UpdateModelConfigDto): Promise<ModelConfigView> {
    const entity = await this.findEntity(id);
    if (dto.isDefault) await this.clearDefault();
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.model !== undefined) entity.model = dto.model;
    if (dto.baseUrl !== undefined && dto.baseUrl.trim()) entity.baseUrl = dto.baseUrl.trim();
    // Empty apiKey means "keep the existing key".
    if (dto.apiKey !== undefined && dto.apiKey !== '') entity.apiKey = dto.apiKey;
    if (dto.temperature !== undefined) entity.temperature = dto.temperature;
    if (dto.type !== undefined) entity.type = dto.type;
    if (dto.isDefault !== undefined) entity.isDefault = dto.isDefault;
    if (dto.enabled !== undefined) entity.enabled = dto.enabled;
    return toView(await this.repo.save(entity));
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findEntity(id);
    await this.repo.remove(entity);
  }

  async setDefault(id: string): Promise<ModelConfigView> {
    const entity = await this.findEntity(id);
    await this.clearDefault();
    entity.isDefault = true;
    return toView(await this.repo.save(entity));
  }

  private async clearDefault(): Promise<void> {
    await this.repo.update({ isDefault: true }, { isDefault: false });
  }

  /**
   * Resolve the provider config used by the LLM executor:
   * explicit config id -> default config -> null (env/mock fallback in LlmService).
   */
  async resolveConfig(modelConfigId?: string): Promise<ResolvedLlmConfig | null> {
    let entity: ModelConfigEntity | null = null;
    if (modelConfigId) {
      entity = await this.repo.findOneBy({ id: modelConfigId });
    }
    if (!entity || !entity.enabled) {
      entity = await this.repo.findOneBy({ isDefault: true, enabled: true });
    }
    if (!entity || !entity.apiKey) return null;
    return {
      apiKey: entity.apiKey,
      baseUrl: entity.baseUrl,
      model: entity.model,
      temperature: entity.temperature,
    };
  }

  /** Fire a minimal real completion to verify connectivity of a config. */
  async testConnection(id: string) {
    const entity = await this.findEntity(id);
    if (!entity.apiKey) {
      return { ok: false, error: 'API key is empty' };
    }
    const started = Date.now();
    try {
      const response = await this.llm.complete({
        prompt: 'ping, reply with "pong" only',
        config: {
          apiKey: entity.apiKey,
          baseUrl: entity.baseUrl,
          model: entity.model,
          temperature: 0,
        },
      });
      return {
        ok: true,
        model: response.model,
        latencyMs: Date.now() - started,
        text: response.text.slice(0, 100),
      };
    } catch (error: any) {
      return { ok: false, error: String(error?.message ?? error) };
    }
  }
}
