import React from "react";
import { useUIStore } from "../../stores/uiStore";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 inset-x-4 z-50 flex flex-col items-center gap-2 pointer-events-none max-w-md mx-auto"
      dir="rtl"
    >
      {toasts.map((toast) => {
        const bg = {
          success: "bg-emerald-600 text-white shadow-emerald-700/20",
          error: "bg-rose-600 text-white shadow-rose-700/20",
          info: "bg-slate-800 text-white shadow-slate-900/20",
        }[toast.type];

        const Icon = {
          success: CheckCircle2,
          error: AlertCircle,
          info: Info,
        }[toast.type];

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl transition-all animate-in fade-in slide-in-from-top-3 ${bg}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-bold leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/20 transition flex-shrink-0 text-white"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
