import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getAdminProducts } from '@/app/actions/products';
import { db } from '@/db';
import * as schema from '@/db/schema';
import ProductManager from '@/components/admin/ProductManager';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [products, collections, categories] = await Promise.all([
    getAdminProducts(),
    db.select().from(schema.collections),
    db.select().from(schema.productCategories),
  ]);

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold">
          Inventory &amp; Catalogue
        </span>
        <h1 className="font-editorial text-3xl font-bold text-[#F7F0E6] mt-0.5">
          Product Catalogue Management
        </h1>
        <p className="text-xs text-[#8E7D6C] mt-1 max-w-2xl">
          Manage all artisan leather goods across Kawish and Mooi. Add high-resolution images, update pricing in PKR, specify leather grain details, and adjust inventory quantities.
        </p>
      </div>

      <ProductManager
        initialProducts={products as any}
        collections={collections}
        categories={categories}
      />
    </div>
  );
}
