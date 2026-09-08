import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  EditorRenderer,
  FreeLayoutEditorProvider,
  FreeLayoutPluginContext,
} from '@flowgram.ai/free-layout-editor';
import '@flowgram.ai/free-layout-editor/index.css';
import {
  ArrowLeft,
  Bot,
  Bug,
  Check,
  Download,
  Loader2,
  MessageSquare,
  Play,
  Save,
  Workflow as WorkflowIcon,
  Zap,
} from 'lucide-react';
import { api } from '../api/client';
import type { Workflow, WorkflowDefinition } from '../types';
import { useEditorProps } from '../editor/use-editor-props';
import { defaultDefinition } from '../editor/initial-data';
import { EditorContext } from '../editor/EditorContext';
import NodePanel from '../editor/NodePanel';
import CanvasTools from '../editor/CanvasTools';
import PropertyPanel from '../editor/PropertyPanel';
import ContextMenu from '../editor/ContextMenu';
import NodeShortcuts from '../editor/NodeShortcuts';
import RunPanel from '../editor/RunPanel';
import DebugPanel from '../editor/DebugPanel';
import TriggerPanel from '../editor/TriggerPanel';
import WorkflowChatPanel from '../editor/WorkflowChatPanel';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserMenu from '../components/UserMenu';
import { downloadWorkflow } from '../utils/workflow-file';

function EditorShell({ workflow }: { workflow: Workflow }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ref = useRef<FreeLayoutPluginContext | undefined>(undefined);
  const editorProps = useEditorProps(workflow.definition ?? defaultDefinition());
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  /** Only one side drawer is visible at a time. */
  const [drawer, setDrawer] = useState<'none' | 'run' | 'debug' | 'triggers' | 'chat'>('none');

  const save = useCallback(async () => {
    const document = ref.current?.document;
    if (!document) return;
    setSaving(true);
    try {
      const definition = document.toJSON() as unknown as WorkflowDefinition;
      await api.updateWorkflow(workflow.id, { definition });
      setSavedTick(true);
      window.setTimeout(() => setSavedTick(false), 1500);
    } finally {
      setSaving(false);
    }
  }, [workflow.id]);

  const handlePublishAgent = useCallback(async () => {
    if (publishing) return;
    setPublishing(true);
    try {
      await save();
      const agent = await api.createAgent({
        workflowId: workflow.id,
        name: workflow.name,
        description: workflow.description,
        status: 'published',
      });
      navigate(`/chat?agentId=${agent.id}`);
    } finally {
      setPublishing(false);
    }
  }, [navigate, publishing, save, workflow.description, workflow.id, workflow.name]);

  /** Cmd/Ctrl+S keyboard save. */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  const editorContextValue = {
    getDefinition: () =>
      (ref.current?.document?.toJSON() as unknown as WorkflowDefinition) ?? workflow.definition,
  };

  return (
    <FreeLayoutEditorProvider {...editorProps} ref={ref as any}>
      <EditorContext.Provider value={editorContextValue}>
      <div className="flex h-screen flex-col bg-gray-50">
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              to="/console"
              title={t('common.back')}
              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100">
              <WorkflowIcon size={14} className="text-gray-900" />
            </div>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
              {workflow.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <UserMenu />
            <button
              type="button"
              onClick={async () => {
                await save();
                downloadWorkflow(await api.exportWorkflow(workflow.id));
              }}
              title={t('workflows.export')}
              className="hidden rounded-md border border-gray-200 p-1.5 text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 sm:inline-flex"
            >
              <Download size={14} />
            </button>
            <button
              type="button"
              onClick={() => setDrawer((value) => (value === 'triggers' ? 'none' : 'triggers'))}
              title={t('triggers.title')}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                drawer === 'triggers'
                  ? 'border-gray-400 bg-gray-200 text-gray-900'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <Zap size={14} />
              <span className="hidden sm:inline">{t('triggers.title')}</span>
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-800 transition-colors hover:border-gray-300 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : savedTick ? (
                <Check size={13} />
              ) : (
                <Save size={13} />
              )}
              <span className="hidden sm:inline">
                {saving ? t('common.saving') : savedTick ? t('common.saved') : t('common.save')}
              </span>
            </button>
            <button
              type="button"
              onClick={handlePublishAgent}
              disabled={publishing || saving}
              title={t('agents.publishFromWorkflow')}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-800 transition-colors hover:border-gray-300 disabled:opacity-50"
            >
              {publishing ? <Loader2 size={13} className="animate-spin" /> : <Bot size={13} />}
              <span className="hidden sm:inline">
                {publishing ? t('agents.publishing') : t('agents.publish')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDrawer((value) => (value === 'chat' ? 'none' : 'chat'))}
              title="调试对话"
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                drawer === 'chat'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <MessageSquare size={14} />
              <span className="hidden sm:inline">调试对话</span>
            </button>
            <button
              type="button"
              onClick={() => setDrawer((value) => (value === 'debug' ? 'none' : 'debug'))}
              title={t('debug.title')}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                drawer === 'debug'
                  ? 'border-gray-400 bg-gray-200 text-gray-900'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <Bug size={14} />
              <span className="hidden sm:inline">{t('debug.title')}</span>
            </button>
            <button
              type="button"
              onClick={() => setDrawer((value) => (value === 'run' ? 'none' : 'run'))}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85"
            >
              <Play size={13} />
              <span className="hidden sm:inline">{t('common.run')}</span>
            </button>
          </div>
        </header>

        {/* Workspace: node panel + canvas + property panel */}
        <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
          <NodePanel />
          <div className="sf-editor-container">
            <EditorRenderer className="sf-editor" />
            <CanvasTools />
          </div>
          <PropertyPanel />
          <ContextMenu />
          <NodeShortcuts />
          {drawer === 'run' && (
            <RunPanel
              workflowId={workflow.id}
              definition={
                (ref.current?.document?.toJSON() as unknown as WorkflowDefinition) ??
                workflow.definition
              }
              onBeforeRun={save}
              onClose={() => setDrawer('none')}
            />
          )}
          {drawer === 'debug' && (
            <DebugPanel
              workflowId={workflow.id}
              definition={
                (ref.current?.document?.toJSON() as unknown as WorkflowDefinition) ??
                workflow.definition
              }
              onBeforeRun={save}
              onClose={() => setDrawer('none')}
            />
          )}
          {drawer === 'triggers' && (
            <TriggerPanel
              workflowId={workflow.id}
              onBeforeMutate={save}
              onClose={() => setDrawer('none')}
            />
          )}
          {drawer === 'chat' && (
            <WorkflowChatPanel
              workflowId={workflow.id}
              definition={
                (ref.current?.document?.toJSON() as unknown as WorkflowDefinition) ??
                workflow.definition
              }
              onBeforeRun={save}
              onClose={() => setDrawer('none')}
            />
          )}
        </div>
      </div>
      </EditorContext.Provider>
    </FreeLayoutEditorProvider>
  );
}

/**
 * Editor page: loads the workflow then mounts the FlowGram canvas.
 */
export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getWorkflow(id)
      .then(setWorkflow)
      .catch((err) => setError(String(err?.message ?? err)));
  }, [id]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-gray-50 text-gray-700">
        <p className="text-sm">{error}</p>
        <Link to="/" className="text-xs text-gray-400 underline hover:text-gray-800">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 bg-gray-50 text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">{t('common.loading')}</span>
      </div>
    );
  }

  return <EditorShell workflow={workflow} />;
}
