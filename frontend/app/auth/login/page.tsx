'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/authStore';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { login, setUser, setToken } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! 🎉');
      router.push(redirect);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    // In production, use Google Identity Services SDK
    setGoogleLoading(true);
    try {
      // This would be triggered by Google's button
      toast('Google login requires Google Identity Services setup', { icon: 'ℹ️' });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-white rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border-2 border-white rounded-2xl rotate-12" />
        </div>
        <div className="relative z-10 text-white text-center max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-brand-200 leading-relaxed">
            Log in to continue your learning journey. Access your courses, tests, and notes anytime.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['50K+','Students'], ['200+','Courses'], ['98%','Success']].map(([val, label]) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4">
                <div className="font-display font-bold text-2xl">{val}</div>
                <div className="text-brand-300 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">EduGeeks</span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Sign in to your account</h1>
          <p className="text-slate-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-brand-600 font-semibold hover:underline">Create one free</Link>
          </p>

          {/* Google Button */}
          <button onClick={handleGoogleLogin} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-slate-300 rounded-xl py-3 px-4 text-slate-700 font-semibold text-sm transition-all hover:bg-slate-50 mb-6 disabled:opacity-60">
            {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs text-slate-400 bg-white px-3">or sign in with email</div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input {...register('email')} type="email" placeholder="you@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5">
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
