import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  BookOpen, 
  FolderArchive, 
  FileCode, 
  GraduationCap, 
  Folder, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  X,
  PlusCircle,
  Layers,
  HelpCircle,
  Users,
  BarChart3,
  Activity,
  Clock,
  ExternalLink
} from 'lucide-react';
import { logoutAdmin } from '../../services/authService';

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const navGroups = [
    {
      title: 'Main Navigation',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Students', path: '/admin/students', icon: Users },
        { label: 'Resources', path: '/admin/resources', icon: Folder },
        { label: 'Upload PDF', path: '/admin/upload', icon: Upload, highlight: true },
        { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: Clock },
        { label: 'System Health', path: '/admin/system-health', icon: Activity },
        { label: 'Settings', path: '/admin/settings', icon: Settings }
      ]
    },
    {
      title: 'Category Quick Views',
      items: [
        { label: 'Notes', path: '/admin/resources?type=Notes', icon: FileText },
        { label: 'Previous Papers', path: '/admin/resources?type=Previous Year Paper', icon: FolderArchive },
        { label: 'Study Material', path: '/admin/resources?type=Study Material', icon: Layers },
        { label: 'Assignments', path: '/admin/resources?type=Assignment', icon: FileCode },
        { label: 'Practicals', path: '/admin/resources?type=Practical', icon: GraduationCap },
        { label: 'Syllabus', path: '/admin/resources?type=Syllabus', icon: ShieldCheck }
      ]
    },
    {
      title: 'Quick Access',
      items: [
        { label: 'Student View', path: '/', icon: ExternalLink, isExternal: true }
      ]
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname + location.search === path || (location.pathname === path && !location.search);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Top Brand */}
        <div>
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-950/40">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight">
                  IERT HUB
                </span>
                <span className="block text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                  Admin Control
                </span>
              </div>
            </Link>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links List */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {group.title}
                </h4>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  if (item.isExternal) {
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        target="_blank"
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span>{item.label}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                          : item.highlight
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-700/60"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>

      </aside>
    </>
  );
}
