import React from 'react';

export default function SkeletonLoader({ count = 6, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-200/60 dark:bg-slate-800/40 animate-pulse border border-slate-200/40 dark:border-slate-800/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="w-20 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-4 rounded bg-slate-200 dark:bg-slate-800 w-3/4" />
          <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 w-1/2" />
          <div className="pt-4 flex justify-between gap-2">
            <div className="h-9 rounded-xl bg-slate-200 dark:bg-slate-800 w-1/2" />
            <div className="h-9 rounded-xl bg-slate-200 dark:bg-slate-800 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
