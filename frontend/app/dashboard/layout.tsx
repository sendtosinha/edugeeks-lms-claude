'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import Navbar from '@/components/layout/Navbar';
import {
  LayoutDashboard, BookOpen, ClipboardList,
  FileText, BarChart2, User, LogOut, ChevronRight
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'My Courses', href: '/dashboard/courses' },
  { icon: ClipboardList, label: 'Test Results', href: '/dashboard/tests' },
  { icon: BarChart2, label: 'Progress', href: '/dashboard/progress' },
  { icon: FileText, label: 'My Notes', href: '/dashboard/notes' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, fetchMe } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user === null) {
      // Give time for hydration
      const t = setTimeout(() => {
        const stored = localStorage.getItem('edugeeks-auth');
        if (!stored || !JSON.parse(stored)?.state?.token) {
          router.push('/auth/login?redirect=/dashboard');
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="container-xl py-8">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-60 shrink-0">
              {/* User Card */}
              <div className="card p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold">
                    {user?.name?.[0] || 'S'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400">
                      {user?.grade ? `Class ${user.grade.replace('CLASS_', '')}` : 'Student'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="card p-2 flex-1">
                <ul className="space-y-0.5">
                  {SIDEBAR_LINKS.map(({ icon: Icon, label, href }) => {
                    const active = pathname === href;
                    return (
                      <li key={href}>
                        <Link href={href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            active
                              ? 'bg-brand-600 text-white shadow-brand'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}>
                          <Icon className="w-4 h-4" />
                          {label}
                          {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="border-t border-slate-100 mt-2 pt-2">
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
