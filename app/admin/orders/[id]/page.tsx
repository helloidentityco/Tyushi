import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getAdminOrderDetails } from '@/app/actions/orders';
import OrderDetailViewer from '@/components/admin/OrderDetailViewer';

export const revalidate = 0;

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const { id } = await params;
  const order = await getAdminOrderDetails(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold">
          Fulfillment Record
        </span>
        <h1 className="font-editorial text-3xl font-bold text-[#F7F0E6] mt-0.5">
          Order Inspection: {order.orderNumber}
        </h1>
      </div>

      <OrderDetailViewer order={order as any} />
    </div>
  );
}
