'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  Package,
  Percent,
  ShoppingBag,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { logoutAdminAction } from '@/app/actions/auth';

interface AdminSidebarProps {
  adminEmail?: string;
}

export default function AdminSidebar({ adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return null;
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Collections', href: '/admin/collections', icon: Layers },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Discounts', href: '/admin/discounts', icon: Percent },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  ];

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-[#140F0B] border-r border-[#3A2B20] flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#3A2B20]">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#251B14] border border-[#C6A15B]/50 flex items-center justify-center text-[#C6A15B]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-editorial text-sm font-bold tracking-wider text-[#F7F0E6] block">
              KAWISH &amp; MOOI
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#C6A15B] font-semibold block">
              Atelier Management
            </span>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="p-4 flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium transition-all ${
                isActive
                  ? 'bg-[#251B14] text-[#E0BF78] border border-[#C6A15B]/40 shadow-md font-semibold'
                  : 'text-[#BDAE9D] hover:text-[#F7F0E6] hover:bg-[#1C1510]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#C6A15B]' : 'text-[#8E7D6C]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Coordinates & Logout */}
      <div className="p-4 border-t border-[#3A2B20] space-y-3 bg-[#100C09]/60">
        <div className="px-1 text-xs">
          <span className="text-[#8E7D6C] text-[10px] uppercase tracking-wider block">
            Authorized Administrator
          </span>
          <span className="text-[#F7F0E6] text-xs font-medium truncate block">
            {adminEmail || 'admin@kawishmooi.com'}
          </span>
        </div>

        <div className="pt-2 border-t border-[#3A2B20]/40 flex flex-col gap-1.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded text-xs text-[#BDAE9D] hover:text-[#E0BF78] hover:bg-[#1C1510] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Storefront View</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded text-xs text-[#E58A82] hover:bg-[#E58A82]/10 transition-colors w-full text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
