import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="section bg-white">
      <div className="container-xl">
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
          {/* Decorations */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 left-8 w-32 h-32 border-2 border-white rounded-2xl rotate-12" />
            <div className="absolute bottom-8 right-8 w-24 h-24 border-2 border-white rounded-full" />
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white rounded-xl -rotate-6" />
          </div>
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(249,115,22,0.2) 0%, transparent 60%)' }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4 text-accent-300" />
              Limited Time Offer — Up to 60% Off!
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Start Your Learning Journey<br />Today — Risk Free!
            </h2>
            <p className="text-brand-200 text-lg max-w-2xl mx-auto mb-10">
              Join 50,000+ students. Get access to HD videos, notes, tests, and doubt support.
              No commitment — pay only for what you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="btn-accent text-base px-8 py-4">
                Browse All Courses <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/register"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all">
                Create Free Account
              </Link>
            </div>
            <p className="text-brand-300 text-sm mt-6">
              ✓ No hidden charges &nbsp;✓ Instant access &nbsp;✓ Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
