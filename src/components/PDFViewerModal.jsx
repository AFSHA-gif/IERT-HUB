import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  BookOpen, 
  FileText, 
  HardDrive, 
  Clock, 
  Maximize2, 
  Minimize2, 
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { getPDFUrl } from '../services/storageService';
import { incrementDownloadCount } from '../services/resourceService';
import { isStudentAuthenticated } from '../services/studentAuthService';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PDFViewerModal({ resource, onClose, onDownloadSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const loadPDF = () => {
    if (!resource) return;

    if (!isStudentAuthenticated()) {
      onClose();
      navigate('/student/login', { state: { from: location.pathname } });
      return;
    }

    setLoading(true);
    setErrorMsg('');

    getPDFUrl(resource.storagePath || resource.storageKey, resource.fileUrl)
      .then((url) => {
        if (url) {
          setPdfUrl(url);
          setErrorMsg('');
        } else {
          setPdfUrl('');
          setErrorMsg('Unable to load PDF document. The file may not have been uploaded to storage yet.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('PDF view loading error:', err);
        setPdfUrl('');
        setErrorMsg('Failed to load PDF file. Please try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPDF();
  }, [resource]);

  if (!resource) return null;

  const {
    id,
    title,
    type,
    subjectName,
    subjectId,
    unit,
    year,
    experimentNo,
    fileSize = '1.5 MB',
    createdAt,
    description
  } = resource;

  const handleDownload = async () => {
    if (!isStudentAuthenticated()) {
      onClose();
      navigate('/student/login', { state: { from: location.pathname } });
      return;
    }

    let downloadUrl = pdfUrl;
    if (!downloadUrl) {
      downloadUrl = await getPDFUrl(resource.storagePath || resource.storageKey, resource.fileUrl);
    }

    if (!downloadUrl) {
      alert("Unable to generate a download link for this PDF file. The file may be pending upload.");
      return;
    }

    incrementDownloadCount(id);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (onDownloadSuccess) {
      onDownloadSuccess(title);
    }
  };

  const handleOpenExternal = () => {
    if (!isStudentAuthenticated()) {
      onClose();
      navigate('/student/login', { state: { from: location.pathname } });
      return;
    }
    window.open(pdfUrl || resource.fileUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className={`w-full max-w-6xl rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'h-full max-w-none rounded-none' : 'h-[92vh]'}`}>
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Go Back"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {type}
                </span>
                {unit && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Unit {unit}</span>}
                {year && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">{year}</span>}
                {experimentNo && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">{experimentNo}</span>}
              </div>
              <h2 className="font-bold text-sm sm:text-base text-white truncate mt-0.5">
                {title}
              </h2>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download</span>
            </button>

            <button
              onClick={handleOpenExternal}
              type="button"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Open in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              type="button"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer hidden sm:block"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer ml-1"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: PDF Iframe + Sidebar Info */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-slate-950">
          
          {/* Main PDF Frame */}
          <div className="flex-1 h-full relative flex items-center justify-center p-4">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium">Generating secure temporary URL...</p>
              </div>
            ) : pdfUrl ? (
              <object
                data={pdfUrl}
                type="application/pdf"
                className="w-full h-full border-0 rounded-xl"
              >
                <iframe
                  src={pdfUrl}
                  title={title}
                  className="w-full h-full border-0 rounded-xl"
                >
                  <div className="p-8 text-center text-slate-400 space-y-3">
                    <p className="text-xs">Your browser cannot inline-render this PDF document.</p>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Download PDF Directly
                    </button>
                  </div>
                </iframe>
              </object>
            ) : (
              <div className="max-w-md p-6 text-center space-y-4 glass-panel rounded-2xl border border-slate-800 bg-slate-900/80">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">PDF Document Unavailable</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {errorMsg || "Unable to generate a signed URL for this resource. The file may be pending upload."}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={loadPDF}
                    type="button"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    type="button"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Metadata Info */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/90 p-5 overflow-y-auto space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Resource Details
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {description || "Academic resource for B.Tech Cyber Security Semester 3."}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Subject:</span>
                <span className="font-semibold text-slate-200">{subjectName || subjectId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Semester:</span>
                <span className="font-semibold text-slate-200">Semester 3</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>File Size:</span>
                <span className="font-semibold text-slate-200">{fileSize}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={handleDownload}
                type="button"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF File</span>
              </button>

              <button
                onClick={handleOpenExternal}
                type="button"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Separate Window</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
