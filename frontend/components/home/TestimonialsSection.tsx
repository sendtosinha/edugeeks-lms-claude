import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Rahul Sharma',
    grade: 'Class 12 — JEE 2024',
    result: 'AIR 847 in JEE Advanced',
    text: 'EduGeeks Physics course was a game-changer for me. The explanations are crystal clear and the test series perfectly prepared me for JEE.',
    rating: 5,
    initials: 'RS',
    color: 'from-brand-500 to-brand-700',
  },
  {
    name: 'Priya Patel',
    grade: 'Class 12 — NEET 2024',
    result: '680/720 in NEET',
    text: 'The Biology course here is exceptional. I attempted hundreds of practice questions and the mock tests gave me confidence for the real exam.',
    rating: 5,
    initials: 'PP',
    color: 'from-green-500 to-emerald-700',
  },
  {
    name: 'Arjun Nair',
    grade: 'Class 10 — CBSE 2024',
    result: '95% in Boards',
    text: 'I improved from 70% to 95% in just 3 months using EduGeeks. The notes and chapter tests are really well-structured.',
    rating: 5,
    initials: 'AN',
    color: 'from-purple-500 to-purple-700',
  },
  {
    name: 'Sneha Gupta',
    grade: 'Class 11 — CBSE',
    result: 'Top of class',
    text: 'Affordable pricing and top quality — EduGeeks is everything I needed. The doubt support is incredibly fast and helpful.',
    rating: 5,
    initials: 'SG',
    color: 'from-accent-500 to-accent-700',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="section bg-gradient-to-br from-slate-900 to-brand-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #60A5FA 0%, transparent 50%), radial-gradient(circle at 75% 75%, #F97316 0%, transparent 50%)' }} />
      </div>
      <div className="container-xl relative z-10">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            ⭐ Student Success Stories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            Students Who Made It
          </h2>
          <p className="text-white/60 max-w-lg mx-auto">
            Join thousands of students who achieved their dream results with EduGeeks.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
              <Quote className="w-8 h-8 text-accent-400 mb-3 opacity-70" />
              <p className="text-white/80 text-sm leading-relaxed mb-5">{t.text}</p>
              <div className="flex items-center gap-0.5 mb-4">
                {Array(t.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-white/50 text-xs">{t.grade}</p>
                </div>
              </div>
              <div className="mt-3 bg-white/10 rounded-lg px-3 py-1.5">
                <p className="text-accent-400 text-xs font-bold">{t.result}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
