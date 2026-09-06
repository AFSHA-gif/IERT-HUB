import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  FolderArchive, 
  Layers, 
  FileCode, 
  GraduationCap, 
  Download, 
  Eye, 
  Upload, 
  TrendingUp, 
  Clock, 
  HardDrive, 
  ShieldCheck,
  Plus,
  BookOpen,
  ArrowRight,
  Database,
  Users,
  BarChart3,
  Activity,
  Folder
} from 'lucide-react';
import { getAdminAnalytics, getStoredResources } from '../../services/resourceService';
import { getStudentAnalytics, getAllStudents } from '../../services/studentAuthService';
import { getRecentAdminLogs } from '../../services/adminLogService';
import { getStorageModeInfo } from '../../services/supabaseClient';

export default function AdminDashboard() {
  const [resAnalytics, setResAnalytics] = useState(null);
  const [studAnalytics, setStudAnalytics] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const storageInfo = getStorageModeInfo();

  const loadData = () => {
    setResAnalytics(getAdminAnalytics());
    setStudAnalytics(getStudentAnalytics());
    setStudentsList(getAllStudents().slice(0, 5));
    setRecentLogs(getRecentAdminLogs(5));
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
    mostDownloaded,
    recentUploads
  } = resAnalytics;

  const {
    totalStudents,
    activeStudents,
    inactiveStudents,
    newToday
  } = studAnalytics;

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Recently';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const quickActions = [
    { label: 'Upload Resource', path: '/admin/upload', icon: Plus, color: 'from-cyan-600 to-blue-600 text-white' },
    { label: 'Manage Resources', path: '/admin/resources', icon: Folder, color: 'from-slate-800 to-slate-900 text-cyan-400 border border-slate-700' },
    { label: 'Manage Students', path: '/admin/students', icon: Users, color: 'from-slate-800 to-slate-900 text-purple-400 border border-slate-700' },
    { label: 'Subjects', path: '/admin/subjects', icon: BookOpen, color: 'from-slate-800 to-slate-900 text-blue-400 border border-slate-700' },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, color: 'from-slate-800 to-slate-900 text-emerald-400 border border-slate-700' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: Clock, color: 'from-slate-800 to-slate-900 text-amber-400 border border-slate-700' },
    { label: 'System Health', path: '/admin/system-health', icon: Activity, color: 'from-slate-800 to-slate-900 text-teal-400 border border-slate-700' },
  ];

  return (
    <div className="space-y-8 pb-8">
      
      {/* Top Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            IERT HUB Control Center
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live metrics and content management for B.Tech Cyber Security Semester 3 resources & student enrollment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/admin/students"
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-extrabold text-xs flex items-center gap-2 transition-all hover:scale-105"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Students ({totalStudents})</span>
          </Link>
          <Link
            to="/admin/upload"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New PDF</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Admin Quick Actions:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickActions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <Link
                key={idx}
                to={act.path}
                className={`p-3.5 rounded-2xl bg-gradient-to-br ${act.color} font-bold text-xs flex flex-col items-center justify-center text-center gap-2 shadow-sm transition-all hover:scale-105`}
              >
                <Icon className="w-5 h-5" />
                <span>{act.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        <div className="glass-panel rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-xl font-black text-slate-900 dark:text-white block">{totalStudents}</span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Students</span>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">{activeStudents}</span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Students</span>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-xl font-black text-cyan-600 dark:text-cyan-400 block">{totalResources}</span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Resources</span>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 block">{byCategory.Notes || 0}</span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</span>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-xl font-black text-purple-600 dark:text-purple-400 block">{byCategory['Previous Year Paper'] || 0}</span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">PYQs</span>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-xl font-black text-teal-600 dark:text-teal-400 block">{byCategory['Study Material'] || 0}</span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Study Material</span>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 block">{byCategory.Assignment || 0}</span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assignments</span>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-xl font-black text-rose-600 dark:text-rose-400 block">{byCategory.Practical || 0}</span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Practicals</span>
        </div>

      </div>

      {/* Storage Architecture Info */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Backend Storage Infrastructure:</span>
              <span className={storageInfo.isCloud ? "text-emerald-500 font-extrabold" : "text-cyan-500 font-extrabold"}>
                {storageInfo.provider}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {storageInfo.isCloud
                ? `Active Cloud Storage bucket: ${storageInfo.bucket} (Private signed URLs enforced)`
                : "Uploaded PDFs are locally stored in browser IndexedDB engine. Set environment variables to enable cloud sync."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${storageInfo.isCloud ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'}`}>
            {storageInfo.isCloud ? 'Cloud Storage Online' : 'Local Storage Engine'}
          </span>
        </div>
      </div>

      {/* Three Column Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Recent Student Registrations */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <Users className="w-4 h-4 text-cyan-500" />
              <span>Recent Registrations</span>
            </h3>
            <Link to="/admin/students" className="text-[11px] font-bold text-cyan-500 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {studentsList.map((stud) => (
              <div key={stud.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                <div className="truncate pr-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                    {stud.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                    {stud.email}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                  {formatDate(stud.registrationDate)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Recent Resource Uploads */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <Upload className="w-4 h-4 text-purple-500" />
              <span>Recent Uploads</span>
            </h3>
            <Link to="/admin/resources" className="text-[11px] font-bold text-purple-500 hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentUploads.map((res) => (
              <div key={res.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                <div className="truncate pr-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                    {res.title}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {res.subjectId} • {res.type}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  {res.fileSize}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Recent Admin Actions */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Admin Activity Log</span>
            </h3>
            <Link to="/admin/audit-logs" className="text-[11px] font-bold text-emerald-500 hover:underline">
              Audit Logs
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="text-[9px] text-slate-400">{formatDate(log.timestamp)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{log.target}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No recent activity recorded.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
