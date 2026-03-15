import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';

// Static sample blog post content for build
const SAMPLE_POST = {
  title: 'Career Options After Class 10 — Complete Guide 2025',
  excerpt: 'Confused about what to do after 10th? Explore all pathways.',
  content: `
After completing Class 10, students in India face one of the most important decisions of their academic life. The choice you make now can shape your career for decades to come.

## Option 1: Continue with Class 11 (10+2)
The most common path. You choose a stream:
- **Science** (PCM for engineering, PCB for medical)
- **Commerce** (for business, CA, banking)
- **Arts/Humanities** (for law, journalism, civil services)

## Option 2: Diploma Programs
3-year polytechnic diplomas in engineering, pharmacy, or other technical fields. Advantages:
- Faster route to employment
- Can later join engineering degree (lateral entry)
- More affordable

## Option 3: ITI Courses
Industrial Training Institutes offer 1–2 year vocational programs in trades like electrician, fitter, machinist, etc.

## Option 4: Certificate Courses
Short-term programs in areas like computer applications, fashion design, or hotel management.

## Which Path Is Right for You?
Consider your interests, financial situation, and long-term goals. If you're aiming for IIT/AIIMS/NLU, the 10+2 Science/Commerce route is essential. If you want to start earning quickly, diplomas and ITI courses are excellent options.
  `,
  category: 'Career guidance',
  tags: ['career', 'class 10', 'guidance'],
  author: { name: 'Dr. Ritu Mehta', avatar: null },
  publishedAt: '2025-02-15T00:00:00Z',
};

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: SAMPLE_POST.title,
    description: SAMPLE_POST.excerpt,
    openGraph: {
      title: SAMPLE_POST.title,
      description: SAMPLE_POST.excerpt,
      type: 'article',
      publishedTime: SAMPLE_POST.publishedAt,
      authors: [SAMPLE_POST.author.name],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  // In a real app, fetch post by slug from API
  const post = SAMPLE_POST;
  const readTime = Math.ceil(post.content.length / 1000);

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-white">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-brand-900 text-white py-16">
          <div className="container-xl max-w-4xl">
            <Link href="/blog" className="inline-flex items-center gap-2 text-brand-300 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <div className="mb-4">
              <span className="badge bg-brand-500/30 text-brand-200">{post.category}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-white/70 text-lg mb-6">{post.excerpt}</p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white text-sm">
                  {post.author.name[0]}
                </div>
                <span>{post.author.name}</span>
              </div>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readTime} min read
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-xl py-12">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-4 gap-10">
            {/* Article */}
            <article className="lg:col-span-3">
              <div className="prose prose-slate prose-lg max-w-none
                prose-headings:font-display prose-headings:font-bold
                prose-h2:text-2xl prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-4
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-strong:text-slate-800
                prose-li:text-slate-600
                prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline">
                {post.content.split('\n\n').map((para, i) => {
                  if (para.startsWith('## ')) {
                    return <h2 key={i}>{para.replace('## ', '')}</h2>;
                  }
                  if (para.startsWith('- ')) {
                    return (
                      <ul key={i}>
                        {para.split('\n').map((item, j) => (
                          <li key={j} dangerouslySetInnerHTML={{
                            __html: item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }} />
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
                })}
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="flex items-center gap-2 mt-10 pt-6 border-t border-slate-200">
                  <Tag className="w-4 h-4 text-slate-400" />
                  {post.tags.map(tag => (
                    <span key={tag} className="badge-gray">{tag}</span>
                  ))}
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Author */}
              <div className="card p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Written by</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg">
                    {post.author.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{post.author.name}</p>
                    <p className="text-xs text-slate-500">EduGeeks Expert</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white">
                <h3 className="font-display font-bold mb-2">Ready to start preparing?</h3>
                <p className="text-brand-200 text-sm mb-4">Join 50,000+ students on EduGeeks.</p>
                <Link href="/courses" className="block text-center bg-white text-brand-700 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-brand-50 transition-colors">
                  Explore Courses
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
