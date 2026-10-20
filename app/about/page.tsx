import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { getPublicCollections } from '@/lib/queries/storefront';
import { Sparkles, Shield, HeartHandshake, Feather, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story & Atelier Philosophy | Kawish & Mooi Genuine Leather',
  description: 'The story behind Kawish & Mooi luxury leather ateliers. Exploring the heritage of bespoke full-grain craftsmanship.',
};

export default async function AboutPage() {
  const visibleCollections = await getPublicCollections();

  return (
    <div className="min-h-screen flex flex-col bg-[#100C09] text-[#F7F0E6]">
      <Navbar visibleCollections={visibleCollections} />

      <main className="flex-1 pt-32 pb-24 w-full">
        {/* Editorial Story Header */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 mb-20">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold">
            Bespoke Legacy &amp; Provenance
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-[#F7F0E6] leading-tight">
            The Living Art of Genuine Leather
          </h1>
          <p className="text-base sm:text-lg text-[#BDAE9D] font-light leading-relaxed">
            Founded on the conviction that genuine leather is not merely a material, but an heirloom chronicle that deepens in soul with each passing decade.
          </p>
        </section>

        {/* Narrative Section with Luxury Imagery */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#18120E] border border-[#3A2B20] shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop"
                alt="Leather artisan workbench"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-6">
              <h2 className="font-editorial text-2xl sm:text-3xl text-[#F7F0E6]">
                Two Distinct Ateliers. One Shared Standard.
              </h2>
              <div className="space-y-4 text-sm text-[#BDAE9D] leading-relaxed">
                <p>
                  At Kawish &amp; Mooi, we operate two distinct workshops under one uncompromising standard of material integrity.
                </p>
                <p>
                  <strong className="text-[#E0BF78] font-semibold">Kawish (Premium):</strong> Designed for the connoisseur. Every hide is inspected for natural full-grain texture, cut by hand, and paired with custom solid-milled brass fittings and heavyweight waxed harness thread. These are museum-grade investment pieces created to outlive fashion cycles.
                </p>
                <p>
                  <strong className="text-[#F7F0E6] font-semibold">Mooi (General):</strong> Created for modern urban life. Lightweight yet resilient oiled leathers with ergonomic pocket architectures, clean silhouettes, and tactile warmth.
                </p>
              </div>

              <div className="pt-4 flex gap-4">
                <Link
                  href="/collections/kawish"
                  className="px-5 py-2.5 rounded bg-[#C6A15B] text-[#100C09] text-xs font-bold uppercase tracking-wider"
                >
                  Explore Kawish
                </Link>
                <Link
                  href="/collections/mooi"
                  className="px-5 py-2.5 rounded bg-[#211811] text-[#F7F0E6] border border-[#3A2B20] text-xs font-bold uppercase tracking-wider"
                >
                  Explore Mooi
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The Leather Care Ritual */}
        <section id="care" className="py-20 bg-[#18120E] border-y border-[#3A2B20]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold">
                Maintenance Guide
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#F7F0E6]">
                The Leather Care Ritual
              </h2>
              <p className="text-xs sm:text-sm text-[#8E7D6C] max-w-md mx-auto">
                How to preserve the suppleness and rich grain of your Kawish &amp; Mooi leather bag.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-[#211811] border border-[#3A2B20] space-y-3">
                <span className="text-2xl font-editorial font-bold text-[#C6A15B]">01</span>
                <h3 className="font-editorial text-base text-[#F7F0E6] font-semibold">
                  Gentle Dusting
                </h3>
                <p className="text-xs text-[#8E7D6C] leading-relaxed">
                  Use a soft dry horsehair brush or lint-free cotton cloth weekly to remove surface dust before it embeds into the porous grain.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#211811] border border-[#3A2B20] space-y-3">
                <span className="text-2xl font-editorial font-bold text-[#C6A15B]">02</span>
                <h3 className="font-editorial text-base text-[#F7F0E6] font-semibold">
                  Bi-Annual Conditioning
                </h3>
                <p className="text-xs text-[#8E7D6C] leading-relaxed">
                  Apply a pea-sized amount of organic beeswax or natural neatsfoot cream in circular motions twice a year to replenish vital moisture.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#211811] border border-[#3A2B20] space-y-3">
                <span className="text-2xl font-editorial font-bold text-[#C6A15B]">03</span>
                <h3 className="font-editorial text-base text-[#F7F0E6] font-semibold">
                  Natural Drying
                </h3>
                <p className="text-xs text-[#8E7D6C] leading-relaxed">
                  If caught in sudden downpours, gently blot with dry towels and allow to air-dry at room temperature. Never use direct artificial heat or blow dryers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
