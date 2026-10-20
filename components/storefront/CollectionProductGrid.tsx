'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import ProductCard from './ProductCard';

interface CollectionProductGridProps {
  initialProducts: any[];
  categories: Array<{ id: string; name: string; slug: string }>;
  collectionSlug: string;
}

export default function CollectionProductGrid({
  initialProducts,
  categories,
  collectionSlug,
}: CollectionProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state defaults
  const activeCategory = searchParams.get('category') || 'all';
  const initialSort = searchParams.get('sort') || 'featured';
  const initialSearch = searchParams.get('q') || '';
  const initialMinPrice = searchParams.get('min') || '';
  const initialMaxPrice = searchParams.get('max') || '';

  const [selectedCategory, setSelectedCategory] = useState(activeCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync state to URL search params
  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === 'all' || v === 'featured') {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    updateUrl({ category: slug });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSortBy(val);
    updateUrl({ sort: val });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    updateUrl({ q: val });
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ min: minPrice, max: maxPrice });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSortBy('featured');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    router.replace(pathname, { scroll: false });
  };

  // Filter & sort logic on initialProducts
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category check
      if (selectedCategory !== 'all' && product.category.slug !== selectedCategory) {
        return false;
      }
      // Search check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        const matchLeather = product.leatherDetails?.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchLeather) return false;
      }
      // Price range check on effective selling price
      const effective = product.pricing.effectivePrice;
      if (minPrice && !isNaN(Number(minPrice)) && effective < Number(minPrice)) {
        return false;
      }
      if (maxPrice && !isNaN(Number(maxPrice)) && effective > Number(maxPrice)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.pricing.effectivePrice - b.pricing.effectivePrice;
      } else if (sortBy === 'price-desc') {
        return b.pricing.effectivePrice - a.pricing.effectivePrice;
      } else if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [initialProducts, selectedCategory, searchQuery, minPrice, maxPrice, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    sortBy !== 'featured' ||
    searchQuery !== '' ||
    minPrice !== '' ||
    maxPrice !== '';

  return (
    <div className="space-y-8">
      {/* Category Tabs & Filter Controls Header */}
      <div className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#C6A15B] text-[#100C09] shadow-md'
                  : 'bg-[#211811] text-[#BDAE9D] hover:text-[#F7F0E6] hover:bg-[#251B14]'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                  selectedCategory === cat.slug
                    ? 'bg-[#C6A15B] text-[#100C09] shadow-md'
                    : 'bg-[#211811] text-[#BDAE9D] hover:text-[#F7F0E6] hover:bg-[#251B14]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7D6C]" />
              <input
                type="text"
                placeholder="Search leather goods..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-3 py-2 text-xs rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>

            {/* Sorting Dropdown */}
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="py-2 px-3 text-xs rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>

            {/* Filter Toggle Mobile */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden p-2 rounded bg-[#211811] border border-[#3A2B20] text-[#BDAE9D]"
              aria-label="Toggle price filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Price Filter Sub-bar */}
        <div className={`pt-3 border-t border-[#3A2B20]/60 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
          <form onSubmit={handleApplyPrice} className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-[#8E7D6C] uppercase tracking-wider text-[11px] font-medium">
              Effective Price (PKR):
            </span>
            <input
              type="number"
              placeholder="Min Rs."
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-28 px-3 py-1.5 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
            />
            <span className="text-[#8E7D6C]">to</span>
            <input
              type="number"
              placeholder="Max Rs."
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-28 px-3 py-1.5 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#251B14] hover:bg-[#302217] text-[#E0BF78] border border-[#3A2B20] font-medium"
            >
              Apply Filter
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[#8E7D6C] hover:text-[#E58A82] transition-colors ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#8E7D6C] px-1">
        <span>
          Showing <strong className="text-[#F7F0E6]">{filteredProducts.length}</strong> creations
        </span>
        {hasActiveFilters && (
          <span className="text-[#E0BF78]">Filtered by current selection</span>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded-xl bg-[#18120E] border border-[#3A2B20] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#251B14] border border-[#3A2B20] flex items-center justify-center mx-auto text-[#8E7D6C]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-xl text-[#F7F0E6]">No items found</h3>
          <p className="text-xs text-[#8E7D6C] max-w-sm mx-auto">
            No products match the selected criteria in this collection. Try adjusting your filters or search terms.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded bg-[#C6A15B] text-[#100C09]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
