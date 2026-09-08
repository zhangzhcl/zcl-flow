import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import type { ProvisionedUser, User, UserRole } from '../types';
import { useAuthStore } from '../store/auth';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Select from '../components/Select';
import { confirmDialog } from '../components/ConfirmDialog';

/**
 * Administrator console: provision accounts, hand out generated passwords,
 * reset credentials and enable/disable access.
 */
export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [submitting, setSubmitting] = useState(false);
  const [credential, setCredential] = useState<ProvisionedUser | null>(null);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await api.listUsers());
      setError(null);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || !username.trim()) return;
    setSubmitting(true);
    try {
      const result = await api.createUser({
        username: username.trim(),
        displayName: displayName.trim() || undefined,
        role,
      });
      setShowForm(false);
      setUsername('');
      setDisplayName('');
      setRole('user');
      setCredential(result);
      setCopied(false);
      await load();
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await load();
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setBusyId(null);
    }
  };

  const handleReset = (user: User) =>
    runAction(user.id, async () => {
      const result = await api.resetUserPassword(user.id);
      setCredential(result);
      setCopied(false);
    });

  const handleToggle = (user: User) =>
    runAction(user.id, () => api.updateUser(user.id, { enabled: !user.enabled }));

  const handleDelete = async (user: User) => {
    if (!(await confirmDialog(t('users.deleteConfirm')))) return;
    runAction(user.id, () => api.deleteUser(user.id));
  };

  const copyCredential = async () => {
    if (!credential) return;
    const text = `${credential.user.username} / ${credential.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const formatTime = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(i18n.language?.startsWith('zh') ? 'zh-CN' : 'en-US')
      : '-';

  const inputClass =
    'w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400';

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/console"
              title={t('common.back')}
              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
              <UsersIcon size={18} className="text-gray-900" />
            </div>
            <h1 className="text-base font-semibold text-gray-900">{t('users.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">{t('users.create')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <p className="mb-4 text-xs leading-relaxed text-gray-400">{t('users.hint')}</p>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-800">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">{t('common.loading')}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`animate-fade-in rounded-xl border bg-white p-4 transition-colors ${
                  user.enabled ? 'border-gray-200 hover:border-gray-300' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-gray-900">
                        {user.displayName || user.username}
                      </h2>
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-800">
                          <ShieldCheck size={11} />
                          {t('users.roleAdmin')}
                        </span>
                      )}
                      {user.id === currentUser?.id && (
                        <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500">
                          {t('users.you')}
                        </span>
                      )}
                      {!user.enabled && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500">
                          <Ban size={11} />
                          {t('users.disabled')}
                        </span>
                      )}
                      {user.mustChangePassword && (
                        <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500">
                          {t('users.mustChange')}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-gray-400">
                      <span>{user.username}</span>
                      <span>
                        {t('users.lastLogin')}: {formatTime(user.lastLoginAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {busyId === user.id && (
                      <Loader2 size={14} className="mr-1 animate-spin text-gray-500" />
                    )}
                    <button
                      type="button"
                      title={t('users.resetPassword')}
                      onClick={() => handleReset(user)}
                      disabled={busyId === user.id}
                      className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:opacity-40"
                    >
                      <KeyRound size={14} />
                    </button>
                    {user.id !== currentUser?.id && (
                      <>
                        <button
                          type="button"
                          title={user.enabled ? t('users.disable') : t('users.enable')}
                          onClick={() => handleToggle(user)}
                          disabled={busyId === user.id}
                          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:opacity-40"
                        >
                          {user.enabled ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                        </button>
                        <button
                          type="button"
                          title={t('common.delete')}
                          onClick={() => handleDelete(user)}
                          disabled={busyId === user.id}
                          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create account dialog */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setShowForm(false)}
        >
          <form
            onSubmit={handleCreate}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md animate-slide-up rounded-xl border border-gray-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{t('users.create')}</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-800"
              >
                <X size={16} />
              </button>
            </div>

            <label className="mb-1.5 block text-xs text-gray-500">{t('auth.username')}</label>
            <input
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="alice"
              className={`mb-4 ${inputClass}`}
            />

            <label className="mb-1.5 block text-xs text-gray-500">{t('users.displayName')}</label>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={t('users.displayNamePlaceholder')}
              className={`mb-4 ${inputClass}`}
            />

            <label className="mb-1.5 block text-xs text-gray-500">{t('users.role')}</label>
            <Select
              value={role}
              onChange={(value) => setRole(value as UserRole)}
              options={[
                { value: 'user', label: t('users.roleUser') },
                { value: 'admin', label: t('users.roleAdmin') },
              ]}
              className={`mb-2 ${inputClass}`}
            />
            <p className="mb-6 text-[11px] leading-relaxed text-gray-400">
              {t('users.passwordAutoHint')}
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-xs text-gray-700 transition-colors hover:border-gray-300"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting || !username.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {t('common.create')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* One-time credential reveal */}
      {credential && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md animate-slide-up rounded-xl border border-gray-300 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound size={16} className="text-gray-900" />
              <h3 className="text-sm font-semibold text-gray-900">
                {t('users.credentialTitle')}
              </h3>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-gray-500">
              {t('users.credentialHint')}
            </p>
            <div className="mb-5 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400">{t('auth.username')}</span>
                <span className="text-gray-900">{credential.user.username}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400">{t('auth.password')}</span>
                <span className="select-all text-gray-900">{credential.password}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={copyCredential}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-4 py-2 text-xs text-gray-800 transition-colors hover:border-gray-300"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t('users.copied') : t('users.copy')}
              </button>
              <button
                type="button"
                onClick={() => setCredential(null)}
                className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-85"
              >
                {t('users.credentialDone')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
