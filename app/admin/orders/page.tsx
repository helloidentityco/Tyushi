import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getAdminOrders } from '@/app/actions/orders';
import OrderList from '@/components/admin/OrderList';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const orders = await getAdminOrders();

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold">
          Fulfillment &amp; Commerce
        </span>
        <h1 className="font-editorial text-3xl font-bold text-[#F7F0E6] mt-0.5">
          Order Management Ledger
        </h1>
        <p className="text-xs text-[#8E7D6C] mt-1 max-w-2xl">
          Complete ledger of verified customer orders with purchase snapshots, courier coordinates, and status lifecycle management.
        </p>
      </div>

      <OrderList initialOrders={orders as any} />
    </div>
  );
}
