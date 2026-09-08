import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Workflow,
} from 'lucide-react';
import { api } from '../api/client';
import type { Agent, AgentConversation, AgentMessage } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserMenu from '../components/UserMenu';

function createLocalMessage(role: AgentMessage['role'], content: string): AgentMessage {
  return {
    id: `local-${role}-${Date.now()}`,
    conversationId: 'local',
    role,
    content,
    metadata: null,
    createdAt: new Date().toISOString(),
  };
}

function isFailedMessage(message: AgentMessage): boolean {
  return (
    message.role === 'assistant' &&
    (message.content.startsWith('Workflow failed:') || message.metadata?.status === 'failed')
  );
}

export default function AgentChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState(params.get('agentId') ?? '');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );

  useEffect(() => {
    api
      .listAgents()
      .then((items) => {
        setAgents(items);
        const requestedId = params.get('agentId') ?? '';
        const initial = items.some((agent) => agent.id === requestedId)
          ? requestedId
          : items[0]?.id ?? '';
        setSelectedAgentId(initial);
        if (initial) setParams({ agentId: initial });
      })
      .catch((err) => setError(String(err?.message ?? err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAgentId) return;
    setParams({ agentId: selectedAgentId });
    setConversationId(undefined);
    setMessages([]);
    setLastFailedMessage('');
    setError(null);
    api
      .listAgentConversations(selectedAgentId)
      .then(setConversations)
      .catch((err) => setError(String(err?.message ?? err)));
  }, [selectedAgentId, setParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const openConversation = async (id: string) => {
    if (!selectedAgentId) return;
    setError(null);
    setLastFailedMessage('');
    try {
      const detail = await api.getAgentConversation(selectedAgentId, id);
      setConversationId(detail.id);
      setMessages(detail.messages);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    }
  };

  const startNewConversation = () => {
    setConversationId(undefined);
    setMessages([]);
    setLastFailedMessage('');
    setError(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const sendMessage = async (message: string) => {
    if (!selectedAgentId || !message.trim() || sending) return;
    const content = message.trim();
    setInput('');
    setSending(true);
    setError(null);
    setLastFailedMessage(content);
    const optimisticUserMessage = createLocalMessage('user', content);
    setMessages((items) => [...items, optimisticUserMessage]);
    try {
      const result = await api.chatWithAgent(selectedAgentId, { message: content, conversationId });
      setConversationId(result.conversationId);
      setMessages((items) => [
        ...items.filter((item) => item.id !== optimisticUserMessage.id),
        result.userMessage,
        result.assistantMessage,
      ]);
      setConversations(await api.listAgentConversations(selectedAgentId));
    } catch (err: any) {
      setMessages((items) => items.filter((item) => item.id !== optimisticUserMessage.id));
      setInput(content);
      setError(String(err?.message ?? err));
    } finally {
      setSending(false);
    }
  };

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/console"
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
              <MessageSquare size={17} className="text-gray-900" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">{t('chat.title')}</h1>
              <p className="hidden text-xs text-gray-500 sm:block">{t('chat.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 gap-4 overflow-hidden px-4 pb-5 pt-4 sm:px-6 lg:grid-cols-[260px_1fr_300px]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-gray-500">{t('chat.agents')}</div>
            <button
              type="button"
              onClick={startNewConversation}
              disabled={!selectedAgentId}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-500 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40"
            >
              <Plus size={12} />
              {t('chat.newChat')}
            </button>
          </div>
          <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <Loader2 size={16} className="animate-spin text-gray-500" />
            ) : agents.length === 0 ? (
              <div className="text-xs text-gray-400">{t('chat.noAgents')}</div>
            ) : (
              agents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors ${
                    selectedAgentId === agent.id
                      ? 'border-gray-400 bg-gray-200 text-gray-900'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Bot size={13} />
                  <span className="min-w-0 flex-1 truncate">{agent.name}</span>
                </button>
              ))
            )}
          </div>
          <div className="mt-3 min-h-0 border-t border-gray-200 pt-3">
            <div className="mb-2 text-xs font-semibold text-gray-500">{t('chat.conversations')}</div>
            <div className="max-h-72 overflow-y-auto pr-1">
              {conversations.length === 0 ? (
                <div className="text-xs text-gray-400">{t('chat.noConversations')}</div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => openConversation(conversation.id)}
                    className={`mb-1 w-full truncate rounded-md px-2.5 py-1.5 text-left text-[11px] ${
                      conversationId === conversation.id
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    {conversation.title}
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl shadow-black/10">
          <div className="shrink-0 border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {selectedAgent?.name ?? t('chat.selectAgent')}
                </div>
                <div className="mt-0.5 text-[11px] text-gray-400">{t('chat.enterHint')}</div>
              </div>
              {sending && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] text-gray-500">
                  <Loader2 size={12} className="animate-spin" />
                  {t('chat.running')}
                </div>
              )}
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-100">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">{error}</div>
              </div>
            )}
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-400">
                <MessageSquare size={32} />
                <div>
                  <p className="text-sm text-gray-500">{t('chat.empty')}</p>
                  <p className="mt-1 text-xs">{t('chat.emptyHint')}</p>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const failed = isFailedMessage(message);
                return (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : failed
                            ? 'border border-red-900/70 bg-red-950/30 text-red-100'
                            : 'border border-gray-200 bg-gray-50 text-gray-800'
                      }`}
                    >
                      {failed && (
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold">
                          <AlertTriangle size={13} />
                          {t('chat.failed')}
                        </div>
                      )}
                      {message.content}
                    </div>
                  </div>
                );
              })
            )}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 size={13} className="animate-spin" />
                {t('chat.thinking')}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="shrink-0 border-t border-gray-200 bg-white p-3">
            {lastFailedMessage && !sending && messages.some(isFailedMessage) && (
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => sendMessage(lastFailedMessage)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 hover:border-gray-300 hover:text-gray-900"
                >
                  <RefreshCw size={12} />
                  {t('chat.retry')}
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={!selectedAgentId || sending}
                placeholder={t('chat.placeholder')}
                rows={1}
                className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!selectedAgentId || !input.trim() || sending}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white disabled:opacity-40"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {t('chat.send')}
              </button>
            </div>
          </form>
        </section>

        <aside className="min-h-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Workflow size={15} />
            {t('chat.agentInfo')}
          </div>
          {selectedAgent ? (
            <div className="space-y-3 text-xs text-gray-500">
              <div>
                <div className="mb-1 text-gray-400">{t('agents.name')}</div>
                <div className="text-gray-800">{selectedAgent.name}</div>
              </div>
              <div>
                <div className="mb-1 text-gray-400">{t('agents.description')}</div>
                <div className="leading-relaxed">{selectedAgent.description || '-'}</div>
              </div>
              <div>
                <div className="mb-1 text-gray-400">{t('agents.statusLabel')}</div>
                <div>{t(`agents.status.${selectedAgent.status}` as any)}</div>
              </div>
              <div>
                <div className="mb-1 text-gray-400">Workflow ID</div>
                <div className="break-all font-mono text-[10px]">{selectedAgent.workflowId}</div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/workflows/${selectedAgent.workflowId}`)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 hover:border-gray-400"
              >
                {t('chat.openWorkflow')}
              </button>
            </div>
          ) : (
            <div className="text-xs text-gray-400">{t('chat.selectAgent')}</div>
          )}
        </aside>
      </main>
    </div>
  );
}
