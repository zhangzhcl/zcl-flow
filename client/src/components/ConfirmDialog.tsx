import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  danger = true,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/10">
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-3">
          <button
            ref={cancelRef}
            type="button"
            className="rounded-md border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            onClick={onCancel}
          >
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-1.5 text-sm font-medium text-white transition ${
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel ?? t('common.confirm')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Imperative helper — returns a promise that resolves to true (confirmed) or
 * false (cancelled). Mounts a temporary React root so callers don't need to
 * manage dialog state themselves.
 */
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

export function confirmDialog(message: string, danger = true): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = (result: boolean) => {
      root.unmount();
      container.remove();
      resolve(result);
    };

    root.render(
      createElement(ConfirmDialog, {
        open: true,
        message,
        danger,
        onConfirm: () => cleanup(true),
        onCancel: () => cleanup(false),
      }),
    );
  });
}
