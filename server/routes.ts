import { Router, Request, Response } from 'express';
import {
  getAllStudents,
  getStudentById,
  getStudentByRegNo,
  createStudent,
  updateStudent,
  deleteStudent,
  getLatestAcademicRecord,
  createAcademicRecord,
  getAllAcademicRecords,
  savePrediction,
  getPredictionsForStudent,
  getAllPredictions,
  resetDatabaseDemo
} from './database.ts';
import { mlEngine, StudentFeatures } from './ml_engine.ts';
import { generateStudyRecommendation } from './recommendation_engine.ts';
import { clearSessionCookie, getAuthenticatedUser, login, logout, requireAuth, setSessionCookie } from './auth.ts';

const router = Router();

// Validation helper
function validateStudentInput(body: any): string | null {
  if (!body.reg_no || typeof body.reg_no !== 'string' || body.reg_no.trim().length < 5) {
    return 'Registration Number is required and must be at least 5 characters (e.g., 22BAI10042).';
  }
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    return 'Student Name is required and must be at least 2 characters.';
  }
  if (!body.email || !body.email.includes('@')) {
    return 'A valid email address is required.';
  }
  if (!body.branch || typeof body.branch !== 'string') {
    return 'Branch / Department is required.';
  }
  if (!body.semester || isNaN(Number(body.semester)) || Number(body.semester) < 1 || Number(body.semester) > 8) {
    return 'Semester must be between 1 and 8.';
  }
  return null;
}

function validateAcademicRecord(body: any): string | null {
  const att = Number(body.attendance_percentage);
  if (isNaN(att) || att < 0 || att > 100) {
    return 'Attendance percentage must be between 0 and 100.';
  }

  const gpa = Number(body.prev_sem_gpa);
  if (isNaN(gpa) || gpa < 0 || gpa > 10) {
    return 'Previous semester GPA must be between 0.0 and 10.0.';
  }

  const cat1 = Number(body.cat1_marks);
  if (isNaN(cat1) || cat1 < 0 || cat1 > 50) {
    return 'CAT-1 marks must be between 0 and 50.';
  }

  const cat2 = Number(body.cat2_marks);
  if (isNaN(cat2) || cat2 < 0 || cat2 > 50) {
    return 'CAT-2 marks must be between 0 and 50.';
  }

  const assign = Number(body.internal_assignment_marks);
  if (isNaN(assign) || assign < 0 || assign > 100) {
    return 'Assignment marks must be between 0 and 100.';
  }

  const compAssign = Number(body.completed_assignments);
  if (isNaN(compAssign) || compAssign < 0 || compAssign > 10) {
    return 'Completed assignments must be between 0 and 10.';
  }

  const hours = Number(body.study_hours_per_week);
  if (isNaN(hours) || hours < 0 || hours > 60) {
    return 'Study hours per week must be between 0 and 60.';
  }

  const backlogs = Number(body.backlog_count);
  if (isNaN(backlogs) || backlogs < 0 || backlogs > 20) {
    return 'Backlog count must be a non-negative number (0 - 20).';
  }

  return null;
}

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Smart Student Performance System', timestamp: new Date().toISOString() });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const token = login(username, password);
  if (!token) return res.status(401).json({ error: 'Invalid username or password' });
  setSessionCookie(res, token);
  res.json({ user: { username } });
});

router.get('/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user });
});

router.post('/auth/logout', (req: Request, res: Response) => {
  logout(req);
  clearSessionCookie(res);
  res.json({ success: true });
});

router.use(requireAuth);

// Module 1: Student CRUD Operations
router.get('/students', async (_req: Request, res: Response) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve students', details: err.message });
  }
});

router.get('/students/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const student = await getStudentById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const record = await getLatestAcademicRecord(id);
    const predictions = await getPredictionsForStudent(id);
    res.json({ student, record, latest_prediction: predictions[0] || null });
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching student', details: err.message });
  }
});

router.post('/students', async (req: Request, res: Response) => {
  try {
    const validationError = validateStudentInput(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Check duplicate reg_no
    const existing = await getStudentByRegNo(req.body.reg_no);
    if (existing) {
      return res.status(409).json({ error: `Registration number ${req.body.reg_no} is already registered.` });
    }

    const newStudent = await createStudent({
      reg_no: req.body.reg_no,
      name: req.body.name,
      email: req.body.email,
      branch: req.body.branch,
      semester: Number(req.body.semester),
      section: req.body.section || 'A'
    });

    // Optionally create initial academic record if provided in request
    if (req.body.record) {
      const recordError = validateAcademicRecord(req.body.record);
      if (!recordError) {
        await createAcademicRecord({
          student_id: newStudent.id,
          semester: newStudent.semester,
          attendance_percentage: Number(req.body.record.attendance_percentage),
          prev_sem_gpa: Number(req.body.record.prev_sem_gpa),
          cat1_marks: Number(req.body.record.cat1_marks),
          cat2_marks: Number(req.body.record.cat2_marks),
          internal_assignment_marks: Number(req.body.record.internal_assignment_marks),
          completed_assignments: Number(req.body.record.completed_assignments),
          study_hours_per_week: Number(req.body.record.study_hours_per_week),
          backlog_count: Number(req.body.record.backlog_count || 0),
          lab_marks: Number(req.body.record.lab_marks || 80),
          quiz_marks: Number(req.body.record.quiz_marks || 15)
        });
      }
    }

    res.status(201).json(newStudent);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create student record', details: err.message });
  }
});

router.put('/students/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await getStudentById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updated = await updateStudent(id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update student', details: err.message });
  }
});

