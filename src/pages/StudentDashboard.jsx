import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  FileText, 
  FolderArchive, 
  BookOpen, 
  GraduationCap, 
  FileCode, 
  Layers, 
  Clock, 
  Bookmark, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Flame,
  CheckCircle2,
  Bell,
  Award,
  Compass
} from 'lucide-react';
import ResourceCard from '../components/ResourceCard';
import SubjectCard from '../components/SubjectCard';
import Breadcrumb from '../components/Breadcrumb';
import { getCurrentStudent } from '../services/studentAuthService';
import { getStoredResources } from '../services/resourceService';
import { getStoredSubjects } from '../services/subjectService';
import { 
  getRecentlyViewedIds, 
  getSavedResourceIds, 
  getStudyStreak, 
  getSubjectViewedCounts,
  getPersonalizedRecommendations 
} from '../services/studentPreferencesService';

export default function StudentDashboard({ onOpenPDF, onDownloadSuccess }) {
  const [currentStudent, setCurrentStudent] = useState(getCurrentStudent());
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [savedResources, setSavedResources] = useState([]);
  const [streakDays, setStreakDays] = useState(1);
  const [subjectProgress, setSubjectProgress] = useState({});
  const [recommendationObj, setRecommendationObj] = useState({ isPersonalized: false, items: [] });

  const loadDashboardData = () => {
    const student = getCurrentStudent();
    setCurrentStudent(student);

    const allRes = getStoredResources();
    setResources(allRes);

    const allSub = getStoredSubjects();
    setSubjects(allSub);

    // Recently viewed list
    const recentIds = getRecentlyViewedIds();
    const recentMatched = recentIds
      .map(id => allRes.find(r => String(r.id) === String(id)))
      .filter(Boolean);
    setRecentlyViewed(recentMatched);

    // Saved/Bookmarked list
    const savedIds = getSavedResourceIds();
    const savedMatched = savedIds
      .map(id => allRes.find(r => String(r.id) === String(id)))
      .filter(Boolean);
    setSavedResources(savedMatched);

    // Streak & Subject Progress
    setStreakDays(getStudyStreak());
    setSubjectProgress(getSubjectViewedCounts(allRes));
    setRecommendationObj(getPersonalizedRecommendations(allRes));
  };

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('iert_student_auth_changed', loadDashboardData);
    window.addEventListener('iert_resources_updated', loadDashboardData);
    window.addEventListener('iert_preferences_updated', loadDashboardData);

    return () => {
      window.removeEventListener('iert_student_auth_changed', loadDashboardData);
      window.removeEventListener('iert_resources_updated', loadDashboardData);
      window.removeEventListener('iert_preferences_updated', loadDashboardData);
    };
  }, []);

  const notesCount = resources.filter(r => r.type === 'Notes').length;
  const pyqCount = resources.filter(r => r.type === 'Previous Year Paper').length;
  const studyCount = resources.filter(r => r.type === 'Study Material' || r.type === 'Important Questions').length;

  const recentUploads = [...resources]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-fade-in pb-16">
      
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ label: 'Student Portal', path: '/student/dashboard' }, { label: 'Academic Dashboard' }]} />

      {/* Welcome Hero Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>Cyber Security Academic Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, <span className="cyber-gradient-text">{currentStudent?.fullName || 'Student'}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            B.Tech Cyber Security • Semester 3 • Access notes, PYQs, and AI study copilot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/student/notifications"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all relative"
            title="View Notifications"
          >
            <Bell className="w-4 h-4 text-cyan-500" />
          </Link>
          <Link
            to="/ai-study-assistant"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Assistant</span>
          </Link>
          <Link
            to="/notes"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <span>Browse Notes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* MY PROGRESS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-500" />
            <span>My Learning Progress</span>
          </h2>
          <Link to="/student/saved" className="text-xs font-bold text-cyan-500 hover:underline flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({savedResources.length})</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Viewed Materials</span>
              <BookOpen className="w-4 h-4 text-cyan-500" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">{recentlyViewed.length}</span>
            <span className="text-[10px] text-cyan-500 font-semibold">Tracked PDF Opens</span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saved Bookmarks</span>
              <Bookmark className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 block">{savedResources.length}</span>
            <span className="text-[10px] text-slate-400">Bookmarked Files</span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Study Streak</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-orange-500 block">{streakDays} Days</span>
            <span className="text-[10px] text-slate-400">Active Academic Session</span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available PDFs</span>
              <Layers className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-purple-400 block">{resources.length}</span>
            <span className="text-[10px] text-slate-400">Total Academic Files</span>
          </div>

        </div>
      </section>

      {/* SUBJECT PROGRESS (REAL TRACKED PROGRESS BARS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-500" />
              <span>Subject Progress Overview</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Real track of resources viewed across Semester 3 courses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const totalForSub = resources.filter(r => r.subjectId === sub.id).length;
            const viewedForSub = subjectProgress[sub.id] || 0;
            const pct = totalForSub > 0 ? Math.min(100, Math.round((viewedForSub / totalForSub) * 100)) : 0;

            return (
              <div key={sub.id} className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {sub.code}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {viewedForSub} of {totalForSub} resources viewed
                  </span>
                </div>

                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{sub.name}</p>

                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECOMMENDED FOR YOU (PERSONALIZED) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Recommended For You</span>
          </h2>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            recommendationObj.isPersonalized 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
          }`}>
            {recommendationObj.isPersonalized ? 'Based on Your Active Subjects' : 'Featured Semester 3 Materials'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendationObj.items.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onOpenPDF={onOpenPDF}
              onDownloadSuccess={onDownloadSuccess}
            />
          ))}
        </div>
      </section>

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Browse Notes', path: '/notes', icon: FileText, color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30' },
          { label: 'PYQ Papers', path: '/previous-papers', icon: FolderArchive, color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
          { label: 'Study Material', path: '/study-material', icon: Layers, color: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30' },
          { label: 'Assignments', path: '/assignments', icon: FileCode, color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30' },
          { label: 'Practicals', path: '/practicals', icon: GraduationCap, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
          { label: 'Syllabus Guide', path: '/syllabus', icon: BookOpen, color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30' }
        ].map((act, i) => {
          const Icon = act.icon;
          return (
            <Link
              key={i}
              to={act.path}
              className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col items-center text-center group hover:-translate-y-1 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.color} border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                {act.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* CONTINUE STUDYING (RECENTLY VIEWED MATERIALS) */}
      {recentlyViewed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              <span>Continue Studying</span>
            </h2>
            <span className="text-xs text-slate-500">Recently viewed PDF resources</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyViewed.slice(0, 3).map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                onOpenPDF={onOpenPDF}
                onDownloadSuccess={onDownloadSuccess}
              />
            ))}
          </div>
        </section>
      )}

      {/* SAVED MATERIALS QUICK LINK */}
      {savedResources.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <span>Saved Bookmarks ({savedResources.length})</span>
            </h2>
            <Link to="/student/saved" className="text-xs font-bold text-cyan-500 hover:underline">
              View All Saved →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResources.slice(0, 3).map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                onOpenPDF={onOpenPDF}
                onDownloadSuccess={onDownloadSuccess}
              />
            ))}
          </div>
        </section>
      )}

      {/* SEMESTER 3 SUBJECTS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <span>Semester 3 Academic Subjects</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore notes, PYQs, and materials by subject</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const count = resources.filter(r => r.subjectId === subject.id).length;
            return (
              <SubjectCard key={subject.id} subject={subject} resourceCount={count} />
            );
          })}
        </div>
      </section>

      {/* LATEST UPLOADS FEED */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Latest Upload Feed</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Freshly uploaded study resources</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentUploads.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onOpenPDF={onOpenPDF}
              onDownloadSuccess={onDownloadSuccess}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
