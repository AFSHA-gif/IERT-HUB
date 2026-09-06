import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Folder, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Plus, 
  FileText, 
  X, 
  Check, 
  RotateCcw,
  BookOpen,
  RefreshCw,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Upload,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { 
  getStoredResources, 
  deleteResource, 
  updateResource, 
  replaceResourcePDF,
  toggleResourceStatus
} from '../../services/resourceService';
import { getStoredSubjects } from '../../services/subjectService';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';

export default function AdminResources({ onOpenPDF, onShowToast }) {
  const [searchParams] = useSearchParams();
  const initialTypeFilter = searchParams.get('type') || '';

  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(initialTypeFilter);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal State
  const [editTarget, setEditTarget] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('Notes');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editUnit, setEditUnit] = useState('1');
  const [editYear, setEditYear] = useState('2025');
  const [editStatus, setEditStatus] = useState('Active');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');

  // Replace PDF Modal State
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceProgress, setReplaceProgress] = useState(0);
  const [replaceError, setReplaceError] = useState('');

  const loadData = () => {
    setResources(getStoredResources());
    setSubjects(getStoredSubjects());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('iert_resources_updated', loadData);
    return () => window.removeEventListener('iert_resources_updated', loadData);
  }, []);

  useEffect(() => {
    if (searchParams.get('type')) {
      setSelectedType(searchParams.get('type'));
    }
  }, [searchParams]);

  // Handle Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteResource(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
    loadData();
    if (onShowToast) {
      onShowToast("Resource deleted successfully.", "error");
    }
  };

  // Toggle Status (Active / Inactive)
  const handleToggleStatus = async (res) => {
    const updated = await toggleResourceStatus(res.id);
    loadData();
    if (onShowToast && updated) {
      onShowToast(`Status for "${res.title}" updated to ${updated.status}.`, "success");
    }
  };

  // Open Edit Modal
  const handleEditClick = (res) => {
    setEditTarget(res);
    setEditTitle(res.title || '');
    setEditType(res.type || 'Notes');
    setEditSubjectId(res.subjectId || '');
    setEditUnit(res.unit ? String(res.unit) : '1');
    setEditYear(res.year ? String(res.year) : '2025');
    setEditStatus(res.status || 'Active');
    setEditDescription(res.description || '');
    setEditTags(res.tags ? res.tags.join(', ') : '');
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;

    const targetSubObj = subjects.find(s => s.id === editSubjectId);

    const updatedFields = {
      title: editTitle,
      type: editType,
      subjectId: editSubjectId,
      subjectName: targetSubObj ? targetSubObj.name : editSubjectId,
      unit: (editType === 'Notes' || editType === 'Assignment' || editType === 'Important Questions') ? Number(editUnit) : null,
      year: editType === 'Previous Year Paper' ? editYear : null,
      status: editStatus,
      description: editDescription,
      tags: editTags ? editTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : []
    };

    await updateResource(editTarget.id, updatedFields);
    setEditTarget(null);
    loadData();
    if (onShowToast) {
      onShowToast("Resource information updated successfully.", "success");
    }
  };

  // Handle Replace PDF
  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!replaceTarget || !replaceFile) return;

    setIsReplacing(true);
    setReplaceProgress(10);
    setReplaceError('');

    try {
      await replaceResourcePDF(replaceTarget.id, replaceFile, (percent) => {
        setReplaceProgress(percent);
      });

      setIsReplacing(false);
      setReplaceTarget(null);
      setReplaceFile(null);
      loadData();

      if (onShowToast) {
        onShowToast(`PDF file for "${replaceTarget.title}" replaced successfully.`, "success");
      }
    } catch (err) {
      console.error('PDF Replacement error:', err);
      setIsReplacing(false);
      setReplaceProgress(0);
      setReplaceError(err.message || 'Failed to replace PDF file.');
    }
  };

  // Date Formatter
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

  // Filtering & Sorting
  let filtered = resources.filter(res => {
    if (selectedType && res.type?.toLowerCase() !== selectedType.toLowerCase()) return false;
    if (selectedSubject && res.subjectId?.toLowerCase() !== selectedSubject.toLowerCase()) return false;
    if (selectedStatus && (res.status || 'Active') !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        res.title?.toLowerCase().includes(q) ||
        res.subjectName?.toLowerCase().includes(q) ||
        res.subjectId?.toLowerCase().includes(q) ||
        res.type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (sortBy === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'title') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sortBy === 'downloads') {
    filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
  } else if (sortBy === 'views') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Folder className="w-6 h-6 text-cyan-500" />
            <span>Academic Resource Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize, edit metadata, replace PDF documents, and manage status for all Semester 3 academic files.
          </p>
        </div>

        <Link
          to="/admin/upload"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New PDF</span>
        </Link>
      </div>

      {/* Filter & Sort Controls */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Categories ({resources.length})</option>
            {['Notes', 'Previous Year Paper', 'Study Material', 'Assignment', 'Practical', 'Syllabus', 'Important Questions'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="newest">Sort by: Newest Uploaded</option>
            <option value="title">Sort by: Title (A-Z)</option>
            <option value="downloads">Sort by: Most Downloaded</option>
            <option value="views">Sort by: Most Viewed</option>
          </select>

        </div>
      </div>

      {/* Master Resources Table */}
      {filtered.length > 0 ? (
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Title & Description</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Unit / Year</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((res) => {
                  const isActive = res.status !== 'Inactive';
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Category Badge */}
                      <td className="py-3 px-4 shrink-0 whitespace-nowrap">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          {res.type}
                        </span>
                      </td>

                      {/* Title & Info */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-bold text-slate-900 dark:text-white line-clamp-1 block">
                          {res.title}
                        </span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">
                          {res.fileName || res.description} ({res.fileSize || 'PDF'})
                        </span>
                      </td>

                      {/* Subject Code */}
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {res.subjectId}
                      </td>

                      {/* Unit / Year */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {res.unit ? `Unit ${res.unit}` : res.year ? res.year : res.experimentNo ? res.experimentNo : '-'}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(res.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(res)}
                          type="button"
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                            isActive 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                          title="Click to toggle status"
                        >
                          {isActive ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View PDF */}
                          <button
                            onClick={() => onOpenPDF(res)}
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-500 text-slate-600 dark:text-slate-300"
                            title="View PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Metadata */}
                          <button
                            onClick={() => handleEditClick(res)}
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/10 hover:text-blue-500 text-slate-600 dark:text-slate-300"
                            title="Edit Resource Information"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Replace PDF */}
                          <button
                            onClick={() => {
                              setReplaceTarget(res);
                              setReplaceFile(null);
                              setReplaceError('');
                            }}
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-500/10 hover:text-purple-500 text-slate-600 dark:text-slate-300"
                            title="Replace PDF File"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(res)}
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-600 dark:text-slate-300"
                            title="Delete Resource"
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
        <EmptyState isAdmin={true} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Academic Resource"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This PDF file will be permanently removed.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      {/* Edit Metadata Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleSaveEdit} className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Edit Resource Metadata</h3>
              <button type="button" onClick={() => setEditTarget(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {['Notes', 'Previous Year Paper', 'Study Material', 'Assignment', 'Practical', 'Syllabus', 'Important Questions'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject *</label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => setEditSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(editType === 'Notes' || editType === 'Assignment' || editType === 'Important Questions') && (
                <div>
                  <label className="block text-xs font-semibold text-cyan-400 mb-1">Unit Number</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-cyan-500/40 text-white"
                  >
                    {['1', '2', '3', '4', '5'].map(u => (
                      <option key={u} value={u}>Unit {u}</option>
                    ))}
                  </select>
                </div>
              )}

              {editType === 'Previous Year Paper' && (
                <div>
                  <label className="block text-xs font-semibold text-purple-400 mb-1">Year</label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-purple-500/40 text-white"
                  >
                    {['2025', '2024', '2023', '2022', '2021'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Resource Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
                >
                  <option value="Active">Active (Visible to Students)</option>
                  <option value="Inactive">Hidden (Draft / Inactive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg"
              >
                Save Metadata
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Replace PDF Modal */}
      {replaceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleReplaceSubmit} className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Replace PDF File</h3>
              <button type="button" onClick={() => setReplaceTarget(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <p className="font-bold text-cyan-400">{replaceTarget.title}</p>
              <p className="text-[10px] text-slate-400">Current file: {replaceTarget.fileName || 'pdf_file'} ({replaceTarget.fileSize})</p>
            </div>

            {replaceError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{replaceError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Replacement PDF *</label>
              <input
                type="file"
                required
                accept="application/pdf"
                onChange={(e) => setReplaceFile(e.target.files ? e.target.files[0] : null)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
              {replaceFile && (
                <p className="text-[11px] font-semibold text-purple-400 mt-1">
                  Selected: {replaceFile.name} ({(replaceFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            {isReplacing && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold">
                  <span>Uploading replacement file...</span>
                  <span>{replaceProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${replaceProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReplaceTarget(null)}
                disabled={isReplacing}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replaceFile || isReplacing}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isReplacing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Replace File</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
