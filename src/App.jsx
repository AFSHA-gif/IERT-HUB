import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';

// Layout & Global Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import PDFViewerModal from './components/PDFViewerModal';
import Toast from './components/Toast';
import SearchBar from './components/SearchBar';
import ResourceCard from './components/ResourceCard';
import MobileBottomNav from './components/MobileBottomNav';

// Auth Protection Guards
import ProtectedRoute from './components/admin/ProtectedRoute';
import ProtectedRouteStudent from './components/ProtectedRouteStudent';

// Student Auth Service
import { isStudentAuthenticated } from './services/studentAuthService';

// Student Pages
import Home from './pages/Home';
import Notes from './pages/Notes';
import PreviousPapers from './pages/PreviousPapers';
import StudyMaterial from './pages/StudyMaterial';
import Assignments from './pages/Assignments';
import Practicals from './pages/Practicals';
import Syllabus from './pages/Syllabus';
import ResourceDetail from './pages/ResourceDetail';
import About from './pages/About';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import StudentAccount from './pages/StudentAccount';
import StudentDashboard from './pages/StudentDashboard';
import AIStudyAssistant from './pages/AIStudyAssistant';
import SavedMaterials from './pages/SavedMaterials';
import StudentNotifications from './pages/StudentNotifications';
import NotFound from './pages/NotFound';

// Admin Sidebar & Header
import AdminSidebar from './components/admin/AdminSidebar';
import AdminHeader from './components/admin/AdminHeader';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUpload from './pages/admin/AdminUpload';
import AdminResources from './pages/admin/AdminResources';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminStudents from './pages/admin/AdminStudents';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSystemHealth from './pages/admin/AdminSystemHealth';
import AdminSettings from './pages/admin/AdminSettings';

// Services
import { getStoredResources, fetchResourcesFromDB } from './services/resourceService';
import { performSmartSearch } from './services/smartSearchService';

