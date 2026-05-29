'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Gift, Mail, Lock, User, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      toast.success('Registration successful! Welcome to Coupon Genie.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-grow flex items-center justify-center py-16 px-4 relative">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none z-0" />

      {/* Register Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl bg-card-bg border border-border-color shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl mb-3 text-white">
            <Gift className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">Create Account</h2>
          <p className="text-xs text-gray-500 mt-1">
            Sign up to bookmark verified discount coupons and view history.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 text-gray-500 h-4 w-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Genie Coder"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white glass-input focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-gray-500 h-4 w-4 pointer-events-none" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white glass-input focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Password (min 6 chars)
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-gray-500 h-4 w-4 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white glass-input focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 btn-primary rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 pt-6 border-t border-white/5 text-xs text-gray-500 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
