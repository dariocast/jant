import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, Undo2, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
  duration: number;
}

interface ToastOptions {
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const VARIANT_STYLES: Record<ToastVariant, { wrapper: string; icon: React.ReactNode }> = {
  success: {
    wrapper: 'bg-emerald-950 text-emerald-50 border-emerald-800',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />,
  },
  error: {
    wrapper: 'bg-rose-950 text-rose-50 border-rose-800',
    icon: <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" aria-hidden="true" />,
  },
  info: {
    wrapper: 'bg-stone-900 text-stone-50 border-stone-700',
    icon: <Info className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />,
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = nextId.current++;
    // Un'azione di annullamento richiede più tempo di lettura di una semplice conferma.
    const duration = options.duration ?? (options.action ? 7000 : 3500);
    setToasts((prev) => [...prev.slice(-2), { id, message, variant: options.variant ?? 'info', action: options.action, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-3 pb-4 pointer-events-none"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        role="region"
        aria-label="Notifiche"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const style = VARIANT_STYLES[toast.variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto w-full max-w-md flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-modal text-sm font-medium animate-slide-up ${style.wrapper}`}
    >
      {style.icon}
      <span className="flex-1 leading-snug">{toast.message}</span>

      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss(toast.id);
          }}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 font-bold text-xs transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
          {toast.action.label}
        </button>
      )}

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Chiudi notifica"
        className="shrink-0 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};
