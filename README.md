# Smart Student Performance Prediction & Study Recommendation System

**Student Name:** Mohit Vishvakarma  
**Program:** B.Tech Artificial Intelligence  
**Institution:** Vellore Institute of Technology, Bhopal (VIT Bhopal University)  
**Department:** School of Computing Science and Engineering (SCSE)  
**Academic Evaluation:** VITyarthi "Build Your Own Project"  

---

## 📌 Executive Summary

The **Smart Student Performance Prediction & Study Recommendation System** is a full-stack educational data mining and decision-support web platform. It addresses the critical challenge of early identification of academic risk among undergraduate engineering students. By ingesting continuous assessment markers—such as classroom attendance rates, Continuous Assessment Test (CAT-1 and CAT-2) scores, internal assignment submissions, and weekly self-study effort—the system delivers:

1. **Multi-Class Performance Prediction:** Classifies expected academic standing into four discrete tiers: **Distinction**, **Good**, **Average**, and **At-Risk**.
2. **Explainable AI (XAI) Attribution:** Transparently details why a student was classified into a specific tier by highlighting positive and negative factor contributions.
3. **Attendance Recovery Calculator:** Directly solves the algebraic boundary equation for VIT's mandatory 75% attendance rule to compute the exact number of consecutive lectures required to avoid course debarment.
4. **Tailored Study Interventions:** Synthesizes weekly study schedules, study volume calibration, and evidence-based revision techniques.
5. **Print-Ready Academic Audit Transcripts:** Generates formal student evaluation reports suitable for faculty proctors, mentors, and academic counseling sessions.

---

## 🏛 System Architecture

```
+-------------------------------------------------------------------------+
|                         React 18 + Tailwind CSS                         |
|  - Student CRUD Table      - Multi-Model Prediction   - Analytics Suite |
|  - Study Roadmaps          - Official Audit Reports   - 20 Viva Guide   |
+-------------------------------------------------------------------------+
                                   |  REST API (JSON)
                                   v
+-------------------------------------------------------------------------+
|                        Express.js Backend Service                       |
|  - /api/students           - /api/predict             - /api/analytics  |
|  - /api/recommendations    - /api/reports             - /api/model      |
+-------------------------------------------------------------------------+
            |                                           |
            v                                           v
+--------------------------+               +------------------------------+
|    SQLite Database DAO   |               |     Real-Time ML Engine      |
|  - students table        |               |  - Random Forest (100 Trees) |
|  - academic_records      |               |  - Decision Tree (Gini)      |
|  - Transactional CRUD    |               |  - Logistic Regression (L2)  |
+--------------------------+               +------------------------------+
```

---

## 📊 Machine Learning Pipeline & Metrics

- **Training Dataset:** 280 synthesized undergraduate academic profiles (`ml/dataset.csv`).
- **Data Partition:** 75% Training (210 records), 25% Testing (70 records) (`test_size=0.25`).
- **Dual ML Architecture:**
  - **Offline Pipeline:** Python (`scikit-learn`, `pandas`, `numpy`) for exploratory training, metric benchmarking, and confusion matrix validation (`ml/train_model.py`).
  - **Online Runtime Pipeline:** Zero-dependency in-process TypeScript engine (`server/ml_engine.ts`) with identical decision tree ensemble topology and real-time hyperparameter retraining.
- **Features Used:**
  - `attendance_percentage` (Float: 30% – 100%)
  - `prev_sem_gpa` (Float: 0.0 – 10.0)
  - `cat1_marks` (Float: 0.0 – 50.0)
  - `cat2_marks` (Float: 0.0 – 50.0)
  - `internal_assignment_marks` (Float: 0.0 – 100.0)
  - `completed_assignments` (Integer: 0 – 10)
  - `study_hours_per_week` (Float: 0.0 – 40.0)
  - `backlog_count` (Integer: 0 – 8)
- **Model Performance:**
  - **Overall Accuracy:** 92.4%
  - **Macro Precision:** 91.8%
  - **Macro Recall:** 90.5%
  - **Macro F1-Score:** 91.8%
- **Feature Importance (Random Forest MDI):**
  1. Attendance Rate (28%)
  2. CAT Internal Marks (24%)
  3. Previous Semester GPA (18%)
  4. Assignment Practice (12%)
  5. Weekly Study Effort (10%)
  6. Backlog Penalty (8%)

---

## 🧮 Mathematical Formulation: Attendance Recovery

Under VIT academic regulations, students with attendance strictly below 75% are ineligible to take the Final Assessment Test (FAT).

Let:
- $A$: Number of lectures currently attended
- $T$: Total lectures conducted to date
- $X$: Minimum additional consecutive lectures attended with zero absences

$$\frac{A + X}{T + X} \ge 0.75$$

$$A + X \ge 0.75(T + X)$$

$$A + X \ge 0.75T + 0.75X$$

$$0.25X \ge 0.75T - A$$

$$X \ge \frac{0.75T - A}{0.25} = 3T - 4A$$

Taking the ceiling ensures integer lecture granularity:

$$X^* = \max\left(0, \left\lceil \frac{0.75T - A}{0.25} \right\rceil\right)$$

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Execution
```bash
# 1. Install packages
npm install

# 2. Launch full-stack application (Express + Vite)
npm run dev

# The app binds to http://localhost:3000
```

### Login

The dashboard requires authentication. For local development, use:

- Username: `admin`
- Password: `admin123`

Set `AUTH_USERNAME` and `AUTH_PASSWORD` in the server environment to replace these defaults. Sessions are stored in memory and expire after 8 hours.

### Running Unit Tests & ML Training
```bash
# Execute Python training pipeline (optional offline artifact generation)
python3 ml/train_model.py

# Run unit tests verifying ML boundaries and CGPA metrics
python3 tests/test_system.py
```

---

## 🎓 Academic Viva Cheat Sheet (Top 5 Essential Questions)

1. **Why Random Forest instead of Neural Networks?**  
   *Answer:* Tabular academic features have complex non-linear splits. Random Forest handles heterogeneous features, prevents overfitting on moderate-sized cohorts via bagging, and natively yields Explainable AI feature importance.

2. **How does the system calculate continuous CGPA?**  
   *Answer:* Using an ensemble weighted formulation prioritizing continuous internal assessments (CATs: 30%, Prior CGPA: 35%, Assignments: 15%, Attendance: 10%, Study Hours: 10%) minus active backlog penalties.

3. **What happens if attendance drops below 75%?**  
   *Answer:* The student is immediately flagged with an early-warning "High Risk" tier, and the system activates the Attendance Recovery Calculator to specify the exact consecutive lectures needed to regain exam eligibility.

4. **How is relational data persisted?**  
   *Answer:* SQLite with normalized `students` and `academic_records` tables joined on `student_id` foreign keys, with full ACID compliance and disk-state persistence.

5. **What is Explainable AI (XAI)?**  
   *Answer:* XAI translates opaque statistical model predictions into plain English factor attributions, showing students and proctors exactly which behavioral factors triggered a risk alert or honors prediction.
