import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  CalendarClock,
  Check,
  Copy,
  Loader2,
  Plus,
  Power,
  RefreshCw,
  Trash2,
  Webhook,
  X,
  Zap,
} from 'lucide-react';
import { api, webhookUrl } from '../api/client';
import type { Trigger, TriggerType } from '../types';
import { confirmDialog } from '../components/ConfirmDialog';

interface TriggerPanelProps {
  workflowId: string;
  /** Persist the canvas before a trigger is created or fired. */
  onBeforeMutate: () => Promise<void>;
  onClose: () => void;
}

/** Preset cron expressions offered as one-click choices. */
const CRON_PRESETS = ['*/5 * * * *', '0 * * * *', '0 9 * * *', '0 9 * * 1', '0 0 1 * *'];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          // Clipboard can be blocked; the value stays selectable in the UI.
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-800"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function TriggerCard({
  trigger,
  onChanged,
  onRemoved,
  onFire,
  busy,
}: {
  trigger: Trigger;
  onChanged: (next: Trigger) => void;
  onRemoved: (id: string) => void;
  onFire: (trigger: Trigger) => void;
  busy: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [payloadText, setPayloadText] = useState(() =>
    JSON.stringify(trigger.payload ?? {}, null, 2),
  );
  const [cron, setCron] = useState(trigger.cronExpression);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formatTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(i18n.language?.startsWith('zh') ? 'zh-CN' : 'en-US') : '-';

  const patch = async (data: Parameters<typeof api.updateTrigger>[1]) => {
    setError(null);
    setSaving(true);
    try {
      onChanged(await api.updateTrigger(trigger.id, data));
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const savePayload = async () => {
    let payload: Record<string, unknown>;
    try {
      payload = payloadText.trim() ? JSON.parse(payloadText) : {};
    } catch {
      setError(t('run.invalidJson'));
      return;
    }
    await patch({ payload });
  };

  return (
    <div className="space-y-2.5 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-gray-800">
          {trigger.type === 'webhook' ? <Webhook size={13} /> : <CalendarClock size={13} />}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-900">
          {trigger.name || t(`triggers.${trigger.type}`)}
        </span>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${
            trigger.enabled
              ? 'border border-gray-300 bg-gray-200 text-gray-800'
              : 'border border-gray-200 text-gray-400'
          }`}
        >
          {trigger.enabled ? t('triggers.enabled') : t('triggers.disabled')}
        </span>
      </div>

      {trigger.type === 'webhook' && trigger.webhookPath && (
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">
            {t('triggers.endpoint')}
          </div>
          <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 pl-2">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-1.5 font-mono text-[10px] text-gray-700">
              {webhookUrl(trigger.webhookPath)}
            </code>
            <CopyButton value={webhookUrl(trigger.webhookPath)} label={t('triggers.copyUrl')} />
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-gray-400">
            {t('triggers.webhookHint')}
          </p>

          {/* Webhook behaviour toggles: async dispatch + HMAC signature. */}
          <div className="mt-2 space-y-1.5">
            <label className="flex cursor-pointer items-center justify-between gap-2 text-[11px] text-gray-700">
              <span>{t('triggers.async')}</span>
              <input
                type="checkbox"
                checked={trigger.async}
                onChange={(event) => patch({ async: event.target.checked })}
                disabled={saving}
                className="h-3.5 w-3.5 accent-blue-500"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-2 text-[11px] text-gray-700">
              <span>{t('triggers.requireSignature')}</span>
              <input
                type="checkbox"
                checked={trigger.signatureRequired}
                onChange={(event) => patch({ requireSignature: event.target.checked })}
                disabled={saving}
                className="h-3.5 w-3.5 accent-blue-500"
              />
            </label>
          </div>

          {/* The secret is revealed exactly once, right after enabling signing. */}
          {trigger.secret && (
            <div className="mt-2 rounded-md border border-gray-300 bg-gray-100 p-2">
              <div className="mb-1 text-[10px] font-semibold text-gray-800">
                {t('triggers.secretRevealed')}
              </div>
              <div className="flex items-center gap-1 rounded border border-gray-200 bg-gray-50 pl-2">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-1 font-mono text-[10px] text-gray-700">
                  {trigger.secret}
                </code>
                <CopyButton value={trigger.secret} label={t('users.copy')} />
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-gray-400">
                {t('triggers.secretHint')}
              </p>
            </div>
          )}

          {trigger.signatureRequired && !trigger.secret && (
            <p className="mt-1.5 text-[10px] leading-relaxed text-gray-400">
              {t('triggers.signatureHint')}
            </p>
          )}
        </div>
      )}

      {trigger.type === 'cron' && (
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">
            {t('triggers.cron')}
          </div>
          <div className="flex gap-1.5">
            <input
              value={cron}
              onChange={(event) => setCron(event.target.value)}
              spellCheck={false}
              className="min-w-0 flex-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 font-mono text-[11px] text-gray-800 outline-none focus:border-gray-400"
            />
            <button
              type="button"
              onClick={() => patch({ cronExpression: cron })}
              disabled={saving || cron === trigger.cronExpression}
              className="shrink-0 rounded-md border border-gray-200 px-2 text-[11px] text-gray-700 transition-colors hover:border-gray-300 disabled:opacity-40"
            >
              {t('common.save')}
            </button>
          </div>
          <div className="mt-1 text-[10px] text-gray-400">
            {t('triggers.nextRun')}: {formatTime(trigger.nextRunAt)}
          </div>
        </div>
      )}

      <div>
        <div className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">
          {trigger.type === 'cron' ? t('triggers.payload') : t('triggers.testPayload')}
        </div>
        <textarea
          value={payloadText}
          onChange={(event) => setPayloadText(event.target.value)}
          rows={2}
          spellCheck={false}
          className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 p-2 font-mono text-[11px] text-gray-800 outline-none focus:border-gray-400"
        />
        <button
          type="button"
          onClick={savePayload}
          disabled={saving}
          className="mt-1 rounded-md border border-gray-200 px-2 py-1 text-[10px] text-gray-500 transition-colors hover:border-gray-300 disabled:opacity-40"
        >
          {t('triggers.savePayload')}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-gray-200 pt-2 text-[10px] text-gray-400">
        <span>
          {t('triggers.fires')}: {trigger.triggerCount}
          {trigger.lastTriggeredAt ? ` / ${formatTime(trigger.lastTriggeredAt)}` : ''}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            title={t('triggers.fireNow')}
            onClick={() => onFire(trigger)}
            disabled={busy}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:opacity-40"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
          </button>
          <button
            type="button"
            title={trigger.enabled ? t('triggers.disable') : t('triggers.enable')}
            onClick={() => patch({ enabled: !trigger.enabled })}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
          >
            <Power size={13} />
          </button>
          {trigger.type === 'webhook' && (
            <button
              type="button"
              title={t('triggers.rotate')}
              onClick={async () => {
                if (!(await confirmDialog(t('triggers.rotateConfirm'), false))) return;
                onChanged(await api.rotateTriggerToken(trigger.id));
              }}
              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
            >
              <RefreshCw size={13} />
            </button>
          )}
          <button
            type="button"
            title={t('common.delete')}
            onClick={async () => {
              if (!(await confirmDialog(t('triggers.deleteConfirm')))) return;
              await api.deleteTrigger(trigger.id);
              onRemoved(trigger.id);
            }}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-800"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {(error || trigger.lastError) && (
        <div className="flex items-start gap-1.5 rounded-md border border-gray-200 bg-gray-100 p-2 text-[10px] text-gray-800">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span className="break-all">{error ?? trigger.lastError}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Trigger panel: manages the automation entry points of a workflow.
 * Desktop: right drawer. Mobile: bottom sheet.
 */
export default function TriggerPanel({
  workflowId,
  onBeforeMutate,
  onClose,
}: TriggerPanelProps) {
  const { t } = useTranslation();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<TriggerType | null>(null);
  const [firingId, setFiringId] = useState<string | null>(null);
  const [fireResult, setFireResult] = useState<string | null>(null);
  const [draftCron, setDraftCron] = useState('*/5 * * * *');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTriggers(await api.listTriggers(workflowId));
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (type: TriggerType) => {
    setError(null);
    setCreating(type);
    try {
      await onBeforeMutate();
      const trigger = await api.createTrigger({
        workflowId,
        type,
        name: type === 'webhook' ? t('triggers.webhook') : t('triggers.cron'),
        cronExpression: type === 'cron' ? draftCron : undefined,
      });
      setTriggers((items) => [...items, trigger]);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setCreating(null);
    }
  };

  const fire = async (trigger: Trigger) => {
    setError(null);
    setFireResult(null);
    setFiringId(trigger.id);
    try {
      await onBeforeMutate();
      const execution = await api.fireTrigger(trigger.id);
      setFireResult(
        execution.status === 'success'
          ? t('triggers.fireOk', { ms: execution.durationMs })
          : (execution.error ?? t('run.statusFailed')),
      );
      await load();
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setFiringId(null);
    }
  };

  const grouped = useMemo(
    () => ({
      webhook: triggers.filter((item) => item.type === 'webhook'),
      cron: triggers.filter((item) => item.type === 'cron'),
    }),
    [triggers],
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex max-h-[80vh] flex-col rounded-t-2xl border border-gray-200 bg-gray-50 shadow-2xl md:absolute md:inset-auto md:right-4 md:top-4 md:bottom-4 md:w-[400px] md:max-h-none md:rounded-xl">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-gray-800" />
          <span className="text-sm font-semibold text-gray-900">{t('triggers.title')}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-800"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <p className="text-[11px] leading-relaxed text-gray-400">{t('triggers.hint')}</p>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-gray-300 bg-gray-100 p-2.5 text-[11px] text-gray-800">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}

        {fireResult && (
          <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-700">
            {fireResult}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
            <Loader2 size={15} className="animate-spin" />
            <span className="text-xs">{t('common.loading')}</span>
          </div>
        ) : (
          <>
            {/* Webhook section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {t('triggers.webhook')}
                </span>
                <button
                  type="button"
                  onClick={() => create('webhook')}
                  disabled={creating !== null}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[10px] text-gray-700 transition-colors hover:border-gray-300 disabled:opacity-40"
                >
                  {creating === 'webhook' ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Plus size={11} />
                  )}
                  {t('triggers.addWebhook')}
                </button>
              </div>
              {grouped.webhook.length === 0 ? (
                <p className="rounded-md border border-dashed border-gray-200 px-3 py-3 text-[10px] text-gray-400">
                  {t('triggers.noWebhook')}
                </p>
              ) : (
                grouped.webhook.map((trigger) => (
                  <TriggerCard
                    key={trigger.id}
                    trigger={trigger}
                    busy={firingId === trigger.id}
                    onFire={fire}
                    onChanged={(next) =>
                      setTriggers((items) =>
                        items.map((item) => (item.id === next.id ? next : item)),
                      )
                    }
                    onRemoved={(id) =>
                      setTriggers((items) => items.filter((item) => item.id !== id))
                    }
                  />
                ))
              )}
            </div>

            {/* Schedule section */}
            <div className="space-y-2 border-t border-gray-200 pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {t('triggers.cron')}
              </span>
              <div className="flex gap-1.5">
                <input
                  value={draftCron}
                  onChange={(event) => setDraftCron(event.target.value)}
                  spellCheck={false}
                  placeholder="*/5 * * * *"
                  className="min-w-0 flex-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 font-mono text-[11px] text-gray-800 outline-none focus:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => create('cron')}
                  disabled={creating !== null}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 px-2 text-[10px] text-gray-700 transition-colors hover:border-gray-300 disabled:opacity-40"
                >
                  {creating === 'cron' ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Plus size={11} />
                  )}
                  {t('triggers.addCron')}
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {CRON_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDraftCron(preset)}
                    className={`rounded border px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                      draftCron === preset
                        ? 'border-gray-400 bg-gray-200 text-gray-900'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <p className="text-[10px] leading-relaxed text-gray-400">{t('triggers.cronHint')}</p>
              {grouped.cron.length === 0 ? (
                <p className="rounded-md border border-dashed border-gray-200 px-3 py-3 text-[10px] text-gray-400">
                  {t('triggers.noCron')}
                </p>
              ) : (
                grouped.cron.map((trigger) => (
                  <TriggerCard
                    key={trigger.id}
                    trigger={trigger}
                    busy={firingId === trigger.id}
                    onFire={fire}
                    onChanged={(next) =>
                      setTriggers((items) =>
                        items.map((item) => (item.id === next.id ? next : item)),
                      )
                    }
                    onRemoved={(id) =>
                      setTriggers((items) => items.filter((item) => item.id !== id))
                    }
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
