'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/lib/cart/cart-context';
import { formatPKR } from '@/lib/pricing';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, discountTotal, totalAmount } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#100C09] text-[#F7F0E6]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        <div className="space-y-2 mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold">
            Bespoke Bag
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#F7F0E6]">
            Review Your Shopping Bag
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center rounded-xl bg-[#18120E] border border-[#3A2B20] max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#251B14] border border-[#3A2B20] flex items-center justify-center mx-auto text-[#8E7D6C]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-editorial text-2xl text-[#F7F0E6]">Your bag is currently empty</h2>
            <p className="text-xs text-[#8E7D6C] max-w-sm mx-auto">
              Our handcrafted leather creations await you. Browse through the Kawish and Mooi ateliers.
            </p>
            <div className="pt-2">
              <Link
                href="/collections/kawish"
                className="inline-block px-6 py-3 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] font-bold text-xs uppercase tracking-widest"
              >
                Explore Kawish Atelier
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#3A2B20]/60 text-xs text-[#8E7D6C]">
                <span>Product Item</span>
                <button
                  onClick={clearCart}
                  className="hover:text-[#E58A82] transition-colors"
                >
                  Clear Bag
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.productId}
                  className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] flex flex-col sm:flex-row gap-5 items-center justify-between"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-24 h-28 rounded-lg overflow-hidden bg-[#251B14] shrink-0 border border-[#3A2B20]">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] uppercase tracking-wider text-[#8E7D6C] block">
                        {item.collectionName} · {item.categoryName}
                      </span>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-medium text-sm text-[#F7F0E6] hover:text-[#E0BF78] transition-colors"
                      >
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-[#E0BF78]">
                          {formatPKR(item.effectivePrice)}
                        </span>
                        {item.regularPrice > item.effectivePrice && (
                          <span className="text-[11px] text-[#8E7D6C] line-through">
                            {formatPKR(item.regularPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#3A2B20]/40">
                    <div className="flex items-center border border-[#3A2B20] rounded bg-[#211811]">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2.5 py-1 text-sm text-[#BDAE9D] hover:text-[#F7F0E6]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-[#F7F0E6]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-2.5 py-1 text-sm text-[#BDAE9D] hover:text-[#F7F0E6]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <div className="text-sm font-bold text-[#E0BF78] font-editorial">
                        {formatPKR(item.effectivePrice * item.quantity)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-[#8E7D6C] hover:text-[#E58A82] p-1.5 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary (4 cols) */}
            <div className="lg:col-span-4">
              <div className="p-6 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-6 sticky top-28">
                <h3 className="font-editorial text-lg font-bold text-[#F7F0E6]">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#BDAE9D]">
                    <span>Catalogue Subtotal</span>
                    <span>{formatPKR(subtotal)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-[#6FC69B] font-medium">
                      <span>Promotional Reductions</span>
                      <span>-{formatPKR(discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#BDAE9D]">
                    <span>Insured Courier Delivery</span>
                    <span className="text-[#E0BF78]">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#F7F0E6] pt-3 border-t border-[#3A2B20]">
                    <span>Estimated Total</span>
                    <span className="text-xl text-[#E0BF78] font-editorial">
                      {formatPKR(totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] hover:from-[#E0BF78] hover:to-[#C6A15B] text-[#100C09] font-bold text-xs uppercase tracking-widest shadow-xl transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/"
                    className="block text-center text-xs text-[#8E7D6C] hover:text-[#E0BF78] transition-colors"
                  >
                    Continue Browsing Collections
                  </Link>
                </div>

                <div className="pt-4 border-t border-[#3A2B20]/60 flex items-center gap-3 text-xs text-[#8E7D6C]">
                  <ShieldCheck className="w-5 h-5 text-[#C6A15B] shrink-0" />
                  <span>
                    Cash on delivery available with full parcel inspection prior to payment.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
