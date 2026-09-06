import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, UserCheck, CheckSquare, Square } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { loginStudent, isStudentAuthenticated } from '../services/studentAuthService';

export default function StudentLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/account';

  React.useEffect(() => {
    if (isStudentAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginStudent(email, password, rememberMe);
      setLoading(false);

      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An unexpected authentication error occurred.');
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center p-4">
      
      {/* Animated GPU Canvas Background */}
      <AnimatedBackground variant="student" />

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-500/20">
            <UserCheck className="w-7 h-7" />
          </div>

          <div className="pt-2">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white block">
              IERT HUB
            </span>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block">
              Student Portal
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Access your Semester 3 academic resources
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Student Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4 text-cyan-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@iert.ac.in"
                className="w-full pl-10 pr-4 py-3 text-base sm:text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-cyan-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 text-base sm:text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setRememberMe(prev => !prev)}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer select-none"
            >
              {rememberMe ? (
                <CheckSquare className="w-4 h-4 text-cyan-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Remember Me</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Password reset link request sent to your email.")}
              className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-600 dark:text-slate-400">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-cyan-600 dark:text-cyan-400 font-extrabold hover:underline">
            Create Account
          </Link>
        </div>

        {/* Subtext */}
        <div className="text-center space-y-0.5 pt-2 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-500">Free Academic Resource Platform</p>
          <p>B.Tech Cyber Security • Semester 3</p>
        </div>

      </div>
    </div>
  );
}
