import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  GitBranch,
  Cpu,
  Bug,
  Rocket,
  Zap,
  Database,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';

// ── data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '40+', label: '流程节点类型' },
  { value: '4', label: '种调试能力' },
  { value: '2', label: '类触发方式' },
  { value: '一键', label: '生成智能应用' },
];

const FEATURES = [
  {
    icon: GitBranch,
    title: '可视化流程编排',
    desc: '拖拽式画布搭建业务流水线，7 大类 40+ 节点自由组合，支持循环、子工作流、多路分支等复杂逻辑。',
  },
  {
    icon: Cpu,
    title: '多模态 AI 原生节点',
    desc: '内置图片问答、OCR 识别、视频理解、音视频总结、知识库问答等节点，与代码、HTTP 节点无缝组合。',
  },
  {
    icon: Bug,
    title: '流程断点调试',
    desc: '支持断点暂停、分步执行、运行变量查看、模拟数据测试，像调试程序一样调试 AI 流水线。',
  },
  {
    icon: Database,
    title: '知识库与 RAG',
    desc: '内置知识库管理，支持文档上传与语义检索，知识问答节点一键接入，轻松构建企业级 RAG 流程。',
  },
  {
    icon: Zap,
    title: '自动化任务触发',
    desc: 'Webhook 事件触发 + Cron 定时任务两种模式，支持 HMAC 签名校验与限流保障服务安全。',
  },
  {
    icon: Rocket,
    title: '多语言代码执行',
    desc: '内置 JavaScript（vm 沙箱）与 Python 代码节点，自由处理数据、调用库，结果直接流入下游节点。',
  },
];

const STEPS = [
  {
    num: '01',
    title: '可视化编排',
    desc: '拖拽节点、连线构建流水线，大模型、脚本、接口请求、分支判断自由组合。',
  },
  {
    num: '02',
    title: '流程调试',
    desc: '设置断点、分步执行，实时查看变量数据，快速定位复杂业务流程中的问题。',
  },
  {
    num: '03',
    title: '任务触发执行',
    desc: 'Webhook 接收外部事件，Cron 执行定时任务，配套签名校验、限流保障服务安全。',
  },
  {
    num: '04',
    title: '导出智能应用',
    desc: '流水线一键封装成智能应用，支持对话交互，也可对接自有业务系统使用。',
  },
];

// ── sub-components ─────────────────────────────────────────────────────────────

