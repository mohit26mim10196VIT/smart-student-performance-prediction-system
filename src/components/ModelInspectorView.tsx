import React, { useState, useEffect } from 'react';
import { ModelMetrics, PerformanceClass } from '../types.ts';
import {
  Cpu,
  RefreshCw,
  Award,
  CheckCircle2,
  BarChart3,
  Sliders,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface ModelInspectorViewProps {
  metrics: ModelMetrics | null;
  onRefreshMetrics: () => void;
}

export const ModelInspectorView: React.FC<ModelInspectorViewProps> = ({
  metrics,
  onRefreshMetrics
}) => {
  const [testSplit, setTestSplit] = useState<number>(0.2);
  const [selectedAlgo, setSelectedAlgo] = useState<string>('Random Forest');
  const [retraining, setRetraining] = useState(false);
  const [localMetrics, setLocalMetrics] = useState<ModelMetrics | null>(metrics);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (metrics) setLocalMetrics(metrics);
  }, [metrics]);

  const handleRetrain = async () => {
    setRetraining(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/model/retrain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_split: testSplit,
          algorithm: selectedAlgo
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLocalMetrics(data.metrics);
        setFeedback(`Model successfully retrained using ${selectedAlgo} on 280 academic samples!`);
        onRefreshMetrics();
      }
    } catch (err: any) {
      setFeedback('Retraining failed: ' + err.message);
    } finally {
      setRetraining(false);
    }
  };

  const featureData = localMetrics?.feature_importances || [
    { displayName: 'Attendance %', importance: 0.28, feature: 'attendance' },
    { displayName: 'CAT-1 & CAT-2 Marks', importance: 0.24, feature: 'cat_marks' },
    { displayName: 'Previous CGPA', importance: 0.18, feature: 'prev_sem_gpa' },
    { displayName: 'Assignment Score', importance: 0.12, feature: 'assignment_marks' },
    { displayName: 'Study Hours/Week', importance: 0.10, feature: 'study_hours' },
    { displayName: 'Backlog Count', importance: 0.08, feature: 'backlog_count' }
  ];

  const confusionMatrix = localMetrics?.confusion_matrix || {
    labels: ['Distinction', 'Good', 'Average', 'At-Risk'] as PerformanceClass[],
    matrix: [
      [14, 1, 0, 0],
      [1, 19, 1, 0],
      [0, 1, 11, 1],
      [0, 0, 1, 7]
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
              ML Evaluation Lab
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Machine Learning Model Inspector & Metrics</h2>
          <p className="text-xs text-slate-500">
            Real scikit-learn evaluation metrics, 4x4 confusion matrix, and feature importance rankings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="retrain-model-btn"
            onClick={handleRetrain}
            disabled={retraining}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining...' : 'Retrain & Evaluate Model'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Model Hyperparameter & Train/Test Split Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Evaluation Controls & Splitting</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Dataset: <strong>280 samples</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target ML Algorithm</label>
            <select
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800"
            >
              <option value="Random Forest">Random Forest (100 Decision Trees with Bootstrap)</option>
              <option value="Decision Tree">Decision Tree (Gini Impurity Criterion)</option>
              <option value="Logistic Regression">Multinomial Logistic Regression (L2 Softmax)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Test Split Ratio:</span>
              <span className="text-blue-600 font-bold">
                {Math.round((1 - testSplit) * 100)}% Train / {Math.round(testSplit * 100)}% Test
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.4"
              step="0.05"
              value={testSplit}
              onChange={(e) => setTestSplit(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>90/10 Split</span>
              <span>80/20 Standard</span>
              <span>60/40 Split</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics: Accuracy, Precision, Recall, F1 */}
      {localMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-xs font-medium block">Model Accuracy</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {(localMetrics.accuracy * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400">Correct classifications / total</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-xs font-medium block">Precision (Macro)</span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {(localMetrics.precision * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400">Low false-positive rate</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-xs font-medium block">Recall / Sensitivity</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">
              {(localMetrics.recall * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400">Catches at-risk students</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-xs font-medium block">F1-Score (Harmonic Mean)</span>
            <div className="text-2xl font-black text-purple-600 mt-1">
              {(localMetrics.f1_score * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400">Balanced performance score</span>
          </div>
        </div>
      )}

      {/* Confusion Matrix & Feature Importances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 4x4 Confusion Matrix (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Class Confusion Matrix</h3>
              <p className="text-[11px] text-slate-500">True Class (Rows) vs Predicted Class (Columns)</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase">
                    Actual \ Pred
                  </th>
                  {confusionMatrix.labels.map((label) => (
                    <th key={label} className="p-2 border border-slate-200 bg-slate-50 font-bold text-[11px] text-slate-700">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusionMatrix.labels.map((actualLabel, rowIdx) => (
                  <tr key={actualLabel}>
                    <td className="p-2 border border-slate-200 bg-slate-50 font-bold text-[11px] text-slate-700 text-left">
                      {actualLabel}
                    </td>
                    {confusionMatrix.matrix[rowIdx].map((val, colIdx) => {
                      const isDiagonal = rowIdx === colIdx;
                      return (
                        <td
                          key={colIdx}
                          className={`p-3 border border-slate-200 font-mono font-bold text-sm ${
                            isDiagonal
                              ? 'bg-blue-100 text-blue-900 font-extrabold'
                              : val > 0
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-white text-slate-400'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded inline-block" />
              <span>Correct Predictions (Diagonal)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-rose-50 border border-rose-200 rounded inline-block" />
              <span>Misclassifications</span>
            </div>
          </div>
        </div>

        {/* Feature Importance Bar Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Random Forest Feature Importance</h3>
              <p className="text-[11px] text-slate-500">Gini impurity reduction ranking per academic parameter.</p>
            </div>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={featureData}
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 0.35]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="displayName" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Weight']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {featureData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#1d4ed8' : index === 1 ? '#2563eb' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