// Root Route Handler checking Session State
function RootRedirect() {
  let isStudent = false;
  let isAdmin = false;

  try {
    isStudent = isStudentAuthenticated();
    isAdmin = isAdminAuthenticated();
  } catch (err) {
    console.error('Root session evaluation failed:', err);
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isStudent) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Navigate to="/student/login" replace />;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active Modals
  const [activePDFResource, setActivePDFResource] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [allResources, setAllResources] = useState([]);
  const [mobileAdminSidebarOpen, setMobileAdminSidebarOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    fetchResourcesFromDB().then(data => {
      setAllResources(data || getStoredResources());
    });

    const handleUpdate = () => setAllResources(getStoredResources());
    window.addEventListener('iert_resources_updated', handleUpdate);
    return () => window.removeEventListener('iert_resources_updated', handleUpdate);
  }, []);

  // Keyboard shortcut ⌘K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const handleOpenPDF = (res) => {
    if (!isStudentAuthenticated()) {
      navigate('/student/login', { state: { from: location.pathname } });
      return;
    }
    setActivePDFResource(res);
  };

  const handleDownloadSuccess = (title) => {
    if (!isStudentAuthenticated()) {
      navigate('/student/login', { state: { from: location.pathname } });
      return;
    }
    showToast(`Downloading "${title}"...`, "download");
  };

  // Smart Ranked global search results
  const searchResults = globalSearchQuery.trim()
    ? performSmartSearch(globalSearchQuery, allResources).slice(0, 8)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-slate-100 transition-colors selection:bg-cyan-500/30 selection:text-cyan-400">
      
      {/* Background canvas for student routes */}
      {!isAdminRoute && <AnimatedBackground variant="student" />}

      {/* ADMIN LAYOUT */}
      {isAdminRoute ? (
        location.pathname === '/admin/login' ? (
          <AdminLogin onShowToast={showToast} />
        ) : (
          <div className="min-h-screen flex bg-slate-950 text-white">
            <AdminSidebar
              mobileOpen={mobileAdminSidebarOpen}
              onCloseMobile={() => setMobileAdminSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col lg:pl-64">
              <AdminHeader
                onOpenMobileSidebar={() => setMobileAdminSidebarOpen(true)}
              />

              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                <Routes>
                  <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/upload" element={<ProtectedRoute><AdminUpload onShowToast={showToast} /></ProtectedRoute>} />
                  <Route path="/admin/resources" element={<ProtectedRoute><AdminResources onOpenPDF={handleOpenPDF} onShowToast={showToast} /></ProtectedRoute>} />
                  <Route path="/admin/subjects" element={<ProtectedRoute><AdminSubjects onShowToast={showToast} /></ProtectedRoute>} />
                  <Route path="/admin/students" element={<ProtectedRoute><AdminStudents onShowToast={showToast} /></ProtectedRoute>} />
                  <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
                  <Route path="/admin/audit-logs" element={<ProtectedRoute><AdminAuditLogs onShowToast={showToast} /></ProtectedRoute>} />
                  <Route path="/admin/system-health" element={<ProtectedRoute><AdminSystemHealth /></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings onShowToast={showToast} /></ProtectedRoute>} />
                  <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        )
      ) : (
        /* STUDENT LAYOUT */
        <>
          <Navbar onOpenSearch={() => setSearchModalOpen(true)} />

          <main className="flex-1 pb-20 md:pb-0">
            <Routes>
              {/* Root Route Redirect Handler */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/about" element={<About />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/login" element={<Navigate to="/student/login" replace />} />
              <Route path="/register" element={<StudentRegister />} />

              {/* Protected Student Academic Resource Routes */}
              <Route path="/student/dashboard" element={<ProtectedRouteStudent><StudentDashboard onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/student/saved" element={<ProtectedRouteStudent><SavedMaterials onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/student/saved/*" element={<ProtectedRouteStudent><SavedMaterials onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/student/notifications" element={<ProtectedRouteStudent><StudentNotifications onOpenPDF={handleOpenPDF} /></ProtectedRouteStudent>} />
              <Route path="/student/notifications/*" element={<ProtectedRouteStudent><StudentNotifications onOpenPDF={handleOpenPDF} /></ProtectedRouteStudent>} />
              <Route path="/ai-study-assistant" element={<ProtectedRouteStudent><AIStudyAssistant onOpenPDF={handleOpenPDF} /></ProtectedRouteStudent>} />
              <Route path="/ai-study-assistant/*" element={<ProtectedRouteStudent><AIStudyAssistant onOpenPDF={handleOpenPDF} /></ProtectedRouteStudent>} />

              <Route path="/notes" element={<ProtectedRouteStudent><Notes onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/notes/:subject" element={<ProtectedRouteStudent><Notes onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/notes/:subject/:unit" element={<ProtectedRouteStudent><Notes onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/notes/*" element={<ProtectedRouteStudent><Notes onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              
              <Route path="/previous-papers" element={<ProtectedRouteStudent><PreviousPapers onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/previous-papers/*" element={<ProtectedRouteStudent><PreviousPapers onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />

              <Route path="/study-material" element={<ProtectedRouteStudent><StudyMaterial onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/study-material/*" element={<ProtectedRouteStudent><StudyMaterial onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />

              <Route path="/assignments" element={<ProtectedRouteStudent><Assignments onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/assignments/*" element={<ProtectedRouteStudent><Assignments onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />

              <Route path="/practicals" element={<ProtectedRouteStudent><Practicals onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/practicals/*" element={<ProtectedRouteStudent><Practicals onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />

              <Route path="/syllabus" element={<ProtectedRouteStudent><Syllabus onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/syllabus/*" element={<ProtectedRouteStudent><Syllabus onOpenPDF={handleOpenPDF} onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />

              <Route path="/resource/:id" element={<ProtectedRouteStudent><ResourceDetail onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />
              <Route path="/resource/*" element={<ProtectedRouteStudent><ResourceDetail onDownloadSuccess={handleDownloadSuccess} /></ProtectedRouteStudent>} />

              <Route path="/account" element={<ProtectedRouteStudent><StudentAccount /></ProtectedRouteStudent>} />
              <Route path="/account/*" element={<ProtectedRouteStudent><StudentAccount /></ProtectedRouteStudent>} />

              {/* Catch-all fallback route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
          <MobileBottomNav isPDFOpen={!!activePDFResource} />
        </>
      )}

      {/* Global Interactive PDF Viewer Modal */}
      {activePDFResource && (
        <PDFViewerModal
          resource={activePDFResource}
          onClose={() => setActivePDFResource(null)}
          onDownloadSuccess={handleDownloadSuccess}
        />
      )}

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Global Smart Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-4 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">IERT HUB Smart Academic Search</span>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <SearchBar
              query={globalSearchQuery}
              onChange={setGlobalSearchQuery}
              placeholder="Search OS, CS303, Unit 2, deadlock, 2025, cyber security..."
            />

            {searchResults.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pt-2">
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      setSearchModalOpen(false);
                      handleOpenPDF(res);
                    }}
                    className="p-3 rounded-2xl bg-slate-800/60 hover:bg-cyan-500/10 border border-slate-700/60 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {res.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {res.subjectId} {res.unit ? `• Unit ${res.unit}` : res.year ? `• ${res.year}` : ''}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-white">{res.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{res.description}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-cyan-400 shrink-0">View PDF →</span>
                  </div>
                ))}
              </div>
            ) : globalSearchQuery.trim() ? (
              <p className="text-center text-xs text-slate-500 py-6">No matching academic resources found for "{globalSearchQuery}".</p>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                <span className="font-bold text-slate-300 block">Try popular search queries:</span>
                <div className="flex flex-wrap gap-2">
                  {['OS', 'CS303', 'Unit 2', 'deadlock', '2025', 'CY301', 'Data Structures'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setGlobalSearchQuery(tag)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 font-semibold"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
