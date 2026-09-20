export interface Student {
  id: number;
  reg_no: string;
  name: string;
  email: string;
  branch: string;
  semester: number;
  section: string;
  created_at: string;
}

export interface AcademicRecord {
  id: number;
  student_id: number;
  semester: number;
  attendance_percentage: number;
  prev_sem_gpa: number;
  cat1_marks: number;          // out of 50
  cat2_marks: number;          // out of 50
  internal_assignment_marks: number; // out of 100
  completed_assignments: number;     // out of 10
  study_hours_per_week: number;
  backlog_count: number;
  lab_marks: number;
  quiz_marks: number;
  recorded_at: string;
}

export type PerformanceClass = 'Distinction' | 'Good' | 'Average' | 'At-Risk';
export type RiskLevel = 'Low Risk' | 'Moderate Risk' | 'High Risk';

export interface FactorExplanation {
  feature: string;
  label: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface PredictionResult {
  id?: number;
  student_id?: number;
  model_used: string;
  predicted_class: PerformanceClass;
  predicted_cgpa: number;
  risk_level: RiskLevel;
  confidence_score: number;
  class_probabilities: {
    Distinction: number;
    Good: number;
    Average: number;
    'At-Risk': number;
  };
  factor_explanations: FactorExplanation[];
  created_at?: string;
}

export interface StudyRecommendation {
  student_id?: number;
  attendance_status: {
    current: number;
    required: number;
    classes_needed_for_75: number;
    status: 'safe' | 'warning' | 'critical';
  };
  weak_areas: string[];
  priority_actions: string[];
  study_hour_recommendation: {
    current_hours: number;
    recommended_hours: number;
    difference: number;
    strategy: string;
  };
  learning_techniques: Array<{
    title: string;
    description: string;
    duration: string;
  }>;
  weekly_schedule_suggestion: Array<{
    day: string;
    focus: string;
    duration: string;
  }>;
}

export interface ModelMetrics {
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  train_samples: number;
  test_samples: number;
  feature_importances: Array<{
    feature: string;
    importance: number;
    displayName: string;
  }>;
  confusion_matrix: {
    labels: PerformanceClass[];
    matrix: number[][];
  };
}

export type ActiveTab =
  | 'home'
  | 'students'
  | 'prediction'
  | 'recommendations'
  | 'analytics'
  | 'reports'
  | 'inspector'
  | 'about';
