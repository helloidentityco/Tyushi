import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getAdminDiscounts } from '@/app/actions/discounts';
import { db } from '@/db';
import * as schema from '@/db/schema';
import DiscountManager from '@/components/admin/DiscountManager';

export const revalidate = 0;

export default async function AdminDiscountsPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [discounts, collections, categories, rawProducts] = await Promise.all([
    getAdminDiscounts(),
    db.select().from(schema.collections),
    db.select().from(schema.productCategories),
    db.select({
      id: schema.products.id,
      name: schema.products.name,
      collectionId: schema.products.collectionId,
      categoryId: schema.products.categoryId,
      price: schema.products.price,
    }).from(schema.products),
  ]);

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold">
          Commercial Promotions
        </span>
        <h1 className="font-editorial text-3xl font-bold text-[#F7F0E6] mt-0.5">
          Promotional Discount Management
        </h1>
        <p className="text-xs text-[#8E7D6C] mt-1 max-w-2xl">
          Configure collection-wide or category-specific percentage discounts. When a product is eligible for both a collection and a category discount, the category-specific promotion takes precedence without stacking.
        </p>
      </div>

      <DiscountManager
        initialDiscounts={discounts as any}
        collections={collections}
        categories={categories}
        products={rawProducts}
      />
    </div>
  );
}
