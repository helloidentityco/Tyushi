'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { discountSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { ensureDbReady } from '@/lib/queries/storefront';

export async function getAdminDiscounts() {
  await ensureDbReady();
  await requireAdmin();

  const rawDiscounts = await db
    .select({
      discount: schema.discounts,
      collection: schema.collections,
      category: schema.productCategories,
    })
    .from(schema.discounts)
    .innerJoin(schema.collections, eq(schema.discounts.collectionId, schema.collections.id))
    .leftJoin(schema.productCategories, eq(schema.discounts.categoryId, schema.productCategories.id))
    .orderBy(desc(schema.discounts.createdAt));

  return rawDiscounts.map(({ discount, collection, category }) => ({
    ...discount,
    collection,
    category,
  }));
}

export async function createDiscountAction(rawData: any) {
  try {
    await ensureDbReady();
    const session = await requireAdmin();

    const parsed = discountSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Validation failed' };
    }

    const data = parsed.data;
    const id = `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const discountType = data.discountType || 'PERCENTAGE';
    const discountValue = data.discountValue.toFixed(2);
    const discountPercent = discountType === 'PERCENTAGE' ? Math.round(data.discountValue) : 0;

    await db.insert(schema.discounts).values({
      id,
      name: data.name,
      scope: data.scope,
      collectionId: data.collectionId,
      categoryId: data.scope === 'CATEGORY' ? data.categoryId : null,
      discountType,
      discountValue,
      discountPercent,
      isActive: data.isActive,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    });

    await db.insert(schema.auditLogs).values({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminEmail: session.email,
      action: 'DISCOUNT_CREATED',
      targetEntity: 'discounts',
      targetId: id,
      details: `Created ${discountType === 'PERCENTAGE' ? `${discountPercent}%` : `PKR ${discountValue}`} discount '${data.name}' (${data.scope})`,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/discounts');
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error('createDiscountAction error:', err);
    return { success: false, error: err.message || 'Failed to create promotion' };
  }
}

export async function updateDiscountAction(id: string, rawData: any) {
  try {
    await ensureDbReady();
    const session = await requireAdmin();

    const parsed = discountSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Validation failed' };
    }

    const data = parsed.data;
    const discountType = data.discountType || 'PERCENTAGE';
    const discountValue = data.discountValue.toFixed(2);
    const discountPercent = discountType === 'PERCENTAGE' ? Math.round(data.discountValue) : 0;

    await db
      .update(schema.discounts)
      .set({
        name: data.name,
        scope: data.scope,
        collectionId: data.collectionId,
        categoryId: data.scope === 'CATEGORY' ? data.categoryId : null,
        discountType,
        discountValue,
        discountPercent,
        isActive: data.isActive,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.discounts.id, id));

    await db.insert(schema.auditLogs).values({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminEmail: session.email,
      action: 'DISCOUNT_UPDATED',
      targetEntity: 'discounts',
      targetId: id,
      details: `Updated discount '${data.name}' to ${discountType === 'PERCENTAGE' ? `${discountPercent}%` : `PKR ${discountValue}`}`,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/discounts');
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error('updateDiscountAction error:', err);
    return { success: false, error: err.message || 'Failed to update promotion' };
  }
}

export async function setDiscountStatusAction(id: string, isActive: boolean) {
  try {
    await ensureDbReady();
    const session = await requireAdmin();

    await db
      .update(schema.discounts)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(schema.discounts.id, id));

    await db.insert(schema.auditLogs).values({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminEmail: session.email,
      action: isActive ? 'DISCOUNT_ACTIVATED' : 'DISCOUNT_DEACTIVATED',
      targetEntity: 'discounts',
      targetId: id,
      details: `Toggled discount active status to ${isActive}`,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/discounts');
    } catch {}

    return { success: true, isActive, error: undefined };
  } catch (err: any) {
    return { success: false, isActive, error: err.message || 'Failed to update discount status' };
  }
}

export async function deleteDiscountAction(id: string) {
  try {
    await ensureDbReady();
    const session = await requireAdmin();

    await db.delete(schema.discounts).where(eq(schema.discounts.id, id));

    await db.insert(schema.auditLogs).values({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminEmail: session.email,
      action: 'DISCOUNT_DELETED',
      targetEntity: 'discounts',
      targetId: id,
      details: `Deleted discount with id '${id}'`,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/discounts');
    } catch {}

    return { success: true, error: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete discount' };
  }
}
