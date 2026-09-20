import { AcademicRecord, PerformanceClass, PredictionResult, StudyRecommendation } from './types.ts';

export function generateStudyRecommendation(
  record: Omit<AcademicRecord, 'id' | 'recorded_at'>,
  prediction?: PredictionResult
): StudyRecommendation {
  const weakAreas: string[] = [];
  const priorityActions: string[] = [];

  // 1. Attendance Analysis & Calculation
  // Assuming a standard 60-lecture semester per course
  const totalClassesSoFar = 40;
  const attendedClasses = Math.round((record.attendance_percentage / 100) * totalClassesSoFar);
  const targetPercentage = 75.0; // VIT threshold

  // Formula: (attended + x) / (totalSoFar + x) >= 0.75
  // attended + x >= 0.75*totalSoFar + 0.75*x
  // 0.25*x >= 0.75*totalSoFar - attended
  // x >= (0.75*totalSoFar - attended) / 0.25
  let classesNeeded = 0;
  if (record.attendance_percentage < targetPercentage) {
    const requiredTotal = Math.ceil((0.75 * totalClassesSoFar - attendedClasses) / 0.25);
    classesNeeded = Math.max(1, requiredTotal);
  }

  let attendanceStatus: 'safe' | 'warning' | 'critical' = 'safe';
  if (record.attendance_percentage < 75) {
    attendanceStatus = 'critical';
    weakAreas.push(`Attendance Deficit (${record.attendance_percentage}% is below the 75% VIT eligibility cutoff)`);
    priorityActions.push(
      `Attend the next ${classesNeeded} consecutive lectures without absence to restore attendance above 75%.`
    );
  } else if (record.attendance_percentage < 80) {
    attendanceStatus = 'warning';
    weakAreas.push(`Borderline Attendance (${record.attendance_percentage}% leaves zero safety margin for emergencies)`);
    priorityActions.push(`Maintain 100% attendance in all remaining theory and laboratory classes to reach 80%+.`);
  }

  // 2. CAT 1 & 2 Evaluation (Continuous Assessment Tests)
  const catAvg = (record.cat1_marks + record.cat2_marks) / 2;
  if (catAvg < 25) {
    weakAreas.push(`Internal Exam Deficit (CAT Average: ${catAvg.toFixed(1)}/50 marks)`);
    priorityActions.push(
      `Schedule a 1-on-1 consultation with course faculty for CAT paper audit and fundamental concept revision.`
    );
  } else if (catAvg < 35) {
    weakAreas.push(`Moderate CAT Score (${catAvg.toFixed(1)}/50) requires strengthening for Final Assessment (FAT).`);
    priorityActions.push(`Complete previous 3 years' VIT semester end question papers (FAT archive).`);
  }

  // 3. Backlog Alert
  if (record.backlog_count > 0) {
    weakAreas.push(`Active Academic Backlogs (${record.backlog_count} pending courses)`);
    priorityActions.push(
      `Dedicate 1.5 hours daily specifically to backlog coursework syllabus before weekend review sessions.`
    );
  }

  // 4. Assignments & Continuous Practice
  if (record.completed_assignments < 8 || record.internal_assignment_marks < 75) {
    weakAreas.push(
      `Assignment Shortfall (${record.completed_assignments}/10 completed, ${record.internal_assignment_marks}% average score)`
    );
    priorityActions.push(
      `Submit all upcoming assignments 48 hours before VTOP deadline to allow peer code/theory review.`
    );
  }

  // 5. Study Hours Calibration
  let recommendedHours = 18;
  if (record.attendance_percentage < 75 || record.backlog_count > 0 || catAvg < 30) {
    recommendedHours = 24;
  } else if (record.prev_sem_gpa >= 8.5) {
    recommendedHours = 16;
  }

  const hourDiff = recommendedHours - record.study_hours_per_week;
  let studyStrategy = '';
  if (hourDiff > 0) {
    studyStrategy = `Gradually ramp up daily study time by +${(hourDiff / 7).toFixed(1)} hours/day, focusing on high-weightage topics.`;
    weakAreas.push(`Insufficient Self-Study Volume (${record.study_hours_per_week} hrs/week vs ${recommendedHours} hrs recommended)`);
  } else {
    studyStrategy = `Maintain current consistent routine (${record.study_hours_per_week} hrs/week) while optimizing with active recall.`;
  }

  // Fallback if student is performing exceptionally well
  if (weakAreas.length === 0) {
    weakAreas.push('No severe academic deficiencies identified. Focus is on performance optimization.');
    priorityActions.push('Engage in undergraduate research, competitive coding, or AI portfolio projects.');
    priorityActions.push('Mentor peer study groups in complex subjects to deepen conceptual mastery.');
  }

  // Evidence-based Learning Techniques
  const learningTechniques = [
    {
      title: 'Feynman Conceptual Technique',
      description: 'Explain core AI and algorithmic concepts in simple plain English without jargon to expose knowledge gaps.',
      duration: '30 mins per chapter'
    },
    {
      title: 'Pomodoro 50/10 Cycle',
      description: 'Deep work focus block for 50 minutes followed by 10 minutes screen-free cognitive break to prevent burnout.',
      duration: '4 cycles daily'
    },
    {
      title: 'Spaced Repetition Flashcards',
      description: 'Review mathematical formulas, definitions, and syntax on Day 1, Day 3, and Day 7 using Anki or flashcards.',
      duration: '15 mins morning & evening'
    },
    {
      title: 'Active Recall Practice Problems',
      description: 'Close notes and recreate algorithms or write code implementations from memory before checking solutions.',
      duration: '45 mins per subject'
    }
  ];

  // Customized Weekly Timetable Suggestion
  const weeklySchedule = [
    { day: 'Monday', focus: 'Core AI / Math & Algorithms (CAT Weak Areas)', duration: `${(recommendedHours / 6).toFixed(1)} hrs` },
    { day: 'Tuesday', focus: 'Data Structures / Programming Practice & Labs', duration: `${(recommendedHours / 6).toFixed(1)} hrs` },
    { day: 'Wednesday', focus: 'Theory Revision & Assignment Preparation', duration: `${(recommendedHours / 6).toFixed(1)} hrs` },
    { day: 'Thursday', focus: 'Quiz Preparation & Digital Coursework', duration: `${(recommendedHours / 6).toFixed(1)} hrs` },
    { day: 'Friday', focus: 'Backlog Clearing / Remedial Chapter Review', duration: `${(recommendedHours / 6).toFixed(1)} hrs` },
    { day: 'Saturday', focus: 'Mock CAT / Full-length Exam Paper Simulation', duration: `${(recommendedHours / 4).toFixed(1)} hrs` },
    { day: 'Sunday', focus: 'Weekly Concept Consolidation & Rest', duration: '1.0 hr review' }
  ];

  return {
    student_id: record.student_id,
    attendance_status: {
      current: record.attendance_percentage,
      required: targetPercentage,
      classes_needed_for_75: classesNeeded,
      status: attendanceStatus
    },
    weak_areas: weakAreas,
    priority_actions: priorityActions,
    study_hour_recommendation: {
      current_hours: record.study_hours_per_week,
      recommended_hours: recommendedHours,
      difference: hourDiff,
      strategy: studyStrategy
    },
    learning_techniques: learningTechniques,
    weekly_schedule_suggestion: weeklySchedule
  };
}
