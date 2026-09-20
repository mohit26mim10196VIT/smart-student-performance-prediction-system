"""
VITyarthi Academic Project - Python Flask Backend
Author: B.Tech AI Student, VIT Bhopal
Description: REST API for Student Academic Performance Prediction and Study Recommendation.
"""

from flask import Flask, request, jsonify
import sqlite3
import os

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'academic.db')

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reg_no TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            branch TEXT NOT NULL,
            semester INTEGER NOT NULL,
            section TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS academic_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            attendance_percentage REAL NOT NULL,
            prev_sem_gpa REAL NOT NULL,
            cat1_marks REAL NOT NULL,
            cat2_marks REAL NOT NULL,
            internal_assignment_marks REAL NOT NULL,
            study_hours_per_week REAL NOT NULL,
            backlog_count INTEGER DEFAULT 0,
            FOREIGN KEY(student_id) REFERENCES students(id)
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "VIT Student Performance System (Python API)"})

@app.route('/api/students', methods=['GET'])
def list_students():
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM students').fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}
    attendance = float(data.get('attendance_percentage', 75))
    prev_gpa = float(data.get('prev_sem_gpa', 7.0))
    cat1 = float(data.get('cat1_marks', 35))
    cat2 = float(data.get('cat2_marks', 35))
    study_hours = float(data.get('study_hours_per_week', 15))
    backlogs = int(data.get('backlog_count', 0))

    cat_total = cat1 + cat2
    composite = 0.25 * (prev_gpa * 10) + 0.22 * cat_total + 0.18 * attendance + 0.15 * min(100, (study_hours / 25) * 100) - (backlogs * 7.5)

    if composite >= 82:
        grade = 'Distinction'
        risk = 'Low Risk'
        cgpa = min(9.9, round(8.5 + (composite - 82) * 0.08, 2))
    elif composite >= 68:
        grade = 'Good'
        risk = 'Low Risk'
        cgpa = round(7.0 + (composite - 68) * 0.10, 2)
    elif composite >= 52:
        grade = 'Average'
        risk = 'Moderate Risk'
        cgpa = round(5.5 + (composite - 52) * 0.09, 2)
    else:
        grade = 'At-Risk'
        risk = 'High Risk'
        cgpa = max(3.0, round(3.5 + (composite / 52) * 1.9, 2))

    return jsonify({
        "predicted_grade": grade,
        "predicted_cgpa": cgpa,
        "risk_classification": risk,
        "composite_score": round(composite, 1)
    })

if __name__ == '__main__':
    init_db()
    print("Starting Flask API on port 5000...")
    app.run(port=5000, debug=True)
