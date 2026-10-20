import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getMyOrderDetailsAction } from '@/app/actions/orders';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { ArrowLeft, MapPin, Calendar, CheckCircle2, ShieldCheck, Clock, Truck, AlertCircle } from 'lucide-react';
import { formatPKR } from '@/lib/pricing';

export const revalidate = 0;

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerOrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?returnUrl=/account/orders');
  }

  const { id } = await params;
  let order = null;

  try {
    order = await getMyOrderDetailsAction(id);
  } catch {
    // Unauthorized access attempts will throw and be caught here
    redirect('/account/orders');
  }

  if (!order) {
    notFound();
  }

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

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs text-[#8E7D6C] hover:text-[#E0BF78] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All My Orders</span>
        </Link>

        {/* Order Main Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#18120E] border border-[#3A2B20] space-y-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#3A2B20]">
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#C6A15B] font-semibold block">
                Atelier Order Receipt
              </span>
              <h1 className="font-mono text-2xl font-bold text-[#E0BF78] mt-1">
                {order.orderNumber}
              </h1>
              <p className="text-xs text-[#8E7D6C] mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Placed on {new Date(order.createdAt).toLocaleString()}</span>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#8E7D6C] block">
                Fulfillment Status
              </span>
              <span
                className={`inline-block mt-1 text-xs uppercase font-bold tracking-wider px-3 py-1 rounded border ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#211811] border border-[#3A2B20] space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[#8E7D6C] font-semibold block">
                Recipient Details
              </span>
              <p className="text-sm font-semibold text-[#F7F0E6]">{order.customerName}</p>
              <p className="text-[#BDAE9D]">{order.email}</p>
              <p className="text-[#BDAE9D]">{order.phone}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#211811] border border-[#3A2B20] space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[#8E7D6C] font-semibold block">
                Delivery Coordinates
              </span>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#F7F0E6] font-medium">{order.shippingAddress}</p>
                  <p className="text-[#E0BF78] font-semibold">{order.city}, Pakistan</p>
                </div>
              </div>
              {order.notes && (
                <p className="text-[11px] text-[#8E7D6C] italic pt-1 border-t border-[#3A2B20]/60">
                  Note: &ldquo;{order.notes}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Purchased Items Snapshots */}
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8E7D6C] block">
              Ordered Products (Immutable Snapshots at Purchase)
            </span>

            <div className="divide-y divide-[#3A2B20] border border-[#3A2B20] rounded-xl overflow-hidden bg-[#211811]">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#F7F0E6] text-sm block">
                      {item.productNameSnapshot}
                    </span>
                    <span className="text-[11px] text-[#8E7D6C] block">
                      Collection: {item.collectionNameSnapshot} · Category: {item.categoryNameSnapshot}
                    </span>
                    <span className="text-[11px] text-[#BDAE9D] block">
                      Quantity: <strong className="text-[#F7F0E6]">{item.quantity}</strong> @ {formatPKR(item.unitPriceAtPurchase)}
                    </span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="font-mono font-bold text-[#E0BF78] text-sm block">
                      {formatPKR(item.lineTotal)}
                    </span>
                    {Number(item.discountAmountAtPurchase) > 0 && (
                      <span className="text-[10px] text-[#6FC69B] block">
                        Saved {formatPKR(item.discountAmountAtPurchase)} / item
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-5 rounded-xl bg-[#211811] border border-[#3A2B20] space-y-2 text-xs max-w-sm ml-auto shadow-inner">
            <div className="flex justify-between text-[#BDAE9D]">
              <span>Catalogue Subtotal</span>
              <span className="font-mono">{formatPKR(order.subtotal)}</span>
            </div>
            {Number(order.discountTotal) > 0 && (
              <div className="flex justify-between text-[#6FC69B] font-medium">
                <span>Promotional Savings</span>
                <span className="font-mono">-{formatPKR(order.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#BDAE9D]">
              <span>Nationwide Delivery</span>
              <span className="text-[#E0BF78]">Complimentary</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#F7F0E6] pt-3 border-t border-[#3A2B20]">
              <span>Total Payable</span>
              <span className="text-base text-[#E0BF78] font-editorial">
                {formatPKR(order.totalAmount)}
              </span>
            </div>
            <p className="text-[10px] text-[#8E7D6C] text-right pt-1">
              Payment Method: {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery (COD)' : order.paymentMethod}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
