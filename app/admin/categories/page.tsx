import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getAdminCategories } from '@/app/actions/categories';
import CategoryManager from '@/components/admin/CategoryManager';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const categories = await getAdminCategories();

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold">
          Taxonomy Architecture
        </span>
        <h1 className="font-editorial text-3xl font-bold text-[#F7F0E6] mt-0.5">
          Category Management
        </h1>
        <p className="text-xs text-[#8E7D6C] mt-1 max-w-2xl">
          Categories are shared across Kawish and Mooi. Deleting or renaming a category does not affect the identity of either collection.
        </p>
      </div>

      <CategoryManager initialCategories={categories as any} />
    </div>
  );
}
