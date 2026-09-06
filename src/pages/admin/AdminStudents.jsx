import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  UserX, 
  UserCheck, 
  Trash2, 
  X, 
  Check, 
  ShieldCheck, 
  Mail, 
  GraduationCap, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  getAllStudents, 
  fetchStudentsFromDB, 
  getStudentAnalytics, 
  toggleStudentStatus, 
  deleteStudentAccount 
} from '../../services/studentAuthService';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminStudents({ onShowToast }) {
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState({ totalStudents: 0, activeStudents: 0, inactiveStudents: 0, newToday: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Student for Detail Modal
  const [viewTarget, setViewTarget] = useState(null);

  // Selected Student for Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    const list = await fetchStudentsFromDB();
    setStudents(list || getAllStudents());
    setAnalytics(getStudentAnalytics());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('iert_student_registry_updated', loadData);
    return () => window.removeEventListener('iert_student_registry_updated', loadData);
  }, []);

  // Handle Deactivate / Reactivate Toggle
  const handleToggleStatus = async (student) => {
    const updated = await toggleStudentStatus(student.id);
    loadData();

    if (onShowToast && updated) {
      const msg = updated.status === 'Inactive' 
        ? `Account for ${student.fullName} has been deactivated.`
        : `Account for ${student.fullName} has been reactivated.`;
      onShowToast(msg, updated.status === 'Inactive' ? "error" : "success");
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteStudentAccount(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
    loadData();

    if (onShowToast) {
      onShowToast(`Student account for ${deleteTarget.fullName} deleted permanently.`, "error");
    }
  };

  // Date Formatting Helper
  const formatDate = (isoStr) => {
    if (!isoStr) return 'Recently';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return 'Just now';
    try {
      return new Date(isoStr).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Just now';
    }
  };

  // Search & Status Filter
  const filtered = students.filter(s => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.fullName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-cyan-500" />
            <span>Student Registry & Access Management</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Registered Student Management
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View student accounts, monitor login activity, activate or deactivate access to B.Tech Cyber Security Sem 3 resources.
          </p>
        </div>
      </div>

      {/* Top Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{analytics.totalStudents}</span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Registered</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">{analytics.activeStudents}</span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Accounts</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-3xl font-black text-rose-600 dark:text-rose-400 block">{analytics.inactiveStudents}</span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deactivated</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-center space-y-1">
          <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400 block">{analytics.newToday}</span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered Today</span>
        </div>

      </div>

      {/* Filter Controls */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or email address..."
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="">All Account Statuses</option>
            <option value="Active">Active Accounts Only</option>
            <option value="Inactive">Deactivated Accounts Only</option>
          </select>

        </div>
      </div>

      {/* Student Registry Table */}
      {filtered.length > 0 ? (
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((student) => {
                  const isActiveAccount = student.status !== 'Inactive';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Student Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {student.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Sem {student.semester || 3} • {student.branch || 'B.Tech Cyber Security'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {student.email}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(student.registrationDate)}
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(student.lastLogin)} <span className="text-[10px] text-slate-400">({formatTime(student.lastLogin)})</span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isActiveAccount 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {isActiveAccount ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Detail Modal */}
                          <button
                            onClick={() => setViewTarget(student)}
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-500 text-slate-600 dark:text-slate-300"
                            title="View Student Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Deactivate / Reactivate Toggle */}
                          <button
                            onClick={() => handleToggleStatus(student)}
                            type="button"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActiveAccount
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                            title={isActiveAccount ? "Deactivate Student Access" : "Reactivate Student Access"}
                          >
                            {isActiveAccount ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => setDeleteTarget(student)}
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-600 dark:text-slate-300"
                            title="Delete Student Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 my-8 space-y-3">
          <Users className="w-8 h-8 text-cyan-500 mx-auto" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">No matching student accounts found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or status filter.</p>
        </div>
      )}

      {/* Student Detail Modal */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {viewTarget.fullName ? viewTarget.fullName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{viewTarget.fullName}</h3>
                  <p className="text-[11px] text-slate-400">Student Profile Metadata</p>
                </div>
              </div>

              <button
                onClick={() => setViewTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-500" />
                  <span>Email Address:</span>
                </span>
                <span className="font-semibold text-white">{viewTarget.email}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span>Branch & Term:</span>
                </span>
                <span className="font-semibold text-white">{viewTarget.branch || 'B.Tech Cyber Security'} (Sem {viewTarget.semester || 3})</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>Registered Date:</span>
                </span>
                <span className="font-semibold text-white">{formatDate(viewTarget.registrationDate)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Last Active Login:</span>
                </span>
                <span className="font-semibold text-white">{formatDate(viewTarget.lastLogin)} ({formatTime(viewTarget.lastLogin)})</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-500" />
                  <span>Account Status:</span>
                </span>
                <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] ${
                  viewTarget.status !== 'Inactive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {viewTarget.status !== 'Inactive' ? 'Active' : 'Inactive (Deactivated)'}
                </span>
              </div>

            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewTarget(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Student Account"
        message={`Are you sure you want to permanently delete the account for "${deleteTarget?.fullName}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

    </div>
  );
}
