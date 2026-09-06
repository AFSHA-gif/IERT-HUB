import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Eye, 
  Download, 
  BookOpen, 
  Calendar, 
  HardDrive, 
  Clock, 
  Tag, 
  Sparkles,
  Layers,
  HelpCircle,
  FileCode,
  ShieldAlert,
  Bookmark
} from 'lucide-react';
import { incrementViewCount, incrementDownloadCount } from '../services/resourceService';
import { getPDFUrl } from '../services/storageService';
import { isStudentAuthenticated } from '../services/studentAuthService';
import { isResourceSaved, toggleSaveResource, addRecentlyViewed } from '../services/studentPreferencesService';

export default function ResourceCard({ resource, onView, onDownloadSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (resource?.id) {
      setSaved(isResourceSaved(resource.id));
    }
  }, [resource?.id]);

  if (!resource) return null;

  const {
    id,
    title,
    type,
    subjectName,
    subjectId,
    semester = 3,
    unit,
    year,
    experimentNo,
    fileSize = '1.5 MB',
    createdAt,
    views = 0,
    downloads = 0,
    fileUrl,
    storageKey,
    storagePath,
    tags = []
  } = resource;

  const handleBookmarkToggle = (e) => {
    e.stopPropagation();
    if (!isStudentAuthenticated()) {
      navigate('/student/login', { state: { from: location.pathname } });
      return;
    }
    const newState = toggleSaveResource(id);
    setSaved(newState);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Recently';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const handleView = async (e) => {
    e.stopPropagation();
    if (!isStudentAuthenticated()) {
      navigate('/student/login', { state: { from: location.pathname } });
      return;
    }
    addRecentlyViewed(id);
    incrementViewCount(id);
    const resolvedUrl = await getPDFUrl(storagePath || storageKey, fileUrl);
    if (onView) {
      onView({ ...resource, resolvedUrl });
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!isStudentAuthenticated()) {
      navigate('/student/login', { state: { from: location.pathname } });
      return;
    }
    const resolvedUrl = await getPDFUrl(storagePath || storageKey, fileUrl);
    if (!resolvedUrl) {
      alert("Unable to download this PDF document. Please try again.");
      return;
    }
    addRecentlyViewed(id);
    incrementDownloadCount(id);

    // Create anchor trigger
    const a = document.createElement('a');
    a.href = resolvedUrl;
    a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (onDownloadSuccess) {
      onDownloadSuccess(title);
    }
  };

  // Icon selector based on type
  const getTypeBadgeColor = (resType) => {
    switch (resType) {
      case 'Notes':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'Previous Year Paper':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Practical':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Assignment':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Study Material':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Syllabus':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative group overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl">
      
      {/* Top Bar: Icon + Category Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>

            <button
              onClick={handleBookmarkToggle}
              type="button"
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                saved 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border-slate-200 dark:border-slate-700/60 hover:text-amber-400'
              }`}
              title={saved ? "Remove from Bookmarks" : "Save to Bookmarks"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-amber-400' : ''}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getTypeBadgeColor(type)}`}>
              {type}
            </span>

            {unit && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Unit {unit}
              </span>
            )}

            {year && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                {year}
              </span>
            )}

            {experimentNo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                {experimentNo}
              </span>
            )}
          </div>
        </div>

        {/* Resource Title */}
        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-1.5 group-hover:text-cyan-500 transition-colors leading-snug">
          {title}
        </h3>

        {/* Subject Name & Semester */}
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
          <span className="truncate">{subjectName || subjectId}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="shrink-0">Sem {semester}</span>
        </p>

        {/* Tags if present */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-slate-400" />
            {fileSize}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {formatDate(createdAt)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleView}
            type="button"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View PDF</span>
          </button>

          <button
            onClick={handleDownload}
            type="button"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
