'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import {
  Users, BookOpen, DollarSign, TrendingUp, BarChart2,
  Settings, Upload, Plus, Eye, Edit, Trash2, ToggleLeft,
  ToggleRight, Search, Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Tab = 'overview' | 'courses' | 'students' | 'revenue' | 'blog';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.push('/dashboard');
  }, [user]);

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
    enabled: user?.role === 'ADMIN',
  });

  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses', search],
    queryFn: () => api.get(`/courses?limit=20${search ? `&search=${search}` : ''}`).then(r => r.data),
    enabled: activeTab === 'courses' && user?.role === 'ADMIN',
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => api.get(`/admin/users?limit=20${search ? `&search=${search}` : ''}`).then(r => r.data),
    enabled: activeTab === 'students' && user?.role === 'ADMIN',
  });

  const { data: revenueData } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => api.get('/admin/revenue?period=30').then(r => r.data),
    enabled: activeTab === 'revenue' && user?.role === 'ADMIN',
  });

  const stats = statsData?.stats || {};

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'blog', label: 'Blog', icon: Edit },
  ];

  const togglePublish = async (courseId: string) => {
    await api.patch(`/admin/courses/${courseId}/toggle-publish`);
    // Refetch
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container-xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-slate-500 text-sm">Manage your EduGeeks platform</p>
          </div>
          <button className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-slate-200 mb-8 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-brand-600 text-white shadow-brand'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Total Students', value: stats.totalStudents?.toLocaleString() || '0', change: '+12%', color: 'text-brand-600 bg-brand-100' },
                { icon: BookOpen, label: 'Active Courses', value: stats.totalCourses || '0', change: '+3', color: 'text-purple-600 bg-purple-100' },
                { icon: DollarSign, label: 'Total Revenue', value: `₹${((stats.totalRevenue || 0) / 1000).toFixed(0)}K`, change: '+18%', color: 'text-green-600 bg-green-100' },
                { icon: TrendingUp, label: 'This Month', value: '₹24.5K', change: '+8%', color: 'text-amber-600 bg-amber-100' },
              ].map(({ icon: Icon, label, value, change, color }) => (
                <div key={label} className="card p-5">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-display font-bold text-2xl text-slate-900">{value}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{label}</div>
                  <div className="text-green-600 text-xs font-semibold mt-1">{change} this month</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display font-semibold text-slate-900 mb-5">Enrollments (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.enrollmentsByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6">
                <h3 className="font-display font-semibold text-slate-900 mb-5">Top Courses</h3>
                <div className="space-y-3">
                  {(stats.topCourses || []).slice(0, 5).map((c: any, i: number) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{c.title}</p>
                        <p className="text-xs text-slate-500">{c._count?.enrollments} enrollments</p>
                      </div>
                      <span className="text-sm font-bold text-slate-700">₹{(c.price || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-900 mb-5">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {['Student', 'Course', 'Amount', 'Date', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.recentOrders || []).map((order: any) => (
                      <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium text-slate-800">{order.user?.name}</p>
                            <p className="text-xs text-slate-400">{order.user?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600 text-xs">
                          {order.items?.[0]?.course?.title}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-slate-900">₹{order.amount}</td>
                        <td className="py-3 pr-4 text-slate-500 text-xs">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3">
                          <span className="badge-green">Captured</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search courses..." className="input pl-9 text-sm" />
              </div>
              <button className="btn-primary text-sm"><Plus className="w-4 h-4" /> New Course</button>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Course', 'Grade', 'Price', 'Students', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(coursesData?.courses || []).map((course: any) => (
                    <tr key={course.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 line-clamp-1">{course.title}</p>
                        <p className="text-xs text-slate-400">{course.instructor?.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="badge-blue">{course.grade?.replace('CLASS_', 'Class ')}</span>
                      </td>
                      <td className="px-5 py-4 font-semibold">₹{(course.discountPrice || course.price)?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-600">{course._count?.enrollments || 0}</td>
                      <td className="px-5 py-4">
                        <span className={course.isPublished ? 'badge-green' : 'badge-gray'}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button className="btn-ghost p-2"><Eye className="w-4 h-4" /></button>
                          <button className="btn-ghost p-2"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => togglePublish(course.id)} className="btn-ghost p-2">
                            {course.isPublished
                              ? <ToggleRight className="w-4 h-4 text-green-500" />
                              : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                          </button>
                          <button className="btn-ghost p-2 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-5 animate-fade-in">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search students..." className="input pl-9 text-sm" />
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Student', 'Class', 'Enrollments', 'Joined', 'Verified', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(usersData?.users || []).map((u: any) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{u.grade?.replace('CLASS_', 'Class ') || '–'}</td>
                      <td className="px-5 py-4 text-slate-600">{u._count?.enrollments || 0}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={u.isVerified ? 'badge-green' : 'badge-gray'}>
                          {u.isVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button className="btn-ghost p-2"><Eye className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6 animate-fade-in">
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-900 mb-5">Revenue (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData?.revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => `₹${v}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
