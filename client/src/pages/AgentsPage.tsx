import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bot, Loader2, MessageSquare, Plus, Save, Trash2, X } from 'lucide-react';
import { api } from '../api/client';
import type { Agent, AgentStatus, Workflow } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserMenu from '../components/UserMenu';
import Select from '../components/Select';
import { confirmDialog } from '../components/ConfirmDialog';

export default function AgentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [saving, setSaving] = useState(false);
  const [workflowId, setWorkflowId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [status, setStatus] = useState<AgentStatus>('published');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [agentItems, workflowItems] = await Promise.all([api.listAgents(), api.listWorkflows()]);
      setAgents(agentItems);
      setWorkflows(workflowItems);
      if (!workflowId && workflowItems[0]) setWorkflowId(workflowItems[0].id);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setWorkflowId(workflows[0]?.id ?? '');
    setName('');
    setDescription('');
    setSystemPrompt('');
    setStatus('published');
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEdit = (agent: Agent) => {
    setEditing(agent);
    setWorkflowId(agent.workflowId);
    setName(agent.name);
    setDescription(agent.description);
    setSystemPrompt(agent.systemPrompt);
    setStatus(agent.status);
    setShowCreate(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || (!editing && !workflowId)) return;
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const updated = await api.updateAgent(editing.id, { name, description, systemPrompt, status });
        setAgents((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await api.createAgent({ workflowId, name, description, systemPrompt, status });
        setAgents((items) => [created, ...items]);
      }
      setShowCreate(false);
      resetForm();
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmDialog(t('agents.deleteConfirm')))) return;
    await api.deleteAgent(id);
    setAgents((items) => items.filter((item) => item.id !== id));
  };

  const workflowOptions = workflows.map((workflow) => ({
    value: workflow.id,
    label: workflow.name,
    description: workflow.description || workflow.id,
  }));

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/console" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900">
              <ArrowLeft size={16} />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
              <Bot size={17} className="text-gray-900" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">{t('agents.title')}</h1>
              <p className="hidden text-xs text-gray-500 sm:block">{t('agents.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <UserMenu />
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">{t('agents.create')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {error && <div className="mb-4 rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-800">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">{t('common.loading')}</span>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Bot size={34} className="text-gray-400" />
            <p className="text-sm text-gray-500">{t('agents.empty')}</p>
            <button type="button" onClick={openCreate} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              {t('agents.create')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div key={agent.id} className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-100">
                    <Bot size={16} className="text-gray-800" />
                  </div>
                  <span className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500">{t(`agents.status.${agent.status}` as any)}</span>
                </div>
                <h2 className="mb-1 truncate text-sm font-semibold text-gray-900">{agent.name}</h2>
                <p className="mb-4 line-clamp-2 min-h-[2rem] text-xs leading-relaxed text-gray-500">{agent.description || '-'}</p>
                <div className="mb-4 truncate font-mono text-[10px] text-gray-400">{agent.workflowId}</div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/chat?agentId=${agent.id}`)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85"
                  >
                    <MessageSquare size={13} />
                    {t('agents.chat')}
                  </button>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(agent)} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900">
                      <Save size={13} />
                    </button>
                    <button type="button" onClick={() => handleDelete(agent.id)} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setShowCreate(false)}>
          <form onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{editing ? t('agents.edit') : t('agents.create')}</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-800">
                <X size={16} />
              </button>
            </div>
            {!editing && (
              <div className="mb-4">
                <label className="mb-1.5 block text-xs text-gray-500">{t('agents.workflow')}</label>
                <Select value={workflowId} onChange={setWorkflowId} options={workflowOptions} placeholder={t('agents.workflow')} className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900" />
              </div>
            )}
            <label className="mb-1.5 block text-xs text-gray-500">{t('agents.name')}</label>
            <input value={name} onChange={(event) => setName(event.target.value)} className="mb-4 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400" />
            <label className="mb-1.5 block text-xs text-gray-500">{t('agents.description')}</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="mb-4 w-full resize-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400" />
            <label className="mb-1.5 block text-xs text-gray-500">{t('agents.systemPrompt')}</label>
            <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={3} className="mb-4 w-full resize-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400" />
            <label className="mb-1.5 block text-xs text-gray-500">{t('agents.statusLabel')}</label>
            <Select
              value={status}
              onChange={(value) => setStatus(value as AgentStatus)}
              options={['published', 'draft', 'archived'].map((value) => ({ value, label: t(`agents.status.${value}` as any) }))}
              className="mb-6 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-md border border-gray-200 px-4 py-2 text-xs text-gray-700 hover:border-gray-300">{t('common.cancel')}</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
