import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as vm from 'vm';
import * as child_process from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import {
  ExecutionCancelledError,
  FlowNode,
  NodeExecutor,
  NodeResult,
  RunContext,
  assertNotCancelled,
} from './engine.types';
import { interpolate, interpolateDeep } from './template.util';
import { LlmService } from '../llm/llm.service';
import { KnowledgeService, type RetrievedChunk } from '../knowledge/knowledge.service';
import { ModelsService } from '../models/models.service';
import { WorkflowEntity } from '../workflows/workflow.entity';
import { WORKFLOW_RUNNER, WorkflowRunner } from './workflow-runner';

/** Evaluate a boolean expression in a sandboxed vm context. */
function evalBool(expression: string, ctx: RunContext): boolean {
  try {
    const sandbox = { input: ctx.input, nodes: ctx.outputs, variables: ctx.variables };
    const context = vm.createContext(sandbox, {
      codeGeneration: { strings: false, wasm: false },
    });
    return Boolean(new vm.Script(`(${expression})`).runInContext(context, { timeout: 1000 }));
  } catch {
    return false;
  }
}

/** Start node: exposes workflow input as its output. */
@Injectable()
export class StartExecutor implements NodeExecutor {
  readonly type = 'start';

  async execute(_node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    return { output: { ...ctx.input } };
  }
}

/** End node: collects the final workflow output. */
@Injectable()
export class EndExecutor implements NodeExecutor {
  readonly type = 'end';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    let template: unknown = node.data?.outputs ?? node.data?.output ?? {};
    const outputParams = node.data?.outputParams;
    if (Array.isArray(outputParams) && outputParams.length > 0) {
      template = Object.fromEntries(
        (outputParams as Array<{ name: string; expr: string }>).map((p) => [p.name, p.expr]),
      );
    }
    const output = interpolateDeep(template, ctx);
    return { output: typeof output === 'object' && output !== null ? (output as Record<string, unknown>) : { result: output } };
  }
}

/** LLM node: prompt template -> chat completion with resolved provider config. */
@Injectable()
export class LlmExecutor implements NodeExecutor {
  readonly type = 'llm';

  constructor(
    private readonly llm: LlmService,
    private readonly models: ModelsService,
  ) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    let prompt = String(interpolate(String(data.prompt ?? ''), ctx) ?? '');
    const systemPrompt = data.systemPrompt
      ? String(interpolate(String(data.systemPrompt), ctx) ?? '')
      : undefined;

    // When the workflow is invoked via agent chat, ctx.input carries the
    // user's current message and prior conversation turns. If the prompt
    // template does not embed the message (i.e. the user hasn't added
    // {{input.message}} to it), auto-append the message so the LLM always
    // sees what the user actually asked — preventing the "same reply every
    // time" symptom where a static prompt is sent regardless of user input.
    const currentMessage =
      typeof ctx.input.message === 'string' ? ctx.input.message.trim() : '';
    if (currentMessage && !prompt.includes(currentMessage)) {
      prompt = prompt ? `${prompt}\n\n${currentMessage}` : currentMessage;
    }

    // Conversation history from agent chat — pass prior turns to the LLM so
    // it has proper context across messages in a conversation session.
    const rawHistory = ctx.input.history;
    const history = Array.isArray(rawHistory)
      ? (rawHistory as Array<{ role: string; content: string }>)
          .filter((m) => m.role && m.content)
          .map((m) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: String(m.content),
          }))
      : undefined;

    // Images passed from the debug chat panel (paste / upload). The node's own
    // imageUrl field takes precedence; fall back to the chat-supplied array.
    const nodeImageUrl = data.imageUrl
      ? String(interpolate(String(data.imageUrl), ctx) ?? '').trim()
      : '';
    const inputImageUrls = Array.isArray(ctx.input.imageUrls)
      ? (ctx.input.imageUrls as unknown[]).map(String).filter(Boolean)
      : [];
    const imageUrls = nodeImageUrl
      ? [nodeImageUrl]
      : inputImageUrls.length
      ? inputImageUrls
      : undefined;

    const config = await this.models.resolveConfig(
      data.modelConfigId ? String(data.modelConfigId) : undefined,
    );

    const response = await this.llm.complete({
      prompt,
      systemPrompt,
      history,
      imageUrls,
      config,
      signal: ctx.signal,
      model: data.model ? String(data.model) : undefined,
      temperature: data.temperature != null && data.temperature !== ''
        ? Number(data.temperature)
        : undefined,
      maxTokens: data.maxTokens != null && data.maxTokens !== ''
        ? Number(data.maxTokens)
        : undefined,
    });

    return {
      output: {
        text: response.text,
        model: response.model,
        mock: response.mock,
        usage: response.usage,
      },
    };
  }
}

/** Code node: runs user JavaScript in a sandboxed vm context. */
@Injectable()
export class CodeExecutor implements NodeExecutor {
  readonly type = 'code';

  constructor(private readonly config: ConfigService) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const code = String(node.data?.code ?? 'return {};');
    const timeout = Number(this.config.get('CODE_NODE_TIMEOUT', 5000));

    const stdoutLines: string[] = [];
    const makeLogger =
      (prefix?: string) =>
      (...args: unknown[]) => {
        const line = args
          .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
          .join(' ');
        stdoutLines.push(prefix ? `[${prefix}] ${line}` : line);
      };

    const sandbox = {
      input: ctx.input,
      nodes: ctx.outputs,
      variables: ctx.variables,
      console: {
        log: makeLogger(),
        info: makeLogger('info'),
        warn: makeLogger('warn'),
        error: makeLogger('error'),
      },
      result: undefined as unknown,
    };
    const context = vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });
    const script = new vm.Script(
      `result = (function main(input, nodes, variables) {\n${code}\n})(input, nodes, variables);`,
    );

    try {
      script.runInContext(context, { timeout });
    } catch (err: any) {
      const stderr = String(err?.message ?? err);
      const stdout = stdoutLines.join('\n');
      throw Object.assign(new Error(stderr), { stdout });
    }

    const value = sandbox.result;
    const output =
      value !== null && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : { result: value };
    const stdout = stdoutLines.join('\n');
    return { output: { ...output, stdout } };
  }
}

/** Condition node: evaluates an expression and selects a branch port. */
@Injectable()
export class ConditionExecutor implements NodeExecutor {
  readonly type = 'condition';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const expression = String(node.data?.expression ?? 'true');
    const resolved = String(interpolate(expression, ctx) ?? 'false');
    const passed = evalBool(resolved, ctx);

    return {
      output: { passed, expression: resolved },
      branch: passed ? 'if_true' : 'if_false',
    };
  }
}

/** HTTP node: performs a request with template-interpolated params. */
@Injectable()
export class HttpExecutor implements NodeExecutor {
  readonly type = 'http';

  constructor(private readonly config: ConfigService) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const url = String(interpolate(String(data.url ?? ''), ctx) ?? '');
    if (!url) {
      throw new Error('HTTP node: url is required');
    }
    const method = String(data.method ?? 'GET').toUpperCase();
    const timeout = Number(this.config.get('HTTP_NODE_TIMEOUT', 15000));

    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (data.headers) {
      try {
        const parsed =
          typeof data.headers === 'string'
            ? JSON.parse(String(interpolate(String(data.headers), ctx)))
            : interpolateDeep(data.headers, ctx);
        headers = { ...headers, ...(parsed as Record<string, string>) };
      } catch {
        // keep default headers when parsing fails
      }
    }

    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD' && data.body) {
      const interpolated = interpolate(String(data.body), ctx);
      body =
        typeof interpolated === 'object'
          ? JSON.stringify(interpolated)
          : String(interpolated ?? '');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const onCancel = () => controller.abort();
    ctx.signal?.addEventListener('abort', onCancel, { once: true });
    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });
      const text = await response.text();
      let parsed: unknown = text;
      try {
        parsed = JSON.parse(text);
      } catch {
        // keep raw text
      }
      return {
        output: { status: response.status, body: parsed },
      };
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        if (ctx.signal?.aborted) throw new ExecutionCancelledError();
        throw new Error(`HTTP node: request timed out after ${timeout}ms (${url})`);
      }
      const detail = error?.cause?.message ?? error?.message ?? String(error);
      throw new Error(`HTTP node: ${detail} (${method} ${url})`);
    } finally {
      clearTimeout(timer);
      ctx.signal?.removeEventListener('abort', onCancel);
    }
  }
}

