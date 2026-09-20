import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { Student, AcademicRecord, PredictionResult, StudyRecommendation } from './types.ts';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vityarthi_academic.sqlite');

let dbInstance: Database | null = null;

// Initialize SQLite Database with tables and seed data
export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      initTables(dbInstance);
      return dbInstance;
    } catch (err) {
      console.warn('Failed to load existing database file, creating fresh one:', err);
    }
  }

  dbInstance = new SQL.Database();
  initTables(dbInstance);
  seedInitialData(dbInstance);
  persistDatabase();
  return dbInstance;
}

export function persistDatabase() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

function initTables(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reg_no TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      branch TEXT NOT NULL,
      semester INTEGER NOT NULL,
      section TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS academic_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      semester INTEGER NOT NULL,
      attendance_percentage REAL NOT NULL,
      prev_sem_gpa REAL NOT NULL,
      cat1_marks REAL NOT NULL,
      cat2_marks REAL NOT NULL,
      internal_assignment_marks REAL NOT NULL,
      completed_assignments INTEGER NOT NULL,
      study_hours_per_week REAL NOT NULL,
      backlog_count INTEGER NOT NULL DEFAULT 0,
      lab_marks REAL NOT NULL DEFAULT 80,
      quiz_marks REAL NOT NULL DEFAULT 16,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      model_used TEXT NOT NULL,
      predicted_class TEXT NOT NULL,
      predicted_cgpa REAL NOT NULL,
      risk_level TEXT NOT NULL,
      confidence_score REAL NOT NULL,
      class_probabilities TEXT NOT NULL,
      factor_explanations TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      attendance_status TEXT NOT NULL,
      weak_areas TEXT NOT NULL,
      priority_actions TEXT NOT NULL,
      study_hour_recommendation TEXT NOT NULL,
      learning_techniques TEXT NOT NULL,
      weekly_schedule_suggestion TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE SET NULL
    );
  `);
}

function seedInitialData(db: Database) {
  const seedStudents = [
    {
      reg_no: '22BAI10042',
      name: 'Aarav Sharma',
      email: 'aarav.sharma2022@vitbhopal.ac.in',
      branch: 'CSE (AI & ML)',
      semester: 5,
      section: 'B1',
      record: {
        attendance_percentage: 92.5,
        prev_sem_gpa: 9.15,
        cat1_marks: 46.5,
        cat2_marks: 47.0,
        internal_assignment_marks: 95.0,
        completed_assignments: 10,
        study_hours_per_week: 24.0,
        backlog_count: 0,
        lab_marks: 96.0,
        quiz_marks: 19.0,
      }
    },
    {
      reg_no: '22BCE10198',
      name: 'Pooja Verma',
      email: 'pooja.verma2022@vitbhopal.ac.in',
      branch: 'Computer Science & Engineering',
      semester: 5,
      section: 'A2',
      record: {
        attendance_percentage: 84.0,
        prev_sem_gpa: 7.85,
        cat1_marks: 38.0,
        cat2_marks: 39.5,
        internal_assignment_marks: 82.0,
        completed_assignments: 9,
        study_hours_per_week: 16.5,
        backlog_count: 0,
        lab_marks: 85.0,
        quiz_marks: 16.0,
      }
    },
    {
      reg_no: '22BCY10074',
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh2022@vitbhopal.ac.in',
      branch: 'CSE (Cyber Security)',
      semester: 5,
      section: 'C1',
      record: {
        attendance_percentage: 68.0,
        prev_sem_gpa: 5.95,
        cat1_marks: 24.0,
        cat2_marks: 27.5,
        internal_assignment_marks: 64.0,
        completed_assignments: 6,
        study_hours_per_week: 9.0,
        backlog_count: 1,
        lab_marks: 68.0,
        quiz_marks: 11.5,
      }
    },
    {
      reg_no: '23BAI10311',
      name: 'Sneha Patel',
      email: 'sneha.patel2023@vitbhopal.ac.in',
      branch: 'CSE (AI & ML)',
      semester: 3,
      section: 'A1',
      record: {
        attendance_percentage: 58.5,
        prev_sem_gpa: 5.10,
        cat1_marks: 19.0,
        cat2_marks: 21.0,
        internal_assignment_marks: 52.0,
        completed_assignments: 4,
        study_hours_per_week: 6.0,
        backlog_count: 2,
        lab_marks: 59.0,
        quiz_marks: 8.5,
      }
    },
    {
      reg_no: '23BCE11025',
      name: 'Vikramaditya Nair',
      email: 'vikram.nair2023@vitbhopal.ac.in',
      branch: 'Computer Science & Engineering',
      semester: 3,
      section: 'B2',
      record: {
        attendance_percentage: 88.0,
        prev_sem_gpa: 8.40,
        cat1_marks: 41.0,
        cat2_marks: 42.5,
        internal_assignment_marks: 88.0,
        completed_assignments: 10,
        study_hours_per_week: 19.0,
        backlog_count: 0,
        lab_marks: 90.0,
        quiz_marks: 17.5,
      }
    },
    {
      reg_no: '22BAI10189',
      name: 'Ananya Iyer',
      email: 'ananya.iyer2022@vitbhopal.ac.in',
      branch: 'CSE (AI & ML)',
      semester: 5,
      section: 'B3',
      record: {
        attendance_percentage: 76.5,
        prev_sem_gpa: 6.80,
        cat1_marks: 32.0,
        cat2_marks: 33.0,
        internal_assignment_marks: 74.0,
        completed_assignments: 8,
        study_hours_per_week: 12.0,
        backlog_count: 0,
        lab_marks: 75.0,
        quiz_marks: 14.0,
      }
    }
  ];

  for (const s of seedStudents) {
    db.run(
      `INSERT INTO students (reg_no, name, email, branch, semester, section) VALUES (?, ?, ?, ?, ?, ?)`,
      [s.reg_no, s.name, s.email, s.branch, s.semester, s.section]
    );

    // get inserted student id
    const res = db.exec(`SELECT last_insert_rowid() as id`);
    const studentId = res[0].values[0][0] as number;

    const r = s.record;
    db.run(
      `INSERT INTO academic_records (
        student_id, semester, attendance_percentage, prev_sem_gpa,
        cat1_marks, cat2_marks, internal_assignment_marks, completed_assignments,
        study_hours_per_week, backlog_count, lab_marks, quiz_marks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId, s.semester, r.attendance_percentage, r.prev_sem_gpa,
        r.cat1_marks, r.cat2_marks, r.internal_assignment_marks, r.completed_assignments,
        r.study_hours_per_week, r.backlog_count, r.lab_marks, r.quiz_marks
      ]
    );
  }
}

