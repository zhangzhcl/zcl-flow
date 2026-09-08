/**
 * Shared form control components used by both the right-side PropertyPanel
 * and the canvas-inline expanded node form.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Code2, Plus, Trash2, Upload, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { getNodeFormSchema, type NodeFieldSchema } from './node-form-schemas';
import { useModels } from '../hooks/useModels';
import { useWorkflows } from '../hooks/useWorkflows';
import { useKnowledgeBases } from '../hooks/useKnowledgeBases';
import Select, { type SelectOption } from '../components/Select';
import type { InputParam, OutputParam } from '../types';
import { VariablePicker } from './VariablePicker';

/**
 * Local-state mirror of a form value.
 *
 * FlowGram re-renders asynchronously after `setValueIn`, so a fully controlled
 * input would drop keystrokes. We keep a local string, push every change into
 * the node form immediately, and re-sync only when the external value changes
 * for reasons other than the user typing (undo/redo, programmatic updates).
 */
export function useFieldState(external: unknown) {
  const toStr = (value: unknown) =>
    value === undefined || value === null ? '' : String(value);
  const [local, setLocal] = useState(() => toStr(external));
  const externalStr = toStr(external);
  useEffect(() => {
    setLocal((prev) => (prev === externalStr ? prev : externalStr));
  }, [externalStr]);
  return [local, setLocal] as const;
}

