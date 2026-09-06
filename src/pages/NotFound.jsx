import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { isStudentAuthenticated } from '../services/studentAuthService';
import { isAdminAuthenticated } from '../services/authService';

export default function NotFound() {
  const isStudent = isStudentAuthenticated();
  const isAdmin = isAdminAuthenticated();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Cyber Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 bg-slate-900/80 backdrop-blur-2xl text-center space-y-6 shadow-2xl relative z-10">
        
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-cyan-500" />
          <span>IERT HUB • 404 Security Routing</span>
        </div>

        {/* Big Code */}
        <div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 tracking-tighter">
            404
          </h1>
          <h2 className="text-xl font-bold text-white mt-2">
            Page not found.
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The requested academic URL does not exist or has been relocated. Please navigate using official platform controls.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isAdmin ? (
            <Link
              to="/admin"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Control Center</span>
            </Link>
          ) : isStudent ? (
            <Link
              to="/student/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Student Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
          )}

          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Portal Home</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