router.delete('/students/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await getStudentById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }
    await deleteStudent(id);
    res.json({ success: true, message: `Student ${existing.name} (${existing.reg_no}) deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete student', details: err.message });
  }
});

// Academic Records
router.get('/students/:id/record', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await getLatestAcademicRecord(id);
    if (!record) {
      return res.status(404).json({ error: 'No academic record found for this student' });
    }
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch academic record', details: err.message });
  }
});

router.post('/students/:id/record', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const student = await getStudentById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const validationError = validateAcademicRecord(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const record = await createAcademicRecord({
      student_id: id,
      semester: Number(req.body.semester || student.semester),
      attendance_percentage: Number(req.body.attendance_percentage),
      prev_sem_gpa: Number(req.body.prev_sem_gpa),
      cat1_marks: Number(req.body.cat1_marks),
      cat2_marks: Number(req.body.cat2_marks),
      internal_assignment_marks: Number(req.body.internal_assignment_marks),
      completed_assignments: Number(req.body.completed_assignments),
      study_hours_per_week: Number(req.body.study_hours_per_week),
      backlog_count: Number(req.body.backlog_count || 0),
      lab_marks: Number(req.body.lab_marks || 80),
      quiz_marks: Number(req.body.quiz_marks || 15)
    });

    res.status(201).json(record);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save academic record', details: err.message });
  }
});

// Module 2: AI/ML Prediction Engine
router.post('/predict', async (req: Request, res: Response) => {
  try {
    let features: StudentFeatures;
    let studentId: number | undefined;

    if (req.body.student_id) {
      studentId = Number(req.body.student_id);
      const student = await getStudentById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      const record = await getLatestAcademicRecord(studentId);
      if (!record && !req.body.features) {
        return res.status(400).json({ error: 'No academic record exists for this student. Please provide academic inputs.' });
      }
      features = req.body.features || {
        attendance_percentage: record!.attendance_percentage,
        prev_sem_gpa: record!.prev_sem_gpa,
        cat1_marks: record!.cat1_marks,
        cat2_marks: record!.cat2_marks,
        internal_assignment_marks: record!.internal_assignment_marks,
        completed_assignments: record!.completed_assignments,
        study_hours_per_week: record!.study_hours_per_week,
        backlog_count: record!.backlog_count,
        lab_marks: record!.lab_marks,
        quiz_marks: record!.quiz_marks
      };
    } else if (req.body.features) {
      features = req.body.features;
    } else {
      return res.status(400).json({ error: 'Missing input features or student_id' });
    }

    const validationError = validateAcademicRecord(features);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const modelToUse = req.body.model || 'Random Forest';
    const prediction = mlEngine.predict(features, modelToUse);
    if (studentId) {
      prediction.student_id = studentId;
      await savePrediction(prediction);
    }

    res.json(prediction);
  } catch (err: any) {
    res.status(500).json({ error: 'Prediction failed', details: err.message });
  }
});

router.get('/predictions', async (_req: Request, res: Response) => {
  try {
    const list = await getAllPredictions();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch predictions', details: err.message });
  }
});

// Module 3: Personalized Study Recommendations
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    let recordData: any = req.body.record;

    if (req.body.student_id && !recordData) {
      const studentId = Number(req.body.student_id);
      const student = await getStudentById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      const record = await getLatestAcademicRecord(studentId);
      if (!record) {
        return res.status(400).json({ error: 'No academic record found for this student.' });
      }
      recordData = record;
    }

    if (!recordData) {
      return res.status(400).json({ error: 'Academic record information is required.' });
    }

    const prediction = req.body.prediction || mlEngine.predict(recordData);
    const recommendations = generateStudyRecommendation(recordData, prediction);

    res.json(recommendations);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate recommendations', details: err.message });
  }
});

// Module 4: Analytics Dashboard
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const students = await getAllStudents();
    const records = await getAllAcademicRecords();
    const predictions = await getAllPredictions();

    // Summary KPIs
    const totalStudents = students.length;
    const avgAttendance = records.length
      ? Number((records.reduce((acc, r) => acc + r.attendance_percentage, 0) / records.length).toFixed(1))
      : 0;
    const avgPrevGpa = records.length
      ? Number((records.reduce((acc, r) => acc + r.prev_sem_gpa, 0) / records.length).toFixed(2))
      : 0;
    const avgStudyHours = records.length
      ? Number((records.reduce((acc, r) => acc + r.study_hours_per_week, 0) / records.length).toFixed(1))
      : 0;

    // Risk breakdown
    const riskCounts = {
      'Low Risk': 0,
      'Moderate Risk': 0,
      'High Risk': 0
    };

    records.forEach((r) => {
      if (r.attendance_percentage < 65 || r.backlog_count >= 2 || (r.cat1_marks + r.cat2_marks) < 45) {
        riskCounts['High Risk']++;
      } else if (r.attendance_percentage < 75 || r.backlog_count === 1 || (r.cat1_marks + r.cat2_marks) < 65) {
        riskCounts['Moderate Risk']++;
      } else {
        riskCounts['Low Risk']++;
      }
    });

    // Correlation data points (Study hours vs CGPA, Attendance vs CAT average)
    const scatterData = records.map((r, i) => {
      const catAvg = (r.cat1_marks + r.cat2_marks) / 2;
      return {
        id: r.student_id,
        index: i + 1,
        attendance: r.attendance_percentage,
        studyHours: r.study_hours_per_week,
        catAverage: Number(catAvg.toFixed(1)),
        prevGpa: r.prev_sem_gpa,
        backlogs: r.backlog_count
      };
    });

    // Grade classification distribution from training dataset
    const dataset = mlEngine.getDataset();
    const classDistribution = {
      Distinction: dataset.filter((s) => s.grade_class === 'Distinction').length,
      Good: dataset.filter((s) => s.grade_class === 'Good').length,
      Average: dataset.filter((s) => s.grade_class === 'Average').length,
      'At-Risk': dataset.filter((s) => s.grade_class === 'At-Risk').length
    };

    res.json({
      summary: {
        totalStudents,
        avgAttendance,
        avgPrevGpa,
        avgStudyHours,
        activeBacklogStudents: records.filter((r) => r.backlog_count > 0).length,
        atRiskStudents: riskCounts['High Risk']
      },
      riskCounts,
      classDistribution,
      scatterData,
      records
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compile analytics', details: err.message });
  }
});

// Machine Learning Inspector & Model Management (supports both /model/* and /ml/* aliases)
const handleGetMetrics = (_req: Request, res: Response) => {
  try {
    const metrics = mlEngine.getMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load ML metrics', details: err.message });
  }
};

const handleRetrain = (req: Request, res: Response) => {
  try {
    const algorithm = req.body.algorithm || 'Random Forest';
    const testSplit = Number(req.body.test_split || 0.25);
    const updatedMetrics = mlEngine.trainModel(algorithm, testSplit);
    res.json({
      message: `Model successfully retrained using ${algorithm} with ${(testSplit * 100).toFixed(0)}% test split.`,
      metrics: updatedMetrics
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Model retraining failed', details: err.message });
  }
};

router.get('/ml/metrics', handleGetMetrics);
router.get('/model/metrics', handleGetMetrics);
router.post('/ml/retrain', handleRetrain);
router.post('/model/retrain', handleRetrain);

// Module 5: Comprehensive Report Generation
router.get('/reports/:studentId', async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const student = await getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const record = await getLatestAcademicRecord(studentId);
    if (!record) {
      return res.status(400).json({ error: 'No academic record found for this student.' });
    }

    const prediction = mlEngine.predict(record);
    const recommendation = generateStudyRecommendation(record, prediction);

    const report = {
      report_id: `VIT-AUDIT-${student.reg_no}-${Date.now().toString().slice(-4)}`,
      institution: 'Vellore Institute of Technology (VIT Bhopal)',
      department: 'School of Computing Science and Engineering (SCSE)',
      evaluation_type: 'VITyarthi Academic Early-Warning & Performance Evaluation',
      generated_at: new Date().toISOString(),
      student,
      academic_inputs: record,
      prediction,
      recommendation,
      academic_dimensions: [
        { metric: 'Attendance', score: record.attendance_percentage, fullMark: 100 },
        { metric: 'Prior GPA', score: Number((record.prev_sem_gpa * 10).toFixed(1)), fullMark: 100 },
        { metric: 'CAT Exams', score: Number((((record.cat1_marks + record.cat2_marks) / 100) * 100).toFixed(1)), fullMark: 100 },
        { metric: 'Assignments', score: record.internal_assignment_marks, fullMark: 100 },
        { metric: 'Lab Practical', score: record.lab_marks, fullMark: 100 },
        { metric: 'Study Effort', score: Math.min(100, Math.round((record.study_hours_per_week / 25) * 100)), fullMark: 100 }
      ],
      advisor_notes: prediction.risk_level === 'High Risk'
        ? 'Urgent academic intervention required. Student should meet Proctored Academic Counselor immediately.'
        : prediction.risk_level === 'Moderate Risk'
        ? 'Active monitoring recommended. Focus on attendance retention and CAT performance boost.'
        : 'Student shows strong academic trajectory. Recommended for advanced technical electives and research.'
    };

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate student report', details: err.message });
  }
});

// Reset Demo Data
router.post('/reset-demo', async (_req: Request, res: Response) => {
  try {
    await resetDatabaseDemo();
    mlEngine.trainModel('Random Forest', 0.25);
    res.json({ message: 'Database reset to initial VIT cohort sample records successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Reset failed', details: err.message });
  }
});

export default router;
