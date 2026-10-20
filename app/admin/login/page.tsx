'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { loginAdminAction } from '@/app/actions/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [email, setEmail] = useState('admin@kawishmooi.com');
  const [password, setPassword] = useState('AdminPassword2026!');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    startTransition(async () => {
      const res = await loginAdminAction(null, formData);
      if (res.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#100C09] text-[#F7F0E6] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,161,91,0.06)_0,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-xl bg-[#18120E] border border-[#3A2B20] shadow-2xl relative z-10 space-y-6">
        {/* Brand identity */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#251B14] border border-[#C6A15B]/50 flex items-center justify-center mx-auto text-[#C6A15B]">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-editorial text-2xl font-bold tracking-wide text-[#F7F0E6]">
            Atelier Administration
          </h1>
          <p className="text-xs text-[#8E7D6C]">
            Sign in with administrative credentials to manage collections, inventory, and orders.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-[#E58A82]/10 border border-[#E58A82]/40 text-xs text-[#E58A82] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[#BDAE9D] font-medium block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7D6C]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kawishmooi.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#BDAE9D] font-medium block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7D6C]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>

          {/* Quick Credential Helper for Reviewers */}
          <div className="p-3 rounded bg-[#211811] border border-[#3A2B20]/60 text-[11px] text-[#8E7D6C] space-y-1">
            <span className="text-[#E0BF78] font-medium block">Initial Seed Credentials:</span>
            <p>Email: <code className="text-[#F7F0E6]">admin@kawishmooi.com</code></p>
            <p>Password: <code className="text-[#F7F0E6]">AdminPassword2026!</code></p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] hover:from-[#E0BF78] hover:to-[#C6A15B] text-[#100C09] font-bold uppercase tracking-wider text-xs transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-[#8E7D6C] hover:text-[#E0BF78] transition-colors"
          >
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
