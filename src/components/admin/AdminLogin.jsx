import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LockKeyhole, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

const initialForm = {
  email: '',
  password: '',
};

export default function AdminLogin() {
  const { isAuthenticated, isLoadingAuth, login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoadingAuth && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(form);
      toast.success('Welcome back.');
    } catch (error) {
      toast.error(error.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-6 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#D9E5DE] bg-white p-8 shadow-[0_24px_80px_rgba(0,95,84,0.12)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#005F54] text-white">
            <LockKeyhole size={24} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#005F54]">Admin Access</p>
          <h1 className="font-serif text-3xl font-bold text-[#1A2421]">Doctor Dashboard</h1>
          <p className="mt-3 text-sm text-[#4A6B63]">Sign in with your admin credentials to manage the site.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#4A6B63]">Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-[#D9E5DE] bg-[#F9FBFA] px-4 py-3 text-sm text-[#1A2421] outline-none transition-colors focus:border-[#005F54]"
              placeholder="doctor@clinic.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#4A6B63]">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-2xl border border-[#D9E5DE] bg-[#F9FBFA] px-4 py-3 text-sm text-[#1A2421] outline-none transition-colors focus:border-[#005F54]"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || isLoadingAuth}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#005F54] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#004740] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={16} />
            {submitting || isLoadingAuth ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
