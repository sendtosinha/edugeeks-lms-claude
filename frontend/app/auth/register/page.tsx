'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/authStore';
import { BookOpen, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  grade: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

const GRADES = [
  { value: 'CLASS_9', label: 'Class 9' },
  { value: 'CLASS_10', label: 'Class 10' },
  { value: 'CLASS_11', label: 'Class 11' },
  { value: 'CLASS_12', label: 'Class 12' },
];

const PERKS = [
  'Free access to sample lectures',
  'Chapter-wise study material',
  'Track your learning progress',
  'Join doubt-solving community',
];

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await api.post('/auth/register', data);
      setUser(res.data.user);
      setToken(res.data.accessToken);
      toast.success('Account created! Welcome to EduGeeks 🎉');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-500 to-accent-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/3 w-72 h-72 border-2 border-white rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 border-2 border-white rounded-3xl rotate-45" />
        </div>
        <div className="relative z-10 text-white max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-8">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">Join EduGeeks Today!</h2>
          <p className="text-orange-100 leading-relaxed mb-8">
            Start your journey toward academic excellence. Access India's best CBSE and competitive exam content.
          </p>
          <ul className="space-y-3">
            {PERKS.map(p => (
              <li key={p} className="flex items-center gap-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-white shrink-0" />
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">EduGeeks</span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Create your free account</h1>
          <p className="text-slate-500 text-sm mb-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input {...register('name')} type="text" placeholder="Your full name"
                className={`input ${errors.name ? 'input-error' : ''}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email Address</label>
              <input {...register('email')} type="email" placeholder="you@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">I'm studying in (optional)</label>
              <select {...register('grade')} className="input">
                <option value="">Select your class</option>
                {GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-accent w-full py-3.5">
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</> : 'Create Free Account'}
            </button>

            <p className="text-xs text-slate-400 text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
