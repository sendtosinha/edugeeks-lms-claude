'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowRight, Search } from 'lucide-react';

const CATEGORIES = ['All', 'Career guidance', 'Exam preparation', 'Study tips', 'JEE', 'NEET', 'CUET'];

// Static blog posts as fallback / seed
const STATIC_POSTS = [
  {
    id: '1', slug: 'career-options-after-10th',
    title: 'Career Options After Class 10 — Complete Guide 2025',
    excerpt: 'Confused about what to do after 10th? Explore all pathways — Science, Commerce, Arts, Diploma, and vocational courses.',
    category: 'Career guidance', thumbnail: null,
    author: { name: 'Dr. Ritu Mehta' },
    publishedAt: '2025-02-15T00:00:00Z',
  },
  {
    id: '2', slug: 'diploma-vs-class-11',
    title: 'Diploma vs. Class 11: Which One is Right for You?',
    excerpt: 'A detailed comparison of pursuing a Diploma after 10th versus continuing with Class 11 for board exams.',
    category: 'Career guidance', thumbnail: null,
    author: { name: 'Prof. Ajay Singh' },
    publishedAt: '2025-02-10T00:00:00Z',
  },
  {
    id: '3', slug: 'cuet-preparation-guide',
    title: 'CUET 2025 Complete Preparation Guide — From Zero to Hero',
    excerpt: 'Master your CUET preparation with this step-by-step strategy covering syllabus, best books, and time management.',
    category: 'CUET', thumbnail: null,
    author: { name: 'EduGeeks Team' },
    publishedAt: '2025-02-05T00:00:00Z',
  },
  {
    id: '4', slug: 'neet-last-30-days-strategy',
    title: 'NEET Last 30 Days Strategy — Score 640+ with This Plan',
    excerpt: 'With just 30 days left for NEET, here is your day-by-day revision plan to maximize your score.',
    category: 'NEET', thumbnail: null,
    author: { name: 'Dr. Priya Nair' },
    publishedAt: '2025-01-28T00:00:00Z',
  },
  {
    id: '5', slug: 'jee-mains-preparation-tips',
    title: 'JEE Mains 2025: 10 Proven Strategies to Crack It',
    excerpt: 'IIT toppers share their study strategies, time management, and mental health tips for JEE aspirants.',
    category: 'JEE', thumbnail: null,
    author: { name: 'Rahul IIT Bombay' },
    publishedAt: '2025-01-20T00:00:00Z',
  },
  {
    id: '6', slug: 'effective-study-techniques',
    title: '7 Science-Backed Study Techniques That Actually Work',
    excerpt: 'Ditch the ineffective studying habits. Learn spaced repetition, active recall, and Pomodoro technique.',
    category: 'Study tips', thumbnail: null,
    author: { name: 'EduGeeks Team' },
    publishedAt: '2025-01-15T00:00:00Z',
  },
];

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { data } = useQuery({
    queryKey: ['blog', search, category],
    queryFn: () => api.get(`/blog?${new URLSearchParams({ ...(search && { search }), ...(category !== 'All' && { category }) })}`).then(r => r.data),
  });

  const posts = data?.posts || STATIC_POSTS;
  const filteredPosts = category === 'All' ? posts : posts.filter((p: any) => p.category === category);

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white py-16">
          <div className="container-xl text-center">
            <h1 className="font-display text-4xl font-bold mb-4">EduGeeks Blog</h1>
            <p className="text-brand-200 text-lg max-w-lg mx-auto mb-8">
              Career guidance, exam strategies, and study tips from India's top educators.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search articles..." className="input pl-11 py-3" />
            </div>
          </div>
        </div>

        <div className="container-xl py-10">
          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  category === c ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
                }`}>{c}</button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post: any) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function BlogCard({ post }: { post: any }) {
  const readTime = Math.ceil((post.content?.length || 1000) / 1000);
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="card-hover overflow-hidden h-full flex flex-col">
        {/* Thumbnail */}
        <div className="h-44 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-4xl">
          {post.category === 'JEE' ? '⚛️' : post.category === 'NEET' ? '🧬' : post.category === 'CUET' ? '🎓' : '📚'}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-blue text-xs">{post.category}</span>
          </div>

          <h3 className="font-display font-semibold text-slate-900 text-base leading-snug mb-2 group-hover:text-brand-600 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{post.excerpt}</p>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center text-xs">
                {post.author?.name?.[0]}
              </span>
              <span>{post.author?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {readTime} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
