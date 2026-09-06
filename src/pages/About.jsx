import React from 'react';
import { ShieldCheck, BookOpen, Lock, Terminal, Layers, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      
      {/* Top Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-cyan-500" />
          <span>IERT HUB Platform Overview</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Dedicated Academic Resource Hub
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          IERT HUB is a specialized academic platform designed to streamline resource distribution for B.Tech Cyber Security — Semester 3 students.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Structured Hierarchy</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Resources organized cleanly by Subject, Unit, Year, and Experiment numbers for instant retrieval.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Secure Admin Portal</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Authorized administrators manage resources, edit entries, delete outdated files, and track downloads.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">100% Free Access</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            No registration paywalls or hidden fees. All academic materials are open to all Semester 3 students.
          </p>
        </div>
      </div>

    </div>
  );
}