// DAO Methods

export async function getAllStudents(): Promise<Student[]> {
  const db = await getDatabase();
  const res = db.exec('SELECT * FROM students ORDER BY id DESC');
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as Student;
  });
}

export async function getStudentById(id: number): Promise<Student | null> {
  const db = await getDatabase();
  const stmt = db.prepare('SELECT * FROM students WHERE id = ?');
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as unknown as Student;
  }
  stmt.free();
  return null;
}

export async function getStudentByRegNo(regNo: string): Promise<Student | null> {
  const db = await getDatabase();
  const stmt = db.prepare('SELECT * FROM students WHERE UPPER(reg_no) = UPPER(?)');
  stmt.bind([regNo]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as unknown as Student;
  }
  stmt.free();
  return null;
}

export async function createStudent(student: Omit<Student, 'id' | 'created_at'>): Promise<Student> {
  const db = await getDatabase();
  const regNo = student.reg_no.trim().toUpperCase();
  const name = student.name.trim();
  const email = student.email.trim();

  db.run(
    `INSERT INTO students (reg_no, name, email, branch, semester, section) VALUES (?, ?, ?, ?, ?, ?)`,
    [regNo, name, email, student.branch, student.semester, student.section]
  );
  persistDatabase();

  const created = await getStudentByRegNo(regNo);
  if (!created) {
    const fallback = db.exec('SELECT * FROM students WHERE reg_no = ? ORDER BY id DESC LIMIT 1', [regNo]);
    const row = fallback?.[0]?.values?.[0];
    if (row) {
      const columns = fallback[0].columns;
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj as Student;
    }
    throw new Error('Student record was not found immediately after insertion.');
  }

  return created;
}

export async function updateStudent(id: number, student: Partial<Student>): Promise<Student | null> {
  const db = await getDatabase();
  const existing = await getStudentById(id);
  if (!existing) return null;

  const reg_no = student.reg_no !== undefined ? student.reg_no.trim().toUpperCase() : existing.reg_no;
  const name = student.name !== undefined ? student.name.trim() : existing.name;
  const email = student.email !== undefined ? student.email.trim() : existing.email;
  const branch = student.branch !== undefined ? student.branch : existing.branch;
  const semester = student.semester !== undefined ? student.semester : existing.semester;
  const section = student.section !== undefined ? student.section : existing.section;

  db.run(
    `UPDATE students SET reg_no = ?, name = ?, email = ?, branch = ?, semester = ?, section = ? WHERE id = ?`,
    [reg_no, name, email, branch, semester, section, id]
  );
  persistDatabase();
  return await getStudentById(id);
}

