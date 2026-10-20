import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getMyOrdersAction } from '@/app/actions/orders';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { Package, ArrowLeft, ArrowRight, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { formatPKR } from '@/lib/pricing';

export const revalidate = 0;

export default async function CustomerOrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?returnUrl=/account/orders');
  }

  const orders = await getMyOrdersAction();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-[#6FC69B]/20 text-[#6FC69B] border-[#6FC69B]/40';
      case 'SHIPPED':
        return 'bg-[#C6A15B]/20 text-[#E0BF78] border-[#C6A15B]/40';
      case 'PROCESSING':
        return 'bg-[#E2B765]/20 text-[#E2B765] border-[#E2B765]/40';
      case 'CANCELLED':
        return 'bg-[#E58A82]/20 text-[#E58A82] border-[#E58A82]/40';
      default:
        return 'bg-[#251B14] text-[#BDAE9D] border-[#3A2B20]';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#100C09] text-[#F7F0E6]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#8E7D6C]">
          <Link href="/account" className="hover:text-[#E0BF78] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Account</span>
          </Link>
          <span>/</span>
          <span className="text-[#BDAE9D]">Order History</span>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#C6A15B] font-semibold">
              Fulfillment Records
            </span>
            <h1 className="font-editorial text-3xl font-bold text-[#F7F0E6] mt-0.5">
              My Atelier Orders
            </h1>
            <p className="text-xs text-[#8E7D6C] mt-1">
              Historical ledger of your genuine leather acquisitions, item snapshots, and delivery progress.
            </p>
          </div>

          <span className="text-xs text-[#8E7D6C] self-start sm:self-auto">
            Total Orders: <strong className="text-[#F7F0E6]">{orders.length}</strong>
          </span>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#18120E] border border-[#3A2B20] space-y-4 shadow-xl">
            <Package className="w-12 h-12 text-[#8E7D6C] mx-auto opacity-70" />
            <div className="space-y-1">
              <h3 className="font-editorial text-xl font-bold text-[#F7F0E6]">
                No orders recorded
              </h3>
              <p className="text-xs text-[#8E7D6C] max-w-sm mx-auto">
                You have not placed any orders yet. Discover timeless pieces in the Kawish and Mooi ateliers.
              </p>
            </div>
            <Link
              href="/collections/kawish"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-opacity"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#3A2B20] border border-[#3A2B20] rounded-2xl overflow-hidden bg-[#18120E] shadow-xl">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-[#211811]/50 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-base font-bold text-[#E0BF78]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E7D6C]">
                    <span>Registered: {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{order.itemsCount} Item(s)</span>
                    <span>·</span>
                    <span>Dest: {order.city}</span>
                    <span>·</span>
                    <span>{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : order.paymentMethod}</span>
                  </div>

                  {order.notes && (
                    <p className="text-[11px] text-[#8E7D6C] italic">
                      &ldquo;{order.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#3A2B20]">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#8E7D6C] block">
                      Total Payable
                    </span>
                    <span className="font-mono font-bold text-[#F7F0E6] text-lg block">
                      {formatPKR(order.totalAmount)}
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#251B14] hover:bg-[#302217] text-[#C6A15B] hover:text-[#E0BF78] border border-[#3A2B20] text-xs font-semibold transition-colors"
                  >
                    <span>Inspect Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
