'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { formatPKR } from '@/lib/pricing';

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    isDrawerOpen,
    setIsDrawerOpen,
    subtotal,
    discountTotal,
    totalAmount,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#18120E] border-l border-[#3A2B20] text-[#F7F0E6] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-[#3A2B20] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-[#C6A15B]" />
              <h2 className="font-editorial text-lg font-bold tracking-wide text-[#F7F0E6]">
                Your Shopping Bag
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#251B14] text-[#BDAE9D] hover:text-[#F7F0E6] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Items or Empty state */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#251B14] border border-[#3A2B20] flex items-center justify-center mb-4 text-[#8E7D6C]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-editorial text-lg text-[#F7F0E6] font-medium mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-[#8E7D6C] max-w-xs mb-6">
                  Discover our genuine leather creations from the Kawish and Mooi collections.
                </p>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-6 py-2.5 text-xs uppercase tracking-widest bg-[#C6A15B] hover:bg-[#E0BF78] text-[#100C09] font-semibold rounded transition-colors"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-3 rounded-lg bg-[#251B14] border border-[#3A2B20]/80 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-24 rounded overflow-hidden bg-[#18120E] shrink-0 border border-[#3A2B20]">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => setIsDrawerOpen(false)}
                            className="text-xs font-semibold text-[#F7F0E6] hover:text-[#E0BF78] transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-[#8E7D6C] hover:text-[#E58A82] p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-[#BDAE9D] mt-0.5 flex items-center gap-1.5">
                          <span>{item.collectionName}</span>
                          <span className="text-[#8E7D6C]">·</span>
                          <span>{item.categoryName}</span>
                        </div>
                      </div>

                      {/* Prices & Quantity */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#3A2B20]/50">
                        {/* Quantity selector */}
                        <div className="flex items-center border border-[#3A2B20] rounded bg-[#18120E]">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2 py-1 text-[#BDAE9D] hover:text-[#F7F0E6] hover:bg-[#251B14]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-medium text-[#F7F0E6]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2 py-1 text-[#BDAE9D] hover:text-[#F7F0E6] hover:bg-[#251B14]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-xs font-semibold text-[#E0BF78]">
                            {formatPKR(item.effectivePrice * item.quantity)}
                          </div>
                          {item.regularPrice > item.effectivePrice && (
                            <div className="text-[10px] text-[#8E7D6C] line-through">
                              {formatPKR(item.regularPrice * item.quantity)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#3A2B20] bg-[#140F0B] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#BDAE9D]">
                  <span>Subtotal</span>
                  <span>{formatPKR(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-[#6FC69B]">
                    <span>Promotional Savings</span>
                    <span>-{formatPKR(discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#BDAE9D]">
                  <span>Shipping</span>
                  <span className="text-[#E0BF78] font-medium">Free White-Glove</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#F7F0E6] pt-2 border-t border-[#3A2B20]">
                  <span>Estimated Total</span>
                  <span className="text-base text-[#E0BF78] font-editorial">
                    {formatPKR(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] hover:from-[#E0BF78] hover:to-[#C6A15B] text-[#100C09] font-bold text-xs uppercase tracking-widest shadow-lg transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-[#8E7D6C]">
                    Cash on Delivery &amp; Nationwide Verified Shipping
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
