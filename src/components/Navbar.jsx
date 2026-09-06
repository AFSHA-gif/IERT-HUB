import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Menu, 
  X, 
  BookOpen, 
  FileText, 
  FolderArchive, 
  FileCode, 
  GraduationCap, 
  UserCheck, 
  Lock,
  Compass,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
  Bell,
  Bookmark
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { isAdminAuthenticated } from '../services/authService';
import { isStudentAuthenticated, getCurrentStudent, logoutStudent } from '../services/studentAuthService';
import { getUnreadCount } from '../services/notificationService';

export default function Navbar({ onOpenSearch }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(isAdminAuthenticated());
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(isStudentAuthenticated());
  const [currentStudent, setCurrentStudent] = useState(getCurrentStudent());
  const [unreadCount, setUnreadCount] = useState(getUnreadCount());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAdminLoggedIn(isAdminAuthenticated());
      setIsStudentLoggedIn(isStudentAuthenticated());
      setCurrentStudent(getCurrentStudent());
      setUnreadCount(getUnreadCount());
    };

    window.addEventListener('iert_auth_changed', handleAuthChange);
    window.addEventListener('iert_student_auth_changed', handleAuthChange);
    window.addEventListener('iert_notifications_updated', handleAuthChange);
    return () => {
      window.removeEventListener('iert_auth_changed', handleAuthChange);
      window.removeEventListener('iert_student_auth_changed', handleAuthChange);
      window.removeEventListener('iert_notifications_updated', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setStudentDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  const navLinks = isStudentLoggedIn
    ? [
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'AI Assistant 🤖', path: '/ai-study-assistant' },
        { label: 'Notes', path: '/notes' },
        { label: 'Previous Papers', path: '/previous-papers' },
        { label: 'Study Material', path: '/study-material' },
        { label: 'Assignments', path: '/assignments' },
        { label: 'Practicals', path: '/practicals' },
        { label: 'Syllabus', path: '/syllabus' },
      ]
    : [
        { label: 'Home', path: '/' },
        { label: 'AI Assistant 🤖', path: '/ai-study-assistant' },
        { label: 'Notes', path: '/notes' },
        { label: 'Previous Papers', path: '/previous-papers' },
        { label: 'Study Material', path: '/study-material' },
        { label: 'Assignments', path: '/assignments' },
        { label: 'Practicals', path: '/practicals' },
        { label: 'Syllabus', path: '/syllabus' },
      ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleStudentLogout = () => {
    logoutStudent();
    setStudentDropdownOpen(false);
    navigate('/student/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Subtitle */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-cyan-400/20 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                  IERT HUB
                </span>
                <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Sem 3
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Cyber Security
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive(link.path)
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Bar (Search, Theme, Student Profile/Login, Admin Shortcut) */}
          <div className="flex items-center gap-2">
            
            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer hover:border-cyan-500/40"
              title="Search Resources"
            >
              <Search className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden sm:inline font-medium">Search...</span>
              <kbd className="hidden md:inline text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Student Notifications Bell Icon */}
            {isStudentLoggedIn && (
              <Link
                to="/student/notifications"
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-cyan-500 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
                title="Academic Notifications"
              >
                <Bell className="w-4 h-4 text-cyan-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* STUDENT AUTHENTICATION BUTTON / PROFILE */}
            {isStudentLoggedIn && currentStudent ? (
              <div className="relative">
                <button
                  onClick={() => setStudentDropdownOpen(prev => !prev)}
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 transition-all text-xs font-bold cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                    {currentStudent.fullName ? currentStudent.fullName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{currentStudent.fullName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {studentDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{currentStudent.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentStudent.email}</p>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setStudentDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-500" />
                      <span>My Account</span>
                    </Link>

                    <button
                      onClick={handleStudentLogout}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout Student</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/student/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </Link>
            )}

            {/* Admin Portal Shortcut (Separate) */}
            {isAdminLoggedIn ? (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
                title="Admin Portal Login"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Admin</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              type="button"
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {isStudentLoggedIn ? (
              <Link
                to="/account"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                <User className="w-4 h-4" />
                <span>My Student Account ({currentStudent?.fullName})</span>
              </Link>
            ) : (
              <Link
                to="/student/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                <UserCheck className="w-4 h-4" />
                <span>Student Login / Register</span>
              </Link>
            )}

            {isAdminLoggedIn ? (
              <Link
                to="/admin"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border border-cyan-500/30 text-cyan-400 rounded-xl"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Admin Login Portal</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
