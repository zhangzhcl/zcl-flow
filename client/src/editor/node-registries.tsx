import type { ReactNode } from 'react';
import { WorkflowNodeRegistry } from '@flowgram.ai/free-layout-editor';
import {
  BookOpen,
  BookmarkPlus,
  Boxes,
  Braces,
  Brain,
  ClipboardList,
  Code2,
  Database,
  FileCode,
  FileCode2,
  FileJson2,
  FileMinus2,
  FilePlus2,
  FileSearch,
  FilePen,
  FileText,
  Flag,
  GitBranch,
  Globe,
  HelpCircle,
  Image,
  Layers,
  LayoutTemplate,
  ListFilter,
  Megaphone,
  MessageCircle,
  PenLine,
  Play,
  RefreshCw,
  Repeat,
  Scissors,
  ScanText,
  SquareTerminal,
  Sparkles,
  Split,
  StopCircle,
  Tags,
  Timer,
  UserCheck,
  Video,
  Volume2,
  Zap,
} from 'lucide-react';

/**
 * Node type -> lucide icon (SVG only, no emoji).
 * Shared by the add-node panel, canvas cards, property panel and context menu.
 */
export const NODE_ICONS: Record<string, ReactNode> = {
  start: <Play size={14} />,
  end: <Flag size={14} />,
  llm: <Sparkles size={14} />,
  code: <Code2 size={14} />,
  condition: <GitBranch size={14} />,
  http: <Globe size={14} />,
  template: <LayoutTemplate size={14} />,
  variable: <Braces size={14} />,
  delay: <Timer size={14} />,
  switch: <Split size={14} />,
  subflow: <Boxes size={14} />,
  loop: <Repeat size={14} />,
  json: <FileJson2 size={14} />,
  classify: <Tags size={14} />,
  text: <PenLine size={14} />,
  aggregate: <Layers size={14} />,
  send_message: <MessageCircle size={14} />,
  notify: <Megaphone size={14} />,
  // new nodes
  batch: <Zap size={14} />,
  assign: <ClipboardList size={14} />,
  json_stringify: <FileCode2 size={14} />,
  json_parse: <FileCode size={14} />,
  text_process: <Scissors size={14} />,
  question: <HelpCircle size={14} />,
  knowledge_retrieve: <BookOpen size={14} />,
  knowledge_write: <BookmarkPlus size={14} />,
  sql_custom: <Database size={14} />,
  data_create: <FilePlus2 size={14} />,
  data_query: <FileSearch size={14} />,
  data_update: <FilePen size={14} />,
  data_delete: <FileMinus2 size={14} />,
  // new nodes
  knowledge_answer: <Sparkles size={14} />,
  break: <StopCircle size={14} />,
  doc_parse: <FileText size={14} />,
  image_qa: <Image size={14} />,
  ocr: <ScanText size={14} />,
  python: <SquareTerminal size={14} />,
  video_understand: <Video size={14} />,
  audio_summary: <Volume2 size={14} />,
  parameter_extractor: <ListFilter size={14} />,
  human_input: <UserCheck size={14} />,
  memory: <Brain size={14} />,
  condition_branch: <GitBranch size={14} />,
  list_loop: <Repeat size={14} />,
  condition_loop: <RefreshCw size={14} />,
};

/**
 * Nodes no longer embed their configuration form on the canvas. The card shows
 * a compact summary and all editing happens in the right-side property panel,
 * which renders controls from `NODE_FORM_SCHEMAS` and writes through the node
 * form model. We still register a (null-rendering) form so the node engine
 * initializes a form model per node — that model is what the panel reads and
 * writes via `getValueIn` / `setValueIn`.
 */
const panelForm = { render: () => <></> };

export const StartNodeRegistry: WorkflowNodeRegistry = {
  type: 'start',
  meta: {
    isStart: true,
    defaultPorts: [{ type: 'output' }],
  },
  formMeta: {
    render: () => <></>,
    defaultValues: {
      inputParams: [{ name: 'input', label: '输入', type: 'text' }],
    },
  },
};

export const EndNodeRegistry: WorkflowNodeRegistry = {
  type: 'end',
  meta: {
    defaultPorts: [{ type: 'input' }],
  },
  formMeta: {
    render: () => <></>,
    defaultValues: {
      outputParams: [{ name: 'result', label: '结果', expr: '' }],
    },
  },
};

