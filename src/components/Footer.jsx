import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowUpRight, BookOpen, Layers, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md text-slate-600 dark:text-slate-400 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                  IERT HUB
                </span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Cyber Security • Sem 3
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              “Your Academic Knowledge, One Hub.” <br />
              Free academic resources for Cyber Security Semester 3 students. Download lecture notes, question papers, lab manuals, and assignments completely free.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                B.Tech Curriculum
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                Verified Resources
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Academic Resources
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/notes" className="hover:text-cyan-500 transition-colors flex items-center gap-1">
                  <span>Unit Lecture Notes</span>
                </Link>
              </li>
              <li>
                <Link to="/previous-papers" className="hover:text-cyan-500 transition-colors flex items-center gap-1">
                  <span>Previous Year Papers</span>
                </Link>
              </li>
              <li>
                <Link to="/study-material" className="hover:text-cyan-500 transition-colors flex items-center gap-1">
                  <span>Study Material & Cheatsheets</span>
                </Link>
              </li>
              <li>
                <Link to="/assignments" className="hover:text-cyan-500 transition-colors flex items-center gap-1">
                  <span>Assignments & Solutions</span>
                </Link>
              </li>
              <li>
                <Link to="/practicals" className="hover:text-cyan-500 transition-colors flex items-center gap-1">
                  <span>Lab Practicals & Writeups</span>
                </Link>
              </li>
              <li>
                <Link to="/syllabus" className="hover:text-cyan-500 transition-colors flex items-center gap-1">
                  <span>Official Syllabus</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Portal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Platform & Access
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-cyan-500 transition-colors">
                  About IERT HUB
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-cyan-500 transition-colors flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
                  <Lock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </Link>
              </li>
              <li>
                <a 
                  href="#top" 
                  onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                  className="hover:text-cyan-500 transition-colors flex items-center gap-1"
                >
                  <span>Back to top</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} IERT HUB — B.Tech Cyber Security Semester 3. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Academic Excellence & Cyber Security Students.
          </p>
        </div>
      </div>
    </footer>
  );
}
