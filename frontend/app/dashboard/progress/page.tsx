'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, CartesianGrid } from 'recharts';
import { TrendingUp, Clock, CheckCircle, Target } from 'lucide-react';

export default function ProgressPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data),
  });

  const { stats = {}, enrollments = [], recentTests = [] } = data || {};

  // Build chart data from test attempts
  const testChartData = recentTests.slice(0, 8).map((a: any) => ({
    name: a.test?.title?.substring(0, 12) + '...',
    score: Math.round(a.percentage || 0),
  })).reverse();

  // Subject-wise performance from courses
  const subjectData = enrollments.map((e: any) => ({
    subject: e.course?.subject || 'General',
    progress: e.progressPercent || 0,
    fullMark: 100,
  })).slice(0, 6);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-slate-900">Learning Progress</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle, label: 'Courses Enrolled', value: stats.totalCourses || 0, color: 'bg-brand-100 text-brand-600' },
          { icon: Clock, label: 'Hours Learned', value: `${stats.totalHours || 0}h`, color: 'bg-purple-100 text-purple-600' },
          { icon: Target, label: 'Tests Taken', value: stats.totalTests || 0, color: 'bg-amber-100 text-amber-600' },
          { icon: TrendingUp, label: 'Avg Test Score', value: `${stats.avgScore || 0}%`, color: 'bg-green-100 text-green-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="font-display font-bold text-2xl text-slate-900">{value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Test Scores Chart */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 mb-5">Recent Test Scores</h2>
          {testChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={testChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="score" fill="#2563EB" radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fontSize: 10, fill: '#64748B' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              No test data yet
            </div>
          )}
        </div>

        {/* Course Progress */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 mb-5">Course Progress</h2>
          <div className="space-y-4">
            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No courses enrolled</div>
            ) : (
              enrollments.map((e: any) => (
                <div key={e.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 truncate pr-4">{e.course?.title}</span>
                    <span className="font-bold text-brand-600 shrink-0">{e.progressPercent || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${e.progressPercent || 0}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Subject Radar — only if multiple subjects */}
      {subjectData.length >= 3 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 mb-5">Subject-wise Performance</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={subjectData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <Radar name="Progress" dataKey="progress" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
              <Tooltip formatter={(v: any) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
