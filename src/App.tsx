import React, { useState, useEffect } from 'react';
import { ActiveTab, Student, ModelMetrics } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { HomeView } from './components/HomeView.tsx';
import { StudentsView } from './components/StudentsView.tsx';
import { PredictionView } from './components/PredictionView.tsx';
import { RecommendationView } from './components/RecommendationView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { ModelInspectorView } from './components/ModelInspectorView.tsx';
import { ProjectInfoView } from './components/ProjectInfoView.tsx';
import { LoginView } from './components/LoginView.tsx';
import {
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Github,
  Users,
  BrainCircuit,
  Lightbulb,
  BarChart3,
  FileSpreadsheet,
  Cpu,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

type AppRoute = '/login' | '/overview' | '/student-data' | '/ai-prediction' | '/study-advisor' | '/analytics' | '/audit-reports' | '/ml-laboratory' | '/viva-specs';

const routeByTab: Record<ActiveTab, AppRoute> = {
  home: '/overview',
  students: '/student-data',
  prediction: '/ai-prediction',
  recommendations: '/study-advisor',
  analytics: '/analytics',
  reports: '/audit-reports',
  inspector: '/ml-laboratory',
  about: '/viva-specs'
};

const tabByRoute: Record<string, ActiveTab> = Object.entries(routeByTab).reduce((routes, [tab, path]) => {
  routes[path] = tab as ActiveTab;
  return routes;
}, {} as Record<string, ActiveTab>);

export function App() {
  const [route, setRoute] = useState(() => window.location.pathname as AppRoute);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = (path: AppRoute, replace = false) => {
    if (window.location.pathname !== path) {
      if (replace) window.history.replaceState({}, '', path);
      else window.history.pushState({}, '', path);
    }
    setRoute(path);
    const tab = tabByRoute[path];
    if (tab) setActiveTab(tab);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Overview', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'students', label: 'Student Data', icon: <Users className="w-4 h-4" />, badge: 'SQLite' },
    { id: 'prediction', label: 'AI Prediction', icon: <BrainCircuit className="w-4 h-4" />, badge: 'ML' },
    { id: 'recommendations', label: 'Study Advisor', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'reports', label: 'Audit Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'inspector', label: 'ML Laboratory', icon: <Cpu className="w-4 h-4" />, badge: 'Metrics' },
    { id: 'about', label: 'Viva & Specs', icon: <BookOpen className="w-4 h-4" />, badge: '20 Q&A' },
  ];

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setStudents(data);
        if (data.length > 0 && !selectedStudent) {
          setSelectedStudent(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load students', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  };

  const loadMetrics = async () => {
    try {
      const res = await fetch('/api/model/metrics');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to load ML metrics', err);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = window.location.pathname as AppRoute;
      setRoute(nextRoute);
      const tab = tabByRoute[nextRoute];
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const authResponse = await fetch('/api/auth/me');
        if (authResponse.ok) {
          setUser((await authResponse.json()).user);
          navigate(tabByRoute[route] ? route : '/overview', true);
        } else {
          navigate('/login', true);
        }
      } finally {
        setAuthChecked(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      setIsLoading(true);
      await Promise.all([loadStudents(), loadAnalytics(), loadMetrics()]);
      setIsLoading(false);
    };
    init();
  }, [user]);

  useEffect(() => {
    if (!authChecked) return;
    if (user && !tabByRoute[route]) navigate('/overview', true);
    if (!user && route !== '/login') navigate('/login', true);
  }, [authChecked, route, user]);

  const handleLogin = async (username: string, password: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) return data.error || 'Unable to sign in';
      setUser(data.user);
      navigate('/overview');
      return null;
    } catch {
      return 'Unable to connect to the server';
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setStudents([]);
    setSelectedStudent(null);
    navigate('/login');
  };

  const handleAddStudent = async (studentData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create student');
      }
      const newStudent = await res.json();
      await loadStudents();
      await loadAnalytics();
      setSelectedStudent(newStudent);
      showToast(`Student ${newStudent.name} (${newStudent.reg_no}) registered in SQLite!`);
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleUpdateStudent = async (id: number, studentData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update student');
      }
      await loadStudents();
      await loadAnalytics();
      showToast('Student profile updated successfully');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleDeleteStudent = async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete student');
      }
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
      await loadStudents();
      await loadAnalytics();
      showToast('Student record deleted from SQLite');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        await Promise.all([loadStudents(), loadAnalytics(), loadMetrics()]);
        showToast('Demo cohort database restored to pristine state!');
      }
    } catch (err) {
      showToast('Failed to reset demo data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-slate-500">Checking your session...</div>;
  }

  if (!user) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans">
      {/* Toast alert banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-3.5 px-4 rounded-xl shadow-lg border flex items-center space-x-2.5 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-white shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      <Navbar
        selectedStudent={selectedStudent}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        username={user.username}
        onLogout={handleLogout}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="relative flex flex-1 min-h-0 max-md:flex-col">
        <aside
          className={`mobile-sidebar ${isSidebarCollapsed ? 'mobile-sidebar-collapsed w-[88px] md:w-[88px] max-md:h-[58px] max-md:w-full max-md:overflow-hidden' : 'w-[270px] md:w-[270px] max-md:h-[calc(100dvh-var(--mobile-header-height))] max-md:w-[72%] max-md:overflow-y-auto'} fixed left-0 top-20 z-30 h-[calc(100vh-5rem)] border-r border-slate-200 bg-white/95 p-2.5 transition-all duration-200 overflow-y-auto max-md:fixed max-md:left-0 max-md:top-[var(--mobile-header-height)] max-md:z-40 max-md:max-h-none max-md:border-r-0 max-md:border-b`}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            {!isSidebarCollapsed && (
              <span className={`text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
                Navigation
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="mobile-sidebar-toggle ml-auto hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900 transition md:inline-flex"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          <nav className={`space-y-2 ${isSidebarCollapsed ? 'max-md:hidden' : ''}`}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    navigate(routeByTab[item.id]);
                    if (window.matchMedia('(max-width: 767px)').matches) {
                      setIsSidebarCollapsed(true);
                    }
                  }}
                  className={`group flex w-full items-center rounded-xl border px-2.5 py-2.5 text-left text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  } ${isSidebarCollapsed ? 'md:justify-center max-md:justify-between' : 'justify-between'}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center max-md:gap-2.5' : 'gap-2.5'}`}>
                    <span className={`${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
                      {item.icon}
                    </span>
                    <span className={isSidebarCollapsed ? 'md:hidden' : ''}>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`${isSidebarCollapsed ? 'md:hidden' : ''} text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-blue-200 text-blue-900' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className={`${isSidebarCollapsed ? 'md:ml-[88px]' : 'md:ml-[270px]'} max-md:ml-0 flex-1 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden max-md:overflow-visible px-3 sm:px-6 lg:px-8 py-4 sm:py-8`}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">
                Initializing SQLite Database & Loading AI Models...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeView
                  setActiveTab={setActiveTab}
                  students={students}
                  analytics={analytics}
                  metrics={metrics}
                />
              )}

              {activeTab === 'students' && (
                <StudentsView
                  students={students}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onSelectStudent={setSelectedStudent}
                  selectedStudent={selectedStudent}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'prediction' && (
                <PredictionView
                  students={students}
                  selectedStudent={selectedStudent}
                  onSelectStudent={setSelectedStudent}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'recommendations' && (
                <RecommendationView
                  students={students}
                  selectedStudent={selectedStudent}
                  onSelectStudent={setSelectedStudent}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  analytics={analytics}
                  onRefreshAnalytics={loadAnalytics}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  students={students}
                  selectedStudent={selectedStudent}
                  onSelectStudent={setSelectedStudent}
                />
              )}

              {activeTab === 'inspector' && (
                <ModelInspectorView
                  metrics={metrics}
                  onRefreshMetrics={loadMetrics}
                />
              )}

              {activeTab === 'about' && <ProjectInfoView />}
            </>
          )}
        </main>
      </div>

      {/* Institutional Academic Footer */}
      <footer
        className={`${isSidebarCollapsed ? 'md:ml-[88px]' : 'md:ml-[270px]'} max-md:ml-0 relative z-40 w-full shrink-0 bg-white border-t border-slate-200 py-6 text-xs text-slate-500 print:hidden overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            <span className="font-semibold text-slate-700">
              Vellore Institute of Technology (VIT Bhopal University)
            </span>
            <span className="text-slate-300">|</span>
            <span>VITyarthi Evaluation 2026</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>B.Tech Artificial Intelligence & Machine Learning</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-600 font-bold">SCSE Capstone</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
