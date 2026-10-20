import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getAdminCollections } from '@/app/actions/collections';
import CollectionManager from '@/components/admin/CollectionManager';

export const revalidate = 0;

export default async function AdminCollectionsPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const collections = await getAdminCollections();

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold">
          Taxonomy Architecture
        </span>
        <h1 className="font-editorial text-3xl font-bold text-[#F7F0E6] mt-0.5">
          Collection Management
        </h1>
        <p className="text-xs text-[#8E7D6C] mt-1 max-w-2xl">
          Toggle storefront visibility for the Kawish and Mooi ateliers. Switching a collection OFF automatically removes it from public dropdowns, catalog listings, search, and checkout.
        </p>
      </div>

      <CollectionManager initialCollections={collections as any} />
    </div>
  );
}