/** Template node: renders a text template with variable interpolation. */
@Injectable()
export class TemplateExecutor implements NodeExecutor {
  readonly type = 'template';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const template = String(node.data?.template ?? '');
    const text = interpolate(template, ctx);
    return {
      output: { text: typeof text === 'object' ? JSON.stringify(text) : String(text ?? '') },
    };
  }
}

/** Variable node: assigns values into the workflow variable pool. */
@Injectable()
export class VariableExecutor implements NodeExecutor {
  readonly type = 'variable';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const raw = node.data?.assignments ?? '{}';
    let assignments: Record<string, unknown>;
    try {
      assignments =
        typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw as Record<string, unknown>);
    } catch {
      throw new Error('Variable node: assignments must be a valid JSON object');
    }
    const resolved = interpolateDeep(assignments, ctx) as Record<string, unknown>;
    Object.assign(ctx.variables, resolved);
    return { output: resolved };
  }
}

/** Delay node: pauses the flow for the configured milliseconds (capped). */
@Injectable()
export class DelayExecutor implements NodeExecutor {
  readonly type = 'delay';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const MAX_DELAY = 30000;
    const raw = interpolate(String(node.data?.ms ?? '0'), ctx);
    const ms = Math.min(Math.max(Number(raw) || 0, 0), MAX_DELAY);
    assertNotCancelled(ctx);

    // Resolve early when the run is cancelled instead of holding the wave.
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        ctx.signal?.removeEventListener('abort', onCancel);
        resolve();
      }, ms);
      function onCancel() {
        clearTimeout(timer);
        reject(new ExecutionCancelledError());
      }
      ctx.signal?.addEventListener('abort', onCancel, { once: true });
    });
    return { output: { waitedMs: ms } };
  }
}

/** Switch node: multi-way branch (case_1 / case_2 / default). */
@Injectable()
export class SwitchExecutor implements NodeExecutor {
  readonly type = 'switch';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const cases: Array<{ port: string; expression: string }> = [
      { port: 'case_1', expression: String(data.case1 ?? '') },
      { port: 'case_2', expression: String(data.case2 ?? '') },
    ];

    for (const item of cases) {
      if (!item.expression.trim()) continue;
      const resolved = String(interpolate(item.expression, ctx) ?? 'false');
      if (evalBool(resolved, ctx)) {
        return { output: { matched: item.port, expression: resolved }, branch: item.port };
      }
    }
    return { output: { matched: 'default' }, branch: 'default' };
  }
}

/**
 * Shared machinery for nodes that run another workflow.
 *
 * Implemented as a plain helper rather than an abstract base class on purpose:
 * a subclass that does not redeclare its constructor emits no
 * `design:paramtypes` metadata, so Nest would instantiate it with no
 * dependencies at all.
 */
class WorkflowInvoker {
  constructor(
    private readonly workflows: Repository<WorkflowEntity>,
    private readonly engine: WorkflowRunner,
    private readonly config: ConfigService,
  ) {}

  /** Loads the target workflow, enforcing ownership and recursion limits. */
  async resolveTarget(workflowId: string, ctx: RunContext): Promise<WorkflowEntity> {
    if (!workflowId) {
      throw new Error('No target workflow selected');
    }
    const maxDepth = Number(this.config.get('MAX_SUBFLOW_DEPTH', 3));
    if (ctx.depth >= maxDepth) {
      throw new Error(`Sub-workflow nesting limit reached (MAX_SUBFLOW_DEPTH=${maxDepth})`);
    }
    if (ctx.callStack.includes(workflowId)) {
      throw new Error(
        `Recursive sub-workflow call detected: ${[...ctx.callStack, workflowId].join(' -> ')}`,
      );
    }

    const target = await this.workflows.findOneBy({ id: workflowId });
    if (!target) {
      throw new Error(`Target workflow ${workflowId} not found`);
    }
    // A sub-workflow must belong to the same account as the caller.
    if (target.ownerId !== ctx.ownerId) {
      throw new ForbiddenException('You do not have access to the target workflow');
    }
    return target;
  }

  /** Runs the target workflow as a child execution of the current run. */
  invoke(target: WorkflowEntity, input: Record<string, unknown>, ctx: RunContext) {
    return this.engine.run(target, input, {
      signal: ctx.signal,
      parentExecutionId: ctx.executionId,
      depth: ctx.depth + 1,
      callStack: ctx.callStack,
      triggerType: 'manual',
    });
  }

  limit(key: string, fallback: number): number {
    return Number(this.config.get(key, fallback));
  }
}

