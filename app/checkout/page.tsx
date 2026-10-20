'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowLeft,
  Loader2,
  User,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/lib/cart/cart-context';
import { formatPKR } from '@/lib/pricing';
import { createOrderAction } from '@/app/actions/orders';
import { getCurrentUserAction } from '@/app/actions/auth';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, subtotal, discountTotal, totalAmount } = useCart();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    city: 'Lahore',
    shippingAddress: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUserAction().then((user) => {
      if (user) {
        setCurrentUser(user);
        setFormData((prev) => ({
          ...prev,
          customerName: prev.customerName || user.name,
          email: prev.email || user.email,
        }));
      }
      setIsCheckingAuth(false);
    }).catch(() => {
      setIsCheckingAuth(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      router.push('/login?returnUrl=/checkout');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your shopping bag is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const result = await createOrderAction(payload);

      if (!result.success) {
        if (result.requiresAuth) {
          router.push('/login?returnUrl=/checkout');
          return;
        }
        setErrorMessage(result.error || 'Failed to process order. Please check your details.');
        setIsSubmitting(false);
        return;
      }

      // Order succeeded! Clear cart and navigate
      clearCart();
      router.push(`/order-confirmation/${result.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected network error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#100C09] text-[#F7F0E6]">
      <Navbar currentUser={currentUser} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-[#8E7D6C] hover:text-[#E0BF78] transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shopping Bag</span>
          </Link>
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#C6A15B] font-semibold block">
            TYUSHI Atelier Fulfillment
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#F7F0E6] mt-1">
            Secure Order Checkout
          </h1>
          <p className="text-xs text-[#BDAE9D] mt-1">
            Complete your delivery information below for genuine leather artisan fulfillment.
          </p>
        </div>

        {/* Guest Authentication Warning Banner */}
        {!isCheckingAuth && !currentUser && items.length > 0 && (
          <div className="mb-8 p-5 rounded-2xl bg-[#18120E] border border-[#C6A15B]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#E0BF78] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C6A15B]" />
                <span>Patron Authentication Required for Order Placement</span>
              </span>
              <p className="text-xs text-[#BDAE9D]">
                To track your fulfillment and ensure secure delivery, please sign in or create an account. Your shopping bag is preserved.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Link
                href="/login?returnUrl=/checkout"
                className="px-4 py-2 rounded-lg bg-[#251B14] hover:bg-[#302217] text-[#E0BF78] border border-[#3A2B20] text-xs font-semibold text-center flex-1 sm:flex-none transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup?returnUrl=/checkout"
                className="px-4 py-2 rounded-lg bg-[#C6A15B] hover:bg-[#E0BF78] text-[#100C09] text-xs font-bold uppercase tracking-wider text-center flex-1 sm:flex-none transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#18120E] border border-[#3A2B20] text-center space-y-4 max-w-md mx-auto">
            <h2 className="font-editorial text-xl text-[#F7F0E6]">Your bag is empty</h2>
            <p className="text-xs text-[#8E7D6C]">
              Please add products to your cart prior to proceeding to checkout.
            </p>
            <Link
              href="/collections/kawish"
              className="inline-block px-5 py-2.5 rounded bg-[#C6A15B] text-[#100C09] font-bold text-xs uppercase tracking-wider"
            >
              Browse Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Checkout Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-lg bg-[#E58A82]/10 border border-[#E58A82]/50 text-xs text-[#E58A82] flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-6 shadow-xl">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#F7F0E6] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C6A15B]" />
                    <span>Shipping &amp; Delivery Destination</span>
                  </h3>
                  <p className="text-xs text-[#8E7D6C] mt-0.5">
                    We deliver across all major cities with white-glove packaging.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[#BDAE9D] font-medium block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="e.g. Zohaib Manzoor"
                      className="w-full px-3.5 py-2.5 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#BDAE9D] font-medium block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. zohaib@example.com"
                      className="w-full px-3.5 py-2.5 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#BDAE9D] font-medium block">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 0300 1234567"
                      className="w-full px-3.5 py-2.5 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#BDAE9D] font-medium block">
                      City / Region *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Gujranwala">Gujranwala</option>
                      <option value="Other">Other City</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[#BDAE9D] font-medium block">
                      Complete Street Address *
                    </label>
                    <textarea
                      name="shippingAddress"
                      required
                      rows={3}
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      placeholder="Apartment, suite, street name, sector..."
                      className="w-full px-3.5 py-2.5 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[#BDAE9D] font-medium block">
                      Special Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="e.g. Call before delivery, gift wrap requested"
                      className="w-full px-3.5 py-2.5 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                </div>

                {/* Payment Method Notice */}
                <div className="p-4 rounded-lg bg-[#211811] border border-[#3A2B20] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#E0BF78] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-[#8E7D6C] leading-relaxed">
                    Pay securely in cash upon receiving your luxury leather piece. Complimentary inspection is permitted prior to payment acceptance.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] font-bold text-xs uppercase tracking-widest hover:opacity-95 transition-opacity shadow-lg shadow-[#C6A15B]/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Atelier Order...</span>
                    </>
                  ) : !currentUser ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In &amp; Finalize Order — {formatPKR(totalAmount)}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Place Order — {formatPKR(totalAmount)}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Order Summary Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-6 shadow-xl">
                <h3 className="font-editorial text-lg font-bold text-[#F7F0E6]">
                  Order Summary ({items.length} item{items.length > 1 ? 's' : ''})
                </h3>

                {/* Products mini list */}
                <div className="divide-y divide-[#3A2B20] max-h-80 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="py-3 flex items-center gap-3 text-xs">
                      <div className="relative w-12 h-14 rounded overflow-hidden bg-[#251B14] shrink-0 border border-[#3A2B20]">
                        <Image
                          src={item.mainImageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-[#F7F0E6] block truncate">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#8E7D6C] block">
                          Qty: {item.quantity} · {item.collectionName}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-[#E0BF78] font-bold block">
                          {formatPKR(item.effectivePrice * item.quantity)}
                        </span>
                        {item.regularPrice > item.effectivePrice && (
                          <span className="text-[10px] text-[#8E7D6C] line-through block">
                            {formatPKR(item.regularPrice * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-4 border-t border-[#3A2B20] space-y-2 text-xs">
                  <div className="flex justify-between text-[#BDAE9D]">
                    <span>Catalogue Subtotal</span>
                    <span className="font-mono">{formatPKR(subtotal)}</span>
                  </div>

                  {discountTotal > 0 && (
                    <div className="flex justify-between text-[#6FC69B] font-medium">
                      <span>Promotional Savings</span>
                      <span className="font-mono">-{formatPKR(discountTotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#BDAE9D]">
                    <span>Nationwide Delivery</span>
                    <span className="text-[#E0BF78] font-medium">Complimentary</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-[#F7F0E6] pt-3 border-t border-[#3A2B20]">
                    <span>Total Amount</span>
                    <span className="text-base text-[#E0BF78] font-editorial">
                      {formatPKR(totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#8E7D6C] flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
                  <span>All prices recalculated securely on server at order placement.</span>
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
