import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Braces, ChevronDown, ChevronRight } from 'lucide-react';
import { useEditorContext } from './EditorContext';
import type { InputParam, OutputParam, WorkflowDefinition } from '../types';

type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

interface FieldMeta {
  name: string;
  type: FieldType;
}

/**
 * Known output fields per node type with their value types.
 */
const NODE_OUTPUT_FIELDS: Record<string, FieldMeta[]> = {
  llm: [{ name: 'text', type: 'string' }, { name: 'usage', type: 'object' }],
  code: [{ name: 'value', type: 'object' }, { name: 'stdout', type: 'string' }],
  http: [{ name: 'body', type: 'object' }, { name: 'status', type: 'number' }, { name: 'headers', type: 'object' }],
  template: [{ name: 'text', type: 'string' }],
  variable: [],
  json: [{ name: 'data', type: 'object' }, { name: 'valid', type: 'boolean' }],
  classify: [{ name: 'category', type: 'string' }],
  text: [{ name: 'text', type: 'string' }],
  aggregate: [{ name: 'result', type: 'object' }],
  notify: [{ name: 'ok', type: 'boolean' }],
  delay: [],
  loop: [{ name: 'results', type: 'array' }, { name: 'count', type: 'number' }, { name: 'succeeded', type: 'number' }, { name: 'failed', type: 'number' }],
  list_loop: [{ name: 'results', type: 'array' }, { name: 'count', type: 'number' }, { name: 'succeeded', type: 'number' }, { name: 'failed', type: 'number' }],
  condition_loop: [{ name: 'results', type: 'array' }, { name: 'totalIterations', type: 'number' }, { name: 'succeeded', type: 'number' }, { name: 'failed', type: 'number' }],
  condition_branch: [{ name: 'branch', type: 'string' }, { name: 'branchIndex', type: 'number' }],
  subflow: [{ name: 'output', type: 'object' }],
  condition: [],
  switch: [],
  batch: [{ name: 'results', type: 'array' }, { name: 'count', type: 'number' }, { name: 'succeeded', type: 'number' }, { name: 'failed', type: 'number' }],
  assign: [],
  json_stringify: [{ name: 'jsonStr', type: 'string' }],
  json_parse: [{ name: 'value', type: 'object' }],
  text_process: [{ name: 'result', type: 'string' }, { name: 'original', type: 'string' }],
  question: [{ name: 'answer', type: 'string' }, { name: 'question', type: 'string' }],
  knowledge_retrieve: [{ name: 'chunks', type: 'array' }, { name: 'total', type: 'number' }],
  knowledge_write: [{ name: 'successCount', type: 'number' }],
  sql_custom: [{ name: 'rows', type: 'array' }, { name: 'affectedRows', type: 'number' }],
  parameter_extractor: [{ name: 'extracted', type: 'object' }],
  human_input: [{ name: 'humanInput', type: 'string' }, { name: 'prompt', type: 'string' }],
  memory: [{ name: 'history', type: 'array' }, { name: 'count', type: 'number' }],
  data_create: [{ name: 'recordId', type: 'string' }],
  data_query: [{ name: 'records', type: 'array' }, { name: 'total', type: 'number' }],
  data_update: [{ name: 'affectedRows', type: 'number' }],
  data_delete: [{ name: 'affectedRows', type: 'number' }],
};

