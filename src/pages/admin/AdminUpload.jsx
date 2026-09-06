import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  FolderPlus, 
  Layers, 
  BookOpen, 
  ArrowLeft,
  X,
  File
} from 'lucide-react';
import { getStoredSubjects } from '../../services/subjectService';
import { uploadPDFFile, validatePDFFile } from '../../services/storageService';
import { addResource, addBulkResources, getStoredResources } from '../../services/resourceService';
import { addNotification } from '../../services/notificationService';

export default function AdminUpload({ onShowToast }) {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [uploadMode, setUploadMode] = useState('single');

  // Single Upload Form State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('Notes');
  const [subjectId, setSubjectId] = useState('');
  const [unit, setUnit] = useState('1');
  const [year, setYear] = useState('2025');
  const [experimentNo, setExperimentNo] = useState('Exp 1');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationError, setValidationError] = useState('');

  // Bulk Upload Form State
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkSubjectId, setBulkSubjectId] = useState('');
  const [bulkType, setBulkType] = useState('Notes');

  useEffect(() => {
    const subs = getStoredSubjects();
    setSubjects(subs);
    if (subs.length > 0) {
      setSubjectId(subs[0].id);
      setBulkSubjectId(subs[0].id);
    }
  }, []);

  const resourceTypes = [
    'Notes',
    'Previous Year Paper',
    'Study Material',
    'Assignment',
    'Practical',
    'Syllabus',
    'Important Questions',
    'Reference Material'
  ];

  const handleFileChange = (e) => {
    setValidationError('');
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validCheck = validatePDFFile(selected);
      
      if (!validCheck.valid) {
        setValidationError(validCheck.error);
        setFile(null);
        return;
      }

      setFile(selected);
      if (!title) {
        const cleanName = selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName);
      }
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setValidationError('Please select a PDF file to upload.');
      return;
    }

    const cleanTitle = (title || file.name).trim();
    const currentList = getStoredResources();
    const isDuplicate = currentList.some(r => r.title?.toLowerCase().trim() === cleanTitle.toLowerCase());
    if (isDuplicate) {
      const proceed = window.confirm(`A resource with the title "${cleanTitle}" already exists. Do you want to proceed uploading this resource?`);
      if (!proceed) return;
    }

    setLoading(true);
    setProgress(10);
    setValidationError('');

    try {
      const tempId = `res_${Date.now()}`;
      const isNotes = resourceType === 'Notes';
      const isPYQ = resourceType === 'Previous Year Paper';
      const isAssignment = resourceType === 'Assignment';
      const isPractical = resourceType === 'Practical';
      const isImportantQuestions = resourceType === 'Important Questions';

      const uploadMeta = {
        type: resourceType,
        subjectId: resourceType === 'Syllabus' ? 'SEM3-SYLLABUS' : subjectId,
        unit: (isNotes || isAssignment || isImportantQuestions) ? Number(unit) : null,
        year: isPYQ ? year : null
      };

      // Upload PDF file to Private Supabase Cloud Storage or Local IndexedDB
      const uploadRes = await uploadPDFFile(file, tempId, (percent) => {
        setProgress(percent);
      }, uploadMeta);

      const targetSubjectObj = subjects.find(s => s.id === subjectId);

      const tagsArray = tagsInput
        ? tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        : [resourceType.toLowerCase(), targetSubjectObj?.code?.toLowerCase() || 'sem3'];

      const newResource = {
        title: title || file.name,
        type: resourceType,
        subjectId: resourceType === 'Syllabus' ? 'SEM3-SYLLABUS' : subjectId,
        subjectName: resourceType === 'Syllabus' ? 'Semester 3 Curriculum' : (targetSubjectObj ? targetSubjectObj.name : subjectId),
        semester: 3,
        unit: (isNotes || isAssignment || isImportantQuestions) ? Number(unit) : null,
        year: isPYQ ? year : null,
        experimentNo: isPractical ? experimentNo : null,
        description: description || `${resourceType} resource for B.Tech Cyber Security Semester 3`,
        fileUrl: uploadRes.fileUrl,
        storagePath: uploadRes.storagePath || uploadRes.storageKey,
        fileName: uploadRes.fileName,
        fileSize: uploadRes.fileSize,
        tags: tagsArray,
        uploadedBy: 'admin@iert.ac.in',
        status: 'Active'
      };

      const createdObj = await addResource(newResource);

      if (notifyStudents) {
        addNotification({
          resourceId: createdObj.id,
          title: `New ${newResource.type} Available`,
          message: `New ${newResource.subjectId} ${newResource.type}: "${newResource.title}" has been uploaded for Semester 3.`
        });
      }

      setProgress(100);
      setLoading(false);

      if (onShowToast) {
        onShowToast(`Resource "${title}" uploaded successfully.`, "success");
      }

      navigate('/admin/resources');
    } catch (err) {
      console.error('Upload failed:', err);
      setLoading(false);
      setProgress(0);
      setValidationError(err.message || 'PDF Upload failed. Please try again.');
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (bulkFiles.length === 0) {
      alert('Please select one or more PDF files for bulk upload.');
      return;
    }

    setLoading(true);
    setProgress(5);

    try {
      const targetSubjectObj = subjects.find(s => s.id === bulkSubjectId);
      const createdItems = [];

      for (let i = 0; i < bulkFiles.length; i++) {
        const fileObj = bulkFiles[i];
        const tempId = `bulk_${Date.now()}_${i}`;
        
        const bulkMeta = {
          type: bulkType,
          subjectId: bulkType === 'Syllabus' ? 'SEM3-SYLLABUS' : bulkSubjectId,
          unit: bulkType === 'Notes' || bulkType === 'Assignment' ? 1 : null,
          year: bulkType === 'Previous Year Paper' ? '2025' : null
        };

        const uploadRes = await uploadPDFFile(fileObj, tempId, (percent) => {
          const overall = Math.round(((i + percent / 100) / bulkFiles.length) * 100);
          setProgress(overall);
        }, bulkMeta);

        const cleanTitle = fileObj.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

        createdItems.push({
          title: cleanTitle,
          type: bulkType,
          subjectId: bulkType === 'Syllabus' ? 'SEM3-SYLLABUS' : bulkSubjectId,
          subjectName: bulkType === 'Syllabus' ? 'Semester 3 Curriculum' : (targetSubjectObj ? targetSubjectObj.name : bulkSubjectId),
          semester: 3,
          unit: bulkType === 'Notes' || bulkType === 'Assignment' ? 1 : null,
          year: bulkType === 'Previous Year Paper' ? '2025' : null,
          experimentNo: bulkType === 'Practical' ? `Exp ${i + 1}` : null,
          description: `Bulk uploaded ${bulkType} resource`,
          fileUrl: uploadRes.fileUrl,
          storagePath: uploadRes.storagePath || uploadRes.storageKey,
          fileName: uploadRes.fileName,
          fileSize: uploadRes.fileSize,
          tags: [bulkType.toLowerCase(), 'bulk upload'],
          uploadedBy: 'admin@iert.ac.in',
          status: 'Active'
        });
      }

      await addBulkResources(createdItems);
      setProgress(100);
      setLoading(false);

      if (onShowToast) {
        onShowToast(`Successfully uploaded ${createdItems.length} resources.`, "success");
      }

      navigate('/admin/resources');
    } catch (err) {
      console.error('Bulk upload error:', err);
      setLoading(false);
      setProgress(0);
      alert('Bulk upload failed: ' + err.message);
    }
  };

  // Helper flags for conditional fields
  const showSubjectField = resourceType !== 'Syllabus';
  const showUnitField = resourceType === 'Notes' || resourceType === 'Assignment' || resourceType === 'Important Questions';
  const showYearField = resourceType === 'Previous Year Paper';
  const showExperimentField = resourceType === 'Practical';
  const showSemesterField = resourceType === 'Syllabus';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-cyan-500" />
            <span>Upload Academic Resource</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic upload system for Semester 3 notes, PYQs, assignments, and practicals.
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
          <button
            onClick={() => setUploadMode('single')}
            type="button"
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              uploadMode === 'single' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Single PDF
          </button>
          <button
            onClick={() => setUploadMode('bulk')}
            type="button"
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              uploadMode === 'bulk' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Upload Progress Bar */}
      {loading && (
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 bg-cyan-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-500">
            <span>Uploading PDF file to storage...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {uploadMode === 'single' ? (
        /* Single Upload Form */
        <form onSubmit={handleSingleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-6">
          
          {/* PDF Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select PDF File *
            </label>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-950/50 transition-colors relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                
                {file ? (
                  <div>
                    <p className="font-bold text-xs text-cyan-600 dark:text-cyan-400">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Click to browse or drop your PDF document here
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Only PDF files up to 50MB permitted</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resource Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unit 1 Notes on Stacks & Queues"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Resource Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resource Category *
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                {resourceTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Subject Field */}
            {showSubjectField && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Unit Field */}
            {showUnitField && (
              <div>
                <label className="block text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
                  Unit Number ({resourceType}) *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-cyan-500/40 text-slate-900 dark:text-white focus:outline-none"
                >
                  {['1', '2', '3', '4', '5'].map(u => (
                    <option key={u} value={u}>Unit {u}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Year Field */}
            {showYearField && (
              <div>
                <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                  Examination Year (PYQ) *
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-purple-500/40 text-slate-900 dark:text-white focus:outline-none"
                >
                  {['2025', '2024', '2023', '2022', '2021'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Experiment Field */}
            {showExperimentField && (
              <div>
                <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  Experiment Number (Practical) *
                </label>
                <input
                  type="text"
                  value={experimentNo}
                  onChange={(e) => setExperimentNo(e.target.value)}
                  placeholder="e.g. Exp 1"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-emerald-500/40 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            )}

            {/* Dynamic Semester Field */}
            {showSemesterField && (
              <div>
                <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                  Target Semester (Syllabus) *
                </label>
                <input
                  type="text"
                  disabled
                  value="Semester 3"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold"
                />
              </div>
            )}

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of topics covered in this resource..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Tags */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="unit 1, notes, stacks, algorithms"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Notify Students Checkbox */}
            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyStudents}
                  onChange={(e) => setNotifyStudents(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Notify registered students about this new upload 🔔</span>
              </label>
            </div>

          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/resources')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Resource</span>
                </>
              )}
            </button>
          </div>

        </form>
      ) : (
        /* Bulk Upload Form */
        <form onSubmit={handleBulkSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Multiple PDF Files *
            </label>
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={(e) => setBulkFiles(Array.from(e.target.files || []))}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            {bulkFiles.length > 0 && (
              <p className="text-xs font-semibold text-cyan-500 mt-2">
                {bulkFiles.length} files selected for batch upload.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batch Subject *
              </label>
              <select
                value={bulkSubjectId}
                onChange={(e) => setBulkSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batch Resource Type *
              </label>
              <select
                value={bulkType}
                onChange={(e) => setBulkType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                {resourceTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="submit"
              disabled={loading || bulkFiles.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  <span>Process Bulk Upload ({bulkFiles.length})</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