/** Parses a JSON-object node field, with template interpolation applied. */
function parseObjectField(
  raw: unknown,
  ctx: RunContext,
  label: string,
): Record<string, unknown> {
  if (raw === undefined || raw === null || raw === '') return {};
  let parsed: unknown;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    throw new Error(`${label} must be a valid JSON object`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${label} must be a valid JSON object`);
  }
  return interpolateDeep(parsed, ctx) as Record<string, unknown>;
}

/**
 * Sub-workflow node: runs another workflow and exposes its output.
 * This is the reuse primitive - extract a shared sequence once, call it from
 * many workflows.
 */
@Injectable()
export class SubflowExecutor implements NodeExecutor {
  readonly type = 'subflow';
  private readonly invoker: WorkflowInvoker;

  constructor(
    @InjectRepository(WorkflowEntity) workflows: Repository<WorkflowEntity>,
    @Inject(WORKFLOW_RUNNER) engine: WorkflowRunner,
    config: ConfigService,
  ) {
    this.invoker = new WorkflowInvoker(workflows, engine, config);
  }

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    assertNotCancelled(ctx);
    const data = node.data ?? {};
    const target = await this.invoker.resolveTarget(String(data.workflowId ?? ''), ctx);
    const input = parseObjectField(data.input, ctx, 'Sub-workflow input');

    const child = await this.invoker.invoke(target, input, ctx);
    if (child.status === 'cancelled') {
      throw new ExecutionCancelledError();
    }
    if (child.status !== 'success') {
      throw new Error(`Sub-workflow "${target.name}" failed: ${child.error ?? 'unknown error'}`);
    }
    return {
      output: {
        ...(child.output ?? {}),
        // Kept flat alongside the payload so the UI can drill into the child run.
        executionId: child.id,
        workflowName: target.name,
      },
    };
  }
}

/**
 * Loop node: iterates over an array and runs a sub-workflow per item.
 *
 * Implemented on top of the sub-workflow primitive rather than as a nested
 * canvas: the loop body is a normal, independently testable workflow, and the
 * free-layout editor stays free of nested sub-graphs.
 */
@Injectable()
export class LoopExecutor implements NodeExecutor {
  readonly type = 'loop';
  private readonly invoker: WorkflowInvoker;

  constructor(
    @InjectRepository(WorkflowEntity) workflows: Repository<WorkflowEntity>,
    @Inject(WORKFLOW_RUNNER) engine: WorkflowRunner,
    config: ConfigService,
  ) {
    this.invoker = new WorkflowInvoker(workflows, engine, config);
  }

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    assertNotCancelled(ctx);
    const data = node.data ?? {};
    const target = await this.invoker.resolveTarget(String(data.workflowId ?? ''), ctx);

    const items = this.resolveItems(data.items, ctx);
    const maxItems = this.invoker.limit('MAX_LOOP_ITEMS', 50);
    if (items.length > maxItems) {
      throw new Error(`Loop node: ${items.length} items exceeds MAX_LOOP_ITEMS (${maxItems})`);
    }
    const concurrency = Math.min(
      Math.max(Number(data.concurrency) || 1, 1),
      this.invoker.limit('MAX_LOOP_CONCURRENCY', 4),
    );
    const continueOnError = data.continueOnError === true || data.continueOnError === 'true';
    const extraInput = parseObjectField(data.input, ctx, 'Loop input');

    const results: Array<Record<string, unknown> | null> = new Array(items.length).fill(null);
    const errors: Array<{ index: number; error: string }> = [];
    let broken = false;

    for (let offset = 0; offset < items.length; offset += concurrency) {
      if (broken) break;
      assertNotCancelled(ctx);
      const slice = items.slice(offset, offset + concurrency);
      try {
        await Promise.all(
          slice.map(async (item, position) => {
            const index = offset + position;
            try {
              const child = await this.invoker.invoke(
                target,
                { ...extraInput, item, index },
                ctx,
              );
              if (child.status === 'cancelled') throw new ExecutionCancelledError();
              if (child.status !== 'success') {
                throw new Error(child.error ?? 'unknown error');
              }
              results[index] = child.output ?? {};
            } catch (error: any) {
              if (error instanceof ExecutionCancelledError) throw error;
              if (error?.name === 'LoopBreakError' || error?.message === '__loop_break__') throw error;
              errors.push({ index, error: String(error?.message ?? error) });
              if (!continueOnError) throw error;
            }
          }),
        );
      } catch (error: any) {
        if (error instanceof ExecutionCancelledError) throw error;
        if (error?.name === 'LoopBreakError' || error?.message === '__loop_break__') {
          broken = true;
          break;
        }
        throw error;
      }
    }

    if (errors.length && !continueOnError) {
      throw new Error(`Loop node: item ${errors[0].index} failed: ${errors[0].error}`);
    }

    const finalCount = results.filter((r) => r !== null).length + errors.length;
    return {
      output: {
        results,
        count: finalCount,
        succeeded: results.filter((r) => r !== null).length,
        failed: errors.length,
        broken,
        errors,
      },
    };
  }

  /** Accepts a template reference, a JSON array literal, or a live array. */
  private resolveItems(raw: unknown, ctx: RunContext): unknown[] {
    if (Array.isArray(raw)) return raw;
    const text = String(raw ?? '').trim();
    if (!text) return [];

    const resolved = interpolate(text, ctx);
    if (Array.isArray(resolved)) return resolved;
    if (typeof resolved === 'string') {
      try {
        const parsed = JSON.parse(resolved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fall through to the error below
      }
    }
    throw new Error(
      'Loop node: "items" must resolve to an array (e.g. {{nodes.code_1.list}} or ["a","b"])',
    );
  }
}

/* ------------------------------------------------------------------ */
/* AI-native nodes (v0.6)                                             */
/* ------------------------------------------------------------------ */

/**
 * JSON extract node: parses structured JSON out of (usually LLM-produced)
 * text. Understands ```json fenced blocks as well as raw JSON, and can
 * optionally validate that a set of top-level keys is present. Pure parsing -
 * no model call - so it is cheap and deterministic.
 */
@Injectable()
export class JsonExtractExecutor implements NodeExecutor {
  readonly type = 'json';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const source = String(interpolate(String(data.source ?? ''), ctx) ?? '');
    const mode = String(data.extractMode ?? 'auto');

    const candidate = this.extract(source, mode);
    let parsed: unknown;
    try {
      parsed = JSON.parse(candidate);
    } catch {
      // Extraction is best-effort: report validity instead of failing the run.
      return { output: { data: null, valid: false, error: 'No valid JSON found' } };
    }

    const schemaRaw = String(data.schema ?? '').trim();
    let valid = true;
    if (schemaRaw && parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const keys = schemaRaw
        .split(',')
        .map((key) => key.trim())
        .filter(Boolean);
      valid = keys.every((key) => key in (parsed as Record<string, unknown>));
    }

    return { output: { data: parsed, valid } };
  }

  /** Pulls the JSON payload out of the source text according to the mode. */
  private extract(source: string, mode: string): string {
    const trimmed = source.trim();
    if (mode === 'raw') return trimmed;
    const block = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (mode === 'codeBlock') return block ? block[1].trim() : trimmed;
    // auto: prefer a fenced block, fall back to the whole text
    return block ? block[1].trim() : trimmed;
  }
}

/**
 * Classify node: asks an LLM to route a piece of text into one of the
 * configured categories and selects the matching branch port (cat_0, cat_1,
 * ... or `otherwise` when nothing matches).
 */
@Injectable()
export class ClassifyExecutor implements NodeExecutor {
  readonly type = 'classify';

  constructor(
    private readonly llm: LlmService,
    private readonly models: ModelsService,
  ) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const input = String(interpolate(String(data.input ?? ''), ctx) ?? '');
    const categories = this.parseCategories(data.categories);
    if (categories.length === 0) {
      throw new Error('Classify node: at least one category is required');
    }

    const config = await this.models.resolveConfig(
      data.modelConfigId ? String(data.modelConfigId) : undefined,
    );

    const list = categories
      .map((category: any, index: number) => {
        const line = `${index}. ${category.name}${category.description ? ` - ${category.description}` : ''}`;
        const examples: string[] = Array.isArray(category.examples) ? category.examples.filter(Boolean) : [];
        return examples.length ? `${line}\n   Examples: ${examples.join('; ')}` : line;
      })
      .join('\n');
    const prompt = [
      'Classify the following text into exactly one of the categories below.',
      'Categories:',
      list,
      '',
      'Text:',
      input,
      '',
      'Reply with ONLY the category name, nothing else.',
    ].join('\n');

    const response = await this.llm.complete({ prompt, config, signal: ctx.signal });
    const answer = String(response.text ?? '').trim();

    const normalized = answer
      .toLowerCase()
      .replace(/^["'`]+|["'`。，,.!！?？]+$/g, '')
      .trim();
    let index = categories.findIndex((category) => category.name.toLowerCase() === normalized);
    if (index === -1) {
      index = categories.findIndex((category) =>
        normalized.includes(category.name.toLowerCase()),
      );
    }

    const branch = index >= 0 ? `cat_${index}` : 'otherwise';
    return {
      output: {
        category: index >= 0 ? categories[index].name : null,
        index,
        raw: answer,
        mock: response.mock,
      },
      branch,
    };
  }

  /** Accepts a JSON array literal (string) or a live array of categories. */
  private parseCategories(
    raw: unknown,
  ): Array<{ name: string; description?: string; examples?: string[] }> {
    const normalize = (items: unknown[]) =>
      items
        .map((item: any) => ({
          name: String(item?.name ?? '').trim(),
          description: item?.description ? String(item.description) : undefined,
          examples: Array.isArray(item?.examples) ? item.examples.map(String).filter(Boolean) : undefined,
        }))
        .filter((category) => category.name);

    if (Array.isArray(raw)) return normalize(raw);
    const text = String(raw ?? '').trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return normalize(parsed);
    } catch {
      // fall through to empty result
    }
    return [];
  }
}

/**
 * Text process node: a batteries-included LLM wrapper for the common text
 * operations (summarize / extract / translate / rewrite / custom), so users do
 * not have to hand-write a prompt for each one.
 */
@Injectable()
export class TextProcessExecutor implements NodeExecutor {
  readonly type = 'text';

  constructor(
    private readonly llm: LlmService,
    private readonly models: ModelsService,
  ) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const operation = String(data.operation ?? 'summarize');
    const input = String(interpolate(String(data.input ?? ''), ctx) ?? '');
    const instruction = data.instruction
      ? String(interpolate(String(data.instruction), ctx) ?? '')
      : '';

    const config = await this.models.resolveConfig(
      data.modelConfigId ? String(data.modelConfigId) : undefined,
    );

    const response = await this.llm.complete({
      prompt: input,
      systemPrompt: this.systemPromptFor(operation, instruction),
      config,
      signal: ctx.signal,
    });

    return { output: { text: response.text, operation, mock: response.mock } };
  }

  private systemPromptFor(operation: string, instruction: string): string {
    const extra = instruction ? `\nAdditional instruction: ${instruction}` : '';
    switch (operation) {
      case 'extract':
        return `Extract the key information from the user's text and present it clearly and concisely.${extra}`;
      case 'translate':
        return `Translate the user's text. If it is Chinese, translate it to English; otherwise translate it to Chinese.${extra}`;
      case 'rewrite':
        return `Rewrite and polish the user's text. Keep the original meaning while improving clarity and tone.${extra}`;
      case 'custom':
        return instruction || 'Process the user\'s text as instructed.';
      case 'summarize':
      default:
        return `Summarize the user's text concisely, preserving the key points.${extra}`;
    }
  }
}

/**
 * Aggregate node: merges the outputs of its direct predecessors. Useful after
 * a multi-way split (classify / condition / switch) to recombine the branch
 * results before continuing. `object` mode keys outputs by node id; `array`
 * mode collects them in edge order.
 */
