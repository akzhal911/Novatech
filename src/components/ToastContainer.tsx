import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 text-xs ${
              isSuccess
                ? 'bg-[#0E1B1E]/95 border-emerald-500/40 text-emerald-200'
                : isError
                ? 'bg-[#1E0E14]/95 border-rose-500/40 text-rose-200'
                : 'bg-[#101420]/95 border-cyan-500/40 text-cyan-200'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
              <span className="truncate font-medium">{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 shrink-0 ml-2"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
