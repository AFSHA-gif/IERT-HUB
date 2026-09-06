import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, X, Check, ShieldCheck, Power } from 'lucide-react';
import { getStoredSubjects, addSubject, updateSubject, deleteSubject, toggleSubjectStatus } from '../../services/subjectService';
import { getStoredResources } from '../../services/resourceService';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminSubjects({ onShowToast }) {
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);
  
  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [unitsCount, setUnitsCount] = useState('5');
  const [description, setDescription] = useState('');

  // Edit Modal State
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editUnitsCount, setEditUnitsCount] = useState('5');
  const [editDescription, setEditDescription] = useState('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setSubjects(getStoredSubjects());
    setResources(getStoredResources());
  };

  useEffect(() => {
    load();
    window.addEventListener('iert_subjects_updated', load);
    window.addEventListener('iert_resources_updated', load);
    return () => {
      window.removeEventListener('iert_subjects_updated', load);
      window.removeEventListener('iert_resources_updated', load);
    };
  }, []);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !code) {
      alert('Subject Name and Code are required.');
      return;
    }

    addSubject({
      name,
      code,
      unitsCount: Number(unitsCount),
      description: description || `B.Tech Cyber Security Semester 3 Course: ${name}`
    });

    setShowAddModal(false);
    setName('');
    setCode('');
    setDescription('');
    load();

    if (onShowToast) {
      onShowToast("New subject added successfully.", "success");
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTarget) return;

    updateSubject(editTarget.id, {
      name: editName,
      code: editCode,
      unitsCount: Number(editUnitsCount),
      description: editDescription
    });

    setEditTarget(null);
    load();

    if (onShowToast) {
      onShowToast("Subject updated successfully.", "success");
    }
  };

  const handleToggleStatus = (sub) => {
    const updated = toggleSubjectStatus(sub.id);
    load();
    if (onShowToast && updated) {
      onShowToast(`Status for ${sub.code} updated to ${updated.status}.`, "success");
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteSubject(deleteTarget.id);
    setDeleteTarget(null);
    load();
    if (onShowToast) {
      onShowToast("Subject removed successfully.", "error");
    }
  };

  // Calculate dependent resources for delete warning
  const dependentCount = deleteTarget 
    ? resources.filter(r => r.subjectId?.toLowerCase() === deleteTarget.id?.toLowerCase() || r.subjectId?.toLowerCase() === deleteTarget.code?.toLowerCase()).length
    : 0;

  const deleteMessage = dependentCount > 0
    ? `WARNING: ${dependentCount} academic resources are currently linked to "${deleteTarget?.name}" (${deleteTarget?.code}). Deleting this subject may leave those materials unorganized. Are you sure you want to proceed?`
    : `Are you sure you want to remove subject "${deleteTarget?.name}"?`;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-500" />
            <span>Dynamic Subject Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add, update, toggle status, or remove Semester 3 subjects loaded across student & admin portals.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          type="button"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => {
          const isActive = sub.status !== 'Inactive';
          const subResourcesCount = resources.filter(r => r.subjectId?.toLowerCase() === sub.id?.toLowerCase() || r.subjectId?.toLowerCase() === sub.code?.toLowerCase()).length;
          
          return (
            <div key={sub.id} className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    {sub.code}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(sub)}
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}
                      title="Toggle subject status"
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </button>
                    <span className="text-[11px] text-slate-400 font-semibold">{sub.unitsCount || 5} Units</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {sub.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {sub.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">
                  {subResourcesCount} Materials
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditTarget(sub);
                      setEditName(sub.name);
                      setEditCode(sub.code);
                      setEditUnitsCount(sub.unitsCount || '5');
                      setEditDescription(sub.description || '');
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-blue-500 text-slate-600 dark:text-slate-300"
                    title="Edit Subject"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(sub)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-rose-500 text-slate-600 dark:text-slate-300"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleAddSubmit} className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Add New Subject</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cryptography & Network Security"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CY-302"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Units</label>
                <input
                  type="number"
                  value={unitsCount}
                  onChange={(e) => setUnitsCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Course outline and learning objectives..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg"
              >
                Save Subject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleEditSubmit} className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Edit Subject Details</h3>
              <button type="button" onClick={() => setEditTarget(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
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
                Update Subject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation with Resource Dependency Warning */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Remove Subject"
        message={deleteMessage}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
}
