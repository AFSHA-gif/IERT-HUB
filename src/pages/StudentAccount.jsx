import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserCheck, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  FolderArchive, 
  Layers, 
  FileCode, 
  LogOut, 
  Calendar, 
  ShieldCheck,
  ChevronRight,
  Edit,
  Flame,
  Bookmark,
  Clock,
  X,
  Check
} from 'lucide-react';
import { getCurrentStudent, logoutStudent, updateStudentProfile } from '../services/studentAuthService';
import { getSavedResourceIds, getRecentlyViewedIds, getStudyStreak } from '../services/studentPreferencesService';

export default function StudentAccount() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(getCurrentStudent());
  const [savedCount, setSavedCount] = useState(getSavedResourceIds().length);
  const [viewedCount, setViewedCount] = useState(getRecentlyViewedIds().length);
  const [streakDays, setStreakDays] = useState(1);

  // Edit Profile State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  const loadData = () => {
    const st = getCurrentStudent();
    setStudent(st);
    setSavedCount(getSavedResourceIds().length);
    setViewedCount(getRecentlyViewedIds().length);
    setStreakDays(getStudyStreak());
    if (st) setEditFullName(st.fullName || '');
  };

  useEffect(() => {
    loadData();
    window.addEventListener('iert_student_auth_changed', loadData);
    window.addEventListener('iert_preferences_updated', loadData);
    return () => {
      window.removeEventListener('iert_student_auth_changed', loadData);
      window.removeEventListener('iert_preferences_updated', loadData);
    };
  }, []);

  const handleLogout = () => {
    logoutStudent();
    navigate('/login');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editFullName.trim() || !student) return;

    const res = await updateStudentProfile(editFullName);
    if (res.success) {
      setEditSuccessMsg('Profile updated successfully!');
      setTimeout(() => setEditSuccessMsg(''), 3000);
      setShowEditModal(false);
      loadData();
    }
  };

  if (!student) return null;

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Active Student';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Active Student';
    }
  };

  const quickLinks = [
    { label: 'Saved Materials', path: '/student/saved', icon: Bookmark, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { label: 'Notifications', path: '/student/notifications', icon: ShieldCheck, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Unit Notes', path: '/notes', icon: FileText, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { label: 'Previous Papers', path: '/previous-papers', icon: FolderArchive, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { label: 'Study Material', path: '/study-material', icon: Layers, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
    { label: 'Practicals', path: '/practicals', icon: GraduationCap, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-16">
      
      {/* Edit Success Notification */}
      {editSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{editSuccessMsg}</span>
        </div>
      )}

      {/* Top Banner Profile Summary */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-cyan-500/20 shrink-0">
            {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                {student.fullName}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Student
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-cyan-500" />
              <span>{student.email}</span>
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
              <span>{student.branch || 'B.Tech Cyber Security'} • Semester {student.semester || 3}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setEditFullName(student.fullName || '');
              setShowEditModal(true);
            }}
            type="button"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-500 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Edit className="w-4 h-4 text-cyan-500" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={handleLogout}
            type="button"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* Account Info Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Branch</span>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
            {student.branch || 'B.Tech Cyber Security'}
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Study Streak</span>
          <span className="font-extrabold text-sm text-orange-500 flex items-center gap-1 block">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{streakDays} Days</span>
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saved Bookmarks</span>
          <span className="font-extrabold text-sm text-amber-400 block">
            {savedCount} Materials
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resources Viewed</span>
          <span className="font-extrabold text-sm text-cyan-400 block">
            {viewedCount} Files
          </span>
        </div>

      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4 pt-2">
        <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-500" />
          <span>Student Portal Quick Links</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.path}
                className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-[10px] text-slate-400">Explore Semester 3</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleSaveProfile} className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Edit Student Profile</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={student.email}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-800/50 border border-slate-800 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
