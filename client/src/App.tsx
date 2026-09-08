import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './store/auth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DocsPage from './pages/DocsPage';
import FloatingContact from './components/FloatingContact';
import ConsoleLayout from './layouts/ConsoleLayout';
import WorkflowListPage from './pages/WorkflowListPage';
import EditorPage from './pages/EditorPage';
import ModelsPage from './pages/ModelsPage';
import UsersPage from './pages/UsersPage';
import StatsPage from './pages/StatsPage';
import AiBuilderPage from './pages/AiBuilderPage';
import AgentsPage from './pages/AgentsPage';
import AgentChatPage from './pages/AgentChatPage';
import KnowledgePage from './pages/KnowledgePage';
import LogsPage from './pages/LogsPage';

/** Blocks admin-only routes for regular accounts. */
function AdminRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' ? children : <Navigate to="/console" replace />;
}

export default function App() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 bg-gray-50 text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">{t('common.loading')}</span>
      </div>
    );
  }

  // Unauthenticated: the public homepage at "/" and the login screen.
  if (!user) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
        <FloatingContact />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/workflows/:id" element={<EditorPage />} />
        <Route element={<ConsoleLayout />}>
          <Route path="/console" element={<WorkflowListPage />} />
          <Route path="/ai" element={<AiBuilderPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/chat" element={<AgentChatPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route
            path="/models"
            element={
              <AdminRoute>
                <ModelsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/console" replace />} />
      </Routes>
      <FloatingContact />
    </>
  );
}
