import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Bookmark, 
  LayoutDashboard, 
  User 
} from 'lucide-react';
import { isStudentAuthenticated } from '../services/studentAuthService';

export default function MobileBottomNav({ isPDFOpen }) {
  const location = useLocation();

  // Rule 2: Do NOT show on admin routes, auth screens, or PDF viewer overlays
  const authRoutes = ['/student/login', '/student/register', '/login', '/register'];
  if (
    isPDFOpen ||
    location.pathname.startsWith('/admin') ||
    authRoutes.includes(location.pathname)
  ) {
    return null;
  }

  // Rule 3: Never expose protected student navigation to logged-out users
  const isAuthenticated = isStudentAuthenticated();
  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Notes', path: '/notes', icon: FileText },
    { label: 'Saved', path: '/student/saved', icon: Bookmark },
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Account', path: '/account', icon: User }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/98 border-t border-slate-800/80 px-2 py-1.5 pb-safe">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-w-[56px] min-h-[44px] transition-colors cursor-pointer ${
                active 
                  ? 'text-cyan-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${active ? 'bg-cyan-500/15' : ''}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