/** Built-in functions grouped by category. */
const FUNCTION_GROUPS: Array<{ title: string; items: Array<{ label: string; insert: string; desc: string }> }> = [
  {
    title: '数学',
    items: [
      { label: 'ABS(x)', insert: 'ABS()', desc: '绝对值' },
      { label: 'CEIL(x)', insert: 'CEIL()', desc: '向上取整' },
      { label: 'FLOOR(x)', insert: 'FLOOR()', desc: '向下取整' },
      { label: 'ROUND(x, n)', insert: 'ROUND(, 2)', desc: '四舍五入' },
      { label: 'MAX(a, b)', insert: 'MAX(, )', desc: '最大值' },
      { label: 'MIN(a, b)', insert: 'MIN(, )', desc: '最小值' },
      { label: 'POW(x, n)', insert: 'POW(, )', desc: '幂运算' },
      { label: 'SQRT(x)', insert: 'SQRT()', desc: '平方根' },
    ],
  },
  {
    title: '字符串',
    items: [
      { label: 'LEN(s)', insert: 'LEN()', desc: '字符串长度' },
      { label: 'UPPER(s)', insert: 'UPPER()', desc: '转大写' },
      { label: 'LOWER(s)', insert: 'LOWER()', desc: '转小写' },
      { label: 'TRIM(s)', insert: 'TRIM()', desc: '去除首尾空白' },
      { label: 'CONTAINS(s, sub)', insert: 'CONTAINS(, )', desc: '是否包含子串' },
      { label: 'STARTS_WITH(s, p)', insert: 'STARTS_WITH(, )', desc: '是否以 p 开头' },
      { label: 'ENDS_WITH(s, p)', insert: 'ENDS_WITH(, )', desc: '是否以 p 结尾' },
      { label: 'REPLACE(s, old, new)', insert: 'REPLACE(, , )', desc: '替换字符串' },
    ],
  },
  {
    title: '日期',
    items: [
      { label: 'NOW()', insert: 'NOW()', desc: '当前时间戳（ms）' },
      { label: 'TODAY()', insert: 'TODAY()', desc: '今日日期字符串' },
      { label: 'FORMAT_DATE(ts, fmt)', insert: 'FORMAT_DATE(, "YYYY-MM-DD")', desc: '格式化日期' },
      { label: 'ADD_DAYS(ts, n)', insert: 'ADD_DAYS(, )', desc: '增加天数' },
      { label: 'DIFF_DAYS(a, b)', insert: 'DIFF_DAYS(, )', desc: '相差天数' },
    ],
  },
];

/** Operators for expression building. */
const OPERATOR_GROUPS: Array<{ title: string; items: Array<{ label: string; insert: string }> }> = [
  {
    title: '比较',
    items: [
      { label: '== 等于', insert: ' == ' },
      { label: '!= 不等于', insert: ' != ' },
      { label: '> 大于', insert: ' > ' },
      { label: '>= 大于等于', insert: ' >= ' },
      { label: '< 小于', insert: ' < ' },
      { label: '<= 小于等于', insert: ' <= ' },
    ],
  },
  {
    title: '逻辑',
    items: [
      { label: '&& 且', insert: ' && ' },
      { label: '|| 或', insert: ' || ' },
      { label: '! 非', insert: '!' },
    ],
  },
  {
    title: '其他',
    items: [
      { label: '? : 三元', insert: ' ? true_val : false_val' },
      { label: '空值检查', insert: ' != null && ' },
    ],
  },
];

