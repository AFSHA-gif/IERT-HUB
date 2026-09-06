import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  FolderArchive, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Layers, 
  FileCode,
  Download,
  Eye,
  TrendingUp,
  Clock,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import ResourceCard from '../components/ResourceCard';
import SubjectCard from '../components/SubjectCard';
import { getStoredResources } from '../services/resourceService';
import { getStoredSubjects } from '../services/subjectService';

export default function Home({ onOpenPDF, onDownloadSuccess }) {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const load = () => {
      setResources(getStoredResources());
      setSubjects(getStoredSubjects());
    };
    load();

    window.addEventListener('iert_resources_updated', load);
    window.addEventListener('iert_subjects_updated', load);
    return () => {
      window.removeEventListener('iert_resources_updated', load);
      window.removeEventListener('iert_subjects_updated', load);
    };
  }, []);

  // Stats calculation
  const notesCount = resources.filter(r => r.type === 'Notes').length;
  const pyqCount = resources.filter(r => r.type === 'Previous Year Paper').length;
  const studyCount = resources.filter(r => r.type === 'Study Material' || r.type === 'Important Questions').length;
  const subjectsCount = subjects.length;

  // Sections
  const recentlyAdded = [...resources]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const popularResources = [...resources]
    .sort((a, b) => (b.downloads || 0) + (b.views || 0) - ((a.downloads || 0) + (a.views || 0)))
    .slice(0, 6);

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section with explicit padding & layout bounds preventing navbar clipping */}
      <section className="relative pt-12 sm:pt-20 pb-12 text-center max-w-5xl mx-auto px-4">
        
        {/* Top Badges: Sem 3 + FREE NO PAYWALL */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span>B.Tech Cyber Security • Semester 3</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% FREE • NO PAYWALL</span>
          </div>
        </div>

        {/* Hero Heading - Fully visible on initial load */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
          Everything You Need to Study. <br className="hidden sm:inline" />
          <span className="cyber-gradient-text">One Secure Hub.</span>
        </h1>

        {/* Subheading */}
        <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Notes, previous year papers, study material, practicals and exam resources — completely free for Cyber Security Semester 3 students.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/notes"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            <span>Explore Resources</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/previous-papers"
            className="px-6 py-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-800 flex items-center gap-2 transition-all shadow-sm"
          >
            <FolderArchive className="w-4 h-4 text-purple-500" />
            <span>Previous Year Papers</span>
          </Link>
        </div>

        {/* Quick Access Cards */}
        <div className="pt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-left">
          {[
            { label: 'Unit Notes', path: '/notes', icon: FileText, desc: 'Unit-by-unit lecture notes', cta: 'View Notes', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30' },
            { label: 'PYQs', path: '/previous-papers', icon: FolderArchive, desc: 'Semester exam papers', cta: 'View Papers', color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
            { label: 'Study Material', path: '/study-material', icon: Layers, desc: 'Reference cheat sheets', cta: 'Explore', color: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30' },
            { label: 'Assignments', path: '/assignments', icon: FileCode, desc: 'Problem sets & exercises', cta: 'View Tasks', color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30' },
            { label: 'Practicals', path: '/practicals', icon: GraduationCap, desc: 'Lab manuals & code', cta: 'View Manuals', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
            { label: 'Syllabus', path: '/syllabus', icon: BookOpen, desc: 'Academic curriculum', cta: 'View Guide', color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30' }
          ].map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={cat.path}
                className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200"
              >
                <div>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} border flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                  <span>{cat.cta}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Statistics Counter */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 mx-auto flex items-center justify-center mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">{notesCount}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unit Notes</span>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 mx-auto flex items-center justify-center mb-2">
              <FolderArchive className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">{pyqCount}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Question Papers</span>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">{studyCount}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Study Materials</span>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">{subjectsCount}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Semester Subjects</span>
          </div>
        </div>
      </section>

      {/* Subjects Grid Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-500" />
              <span>Semester 3 Subjects</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse academic resources categorized by subject curriculum
            </p>
          </div>

          <Link
            to="/notes"
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
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

      {/* Popular Resources Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
              <span>Popular Academic Material</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Most viewed and downloaded PDFs by Semester 3 students
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularResources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onView={onOpenPDF}
              onDownloadSuccess={onDownloadSuccess}
            />
          ))}
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-500" />
              <span>Recently Uploaded</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Fresh lecture notes and newly published study materials
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentlyAdded.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onView={onOpenPDF}
              onDownloadSuccess={onDownloadSuccess}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
