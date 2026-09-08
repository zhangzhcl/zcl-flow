import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Braces,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  FlaskConical,
  Loader2,
  PauseCircle,
  Play,
  SkipForward,
  Square,
  StepForward,
  Trash2,
  X,
} from 'lucide-react';
import { api, openExecutionStream } from '../api/client';
import type {
  DebugConfig,
  DebugSnapshot,
  ExecutionDetail,
  ExecutionEvent,
  NodeMock,
  WorkflowDefinition,
} from '../types';
import { NODE_ICONS } from './node-registries';
import { deriveInputSkeleton } from './RunPanel';
import { useRunStatusStore, type NodeRunStatus } from '../store/run-status';
import { useDebugStore, type DebugStatus } from '../store/debug';
import Select from '../components/Select';

interface DebugPanelProps {
  workflowId: string;
  /** Current canvas definition, used for the input skeleton and node lists. */
  definition?: WorkflowDefinition | null;
  /** Persist the canvas before starting the debug run. */
  onBeforeRun: () => Promise<void>;
  onClose: () => void;
}

interface NodeEntry {
  id: string;
  type: string;
  title: string;
}

/** Flatten the FlowGram definition into a simple, displayable node list. */
function listNodes(definition?: WorkflowDefinition | null): NodeEntry[] {
  if (!definition?.nodes) return [];
  const entries: NodeEntry[] = [];
  for (const raw of definition.nodes as Array<Record<string, any>>) {
    if (!raw || typeof raw.id !== 'string') continue;
    entries.push({
      id: raw.id,
      type: String(raw.type ?? ''),
      title: String(raw.data?.title ?? '') || raw.id,
    });
  }
  return entries;
}

function StatusBadge({ status }: { status: DebugStatus }) {
  const { t } = useTranslation();
  const config: Record<DebugStatus, { icon: React.ReactNode; cls: string; label: string }> = {
    idle: {
      icon: <Circle size={11} />,
      cls: 'border-gray-200 text-gray-400',
      label: t('debug.statusIdle'),
    },
    running: {
      icon: <Loader2 size={11} className="animate-spin" />,
      cls: 'border-sky-500/50 text-sky-300',
      label: t('debug.statusRunning'),
    },
    paused: {
      icon: <PauseCircle size={11} />,
      cls: 'border-amber-400/60 text-amber-300',
      label: t('debug.statusPaused'),
    },
    finished: {
      icon: <CheckCircle2 size={11} />,
      cls: 'border-emerald-500/50 text-emerald-300',
      label: t('debug.statusFinished'),
    },
  };
  const { icon, cls, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {icon}
      {label}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </div>
  );
}

/** Collapsible output entry inside the variable monitor. */
function OutputRow({ nodeId, value }: { nodeId: string; value: unknown }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {open ? (
          <ChevronDown size={13} className="shrink-0 text-gray-400" />
        ) : (
          <ChevronRight size={13} className="shrink-0 text-gray-400" />
        )}
        <span className="flex-1 truncate font-mono text-xs text-gray-800">{nodeId}</span>
      </button>
      {open && (
        <div className="border-t border-gray-200 px-3 py-2">
          <JsonBlock value={value} />
        </div>
      )}
    </div>
  );
}

/**
 * Interactive debugger panel: start a debug run, step through nodes, inspect
 * the paused variable snapshot, and manage breakpoints / node mocks.
 * Desktop: right drawer. Mobile: bottom sheet. Mirrors RunPanel's shell.
 */
