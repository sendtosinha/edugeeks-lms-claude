'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Play, CheckCircle, Clock } from 'lucide-react';

export default function MyCourses() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => api.get('/enrollments/my-courses').then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const enrollments = data?.enrollments || [];

  if (enrollments.length === 0) {
    return (
      <div className="card p-12 text-center">
        <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h3 className="font-display font-semibold text-xl text-slate-700 mb-2">No courses yet</h3>
        <p className="text-slate-400 mb-6">Browse our catalog and start learning today</p>
        <Link href="/courses" className="btn-primary">Browse Courses</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">My Courses</h1>
        <Link href="/courses" className="btn-outline text-sm">Browse More</Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {enrollments.map((enrollment: any) => {
          const course = enrollment.course;
          const totalLectures = course.chapters?.reduce((s: number, ch: any) => s + ch.lectures.length, 0) || 0;
          const progress = enrollment.progressPercent || 0;

          return (
            <div key={enrollment.id} className="card overflow-hidden hover:shadow-card-hover transition-all duration-300">
              {/* Thumbnail */}
              <div className="h-36 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center relative">
                <BookOpen className="w-12 h-12 text-brand-300" />
                {progress === 100 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-display font-semibold text-slate-900 text-sm leading-snug mb-1 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4">by {course.instructor?.name}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Progress</span>
                    <span className="font-semibold text-brand-600">{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {totalLectures} lectures
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(enrollment.enrolledAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <Link href={`/learn/${course.slug}`} className="btn-primary w-full justify-center text-sm py-2.5">
                  <Play className="w-4 h-4 fill-white" />
                  {progress > 0 ? 'Continue Learning' : 'Start Course'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
