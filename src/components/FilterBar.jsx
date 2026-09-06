import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';

export default function FilterBar({
  subjects = [],
  selectedType,
  onTypeChange,
  selectedSubject,
  onSubjectChange,
  selectedUnit,
  onUnitChange,
  selectedYear,
  onYearChange,
  onClearFilters
}) {
  const resourceTypes = [
    'All Types',
    'Notes',
    'Previous Year Paper',
    'Study Material',
    'Assignment',
    'Practical',
    'Syllabus',
    'Important Questions',
    'Reference Material'
  ];

  const units = ['All Units', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];
  const years = ['All Years', '2025', '2024', '2023', '2022', '2021'];

  const hasActiveFilters = Boolean(selectedType || selectedSubject || selectedUnit || selectedYear);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-cyan-500" />
          <span>Filter Academic Resources</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Resource Type Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Resource Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {resourceTypes.map((type) => (
              <option key={type} value={type === 'All Types' ? '' : type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unit Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Unit
          </label>
          <select
            value={selectedUnit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {units.map((u) => (
              <option key={u} value={u === 'All Units' ? '' : u.replace('Unit ', '')}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Year Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Year (PYQ)
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {years.map((y) => (
              <option key={y} value={y === 'All Years' ? '' : y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
