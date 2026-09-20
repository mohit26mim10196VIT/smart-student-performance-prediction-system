"""
VITyarthi Academic Project - Machine Learning Model Trainer
Author: B.Tech AI Student, VIT Bhopal
Description: Trains Random Forest & Decision Tree Classifiers on student academic records,
             evaluates accuracy, precision, recall, F1-score, and exports model artifacts.
"""

import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

def main():
    print("=" * 70)
    print("  VIT Bhopal: Smart Student Performance Prediction Model Training  ")
    print("=" * 70)

    dataset_path = os.path.join(os.path.dirname(__file__), 'dataset.csv')
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        return

    # 1. Dataset Loading
    df = pd.read_csv(dataset_path)
    print(f"\n[1] Loaded Dataset: {len(df)} student records")
    print(df.head(3))

    # 2. Feature Selection
    feature_cols = [
        'attendance_percentage',
        'prev_sem_gpa',
        'cat1_marks',
        'cat2_marks',
        'internal_assignment_marks',
        'completed_assignments',
        'study_hours_per_week',
        'backlog_count',
        'lab_marks',
        'quiz_marks'
    ]

    X = df[feature_cols]
    y_class = df['grade_class']

    # 3. Preprocessing & Normalization
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 4. Train/Test Split (75% Train, 25% Test as test_size=0.25)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_class, test_size=0.25, random_state=42, stratify=y_class
    )
    print(f"\n[2] Data Split: {len(X_train)} training samples, {len(X_test)} testing samples")

    # 5. Model Training - Random Forest
    print("\n[3] Training Random Forest Classifier (n_estimators=100)...")
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    rf_model.fit(X_train, y_train)

    # Predictions & Evaluation
    y_pred_rf = rf_model.predict(X_test)
    acc = accuracy_score(y_test, y_pred_rf)
    prec = precision_score(y_test, y_pred_rf, average='macro')
    rec = recall_score(y_test, y_pred_rf, average='macro')
    f1 = f1_score(y_test, y_pred_rf, average='macro')
    cm = confusion_matrix(y_test, y_pred_rf)

    print("\n[4] Random Forest Evaluation Metrics:")
    print(f"    - Accuracy:  {acc * 100:.2f}%")
    print(f"    - Precision: {prec * 100:.2f}%")
    print(f"    - Recall:    {rec * 100:.2f}%")
    print(f"    - F1-Score:  {f1 * 100:.2f}%")
    print("\n    Confusion Matrix:\n", cm)
    print("\n    Classification Report:\n", classification_report(y_test, y_pred_rf))

    # Feature Importances
    importances = rf_model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    print("\n[5] Feature Importance Ranking:")
    for idx in sorted_idx:
        print(f"    {feature_cols[idx]:<28}: {importances[idx] * 100:.2f}%")

    # Export metrics for report / viva reference
    metrics_summary = {
        'model': 'Random Forest Classifier',
        'accuracy': round(acc, 3),
        'precision': round(prec, 3),
        'recall': round(rec, 3),
        'f1_score': round(f1, 3),
        'feature_importances': {feature_cols[i]: round(importances[i], 4) for i in sorted_idx}
    }

    output_dir = os.path.join(os.path.dirname(__file__), 'model')
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, 'metrics.json'), 'w') as f:
        json.dump(metrics_summary, f, indent=2)

    print(f"\n[6] Model metadata and metrics saved to {output_dir}/metrics.json")
    print("=" * 70)
    print("  Training Completed Successfully! Ready for VITyarthi Evaluation  ")
    print("=" * 70)

if __name__ == '__main__':
    main()
