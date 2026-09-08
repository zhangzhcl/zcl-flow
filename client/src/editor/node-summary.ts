/**
 * One-line summary shown on the compact canvas card for each node type.
 * The full configuration lives in the property panel; the card only surfaces
 * the single most informative field so the canvas stays glanceable.
 */

function truncate(value: unknown, max = 42): string {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function countCategories(raw: unknown): string {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
    if (Array.isArray(parsed)) return `${parsed.length}`;
  } catch {
    return '';
  }
  return '';
}

/** Returns a short human-readable summary, or `null` when nothing useful. */
export function getNodeSummary(type: string, data: Record<string, unknown> | undefined): string | null {
  if (!data) return null;
  switch (type) {
    case 'llm':
      return truncate(data.prompt) || null;
    case 'code':
      return truncate(data.code) || 'JavaScript';
    case 'condition':
      return truncate(data.expression) || null;
    case 'http': {
      const method = String(data.method ?? 'GET');
      const url = truncate(data.url, 32);
      return url ? `${method} ${url}` : method;
    }
    case 'template':
      return truncate(data.template) || null;
    case 'variable':
      return truncate(data.assignments) || null;
    case 'delay':
      return data.ms != null && data.ms !== '' ? `${data.ms} ms` : null;
    case 'switch':
      return truncate(data.case1) || null;
    case 'subflow':
      return data.workflowId ? truncate(data.workflowId, 24) : null;
    case 'loop':
      return truncate(data.items) || null;
    case 'json':
      return truncate(data.source) || null;
    case 'classify': {
      const count = countCategories(data.categories);
      return count ? `${count} categories` : null;
    }
    case 'text':
      return data.operation ? String(data.operation) : null;
    case 'aggregate':
      return data.mode ? String(data.mode) : null;
    case 'notify':
      return truncate(data.webhookUrl, 32) || null;
    case 'batch':
      return truncate(data.items) || null;
    case 'assign':
      return truncate(data.assignments) || null;
    case 'json_stringify':
      return truncate(data.value) || null;
    case 'json_parse':
      return truncate(data.jsonStr) || null;
    case 'text_process':
      return data.op ? String(data.op) : null;
    case 'question':
      return truncate(data.question) || null;
    case 'knowledge_retrieve':
      return truncate(data.query) || null;
    case 'knowledge_write':
      return truncate(data.knowledgeId, 28) || null;
    case 'sql_custom':
      return truncate(data.sql) || null;
    case 'data_create':
    case 'data_query':
    case 'data_update':
    case 'data_delete':
      return data.tableName ? String(data.tableName) : null;
    case 'parameter_extractor':
      return truncate(data.input, 28) || null;
    case 'human_input':
      return truncate(data.prompt, 28) || null;
    case 'memory':
      return data.operation ? `${data.operation} ${data.key ?? 'history'}` : null;
    case 'condition_branch': {
      const branches = Array.isArray(data.branches) ? data.branches : [];
      if (branches.length === 0) return null;
      const names = branches.map((b: any) => b.name || '条件').join(' / ');
      return `IF: ${names}`;
    }
    case 'list_loop':
      return truncate(data.items) || '列表循环';
    case 'condition_loop':
      return truncate(data.stopCondition) || `最多 ${data.maxIterations ?? 10} 次`;
    default:
      return null;
  }
}
