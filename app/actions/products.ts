'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, desc, ilike, asc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { productSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { ensureDbReady, getActiveDiscounts } from '@/lib/queries/storefront';
import { calculateEffectivePrice } from '@/lib/pricing';

export async function getAdminProducts(filters: { search?: string; collectionId?: string; categoryId?: string } = {}) {
  await ensureDbReady();
  await requireAdmin();

  const activeDiscounts = await getActiveDiscounts();

  const conditions = [];
  if (filters.collectionId && filters.collectionId !== 'all') {
    conditions.push(eq(schema.products.collectionId, filters.collectionId));
  }
  if (filters.categoryId && filters.categoryId !== 'all') {
    conditions.push(eq(schema.products.categoryId, filters.categoryId));
  }
  if (filters.search) {
    conditions.push(ilike(schema.products.name, `%${filters.search}%`));
  }

  const prods = await db
    .select({
      product: schema.products,
      collection: schema.collections,
      category: schema.productCategories,
    })
    .from(schema.products)
    .innerJoin(schema.collections, eq(schema.products.collectionId, schema.collections.id))
    .innerJoin(schema.productCategories, eq(schema.products.categoryId, schema.productCategories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.products.createdAt));

  const allImages = await db
    .select()
    .from(schema.productImages)
    .orderBy(asc(schema.productImages.sortOrder));

  return prods.map(({ product, collection, category }) => {
    const pricing = calculateEffectivePrice(
      product.price,
      product.collectionId,
      product.categoryId,
      activeDiscounts,
      new Date(),
      product.originalPrice
    );

    const images = allImages.filter((img) => img.productId === product.id);

    return {
      ...product,
      collection,
      category,
      images,
      pricing,
    };
  });
}

export async function createProductAction(rawData: any) {
  try {
    await ensureDbReady();
    const session = await requireAdmin();

    const parsed = productSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Validation failed' };
    }

    const data = parsed.data;

    // Verify unique slug
    const existing = await db.select().from(schema.products).where(eq(schema.products.slug, data.slug)).limit(1);
    if (existing.length > 0) {
      return { success: false, error: `A product with slug '${data.slug}' already exists.` };
    }

    const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(schema.products).values({
      id,
      name: data.name,
      slug: data.slug,
      collectionId: data.collectionId,
      categoryId: data.categoryId,
      description: data.description,
      price: data.price.toFixed(2),
      originalPrice: data.originalPrice ? data.originalPrice.toFixed(2) : null,
      mainImageUrl: data.mainImageUrl,
      secondaryImageUrl: data.secondaryImageUrl || null,
      isAvailable: data.isAvailable,
      isFeatured: data.isFeatured,
      sku: data.sku || null,
      stockQuantity: data.stockQuantity,
      leatherDetails: data.leatherDetails,
      dimensions: data.dimensions,
      length: data.length ? data.length.toFixed(2) : null,
      width: data.width ? data.width.toFixed(2) : null,
      height: data.height ? data.height.toFixed(2) : null,
      dimensionsUnit: data.dimensionsUnit || 'inches',
      color: data.color,
      careInstructions: data.careInstructions,
    });

    // Insert additional Cloudinary images if provided
    if (data.imageUrls && data.imageUrls.length > 0) {
      const imgInserts = data.imageUrls.map((url, index) => ({
        id: `pimg-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}`,
        productId: id,
        imageUrl: url,
        sortOrder: index,
      }));
      await db.insert(schema.productImages).values(imgInserts);
    }

    await db.insert(schema.auditLogs).values({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminEmail: session.email,
      action: 'PRODUCT_CREATED',
      targetEntity: 'products',
      targetId: id,
      details: `Created product '${data.name}' (${data.slug})`,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/products');
    } catch {}

    return { success: true, productId: id };
  } catch (err: any) {
    console.error('createProductAction error:', err);
    return { success: false, error: err.message || 'Failed to create product' };
  }
}

export async function updateProductAction(id: string, rawData: any) {
  try {
    await ensureDbReady();
    const session = await requireAdmin();

    const parsed = productSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Validation failed' };
    }

    const data = parsed.data;

    // Check slug uniqueness
    const existing = await db.select().from(schema.products).where(eq(schema.products.slug, data.slug)).limit(1);
    if (existing.length > 0 && existing[0].id !== id) {
      return { success: false, error: `A product with slug '${data.slug}' already exists.` };
    }

    const current = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    if (!current[0]) {
      return { success: false, error: 'Product not found' };
    }

    await db
      .update(schema.products)
      .set({
        name: data.name,
        slug: data.slug,
        collectionId: data.collectionId,
        categoryId: data.categoryId,
        description: data.description,
        price: data.price.toFixed(2),
        originalPrice: data.originalPrice ? data.originalPrice.toFixed(2) : null,
        mainImageUrl: data.mainImageUrl,
        secondaryImageUrl: data.secondaryImageUrl || null,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        sku: data.sku || null,
        stockQuantity: data.stockQuantity,
        leatherDetails: data.leatherDetails,
        dimensions: data.dimensions,
        length: data.length ? data.length.toFixed(2) : null,
        width: data.width ? data.width.toFixed(2) : null,
        height: data.height ? data.height.toFixed(2) : null,
        dimensionsUnit: data.dimensionsUnit || 'inches',
        color: data.color,
        careInstructions: data.careInstructions,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, id));

    // Update gallery images if provided
    if (data.imageUrls !== undefined) {
      await db.delete(schema.productImages).where(eq(schema.productImages.productId, id));
      if (data.imageUrls.length > 0) {
        const imgInserts = data.imageUrls.map((url, index) => ({
          id: `pimg-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}`,
          productId: id,
          imageUrl: url,
          sortOrder: index,
        }));
        await db.insert(schema.productImages).values(imgInserts);
      }
    }

    await db.insert(schema.auditLogs).values({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminEmail: session.email,
      action: 'PRODUCT_UPDATED',
      targetEntity: 'products',
      targetId: id,
      details: `Updated product '${data.name}'`,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath(`/products/${data.slug}`);
      revalidatePath('/admin/products');
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error('updateProductAction error:', err);
    return { success: false, error: err.message || 'Failed to update product' };
  }
}

export async function setProductFeaturedAction(id: string, isFeatured: boolean) {
  try {
    await ensureDbReady();
    const session = await requireAdmin();

    const current = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    if (!current[0]) {
      return { success: false, error: 'Product not found' };
    }

    await db
      .update(schema.products)
      .set({
        isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, id));

    await db.insert(schema.auditLogs).values({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminEmail: session.email,
      action: isFeatured ? 'PRODUCT_FEATURED' : 'PRODUCT_UNFEATURED',
      targetEntity: 'products',
      targetId: id,
      details: `${isFeatured ? 'Featured' : 'Unfeatured'} product '${current[0].name}' on homepage`,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/products');
    } catch {}

    return { success: true, isFeatured };
  } catch (err: any) {
    console.error('setProductFeaturedAction error:', err);
    return { success: false, error: err.message || 'Failed to update featured status' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await ensureDbReady();
    const session = await requireAdmin();

    const target = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    if (!target[0]) {
      return { success: false, error: 'Product not found' };
    }

    await db.delete(schema.products).where(eq(schema.products.id, id));

    await db.insert(schema.auditLogs).values({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminEmail: session.email,
      action: 'PRODUCT_DELETED',
      targetEntity: 'products',
      targetId: id,
      details: `Deleted product '${target[0].name}' (${target[0].slug})`,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/products');
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error('deleteProductAction error:', err);
    return { success: false, error: err.message || 'Failed to delete product' };
  }
}
