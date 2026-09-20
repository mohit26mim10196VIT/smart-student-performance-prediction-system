import React, { useState, useEffect } from 'react';
import { Student, StudyRecommendation, ActiveTab } from '../types.ts';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Percent,
  TrendingUp,
  Target,
  Sparkles
} from 'lucide-react';

interface RecommendationViewProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  setActiveTab
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>(selectedStudent?.id || (students[0]?.id || ''));
  const [recommendations, setRecommendations] = useState<StudyRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStudent) {
      setSelectedStudentId(selectedStudent.id);
      fetchRecommendations(selectedStudent.id);
    } else if (students.length > 0) {
      setSelectedStudentId(students[0].id);
      fetchRecommendations(students[0].id);
    }
  }, [selectedStudent, students]);

  const fetchRecommendations = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: id })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      const data: StudyRecommendation = await res.json();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || 'Error generating study recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    if (!isNaN(id)) {
      setSelectedStudentId(id);
      const student = students.find((s) => s.id === id);
      if (student) onSelectStudent(student);
      fetchRecommendations(id);
    }
  };

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      {/* Module 3 Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              Module 3 — Study Advisor
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Personalized Study Recommendations & Recovery</h2>
          <p className="text-xs text-slate-500">
            Algorithmic remediation roadmaps, attendance deficit recovery math, and tailored revision timetables.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Student:</span>
          <select
            id="recommendation-student-select"
            value={selectedStudentId}
            onChange={handleStudentChange}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-amber-500/20"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.reg_no} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          Generating personalized academic intervention roadmap...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {recommendations && !loading && (
        <div className="space-y-6">
          {/* Key Intervention Cards: Attendance Math & Study Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Attendance Status & Recovery Calculator */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Percent className="w-4 h-4 text-blue-600" />
                  <span>Attendance Recovery Calculator (VIT 75% Rule)</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    recommendations.attendance_status.status === 'critical'
                      ? 'bg-rose-100 text-rose-800'
                      : recommendations.attendance_status.status === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {recommendations.attendance_status.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl font-black text-slate-900">
                    {recommendations.attendance_status.current}%
                  </span>
                  <span className="text-xs text-slate-400 ml-1">Current Attendance</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-600">Cutoff: 75.0%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    recommendations.attendance_status.current < 75
                      ? 'bg-rose-500'
                      : recommendations.attendance_status.current < 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, recommendations.attendance_status.current)}%` }}
                />
              </div>

              {/* Mathematical calculation result */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                {recommendations.attendance_status.classes_needed_for_75 > 0 ? (
                  <div className="flex items-start space-x-2 text-rose-900">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Recovery Requirement:</span> Must attend at least{' '}
                      <strong className="text-rose-700 underline font-black">
                        {recommendations.attendance_status.classes_needed_for_75} consecutive classes
                      </strong>{' '}
                      without any absence to regain eligibility for the Final Assessment Test (FAT).
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Eligibility Safe:</span> Current attendance satisfies the 75% VIT
                      minimum. Maintain current attendance regularity to avoid late-semester deficits.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Study Hour Calibration */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Self-Study Volume Calibration</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                  Target: {recommendations.study_hour_recommendation.recommended_hours} hrs/wk
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl font-black text-slate-900">
                    {recommendations.study_hour_recommendation.current_hours} hrs
                  </span>
                  <span className="text-xs text-slate-400 ml-1">Current / Week</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold ${
                      recommendations.study_hour_recommendation.difference > 0
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {recommendations.study_hour_recommendation.difference > 0
                      ? `+${recommendations.study_hour_recommendation.difference} hrs deficit`
                      : 'Optimal Volume'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block mb-0.5">Recommended Strategy:</span>
                <p className="text-slate-600 leading-relaxed">
                  {recommendations.study_hour_recommendation.strategy}
                </p>
              </div>
            </div>
          </div>

          {/* Weak Areas & Priority Action Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Weak Areas Diagnosis */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Diagnostic Deficiencies Identified</h3>
              </div>
              <ul className="space-y-2 text-xs">
                {recommendations.weak_areas.map((area, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-900 flex items-start space-x-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* High-Impact Priority Actions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Prescribed Priority Actions</h3>
              </div>
              <ul className="space-y-2 text-xs">
                {recommendations.priority_actions.map((act, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-blue-900 flex items-start space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Weekly Customized Study Timetable */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Customized 7-Day Remedial Timetable</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Engineered specifically around continuous assessment deficits and active course loads.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
              {recommendations.weekly_schedule_suggestion.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900">{item.day}</span>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                        {item.duration}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{item.focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence-Based Learning Techniques */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Recommended Cognitive Study Methodologies</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {recommendations.learning_techniques.map((tech, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{tech.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">{tech.description}</p>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {tech.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
