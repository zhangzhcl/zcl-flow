import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Loader2, LogIn, Workflow as WorkflowIcon } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import LanguageSwitcher from '../components/LanguageSwitcher';

/**
 * Username / password sign-in screen.
 * Accounts are provisioned by an administrator, so there is no self sign-up.
 */
export default function LoginPage() {
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || !username.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(String(err?.message ?? err));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between p-4 px-6">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <WorkflowIcon size={16} className="text-blue-600" />
          ZCL FLOW
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xs text-gray-400 transition-colors hover:text-gray-700">
            {t('landing.home')}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-20">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm animate-slide-up rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
        >
          <div className="mb-7 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-blue-50">
              <WorkflowIcon size={22} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-wide text-gray-900">
                {t('app.title')}
              </h1>
              <p className="mt-1 text-xs text-gray-400">{t('app.tagline')}</p>
            </div>
          </div>

          <label className="mb-1.5 block text-xs text-gray-600">{t('auth.username')}</label>
          <input
            autoFocus
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className="mb-4 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="admin"
          />

          <label className="mb-1.5 block text-xs text-gray-600">{t('auth.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="mb-6 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="••••••••"
          />

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !username.trim() || !password}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <LogIn size={15} />
            )}
            {t('auth.signIn')}
          </button>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-gray-400">
            {t('auth.contactAdmin')}
          </p>
        </form>
      </main>
    </div>
  );
}
