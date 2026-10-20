import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Layers,
  Percent,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { count, eq, ne, desc } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth';
import { formatPKR } from '@/lib/pricing';

export const revalidate = 0; // Always fresh for admin metrics

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  // Fetch real database metrics
  const [
    allOrders,
    productsCountResult,
    collectionsData,
    activeDiscountsResult,
  ] = await Promise.all([
    db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(10),
    db.select({ count: count() }).from(schema.products),
    db.select().from(schema.collections),
    db.select({ count: count() }).from(schema.discounts).where(eq(schema.discounts.isActive, true)),
  ]);

  // Total orders
  const totalOrdersCount = allOrders.length;

  // Total revenue (excluding CANCELLED orders)
  const validOrders = allOrders.filter((o: any) => o.status !== 'CANCELLED');
  const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0);

  // Pending orders count
  const pendingOrdersCount = allOrders.filter((o: any) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold">
            Administrative Control Center
          </span>
          <h1 className="font-editorial text-3xl font-bold text-[#F7F0E6] mt-0.5">
            Atelier Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] text-xs font-bold uppercase tracking-wider"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/discounts"
            className="px-4 py-2 rounded bg-[#251B14] hover:bg-[#302217] text-[#E0BF78] border border-[#3A2B20] text-xs font-bold uppercase tracking-wider"
          >
            Manage Discounts
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-2">
          <div className="flex items-center justify-between text-[#8E7D6C]">
            <span className="text-[11px] uppercase tracking-wider">Revenue</span>
            <DollarSign className="w-4 h-4 text-[#C6A15B]" />
          </div>
          <div className="text-xl font-bold text-[#E0BF78] font-editorial">
            {formatPKR(totalRevenue)}
          </div>
          <span className="text-[10px] text-[#8E7D6C] block">Delivered &amp; Active</span>
        </div>

        {/* Total Orders */}
        <div className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-2">
          <div className="flex items-center justify-between text-[#8E7D6C]">
            <span className="text-[11px] uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#C6A15B]" />
          </div>
          <div className="text-xl font-bold text-[#F7F0E6] font-editorial">
            {totalOrdersCount}
          </div>
          <span className="text-[10px] text-[#8E7D6C] block">Lifetime book records</span>
        </div>

        {/* Pending Orders */}
        <div className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-2">
          <div className="flex items-center justify-between text-[#8E7D6C]">
            <span className="text-[11px] uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-[#E2B765]" />
          </div>
          <div className="text-xl font-bold text-[#E2B765] font-editorial">
            {pendingOrdersCount}
          </div>
          <span className="text-[10px] text-[#8E7D6C] block">Awaiting fulfillment</span>
        </div>

        {/* Products */}
        <div className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-2">
          <div className="flex items-center justify-between text-[#8E7D6C]">
            <span className="text-[11px] uppercase tracking-wider">Catalogued</span>
            <Package className="w-4 h-4 text-[#C6A15B]" />
          </div>
          <div className="text-xl font-bold text-[#F7F0E6] font-editorial">
            {productsCountResult[0]?.count || 0}
          </div>
          <span className="text-[10px] text-[#8E7D6C] block">Active creations</span>
        </div>

        {/* Collections */}
        <div className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-2">
          <div className="flex items-center justify-between text-[#8E7D6C]">
            <span className="text-[11px] uppercase tracking-wider">Collections</span>
            <Layers className="w-4 h-4 text-[#C6A15B]" />
          </div>
          <div className="text-xl font-bold text-[#F7F0E6] font-editorial">
            {collectionsData.length}
          </div>
          <span className="text-[10px] text-[#8E7D6C] block">Kawish &amp; Mooi</span>
        </div>

        {/* Active Promotions */}
        <div className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-2">
          <div className="flex items-center justify-between text-[#8E7D6C]">
            <span className="text-[11px] uppercase tracking-wider">Promotions</span>
            <Percent className="w-4 h-4 text-[#6FC69B]" />
          </div>
          <div className="text-xl font-bold text-[#6FC69B] font-editorial">
            {activeDiscountsResult[0]?.count || 0}
          </div>
          <span className="text-[10px] text-[#8E7D6C] block">Currently effective</span>
        </div>
      </div>

      {/* Collection Quick Visibility Status */}
      <div className="p-6 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#F7F0E6]">
              Storefront Collection Visibility
            </h3>
            <p className="text-xs text-[#8E7D6C]">
              Enforces public availability across storefront navigation, product listings, and purchasing.
            </p>
          </div>
          <Link
            href="/admin/collections"
            className="text-xs uppercase tracking-wider text-[#C6A15B] hover:text-[#E0BF78] font-semibold"
          >
            Configure →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {collectionsData.map((col) => (
            <div
              key={col.id}
              className="p-4 rounded-lg bg-[#211811] border border-[#3A2B20] flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-[#F7F0E6]">{col.name} Atelier</span>
                  {col.isPremium && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#C6A15B]/20 text-[#E0BF78] font-semibold border border-[#C6A15B]/30">
                      PREMIUM
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#8E7D6C]">/{col.slug}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded ${
                    col.isVisible
                      ? 'bg-[#6FC69B]/20 text-[#6FC69B] border border-[#6FC69B]/40'
                      : 'bg-[#E58A82]/20 text-[#E58A82] border border-[#E58A82]/40'
                  }`}
                >
                  {col.isVisible ? 'Visible ON' : 'Hidden OFF'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="p-6 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-editorial text-lg font-bold text-[#F7F0E6]">
            Recent Orders
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-wider text-[#C6A15B] hover:text-[#E0BF78] font-semibold"
          >
            View All Orders →
          </Link>
        </div>

        {allOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8E7D6C]">
            No orders registered yet. Customer orders will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#211811] text-[#8E7D6C] uppercase tracking-wider border-b border-[#3A2B20]">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A2B20]/60 text-[#BDAE9D]">
                {allOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#211811]/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#E0BF78]">
                      {order.orderNumber}
                    </td>
                    <td className="p-3 font-medium text-[#F7F0E6]">
                      {order.customerName}
                    </td>
                    <td className="p-3">{order.city}</td>
                    <td className="p-3 text-[#8E7D6C]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold text-[#F7F0E6]">
                      {formatPKR(order.totalAmount)}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#251B14] text-[#E0BF78] border border-[#3A2B20]">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-1.5 rounded hover:bg-[#251B14] text-[#C6A15B] inline-block"
                        title="Inspect Order"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
