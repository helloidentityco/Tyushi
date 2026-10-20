import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import CollectionProductGrid from '@/components/storefront/CollectionProductGrid';
import {
  getPublicCollections,
  getPublicCollectionBySlug,
  getPublicCategories,
  getPublicProducts,
  getActiveDiscounts,
} from '@/lib/queries/storefront';
import { Sparkles, Tag } from 'lucide-react';
import type { Metadata } from 'next';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getPublicCollectionBySlug(slug);

  if (!collection) {
    return {
      title: 'Collection Not Found | Kawish & Mooi',
    };
  }

  const isPremium = collection.isPremium || collection.slug === 'kawish';
  return {
    title: `${collection.name} ${isPremium ? '(Premium)' : ''} | Handcrafted Genuine Leather`,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  // 1. Fetch collection; strictly enforces public visibility in DB
  const collection = await getPublicCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  // 2. Parallel data retrieval
  const [allVisibleCollections, categories, products, activeDiscounts] = await Promise.all([
    getPublicCollections(),
    getPublicCategories(),
    getPublicProducts({ collectionSlug: slug }),
    getActiveDiscounts(),
  ]);

  const isKawish = collection.isPremium || collection.slug === 'kawish';

  // Check if a collection-wide discount is active
  const collectionDiscount = activeDiscounts.find(
    (d: any) => d.scope === 'COLLECTION' && d.collectionId === collection.id
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#100C09] text-[#F7F0E6]">
      <Navbar visibleCollections={allVisibleCollections} />

      {/* Collection Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-[#3A2B20]">
        <div className="absolute inset-0 z-0">
          <Image
            src={collection.bannerImageUrl || collection.heroImageUrl}
            alt={collection.name}
            fill
            priority
            className="object-cover opacity-20 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100C09] via-[#100C09]/85 to-[#100C09]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2">
            {isKawish ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6A15B]/20 text-[#E0BF78] text-xs uppercase tracking-widest font-bold border border-[#C6A15B]/50 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>PREMIUM LEATHER COLLECTION</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#211811] text-[#BDAE9D] text-xs uppercase tracking-widest font-medium border border-[#3A2B20]">
                <span>GENERAL LEATHER COLLECTION</span>
              </span>
            )}
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F7F0E6]">
            {collection.name} Atelier
          </h1>

          <p className="max-w-3xl text-sm sm:text-base text-[#BDAE9D] font-light leading-relaxed">
            {collection.description}
          </p>

          {/* Active Collection Promotion Banner */}
          {collectionDiscount && (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#251B14] border border-[#C6A15B]/60 text-xs text-[#E0BF78]">
                <Tag className="w-4 h-4 text-[#C6A15B]" />
                <span className="font-semibold">{collectionDiscount.name}</span>
                <span className="text-[#BDAE9D]">·</span>
                <span className="text-[#F7F0E6] font-medium">
                  {collectionDiscount.discountPercent}% Off applied automatically at checkout
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Listing Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <Suspense fallback={<div className="py-12 text-center text-xs text-[#8E7D6C]">Loading atelier pieces...</div>}>
          <CollectionProductGrid
            initialProducts={products}
            categories={categories}
            collectionSlug={slug}
          />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
