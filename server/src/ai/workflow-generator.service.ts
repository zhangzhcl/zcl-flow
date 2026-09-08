import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { ModelsService } from '../models/models.service';

interface WorkflowDraft {
  name: string;
  description: string;
  definition: Record<string, unknown>;
  source: 'ai' | 'fallback';
  raw?: string;
}

const pos = (x: number, y = 0) => ({ position: { x, y } });

function extractJson(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function isValidDraft(value: any): value is Omit<WorkflowDraft, 'source'> {
  return (
    value &&
    typeof value.name === 'string' &&
    value.definition &&
    Array.isArray(value.definition.nodes) &&
    Array.isArray(value.definition.edges)
  );
}

@Injectable()
export class WorkflowGeneratorService {
  constructor(
    private readonly llm: LlmService,
    private readonly models: ModelsService,
  ) {}

  async generate(prompt: string): Promise<WorkflowDraft> {
    const config = await this.models.resolveConfig();
    const response = await this.llm.complete({
      config,
      temperature: 0.2,
      systemPrompt:
        'You are a ZCL Flow workflow architect. Return only strict JSON. Do not include markdown.',
      prompt: this.buildPrompt(prompt),
    });

    if (!response.mock) {
      const parsed = extractJson(response.text);
      if (isValidDraft(parsed)) {
        return {
          name: parsed.name.slice(0, 120),
          description: String(parsed.description ?? ''),
          definition: parsed.definition,
          source: 'ai',
          raw: response.text,
        };
      }
    }
    return this.fallback(prompt, response.text);
  }

  private buildPrompt(prompt: string): string {
    return `Generate a ZCL Flow workflow for this requirement:\n${prompt}\n\nReturn JSON exactly in this shape:\n{\n  "name": "short workflow name",\n  "description": "what it does",\n  "definition": {\n    "nodes": [\n      {"id":"start_0","type":"start","meta":{"position":{"x":0,"y":0}},"data":{"title":"Start"}},\n      {"id":"llm_1","type":"llm","meta":{"position":{"x":300,"y":0}},"data":{"title":"LLM","prompt":"..."}},\n      {"id":"end_0","type":"end","meta":{"position":{"x":600,"y":0}},"data":{"title":"End","outputs":{"reply":"{{nodes.llm_1.text}}"}}}\n    ],\n    "edges": [{"sourceNodeID":"start_0","targetNodeID":"llm_1"},{"sourceNodeID":"llm_1","targetNodeID":"end_0"}]\n  }\n}\n\nAllowed node types include start, end, llm, code, condition, switch, template, variable, json, classify, text, aggregate, notify. Use {{input.message}} for chat input. Keep it runnable.`;
  }

  private fallback(prompt: string, raw?: string): WorkflowDraft {
    const lower = prompt.toLowerCase();
    if (lower.includes('客服') || lower.includes('工单') || lower.includes('support')) {
      return this.supportDraft(raw);
    }
    if (lower.includes('内容') || lower.includes('文案') || lower.includes('文章') || lower.includes('content')) {
      return this.contentDraft(raw);
    }
    return this.assistantDraft(prompt, raw);
  }

  private assistantDraft(prompt: string, raw?: string): WorkflowDraft {
    return {
      name: 'AI 助手 Agent 工作流',
      description: '接收用户消息，调用默认模型生成回复。',
      source: 'fallback',
      raw,
      definition: {
        nodes: [
          { id: 'start_0', type: 'start', meta: pos(0), data: { title: '用户消息' } },
          {
            id: 'llm_1',
            type: 'llm',
            meta: pos(320),
            data: {
              title: '生成回复',
              systemPrompt: '你是一个可靠的 AI Agent，回答要清晰、简洁、可执行。',
              prompt: `用户需求：${prompt}\n\n当前消息：{{input.message}}\n\n历史上下文：{{input.history}}`,
            },
          },
          {
            id: 'end_0',
            type: 'end',
            meta: pos(640),
            data: { title: '回复用户', outputs: { reply: '{{nodes.llm_1.text}}' } },
          },
        ],
        edges: [
          { sourceNodeID: 'start_0', targetNodeID: 'llm_1' },
          { sourceNodeID: 'llm_1', targetNodeID: 'end_0' },
        ],
      },
    };
  }

  private supportDraft(raw?: string): WorkflowDraft {
    return {
      name: '客服工单分流 Agent',
      description: '识别用户问题类型，并生成对应客服回复。',
      source: 'fallback',
      raw,
      definition: {
        nodes: [
          { id: 'start_0', type: 'start', meta: pos(0), data: { title: '用户问题' } },
          {
            id: 'classify_1',
            type: 'classify',
            meta: pos(300),
            data: {
              title: '意图分类',
              input: '{{input.message}}',
              categories: '[{"name":"售前咨询","description":"产品、价格、方案咨询"},{"name":"技术支持","description":"报错、集成、使用问题"},{"name":"投诉反馈","description":"负面反馈、退款、投诉"}]',
            },
          },
          {
            id: 'llm_1',
            type: 'llm',
            meta: pos(600),
            data: {
              title: '客服回复',
              systemPrompt: '你是专业客服，请根据分类给出礼貌、具体、可执行的回复。',
              prompt: '用户问题：{{input.message}}\n分类结果：{{nodes.classify_1.category}}',
            },
          },
          { id: 'end_0', type: 'end', meta: pos(900), data: { title: '回复', outputs: { reply: '{{nodes.llm_1.text}}', category: '{{nodes.classify_1.category}}' } } },
        ],
        edges: [
          { sourceNodeID: 'start_0', targetNodeID: 'classify_1' },
          { sourceNodeID: 'classify_1', targetNodeID: 'llm_1' },
          { sourceNodeID: 'llm_1', targetNodeID: 'end_0' },
        ],
      },
    };
  }

  private contentDraft(raw?: string): WorkflowDraft {
    return {
      name: '内容创作 Agent',
      description: '根据主题生成内容初稿，并做一次润色改写。',
      source: 'fallback',
      raw,
      definition: {
        nodes: [
          { id: 'start_0', type: 'start', meta: pos(0), data: { title: '内容需求' } },
          {
            id: 'llm_1',
            type: 'llm',
            meta: pos(300),
            data: { title: '生成初稿', prompt: '请围绕以下主题生成一篇结构清晰的内容初稿：{{input.message}}' },
          },
          {
            id: 'text_1',
            type: 'text',
            meta: pos(600),
            data: { title: '润色改写', operation: 'rewrite', input: '{{nodes.llm_1.text}}', instruction: '语言更自然，结构更清晰。' },
          },
          { id: 'end_0', type: 'end', meta: pos(900), data: { title: '成稿', outputs: { reply: '{{nodes.text_1.text}}' } } },
        ],
        edges: [
          { sourceNodeID: 'start_0', targetNodeID: 'llm_1' },
          { sourceNodeID: 'llm_1', targetNodeID: 'text_1' },
          { sourceNodeID: 'text_1', targetNodeID: 'end_0' },
        ],
      },
    };
  }
}
