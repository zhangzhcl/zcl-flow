/**
 * Schema-driven node form definitions.
 *
 * This is the single source of truth for every node's configurable fields.
 * The right-side property panel renders controls from these schemas and reads/
 * writes values through the FlowGram node form model (`form.getValueIn` /
 * `form.setValueIn`). Node cards on the canvas no longer embed the form; they
 * only show a summary, so all editing happens in the panel.
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'model'
  | 'workflow'
  | 'knowledge'
  | 'file-upload'
  | 'classify-categories';

export interface FieldOption {
  value: string;
  /** Literal label (e.g. HTTP methods). */
  label?: string;
  /** i18n label key, preferred over `label` when present. */
  labelKey?: string;
}

export interface NodeFieldSchema {
  /** Form value path (matches the executor's `node.data` key). */
  name: string;
  /** i18n key for the field label. */
  labelKey: string;
  kind: FieldKind;
  /** i18n key for the placeholder. */
  placeholderKey?: string;
  /** Literal placeholder (used when no i18n key is given). */
  placeholder?: string;
  /** Textarea rows. */
  rows?: number;
  /** Options for `select` fields. */
  options?: FieldOption[];
  /** i18n key for a small hint rendered under the control. */
  hintKey?: string;
  /** For `file-upload`: MIME accept string, e.g. "image/*" or "video/*,audio/*". */
  accept?: string;
}

