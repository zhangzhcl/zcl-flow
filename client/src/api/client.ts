import type {
  Agent,
  AgentChatResult,
  AgentConversation,
  AgentConversationDetail,
  AgentPayload,
  DebugConfig,
  DebugState,
  Execution,
  ExecutionDetail,
  ExecutionStats,
  KnowledgeBase,
  KnowledgeChunk,
  LoginResult,
  ModelConfig,
  ModelConfigPayload,
  ModelTestResult,
  ProvisionedUser,
  Trigger,
  TriggerPayload,
  TriggerType,
  User,
  UserRole,
  Workflow,
  WorkflowDefinition,
  WorkflowDraft,
  WorkflowExport,
} from '../types';

const BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3001/api';

const TOKEN_KEY = 'zcl-flow-token';

let authToken: string | null = localStorage.getItem(TOKEN_KEY);
/** Invoked when the server rejects the current token, so the UI can sign out. */
let onUnauthorized: (() => void) | null = null;

export function setToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  return authToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/** Absolute origin of the API, e.g. `http://localhost:3001` (no `/api`). */
export function apiOrigin(): string {
  return BASE_URL.replace(/\/api\/?$/, '');
}

/** Builds the publicly callable webhook URL from a relative trigger path. */
export function webhookUrl(path: string): string {
  return `${apiOrigin()}${path}`;
}

/**
 * Resolves a knowledge asset URL (`/api/knowledge/assets/:id/file`) into an
 * absolute URL with the token attached, so `<img>` tags can load it without
 * request headers.
 */
