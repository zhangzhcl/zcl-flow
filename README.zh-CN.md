# ZCL Flow

[English](README.md) | 中文

面向开发者的 AI 工作流编排平台。通过可视化画布构建、调试和部署智能自动化工作流，无需基础设施专业知识。

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

---

## 核心功能

- **可视化画布编辑器** — 基于 FlowGram 的拖拽式工作流设计
- **45+ 内置节点类型** — LLM、OCR、代码执行、知识库、HTTP、数据库、循环、分支等
- **知识库（RAG）** — 文档分块存储 + 向量检索 + 语义问答
- **Agent 系统** — 以工作流为驱动的对话 Agent，支持持久化对话历史
- **调试面板** — 每节点 I/O 追踪、实时运行日志、调试对话内回复预览（`send_message` 节点）
- **多分支工作流** — 条件分支、多路分支、列表循环、条件循环、退出循环
- **国际化** — 完整中英文 UI，运行时切换语言
- **工作流模板** — 空白画布、聊天机器人、写作助手、翻译、摘要、代码生成、图文客服机器人

---

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端 | React 18、Vite、FlowGram、Monaco Editor、Zustand、i18next |
| 后端 | NestJS 10、TypeORM、Better-SQLite3 |
| 认证 | JWT + Passport |
| AI | OpenAI 兼容 API（可配置模型端点） |

---

## 目录结构

```
zcl-flow/
├── client/                  # React 前端
│   └── src/
│       ├── components/      # FlowEditor、DebugPanel、AgentChat、公共组件
│       ├── editor/          # 节点注册、表单 Schema、模板、变量选择器
│       ├── pages/           # 路由级页面组件
│       ├── store/           # Zustand 状态切片
│       ├── i18n/locales/    # zh.json / en.json 翻译文件
│       └── api/             # 类型化 API 客户端
├── server/                  # NestJS 后端
│   └── src/
│       ├── engine/          # 工作流执行引擎、节点执行器、调试会话
│       ├── agents/          # Agent CRUD 和对话服务
│       ├── knowledge/       # 知识库：分块、向量存储、检索
│       ├── llm/             # LLM 服务抽象层
│       ├── models/          # 模型提供商配置
│       ├── executions/      # 执行历史持久化
│       ├── workflows/       # 工作流 CRUD
│       └── auth/            # JWT 认证守卫
└── AGENTS.md                # 开发规范与节点注册清单
```

---

## 节点类型

### AI
`llm` `classify` `text` `parameter_extractor` `image_qa` `ocr` `video_understand` `audio_summary`

### 逻辑
`condition` `condition_branch` `switch` `loop` `list_loop` `condition_loop` `break`

### 数据
`variable` `assign` `json` `json_stringify` `json_parse` `template` `aggregate` `text_process` `doc_parse` `memory`

### 工具
`send_message` `code` `python` `http` `delay` `notify` `subflow` `batch`

### 知识库
`knowledge_answer` `knowledge_retrieve` `knowledge_write`

### 数据库
`data_create` `data_query` `data_update` `data_delete` `sql_custom`

### 流程控制
`start` `end` `human_input` `question`

---

## 快速开始

```bash
# 安装依赖（根目录同时安装前后端）
pnpm install

# 启动开发服务器
pnpm dev
```

- 前端：`http://localhost:5173`
- 后端 API：`http://localhost:3000`

首次运行时会自动在 `server/data/db.sqlite` 创建 SQLite 数据库。

---

## 页面路由

| 路径 | 说明 |
|---|---|
| `/` | 落地页 |
| `/console` | 工作流列表 |
| `/workflows/:id` | 画布编辑器 |
| `/agents` | Agent 管理 |
| `/chat` | Agent 调试对话 |
| `/knowledge` | 知识库管理 |
| `/ai` | AI 构建器 |
| `/logs` | 执行日志 |
| `/models` | 模型提供商设置 |

---

## API 约定

- 基础路径：`/api`
- 认证：所有受保护接口携带 `Authorization: Bearer <token>`
- 执行工作流：`POST /api/executions`，body `{ workflowId, input }`
- Agent 对话：`POST /api/agents/:id/chat`，body `{ message, sessionId? }`

---

## 开发规范

参见 [AGENTS.md](AGENTS.md)，包含：

- 节点注册清单（需同步更新的 5 个文件）
- i18n 变量语法（翻译用 `%{var}%`，工作流表达式用 `{{node.field}}`）
- 条件分支端口命名（`branch_0`…`branch_7`，`default`）
- 引擎约定与执行器模式

---

## 开源协议

[GNU Affero General Public License v3.0](LICENSE) — 开源 Copyleft 协议。任何通过网络部署的衍生版本必须以相同协议开源。
