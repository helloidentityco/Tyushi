import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getMyOrdersAction } from '@/app/actions/orders';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { Package, Shield, User, ArrowRight, Clock, MapPin, ExternalLink } from 'lucide-react';
import { formatPKR } from '@/lib/pricing';
import AccountLogoutButton from '@/components/storefront/AccountLogoutButton';

export const revalidate = 0;

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?returnUrl=/account');
  }

  const orders = await getMyOrdersAction();
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#100C09] text-[#F7F0E6]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full space-y-8">
        {/* Account Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#18120E] border border-[#3A2B20] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#C6A15B] font-semibold">
                TYUSHI Patron Profile
              </span>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#C6A15B]/20 text-[#E0BF78] border border-[#C6A15B]/30 font-bold">
                {user.role}
              </span>
            </div>
            <h1 className="font-editorial text-3xl font-bold text-[#F7F0E6]">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-[#8E7D6C]">
              Connected as <strong className="text-[#BDAE9D]">{user.email}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg bg-[#C6A15B] text-[#100C09] text-xs font-bold uppercase tracking-wider hover:bg-[#E0BF78] transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            <AccountLogoutButton />
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Orders summary */}
          <div className="p-6 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8E7D6C] uppercase tracking-wider font-semibold">
                Orders Placed
              </span>
              <Package className="w-4 h-4 text-[#C6A15B]" />
            </div>
            <p className="font-editorial text-3xl font-bold text-[#E0BF78]">
              {orders.length}
            </p>
            <p className="text-xs text-[#8E7D6C]">
              {orders.filter((o) => o.status === 'DELIVERED').length} delivered successfully
            </p>
          </div>

          {/* Card 2: Luxury Care & Craft */}
          <div className="p-6 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8E7D6C] uppercase tracking-wider font-semibold">
                Atelier Guarantee
              </span>
              <Shield className="w-4 h-4 text-[#C6A15B]" />
            </div>
            <p className="font-editorial text-xl font-bold text-[#F7F0E6]">
              Lifetime Craftsmanship
            </p>
            <p className="text-xs text-[#8E7D6C]">
              Complimentary restoration consultation and beeswax conditioning guides.
            </p>
          </div>

          {/* Card 3: Quick Navigation */}
          <div className="p-6 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs text-[#8E7D6C] uppercase tracking-wider font-semibold">
                Order Ledger
              </span>
              <p className="text-xs text-[#BDAE9D]">
                Track live status, shipping notes, and immutable purchase snapshots.
              </p>
            </div>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1.5 text-xs text-[#E0BF78] hover:text-[#C6A15B] font-semibold transition-colors"
            >
              <span>View Full Order History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-xl font-bold text-[#F7F0E6]">
              Recent Atelier Orders
            </h2>
            {orders.length > 3 && (
              <Link
                href="/account/orders"
                className="text-xs text-[#C6A15B] hover:text-[#E0BF78] transition-colors"
              >
                View all ({orders.length}) &rarr;
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#18120E] border border-[#3A2B20] space-y-4">
              <Package className="w-10 h-10 text-[#8E7D6C] mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#F7F0E6]">No orders placed yet</p>
                <p className="text-xs text-[#8E7D6C] max-w-sm mx-auto">
                  Discover handcrafted leather goods across the Kawish and Mooi ateliers.
                </p>
              </div>
              <Link
                href="/collections/kawish"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C6A15B] text-[#100C09] text-xs font-bold uppercase tracking-wider hover:bg-[#E0BF78] transition-colors"
              >
                <span>Explore Kawish Premium</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#3A2B20] border border-[#3A2B20] rounded-2xl overflow-hidden bg-[#18120E] shadow-xl">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#211811]/60 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-[#E0BF78]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#251B14] text-[#BDAE9D] border border-[#3A2B20]">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#8E7D6C]">
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{order.itemsCount} piece(s)</span>
                      <span>·</span>
                      <span className="text-[#BDAE9D]">{order.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-mono font-bold text-[#F7F0E6] text-base">
                      {formatPKR(order.totalAmount)}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#251B14] hover:bg-[#302217] text-[#C6A15B] border border-[#3A2B20] text-xs font-medium transition-colors"
                    >
                      <span>Inspect Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
