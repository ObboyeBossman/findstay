import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: LucideIcon }
> = {
  success: {
    container:
      'bg-status-success-bg text-status-success-fg border-status-success-border',
    icon: CheckCircle2,
  },
  info: {
    container: 'bg-status-info-bg text-status-info-fg border-status-info-border',
    icon: Info,
  },
  warning: {
    container:
      'bg-status-warning-bg text-status-warning-fg border-status-warning-border',
    icon: AlertTriangle,
  },
  error: {
    container:
      'bg-status-error-bg text-status-error-fg border-status-error-border',
    icon: XCircle,
  },
};

/**
 * Provides app-wide toast notifications positioned top-center on 360px mobile
 * and top-right on tablet/desktop (S1-03-T5).
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), 5000);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-full sm:max-w-sm"
      >
        {toasts.map((toast) => {
          const { container, icon: Icon } = variantStyles[toast.variant];
          const isAlert = toast.variant === 'error' || toast.variant === 'warning';
          return (
            <div
              key={toast.id}
              role={isAlert ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-md ${container}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-caption font-bold">{toast.title}</p>
                {toast.message ? (
                  <p className="mt-0.5 text-caption opacity-90">{toast.message}</p>
                ) : null}
                {toast.actionLabel && toast.onAction ? (
                  <button
                    type="button"
                    onClick={toast.onAction}
                    className="mt-1.5 text-caption font-semibold underline underline-offset-2"
                  >
                    {toast.actionLabel}
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label={`Dismiss ${toast.title}`}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-earth/10"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
