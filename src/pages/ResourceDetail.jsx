import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Download, 
  ExternalLink, 
  Eye, 
  FileText, 
  BookOpen, 
  Clock, 
  HardDrive, 
  ShieldCheck, 
  Share2,
  Check
} from 'lucide-react';
import { getResourceById, incrementViewCount, incrementDownloadCount } from '../services/resourceService';
import { getPDFUrl } from '../services/storageService';

export default function ResourceDetail({ onDownloadSuccess }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const res = getResourceById(id);
    if (res) {
      setResource(res);
      incrementViewCount(res.id);
      getPDFUrl(res.storagePath || res.storageKey, res.fileUrl).then(setPdfUrl);
    }
  }, [id]);

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resource Not Found</h2>
        <p className="text-xs text-slate-500">The requested PDF resource does not exist or has been removed.</p>
        <Link to="/notes" className="inline-flex px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-bold">
          Back to Notes
        </Link>
      </div>
    );
  }

  const handleDownload = async () => {
    let targetUrl = pdfUrl;
    if (!targetUrl) {
      targetUrl = await getPDFUrl(resource.storagePath || resource.storageKey, resource.fileUrl);
    }
    if (!targetUrl) {
      alert("Unable to download this PDF document. Please try again.");
      return;
    }
    incrementDownloadCount(resource.id);
    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (onDownloadSuccess) {
      onDownloadSuccess(resource.title);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Resources</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Link Copied!" : "Share Link"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            {resource.type}
          </span>
          {resource.unit && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Unit {resource.unit}</span>}
          {resource.year && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300">{resource.year}</span>}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {resource.title}
        </h1>

        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
          <span>Subject: {resource.subjectName} ({resource.subjectId})</span>
          <span>•</span>
          <span>Size: {resource.fileSize}</span>
        </p>
      </div>

      {/* Embedded Viewer Container */}
      <div className="h-[75vh] w-full rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
        <iframe
          src={pdfUrl || resource.fileUrl}
          title={resource.title}
          className="w-full h-full border-0"
        />
      </div>

    </div>
  );
}
