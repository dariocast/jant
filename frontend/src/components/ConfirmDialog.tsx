import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Conferma per le azioni irreversibili (es. eliminazione definitiva). */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  const containerRef = useDialog(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={containerRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-modal p-5 sm:p-6 flex flex-col gap-4 animate-slide-up"
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-2xl shrink-0 ${
              isDestructive ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
            }`}
          >
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 id="confirm-title" className="font-serif font-bold text-lg text-slate-900 leading-snug">
              {title}
            </h2>
            <p id="confirm-description" className="text-sm text-slate-600 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`px-4 py-2.5 text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 ${
              isDestructive
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-amber-400 text-amber-950 hover:bg-amber-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
