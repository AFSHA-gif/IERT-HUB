import React, { useState, useEffect } from 'react';
import { BookOpen, ShieldCheck, Download, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { getStoredResources } from '../services/resourceService';
import { getStoredSubjects } from '../services/subjectService';

export default function Syllabus({ onOpenPDF, onDownloadSuccess }) {
  const [syllabusResource, setSyllabusResource] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const list = getStoredResources();
    const found = list.find(r => r.type === 'Syllabus') || list[0];
    setSyllabusResource(found);
    setSubjects(getStoredSubjects());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Curriculum & Evaluation Guide</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          B.Tech Cyber Security — Semester 3 Syllabus
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Academic curriculum breakdown, course outcomes, credit distribution, and practical lab requirements.
        </p>

        {syllabusResource && (
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onOpenPDF(syllabusResource)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View Syllabus PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Curriculum Subject Breakdown Cards */}
      <div className="space-y-4">
        <h2 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-500" />
          <span>Course Modules & Subject Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {s.code}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{s.unitsCount} Units</span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {s.name}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {s.description}
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Semester 3 Academic Credit Module</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