export async function deleteStudent(id: number): Promise<boolean> {
  const db = await getDatabase();
  db.run('DELETE FROM recommendations WHERE student_id = ?', [id]);
  db.run('DELETE FROM predictions WHERE student_id = ?', [id]);
  db.run('DELETE FROM academic_records WHERE student_id = ?', [id]);
  db.run('DELETE FROM students WHERE id = ?', [id]);
  persistDatabase();
  return true;
}

export async function getLatestAcademicRecord(studentId: number): Promise<AcademicRecord | null> {
  const db = await getDatabase();
  const stmt = db.prepare('SELECT * FROM academic_records WHERE student_id = ? ORDER BY id DESC LIMIT 1');
  stmt.bind([studentId]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as unknown as AcademicRecord;
  }
  stmt.free();
  return null;
}

export async function getAllAcademicRecords(): Promise<AcademicRecord[]> {
  const db = await getDatabase();
  const res = db.exec('SELECT * FROM academic_records ORDER BY id DESC');
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as AcademicRecord;
  });
}

export async function createAcademicRecord(record: Omit<AcademicRecord, 'id' | 'recorded_at'>): Promise<AcademicRecord> {
  const db = await getDatabase();
  db.run(
    `INSERT INTO academic_records (
      student_id, semester, attendance_percentage, prev_sem_gpa,
      cat1_marks, cat2_marks, internal_assignment_marks, completed_assignments,
      study_hours_per_week, backlog_count, lab_marks, quiz_marks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.student_id, record.semester, record.attendance_percentage, record.prev_sem_gpa,
      record.cat1_marks, record.cat2_marks, record.internal_assignment_marks, record.completed_assignments,
      record.study_hours_per_week, record.backlog_count, record.lab_marks, record.quiz_marks
    ]
  );
  persistDatabase();

  const stmt = db.prepare(
    'SELECT * FROM academic_records WHERE student_id = ? AND semester = ? ORDER BY id DESC LIMIT 1'
  );
  stmt.bind([record.student_id, record.semester]);
  if (stmt.step()) {
    const created = stmt.getAsObject();
    stmt.free();
    return created as unknown as AcademicRecord;
  }
  stmt.free();

  throw new Error('Academic record was not found immediately after insertion.');
}

export async function savePrediction(pred: PredictionResult): Promise<number> {
  const db = await getDatabase();
  db.run(
    `INSERT INTO predictions (
      student_id, model_used, predicted_class, predicted_cgpa, risk_level,
      confidence_score, class_probabilities, factor_explanations
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pred.student_id || null,
      pred.model_used,
      pred.predicted_class,
      pred.predicted_cgpa,
      pred.risk_level,
      pred.confidence_score,
      JSON.stringify(pred.class_probabilities),
      JSON.stringify(pred.factor_explanations)
    ]
  );
  persistDatabase();
  const res = db.exec('SELECT last_insert_rowid() as id');
  return res[0].values[0][0] as number;
}

export async function getPredictionsForStudent(studentId: number): Promise<PredictionResult[]> {
  const db = await getDatabase();
  const stmt = db.prepare('SELECT * FROM predictions WHERE student_id = ? ORDER BY id DESC');
  stmt.bind([studentId]);
  const results: PredictionResult[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id as number,
      student_id: row.student_id as number,
      model_used: row.model_used as string,
      predicted_class: row.predicted_class as any,
      predicted_cgpa: row.predicted_cgpa as number,
      risk_level: row.risk_level as any,
      confidence_score: row.confidence_score as number,
      class_probabilities: JSON.parse(row.class_probabilities as string),
      factor_explanations: JSON.parse(row.factor_explanations as string),
      created_at: row.created_at as string,
    });
  }
  stmt.free();
  return results;
}

export async function getAllPredictions(): Promise<PredictionResult[]> {
  const db = await getDatabase();
  const res = db.exec('SELECT * FROM predictions ORDER BY id DESC');
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return {
      id: obj.id,
      student_id: obj.student_id,
      model_used: obj.model_used,
      predicted_class: obj.predicted_class,
      predicted_cgpa: obj.predicted_cgpa,
      risk_level: obj.risk_level,
      confidence_score: obj.confidence_score,
      class_probabilities: JSON.parse(obj.class_probabilities || '{}'),
      factor_explanations: JSON.parse(obj.factor_explanations || '[]'),
      created_at: obj.created_at
    };
  });
}

export async function resetDatabaseDemo(): Promise<void> {
  if (fs.existsSync(DB_FILE)) {
    try {
      fs.unlinkSync(DB_FILE);
    } catch (_) {}
  }
  dbInstance = null;
  await getDatabase();
}
