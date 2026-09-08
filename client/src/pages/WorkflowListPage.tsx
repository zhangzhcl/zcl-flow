import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Workflow as WorkflowIcon,
  Plus,
  Trash2,
  Clock,
  Copy,
  Download,
  Loader2,
  Upload,
  X,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { api } from '../api/client';
import type { Workflow } from '../types';
import { useAuthStore } from '../store/auth';
import { getTemplates } from '../editor/templates';
import { downloadWorkflow, readWorkflowFile } from '../utils/workflow-file';
import { confirmDialog } from '../components/ConfirmDialog';

/**
 * Workflow list: responsive card grid with create / delete actions.
 */
export default function WorkflowListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('greeting');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const templates = getTemplates();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setWorkflows(await api.listWorkflows());
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (creating) return;
    const template = templates.find((item) => item.id === templateId) ?? templates[0];
    const workflowName = name.trim() || template.name;
    setCreating(true);
    try {
      const workflow = await api.createWorkflow({
        name: workflowName,
        description: description.trim() || template.description,
        definition: template.build(),
      });
      navigate(`/workflows/${workflow.id}`);
    } catch (err: any) {
      setError(String(err?.message ?? err));
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmDialog(t('workflows.deleteConfirm')))) return;
    await api.deleteWorkflow(id);
    setWorkflows((items) => items.filter((item) => item.id !== id));
  };

  const handleExport = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      downloadWorkflow(await api.exportWorkflow(id));
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const copy = await api.duplicateWorkflow(id);
      setWorkflows((items) => [copy, ...items]);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setBusyId(null);
    }
  };

  const handlePublishAgent = async (workflow: Workflow) => {
    setBusyId(workflow.id);
    setError(null);
    try {
      const agent = await api.createAgent({
        workflowId: workflow.id,
        name: workflow.name,
        description: workflow.description,
        status: 'published',
      });
      navigate(`/chat?agentId=${agent.id}`);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setBusyId(null);
    }
  };

  /** Reads the picked .json file and creates a workflow from it. */
  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const envelope = await readWorkflowFile(file);
      const workflow = await api.importWorkflow(envelope);
      navigate(`/workflows/${workflow.id}`);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language?.startsWith('zh') ? 'zh-CN' : 'en-US');

  return (
    <div className="flex min-h-full flex-col">
      {/* Slim top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/90 px-6 py-3 backdrop-blur">
        <h1 className="text-sm font-semibold text-gray-900">{t('workflows.nav')}</h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => handleImport(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            title={t('workflows.import')}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
          >
            <Upload size={14} />
            {t('workflows.import')}
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85"
          >
            <Plus size={14} />
            {t('workflows.create')}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-6">
        {error && (
          <div className="mb-4 rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">{t('common.loading')}</span>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100">
              <WorkflowIcon size={28} className="text-gray-500" />
            </div>
            <p className="text-sm text-gray-500">{t('workflows.emptyHint')}</p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              <Plus size={16} />
              {t('workflows.create')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="group relative animate-fade-in rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300"
              >
                <Link to={`/workflows/${workflow.id}`} className="block">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-100">
                      <WorkflowIcon size={16} className="text-gray-800" />
                    </div>
                    <ArrowRight
                      size={16}
                      className="mt-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                  <h2 className="mb-1 truncate text-sm font-semibold text-gray-900">
                    {workflow.name}
                  </h2>
                  <p className="mb-4 line-clamp-2 min-h-[2rem] text-xs leading-relaxed text-gray-500">
                    {workflow.description || '-'}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Clock size={12} />
                    <span>
                      {t('workflows.updatedAt')} {formatTime(workflow.updatedAt)}
                    </span>
                  </div>
                </Link>
                <div className="absolute bottom-3.5 right-3.5 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  {busyId === workflow.id ? (
                    <Loader2 size={14} className="m-1.5 animate-spin text-gray-500" />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handlePublishAgent(workflow)}
                        title={t('agents.publishFromWorkflow')}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-800"
                      >
                        <Bot size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport(workflow.id)}
                        title={t('workflows.export')}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-800"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(workflow.id)}
                        title={t('workflows.duplicate')}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-800"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(workflow.id)}
                        title={t('common.delete')}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-800"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create dialog */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setShowCreate(false)}
        >
          <form
            onSubmit={handleCreate}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md animate-slide-up rounded-xl border border-gray-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{t('workflows.create')}</h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-800"
              >
                <X size={16} />
              </button>
            </div>
            <label className="mb-1.5 block text-xs text-gray-500">
              {t('workflows.template')}
            </label>
            <div className="mb-4 grid max-h-52 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                    templateId === template.id
                      ? 'border-blue-500 bg-gray-200'
                      : 'border-gray-200 bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                      templateId === template.id
                        ? 'border-gray-400 bg-gray-100 text-gray-900'
                        : 'border-gray-300 bg-gray-200 text-gray-700'
                    }`}
                  >
                    {template.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-gray-900">
                      {template.name}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-snug text-gray-400">
                      {template.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <label className="mb-1.5 block text-xs text-gray-500">{t('workflows.name')}</label>
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={
                templates.find((item) => item.id === templateId)?.name ??
                t('workflows.namePlaceholder')
              }
              className="mb-4 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400"
            />
            <label className="mb-1.5 block text-xs text-gray-500">
              {t('workflows.description')}
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t('workflows.descriptionPlaceholder')}
              rows={3}
              className="mb-6 w-full resize-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-xs text-gray-700 transition-colors hover:border-gray-300"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {t('common.create')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
