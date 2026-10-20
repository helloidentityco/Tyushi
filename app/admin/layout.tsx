import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getCurrentSession } from '@/lib/auth';
import { ensureDbReady } from '@/lib/queries/storefront';

export const metadata = {
  title: 'Admin Atelier Management | Kawish & Mooi',
  description: 'Administrative portal for collections, categories, inventory, discounts, and order fulfillment.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureDbReady();
  const session = await getCurrentSession();

  return (
    <div className="min-h-screen bg-[#100C09] text-[#F7F0E6] flex flex-col md:flex-row">
      <AdminSidebar adminEmail={session?.email} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen bg-[#140F0B]">
        {children}
      </div>
    </div>
  );
}
