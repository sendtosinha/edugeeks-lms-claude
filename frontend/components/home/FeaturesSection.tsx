'use client';

import { Video, FileText, FlaskConical, ClipboardList, MessageCircle, Download } from 'lucide-react';

const FEATURES = [
  {
    icon: Video,
    color: 'bg-brand-100 text-brand-600',
    title: 'HD Video Lectures',
    desc: 'Crystal-clear videos by IIT/AIIMS alumni. Watch anytime, anywhere on any device.',
  },
  {
    icon: FileText,
    color: 'bg-purple-100 text-purple-600',
    title: 'Revision Notes',
    desc: 'Concise, exam-focused notes covering every topic in the CBSE syllabus.',
  },
  {
    icon: Download,
    color: 'bg-green-100 text-green-600',
    title: 'Study Materials',
    desc: 'Downloadable PDFs, formula sheets, mind maps, and previous year papers.',
  },
  {
    icon: ClipboardList,
    color: 'bg-accent-100 text-accent-600',
    title: 'Test Series',
    desc: 'Chapter tests, unit tests, and full mock exams with detailed analysis.',
  },
  {
    icon: MessageCircle,
    color: 'bg-pink-100 text-pink-600',
    title: 'Doubt Support',
    desc: 'Get your doubts resolved within 24 hours by expert teachers.',
  },
  {
    icon: FlaskConical,
    color: 'bg-teal-100 text-teal-600',
    title: 'Practical Labs',
    desc: 'Virtual lab simulations for Science practicals and experiments.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="section bg-white">
      <div className="container-xl">
        <div className="text-center mb-14">
          <span className="badge-blue mb-3">Everything You Need</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
            Complete Learning Ecosystem
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-base">
            All the tools and resources you need to ace your exams — in one affordable platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="group card p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-slate-900 text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
