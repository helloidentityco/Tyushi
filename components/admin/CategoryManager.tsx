'use client';

import React, { useState, useTransition } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/app/actions/categories';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  totalProducts: number;
  kawishProducts: number;
  mooiProducts: number;
}

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createCategoryAction(formData);
      if (res.success) {
        setCategories((prev) => [
          ...prev,
          {
            id: `cat-${formData.slug}`,
            ...formData,
            totalProducts: 0,
            kawishProducts: 0,
            mooiProducts: 0,
          },
        ]);
        setIsCreating(false);
        setFormData({ name: '', slug: '', description: '' });
        setFeedback({ type: 'success', message: `Category '${formData.name}' created successfully.` });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to create category.' });
      }
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    startTransition(async () => {
      const res = await updateCategoryAction(editingCategory.id, {
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description,
      });

      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? editingCategory : c))
        );
        setEditingCategory(null);
        setFeedback({ type: 'success', message: `Category '${editingCategory.name}' updated.` });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Update failed.' });
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingCategory) return;

    startTransition(async () => {
      const res = await deleteCategoryAction(deletingCategory.id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
        setDeletingCategory(null);
        setFeedback({ type: 'success', message: 'Category removed successfully.' });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Deletion prevented.' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#8E7D6C]">
          Shared product categories applied across both Kawish and Mooi collections.
        </p>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-gradient-to-r from-[#C6A15B] to-[#E0BF78] text-[#100C09] text-xs font-bold uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
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

      {/* Categories Table */}
      <div className="rounded-xl bg-[#18120E] border border-[#3A2B20] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#211811] text-[#8E7D6C] uppercase tracking-wider border-b border-[#3A2B20]">
              <tr>
                <th className="p-4">Category Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Kawish Products</th>
                <th className="p-4 text-center">Mooi Products</th>
                <th className="p-4 text-center">Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2B20]/60 text-[#BDAE9D]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#211811]/40 transition-colors">
                  <td className="p-4 font-semibold text-[#F7F0E6]">{cat.name}</td>
                  <td className="p-4 font-mono text-[#8E7D6C]">{cat.slug}</td>
                  <td className="p-4 text-[#BDAE9D] max-w-xs truncate">{cat.description}</td>
                  <td className="p-4 text-center font-mono text-[#E0BF78]">{cat.kawishProducts}</td>
                  <td className="p-4 text-center font-mono text-[#BDAE9D]">{cat.mooiProducts}</td>
                  <td className="p-4 text-center font-mono font-bold text-[#F7F0E6]">
                    {cat.totalProducts}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="p-1.5 rounded hover:bg-[#251B14] text-[#E0BF78]"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="p-1.5 rounded hover:bg-[#251B14] text-[#8E7D6C] hover:text-[#E58A82]"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#18120E] border border-[#3A2B20] p-6 space-y-4 shadow-2xl">
            <h3 className="font-editorial text-xl font-bold text-[#F7F0E6]">
              Create Shared Category
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#BDAE9D] block font-medium">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel Duffles"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData({ ...formData, name, slug });
                  }}
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#BDAE9D] block font-medium">Category Slug</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#BDAE9D] block font-medium">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief narrative for category navigation"
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A2B20]">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded bg-[#211811] text-[#BDAE9D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded bg-[#C6A15B] text-[#100C09] font-bold uppercase tracking-wider"
                >
                  {isPending ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#18120E] border border-[#3A2B20] p-6 space-y-4 shadow-2xl">
            <h3 className="font-editorial text-xl font-bold text-[#F7F0E6]">
              Edit Category: {editingCategory.name}
            </h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#BDAE9D] block font-medium">Category Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#BDAE9D] block font-medium">Category Slug</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#BDAE9D] block font-medium">Description</label>
                <textarea
                  required
                  rows={3}
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-[#211811] border border-[#3A2B20] text-[#F7F0E6] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A2B20]">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded bg-[#211811] text-[#BDAE9D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded bg-[#C6A15B] text-[#100C09] font-bold uppercase tracking-wider"
                >
                  {isPending ? 'Updating...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#18120E] border border-[#E58A82]/50 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#E58A82]">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-editorial text-xl font-bold">
                Confirm Category Deletion
              </h3>
            </div>
            <p className="text-xs text-[#BDAE9D] leading-relaxed">
              Are you sure you want to delete category <strong className="text-[#F7F0E6]">{deletingCategory.name}</strong>?
              If products still reference this category, the deletion will be safely rejected to prevent orphaned records.
            </p>
            {deletingCategory.totalProducts > 0 && (
              <p className="text-xs text-[#E58A82] font-semibold">
                Warning: {deletingCategory.totalProducts} product(s) are currently assigned to this category.
              </p>
            )}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A2B20]">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded bg-[#211811] text-[#BDAE9D]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded bg-[#E58A82] text-[#100C09] font-bold uppercase tracking-wider"
              >
                {isPending ? 'Checking & Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
