'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { setCollectionVisibilityAction, updateCollectionAction } from '@/app/actions/collections';

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImageUrl: string;
  bannerImageUrl: string;
  isVisible: boolean;
  isPremium: boolean;
  productCount: number;
  discounts: any[];
}

export default function CollectionManager({
  initialCollections,
}: {
  initialCollections: CollectionItem[];
}) {
  const [collections, setCollections] = useState<CollectionItem[]>(initialCollections);
  const [isPending, startTransition] = useTransition();
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleToggleVisibility = (collection: CollectionItem) => {
    const nextState = !collection.isVisible;
    startTransition(async () => {
      const res = await setCollectionVisibilityAction(collection.id, nextState);
      if (res.success) {
        setCollections((prev) =>
          prev.map((c) => (c.id === collection.id ? { ...c, isVisible: nextState } : c))
        );
        setFeedback({
          type: 'success',
          message: `Collection '${collection.name}' is now ${nextState ? 'VISIBLE on storefront' : 'HIDDEN from storefront'}. All public listings, navbar dropdown, and purchasing rules have been updated.`,
        });
        setTimeout(() => setFeedback(null), 6000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update visibility.' });
      }
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;

    startTransition(async () => {
      const res = await updateCollectionAction({
        id: editingCollection.id,
        name: editingCollection.name,
        description: editingCollection.description,
        heroImageUrl: editingCollection.heroImageUrl,
        bannerImageUrl: editingCollection.bannerImageUrl,
        isVisible: editingCollection.isVisible,
      });

      if (res.success) {
        setCollections((prev) =>
          prev.map((c) => (c.id === editingCollection.id ? editingCollection : c))
        );
        setEditingCollection(null);
        setFeedback({
          type: 'success',
          message: `Collection '${editingCollection.name}' updated successfully.`,
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Update failed.' });
      }
    });
  };

  return (
    <div className="space-y-6">
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

      {/* Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {collections.map((col) => {
          const isKawish = col.isPremium || col.slug === 'kawish';

          return (
            <div
              key={col.id}
              className={`rounded-xl bg-[#18120E] border transition-all overflow-hidden flex flex-col justify-between ${
                col.isVisible ? 'border-[#3A2B20]' : 'border-[#E58A82]/40 opacity-90'
              }`}
            >
              {/* Banner Image Preview */}
              <div className="relative aspect-[16/9] w-full bg-[#211811] overflow-hidden">
                <Image
                  src={col.heroImageUrl}
                  alt={col.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18120E] via-[#18120E]/40 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {isKawish && (
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-[#100C09]/90 text-[#E0BF78] border border-[#C6A15B] shadow-lg">
                      PREMIUM ATELIER
                    </span>
                  )}
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded ${
                      col.isVisible
                        ? 'bg-[#6FC69B]/90 text-[#100C09]'
                        : 'bg-[#E58A82] text-[#100C09]'
                    }`}
                  >
                    {col.isVisible ? 'STOREFRONT: ACTIVE' : 'STOREFRONT: DISABLED'}
                  </span>
                </div>
              </div>

              {/* Information & Stats */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-2xl font-bold text-[#F7F0E6]">
                      {col.name}
                    </h3>
                    <span className="text-xs font-mono text-[#8E7D6C]">/{col.slug}</span>
                  </div>

                  <p className="text-xs text-[#BDAE9D] leading-relaxed">
                    {col.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                    <div className="p-3 rounded bg-[#211811] border border-[#3A2B20]">
                      <span className="text-[#8E7D6C] block text-[11px]">Catalogued Products</span>
                      <span className="font-bold text-[#F7F0E6] text-sm">{col.productCount} pieces</span>
                    </div>
                    <div className="p-3 rounded bg-[#211811] border border-[#3A2B20]">
                      <span className="text-[#8E7D6C] block text-[11px]">Active Discounts</span>
                      <span className="font-bold text-[#6FC69B] text-sm">
                        {col.discounts?.length || 0} active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visibility Toggle and Actions */}
                <div className="pt-6 border-t border-[#3A2B20] flex items-center justify-between gap-4">
                  {/* ON/OFF Switch */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleVisibility(col)}
                      className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        col.isVisible ? 'bg-[#6FC69B]' : 'bg-[#3A2B20]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          col.isVisible ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-[#F7F0E6]">
                      Visible on Storefront: {col.isVisible ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCollection(col)}
                      className="p-2 rounded bg-[#211811] hover:bg-[#251B14] text-[#E0BF78] border border-[#3A2B20] transition-colors"
                      title="Edit presentation"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {col.isVisible && (
                      <a
                        href={`/collections/${col.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded bg-[#211811] hover:bg-[#251B14] text-[#BDAE9D] hover:text-[#F7F0E6] border border-[#3A2B20] transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Collection Modal */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-[#18120E] border border-[#3A2B20] p-6 space-y-5 shadow-2xl">
            <h3 className="font-editorial text-xl font-bold text-[#F7F0E6]">
              Edit Collection: {editingCollection.name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#BDAE9D] font-medium block">Collection Title</label>
                <input
                  type="text"
                  required
                  value={editingCollection.name}
                  onChange={(e) =>
                    setEditingCollection({ ...editingCollection, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#BDAE9D] font-medium block">Narrative Description</label>
                <textarea
                  required
                  rows={4}
                  value={editingCollection.description}
                  onChange={(e) =>
                    setEditingCollection({ ...editingCollection, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#BDAE9D] font-medium block">Hero Lifestyle Image URL</label>
                <input
                  type="url"
                  required
                  value={editingCollection.heroImageUrl}
                  onChange={(e) =>
                    setEditingCollection({ ...editingCollection, heroImageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#BDAE9D] font-medium block">Collection Banner Image URL</label>
                <input
                  type="url"
                  required
                  value={editingCollection.bannerImageUrl}
                  onChange={(e) =>
                    setEditingCollection({ ...editingCollection, bannerImageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A2B20]">
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="px-4 py-2 rounded bg-[#211811] text-[#BDAE9D] hover:text-[#F7F0E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded bg-[#C6A15B] text-[#100C09] font-bold uppercase tracking-wider"
                >
                  {isPending ? 'Saving Changes...' : 'Save Presentation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
