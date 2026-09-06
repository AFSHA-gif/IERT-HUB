import React, { useState, useEffect } from 'react';
import { FileCode, RotateCcw } from 'lucide-react';
import ResourceCard from '../components/ResourceCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { getStoredResources } from '../services/resourceService';
import { getStoredSubjects } from '../services/subjectService';

export default function Assignments({ onOpenPDF, onDownloadSuccess }) {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    setResources(getStoredResources().filter(r => r.type === 'Assignment'));
    setSubjects(getStoredSubjects());
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
  };

  const filtered = resources.filter(res => {
    if (selectedSubject && res.subjectId?.toLowerCase() !== selectedSubject.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        res.title?.toLowerCase().includes(q) ||
        res.subjectName?.toLowerCase().includes(q) ||
        (res.tags && res.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <FileCode className="w-4 h-4" />
          <span>Worksheets, Problem Sets & Solutions</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Subject Assignments
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Subject-wise assignment sheets and numerical problem sets for B.Tech Cyber Security Sem 3.
        </p>
      </div>

      <div className="space-y-4">
        <SearchBar query={searchQuery} onChange={setSearchQuery} placeholder="Search assignments..." />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>

          {(selectedSubject || searchQuery) && (
            <button onClick={clearFilters} type="button" className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center gap-1 cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(res => (
            <ResourceCard key={res.id} resource={res} onView={onOpenPDF} onDownloadSuccess={onDownloadSuccess} />
          ))}
        </div>
      ) : (
        <EmptyState onResetFilters={clearFilters} />
      )}
    </div>
  );
}
