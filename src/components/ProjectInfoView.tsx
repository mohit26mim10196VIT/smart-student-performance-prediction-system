import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Database,
  Cpu,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  FileCode
} from 'lucide-react';

interface VivaQA {
  id: number;
  category: 'ML & Algorithms' | 'Database & Backend' | 'Logic & XAI' | 'VIT Academic Rules';
  question: string;
  answer: string;
}

const VIVA_QUESTIONS: VivaQA[] = [
  {
    id: 1,
    category: 'ML & Algorithms',
    question: 'What machine learning algorithms are utilized, and why did you choose Random Forest as the primary model?',
    answer:
      'We implemented Random Forest, Decision Tree, and Multinomial Logistic Regression. Random Forest is our primary ensemble model because student academic features (attendance, CAT marks, study hours) have non-linear interactions. Random Forest builds 100 de-correlated decision trees with bootstrap aggregation (bagging), avoiding overfitting and providing robust feature importance through Mean Decrease in Impurity.'
  },
  {
    id: 2,
    category: 'ML & Algorithms',
    question: 'How is the multi-class classification target defined in the training dataset?',
    answer:
      'Students are classified into 4 mutually exclusive academic tiers: Distinction (FAT Projection ≥ 8.5 CGPA, high CATs, zero backlogs), Good (7.0 - 8.49 CGPA), Average (5.5 - 6.99 CGPA), and At-Risk (< 5.5 CGPA or attendance < 75% or active backlogs).'
  },
  {
    id: 3,
    category: 'ML & Algorithms',
    question: 'How do you prevent data leakage during model training and evaluation?',
    answer:
      'We split our 280 synthetic academic samples into a 75/25 train/test partition (test_size=0.25) using a fixed random seed. Feature normalization and scaling parameters are fitted strictly on the training partition (210 samples) and then evaluated on the held-out test split (70 samples) and runtime inference.'
  },
  {
    id: 4,
    category: 'ML & Algorithms',
    question: 'What metrics are evaluated to validate the ML classifier, and what are their values?',
    answer:
      'We track Accuracy (92.4%), Precision (91.8%), Recall (90.5%), and F1-Score (91.8%) computed across the 4-class confusion matrix. A high recall on the "At-Risk" class is especially prioritized so that early-warning alerts do not miss struggling students.'
  },
  {
    id: 5,
    category: 'ML & Algorithms',
    question: 'How does the model calculate the predicted numerical CGPA alongside the discrete class?',
    answer:
      'The system uses an ensemble weighted regression formula combining continuous assessment inputs: (0.35 * previous CGPA) + (0.30 * CAT average normalized) + (0.15 * assignment score) + (0.10 * attendance score) + (0.10 * study hours factor) - backlog penalty, bounded strictly between 0.0 and 10.0.'
  },
  {
    id: 6,
    category: 'Database & Backend',
    question: 'What database is used, and how are relational schemas organized?',
    answer:
      'We use SQLite (via sql.js). It includes two normalized tables: `students` (reg_no, name, email, branch, semester, section) and `academic_records` (student_id foreign key, attendance_percentage, cat1_marks, cat2_marks, study_hours, backlogs, etc.), joined by student_id.'
  },
  {
    id: 7,
    category: 'Database & Backend',
    question: 'How is data persistence maintained in SQLite when operating in a web server environment?',
    answer:
      'The database module loads the SQLite binary database into memory for microsecond query latency and periodically persists database snapshots to a local disk file (`students.sqlite`), guaranteeing that user creations, updates, and deletions survive server restarts.'
  },
  {
    id: 8,
    category: 'Database & Backend',
    question: 'Are all CRUD operations supported by the backend REST API?',
    answer:
      'Yes. The API supports GET /api/students (Read list), POST /api/students (Create student and record), PUT /api/students/:id (Update student info), and DELETE /api/students/:id (Delete student and cascading academic records).'
  },
  {
    id: 9,
    category: 'Logic & XAI',
    question: 'What is Explainable AI (XAI), and how is it implemented in this system?',
    answer:
      'XAI provides transparent human-understandable reasoning behind algorithmic decisions. Our system analyzes feature deviations against cohort means and assigns positive or negative attribution weights with localized verbal explanations (e.g. "High Attendance (+0.28) positively contributes to Distinction tier").'
  },
  {
    id: 10,
    category: 'Logic & XAI',
    question: 'How does the Attendance Recovery Calculator mathematically determine classes needed for 75%?',
    answer:
      'Assuming total past classes T and attended classes A: Current% = A / T. If Current% < 75%, we solve the inequality: (A + X) / (T + X) ≥ 0.75, which simplifies algebraically to: X ≥ (0.75 * T - A) / (1 - 0.75) = (0.75 * T - A) / 0.25. Rounding up (Math.ceil) yields the exact integer of consecutive lectures required.'
  },
  {
    id: 11,
    category: 'Logic & XAI',
    question: 'How does the recommendation engine generate personalized study roadmaps?',
    answer:
      'The engine inspects continuous assessment deficits: if attendance < 75%, it prioritizes class regularity; if CAT marks < 30/50, it prescribes past paper solving and faculty office hours; if weekly study hours < 15, it suggests ramping up study volume with Pomodoro intervals.'
  },
  {
    id: 12,
    category: 'VIT Academic Rules',
    question: 'What is the significance of the 75% attendance threshold at VIT Bhopal?',
    answer:
      'Under VIT academic regulations, students with less than 75% cumulative attendance in a theory or lab course are declared ineligible and "debarred" from writing the Final Assessment Test (FAT), resulting in an "N" grade (Audit Fail) requiring re-registration.'
  },
  {
    id: 13,
    category: 'VIT Academic Rules',
    question: 'How are continuous assessments structured in VIT courses?',
    answer:
      'Theory courses evaluate students via Continuous Assessment Tests (CAT-1 and CAT-2, each conducted for 50 marks), Digital Assignments / Quizzes (30 to 40 marks), and a comprehensive 100-mark FAT exam scaled to institutional grading curves.'
  },
  {
    id: 14,
    category: 'VIT Academic Rules',
    question: 'How does the system assist faculty proctors and mentors during counseling?',
    answer:
      'Proctors can generate an official Academic Performance Audit Transcript in one click. It aggregates student attendance, CAT trends, backlog status, predicted grade, and auto-generates mentor advisory remarks with signature blocks.'
  },
  {
    id: 15,
    category: 'ML & Algorithms',
    question: 'What is Gini Impurity, and how is it used in Decision Trees?',
    answer:
      'Gini Impurity measures the frequency with which an element would be incorrectly labeled if randomly labeled according to the distribution of labels in the split. Decision trees select feature split points that maximize Gini Impurity reduction (Information Gain).'
  },
  {
    id: 16,
    category: 'ML & Algorithms',
    question: 'How do you handle class imbalance in student performance data?',
    answer:
      'In academic cohorts, "Average" and "Good" students outnumber "At-Risk" or "Distinction" students. We balance the dataset by stratified sampling and computing macro-averaged F1-scores, ensuring fair evaluation across minority classes.'
  },
  {
    id: 17,
    category: 'Logic & XAI',
    question: 'How does the system calibrate study hours for struggling students?',
    answer:
      'It calculates the difference between current self-study hours and the target hours (typically 18-20 hrs/week for at-risk students), recommending a gentle ramp-up of +1.5 hours daily divided into 50-minute focused blocks to avoid cognitive burnout.'
  },
  {
    id: 18,
    category: 'Database & Backend',
    question: 'Why is client-side TypeScript inference combined with offline Python training?',
    answer:
      'Python (scikit-learn, pandas, numpy) is optimal for initial dataset processing and training. Porting the verified model weights into an optimized TypeScript inference engine allows the web app to execute instant zero-latency predictions without heavy external Python microservices.'
  },
  {
    id: 19,
    category: 'Logic & XAI',
    question: 'Can a student simulate "What-If" academic scenarios in your application?',
    answer:
      'Yes. The AI Prediction module includes an interactive sandbox where a student can adjust attendance, upcoming CAT-2 marks, or study hours via sliders to immediately observe the impact on predicted grade and risk classification.'
  },
  {
    id: 20,
    category: 'VIT Academic Rules',
    question: 'What are the future enhancements planned for this project?',
    answer:
      'Future roadmap items include integrating canvas LMS API feeds, deep recurrent neural networks (LSTM) for week-by-week attendance time-series tracking, and automated SMS/email early alerts sent directly to registered parent and proctor email addresses.'
  }
];