@Injectable()
export class AggregateExecutor implements NodeExecutor {
  readonly type = 'aggregate';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const mode = String(node.data?.mode ?? 'object');
    const predecessorIds = [
      ...new Set(
        (ctx.edges ?? [])
          .filter((edge) => edge.targetNodeID === node.id)
          .map((edge) => edge.sourceNodeID),
      ),
    ];

    if (mode === 'array') {
      const items = predecessorIds
        .filter((id) => ctx.outputs[id] !== undefined)
        .map((id) => ctx.outputs[id]);
      return { output: { items, count: items.length } };
    }

    const merged: Record<string, unknown> = {};
    for (const id of predecessorIds) {
      if (ctx.outputs[id] !== undefined) {
        merged[id] = ctx.outputs[id];
      }
    }
    return { output: merged };
  }
}

/* ------------------------------------------------------------------ */
/* Batch node                                                          */
/* ------------------------------------------------------------------ */

/**
 * Batch node: processes every item in an array concurrently via a sub-workflow.
 * Unlike the loop node the default concurrency is higher (4) and errors are
 * always collected (non-fatal) so one item's failure does not abort the batch.
 */
@Injectable()
export class BatchExecutor implements NodeExecutor {
  readonly type = 'batch';
  private readonly invoker: WorkflowInvoker;

  constructor(
    @InjectRepository(WorkflowEntity) workflows: Repository<WorkflowEntity>,
    @Inject(WORKFLOW_RUNNER) engine: WorkflowRunner,
    config: ConfigService,
  ) {
    this.invoker = new WorkflowInvoker(workflows, engine, config);
  }

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    assertNotCancelled(ctx);
    const data = node.data ?? {};
    const target = await this.invoker.resolveTarget(String(data.workflowId ?? ''), ctx);

    const items = this.resolveItems(data.items, ctx);
    const maxItems = this.invoker.limit('MAX_BATCH_ITEMS', 100);
    if (items.length > maxItems) {
      throw new Error(`Batch node: ${items.length} items exceeds MAX_BATCH_ITEMS (${maxItems})`);
    }
    const concurrency = Math.min(
      Math.max(Number(data.concurrency) || 4, 1),
      this.invoker.limit('MAX_BATCH_CONCURRENCY', 8),
    );
    const extraInput = parseObjectField(data.input, ctx, 'Batch input');

    const results: Array<Record<string, unknown> | null> = new Array(items.length).fill(null);
    const errors: Array<{ index: number; error: string }> = [];

    for (let offset = 0; offset < items.length; offset += concurrency) {
      assertNotCancelled(ctx);
      const slice = items.slice(offset, offset + concurrency);
      await Promise.all(
        slice.map(async (item, position) => {
          const index = offset + position;
          try {
            const child = await this.invoker.invoke(target, { ...extraInput, item, index }, ctx);
            if (child.status === 'cancelled') throw new ExecutionCancelledError();
            if (child.status !== 'success') throw new Error(child.error ?? 'unknown error');
            results[index] = child.output ?? {};
          } catch (error: any) {
            if (error instanceof ExecutionCancelledError) throw error;
            errors.push({ index, error: String(error?.message ?? error) });
          }
        }),
      );
    }

    return {
      output: {
        results,
        count: items.length,
        succeeded: items.length - errors.length,
        failed: errors.length,
        errors,
      },
    };
  }

  private resolveItems(raw: unknown, ctx: RunContext): unknown[] {
    if (Array.isArray(raw)) return raw;
    const text = String(raw ?? '').trim();
    if (!text) return [];
    const resolved = interpolate(text, ctx);
    if (Array.isArray(resolved)) return resolved;
    if (typeof resolved === 'string') {
      try {
        const parsed = JSON.parse(resolved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    throw new Error('Batch node: "items" must resolve to an array');
  }
}

/* ------------------------------------------------------------------ */
/* Data / utility nodes                                                */
/* ------------------------------------------------------------------ */

/** Assign node: computes a set of expressions and returns them as output. */
@Injectable()
export class AssignExecutor implements NodeExecutor {
  readonly type = 'assign';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const raw = node.data?.assignments ?? '{}';
    let assignments: Record<string, unknown>;
    try {
      assignments =
        typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw as Record<string, unknown>);
    } catch {
      throw new Error('Assign node: assignments must be a valid JSON object');
    }
    const resolved = interpolateDeep(assignments, ctx) as Record<string, unknown>;
    return { output: resolved };
  }
}

/** JSON stringify node: serialises any value to a JSON string. */
@Injectable()
export class JsonStringifyExecutor implements NodeExecutor {
  readonly type = 'json_stringify';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const raw = node.data?.value ?? '';
    const resolved =
      typeof raw === 'string' ? interpolate(raw, ctx) : interpolateDeep(raw, ctx);
    try {
      return { output: { jsonStr: JSON.stringify(resolved) } };
    } catch (err: any) {
      throw new Error(`JSON stringify node: ${err?.message ?? err}`);
    }
  }
}

/** JSON parse node: parses a JSON string into a structured value. */
@Injectable()
export class JsonParseExecutor implements NodeExecutor {
  readonly type = 'json_parse';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const raw = String(interpolate(String(node.data?.jsonStr ?? ''), ctx) ?? '').trim();
    try {
      return { output: { value: JSON.parse(raw) } };
    } catch {
      throw new Error('JSON parse node: input is not valid JSON');
    }
  }
}

/** Text process node: pure string operations (no AI call). */
@Injectable()
export class TextStringExecutor implements NodeExecutor {
  readonly type = 'text_process';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const text = String(interpolate(String(data.text ?? ''), ctx) ?? '');
    const op = String(data.op ?? 'trim');

    let rawParams: Record<string, unknown> = {};
    try {
      const p = data.params;
      rawParams = typeof p === 'string' ? JSON.parse(p || '{}') : (p ?? {});
    } catch {}

    let result: unknown;
    switch (op) {
      case 'replace': {
        const from = String(rawParams.from ?? '');
        const to = String(rawParams.to ?? '');
        result = text.split(from).join(to);
        break;
      }
      case 'split': {
        const sep = String(rawParams.separator ?? ',');
        result = text.split(sep);
        break;
      }
      case 'substr': {
        const start = Number(rawParams.start ?? 0);
        const end = rawParams.end != null ? Number(rawParams.end) : undefined;
        result = end != null ? text.slice(start, end) : text.slice(start);
        break;
      }
      case 'trim':
        result = text.trim();
        break;
      case 'upper':
        result = text.toUpperCase();
        break;
      case 'lower':
        result = text.toLowerCase();
        break;
      case 'length':
        result = text.length;
        break;
      default:
        result = text;
    }
    return { output: { result, original: text } };
  }
}

/** Question node: pauses the workflow to collect user input (stub). */
@Injectable()
export class QuestionExecutor implements NodeExecutor {
  readonly type = 'question';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const question = String(interpolate(String(node.data?.question ?? ''), ctx) ?? '');
    // Workflow pause / resume is not yet implemented; the node outputs the
    // question text and a null answer as a no-op placeholder.
    return { output: { question, answer: null } };
  }
}

/* ------------------------------------------------------------------ */
/* Knowledge-base nodes                                               */
/* ------------------------------------------------------------------ */

@Injectable()
export class KnowledgeRetrieveExecutor implements NodeExecutor {
  readonly type = 'knowledge_retrieve';

  constructor(private readonly knowledge: KnowledgeService) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const knowledgeId = String(interpolate(String(node.data?.knowledgeId ?? ''), ctx) ?? '');
    const query = String(interpolate(String(node.data?.query ?? ''), ctx) ?? '');
    const topK = Number(node.data?.topK ?? 5);
    const scoreThreshold = Number(node.data?.scoreThreshold ?? 0);
    if (!knowledgeId || !query) {
      return { output: { chunks: [], total: 0 } };
    }
    const chunks = await this.knowledge.retrieve(knowledgeId, query, topK, scoreThreshold);
    return { output: { chunks, total: chunks.length } };
  }
}

@Injectable()
export class KnowledgeWriteExecutor implements NodeExecutor {
  readonly type = 'knowledge_write';

