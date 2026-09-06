import React from 'react';
import { Link } from 'react-router-dom';
import { Database, ShieldAlert, Cpu, HardDrive, Binary, BookOpen, ChevronRight, Layers } from 'lucide-react';

const iconMap = {
  Database,
  ShieldAlert,
  Cpu,
  HardDrive,
  Binary,
  BookOpen
};

export default function SubjectCard({ subject, resourceCount = 0 }) {
  if (!subject) return null;

  const { id, code, name, description, unitsCount = 5, iconName = 'BookOpen', color = 'from-cyan-500 to-blue-600' } = subject;
  const IconComponent = iconMap[iconName] || BookOpen;

  return (
    <Link
      to={`/notes/${id}`}
      className="glass-card rounded-2xl p-6 relative group overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between"
    >
      {/* Decorative top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`} />

      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-md shadow-cyan-500/10 group-hover:scale-110 transition-transform`}>
            <IconComponent className="w-6 h-6" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {code}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors mb-2">
          {name}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-500" />
            {unitsCount} Units
          </span>
          <span>•</span>
          <span>{resourceCount} Resources</span>
        </div>

        <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
          <span>View Materials</span>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </span>
      </div>
    </Link>
  );
}
