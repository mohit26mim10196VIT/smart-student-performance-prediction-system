import React, { useState } from 'react';
import { Student, AcademicRecord, ActiveTab } from '../types.ts';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  BrainCircuit,
  Lightbulb,
  X,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  onAddStudent: (studentData: any) => Promise<boolean>;
  onUpdateStudent: (id: number, studentData: any) => Promise<boolean>;
  onDeleteStudent: (id: number) => Promise<boolean>;
  onSelectStudent: (student: Student) => void;
  selectedStudent: Student | null;
  setActiveTab: (tab: ActiveTab) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onSelectStudent,
  selectedStudent,
  setActiveTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [viewingRecordStudent, setViewingRecordStudent] = useState<Student | null>(null);
  const [studentRecord, setStudentRecord] = useState<AcademicRecord | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    reg_no: '',
    name: '',
    email: '',
    branch: 'CSE (AI & ML)',
    semester: 5,
    section: 'A1',
    // Academic record fields
    attendance_percentage: 82.0,
    prev_sem_gpa: 7.8,
    cat1_marks: 38.0,
    cat2_marks: 39.0,
    internal_assignment_marks: 85.0,
    completed_assignments: 9,
    study_hours_per_week: 16.0,
    backlog_count: 0
  });

  const branches = [
    'CSE (AI & ML)',
    'Computer Science & Engineering',
    'CSE (Cyber Security)',
    'CSE (Cloud Computing)',
    'Electronics & Communication (ECE)'
  ];

  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.reg_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBranch = branchFilter === 'ALL' || s.branch === branchFilter;
    return matchQuery && matchBranch;
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      reg_no: '22BAI' + Math.floor(10000 + Math.random() * 90000).toString().slice(0, 5),
      name: '',
      email: '',
      branch: 'CSE (AI & ML)',
      semester: 5,
      section: 'B1',
      attendance_percentage: 82.0,
      prev_sem_gpa: 7.8,
      cat1_marks: 38.0,
      cat2_marks: 39.0,
      internal_assignment_marks: 85.0,
      completed_assignments: 9,
      study_hours_per_week: 16.0,
      backlog_count: 0
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      reg_no: student.reg_no,
      name: student.name,
      email: student.email,
      branch: student.branch,
      semester: student.semester,
      section: student.section,
      attendance_percentage: 80,
      prev_sem_gpa: 7.5,
      cat1_marks: 35,
      cat2_marks: 35,
      internal_assignment_marks: 80,
      completed_assignments: 8,
      study_hours_per_week: 15,
      backlog_count: 0
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.name.trim()) {
      setFormError('Student Name is required.');
      return;
    }
    if (!formData.reg_no.trim() || formData.reg_no.length < 5) {
      setFormError('Valid VIT Registration Number is required (e.g. 22BAI10042).');
      return;
    }
    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStudent) {
        const success = await onUpdateStudent(editingStudent.id, {
          reg_no: formData.reg_no,
          name: formData.name,
          email: formData.email,
          branch: formData.branch,
          semester: Number(formData.semester),
          section: formData.section
        });
        if (success) {
          setIsAddModalOpen(false);
        }
      } else {
        const success = await onAddStudent({
          reg_no: formData.reg_no,
          name: formData.name,
          email: formData.email,
          branch: formData.branch,
          semester: Number(formData.semester),
          section: formData.section,
          record: {
            attendance_percentage: Number(formData.attendance_percentage),
            prev_sem_gpa: Number(formData.prev_sem_gpa),
            cat1_marks: Number(formData.cat1_marks),
            cat2_marks: Number(formData.cat2_marks),
            internal_assignment_marks: Number(formData.internal_assignment_marks),
            completed_assignments: Number(formData.completed_assignments),
            study_hours_per_week: Number(formData.study_hours_per_week),
            backlog_count: Number(formData.backlog_count)
          }
        });
        if (success) {
          setIsAddModalOpen(false);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsSubmitting(true);
    await onDeleteStudent(deletingStudent.id);
    setDeletingStudent(null);
    setIsSubmitting(false);
  };

  const handleViewRecord = async (student: Student) => {
    setViewingRecordStudent(student);
    setRecordLoading(true);
    try {
      const res = await fetch(`/api/students/${student.id}/record`);
      if (res.ok) {
        const data = await res.json();
        setStudentRecord(data);
      } else {
        setStudentRecord(null);
      }
    } catch (err) {
      setStudentRecord(null);
    } finally {
      setRecordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module 1 Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Module 1 — SQLite Persistence
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Student Academic Records Management</h2>
          <p className="text-xs text-slate-500">
            Create, Read, Update, and Delete student profiles and continuous assessment parameters.
          </p>
        </div>

        <button
          id="add-student-btn"
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="student-search-input"
            type="text"
            placeholder="Search by Registration No, Name, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Branch:</span>
          <select
            id="branch-filter-select"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List View: Responsive Mobile Cards + Desktop Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs px-4">
              No student records match the search filter.
            </div>
          ) : (
            filteredStudents.map((s) => {
              const isSelected = selectedStudent?.id === s.id;
              return (
                <div
                  key={s.id}
                  className={`p-4 space-y-3 transition ${
                    isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {s.reg_no}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Active Context
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{s.name}</h4>
                      <p className="text-[11px] text-slate-500">{s.email}</p>
                    </div>

                    <button
                      id={`mobile-select-student-${s.id}`}
                      onClick={() => onSelectStudent(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold min-h-[36px] transition shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <div>
                      <span className="font-medium text-slate-800">{s.branch}</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span>Sem {s.semester}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[11px] text-slate-700">
                      Sec {s.section}
                    </span>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleViewRecord(s)}
                      className="flex-1 inline-flex items-center justify-center space-x-1 py-2 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg min-h-[40px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Record</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(s)}
                      className="inline-flex items-center justify-center space-x-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg min-h-[40px]"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingStudent(s)}
                      className="inline-flex items-center justify-center space-x-1 py-2 px-3 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg min-h-[40px]"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Reg Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Branch & Semester</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4 text-center">Context</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No student records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedStudent?.id === s.id;
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/70 transition ${
                        isSelected ? 'bg-blue-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <div className="flex items-center space-x-1.5">
                          <span>{s.reg_no}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{s.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{s.branch}</div>
                        <div className="text-[11px] text-slate-500">Semester {s.semester}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                          Sec {s.section}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          id={`select-student-${s.id}`}
                          onClick={() => onSelectStudent(s)}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold transition ${
                            isSelected
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            id={`view-record-${s.id}`}
                            onClick={() => handleViewRecord(s)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                            title="View Academic Record Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            id={`edit-student-${s.id}`}
                            onClick={() => handleOpenEditModal(s)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                            title="Edit Student Info"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-student-${s.id}`}
                            onClick={() => setDeletingStudent(s)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Academic Record Drawer / Modal */}
      {viewingRecordStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 sm:pb-4 sm:mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  SQLite Record Audit
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {viewingRecordStudent.name} ({viewingRecordStudent.reg_no})
                </h3>
              </div>
              <button
                onClick={() => setViewingRecordStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {recordLoading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading continuous assessment record...</div>
            ) : studentRecord ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Attendance</span>
                    <span className={`font-bold text-sm ${studentRecord.attendance_percentage < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {studentRecord.attendance_percentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Previous CGPA</span>
                    <span className="font-bold text-sm text-slate-800">{studentRecord.prev_sem_gpa} / 10.0</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CAT-1 Internal (50)</span>
                    <span className="font-bold text-sm text-slate-800">{studentRecord.cat1_marks}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CAT-2 Internal (50)</span>
                    <span className="font-bold text-sm text-slate-800">{studentRecord.cat2_marks}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assignments (100)</span>
                    <span className="font-bold text-sm text-slate-800">
                      {studentRecord.internal_assignment_marks} ({studentRecord.completed_assignments}/10)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Weekly Study Hours</span>
                    <span className="font-bold text-sm text-slate-800">{studentRecord.study_hours_per_week} hrs/wk</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Backlogs</span>
                    <span className={`font-bold text-sm ${studentRecord.backlog_count > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {studentRecord.backlog_count}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lab Practical (100)</span>
                    <span className="font-bold text-sm text-slate-800">{studentRecord.lab_marks}</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => {
                      onSelectStudent(viewingRecordStudent);
                      setViewingRecordStudent(null);
                      setActiveTab('prediction');
                    }}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Run AI Prediction</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectStudent(viewingRecordStudent);
                      setViewingRecordStudent(null);
                      setActiveTab('recommendations');
                    }}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-400 transition"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>View Study Plan</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                No continuous assessment record logged yet for this student.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl border border-slate-200 my-2 sm:my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 sm:pb-4 sm:mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Student Profile' : 'Register New Student (with Academic Profile)'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registration No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22BAI10042"
                    value={formData.reg_no}
                    onChange={(e) => setFormData({ ...formData, reg_no: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase font-mono focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">VIT Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@vitbhopal.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch / Degree *</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  >
                    {branches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester (1 - 8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Initial Academic Record inputs (Only on Create) */}
              {!editingStudent && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    Initial Academic & Continuous Assessment Inputs
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <label className="text-[10px] text-slate-500 block">Attendance (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={formData.attendance_percentage}
                        onChange={(e) => setFormData({ ...formData, attendance_percentage: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Prior CGPA</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        value={formData.prev_sem_gpa}
                        onChange={(e) => setFormData({ ...formData, prev_sem_gpa: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">CAT 1 (50)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={formData.cat1_marks}
                        onChange={(e) => setFormData({ ...formData, cat1_marks: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">CAT 2 (50)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={formData.cat2_marks}
                        onChange={(e) => setFormData({ ...formData, cat2_marks: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Study Hrs/Wk</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={formData.study_hours_per_week}
                        onChange={(e) => setFormData({ ...formData, study_hours_per_week: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Backlog Count</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.backlog_count}
                        onChange={(e) => setFormData({ ...formData, backlog_count: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Assignments (100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.internal_assignment_marks}
                        onChange={(e) => setFormData({ ...formData, internal_assignment_marks: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Completed (10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.completed_assignments}
                        onChange={(e) => setFormData({ ...formData, completed_assignments: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to SQLite...' : editingStudent ? 'Update Student' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">Confirm Record Deletion</h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              Are you sure you want to delete student <span className="font-bold text-slate-700">{deletingStudent.name}</span> ({deletingStudent.reg_no})?
              All associated academic records and predictions will be permanently removed from SQLite.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
