import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { EngineService } from '../engine/engine.service';
import { ExecutionQueueService } from '../engine/execution-queue.service';
import { WorkflowEntity } from '../workflows/workflow.entity';
import { TriggerEntity } from './trigger.entity';
import { CreateTriggerDto, TriggerView, UpdateTriggerDto } from './trigger.dto';
import { nextCronRun, parseCron, cronMatches } from './cron.util';

/** Heartbeat interval: short enough to never miss a minute boundary. */
const TICK_MS = 20_000;
/** Sliding window used by the webhook rate limiter. */
const RATE_WINDOW_MS = 60_000;

export interface WebhookRequest {
  /** Parsed JSON body (or query parameters for GET). */
  body: Record<string, unknown>;
  /** Exact bytes received, required for signature verification. */
  rawBody?: Buffer | string;
  signature?: string;
}

@Injectable()
export class TriggersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TriggersService.name);
  private timer: NodeJS.Timeout | null = null;
  /** trigger id -> last fired minute key, guards against double firing. */
  private readonly firedMinutes = new Map<string, string>();
  /** token -> recent call timestamps, for the sliding-window rate limiter. */
  private readonly rateBuckets = new Map<string, number[]>();
  private ticking = false;

  constructor(
    @InjectRepository(TriggerEntity)
    private readonly repo: Repository<TriggerEntity>,
    @InjectRepository(WorkflowEntity)
    private readonly workflows: Repository<WorkflowEntity>,
    private readonly engine: EngineService,
    private readonly queue: ExecutionQueueService,
    private readonly config: ConfigService,
  ) {}


  onModuleInit(): void {
    if (this.config.get('SCHEDULER_ENABLED', 'true') === 'false') {
      this.logger.warn('Cron scheduler disabled via SCHEDULER_ENABLED=false');
      return;
    }
    this.timer = setInterval(() => void this.tick(), TICK_MS);
    // Node keeps running for HTTP anyway; unref avoids holding the loop in tests.
    this.timer.unref?.();
    this.logger.log(`Cron scheduler started (heartbeat ${TICK_MS / 1000}s)`);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  // ---------------------------------------------------------------- CRUD

  async findByWorkflow(workflowId: string, ownerId: string): Promise<TriggerView[]> {
    await this.assertWorkflowAccess(workflowId, ownerId);
    const triggers = await this.repo.find({
      where: { workflowId, ownerId },
      order: { createdAt: 'ASC' },
    });
    return triggers.map((trigger) => this.toView(trigger));
  }

  async create(dto: CreateTriggerDto, ownerId: string): Promise<TriggerView> {
    await this.assertWorkflowAccess(dto.workflowId, ownerId);

    if (dto.type === 'cron') {
      this.assertValidCron(dto.cronExpression);
    }

    const trigger = this.repo.create({
      workflowId: dto.workflowId,
      ownerId,
      type: dto.type,
      name: dto.name?.trim() || (dto.type === 'cron' ? 'Schedule' : 'Webhook'),
      token: dto.type === 'webhook' ? this.generateToken() : null,
      cronExpression: dto.type === 'cron' ? (dto.cronExpression ?? '').trim() : '',
      secret: dto.type === 'webhook' && dto.requireSignature ? this.generateSecret() : null,
      async: dto.async ?? false,
      payload: dto.payload ?? null,
      enabled: dto.enabled ?? true,
    });
    const saved = await this.repo.save(trigger);
    // The secret is revealed exactly once, at creation time.
    return this.toView(saved, { revealSecret: true });
  }

  async update(id: string, dto: UpdateTriggerDto, ownerId: string): Promise<TriggerView> {
    const trigger = await this.findOwned(id, ownerId);

    if (dto.name !== undefined) trigger.name = dto.name.trim();
    if (dto.payload !== undefined) trigger.payload = dto.payload;
    if (dto.enabled !== undefined) trigger.enabled = dto.enabled;
    if (dto.async !== undefined) trigger.async = dto.async;
    if (dto.cronExpression !== undefined) {
      if (trigger.type !== 'cron') {
        throw new BadRequestException('Only schedule triggers accept a cron expression');
      }
      this.assertValidCron(dto.cronExpression);
      trigger.cronExpression = dto.cronExpression.trim();
    }

    let revealSecret = false;
    if (dto.requireSignature !== undefined) {
      if (trigger.type !== 'webhook') {
        throw new BadRequestException('Only webhook triggers support signature verification');
      }
      if (dto.requireSignature) {
        trigger.secret = this.generateSecret();
        revealSecret = true;
      } else {
        trigger.secret = null;
      }
    }

    // Re-arm: a re-configured trigger may legitimately fire in the same minute.
    this.firedMinutes.delete(trigger.id);
    const saved = await this.repo.save(trigger);
    return this.toView(saved, { revealSecret });
  }


  async remove(id: string, ownerId: string): Promise<void> {
    const trigger = await this.findOwned(id, ownerId);
    this.firedMinutes.delete(trigger.id);
    await this.repo.remove(trigger);
  }

  /** Issues a fresh secret so a leaked webhook URL can be revoked. */
  async rotateToken(id: string, ownerId: string): Promise<TriggerView> {
    const trigger = await this.findOwned(id, ownerId);
    if (trigger.type !== 'webhook') {
      throw new BadRequestException('Only webhook triggers have a token');
    }
    trigger.token = this.generateToken();
    const saved = await this.repo.save(trigger);
    return this.toView(saved);
  }

  /** Deletes every trigger of a workflow — called when the workflow is removed. */
  async removeByWorkflow(workflowId: string): Promise<void> {
    const triggers = await this.repo.find({ where: { workflowId } });
    triggers.forEach((trigger) => this.firedMinutes.delete(trigger.id));
    if (triggers.length) await this.repo.remove(triggers);
  }

  // ------------------------------------------------------------- Webhook

  /**
   * Runs the workflow behind a webhook token. Intentionally returns 404 for
   * both unknown and disabled tokens so probing cannot enumerate hooks.
   */
  async invokeWebhook(token: string, request: WebhookRequest) {
    const trigger = await this.repo.findOneBy({ token });
    if (!trigger || trigger.type !== 'webhook' || !trigger.enabled) {
      throw new NotFoundException('Webhook not found');
    }

    // Rate limit before any further work so a flood is cheap to reject.
    this.enforceRateLimit(token);
    this.verifySignature(trigger, request);

    const workflow = await this.workflows.findOneBy({ id: trigger.workflowId });
    if (!workflow) {
      await this.repo.remove(trigger);
      throw new NotFoundException('Webhook not found');
    }

    const input = request.body ?? {};

    // Async hooks return immediately; the caller polls or subscribes to SSE.
    if (trigger.async) {
      const execution = await this.queue.enqueue(workflow, input, {
        triggerType: 'webhook',
        triggerId: trigger.id,
      });
      trigger.triggerCount += 1;
      trigger.lastTriggeredAt = new Date();
      await this.repo.save(trigger);
      return {
        executionId: execution.id,
        status: execution.status,
        queued: true,
      };
    }

    const execution = await this.engine.run(workflow, input, {
      triggerType: 'webhook',
      triggerId: trigger.id,
    });
    await this.recordFire(trigger, execution.status, execution.error);

    return {
      executionId: execution.id,
      status: execution.status,
      output: execution.output,
      error: execution.error,
      durationMs: execution.durationMs,
    };
  }

  /**
   * Sliding-window limiter, per token, entirely in memory.
   * Good enough for the single-process deployment model and costs nothing;
   * a shared store would be required only once the API is horizontally scaled.
   */
  private enforceRateLimit(token: string): void {
    const limit = Number(this.config.get('WEBHOOK_RATE_LIMIT', 60));
    if (limit <= 0) return;

    const now = Date.now();
    const recent = (this.rateBuckets.get(token) ?? []).filter(
      (at) => now - at < RATE_WINDOW_MS,
    );
    if (recent.length >= limit) {
      const retryAfter = Math.ceil((RATE_WINDOW_MS - (now - recent[0])) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded: max ${limit} calls per minute`,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    recent.push(now);
    this.rateBuckets.set(token, recent);

    // Opportunistic cleanup so idle tokens do not linger in memory.
    if (this.rateBuckets.size > 500) {
      for (const [key, stamps] of this.rateBuckets) {
        if (!stamps.some((at) => now - at < RATE_WINDOW_MS)) this.rateBuckets.delete(key);
      }
    }
  }

  /** Verifies `X-ZCL-Flow-Signature: sha256=<hex>` over the raw body. */
  private verifySignature(trigger: TriggerEntity, request: WebhookRequest): void {
    if (!trigger.secret) return;

    const provided = (request.signature ?? '').trim();
    if (!provided) {
      throw new UnauthorizedException('Missing X-ZCL-Flow-Signature header');
    }
    const payload =
      request.rawBody !== undefined && request.rawBody !== null
        ? request.rawBody
        : JSON.stringify(request.body ?? {});
    const expected = createHmac('sha256', trigger.secret)
      .update(payload as any)
      .digest('hex');
    const normalised = provided.replace(/^sha256=/i, '');

    const a = Buffer.from(normalised, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    // Length must match before timingSafeEqual, which throws on mismatch.
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  // ----------------------------------------------------------- Scheduler

  /** Manually fires a trigger, used by the "test" button in the editor. */
  async fireNow(id: string, ownerId: string) {
    const trigger = await this.findOwned(id, ownerId);
    const workflow = await this.workflows.findOneBy({ id: trigger.workflowId });
    if (!workflow) throw new NotFoundException('Workflow not found');

    const execution = await this.engine.run(workflow, trigger.payload ?? {}, {
      triggerType: trigger.type,
      triggerId: trigger.id,
    });
    await this.recordFire(trigger, execution.status, execution.error);
    return execution;
  }

  /**
   * One scheduler heartbeat: fires every enabled cron trigger whose expression
   * matches the current minute and that has not already fired in it.
   */
  private async tick(): Promise<void> {
    if (this.ticking) return;
    this.ticking = true;
    const now = new Date();
    const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}T${now.getHours()}:${now.getMinutes()}`;

    try {
      const triggers = await this.repo.find({ where: { type: 'cron', enabled: true } });
      for (const trigger of triggers) {
        if (this.firedMinutes.get(trigger.id) === minuteKey) continue;

        let matches = false;
        try {
          matches = cronMatches(parseCron(trigger.cronExpression), now);
        } catch (error: any) {
          this.logger.warn(
            `Trigger ${trigger.id} has an invalid cron expression and was disabled: ${error?.message}`,
          );
          trigger.enabled = false;
          trigger.lastStatus = 'failed';
          trigger.lastError = String(error?.message ?? error);
          await this.repo.save(trigger);
          continue;
        }
        if (!matches) continue;

        this.firedMinutes.set(trigger.id, minuteKey);
        await this.runScheduled(trigger);
      }
      this.pruneFiredMinutes(minuteKey);
    } catch (error: any) {
      this.logger.error(`Scheduler tick failed: ${error?.message ?? error}`);
    } finally {
      this.ticking = false;
    }
  }

  private async runScheduled(trigger: TriggerEntity): Promise<void> {
    const workflow = await this.workflows.findOneBy({ id: trigger.workflowId });
    if (!workflow) {
      this.logger.warn(`Removing orphan trigger ${trigger.id}: workflow no longer exists`);
      await this.repo.remove(trigger);
      return;
    }

    try {
      const execution = await this.engine.run(workflow, trigger.payload ?? {}, {
        triggerType: 'cron',
        triggerId: trigger.id,
      });
      await this.recordFire(trigger, execution.status, execution.error);
      this.logger.log(
        `Trigger ${trigger.name || trigger.id} fired workflow "${workflow.name}" -> ${execution.status}`,
      );
    } catch (error: any) {
      await this.recordFire(trigger, 'failed', String(error?.message ?? error));
      this.logger.error(`Trigger ${trigger.id} failed: ${error?.message ?? error}`);
    }
  }

  /** Drops memo entries from previous minutes so the map cannot grow forever. */
  private pruneFiredMinutes(currentKey: string): void {
    for (const [id, key] of this.firedMinutes) {
      if (key !== currentKey) this.firedMinutes.delete(id);
    }
  }

  private async recordFire(
    trigger: TriggerEntity,
    status: string,
    error?: string | null,
  ): Promise<void> {
    trigger.triggerCount += 1;
    trigger.lastTriggeredAt = new Date();
    trigger.lastStatus = status === 'success' ? 'success' : 'failed';
    trigger.lastError = status === 'success' ? null : (error ?? null);
    await this.repo.save(trigger);
  }

  // ------------------------------------------------------------- Helpers

  private async findOwned(id: string, ownerId: string): Promise<TriggerEntity> {
    const trigger = await this.repo.findOneBy({ id });
    if (!trigger) throw new NotFoundException(`Trigger ${id} not found`);
    if (trigger.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have access to this trigger');
    }
    return trigger;
  }

  private async assertWorkflowAccess(workflowId: string, ownerId: string): Promise<WorkflowEntity> {
    const workflow = await this.workflows.findOneBy({ id: workflowId });
    if (!workflow) throw new NotFoundException(`Workflow ${workflowId} not found`);
    if (workflow.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have access to this workflow');
    }
    return workflow;
  }

  private assertValidCron(expression?: string): void {
    try {
      parseCron(expression ?? '');
    } catch (error: any) {
      throw new BadRequestException(String(error?.message ?? error));
    }
  }

  private generateToken(): string {
    return randomBytes(24).toString('base64url');
  }

  /** HMAC signing secret; hex so it is safe to paste into any client. */
  private generateSecret(): string {
    return randomBytes(32).toString('hex');
  }

  private toView(
    trigger: TriggerEntity,
    options: { revealSecret?: boolean } = {},
  ): TriggerView {
    let nextRunAt: string | null = null;
    if (trigger.type === 'cron' && trigger.enabled) {
      try {
        nextRunAt = nextCronRun(parseCron(trigger.cronExpression))?.toISOString() ?? null;
      } catch {
        nextRunAt = null;
      }
    }
    return {
      id: trigger.id,
      workflowId: trigger.workflowId,
      type: trigger.type,
      name: trigger.name,
      cronExpression: trigger.cronExpression,
      payload: trigger.payload,
      enabled: trigger.enabled,
      async: trigger.async,
      triggerCount: trigger.triggerCount,
      lastStatus: trigger.lastStatus,
      lastTriggeredAt: trigger.lastTriggeredAt,
      lastError: trigger.lastError,
      createdAt: trigger.createdAt,
      webhookPath: trigger.token ? `/api/hooks/${trigger.token}` : null,
      nextRunAt,
      signatureRequired: Boolean(trigger.secret),
      // Never echoed by the list endpoint - only right after it is issued.
      ...(options.revealSecret && trigger.secret ? { secret: trigger.secret } : {}),
    };
  }
}
