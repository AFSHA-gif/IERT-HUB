import React from 'react';
import { FolderX, Upload, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ title = "No resources available yet.", subtitle = "Check back soon for new study material.", isAdmin = false, onResetFilters }) {
  return (
    <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl my-8 space-y-4 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 mx-auto flex items-center justify-center">
        {isAdmin ? <Upload className="w-8 h-8" /> : <SearchX className="w-8 h-8" />}
      </div>

      <div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="pt-2 flex flex-wrap justify-center gap-3">
        {isAdmin ? (
          <Link
            to="/admin/upload"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Your First Resource</span>
          </Link>
        ) : onResetFilters ? (
          <button
            onClick={onResetFilters}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700"
          >
            Clear Search & Filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
