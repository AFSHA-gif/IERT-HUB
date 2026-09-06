import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-4 skeleton-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="w-20 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
