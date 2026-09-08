import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  BadgeCheck,
  Cpu,
  KeyRound,
  Loader2,
  Pencil,
  Plug,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import type { ModelConfig, ModelTestResult } from '../types';
import { refreshModels } from '../hooks/useModels';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { confirmDialog } from '../components/ConfirmDialog';
import Select, { type SelectOption } from '../components/Select';
import {
  CUSTOM_PROVIDER_ID,
  DEFAULT_PRESET_ID,
  MODEL_PRESETS,
  PRESET_NAMES,
  findPreset,
  findPresetByBaseUrl,
} from '../data/model-presets';

/** Sentinel option value that switches the model field to free-text input. */
const CUSTOM_MODEL_VALUE = '__custom__';

interface FormState {
  name: string;
  model: string;
  baseUrl: string;
  apiKey: string;
  temperature: string;
  type: 'llm' | 'embedding';
  isDefault: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  model: '',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  temperature: '',
  type: 'llm',
  isDefault: false,
};

/**
 * Model provider settings: manage OpenAI-compatible endpoints and API keys,
 * pick the default provider and test connectivity online.
 */
export default function ModelsPage() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language?.toLowerCase().startsWith('zh') ?? true;
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ModelConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [providerId, setProviderId] = useState<string>(DEFAULT_PRESET_ID);
  /** When true the model field is a free-text input instead of the preset picker. */
  const [modelCustom, setModelCustom] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ModelTestResult>>({});

  const load = async () => {
    setLoading(true);
    try {
      setModels(await api.listModels());
      setError(null);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    const preset = findPreset(DEFAULT_PRESET_ID);
    setProviderId(DEFAULT_PRESET_ID);
    setModelCustom(false);
    setForm({
      ...EMPTY_FORM,
      name: preset?.name ?? '',
      baseUrl: preset?.baseUrl ?? EMPTY_FORM.baseUrl,
      model: preset?.defaultModel ?? '',
    });
    setShowForm(true);
  };

  const openEdit = (model: ModelConfig) => {
    setEditing(model);
    const preset = findPresetByBaseUrl(model.baseUrl);
    setProviderId(preset?.id ?? CUSTOM_PROVIDER_ID);
    // Fall back to free-text when the stored model is not in the preset list.
    setModelCustom(!preset || !preset.models.some((m) => m.id === model.model));
    setForm({
      name: model.name,
      model: model.model,
      baseUrl: model.baseUrl,
      apiKey: '',
      temperature: model.temperature != null ? String(model.temperature) : '',
      type: (model as any).type ?? 'llm',
      isDefault: model.isDefault,
    });
    setShowForm(true);
  };

  /**
   * Choosing a provider preset auto-fills the Base URL and model so the user
   * only has to paste an API key. The name is only overwritten while creating
   * and only when it is still untouched (empty or a preset name), so a
   * hand-written config name is never clobbered.
   */
  const handleProviderChange = (id: string) => {
    setProviderId(id);
    const preset = findPreset(id);
    if (!preset) {
      // custom provider: everything is typed by hand
      setModelCustom(true);
      return;
    }
    setModelCustom(false);
    setForm((prev) => ({
      ...prev,
      baseUrl: preset.baseUrl,
      model: preset.defaultModel,
      name:
        !editing && (prev.name === '' || PRESET_NAMES.has(prev.name))
          ? preset.name
          : prev.name,
    }));
  };

  /** Model picker handler: the sentinel value switches to free-text input. */
  const handleModelChange = (value: string) => {
    if (value === CUSTOM_MODEL_VALUE) {
      setModelCustom(true);
      return;
    }
    setModelCustom(false);
    setForm((prev) => ({ ...prev, model: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || !form.name.trim() || !form.model.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        model: form.model.trim(),
        baseUrl: form.baseUrl.trim(),
        apiKey: form.apiKey.trim(),
        type: form.type,
        isDefault: form.isDefault,
        ...(form.temperature.trim() !== ''
          ? { temperature: Number(form.temperature) }
          : {}),
      };
      if (editing) {
        await api.updateModel(editing.id, payload);
      } else {
        await api.createModel(payload);
      }
      setShowForm(false);
      await load();
      refreshModels();
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmDialog(t('models.deleteConfirm')))) return;
    await api.deleteModel(id);
    await load();
    refreshModels();
  };

  const handleSetDefault = async (id: string) => {
    await api.setDefaultModel(id);
    await load();
    refreshModels();
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const result = await api.testModel(id);
      setTestResults((prev) => ({ ...prev, [id]: result }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [id]: { ok: false, error: String(err?.message ?? err) },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const inputClass =
    'w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400';

  // Provider dropdown: built-in presets first, then a free-text "custom" entry.
  const providerOptions: SelectOption[] = [
    ...MODEL_PRESETS.map((preset) => ({ value: preset.id, label: preset.name })),
    { value: CUSTOM_PROVIDER_ID, label: t('models.providerCustom') },
  ];

  // Model dropdown: the active preset's catalogue with rich metadata
  // (capability tag + context window + positioning note), plus a sentinel
  // option that switches to free-text input for models not yet listed.
  const activePreset = findPreset(providerId);
  const modelOptions: SelectOption[] = activePreset
    ? [
        ...activePreset.models.map((model) => ({
          value: model.id,
          label: model.id,
          description: isZh ? model.desc.zh : model.desc.en,
          tag: model.tag ? (isZh ? model.tag.zh : model.tag.en) : undefined,
          badge: model.context,
        })),
        {
          value: CUSTOM_MODEL_VALUE,
          label: t('models.modelCustom'),
          description: t('models.modelCustomDesc'),
        },
      ]
    : [];

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/console"
              title={t('common.back')}
              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
              <Cpu size={18} className="text-gray-900" />
            </div>
            <h1 className="text-base font-semibold text-gray-900">{t('models.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">{t('models.create')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        <p className="mb-4 text-xs leading-relaxed text-gray-400">{t('models.hint')}</p>
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
        ) : models.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100">
              <KeyRound size={26} className="text-gray-500" />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-gray-500">
              {t('models.emptyHint')}
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              <Plus size={16} />
              {t('models.create')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {models.map((model) => {
              const result = testResults[model.id];
              return (
                <div
                  key={model.id}
                  className="animate-fade-in rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-gray-900">
                          {model.name}
                        </h2>
                        {model.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-800">
                            <BadgeCheck size={11} />
                            {t('models.default')}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-gray-400">
                        <span>{model.model}</span>
                        <span className="break-all">{model.baseUrl}</span>
                        <span>{model.hasKey ? model.maskedKey : t('models.noKey')}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title={t('models.test')}
                        disabled={testingId === model.id}
                        onClick={() => handleTest(model.id)}
                        className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50"
                      >
                        {testingId === model.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Plug size={14} />
                        )}
                      </button>
                      {!model.isDefault && (
                        <button
                          type="button"
                          title={t('models.setDefault')}
                          onClick={() => handleSetDefault(model.id)}
                          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
                        >
                          <Star size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        title={t('common.save')}
                        onClick={() => openEdit(model)}
                        className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        title={t('common.delete')}
                        onClick={() => handleDelete(model.id)}
                        className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {result && (
                    <div
                      className={`mt-3 rounded-md border px-3 py-2 text-[11px] leading-relaxed ${
                        result.ok
                          ? 'border-gray-300 bg-gray-100 text-gray-800'
                          : 'border-gray-200 bg-gray-100 text-gray-500'
                      }`}
                    >
                      {result.ok
                        ? `${t('models.testOk')} · ${result.model} · ${result.latencyMs}ms · ${result.text ?? ''}`
                        : `${t('models.testFail')}: ${result.error}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setShowForm(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md animate-slide-up rounded-xl border border-gray-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {editing ? t('models.edit') : t('models.create')}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-800"
              >
                <X size={16} />
              </button>
            </div>

            <label className="mb-1.5 block text-xs text-gray-500">
              {t('models.provider')}
            </label>
            <Select
              value={providerId}
              onChange={handleProviderChange}
              options={providerOptions}
              className={`mb-4 ${inputClass}`}
            />

            <label className="mb-1.5 block text-xs text-gray-500">{t('models.name')}</label>
            <input
              autoFocus
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="OpenAI / DeepSeek / Moonshot ..."
              className={`mb-4 ${inputClass}`}
            />

            <label className="mb-1.5 block text-xs text-gray-500">{t('models.model')}</label>
            {activePreset && !modelCustom ? (
              <Select
                value={form.model}
                onChange={handleModelChange}
                options={modelOptions}
                placeholder={t('models.modelPlaceholder')}
                className={`mb-1 ${inputClass}`}
              />
            ) : (
              <input
                value={form.model}
                onChange={(event) => setForm({ ...form, model: event.target.value })}
                placeholder="deepseek-v4-flash / gpt-5-mini ..."
                className={`mb-1 ${inputClass}`}
              />
            )}
            {activePreset && (
              <button
                type="button"
                onClick={() => {
                  if (modelCustom) {
                    setModelCustom(false);
                    setForm((prev) => ({ ...prev, model: activePreset.defaultModel }));
                  } else {
                    setModelCustom(true);
                  }
                }}
                className="mb-4 text-[11px] text-gray-400 underline-offset-2 transition-colors hover:text-gray-800 hover:underline"
              >
                {modelCustom ? t('models.backToPresets') : t('models.useCustomModel')}
              </button>
            )}
            {!activePreset && <div className="mb-4" />}

            <label className="mb-1.5 block text-xs text-gray-500">{t('models.baseUrl')}</label>
            <input
              value={form.baseUrl}
              onChange={(event) => setForm({ ...form, baseUrl: event.target.value })}
              placeholder="https://api.openai.com/v1"
              className={`mb-4 ${inputClass}`}
            />

            <label className="mb-1.5 block text-xs text-gray-500">{t('models.apiKey')}</label>
            <input
              type="password"
              value={form.apiKey}
              onChange={(event) => setForm({ ...form, apiKey: event.target.value })}
              placeholder={editing?.hasKey ? t('models.keepKey') : 'sk-...'}
              autoComplete="new-password"
              className={`mb-4 ${inputClass}`}
            />

            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-gray-500">
                {t('models.type')}
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'llm' | 'embedding' })}
                className={inputClass}
              >
                <option value="llm">{t('models.typeLlm')}</option>
                <option value="embedding">{t('models.typeEmbedding')}</option>
              </select>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs text-gray-500">
                  {t('models.temperature')}
                </label>
                <input
                  value={form.temperature}
                  onChange={(event) => setForm({ ...form, temperature: event.target.value })}
                  placeholder="0.7"
                  inputMode="decimal"
                  className={inputClass}
                />
              </div>
              <label className="mt-5 flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}
                  className="h-4 w-4 accent-blue-500"
                />
                {t('models.setDefault')}
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-xs text-gray-700 transition-colors hover:border-gray-300"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving || !form.name.trim() || !form.model.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {t('common.confirm')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
