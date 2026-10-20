import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePGlite } from 'drizzle-orm/pglite';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

type AppDatabase = ReturnType<typeof drizzlePGlite<typeof schema>>;

// Global reference for singleton in Next.js development
declare global {
  var __dbInstance: AppDatabase | undefined;
  var __pgliteInstance: PGlite | undefined;
}

function getDatabase(): AppDatabase {
  if (global.__dbInstance) {
    return global.__dbInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
    const sql = neon(databaseUrl);
    const db = drizzleNeon(sql, { schema }) as unknown as AppDatabase;
    global.__dbInstance = db;
    return db;
  }

  // Local / preview fallback: Persistent PGlite PostgreSQL engine
  const dataDir = path.join(process.cwd(), '.data', 'pglite');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!global.__pgliteInstance) {
    global.__pgliteInstance = new PGlite(dataDir);
  }

  const db = drizzlePGlite(global.__pgliteInstance, { schema });
  global.__dbInstance = db;
  return db;
}

export const db = getDatabase();

/**
 * Initialize database tables if not already present.
 * Real PostgreSQL DDL matching schema.ts exactly.
 */
export async function initializeDatabaseTables() {
  const database = getDatabase();

  const ddlStatements = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CUSTOMER',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      hero_image_url TEXT NOT NULL,
      banner_image_url TEXT NOT NULL,
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      is_premium BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS product_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE RESTRICT,
      category_id TEXT NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
      description TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      main_image_url TEXT NOT NULL,
      secondary_image_url TEXT,
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      sku TEXT UNIQUE,
      stock_quantity INTEGER NOT NULL DEFAULT 10,
      leather_details TEXT NOT NULL,
      dimensions TEXT NOT NULL,
      color TEXT NOT NULL,
      care_instructions TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      public_id TEXT,
      alt_text TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS discounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      scope TEXT NOT NULL,
      collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES product_categories(id) ON DELETE CASCADE,
      discount_percent INTEGER NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      starts_at TIMESTAMP WITH TIME ZONE,
      ends_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      notes TEXT,
      subtotal NUMERIC(10, 2) NOT NULL,
      discount_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      total_amount NUMERIC(10, 2) NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'CASH_ON_DELIVERY',
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
      product_name_snapshot TEXT NOT NULL,
      product_slug_snapshot TEXT NOT NULL,
      collection_name_snapshot TEXT NOT NULL,
      category_name_snapshot TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price_at_purchase NUMERIC(10, 2) NOT NULL,
      discount_amount_at_purchase NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      line_total NUMERIC(10, 2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_collection_slug ON collections(slug);
    CREATE INDEX IF NOT EXISTS idx_collection_visibility ON collections(is_visible);
    CREATE INDEX IF NOT EXISTS idx_category_slug ON product_categories(slug);
    CREATE INDEX IF NOT EXISTS idx_product_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_product_collection ON products(collection_id);
    CREATE INDEX IF NOT EXISTS idx_product_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_product_availability ON products(is_available);
    CREATE INDEX IF NOT EXISTS idx_order_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_order_status ON orders(status);
  `;

  if (global.__pgliteInstance) {
    await global.__pgliteInstance.exec(ddlStatements);
  } else {
    // If using Neon, execute statements
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      const sql = neon(databaseUrl);
      const statements = ddlStatements.split(';').map(s => s.trim()).filter(Boolean);
      for (const statement of statements) {
        await sql.query(statement);
      }
    }
  }

  return database;
}
