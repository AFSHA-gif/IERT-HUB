import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Database, 
  HardDrive, 
  Lock, 
  Users, 
  FileText,
  RefreshCw
} from 'lucide-react';
import { checkSystemHealth } from '../../services/systemHealthService';

export default function AdminSystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const runCheck = async () => {
    setLoading(true);
    const data = await checkSystemHealth();
    setHealth(data);
    setLoading(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  if (loading || !health) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-500 mr-2" />
        <span>Running System Health Telemetry Check...</span>
      </div>
    );
  }

  const getBadge = (status) => {
    if (status === 'Operational') {
      return (
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>✓ Operational</span>
        </span>
      );
    }
    if (status === 'Configuration Required') {
      return (
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>⚠ Configuration Required</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5">
        <XCircle className="w-4 h-4 text-rose-500" />
        <span>✕ Unavailable</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4 text-cyan-500" />
            <span>Infrastructure Diagnostic Status</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            System Health & Security Control
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time configuration telemetry and operational status for database, storage, RLS, and services.
          </p>
        </div>

        <button
          onClick={runCheck}
          type="button"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-run Diagnostics</span>
        </button>
      </div>

      {/* System Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(health).map(([key, item]) => (
          <div
            key={key}
            className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-500" />
                  <span>{item.name}</span>
                </h3>

                {getBadge(item.status)}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono bg-slate-100 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                {item.details}
              </p>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <span>Security Standard: ISO/IEC 27001</span>
              <span>Values Hidden for Security</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
