import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bot, Braces, Loader2, Save, Sparkles, Workflow } from 'lucide-react';
import { api } from '../api/client';
import type { WorkflowDraft } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserMenu from '../components/UserMenu';

function summarize(definition: WorkflowDraft['definition'] | null): string[] {
  if (!definition) return [];
  return (definition.nodes as Array<any>)
    .filter((node) => node?.id)
    .map((node) => `${node.id} (${node.type ?? 'unknown'})`);
}

export default function AiBuilderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(t('aiBuilder.defaultPrompt'));
  const [draft, setDraft] = useState<WorkflowDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nodeSummary = useMemo(() => summarize(draft?.definition ?? null), [draft]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      setDraft(await api.generateWorkflowDraft(prompt.trim()));
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!draft || saving) return;
    setSaving(true);
    setError(null);
    try {
      const workflow = await api.createWorkflow({
        name: draft.name,
        description: draft.description,
        definition: draft.definition,
      });
      navigate(`/workflows/${workflow.id}`);
    } catch (err: any) {
      setError(String(err?.message ?? err));
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/console" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900">
              <ArrowLeft size={16} />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
              <Sparkles size={17} className="text-gray-900" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">{t('aiBuilder.title')}</h1>
              <p className="hidden text-xs text-gray-500 sm:block">{t('aiBuilder.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Bot size={16} />
            {t('aiBuilder.chatTitle')}
          </div>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={10}
            spellCheck={false}
            className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400"
            placeholder={t('aiBuilder.promptPlaceholder')}
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? t('aiBuilder.generating') : t('aiBuilder.generate')}
          </button>
          {error && (
            <div className="mt-3 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-800">
              {error}
            </div>
          )}
        </section>

        <section className="min-h-[520px] min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
          {!draft ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-400">
              <Workflow size={34} />
              <p className="text-sm">{t('aiBuilder.emptyPreview')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{draft.name}</h2>
                    <span className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] uppercase text-gray-500">
                      {draft.source}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-500">{draft.description}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {t('aiBuilder.save')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">{t('aiBuilder.nodes')}</div>
                  <div className="mt-1 text-xl font-semibold text-gray-900">{draft.definition.nodes.length}</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">{t('aiBuilder.edges')}</div>
                  <div className="mt-1 text-xl font-semibold text-gray-900">{draft.definition.edges.length}</div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold text-gray-500">{t('aiBuilder.nodeChain')}</div>
                <div className="space-y-1.5">
                  {nodeSummary.map((item) => (
                    <div key={item} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-[11px] text-gray-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <details className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700">
                  <Braces size={13} />
                  {t('aiBuilder.jsonPreview')}
                </summary>
                <pre className="max-h-80 overflow-auto border-t border-gray-200 p-3 font-mono text-[11px] leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
                  {JSON.stringify(draft.definition, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