function Navbar() {
  const user = useAuthStore((s) => s.user);
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <Layers size={18} className="text-blue-600" />
          ZCL FLOW
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/docs"
            className="text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            文档
          </Link>
          {user ? (
            <Link
              to="/console"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <LayoutDashboard size={14} />
              进入控制台
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function PipelineDemo() {
  const nodes = [
    { id: 'webhook.trigger', dot: 'bg-green-500', active: false },
    { id: 'llm.process', dot: 'bg-blue-500', active: true },
    { id: 'code.transform', dot: 'bg-purple-500', active: false },
    { id: 'output', dot: 'bg-orange-400', active: false },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-md">
      <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-100 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        <span className="ml-3 font-mono text-xs text-gray-400">zcl-flow / pipeline.editor</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-0 px-6 py-10">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs ${
                node.active
                  ? 'border-blue-400 bg-white text-blue-700 shadow-md shadow-blue-100'
                  : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${node.dot}`} />
              {node.id}
            </div>
            {i < nodes.length - 1 && (
              <div className="flex items-center px-1 text-gray-300">
                <span className="text-xs leading-none">──</span>
                <ChevronRight size={11} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 bg-gray-100 px-4 py-2 text-right font-mono text-[11px] text-gray-400">
        run #1024 · 1/4 nodes · 1.2s
      </div>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm text-gray-600">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
        ✓
      </span>
      {children}
    </li>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            <Zap size={11} />
            AI 原生工作流引擎
          </div>
          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            AI 工作流编排引擎
          </h1>
          <p className="mb-8 text-base leading-relaxed text-gray-500">
            可视化搭建 LLM 业务流程，支持流程断点调试、运行时变量查看，一键将流水线对外封装成智能应用，面向开发者的
            AI 业务自动化搭建平台。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={user ? '/console' : '/login'}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {user ? '进入控制台' : '立即开始'} <ArrowRight size={14} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
            >
              了解特性
            </a>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-2xl">
          <PipelineDemo />
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-6 border-t border-gray-100 pt-10 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="mt-1 text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
              Features
            </div>
            <h2 className="text-3xl font-bold text-gray-900">核心能力</h2>
            <p className="mt-3 text-gray-500">覆盖 AI 业务流程从搭建、调试到线上运行完整生命周期</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-sm"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <f.icon size={20} />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow steps ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
              Workflow
            </div>
            <h2 className="text-3xl font-bold text-gray-900">工作原理</h2>
            <p className="mt-3 text-gray-500">简单四步，快速实现 AI 业务自动化落地</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.num}>
                <div className="mb-3 text-5xl font-black text-gray-100">{step.num}</div>
                <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Debugger ── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Debugger
          </div>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                像调试程序一样调试 AI 流水线
              </h2>
              <p className="mb-6 leading-relaxed text-gray-500">
                完备的流程调试能力：条件断点、分步执行、运行变量观测、模拟数据测试，摆脱大模型流程黑盒问题。
              </p>
              <ul className="space-y-3">
                <CheckItem>条件断点：满足条件自动暂停流程</CheckItem>
                <CheckItem>运行变量观测：查看每个节点入参与输出结果</CheckItem>
                <CheckItem>Mock 模拟数据：不依赖外部接口即可完成流程调试</CheckItem>
              </ul>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-900 p-5 font-mono text-sm shadow-lg">
              <div className="mb-3 text-xs text-gray-500">debug · run #1024 paused</div>
              <div className="mb-4 text-orange-400">llm.process · 断点命中</div>
              <div className="mb-3 text-xs text-gray-400">变量监控</div>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-blue-400">input.event</span>
                  <span className="text-gray-600"> = </span>
                  <span className="text-green-400">"order.created"</span>
                </div>
                <div>
                  <span className="text-blue-400">input.id</span>
                  <span className="text-gray-600"> = </span>
                  <span className="text-yellow-400">42</span>
                </div>
                <div>
                  <span className="text-blue-400">llm.output</span>
                  <span className="text-gray-600"> = </span>
                  <span className="text-gray-500">"…"</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button className="rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-200 transition-colors hover:bg-gray-600">
                  ⏭ 单步
                </button>
                <button className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-500">
                  ▶ 继续
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── API First ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 text-xs font-semibold uppercase tracking-widest text-blue-600">
            API First
          </div>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-last overflow-hidden rounded-xl border border-gray-200 bg-gray-900 p-5 font-mono shadow-lg lg:order-first">
              <div className="space-y-0.5 text-xs leading-6">
                <div className="text-gray-400">$ curl -X POST \</div>
                <div className="ml-4 text-green-400">
                  https://your-host/api/hooks/&lt;token&gt; \
                </div>
                <div className="ml-4 text-gray-400">-H 'Content-Type: application/json' \</div>
                <div className="ml-4 text-gray-400">
                  {`-d '{"event": "order.created", "id": 42}'`}
                </div>
                <div className="mt-3 text-gray-500">
                  {'// workflow triggered · run #1025 queued'}
                </div>
              </div>
            </div>
            <div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900">面向开发者设计</h2>
              <p className="mb-6 leading-relaxed text-gray-500">
                全部能力对外开放 API：Webhook 驱动流水线，流水线配置支持导入导出，方便和现有业务系统集成。
              </p>
              <ul className="space-y-3">
                <CheckItem>REST API + WebSocket 实时推送流水线运行事件</CheckItem>
                <CheckItem>流水线配置 JSON 导入导出，支持版本保存、环境迁移</CheckItem>
                <CheckItem>SQLite 内置存储，无需额外数据库，快速部署启动</CheckItem>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            准备好搭建你的 AI 业务流水线了吗？
          </h2>
          <p className="mb-8 text-blue-100">
            几分钟完成流程搭建到上线，让大模型业务逻辑可观测、可复现。
          </p>
          <Link
            to={user ? '/console' : '/login'}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            {user ? '进入控制台' : '立即开始'} <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Layers size={15} className="text-blue-600" />
              ZCL-FLOW
            </div>
            <div className="mt-1 text-xs text-gray-400">开发者 AI 流水线平台</div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link to="/docs" className="transition-colors hover:text-gray-600">
              文档
            </Link>
            <span>© 2026 ZCL-Flow 保留所有权利。</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