const HTTP_METHODS: FieldOption[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(
  (method) => ({ value: method, label: method }),
);

/**
 * Field schemas for every node type. Order here is the render order in the
 * property panel. `start` has no editable fields (description only).
 */
export const NODE_FORM_SCHEMAS: Record<string, NodeFieldSchema[]> = {
  start: [],

  end: [
    {
      name: 'outputs',
      labelKey: 'form.outputs',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.outputsPlaceholder',
    },
  ],

  llm: [
    { name: 'modelConfigId', labelKey: 'form.modelConfig', kind: 'model' },
    { name: 'systemPrompt', labelKey: 'form.systemPrompt', kind: 'textarea', rows: 3 },
    {
      name: 'prompt',
      labelKey: 'form.prompt',
      kind: 'textarea',
      rows: 5,
      placeholderKey: 'form.promptPlaceholder',
    },
    { name: 'temperature', labelKey: 'form.temperature', kind: 'number', placeholder: '0.7' },
    { name: 'maxTokens', labelKey: 'form.maxTokens', kind: 'number', placeholder: '2048' },
  ],

  code: [
    {
      name: 'code',
      labelKey: 'form.code',
      kind: 'textarea',
      rows: 8,
      placeholderKey: 'form.codePlaceholder',
    },
  ],

  condition: [
    {
      name: 'expression',
      labelKey: 'form.expression',
      kind: 'text',
      placeholderKey: 'form.expressionPlaceholder',
    },
  ],

  http: [
    { name: 'method', labelKey: 'form.method', kind: 'select', options: HTTP_METHODS },
    { name: 'url', labelKey: 'form.url', kind: 'text', placeholder: 'https://api.example.com' },
    { name: 'headers', labelKey: 'form.headers', kind: 'textarea', rows: 2, placeholderKey: 'form.headersPlaceholder' },
    { name: 'body', labelKey: 'form.body', kind: 'textarea', rows: 3 },
  ],

  template: [
    {
      name: 'template',
      labelKey: 'form.template',
      kind: 'textarea',
      rows: 5,
      placeholderKey: 'form.templatePlaceholder',
    },
  ],

  variable: [
    {
      name: 'assignments',
      labelKey: 'form.assignments',
      kind: 'textarea',
      rows: 4,
      placeholder: '{ "count": "{{nodes.code_1.value}}" }',
    },
  ],

  delay: [{ name: 'ms', labelKey: 'form.ms', kind: 'number', placeholder: '1000' }],

  switch: [
    {
      name: 'case1',
      labelKey: 'form.case1',
      kind: 'text',
      placeholderKey: 'form.expressionPlaceholder',
    },
    {
      name: 'case2',
      labelKey: 'form.case2',
      kind: 'text',
      placeholderKey: 'form.expressionPlaceholder',
    },
  ],

  subflow: [
    { name: 'workflowId', labelKey: 'form.targetWorkflow', kind: 'workflow' },
    {
      name: 'input',
      labelKey: 'form.subflowInput',
      kind: 'textarea',
      rows: 4,
      placeholderKey: 'form.subflowInputPlaceholder',
    },
  ],

  loop: [
    { name: 'workflowId', labelKey: 'form.targetWorkflow', kind: 'workflow' },
    {
      name: 'items',
      labelKey: 'form.loopItems',
      kind: 'textarea',
      rows: 2,
      placeholderKey: 'form.loopItemsPlaceholder',
    },
    { name: 'concurrency', labelKey: 'form.loopConcurrency', kind: 'number', placeholder: '1' },
    {
      name: 'input',
      labelKey: 'form.subflowInput',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.subflowInputPlaceholder',
    },
  ],

  // condition_branch uses a custom editor (ConditionBranchEditor) in NodeFormControls
  condition_branch: [],

  list_loop: [
    { name: 'workflowId', labelKey: 'form.targetWorkflow', kind: 'workflow' },
    {
      name: 'items',
      labelKey: 'form.loopItems',
      kind: 'text',
      placeholder: '{{nodes.code_1.list}}',
    },
    { name: 'concurrency', labelKey: 'form.loopConcurrency', kind: 'number', placeholder: '1' },
  ],

  condition_loop: [
    { name: 'workflowId', labelKey: 'form.targetWorkflow', kind: 'workflow' },
    {
      name: 'stopCondition',
      labelKey: 'form.stopCondition',
      kind: 'text',
      placeholder: '{{nodes.code_1.done}} == true',
    },
    { name: 'maxIterations', labelKey: 'form.maxIterations', kind: 'number', placeholder: '10' },
    {
      name: 'errorHandling',
      labelKey: 'form.errorHandling',
      kind: 'select',
      options: [
        { value: 'terminate_loop', labelKey: 'form.terminateLoop' },
        { value: 'terminate_iteration', labelKey: 'form.terminateIteration' },
      ],
    },
  ],

  // ---- AI-native nodes (v0.6) ----

  json: [
    {
      name: 'source',
      labelKey: 'form.jsonSource',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.jsonSourcePlaceholder',
      hintKey: 'form.jsonSourceHint',
    },
    {
      name: 'extractMode',
      labelKey: 'form.jsonExtractMode',
      kind: 'select',
      options: [
        { value: 'auto', labelKey: 'form.jsonModeAuto' },
        { value: 'codeBlock', labelKey: 'form.jsonModeCodeBlock' },
        { value: 'raw', labelKey: 'form.jsonModeRaw' },
      ],
    },
    {
      name: 'schema',
      labelKey: 'form.jsonSchema',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.jsonSchemaPlaceholder',
      hintKey: 'form.jsonSchemaHint',
    },
  ],

  classify: [
    {
      name: 'input',
      labelKey: 'form.classifyInput',
      kind: 'textarea',
      rows: 2,
      placeholderKey: 'form.classifyInputPlaceholder',
    },
    {
      name: 'categories',
      labelKey: 'form.classifyCategories',
      kind: 'classify-categories',
    },
    { name: 'modelConfigId', labelKey: 'form.modelConfig', kind: 'model' },
  ],

  text: [
    {
      name: 'operation',
      labelKey: 'form.textOperation',
      kind: 'select',
      options: [
        { value: 'summarize', labelKey: 'form.textOpSummarize' },
        { value: 'extract', labelKey: 'form.textOpExtract' },
        { value: 'translate', labelKey: 'form.textOpTranslate' },
        { value: 'rewrite', labelKey: 'form.textOpRewrite' },
        { value: 'custom', labelKey: 'form.textOpCustom' },
      ],
    },
    {
      name: 'input',
      labelKey: 'form.textInput',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.textInputPlaceholder',
    },
    {
      name: 'instruction',
      labelKey: 'form.textInstruction',
      kind: 'textarea',
      rows: 2,
      placeholderKey: 'form.textInstructionPlaceholder',
    },
    { name: 'modelConfigId', labelKey: 'form.modelConfig', kind: 'model' },
  ],

  aggregate: [
    {
      name: 'mode',
      labelKey: 'form.aggregateMode',
      kind: 'select',
      options: [
        { value: 'object', labelKey: 'form.aggregateModeObject' },
        { value: 'array', labelKey: 'form.aggregateModeArray' },
      ],
      hintKey: 'form.aggregateHint',
    },
  ],

  send_message: [
    {
      name: 'message',
      labelKey: 'form.sendMessage',
      kind: 'textarea',
      rows: 4,
      placeholderKey: 'form.sendMessagePlaceholder',
    },
  ],

  notify: [
    { name: 'webhookUrl', labelKey: 'form.notifyUrl', kind: 'text', placeholder: 'https://hooks.example.com/xxx' },
    { name: 'method', labelKey: 'form.method', kind: 'select', options: HTTP_METHODS },
    {
      name: 'payload',
      labelKey: 'form.notifyPayload',
      kind: 'textarea',
      rows: 4,
      placeholderKey: 'form.notifyPayloadPlaceholder',
    },
  ],

  batch: [
    { name: 'workflowId', labelKey: 'form.targetWorkflow', kind: 'workflow' },
    {
      name: 'items',
      labelKey: 'form.batchItems',
      kind: 'textarea',
      rows: 2,
      placeholderKey: 'form.batchItemsPlaceholder',
    },
    { name: 'concurrency', labelKey: 'form.batchConcurrency', kind: 'number', placeholder: '4' },
    {
      name: 'input',
      labelKey: 'form.subflowInput',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.subflowInputPlaceholder',
    },
  ],

  assign: [
    {
      name: 'assignments',
      labelKey: 'form.assignAssignments',
      kind: 'textarea',
      rows: 5,
      placeholder: '{ "total": "{{nodes.code_1.count}}", "label": "{{input.name}}" }',
    },
  ],

  json_stringify: [
    {
      name: 'value',
      labelKey: 'form.jsonStringifyValue',
      kind: 'textarea',
      rows: 4,
      placeholderKey: 'form.jsonStringifyPlaceholder',
    },
  ],

  json_parse: [
    {
      name: 'jsonStr',
      labelKey: 'form.jsonParseInput',
      kind: 'textarea',
      rows: 5,
      placeholderKey: 'form.jsonParsePlaceholder',
    },
  ],

  text_process: [
    {
      name: 'text',
      labelKey: 'form.textProcessInput',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.textProcessInputPlaceholder',
    },
    {
      name: 'op',
      labelKey: 'form.textProcessOp',
      kind: 'select',
      options: [
        { value: 'replace', labelKey: 'form.textProcessOpReplace' },
        { value: 'split', labelKey: 'form.textProcessOpSplit' },
        { value: 'substr', labelKey: 'form.textProcessOpSubstr' },
        { value: 'trim', labelKey: 'form.textProcessOpTrim' },
        { value: 'upper', labelKey: 'form.textProcessOpUpper' },
        { value: 'lower', labelKey: 'form.textProcessOpLower' },
        { value: 'length', labelKey: 'form.textProcessOpLength' },
      ],
    },
    {
      name: 'params',
      labelKey: 'form.textProcessParams',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.textProcessParamsPlaceholder',
    },
  ],

  question: [
    {
      name: 'question',
      labelKey: 'form.questionText',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.questionTextPlaceholder',
    },
    {
      name: 'options',
      labelKey: 'form.questionOptions',
      kind: 'textarea',
      rows: 3,
      placeholder: '["选项A", "选项B", "选项C"]',
    },
  ],

  knowledge_retrieve: [
    { name: 'knowledgeId', labelKey: 'form.knowledgeId', kind: 'knowledge' },
    {
      name: 'query',
      labelKey: 'form.knowledgeQuery',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.knowledgeQueryPlaceholder',
    },
    { name: 'topK', labelKey: 'form.knowledgeTopK', kind: 'number', placeholder: '5' },
    { name: 'scoreThreshold', labelKey: 'form.knowledgeScoreThreshold', kind: 'number', placeholder: '0.7' },
  ],

  knowledge_write: [
    { name: 'knowledgeId', labelKey: 'form.knowledgeId', kind: 'knowledge' },
    {
      name: 'docs',
      labelKey: 'form.knowledgeDocs',
      kind: 'textarea',
      rows: 6,
      placeholder: '[{ "content": "文档内容", "metadata": {} }]',
    },
  ],

  sql_custom: [
    { name: 'datasourceId', labelKey: 'form.datasourceId', kind: 'text', placeholderKey: 'form.datasourceIdPlaceholder' },
    {
      name: 'sql',
      labelKey: 'form.sqlStatement',
      kind: 'textarea',
      rows: 8,
      placeholder: 'SELECT * FROM users WHERE id = :id',
    },
    {
      name: 'params',
      labelKey: 'form.sqlParams',
      kind: 'textarea',
      rows: 3,
      placeholder: '{ "id": "{{input.userId}}" }',
    },
  ],

  data_create: [
    { name: 'datasourceId', labelKey: 'form.datasourceId', kind: 'text', placeholderKey: 'form.datasourceIdPlaceholder' },
    { name: 'tableName', labelKey: 'form.tableName', kind: 'text', placeholderKey: 'form.tableNamePlaceholder' },
    {
      name: 'fields',
      labelKey: 'form.dataFields',
      kind: 'textarea',
      rows: 5,
      placeholder: '{ "name": "{{input.name}}", "email": "{{input.email}}" }',
    },
  ],

  data_query: [
    { name: 'datasourceId', labelKey: 'form.datasourceId', kind: 'text', placeholderKey: 'form.datasourceIdPlaceholder' },
    { name: 'tableName', labelKey: 'form.tableName', kind: 'text', placeholderKey: 'form.tableNamePlaceholder' },
    {
      name: 'filter',
      labelKey: 'form.dataFilter',
      kind: 'textarea',
      rows: 4,
      placeholder: '{ "status": "active" }',
    },
    { name: 'limit', labelKey: 'form.dataLimit', kind: 'number', placeholder: '100' },
  ],

  data_update: [
    { name: 'datasourceId', labelKey: 'form.datasourceId', kind: 'text', placeholderKey: 'form.datasourceIdPlaceholder' },
    { name: 'tableName', labelKey: 'form.tableName', kind: 'text', placeholderKey: 'form.tableNamePlaceholder' },
    {
      name: 'filter',
      labelKey: 'form.dataFilter',
      kind: 'textarea',
      rows: 3,
      placeholder: '{ "id": "{{input.id}}" }',
    },
    {
      name: 'fields',
      labelKey: 'form.dataUpdateFields',
      kind: 'textarea',
      rows: 4,
      placeholder: '{ "status": "done" }',
    },
  ],

  data_delete: [
    { name: 'datasourceId', labelKey: 'form.datasourceId', kind: 'text', placeholderKey: 'form.datasourceIdPlaceholder' },
    { name: 'tableName', labelKey: 'form.tableName', kind: 'text', placeholderKey: 'form.tableNamePlaceholder' },
    {
      name: 'filter',
      labelKey: 'form.dataFilter',
      kind: 'textarea',
      rows: 3,
      placeholder: '{ "id": "{{input.id}}" }',
    },
  ],

  knowledge_answer: [
    { name: 'knowledgeId', labelKey: 'form.knowledgeId', kind: 'knowledge' },
    { name: 'modelConfigId', labelKey: 'form.modelConfig', kind: 'model' },
    {
      name: 'question',
      labelKey: 'form.question',
      kind: 'textarea',
      rows: 3,
      placeholder: '{{input.question}}',
    },
    { name: 'topK', labelKey: 'form.knowledgeTopK', kind: 'number', placeholder: '5' },
    { name: 'scoreThreshold', labelKey: 'form.knowledgeScoreThreshold', kind: 'number', placeholder: '0' },
    {
      name: 'maxImages',
      labelKey: 'form.knowledgeMaxImages',
      kind: 'number',
      placeholder: '4',
    },
    {
      name: 'systemPrompt',
      labelKey: 'form.systemPrompt',
      kind: 'textarea',
      rows: 3,
      placeholderKey: 'form.systemPromptPlaceholder',
    },
  ],

  break: [],

  doc_parse: [
    {
      name: 'url',
      labelKey: 'form.docUrl',
      kind: 'text',
      placeholder: 'https://example.com/document.pdf',
    },
    {
      name: 'content',
      labelKey: 'form.docContent',
      kind: 'textarea',
      rows: 4,
      placeholder: '{{input.text}}',
    },
  ],

  image_qa: [
    { name: 'modelConfigId', labelKey: 'form.modelConfig', kind: 'model' },
    {
      name: 'imageUrl',
      labelKey: 'form.imageUrl',
      kind: 'file-upload',
      accept: 'image/*',
      placeholder: 'https://example.com/image.png 或 {{input.imageUrl}}',
    },
    {
      name: 'question',
      labelKey: 'form.question',
      kind: 'textarea',
      rows: 3,
      placeholder: '请描述这张图片的内容',
    },
  ],

  ocr: [
    { name: 'modelConfigId', labelKey: 'form.modelConfig', kind: 'model' },
    {
      name: 'imageUrl',
      labelKey: 'form.imageUrl',
      kind: 'file-upload',
      accept: 'image/*',
      placeholder: 'https://example.com/image.png 或 {{input.imageUrl}}',
    },
  ],

  python: [
    {
      name: 'code',
      labelKey: 'form.code',
      kind: 'textarea',
      rows: 10,
      placeholder: '# 可以访问 input, nodes, variables\n# 将返回值赋给 result\nresult = input.get("value", 0) * 2',
    },
  ],

  video_understand: [
    { name: 'modelConfigId', labelKey: 'form.modelConfig', kind: 'model' },
    {
      name: 'videoUrl',
      labelKey: 'form.videoUrl',
      kind: 'file-upload',
      accept: 'video/*',
      placeholder: 'https://example.com/video.mp4 或 {{input.videoUrl}}',
    },
    {
      name: 'question',
      labelKey: 'form.question',
      kind: 'textarea',
      rows: 3,
      placeholder: '请描述这个视频的内容',
    },
  ],

  audio_summary: [
    { name: 'modelConfigId', labelKey: 'form.modelConfig', kind: 'model' },
    {
      name: 'audioUrl',
      labelKey: 'form.audioUrl',
      kind: 'file-upload',
      accept: 'audio/*,video/*',
      placeholder: 'https://example.com/audio.mp3 或 {{input.audioUrl}}',
    },
    {
      name: 'language',
      labelKey: 'form.audioLanguage',
      kind: 'select',
      options: [
        { value: 'zh', label: '中文' },
        { value: 'en', label: 'English' },
        { value: 'ja', label: '日本語' },
        { value: 'ko', label: '한국어' },
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Deutsch' },
      ],
    },
    {
      name: 'summarise',
      labelKey: 'form.audioSummarise',
      kind: 'select',
      options: [
        { value: 'true', labelKey: 'common.yes' },
        { value: 'false', labelKey: 'common.no' },
      ],
    },
  ],

  parameter_extractor: [
    { name: 'modelConfigId', labelKey: 'form.modelConfig', kind: 'model' },
    {
      name: 'input',
      labelKey: 'form.extractInput',
      kind: 'textarea',
      rows: 2,
      placeholder: '{{input.text}} 或需要提取字段的文本',
    },
    {
      name: 'fields',
      labelKey: 'form.extractFields',
      kind: 'textarea',
      rows: 4,
      placeholder: 'JSON 数组，例如：\n[{"name":"name","type":"string","desc":"姓名"},{"name":"age","type":"number","desc":"年龄"}]',
    },
  ],

  human_input: [
    {
      name: 'prompt',
      labelKey: 'form.humanInputPrompt',
      kind: 'textarea',
      rows: 3,
      placeholder: '请输入您的问题或需要人工确认的内容...',
    },
    {
      name: 'timeout',
      labelKey: 'form.humanInputTimeout',
      kind: 'number',
      placeholder: '3600（秒，0 = 永不超时）',
    },
  ],

  memory: [
    {
      name: 'operation',
      labelKey: 'form.memoryOperation',
      kind: 'select',
      options: [
        { value: 'read', label: '读取记忆' },
        { value: 'write', label: '写入记忆' },
        { value: 'clear', label: '清空记忆' },
      ],
    },
    {
      name: 'key',
      labelKey: 'form.memoryKey',
      kind: 'text',
      placeholder: 'history（记忆 key）',
    },
    {
      name: 'value',
      labelKey: 'form.memoryValue',
      kind: 'textarea',
      rows: 3,
      placeholder: '{{nodes.llm_1.text}}（write 操作时填写）',
    },
    {
      name: 'maxItems',
      labelKey: 'form.memoryMaxItems',
      kind: 'number',
      placeholder: '20（最多保留条数，0 = 不限）',
    },
  ],
};

/** Returns the schema for a node type (empty array when unknown). */
export function getNodeFormSchema(type: string): NodeFieldSchema[] {
  return NODE_FORM_SCHEMAS[type] ?? [];
}