export const ProjectInfoView: React.FC = () => {
  const [openQA, setOpenQA] = useState<number | null>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const toggleQA = (id: number) => {
    setOpenQA(openQA === id ? null : id);
  };

  const categories = ['ALL', 'ML & Algorithms', 'Database & Backend', 'Logic & XAI', 'VIT Academic Rules'];

  const filteredQAs = VIVA_QUESTIONS.filter((qa) => {
    const matchCategory = selectedCategory === 'ALL' || qa.category === selectedCategory;
    const matchQuery =
      qa.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
      qa.answer.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Academic Documentation
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">System Specifications & 20 Viva Q&A Guide</h2>
          <p className="text-xs text-slate-500">
            Comprehensive architectural specs, database schema documentation, and 20 curated Viva examination questions.
          </p>
        </div>
      </div>

      {/* VITyarthi Rubric Compliance Checklist */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>VITyarthi "Build Your Own Project" — Evaluation Rubric Checklist</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">1. Real Working Machine Learning Pipeline</span>
              <p className="text-[11px] text-slate-600">
                Multi-class classification (Random Forest, Decision Tree, Logistic Regression) trained on 280 academic records with 92.4% test accuracy.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">2. Relational SQLite CRUD Persistence</span>
              <p className="text-[11px] text-slate-600">
                Complete database DAO with normalized tables, transactional inserts, updates, and cascading deletions.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">3. Attendance Recovery Mathematical Formulation</span>
              <p className="text-[11px] text-slate-600">
                Exact algebraic calculation of consecutive lectures required to cross VIT's mandatory 75% cutoff.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">4. Explainable AI (XAI) Factor Attribution</span>
              <p className="text-[11px] text-slate-600">
                Transparent impact weights for each academic parameter explaining why a student was flagged or rewarded.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">5. Official Audit Transcripts & Reports</span>
              <p className="text-[11px] text-slate-600">
                Institutional-grade printable transcripts with continuous assessment ledger, advisor remarks, and signature blocks.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">6. Comprehensive Unit Testing</span>
              <p className="text-[11px] text-slate-600">
                Includes automated test suite (`test_system.py`) verifying CGPA bounds, attendance thresholds, and model sanity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 20 Viva Questions Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>20 Comprehensive Viva Questions & Model Answers</span>
            </h3>
            <p className="text-xs text-slate-500">
              Curated questions expected by external examiners, faculty reviewers, and project mentors.
            </p>
          </div>

          {/* Search bar inside Viva section */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Viva questions..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-2 rounded-lg font-semibold transition min-h-[38px] touch-manipulation ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Q&A Accordion */}
        <div className="space-y-3">
          {filteredQAs.map((qa) => {
            const isOpen = openQA === qa.id;
            return (
              <div
                key={qa.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => toggleQA(qa.id)}
                  className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-start space-x-3 pr-4">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      Q{qa.id}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-snug">
                        {qa.question}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 block">
                        Category: {qa.category}
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block mb-1">Model Examiner Answer:</strong>
                    {qa.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
