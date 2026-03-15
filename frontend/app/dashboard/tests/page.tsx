'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Trophy, Clock, CheckCircle, XCircle, BarChart2, ArrowRight } from 'lucide-react';

export default function TestsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['test-history'],
    queryFn: () => api.get('/tests/history').then(r => r.data),
  });

  const attempts = data?.attempts || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="card p-5 flex gap-4">
            <div className="skeleton w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">Test Results</h1>
        <Link href="/courses" className="btn-primary text-sm">
          Take a Test
        </Link>
      </div>

      {/* Summary Cards */}
      {attempts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Tests Taken',
              value: attempts.length,
              icon: BarChart2,
              color: 'bg-brand-100 text-brand-600',
            },
            {
              label: 'Average Score',
              value: `${Math.round(attempts.reduce((s: number, a: any) => s + (a.percentage || 0), 0) / attempts.length)}%`,
              icon: Trophy,
              color: 'bg-amber-100 text-amber-600',
            },
            {
              label: 'Tests Passed',
              value: attempts.filter((a: any) => a.isPassed).length,
              icon: CheckCircle,
              color: 'bg-green-100 text-green-600',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-2xl text-slate-900">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-xl text-slate-700 mb-2">No tests taken yet</h3>
          <p className="text-slate-400 mb-6">Enroll in a course and start practicing</p>
          <Link href="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((attempt: any) => {
            const pct = Math.round(attempt.percentage || 0);
            const passed = attempt.isPassed;

            return (
              <div key={attempt.id} className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all">
                {/* Score Circle */}
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 font-bold text-lg ${
                  passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {pct}%
                  {passed
                    ? <CheckCircle className="w-4 h-4 mt-0.5" />
                    : <XCircle className="w-4 h-4 mt-0.5" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">
                    {attempt.test?.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>{attempt.score} / {attempt.test?.totalMarks} marks</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {attempt.timeTaken ? `${Math.floor(attempt.timeTaken / 60)}m` : '–'}
                    </span>
                    <span>
                      {new Date(attempt.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Mini progress bar */}
                  <div className="progress-bar mt-2 w-48">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      passed ? 'bg-green-400' : 'bg-red-400'
                    }`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <Link href={`/test/result/${attempt.id}`}
                  className="btn-ghost text-sm flex items-center gap-1 shrink-0">
                  View <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
