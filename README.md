# ZCL Flow

[中文](README.zh-CN.md) | English

Developer-first AI workflow orchestration platform. Build, debug, and deploy intelligent automation workflows through a visual canvas — no infrastructure expertise required.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

---

## Features

- **Visual canvas editor** — drag-and-drop workflow design powered by FlowGram
- **45+ built-in node types** — LLM, OCR, code execution, knowledge base, HTTP, database, loops, branching, and more
- **Knowledge base (RAG)** — chunked document storage with vector retrieval and semantic Q&A
- **Agent system** — conversational agents backed by workflows, with persistent chat history
- **Debug panel** — per-node I/O tracing, live run logs, and in-chat reply preview (`send_message` node)
- **Multi-branch workflows** — condition branches, switch, list loops, condition loops, break
- **i18n** — full Chinese / English UI with runtime language switching
- **Workflow templates** — blank, chatbot, writer, translator, summarizer, code generator, image-text Q&A bot

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, FlowGram, Monaco Editor, Zustand, i18next |
| Backend | NestJS 10, TypeORM, Better-SQLite3 |
| Auth | JWT + Passport |
| AI | OpenAI-compatible API (configurable model endpoints) |

---

## Directory Structure

```
zcl-flow/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # FlowEditor, DebugPanel, AgentChat, common UI
│       ├── editor/          # Node registries, form schemas, templates, variable picker
│       ├── pages/           # Route-level page components
│       ├── store/           # Zustand state slices
│       ├── i18n/locales/    # zh.json / en.json translation files
│       └── api/             # Typed API client
├── server/                  # NestJS backend
│   └── src/
│       ├── engine/          # Workflow runner, node executors, debug session
│       ├── agents/          # Agent CRUD and chat service
│       ├── knowledge/       # Knowledge base: chunking, vector store, retrieval
│       ├── llm/             # LLM service abstraction
│       ├── models/          # Model provider configuration
│       ├── executions/      # Execution history persistence
│       ├── workflows/       # Workflow CRUD
│       └── auth/            # JWT auth guards
└── AGENTS.md                # Development rules and node registration checklist
```

---

## Node Types

### AI
`llm` `classify` `text` `parameter_extractor` `image_qa` `ocr` `video_understand` `audio_summary`

### Logic
`condition` `condition_branch` `switch` `loop` `list_loop` `condition_loop` `break`

### Data
`variable` `assign` `json` `json_stringify` `json_parse` `template` `aggregate` `text_process` `doc_parse` `memory`

### Tools
`send_message` `code` `python` `http` `delay` `notify` `subflow` `batch`

### Knowledge
`knowledge_answer` `knowledge_retrieve` `knowledge_write`

### Database
`data_create` `data_query` `data_update` `data_delete` `sql_custom`

### Flow Control
`start` `end` `human_input` `question`

---

## Quick Start

```bash
# Install dependencies (root installs both client and server)
pnpm install

# Start development servers
pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

The SQLite database is created automatically at `server/data/db.sqlite` on first run.

---

## Routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/console` | Workflow list |
| `/workflows/:id` | Canvas editor |
| `/agents` | Agent management |
| `/chat` | Agent debug chat |
| `/knowledge` | Knowledge base management |
| `/ai` | AI builder |
| `/logs` | Execution logs |
| `/models` | Model provider settings |

---

## API Conventions

- Base URL: `/api`
- Auth: `Authorization: Bearer <token>` on all protected routes
- Workflow execution: `POST /api/executions` with `{ workflowId, input }`
- Agent chat: `POST /api/agents/:id/chat` with `{ message, sessionId? }`

---

## Development

See [AGENTS.md](AGENTS.md) for the full development ruleset, including:

- Node registration checklist (5 files to update)
- i18n variable syntax (`%{var}%` for translations, `{{node.field}}` for workflow expressions)
- Condition branch port naming (`branch_0`…`branch_7`, `default`)
- Engine conventions and executor patterns

---

## License

[GNU Affero General Public License v3.0](LICENSE) — open source, copyleft. Any network-deployed derivative must be released under the same license.
