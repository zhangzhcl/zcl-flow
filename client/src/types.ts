/** Shared client-side domain types. */

export interface InputParam {
  name: string;
  label: string;
  type: 'text' | 'number' | 'image' | 'multimodal';
  required?: boolean;
}

export interface OutputParam {
  /** Output key name (e.g. "result") */
  name: string;
  /** Display label shown in the run panel */
  label: string;
  /** Value expression, e.g. "{{nodes.llm_1.text}}" */
  expr: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  definition: WorkflowDefinition | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowDefinition {
  nodes: unknown[];
  edges: unknown[];
}

export interface WorkflowDraft {
  name: string;
  description: string;
  definition: WorkflowDefinition;
  source: 'ai' | 'fallback';
  raw?: string;
}

export type AgentStatus = 'draft' | 'published' | 'archived';

export interface Agent {
  id: string;
  ownerId: string;
  workflowId: string;
  name: string;
  description: string;
  systemPrompt: string;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConversation {
  id: string;
  ownerId: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AgentConversationDetail extends AgentConversation {
  messages: AgentMessage[];
}

export interface AgentChatResult {
  conversationId: string;
  userMessage: AgentMessage;
  assistantMessage: AgentMessage;
  execution: ExecutionDetail;
}

export interface AgentPayload {
  workflowId?: string;
  name?: string;
  description?: string;
  systemPrompt?: string;
  status?: AgentStatus;
}

export type ExecutionStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
export type ExecutionTrigger = 'manual' | 'webhook' | 'cron';

export interface Execution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  /** How the run was started. */
  triggerType: ExecutionTrigger;
  triggerId: string | null;
  /** Parent run id when spawned by a sub-workflow / loop node. */
  parentExecutionId: string | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  durationMs: number;
  startedAt: string;
  finishedAt: string | null;
}

export interface NodeExecution {
  id: string;
  executionId: string;
  nodeId: string;
  nodeType: string;
  status: ExecutionStatus | 'skipped';
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  durationMs: number;
  startedAt: string;
}

export interface ExecutionDetail extends Execution {
  nodes: NodeExecution[];
}

/** LLM provider configuration (apiKey never leaves the server unmasked). */
export interface ModelConfig {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  maskedKey: string;
  hasKey: boolean;
  temperature: number | null;
  type: 'llm' | 'embedding';
  isDefault: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModelConfigPayload {
  name?: string;
  model?: string;
  baseUrl?: string;
  apiKey?: string;
  temperature?: number;
  type?: 'llm' | 'embedding';
  isDefault?: boolean;
  enabled?: boolean;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  embeddingModelConfigId: string | null;
  chunkSeparator: string;
  chunkSize: number;
  chunkOverlap: number;
  preprocessWhitespace: boolean;
  preprocessUrls: boolean;
  searchMode: 'vector' | 'fulltext' | 'hybrid';
  topK: number;
  scoreThreshold: number;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  knowledgeBaseId: string;
  content: string;
  sourceTitle: string;
  metadata: string;
  createdAt: string;
}

export interface ModelTestResult {
  ok: boolean;
  model?: string;
  latencyMs?: number;
  text?: string;
  error?: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
  enabled: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

/** Password is returned only once, right after provisioning or a reset. */
export interface ProvisionedUser {
  user: User;
  password: string;
}

// ---------------------------------------------------------------- triggers

export type TriggerType = 'webhook' | 'cron';

export interface Trigger {
  id: string;
  workflowId: string;
  type: TriggerType;
  name: string;
  cronExpression: string;
  payload: Record<string, unknown> | null;
  enabled: boolean;
  /** Webhook runs are enqueued asynchronously instead of blocking the caller. */
  async: boolean;
  /** Whether the webhook requires an HMAC signature header. */
  signatureRequired: boolean;
  /** Revealed exactly once, right after enabling signature verification. */
  secret: string | null;
  triggerCount: number;
  lastStatus: 'idle' | 'success' | 'failed';
  lastTriggeredAt: string | null;
  lastError: string | null;
  createdAt: string;
  /** Callback path for webhooks, e.g. `/api/hooks/<token>`. */
  webhookPath: string | null;
  nextRunAt: string | null;
}

export interface TriggerPayload {
  name?: string;
  cronExpression?: string;
  payload?: Record<string, unknown>;
  enabled?: boolean;
  async?: boolean;
  requireSignature?: boolean;
}

// ------------------------------------------------------- import / export

export interface WorkflowExport {
  format: 'zcl-flow/workflow';
  version: 1;
  exportedAt: string;
  name: string;
  description: string;
  definition: WorkflowDefinition | null;
}

// ------------------------------------------------------------ live events

export type ExecutionEventType =
  | 'execution.started'
  | 'node.started'
  | 'node.finished'
  | 'execution.finished'
  | 'debug.paused'
  | 'debug.resumed';

export interface ExecutionEvent {
  type: ExecutionEventType;
  executionId: string;
  workflowId: string;
  at: number;
  payload: {
    nodeId?: string;
    nodeType?: string;
    title?: string;
    status?: string;
    branch?: string | null;
    output?: Record<string, unknown>;
    error?: string;
    durationMs?: number;
    triggerType?: ExecutionTrigger;
    input?: Record<string, unknown>;
    /** Debug event: which pause step this is. */
    step?: number;
    /** Debug event: variable snapshot for the monitor. */
    snapshot?: DebugSnapshot;
  };
}

// -------------------------------------------------------------- debugging

/** A user-provided stand-in output for one node, applied during a debug run. */
export interface NodeMock {
  output: Record<string, unknown>;
  /** For branching nodes: which port to follow when the node is mocked. */
  branch?: string;
}

/** Debug options supplied when starting a debug run. */
export interface DebugConfig {
  breakpoints?: string[];
  conditions?: Record<string, string>;
  mocks?: Record<string, NodeMock>;
  pauseOnStart?: boolean;
}

/** Variable snapshot captured each time a debug run pauses. */
export interface DebugSnapshot {
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
  outputs: Record<string, Record<string, unknown>>;
}

/** State returned by GET /executions/:id/debug. */
export interface DebugState {
  executionId: string;
  pausedNodeId: string | null;
  step: number;
  breakpoints: string[];
  conditions: Record<string, string>;
  mocks: Record<string, NodeMock>;
  snapshot: DebugSnapshot | null;
  stopped: boolean;
}

// ------------------------------------------------------------- statistics

export interface StatsDailyPoint {
  date: string;
  total: number;
  success: number;
  failed: number;
}

export interface StatsFailingNode {
  nodeId: string;
  nodeType: string;
  failures: number;
  lastError: string | null;
}

export interface StatsWorkflowUsage {
  workflowId: string;
  name: string;
  runs: number;
  failed: number;
  avgDurationMs: number;
}

export interface ExecutionStats {
  days: number;
  total: number;
  byStatus: Record<ExecutionStatus, number>;
  byTrigger: Record<ExecutionTrigger, number>;
  successRate: number;
  avgDurationMs: number;
  p50DurationMs: number;
  p95DurationMs: number;
  daily: StatsDailyPoint[];
  topFailingNodes: StatsFailingNode[];
  topWorkflows: StatsWorkflowUsage[];
  queue?: { queued: number; running: number; concurrency: number };
}
