import React, { useState, useEffect } from 'react';
import { Student } from '../types.ts';
import {
  FileSpreadsheet,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  GraduationCap,
  Calendar,
  Clock,
  Award
} from 'lucide-react';

interface ReportsViewProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  selectedStudent,
  onSelectStudent
}) => {
  const [selectedId, setSelectedId] = useState<number | ''>(selectedStudent?.id || (students[0]?.id || ''));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStudent) {
      setSelectedId(selectedStudent.id);
      loadReport(selectedStudent.id);
    } else if (students.length > 0) {
      setSelectedId(students[0].id);
      loadReport(students[0].id);
    }
  }, [selectedStudent, students]);

  const loadReport = async (studentId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${studentId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate report');
      }
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error generating academic report');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    if (!isNaN(id)) {
      setSelectedId(id);
      const student = students.find((s) => s.id === id);
      if (student) onSelectStudent(student);
      loadReport(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Module 5 Header and Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              Module 5 — Reporting
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Official Academic Performance Audit Transcript</h2>
          <p className="text-xs text-slate-500">
            Formal student evaluation transcript with continuous assessment parameters, ML prediction, and faculty intervention plan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <select
            id="report-student-select"
            value={selectedId}
            onChange={handleStudentChange}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-purple-500/20"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.reg_no} — {s.name}
              </option>
            ))}
          </select>

          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs transition shadow-xs min-h-[42px] touch-manipulation"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          Generating formal academic audit transcript...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Printable Report Document Card */}
      {report && !loading && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
          {/* Transcript Header with Institutional Branding */}
          <div className="border-b-2 border-slate-800 pb-5 mb-6 text-center relative">
            <div className="flex items-center justify-center space-x-2 text-blue-900 font-extrabold text-lg sm:text-xl tracking-tight uppercase">
              <GraduationCap className="w-6 h-6 text-blue-800" />
              <span>{report.institution}</span>
            </div>
            <div className="text-xs text-slate-600 font-semibold mt-0.5">{report.department}</div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold mt-2 px-3 py-0.5 bg-slate-100 inline-block rounded">
              {report.evaluation_type}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-4">
              <span>REPORT ID: {report.report_id}</span>
              <span>TIMESTAMP: {new Date(report.generated_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                <span className="font-bold text-slate-900">{report.student.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration No</span>
                <span className="font-mono font-bold text-slate-900">{report.student.reg_no}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch & Degree</span>
                <span className="font-semibold text-slate-800">{report.student.branch}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Semester & Section</span>
                <span className="font-semibold text-slate-800">
                  Sem {report.student.semester} (Sec {report.student.section})
                </span>
              </div>
            </div>
          </div>

          {/* Academic Continuous Assessment Ledger */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">
              1. Continuous Assessment & Academic Performance Inputs
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold">
                    <th className="p-2 border border-slate-200">Parameter</th>
                    <th className="p-2 border border-slate-200 text-center">Score / Value</th>
                    <th className="p-2 border border-slate-200 text-center">Standard Cutoff</th>
                    <th className="p-2 border border-slate-200 text-center">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border border-slate-200 font-medium">Classroom Attendance</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">
                      {report.academic_inputs.attendance_percentage}%
                    </td>
                    <td className="p-2 border border-slate-200 text-center text-slate-500">75.0% Mandatory</td>
                    <td className="p-2 border border-slate-200 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          report.academic_inputs.attendance_percentage >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {report.academic_inputs.attendance_percentage >= 75 ? 'Compliant' : 'Debarment Risk'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200 font-medium">Previous Semester GPA</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">
                      {report.academic_inputs.prev_sem_gpa} / 10.0
                    </td>
                    <td className="p-2 border border-slate-200 text-center text-slate-500">6.00 Minimum</td>
                    <td className="p-2 border border-slate-200 text-center text-slate-700 font-semibold">
                      {report.academic_inputs.prev_sem_gpa >= 8.0 ? 'Honors Tier' : 'Standard Tier'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200 font-medium">CAT-1 & CAT-2 Internal Average</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">
                      {((report.academic_inputs.cat1_marks + report.academic_inputs.cat2_marks) / 2).toFixed(1)} / 50
                    </td>
                    <td className="p-2 border border-slate-200 text-center text-slate-500">25.0 Minimum</td>
                    <td className="p-2 border border-slate-200 text-center text-slate-700">
                      CAT1: {report.academic_inputs.cat1_marks} | CAT2: {report.academic_inputs.cat2_marks}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200 font-medium">Assignment & Continuous Practice</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">
                      {report.academic_inputs.internal_assignment_marks}% ({report.academic_inputs.completed_assignments}/10)
                    </td>
                    <td className="p-2 border border-slate-200 text-center text-slate-500">8 of 10 Submitted</td>
                    <td className="p-2 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-600 font-semibold">Lab: {report.academic_inputs.lab_marks}/100</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200 font-medium">Weekly Self-Study Hours</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">
                      {report.academic_inputs.study_hours_per_week} hrs/week
                    </td>
                    <td className="p-2 border border-slate-200 text-center text-slate-500">15.0 hrs Baseline</td>
                    <td className="p-2 border border-slate-200 text-center">
                      Backlogs: <strong className={report.academic_inputs.backlog_count > 0 ? 'text-rose-600' : 'text-slate-800'}>{report.academic_inputs.backlog_count}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ML Performance Prediction & Risk Box */}
          <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              2. Machine Learning Predictive Diagnosis
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Predicted Standing</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  {report.prediction.predicted_class}
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">
                  Confidence: {report.prediction.confidence_score}%
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Projected Final CGPA</span>
                <span className="text-lg font-black text-indigo-600 block mt-0.5">
                  {report.prediction.predicted_cgpa.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-500">Scale of 10.0 (FAT Projection)</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Intervention Risk Level</span>
                <span
                  className={`text-lg font-black block mt-0.5 ${
                    report.prediction.risk_level === 'High Risk'
                      ? 'text-rose-600'
                      : report.prediction.risk_level === 'Moderate Risk'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {report.prediction.risk_level}
                </span>
                <span className="text-[11px] text-slate-500">Algorithm: {report.prediction.model_used}</span>
              </div>
            </div>
          </div>

          {/* Prescribed Study Recommendations Summary */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">
              3. Prescribed Academic Remediation Plan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                <span className="font-bold text-amber-900 block mb-1">Key Diagnostic Weak Areas:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  {report.recommendation.weak_areas.slice(0, 3).map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
                <span className="font-bold text-blue-900 block mb-1">Mandatory Student Action Items:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  {report.recommendation.priority_actions.slice(0, 3).map((a: string, i: number) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Faculty Advisor Remarks & Signature Block */}
          <div className="border-t-2 border-slate-200 pt-6 mt-8">
            <div className="mb-8">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Faculty / Proctor Academic Remarks:
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed italic">
                "{report.advisor_notes}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-6 sm:gap-8 text-center text-xs pt-6 sm:pt-8">
              <div className="border-t border-slate-400 pt-2">
                <span className="font-semibold text-slate-800 block">Student Signature</span>
                <span className="text-[10px] text-slate-400">Date: ____________</span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span className="font-semibold text-slate-800 block">Proctor / Faculty Advisor</span>
                <span className="text-[10px] text-slate-400">VIT Bhopal University</span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span className="font-semibold text-slate-800 block">Head of Department (SCSE)</span>
                <span className="text-[10px] text-slate-400">Academic Seal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
