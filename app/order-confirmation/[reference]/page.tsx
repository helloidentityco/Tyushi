import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, PackageCheck, MapPin, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { getOrderConfirmation } from '@/app/actions/orders';
import { formatPKR } from '@/lib/pricing';
import type { Metadata } from 'next';

interface OrderConfirmationPageProps {
  params: Promise<{ reference: string }>;
}

export async function generateMetadata({ params }: OrderConfirmationPageProps): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Order ${reference} Confirmed | Kawish & Mooi`,
    description: 'Thank you for your order with Kawish & Mooi Genuine Leather Atelier.',
  };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { reference } = await params;
  const order = await getOrderConfirmation(reference);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#100C09] text-[#F7F0E6]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 w-full space-y-10">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#6FC69B]/10 border border-[#6FC69B]/40 flex items-center justify-center mx-auto text-[#6FC69B]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold block">
            Atelier Order Confirmed
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#F7F0E6]">
            Thank You, {order.customerName}
          </h1>
          <p className="text-sm text-[#BDAE9D] max-w-lg mx-auto">
            Your handcrafted order has been registered in our workshop ledger under reference:
          </p>
          <div className="inline-block px-4 py-2 rounded-lg bg-[#18120E] border border-[#C6A15B]/50 font-mono text-sm text-[#E0BF78] font-bold">
            {order.orderNumber}
          </div>
        </div>

        {/* Order Details Card */}
        <div className="p-6 sm:p-8 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-8 shadow-2xl">
          {/* Status & Method */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#3A2B20]">
            <div>
              <span className="text-xs text-[#8E7D6C] block">Current Fulfillment Status</span>
              <span className="inline-block mt-1 text-xs uppercase font-bold tracking-wider px-3 py-1 rounded bg-[#6FC69B]/20 text-[#6FC69B] border border-[#6FC69B]/40">
                {order.status}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#8E7D6C] block">Payment Terms</span>
              <span className="text-xs font-semibold text-[#E0BF78] mt-1 block">
                Cash on Delivery (Pay upon delivery)
              </span>
            </div>
          </div>

          {/* Delivery Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-6 border-b border-[#3A2B20]">
            <div className="space-y-2">
              <span className="text-[#8E7D6C] uppercase tracking-wider font-semibold block">
                Shipping Destination
              </span>
              <div className="text-[#BDAE9D] flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#F7F0E6] font-medium">{order.customerName}</p>
                  <p>{order.shippingAddress}</p>
                  <p className="font-medium text-[#E0BF78]">{order.city}, Pakistan</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[#8E7D6C] uppercase tracking-wider font-semibold block">
                Contact Credentials
              </span>
              <div className="space-y-1 text-[#BDAE9D]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>{order.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>{order.phone}</span>
                </div>
                {order.notes && (
                  <p className="pt-2 text-[11px] text-[#8E7D6C]">
                    Instructions: &ldquo;{order.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Item Snapshots */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8E7D6C] block">
              Purchased Creations Snapshot
            </span>

            <div className="divide-y divide-[#3A2B20]/60">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-medium text-[#F7F0E6] block">
                      {item.productNameSnapshot}
                    </span>
                    <span className="text-[11px] text-[#8E7D6C]">
                      {item.collectionNameSnapshot} · {item.categoryNameSnapshot} · Qty: {item.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[#E0BF78] block">
                      {formatPKR(item.lineTotal)}
                    </span>
                    <span className="text-[10px] text-[#8E7D6C]">
                      @{formatPKR(item.unitPriceAtPurchase)} each
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="pt-6 border-t border-[#3A2B20] space-y-2 text-xs">
            <div className="flex justify-between text-[#BDAE9D]">
              <span>Subtotal</span>
              <span>{formatPKR(order.subtotal)}</span>
            </div>
            {Number(order.discountTotal) > 0 && (
              <div className="flex justify-between text-[#6FC69B] font-medium">
                <span>Promotional Reductions</span>
                <span>-{formatPKR(order.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#BDAE9D]">
              <span>Shipping &amp; Insurance</span>
              <span className="text-[#E0BF78]">Complimentary</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#F7F0E6] pt-3 border-t border-[#3A2B20]">
              <span>Total Amount Payable to Courier</span>
              <span className="text-xl text-[#E0BF78] font-editorial">
                {formatPKR(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Navigation */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] font-bold text-xs uppercase tracking-widest shadow-xl hover:brightness-110 transition-all"
          >
            <span>Return to Storefront</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