export default function DebugPanel({ workflowId, definition, onBeforeRun, onClose }: DebugPanelProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'debug' | 'variables' | 'overrides'>('debug');
  const [inputText, setInputText] = useState(() => deriveInputSkeleton(definition));
  const [pauseOnStart, setPauseOnStart] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExecutionDetail | null>(null);

  // Mock editor draft state (applied to the store on "apply").
  const [mockNodeId, setMockNodeId] = useState('');
  const [mockOutputText, setMockOutputText] = useState('{}');
  const [mockBranch, setMockBranch] = useState('');

  const breakpoints = useDebugStore((state) => state.breakpoints);
  const conditions = useDebugStore((state) => state.conditions);
  const mocks = useDebugStore((state) => state.mocks);
  const activeExecutionId = useDebugStore((state) => state.activeExecutionId);
  const status = useDebugStore((state) => state.status);
  const pausedNode = useDebugStore((state) => state.pausedNode);
  const snapshot = useDebugStore((state) => state.snapshot);
  const toggleBreakpoint = useDebugStore((state) => state.toggleBreakpoint);
  const setCondition = useDebugStore((state) => state.setCondition);
  const setMock = useDebugStore((state) => state.setMock);
  const removeMock = useDebugStore((state) => state.removeMock);
  const startSession = useDebugStore((state) => state.startSession);

  const setNodeStatus = useRunStatusStore((state) => state.setStatus);
  const resetNodeStatus = useRunStatusStore((state) => state.reset);

  const nodes = listNodes(definition);
  const active = status === 'running' || status === 'paused';

  /**
   * Subscribe to the progress stream for the lifetime of the panel. Only
   * events belonging to the active debug execution are processed: pause /
   * resume drive the debugger state machine, node events colour the canvas,
   * and execution.finished loads the final result.
   */
  useEffect(() => {
    const source = openExecutionStream();
    source.onmessage = (message) => {
      let event: ExecutionEvent;
      try {
        event = JSON.parse(message.data);
      } catch {
        return;
      }
      if (event.workflowId !== workflowId) return;
      const store = useDebugStore.getState();
      if (!store.activeExecutionId || event.executionId !== store.activeExecutionId) return;

      if (event.type === 'debug.paused') {
        const { nodeId, title, step, snapshot: snap } = event.payload;
        if (nodeId && snap) store.handlePaused(nodeId, title ?? nodeId, step ?? 0, snap);
        return;
      }
      if (event.type === 'debug.resumed') {
        store.handleResumed();
        return;
      }
      if (event.type === 'execution.finished') {
        const finishedId = event.executionId;
        void api
          .getExecution(finishedId)
          .then((detail) => {
            setResult(detail);
            for (const node of detail.nodes) {
              setNodeStatus(node.nodeId, node.status as NodeRunStatus);
            }
            useDebugStore.getState().finish();
          })
          .catch(() => useDebugStore.getState().finish());
        return;
      }

      const { nodeId, status: nodeStatus } = event.payload;
      if (event.type === 'node.started' && nodeId) {
        setNodeStatus(nodeId, 'running');
      } else if (event.type === 'node.finished' && nodeId) {
        setNodeStatus(nodeId, (nodeStatus ?? 'success') as NodeRunStatus);
      }
    };
    return () => {
      source.close();
      resetNodeStatus();
    };
  }, [workflowId, setNodeStatus, resetNodeStatus]);

  /** Push breakpoint / mock edits to a live session (hot update). */
  const pushLiveConfig = useCallback(() => {
    const store = useDebugStore.getState();
    if (!store.activeExecutionId || (store.status !== 'running' && store.status !== 'paused')) {
      return;
    }
    const config: DebugConfig = {
      breakpoints: Object.keys(store.breakpoints),
      conditions: store.conditions,
      mocks: store.mocks,
    };
    void api.debugUpdate(store.activeExecutionId, config).catch(() => {
      // The session may have just ended; hot update is best-effort.
    });
  }, []);

  const handleToggleBreakpoint = (nodeId: string) => {
    toggleBreakpoint(nodeId);
    window.setTimeout(pushLiveConfig, 0);
  };

  const handleConditionChange = (nodeId: string, expression: string) => {
    setCondition(nodeId, expression);
    window.setTimeout(pushLiveConfig, 0);
  };

  const handleApplyMock = () => {
    if (!mockNodeId) return;
    let output: Record<string, unknown>;
    try {
      output = mockOutputText.trim() ? JSON.parse(mockOutputText) : {};
    } catch {
      setError(t('run.invalidJson'));
      return;
    }
    setError(null);
    const mock: NodeMock = { output };
    const branch = mockBranch.trim();
    if (branch) mock.branch = branch;
    setMock(mockNodeId, mock);
    window.setTimeout(pushLiveConfig, 0);
  };

  const handleRemoveMock = (nodeId: string) => {
    removeMock(nodeId);
    window.setTimeout(pushLiveConfig, 0);
  };

  const handleStart = async () => {
    if (busy || active) return;
    setError(null);
    let input: Record<string, unknown>;
    try {
      input = inputText.trim() ? JSON.parse(inputText) : {};
    } catch {
      setError(t('run.invalidJson'));
      return;
    }
    setBusy(true);
    setResult(null);
    resetNodeStatus();
    try {
      await onBeforeRun();
      const config: DebugConfig = {
        breakpoints: Object.keys(breakpoints),
        conditions,
        mocks,
        pauseOnStart,
      };
      // Debug runs are always async: the server enqueues the run and the
      // SSE stream (above) delivers pause / resume / finished events.
      const execution = await api.startDebug(workflowId, input, config);
      startSession(execution.id);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setBusy(false);
    }
  };

  const handleStep = async () => {
    if (!activeExecutionId) return;
    try {
      await api.debugStep(activeExecutionId);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    }
  };

  const handleContinue = async () => {
    if (!activeExecutionId) return;
    try {
      await api.debugContinue(activeExecutionId);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    }
  };

  const handleStop = async () => {
    if (!activeExecutionId) return;
    try {
      await api.debugStop(activeExecutionId);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    }
  };

  const mockNodeOptions = nodes.map((node) => ({
    value: node.id,
    label: node.title,
    description: node.id,
    icon: NODE_ICONS[node.type] ?? null,
  }));

  const mockEntries = Object.entries(mocks);
  const breakpointCount = Object.keys(breakpoints).length;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex max-h-[75vh] flex-col rounded-t-2xl border border-gray-200 bg-gray-50 shadow-2xl md:absolute md:inset-auto md:right-4 md:top-4 md:bottom-4 md:w-[380px] md:max-h-none md:rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setTab('debug')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
              tab === 'debug' ? 'bg-blue-600 font-semibold text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Bug size={12} />
            {t('debug.tabDebug')}
          </button>
          <button
            type="button"
            onClick={() => setTab('variables')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
              tab === 'variables' ? 'bg-blue-600 font-semibold text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Braces size={12} />
            {t('debug.tabVariables')}
          </button>
          <button
            type="button"
            onClick={() => setTab('overrides')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
              tab === 'overrides' ? 'bg-blue-600 font-semibold text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <CircleDot size={12} />
            {t('debug.tabOverrides')}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-800"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {tab === 'debug' && (
          <>
            <div className="flex items-center justify-between">
              <StatusBadge status={status} />
              {pausedNode && (
                <span className="flex items-center gap-1.5 text-[11px] text-amber-300">
                  <PauseCircle size={12} />
                  {t('debug.pausedAt')} <span className="font-mono">{pausedNode.nodeId}</span>
                  <span className="text-gray-400">·</span>
                  {t('debug.stepCount', { step: pausedNode.step })}
                </span>
              )}
            </div>

            {!active && (
              <>
                <div>
                  <SectionLabel>{t('debug.input')}</SectionLabel>
                  <textarea
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    rows={4}
                    spellCheck={false}
                    disabled={busy}
                    className="w-full resize-y rounded-md border border-gray-200 bg-white p-2.5 font-mono text-xs text-gray-800 outline-none transition-colors focus:border-gray-400 disabled:opacity-50"
                  />
                </div>
                <label className="flex cursor-pointer items-center justify-between gap-2 text-[11px] text-gray-700">
                  <span>{t('debug.pauseOnStart')}</span>
                  <input
                    type="checkbox"
                    checked={pauseOnStart}
                    onChange={(event) => setPauseOnStart(event.target.checked)}
                    disabled={busy}
                    className="h-3.5 w-3.5 accent-blue-500"
                  />
                </label>
                <p className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[10px] leading-relaxed text-gray-400">
                  {t('debug.startHint')}
                </p>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Bug size={14} />}
                  {t('debug.start')}
                </button>
              </>
            )}

            {active && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleStep}
                  disabled={status !== 'paused'}
                  title={t('debug.step')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-600 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                >
                  <StepForward size={14} />
                  {t('debug.step')}
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={status !== 'paused'}
                  title={t('debug.continue')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 py-2.5 text-xs font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:text-gray-900 disabled:opacity-40"
                >
                  <SkipForward size={14} />
                  {t('debug.continue')}
                </button>
                <button
                  type="button"
                  onClick={handleStop}
                  title={t('debug.stop')}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2.5 text-xs font-semibold text-gray-800 transition-colors hover:border-red-400 hover:text-red-300"
                >
                  <Square size={13} />
                  {t('debug.stop')}
                </button>
              </div>
            )}

            {active && status === 'running' && !pausedNode && (
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-[11px] text-gray-500">
                <Loader2 size={13} className="animate-spin" />
                {t('debug.notPaused')}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-gray-300 bg-gray-100 p-3 text-xs text-gray-800">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span className="break-all">{error}</span>
              </div>
            )}

            {result && (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <StatusBadge status="finished" />
                  <span className="font-mono text-[11px]">{result.durationMs}ms</span>
                </div>
                <div>
                  <SectionLabel>{t('debug.result')}</SectionLabel>
                  <JsonBlock value={result.output ?? {}} />
                </div>
              </>
            )}
          </>
        )}

        {tab === 'variables' &&
          (snapshot ? (
            <>
              <div>
                <SectionLabel>{t('debug.workflowInput')}</SectionLabel>
                <JsonBlock value={snapshot.input} />
              </div>
              <div>
                <SectionLabel>{t('debug.variables')}</SectionLabel>
                <JsonBlock value={snapshot.variables} />
              </div>
              <div>
                <SectionLabel>{t('debug.nodeOutputs')}</SectionLabel>
                {Object.keys(snapshot.outputs).length === 0 ? (
                  <div className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-[11px] text-gray-400">
                    —
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(snapshot.outputs).map(([nodeId, value]) => (
                      <OutputRow key={nodeId} nodeId={nodeId} value={value} />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-xs leading-relaxed text-gray-400">
              {t('debug.noSnapshot')}
            </div>
          ))}

        {tab === 'overrides' && (
          <>
            <div>
              <SectionLabel>
                {t('debug.breakpoints')}
                {breakpointCount > 0 && <span className="ml-1.5 font-mono text-gray-400">{breakpointCount}</span>}
              </SectionLabel>
              {nodes.length === 0 ? (
                <div className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-[11px] text-gray-400">
                  {t('debug.noBreakpoints')}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {nodes.map((node) => {
                    const enabled = Boolean(breakpoints[node.id]);
                    return (
                      <div
                        key={node.id}
                        className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 transition-colors hover:border-gray-300"
                      >
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => handleToggleBreakpoint(node.id)}
                            className="h-3.5 w-3.5 accent-red-500"
                          />
                          <span className="flex h-4 w-4 items-center justify-center text-gray-500">
                            {NODE_ICONS[node.type] ?? null}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[11px] text-gray-800">{node.title}</span>
                          <span className="truncate font-mono text-[10px] text-gray-400">{node.id}</span>
                        </label>
                        {enabled && (
                          <input
                            value={conditions[node.id] ?? ''}
                            onChange={(event) => handleConditionChange(node.id, event.target.value)}
                            spellCheck={false}
                            placeholder={t('debug.conditionPlaceholder')}
                            className="mt-1.5 w-full rounded-md border border-gray-200 bg-gray-100 px-2 py-1.5 font-mono text-[10px] text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {breakpointCount === 0 && nodes.length > 0 && (
                <p className="mt-1.5 text-[10px] leading-relaxed text-gray-400">{t('debug.noBreakpoints')}</p>
              )}
            </div>

            <div>
              <SectionLabel>
                {t('debug.mocks')}
                {mockEntries.length > 0 && <span className="ml-1.5 font-mono text-gray-400">{mockEntries.length}</span>}
              </SectionLabel>
              <p className="mb-2 text-[10px] leading-relaxed text-gray-400">{t('debug.mockHint')}</p>

              <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-2.5">
                <div>
                  <div className="mb-1 text-[10px] text-gray-400">{t('debug.mockNode')}</div>
                  <Select
                    value={mockNodeId}
                    onChange={setMockNodeId}
                    options={mockNodeOptions}
                    placeholder={t('debug.mockNode')}
                    className="w-full rounded-md border border-gray-200 bg-gray-100 px-2.5 py-2 text-xs text-gray-800"
                  />
                </div>
                <div>
                  <div className="mb-1 text-[10px] text-gray-400">{t('debug.mockOutput')}</div>
                  <textarea
                    value={mockOutputText}
                    onChange={(event) => setMockOutputText(event.target.value)}
                    rows={3}
                    spellCheck={false}
                    className="w-full resize-y rounded-md border border-gray-200 bg-gray-100 p-2 font-mono text-[11px] text-gray-800 outline-none transition-colors focus:border-gray-400"
                  />
                </div>
                <div>
                  <div className="mb-1 text-[10px] text-gray-400">{t('debug.mockBranch')}</div>
                  <input
                    value={mockBranch}
                    onChange={(event) => setMockBranch(event.target.value)}
                    spellCheck={false}
                    placeholder="case_1"
                    className="w-full rounded-md border border-gray-200 bg-gray-100 px-2.5 py-2 font-mono text-[11px] text-gray-800 outline-none transition-colors focus:border-gray-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyMock}
                  disabled={!mockNodeId}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 py-2 text-[11px] font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:text-gray-900 disabled:opacity-40"
                >
                  <FlaskConical size={12} />
                  {t('debug.addMock')}
                </button>
              </div>

              {mockEntries.length > 0 && (
                <div className="mt-2">
                  <div className="mb-1 text-[10px] text-gray-400">{t('debug.mockApplied')}</div>
                  <div className="space-y-1">
                    {mockEntries.map(([nodeId, mock]) => (
                      <div
                        key={nodeId}
                        className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5"
                      >
                        <FlaskConical size={12} className="shrink-0 text-gray-500" />
                        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-gray-800">{nodeId}</span>
                        {mock.branch && (
                          <span className="rounded border border-gray-200 px-1 py-0.5 font-mono text-[9px] text-gray-500">
                            {mock.branch}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMock(nodeId)}
                          title={t('common.delete')}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-300"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer hint: play glyph keeps the drawer discoverable as a run tool. */}
      <div className="flex items-center gap-1.5 border-t border-gray-200 px-4 py-2 text-[10px] text-gray-400">
        <Play size={10} />
        {t('debug.title')} · {workflowId.slice(0, 8)}
      </div>
    </div>
  );
}

/** Re-export for stories/tests that need the snapshot typing. */
export type { DebugSnapshot };
