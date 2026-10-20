import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductDetailView from '@/components/storefront/ProductDetailView';
import ProductCard from '@/components/storefront/ProductCard';
import {
  getPublicProductBySlug,
  getPublicCollections,
  getPublicProducts,
} from '@/lib/queries/storefront';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Kawish & Mooi',
    };
  }

  return {
    title: `${product.name} | ${product.collection.name} Genuine Leather`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} | Kawish & Mooi`,
      description: product.description.substring(0, 160),
      images: [{ url: product.mainImageUrl }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // 1. Fetch product; strictly enforces that parent collection must be visible
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // 2. Fetch all visible collections for navbar and related products
  const [allVisibleCollections, relatedProducts] = await Promise.all([
    getPublicCollections(),
    getPublicProducts({ collectionSlug: product.collection.slug, limit: 4 }),
  ]);

  // Exclude current product from related items
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#100C09] text-[#F7F0E6]">
      <Navbar visibleCollections={allVisibleCollections} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-[#8E7D6C]">
          <Link href="/" className="hover:text-[#F7F0E6] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/collections/${product.collection.slug}`}
            className="hover:text-[#F7F0E6] transition-colors"
          >
            {product.collection.name} Collection
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/collections/${product.collection.slug}?category=${product.category.slug}`}
            className="hover:text-[#F7F0E6] transition-colors"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#E0BF78] line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <ProductDetailView product={product as any} />

        {/* Related Creations from the same Atelier */}
        {filteredRelated.length > 0 && (
          <section className="pt-16 border-t border-[#3A2B20] space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold">
                  From the Same Atelier
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-[#F7F0E6] mt-1">
                  More in {product.collection.name}
                </h3>
              </div>
              <Link
                href={`/collections/${product.collection.slug}`}
                className="text-xs uppercase tracking-wider font-semibold text-[#E0BF78] hover:underline"
              >
                View Collection →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelated.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct as any} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
