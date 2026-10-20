'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { collectionUpdateSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { ensureDbReady } from '@/lib/queries/storefront';

export async function getAdminCollections() {
  await ensureDbReady();
  await requireAdmin();

  const cols = await db.select().from(schema.collections);

  // Attach product counts and active discount info
  const results = await Promise.all(
    cols.map(async (col) => {
      const prodCountResult = await db
        .select({ count: count() })
        .from(schema.products)
        .where(eq(schema.products.collectionId, col.id));

      const activeDiscounts = await db
        .select()
        .from(schema.discounts)
        .where(eq(schema.discounts.collectionId, col.id));

      return {
        ...col,
        productCount: prodCountResult[0]?.count || 0,
        discounts: activeDiscounts,
      };
    })
  );

  return results;
}

export async function setCollectionVisibilityAction(collectionId: string, isVisible: boolean) {
  await ensureDbReady();
  const session = await requireAdmin();

  const target = await db.select().from(schema.collections).where(eq(schema.collections.id, collectionId)).limit(1);
  if (!target[0]) {
    return { success: false, error: 'Collection not found' };
  }

  await db
    .update(schema.collections)
    .set({
      isVisible,
      updatedAt: new Date(),
    })
    .where(eq(schema.collections.id, collectionId));

  await db.insert(schema.auditLogs).values({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    adminEmail: session.email,
    action: isVisible ? 'COLLECTION_ENABLED' : 'COLLECTION_DISABLED',
    targetEntity: 'collections',
    targetId: collectionId,
    details: `Collection '${target[0].name}' (${target[0].slug}) visibility set to ${isVisible ? 'ON' : 'OFF'}`,
  });

  revalidatePath('/', 'layout');
  revalidatePath(`/collections/${target[0].slug}`);
  revalidatePath('/admin/collections');

  return { success: true, isVisible };
}

export async function updateCollectionAction(data: {
  id: string;
  name: string;
  description: string;
  heroImageUrl: string;
  bannerImageUrl: string;
  isVisible: boolean;
}) {
  await ensureDbReady();
  const session = await requireAdmin();

  const parsed = collectionUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation failed' };
  }

  const { id, name, description, heroImageUrl, bannerImageUrl, isVisible } = parsed.data;

  const target = await db.select().from(schema.collections).where(eq(schema.collections.id, id)).limit(1);
  if (!target[0]) {
    return { success: false, error: 'Collection not found' };
  }

  await db
    .update(schema.collections)
    .set({
      name,
      description,
      heroImageUrl,
      bannerImageUrl,
      isVisible,
      updatedAt: new Date(),
    })
    .where(eq(schema.collections.id, id));

  await db.insert(schema.auditLogs).values({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    adminEmail: session.email,
    action: 'COLLECTION_UPDATED',
    targetEntity: 'collections',
    targetId: id,
    details: `Updated collection presentation for '${name}'`,
  });

  revalidatePath('/', 'layout');
  revalidatePath(`/collections/${target[0].slug}`);
  revalidatePath('/admin/collections');

  return { success: true };
}
