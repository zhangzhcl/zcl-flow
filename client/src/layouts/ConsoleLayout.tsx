import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  BookOpen,
  Bot,
  Cpu,
  Database,
  FileText,
  MessageSquare,
  Sparkles,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserMenu from '../components/UserMenu';

export default function ConsoleLayout() {
  const { t } = useTranslation();
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin');

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      isActive
        ? 'bg-blue-50 font-medium text-blue-600'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="border-b border-gray-100 px-4 py-5">
          <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <WorkflowIcon size={18} className="text-blue-600" />
            <span className="text-sm font-bold text-gray-900">{t('app.title')}</span>
          </NavLink>
          <p className="mt-0.5 text-[11px] text-gray-400">{t('app.tagline')}</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          <NavLink to="/console" end className={navCls}>
            <WorkflowIcon size={16} />
            {t('workflows.nav')}
          </NavLink>
          <NavLink to="/ai" className={navCls}>
            <Sparkles size={16} />
            {t('aiBuilder.nav')}
          </NavLink>
          <NavLink to="/agents" className={navCls}>
            <Bot size={16} />
            {t('agents.nav')}
          </NavLink>
          <NavLink to="/chat" className={navCls}>
            <MessageSquare size={16} />
            {t('chat.nav')}
          </NavLink>
          <NavLink to="/knowledge" className={navCls}>
            <Database size={16} />
            {t('knowledge.nav')}
          </NavLink>
          <NavLink to="/logs" className={navCls}>
            <FileText size={16} />
            运行日志
          </NavLink>
          <NavLink to="/stats" className={navCls}>
            <Activity size={16} />
            {t('stats.title')}
          </NavLink>
          {isAdmin && (
            <NavLink to="/models" className={navCls}>
              <Cpu size={16} />
              {t('models.title')}
            </NavLink>
          )}
          <div className="my-1 border-t border-gray-100" />
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <BookOpen size={16} />
            {t('docs.nav')}
          </a>
        </nav>

        {/* Bottom: language + user */}
        <div className="flex items-center gap-2 border-t border-gray-200 p-3">
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </aside>

      {/* Right: page content via Outlet */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
