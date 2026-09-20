import React, { useState } from 'react';
import { ActiveTab, Student } from '../types.ts';
import {
  GraduationCap,
  Users,
  BrainCircuit,
  Lightbulb,
  BarChart3,
  FileSpreadsheet,
  Cpu,
  BookOpen,
  RotateCcw,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedStudent: Student | null;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedStudent,
  onResetDemo,
  isResetting
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-slate-900">VIT Bhopal</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  VITyarthi AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Smart Student Performance & Study Recommendation System
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold ${
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

          {/* Selected Student & Demo Reset Action (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {selectedStudent && (
              <div
                onClick={() => setActiveTab('students')}
                className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-emerald-100 transition"
                title="Active student context"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{selectedStudent.reg_no}</span>
                <span className="text-emerald-700 text-[11px] truncate max-w-[90px]">{selectedStudent.name}</span>
              </div>
            )}

            <button
              id="reset-demo-btn"
              onClick={onResetDemo}
              disabled={isResetting}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
              title="Reset sample cohort database to default state"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo</span>
            </button>
          </div>

          {/* Mobile menu button and quick active badge */}
          <div className="flex lg:hidden items-center space-x-2">
            {selectedStudent && (
              <button
                onClick={() => setActiveTab('students')}
                className="md:hidden flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-md text-[11px] font-semibold"
                title="Active student"
              >
                <UserCheck className="w-3 h-3 text-emerald-600" />
                <span className="font-mono">{selectedStudent.reg_no.slice(-5)}</span>
              </button>
            )}

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {selectedStudent && (
            <div className="p-3 mb-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">{selectedStudent.name}</div>
                  <div className="text-[11px] font-mono text-emerald-700">{selectedStudent.reg_no} • {selectedStudent.branch}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('students');
                  setMobileMenuOpen(false);
                }}
                className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-200 text-emerald-900"
              >
                Change
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold min-h-[44px] touch-manipulation transition ${
                    isActive ? 'bg-blue-50 text-blue-700 border border-blue-200/70' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                onResetDemo();
                setMobileMenuOpen(false);
              }}
              disabled={isResetting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl min-h-[44px] touch-manipulation transition"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo Cohort Data</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
