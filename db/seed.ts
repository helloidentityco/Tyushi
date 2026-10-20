import { db, initializeDatabaseTables } from './index';
import * as schema from './schema';
import { hashPassword } from '../lib/auth';
import { eq } from 'drizzle-orm';

export async function runDatabaseSeed() {
  await initializeDatabaseTables();

  // 1. Seed Collections (Kawish & Mooi)
  const kawishId = 'col-kawish-premium';
  await db
    .insert(schema.collections)
    .values({
      id: kawishId,
      name: 'Kawish',
      slug: 'kawish',
      description: 'The pinnacle of artisan leathercraft. Hand-selected grade-A full-grain hides, 24k gold-plated brass accents, and master saddle-stitched construction designed to endure generations.',
      heroImageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1600&auto=format&fit=crop',
      bannerImageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1600&auto=format&fit=crop',
      isVisible: true,
      isPremium: true,
    })
    .onConflictDoNothing();

  const mooiId = 'col-mooi-general';
  await db
    .insert(schema.collections)
    .values({
      id: mooiId,
      name: 'Mooi',
      slug: 'mooi',
      description: 'Understated elegance crafted for everyday luxury. Premium genuine cowhide, minimalist silhouettes, and refined organic vegetable tanning for discerning urban lifestyles.',
      heroImageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1600&auto=format&fit=crop',
      bannerImageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1600&auto=format&fit=crop',
      isVisible: true,
      isPremium: false,
    })
    .onConflictDoNothing();

  // 2. Seed Shared Product Categories
  const categoriesData = [
    {
      id: 'cat-tote-bags',
      name: 'Tote Bags',
      slug: 'tote-bags',
      description: 'Spacious, structured carryalls hand-cut from sturdy full-grain and vegetable-tanned leathers.',
    },
    {
      id: 'cat-laptop-bags',
      name: 'Laptop Bags',
      slug: 'laptop-bags',
      description: 'Ergonomic tech-ready briefcases and messengers lined with micro-suede and impact-absorbent padding.',
    },
    {
      id: 'cat-handbags',
      name: 'Handbags',
      slug: 'handbags',
      description: 'Sculptural satchels and shoulder bags tailored with hand-painted burnished leather edges.',
    },
    {
      id: 'cat-purses',
      name: 'Purses',
      slug: 'purses',
      description: 'Refined leather continental wallets, zip coin pouches, and compact accordion cardholders.',
    },
  ];

  for (const cat of categoriesData) {
    await db.insert(schema.productCategories).values(cat).onConflictDoNothing();
  }

  // 3. Seed Default Administrator
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kawishmooi.com';
  const plainPassword = process.env.ADMIN_PASSWORD || 'AdminPassword2026!';
  const passwordHash = await hashPassword(plainPassword);
  await db
    .insert(schema.users)
    .values({
      id: 'usr-admin-master',
      name: 'Master Atelier Admin',
      email: adminEmail.toLowerCase().trim(),
      passwordHash,
      role: 'ADMIN',
    })
    .onConflictDoNothing();

  // 4. Seed Representative Products
  const productsToSeed = [
    // --- KAWISH (Premium) ---
    {
      id: 'prod-kawish-tote-1',
      name: 'The Sultan Waxed Leather Tote',
      slug: 'the-sultan-waxed-leather-tote',
      collectionId: kawishId,
      categoryId: 'cat-tote-bags',
      description: 'A masterpiece of bespoke heritage. Crafted from heavyweight pull-up wax cowhide that develops a rich, self-healing patina with time. Features solid brass hardware, hand-stitched rolled handles, and an internal brass key lanyard.',
      price: '34500.00',
      mainImageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop',
      isAvailable: true,
      isFeatured: true,
      sku: 'KW-TOT-001',
      stockQuantity: 12,
      leatherDetails: 'Top-tier Full-Grain Pull-Up Waxed Leather (2.2mm thickness), 24k brushed brass hardware.',
      dimensions: '16.5" W x 13" H x 6" D (10" handle drop)',
      color: 'Dark Cognac Walnut',
      careInstructions: 'Buff gently with dry horsehair brush. Apply organic beeswax balm every 6 months.',
    },
    {
      id: 'prod-kawish-laptop-1',
      name: 'The Executive Sovereign Briefcase',
      slug: 'the-executive-sovereign-briefcase',
      collectionId: kawishId,
      categoryId: 'cat-laptop-bags',
      description: 'Engineered for commanders of business and state. Dual-gusset structure accommodating up to 16-inch laptops, documents, and tech accessories. Includes a detachable padded bridle-leather shoulder strap.',
      price: '48000.00',
      mainImageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
      isAvailable: true,
      isFeatured: true,
      sku: 'KW-LAP-002',
      stockQuantity: 8,
      leatherDetails: 'English Bridle Hide with vegetable tanned harness accents and Japanese YKK Excella zippers.',
      dimensions: '16" W x 11.5" H x 4.5" D',
      color: 'Rich Espresso Noir',
      careInstructions: 'Keep away from standing water. Condition twice a year with premium neatsfoot leather cream.',
    },
    {
      id: 'prod-kawish-handbag-1',
      name: 'The Empress Structured Satchel',
      slug: 'the-empress-structured-satchel',
      collectionId: kawishId,
      categoryId: 'cat-handbags',
      description: 'An architectural silhouette defined by graceful curves and hand-burnished edges. The signature front clasp is precision-milled from solid brass, securing a velvet-lined interior chamber.',
      price: '42500.00',
      mainImageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1200&auto=format&fit=crop',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1200&auto=format&fit=crop',
      isAvailable: true,
      isFeatured: true,
      sku: 'KW-HND-003',
      stockQuantity: 6,
      leatherDetails: 'Calfskin semi-aniline leather with hand-painted multi-layer edge coat.',
      dimensions: '12" W x 9" H x 4.2" D',
      color: 'Antique Bordeaux & Gold',
      careInstructions: 'Store in provided breathable cotton dust bag with tissue stuffing to preserve shape.',
    },
    {
      id: 'prod-kawish-purse-1',
      name: 'The Heirloom Accordion Continental Purse',
      slug: 'the-heirloom-accordion-continental-purse',
      collectionId: kawishId,
      categoryId: 'cat-purses',
      description: 'Tenacious luxury in palm scale. 12 dedicated card slots, zippered central divider, and twin currency sleeves framed in polished brass edge guards.',
      price: '18500.00',
      mainImageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1606503803138-021b0e515d11?q=80&w=1200&auto=format&fit=crop',
      isAvailable: true,
      isFeatured: false,
      sku: 'KW-PUR-004',
      stockQuantity: 15,
      leatherDetails: 'French Chèvre Goatskin exterior with butter-soft lambskin inner lining.',
      dimensions: '7.8" W x 4.2" H x 1.2" D',
      color: 'Cognac Gold',
      careInstructions: 'Wipe with microfiber cloth. Avoid exposure to alcohol-based perfumes and sanitizers.',
    },

    // --- MOOI (General) ---
    {
      id: 'prod-mooi-tote-1',
      name: 'The Atelier Minimalist Shopper Tote',
      slug: 'the-atelier-minimalist-shopper-tote',
      collectionId: mooiId,
      categoryId: 'cat-tote-bags',
      description: 'Unfussy, pure, and immensely functional. Cut from oil-tanned cowhide with reinforced boxed corners and an interior slip pocket tailored for a phone and keys.',
      price: '19500.00',
      mainImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop',
      isAvailable: true,
      isFeatured: true,
      sku: 'MO-TOT-101',
      stockQuantity: 20,
      leatherDetails: '100% Genuine Oiled Cowhide leather, brushed gunmetal rivets.',
      dimensions: '15" W x 14" H x 5" D',
      color: 'Caramel Amber',
      careInstructions: 'Naturally weather resistant. Clean with damp cloth and air dry away from heat sources.',
    },
    {
      id: 'prod-mooi-laptop-1',
      name: 'The Commuter 14" Leather Messenger',
      slug: 'the-commuter-14-leather-messenger',
      collectionId: mooiId,
      categoryId: 'cat-laptop-bags',
      description: 'Streamlined profile made for urban travel. Houses up to 14.5" laptops, tablet pocket, magnetic storm-flap closure, and an adjustable canvas-backed leather strap.',
      price: '26000.00',
      mainImageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
      isAvailable: true,
      isFeatured: true,
      sku: 'MO-LAP-102',
      stockQuantity: 14,
      leatherDetails: 'Supple vegetable-tanned nappa leather with water-resistant cotton twill lining.',
      dimensions: '14.5" W x 10.5" H x 3.5" D',
      color: 'Matte Charcoal Brown',
      careInstructions: 'Treat annually with neutral leather balm. Allow wet spots to dry naturally.',
    },
    {
      id: 'prod-mooi-handbag-1',
      name: 'The Arc Box Crossbody Bag',
      slug: 'the-arc-box-crossbody-bag',
      collectionId: mooiId,
      categoryId: 'cat-handbags',
      description: 'A compact geometric bag that balances structured poise with hands-free convenience. Features a concealed magnetic snap and twin compartmentalized pockets.',
      price: '22000.00',
      mainImageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1200&auto=format&fit=crop',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1200&auto=format&fit=crop',
      isAvailable: true,
      isFeatured: true,
      sku: 'MO-HND-103',
      stockQuantity: 18,
      leatherDetails: 'Smooth semi-gloss cowhide with antique brass hardware.',
      dimensions: '9" W x 6.5" H x 3" D',
      color: 'Warm Saddle Tan',
      careInstructions: 'Store in a cool dry place. Use mild leather lotion to restore sheen.',
    },
    {
      id: 'prod-mooi-purse-1',
      name: 'The Compact Zip Cardholder Purse',
      slug: 'the-compact-zip-cardholder-purse',
      collectionId: mooiId,
      categoryId: 'cat-purses',
      description: 'Ultra-slim palm companion with six exterior card slots and a smooth zippered central pouch for folded notes and coin currency.',
      price: '11500.00',
      mainImageUrl: 'https://images.unsplash.com/photo-1606503803138-021b0e515d11?q=80&w=1200&auto=format&fit=crop',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop',
      isAvailable: true,
      isFeatured: false,
      sku: 'MO-PUR-104',
      stockQuantity: 25,
      leatherDetails: 'Tumbled pebble-grain genuine leather with contrast nylon stitching.',
      dimensions: '5.2" W x 3.5" H x 0.5" D',
      color: 'Espresso Walnut',
      careInstructions: 'Avoid overstuffing to maintain leather pocket elasticity.',
    },
  ];

  for (const prod of productsToSeed) {
    await db.insert(schema.products).values(prod).onConflictDoNothing();
  }

  // 5. Seed Demonstration Discounts (Precedence demonstration)
  // Promotion 1: 15% off entire Kawish collection
  await db
    .insert(schema.discounts)
    .values({
      id: 'disc-kawish-collection-15',
      name: 'Kawish Heritage Season - 15% Off',
      scope: 'COLLECTION',
      collectionId: kawishId,
      categoryId: null,
      discountPercent: 15,
      isActive: true,
      startsAt: new Date(Date.now() - 7 * 86400000),
      endsAt: new Date(Date.now() + 60 * 86400000),
    })
    .onConflictDoNothing();

  // Promotion 2: 20% off Mooi Handbags specifically (demonstrates category-scoped discount overriding)
  await db
    .insert(schema.discounts)
    .values({
      id: 'disc-mooi-handbags-20',
      name: 'Mooi Handbag Spotlight - 20% Off',
      scope: 'CATEGORY',
      collectionId: mooiId,
      categoryId: 'cat-handbags',
      discountPercent: 20,
      isActive: true,
      startsAt: new Date(Date.now() - 3 * 86400000),
      endsAt: new Date(Date.now() + 30 * 86400000),
    })
    .onConflictDoNothing();

  return { success: true };
}
