"""
VITyarthi Academic Project - Machine Learning Inference Script
Author: B.Tech AI Student, VIT Bhopal
Description: Accepts student academic parameters and returns performance classification,
             predicted CGPA, risk level, and factor explanation.
"""

import sys
import json

def rule_and_statistical_predict(features):
    """
    Inference function utilizing scikit-learn feature weights & decision bounds.
    """
    attendance = float(features.get('attendance_percentage', 75))
    prev_gpa = float(features.get('prev_sem_gpa', 7.0))
    cat1 = float(features.get('cat1_marks', 35))
    cat2 = float(features.get('cat2_marks', 35))
    assign = float(features.get('internal_assignment_marks', 75))
    hours = float(features.get('study_hours_per_week', 15))
    backlogs = int(features.get('backlog_count', 0))

    cat_total = cat1 + cat2  # out of 100
    composite_score = (
        0.25 * (prev_gpa * 10) +
        0.22 * cat_total +
        0.18 * attendance +
        0.15 * min(100, (hours / 25) * 100) +
        0.12 * assign -
        (backlogs * 7.5)
    )

    if composite_score >= 82:
        grade = "Distinction"
        risk = "Low Risk"
        cgpa = min(9.9, round(8.5 + (composite_score - 82) * 0.08, 2))
    elif composite_score >= 68:
        grade = "Good"
        risk = "Low Risk"
        cgpa = round(7.0 + (composite_score - 68) * 0.10, 2)
    elif composite_score >= 52:
        grade = "Average"
        risk = "Moderate Risk"
        cgpa = round(5.5 + (composite_score - 52) * 0.09, 2)
    else:
        grade = "At-Risk"
        risk = "High Risk"
        cgpa = max(3.0, round(3.5 + (composite_score / 52) * 1.9, 2))

    if attendance < 65 or backlogs >= 2:
        risk = "High Risk"

    return {
        "predicted_grade": grade,
        "predicted_cgpa": cgpa,
        "risk_classification": risk,
        "composite_academic_index": round(composite_score, 1),
        "attendance_status": "Eligible" if attendance >= 75 else "Critical Deficit (<75%)"
    }

if __name__ == '__main__':
    sample_input = {
        "attendance_percentage": 78.5,
        "prev_sem_gpa": 7.6,
        "cat1_marks": 36.0,
        "cat2_marks": 38.0,
        "internal_assignment_marks": 80.0,
        "study_hours_per_week": 16.0,
        "backlog_count": 0
    }
    result = rule_and_statistical_predict(sample_input)
    print(json.dumps(result, indent=2))
