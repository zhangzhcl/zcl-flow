import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot,
  Film,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  User,
  X,
} from 'lucide-react';
import { api, knowledgeAssetUrl } from '../api/client';
import type { WorkflowDefinition } from '../types';

// ── types ───────────────────────────────────────────────────────────────────

interface Attachment {
  id: string;
  type: 'image' | 'video';
  name: string;
  dataUrl: string; // base64 data URL
  mimeType: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  error?: boolean;
}

interface WorkflowChatPanelProps {
  workflowId: string;
  definition: WorkflowDefinition;
  onBeforeRun: () => Promise<void>;
  onClose: () => void;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isImage(mimeType: string) {
  return mimeType.startsWith('image/');
}
function isVideo(mimeType: string) {
  return mimeType.startsWith('video/');
}

// ── AttachmentPreview ─────────────────────────────────────────────────────────

function AttachmentThumb({
  att,
  onRemove,
}: {
  att: Attachment;
  onRemove?: () => void;
}) {
  return (
    <div className="relative shrink-0">
      {att.type === 'image' ? (
        <img
          src={att.dataUrl}
          alt={att.name}
          className="h-14 w-14 rounded-lg object-cover border border-gray-200"
        />
      ) : (
        <div className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-400">
          <Film size={16} />
          <span className="px-0.5 text-center text-[9px] leading-tight truncate w-full text-center">
            {att.name.split('.').pop()?.toUpperCase()}
          </span>
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900"
        >
          <X size={9} />
        </button>
      )}
    </div>
  );
}

// ── UserBubble ────────────────────────────────────────────────────────────────

function UserBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex flex-row-reverse gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
        <User size={12} className="text-blue-600" />
      </div>
      <div className="flex max-w-[220px] flex-col gap-1 items-end">
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end">
            {msg.attachments.map((att) => (
              <AttachmentThumb key={att.id} att={att} />
            ))}
          </div>
        )}
        {msg.content && (
          <div className="rounded-xl bg-blue-600 px-3 py-2 text-xs leading-relaxed text-white">
            {msg.content}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Markdown image rendering ─────────────────────────────────────────────────

/**
 * Renders assistant text with `![alt](url)` images inline. Only the image
 * syntax is interpreted — everything else stays plain text. Knowledge asset
 * URLs are resolved to absolute + token via knowledgeAssetUrl().
 */
function MessageContent({ content }: { content: string }) {
  const parts: Array<{ key: number; text?: string; image?: { alt: string; url: string } }> = [];
  const re = /!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(content))) {
    if (m.index > last) parts.push({ key: key++, text: content.slice(last, m.index) });
    parts.push({ key: key++, image: { alt: m[1], url: knowledgeAssetUrl(m[2]) } });
    last = m.index + m[0].length;
  }
  if (last < content.length) parts.push({ key: key++, text: content.slice(last) });

  return (
    <>
      {parts.map((p) =>
        p.image ? (
          <MessageImage key={p.key} alt={p.image.alt} url={p.image.url} />
        ) : (
          <span key={p.key} className="whitespace-pre-wrap">{p.text}</span>
        ),
      )}
    </>
  );
}

function MessageImage({ alt, url }: { alt: string; url: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-[11px] text-gray-400">
        <ImageIcon size={12} />
        <span className="truncate">{alt || 'image'}</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="mt-1 max-h-48 w-auto max-w-full cursor-zoom-in rounded-lg border border-gray-200 bg-white object-contain"
      onClick={() => window.open(url, '_blank')}
    />
  );
}

// ── AssistantBubble ───────────────────────────────────────────────────────────

