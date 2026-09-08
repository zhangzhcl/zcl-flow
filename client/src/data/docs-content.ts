/**
 * Bilingual documentation content for the in-app docs page.
 * Kept as a data module (rather than i18n JSON) because the docs are
 * long-form; the active language is picked via `i18n.language`.
 */

export type Lang = 'zh' | 'en';

interface Localized {
  zh: string;
  en: string;
}

export type DocsBlock =
  | { kind: 'p'; text: Localized }
  | { kind: 'h3'; text: Localized }
  | { kind: 'list'; items: Localized[] }
  | { kind: 'code'; label?: string; text: string }
  | { kind: 'table'; head: Localized[]; rows: Localized[][] };

export interface DocsSection {
  id: string;
  title: Localized;
  blocks: DocsBlock[];
}

const L = (zh: string, en: string): Localized => ({ zh, en });

export const DOCS_SECTIONS: DocsSection[] = [
  {
    id: 'overview',
    title: L('项目概述', 'Overview'),
    blocks: [
      {
        kind: 'p',
        text: L(
          'ZCL Flow 是一个面向开发者的 AI 原生工作流编排平台：通过可视化画布编排 LLM 工作流，提供行业首创的单步调试体验，并支持将工作流一键发布为 Agent、以 Webhook / 定时任务方式接入真实业务。',
          'ZCL Flow is a developer-first, AI-native workflow orchestration platform: orchestrate LLM workflows on a visual canvas, debug them step by step (an industry-first experience), publish any workflow as an Agent, and wire it into real business systems via webhooks or cron triggers.',
        ),
      },
      {
        kind: 'list',
        items: [
          L('可视化编排：基于 FlowGram 的自由布局画布，7 大分类 40+ 节点拖拽成流', 'Visual orchestration: FlowGram-based free-form canvas with 40+ nodes across 7 categories'),
          L('多模态 AI 节点：图片问答、OCR、视频理解、音视频总结、知识问答，与代码 / HTTP 节点无缝组合', 'Multimodal AI nodes: image Q&A, OCR, video understanding, audio summary, knowledge Q&A — compose seamlessly with code / HTTP nodes'),
          L('知识库与 RAG：内置文档管理与向量检索，工作流直接接入 RAG 流程', 'Knowledge base & RAG: built-in document management and vector retrieval; wire into RAG workflows directly'),
          L('多语言代码节点：JavaScript（vm 沙箱）与 Python 3（子进程）双引擎', 'Dual code execution: JavaScript (vm sandbox) and Python 3 (subprocess) with JSON I/O'),
          L('调试工具集：断点、单步执行、变量监控、Mock 测试', 'Debugger toolkit: breakpoints, step execution, variable watch and mock testing'),
          L('Agent 闭环：工作流一键发布为 Agent，对话页直接调用', 'Agent loop: publish workflows as Agents with one click and chat with them directly'),
          L('触发器自动化：Webhook、Cron 定时触发，HMAC 签名与限流保护', 'Trigger automation: webhook and cron triggers with HMAC signatures and rate limiting'),
          L('多模型管理：集中管理 OpenAI / DeepSeek / 通义千问等模型配置', 'Multi-model management: centrally manage OpenAI / DeepSeek / Qwen and more'),
        ],
      },
    ],
  },
  {
    id: 'quickstart',
    title: L('快速开始', 'Quick Start'),
    blocks: [
      {
        kind: 'h3',
        text: L('环境要求', 'Requirements'),
      },
      {
        kind: 'list',
        items: [L('Node.js >= 18', 'Node.js >= 18'), L('npm >= 7（支持 workspaces）', 'npm >= 7 (workspaces support)')],
      },
      {
        kind: 'h3',
        text: L('安装与启动', 'Install & Run'),
      },
      {
        kind: 'code',
        label: 'bash',
        text: 'npm install\nnpm run dev    # 前端 :5173 + 后端 :3001\nnpm run build  # 生产构建\nnpm run start  # 生产启动后端',
      },
      {
        kind: 'p',
        text: L(
          '首次启动会自动创建初始管理员：账号密码取自 server/.env 的 ADMIN_USERNAME / ADMIN_PASSWORD；若未配置密码，则生成强密码并打印在后端日志中。数据库为 SQLite 文件（server/data/zcl-flow.sqlite），零配置、无需额外服务。',
          'On first start an initial admin is bootstrapped from ADMIN_USERNAME / ADMIN_PASSWORD in server/.env; if no password is configured a strong one is generated and printed in the server log. Storage is a SQLite file (server/data/zcl-flow.sqlite) — zero configuration, no external services.',
        ),
      },
      {
        kind: 'p',
        text: L(
          'LLM 能力：在「模型配置」中添加供应商 API Key 即可使用真实模型；留空 LLM_API_KEY 时内置 Mock 响应器，无需任何 Key 也能跑通完整流程。',
          'LLM capability: add provider API keys under “Model Config” to use real models; with an empty LLM_API_KEY the built-in mock responder keeps the full loop runnable without any key.',
        ),
      },
    ],
  },
  {
    id: 'architecture',
    title: L('技术架构', 'Architecture'),
    blocks: [
      {
        kind: 'h3',
        text: L('前端', 'Frontend'),
      },
      {
        kind: 'list',
        items: [
          L('React 18 + TypeScript + Vite 5', 'React 18 + TypeScript + Vite 5'),
          L('Tailwind CSS（深色 ink 单色设计体系）', 'Tailwind CSS (dark monochrome “ink” design system)'),
          L('Zustand（auth / debug / run-status / editor-ui 状态）', 'Zustand (auth / debug / run-status / editor-ui stores)'),
          L('React Router DOM（路由）、i18next（中英文）', 'React Router DOM (routing), i18next (zh/en)'),
          L('@flowgram.ai/free-layout-editor（自由布局画布引擎）', '@flowgram.ai/free-layout-editor (free-layout canvas engine)'),
        ],
      },
      {
        kind: 'h3',
        text: L('后端', 'Backend'),
      },
      {
        kind: 'list',
        items: [
          L('NestJS 10 模块化架构：auth / workflows / engine / executions / triggers / models / agents / ai / events', 'NestJS 10 modular architecture: auth / workflows / engine / executions / triggers / models / agents / ai / events'),
          L('TypeORM 0.3 + better-sqlite3，synchronize 自动建表', 'TypeORM 0.3 + better-sqlite3 with synchronize for auto schema'),
          L('JWT 认证（全局 Guard，@Public 白名单）', 'JWT auth (global guard with @Public whitelist)'),
          L('执行引擎：Kahn 拓扑调度 + 波次并行 + 队列限流', 'Execution engine: Kahn topological scheduling + wave parallelism + queued concurrency'),
          L('SSE 事件流（/api/executions/stream）实时推送运行状态', 'SSE event stream (/api/executions/stream) pushes live run status'),
          L('代码节点运行在 Node vm 沙箱中，带超时保护', 'Code nodes run in a Node vm sandbox with timeout protection'),
        ],
      },
    ],
  },
  {
    id: 'editor',
    title: L('工作流编排', 'Workflow Editor'),
    blocks: [
      {
        kind: 'p',
        text: L(
          '在控制台点击「创建工作流」进入编辑器：左侧/底部节点面板拖入节点，连线表示数据流向；选中节点后右侧属性面板编辑配置。画布支持自由布局、对齐吸附、缩放与右键菜单（复制 / 删除 / 断点等）。',
          'Create a workflow from the console to open the editor: drag nodes from the node panel, connect ports to define data flow, and edit configuration in the right property panel. The canvas supports free layout, alignment snapping, zooming and a context menu (duplicate / delete / breakpoints, etc.).',
        ),
      },
      {
        kind: 'list',
        items: [
          L('运行：右上角「运行」按钮以 Mock / 真实输入执行整条流程', 'Run: the “Run” button executes the whole flow with mock / real input'),
          L('调试：节点左上角圆点设置断点，运行后自动暂停，可单步 / 继续 / 查看变量', 'Debug: click the dot on a node to set a breakpoint; runs pause there for stepping, continuing and variable inspection'),
          L('导入 / 导出：工作流可导出为 JSON 文件，便于版本化与迁移', 'Import / export: workflows export to JSON files for versioning and migration'),
        ],
      },
    ],
  },
  {
    id: 'nodes',
    title: L('节点参考', 'Node Reference'),
    blocks: [
      {
        kind: 'h3',
        text: L('基础节点', 'Basic Nodes'),
      },
      {
        kind: 'table',
        head: [L('节点', 'Node'), L('类型', 'Type'), L('说明', 'Description')],
        rows: [
          [L('开始', 'Start'), L('start', 'start'), L('流程入口，接收触发器 / 运行输入 input', 'Flow entry; receives trigger / run input')],
          [L('结束', 'End'), L('end', 'end'), L('流程出口，收集最终输出', 'Flow exit; collects the final output')],
          [L('人工确认', 'Question'), L('question', 'question'), L('暂停等待人工输入，适合审批 / 交互场景', 'Pauses for human input; useful for approvals and interactive flows')],
        ],
      },
      {
        kind: 'h3',
        text: L('AI 节点', 'AI Nodes'),
      },
      {
        kind: 'table',
        head: [L('节点', 'Node'), L('类型', 'Type'), L('说明', 'Description')],
        rows: [
          [L('LLM', 'LLM'), L('llm', 'llm'), L('调用大模型，提示词支持模板插值，可选模型与参数', 'Calls an LLM; prompt supports template interpolation, model & params selectable')],
          [L('意图分类', 'Classify'), L('classify', 'classify'), L('LLM 意图分类，多类别分支输出', 'LLM intent classification with per-category branches')],
          [L('文本加工', 'Text'), L('text', 'text'), L('截取、替换、转大小写等文本变换', 'Slice, replace, case conversion and other text transforms')],
          [L('图片问答', 'Image Q&A'), L('image_qa', 'image_qa'), L('向视觉模型提问图片内容，输出 answer', 'Ask a vision model about an image; outputs answer')],
          [L('OCR 识别', 'OCR'), L('ocr', 'ocr'), L('调用视觉模型识别图片中的文字', 'Extracts text from an image via a vision model')],
          [L('视频理解', 'Video Understanding'), L('video_understand', 'video_understand'), L('分析视频内容并输出描述（需配置视频模型端点）', 'Analyses video content and outputs a description (requires video model endpoint)')],
          [L('音视频总结', 'Audio Summary'), L('audio_summary', 'audio_summary'), L('转录音频 + 可选摘要，需配置 Whisper 兼容端点', 'Transcribes audio and optionally summarises it; requires Whisper-compatible endpoint')],
        ],
      },
      {
        kind: 'h3',
        text: L('知识库节点', 'Knowledge Nodes'),
      },
      {
        kind: 'table',
        head: [L('节点', 'Node'), L('类型', 'Type'), L('说明', 'Description')],
        rows: [
          [L('知识问答', 'Knowledge Q&A'), L('knowledge_answer', 'knowledge_answer'), L('从知识库检索相关段落，结合 LLM 生成答案', 'Retrieves chunks from a knowledge base and generates an answer with an LLM')],
          [L('知识库检索', 'KB Retrieve'), L('knowledge_retrieve', 'knowledge_retrieve'), L('返回语义最近的 top-k 文档块', 'Returns the top-k semantically nearest document chunks')],
          [L('知识库写入', 'KB Write'), L('knowledge_write', 'knowledge_write'), L('将文本写入指定知识库', 'Writes text into a knowledge base')],
        ],
      },
      {
        kind: 'h3',
        text: L('逻辑与控制', 'Logic & Control'),
      },
      {
        kind: 'table',
        head: [L('节点', 'Node'), L('类型', 'Type'), L('说明', 'Description')],
        rows: [
          [L('条件', 'Condition'), L('condition', 'condition'), L('二分支：if_true / if_false', 'Two-way branch: if_true / if_false')],
          [L('多路分支', 'Switch'), L('switch', 'switch'), L('多分支：case_1 / case_2 / default', 'Multi-way branch: case_1 / case_2 / default')],
          [L('循环', 'Loop'), L('loop', 'loop'), L('遍历数组并行迭代，支持并发度与 continue-on-error', 'Iterates an array with concurrency and continue-on-error')],
          [L('退出循环', 'Break'), L('break', 'break'), L('在循环子工作流中跳出当前循环', 'Breaks out of the enclosing loop when used inside a loop sub-workflow')],
          [L('批处理', 'Batch'), L('batch', 'batch'), L('并发批量执行子流程，聚合结果', 'Concurrently runs a sub-workflow over a list and aggregates results')],
          [L('子工作流', 'Subflow'), L('subflow', 'subflow'), L('调用其他工作流，带深度限制与循环调用检测', 'Invokes another workflow with depth limit and cycle detection')],
        ],
      },
      {
        kind: 'h3',
        text: L('数据处理', 'Data Nodes'),
      },
      {
        kind: 'table',
        head: [L('节点', 'Node'), L('类型', 'Type'), L('说明', 'Description')],
        rows: [
          [L('变量', 'Variable'), L('variable', 'variable'), L('读写工作流变量', 'Reads / writes workflow variables')],
          [L('变量赋值', 'Assign'), L('assign', 'assign'), L('批量赋值变量', 'Batch-assigns variables')],
          [L('模板', 'Template'), L('template', 'template'), L('文本模板渲染，支持 {{ }} 插值', 'Text template rendering with {{ }} interpolation')],
          [L('JSON 提取', 'JSON Extract'), L('json', 'json'), L('从文本 / 模型输出中提取 JSON', 'Extracts JSON from text / model output')],
          [L('JSON 序列化', 'JSON Stringify'), L('json_stringify', 'json_stringify'), L('将对象转为 JSON 字符串', 'Serialises an object to a JSON string')],
          [L('JSON 解析', 'JSON Parse'), L('json_parse', 'json_parse'), L('将 JSON 字符串解析为对象', 'Parses a JSON string into an object')],
          [L('文本处理', 'Text Process'), L('text_process', 'text_process'), L('截取、拼接、替换等文本操作', 'Slice, concat, replace and other text operations')],
          [L('聚合', 'Aggregate'), L('aggregate', 'aggregate'), L('汇聚多分支结果', 'Aggregates results from multiple branches')],
          [L('文档解析', 'Doc Parse'), L('doc_parse', 'doc_parse'), L('从 URL 抓取或内联文本中提取纯文本内容（支持 HTML 与 PDF）', 'Fetches a URL or uses inline text and extracts plain text (HTML and PDF supported)')],
        ],
      },
      {
        kind: 'h3',
        text: L('工具节点', 'Tool Nodes'),
      },
      {
        kind: 'table',
        head: [L('节点', 'Node'), L('类型', 'Type'), L('说明', 'Description')],
        rows: [
          [L('代码（JS）', 'Code (JS)'), L('code', 'code'), L('沙箱执行 JavaScript，签名 main(input, nodes, variables)', 'Sandboxed JavaScript with signature main(input, nodes, variables)')],
          [L('代码（Python）', 'Code (Python)'), L('python', 'python'), L('子进程执行 Python 3，通过 stdin/stdout JSON 通信', 'Runs Python 3 in a subprocess with stdin/stdout JSON communication')],
          [L('HTTP 请求', 'HTTP'), L('http', 'http'), L('发起 HTTP 调用，URL / Header / Body 支持插值', 'Performs HTTP calls; URL / headers / body support interpolation')],
          [L('延迟', 'Delay'), L('delay', 'delay'), L('等待指定时间', 'Waits for a configured duration')],
          [L('通知', 'Notify'), L('notify', 'notify'), L('消息通知输出', 'Notification output')],
        ],
      },
      {
        kind: 'h3',
        text: L('数据库节点', 'Database Nodes'),
      },
      {
        kind: 'table',
        head: [L('节点', 'Node'), L('类型', 'Type'), L('说明', 'Description')],
        rows: [
          [L('自定义 SQL', 'SQL Custom'), L('sql_custom', 'sql_custom'), L('执行自定义 SQL 语句', 'Executes a custom SQL statement')],
          [L('数据创建', 'Data Create'), L('data_create', 'data_create'), L('插入数据记录', 'Inserts a data record')],
          [L('数据查询', 'Data Query'), L('data_query', 'data_query'), L('查询数据记录', 'Queries data records')],
          [L('数据更新', 'Data Update'), L('data_update', 'data_update'), L('更新数据记录', 'Updates a data record')],
          [L('数据删除', 'Data Delete'), L('data_delete', 'data_delete'), L('删除数据记录', 'Deletes a data record')],
        ],
      },
    ],
  },
  {
    id: 'knowledge',
    title: L('知识库管理', 'Knowledge Base'),
    blocks: [
      {
        kind: 'p',
        text: L(
          '知识库模块提供文档管理与语义检索能力，可在工作流中直接通过知识库节点接入 RAG 流程。',
          'The knowledge base module provides document management and semantic retrieval, ready to plug into RAG workflows via knowledge nodes.',
        ),
      },
      {
        kind: 'h3',
        text: L('使用步骤', 'Usage'),
      },
      {
        kind: 'list',
        items: [
          L('在「知识库」页面创建知识库，上传或粘贴文本文档', 'Create a knowledge base on the "Knowledge" page and upload or paste text documents'),
          L('系统自动分块并建立向量索引（基于语义嵌入）', 'The system automatically chunks documents and builds a vector index (semantic embeddings)'),
          L('在工作流中使用「知识库检索」或「知识问答」节点，选择对应知识库', 'In your workflow use a "KB Retrieve" or "Knowledge Q&A" node and select the knowledge base'),
          L('「知识问答」节点自动检索 top-k 块、构建 context 后调用 LLM 生成答案', '"Knowledge Q&A" retrieves the top-k chunks, builds a context and calls the LLM to generate an answer'),
        ],
      },
      {
        kind: 'h3',
        text: L('视频 / 音频节点注意事项', 'Video / Audio Node Notes'),
      },
      {
        kind: 'list',
        items: [
          L('视频理解节点需在 server/.env 设置 VIDEO_UNDERSTAND_BASE_URL 与 VIDEO_UNDERSTAND_API_KEY（如 Gemini / Qwen-VL 等支持 video_url 的多模态模型）', 'The video understanding node requires VIDEO_UNDERSTAND_BASE_URL and VIDEO_UNDERSTAND_API_KEY in server/.env (e.g. Gemini / Qwen-VL or any model accepting video_url content blocks)'),
          L('音视频总结节点需设置 WHISPER_BASE_URL 与 WHISPER_API_KEY（兼容 /v1/audio/transcriptions 接口）', 'The audio summary node requires WHISPER_BASE_URL and WHISPER_API_KEY (any /v1/audio/transcriptions-compatible endpoint)'),
          L('图片问答与 OCR 节点复用默认 LLM 配置，需选择支持 image_url 的视觉模型', 'Image Q&A and OCR reuse the default LLM config; choose a model that supports image_url content blocks'),
        ],
      },
    ],
  },
  {
    id: 'variables',
    title: L('变量与模板插值', 'Variables & Templating'),
    blocks: [
      {
        kind: 'p',
        text: L(
          '所有字符串配置中都可使用 {{ 表达式 }} 进行插值。若整个字符串是单个表达式，则保留原始类型（对象 / 数字）；否则按字符串拼接。',
          'Any string configuration supports {{ expression }} interpolation. When the whole string is a single expression the raw value is preserved (objects / numbers); otherwise values are stringified and concatenated.',
        ),
      },
      {
        kind: 'code',
        label: 'examples',
        text: '{{ input.order_id }}            # 触发器 / 运行输入\n{{ nodes.llm_1.output }}        # 上游节点输出\n{{ nodes.code_1.list }}         # 代码节点返回的数组（供循环节点使用）\n{{ variables.user_name }}       # 工作流变量',
      },
      {
        kind: 'p',
        text: L(
          '代码节点在 vm 沙箱中执行，入口函数签名为 main(input, nodes, variables)，返回值即该节点输出；受 CODE_NODE_TIMEOUT 超时保护。',
          'Code nodes execute in a vm sandbox with entry signature main(input, nodes, variables); the return value becomes the node output, guarded by CODE_NODE_TIMEOUT.',
        ),
      },
    ],
  },
  {
    id: 'debugging',
    title: L('调试工具集', 'Debugger'),
    blocks: [
      {
        kind: 'list',
        items: [
          L('断点：节点左上角圆点开关，命中后执行自动暂停（paused 高亮）', 'Breakpoints: toggle the dot on a node; execution pauses there with a paused highlight'),
          L('单步执行：暂停后可逐节点 step，观察每一步结果', 'Stepping: while paused, advance node by node and observe each result'),
          L('变量监控：调试面板实时查看 input / 各节点输出 / variables', 'Variable watch: the debug panel shows input / node outputs / variables live'),
          L('Mock 测试：无需外部依赖即可运行与调试', 'Mock testing: run and debug without external dependencies'),
          L('继续 / 停止：随时恢复执行或终止本次调试会话', 'Continue / stop: resume or terminate the debug session at any time'),
        ],
      },
    ],
  },
  {
    id: 'triggers',
    title: L('触发器与自动化', 'Triggers & Automation'),
    blocks: [
      {
        kind: 'list',
        items: [
          L('Webhook 触发：每个触发器生成独立 token，POST /api/hooks/:token 即可触发工作流', 'Webhook: each trigger gets its own token; POST /api/hooks/:token fires the workflow'),
          L('HMAC 签名：可选签名校验，防止伪造调用', 'HMAC signatures: optional verification against forged calls'),
          L('Cron 定时：内置调度器（心跳 20s），按 Cron 表达式周期执行', 'Cron: built-in scheduler (20s heartbeat) runs workflows on cron expressions'),
          L('限流保护：WEBHOOK_RATE_LIMIT 限制每个 token 每分钟调用次数', 'Rate limiting: WEBHOOK_RATE_LIMIT caps calls per token per minute'),
          L('SCHEDULER_ENABLED=false 可关闭定时调度（Webhook 仍可用）', 'SCHEDULER_ENABLED=false stops the cron scheduler (webhooks stay available)'),
        ],
      },
    ],
  },
  {
    id: 'agents',
    title: L('Agent 与 AI 构建器', 'Agents & AI Builder'),
    blocks: [
      {
        kind: 'list',
        items: [
          L('发布 Agent：工作流列表「发布为 Agent」，配置名称与描述后即可以对话方式调用', 'Publishing: “Publish as Agent” on a workflow; configure name/description and chat with it'),
          L('Agent 对话：/chat 页面选择 Agent 多轮对话，会话历史持久化', 'Chat: pick an Agent on /chat for multi-turn conversations with persisted history'),
          L('AI 构建器：/ai 页面用自然语言描述需求，LLM 自动生成工作流草稿并导入编辑器', 'AI Builder: describe your intent in natural language on /ai and the LLM drafts a workflow you can import into the editor'),
        ],
      },
    ],
  },
  {
    id: 'api',
    title: L('API 概览', 'API Overview'),
    blocks: [
      {
        kind: 'p',
        text: L(
          '所有接口以 /api 为前缀，除登录与 Webhook 外均需 Bearer Token。主要模块：',
          'All endpoints are prefixed with /api and require a Bearer token except login and webhooks. Main modules:',
        ),
      },
      {
        kind: 'table',
        head: [L('模块', 'Module'), L('主要端点', 'Key endpoints'), L('说明', 'Description')],
        rows: [
          [L('认证', 'Auth'), L('/api/auth/login · /me · /change-password', '/api/auth/login · /me · /change-password'), L('登录与个人信息', 'Sign-in and profile')],
          [L('工作流', 'Workflows'), L('/api/workflows CRUD · /run · /import · /:id/export', '/api/workflows CRUD · /run · /import · /:id/export'), L('编排与执行', 'Orchestration & execution')],
          [L('执行', 'Executions'), L('/api/executions · /stream(SSE) · /stats · /:id/debug/*', '/api/executions · /stream(SSE) · /stats · /:id/debug/*'), L('运行记录、实时流与调试', 'Run records, live stream & debugging')],
          [L('模型', 'Models'), L('/api/models CRUD · /:id/test · /:id/default', '/api/models CRUD · /:id/test · /:id/default'), L('模型配置与连通性测试', 'Model configs & connectivity tests')],
          [L('触发器', 'Triggers'), L('/api/triggers CRUD · /:id/rotate · /api/hooks/:token', '/api/triggers CRUD · /:id/rotate · /api/hooks/:token'), L('触发器管理与 Webhook', 'Trigger management & webhooks')],
          [L('Agent', 'Agents'), L('/api/agents CRUD · /:id/chat · /:id/conversations', '/api/agents CRUD · /:id/chat · /:id/conversations'), L('Agent 发布与对话', 'Agent publishing & chat')],
          [L('AI', 'AI'), L('/api/ai/workflow-draft', '/api/ai/workflow-draft'), L('自然语言生成工作流草稿', 'Natural-language workflow drafts')],
        ],
      },
    ],
  },
  {
    id: 'env',
    title: L('环境变量参考', 'Environment Reference'),
    blocks: [
      {
        kind: 'table',
        head: [L('变量', 'Variable'), L('默认值', 'Default'), L('说明', 'Description')],
        rows: [
          [L('PORT', 'PORT'), L('3001', '3001'), L('后端端口', 'Backend port')],
          [L('DATABASE_PATH', 'DATABASE_PATH'), L('data/zcl-flow.sqlite', 'data/zcl-flow.sqlite'), L('SQLite 文件路径', 'SQLite file path')],
          [L('JWT_SECRET / JWT_EXPIRES_IN', 'JWT_SECRET / JWT_EXPIRES_IN'), L('-', '-'), L('Token 签名密钥与有效期（7d）', 'Token signing secret & lifetime (7d)')],
          [L('ADMIN_USERNAME / ADMIN_PASSWORD', 'ADMIN_USERNAME / ADMIN_PASSWORD'), L('admin / 空', 'admin / empty'), L('初始管理员；密码留空则自动生成', 'Bootstrap admin; empty password auto-generates one')],
          [L('LLM_API_KEY / BASE_URL / MODEL / TIMEOUT', 'LLM_API_KEY / BASE_URL / MODEL / TIMEOUT'), L('-', '-'), L('OpenAI 兼容供应商配置；Key 留空用 Mock', 'OpenAI-compatible provider config; empty key uses mock')],
          [L('CODE_NODE_TIMEOUT', 'CODE_NODE_TIMEOUT'), L('5000', '5000'), L('单个代码节点超时（ms）', 'Per code-node timeout (ms)')],
          [L('HTTP_NODE_TIMEOUT', 'HTTP_NODE_TIMEOUT'), L('15000', '15000'), L('单个 HTTP 节点超时（ms）', 'Per HTTP-node timeout (ms)')],
          [L('MAX_NODES_PER_RUN', 'MAX_NODES_PER_RUN'), L('100', '100'), L('单次运行节点数上限', 'Max nodes per run')],
          [L('MAX_PARALLEL_NODES / MAX_CONCURRENT_RUNS', 'MAX_PARALLEL_NODES / MAX_CONCURRENT_RUNS'), L('4 / 4', '4 / 4'), L('波次并行度 / 并发运行数', 'Wave parallelism / concurrent runs')],
          [L('MAX_SUBFLOW_DEPTH', 'MAX_SUBFLOW_DEPTH'), L('3', '3'), L('子工作流嵌套深度', 'Sub-workflow nesting depth')],
          [L('MAX_LOOP_ITEMS / MAX_LOOP_CONCURRENCY', 'MAX_LOOP_ITEMS / MAX_LOOP_CONCURRENCY'), L('50 / 4', '50 / 4'), L('循环条目上限 / 循环并发', 'Loop item cap / loop concurrency')],
          [L('SCHEDULER_ENABLED', 'SCHEDULER_ENABLED'), L('true', 'true'), L('是否启用 Cron 调度器', 'Enable the cron scheduler')],
          [L('WEBHOOK_RATE_LIMIT', 'WEBHOOK_RATE_LIMIT'), L('60', '60'), L('每 token 每分钟调用上限（0 禁用）', 'Calls per token per minute (0 disables)')],
          [L('STATS_MAX_ROWS', 'STATS_MAX_ROWS'), L('20000', '20000'), L('统计看板扫描行数上限', 'Row scan cap for the stats dashboard')],
          [L('VIDEO_UNDERSTAND_BASE_URL / VIDEO_UNDERSTAND_API_KEY', 'VIDEO_UNDERSTAND_BASE_URL / VIDEO_UNDERSTAND_API_KEY'), L('-', '-'), L('视频理解节点专用模型端点（如 Gemini / Qwen-VL）', 'Dedicated model endpoint for the video understanding node (e.g. Gemini / Qwen-VL)')],
          [L('WHISPER_BASE_URL / WHISPER_API_KEY', 'WHISPER_BASE_URL / WHISPER_API_KEY'), L('-', '-'), L('音视频总结节点的 Whisper 兼容转录端点', 'Whisper-compatible transcription endpoint for the audio summary node')],
        ],
      },
    ],
  },
];
