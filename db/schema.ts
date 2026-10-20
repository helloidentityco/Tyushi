import { pgTable, text, timestamp, boolean, integer, numeric, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (Admin & Customers)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('CUSTOMER'), // 'ADMIN' | 'CUSTOMER'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Primary Collections (Kawish - Premium, Mooi - General)
export const collections = pgTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  heroImageUrl: text('hero_image_url').notNull(),
  bannerImageUrl: text('banner_image_url').notNull(),
  isVisible: boolean('is_visible').notNull().default(true),
  isPremium: boolean('is_premium').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_collection_slug').on(table.slug),
  index('idx_collection_visibility').on(table.isVisible),
]);

// Shared Product Categories (Tote Bags, Laptop Bags, Handbags, Purses)
export const productCategories = pgTable('product_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_category_slug').on(table.slug),
]);

// Products
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'restrict' }),
  categoryId: text('category_id').notNull().references(() => productCategories.id, { onDelete: 'restrict' }),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(), // Actual customer-facing regular selling price in PKR
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }), // Optional reference original price for sales
  mainImageUrl: text('main_image_url').notNull(),
  secondaryImageUrl: text('secondary_image_url'),
  isAvailable: boolean('is_available').notNull().default(true),
  isFeatured: boolean('is_featured').notNull().default(false),
  sku: text('sku').unique(),
  stockQuantity: integer('stock_quantity').notNull().default(10),
  leatherDetails: text('leather_details').notNull(), // e.g. "Full-Grain Waxed Leather, Brass Hardware"
  dimensions: text('dimensions').notNull(),
  length: numeric('length', { precision: 6, scale: 2 }),
  width: numeric('width', { precision: 6, scale: 2 }),
  height: numeric('height', { precision: 6, scale: 2 }),
  dimensionsUnit: text('dimensions_unit').default('inches'),
  color: text('color').notNull(),
  careInstructions: text('care_instructions').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_product_slug').on(table.slug),
  index('idx_product_collection').on(table.collectionId),
  index('idx_product_category').on(table.categoryId),
  index('idx_product_availability').on(table.isAvailable),
]);

// Product Images (Cloudinary storage metadata)
export const productImages = pgTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  publicId: text('public_id'),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_product_image_product').on(table.productId),
]);

// Discounts (Collection or Category scoped, Percentage or Fixed Amount)
export const discounts = pgTable('discounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  scope: text('scope').notNull(), // 'COLLECTION' | 'CATEGORY'
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').references(() => productCategories.id, { onDelete: 'cascade' }),
  discountType: text('discount_type').notNull().default('PERCENTAGE'), // 'PERCENTAGE' | 'FIXED'
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull().default('0.00'),
  discountPercent: integer('discount_percent').notNull().default(0), // kept for backwards compatibility
  isActive: boolean('is_active').notNull().default(true),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_discount_collection').on(table.collectionId),
  index('idx_discount_category').on(table.categoryId),
  index('idx_discount_active').on(table.isActive),
]);

// Orders
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  customerName: text('customer_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  city: text('city').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  notes: text('notes'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  discountTotal: numeric('discount_total', { precision: 10, scale: 2 }).notNull().default('0.00'),
  shippingFee: numeric('shipping_fee', { precision: 10, scale: 2 }).notNull().default('0.00'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull().default('CASH_ON_DELIVERY'),
  status: text('status').notNull().default('PENDING'), // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_order_number').on(table.orderNumber),
  index('idx_order_status').on(table.status),
  index('idx_order_user').on(table.userId),
]);

// Order Item Snapshots
export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  productNameSnapshot: text('product_name_snapshot').notNull(),
  productSlugSnapshot: text('product_slug_snapshot').notNull(),
  collectionNameSnapshot: text('collection_name_snapshot').notNull(),
  categoryNameSnapshot: text('category_name_snapshot').notNull(),
  quantity: integer('quantity').notNull(),
  unitPriceAtPurchase: numeric('unit_price_at_purchase', { precision: 10, scale: 2 }).notNull(),
  discountAmountAtPurchase: numeric('discount_amount_at_purchase', { precision: 10, scale: 2 }).notNull().default('0.00'),
  lineTotal: numeric('line_total', { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  index('idx_order_items_order').on(table.orderId),
]);

// Audit Logs for administrative actions
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  adminEmail: text('admin_email').notNull(),
  action: text('action').notNull(),
  targetEntity: text('target_entity').notNull(),
  targetId: text('target_id'),
  details: text('details'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relationships
export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(products),
  discounts: many(discounts),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
  discounts: many(discounts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const discountsRelations = relations(discounts, ({ one }) => ({
  collection: one(collections, {
    fields: [discounts.collectionId],
    references: [collections.id],
  }),
  category: one(productCategories, {
    fields: [discounts.categoryId],
    references: [productCategories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Inferred TypeScript Types
export type User = typeof users.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Discount = typeof discounts.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
