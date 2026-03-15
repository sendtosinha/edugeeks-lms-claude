'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Star, Users, Clock, BookOpen, Play, CheckCircle,
  Download, MessageCircle, Shield, ChevronDown, Lock
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window { Razorpay: any; }
}

export default function CoursePage() {
  const { slug } = useParams() as { slug: string };
  const { user } = useAuthStore();
  const router = useRouter();
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => api.get(`/courses/${slug}`).then(r => r.data),
  });

  const course = data?.course;
  const isEnrolled = data?.course?.isEnrolled;

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/courses/${slug}`);
      return;
    }

    setEnrolling(true);
    try {
      // Create Razorpay order
      const { data: orderData } = await api.post('/payments/create-order', {
        courseIds: [course.id]
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'EduGeeks',
        description: course.title,
        order_id: orderData.order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Enrolled successfully! 🎉');
            router.push(`/learn/${slug}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#2563EB' },
        modal: { ondismiss: () => setEnrolling(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
      setEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen">
          <div className="container-xl py-12">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="skeleton h-8 w-2/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-64 w-full" />
              </div>
              <div className="skeleton h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!course) return null;

  const price = course.discountPrice || course.price;
  const discount = course.discountPrice ? Math.round((1 - course.discountPrice / course.price) * 100) : null;

  return (
    <>
      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <Navbar />

      <main className="pt-16 min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-r from-slate-900 to-brand-900 text-white">
          <div className="container-xl py-12">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge bg-white/20 text-white">{course.grade?.replace('CLASS_', 'Class ')}</span>
                <span className="badge bg-white/20 text-white">{course.subject}</span>
                {course.examCategory?.map((ec: string) => (
                  <span key={ec} className="badge bg-accent-500/30 text-accent-200">{ec}</span>
                ))}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-white/80 text-lg mb-6">{course.shortDesc}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                {course.avgRating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <strong className="text-white">{course.avgRating}</strong>
                    <span>({course._count?.reviews} reviews)</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course._count?.enrollments?.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {course.totalLectures} lectures
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.round((course.duration || 0) / 60)}h content
                </span>
              </div>

              <p className="text-white/60 mt-4 text-sm">
                Instructor: <span className="text-white font-semibold">{course.instructor?.name}</span> •{' '}
                Language: {course.language}
              </p>
            </div>
          </div>
        </div>

        <div className="container-xl py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-8">
              {/* What you'll learn */}
              <div className="card p-6">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-4">What You'll Learn</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {['HD video lectures for each chapter', 'Downloadable revision notes PDFs',
                    'Chapter-wise practice questions', 'Full mock test series',
                    'Doubt support within 24 hours', 'Performance analytics'].map(item => (
                    <div key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Curriculum */}
              <div className="card p-6">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Course Curriculum</h2>
                <p className="text-slate-500 text-sm mb-5">
                  {course.totalLectures} lectures • {Math.round((course.duration || 0) / 60)}h total
                </p>

                <div className="space-y-3">
                  {course.chapters?.map((chapter: any) => (
                    <div key={chapter.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
                        <div>
                          <p className="font-semibold text-slate-900">{chapter.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{chapter.lectures?.length} lectures</p>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedChapter === chapter.id ? 'rotate-180' : ''}`} />
                      </button>

                      {expandedChapter === chapter.id && (
                        <div className="border-t border-slate-200">
                          {chapter.lectures?.map((lec: any) => (
                            <div key={lec.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${lec.isFree ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                {lec.isFree ? <Play className="w-4 h-4 fill-current" /> : <Lock className="w-4 h-4" />}
                              </div>
                              <span className="text-sm text-slate-700 flex-1">{lec.title}</span>
                              {lec.videoDuration && (
                                <span className="text-xs text-slate-400">{Math.floor(lec.videoDuration / 60)}min</span>
                              )}
                              {lec.isFree && (
                                <span className="text-xs text-green-600 font-semibold">Free</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="card p-6">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-4">About This Course</h2>
                <p className="text-slate-600 leading-relaxed">{course.description}</p>
              </div>

              {/* Reviews */}
              {course.reviews?.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-display text-xl font-bold text-slate-900 mb-5">Student Reviews</h2>
                  <div className="space-y-4">
                    {course.reviews.slice(0, 5).map((review: any) => (
                      <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-sm">
                            {review.user.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{review.user.name}</p>
                            <div className="flex items-center gap-0.5">
                              {Array(review.rating).fill(0).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="text-slate-600 text-sm">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — Purchase Card */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl mb-5 flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <Image src={course.thumbnail} alt={course.title} width={400} height={225} className="object-cover w-full h-full" />
                  ) : (
                    <BookOpen className="w-16 h-16 text-brand-300" />
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-display font-extrabold text-3xl text-slate-900">₹{price.toLocaleString()}</span>
                  {discount && <>
                    <span className="text-slate-400 line-through text-lg">₹{course.price.toLocaleString()}</span>
                    <span className="badge-orange">{discount}% off</span>
                  </>}
                </div>
                {discount && <p className="text-red-500 text-xs font-semibold mb-4">⏰ Limited time offer!</p>}

                {isEnrolled ? (
                  <Link href={`/learn/${slug}`} className="btn-primary w-full py-4 text-center text-base mb-4">
                    <Play className="w-5 h-5 fill-white" /> Continue Learning
                  </Link>
                ) : (
                  <button onClick={handleEnroll} disabled={enrolling} className="btn-accent w-full py-4 text-base mb-4">
                    {enrolling ? 'Processing...' : 'Enroll Now — Pay Securely'}
                  </button>
                )}

                <p className="text-center text-xs text-slate-400 mb-5">
                  <Shield className="w-3 h-3 inline mr-1" />
                  30-day money-back guarantee
                </p>

                <div className="space-y-2 text-sm text-slate-600">
                  {[
                    { icon: BookOpen, text: `${course.totalLectures} lectures` },
                    { icon: Download, text: 'Downloadable notes & PDFs' },
                    { icon: Clock, text: 'Lifetime access' },
                    { icon: MessageCircle, text: 'Doubt support' },
                    { icon: CheckCircle, text: 'Certificate of completion' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-brand-500" /> {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
