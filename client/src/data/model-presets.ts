/**
 * Built-in LLM provider presets for the model configuration form.
 *
 * Picking a preset auto-fills the Base URL and offers the provider's models in
 * a rich dropdown (name + capability tag + context window + short pitch), so
 * the user only has to paste an API key. All presets speak the OpenAI-
 * compatible `/chat/completions` protocol that the engine uses. The catalogue
 * is China-first, matching the product's target audience, with OpenAI and
 * local Ollama included for completeness. `custom` lets the user fill
 * everything by hand.
 *
 * Model metadata mirrors how modern model marketplaces (OpenRouter, SiliconFlow,
 * 火山方舟) present models: a capability tag (chat / reasoning / long-context),
 * the context window, and a one-line positioning note. Descriptions are stored
 * bilingually and the consuming component picks the language at render time.
 */

/** A short bilingual string. */
export interface BiText {
  zh: string;
  en: string;
}

export interface ModelOptionMeta {
  /** Model identifier sent to the API (language-neutral). */
  id: string;
  /** Context window, shown as a monospace badge (e.g. "64K"). */
  context?: string;
  /** Capability tag rendered as a chip (e.g. 推理 / Reasoning). */
  tag?: BiText;
  /** One-line positioning note under the model name. */
  desc: BiText;
}

export interface ModelPreset {
  /** Stable identifier (used as the dropdown value). */
  id: string;
  /** Display name (brand names are language-neutral). */
  name: string;
  /** OpenAI-compatible endpoint. */
  baseUrl: string;
  /** Rich model catalogue offered as quick-pick options. */
  models: ModelOptionMeta[];
  /** Model pre-selected when the preset is chosen. */
  defaultModel: string;
}

export const CUSTOM_PROVIDER_ID = 'custom';

