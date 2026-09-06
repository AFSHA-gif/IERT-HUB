import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Eye, Download, BookOpen, Layers, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStoredResources } from '../services/resourceService';
import { getSavedResourceIds, toggleSaveResource } from '../services/studentPreferencesService';
import ResourceCard from '../components/ResourceCard';
import EmptyState from '../components/EmptyState';

export default function SavedMaterials({ onOpenPDF, onDownloadSuccess }) {
  const [savedResources, setSavedResources] = useState([]);

  const loadData = () => {
    const all = getStoredResources();
    const savedIds = getSavedResourceIds();
    const matched = all.filter(r => savedIds.includes(String(r.id)));
    setSavedResources(matched);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('iert_preferences_updated', loadData);
    window.addEventListener('iert_resources_updated', loadData);
    return () => {
      window.removeEventListener('iert_preferences_updated', loadData);
      window.removeEventListener('iert_resources_updated', loadData);
    };
  }, []);

  const handleRemoveBookmark = (id) => {
    toggleSaveResource(id);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Bookmark className="w-4 h-4 text-cyan-500" />
            <span>Student Bookmarks</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Saved Materials
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access your bookmarked notes, PYQs, and study materials for Semester 3 offline.
          </p>
        </div>

        <Link
          to="/student/dashboard"
          className="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Saved Materials Grid */}
      {savedResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedResources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onOpenPDF={onOpenPDF}
              onDownloadSuccess={onDownloadSuccess}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 my-8 space-y-4">
          <Bookmark className="w-12 h-12 text-cyan-500/50 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No saved materials yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Click the bookmark icon on any note, PYQ, or study material card to save it here for quick access.
          </p>
          <Link
            to="/notes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Semester 3 Notes</span>
          </Link>
        </div>
      )}

    </div>
  );
}
