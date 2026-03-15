'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import {
  BookOpen, ChevronDown, Menu, X, User, LogOut,
  LayoutDashboard, Shield, Bell, Search
} from 'lucide-react';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Courses', href: '/courses' },
  { label: 'Test Series', href: '/test-series' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

const GRADE_LINKS = [
  { label: 'Class 9', href: '/courses?grade=CLASS_9' },
  { label: 'Class 10', href: '/courses?grade=CLASS_10' },
  { label: 'Class 11', href: '/courses?grade=CLASS_11' },
  { label: 'Class 12', href: '/courses?grade=CLASS_12' },
];

const EXAM_LINKS = [
  { label: 'JEE Preparation', href: '/courses?exam=JEE' },
  { label: 'NEET Preparation', href: '/courses?exam=NEET' },
  { label: 'CUET Preparation', href: '/courses?exam=CUET' },
  { label: 'CBSE Board', href: '/courses?exam=CBSE' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-white'
    }`}>
      <div className="container-xl">
        <nav className="flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-brand">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">
              Edu<span className="gradient-text">Geeks</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 flex-1">
            {/* Courses Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors">
                Courses <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-3">
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">By Class</p>
                    {GRADE_LINKS.map(l => (
                      <Link key={l.href} href={l.href} className="block px-3 py-2 text-sm text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">{l.label}</Link>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">By Exam</p>
                    {EXAM_LINKS.map(l => (
                      <Link key={l.href} href={l.href} className="block px-3 py-2 text-sm text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">{l.label}</Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {NAV_LINKS.slice(1).map(l => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(l.href) ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <button className="btn-ghost text-slate-500">
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {user.avatar ? <Image src={user.avatar} alt={user.name} width={32} height={32} className="rounded-full" /> : user.name[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/dashboard/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                        <Shield className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm">Log in</Link>
                <Link href="/auth/register" className="btn-primary text-sm py-2.5">
                  Start Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden ml-auto p-2 rounded-lg hover:bg-slate-100 transition-colors">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 py-4 space-y-1 animate-slide-up">
            {[...GRADE_LINKS, ...EXAM_LINKS, ...NAV_LINKS.slice(1)].map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors font-medium">
                {l.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 px-4">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-outline w-full justify-center text-red-600 border-red-200 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-outline w-full justify-center">Log in</Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center">Start Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