  constructor(private readonly knowledge: KnowledgeService) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const knowledgeId = String(interpolate(String(node.data?.knowledgeId ?? ''), ctx) ?? '');
    const docsRaw = String(interpolate(String(node.data?.docs ?? '[]'), ctx) ?? '[]');
    if (!knowledgeId) return { output: { successCount: 0 } };
    let docs: Array<{ content: string; sourceTitle?: string; metadata?: string }> = [];
    try {
      const parsed = JSON.parse(docsRaw);
      docs = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return { output: { successCount: 0, error: 'Invalid docs JSON' } };
    }
    let successCount = 0;
    for (const doc of docs) {
      if (!doc.content) continue;
      await this.knowledge.addDocument(knowledgeId, {
        content: doc.content,
        sourceTitle: doc.sourceTitle,
        metadata: doc.metadata,
      });
      successCount++;
    }
    return { output: { successCount } };
  }
}

/* ------------------------------------------------------------------ */
/* Database nodes (stubs — wire a datasource adapter to activate)     */
/* ------------------------------------------------------------------ */

@Injectable()
export class SqlCustomExecutor implements NodeExecutor {
  readonly type = 'sql_custom';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const sql = String(interpolate(String(node.data?.sql ?? ''), ctx) ?? '');
    // TODO: integrate datasource execution
    return { output: { rows: [], affectedRows: 0, sql } };
  }
}

@Injectable()
export class DataCreateExecutor implements NodeExecutor {
  readonly type = 'data_create';

  async execute(_node: FlowNode, _ctx: RunContext): Promise<NodeResult> {
    // TODO: integrate datasource insert
    return { output: { recordId: '' } };
  }
}

@Injectable()
export class DataQueryExecutor implements NodeExecutor {
  readonly type = 'data_query';

  async execute(_node: FlowNode, _ctx: RunContext): Promise<NodeResult> {
    // TODO: integrate datasource query
    return { output: { records: [], total: 0 } };
  }
}

@Injectable()
export class DataUpdateExecutor implements NodeExecutor {
  readonly type = 'data_update';

  async execute(_node: FlowNode, _ctx: RunContext): Promise<NodeResult> {
    // TODO: integrate datasource update
    return { output: { affectedRows: 0 } };
  }
}

@Injectable()
export class DataDeleteExecutor implements NodeExecutor {
  readonly type = 'data_delete';

  async execute(_node: FlowNode, _ctx: RunContext): Promise<NodeResult> {
    // TODO: integrate datasource delete
    return { output: { affectedRows: 0 } };
  }
}

/**
 * Notify node: pushes the current run state to an external webhook (Slack,
 * DingTalk, Feishu, custom service...). Delivery is best-effort - a failed
 * notification reports `delivered: false` instead of failing the whole run.
 */
/**
 * SendMessage node: sends a reply message back to the caller (Agent chat, API response).
 * Sets output.reply so extractReply() can surface it in the conversation.
 * No external URL needed — works out of the box in debug/agent chat.
 */
@Injectable()
export class SendMessageExecutor implements NodeExecutor {
  readonly type = 'send_message';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    assertNotCancelled(ctx);
    const data = node.data ?? {};
    const raw = String(data.message ?? '');
    const message = String(interpolate(raw, ctx) ?? '');
    return { output: { reply: message, delivered: true } };
  }
}

/* ------------------------------------------------------------------ */
/* Notify (webhook push) node                                           */
/* ------------------------------------------------------------------ */

@Injectable()
export class NotifyExecutor implements NodeExecutor {
  readonly type = 'notify';

  constructor(private readonly config: ConfigService) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const url = String(interpolate(String(data.webhookUrl ?? ''), ctx) ?? '');
    const method = String(data.method ?? 'POST').toUpperCase();
    const timeout = Number(this.config.get('HTTP_NODE_TIMEOUT', 15000));

    let body: string | undefined;
    let payloadValue: unknown;
    if (method !== 'GET' && method !== 'HEAD' && data.payload !== undefined && data.payload !== '') {
      const interpolated =
        typeof data.payload === 'string'
          ? interpolate(String(data.payload), ctx)
          : interpolateDeep(data.payload, ctx);
      payloadValue = interpolated;
      body =
        typeof interpolated === 'object'
          ? JSON.stringify(interpolated)
          : String(interpolated ?? '');
    }

    // No webhook URL configured — dry-run: return payload as output without sending.
    if (!url) {
      return { output: { status: 0, delivered: false, skipped: true, payload: payloadValue } };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const onCancel = () => controller.abort();
    ctx.signal?.addEventListener('abort', onCancel, { once: true });
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });
      return { output: { status: response.status, delivered: response.ok } };
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        if (ctx.signal?.aborted) throw new ExecutionCancelledError();
        return {
          output: { status: 0, delivered: false, error: `Timed out after ${timeout}ms` },
        };
      }
      const detail = error?.cause?.message ?? error?.message ?? String(error);
      return { output: { status: 0, delivered: false, error: detail } };
    } finally {
      clearTimeout(timer);
      ctx.signal?.removeEventListener('abort', onCancel);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Loop break signal                                                    */
/* ------------------------------------------------------------------ */

/** Thrown by the break node to exit a loop/batch prematurely. */
export class LoopBreakError extends Error {
  constructor() {
    super('__loop_break__');
    this.name = 'LoopBreakError';
  }
}

/* ------------------------------------------------------------------ */
/* Knowledge answer node                                               */
/* ------------------------------------------------------------------ */

/**
 * Combines knowledge retrieval with an LLM answer step. Retrieves chunks from
 * a knowledge base, builds a context string, and calls the LLM to answer the
 * question grounded in the retrieved content.
 */
@Injectable()
export class KnowledgeAnswerExecutor implements NodeExecutor {
  readonly type = 'knowledge_answer';

  constructor(
    private readonly knowledge: KnowledgeService,
    private readonly llm: LlmService,
    private readonly models: ModelsService,
  ) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const knowledgeId = String(interpolate(String(data.knowledgeId ?? ''), ctx) ?? '');
    const question = String(interpolate(String(data.question ?? ''), ctx) ?? '');
    const topK = Number(data.topK ?? 5);
    const scoreThreshold = Number(data.scoreThreshold ?? 0);
    const customSystemPrompt = data.systemPrompt
      ? String(interpolate(String(data.systemPrompt), ctx) ?? '')
      : '';
    const maxImages = Math.max(0, Number(data.maxImages ?? 4));

    if (!knowledgeId || !question) {
      return { output: { answer: '', chunks: [], sources: [] } };
    }

    const chunks = await this.knowledge.retrieve(knowledgeId, question, topK, scoreThreshold);
    const context = chunks.map((c: any) => c.content).join('\n\n');
    const sources = [...new Set(chunks.map((c: any) => c.sourceTitle).filter(Boolean))];

    const config = await this.models.resolveConfig(
      data.modelConfigId ? String(data.modelConfigId) : undefined,
    );

    const systemPrompt =
      customSystemPrompt ||
      '你是一个知识库问答助手，请基于提供的知识内容准确回答问题。如果知识库中没有相关信息，请如实说明。';
    const prompt = chunks.length
      ? `以下是相关知识库内容：\n\n${context}\n\n---\n\n请基于以上内容回答问题：${question}`
      : `请回答问题（知识库中未检索到相关内容）：${question}`;

    // Retrieved chunks may reference stored images; pass them to the LLM as
    // data URLs (the provider cannot fetch our authenticated asset URLs).
    const assetUrls = maxImages ? this.extractAssetUrls(chunks, maxImages) : [];
    const imageDataUrls = (
      await Promise.all(assetUrls.map((id) => this.knowledge.readAssetDataUrl(id)))
    ).filter((url): url is string => Boolean(url));

    let response;
    try {
      response = await this.llm.complete({
        prompt,
        systemPrompt,
        config,
        signal: ctx.signal,
        imageUrls: imageDataUrls.length ? imageDataUrls : undefined,
      });
    } catch (err) {
      // Vision-capable models only: retry without images so an unsupported
      // provider degrades to a text answer instead of failing the node.
      if (!imageDataUrls.length) throw err;
      response = await this.llm.complete({ prompt, systemPrompt, config, signal: ctx.signal });
    }

    // The answer text is written by the model; image links are appended
    // mechanically so the chat client can render them without trusting the
    // LLM to reproduce long asset URLs verbatim.
    const answer = this.appendImageLinks(response.text, assetUrls);

    return {
      output: {
        answer,
        chunks,
        sources,
        images: assetUrls.map((id) => `/api/knowledge/assets/${id}/file`),
        model: response.model,
        usage: response.usage,
      },
    };
  }

  /** Distinct asset ids referenced by retrieved chunks, in retrieval order. */
  private extractAssetUrls(chunks: RetrievedChunk[], limit: number): string[] {
    const ids: string[] = [];
    for (const chunk of chunks) {
      const re = /!?\[[^\]]*\]\((\/api\/knowledge\/assets\/([a-f0-9-]+)\/file)[^)]*\)|<img[^>]+src=["'](\/api\/knowledge\/assets\/([a-f0-9-]+)\/file)["']/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(chunk.content))) {
        const id = m[2] ?? m[4];
        if (id && !ids.includes(id)) ids.push(id);
        if (ids.length >= limit) return ids;
      }
    }
    return ids;
  }

  /** Appends image markdown links not already present in the answer text. */
  private appendImageLinks(answer: string, assetIds: string[]): string {
    if (!assetIds.length) return answer;
    const missing = assetIds
      .map((id) => `/api/knowledge/assets/${id}/file`)
      .filter((url) => !answer.includes(url));
    if (!missing.length) return answer;
    const links = missing.map((url) => `![图片](${url})`).join('\n\n');
    return answer.trimEnd() + '\n\n' + links;
  }
}

