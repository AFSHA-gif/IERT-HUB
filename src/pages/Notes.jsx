import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileText, BookOpen, Filter, Search, RotateCcw } from 'lucide-react';
import ResourceCard from '../components/ResourceCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import Breadcrumb from '../components/Breadcrumb';
import { getStoredResources } from '../services/resourceService';
import { getStoredSubjects } from '../services/subjectService';

export default function Notes({ onOpenPDF, onDownloadSuccess }) {
  const { subject: subjectParam, unit: unitParam } = useParams();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjectParam || '');
  const [selectedUnit, setSelectedUnit] = useState(unitParam || '');

  useEffect(() => {
    setResources(getStoredResources().filter(r => r.type === 'Notes'));
    setSubjects(getStoredSubjects());
  }, []);

  useEffect(() => {
    if (subjectParam) setSelectedSubject(subjectParam);
    if (unitParam) setSelectedUnit(unitParam);
  }, [subjectParam, unitParam]);

  const handleSubjectChange = (subId) => {
    setSelectedSubject(subId);
    if (subId) {
      if (selectedUnit) {
        navigate(`/notes/${subId}/${selectedUnit}`);
      } else {
        navigate(`/notes/${subId}`);
      }
    } else {
      navigate('/notes');
    }
  };

  const handleUnitChange = (u) => {
    setSelectedUnit(u);
    if (selectedSubject) {
      if (u) {
        navigate(`/notes/${selectedSubject}/${u}`);
      } else {
        navigate(`/notes/${selectedSubject}`);
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedUnit('');
    navigate('/notes');
  };

  // Filtering
  const filtered = resources.filter(res => {
    if (selectedSubject && res.subjectId?.toLowerCase() !== selectedSubject.toLowerCase()) return false;
    if (selectedUnit && String(res.unit) !== String(selectedUnit)) return false;
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

  const activeSubjectObj = subjects.find(s => s.id === selectedSubject);

  const breadcrumbItems = [
    { label: 'Notes', path: '/notes' },
    ...(selectedSubject ? [{ label: activeSubjectObj ? `${activeSubjectObj.code} (${activeSubjectObj.name})` : selectedSubject, path: `/notes/${selectedSubject}` }] : []),
    ...(selectedUnit ? [{ label: `Unit ${selectedUnit}` }] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Hierarchy: Notes → Subject → Unit → PDF</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {activeSubjectObj ? activeSubjectObj.name : "Academic Unit Notes"}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Comprehensive, syllabus-aligned lecture notes broken down unit-by-unit for Semester 3 subjects.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <SearchBar query={searchQuery} onChange={setSearchQuery} placeholder="Search unit notes by topic, title, or code..." />

        <div className="flex flex-wrap items-center gap-3">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => handleSubjectChange('')}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                !selectedSubject
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All Subjects
            </button>

            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubjectChange(sub.id)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === sub.id
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {sub.code}
              </button>
            ))}
          </div>

          {/* Unit Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {['', '1', '2', '3', '4', '5'].map((u) => (
              <button
                key={u}
                onClick={() => handleUnitChange(u)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedUnit === u
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {u ? `Unit ${u}` : 'All Units'}
              </button>
            ))}
          </div>

          {(selectedSubject || selectedUnit || searchQuery) && (
            <button
              onClick={clearFilters}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onView={onOpenPDF}
              onDownloadSuccess={onDownloadSuccess}
            />
          ))}
        </div>
      ) : (
        <EmptyState onResetFilters={clearFilters} />
      )}

    </div>
  );
}
