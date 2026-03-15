'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import Link from 'next/link';
import {
  BookOpen, Trophy, Clock, TrendingUp, Play,
  FileText, ChevronRight, Star, BarChart2, Target
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="skeleton h-64 col-span-2 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { stats = {}, enrollments = [], recentProgress = [], recentTests = [] } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10">
          <BookOpen className="w-64 h-64 text-white absolute -right-8 -top-8" />
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-brand-200">
            {user?.grade ? `Class ${user.grade.replace('CLASS_', '')} Student` : 'Student'} •{' '}
            Continue your learning journey
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/courses" className="bg-white text-brand-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-brand-50 transition-colors">
              Browse Courses
            </Link>
            <Link href="/dashboard/tests" className="bg-white/20 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-white/30 transition-colors">
              Take a Test
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Enrolled Courses', value: stats.totalCourses || 0, color: 'bg-brand-100 text-brand-600' },
          { icon: Trophy, label: 'Tests Taken', value: stats.totalTests || 0, color: 'bg-amber-100 text-amber-600' },
          { icon: Star, label: 'Avg Test Score', value: `${stats.avgScore || 0}%`, color: 'bg-green-100 text-green-600' },
          { icon: Clock, label: 'Hours Learned', value: stats.totalHours || 0, color: 'bg-purple-100 text-purple-600' },
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-slate-900">My Courses</h2>
            <Link href="/dashboard/courses" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No courses yet</p>
              <Link href="/courses" className="btn-primary text-sm mt-4">Browse Courses</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.slice(0, 4).map((enrollment: any) => (
                <CourseProgressItem key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Tests */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-slate-900 text-sm">Recent Tests</h3>
              <Link href="/dashboard/tests" className="text-xs text-brand-600">View all</Link>
            </div>
            {recentTests.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-4">No tests taken yet</p>
            ) : (
              <div className="space-y-3">
                {recentTests.slice(0, 3).map((attempt: any) => (
                  <div key={attempt.id} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      (attempt.percentage || 0) >= 60 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {Math.round(attempt.percentage || 0)}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{attempt.test.title}</p>
                      <p className="text-xs text-slate-400">{attempt.score}/{attempt.test.totalMarks}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-slate-900 text-sm mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: Play, label: 'Continue Learning', href: '/dashboard/courses', color: 'text-brand-600' },
                { icon: FileText, label: 'Download Notes', href: '/dashboard/notes', color: 'text-green-600' },
                { icon: BarChart2, label: 'View Progress', href: '/dashboard/progress', color: 'text-purple-600' },
                { icon: Target, label: 'Mock Tests', href: '/dashboard/tests', color: 'text-amber-600' },
              ].map(({ icon: Icon, label, href, color }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseProgressItem({ enrollment }: { enrollment: any }) {
  const course = enrollment.course;
  const progress = enrollment.progressPercent || 0;

  return (
    <Link href={`/learn/${course.slug}`}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
      <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl flex items-center justify-center shrink-0">
        <BookOpen className="w-6 h-6 text-brand-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm truncate group-hover:text-brand-600 transition-colors">
          {course.title}
        </p>
        <p className="text-xs text-slate-400 mb-2">by {course.instructor?.name}</p>
        <div className="flex items-center gap-2">
          <div className="progress-bar flex-1">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-600">{progress}%</span>
        </div>
      </div>
      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-4 h-4 text-brand-600 fill-brand-600 ml-0.5" />
      </div>
    </Link>
  );
}
