# AGENTS.md — ZCL Flow 开发规范

AI 代理（Claude Code 等）在此项目中工作时必须遵守以下规则。这些规则来自已有代码约定、历史教训和项目架构决策，**不可绕过**。

---

## 1. 语言与输出

- **所有与用户的交流使用中文**，代码注释和文档可中英混用，但面向用户的 UI 字符串必须走 i18n。
- **UI 禁止深色背景**：不得设置深色 body/页面背景色，不生成 dark mode 样式，不使用 `prefers-color-scheme: dark` 或 `data-theme="dark"`。所有页面保持浅色风格。
- **不加多余注释**：只在 WHY 非常不明显时才加注释（隐藏约束、特殊 workaround）。不写 WHAT 注释，不写任务名称/PR 编号到注释里。

---

## 2. i18n 插值格式

**关键约定**：`i18n/index.ts` 将插值前缀设为 `%{`，后缀设为 `}%`，以避免与工作流模板语法 `{{expr}}` 冲突。

```ts
// i18n/index.ts
interpolation: { prefix: '%{', suffix: '}%' }
```

**规则**：

- 所有 i18n 翻译文件（`zh.json`、`en.json`）中带变量的字符串必须使用 `%{varname}%` 格式，**绝对不能用** `{{varname}}`。
- 工作流节点的 prompt / expr 内部使用 `{{nodes.xxx.field}}` 引用变量，这是工作流引擎的语法，与 i18n 无关，**不要混淆**。
- 在 JSON 翻译文件的字符串值中，不要出现中文引号 `""`，会导致 JSON 解析出错，一律用普通引号或去掉引号。

---

## 3. 新增节点类型

每新增一个节点类型，必须同步修改以下文件，缺一不可：

| 文件 | 内容 |
|------|------|
| `server/src/engine/node-executors.ts` | 实现 `NodeExecutor` 类，注册到 `AppModule` |
| `client/src/editor/node-form-schemas.ts` | 声明表单字段（`FieldKind`、字段列表） |
| `client/src/editor/node-registries.tsx` | 注册节点元信息（label、icon、category） |
| `client/src/i18n/locales/zh.json` | 中文标签 |
| `client/src/i18n/locales/en.json` | 英文标签 |

节点执行器必须：
- 实现 `readonly type = 'node_type_name'` 字段
- 调用 `assertNotCancelled(ctx)` 在执行开始时检查取消信号
- 使用 `interpolate(str, ctx)` 解析 `{{expr}}` 插值，不要自己拼字符串
- 返回 `{ output: {...} }` 对象，`output` 下的字段即为下游可引用的变量名

---

## 4. 条件分支节点（condition_branch）

`condition_branch` 节点的分支端口 ID 规则：

- `branch_0` ... `branch_7`：对应 `branches` 数组的第 0 到 7 个分支，**按顺序短路求值**
- `default`：所有分支均不满足时走此端口

模板中从 condition_branch 引出边时必须带 `sourcePortID`：

```ts
{ sourceNodeID: 'branch_xxx', targetNodeID: 'next_node', sourcePortID: 'branch_0' }
{ sourceNodeID: 'branch_xxx', targetNodeID: 'fallback', sourcePortID: 'default' }
```

节点 data 结构：

```ts
{
  branches: [
    { id: string, name: string, condition: string }  // condition 是可含插值的布尔表达式
  ]
}
```

---

## 5. 表单字段类型（FieldKind）

当前可用的 `FieldKind`：

```ts
'text' | 'textarea' | 'number' | 'select' | 'model'
| 'workflow' | 'knowledge' | 'file-upload'
| 'classify-categories'
```

- `file-upload`：渲染 `FileUploadControl`，包含 `VariablePicker` 支持变量引用。适用于图片 URL、视频 URL、文件路径等字段。
- `classify-categories`：渲染 `ClassifyCategoriesControl`，结构化分类规则编辑器（名称 + 描述 + 示例）。
- `model`：模型配置选择器，对应后端 `ModelConfig` 实体。
- `knowledge`：知识库选择器，对应后端 `KnowledgeBase` 实体。

新增 `FieldKind` 时，必须在 `NodeFormControls.tsx` 的 `FieldControl` 函数中增加对应的 `if` 分支。

---

## 6. 工作流模板（templates.tsx）

模板文件位于 `client/src/editor/templates.tsx`，规则：

