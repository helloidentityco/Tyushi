'use client';

import React, { useState, useTransition, useMemo } from 'react';
import {
  Percent,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Tag,
  ToggleLeft,
  ToggleRight,
  Eye,
  X,
} from 'lucide-react';
import {
  createDiscountAction,
  updateDiscountAction,
  setDiscountStatusAction,
  deleteDiscountAction,
} from '@/app/actions/discounts';
import { formatPKR } from '@/lib/pricing';

interface DiscountItem {
  id: string;
  name: string;
  scope: 'COLLECTION' | 'CATEGORY';
  collectionId: string;
  categoryId?: string | null;
  discountPercent: number;
  isActive: boolean;
  startsAt?: any;
  endsAt?: any;
  collection: {
    id: string;
    name: string;
    slug: string;
    isPremium: boolean;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface DiscountManagerProps {
  initialDiscounts: DiscountItem[];
  collections: Array<{ id: string; name: string; slug: string; isPremium: boolean }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  products: Array<{
    id: string;
    name: string;
    collectionId: string;
    categoryId: string;
    price: string;
  }>;
}

export default function DiscountManager({
  initialDiscounts,
  collections,
  categories,
  products,
}: DiscountManagerProps) {
  const [discounts, setDiscounts] = useState<DiscountItem[]>(initialDiscounts);
  const [isPending, startTransition] = useTransition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const initialForm = {
    name: '',
    scope: 'COLLECTION' as 'COLLECTION' | 'CATEGORY',
    collectionId: collections[0]?.id || '',
    categoryId: categories[0]?.id || '',
    discountPercent: 15,
    isActive: true,
    startsAt: '',
    endsAt: '',
  };

  const [formFields, setFormFields] = useState(initialForm);

  // Live preview of affected products
  const affectedProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.collectionId !== formFields.collectionId) return false;
      if (formFields.scope === 'CATEGORY' && p.categoryId !== formFields.categoryId) {
        return false;
      }
      return true;
    });
  }, [products, formFields.collectionId, formFields.categoryId, formFields.scope]);

  const openCreate = () => {
    setEditingDiscount(null);
    setFormFields({
      ...initialForm,
      collectionId: collections[0]?.id || '',
      categoryId: categories[0]?.id || '',
    });
    setIsFormOpen(true);
  };

  const handleToggleActive = (d: DiscountItem) => {
    const nextState = !d.isActive;
    startTransition(async () => {
      const res = await setDiscountStatusAction(d.id, nextState);
      if (res.success) {
        setDiscounts((prev) =>
          prev.map((item) => (item.id === d.id ? { ...item, isActive: nextState } : item))
        );
        setFeedback({
          type: 'success',
          message: `Discount '${d.name}' is now ${nextState ? 'ACTIVE' : 'INACTIVE'}. Selling prices have been recalculated across the storefront.`,
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to toggle status.' });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion configuration?')) return;

    startTransition(async () => {
      const res = await deleteDiscountAction(id);
      if (res.success) {
        setDiscounts((prev) => prev.filter((d) => d.id !== id));
        setFeedback({ type: 'success', message: 'Promotion deleted.' });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Delete failed.' });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const payload = {
        name: formFields.name,
        scope: formFields.scope,
        collectionId: formFields.collectionId,
        categoryId: formFields.scope === 'CATEGORY' ? formFields.categoryId : null,
        discountPercent: formFields.discountPercent,
        isActive: formFields.isActive,
        startsAt: formFields.startsAt ? new Date(formFields.startsAt).toISOString() : null,
        endsAt: formFields.endsAt ? new Date(formFields.endsAt).toISOString() : null,
      };

      if (editingDiscount) {
        const res = await updateDiscountAction(editingDiscount.id, payload);
        if (res.success) {
          const col = collections.find((c) => c.id === formFields.collectionId)!;
          const cat = categories.find((c) => c.id === formFields.categoryId) || null;

          setDiscounts((prev) =>
            prev.map((d) =>
              d.id === editingDiscount.id
                ? {
                    ...d,
                    ...payload,
                    collection: col,
                    category: cat,
                  }
                : d
            )
          );
          setIsFormOpen(false);
          setFeedback({ type: 'success', message: 'Discount promotion updated successfully.' });
          setTimeout(() => setFeedback(null), 4000);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Update failed' });
        }
      } else {
        const res = await createDiscountAction(payload);
        if (res.success) {
          const col = collections.find((c) => c.id === formFields.collectionId)!;
          const cat = categories.find((c) => c.id === formFields.categoryId) || null;

          const newDisc: DiscountItem = {
            id: `disc-${Date.now()}`,
            ...payload,
            collection: col,
            category: cat,
          };

          setDiscounts((prev) => [newDisc, ...prev]);
          setIsFormOpen(false);
          setFeedback({
            type: 'success',
            message: `Created ${formFields.discountPercent}% promotion '${formFields.name}'. Storefront prices updated automatically.`,
          });
          setTimeout(() => setFeedback(null), 4000);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Creation failed' });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview & Action */}
      <div className="p-4 rounded-xl bg-[#18120E] border border-[#3A2B20] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-editorial text-lg font-bold text-[#F7F0E6]">
            Active Promotional Matrix
          </h3>
          <p className="text-xs text-[#8E7D6C]">
            Rules: Category discounts take precedence over collection discounts. Stacking is prevented automatically.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] text-xs font-bold uppercase tracking-wider shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Promotion</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-xs flex items-start gap-3 ${
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

      {/* Discounts Table */}
      <div className="rounded-xl bg-[#18120E] border border-[#3A2B20] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#211811] text-[#8E7D6C] uppercase tracking-wider border-b border-[#3A2B20]">
              <tr>
                <th className="p-4">Promotion Name</th>
                <th className="p-4">Target Scope</th>
                <th className="p-4">Collection Target</th>
                <th className="p-4">Category Target</th>
                <th className="p-4 font-mono">Percentage</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2B20]/60 text-[#BDAE9D]">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#8E7D6C]">
                    No promotional rules active. Click &quot;New Promotion&quot; to configure collection or category discounts.
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-[#211811]/40 transition-colors">
                    <td className="p-4 font-semibold text-[#F7F0E6] flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#C6A15B]" />
                      <span>{d.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#251B14] text-[#E0BF78] border border-[#3A2B20]">
                        {d.scope}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-[#F7F0E6]">{d.collection.name}</td>
                    <td className="p-4 text-[#BDAE9D]">
                      {d.scope === 'CATEGORY' ? d.category?.name || 'Category Specific' : 'Entire Collection'}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#E0BF78] text-sm">
                      {d.discountPercent}% OFF
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(d)}
                        className={`text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded transition-colors ${
                          d.isActive
                            ? 'bg-[#6FC69B]/20 text-[#6FC69B] border border-[#6FC69B]/40'
                            : 'bg-[#E58A82]/20 text-[#E58A82] border border-[#E58A82]/40'
                        }`}
                      >
                        {d.isActive ? 'Active ON' : 'Paused OFF'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 rounded hover:bg-[#251B14] text-[#8E7D6C] hover:text-[#E58A82]"
                        title="Delete Promotion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal with Live Preview */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl bg-[#18120E] border border-[#3A2B20] p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#3A2B20]">
              <h3 className="font-editorial text-xl font-bold text-[#F7F0E6]">
                Configure Leather Promotion
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded text-[#8E7D6C] hover:text-[#F7F0E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="space-y-1">
                <label className="text-[#BDAE9D] font-medium block">Promotion Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kawish Heritage Season - 15% Off"
                  value={formFields.name}
                  onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Scope selector */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">Promotion Scope *</label>
                  <select
                    value={formFields.scope}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        scope: e.target.value as 'COLLECTION' | 'CATEGORY',
                      })
                    }
                    className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  >
                    <option value="COLLECTION">Entire Collection (All categories)</option>
                    <option value="CATEGORY">Category within Collection</option>
                  </select>
                </div>

                {/* Percentage */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">
                    Discount Percentage (1 - 100%) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={formFields.discountPercent}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        discountPercent: Math.min(100, Math.max(1, Number(e.target.value))),
                      })
                    }
                    className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                {/* Collection selector */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">Target Collection *</label>
                  <select
                    value={formFields.collectionId}
                    onChange={(e) =>
                      setFormFields({ ...formFields, collectionId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                  >
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.isPremium ? '(Premium)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category selector (when CATEGORY scope) */}
                <div className="space-y-1">
                  <label className="text-[#BDAE9D] font-medium block">
                    Target Category {formFields.scope === 'CATEGORY' ? '*' : '(Disabled)'}
                  </label>
                  <select
                    disabled={formFields.scope === 'COLLECTION'}
                    value={formFields.categoryId}
                    onChange={(e) => setFormFields({ ...formFields, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B] disabled:opacity-50"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Preview of Affected Products and Effective Prices */}
              <div className="p-4 rounded-lg bg-[#211811] border border-[#3A2B20] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#E0BF78] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Impact Preview</span>
                  </span>
                  <span className="text-[#8E7D6C]">
                    Affects <strong className="text-[#F7F0E6]">{affectedProducts.length}</strong> items
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-2 pr-1 text-[11px]">
                  {affectedProducts.length === 0 ? (
                    <span className="text-[#8E7D6C]">No products match this scope target.</span>
                  ) : (
                    affectedProducts.map((p) => {
                      const reg = Number(p.price);
                      const eff = Math.round(reg * (1 - formFields.discountPercent / 100));
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded bg-[#18120E] border border-[#3A2B20]/60"
                        >
                          <span className="font-medium text-[#F7F0E6] truncate max-w-xs">
                            {p.name}
                          </span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-[#8E7D6C] line-through">{formatPKR(reg)}</span>
                            <span className="text-[#E0BF78] font-bold">{formatPKR(eff)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A2B20]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded bg-[#211811] text-[#BDAE9D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] font-bold uppercase tracking-wider"
                >
                  {isPending ? 'Applying Promotion...' : 'Launch Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
