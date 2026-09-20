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
import { CheckCircle2, AlertTriangle, GraduationCap, Github } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    const init = async () => {
      setIsLoading(true);
      await Promise.all([loadStudents(), loadAnalytics(), loadMetrics()]);
      setIsLoading(false);
    };
    init();
  }, []);

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

      {/* Primary Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedStudent={selectedStudent}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
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

      {/* Institutional Academic Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 print:hidden">
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
