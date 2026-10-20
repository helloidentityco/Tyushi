'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { logoutUserAction } from '@/app/actions/auth';

export default function AccountLogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUserAction();
      router.push('/');
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#211811] hover:bg-[#2c1f16] text-[#BDAE9D] hover:text-[#E58A82] border border-[#3A2B20] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      <span>{isPending ? 'Signing out...' : 'Sign Out'}</span>
    </button>
  );
}
