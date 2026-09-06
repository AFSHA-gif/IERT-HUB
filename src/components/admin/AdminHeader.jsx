import React from 'react';
import { Menu, ShieldCheck, User, Search, Bell, ExternalLink } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { getCurrentAdminUser } from '../../services/authService';
import { Link } from 'react-router-dom';

export default function AdminHeader({ onOpenMobileSidebar, title = "Admin Dashboard" }) {
  const admin = getCurrentAdminUser() || { name: 'System Administrator', email: 'admin@iert.ac.in' };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          type="button"
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Cyber Security Sem 3
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Link
          to="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-500 text-xs font-semibold"
          title="View Student Website"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Student Site</span>
        </Link>

        {/* User Info Capsule */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {admin.name}
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400">
              {admin.email}
            </span>
          </div>
        </div>
      </div>

    </header>
  );
}
