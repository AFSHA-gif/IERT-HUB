import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Download } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = 'success', duration = 4000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'download':
        return <Download className="w-5 h-5 text-cyan-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 shadow-emerald-500/10';
      case 'error':
        return 'border-rose-500/40 shadow-rose-500/10';
      case 'download':
        return 'border-cyan-500/40 shadow-cyan-500/10';
      default:
        return 'border-blue-500/40 shadow-blue-500/10';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border ${getBorderColor()} text-white shadow-2xl backdrop-blur-xl text-xs font-semibold`}>
        {getIcon()}
        <span className="flex-1 leading-snug">{message}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
