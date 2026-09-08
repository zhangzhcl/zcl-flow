import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleSlash,
  Clock,
  History,
  ImageIcon,
  Loader2,
  Play,
  Radio,
  Webhook,
  X,
} from 'lucide-react';
import { api, openExecutionStream } from '../api/client';
import type {
  Execution,
  ExecutionDetail,
  ExecutionEvent,
  ExecutionTrigger,
  InputParam,
  NodeExecution,
  OutputParam,
  WorkflowDefinition,
} from '../types';
import { NODE_ICONS } from './node-registries';
import { useRunStatusStore, type NodeRunStatus } from '../store/run-status';

interface RunPanelProps {
  workflowId: string;
  /** Current canvas definition, used to derive the input skeleton. */
  definition?: WorkflowDefinition | null;
  /** Persist the canvas before running. */
  onBeforeRun: () => Promise<void>;
  onClose: () => void;
}

/** A node entry built incrementally from the live SSE stream. */
interface LiveNode {
  nodeId: string;
  nodeType: string;
  title: string;
  status: NodeRunStatus;
  durationMs?: number;
  error?: string;
}

/**
 * Scan the definition for "{{input.xxx}}" references and build
 * a ready-to-fill JSON input skeleton.
 */
export function deriveInputSkeleton(definition?: WorkflowDefinition | null): string {
  const keys = new Set<string>();
  if (definition) {
    const raw = JSON.stringify(definition);
    for (const match of raw.matchAll(/\{\{\s*input\.([a-zA-Z0-9_]+)/g)) {
      keys.add(match[1]);
    }
  }
  if (keys.size === 0) return '{}';
  const skeleton: Record<string, string> = {};
  for (const key of keys) skeleton[key] = '';
  return JSON.stringify(skeleton, null, 2);
}

/** Extract inputParams from the start node of a definition. */
function getStartInputParams(definition?: WorkflowDefinition | null): InputParam[] {
  if (!definition) return [];
  const startNode = (definition.nodes as any[]).find((n: any) => n.type === 'start');
  const params = startNode?.data?.inputParams;
  return Array.isArray(params) ? (params as InputParam[]) : [];
}

/** Extract outputParams from the end node of a definition. */
function getEndOutputParams(definition?: WorkflowDefinition | null): OutputParam[] {
  if (!definition) return [];
  const endNode = (definition.nodes as any[]).find((n: any) => n.type === 'end');
  const params = endNode?.data?.outputParams;
  return Array.isArray(params) ? (params as OutputParam[]) : [];
}

/** Image upload field: renders a button + preview, returns base64 data URL. */
function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex w-full items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
      >
        <ImageIcon size={13} />
        {value ? t('run.imageSelected') : t('run.uploadImage')}
      </button>
      {value && (
        <img
          src={value}
          alt=""
          className="mt-2 max-h-24 w-full rounded-md border border-gray-200 object-contain"
        />
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle2 size={14} className="text-gray-900" />;
  if (status === 'failed') return <AlertCircle size={14} className="text-gray-700" />;
  if (status === 'skipped') return <CircleSlash size={14} className="text-gray-400" />;
  if (status === 'cancelled') return <X size={14} className="text-gray-500" />;
  if (status === 'queued') return <Clock size={14} className="text-gray-500" />;
  return <Loader2 size={14} className="animate-spin text-gray-500" />;
}

/** Small badge showing how a run was started. */
function TriggerBadge({ trigger }: { trigger?: ExecutionTrigger }) {
  const { t } = useTranslation();
  if (!trigger || trigger === 'manual') return null;
  return (
    <span className="inline-flex items-center gap-1 rounded border border-gray-200 px-1 py-0.5 text-[9px] text-gray-500">
      {trigger === 'webhook' ? <Webhook size={9} /> : <CalendarClock size={9} />}
      {t(`triggers.${trigger}`)}
    </span>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-48 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-2 font-mono text-[11px] leading-relaxed text-gray-700">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function NodeResultRow({ node }: { node: NodeExecution }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {open ? (
          <ChevronDown size={13} className="shrink-0 text-gray-400" />
        ) : (
          <ChevronRight size={13} className="shrink-0 text-gray-400" />
        )}
        <span className="flex h-5 w-5 items-center justify-center text-gray-500">
          {NODE_ICONS[node.nodeType] ?? null}
        </span>
        <span className="flex-1 truncate font-mono text-xs text-gray-800">{node.nodeId}</span>
        <span className="font-mono text-[10px] text-gray-400">{node.durationMs}ms</span>
        <StatusIcon status={node.status} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-gray-200 px-3 py-2">
          {node.error && (
            <div className="rounded-md border border-gray-200 bg-gray-100 p-2 text-[11px] text-gray-800">
              {node.error}
            </div>
          )}
          {node.input && Object.keys(node.input).length > 0 && (
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t('run.nodeInput')}
              </div>
              <JsonBlock value={node.input} />
            </div>
          )}
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t('run.nodeOutput')}
            </div>
            <JsonBlock value={node.output ?? {}} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Run panel: JSON input, run trigger, live progress, per-node results,
 * execution history. Desktop: right drawer. Mobile: bottom sheet.
 */
export default function RunPanel({ workflowId, definition, onBeforeRun, onClose }: RunPanelProps) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<'run' | 'history'>('run');
  const [inputText, setInputText] = useState(() => deriveInputSkeleton(definition));
  const inputParams = getStartInputParams(definition);
  const hasParams = inputParams.length > 0;
  const outputParams = getEndOutputParams(definition);
  const [inputMode, setInputMode] = useState<'form' | 'json'>(hasParams ? 'form' : 'json');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionDetail | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [history, setHistory] = useState<Execution[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [liveNodes, setLiveNodes] = useState<LiveNode[]>([]);
  const [streamOnline, setStreamOnline] = useState(false);
  /** Execution started from this panel, used to enable the cancel button. */
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);

  const setNodeStatus = useRunStatusStore((state) => state.setStatus);
  const resetNodeStatus = useRunStatusStore((state) => state.reset);
  /** Execution currently mirrored by the live list. */
  const watchedExecution = useRef<string | null>(null);

  /**
   * Subscribe to the account-wide progress stream for the lifetime of the
   * panel. Events are filtered down to this workflow, so a run started from
   * a webhook or the scheduler lights up the canvas too.
   */
  useEffect(() => {
    const source = openExecutionStream();
    source.onopen = () => setStreamOnline(true);
    source.onerror = () => setStreamOnline(false);
    source.onmessage = (message) => {
      let event: ExecutionEvent;
      try {
        event = JSON.parse(message.data);
      } catch {
        return;
      }
      if (event.workflowId !== workflowId) return;

      if (event.type === 'execution.started') {
        watchedExecution.current = event.executionId;
        setLiveNodes([]);
        resetNodeStatus();
        return;
      }
      if (event.executionId !== watchedExecution.current) return;

      // The run finished (from any trigger): pull the full detail so the panel
      // shows the final output even when it was started asynchronously.
      if (event.type === 'execution.finished') {
        const finishedId = event.executionId;
        void api
          .getExecution(finishedId)
          .then((detail) => {
            setResult(detail);
            setRunning(false);
            resetNodeStatus();
            for (const node of detail.nodes) {
              setNodeStatus(node.nodeId, node.status as NodeRunStatus);
            }
            if (detail.status === 'failed' && detail.error) {
              setRunError(detail.error);
            }
          })
          .catch(() => setRunning(false));
        return;
      }

      const { nodeId, nodeType, title, status, durationMs, error } = event.payload;
      if (event.type === 'node.started' && nodeId) {
        setNodeStatus(nodeId, 'running');
        setLiveNodes((items) => [
          ...items.filter((item) => item.nodeId !== nodeId),
          {
            nodeId,
            nodeType: nodeType ?? '',
            title: title ?? nodeId,
            status: 'running',
          },
        ]);
      } else if (event.type === 'node.finished' && nodeId) {
        const next = (status ?? 'success') as NodeRunStatus;
        setNodeStatus(nodeId, next);
        setLiveNodes((items) => {
          const existing = items.find((item) => item.nodeId === nodeId);
          const entry: LiveNode = {
            nodeId,
            nodeType: nodeType ?? existing?.nodeType ?? '',
            title: title ?? existing?.title ?? nodeId,
            status: next,
            durationMs,
            error,
          };
          return [...items.filter((item) => item.nodeId !== nodeId), entry];
        });
      }
    };
    return () => {
      source.close();
      setStreamOnline(false);
      resetNodeStatus();
    };
  }, [workflowId, setNodeStatus, resetNodeStatus]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      setHistory(await api.listExecutions(workflowId));
    } finally {
      setHistoryLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, loadHistory]);

  const handleRun = async () => {
    if (running) return;
    setRunError(null);
    let input: Record<string, unknown>;
    if (inputMode === 'form' && hasParams) {
      input = {};
      for (const param of inputParams) {
        if (param.type === 'multimodal') {
          input[param.name] = {
            text: formValues[`${param.name}__text`] ?? '',
            image: formValues[`${param.name}__image`] ?? '',
          };
        } else {
          const raw = formValues[param.name] ?? '';
          input[param.name] = param.type === 'number' ? (raw === '' ? undefined : Number(raw)) : raw;
        }
      }
    } else {
      try {
        input = inputText.trim() ? JSON.parse(inputText) : {};
      } catch {
        setRunError(t('run.invalidJson'));
        return;
      }
    }
    setRunning(true);
    setResult(null);
    setLiveNodes([]);
    resetNodeStatus();
    try {
      await onBeforeRun();
      // Async run: the server enqueues the workflow and returns immediately
      // with a `queued` execution. The SSE stream (above) delivers progress
      // and the final result, so long runs no longer hold the HTTP connection.
      const execution = await api.runWorkflow(workflowId, input, true);
      watchedExecution.current = execution.id;
      setCurrentExecutionId(execution.id);
      if (execution.status === 'failed' && execution.error) {
        setRunError(execution.error);
        setRunning(false);
      }
    } catch (err: any) {
      setRunError(String(err?.message ?? err));
      setRunning(false);
    }
  };

  const handleCancel = async () => {
    if (!currentExecutionId) return;
    try {
      await api.cancelExecution(currentExecutionId);
    } catch (err: any) {
      setRunError(String(err?.message ?? err));
    }
  };

  const openHistoryItem = async (id: string) => {
    const detail = await api.getExecution(id);
    setResult(detail);
    resetNodeStatus();
    for (const node of detail.nodes) {
      setNodeStatus(node.nodeId, node.status as NodeRunStatus);
    }
    setTab('run');
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language?.startsWith('zh') ? 'zh-CN' : 'en-US');

  const isMock = result?.nodes?.some((node) => node.output?.mock === true);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex max-h-[75vh] flex-col rounded-t-2xl border border-gray-200 bg-gray-50 shadow-2xl md:absolute md:inset-auto md:right-4 md:top-4 md:bottom-4 md:w-[380px] md:max-h-none md:rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setTab('run')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs transition-colors ${
              tab === 'run' ? 'bg-blue-600 font-semibold text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Play size={12} />
            {t('editor.runPanel')}
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs transition-colors ${
              tab === 'history' ? 'bg-blue-600 font-semibold text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <History size={12} />
            {t('editor.history')}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <span
            title={streamOnline ? t('run.liveOn') : t('run.liveOff')}
            className={streamOnline ? 'text-gray-800' : 'text-gray-400'}
          >
            <Radio size={13} />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-800"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {tab === 'run' ? (
          <>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {t('run.input')}
                </div>
                {hasParams && (
                  <div className="flex gap-0.5 rounded-md border border-gray-200 bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => setInputMode('form')}
                      className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
                        inputMode === 'form'
                          ? 'bg-blue-600 font-semibold text-white'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {t('run.formMode')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('json')}
                      className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
                        inputMode === 'json'
                          ? 'bg-blue-600 font-semibold text-white'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      JSON
                    </button>
                  </div>
                )}
              </div>
              {inputMode === 'form' && hasParams ? (
                <div className="space-y-3">
                  {inputParams.map((param) => (
                    <div key={param.name}>
                      <label className="mb-1 flex items-center gap-1.5 text-[11px] text-gray-600">
                        {param.label || param.name}
                        <span className="font-mono text-[9px] text-gray-400">({param.name})</span>
                        {param.required && <span className="text-red-400">*</span>}
                      </label>
                      {param.type === 'image' ? (
                        <ImageUploadField
                          value={formValues[param.name] ?? ''}
                          onChange={(v) =>
                            setFormValues((prev) => ({ ...prev, [param.name]: v }))
                          }
                        />
                      ) : param.type === 'multimodal' ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            placeholder={t('run.multimodalTextPlaceholder')}
                            value={formValues[`${param.name}__text`] ?? ''}
                            onChange={(e) =>
                              setFormValues((prev) => ({
                                ...prev,
                                [`${param.name}__text`]: e.target.value,
                              }))
                            }
                            className="w-full resize-none rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:border-gray-400"
                          />
                          <ImageUploadField
                            value={formValues[`${param.name}__image`] ?? ''}
                            onChange={(v) =>
                              setFormValues((prev) => ({
                                ...prev,
                                [`${param.name}__image`]: v,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <input
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={formValues[param.name] ?? ''}
                          onChange={(e) =>
                            setFormValues((prev) => ({ ...prev, [param.name]: e.target.value }))
                          }
                          className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:border-gray-400"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  rows={4}
                  spellCheck={false}
                  className="w-full resize-y rounded-md border border-gray-200 bg-white p-2.5 font-mono text-xs text-gray-800 outline-none transition-colors focus:border-gray-400"
                />
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRun}
                disabled={running}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                {running ? t('common.running') : t('common.run')}
              </button>
              {running && currentExecutionId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  title={t('run.cancelRun')}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2.5 text-xs font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:text-gray-900"
                >
                  <X size={14} />
                  {t('common.cancel')}
                </button>
              )}
            </div>

            {runError && (
              <div className="flex items-start gap-2 rounded-md border border-gray-300 bg-gray-100 p-3 text-xs text-gray-800">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span className="break-all">{runError}</span>
              </div>
            )}

            {/* Queued/in-flight hint: shown while waiting for the first event. */}
            {running && !result && liveNodes.length === 0 && (
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-[11px] text-gray-500">
                <Loader2 size={13} className="animate-spin" />
                {t('run.queuedHint')}
              </div>
            )}

            {/* Live trace: visible while a run is in flight, from any trigger. */}
            {liveNodes.length > 0 && !result && (
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {t('run.liveTrace')}
                </div>
                <div className="space-y-1.5">
                  {liveNodes.map((node) => (
                    <div
                      key={node.nodeId}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                    >
                      <span className="flex h-5 w-5 items-center justify-center text-gray-500">
                        {NODE_ICONS[node.nodeType] ?? null}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs text-gray-800">
                        {node.title}
                      </span>
                      {node.durationMs !== undefined && (
                        <span className="font-mono text-[10px] text-gray-400">
                          {node.durationMs}ms
                        </span>
                      )}
                      <StatusIcon status={node.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isMock && (
              <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-500">
                {t('run.mockBadge')}
              </div>
            )}

            {result && (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <StatusIcon status={result.status} />
                    {t(`run.status${result.status.charAt(0).toUpperCase()}${result.status.slice(1)}` as any)}
                    <TriggerBadge trigger={result.triggerType} />
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock size={11} />
                    {result.durationMs}ms
                  </span>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {t('run.result')}
                  </div>
                  {outputParams.length > 0 ? (
                    <div className="space-y-2">
                      {outputParams.map((op) => {
                        const val = (result.output ?? {})[op.name];
                        return (
                          <div key={op.name} className="rounded-md border border-gray-200 bg-white px-3 py-2">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-gray-700">{op.label || op.name}</span>
                              <span className="font-mono text-[9px] text-gray-400">{op.name}</span>
                            </div>
                            {val === undefined ? (
                              <span className="text-[11px] text-gray-400">—</span>
                            ) : typeof val === 'string' ? (
                              <div className="whitespace-pre-wrap break-words text-xs text-gray-800">{val}</div>
                            ) : (
                              <JsonBlock value={val} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <JsonBlock value={result.output ?? {}} />
                  )}
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {t('run.nodeResults')}
                  </div>
                  <div className="space-y-2">
                    {result.nodes.map((node) => (
                      <NodeResultRow key={node.id} node={node} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        ) : historyLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
            <Loader2 size={15} className="animate-spin" />
            <span className="text-xs">{t('common.loading')}</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400">{t('run.noExecutions')}</div>
        ) : (
          <div className="space-y-2">
            {history.map((execution) => (
              <button
                key={execution.id}
                type="button"
                onClick={() => openHistoryItem(execution.id)}
                className="flex w-full items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-gray-300"
              >
                <StatusIcon status={execution.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-mono text-[11px] text-gray-700">
                      {execution.id.slice(0, 8)}
                    </span>
                    <TriggerBadge trigger={execution.triggerType} />
                  </div>
                  <div className="text-[10px] text-gray-400">{formatTime(execution.startedAt)}</div>
                </div>
                <span className="font-mono text-[10px] text-gray-400">{execution.durationMs}ms</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
