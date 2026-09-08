import { RunContext } from './engine.types';

/**
 * Resolve a dotted path (e.g. "input.city" or "nodes.llm_1.text")
 * against the run context.
 */
export function resolvePath(path: string, ctx: RunContext): unknown {
  const scopes: Record<string, unknown> = {
    input: ctx.input,
    nodes: ctx.outputs,
    variables: ctx.variables,
  };
  const segments = path.trim().split('.');
  let current: any = scopes;
  for (const segment of segments) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return current;
}

/**
 * Interpolate "{{ path }}" template expressions inside a string.
 * If the whole string is a single expression, the raw value is returned
 * (preserving objects/numbers); otherwise values are stringified.
 */
export function interpolate(template: string, ctx: RunContext): unknown {
  if (typeof template !== 'string') return template;

  const single = template.match(/^\s*\{\{([^}]+)\}\}\s*$/);
  if (single) {
    return resolvePath(single[1], ctx);
  }

  return template.replace(/\{\{([^}]+)\}\}/g, (_, expr: string) => {
    const value = resolvePath(expr, ctx);
    if (value == null) return '';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  });
}

/** Deeply interpolate all string values of an object. */
export function interpolateDeep<T>(value: T, ctx: RunContext): T {
  if (typeof value === 'string') {
    return interpolate(value, ctx) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => interpolateDeep(item, ctx)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = interpolateDeep(val, ctx);
    }
    return result as unknown as T;
  }
  return value;
}