/* ------------------------------------------------------------------ */
/* Break node                                                           */
/* ------------------------------------------------------------------ */

/** Exits the enclosing loop or batch immediately. */
@Injectable()
export class BreakExecutor implements NodeExecutor {
  readonly type = 'break';

  async execute(_node: FlowNode, _ctx: RunContext): Promise<NodeResult> {
    throw new LoopBreakError();
  }
}

/* ------------------------------------------------------------------ */
/* Document parse node                                                  */
/* ------------------------------------------------------------------ */

/**
 * Fetches a URL or accepts inline text and returns the plain-text content.
 * For HTML pages, basic tag stripping is applied. For PDF URLs the binary is
 * fetched — PDF text extraction requires the optional `pdf-parse` package.
 */
@Injectable()
export class DocParseExecutor implements NodeExecutor {
  readonly type = 'doc_parse';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const url = String(interpolate(String(data.url ?? ''), ctx) ?? '').trim();
    const inlineContent = String(interpolate(String(data.content ?? ''), ctx) ?? '').trim();

    if (!url && !inlineContent) {
      return { output: { text: '', chars: 0 } };
    }

    let text = inlineContent;

    if (url) {
      const timeout = 30000;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} fetching ${url}`);
        }
        const contentType = response.headers.get('content-type') ?? '';

        if (contentType.includes('application/pdf')) {
          const buffer = Buffer.from(await response.arrayBuffer());
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require('pdf-parse');
            const result = await pdfParse(buffer);
            text = result.text ?? '';
          } catch {
            text = '[PDF parsing requires the pdf-parse package: npm install pdf-parse]';
          }
        } else {
          const raw = await response.text();
          // Strip HTML tags for web pages
          if (contentType.includes('text/html')) {
            text = raw.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s{2,}/g, ' ')
              .trim();
          } else {
            text = raw;
          }
        }
      } finally {
        clearTimeout(timer);
      }
    }

    return { output: { text, chars: text.length } };
  }
}

/* ------------------------------------------------------------------ */
/* Image Q&A node                                                       */
/* ------------------------------------------------------------------ */

/**
 * Sends one or more image URLs to a vision-capable LLM and returns the
 * answer. Falls back gracefully to a mock when no provider is configured.
 */
@Injectable()
export class ImageQaExecutor implements NodeExecutor {
  readonly type = 'image_qa';

  constructor(
    private readonly llm: LlmService,
    private readonly models: ModelsService,
  ) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const imageUrl = String(interpolate(String(data.imageUrl ?? ''), ctx) ?? '').trim();
    const question = String(interpolate(String(data.question ?? ''), ctx) ?? '');

    if (!imageUrl) {
      return { output: { answer: '', model: '' } };
    }

    const config = await this.models.resolveConfig(
      data.modelConfigId ? String(data.modelConfigId) : undefined,
    );

    const response = await this.llm.complete({
      prompt: question || '请描述这张图片的内容。',
      imageUrls: [imageUrl],
      config,
      signal: ctx.signal,
    });

    return { output: { answer: response.text, model: response.model, usage: response.usage } };
  }
}

/* ------------------------------------------------------------------ */
/* OCR node                                                             */
/* ------------------------------------------------------------------ */

/**
 * Extracts all text from an image using a vision-capable LLM.
 * The system prompt instructs the model to return only the raw OCR text.
 */
@Injectable()
export class OcrExecutor implements NodeExecutor {
  readonly type = 'ocr';

  constructor(
    private readonly llm: LlmService,
    private readonly models: ModelsService,
  ) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const imageUrl = String(interpolate(String(data.imageUrl ?? ''), ctx) ?? '').trim();

    if (!imageUrl) {
      return { output: { text: '', model: '' } };
    }

    const config = await this.models.resolveConfig(
      data.modelConfigId ? String(data.modelConfigId) : undefined,
    );

    const response = await this.llm.complete({
      prompt: '请提取图片中所有可见的文字，保留原始格式和换行，不要添加任何解释或评论，只输出原文。',
      systemPrompt: '你是一个精确的 OCR 文字识别助手，只输出图片中的原始文字内容，不做任何分析或改写。',
      imageUrls: [imageUrl],
      config,
      signal: ctx.signal,
    });

    return { output: { text: response.text, model: response.model, usage: response.usage } };
  }
}

/* ------------------------------------------------------------------ */
/* Python code node                                                     */
/* ------------------------------------------------------------------ */

/**
 * Executes Python 3 code in a subprocess. The sandbox receives `input`,
 * `nodes`, and `variables` as JSON via stdin. The script should write its
 * return value to `result` or use `print()` for stdout capture.
 *
 * Requires `python3` to be available on the server's PATH.
 */
@Injectable()
export class PythonExecutor implements NodeExecutor {
  readonly type = 'python';

  constructor(private readonly config: ConfigService) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const code = String(node.data?.code ?? '');
    const timeoutMs = Number(this.config.get('CODE_NODE_TIMEOUT', 10000));

    // Wrap user code with a harness that serialises the result to stdout
    const harness = `
import sys, json

_ctx = json.loads(sys.stdin.read())
input = _ctx.get('input', {})
nodes = _ctx.get('nodes', {})
variables = _ctx.get('variables', {})
result = None

${code}

print(json.dumps({'result': result}))
`.trimStart();

    const tmpFile = path.join(os.tmpdir(), `zcl_py_${Date.now()}_${Math.random().toString(36).slice(2)}.py`);
    fs.writeFileSync(tmpFile, harness, 'utf8');

    const contextJson = JSON.stringify({
      input: ctx.input,
      nodes: ctx.outputs,
      variables: ctx.variables,
    });

    return new Promise((resolve) => {
      const proc = child_process.spawn('python3', [tmpFile], {
        timeout: timeoutMs,
        killSignal: 'SIGKILL',
      });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      proc.stdout.on('data', (d: Buffer) => stdoutChunks.push(d));
      proc.stderr.on('data', (d: Buffer) => stderrChunks.push(d));

      proc.stdin.write(contextJson);
      proc.stdin.end();

      proc.on('close', (code) => {
        fs.unlink(tmpFile, () => {});
        const stdout = Buffer.concat(stdoutChunks).toString('utf8').trim();
        const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();

        if (code !== 0) {
          resolve({ output: { result: null, stdout, stderr, exitCode: code } });
          return;
        }

        let result: unknown = null;
        try {
          const lastLine = stdout.split('\n').pop() ?? '{}';
          result = JSON.parse(lastLine)?.result ?? null;
        } catch {
          // result stays null
        }

        const printOutput = stdout.split('\n').slice(0, -1).join('\n');
        resolve({ output: { result, stdout: printOutput, stderr, exitCode: 0 } });
      });

      proc.on('error', (err) => {
        fs.unlink(tmpFile, () => {});
        resolve({ output: { result: null, stdout: '', stderr: String(err.message), exitCode: -1 } });
      });

      ctx.signal?.addEventListener('abort', () => {
        proc.kill('SIGKILL');
      }, { once: true });
    });
  }
}

/* ------------------------------------------------------------------ */
/* Video understand node                                               */
/* ------------------------------------------------------------------ */

/**
 * Sends a video URL to an LLM or multimodal API endpoint that supports video
 * understanding. The default OpenAI-compatible API does not support video;
 * configure VIDEO_UNDERSTAND_BASE_URL and VIDEO_UNDERSTAND_API_KEY in
 * server/.env to point to a provider that does (e.g. Gemini 1.5, Qwen-VL).
 */
@Injectable()
export class VideoUnderstandExecutor implements NodeExecutor {
  readonly type = 'video_understand';

  constructor(
    private readonly llm: LlmService,
    private readonly models: ModelsService,
    private readonly config: ConfigService,
  ) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const videoUrl = String(interpolate(String(data.videoUrl ?? ''), ctx) ?? '').trim();
    const question = String(interpolate(String(data.question ?? ''), ctx) ?? '') || '请描述这个视频的内容。';

    if (!videoUrl) {
      return { output: { description: '', model: '' } };
    }

    // Require an explicit video provider: either env vars or a node-level modelConfigId.
    const videoBaseUrl = this.config.get<string>('VIDEO_UNDERSTAND_BASE_URL', '');
    const videoApiKey = this.config.get<string>('VIDEO_UNDERSTAND_API_KEY', '');
    const hasVideoConfig = !!(videoBaseUrl && videoApiKey);
    const hasNodeModel = !!data.modelConfigId;

    if (!hasVideoConfig && !hasNodeModel) {
      return {
        output: {
          description:
            '[视频理解需要配置支持视频的模型 API，请在 server/.env 中设置 VIDEO_UNDERSTAND_BASE_URL 和 VIDEO_UNDERSTAND_API_KEY，或在节点中指定支持视频的模型配置]',
          model: '',
        },
      };
    }

    const config = hasVideoConfig
      ? {
          baseUrl: videoBaseUrl,
          apiKey: videoApiKey,
          model: this.config.get<string>('VIDEO_UNDERSTAND_MODEL', 'gemini-1.5-flash'),
        }
      : await this.models.resolveConfig(String(data.modelConfigId));

    // Build a video_url content block — providers like Gemini accept this
    const timeout = Number(this.config.get('LLM_TIMEOUT', 120000));
    const provider = config as any;
    if (!provider?.apiKey) {
      return {
        output: {
          description:
            '[视频理解需要配置支持视频的模型 API，请在 server/.env 中设置 VIDEO_UNDERSTAND_BASE_URL 和 VIDEO_UNDERSTAND_API_KEY]',
          model: '',
        },
      };
    }

    const baseUrl = provider.baseUrl.replace(/\/$/, '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const onCancel = () => controller.abort();
    ctx.signal?.addEventListener('abort', onCancel, { once: true });

    try {
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: question },
            { type: 'video_url', video_url: { url: videoUrl } },
          ],
        },
      ];
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
        body: JSON.stringify({ model: provider.model, messages }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`视频理解 API 返回 ${response.status}: ${body.slice(0, 200)}`);
      }
      const result: any = await response.json();
      const description = result?.choices?.[0]?.message?.content ?? '';
      return { output: { description, model: provider.model } };
    } finally {
      clearTimeout(timer);
      ctx.signal?.removeEventListener('abort', onCancel);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Audio/video summary node                                            */
/* ------------------------------------------------------------------ */

/**
 * Transcribes audio/video using a Whisper-compatible API, then optionally
 * summarises the transcript with an LLM.
 *
 * Requires a Whisper endpoint (e.g. OpenAI, faster-whisper, Groq):
 *   WHISPER_BASE_URL  — base URL of the /v1/audio/transcriptions endpoint
 *   WHISPER_API_KEY   — API key for the Whisper endpoint
 */
@Injectable()
export class AudioSummaryExecutor implements NodeExecutor {
  readonly type = 'audio_summary';

  constructor(
    private readonly llm: LlmService,
    private readonly models: ModelsService,
    private readonly config: ConfigService,
  ) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const audioUrl = String(interpolate(String(data.audioUrl ?? ''), ctx) ?? '').trim();
    const language = String(data.language ?? 'zh');
    const doSummarise = data.summarise !== false && data.summarise !== 'false';

    if (!audioUrl) {
      return { output: { transcript: '', summary: '', model: '' } };
    }

    const whisperBaseUrl = this.config.get<string>('WHISPER_BASE_URL', '');
    const whisperApiKey = this.config.get<string>('WHISPER_API_KEY', '');

    if (!whisperBaseUrl || !whisperApiKey) {
      return {
        output: {
          transcript:
            '[音频转录需要配置 Whisper 端点，请在 server/.env 中设置 WHISPER_BASE_URL 和 WHISPER_API_KEY]',
          summary: '',
          model: '',
        },
      };
    }

    // Fetch the audio file and send it to Whisper
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    const onCancel = () => controller.abort();
    ctx.signal?.addEventListener('abort', onCancel, { once: true });

    let transcript = '';
    try {
      const audioRes = await fetch(audioUrl, { signal: controller.signal });
      if (!audioRes.ok) throw new Error(`HTTP ${audioRes.status} fetching audio`);
      const audioBuffer = await audioRes.arrayBuffer();

      const form = new FormData();
      form.append('file', new Blob([audioBuffer]), 'audio.mp3');
      form.append('model', 'whisper-1');
      form.append('language', language);

      const whisperRes = await fetch(
        `${whisperBaseUrl.replace(/\/$/, '')}/v1/audio/transcriptions`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${whisperApiKey}` },
          body: form,
          signal: controller.signal,
        },
      );
      if (!whisperRes.ok) {
        const body = await whisperRes.text();
        throw new Error(`Whisper API 返回 ${whisperRes.status}: ${body.slice(0, 200)}`);
      }
      const whisperData: any = await whisperRes.json();
      transcript = whisperData?.text ?? '';
    } finally {
      clearTimeout(timer);
      ctx.signal?.removeEventListener('abort', onCancel);
    }

    let summary = '';
    if (doSummarise && transcript) {
      const config = await this.models.resolveConfig(
        data.modelConfigId ? String(data.modelConfigId) : undefined,
      );
      const resp = await this.llm.complete({
        prompt: `请对以下音频转录内容进行简洁摘要：\n\n${transcript}`,
        systemPrompt: '你是一个专业的内容摘要助手，请提炼核心要点，用简洁清晰的语言输出摘要。',
        config,
        signal: ctx.signal,
      });
      summary = resp.text;
    }

    return { output: { transcript, summary, model: 'whisper-1' } };
  }
}

