'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Upload,
  Sparkles,
  ExternalLink,
  Loader2,
  X,
  Star,
  Image as ImageIcon,
  ArrowUpDown,
} from 'lucide-react';
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  setProductFeaturedAction,
} from '@/app/actions/products';
import { formatPKR } from '@/lib/pricing';

interface ProductImageRecord {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  collectionId: string;
  categoryId: string;
  description: string;
  price: string;
  originalPrice?: string | null;
  mainImageUrl: string;
  secondaryImageUrl?: string | null;
  images?: ProductImageRecord[];
  isAvailable: boolean;
  isFeatured: boolean;
  sku?: string | null;
  stockQuantity: number;
  leatherDetails: string;
  dimensions: string;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  dimensionsUnit?: string | null;
  color: string;
  careInstructions: string;
  createdAt: any;
  updatedAt: any;
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
    originalPrice?: number | null;
    hasDiscount: boolean;
    discountPercent: number;
    discountFormatted: string;
    savingsAmount: number;
  };
}

interface ProductManagerProps {
  initialProducts: ProductItem[];
  collections: Array<{ id: string; name: string; slug: string; isPremium: boolean }>;
  categories: Array<{ id: string; name: string; slug: string }>;
}

export default function ProductManager({
  initialProducts,
  collections,
  categories,
}: ProductManagerProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState('');
  const [filterCollection, setFilterCollection] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'featured'>('newest');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form Fields State
  const initialFormState = {
    name: '',
    slug: '',
    collectionId: collections[0]?.id || '',
    categoryId: categories[0]?.id || '',
    description: '',
    price: 25000,
    originalPrice: '' as string | number,
    mainImageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
    secondaryImageUrl: '',
    galleryUrls: [] as string[],
    isAvailable: true,
    isFeatured: false,
    sku: '',
    stockQuantity: 10,
    leatherDetails: 'Top-tier Full-Grain Leather, Solid Brass Fittings',
    dimensions: '15" W x 12" H x 4.5" D',
    length: '' as string | number,
    width: '' as string | number,
    height: '' as string | number,
    dimensionsUnit: 'inches',
    color: 'Espresso Walnut',
    careInstructions: 'Condition twice annually with natural beeswax balm.',
  };

  const [formFields, setFormFields] = useState(initialFormState);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormFields({
      ...initialFormState,
      collectionId: collections[0]?.id || '',
      categoryId: categories[0]?.id || '',
    });
    setIsFormOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setFormFields({
      name: p.name,
      slug: p.slug,
      collectionId: p.collectionId,
      categoryId: p.categoryId,
      description: p.description,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : '',
      mainImageUrl: p.mainImageUrl,
      secondaryImageUrl: p.secondaryImageUrl || '',
      galleryUrls: p.images ? p.images.map((img) => img.imageUrl) : [],
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      sku: p.sku || '',
      stockQuantity: p.stockQuantity,
      leatherDetails: p.leatherDetails,
      dimensions: p.dimensions,
      length: p.length ? Number(p.length) : '',
      width: p.width ? Number(p.width) : '',
      height: p.height ? Number(p.height) : '',
      dimensionsUnit: p.dimensionsUnit || 'inches',
      color: p.color,
      careInstructions: p.careInstructions,
    });
    setIsFormOpen(true);
  };

  // Multiple / Single Cloudinary Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadData = new FormData();
        uploadData.append('file', file);

        const res = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: uploadData,
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || `Failed to upload ${file.name}`);
        }
        uploadedUrls.push(json.secureUrl || json.url);
      }

      if (isGallery) {
        setFormFields((prev) => ({
          ...prev,
          galleryUrls: [...prev.galleryUrls, ...uploadedUrls],
        }));
      } else {
        setFormFields((prev) => ({
          ...prev,
          mainImageUrl: uploadedUrls[0] || prev.mainImageUrl,
        }));
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Image upload error' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setFormFields((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const setAsMainImage = (url: string) => {
    setFormFields((prev) => ({
      ...prev,
      mainImageUrl: url,
    }));
  };

  // Toggle Featured status directly from table
  const handleToggleFeatured = (productId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isFeatured: nextStatus } : p))
    );

    startTransition(async () => {
      const res = await setProductFeaturedAction(productId, nextStatus);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Product featured status updated to ${nextStatus ? 'ON (Shown on homepage)' : 'OFF'}.`,
        });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        // Revert
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isFeatured: currentStatus } : p))
        );
        setFeedback({ type: 'error', message: res.error || 'Failed to update featured status' });
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formFields.originalPrice && Number(formFields.originalPrice) <= formFields.price) {
      setFeedback({
        type: 'error',
        message: 'Original reference price must be strictly greater than the actual selling price.',
      });
      return;
    }

    startTransition(async () => {
      const payload = {
        name: formFields.name,
        slug: formFields.slug,
        collectionId: formFields.collectionId,
        categoryId: formFields.categoryId,
        description: formFields.description,
        price: formFields.price,
        originalPrice: formFields.originalPrice ? Number(formFields.originalPrice) : null,
        mainImageUrl: formFields.mainImageUrl,
        secondaryImageUrl: formFields.secondaryImageUrl || null,
        imageUrls: formFields.galleryUrls,
        isAvailable: formFields.isAvailable,
        isFeatured: formFields.isFeatured,
        sku: formFields.sku || null,
        stockQuantity: formFields.stockQuantity,
        leatherDetails: formFields.leatherDetails,
        dimensions: formFields.dimensions,
        length: formFields.length ? Number(formFields.length) : null,
        width: formFields.width ? Number(formFields.width) : null,
        height: formFields.height ? Number(formFields.height) : null,
        dimensionsUnit: formFields.dimensionsUnit,
        color: formFields.color,
        careInstructions: formFields.careInstructions,
      };

      if (editingProduct) {
        const res = await updateProductAction(editingProduct.id, payload);
        if (res.success) {
          const col = collections.find((c) => c.id === formFields.collectionId)!;
          const cat = categories.find((c) => c.id === formFields.categoryId)!;

          setProducts((prev) =>
            prev.map((p) =>
              p.id === editingProduct.id
                ? {
                    ...p,
                    ...payload,
                    price: formFields.price.toFixed(2),
                    originalPrice: payload.originalPrice ? payload.originalPrice.toFixed(2) : null,
                    collection: col,
                    category: cat,
                    updatedAt: new Date().toISOString(),
                    pricing: {
                      ...p.pricing,
                      regularPrice: formFields.price,
                      originalPrice: payload.originalPrice,
                      effectivePrice: formFields.price * (1 - (p.pricing.discountPercent || 0) / 100),
                    },
                  }
                : p
            )
          );
          setIsFormOpen(false);
          setFeedback({ type: 'success', message: `Product '${formFields.name}' updated successfully.` });
          setTimeout(() => setFeedback(null), 4000);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Update failed' });
        }
      } else {
        const res = await createProductAction(payload);
        if (res.success) {
          const col = collections.find((c) => c.id === formFields.collectionId)!;
          const cat = categories.find((c) => c.id === formFields.categoryId)!;

          const newProd: ProductItem = {
            id: res.productId!,
            ...payload,
            price: formFields.price.toFixed(2),
            originalPrice: payload.originalPrice ? payload.originalPrice.toFixed(2) : null,
            collection: col,
            category: cat,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pricing: {
              regularPrice: formFields.price,
              effectivePrice: formFields.price,
              originalPrice: payload.originalPrice,
              hasDiscount: !!payload.originalPrice && payload.originalPrice > formFields.price,
              discountPercent: 0,
              discountFormatted: '',
              savingsAmount: 0,
            },
          };

          setProducts((prev) => [newProd, ...prev]);
          setIsFormOpen(false);
          setFeedback({ type: 'success', message: `Product '${formFields.name}' created successfully.` });
          setTimeout(() => setFeedback(null), 4000);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Creation failed' });
        }
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingProduct) return;

    startTransition(async () => {
      const res = await deleteProductAction(deletingProduct.id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
        setDeletingProduct(null);
        setFeedback({ type: 'success', message: 'Product listing deleted. Historical orders preserved.' });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Deletion failed.' });
      }
    });
  };

  // Filtered & Sorted view
  const filteredProducts = products
    .filter((p) => {
      if (filterCollection !== 'all' && p.collectionId !== filterCollection) return false;
      if (filterCategory !== 'all' && p.categoryId !== filterCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricing.effectivePrice - b.pricing.effectivePrice;
      if (sortBy === 'price-desc') return b.pricing.effectivePrice - a.pricing.effectivePrice;
      if (sortBy === 'featured') return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7D6C]" />
            <input
              type="text"
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] placeholder-[#8E7D6C] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>

          {/* Collection Filter */}
          <select
            value={filterCollection}
            onChange={(e) => setFilterCollection(e.target.value)}
            className="py-2 px-3 text-xs rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
          >
            <option value="all">All Collections</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name} {col.isPremium ? '(Premium)' : ''}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="py-2 px-3 text-xs rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-2 px-3 text-xs rounded-lg bg-[#211811] border border-[#3A2B20] text-[#BDAE9D] focus:outline-none focus:border-[#C6A15B]"
          >
            <option value="newest">Newest First</option>
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition-opacity cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Listing</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-3 shadow-lg ${
            feedback.type === 'success'
              ? 'bg-[#6FC69B]/10 border border-[#6FC69B]/40 text-[#6FC69B]'
              : 'bg-[#E58A82]/10 border border-[#E58A82]/40 text-[#E58A82]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-2xl bg-[#18120E] border border-[#3A2B20] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#211811] text-[#8E7D6C] uppercase tracking-wider border-b border-[#3A2B20]">
              <tr>
                <th className="p-4">Product Listing</th>
                <th className="p-4">Collection</th>
                <th className="p-4">Category</th>
                <th className="p-4">Original Ref</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4 text-center">Featured</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2B20]/60 text-[#BDAE9D]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-[#8E7D6C]">
                    No product listings match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isKawish = p.collection.isPremium || p.collection.slug === 'kawish';

                  return (
                    <tr key={p.id} className="hover:bg-[#211811]/40 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-[#251B14] shrink-0 border border-[#3A2B20]">
                            <Image
                              src={p.mainImageUrl}
                              alt={p.name}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-[#F7F0E6] block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-[#8E7D6C] block">
                              SKU: {p.sku || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Collection */}
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 font-medium text-[#F7F0E6]">
                          <span>{p.collection.name}</span>
                          {isKawish && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#C6A15B]/20 text-[#E0BF78] rounded border border-[#C6A15B]/30 font-bold">
                              PREMIUM
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-[#BDAE9D]">{p.category.name}</td>

                      {/* Original Reference Price */}
                      <td className="p-4 font-mono text-[#8E7D6C]">
                        {p.pricing.originalPrice ? (
                          <span className="line-through">{formatPKR(p.pricing.originalPrice)}</span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Actual Selling Price with Discount Badge */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#E0BF78] text-sm">
                            {formatPKR(p.pricing.effectivePrice)}
                          </span>
                          {p.pricing.hasDiscount && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#C6A15B] text-[#100C09] font-bold">
                              {p.pricing.discountFormatted || `${p.pricing.discountPercent}% OFF`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Featured Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(p.id, p.isFeatured)}
                          title={p.isFeatured ? 'Featured on Homepage (Click to disable)' : 'Not featured (Click to feature)'}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            p.isFeatured
                              ? 'bg-[#C6A15B]/20 text-[#E0BF78] border-[#C6A15B]/50'
                              : 'bg-[#211811] text-[#8E7D6C] border-[#3A2B20] hover:text-[#BDAE9D]'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${p.isFeatured ? 'fill-[#C6A15B]' : ''}`} />
                        </button>
                      </td>

                      {/* Stock Quantity */}
                      <td className="p-4 text-center font-mono font-medium">
                        <span
                          className={
                            p.stockQuantity > 5
                              ? 'text-[#F7F0E6]'
                              : p.stockQuantity > 0
                              ? 'text-[#E2B765]'
                              : 'text-[#E58A82]'
                          }
                        >
                          {p.stockQuantity}
                        </span>
                      </td>

                      {/* Availability */}
                      <td className="p-4 text-center">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            p.isAvailable
                              ? 'bg-[#6FC69B]/20 text-[#6FC69B] border border-[#6FC69B]/30'
                              : 'bg-[#E58A82]/20 text-[#E58A82] border border-[#E58A82]/30'
                          }`}
                        >
                          {p.isAvailable ? 'Available' : 'Disabled'}
                        </span>
                      </td>

                      {/* Action Buttons: View, Edit, Delete */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-[#251B14] text-[#8E7D6C] hover:text-[#BDAE9D] transition-colors"
                            title="View Public Product Route"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg hover:bg-[#251B14] text-[#E0BF78] hover:text-[#F7F0E6] transition-colors cursor-pointer"
                            title="Edit Listing"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 rounded-lg hover:bg-[#251B14] text-[#8E7D6C] hover:text-[#E58A82] transition-colors cursor-pointer"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-[#18120E] border border-[#3A2B20] p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#3A2B20]">
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#C6A15B] font-semibold">
                  {editingProduct ? 'Listing Mutation' : 'New Atelier Creation'}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#F7F0E6]">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Create New Product Listing'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-[#8E7D6C] hover:text-[#F7F0E6] hover:bg-[#251B14] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[#BDAE9D] font-medium block">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formFields.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setFormFields({
                        ...formFields,
                        name,
                        slug: editingProduct ? formFields.slug : slug,
                      });
                    }}
                    placeholder="e.g. The Sovereign Waxed Messenger"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formFields.slug}
                    onChange={(e) => setFormFields({ ...formFields, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">SKU Code</label>
                  <input
                    type="text"
                    value={formFields.sku}
                    onChange={(e) => setFormFields({ ...formFields, sku: e.target.value })}
                    placeholder="e.g. TY-MES-009"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* Collection */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">Collection *</label>
                  <select
                    value={formFields.collectionId}
                    onChange={(e) => setFormFields({ ...formFields, collectionId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  >
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.isPremium ? '(Premium)' : '(General)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">Product Category *</label>
                  <select
                    value={formFields.categoryId}
                    onChange={(e) => setFormFields({ ...formFields, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actual Selling Price (PKR) */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">
                    Actual Selling Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formFields.price}
                    onChange={(e) => setFormFields({ ...formFields, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* Original Reference Price (Optional) */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">
                    Original Price (Optional, must be &gt; selling price)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formFields.originalPrice}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        originalPrice: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    placeholder="e.g. 32000"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* Dimensions (Length, Width, Height) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[#BDAE9D] font-medium block">
                    Dimensions &amp; Measurements
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Length"
                      value={formFields.length}
                      onChange={(e) => setFormFields({ ...formFields, length: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Width"
                      value={formFields.width}
                      onChange={(e) => setFormFields({ ...formFields, width: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Height"
                      value={formFields.height}
                      onChange={(e) => setFormFields({ ...formFields, height: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none"
                    />
                    <select
                      value={formFields.dimensionsUnit}
                      onChange={(e) => setFormFields({ ...formFields, dimensionsUnit: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none"
                    >
                      <option value="inches">inches</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                </div>

                {/* Leather Details */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">Leather Specifications *</label>
                  <input
                    type="text"
                    required
                    value={formFields.leatherDetails}
                    onChange={(e) =>
                      setFormFields({ ...formFields, leatherDetails: e.target.value })
                    }
                    placeholder="e.g. Full-Grain Pull-Up Waxed Leather"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* Color */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">Color / Finish *</label>
                  <input
                    type="text"
                    required
                    value={formFields.color}
                    onChange={(e) => setFormFields({ ...formFields, color: e.target.value })}
                    placeholder="e.g. Walnut Cognac"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formFields.stockQuantity}
                    onChange={(e) =>
                      setFormFields({ ...formFields, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* Care Instructions */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">Care Ritual *</label>
                  <input
                    type="text"
                    required
                    value={formFields.careInstructions}
                    onChange={(e) =>
                      setFormFields({ ...formFields, careInstructions: e.target.value })
                    }
                    placeholder="e.g. Buff gently with horsehair brush"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[#BDAE9D] font-medium block">Detailed Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formFields.description}
                    onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* Primary Image Upload */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[#BDAE9D] font-medium block">
                    Primary Image URL or Cloudinary Upload *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={formFields.mainImageUrl}
                      onChange={(e) => setFormFields({ ...formFields, mainImageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 px-3.5 py-2 rounded-lg bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                    />
                    <label className="px-3.5 py-2 rounded-lg bg-[#251B14] hover:bg-[#302217] text-[#E0BF78] border border-[#3A2B20] cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, false)}
                      />
                    </label>
                  </div>
                </div>

                {/* Multiple Additional Images (Gallery) */}
                <div className="space-y-2 sm:col-span-2 p-4 rounded-xl bg-[#211811] border border-[#3A2B20]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#F7F0E6] block">
                        Additional Product Images Gallery
                      </span>
                      <span className="text-[11px] text-[#8E7D6C]">
                        Upload multiple high-resolution photos for gallery and zoom interactions.
                      </span>
                    </div>

                    <label className="px-3 py-1.5 rounded-lg bg-[#C6A15B] hover:bg-[#E0BF78] text-[#100C09] text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, true)}
                      />
                    </label>
                  </div>

                  {formFields.galleryUrls.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                      {formFields.galleryUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-lg overflow-hidden bg-[#18120E] border border-[#3A2B20] aspect-square"
                        >
                          <Image
                            src={url}
                            alt={`Gallery ${idx}`}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setAsMainImage(url)}
                              className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#C6A15B] text-[#100C09] font-bold"
                            >
                              Set Main
                            </button>
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#E58A82] text-[#100C09] font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#8E7D6C] italic pt-1">
                      No additional images uploaded yet.
                    </p>
                  )}
                </div>

                {/* Toggles: Availability and Featured */}
                <div className="flex items-center gap-6 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFields.isAvailable}
                      onChange={(e) =>
                        setFormFields({ ...formFields, isAvailable: e.target.checked })
                      }
                      className="rounded bg-[#211811] border-[#3A2B20] text-[#C6A15B] focus:ring-0"
                    />
                    <span className="text-[#F7F0E6]">Available for Purchase</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFields.isFeatured}
                      onChange={(e) =>
                        setFormFields({ ...formFields, isFeatured: e.target.checked })
                      }
                      className="rounded bg-[#211811] border-[#3A2B20] text-[#C6A15B] focus:ring-0"
                    />
                    <span className="text-[#F7F0E6]">Showcase on Homepage</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#3A2B20]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#211811] text-[#BDAE9D] hover:text-[#F7F0E6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploadingImage}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] font-bold uppercase tracking-wider hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Saving Listing...' : editingProduct ? 'Update Listing' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#18120E] border border-[#E58A82]/50 p-6 space-y-4 shadow-2xl">
            <h3 className="font-editorial text-xl font-bold text-[#E58A82]">
              Delete Product Record
            </h3>
            <p className="text-xs text-[#BDAE9D] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#F7F0E6]">{deletingProduct.name}</strong>?
              Past orders containing this product will maintain their immutable historical price and product snapshots.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A2B20]">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-lg bg-[#211811] text-[#BDAE9D]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-lg bg-[#E58A82] text-[#100C09] font-bold uppercase tracking-wider"
              >
                {isPending ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
