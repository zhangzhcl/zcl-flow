import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Check,
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuthStore } from '../store/auth';

/** Password change dialog for the signed-in account. */
function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const refresh = useAuthStore((state) => state.refresh);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.changePassword(currentPassword, newPassword);
      await refresh();
      setDone(true);
      window.setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mb-4 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-gray-400';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm animate-slide-up rounded-xl border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{t('auth.changePassword')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-800"
          >
            <X size={16} />
          </button>
        </div>

        <label className="mb-1.5 block text-xs text-gray-500">{t('auth.currentPassword')}</label>
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className={inputClass}
        />

        <label className="mb-1.5 block text-xs text-gray-500">{t('auth.newPassword')}</label>
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className={inputClass}
        />

        <label className="mb-1.5 block text-xs text-gray-500">{t('auth.confirmPassword')}</label>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mb-5 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-gray-400"
        />

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-800">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !currentPassword || newPassword.length < 6}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : done ? (
            <Check size={14} />
          ) : (
            <KeyRound size={14} />
          )}
          {done ? t('common.saved') : t('common.confirm')}
        </button>
      </form>
    </div>
  );
}

/**
 * Header account control: shows the signed-in identity, admin entries,
 * password change and sign out.
 */
export default function UserMenu() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!user) return null;

  const itemClass =
    'flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900';

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
        >
          {user.role === 'admin' ? <ShieldCheck size={14} /> : <UserRound size={14} />}
          <span className="hidden max-w-[100px] truncate sm:inline">
            {user.displayName || user.username}
          </span>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1.5 w-48 animate-fade-in overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-2xl">
              <div className="border-b border-gray-200 px-3 py-2">
                <div className="truncate text-xs font-semibold text-gray-900">
                  {user.displayName || user.username}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-gray-400">
                  {user.username} · {user.role === 'admin' ? t('users.roleAdmin') : t('users.roleUser')}
                </div>
              </div>

              {user.role === 'admin' && (
                <Link to="/users" onClick={() => setOpen(false)} className={itemClass}>
                  <Users size={13} />
                  {t('users.title')}
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setShowPassword(true);
                }}
                className={itemClass}
              >
                <KeyRound size={13} />
                {t('auth.changePassword')}
              </button>
              <button type="button" onClick={logout} className={itemClass}>
                <LogOut size={13} />
                {t('auth.signOut')}
              </button>
            </div>
          </>
        )}
      </div>

      {showPassword && <ChangePasswordDialog onClose={() => setShowPassword(false)} />}
    </>
  );
}
