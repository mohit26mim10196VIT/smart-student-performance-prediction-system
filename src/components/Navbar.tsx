import React from 'react';
import { Student } from '../types.ts';
import {
  GraduationCap,
  RotateCcw,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  selectedStudent: Student | null;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedStudent,
  onResetDemo,
  isResetting
}) => {
  return (
    <header className="h-20 shrink-0 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">VIT Bhopal</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  VITyarthi AI
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Smart Student Performance & Study Recommendation System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {selectedStudent && (
              <div
                className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer hover:bg-emerald-100 transition"
                title="Active student context"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{selectedStudent.reg_no}</span>
                <span className="text-emerald-700 text-[11px] truncate max-w-[110px]">{selectedStudent.name}</span>
              </div>
            )}

            <button
              id="reset-demo-btn"
              onClick={onResetDemo}
              disabled={isResetting}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
              title="Reset sample cohort database to default state"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
