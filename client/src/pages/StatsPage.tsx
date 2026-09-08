import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Gauge,
  Loader2,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { api } from '../api/client';
import type { ExecutionStats, StatsDailyPoint } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserMenu from '../components/UserMenu';
import { NODE_ICONS } from '../editor/node-registries';

const DAY_OPTIONS = [7, 14, 30] as const;

/** Hand-rolled SVG bar chart: total vs failed runs per day. No chart lib. */
function TrendChart({ daily }: { daily: StatsDailyPoint[] }) {
  const { t } = useTranslation();
  if (!daily.length) {
    return <div className="py-8 text-center text-xs text-gray-400">{t('stats.noData')}</div>;
  }

  const width = 640;
  const height = 180;
  const padding = { top: 12, right: 12, bottom: 24, left: 32 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(1, ...daily.map((point) => point.total));
  const band = innerW / daily.length;
  const barW = Math.min(28, band * 0.6);

  // Y-axis gridlines at quarters.
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.round(max * fraction));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img">
      {ticks.map((tick) => {
        const y = padding.top + innerH - (tick / max) * innerH;
        return (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              className="stroke-gray-200"
              strokeWidth={1}
            />
            <text x={padding.left - 6} y={y + 3} textAnchor="end" className="fill-gray-400 text-[9px]">
              {tick}
            </text>
          </g>
        );
      })}
      {daily.map((point, index) => {
        const x = padding.left + index * band + (band - barW) / 2;
        const totalH = (point.total / max) * innerH;
        const failedH = (point.failed / max) * innerH;
        const label = point.date.slice(5);
        return (
          <g key={point.date}>
            <title>{`${point.date}: ${point.total} / ${t('stats.failed')} ${point.failed}`}</title>
            <rect
              x={x}
              y={padding.top + innerH - totalH}
              width={barW}
              height={totalH}
              rx={2}
              className="fill-gray-400"
            />
            {point.failed > 0 && (
              <rect
                x={x}
                y={padding.top + innerH - failedH}
                width={barW}
                height={failedH}
                rx={2}
                className="fill-gray-300"
              />
            )}
            {(daily.length <= 15 || index % 2 === 0) && (
              <text
                x={x + barW / 2}
                y={height - 8}
                textAnchor="middle"
                className="fill-gray-400 text-[8px]"
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-gray-400">{hint}</div>}
    </div>
  );
}

/** Operations dashboard: success rate, latency percentiles, daily trend, failing nodes. */
export default function StatsPage() {
  const { t } = useTranslation();
  const [days, setDays] = useState<number>(7);
  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await api.getStats({ days }));
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/console"
              title={t('common.back')}
              className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-gray-900" />
              <h1 className="text-sm font-semibold text-gray-900">{t('stats.title')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
              {DAY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDays(option)}
                  className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                    days === option
                      ? 'bg-blue-600 font-semibold text-white'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {option}
                  {t('stats.dayUnit')}
                </button>
              ))}
            </div>
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">{t('common.loading')}</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 rounded-md border border-gray-300 bg-gray-100 p-3 text-xs text-gray-800">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Overview cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                icon={<Activity size={13} />}
                label={t('stats.totalRuns')}
                value={String(stats.total)}
                hint={
                  stats.queue
                    ? `${t('stats.queue')}: ${stats.queue.running}/${stats.queue.concurrency}`
                    : undefined
                }
              />
              <StatCard
                icon={<CheckCircle2 size={13} />}
                label={t('stats.successRate')}
                value={`${(stats.successRate * 100).toFixed(1)}%`}
                hint={`${stats.byStatus.failed} ${t('stats.failed')} · ${stats.byStatus.cancelled} ${t('stats.cancelled')}`}
              />
              <StatCard
                icon={<Timer size={13} />}
                label={t('stats.avgDuration')}
                value={`${Math.round(stats.avgDurationMs)}ms`}
                hint={`P50 ${stats.p50DurationMs}ms`}
              />
              <StatCard
                icon={<Gauge size={13} />}
                label={t('stats.p95')}
                value={`${stats.p95DurationMs}ms`}
                hint={t('stats.latencyHint')}
              />
            </div>

            {/* Daily trend */}
            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-800">
                <TrendingUp size={14} />
                {t('stats.dailyTrend')}
                <span className="ml-auto flex items-center gap-3 text-[10px] font-normal text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-sm bg-gray-300" />
                    {t('stats.totalRuns')}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-sm bg-gray-200" />
                    {t('stats.failed')}
                  </span>
                </span>
              </div>
              <TrendChart daily={stats.daily} />
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top failing nodes */}
              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-800">
                  <AlertCircle size={14} />
                  {t('stats.failingNodes')}
                </div>
                {stats.topFailingNodes.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">{t('stats.noFailures')}</div>
                ) : (
                  <div className="space-y-2">
                    {stats.topFailingNodes.map((node) => (
                      <div
                        key={node.nodeId}
                        className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2"
                      >
                        <span className="flex h-6 w-6 items-center justify-center text-gray-500">
                          {NODE_ICONS[node.nodeType] ?? null}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-mono text-[11px] text-gray-800">
                            {node.nodeId}
                          </div>
                          {node.lastError && (
                            <div className="truncate text-[10px] text-gray-400">{node.lastError}</div>
                          )}
                        </div>
                        <span className="shrink-0 rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[10px] text-gray-700">
                          {node.failures}×
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Top workflows */}
              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-800">
                  <Activity size={14} />
                  {t('stats.topWorkflows')}
                </div>
                {stats.topWorkflows.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">{t('stats.noData')}</div>
                ) : (
                  <div className="space-y-2">
                    {stats.topWorkflows.map((workflow) => (
                      <Link
                        key={workflow.workflowId}
                        to={`/workflows/${workflow.workflowId}`}
                        className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 transition-colors hover:border-gray-300"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium text-gray-800">
                            {workflow.name}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {workflow.runs} {t('stats.runsUnit')} ·{' '}
                            {Math.round(workflow.avgDurationMs)}ms
                          </div>
                        </div>
                        {workflow.failed > 0 && (
                          <span className="shrink-0 font-mono text-[10px] text-gray-700">
                            {workflow.failed} {t('stats.failed')}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