- 每个模板用一个独立的 `build*()` 函数，返回 `WorkflowDefinition`
- 使用文件顶部的 `node(id, type, x, y, data)` 辅助函数创建节点
- 使用 `L(zh, en)` 辅助函数处理双语文本（在 `data` 内部的标签/prompt）
- 节点 ID 全局唯一，建议以类型作前缀（`start_0`、`llm_reply`、`branch_hasImg`）
- 模板名称/描述必须走 i18n key（`templates.xxx.name`、`templates.xxx.desc`），并在两个语言文件中对应添加
- 在 `getTemplates()` 中注册，使用 `lucide-react` 图标

---

## 7. 变量引用语法

工作流中节点之间的数据引用：

```
{{input.fieldName}}          # 引用 start 节点的输入参数
{{nodes.nodeId.fieldName}}   # 引用任意上游节点的输出字段
{{variables.varName}}        # 引用全局变量
```

- `interpolate(str, ctx)` 函数处理这类替换，支持点路径、数组索引
- 在 prompt、condition、payload 等字符串字段中均可使用
- `VariablePicker` 组件在前端提供辅助插入功能，插入后格式自动正确

---

## 8. 知识库

- **分块存储**：文档上传后切分为 `KnowledgeChunk` 实体，每块存 `content` + `embedding`（暂为文本相似度）
- **检索**：`knowledge_retrieve` 节点根据 `query` 检索，输出 `chunks`（数组）和 `context`（拼接文本）
- **RAG 问答**：`knowledge_answer` 节点 = 检索 + LLM，输出 `answer`
- **写入**：`knowledge_write` 节点向运行时写入新文档
- **文件上传**：支持 TXT / MD / MARKDOWN / CSV / JSON，支持多选和文件夹导入（`webkitdirectory`），无前端大小限制

---

## 9. 后端执行引擎约定

- **DAG 调度**：`graph-scheduler.ts` 做拓扑排序，可并行的节点会同时执行
- **取消机制**：`RunContext` 携带 `AbortSignal`，长耗时节点必须监听 `ctx.signal`
- **错误处理**：节点 `data.onError` 可配置 `fail`（默认）/ `skip` / `retry`
- **condition_branch 路由**：执行器返回 `{ output, branch: 'branch_0' | 'default' }`，引擎据此决定走哪条边
- **插值工具**：`template.util.ts` 导出 `interpolate(str, ctx)`，支持深路径和数组；`interpolateDeep(obj, ctx)` 递归处理对象

---

## 10. 代码风格

- TypeScript 严格模式，不使用 `any`（除非对接第三方 API 无法避免，需标注 `// eslint-disable-next-line @typescript-eslint/no-explicit-any`）
- React 组件：函数式组件 + Hooks，不使用 class 组件
- 样式：Tailwind CSS，不写内联 style（除非动态数值如宽度百分比），不写 CSS 文件（除 `index.css` 全局样式）
- 状态管理：局部状态用 `useState`，跨组件用 Zustand，不引入 Redux
- 文件命名：组件用 PascalCase，工具函数文件用 kebab-case 或 camelCase
- 导入顺序：第三方库 → 内部模块 → 类型（type-only import 放最后）

---

## 11. 禁止事项

- **禁止修改 i18n 插值分隔符**（`%{` / `}%`），改动会导致全站翻译失效
- **禁止在节点执行器中直接调用 LLM API**，必须通过 `LlmService`
- **禁止在 client 中硬编码中文字符串**（页面展示文字），所有用户可见文本走 i18n
- **禁止删除 `condition_branch` 的 `default` 端口**，引擎依赖它作为 else 分支
- **禁止在模板的 `build*()` 中使用 `i18n.t()`**，模板 build 在画布加载时执行，语言可能未就绪，改用 `L(zh, en)` 辅助函数
- **禁止深色背景**（见第 1 条）
- **禁止 `{{var}}` 格式出现在 i18n 翻译文件中**（见第 2 条）

---

## 12. 新功能开发流程

1. 确认影响范围（前端 / 后端 / 两者）
2. 后端：在 `node-executors.ts` 实现执行器并注册到 `AppModule`
3. 前端：在 `node-form-schemas.ts` + `node-registries.tsx` 注册节点 UI
4. 如需新表单控件：在 `NodeFormControls.tsx` 添加组件，并扩展 `FieldKind`
5. i18n：同步更新 `zh.json` 和 `en.json`，变量用 `%{var}%`
6. 验证：`npx tsc --noEmit`（前端）无报错，服务器重启后 smoke test 通过
