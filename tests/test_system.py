"""
VITyarthi Academic Project - Unit Tests
Author: B.Tech AI Student, VIT Bhopal
Description: Test suite for ML prediction, bounds validation, and risk categorization.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ml.predict import rule_and_statistical_predict

class TestStudentPerformanceSystem(unittest.TestCase):

    def test_distinction_prediction(self):
        """TC-01: Verify high-performing inputs yield Distinction and Low Risk"""
        high_student = {
            "attendance_percentage": 94.0,
            "prev_sem_gpa": 9.2,
            "cat1_marks": 47.0,
            "cat2_marks": 48.0,
            "internal_assignment_marks": 95.0,
            "study_hours_per_week": 24.0,
            "backlog_count": 0
        }
        res = rule_and_statistical_predict(high_student)
        self.assertEqual(res["predicted_grade"], "Distinction")
        self.assertEqual(res["risk_classification"], "Low Risk")
        self.assertGreaterEqual(res["predicted_cgpa"], 8.5)

    def test_at_risk_prediction(self):
        """TC-02: Verify low attendance and failed CATs trigger High Risk classification"""
        at_risk_student = {
            "attendance_percentage": 52.0,
            "prev_sem_gpa": 4.5,
            "cat1_marks": 16.0,
            "cat2_marks": 18.0,
            "internal_assignment_marks": 45.0,
            "study_hours_per_week": 4.0,
            "backlog_count": 3
        }
        res = rule_and_statistical_predict(at_risk_student)
        self.assertEqual(res["predicted_grade"], "At-Risk")
        self.assertEqual(res["risk_classification"], "High Risk")
        self.assertIn("Critical Deficit", res["attendance_status"])

    def test_cgpa_bounds(self):
        """TC-03: Verify predicted CGPA never violates 0.0 - 10.0 scale"""
        edge_case = {
            "attendance_percentage": 100.0,
            "prev_sem_gpa": 10.0,
            "cat1_marks": 50.0,
            "cat2_marks": 50.0,
            "internal_assignment_marks": 100.0,
            "study_hours_per_week": 40.0,
            "backlog_count": 0
        }
        res = rule_and_statistical_predict(edge_case)
        self.assertLessEqual(res["predicted_cgpa"], 10.0)
        self.assertGreaterEqual(res["predicted_cgpa"], 0.0)

    def test_attendance_recovery_math(self):
        """TC-04: Verify algebraic formula: X >= (0.75*T - A)/0.25 to recover >= 75% attendance"""
        # Scenario: 40 classes conducted, student attended 20 (50.0%)
        # Required X = ceil((0.75*40 - 20) / 0.25) = ceil((30 - 20)/0.25) = ceil(10/0.25) = 40 lectures
        total_so_far = 40
        attended = 20
        target = 0.75
        needed = max(0, int((target * total_so_far - attended) / (1.0 - target)))
        self.assertEqual(needed, 40)
        # Verify new attendance is exactly 75%: (20 + 40) / (40 + 40) = 60 / 80 = 75.0%
        recovered_att = (attended + needed) / (total_so_far + needed)
        self.assertGreaterEqual(recovered_att, 0.75)

    def test_moderate_average_grade_prediction(self):
        """TC-05: Verify mid-range inputs map to Average and Moderate Risk"""
        mid_student = {
            "attendance_percentage": 76.0,
            "prev_sem_gpa": 6.4,
            "cat1_marks": 28.0,
            "cat2_marks": 29.0,
            "internal_assignment_marks": 70.0,
            "study_hours_per_week": 14.0,
            "backlog_count": 0
        }
        res = rule_and_statistical_predict(mid_student)
        self.assertEqual(res["predicted_grade"], "Average")
        self.assertEqual(res["risk_classification"], "Moderate Risk")
        self.assertEqual(res["attendance_status"], "Eligible")

if __name__ == '__main__':
    unittest.main()
