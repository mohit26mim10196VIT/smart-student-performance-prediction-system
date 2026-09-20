# Academic Project Statement & Specification

## Project Title
**Smart Student Performance Prediction & Study Recommendation System**

## Academic Information
- **Student Name:** Mohit Vishvakarma
- **Program:** B.Tech Artificial Intelligence
- **Institution:** Vellore Institute of Technology, Bhopal (VIT Bhopal University)
- **School:** School of Computing Science and Engineering (SCSE)
- **Coursework:** VITyarthi "Build Your Own Project" Evaluation

---

## 1. Problem Statement
In higher technical education institutions such as VIT Bhopal, academic performance is evaluated through continuous assessment tests (CAT-1, CAT-2), digital assignments, laboratory coursework, and strict attendance minimums (75% mandatory threshold). Frequently, students at academic risk are only recognized post-semester or immediately before Final Assessment Tests (FAT), leaving insufficient time for corrective pedagogical interventions. 

Existing academic portals typically serve as passive grade repositories rather than proactive decision-support systems. Students lack personalized visibility into how their current attendance deficits, study habits, and continuous assessment trajectories influence their final grade outcomes.

---

## 2. Project Objectives
1. **Develop an Early Warning System:** Formulate a machine learning classification engine to categorize student performance into four tiers (*Distinction*, *Good*, *Average*, *At-Risk*) well in advance of semester finals.
2. **Provide Explainable AI (XAI) Factor Attribution:** Eliminate "black-box" predictions by presenting transparent factor contributions that highlight positive drivers and negative risk factors.
3. **Automate Attendance Recovery Computation:** Implement a mathematical model calculating the exact number of consecutive classes required to satisfy VIT's mandatory 75% attendance policy.
4. **Synthesize Actionable Remediation Roadmaps:** Generate individualized weekly timetables, study hours calibrations, and evidence-based learning strategies (Feynman technique, Pomodoro, Spaced Repetition).
5. **Establish Relational Persistence & Formal Audit Reporting:** Maintain student academic records in a normalized SQLite database supporting full CRUD operations and exportable institutional audit transcripts.

---

## 3. Scope and Delimitation
- **Scope:** Ingests attendance, prior GPA, continuous internal assessment marks, assignments, study volume, and backlog counts for undergraduate engineering students.
- **Delimitation:** Intended strictly as an academic decision-support aid. The system's predictions and recommendations are advisory and designed to assist faculty proctors and students, without replacing formal institutional grading policies.

---

## 4. Methodology
1. **Data Synthesis & Preprocessing:** Generation and normalization of representative cohort data capturing realistic engineering assessment distributions.
2. **Supervised Learning Pipeline:** Training of Random Forest, Decision Tree, and Logistic Regression models evaluated with accuracy, precision, recall, and F1 metrics.
3. **Explainable AI Layer:** Evaluation of feature importance rankings and individualized factor weight attributions.
4. **Intervention Architecture:** Algorithmic translation of performance deficits into concrete attendance goals and study schedules.
5. **Full-Stack Implementation:** Production-ready web interface built with React 18, Tailwind CSS, Recharts, Express.js, and SQLite.