function AssistantBubble({ msg }: { msg: ChatMessage }) {
  const hasImage = /!\[[^\]]*\]\(/.test(msg.content);
  return (
    <div className="flex gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100">
        <Bot size={12} className="text-gray-500" />
      </div>
      <div
        className={`rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
          msg.error
            ? 'border border-red-100 bg-red-50 text-red-700'
            : 'bg-gray-100 text-gray-800'
        } ${hasImage ? 'max-w-[320px]' : 'max-w-[220px]'}`}
      >
        <MessageContent content={msg.content} />
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

/**
 * Embedded chat panel for testing the workflow directly in the editor.
 *
 * Features:
 * - Text messages sent as workflow input.message
 * - Images: paste from clipboard (Ctrl+V / ⌘+V) or click the attachment button
 * - Videos: click the attachment button to select a video file
 * - Attachments are included in the workflow input as imageUrls / videoUrl
 * - Conversation history is forwarded so the LLM has context
 */
export default function WorkflowChatPanel({
  workflowId,
  onBeforeRun,
  onClose,
}: WorkflowChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Accept image paste anywhere on the panel.
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItem = items.find((item) => isImage(item.type));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setAttachments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'image',
        name: file.name || 'pasted-image.png',
        dataUrl,
        mimeType: file.type,
      },
    ]);
  }, []);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.addEventListener('paste', handlePaste);
    return () => el.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // File picker (images + videos).
  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    const added: Attachment[] = [];
    for (const file of files) {
      if (!isImage(file.type) && !isVideo(file.type)) continue;
      const dataUrl = await fileToDataUrl(file);
      added.push({
        id: crypto.randomUUID(),
        type: isImage(file.type) ? 'image' : 'video',
        name: file.name,
        dataUrl,
        mimeType: file.type,
      });
    }
    if (added.length) setAttachments((prev) => [...prev, ...added]);
  };

  const removeAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  // Send message.
  const send = async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || loading) return;
    const currentAttachments = [...attachments];
    setInput('');
    setAttachments([]);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      attachments: currentAttachments,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      await onBeforeRun();

      // Build conversation history for LLM context.
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      // Collect image data URLs for the LLM vision API.
      const imageUrls = currentAttachments
        .filter((a) => a.type === 'image')
        .map((a) => a.dataUrl);

      // For video, pass the first video's data URL as videoUrl.
      const videoAttachment = currentAttachments.find((a) => a.type === 'video');

      const workflowInput: Record<string, unknown> = {
        message: text,
        history,
        ...(imageUrls.length ? { imageUrls } : {}),
        ...(videoAttachment ? { videoUrl: videoAttachment.dataUrl, videoName: videoAttachment.name } : {}),
      };

      const execution = await api.runWorkflow(workflowId, workflowInput);

      const output = execution.output ?? {};
      const reply =
        (output.reply as string | undefined) ??
        (output.text as string | undefined) ??
        (output.result as string | undefined) ??
        (output.answer as string | undefined) ??
        (execution.status === 'failed'
          ? `工作流执行失败：${execution.error ?? '未知错误'}`
          : JSON.stringify(output, null, 2));

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: String(reply),
          error: execution.status === 'failed',
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `请求失败：${String(err?.message ?? err)}`,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute inset-y-0 right-0 z-30 flex w-80 flex-col border-l border-gray-200 bg-white shadow-xl"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">调试对话</span>
          <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
            TEST
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <X size={15} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Bot size={18} className="text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">与工作流直接对话</p>
              <p className="text-[11px] text-gray-400 max-w-[200px] leading-relaxed">
                消息通过 <code className="text-blue-500">input.message</code> 传入工作流。
              </p>
              <p className="text-[11px] text-gray-400 max-w-[200px] leading-relaxed">
                支持粘贴截图或上传图片/视频文件。
              </p>
            </div>
          </div>
        )}
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <UserBubble key={msg.id} msg={msg} />
          ) : (
            <AssistantBubble key={msg.id} msg={msg} />
          ),
        )}
        {loading && (
          <div className="flex gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <Bot size={12} className="text-gray-500" />
            </div>
            <div className="rounded-xl bg-gray-100 px-3 py-2">
              <Loader2 size={13} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="shrink-0 flex flex-wrap gap-2 border-t border-gray-100 px-3 py-2">
          {attachments.map((att) => (
            <AttachmentThumb
              key={att.id}
              att={att}
              onRemove={() => removeAttachment(att.id)}
            />
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 border-t border-gray-200 p-3">
        <div className="flex gap-2 items-end">
          <button
            type="button"
            onClick={openFilePicker}
            title="上传图片或视频（也可直接粘贴截图）"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
          >
            <Paperclip size={14} />
          </button>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息… (Enter 发送，⇧Enter 换行)"
            disabled={loading}
            className="flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white disabled:opacity-50"
            style={{ maxHeight: '80px', overflowY: 'auto' }}
          />
          <button
            type="button"
            onClick={send}
            disabled={(!input.trim() && attachments.length === 0) || loading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-gray-400">
          <ImageIcon size={10} />
          <span>粘贴截图 · 上传图片/视频 · 每次发送前自动保存</span>
        </div>
      </div>
    </div>
  );
}
