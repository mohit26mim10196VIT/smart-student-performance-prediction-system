import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Users,
  ShieldAlert,
  Percent,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsViewProps {
  analytics: any;
  onRefreshAnalytics: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  onRefreshAnalytics
}) => {
  const [loading, setLoading] = useState(false);

  const summary = analytics?.summary || {
    totalStudents: 6,
    avgAttendance: 76.5,
    avgPrevGpa: 7.25,
    avgStudyHours: 14.5,
    activeBacklogStudents: 2,
    atRiskStudents: 2
  };

  const riskData = [
    { name: 'Low Risk', value: analytics?.riskCounts?.['Low Risk'] || 3, color: '#10b981' },
    { name: 'Moderate Risk', value: analytics?.riskCounts?.['Moderate Risk'] || 2, color: '#f59e0b' },
    { name: 'High Risk', value: analytics?.riskCounts?.['High Risk'] || 1, color: '#ef4444' }
  ];

  const gradeDistributionData = [
    { grade: 'Distinction', count: analytics?.classDistribution?.Distinction || 70, fill: '#3b82f6' },
    { grade: 'Good', count: analytics?.classDistribution?.Good || 105, fill: '#10b981' },
    { grade: 'Average', count: analytics?.classDistribution?.Average || 65, fill: '#f59e0b' },
    { grade: 'At-Risk', count: analytics?.classDistribution?.['At-Risk'] || 40, fill: '#ef4444' }
  ];

  // Scatter chart data: Attendance vs CAT Average
  const scatterData = analytics?.scatterData || [
    { attendance: 92.5, catAverage: 46.8, studyHours: 24, prevGpa: 9.15 },
    { attendance: 84.0, catAverage: 38.8, studyHours: 16.5, prevGpa: 7.85 },
    { attendance: 68.0, catAverage: 25.8, studyHours: 9.0, prevGpa: 5.95 },
    { attendance: 58.5, catAverage: 20.0, studyHours: 6.0, prevGpa: 5.10 },
    { attendance: 88.0, catAverage: 41.8, studyHours: 19.0, prevGpa: 8.40 },
    { attendance: 76.5, catAverage: 32.5, studyHours: 12.0, prevGpa: 6.80 }
  ];

  return (
    <div className="space-y-6">
      {/* Module 4 Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Module 4 — Analytics
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Academic Analytics & Visualizations</h2>
          <p className="text-xs text-slate-500">
            Cohort correlation matrices, continuous assessment distributions, and performance risk trends.
          </p>
        </div>

        <button
          onClick={onRefreshAnalytics}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition min-h-[40px] touch-manipulation self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Charts</span>
        </button>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs font-medium block">Average Attendance</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary.avgAttendance}%</div>
          <span className="text-[11px] text-amber-600 font-semibold">Eligibility Cutoff: 75%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs font-medium block">Cohort Prior GPA</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary.avgPrevGpa}</div>
          <span className="text-[11px] text-slate-400">Scale of 10.0</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs font-medium block">Average Study Effort</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary.avgStudyHours} hrs/wk</div>
          <span className="text-[11px] text-slate-400">Self-study & homework</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs font-medium block">At-Risk Alert Rate</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {summary.totalStudents ? Math.round((summary.atRiskStudents / summary.totalStudents) * 100) : 0}%
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">{summary.atRiskStudents} flagged students</span>
        </div>
      </div>

      {/* Row 1 Charts: Risk Distribution & Grade Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cohort Grade Distribution */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Grade Tier Distribution</h3>
              <p className="text-[11px] text-slate-500">Classification breakdown across full 280-sample training dataset.</p>
            </div>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistributionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} students`, 'Count']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Classification Pie / Breakdown */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Current Cohort Risk Segmentation</h3>
              <p className="text-[11px] text-slate-500">Early-warning risk levels in active SQLite database.</p>
            </div>
            <PieIcon className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} students`, 'Count']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            {riskData.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-center space-x-1 mb-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-[11px] text-slate-600">{r.name}</span>
                </div>
                <div className="font-bold text-slate-900">{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Attendance vs Continuous Assessment (CAT) Correlation */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Correlation Analysis: Attendance Rate vs Continuous Assessment (CAT) Average
            </h3>
            <p className="text-[11px] text-slate-500">
              Positive linear correlation: students with attendance {'>'} 80% consistently score higher internal CAT marks.
            </p>
          </div>
          <ScatterIcon className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
              <XAxis
                type="number"
                dataKey="attendance"
                name="Attendance Rate"
                unit="%"
                domain={[40, 100]}
                tick={{ fontSize: 11 }}
                label={{ value: 'Attendance Percentage (%)', position: 'bottom', offset: 0, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="catAverage"
                name="CAT Average"
                unit="/50"
                domain={[0, 50]}
                tick={{ fontSize: 11 }}
                label={{ value: 'CAT Avg (out of 50)', angle: -90, position: 'insideLeft', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any, name: any) => [val, name]}
              />
              <Scatter name="Students" data={scatterData} fill="#4f46e5" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
