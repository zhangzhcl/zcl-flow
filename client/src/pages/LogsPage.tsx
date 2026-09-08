import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, X, CheckCircle2, XCircle, Clock, Loader2, FileText } from 'lucide-react';
import { api } from '../api/client';
import type { Execution, ExecutionDetail, NodeExecution, Workflow } from '../types';

function statusBadge(status: string) {
  const map: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    running: 'bg-blue-100 text-blue-700',
    queued: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  const labelMap: Record<string, string> = {
    success: '对话成功',
    failed: '执行失败',
    running: '执行中',
    queued: '排队中',
    cancelled: '已取消',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {labelMap[status] ?? status}
    </span>
  );
}

function triggerLabel(triggerType: string) {
  const map: Record<string, string> = {
    manual: '手动触发',
    webhook: 'Webhook',
    cron: '定时任务',
  };
  return map[triggerType] ?? triggerType;
}

function nodeStatusIcon(status: string) {
  if (status === 'success') return <CheckCircle2 size={14} className="text-green-500 shrink-0" />;
  if (status === 'failed') return <XCircle size={14} className="text-red-500 shrink-0" />;
  if (status === 'running') return <Loader2 size={14} className="text-blue-500 animate-spin shrink-0" />;
  if (status === 'skipped') return <span className="text-gray-400 text-[10px] shrink-0">跳过</span>;
  return <Clock size={14} className="text-gray-400 shrink-0" />;
}

