'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { categorySchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { ensureDbReady } from '@/lib/queries/storefront';

export async function getAdminCategories() {
  await ensureDbReady();
  await requireAdmin();

  const categories = await db.select().from(schema.productCategories);
  const collections = await db.select().from(schema.collections);

  const kawishCol = collections.find((c: any) => c.slug === 'kawish');
  const mooiCol = collections.find((c: any) => c.slug === 'mooi');

  const stats = await Promise.all(
    categories.map(async (cat) => {
      const totalCount = await db
        .select({ count: count() })
        .from(schema.products)
        .where(eq(schema.products.categoryId, cat.id));

      let kawishCount = 0;
      if (kawishCol) {
        const kRes = await db
          .select({ count: count() })
          .from(schema.products)
          .where(and(eq(schema.products.categoryId, cat.id), eq(schema.products.collectionId, kawishCol.id)));
        kawishCount = kRes[0]?.count || 0;
      }

      let mooiCount = 0;
      if (mooiCol) {
        const mRes = await db
          .select({ count: count() })
          .from(schema.products)
          .where(and(eq(schema.products.categoryId, cat.id), eq(schema.products.collectionId, mooiCol.id)));
        mooiCount = mRes[0]?.count || 0;
      }

      return {
        ...cat,
        totalProducts: totalCount[0]?.count || 0,
        kawishProducts: kawishCount,
        mooiProducts: mooiCount,
      };
    })
  );

  return stats;
}

export async function createCategoryAction(data: { name: string; slug: string; description: string }) {
  await ensureDbReady();
  const session = await requireAdmin();

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation failed' };
  }

  const { name, slug, description } = parsed.data;

  // Check unique slug
  const existing = await db.select().from(schema.productCategories).where(eq(schema.productCategories.slug, slug)).limit(1);
  if (existing.length > 0) {
    return { success: false, error: `A category with slug '${slug}' already exists.` };
  }

  const id = `cat-${slug.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  await db.insert(schema.productCategories).values({
    id,
    name,
    slug,
    description,
  });

  await db.insert(schema.auditLogs).values({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    adminEmail: session.email,
    action: 'CATEGORY_CREATED',
    targetEntity: 'product_categories',
    targetId: id,
    details: `Created new product category '${name}' (${slug})`,
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/categories');

  return { success: true };
}

export async function updateCategoryAction(id: string, data: { name: string; slug: string; description: string }) {
  await ensureDbReady();
  const session = await requireAdmin();

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation failed' };
  }

  const { name, slug, description } = parsed.data;

  // Check unique slug not owned by another
  const existing = await db.select().from(schema.productCategories).where(eq(schema.productCategories.slug, slug)).limit(1);
  if (existing.length > 0 && existing[0].id !== id) {
    return { success: false, error: `A category with slug '${slug}' already exists.` };
  }

  await db
    .update(schema.productCategories)
    .set({
      name,
      slug,
      description,
      updatedAt: new Date(),
    })
    .where(eq(schema.productCategories.id, id));

  await db.insert(schema.auditLogs).values({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    adminEmail: session.email,
    action: 'CATEGORY_UPDATED',
    targetEntity: 'product_categories',
    targetId: id,
    details: `Updated product category '${name}'`,
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/categories');

  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  await ensureDbReady();
  const session = await requireAdmin();

  // Safety check: Are there products referencing this category?
  const referencingProducts = await db
    .select({ count: count() })
    .from(schema.products)
    .where(eq(schema.products.categoryId, id));

  const total = referencingProducts[0]?.count || 0;
  if (total > 0) {
    return {
      success: false,
      error: `Cannot delete category: ${total} product(s) are currently assigned to it. Please reassign or remove them first.`,
    };
  }

  await db.delete(schema.productCategories).where(eq(schema.productCategories.id, id));

  await db.insert(schema.auditLogs).values({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    adminEmail: session.email,
    action: 'CATEGORY_DELETED',
    targetEntity: 'product_categories',
    targetId: id,
    details: `Deleted product category with id '${id}'`,
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/categories');

  return { success: true };
}
