'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Shield,
  User,
  LogOut,
  Package,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { logoutUserAction, getCurrentUserAction } from '@/app/actions/auth';

interface NavbarProps {
  visibleCollections?: Array<{
    id: string;
    name: string;
    slug: string;
    isPremium: boolean;
  }>;
  currentUser?: {
    userId: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'CUSTOMER';
  } | null;
}

export default function Navbar({
  visibleCollections = [],
  currentUser: initialUser = null,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollectionsDropdownOpen, setIsCollectionsDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [user, setUser] = useState(initialUser);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { totalCount, setIsDrawerOpen } = useCart();

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Client-side session sync if not provided
  useEffect(() => {
    if (!initialUser) {
      getCurrentUserAction().then((res) => {
        if (res) setUser(res);
      }).catch(() => {});
    }
  }, [initialUser, pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCollectionsDropdownOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on path change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsCollectionsDropdownOpen(false);
      setIsAccountDropdownOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogout = async () => {
    await logoutUserAction();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#100C09]/95 backdrop-blur-md border-b border-[#3A2B20] py-3.5 shadow-2xl'
          : 'bg-gradient-to-b from-[#100C09] via-[#100C09]/80 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* TYUSHI Brand Identity */}
          <Link href="/" className="group flex flex-col items-start focus-visible:outline-none">
            <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-widest text-[#F7F0E6] group-hover:text-[#E0BF78] transition-colors">
              TYUSHI
            </span>
            <span className="text-[9px] uppercase tracking-[0.28em] text-[#BDAE9D] group-hover:text-[#C6A15B] transition-colors -mt-0.5">
              Artisan Genuine Leather
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7">
            <Link
              href="/"
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#E0BF78] ${
                pathname === '/' ? 'text-[#E0BF78] font-semibold' : 'text-[#BDAE9D]'
              }`}
            >
              Home
            </Link>

            {/* Collections Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsCollectionsDropdownOpen(!isCollectionsDropdownOpen)}
                onMouseEnter={() => setIsCollectionsDropdownOpen(true)}
                className={`flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#E0BF78] focus:outline-none cursor-pointer ${
                  pathname.startsWith('/collections') ? 'text-[#E0BF78] font-semibold' : 'text-[#BDAE9D]'
                }`}
              >
                <span>Collections</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isCollectionsDropdownOpen ? 'rotate-180 text-[#C6A15B]' : ''
                  }`}
                />
              </button>

              {isCollectionsDropdownOpen && (
                <div
                  onMouseLeave={() => setIsCollectionsDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-[#18120E] border border-[#3A2B20] shadow-2xl py-2 z-50 animate-fadeIn"
                >
                  {visibleCollections.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-[#8E7D6C]">
                      <Link href="/collections/kawish" className="block py-1 hover:text-[#E0BF78]">
                        Kawish (Premium)
                      </Link>
                      <Link href="/collections/mooi" className="block py-1 hover:text-[#E0BF78]">
                        Mooi (General)
                      </Link>
                    </div>
                  ) : (
                    visibleCollections.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.slug}`}
                        className="flex flex-col px-4 py-2.5 hover:bg-[#251B14] transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#F7F0E6] group-hover:text-[#E0BF78] transition-colors">
                            {col.name}
                          </span>
                          {col.isPremium && (
                            <span className="text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded bg-[#C6A15B]/20 text-[#E0BF78] font-bold border border-[#C6A15B]/40">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8E7D6C] mt-0.5">
                          {col.isPremium ? 'Fine Bespoke & Heritage Craft' : 'Essential Everyday Elegance'}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#E0BF78] ${
                pathname === '/about' ? 'text-[#E0BF78] font-semibold' : 'text-[#BDAE9D]'
              }`}
            >
              Atelier Story
            </Link>

            {/* Admin Portal Shortcut if Admin */}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C6A15B] hover:text-[#E0BF78] transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C6A15B]/10 border border-[#C6A15B]/30"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Utility Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* User Account / Login Entry */}
            {user ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-[#211811] hover:bg-[#2c1f16] border border-[#3A2B20] text-xs text-[#F7F0E6] hover:text-[#E0BF78] transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span className="hidden sm:inline font-medium max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#8E7D6C]" />
                </button>

                {isAccountDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[#18120E] border border-[#3A2B20] shadow-2xl py-2 z-50 text-xs animate-fadeIn">
                    <div className="px-4 py-2 border-b border-[#3A2B20]/60 space-y-0.5">
                      <p className="font-semibold text-[#F7F0E6] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#8E7D6C] truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2 text-[#BDAE9D] hover:text-[#E0BF78] hover:bg-[#251B14] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#C6A15B]" />
                      <span>Account Profile</span>
                    </Link>

                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-[#BDAE9D] hover:text-[#E0BF78] hover:bg-[#251B14] transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-[#C6A15B]" />
                      <span>My Orders</span>
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-[#E0BF78] hover:bg-[#251B14] transition-colors font-medium"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#C6A15B]" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="pt-1 mt-1 border-t border-[#3A2B20]/60">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[#E58A82] hover:bg-[#251B14] transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs text-[#BDAE9D] hover:text-[#F7F0E6] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#251B14] hover:bg-[#302217] text-[#E0BF78] border border-[#3A2B20] transition-colors"
                >
                  Join Atelier
                </Link>
              </div>
            )}

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="View Cart"
              className="relative p-2 rounded-full text-[#F7F0E6] hover:text-[#E0BF78] hover:bg-[#211811] transition-colors focus:outline-none cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold text-[#100C09] bg-[#C6A15B] rounded-full shadow-lg border border-[#100C09]">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 text-[#F7F0E6] hover:text-[#E0BF78] focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#18120E] border-b border-[#3A2B20] px-4 pt-3 pb-6 space-y-4">
          <Link
            href="/"
            className="block text-sm uppercase tracking-wider font-medium text-[#F7F0E6] py-2 border-b border-[#3A2B20]/40"
          >
            Home
          </Link>

          <div className="py-2 border-b border-[#3A2B20]/40">
            <span className="block text-xs uppercase tracking-widest text-[#8E7D6C] mb-2">
              Collections
            </span>
            <div className="pl-3 space-y-2">
              <Link
                href="/collections/kawish"
                className="flex items-center justify-between text-sm text-[#BDAE9D] hover:text-[#E0BF78] py-1"
              >
                <span>Kawish Collection</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#C6A15B]/20 text-[#E0BF78] font-bold border border-[#C6A15B]/30">
                  PREMIUM
                </span>
              </Link>
              <Link
                href="/collections/mooi"
                className="block text-sm text-[#BDAE9D] hover:text-[#E0BF78] py-1"
              >
                Mooi Collection
              </Link>
            </div>
          </div>

          <Link
            href="/about"
            className="block text-sm uppercase tracking-wider font-medium text-[#F7F0E6] py-2 border-b border-[#3A2B20]/40"
          >
            Atelier Story
          </Link>

          {user ? (
            <div className="pt-2 border-t border-[#3A2B20]/40 space-y-2">
              <div className="px-1 text-xs text-[#8E7D6C]">
                Signed in as <strong className="text-[#F7F0E6]">{user.name}</strong>
              </div>
              <Link
                href="/account"
                className="block text-sm text-[#BDAE9D] hover:text-[#E0BF78] py-1"
              >
                Account Profile
              </Link>
              <Link
                href="/account/orders"
                className="block text-sm text-[#BDAE9D] hover:text-[#E0BF78] py-1"
              >
                Order History
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-sm text-[#E0BF78] py-1 font-semibold"
                >
                  <Shield className="w-4 h-4 text-[#C6A15B]" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm text-[#E58A82] py-1 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#3A2B20]/40 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="text-center py-2 rounded-lg bg-[#211811] border border-[#3A2B20] text-xs font-medium text-[#F7F0E6]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-center py-2 rounded-lg bg-[#C6A15B] text-[#100C09] text-xs font-bold uppercase tracking-wider"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