/* ------------------------------------------------------------------ */
/* Parameter extractor node                                            */
/* ------------------------------------------------------------------ */

@Injectable()
export class ParameterExtractorExecutor implements NodeExecutor {
  readonly type = 'parameter_extractor';

  constructor(
    private readonly llm: LlmService,
    private readonly models: ModelsService,
  ) {}

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const input = String(interpolate(String(data.input ?? ''), ctx) ?? '').trim();
    const fieldsRaw = String(data.fields ?? '[]');

    let fields: Array<{ name: string; type: string; desc?: string }> = [];
    try {
      fields = JSON.parse(fieldsRaw);
    } catch {
      return { output: { error: '字段定义 JSON 解析失败', extracted: {} } };
    }

    if (!input || fields.length === 0) {
      return { output: { extracted: {} } };
    }

    const fieldDesc = fields
      .map((f) => `- ${f.name} (${f.type})${f.desc ? ': ' + f.desc : ''}`)
      .join('\n');

    const prompt = `请从以下文本中提取指定字段，以 JSON 格式返回，只返回 JSON，不要解释：\n\n文本：\n${input}\n\n需要提取的字段：\n${fieldDesc}`;
    const config = await this.models.resolveConfig(
      data.modelConfigId ? String(data.modelConfigId) : undefined,
    );
    const resp = await this.llm.complete({
      prompt,
      systemPrompt: '你是一个精确的信息提取助手，请从用户提供的文本中提取指定字段并以 JSON 格式返回。',
      config,
      signal: ctx.signal,
    });

    let extracted: Record<string, unknown> = {};
    try {
      const clean = resp.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      extracted = JSON.parse(clean);
    } catch {
      extracted = { raw: resp.text };
    }

    return { output: { extracted, ...extracted } };
  }
}

/* ------------------------------------------------------------------ */
/* Human input (HITL) node                                             */
/* ------------------------------------------------------------------ */

