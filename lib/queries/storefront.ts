import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, like, desc, asc, ilike } from 'drizzle-orm';
import { runDatabaseSeed } from '@/db/seed';
import { calculateEffectivePrice, DiscountRecord, PricingResult } from '@/lib/pricing';

let initPromise: Promise<void> | null = null;

export async function ensureDbReady() {
  if (initPromise) {
    return initPromise;
  }
  initPromise = (async () => {
    try {
      await runDatabaseSeed();
    } catch (e) {
      console.error('Error initializing/seeding database:', e);
      initPromise = null;
    }
  })();
  return initPromise;
}

export interface StorefrontProduct extends schema.Product {
  collection: schema.Collection;
  category: schema.ProductCategory;
  pricing: PricingResult;
}

// 1. Navbar and Public Collections list (ONLY VISIBLE COLLECTIONS)
export async function getPublicCollections() {
  await ensureDbReady();
  const allCols = await db
    .select()
    .from(schema.collections)
    .where(eq(schema.collections.isVisible, true))
    .orderBy(desc(schema.collections.isPremium), asc(schema.collections.name));
  return allCols;
}

// 2. Fetch single collection by slug (ONLY IF VISIBLE)
export async function getPublicCollectionBySlug(slug: string) {
  await ensureDbReady();
  const results = await db
    .select()
    .from(schema.collections)
    .where(and(eq(schema.collections.slug, slug), eq(schema.collections.isVisible, true)))
    .limit(1);

  return results[0] || null;
}

// 3. Shared Categories
export async function getPublicCategories() {
  await ensureDbReady();
  return db.select().from(schema.productCategories).orderBy(asc(schema.productCategories.name));
}

// 4. Active Discounts for pricing calculations
export async function getActiveDiscounts(): Promise<DiscountRecord[]> {
  await ensureDbReady();
  const rawDiscounts = await db
    .select()
    .from(schema.discounts)
    .where(eq(schema.discounts.isActive, true));

  return rawDiscounts.map((d) => ({
    id: d.id,
    name: d.name,
    scope: d.scope as 'COLLECTION' | 'CATEGORY',
    collectionId: d.collectionId,
    categoryId: d.categoryId,
    discountPercent: d.discountPercent,
    isActive: d.isActive,
    startsAt: d.startsAt,
    endsAt: d.endsAt,
  }));
}

// 5. Query Products with Collection Visibility, Filters, and Pricing
export interface ProductQueryOptions {
  collectionSlug?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
  limit?: number;
  onlyFeatured?: boolean;
}

export async function getPublicProducts(options: ProductQueryOptions = {}) {
  await ensureDbReady();
  const activeDiscounts = await getActiveDiscounts();

  // Fetch all visible collections first to enforce visibility boundary
  const visibleCollections = await getPublicCollections();
  const visibleCollectionIds = visibleCollections.map((c) => c.id);

  if (visibleCollectionIds.length === 0) {
    return [];
  }

  // If a specific collection is requested, check if it's visible
  let targetCollectionId: string | undefined;
  if (options.collectionSlug) {
    const target = visibleCollections.find((c: any) => c.slug === options.collectionSlug);
    if (!target) {
      // Requested collection is disabled or nonexistent
      return [];
    }
    targetCollectionId = target.id;
  }

  // Category resolution
  let targetCategoryId: string | undefined;
  if (options.categorySlug && options.categorySlug !== 'all') {
    const cat = await db
      .select()
      .from(schema.productCategories)
      .where(eq(schema.productCategories.slug, options.categorySlug))
      .limit(1);
    if (cat[0]) {
      targetCategoryId = cat[0].id;
    }
  }

  // Base raw query
  const query = db
    .select({
      product: schema.products,
      collection: schema.collections,
      category: schema.productCategories,
    })
    .from(schema.products)
    .innerJoin(schema.collections, eq(schema.products.collectionId, schema.collections.id))
    .innerJoin(schema.productCategories, eq(schema.products.categoryId, schema.productCategories.id))
    .where(
      and(
        // Collection MUST be visible
        eq(schema.collections.isVisible, true),
        // Product MUST be available
        eq(schema.products.isAvailable, true),
        targetCollectionId ? eq(schema.products.collectionId, targetCollectionId) : undefined,
        targetCategoryId ? eq(schema.products.categoryId, targetCategoryId) : undefined,
        options.onlyFeatured ? eq(schema.products.isFeatured, true) : undefined,
        options.search ? ilike(schema.products.name, `%${options.search}%`) : undefined
      )
    );

  const results = await query;

  // Compute pricing for each product with category-over-collection precedence
  let mapped = results.map(({ product, collection, category }) => {
    const pricing = calculateEffectivePrice(
      product.price,
      product.collectionId,
      product.categoryId,
      activeDiscounts,
      new Date(),
      product.originalPrice
    );
    return {
      ...product,
      collection,
      category,
      pricing,
    };
  });

  // Filter by effective price in PKR
  if (options.minPrice !== undefined && !isNaN(options.minPrice)) {
    mapped = mapped.filter((p) => p.pricing.effectivePrice >= options.minPrice!);
  }
  if (options.maxPrice !== undefined && !isNaN(options.maxPrice)) {
    mapped = mapped.filter((p) => p.pricing.effectivePrice <= options.maxPrice!);
  }

  // Sorting
  const sort = options.sortBy || 'featured';
  if (sort === 'price-asc') {
    mapped.sort((a, b) => a.pricing.effectivePrice - b.pricing.effectivePrice);
  } else if (sort === 'price-desc') {
    mapped.sort((a, b) => b.pricing.effectivePrice - a.pricing.effectivePrice);
  } else if (sort === 'name-asc') {
    mapped.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'newest') {
    mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Featured default
    mapped.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  if (options.limit && options.limit > 0) {
    mapped = mapped.slice(0, options.limit);
  }

  return mapped;
}

// 6. Single Product by Slug (Enforcing Collection Visibility)
export async function getPublicProductBySlug(slug: string) {
  await ensureDbReady();
  const activeDiscounts = await getActiveDiscounts();

  const results = await db
    .select({
      product: schema.products,
      collection: schema.collections,
      category: schema.productCategories,
    })
    .from(schema.products)
    .innerJoin(schema.collections, eq(schema.products.collectionId, schema.collections.id))
    .innerJoin(schema.productCategories, eq(schema.products.categoryId, schema.productCategories.id))
    .where(
      and(
        eq(schema.products.slug, slug),
        // Enforce that parent collection must be visible
        eq(schema.collections.isVisible, true),
        // Product must be available for public viewing
        eq(schema.products.isAvailable, true)
      )
    )
    .limit(1);

  if (!results[0]) return null;

  const { product, collection, category } = results[0];

  // Fetch additional images if any
  const images = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, product.id))
    .orderBy(asc(schema.productImages.sortOrder));

  const pricing = calculateEffectivePrice(
    product.price,
    product.collectionId,
    product.categoryId,
    activeDiscounts,
    new Date(),
    product.originalPrice
  );

  return {
    ...product,
    collection,
    category,
    images,
    pricing,
  };
}