function shortId(id: string) {
  return id.slice(0, 8) + '...';
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function JsonBlock({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <pre className="whitespace-pre-wrap break-all rounded bg-gray-50 border border-gray-100 p-2 text-[11px] font-mono text-gray-700 max-h-60 overflow-auto">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

interface LogDetailPanelProps {
  executionId: string;
  onClose: () => void;
}

function LogDetailPanel({ executionId, onClose }: LogDetailPanelProps) {
  const [detail, setDetail] = useState<ExecutionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NodeExecution | null>(null);
  const [tab, setTab] = useState<'input' | 'output' | 'log'>('output');

  useEffect(() => {
    setLoading(true);
    api.getExecution(executionId).then((d) => {
      setDetail(d);
      if (d.nodes?.length) setSelectedNode(d.nodes[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [executionId]);

  const nodeTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      start: '开始', end: '结束', llm: '大模型', code: '代码', condition: '条件',
      http: 'HTTP', template: '文本模板', variable: '变量', classify: '意图分类',
      text: '文本加工', loop: '循环', subflow: '子工作流', knowledge_retrieve: '知识检索',
      knowledge_write: '知识写入', sql_custom: 'SQL', data_query: '数据查询',
      data_create: '数据新增', data_update: '数据更新', data_delete: '数据删除',
      python: 'Python', delay: '延时', batch: '批处理', assign: '赋值',
      json: 'JSON提取', json_parse: 'JSON解析', json_stringify: 'JSON序列化',
      text_process: '字符串', aggregate: '聚合', notify: '通知',
      memory: '记忆', parameter_extractor: '参数提取', human_input: '人工输入',
    };
    return map[type] ?? type;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="relative flex bg-white rounded-xl shadow-2xl overflow-hidden"
        style={{ width: 680, height: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-white z-10">
          <div>
            <span className="font-semibold text-gray-900 text-sm">日志详情</span>
            {detail && (
              <span className="ml-2 text-[11px] text-gray-400 font-mono">
                反馈码：{detail.id}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : !detail ? (
          <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">加载失败</div>
        ) : (
          <div className="flex w-full pt-12">
            {/* Left: node list */}
            <div className="w-48 shrink-0 border-r border-gray-100 overflow-y-auto py-2">
              {detail.nodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => { setSelectedNode(node); setTab('output'); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                    selectedNode?.id === node.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {nodeStatusIcon(node.status)}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{nodeTypeLabel(node.nodeType)}</div>
                    <div className="text-gray-400">{formatDuration(node.durationMs)}</div>
                  </div>
                </button>
              ))}
              {detail.nodes.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-gray-400">无节点记录</div>
              )}
            </div>

            {/* Right: node detail */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {selectedNode ? (
                <>
                  <div className="flex gap-0 border-b border-gray-100 px-4 pt-1">
                    {(['output', 'input', 'log'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                          tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {t === 'input' ? '输入' : t === 'output' ? '输出' : '日志'}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {tab === 'input' && <JsonBlock value={selectedNode.input} />}
                    {tab === 'output' && (
                      selectedNode.status === 'failed'
                        ? (
                          <div>
                            <div className="mb-2 text-xs font-medium text-red-600">错误信息</div>
                            <pre className="whitespace-pre-wrap break-all rounded bg-red-50 border border-red-100 p-2 text-[11px] font-mono text-red-700">
                              {selectedNode.error ?? '无错误信息'}
                            </pre>
                          </div>
                        )
                        : <JsonBlock value={selectedNode.output} />
                    )}
                    {tab === 'log' && (
                      <div className="text-xs text-gray-500 space-y-1">
                        <div><span className="text-gray-400">状态：</span>{selectedNode.status}</div>
                        <div><span className="text-gray-400">节点 ID：</span>{selectedNode.nodeId}</div>
                        <div><span className="text-gray-400">类型：</span>{selectedNode.nodeType}</div>
                        <div><span className="text-gray-400">耗时：</span>{formatDuration(selectedNode.durationMs)}</div>
                        <div><span className="text-gray-400">开始时间：</span>{new Date(selectedNode.startedAt).toLocaleString('zh-CN')}</div>
                        {selectedNode.error && (
                          <div><span className="text-gray-400">错误：</span>{selectedNode.error}</div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
                  选择左侧节点查看详情
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom: run info */}
        {detail && (
          <div className="absolute bottom-0 inset-x-0 border-t border-gray-100 bg-gray-50 px-4 py-2 flex items-center gap-4 text-[11px] text-gray-500">
            <span>运行信息</span>
            <span>耗时 {formatDuration(detail.durationMs)}</span>
            <span>触发方式 {triggerLabel(detail.triggerType)}</span>
            {detail.finishedAt && (
              <span>完成于 {new Date(detail.finishedAt).toLocaleString('zh-CN')}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LogsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [execs, wfs] = await Promise.all([
        api.listAllExecutions(),
        api.listWorkflows(),
      ]);
      setExecutions(execs);
      setWorkflows(wfs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const wfMap = Object.fromEntries(workflows.map((w) => [w.id, w.name]));

  const getUserInput = (exec: Execution) => {
    if (!exec.input) return '—';
    const vals = Object.values(exec.input);
    if (vals.length === 0) return '—';
    const v = vals[0];
    if (typeof v === 'string') return v.slice(0, 40) + (v.length > 40 ? '…' : '');
    return JSON.stringify(v).slice(0, 40);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">运行日志</h1>
          <p className="mt-0.5 text-sm text-gray-500">查看所有工作流执行记录</p>
        </div>
        <button
          onClick={load}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          刷新
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <button className="border-b-2 border-blue-500 px-4 py-2 text-sm font-medium text-blue-600">
          对话日志
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500">
              <th className="px-3 py-3 font-medium whitespace-nowrap">ID</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">时间</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">会话 ID</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">用户输入</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">命中工作流</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">执行状态</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">耗时（秒）</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">对话来源</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-gray-400">
                  <Loader2 size={18} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : executions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-gray-400">
                  <FileText size={24} className="mx-auto mb-2 opacity-40" />
                  暂无执行记录
                </td>
              </tr>
            ) : (
              executions.map((exec) => (
                <tr key={exec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                    {shortId(exec.id)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600">
                    {new Date(exec.startedAt).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                    {shortId(exec.id)}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700 max-w-[160px] truncate">
                    {getUserInput(exec)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                      {wfMap[exec.workflowId] ?? exec.workflowId.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {statusBadge(exec.status)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600">
                    {(exec.durationMs / 1000).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                    {triggerLabel(exec.triggerType)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedId(exec.id)}
                      className="rounded px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      查看日志
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <LogDetailPanel executionId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
