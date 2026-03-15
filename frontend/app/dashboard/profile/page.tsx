'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, GraduationCap, Camera, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const GRADES = [
  { value: 'CLASS_9', label: 'Class 9' },
  { value: 'CLASS_10', label: 'Class 10' },
  { value: 'CLASS_11', label: 'Class 11' },
  { value: 'CLASS_12', label: 'Class 12' },
];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      grade: user?.grade || '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await api.patch('/auth/me', data);
      setUser(res.data.user);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <h1 className="font-display text-2xl font-bold text-slate-900">My Profile</h1>

      {/* Avatar */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-3xl">
              {user?.name?.[0] || 'S'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <Camera className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${user?.isVerified ? 'badge-green' : 'badge-gray'}`}>
                <Shield className="w-3 h-3" />
                {user?.isVerified ? 'Verified' : 'Unverified'}
              </span>
              {user?.grade && (
                <span className="badge-blue">
                  {user.grade.replace('CLASS_', 'Class ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-slate-900">Personal Information</h3>
          <button
            onClick={() => setEditMode(!editMode)}
            className={editMode ? 'btn-ghost text-sm text-red-500' : 'btn-outline text-sm'}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register('name')} className="input" placeholder="Your full name" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input {...register('phone')} className="input" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label className="label">Class</label>
              <select {...register('grade')} className="input">
                <option value="">Select class</option>
                {GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {[
              { icon: User, label: 'Name', value: user?.name || '–' },
              { icon: Mail, label: 'Email', value: user?.email || '–' },
              { icon: Phone, label: 'Phone', value: user?.phone || 'Not set' },
              { icon: GraduationCap, label: 'Class', value: user?.grade ? user.grade.replace('CLASS_', 'Class ') : 'Not set' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{label}</p>
                  <p className="text-slate-800 font-medium text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-slate-900 mb-4">Security</h3>
        <button className="btn-outline text-sm w-full justify-center">
          <Shield className="w-4 h-4" /> Change Password
        </button>
      </div>
    </div>
  );
}
