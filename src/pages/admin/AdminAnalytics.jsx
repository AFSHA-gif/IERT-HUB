import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  FileText, 
  Download, 
  Eye, 
  ShieldCheck, 
  BookOpen,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { getAdminAnalytics } from '../../services/resourceService';
import { getStudentAnalytics, fetchStudentsFromDB } from '../../services/studentAuthService';
import { getRecentAdminLogs } from '../../services/adminLogService';

export default function AdminAnalytics() {
  const [resAnalytics, setResAnalytics] = useState(null);
  const [studAnalytics, setStudAnalytics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  const loadData = async () => {
    setResAnalytics(getAdminAnalytics());
    await fetchStudentsFromDB();
    setStudAnalytics(getStudentAnalytics());
    setRecentLogs(getRecentAdminLogs(8));
  };

  useEffect(() => {
    loadData();

    window.addEventListener('iert_resources_updated', loadData);
    window.addEventListener('iert_student_registry_updated', loadData);
    window.addEventListener('iert_admin_log_updated', loadData);

    return () => {
      window.removeEventListener('iert_resources_updated', loadData);
      window.removeEventListener('iert_student_registry_updated', loadData);
      window.removeEventListener('iert_admin_log_updated', loadData);
    };
  }, []);

  if (!resAnalytics || !studAnalytics) return null;

  const {
    totalResources,
    activeResources,
    totalViews,
    totalDownloads,
    byCategory,
    bySubject,
    mostDownloaded,
    recentUploads
  } = resAnalytics;

  const {
    totalStudents,
    activeStudents,
    inactiveStudents,
    newToday
  } = studAnalytics;

  const categoryItems = [
    { label: 'Notes', count: byCategory.Notes || 0, color: 'bg-blue-500', textColor: 'text-blue-400' },
    { label: 'Previous Year Papers', count: byCategory['Previous Year Paper'] || 0, color: 'bg-purple-500', textColor: 'text-purple-400' },
    { label: 'Study Material', count: byCategory['Study Material'] || 0, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
    { label: 'Assignments', count: byCategory.Assignment || 0, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { label: 'Practicals', count: byCategory.Practical || 0, color: 'bg-amber-500', textColor: 'text-amber-400' },
    { label: 'Syllabus', count: byCategory.Syllabus || 0, color: 'bg-rose-500', textColor: 'text-rose-400' },
  ];

  const subjectItems = [
    { code: 'CS301', name: 'Data Structures & Algorithms', count: bySubject.CS301 || 0, color: 'from-cyan-500 to-blue-600' },
    { code: 'CS302', name: 'Computer Org. & Architecture', count: bySubject.CS302 || 0, color: 'from-blue-500 to-indigo-600' },
    { code: 'CS303', name: 'Operating Systems', count: bySubject.CS303 || 0, color: 'from-purple-500 to-pink-600' },
    { code: 'CY301', name: 'Cyber Security Fundamentals', count: bySubject.CY301 || 0, color: 'from-emerald-500 to-teal-600' },
    { code: 'MA301', name: 'Discrete Maths & Graph Theory', count: bySubject.MA301 || 0, color: 'from-amber-500 to-orange-600' },
    { code: 'HU301', name: 'Technical Comm & Ethics', count: bySubject.HU301 || 0, color: 'from-rose-500 to-red-600' },
  ];

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-4 h-4 text-cyan-500" />
            <span>Platform Analytics & Telemetry</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            IERT HUB Analytics
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real calculated metrics for student enrollment, content distribution, views, and administrative activity.
          </p>
        </div>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>TOTAL STUDENTS</span>
            <Users className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{totalStudents}</span>
          <p className="text-[10px] text-emerald-500 font-semibold">{activeStudents} Active • {inactiveStudents} Inactive</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>TOTAL RESOURCES</span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{totalResources}</span>
          <p className="text-[10px] text-purple-400 font-semibold">{activeResources} Active PDFs Available</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>TOTAL DOWNLOADS</span>
            <Download className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">{totalDownloads}</span>
          <p className="text-[10px] text-slate-400">Verified signed URL downloads</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>TOTAL VIEWS</span>
            <Eye className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400 block">{totalViews}</span>
          <p className="text-[10px] text-slate-400">Secure in-app preview opens</p>
        </div>

      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown (Bar Progress) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-500" />
              <span>Resource Distribution by Category</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{totalResources} Total</span>
          </div>

          <div className="space-y-4">
            {categoryItems.map((cat, idx) => {
              const pct = totalResources > 0 ? Math.round((cat.count / totalResources) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{cat.label}</span>
                    <span className="text-slate-400">{cat.count} files ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full ${cat.color} transition-all duration-500`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span>Semester 3 Subject Material Coverage</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">6 Subjects</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjectItems.map((sub) => (
              <div key={sub.code} className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">{sub.code}</span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">{sub.count} materials</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{sub.name}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Admin Action Audit Trail */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            <span>Recent Administrative Activity Audit Log</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Real-time Stream</span>
        </div>

        {recentLogs.length > 0 ? (
          <div className="space-y-2.5">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{log.action}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{log.target}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-semibold text-slate-400 block">{formatDate(log.timestamp)}</span>
                  <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-wider">{log.admin}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">No admin activity recorded yet.</p>
        )}
      </div>

    </div>
  );
}
