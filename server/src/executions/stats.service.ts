import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionEntity, ExecutionStatus, ExecutionTrigger } from './execution.entity';
import { NodeExecutionEntity } from './node-execution.entity';

export interface DailyPoint {
  /** Local date, `YYYY-MM-DD`. */
  date: string;
  total: number;
  success: number;
  failed: number;
}

export interface FailingNode {
  nodeId: string;
  nodeType: string;
  failures: number;
  lastError: string | null;
}

export interface WorkflowUsage {
  workflowId: string;
  name: string;
  runs: number;
  failed: number;
  avgDurationMs: number;
}

export interface ExecutionStats {
  /** Window covered by the report. */
  days: number;
  total: number;
  byStatus: Record<ExecutionStatus, number>;
  byTrigger: Record<ExecutionTrigger, number>;
  /** 0..1, computed over finished runs only. */
  successRate: number;
  avgDurationMs: number;
  p50DurationMs: number;
  p95DurationMs: number;
  daily: DailyPoint[];
  topFailingNodes: FailingNode[];
  topWorkflows: WorkflowUsage[];
  /** Live queue snapshot, filled in by the controller. */
  queue?: { queued: number; running: number; concurrency: number };
}

const EMPTY_STATUS: Record<ExecutionStatus, number> = {
  queued: 0,
  running: 0,
  success: 0,
  failed: 0,
  cancelled: 0,
};

const EMPTY_TRIGGER: Record<ExecutionTrigger, number> = {
  manual: 0,
  webhook: 0,
  cron: 0,
};

/** Local `YYYY-MM-DD` key (not UTC, so the chart matches the user's day). */
function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Nearest-rank percentile over a pre-sorted ascending array. */
function percentile(sorted: number[], fraction: number): number {
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil(fraction * sorted.length) - 1);
  return sorted[Math.max(0, index)];
}

/**
 * Aggregates execution history into an operations dashboard.
 *
 * Rows are aggregated in the process rather than in SQL: the dataset is bounded
 * by both the time window and STATS_MAX_ROWS, and doing it here keeps the
 * percentile logic readable and database-agnostic.
 */