@Injectable()
export class HumanInputExecutor implements NodeExecutor {
  readonly type = 'human_input';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const prompt = String(data.prompt ?? '需要人工输入');
    // In a full HITL implementation, this would suspend the execution and
    // wait for a resume API call with user-provided input. Here we return
    // a placeholder that signals the pause to the caller.
    return {
      output: {
        prompt,
        humanInput: ctx.input['humanInput'] ?? null,
        status: 'waiting_for_input',
      },
    };
  }
}

/* ------------------------------------------------------------------ */
/* Memory node                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Multi-branch condition node                                          */
/* ------------------------------------------------------------------ */

/**
 * Condition-branch node: evaluates up to 8 named branches in order and
 * activates the first port whose condition is true, or the `default` port.
 *
 * Node data shape:
 *   branches: Array<{ id: string; name: string; condition: string }>
 *
 * Ports: branch_0 … branch_7, default.
 */
@Injectable()
export class ConditionBranchExecutor implements NodeExecutor {
  readonly type = 'condition_branch';

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    assertNotCancelled(ctx);
    const data = node.data ?? {};
    const branches: Array<{ id: string; name: string; condition: string }> =
      Array.isArray(data.branches) ? data.branches : [];

    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      if (!branch.condition) continue;
      const resolved = String(interpolate(String(branch.condition), ctx) ?? 'false');
      const passed = evalBool(resolved, ctx);
      if (passed) {
        return { output: { branch: branch.name, branchIndex: i }, branch: `branch_${i}` };
      }
    }

    return { output: { branch: 'default', branchIndex: -1 }, branch: 'default' };
  }
}

/* ------------------------------------------------------------------ */
/* List-loop node                                                       */
/* ------------------------------------------------------------------ */

/**
 * List-loop node: iterates over an array and runs a sub-workflow per element.
 * Similar to the existing LoopExecutor but exposes `element` (not `item`) and
 * supports formula input for the items field.
 */
@Injectable()
export class ListLoopExecutor implements NodeExecutor {
  readonly type = 'list_loop';
  private readonly invoker: WorkflowInvoker;

  constructor(
    @InjectRepository(WorkflowEntity) workflows: Repository<WorkflowEntity>,
    @Inject(WORKFLOW_RUNNER) engine: WorkflowRunner,
    config: ConfigService,
  ) {
    this.invoker = new WorkflowInvoker(workflows, engine, config);
  }

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    assertNotCancelled(ctx);
    const data = node.data ?? {};
    const target = await this.invoker.resolveTarget(String(data.workflowId ?? ''), ctx);

    const items = this.resolveItems(data.items, ctx);
    const maxItems = this.invoker.limit('MAX_LOOP_ITEMS', 50);
    if (items.length > maxItems) {
      throw new Error(`ListLoop: ${items.length} items exceeds MAX_LOOP_ITEMS (${maxItems})`);
    }
    const concurrency = Math.min(
      Math.max(Number(data.concurrency) || 1, 1),
      this.invoker.limit('MAX_LOOP_CONCURRENCY', 4),
    );
    const continueOnError = data.continueOnError === true || data.continueOnError === 'true';

    const results: Array<Record<string, unknown> | null> = new Array(items.length).fill(null);
    const errors: Array<{ index: number; error: string }> = [];
    let broken = false;

    for (let offset = 0; offset < items.length; offset += concurrency) {
      if (broken) break;
      assertNotCancelled(ctx);
      const slice = items.slice(offset, offset + concurrency);
      try {
        await Promise.all(
          slice.map(async (element, position) => {
            const index = offset + position;
            try {
              const child = await this.invoker.invoke(target, { element, index }, ctx);
              if (child.status === 'cancelled') throw new ExecutionCancelledError();
              if (child.status !== 'success') throw new Error(child.error ?? 'unknown error');
              results[index] = child.output ?? {};
            } catch (error: any) {
              if (error instanceof ExecutionCancelledError) throw error;
              errors.push({ index, error: String(error?.message ?? error) });
              if (!continueOnError) throw error;
            }
          }),
        );
      } catch (error: any) {
        if (error instanceof ExecutionCancelledError) throw error;
        broken = true;
        break;
      }
    }

    return {
      output: {
        results,
        count: items.length,
        succeeded: results.filter((r) => r !== null).length,
        failed: errors.length,
        errors,
      },
    };
  }

  private resolveItems(raw: unknown, ctx: RunContext): unknown[] {
    if (Array.isArray(raw)) return raw;
    const text = String(raw ?? '').trim();
    if (!text) return [];
    const resolved = interpolate(text, ctx);
    if (Array.isArray(resolved)) return resolved;
    if (typeof resolved === 'string') {
      try {
        const parsed = JSON.parse(resolved);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* fall through */ }
    }
    throw new Error('ListLoop: "items" must resolve to an array');
  }
}

/* ------------------------------------------------------------------ */
/* Condition-loop node (while-loop)                                     */
/* ------------------------------------------------------------------ */

/**
 * Condition-loop node: while-loop that runs a sub-workflow body repeatedly
 * until stop_condition is true or max_iterations is reached.
 */
@Injectable()
export class ConditionLoopExecutor implements NodeExecutor {
  readonly type = 'condition_loop';
  private readonly invoker: WorkflowInvoker;

  constructor(
    @InjectRepository(WorkflowEntity) workflows: Repository<WorkflowEntity>,
    @Inject(WORKFLOW_RUNNER) engine: WorkflowRunner,
    config: ConfigService,
  ) {
    this.invoker = new WorkflowInvoker(workflows, engine, config);
  }

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    assertNotCancelled(ctx);
    const data = node.data ?? {};
    const target = await this.invoker.resolveTarget(String(data.workflowId ?? ''), ctx);

    const stopCondition = String(data.stopCondition ?? '').trim();
    const maxIterations = Math.min(
      Math.max(Number(data.maxIterations) || 10, 1),
      this.invoker.limit('MAX_LOOP_ITEMS', 50),
    );
    const errorHandling = String(data.errorHandling ?? 'terminate_loop');

    const results: Array<Record<string, unknown> | null> = [];
    const errors: Array<{ iteration: number; error: string }> = [];
    let iteration = 0;

    while (iteration < maxIterations) {
      assertNotCancelled(ctx);

      // Evaluate stop condition before running the body
      if (stopCondition && evalBool(stopCondition, ctx)) break;

      try {
        const child = await this.invoker.invoke(
          target,
          { iteration, results: results.slice() },
          ctx,
        );
        if (child.status === 'cancelled') throw new ExecutionCancelledError();
        if (child.status !== 'success') {
          throw new Error(child.error ?? 'unknown error');
        }
        results.push(child.output ?? {});

        // Update ctx outputs so next iteration's stop condition can see them
        ctx.outputs[`__loop_iter_${iteration}`] = child.output ?? {};
        iteration++;
      } catch (error: any) {
        if (error instanceof ExecutionCancelledError) throw error;
        errors.push({ iteration, error: String(error?.message ?? error) });
        if (errorHandling === 'terminate_iteration') {
          results.push(null);
          iteration++;
        } else {
          break;
        }
      }
    }

    return {
      output: {
        results,
        totalIterations: iteration,
        succeeded: results.filter((r) => r !== null).length,
        failed: errors.length,
        errors,
      },
    };
  }
}

@Injectable()
export class MemoryExecutor implements NodeExecutor {
  readonly type = 'memory';

  /** In-memory store keyed by (executionId, key). For production use a DB table. */
  private static store: Map<string, unknown[]> = new Map();

  async execute(node: FlowNode, ctx: RunContext): Promise<NodeResult> {
    const data = node.data ?? {};
    const operation = String(data.operation ?? 'read');
    const key = String(interpolate(String(data.key ?? 'history'), ctx) ?? 'history').trim();
    const maxItems = Number(data.maxItems ?? 0);
    const storeKey = key;

    if (operation === 'read') {
      const history = MemoryExecutor.store.get(storeKey) ?? [];
      return { output: { history, count: history.length } };
    }

    if (operation === 'write') {
      const value = interpolateDeep(data.value, ctx);
      const history = [...(MemoryExecutor.store.get(storeKey) ?? []), value];
      const trimmed = maxItems > 0 ? history.slice(-maxItems) : history;
      MemoryExecutor.store.set(storeKey, trimmed);
      return { output: { history: trimmed, count: trimmed.length, written: value } };
    }

    if (operation === 'clear') {
      MemoryExecutor.store.delete(storeKey);
      return { output: { cleared: true, key } };
    }

    return { output: {} };
  }
}
