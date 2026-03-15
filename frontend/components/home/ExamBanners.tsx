import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const EXAMS = [
  {
    name: 'JEE Main & Advanced',
    tagline: 'IIT Preparation',
    desc: 'Comprehensive Physics, Chemistry & Maths with 10,000+ practice problems',
    color: 'from-blue-600 to-blue-800',
    accent: 'bg-blue-500',
    emoji: '⚛️',
    href: '/courses?exam=JEE',
    stats: ['500+ Video Hours', '50 Mock Tests', 'PYQ Analysis'],
  },
  {
    name: 'NEET UG',
    tagline: 'Medical Entrance',
    desc: 'Expert Biology, Physics & Chemistry preparation for aspiring doctors',
    color: 'from-green-600 to-emerald-800',
    accent: 'bg-green-500',
    emoji: '🧬',
    href: '/courses?exam=NEET',
    stats: ['400+ Video Hours', '40 Mock Tests', 'NCERT Focus'],
  },
  {
    name: 'CUET UG',
    tagline: 'Central Universities',
    desc: 'Domain-specific preparation for all CUET subjects and general test',
    color: 'from-purple-600 to-purple-900',
    accent: 'bg-purple-500',
    emoji: '🎓',
    href: '/courses?exam=CUET',
    stats: ['300+ Video Hours', '30 Mock Tests', 'All Domains'],
  },
];

export default function ExamBanners() {
  return (
    <section className="section bg-slate-50">
      <div className="container-xl">
        <div className="text-center mb-14">
          <span className="badge-orange mb-3">Competitive Exams</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
            Crack India's Toughest Exams
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Structured courses built specifically for JEE, NEET and CUET by top-ranked faculties.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {EXAMS.map((exam) => (
            <div key={exam.name} className={`bg-gradient-to-br ${exam.color} rounded-3xl p-8 text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="text-5xl mb-4">{exam.emoji}</div>
                <div className="text-white/70 text-sm font-semibold mb-1">{exam.tagline}</div>
                <h3 className="font-display text-2xl font-bold mb-3">{exam.name}</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6">{exam.desc}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {exam.stats.map(s => (
                    <span key={s} className="text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>

                <Link href={exam.href}
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/90 transition-colors group-hover:gap-3">
                  Explore Courses <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