export function knowledgeAssetUrl(url: string): string {
  if (!url.startsWith('/api/knowledge/assets/')) return url;
  if (/^https?:\/\//.test(url)) return url;
  const params = new URLSearchParams();
  if (authToken) params.set('access_token', authToken);
  const qs = params.toString();
  return `${apiOrigin()}${url}${qs ? `?${qs}` : ''}`;
}

/**
 * Opens the live execution stream. `EventSource` cannot set headers, so the
 * token travels as a query parameter (the server accepts both forms).
 */
export function openExecutionStream(executionId?: string): EventSource {
  const params = new URLSearchParams();
  if (authToken) params.set('access_token', authToken);
  if (executionId) params.set('executionId', executionId);
  return new EventSource(`${BASE_URL}/executions/stream?${params.toString()}`);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      setToken(null);
      onUnauthorized?.();
    }
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body?.message ?? message;
    } catch {
      // ignore body parse errors
    }
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  // ---------- auth ----------
  login: (username: string, password: string) =>
    request<LoginResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => request<User>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // ---------- users (admin) ----------
  listUsers: () => request<User[]>('/users'),

  createUser: (data: {
    username: string;
    displayName?: string;
    role?: UserRole;
    password?: string;
  }) => request<ProvisionedUser>('/users', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (
    id: string,
    data: { displayName?: string; role?: UserRole; enabled?: boolean },
  ) => request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  resetUserPassword: (id: string) =>
    request<ProvisionedUser>(`/users/${id}/reset-password`, { method: 'POST' }),

  deleteUser: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),

  // ---------- workflows ----------
  listWorkflows: () => request<Workflow[]>('/workflows'),

  getWorkflow: (id: string) => request<Workflow>(`/workflows/${id}`),

  createWorkflow: (data: { name: string; description?: string; definition?: WorkflowDefinition }) =>
    request<Workflow>('/workflows', { method: 'POST', body: JSON.stringify(data) }),

  updateWorkflow: (
    id: string,
    data: { name?: string; description?: string; definition?: WorkflowDefinition },
  ) => request<Workflow>(`/workflows/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteWorkflow: (id: string) =>
    request<void>(`/workflows/${id}`, { method: 'DELETE' }),

  runWorkflow: (id: string, input: Record<string, unknown>, async = false) =>
    request<ExecutionDetail>(`/workflows/${id}/run`, {
      method: 'POST',
      body: JSON.stringify({ input, async }),
    }),

  exportWorkflow: (id: string) => request<WorkflowExport>(`/workflows/${id}/export`),

  importWorkflow: (envelope: Partial<WorkflowExport>) =>
    request<Workflow>('/workflows/import', {
      method: 'POST',
      body: JSON.stringify(envelope),
    }),

  duplicateWorkflow: (id: string) =>
    request<Workflow>(`/workflows/${id}/duplicate`, { method: 'POST' }),

  // ---------- ai builder ----------
  generateWorkflowDraft: (prompt: string) =>
    request<WorkflowDraft>('/ai/workflow-draft', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  // ---------- agents ----------
  listAgents: () => request<Agent[]>('/agents'),

  getAgent: (id: string) => request<Agent>(`/agents/${id}`),

  createAgent: (data: AgentPayload & { workflowId: string }) =>
    request<Agent>('/agents', { method: 'POST', body: JSON.stringify(data) }),

  updateAgent: (id: string, data: AgentPayload) =>
    request<Agent>(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteAgent: (id: string) => request<void>(`/agents/${id}`, { method: 'DELETE' }),

  listAgentConversations: (agentId: string) =>
    request<AgentConversation[]>(`/agents/${agentId}/conversations`),

  getAgentConversation: (agentId: string, conversationId: string) =>
    request<AgentConversationDetail>(`/agents/${agentId}/conversations/${conversationId}`),

  chatWithAgent: (agentId: string, data: { message: string; conversationId?: string }) =>
    request<AgentChatResult>(`/agents/${agentId}/chat`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ---------- triggers ----------
  listTriggers: (workflowId: string) =>
    request<Trigger[]>(`/triggers?workflowId=${encodeURIComponent(workflowId)}`),

  createTrigger: (data: {
    workflowId: string;
    type: TriggerType;
    name?: string;
    cronExpression?: string;
    payload?: Record<string, unknown>;
  }) => request<Trigger>('/triggers', { method: 'POST', body: JSON.stringify(data) }),

  updateTrigger: (id: string, data: TriggerPayload) =>
    request<Trigger>(`/triggers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteTrigger: (id: string) => request<void>(`/triggers/${id}`, { method: 'DELETE' }),

  rotateTriggerToken: (id: string) =>
    request<Trigger>(`/triggers/${id}/rotate`, { method: 'POST' }),

  fireTrigger: (id: string) =>
    request<ExecutionDetail>(`/triggers/${id}/fire`, { method: 'POST' }),

  // ---------- executions ----------
  listExecutions: (workflowId: string) =>
    request<Execution[]>(`/executions?workflowId=${encodeURIComponent(workflowId)}`),

  listAllExecutions: () =>
    request<Execution[]>(`/executions`),

  getExecution: (id: string) => request<ExecutionDetail>(`/executions/${id}`),

  /** Child runs spawned by sub-workflow / loop nodes of one execution. */
  getExecutionChildren: (id: string) =>
    request<Execution[]>(`/executions/${id}/children`),

  /** Cancels a queued or running execution. */
  cancelExecution: (id: string) =>
    request<{ id: string; status: string }>(`/executions/${id}/cancel`, { method: 'POST' }),

  // ---------- debugging ----------
  /** Starts an interactive debug run (always async; drive it via the debug API). */
  startDebug: (id: string, input: Record<string, unknown>, debug: DebugConfig) =>
    request<ExecutionDetail>(`/workflows/${id}/run`, {
      method: 'POST',
      body: JSON.stringify({ input, debug }),
    }),

  /** Current pause / breakpoint / mock / snapshot state of a debug run. */
  debugState: (id: string) => request<DebugState>(`/executions/${id}/debug`),

  /** Executes exactly one more node, then pauses again. */
  debugStep: (id: string) =>
    request<{ ok: boolean }>(`/executions/${id}/debug/step`, { method: 'POST' }),

  /** Runs freely until the next breakpoint (or the end). */
  debugContinue: (id: string) =>
    request<{ ok: boolean }>(`/executions/${id}/debug/continue`, { method: 'POST' }),

  /** Stops the debug run (cancels the execution). */
  debugStop: (id: string) =>
    request<{ ok: boolean }>(`/executions/${id}/debug/stop`, { method: 'POST' }),

  /** Live-updates breakpoints / mocks while a debug run is in flight. */
  debugUpdate: (id: string, config: DebugConfig) =>
    request<DebugState>(`/executions/${id}/debug`, {
      method: 'PATCH',
      body: JSON.stringify(config),
    }),

  /** Operations dashboard data, optionally scoped to one workflow. */
  getStats: (params: { days?: number; workflowId?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.days) search.set('days', String(params.days));
    if (params.workflowId) search.set('workflowId', params.workflowId);
    const query = search.toString();
    return request<ExecutionStats>(`/executions/stats${query ? `?${query}` : ''}`);
  },

  // ---------- model configs ----------
  listModels: () => request<ModelConfig[]>('/models'),

  createModel: (data: ModelConfigPayload) =>
    request<ModelConfig>('/models', { method: 'POST', body: JSON.stringify(data) }),

  updateModel: (id: string, data: ModelConfigPayload) =>
    request<ModelConfig>(`/models/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteModel: (id: string) => request<void>(`/models/${id}`, { method: 'DELETE' }),

  setDefaultModel: (id: string) =>
    request<ModelConfig>(`/models/${id}/default`, { method: 'POST' }),

  testModel: (id: string) =>
    request<ModelTestResult>(`/models/${id}/test`, { method: 'POST' }),

  // ---------- knowledge bases ----------
  listKnowledge: () => request<KnowledgeBase[]>('/knowledge'),

  createKnowledge: (data: {
    name: string;
    description?: string;
    embeddingModelConfigId?: string;
    chunkSeparator?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    preprocessWhitespace?: boolean;
    preprocessUrls?: boolean;
    searchMode?: 'vector' | 'fulltext' | 'hybrid';
    topK?: number;
    scoreThreshold?: number;
  }) => request<KnowledgeBase>('/knowledge', { method: 'POST', body: JSON.stringify(data) }),

  getKnowledge: (id: string) => request<KnowledgeBase>(`/knowledge/${id}`),

  deleteKnowledge: (id: string) => request<void>(`/knowledge/${id}`, { method: 'DELETE' }),

  addKnowledgeDocument: (
    id: string,
    data: {
      content: string;
      sourceTitle?: string;
      images?: Array<{ path: string; data: string; mimeType: string }>;
    },
  ) =>
    request<{ added: number; images?: number }>(`/knowledge/${id}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listKnowledgeChunks: (id: string) => request<KnowledgeChunk[]>(`/knowledge/${id}/chunks`),

  clearKnowledgeChunks: (id: string) =>
    request<void>(`/knowledge/${id}/chunks`, { method: 'DELETE' }),

  deleteKnowledgeChunk: (id: string, chunkId: string) =>
    request<void>(`/knowledge/${id}/chunks/${chunkId}`, { method: 'DELETE' }),
};
