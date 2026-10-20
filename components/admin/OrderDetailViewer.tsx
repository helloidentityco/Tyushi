'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { updateOrderStatusAction } from '@/app/actions/orders';
import { formatPKR } from '@/lib/pricing';

interface OrderDetailViewerProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    email: string;
    phone: string;
    city: string;
    shippingAddress: string;
    notes?: string | null;
    subtotal: string;
    discountTotal: string;
    shippingFee: string;
    totalAmount: string;
    paymentMethod: string;
    status: string;
    createdAt: any;
    items: Array<{
      id: string;
      productNameSnapshot: string;
      productSlugSnapshot: string;
      collectionNameSnapshot: string;
      categoryNameSnapshot: string;
      quantity: number;
      unitPriceAtPurchase: string;
      discountAmountAtPurchase: string;
      lineTotal: string;
    }>;
  };
}

export default function OrderDetailViewer({ order }: OrderDetailViewerProps) {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        setFeedback({ type: 'success', message: `Order status updated to ${newStatus}.` });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update order status.' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-[#8E7D6C] hover:text-[#E0BF78] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>

        {/* Status Mutator */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8E7D6C]">Update Fulfillment Status:</span>
          <select
            value={currentStatus}
            disabled={isPending}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="py-1.5 px-3 text-xs rounded bg-[#211811] border border-[#3A2B20] text-[#E0BF78] font-semibold focus:outline-none focus:border-[#C6A15B]"
          >
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          {isPending && <Loader2 className="w-4 h-4 animate-spin text-[#C6A15B]" />}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-xs flex items-start gap-3 ${
            feedback.type === 'success'
              ? 'bg-[#6FC69B]/10 border border-[#6FC69B]/40 text-[#6FC69B]'
              : 'bg-[#E58A82]/10 border border-[#E58A82]/40 text-[#E58A82]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Order Card */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-8 shadow-xl">
        {/* Header reference */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#3A2B20]">
          <div>
            <span className="text-xs text-[#8E7D6C] block">Master Order Reference</span>
            <h2 className="font-mono text-2xl font-bold text-[#E0BF78] mt-0.5">
              {order.orderNumber}
            </h2>
            <span className="text-xs text-[#8E7D6C] flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Registered on {new Date(order.createdAt).toLocaleString()}</span>
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#8E7D6C] block">Fulfillment Status</span>
            <span className="inline-block mt-1 text-xs uppercase font-bold tracking-wider px-3 py-1 rounded bg-[#251B14] text-[#E0BF78] border border-[#3A2B20]">
              {currentStatus}
            </span>
          </div>
        </div>

        {/* Customer & Shipping Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#3A2B20] text-xs">
          <div className="space-y-2 p-4 rounded-lg bg-[#211811] border border-[#3A2B20]">
            <span className="text-[#8E7D6C] uppercase tracking-wider font-semibold block">
              Customer Profile
            </span>
            <div className="space-y-1 text-[#BDAE9D]">
              <p className="text-sm font-semibold text-[#F7F0E6]">{order.customerName}</p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>{order.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>{order.phone}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-[#211811] border border-[#3A2B20]">
            <span className="text-[#8E7D6C] uppercase tracking-wider font-semibold block">
              Delivery Coordinates
            </span>
            <div className="space-y-1 text-[#BDAE9D]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#F7F0E6] font-medium">{order.shippingAddress}</p>
                  <p className="font-semibold text-[#E0BF78]">{order.city}, Pakistan</p>
                </div>
              </div>
              {order.notes && (
                <p className="text-[11px] text-[#8E7D6C] pt-2 border-t border-[#3A2B20]/60">
                  Customer Delivery Note: &ldquo;{order.notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Item Snapshots */}
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8E7D6C] block">
            Purchased Item Snapshots (Immutable Historical Record)
          </span>

          <div className="divide-y divide-[#3A2B20]/60 border border-[#3A2B20] rounded-lg overflow-hidden bg-[#211811]">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-semibold text-[#F7F0E6] text-sm block">
                    {item.productNameSnapshot}
                  </span>
                  <span className="text-[11px] text-[#8E7D6C] block mt-0.5">
                    {item.collectionNameSnapshot} Atelier · {item.categoryNameSnapshot} · Slug: {item.productSlugSnapshot}
                  </span>
                  <span className="text-[11px] text-[#BDAE9D] block mt-0.5">
                    Quantity: <strong className="text-[#F7F0E6]">{item.quantity}</strong> @ {formatPKR(item.unitPriceAtPurchase)} unit catalogue price
                  </span>
                </div>

                <div className="text-right">
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

        {/* Totals Breakdown */}
        <div className="p-4 rounded-lg bg-[#211811] border border-[#3A2B20] space-y-2 text-xs max-w-sm ml-auto">
          <div className="flex justify-between text-[#BDAE9D]">
            <span>Catalogue Subtotal</span>
            <span>{formatPKR(order.subtotal)}</span>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div className="flex justify-between text-[#6FC69B] font-medium">
              <span>Promotions Deducted</span>
              <span>-{formatPKR(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#BDAE9D]">
            <span>Shipping Fee</span>
            <span className="text-[#E0BF78]">Complimentary</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#F7F0E6] pt-2 border-t border-[#3A2B20]">
            <span>Total Payable Amount</span>
            <span className="text-base text-[#E0BF78] font-editorial">
              {formatPKR(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
