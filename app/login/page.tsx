'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { loginUserAction } from '@/app/actions/auth';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    startTransition(async () => {
      const res = await loginUserAction(null, formData);
      if (res.success && res.user) {
        // If user is Admin and no specific returnUrl was requested, go to admin dashboard
        if (res.user.role === 'ADMIN' && (!searchParams.get('returnUrl') || returnUrl === '/account')) {
          router.push('/admin');
        } else {
          router.push(returnUrl);
        }
        router.refresh();
      } else {
        setError(res.error || 'Failed to authenticate. Please check your credentials.');
      }
    });
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-[#18120E] border border-[#3A2B20] shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#C6A15B] font-semibold">
          TYUSHI Atelier Client Access
        </span>
        <h1 className="font-editorial text-3xl font-bold text-[#F7F0E6]">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-[#8E7D6C] max-w-xs mx-auto">
          Access your past bespoke orders, track fulfillment, and checkout with preserved artisan cart items.
        </p>
      </div>

      {returnUrl && returnUrl.includes('checkout') && (
        <div className="p-3 rounded-lg bg-[#C6A15B]/10 border border-[#C6A15B]/30 text-xs text-[#E0BF78] flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-[#C6A15B]" />
          <span>Please sign in or create an account to finalize your order. Your cart items are preserved.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-[#E58A82]/10 border border-[#E58A82]/40 text-xs text-[#E58A82] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="text-[#BDAE9D] font-medium block">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E7D6C]" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@tyushi.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[#BDAE9D] font-medium block">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E7D6C]" />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-lg shadow-[#C6A15B]/15 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to TYUSHI</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-[#3A2B20] text-center space-y-2">
        <p className="text-xs text-[#8E7D6C]">
          New to TYUSHI?{' '}
          <Link
            href={`/signup${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
            className="text-[#E0BF78] hover:text-[#C6A15B] font-medium transition-colors ml-1 underline underline-offset-4"
          >
            Create an Atelier Account
          </Link>
        </p>
        <p className="text-[11px] text-[#8E7D6C]/80 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>Encrypted 256-bit JWT Session Architecture</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#100C09] text-[#F7F0E6]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-28 pb-16">
        <Suspense fallback={<div className="text-xs text-[#8E7D6C]">Loading authentication portal...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