@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(ExecutionEntity)
    private readonly executions: Repository<ExecutionEntity>,
    @InjectRepository(NodeExecutionEntity)
    private readonly nodeExecutions: Repository<NodeExecutionEntity>,
    private readonly config: ConfigService,
  ) {}

  async compute(
    ownerId: string,
    options: { days?: number; workflowId?: string } = {},
  ): Promise<ExecutionStats> {
    const days = Math.min(Math.max(Number(options.days) || 7, 1), 90);
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const maxRows = Number(this.config.get('STATS_MAX_ROWS', 20000));
    const query = this.executions
      .createQueryBuilder('execution')
      .select([
        'execution.id AS id',
        'execution.workflowId AS workflowId',
        'execution.status AS status',
        'execution.triggerType AS triggerType',
        'execution.durationMs AS durationMs',
        'execution.startedAt AS startedAt',
      ])
      .where('execution.ownerId = :ownerId', { ownerId })
      // Sub-workflow runs are implementation detail of their parent.
      .andWhere('execution.parentExecutionId IS NULL')
      .andWhere('execution.startedAt >= :since', { since })
      .orderBy('execution.startedAt', 'DESC')
      .limit(maxRows);
    if (options.workflowId) {
      query.andWhere('execution.workflowId = :workflowId', { workflowId: options.workflowId });
    }

    const rows: Array<{
      id: string;
      workflowId: string;
      status: ExecutionStatus;
      triggerType: ExecutionTrigger;
      durationMs: number;
      startedAt: string | Date;
    }> = await query.getRawMany();

    const byStatus = { ...EMPTY_STATUS };
    const byTrigger = { ...EMPTY_TRIGGER };
    const durations: number[] = [];
    const dailyMap = new Map<string, DailyPoint>();

    // Pre-seed every day so the chart has no gaps.
    for (let i = 0; i < days; i += 1) {
      const date = new Date(since);
      date.setDate(since.getDate() + i);
      dailyMap.set(dayKey(date), { date: dayKey(date), total: 0, success: 0, failed: 0 });
    }

    const perWorkflow = new Map<string, { runs: number; failed: number; totalMs: number }>();

    for (const row of rows) {
      byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
      byTrigger[row.triggerType] = (byTrigger[row.triggerType] ?? 0) + 1;

      if (row.status === 'success' || row.status === 'failed') {
        durations.push(Number(row.durationMs) || 0);
      }

      const point = dailyMap.get(dayKey(new Date(row.startedAt)));
      if (point) {
        point.total += 1;
        if (row.status === 'success') point.success += 1;
        if (row.status === 'failed') point.failed += 1;
      }

      const usage = perWorkflow.get(row.workflowId) ?? { runs: 0, failed: 0, totalMs: 0 };
      usage.runs += 1;
      if (row.status === 'failed') usage.failed += 1;
      usage.totalMs += Number(row.durationMs) || 0;
      perWorkflow.set(row.workflowId, usage);
    }

    durations.sort((a, b) => a - b);
    const finished = byStatus.success + byStatus.failed;

    return {
      days,
      total: rows.length,
      byStatus,
      byTrigger,
      successRate: finished ? byStatus.success / finished : 0,
      avgDurationMs: durations.length
        ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
        : 0,
      p50DurationMs: percentile(durations, 0.5),
      p95DurationMs: percentile(durations, 0.95),
      daily: [...dailyMap.values()],
      topFailingNodes: await this.topFailingNodes(rows.map((row) => row.id)),
      topWorkflows: await this.topWorkflows(perWorkflow),
    };
  }

  /** Node ids that failed most often inside the sampled executions. */
  private async topFailingNodes(executionIds: string[]): Promise<FailingNode[]> {
    if (!executionIds.length) return [];

    // SQLite caps bound parameters, so the id list is queried in slices.
    const CHUNK = 500;
    const tally = new Map<string, FailingNode>();

    for (let i = 0; i < executionIds.length; i += CHUNK) {
      const slice = executionIds.slice(i, i + CHUNK);
      const failures = await this.nodeExecutions.find({
        where: slice.map((executionId) => ({ executionId, status: 'failed' as const })),
        select: { nodeId: true, nodeType: true, error: true },
        take: 5000,
      });
      for (const failure of failures) {
        const key = `${failure.nodeId}:${failure.nodeType}`;
        const entry =
          tally.get(key) ??
          { nodeId: failure.nodeId, nodeType: failure.nodeType, failures: 0, lastError: null };
        entry.failures += 1;
        entry.lastError = failure.error ?? entry.lastError;
        tally.set(key, entry);
      }
    }

    return [...tally.values()].sort((a, b) => b.failures - a.failures).slice(0, 5);
  }

  /** Busiest workflows, resolved to their current names. */
  private async topWorkflows(
    perWorkflow: Map<string, { runs: number; failed: number; totalMs: number }>,
  ): Promise<WorkflowUsage[]> {
    const ranked = [...perWorkflow.entries()]
      .sort((a, b) => b[1].runs - a[1].runs)
      .slice(0, 5);
    if (!ranked.length) return [];

    const names = new Map<string, string>();
    const found = await this.executions.manager
      .createQueryBuilder()
      .select(['workflow.id AS id', 'workflow.name AS name'])
      .from('workflows', 'workflow')
      .where('workflow.id IN (:...ids)', { ids: ranked.map(([id]) => id) })
      .getRawMany();
    for (const row of found) names.set(row.id, row.name);

    return ranked.map(([workflowId, usage]) => ({
      workflowId,
      name: names.get(workflowId) ?? '(deleted)',
      runs: usage.runs,
      failed: usage.failed,
      avgDurationMs: Math.round(usage.totalMs / usage.runs),
    }));
  }

  /** Ensures the requesting account owns the workflow before scoping stats. */
  async assertWorkflowOwner(workflowId: string, ownerId: string): Promise<void> {
    const found = await this.executions.manager
      .createQueryBuilder()
      .select('workflow.ownerId', 'ownerId')
      .from('workflows', 'workflow')
      .where('workflow.id = :workflowId', { workflowId })
      .getRawOne();
    if (found && found.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have access to this workflow');
    }
  }
}
