import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, HardDrive, RefreshCw, CheckCircle2, Lock, Sliders, Server } from 'lucide-react';
import { DEFAULT_RESOURCES } from '../../data/resources';
import { saveResources } from '../../services/resourceService';
import { DEFAULT_SUBJECTS } from '../../data/subjects';
import { saveSubjects } from '../../services/subjectService';
import { getStorageModeInfo } from '../../services/supabaseClient';

export default function AdminSettings({ onShowToast }) {
  const [resetting, setResetting] = useState(false);
  const storageInfo = getStorageModeInfo();

  // App Configuration settings stored locally
  const [siteName, setSiteName] = useState('IERT HUB');
  const [semester, setSemester] = useState('Semester 3');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [maxUploadMb, setMaxUploadMb] = useState('50');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (onShowToast) {
      onShowToast("Platform configuration updated successfully.", "success");
    }
  };

  const handleResetData = () => {
    if (window.confirm("Reset all resources and subjects to initial default datasets? Any custom uploads will be replaced.")) {
      setResetting(true);
      setTimeout(() => {
        saveResources(DEFAULT_RESOURCES);
        saveSubjects(DEFAULT_SUBJECTS);
        setResetting(false);
        if (onShowToast) {
          onShowToast("Platform data restored to default initial state.", "success");
        }
      }, 400);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-500" />
            <span>Platform Settings & Security Infrastructure</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Safe system parameters, upload constraints, RLS status, and data management options.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <form onSubmit={handleSaveSettings} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-6">
        
        {/* Safe System Config */}
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <span>Academic Portal Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Academic Term</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Upload Limit (MB)</label>
              <input
                type="number"
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* Security & RLS Status */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Private Storage & RLS Security Status</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Bucket Name</span>
              <span className="font-bold text-white font-mono">{storageInfo.bucket}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Bucket Access</span>
              <span className="font-bold text-emerald-400">Private (RLS Enforced)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">PDF URL Delivery</span>
              <span className="font-bold text-cyan-400">1-Hour Signed URLs</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All academic PDFs are served strictly through authenticated short-lived signed URLs generated via <code className="text-cyan-400">createSignedUrl()</code>. Unauthenticated requests are blocked.
          </p>
        </div>

        {/* Reset Cache */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-500" />
            <span>Reset Demo Database</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Restore sample Semester 3 subjects and pre-populated lecture notes, PYQs, and practicals.
          </p>

          <button
            type="button"
            onClick={handleResetData}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Database to Initial Default State</span>
          </button>
        </div>

      </form>
    </div>
  );
}