export const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    // deepseek-chat / deepseek-reasoner were retired on 2026-07-24 and replaced
    // by the V4 series. Both V4 models use a 1M context window and support
    // hybrid thinking (deepseek-v4-flash toggles thinking/non-thinking mode).
    models: [
      {
        id: 'deepseek-v4-flash',
        context: '1M',
        tag: { zh: '极速', en: 'Fast' },
        desc: { zh: 'V4 快速版 · 思考/非思考可切换 · 高性价比', en: 'V4 fast · hybrid thinking · cost-efficient' },
      },
      {
        id: 'deepseek-v4-pro',
        context: '1M',
        tag: { zh: '旗舰', en: 'Flagship' },
        desc: { zh: 'V4 旗舰 · 编程、数学与通用任务最强', en: 'V4 flagship · best for coding, math & general' },
      },
    ],
    defaultModel: 'deepseek-v4-flash',
  },
  {
    id: 'qwen',
    name: 'Qwen · 通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      {
        id: 'qwen3-max',
        context: '256K',
        tag: { zh: '旗舰', en: 'Flagship' },
        desc: { zh: 'Qwen3 旗舰 · 思考/非思考可切换', en: 'Qwen3 flagship · hybrid thinking' },
      },
      {
        id: 'qwen-plus',
        context: '128K',
        desc: { zh: '性能与价格均衡 · 主力推荐', en: 'Balanced · recommended default' },
      },
      {
        id: 'qwen-turbo',
        context: '128K',
        tag: { zh: '极速', en: 'Fast' },
        desc: { zh: '响应快 · 成本低', en: 'Fast responses · low cost' },
      },
      {
        id: 'qwen-long',
        context: '10M',
        tag: { zh: '长上下文', en: 'Long-ctx' },
        desc: { zh: '超长文档理解与分析', en: 'Ultra-long document understanding' },
      },
    ],
    defaultModel: 'qwen-plus',
  },
  {
    id: 'moonshot',
    name: 'Moonshot · Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    // moonshot-v1-* and kimi-k2.5 go fully offline on 2026-08-31 (kimi-k2 was
    // already retired on 2026-05-25); the K2.6/K2.7/K3 series is the supported
    // lineup.
    models: [
      {
        id: 'kimi-k3',
        context: '1M',
        tag: { zh: '旗舰', en: 'Flagship' },
        desc: { zh: '2.8T 参数 · 原生视觉 · 深度推理', en: '2.8T params · native vision · deep reasoning' },
      },
      {
        id: 'kimi-k2.6',
        context: '256K',
        desc: { zh: '通用 · 思考/非思考可切换 · Agent', en: 'General · hybrid thinking · Agent' },
      },
      {
        id: 'kimi-k2.7-code',
        context: '256K',
        tag: { zh: '编程', en: 'Coding' },
        desc: { zh: '编程模型 · 长上下文指令遵循', en: 'Coding model · long-ctx instruction following' },
      },
    ],
    defaultModel: 'kimi-k2.6',
  },
  {
    id: 'zhipu',
    name: '智谱 · GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    // Legacy glm-4 / glm-4-plus / glm-4-air / glm-4-flash are no longer listed;
    // the current lineup is the GLM-4.5-Air / 4.6 / 4.7 series.
    models: [
      {
        id: 'glm-4.7',
        context: '200K',
        tag: { zh: '旗舰', en: 'Flagship' },
        desc: { zh: '通用·推理·智能体全面升级 · 编程更强', en: 'All-round upgrade · stronger coding' },
      },
      {
        id: 'glm-4.6',
        context: '200K',
        desc: { zh: '高级编码 · 复杂推理 · 工具调用', en: 'Advanced coding · reasoning · tool calls' },
      },
      {
        id: 'glm-4.5-air',
        context: '128K',
        desc: { zh: '高性价比轻量 · 推理/编码稳定', en: 'Cost-efficient lightweight · stable' },
      },
      {
        id: 'glm-4.7-flash',
        context: '200K',
        tag: { zh: '免费', en: 'Free' },
        desc: { zh: '免费普惠 · 延续 4.7 通用能力', en: 'Free · inherits GLM-4.7 capability' },
      },
    ],
    defaultModel: 'glm-4.7-flash',
  },
  {
    id: 'baichuan',
    name: '百川 · Baichuan',
    baseUrl: 'https://api.baichuan-ai.com/v1',
    models: [
      {
        id: 'Baichuan4',
        context: '32K',
        tag: { zh: '旗舰', en: 'Flagship' },
        desc: { zh: '综合能力最强 · 中文表现佳', en: 'Most capable · strong in Chinese' },
      },
      {
        id: 'Baichuan3-Turbo',
        context: '32K',
        desc: { zh: '通用场景 · 均衡之选', en: 'General use · balanced' },
      },
      {
        id: 'Baichuan3-Turbo-128k',
        context: '128K',
        tag: { zh: '长上下文', en: 'Long-ctx' },
        desc: { zh: '长文本理解与处理', en: 'Long-text understanding' },
      },
    ],
    defaultModel: 'Baichuan4',
  },
  {
    id: 'doubao',
    name: '豆包 · 火山方舟',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    // 火山方舟使用「推理接入点 ID」(ep-...)，此处仅为常见示例，需按控制台填写。
    models: [
      {
        id: 'doubao-1-5-pro-32k-250115',
        context: '32K',
        tag: { zh: '旗舰', en: 'Flagship' },
        desc: { zh: '旗舰版 · 深度推理', en: 'Pro · deep reasoning' },
      },
      {
        id: 'doubao-1-5-lite-32k-250115',
        context: '32K',
        tag: { zh: '极速', en: 'Fast' },
        desc: { zh: '轻量版 · 快速响应', en: 'Lite · fast responses' },
      },
      {
        id: 'deepseek-v3-241226',
        context: '64K',
        desc: { zh: '方舟托管 DeepSeek V3', en: 'DeepSeek V3 hosted on Ark' },
      },
    ],
    defaultModel: 'doubao-1-5-pro-32k-250115',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      {
        id: 'gpt-5',
        context: '400K',
        tag: { zh: '旗舰', en: 'Flagship' },
        desc: { zh: '旗舰 · 高质量代码与复杂任务', en: 'Flagship · high-quality code & complex tasks' },
      },
      {
        id: 'gpt-5-mini',
        context: '400K',
        desc: { zh: '高性价比 · 主力推荐', en: 'Cost-efficient · recommended' },
      },
      {
        id: 'gpt-5-nano',
        context: '400K',
        tag: { zh: '极速', en: 'Fast' },
        desc: { zh: '最快最便宜 · 高频调用', en: 'Fastest & cheapest · high-frequency' },
      },
    ],
    defaultModel: 'gpt-5-mini',
  },
  {
    id: 'ollama',
    name: 'Ollama · 本地',
    baseUrl: 'http://localhost:11434/v1',
    models: [
      {
        id: 'qwen2.5',
        context: '32K',
        desc: { zh: '本地通用 · 中文友好', en: 'Local general · Chinese-friendly' },
      },
      {
        id: 'llama3.1',
        context: '128K',
        desc: { zh: 'Meta 开源主力', en: 'Meta open-source flagship' },
      },
      {
        id: 'deepseek-r1',
        context: '64K',
        tag: { zh: '推理', en: 'Reasoning' },
        desc: { zh: '本地深度推理', en: 'Local deep reasoning' },
      },
    ],
    defaultModel: 'qwen2.5',
  },
];

/** The preset pre-selected when opening the create form (domestic-first). */
export const DEFAULT_PRESET_ID = 'deepseek';

/** Look a preset up by id. */
export function findPreset(id: string): ModelPreset | undefined {
  return MODEL_PRESETS.find((preset) => preset.id === id);
}

/** Match a preset by its Base URL (used to pre-select when editing). */
export function findPresetByBaseUrl(baseUrl: string): ModelPreset | undefined {
  const normalized = baseUrl.replace(/\/$/, '');
  return MODEL_PRESETS.find((preset) => preset.baseUrl.replace(/\/$/, '') === normalized);
}

/** All preset display names (to detect whether the name field is untouched). */
export const PRESET_NAMES = new Set(MODEL_PRESETS.map((preset) => preset.name));

/** All known model ids across every preset (used to detect custom models). */
export const PRESET_MODEL_IDS = new Set(
  MODEL_PRESETS.flatMap((preset) => preset.models.map((model) => model.id)),
);