function typeBadge(type: FieldType) {
  const classes: Record<FieldType, string> = {
    string: 'bg-green-100 text-green-700',
    number: 'bg-blue-100 text-blue-700',
    boolean: 'bg-purple-100 text-purple-700',
    array: 'bg-orange-100 text-orange-700',
    object: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-medium ${classes[type]}`}>
      {type}
    </span>
  );
}

interface Variable {
  ref: string;
  label: string;
  source: string;
  type?: FieldType;
}

function buildVariables(definition: WorkflowDefinition | null): { groups: { title: string; vars: Variable[] }[] } {
  if (!definition) return { groups: [] };

  const nodes = definition.nodes as any[];
  const groups: { title: string; vars: Variable[] }[] = [];

  const startNode = nodes.find((n: any) => n.type === 'start');
  const inputParams: InputParam[] = Array.isArray(startNode?.data?.inputParams)
    ? startNode.data.inputParams
    : [];

  if (inputParams.length > 0) {
    groups.push({
      title: 'input',
      vars: inputParams.map((p) => ({
        ref: `{{input.${p.name}}}`,
        label: p.label || p.name,
        source: 'input',
        type: (p.type === 'number' ? 'number' : 'string') as FieldType,
      })),
    });
  }

  const workNodes = nodes.filter((n: any) => n.type !== 'start' && n.type !== 'end');
  for (const node of workNodes) {
    const type: string = node.type ?? 'unknown';
    const nodeId: string = node.id ?? node.data?.id ?? type;
    const title: string = node.data?.title || nodeId;
    const knownFields: FieldMeta[] = NODE_OUTPUT_FIELDS[type] ?? [];

    const outputParams: OutputParam[] = Array.isArray(node.data?.outputParams)
      ? node.data.outputParams
      : [];

    const knownNames = new Set(knownFields.map((f) => f.name));
    const extraFields: FieldMeta[] = outputParams
      .filter((p: OutputParam) => !knownNames.has(p.name))
      .map((p: OutputParam) => ({ name: p.name, type: 'string' as FieldType }));

    const allFields = [...knownFields, ...extraFields];

    if (allFields.length > 0) {
      groups.push({
        title: `${title} (${nodeId})`,
        vars: allFields.map((field) => ({
          ref: `{{nodes.${nodeId}.${field.name}}}`,
          label: field.name,
          source: nodeId,
          type: field.type,
        })),
      });
    }
  }

  return { groups };
}

type TabKey = 'node' | 'global' | 'functions' | 'operators';

interface VariablePickerProps {
  onInsert: (ref: string) => void;
}

/**
 * Variable/function/operator picker with tabbed UI.
 * Tabs: 节点变量 / 全局变量 / 函数 / 运算符
 */
export function VariablePicker({ onInsert }: VariablePickerProps) {
  const { t } = useTranslation();
  const { getDefinition } = useEditorContext();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>('node');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const popoverRef = useRef<HTMLDivElement>(null);

  const definition = open ? getDefinition() : null;
  const { groups } = buildVariables(definition);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const toggleGroup = (title: string) =>
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));

  const handleInsert = (ref: string) => {
    onInsert(ref);
    setOpen(false);
  };

  const TABS: Array<{ key: TabKey; label: string }> = [
    { key: 'node', label: '节点变量' },
    { key: 'global', label: '全局变量' },
    { key: 'functions', label: '函数' },
    { key: 'operators', label: '运算符' },
  ];

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        title={t('form.insertVariable')}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-colors ${
          open
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
      >
        <Braces size={11} />
        {t('form.variables')}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-xl">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex-1 px-1 py-1.5 text-[10px] font-medium transition-colors ${
                  tab === t.key
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {/* 节点变量 tab */}
            {tab === 'node' && (
              groups.length === 0 ? (
                <div className="px-3 py-4 text-center text-[11px] text-gray-400">
                  {t('form.noVariables')}
                </div>
              ) : (
                groups.map((group) => {
                  const isCollapsed = collapsed[group.title];
                  return (
                    <div key={group.title}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.title)}
                        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left hover:bg-gray-50"
                      >
                        {isCollapsed ? (
                          <ChevronRight size={11} className="shrink-0 text-gray-400" />
                        ) : (
                          <ChevronDown size={11} className="shrink-0 text-gray-400" />
                        )}
                        <span className="truncate font-mono text-[10px] font-semibold text-gray-500">
                          {group.title}
                        </span>
                      </button>
                      {!isCollapsed &&
                        group.vars.map((v) => (
                          <button
                            key={v.ref}
                            type="button"
                            onClick={() => handleInsert(v.ref)}
                            className="flex w-full items-center gap-2 pl-7 pr-3 py-1 hover:bg-blue-50"
                          >
                            <span className="min-w-0 flex-1 truncate text-left font-mono text-[11px] text-blue-600">
                              {v.ref}
                            </span>
                            {v.type && typeBadge(v.type)}
                          </button>
                        ))}
                    </div>
                  );
                })
              )
            )}

            {/* 全局变量 tab */}
            {tab === 'global' && (
              <div className="px-3 py-4 text-center text-[11px] text-gray-400">
                暂无全局变量
              </div>
            )}

            {/* 函数 tab */}
            {tab === 'functions' &&
              FUNCTION_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 bg-gray-50 sticky top-0">
                    {group.title}
                  </div>
                  {group.items.map((fn) => (
                    <button
                      key={fn.label}
                      type="button"
                      onClick={() => handleInsert(fn.insert)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-blue-50 text-left"
                    >
                      <span className="font-mono text-[11px] text-blue-600 flex-1">{fn.label}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{fn.desc}</span>
                    </button>
                  ))}
                </div>
              ))
            }

            {/* 运算符 tab */}
            {tab === 'operators' &&
              OPERATOR_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 bg-gray-50 sticky top-0">
                    {group.title}
                  </div>
                  {group.items.map((op) => (
                    <button
                      key={op.label}
                      type="button"
                      onClick={() => handleInsert(op.insert)}
                      className="flex w-full items-center px-3 py-1.5 hover:bg-blue-50 text-left"
                    >
                      <span className="font-mono text-[11px] text-blue-600">{op.label}</span>
                    </button>
                  ))}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
