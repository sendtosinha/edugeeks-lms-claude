'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import CourseCard from '@/components/course/CourseCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Fallback static data for SSR / loading
const STATIC_COURSES = [
  { id:'1', slug:'class-9-science', title:'Class 9 Science Complete Course', subject:'Science', grade:'CLASS_9', price:999, discountPrice:499, thumbnail:null, instructor:{name:'Dr. Rajesh Kumar'}, _count:{enrollments:1240}, avgRating:'4.8' },
  { id:'2', slug:'class-9-maths', title:'Class 9 Mathematics Masterclass', subject:'Maths', grade:'CLASS_9', price:999, discountPrice:499, thumbnail:null, instructor:{name:'Prof. Anita Sharma'}, _count:{enrollments:980}, avgRating:'4.7' },
  { id:'3', slug:'class-10-science', title:'Class 10 Science — Board Special', subject:'Science', grade:'CLASS_10', price:1299, discountPrice:649, thumbnail:null, instructor:{name:'Dr. Priya Verma'}, _count:{enrollments:2100}, avgRating:'4.9' },
  { id:'4', slug:'class-10-maths', title:'Class 10 Maths — Score 100/100', subject:'Maths', grade:'CLASS_10', price:1299, discountPrice:649, thumbnail:null, instructor:{name:'Mr. Suresh Gupta'}, _count:{enrollments:1850}, avgRating:'4.8' },
  { id:'5', slug:'class-11-physics', title:'Class 11 Physics — JEE Foundation', subject:'Physics', grade:'CLASS_11', price:1999, discountPrice:999, thumbnail:null, instructor:{name:'IIT Alumni Team'}, _count:{enrollments:750}, avgRating:'4.9' },
  { id:'6', slug:'class-12-chemistry', title:'Class 12 Chemistry — Board + JEE', subject:'Chemistry', grade:'CLASS_12', price:1999, discountPrice:999, thumbnail:null, instructor:{name:'Dr. Meera Iyer'}, _count:{enrollments:620}, avgRating:'4.7' },
];

const GRADE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Class 9', value: 'CLASS_9' },
  { label: 'Class 10', value: 'CLASS_10' },
  { label: 'Class 11', value: 'CLASS_11' },
  { label: 'Class 12', value: 'CLASS_12' },
];

import { useState } from 'react';

export default function PopularCourses() {
  const [activeGrade, setActiveGrade] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['courses', 'featured', activeGrade],
    queryFn: () => api.get(`/courses?featured=true&limit=6${activeGrade ? `&grade=${activeGrade}` : ''}`).then(r => r.data),
  });

  const courses = data?.courses || STATIC_COURSES;

  return (
    <section className="section bg-white">
      <div className="container-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="badge-blue mb-3">Popular Courses</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
              Start Learning Today
            </h2>
            <p className="text-slate-500 mt-2 max-w-lg">
              Expert-led courses for every class and subject. Affordable prices, world-class content.
            </p>
          </div>
          <Link href="/courses" className="btn-outline text-sm shrink-0">
            View All Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grade filter */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {GRADE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setActiveGrade(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeGrade === f.value
                  ? 'bg-brand-600 text-white shadow-brand'
                  : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-44 w-full" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
