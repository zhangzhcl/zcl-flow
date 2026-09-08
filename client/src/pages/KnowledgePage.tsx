import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import type { KnowledgeBase, KnowledgeChunk, ModelConfig } from '../types';
import { confirmDialog } from '../components/ConfirmDialog';

// ------------------------------------------------------------------ //
// Create dialog
// ------------------------------------------------------------------ //

function CreateDialog({
  models,
  onClose,
  onCreate,
}: {
  models: ModelConfig[];
  onClose: () => void;
  onCreate: (kb: KnowledgeBase) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [modelId, setModelId] = useState('');
  const [separator, setSeparator] = useState('\\n');
  const [chunkSize, setChunkSize] = useState(1024);
  const [overlap, setOverlap] = useState(50);
  const [preprocessWhitespace, setPreprocessWhitespace] = useState(true);
  const [preprocessUrls, setPreprocessUrls] = useState(false);
  const [searchMode, setSearchMode] = useState<'vector' | 'fulltext' | 'hybrid'>('hybrid');
  const [topK, setTopK] = useState(5);
  const [scoreThreshold, setScoreThreshold] = useState(0.5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const embeddingModels = models.filter((m) => (m as any).type === 'embedding');
  const hasEmbeddingModel = embeddingModels.length > 0;

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const kb = await api.createKnowledge({
        name: name.trim(),
        description: desc.trim(),
        embeddingModelConfigId: modelId || undefined,
        chunkSeparator: separator,
        chunkSize,
        chunkOverlap: overlap,
        preprocessWhitespace,
        preprocessUrls,
        searchMode,
        topK,
        scoreThreshold,
      });
      onCreate(kb);
    } catch (e: any) {
      setError(e?.message ?? 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{t('knowledge.create')}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic info */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">{t('knowledge.name')} *</label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('knowledge.namePlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">{t('knowledge.description')}</label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Chunking settings */}
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-3 text-xs font-semibold text-gray-700">{t('knowledge.chunkSettings')}</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-600">{t('knowledge.chunkSeparator')}</label>
                  <input
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-600">{t('knowledge.chunkSize')}</label>
                  <input
                    type="number"
                    min={100}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-600">{t('knowledge.chunkOverlap')}</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={overlap}
                    onChange={(e) => setOverlap(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs text-gray-600">{t('knowledge.preprocessRules')}</p>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preprocessWhitespace}
                    onChange={(e) => setPreprocessWhitespace(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-xs text-gray-700">{t('knowledge.preprocessWhitespace')}</span>
                </label>
                <label className="mt-1.5 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preprocessUrls}
                    onChange={(e) => setPreprocessUrls(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-xs text-gray-700">{t('knowledge.preprocessUrls')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Indexing / search */}
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-3 text-xs font-semibold text-gray-700">{t('knowledge.indexSettings')}</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-600">{t('knowledge.embeddingModel')}</label>
                <select
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                >
                  <option value="">{t('knowledge.noEmbeddingModel')}</option>
                  {embeddingModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {!hasEmbeddingModel && (
                  <p className="mt-1 text-[11px] text-amber-600">{t('knowledge.noEmbeddingModelHint')}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-gray-600">{t('knowledge.searchMode')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['vector', 'fulltext', 'hybrid'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSearchMode(mode)}
                      className={`rounded-lg border px-3 py-2 text-xs text-left transition-colors ${
                        searchMode === mode
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">
                        {t(`knowledge.searchMode_${mode}`)}
                        {mode === 'hybrid' && (
                          <span className="ml-1 rounded bg-orange-100 px-1 py-0.5 text-[10px] text-orange-600">
                            {t('knowledge.recommended')}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-600">{t('knowledge.topK')}</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-600">{t('knowledge.scoreThreshold')}</label>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={scoreThreshold}
                    onChange={(e) => setScoreThreshold(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
            {t('common.cancel')}
          </button>
          <button
            onClick={submit}
            disabled={!name.trim() || saving}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {t('common.create')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ //
// Add document dialog — 2-step wizard (multi-file / folder import)
// ------------------------------------------------------------------ //

const ALLOWED_EXTS = new Set(['.txt', '.md', '.markdown', '.csv', '.json']);
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(String(ev.target?.result ?? ''));
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
}

function readFileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = String(ev.target?.result ?? '');
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const extOf = (name: string) => ('.' + name.split('.').pop()).toLowerCase();
const isImageFile = (f: File) => IMAGE_EXTS.has(extOf(f.name));

/** Collects the document's own directory from an imported folder tree. */
const docDirOf = (f: File) => {
  const rel = ((f as any).webkitRelativePath as string) || '';
  return rel ? rel.slice(0, rel.lastIndexOf('/')) : '';
};
function findImageForRef(ref: string, byDir: Map<string, File[]>): File | null {
  const decode = (s: string) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  const target = decode(ref.trim().split(/\s+/)[0]);
  if (/^(https?:)?\/\//.test(target) || target.startsWith('data:')) return null;
  const base = target.split('/').pop() ?? target;
  // Refs are relative to the document: "attachments/x/01.png" resolves inside
  // folder "attachments/x" next to the doc; fall back to any matching name.
  const segments = target.split('/');
  const folder = segments.length > 1 ? segments[segments.length - 2] : '';
  for (const dir of [folder, '']) {
    const hit = (byDir.get(dir) ?? []).find((f) => f.name === base);
    if (hit) return hit;
  }
  for (const pool of byDir.values()) {
    const hit = pool.find((f) => f.name === base);
    if (hit) return hit;
  }
  return null;
}

/** Resolves image refs inside one document into uploadable base64 payloads. */
async function collectDocumentImages(
  content: string,
  byDir: Map<string, File[]>,
  sourceDir: string,
): Promise<Array<{ path: string; data: string; mimeType: string }>> {
  const images: Array<{ path: string; data: string; mimeType: string }> = [];
  const seen = new Set<string>();
  const re = /(!\[[^\]]*\]\(|<img[^>]+src=["'])([^)"']+)([)"'])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    const ref = m[2];
    if (seen.has(ref) || images.length >= 40) continue;
    seen.add(ref);
    const target = ref.trim().split(/\s+/)[0];
    if (/^(https?:)?\/\//.test(target) || target.startsWith('data:')) continue;
    if (!/\.(png|jpe?g|webp|gif)$/i.test(target)) continue;
    // Refs are relative to the document's own directory inside the folder tree.
    const file =
      findImageForRef(sourceDir ? `${sourceDir}/${target}` : target, byDir) ??
      findImageForRef(target, byDir);
    if (!file) continue;
    if (file.size > MAX_IMAGE_BYTES) continue;
    const mimeType = MIME_BY_EXT[extOf(file.name)];
    if (!mimeType) continue;
    images.push({ path: ref, data: await readFileBase64(file), mimeType });
  }
  return images;
}

function AddDocumentDialog({
  kb,
  onClose,
  onAdded,
}: {
  kb: KnowledgeBase;
  onClose: () => void;
  onAdded: (count: number) => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter((f) => {
      const ext = extOf(f.name);
      return ALLOWED_EXTS.has(ext) || IMAGE_EXTS.has(ext);
    });
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => (f as any).webkitRelativePath + f.name + f.size));
      return [...prev, ...valid.filter((f) => !seen.has((f as any).webkitRelativePath + f.name + f.size))];
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const submit = async () => {
    const textFiles = files.filter((f) => ALLOWED_EXTS.has(extOf(f.name)));
    if (textFiles.length === 0) return;
    setSaving(true);
    setError('');
    setProgress({ current: 0, total: textFiles.length });

    // Group image files by their containing folder so refs like
    // `attachments/<doc>/01.png` can be resolved against the folder tree.
    const byDir = new Map<string, File[]>();
    for (const f of files) {
      if (!isImageFile(f)) continue;
      const rel = ((f as any).webkitRelativePath as string) || f.name;
      const dir = rel.slice(0, rel.lastIndexOf('/'));
      if (!byDir.has(dir)) byDir.set(dir, []);
      byDir.get(dir)!.push(f);
    }

    let totalAdded = 0;
    try {
      for (let i = 0; i < textFiles.length; i++) {
        setProgress({ current: i + 1, total: textFiles.length });
        const content = await readFileText(textFiles[i]);
        if (!content.trim()) continue;
        const images = await collectDocumentImages(
          content,
          byDir,
          docDirOf(textFiles[i]),
        );
        const result = await api.addKnowledgeDocument(kb.id, {
          content: content.trim(),
          sourceTitle: textFiles[i].name,
          images,
        });
        totalAdded += result.added;
      }
      onAdded(totalAdded);
    } catch (e: any) {
      setError(e?.message ?? 'Error');
      setSaving(false);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Wizard header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">{t('knowledge.addDocument')}</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span className={step === 1 ? 'font-medium text-blue-600' : ''}>{t('knowledge.step1')}</span>
              <ChevronRight size={12} />
              <span className={step === 2 ? 'font-medium text-blue-600' : ''}>{t('knowledge.step2')}</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        {step === 1 ? (
          /* Step 1 — select files */
          <div className="p-6 space-y-4">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.markdown,.csv,.json,.png,.jpg,.jpeg,.webp,.gif"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
              {...({ webkitdirectory: '' } as any)}
            />

            {/* Drag-drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed px-6 py-7 text-center transition-colors ${
                isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <Upload size={20} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">{t('knowledge.dragHint1')}<span className="text-blue-600">{t('knowledge.dragHint2')}</span></p>
              <p className="mt-1 text-[11px] text-gray-400">{t('knowledge.supportedFormats')}</p>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                >
                  {t('knowledge.selectFiles')}
                </button>
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                >
                  {t('knowledge.selectFolder')}
                </button>
              </div>
            </div>

            {/* Selected file list */}
            {files.length > 0 && (
              <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 last:border-0"
                  >
                    <span className="min-w-0 flex-1 truncate text-xs text-gray-700">{f.name}</span>
                    <span className="shrink-0 text-[11px] text-gray-400">{formatBytes(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="shrink-0 rounded p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-400"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {files.length > 0 ? t('knowledge.selectedFiles', { count: files.length }) : ''}
              </span>
              <button
                onClick={() => setStep(2)}
                disabled={files.length === 0}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {t('knowledge.next')}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Step 2 — review settings & import */
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700">{t('knowledge.chunkSettings')}</p>
              <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400">{t('knowledge.chunkSeparator')}</span>
                  <div className="mt-0.5 font-mono font-medium text-gray-800">{kb.chunkSeparator || '\\n'}</div>
                </div>
                <div>
                  <span className="text-gray-400">{t('knowledge.chunkSize')}</span>
                  <div className="mt-0.5 font-medium text-gray-800">{kb.chunkSize} chars</div>
                </div>
                <div>
                  <span className="text-gray-400">{t('knowledge.chunkOverlap')}</span>
                  <div className="mt-0.5 font-medium text-gray-800">{kb.chunkOverlap} chars</div>
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                {kb.preprocessWhitespace && (
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">{t('knowledge.preprocessWhitespace')}</span>
                )}
                {kb.preprocessUrls && (
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">{t('knowledge.preprocessUrls')}</span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700">{t('knowledge.indexSettings')}</p>
              <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400">{t('knowledge.searchMode')}</span>
                  <div className="mt-0.5 font-medium text-gray-800">{t(`knowledge.searchMode_${kb.searchMode}`)}</div>
                </div>
                <div>
                  <span className="text-gray-400">{t('knowledge.topK')}</span>
                  <div className="mt-0.5 font-medium text-gray-800">{kb.topK}</div>
                </div>
                <div>
                  <span className="text-gray-400">{t('knowledge.scoreThreshold')}</span>
                  <div className="mt-0.5 font-medium text-gray-800">{kb.scoreThreshold}</div>
                </div>
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                {kb.embeddingModelConfigId
                  ? t('knowledge.indexModeHigh')
                  : t('knowledge.indexModeEconomy')}
              </div>
            </div>

            {/* File summary + progress */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-medium text-blue-700">
                {progress
                  ? t('knowledge.importing', { current: progress.current, total: progress.total })
                  : t('knowledge.selectedFiles', { count: files.length })}
              </p>
              {progress && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                disabled={saving}
                className="flex items-center gap-1 rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={14} />
                {t('common.back')}
              </button>
              <button
                onClick={submit}
                disabled={saving || files.length === 0}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {t('knowledge.importAndChunk')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ //
// Detail view (chunks)
// ------------------------------------------------------------------ //

function KnowledgeDetail({
  kb,
  onBack,
  onDeleted,
}: {
  kb: KnowledgeBase;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setChunks(await api.listKnowledgeChunks(kb.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [kb.id]);

  const handleClear = async () => {
    if (!(await confirmDialog(t('knowledge.confirmClearChunks')))) return;
    setClearing(true);
    await api.clearKnowledgeChunks(kb.id);
    setClearing(false);
    setChunks([]);
  };

  const handleDeleteChunk = async (chunkId: string) => {
    await api.deleteKnowledgeChunk(kb.id, chunkId);
    setChunks((prev) => prev.filter((c) => c.id !== chunkId));
  };

  const handleDeleteKb = async () => {
    if (!(await confirmDialog(t('knowledge.confirmDelete')))) return;
    await api.deleteKnowledge(kb.id);
    onDeleted();
  };

  return (
    <div className="p-6">
      {showAdd && (
        <AddDocumentDialog
          kb={kb}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); load(); }}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
        >
          <ChevronLeft size={16} />
          {t('common.back')}
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">{kb.name}</h1>
          {kb.description && <p className="text-xs text-gray-500">{kb.description}</p>}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Plus size={14} />
          {t('knowledge.addDocument')}
        </button>
        {chunks.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
          >
            {clearing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {t('knowledge.clearAll')}
          </button>
        )}
        <button
          onClick={handleDeleteKb}
          className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
        >
          <Trash2 size={14} />
          {t('knowledge.deleteKb')}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <span>{t('knowledge.chunkCount', { count: chunks.length })}</span>
        <span>{t('knowledge.chunkSize')}: {kb.chunkSize}</span>
        <span>{t('knowledge.chunkOverlap')}: {kb.chunkOverlap}</span>
        <span className="capitalize">{t('knowledge.searchMode')}: {t(`knowledge.searchMode_${kb.searchMode}`)}</span>
        <span>Top K: {kb.topK}</span>
      </div>

      {/* Chunks list */}
      {loading ? (
        <div className="flex items-center gap-2 py-12 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">{t('common.loading')}</span>
        </div>
      ) : chunks.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">{t('knowledge.noChunks')}</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mx-auto mt-3 flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Plus size={14} />
            {t('knowledge.addDocument')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {chunks.map((chunk, i) => (
            <div
              key={chunk.id}
              className="group flex gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300"
            >
              <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-[11px] text-gray-400">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                {chunk.sourceTitle && (
                  <p className="mb-1 text-[11px] text-blue-500">{chunk.sourceTitle}</p>
                )}
                <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-700">
                  {chunk.content}
                </p>
              </div>
              <button
                onClick={() => handleDeleteChunk(chunk.id)}
                className="mt-0.5 shrink-0 rounded p-1 text-gray-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ //
// List view
// ------------------------------------------------------------------ //

export default function KnowledgePage() {
  const { t } = useTranslation();
  const [bases, setBases] = useState<KnowledgeBase[]>([]);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<KnowledgeBase | null>(null);

  useEffect(() => {
    Promise.all([api.listKnowledge(), api.listModels()]).then(([kbs, ms]) => {
      setBases(kbs);
      setModels(ms);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (e: React.MouseEvent, kb: KnowledgeBase) => {
    e.stopPropagation();
    if (!(await confirmDialog(t('knowledge.confirmDelete')))) return;
    await api.deleteKnowledge(kb.id);
    setBases((prev) => prev.filter((b) => b.id !== kb.id));
  };

  if (detail) {
    return (
      <KnowledgeDetail
        kb={detail}
        onBack={() => setDetail(null)}
        onDeleted={() => {
          setBases((prev) => prev.filter((b) => b.id !== detail.id));
          setDetail(null);
        }}
      />
    );
  }

  return (
    <div className="p-6">
      {showCreate && (
        <CreateDialog
          models={models}
          onClose={() => setShowCreate(false)}
          onCreate={(kb) => {
            setBases((prev) => [...prev, { ...kb, chunkCount: 0 }]);
            setShowCreate(false);
          }}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('knowledge.title')}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{t('knowledge.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Plus size={15} />
          {t('knowledge.create')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">{t('common.loading')}</span>
        </div>
      ) : bases.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
          <BookOpen size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="text-base font-medium text-gray-400">{t('knowledge.empty')}</p>
          <p className="mt-1 text-sm text-gray-400">{t('knowledge.emptyHint')}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mx-auto mt-4 flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Plus size={14} />
            {t('knowledge.create')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bases.map((kb) => (
            <div
              key={kb.id}
              onClick={() => setDetail(kb)}
              className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:border-blue-200 hover:shadow-md"
            >
              {/* Delete button — visible on hover */}
              <button
                onClick={(e) => handleDelete(e, kb)}
                className="absolute right-3 top-3 rounded p-1 text-gray-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
                title={t('knowledge.deleteKb')}
              >
                <Trash2 size={13} />
              </button>

              <div className="mb-3 flex items-center gap-2 pr-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <BookOpen size={16} className="text-blue-500" />
                </div>
                <span className="truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                  {kb.name}
                </span>
              </div>
              {kb.description && (
                <p className="mb-3 line-clamp-2 text-xs text-gray-500">{kb.description}</p>
              )}
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>{t('knowledge.chunks', { count: kb.chunkCount ?? 0 })}</span>
                <span>{new Date(kb.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
