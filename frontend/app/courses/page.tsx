'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/course/CourseCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const GRADES = [
  { label: 'All Classes', value: '' },
  { label: 'Class 9', value: 'CLASS_9' },
  { label: 'Class 10', value: 'CLASS_10' },
  { label: 'Class 11', value: 'CLASS_11' },
  { label: 'Class 12', value: 'CLASS_12' },
];

const SUBJECTS = ['All', 'Maths', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
const EXAMS = ['', 'JEE', 'NEET', 'CUET', 'CBSE'];
const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'enrollments' },
  { label: 'Newest', value: 'createdAt' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState(searchParams.get('grade') || '');
  const [subject, setSubject] = useState('');
  const [exam, setExam] = useState(searchParams.get('exam') || '');
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['courses', { search, grade, subject, exam, sort, page }],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page), limit: '12',
        ...(search && { search }),
        ...(grade && { grade }),
        ...(subject && subject !== 'All' && { subject }),
        sort: sort.startsWith('price') ? 'price' : sort,
        order: sort === 'price_asc' ? 'asc' : 'desc',
      });
      return api.get(`/courses?${params}`).then(r => r.data);
    },
  });

  const courses = data?.courses || [];
  const pagination = data?.pagination;
  const hasFilters = !!(grade || subject || exam || search);

  const clearFilters = () => {
    setGrade(''); setSubject(''); setExam(''); setSearch(''); setPage(1);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="container-xl py-8">
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Explore Courses</h1>
            <p className="text-slate-500">Find the perfect course for your exam preparation</p>

            {/* Search Bar */}
            <div className="flex items-center gap-3 mt-5">
              <div className="relative flex-1 max-w-xl">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search courses, subjects, or topics..."
                  className="input pl-11 py-3 text-base"
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline flex items-center gap-2 py-3 ${showFilters ? 'bg-brand-50 border-brand-400' : ''}`}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {hasFilters && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
              </button>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-ghost text-sm text-red-500 hover:bg-red-50">
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container-xl py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            {showFilters && (
              <aside className="lg:w-60 shrink-0">
                <div className="card p-5 space-y-6">
                  {/* Grade */}
                  <div>
                    <p className="font-semibold text-slate-900 text-sm mb-3">Class</p>
                    <div className="space-y-1.5">
                      {GRADES.map(g => (
                        <button key={g.value} onClick={() => { setGrade(g.value); setPage(1); }}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                            grade === g.value ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                          }`}>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <p className="font-semibold text-slate-900 text-sm mb-3">Subject</p>
                    <div className="space-y-1.5">
                      {SUBJECTS.map(s => (
                        <button key={s} onClick={() => { setSubject(s === 'All' ? '' : s); setPage(1); }}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                            (s === 'All' && !subject) || subject === s
                              ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <p className="font-semibold text-slate-900 text-sm mb-3">Sort By</p>
                    <select value={sort} onChange={e => setSort(e.target.value)} className="input text-sm">
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </aside>
            )}

            {/* Courses Grid */}
            <div className="flex-1 min-w-0">
              {/* Grade pills */}
              <div className="flex items-center gap-2 flex-wrap mb-5">
                {GRADES.map(g => (
                  <button key={g.value} onClick={() => { setGrade(g.value); setPage(1); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                      grade === g.value ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
                    }`}>
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Results info */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-slate-500 text-sm">
                  {isLoading ? 'Loading...' : `${pagination?.total || 0} courses found`}
                </p>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:border-brand-400">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array(9).fill(0).map((_, i) => (
                    <div key={i} className="card overflow-hidden">
                      <div className="skeleton h-44" />
                      <div className="p-5 space-y-3">
                        <div className="skeleton h-4 w-3/4" />
                        <div className="skeleton h-3 w-1/2" />
                        <div className="skeleton h-8" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="font-display font-semibold text-xl text-slate-700 mb-2">No courses found</h3>
                  <p className="text-slate-400">Try adjusting your filters or search term</p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="btn-primary mt-5 text-sm">Clear All Filters</button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {courses.map((course: any) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                            page === p ? 'bg-brand-600 text-white shadow-brand' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
                          }`}>{p}</button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