export const LlmNodeRegistry: WorkflowNodeRegistry = {
  type: 'llm',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const CodeNodeRegistry: WorkflowNodeRegistry = {
  type: 'code',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const ConditionNodeRegistry: WorkflowNodeRegistry = {
  type: 'condition',
  meta: {
    defaultPorts: [
      { type: 'input' },
      { type: 'output', portID: 'if_true' },
      { type: 'output', portID: 'if_false' },
    ],
  },
  formMeta: panelForm,
};

export const HttpNodeRegistry: WorkflowNodeRegistry = {
  type: 'http',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const TemplateNodeRegistry: WorkflowNodeRegistry = {
  type: 'template',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const VariableNodeRegistry: WorkflowNodeRegistry = {
  type: 'variable',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const DelayNodeRegistry: WorkflowNodeRegistry = {
  type: 'delay',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const SwitchNodeRegistry: WorkflowNodeRegistry = {
  type: 'switch',
  meta: {
    defaultPorts: [
      { type: 'input' },
      { type: 'output', portID: 'case_1' },
      { type: 'output', portID: 'case_2' },
      { type: 'output', portID: 'default' },
    ],
  },
  formMeta: panelForm,
};

export const SubflowNodeRegistry: WorkflowNodeRegistry = {
  type: 'subflow',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const LoopNodeRegistry: WorkflowNodeRegistry = {
  type: 'loop',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const JsonNodeRegistry: WorkflowNodeRegistry = {
  type: 'json',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const ClassifyNodeRegistry: WorkflowNodeRegistry = {
  type: 'classify',
  meta: {
    defaultPorts: [
      { type: 'input' },
      { type: 'output', portID: 'cat_0' },
      { type: 'output', portID: 'cat_1' },
      { type: 'output', portID: 'cat_2' },
      { type: 'output', portID: 'otherwise' },
    ],
  },
  formMeta: panelForm,
};

export const TextNodeRegistry: WorkflowNodeRegistry = {
  type: 'text',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const AggregateNodeRegistry: WorkflowNodeRegistry = {
  type: 'aggregate',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const SendMessageNodeRegistry: WorkflowNodeRegistry = {
  type: 'send_message',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const NotifyNodeRegistry: WorkflowNodeRegistry = {
  type: 'notify',
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta: panelForm,
};

export const BatchNodeRegistry: WorkflowNodeRegistry = {
  type: 'batch',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const AssignNodeRegistry: WorkflowNodeRegistry = {
  type: 'assign',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const JsonStringifyNodeRegistry: WorkflowNodeRegistry = {
  type: 'json_stringify',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const JsonParseNodeRegistry: WorkflowNodeRegistry = {
  type: 'json_parse',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const TextProcessNodeRegistry: WorkflowNodeRegistry = {
  type: 'text_process',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const QuestionNodeRegistry: WorkflowNodeRegistry = {
  type: 'question',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const KnowledgeRetrieveNodeRegistry: WorkflowNodeRegistry = {
  type: 'knowledge_retrieve',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const KnowledgeWriteNodeRegistry: WorkflowNodeRegistry = {
  type: 'knowledge_write',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const SqlCustomNodeRegistry: WorkflowNodeRegistry = {
  type: 'sql_custom',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const DataCreateNodeRegistry: WorkflowNodeRegistry = {
  type: 'data_create',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const DataQueryNodeRegistry: WorkflowNodeRegistry = {
  type: 'data_query',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const DataUpdateNodeRegistry: WorkflowNodeRegistry = {
  type: 'data_update',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const DataDeleteNodeRegistry: WorkflowNodeRegistry = {
  type: 'data_delete',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const KnowledgeAnswerNodeRegistry: WorkflowNodeRegistry = {
  type: 'knowledge_answer',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const BreakNodeRegistry: WorkflowNodeRegistry = {
  type: 'break',
  meta: { defaultPorts: [{ type: 'input' }] },
  formMeta: panelForm,
};

export const DocParseNodeRegistry: WorkflowNodeRegistry = {
  type: 'doc_parse',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const ImageQaNodeRegistry: WorkflowNodeRegistry = {
  type: 'image_qa',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const OcrNodeRegistry: WorkflowNodeRegistry = {
  type: 'ocr',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const PythonNodeRegistry: WorkflowNodeRegistry = {
  type: 'python',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const VideoUnderstandNodeRegistry: WorkflowNodeRegistry = {
  type: 'video_understand',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const AudioSummaryNodeRegistry: WorkflowNodeRegistry = {
  type: 'audio_summary',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const ParameterExtractorNodeRegistry: WorkflowNodeRegistry = {
  type: 'parameter_extractor',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const HumanInputNodeRegistry: WorkflowNodeRegistry = {
  type: 'human_input',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

export const MemoryNodeRegistry: WorkflowNodeRegistry = {
  type: 'memory',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: panelForm,
};

/**
 * Multi-branch condition node.
 * Pre-defines 8 named output ports (branch_0..branch_7) plus a default port.
 * FlowGram requires static port definitions, so we allocate the maximum up front.
 */
export const ConditionBranchNodeRegistry: WorkflowNodeRegistry = {
  type: 'condition_branch',
  meta: {
    defaultPorts: [
      { type: 'input' },
      { type: 'output', portID: 'branch_0' },
      { type: 'output', portID: 'branch_1' },
      { type: 'output', portID: 'branch_2' },
      { type: 'output', portID: 'branch_3' },
      { type: 'output', portID: 'branch_4' },
      { type: 'output', portID: 'branch_5' },
      { type: 'output', portID: 'branch_6' },
      { type: 'output', portID: 'branch_7' },
      { type: 'output', portID: 'default' },
    ],
  },
  formMeta: {
    render: () => <></>,
    defaultValues: {
      branches: [{ id: 'b0', name: '判断条件', condition: '' }],
    },
  },
};

/** List-loop node: iterates over an array via a sub-workflow body. */
export const ListLoopNodeRegistry: WorkflowNodeRegistry = {
  type: 'list_loop',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: {
    render: () => <></>,
    defaultValues: {
      items: '',
      workflowId: '',
      concurrency: 1,
    },
  },
};

/** Condition-loop node: while-loop with a stop condition and body sub-workflow. */
export const ConditionLoopNodeRegistry: WorkflowNodeRegistry = {
  type: 'condition_loop',
  meta: { defaultPorts: [{ type: 'input' }, { type: 'output' }] },
  formMeta: {
    render: () => <></>,
    defaultValues: {
      stopCondition: '',
      maxIterations: 10,
      errorHandling: 'terminate_loop',
      workflowId: '',
    },
  },
};

export const nodeRegistries: WorkflowNodeRegistry[] = [
  StartNodeRegistry,
  EndNodeRegistry,
  LlmNodeRegistry,
  CodeNodeRegistry,
  ConditionNodeRegistry,
  HttpNodeRegistry,
  TemplateNodeRegistry,
  VariableNodeRegistry,
  DelayNodeRegistry,
  SwitchNodeRegistry,
  SubflowNodeRegistry,
  LoopNodeRegistry,
  JsonNodeRegistry,
  ClassifyNodeRegistry,
  TextNodeRegistry,
  AggregateNodeRegistry,
  SendMessageNodeRegistry,
  NotifyNodeRegistry,
  BatchNodeRegistry,
  AssignNodeRegistry,
  JsonStringifyNodeRegistry,
  JsonParseNodeRegistry,
  TextProcessNodeRegistry,
  QuestionNodeRegistry,
  KnowledgeRetrieveNodeRegistry,
  KnowledgeWriteNodeRegistry,
  SqlCustomNodeRegistry,
  DataCreateNodeRegistry,
  DataQueryNodeRegistry,
  DataUpdateNodeRegistry,
  DataDeleteNodeRegistry,
  KnowledgeAnswerNodeRegistry,
  BreakNodeRegistry,
  DocParseNodeRegistry,
  ImageQaNodeRegistry,
  OcrNodeRegistry,
  PythonNodeRegistry,
  VideoUnderstandNodeRegistry,
  AudioSummaryNodeRegistry,
  ParameterExtractorNodeRegistry,
  HumanInputNodeRegistry,
  MemoryNodeRegistry,
  ConditionBranchNodeRegistry,
  ListLoopNodeRegistry,
  ConditionLoopNodeRegistry,
];

export interface NodeCategory {
  key: string;
  /** i18n key for the category label. */
  labelKey: string;
  types: string[];
}

/** Grouped node categories shown in the add-node panel. */
export const NODE_CATEGORIES: NodeCategory[] = [
  {
    key: 'basic',
    labelKey: 'nodeCategory.basic',
    types: ['start', 'end', 'question', 'human_input'],
  },
  {
    key: 'ai',
    labelKey: 'nodeCategory.ai',
    types: ['llm', 'classify', 'text', 'parameter_extractor', 'image_qa', 'ocr', 'video_understand', 'audio_summary'],
  },
  {
    key: 'logic',
    labelKey: 'nodeCategory.logic',
    types: ['condition', 'condition_branch', 'switch', 'loop', 'list_loop', 'condition_loop', 'break'],
  },
  {
    key: 'data',
    labelKey: 'nodeCategory.data',
    types: ['variable', 'assign', 'json', 'json_stringify', 'json_parse', 'template', 'aggregate', 'text_process', 'doc_parse', 'memory'],
  },
  {
    key: 'tools',
    labelKey: 'nodeCategory.tools',
    types: ['send_message', 'code', 'python', 'http', 'delay', 'notify', 'subflow', 'batch'],
  },
  {
    key: 'knowledge',
    labelKey: 'nodeCategory.knowledge',
    types: ['knowledge_answer', 'knowledge_retrieve', 'knowledge_write'],
  },
  {
    key: 'database',
    labelKey: 'nodeCategory.database',
    types: ['sql_custom', 'data_create', 'data_query', 'data_update', 'data_delete'],
  },
];

/** Flat list derived from categories (used by drag service and other utilities). */
export const CREATABLE_NODE_TYPES = NODE_CATEGORIES.flatMap((c) => c.types);