export function ModelSelect({ value, onChange }: { value: unknown; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const models = useModels();
  const [local, setLocal] = useFieldState(value);
  const options: SelectOption[] = [
    { value: '', label: t('form.defaultModel') },
    ...models.map((model) => ({ value: model.id, label: model.name })),
  ];
  return (
    <Select
      value={local}
      onChange={(v) => {
        setLocal(v);
        onChange(v);
      }}
      options={options}
      className="sf-panel-input"
    />
  );
}

export function KnowledgeSelect({ value, onChange }: { value: unknown; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const kbs = useKnowledgeBases();
  const [local, setLocal] = useFieldState(value);
  const options: SelectOption[] = [
    { value: '', label: t('form.selectKnowledge') },
    ...kbs.map((kb) => ({ value: kb.id, label: kb.name })),
  ];
  return (
    <Select
      value={local}
      onChange={(v) => {
        setLocal(v);
        onChange(v);
      }}
      options={options}
      className="sf-panel-input"
    />
  );
}

export function WorkflowSelect({ value, onChange }: { value: unknown; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const workflows = useWorkflows();
  const [local, setLocal] = useFieldState(value);
  const options: SelectOption[] = [
    { value: '', label: t('form.selectWorkflow') },
    ...workflows.map((workflow) => ({ value: workflow.id, label: workflow.name })),
  ];
  return (
    <Select
      value={local}
      onChange={(v) => {
        setLocal(v);
        onChange(v);
      }}
      options={options}
      className="sf-panel-input"
    />
  );
}

export function FileUploadControl({
  field,
  value,
  onChange,
}: {
  field: NodeFieldSchema;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const { t } = useTranslation();
  const [local, setLocal] = useFieldState(value);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLocal(dataUrl);
      onChange(dataUrl);
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  const insertVar = (ref: string) => {
    const el = textRef.current;
    if (el) {
      const start = el.selectionStart ?? local.length;
      const end = el.selectionEnd ?? local.length;
      const next = local.slice(0, start) + ref + local.slice(end);
      setLocal(next);
      onChange(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + ref.length;
        el.focus();
      });
    } else {
      const next = local + ref;
      setLocal(next);
      onChange(next);
    }
  };

  const isDataUrl = local.startsWith('data:');

  return (
    <div className="space-y-1.5">
      <div className="mb-1 flex justify-end">
        <VariablePicker onInsert={insertVar} />
      </div>
      <div className="flex gap-1.5">
        <input
          ref={textRef}
          className="sf-panel-input flex-1"
          type="text"
          placeholder={field.placeholder}
          value={isDataUrl ? '' : local}
          onChange={(e) => {
            setLocal(e.target.value);
            onChange(e.target.value);
          }}
        />
        <button
          type="button"
          title={t('form.uploadFile')}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex shrink-0 items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <Upload size={12} />
          {uploading ? t('form.uploading') : t('form.upload')}
        </button>
      </div>
      {isDataUrl && (
        <div className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5">
          <span className="flex-1 truncate text-[11px] text-blue-600">{t('form.fileUploaded')}</span>
          <button
            type="button"
            onClick={() => { setLocal(''); onChange(''); }}
            className="text-blue-400 hover:text-blue-600"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={field.accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ── ClassifyCategoriesControl ──────────────────────────────────────────────────

interface ClassifyCategory {
  name: string;
  description: string;
  examples: string[];
}

function emptyCategory(): ClassifyCategory {
  return { name: '', description: '', examples: [] };
}

function parseCategories(raw: unknown): ClassifyCategory[] {
  if (Array.isArray(raw)) {
    return raw.map((item: any) => ({
      name: String(item?.name ?? ''),
      description: String(item?.description ?? ''),
      examples: Array.isArray(item?.examples) ? item.examples.map(String) : [],
    }));
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parseCategories(parsed);
    } catch {
      // ignore
    }
  }
  return [emptyCategory()];
}

function ClassifyCategoriesControl({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const { t } = useTranslation();
  const [cats, setCats] = useState<ClassifyCategory[]>(() => parseCategories(value));
  const [expanded, setExpanded] = useState<number | null>(0);

  const update = (next: ClassifyCategory[]) => {
    setCats(next);
    onChange(next);
  };

  const addCat = () => {
    const next = [...cats, emptyCategory()];
    update(next);
    setExpanded(next.length - 1);
  };

  const removeCat = (i: number) => {
    const next = cats.filter((_, j) => j !== i);
    update(next.length ? next : [emptyCategory()]);
    setExpanded(null);
  };

  const setCatField = (i: number, field: keyof ClassifyCategory, val: string | string[]) => {
    const next = cats.map((c, j) => (j === i ? { ...c, [field]: val } : c));
    update(next);
  };

  const addExample = (i: number) => {
    const next = cats.map((c, j) =>
      j === i ? { ...c, examples: [...c.examples, ''] } : c,
    );
    update(next);
  };

  const setExample = (catIdx: number, exIdx: number, val: string) => {
    const next = cats.map((c, j) =>
      j === catIdx
        ? { ...c, examples: c.examples.map((e, k) => (k === exIdx ? val : e)) }
        : c,
    );
    update(next);
  };

  const removeExample = (catIdx: number, exIdx: number) => {
    const next = cats.map((c, j) =>
      j === catIdx ? { ...c, examples: c.examples.filter((_, k) => k !== exIdx) } : c,
    );
    update(next);
  };

  return (
    <div className="space-y-2">
      {cats.map((cat, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50">
          {/* Category header */}
          <div
            className="flex cursor-pointer items-center gap-2 px-3 py-2"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <span className="flex-1 truncate text-xs font-medium text-gray-700">
              {cat.name || t('form.classifyCategoryNamePlaceholder', { n: i + 1 })}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeCat(i); }}
              className="shrink-0 rounded p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-400"
            >
              <X size={12} />
            </button>
          </div>

          {/* Expanded content */}
          {expanded === i && (
            <div className="space-y-2 border-t border-gray-200 px-3 pb-3 pt-2">
              <div>
                <label className="mb-0.5 block text-[10px] text-gray-500">
                  {t('form.classifyCategoryName')} *
                </label>
                <input
                  className="sf-panel-input text-xs"
                  maxLength={20}
                  value={cat.name}
                  placeholder={t('form.classifyCategoryNamePlaceholder', { n: i + 1 })}
                  onChange={(e) => setCatField(i, 'name', e.target.value)}
                />
                <span className="block text-right text-[10px] text-gray-400">{cat.name.length}/20</span>
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-gray-500">
                  {t('form.classifyCategoryDescription')}
                </label>
                <textarea
                  className="sf-panel-input text-xs"
                  rows={2}
                  value={cat.description}
                  placeholder={t('form.classifyCategoryDescPlaceholder')}
                  onChange={(e) => setCatField(i, 'description', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-gray-500">
                  {t('form.classifyCategoryExamples')}
                </label>
                <div className="space-y-1">
                  {cat.examples.map((ex, exIdx) => (
                    <div key={exIdx} className="flex items-center gap-1">
                      <input
                        className="sf-panel-input flex-1 text-xs"
                        value={ex}
                        placeholder={t('form.classifyExamplePlaceholder')}
                        onChange={(e) => setExample(i, exIdx, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeExample(i, exIdx)}
                        className="shrink-0 rounded p-0.5 text-gray-300 hover:text-red-400"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addExample(i)}
                    className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700"
                  >
                    <Plus size={11} />
                    {t('form.addExample')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addCat}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600"
      >
        <Plus size={13} />
        {t('form.addCategory')}
      </button>
    </div>
  );
}

/** Renders a single schema-driven control and writes changes into the form. */
export function FieldControl({
  field,
  value,
  onChange,
}: {
  field: NodeFieldSchema;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const { t } = useTranslation();
  const [local, setLocal] = useFieldState(value);
  const placeholder = field.placeholderKey ? t(field.placeholderKey) : field.placeholder;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (field.kind === 'file-upload') {
    return <FileUploadControl field={field} value={value} onChange={onChange} />;
  }
  if (field.kind === 'model') {
    return <ModelSelect value={value} onChange={(v) => onChange(v)} />;
  }
  if (field.kind === 'workflow') {
    return <WorkflowSelect value={value} onChange={(v) => onChange(v)} />;
  }
  if (field.kind === 'knowledge') {
    return <KnowledgeSelect value={value} onChange={(v) => onChange(v)} />;
  }
  if (field.kind === 'textarea') {
    const insertVar = (ref: string) => {
      const el = textareaRef.current;
      if (el) {
        const start = el.selectionStart ?? local.length;
        const end = el.selectionEnd ?? local.length;
        const next = local.slice(0, start) + ref + local.slice(end);
        setLocal(next);
        onChange(next);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + ref.length;
          el.focus();
        });
      } else {
        const next = local + ref;
        setLocal(next);
        onChange(next);
      }
    };
    return (
      <div>
        <div className="mb-1 flex justify-end">
          <VariablePicker onInsert={insertVar} />
        </div>
        <textarea
          ref={textareaRef}
          className="sf-panel-input"
          rows={field.rows ?? 3}
          placeholder={placeholder}
          value={local}
          onChange={(event) => {
            setLocal(event.target.value);
            onChange(event.target.value);
          }}
        />
      </div>
    );
  }
  if (field.kind === 'number') {
    return (
      <input
        className="sf-panel-input"
        type="number"
        placeholder={placeholder}
        value={local}
        onChange={(event) => {
          setLocal(event.target.value);
          onChange(event.target.value === '' ? undefined : Number(event.target.value));
        }}
      />
    );
  }
  if (field.kind === 'classify-categories') {
    return <ClassifyCategoriesControl value={value} onChange={onChange} />;
  }
  if (field.kind === 'select') {
    const options: SelectOption[] = (field.options ?? []).map((option) => ({
      value: option.value,
      label: option.labelKey ? t(option.labelKey) : option.label ?? option.value,
    }));
    return (
      <Select
        value={local}
        onChange={(v) => {
          setLocal(v);
          onChange(v);
        }}
        options={options}
        className="sf-panel-input"
      />
    );
  }
  return (
    <input
      className="sf-panel-input"
      type="text"
      placeholder={placeholder}
      value={local}
      onChange={(event) => {
        setLocal(event.target.value);
        onChange(event.target.value);
      }}
    />
  );
}

export const PARAM_TYPE_OPTIONS = [
  { value: 'text', labelKey: 'form.paramTypeText' },
  { value: 'number', labelKey: 'form.paramTypeNumber' },
  { value: 'image', labelKey: 'form.paramTypeImage' },
  { value: 'multimodal', labelKey: 'form.paramTypeMultimodal' },
] as const;

export function StartParamsEditor({
  data,
  setValue,
}: {
  data: Record<string, unknown>;
  setValue: (name: string, v: unknown) => void;
}) {
  const { t } = useTranslation();
  const params: InputParam[] = Array.isArray(data.inputParams) ? (data.inputParams as InputParam[]) : [];
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<InputParam['type']>('text');

  const addParam = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const updated: InputParam[] = [
      ...params,
      { name: trimmed, label: newLabel.trim() || trimmed, type: newType },
    ];
    setValue('inputParams', updated);
    setNewName('');
    setNewLabel('');
    setNewType('text');
    setAdding(false);
  };

  const removeParam = (index: number) => {
    setValue('inputParams', params.filter((_, i) => i !== index));
  };

  const typeBadgeClass = (type: InputParam['type']) => {
    if (type === 'image') return 'bg-purple-100 text-purple-700';
    if (type === 'multimodal') return 'bg-pink-100 text-pink-700';
    if (type === 'number') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  const typeOptions: SelectOption[] = PARAM_TYPE_OPTIONS.map((o) => ({
    value: o.value,
    label: t(o.labelKey),
  }));

  return (
    <>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {t('form.inputParams')}
      </div>
      {params.length === 0 && !adding && (
        <div className="sf-panel-empty-hint">{t('form.noInputParams')}</div>
      )}
      <div className="space-y-1.5">
        {params.map((param, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2"
          >
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${typeBadgeClass(param.type)}`}>
              {t(`form.paramType${param.type.charAt(0).toUpperCase()}${param.type.slice(1)}` as any)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-gray-800">{param.label || param.name}</div>
              <div className="truncate font-mono text-[10px] text-gray-400">{param.name}</div>
            </div>
            <button
              type="button"
              onClick={() => removeParam(i)}
              className="shrink-0 text-gray-300 hover:text-red-400"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
          <input
            className="sf-panel-input"
            placeholder={t('form.paramName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addParam()}
          />
          <input
            className="sf-panel-input"
            placeholder={t('form.paramLabel')}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <Select
            value={newType}
            onChange={(v) => setNewType(v as InputParam['type'])}
            options={typeOptions}
            className="sf-panel-input"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addParam}
              className="flex-1 rounded-md bg-blue-600 py-1.5 text-xs font-semibold text-white hover:opacity-85"
            >
              {t('common.add')}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 rounded-md border border-gray-200 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          <Plus size={13} />
          {t('form.addParam')}
        </button>
      )}
    </>
  );
}

export function EndOutputsEditor({
  data,
  setValue,
}: {
  data: Record<string, unknown>;
  setValue: (name: string, v: unknown) => void;
}) {
  const { t } = useTranslation();
  const outputs: OutputParam[] = Array.isArray(data.outputParams)
    ? (data.outputParams as OutputParam[])
    : [];
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newExpr, setNewExpr] = useState('');

  const addOutput = () => {
    const trimmed = newName.trim();
    if (!trimmed || !newExpr.trim()) return;
    const updated: OutputParam[] = [
      ...outputs,
      { name: trimmed, label: newLabel.trim() || trimmed, expr: newExpr.trim() },
    ];
    setValue('outputParams', updated);
    setNewName('');
    setNewLabel('');
    setNewExpr('');
    setAdding(false);
  };

  const removeOutput = (index: number) => {
    setValue('outputParams', outputs.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {t('form.outputParams')}
      </div>
      {outputs.length === 0 && !adding && (
        <div className="sf-panel-empty-hint">{t('form.noOutputParams')}</div>
      )}
      <div className="space-y-1.5">
        {outputs.map((output, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-md border border-gray-200 bg-white px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-gray-800">
                {output.label || output.name}
              </div>
              <div className="truncate font-mono text-[10px] text-gray-400">{output.name}</div>
              <div className="mt-0.5 truncate font-mono text-[10px] text-blue-500">{output.expr}</div>
            </div>
            <button
              type="button"
              onClick={() => removeOutput(i)}
              className="mt-0.5 shrink-0 text-gray-300 hover:text-red-400"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
          <input
            className="sf-panel-input"
            placeholder={t('form.outputName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="sf-panel-input"
            placeholder={t('form.outputLabel')}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500">{t('form.outputExprPlaceholder')}</span>
              <VariablePicker onInsert={(ref) => setNewExpr((prev) => prev + ref)} />
            </div>
            <input
              className="sf-panel-input font-mono"
              placeholder="{{nodes.llm_1.text}}"
              value={newExpr}
              onChange={(e) => setNewExpr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addOutput()}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addOutput}
              className="flex-1 rounded-md bg-blue-600 py-1.5 text-xs font-semibold text-white hover:opacity-85"
            >
              {t('common.add')}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 rounded-md border border-gray-200 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          <Plus size={13} />
          {t('form.addOutput')}
        </button>
      )}
    </>
  );
}

export function OnErrorEditor({
  data,
  setValue,
}: {
  data: Record<string, unknown>;
  setValue: (name: string, v: unknown) => void;
}) {
  const { t } = useTranslation();
  const onError = (data.onError as Record<string, unknown>) ?? {};
  const strategy = String(onError.strategy ?? 'fail');
  const retryCount = Number(onError.retryCount ?? 3);
  const retryDelayMs = Number(onError.retryDelayMs ?? 1000);

  const setOnError = (patch: Record<string, unknown>) =>
    setValue('onError', { strategy, retryCount, retryDelayMs, ...onError, ...patch });

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {t('form.onError.title')}
      </div>
      <div className="sf-panel-field">
        <label className="sf-panel-label">{t('form.onError.strategy')}</label>
        <select
          className="sf-panel-input"
          value={strategy}
          onChange={(e) => setOnError({ strategy: e.target.value })}
        >
          <option value="fail">{t('form.onError.fail')}</option>
          <option value="skip">{t('form.onError.skip')}</option>
          <option value="retry">{t('form.onError.retry')}</option>
        </select>
      </div>
      {strategy === 'retry' && (
        <>
          <div className="sf-panel-field">
            <label className="sf-panel-label">{t('form.onError.retryCount')}</label>
            <input
              className="sf-panel-input"
              type="number"
              min={1}
              max={10}
              value={retryCount}
              onChange={(e) => setOnError({ retryCount: Number(e.target.value) })}
            />
          </div>
          <div className="sf-panel-field">
            <label className="sf-panel-label">{t('form.onError.retryDelay')}</label>
            <input
              className="sf-panel-input"
              type="number"
              min={0}
              max={30000}
              step={500}
              value={retryDelayMs}
              onChange={(e) => setOnError({ retryDelayMs: Number(e.target.value) })}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function MonacoModal({
  value,
  language,
  onSave,
  onClose,
}: {
  value: string;
  language: string;
  onSave: (code: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Code2 size={15} />
          代码编辑器
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { onSave(draft); onClose(); }}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            保存并关闭
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={draft}
          onChange={(v) => setDraft(v ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
          }}
          theme="vs"
        />
      </div>
    </div>
  );
}

/**
 * Inline form body rendered inside the canvas-expanded node.
 * Shares the same schema-driven components as the right-side panel.
 */
interface ConditionBranch {
  id: string;
  name: string;
  condition: string;
}

/** Dynamic branch editor for condition_branch nodes. */
export function ConditionBranchEditor({
  data,
  setValue,
}: {
  data: Record<string, unknown>;
  setValue: (name: string, v: unknown) => void;
}) {
  const rawBranches = Array.isArray(data.branches) ? (data.branches as ConditionBranch[]) : [];
  const branches: ConditionBranch[] =
    rawBranches.length > 0
      ? rawBranches
      : [{ id: 'b0', name: '判断条件', condition: '' }];

  const update = (updated: ConditionBranch[]) => setValue('branches', updated);

  const addBranch = () => {
    if (branches.length >= 8) return;
    const id = `b${Date.now()}`;
    update([...branches, { id, name: `条件${branches.length + 1}`, condition: '' }]);
  };

  const removeBranch = (idx: number) => {
    if (branches.length <= 1) return;
    update(branches.filter((_, i) => i !== idx));
  };

  const setBranchField = (idx: number, field: keyof ConditionBranch, val: string) => {
    update(branches.map((b, i) => (i === idx ? { ...b, [field]: val } : b)));
  };

  return (
    <div className="sf-node-inline-form">
      <div className="mb-1 text-[11px] font-semibold text-gray-500">分支条件</div>
      {branches.map((branch, idx) => (
        <div
          key={branch.id}
          className="mb-2 rounded-md border border-gray-200 bg-gray-50 p-2"
        >
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 rounded px-1 py-0.5">
              IF {idx + 1}
            </span>
            <input
              className="flex-1 sf-panel-input text-[11px] min-w-0"
              value={branch.name}
              placeholder="分支名称"
              onChange={(e) => setBranchField(idx, 'name', e.target.value)}
            />
            {branches.length > 1 && (
              <button
                type="button"
                onClick={() => removeBranch(idx)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                title="删除分支"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
          <div className="flex gap-1 items-center">
            <input
              className="flex-1 sf-panel-input text-[11px] min-w-0"
              value={branch.condition}
              placeholder="条件表达式，如 {{input.score}} > 80"
              onChange={(e) => setBranchField(idx, 'condition', e.target.value)}
            />
            <VariablePicker
              onInsert={(ref) =>
                setBranchField(idx, 'condition', `${branch.condition}${ref}`)
              }
            />
          </div>
        </div>
      ))}

      {/* ELSE branch - always present, cannot be deleted */}
      <div className="mb-2 rounded-md border border-dashed border-gray-300 bg-gray-50 p-2">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-medium text-gray-500 bg-gray-200 rounded px-1 py-0.5">
            ELSE
          </span>
          <span className="text-[11px] text-gray-400 ml-1">默认分支（其他情况）</span>
        </div>
      </div>

      {branches.length < 8 && (
        <button
          type="button"
          onClick={addBranch}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-blue-300 py-1.5 text-[11px] text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Plus size={12} />
          添加分支（最多 8 个）
        </button>
      )}
    </div>
  );
}

export function NodeInlineForm({
  nodeType,
  data,
  setValue,
}: {
  nodeType: string;
  data: Record<string, unknown> | undefined;
  setValue: (name: string, v: unknown) => void;
}) {
  const { t } = useTranslation();
  const schema = getNodeFormSchema(nodeType);
  const [monacoOpen, setMonacoOpen] = useState(false);
  const isCodeNode = nodeType === 'code' || nodeType === 'python';
  const codeLanguage = nodeType === 'python' ? 'python' : 'javascript';
  const safeData = (data ?? {}) as Record<string, unknown>;

  return (
    <div className="sf-node-inline-form">
      {isCodeNode && (
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setMonacoOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Code2 size={13} />
            在 IDE 中编辑
          </button>
        </div>
      )}
      {nodeType === 'start' ? (
        <StartParamsEditor data={safeData} setValue={setValue} />
      ) : nodeType === 'end' ? (
        <EndOutputsEditor data={safeData} setValue={setValue} />
      ) : nodeType === 'condition_branch' ? (
        <ConditionBranchEditor data={safeData} setValue={setValue} />
      ) : schema.length === 0 ? (
        <div className="sf-panel-empty-hint">{t('editor.panelNoConfig')}</div>
      ) : (
        schema.map((field) => (
          <div className="sf-panel-field" key={field.name}>
            <label className="sf-panel-label">{t(field.labelKey)}</label>
            <FieldControl
              field={field}
              value={safeData[field.name]}
              onChange={(v) => setValue(field.name, v)}
            />
            {field.hintKey ? <div className="sf-panel-hint">{t(field.hintKey)}</div> : null}
          </div>
        ))
      )}
      {nodeType !== 'start' && nodeType !== 'end' && (
        <OnErrorEditor data={safeData} setValue={setValue} />
      )}
      {monacoOpen && isCodeNode && (
        <MonacoModal
          value={String(safeData['code'] ?? '')}
          language={codeLanguage}
          onSave={(code) => setValue('code', code)}
          onClose={() => setMonacoOpen(false)}
        />
      )}
    </div>
  );
}
