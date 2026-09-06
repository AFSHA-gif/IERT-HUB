import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, ShieldCheck, Activity, Trash2, RefreshCw } from 'lucide-react';
import { getAdminLogs, clearAdminLogs } from '../../services/adminLogService';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminAuditLogs({ onShowToast }) {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadData = () => {
    setLogs(getAdminLogs());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('iert_admin_log_updated', loadData);
    return () => window.removeEventListener('iert_admin_log_updated', loadData);
  }, []);

  const handleClearLogs = () => {
    clearAdminLogs();
    setShowClearConfirm(false);
    loadData();
    if (onShowToast) {
      onShowToast("Audit logs cleared successfully.", "error");
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Recently';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  // Filter logs
  const filtered = logs.filter(log => {
    if (categoryFilter && log.category !== categoryFilter) return false;
    if (actionFilter && log.action !== actionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.action?.toLowerCase().includes(q) ||
        log.target?.toLowerCase().includes(q) ||
        log.admin?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            <span>Administrative Audit Stream</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin Audit Logs
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chronological audit trail tracking administrative resource changes, student status toggles, and subjects.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            type="button"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Audit Stream</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action or target..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="Resource">Resource Actions</option>
            <option value="Student">Student Actions</option>
            <option value="Subject">Subject Actions</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Actions</option>
            <option value="PDF Uploaded">PDF Uploaded</option>
            <option value="Resource Metadata Updated">Resource Metadata Updated</option>
            <option value="PDF File Replaced">PDF File Replaced</option>
            <option value="Resource Deleted">Resource Deleted</option>
            <option value="Student Account Activated">Student Account Activated</option>
            <option value="Student Account Deactivated">Student Account Deactivated</option>
            <option value="Student Account Deleted">Student Account Deleted</option>
            <option value="Subject Added">Subject Added</option>
            <option value="Subject Deleted">Subject Deleted</option>
          </select>

        </div>
      </div>

      {/* Logs Table / List */}
      {filtered.length > 0 ? (
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {log.category || 'General'}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      {log.action}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {log.target}
                  </p>
                </div>

                <div className="text-left sm:text-right text-[11px] shrink-0">
                  <span className="text-slate-400 font-semibold block">{formatDate(log.timestamp)}</span>
                  <span className="text-cyan-500 font-bold uppercase tracking-wider text-[10px]">{log.admin}</span>
                </div>

              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 my-8 space-y-3">
          <Clock className="w-8 h-8 text-cyan-500 mx-auto" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">No matching audit logs found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search query.</p>
        </div>
      )}

      {/* Clear Logs Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Admin Audit Stream"
        message="Are you sure you want to clear all recorded administrative audit logs?"
        onConfirm={handleClearLogs}
        onCancel={() => setShowClearConfirm(false)}
      />

    </div>
  );
}
