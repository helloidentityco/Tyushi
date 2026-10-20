'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { formatPKR } from '@/lib/pricing';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    mainImageUrl: string;
    secondaryImageUrl?: string | null;
    isAvailable: boolean;
    leatherDetails: string;
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
    pricing: {
      regularPrice: number;
      effectivePrice: number;
      hasDiscount: boolean;
      discountPercent: number;
      savingsAmount: number;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const isKawish = product.collection.isPremium || product.collection.slug === 'kawish';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      collectionName: product.collection.name,
      categoryName: product.category.name,
      imageUrl: product.mainImageUrl,
      regularPrice: product.pricing.regularPrice,
      effectivePrice: product.pricing.effectivePrice,
      isPremium: isKawish,
    });

    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1500);
  };

  return (
    <div
      className="group relative flex flex-col rounded-lg bg-[#251B14] border border-[#3A2B20] overflow-hidden hover:border-[#C6A15B]/50 transition-all duration-300 shadow-md hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Badges */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] w-full overflow-hidden bg-[#18120E] block">
        {/* Main image */}
        <Image
          src={product.mainImageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isHovered && product.secondaryImageUrl ? 'opacity-0' : 'opacity-100'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Secondary image on hover */}
        {product.secondaryImageUrl && (
          <Image
            src={product.secondaryImageUrl}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-500 absolute inset-0 ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0'
            }`}
            referrerPolicy="no-referrer"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {/* Premium Badge for Kawish */}
          {isKawish ? (
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-[#100C09]/90 text-[#E0BF78] border border-[#C6A15B]/60 shadow-lg">
              PREMIUM
            </span>
          ) : (
            <span />
          )}

          {/* Sale Discount Badge */}
          {product.pricing.hasDiscount && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[#C6A15B] text-[#100C09] shadow-lg">
              {product.pricing.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Desktop Quick Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 hidden md:flex items-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[#100C09] via-[#100C09]/80 to-transparent">
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-semibold uppercase tracking-wider transition-colors shadow-md ${
              isAddedRecently
                ? 'bg-[#6FC69B] text-[#100C09]'
                : product.isAvailable
                ? 'bg-[#C6A15B] hover:bg-[#E0BF78] text-[#100C09]'
                : 'bg-[#3A2B20] text-[#8E7D6C] cursor-not-allowed'
            }`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : product.isAvailable ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            ) : (
              <span>Out of Stock</span>
            )}
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Quiet Metadata */}
          <div className="flex items-center gap-2 text-[11px] text-[#8E7D6C] mb-1">
            <span>{product.collection.name}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category.name}</span>
          </div>

          {/* Product Title */}
          <Link
            href={`/products/${product.slug}`}
            className="font-medium text-sm text-[#F7F0E6] hover:text-[#E0BF78] transition-colors line-clamp-1 mb-1.5"
          >
            {product.name}
          </Link>

          {/* Subtle Leather detail highlight */}
          <p className="text-[11px] text-[#BDAE9D] line-clamp-1 mb-3">
            {product.leatherDetails}
          </p>
        </div>

        {/* Pricing & Mobile Action */}
        <div className="pt-2 border-t border-[#3A2B20]/60 flex items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-semibold text-[#E0BF78] font-editorial">
              {formatPKR(product.pricing.effectivePrice)}
            </div>
            {product.pricing.hasDiscount && (
              <div className="text-xs text-[#8E7D6C] line-through">
                {formatPKR(product.pricing.regularPrice)}
              </div>
            )}
          </div>

          {/* Mobile Always-Visible Add to Bag Button */}
          <div className="md:hidden">
            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              aria-label={`Add ${product.name} to bag`}
              className={`p-2 rounded-full transition-colors ${
                isAddedRecently
                  ? 'bg-[#6FC69B] text-[#100C09]'
                  : product.isAvailable
                  ? 'bg-[#C6A15B] text-[#100C09] active:scale-95'
                  : 'bg-[#3A2B20] text-[#8E7D6C] cursor-not-allowed'
              }`}
            >
              {isAddedRecently ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
