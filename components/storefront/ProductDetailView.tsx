'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Zap,
  Check,
  Shield,
  Feather,
  Sparkles,
  Ruler,
  Palette,
  HeartHandshake,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { formatPKR } from '@/lib/pricing';

interface ProductDetailViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string | number;
    mainImageUrl: string;
    secondaryImageUrl?: string | null;
    isAvailable: boolean;
    stockQuantity: number;
    leatherDetails: string;
    dimensions: string;
    color: string;
    careInstructions: string;
    collection: {
      id: string;
      name: string;
      slug: string;
      isPremium: boolean;
    };
    category: {
      id: string;
      name: string;
      slug: string;
    };
    images: Array<{
      id: string;
      imageUrl: string;
      altText?: string | null;
    }>;
    pricing: {
      regularPrice: number;
      effectivePrice: number;
      hasDiscount: boolean;
      discountPercent: number;
      discountName?: string;
      savingsAmount: number;
    };
  };
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, setIsDrawerOpen } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.mainImageUrl);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isKawish = product.collection.isPremium || product.collection.slug === 'kawish';

  // Gather all unique images
  const allImages = [
    product.mainImageUrl,
    ...(product.secondaryImageUrl ? [product.secondaryImageUrl] : []),
    ...product.images.map((img) => img.imageUrl),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        collectionName: product.collection.name,
        categoryName: product.category.name,
        imageUrl: product.mainImageUrl,
        regularPrice: product.pricing.regularPrice,
        effectivePrice: product.pricing.effectivePrice,
        isPremium: isKawish,
      },
      quantity
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        collectionName: product.collection.name,
        categoryName: product.category.name,
        imageUrl: product.mainImageUrl,
        regularPrice: product.pricing.regularPrice,
        effectivePrice: product.pricing.effectivePrice,
        isPremium: isKawish,
      },
      quantity
    );
    setIsDrawerOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left Column: Image Gallery (7 cols on lg) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Main Display Image */}
        <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#18120E] border border-[#3A2B20] shadow-2xl">
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
            referrerPolicy="no-referrer"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {isKawish && (
              <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded bg-[#100C09]/90 text-[#E0BF78] border border-[#C6A15B] shadow-xl">
                PREMIUM ATELIER
              </span>
            )}
            {product.pricing.hasDiscount && (
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded bg-[#C6A15B] text-[#100C09] shadow-xl">
                {product.pricing.discountPercent}% OFF PROMOTION
              </span>
            )}
          </div>
        </div>

        {/* Thumbnails row */}
        {allImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  selectedImage === img
                    ? 'border-[#C6A15B] scale-102 shadow-lg'
                    : 'border-[#3A2B20] opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Product Narrative & Ordering Controls (5 cols on lg) */}
      <div className="lg:col-span-5 space-y-8">
        {/* Header and Taxonomy */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8E7D6C] uppercase tracking-widest mb-2">
            <span>{product.collection.name} Collection</span>
            <span>·</span>
            <span>{product.category.name}</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#F7F0E6] leading-tight">
            {product.name}
          </h1>

          {/* Pricing Highlight */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#E0BF78] font-editorial">
              {formatPKR(product.pricing.effectivePrice)}
            </span>
            {product.pricing.hasDiscount && (
              <span className="text-lg text-[#8E7D6C] line-through">
                {formatPKR(product.pricing.regularPrice)}
              </span>
            )}
            {product.pricing.hasDiscount && (
              <span className="text-xs text-[#6FC69B] font-medium">
                Save {formatPKR(product.pricing.savingsAmount)}
              </span>
            )}
          </div>

          {product.pricing.discountName && (
            <p className="text-xs text-[#C6A15B] mt-1">
              Active offer: {product.pricing.discountName}
            </p>
          )}
        </div>

        {/* Narrative Description */}
        <div className="border-t border-[#3A2B20]/60 pt-6">
          <p className="text-sm text-[#BDAE9D] leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Leather and Craftsmanship Specifications */}
        <div className="space-y-3 p-4 rounded-xl bg-[#18120E] border border-[#3A2B20]">
          <h4 className="text-xs uppercase tracking-widest font-semibold text-[#E0BF78] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#C6A15B]" />
            <span>Artisan Specifications</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8E7D6C] block">Leather Grain:</span>
                <span className="text-[#F7F0E6]">{product.leatherDetails}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Ruler className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8E7D6C] block">Dimensions:</span>
                <span className="text-[#F7F0E6]">{product.dimensions}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Palette className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8E7D6C] block">Artisan Tone:</span>
                <span className="text-[#F7F0E6]">{product.color}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <HeartHandshake className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8E7D6C] block">Care Ritual:</span>
                <span className="text-[#F7F0E6]">{product.careInstructions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Quantity */}
        <div className="space-y-4 pt-4 border-t border-[#3A2B20]/60">
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-wider text-[#8E7D6C] font-medium">
              Quantity:
            </span>
            <div className="flex items-center border border-[#3A2B20] rounded bg-[#18120E]">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-sm text-[#BDAE9D] hover:text-[#F7F0E6]"
              >
                -
              </button>
              <span className="px-4 text-sm font-semibold text-[#F7F0E6]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="px-3 py-1.5 text-sm text-[#BDAE9D] hover:text-[#F7F0E6]"
              >
                +
              </button>
            </div>
            <span className="text-xs text-[#8E7D6C]">
              {product.stockQuantity} pieces remaining in atelier
            </span>
          </div>

          {/* Button Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                isAdded
                  ? 'bg-[#6FC69B] text-[#100C09]'
                  : product.isAvailable
                  ? 'bg-[#251B14] hover:bg-[#302217] text-[#F7F0E6] hover:text-[#E0BF78] border border-[#3A2B20]'
                  : 'bg-[#3A2B20] text-[#8E7D6C] cursor-not-allowed'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#C6A15B]" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.isAvailable}
              className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-lg ${
                product.isAvailable
                  ? 'bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] hover:from-[#E0BF78] hover:to-[#C6A15B] text-[#100C09]'
                  : 'bg-[#3A2B20] text-[#8E7D6C] cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>

        {/* Atelier Guarantees */}
        <div className="grid grid-cols-3 gap-3 text-center pt-6 border-t border-[#3A2B20]/40 text-xs text-[#8E7D6C]">
          <div className="p-3 rounded bg-[#18120E] border border-[#3A2B20]/50">
            <span className="block font-semibold text-[#F7F0E6]">Cash on Delivery</span>
            <span className="text-[10px]">Inspect before payment</span>
          </div>
          <div className="p-3 rounded bg-[#18120E] border border-[#3A2B20]/50">
            <span className="block font-semibold text-[#F7F0E6]">Free Shipping</span>
            <span className="text-[10px]">Nationwide in Pakistan</span>
          </div>
          <div className="p-3 rounded bg-[#18120E] border border-[#3A2B20]/50">
            <span className="block font-semibold text-[#F7F0E6]">100% Genuine</span>
            <span className="text-[10px]">Authenticity guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
