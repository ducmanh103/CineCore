import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { useUiStore, ToastType } from '../../store/uiStore';

const toastStyles: Record<
  ToastType,
  { icon: React.FC<{ className?: string }>; badgeClass: string; borderClass: string }
> = {
  success: {
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    borderClass: 'border-emerald-400/30',
  },
  error: {
    icon: AlertCircle,
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-400/35',
    borderClass: 'border-rose-400/35',
  },
  warning: {
    icon: AlertTriangle,
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-400/35',
    borderClass: 'border-amber-400/35',
  },
  info: {
    icon: Info,
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/35',
    borderClass: 'border-indigo-400/35',
  },
};

export const ToastAndConfirmHost: React.FC = () => {
  const { toasts, dismissToast, confirmDialog, resolveConfirm } = useUiStore();

  useEffect(() => {
    if (!confirmDialog) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resolveConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog, resolveConfirm]);

  return (
    <>
      {/* Floating Obsidian Glass Toast Stack */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-20 right-4 sm:right-6 z-[100] flex flex-col gap-2.5 w-[calc(100vw-2rem)] sm:w-[390px] pointer-events-none"
      >
        {toasts.map((item) => {
          const style = toastStyles[item.type];
          const Icon = style.icon;
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto animate-scale-in bg-[#13192B]/95 backdrop-blur-2xl rounded-2xl border ${style.borderClass} shadow-float p-3.5 flex items-start gap-3`}
            >
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${style.badgeClass}`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="font-display font-bold text-xs text-slate-50 leading-snug">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                aria-label="Đóng thông báo"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Accessible Confirm Dialog */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => resolveConfirm(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in w-full max-w-md rounded-3xl action-panel p-6 sm:p-7 space-y-5"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-400/35'
                    : confirmDialog.variant === 'warning'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-400/35'
                    : 'bg-indigo-500/15 text-indigo-300 border-indigo-400/35'
                }`}
              >
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h3
                  id="confirm-dialog-title"
                  className="font-display font-extrabold text-base text-slate-50"
                >
                  {confirmDialog.title}
                </h3>
                <p
                  id="confirm-dialog-desc"
                  className="text-xs sm:text-sm text-slate-300 leading-relaxed"
                >
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => resolveConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => resolveConfirm(true)}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm transition-all cursor-pointer ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-luminous'
                    : confirmDialog.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
