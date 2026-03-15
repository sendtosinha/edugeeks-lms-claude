'use client';

import Link from 'next/link';
import { ArrowRight, Play, Star, Users, BookOpen, Award, CheckCircle } from 'lucide-react';

const TRUST_BADGES = [
  { icon: Users, label: '50,000+ Students' },
  { icon: BookOpen, label: '200+ Courses' },
  { icon: Star, label: '4.8 Rating' },
  { icon: Award, label: 'Expert Teachers' },
];

const HIGHLIGHTS = [
  'HD Video Lectures by IIT/AIIMS Alumni',
  'Chapter-wise Tests & Mock Exams',
  'Downloadable Notes & Study Material',
  'Doubt Support & Live Sessions',
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-brand-50/40 to-accent-50/30 pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-brand-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-brand-50/30 to-accent-50/30 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563EB" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container-xl relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="animate-slide-up">
            {/* Pre-headline badge */}
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse-slow" />
              India's Most Affordable EdTech Platform
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
              Smart Learning<br />
              for{' '}
              <span className="relative">
                <span className="gradient-text">Class 9–12</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8 Q75 2 150 8 Q225 14 298 8" stroke="#F97316" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
              {' '}Students
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
              Affordable HD video courses, revision notes, and test series for{' '}
              <strong className="text-slate-800">CBSE students</strong>. Expert preparation for{' '}
              <strong className="text-slate-800">JEE, NEET & CUET</strong> by India's best teachers.
            </p>

            {/* Highlights */}
            <ul className="space-y-2.5 mb-10">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-brand-500 shrink-0" />
                  <span className="text-sm font-medium">{h}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses" className="btn-primary text-base px-8 py-4">
                Explore Courses <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/register" className="btn-outline text-base px-8 py-4">
                Start Learning Free
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {['S','R','P','A','M'].map((l, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Trusted by <strong className="text-slate-700">50,000+</strong> students across India</p>
              </div>
            </div>
          </div>

          {/* Right — Visual Card */}
          <div className="hidden lg:block relative animate-fade-in">
            {/* Main card */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
              {/* Video preview mock */}
              <div className="relative bg-gradient-to-br from-brand-600 to-brand-900 rounded-2xl aspect-video mb-6 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #60A5FA 0%, transparent 50%), radial-gradient(circle at 80% 20%, #F97316 0%, transparent 50%)' }} />
                <button className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-2 border-white/50 hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </button>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-display font-semibold text-sm">Class 12 Physics — Chapter 1</p>
                  <p className="text-white/70 text-xs">Electric Charges and Fields</p>
                </div>
                {/* Live badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              </div>

              {/* Course info */}
              <div className="space-y-3">
                {[
                  { chapter: 'Ch 1', title: 'Electric Charges & Fields', done: true },
                  { chapter: 'Ch 2', title: 'Electrostatic Potential', done: true },
                  { chapter: 'Ch 3', title: 'Current Electricity', done: false, active: true },
                ].map((item) => (
                  <div key={item.chapter}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      item.active ? 'bg-brand-50 border border-brand-200' : 'hover:bg-slate-50'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      item.done ? 'bg-green-100 text-green-600' :
                      item.active ? 'bg-brand-100 text-brand-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>{item.chapter}</div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${item.active ? 'text-brand-700' : 'text-slate-700'}`}>{item.title}</p>
                    </div>
                    {item.done && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {item.active && <Play className="w-4 h-4 text-brand-500 fill-brand-500" />}
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <div className="flex justify-between text-xs text-slate-600 mb-2">
                  <span className="font-semibold">Course Progress</span>
                  <span className="font-bold text-brand-600">68%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '68%' }} />
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg p-3 border border-slate-100 flex items-center gap-2 animate-float">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">🏆</div>
              <div>
                <p className="text-xs font-bold text-slate-800">Top Rated</p>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-3 border border-slate-100 animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">✅</div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Test Cleared!</p>
                  <p className="text-xs text-green-600">Score: 92/100</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl p-4 border border-white shadow-sm">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
