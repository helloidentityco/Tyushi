import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Feather, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#140F0B] border-t border-[#3A2B20] text-[#BDAE9D] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Promises Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#3A2B20]/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#211811] border border-[#3A2B20] flex items-center justify-center shrink-0 text-[#C6A15B]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-[#F7F0E6]">
                100% Genuine Leather
              </h4>
              <p className="text-xs text-[#8E7D6C] mt-0.5">
                Full-grain and vegetable-tanned hides chosen for enduring beauty.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#211811] border border-[#3A2B20] flex items-center justify-center shrink-0 text-[#C6A15B]">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-[#F7F0E6]">
                Master Saddle Stitching
              </h4>
              <p className="text-xs text-[#8E7D6C] mt-0.5">
                Burnished wax-sealed edges and solid brass hardware fittings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#211811] border border-[#3A2B20] flex items-center justify-center shrink-0 text-[#C6A15B]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-[#F7F0E6]">
                Lifetime Leather Patina
              </h4>
              <p className="text-xs text-[#8E7D6C] mt-0.5">
                Every grain story develops distinct character across decades of wear.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12 border-b border-[#3A2B20]/60">
          {/* Brand Bio */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-editorial text-2xl font-bold tracking-wider text-[#F7F0E6]">
                KAWISH <span className="text-[#C6A15B] font-light">&amp;</span> MOOI
              </span>
            </Link>
            <p className="text-xs text-[#8E7D6C] leading-relaxed">
              Purveyors of fine artisanal leather goods. Operating dual master ateliers: the uncompromising Kawish Premium Collection and the versatile Mooi General Collection.
            </p>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F7F0E6]">
              Collections
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collections/kawish" className="hover:text-[#E0BF78] transition-colors flex items-center gap-2">
                  <span>Kawish Collection</span>
                  <span className="text-[9px] uppercase px-1 py-0.2 bg-[#C6A15B]/20 text-[#E0BF78] rounded">PREMIUM</span>
                </Link>
              </li>
              <li>
                <Link href="/collections/mooi" className="hover:text-[#E0BF78] transition-colors">
                  Mooi Collection
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#E0BF78] transition-colors">
                  Atelier Philosophy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F7F0E6]">
              Categories
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collections/kawish?category=tote-bags" className="hover:text-[#E0BF78] transition-colors">
                  Tote Bags
                </Link>
              </li>
              <li>
                <Link href="/collections/kawish?category=laptop-bags" className="hover:text-[#E0BF78] transition-colors">
                  Laptop Bags &amp; Messengers
                </Link>
              </li>
              <li>
                <Link href="/collections/mooi?category=handbags" className="hover:text-[#E0BF78] transition-colors">
                  Structured Handbags
                </Link>
              </li>
              <li>
                <Link href="/collections/mooi?category=purses" className="hover:text-[#E0BF78] transition-colors">
                  Leather Wallets &amp; Purses
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Admin */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F7F0E6]">
              Concierge
            </h5>
            <ul className="space-y-2 text-xs">
              <li className="text-[#8E7D6C]">Cash on Delivery Available</li>
              <li className="text-[#8E7D6C]">Nationwide Insured Delivery</li>
              <li>
                <Link href="/about#care" className="hover:text-[#E0BF78] transition-colors">
                  Leather Care &amp; Conditioning
                </Link>
              </li>
              <li className="pt-2">
                <Link href="/admin" className="text-[#C6A15B] hover:text-[#E0BF78] transition-colors flex items-center gap-1.5 font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E7D6C] gap-4">
          <p>© {new Date().getFullYear()} Kawish &amp; Mooi Leather Goods. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>100% Genuine Full-Grain</span>
            <span>·</span>
            <span>Bespoke Handcrafted</span>
            <span>·</span>
            <span>Artisan Heritage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
