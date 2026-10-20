import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Shield, Compass, ChevronRight } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductCard from '@/components/storefront/ProductCard';
import { getPublicCollections, getPublicProducts, getPublicCategories } from '@/lib/queries/storefront';

export const revalidate = 60; // Revalidate every minute or on-demand via actions

export default async function HomePage() {
  const [collections, featuredProducts, categories] = await Promise.all([
    getPublicCollections(),
    getPublicProducts({ onlyFeatured: true, limit: 8 }),
    getPublicCategories(),
  ]);

  const kawish = collections.find((c: any) => c.slug === 'kawish');
  const mooi = collections.find((c: any) => c.slug === 'mooi');

  return (
    <div className="min-h-screen flex flex-col bg-[#100C09] text-[#F7F0E6]">
      <Navbar visibleCollections={collections} />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
        {/* Ambient Dark Walnut Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2000&auto=format&fit=crop"
            alt="Handcrafted Luxury Leather"
            fill
            priority
            className="object-cover opacity-25 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100C09] via-[#100C09]/80 to-[#100C09]/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,161,91,0.08)_0,transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#251B14]/80 border border-[#C6A15B]/40 text-[#E0BF78] text-xs uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Dual Artisan Ateliers</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F7F0E6] leading-[1.1]">
            Enduring Character.<br />
            <span className="text-gold-gradient">Genuine Leather</span> Mastercraft.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#BDAE9D] font-light leading-relaxed">
            From the uncompromising prestige of our bespoke <strong className="text-[#E0BF78] font-medium">Kawish</strong> collection to the timeless daily refinement of <strong className="text-[#F7F0E6] font-medium">Mooi</strong>. Hand-cut and saddle-stitched to accompany you for lifetimes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#collections"
              className="w-full sm:w-auto px-8 py-3.5 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] hover:from-[#E0BF78] hover:to-[#C6A15B] text-[#100C09] font-bold text-xs uppercase tracking-widest transition-all shadow-xl hover:shadow-[#C6A15B]/20"
            >
              EXPLORE COLLECTIONS
            </a>
            <Link
              href="/about"
              className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#211811] hover:bg-[#251B14] text-[#F7F0E6] hover:text-[#E0BF78] border border-[#3A2B20] text-xs uppercase tracking-widest transition-colors"
            >
              DISCOVER OUR STORY
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Introduction */}
      <section className="py-20 bg-[#18120E] border-y border-[#3A2B20]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold">
            Unadulterated Materiality
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl text-[#F7F0E6]">
            Every hide tells a distinct, living chronicle.
          </h2>
          <p className="text-sm sm:text-base text-[#BDAE9D] leading-relaxed">
            We source exclusively full-grain and vegetable-tanned hides. No synthetic coatings, no corrected grain, and no shortcuts. As our bags journey with you through rain, sunlight, and everyday use, natural oils rise to the surface, creating a signature burnished luster that cannot be forged.
          </p>
        </div>
      </section>

      {/* Collection Showcase */}
      <section id="collections" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center space-y-2 mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold">
            Two Distinct Expressions
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#F7F0E6]">
            Choose Your Atelier
          </h2>
          <p className="text-xs sm:text-sm text-[#8E7D6C] max-w-lg mx-auto">
            Each collection possesses its own tailored design language, leather specifications, and heritage focus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kawish (Premium) */}
          {kawish && (
            <div className="group relative rounded-xl overflow-hidden bg-[#211811] border border-[#C6A15B]/40 hover:border-[#C6A15B] transition-all duration-500 shadow-2xl flex flex-col justify-between">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={kawish.heroImageUrl}
                  alt={kawish.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#211811] via-[#211811]/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded bg-[#100C09]/90 text-[#E0BF78] border border-[#C6A15B] shadow-lg">
                    PREMIUM COLLECTION
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F0E6] group-hover:text-[#E0BF78] transition-colors">
                    {kawish.name}
                  </h3>
                  <p className="text-xs text-[#C6A15B] uppercase tracking-widest font-semibold mt-1">
                    Bespoke · Heavyweight Waxed Leather · 24k Brass
                  </p>
                  <p className="text-sm text-[#BDAE9D] mt-3 leading-relaxed">
                    {kawish.description}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/collections/${kawish.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] font-bold text-xs uppercase tracking-widest shadow-md hover:brightness-110 transition-all"
                  >
                    <span>EXPLORE KAWISH</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Mooi (General) */}
          {mooi && (
            <div className="group relative rounded-xl overflow-hidden bg-[#211811] border border-[#3A2B20] hover:border-[#C6A15B]/50 transition-all duration-500 shadow-xl flex flex-col justify-between">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={mooi.heroImageUrl}
                  alt={mooi.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#211811] via-[#211811]/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="text-xs uppercase font-semibold tracking-widest px-3 py-1 rounded bg-[#100C09]/90 text-[#BDAE9D] border border-[#3A2B20] shadow-lg">
                    GENERAL COLLECTION
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F0E6] group-hover:text-[#E0BF78] transition-colors">
                    {mooi.name}
                  </h3>
                  <p className="text-xs text-[#BDAE9D] uppercase tracking-widest font-semibold mt-1">
                    Urban Luxury · Supple Oiled Leather · Functional Design
                  </p>
                  <p className="text-sm text-[#BDAE9D] mt-3 leading-relaxed">
                    {mooi.description}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/collections/${mooi.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#251B14] hover:bg-[#302217] text-[#F7F0E6] hover:text-[#E0BF78] border border-[#3A2B20] font-bold text-xs uppercase tracking-widest shadow-md transition-all"
                  >
                    <span>EXPLORE MOOI</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Grid */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-[#140F0B] border-t border-[#3A2B20]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold">
                  Curated Selection
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl text-[#F7F0E6] mt-1">
                  Featured Masterworks
                </h2>
              </div>
              <p className="text-xs text-[#8E7D6C] max-w-sm">
                Each piece individually photographed and catalogued with complete leather grain provenance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shared Product Categories Exploration */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold">
            Product Taxonomy
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#F7F0E6]">
            Shared Categories
          </h2>
          <p className="text-xs sm:text-sm text-[#8E7D6C] max-w-md mx-auto">
            Available across both Kawish and Mooi with bespoke and commuter interpretations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-6 rounded-lg bg-[#18120E] border border-[#3A2B20] hover:border-[#C6A15B]/40 transition-colors flex flex-col justify-between space-y-4"
            >
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#F7F0E6]">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#8E7D6C] mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#3A2B20]/50 flex items-center justify-between text-xs">
                {kawish && (
                  <Link
                    href={`/collections/kawish?category=${cat.slug}`}
                    className="text-[#E0BF78] hover:underline"
                  >
                    Kawish {cat.name}
                  </Link>
                )}
                {mooi && (
                  <Link
                    href={`/collections/mooi?category=${cat.slug}`}
                    className="text-[#BDAE9D] hover:underline"
                  >
                    Mooi {cat.name}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
