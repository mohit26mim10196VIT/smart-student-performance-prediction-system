import React, { useState, useEffect } from 'react';
import { Student, PredictionResult, ActiveTab } from '../types.ts';
import {
  BrainCircuit,
  Cpu,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  FileSpreadsheet,
  HelpCircle
} from 'lucide-react';

interface PredictionViewProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const PredictionView: React.FC<PredictionViewProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  setActiveTab
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>(selectedStudent?.id || '');
  const [selectedModel, setSelectedModel] = useState<string>('Random Forest');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Input features state
  const [features, setFeatures] = useState({
    attendance_percentage: 82.0,
    prev_sem_gpa: 7.8,
    cat1_marks: 38.0,
    cat2_marks: 39.5,
    internal_assignment_marks: 85.0,
    completed_assignments: 9,
    study_hours_per_week: 16.0,
    backlog_count: 0,
    lab_marks: 86.0,
    quiz_marks: 17.0
  });

  // When selectedStudent changes, load their academic record
  useEffect(() => {
    if (selectedStudent) {
      setSelectedStudentId(selectedStudent.id);
      loadStudentAcademicRecord(selectedStudent.id);
    }
  }, [selectedStudent]);

  const loadStudentAcademicRecord = async (id: number) => {
    try {
      const res = await fetch(`/api/students/${id}/record`);
      if (res.ok) {
        const record = await res.json();
        setFeatures({
          attendance_percentage: record.attendance_percentage,
          prev_sem_gpa: record.prev_sem_gpa,
          cat1_marks: record.cat1_marks,
          cat2_marks: record.cat2_marks,
          internal_assignment_marks: record.internal_assignment_marks,
          completed_assignments: record.completed_assignments,
          study_hours_per_week: record.study_hours_per_week,
          backlog_count: record.backlog_count,
          lab_marks: record.lab_marks || 85,
          quiz_marks: record.quiz_marks || 16
        });
      }
    } catch (err) {
      console.error('Failed to load record for student', err);
    }
  };

  const handleStudentSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '') {
      setSelectedStudentId('');
    } else {
      const id = parseInt(val, 10);
      setSelectedStudentId(id);
      const student = students.find((s) => s.id === id);
      if (student) {
        onSelectStudent(student);
        loadStudentAcademicRecord(id);
      }
    }
  };

  const handleRunPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        model: selectedModel,
        features
      };
      if (selectedStudentId) {
        payload.student_id = selectedStudentId;
      }

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Prediction failed');
      }

      const data: PredictionResult = await res.json();
      setPrediction(data);
    } catch (err: any) {
      setError(err.message || 'Error executing ML prediction');
    } finally {
      setLoading(false);
    }
  };

  // Run initial prediction if not already computed
  useEffect(() => {
    handleRunPrediction();
  }, []);

  const getRiskBadge = (level: string) => {
    if (level === 'High Risk') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>High Risk (Early Warning)</span>
        </span>
      );
    } else if (level === 'Moderate Risk') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Moderate Risk</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Low Risk (Safe)</span>
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Module 2 Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
              Module 2 — AI/ML Prediction
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Student Performance & Risk Classification</h2>
          <p className="text-xs text-slate-500">
            Feed academic inputs into trained classifiers to predict grade tiers, estimated CGPA, and explain factor influences.
          </p>
        </div>

        {/* Load Existing Student Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Auto-fill Student:</span>
          <select
            id="prediction-student-select"
            value={selectedStudentId}
            onChange={handleStudentSelectChange}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Custom Sandbox (What-if)</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.reg_no} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Parameters on Left, Prediction Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Academic Input Parameters (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Academic Parameters</h3>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-500">Model:</span>
              <select
                id="model-selector"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-xs font-semibold bg-slate-100 text-slate-800 rounded px-2 py-1 border border-slate-200"
              >
                <option value="Random Forest">Random Forest (Ensemble)</option>
                <option value="Decision Tree">Decision Tree (Gini)</option>
                <option value="Logistic Regression">Logistic Regression (Softmax)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Attendance */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Attendance Rate</span>
                <span className={features.attendance_percentage < 75 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                  {features.attendance_percentage}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="0.5"
                value={features.attendance_percentage}
                onChange={(e) => setFeatures({ ...features, attendance_percentage: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>30% (Debarred)</span>
                <span className="text-amber-600 font-semibold">75% Cutoff</span>
                <span>100%</span>
              </div>
            </div>

            {/* Previous Semester GPA */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Previous Semester CGPA</span>
                <span className="text-slate-800 font-bold">{features.prev_sem_gpa.toFixed(2)} / 10.0</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="10.0"
                step="0.05"
                value={features.prev_sem_gpa}
                onChange={(e) => setFeatures({ ...features, prev_sem_gpa: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Continuous Assessment CAT 1 & CAT 2 */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-600 font-medium mb-1">CAT-1 Marks (50)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={features.cat1_marks}
                  onChange={(e) => setFeatures({ ...features, cat1_marks: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">CAT-2 Marks (50)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={features.cat2_marks}
                  onChange={(e) => setFeatures({ ...features, cat2_marks: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Study Hours & Backlogs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Study Hrs/Week</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={features.study_hours_per_week}
                  onChange={(e) => setFeatures({ ...features, study_hours_per_week: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={features.backlog_count}
                  onChange={(e) => setFeatures({ ...features, backlog_count: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Assignments & Lab */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Assignment Score (100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={features.internal_assignment_marks}
                  onChange={(e) => setFeatures({ ...features, internal_assignment_marks: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Completed Assignments (10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={features.completed_assignments}
                  onChange={(e) => setFeatures({ ...features, completed_assignments: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>

            <button
              id="execute-prediction-btn"
              onClick={handleRunPrediction}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 mt-2"
            >
              <Cpu className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating Model...' : 'Calculate Performance Prediction'}</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Prediction Results, Risk Meter, & Explainable AI (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {prediction && (
            <>
              {/* Primary Prediction Result Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-500">
                    Model: <strong className="text-slate-800">{prediction.model_used}</strong>
                  </span>
                  {getRiskBadge(prediction.risk_level)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Predicted Performance Tier</span>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline space-x-2">
                      <span>{prediction.predicted_class}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {prediction.confidence_score}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {prediction.predicted_class === 'Distinction'
                        ? 'Expected S/A Grade standing with honors eligibility.'
                        : prediction.predicted_class === 'Good'
                        ? 'Strong B Grade standing. Well above cohort median.'
                        : prediction.predicted_class === 'Average'
                        ? 'C Grade standing. Needs targeted revision before FAT finals.'
                        : 'At-Risk of course debarment or semester credit failure.'}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">
                      Predicted Final CGPA
                    </span>
                    <div className="text-3xl font-black text-indigo-600 mt-0.5">
                      {prediction.predicted_cgpa.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-slate-400">Scale of 10.0</span>
                  </div>
                </div>

                {/* Class Probabilities Distribution */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-2.5">
                    Model Classification Probability Distribution
                  </span>
                  <div className="space-y-2 text-xs">
                    {(['Distinction', 'Good', 'Average', 'At-Risk'] as const).map((label) => {
                      const prob = prediction.class_probabilities[label] || 0;
                      const pct = Math.round(prob * 100);
                      const isWinner = prediction.predicted_class === label;
                      return (
                        <div key={label} className="flex items-center space-x-3">
                          <span className={`w-20 text-[11px] ${isWinner ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                            {label}
                          </span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                label === 'Distinction'
                                  ? 'bg-blue-600'
                                  : label === 'Good'
                                  ? 'bg-emerald-500'
                                  : label === 'Average'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 text-right font-mono font-bold text-[11px] text-slate-700">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Explainable AI (XAI) Factor Influences */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Explainable AI (XAI) — Factor Attribution</h3>
                    <p className="text-[11px] text-slate-500">
                      Shows which academic factors positively or negatively influenced the predicted outcome.
                    </p>
                  </div>
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </div>

                <div className="space-y-2.5">
                  {prediction.factor_explanations.map((factor, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-start space-x-3 ${
                        factor.impact === 'positive'
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : factor.impact === 'negative'
                          ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {factor.impact === 'positive' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : factor.impact === 'negative' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        ) : (
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{factor.label}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-white/80">
                            {factor.impact}
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5 leading-relaxed opacity-90">{factor.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Next Step Actions */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                  <button
                    id="goto-recommendations-btn"
                    onClick={() => setActiveTab('recommendations')}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl text-xs transition min-h-[44px] touch-manipulation shadow-xs"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>View Personalized Study Roadmap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="goto-reports-btn"
                    onClick={() => setActiveTab('reports')}
                    className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition min-h-[44px] touch-manipulation"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Generate Academic Audit</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
