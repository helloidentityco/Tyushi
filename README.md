# Kawish & Mooi — Luxury Genuine Leather E-Commerce Platform

A production-grade, full-stack luxury e-commerce web application built for an artisan genuine leather goods house operating two primary ateliers:
- **Kawish (Premium Atelier)**: Museum-grade bespoke full-grain waxed leather with solid brass fittings and a prominent `PREMIUM` hallmark.
- **Mooi (General Atelier)**: Refined, understated everyday leather goods engineered for functional elegance.

---

## 1. Architecture & Technology Stack

- **Framework**: Next.js 15+ (App Router, React 19, TypeScript).
- **Styling**: Tailwind CSS v4 with Dark Wooden Luxury design tokens (`#100C09` walnut background, `#18120E` surfaces, `#251B14` product cards, `#C6A15B` warm gold accents, and `#BDAE9D` secondary leather neutrals).
- **Typography**: Google Fonts `Poppins` paired with `Playfair Display` for editorial headings.
- **Database & ORM**: PostgreSQL via Neon Serverless and Drizzle ORM. Automatically falls back to a persistent local PostgreSQL engine (PGlite) in offline or preview environments.
- **Image Storage**: Cloudinary integration with signed uploads, asset tracking, and Next.js responsive image optimization.
- **Authentication & Security**: Secure server-side sessions with HS256 JWTs stored in HttpOnly, SameSite cookies. Server-level role verification (`ADMIN` vs `CUSTOMER`) on every mutation.
- **Pricing & Discounts Engine**: Centralized server-side discount precedence (`lib/pricing/index.ts`). Category-specific discounts take priority over collection-wide discounts without stacking.
- **Order Engine**: Database-backed atomic order creation with line-item and price snapshots, automatic stock decrements, and Cash on Delivery (COD) fulfillment.

---

## 2. Directory Structure

```text
├── app/
│   ├── actions/                   # Server Actions grouped by domain
│   │   ├── auth.ts                # Admin authentication and session management
│   │   ├── categories.ts          # Category CRUD and reference protection
│   │   ├── collections.ts         # Collection presentation and visibility switch
│   │   ├── discounts.ts           # Promotion configuration and precedence
│   │   ├── orders.ts              # Atomic order creation and status ledger
│   │   └── products.ts            # Product CRUD and stock tracking
│   ├── admin/                     # Protected Administrator Portal
│   │   ├── categories/            # Shared category management
│   │   ├── collections/           # Storefront collection visibility toggles
│   │   ├── discounts/             # Collection and category promotional matrix
│   │   ├── login/                 # Admin login form
│   │   ├── orders/                # Searchable order fulfillment ledger
│   │   │   └── [id]/              # Single order inspection and status editor
│   │   ├── products/              # Inventory and product management
│   │   └── page.tsx               # Admin analytics overview dashboard
│   ├── api/
│   │   └── cloudinary/upload/     # Authenticated Cloudinary image upload route
│   ├── collections/
│   │   └── [slug]/                # Reusable collection listing (/kawish, /mooi)
│   ├── products/
│   │   └── [slug]/                # Dedicated product detail page & gallery
│   ├── about/                     # Atelier story & leather care ritual
│   ├── cart/                      # Dedicated shopping bag page
│   ├── checkout/                  # Server-validated checkout page
│   ├── order-confirmation/[ref]/  # Verified order confirmation receipt
│   ├── layout.tsx                 # Root layout with fonts, metadata, CartProvider
│   ├── page.tsx                   # Cinematic storefront homepage
│   ├── sitemap.ts                 # Dynamic SEO sitemap (excludes hidden collections)
│   └── robots.ts                  # Robots indexing rules
├── components/
│   ├── admin/                     # Admin sidebar, tables, and modal forms
│   └── storefront/                # Navbar, Footer, ProductCard, CartDrawer, Grid
├── db/
│   ├── schema.ts                  # Centralized Drizzle PostgreSQL schema
│   ├── index.ts                   # Universal database connector (Neon + PGlite)
│   └── seed.ts                    # Idempotent database seeder
├── lib/
│   ├── auth/                      # Password hashing and session JWT cookies
│   ├── cart/                      # Persistent client Cart context
│   ├── cloudinary/                # Cloudinary upload and asset deletion
│   ├── pricing/                   # Centralized discount and precedence logic
│   ├── queries/                   # Database queries enforcing collection visibility
│   └── validation/                # Zod schemas for all forms and mutations
└── drizzle.config.ts              # Drizzle migrations configuration
```

---

## 3. Database Schema Overview

1. **`collections`**: ID, name, slug (`kawish`, `mooi`), description, hero/banner images, `is_visible` (controls public storefront exposure), and `is_premium`.
2. **`product_categories`**: ID, name, slug (`tote-bags`, `laptop-bags`, `handbags`, `purses`), description. Shared taxonomy across both collections.
3. **`products`**: ID, name, slug, collection foreign key, category foreign key, price in PKR, image URLs, stock quantity, availability flag, featured flag, leather details, dimensions, color, and care ritual.
4. **`discounts`**: ID, promotion name, scope (`COLLECTION` or `CATEGORY`), collection foreign key, optional category foreign key, discount percentage (1-100), active flag, start and end dates.
5. **`orders`**: ID, unique order number (e.g. `KM-2026-XXXX`), customer name, email, phone, city, address, subtotal, discount total, shipping fee, final total, payment method (`CASH_ON_DELIVERY`), and status.
6. **`order_items`**: Order foreign key, product foreign key, and immutable product/price snapshots (`product_name_snapshot`, `collection_name_snapshot`, `unit_price_at_purchase`, `discount_amount_at_purchase`, `line_total`).
7. **`audit_logs`**: Administrator activity logs for visibility switches, product CRUD, discount changes, and status updates.

---

## 4. Collection Visibility Switch (`Visible on Storefront: ON / OFF`)

When an administrator sets a collection to **OFF** in `/admin/collections`:
1. It is removed from the public navbar collections dropdown.
2. It is removed from the homepage collection showcase and category shortcuts.
3. Its products are excluded from public catalogue queries, search, and recommendations.
4. Direct product URLs (`/products/[slug]`) and collection URLs (`/collections/[slug]`) return 404 Not Found.
5. Items from that collection cannot be added to the cart or ordered.
6. All existing database records, images, and past orders are preserved intact.
7. Switching it back to **ON** immediately restores the collection and its products.

---

## 5. Discount Precedence Engine

The pricing module (`lib/pricing/index.ts`) enforces the exact business rules:
- **Scope 1: Collection-wide**: e.g., Kawish 15% Off applies to all Kawish products unless overridden.
- **Scope 2: Category within a collection**: e.g., Mooi Handbags 20% Off applies exclusively to Handbags in the Mooi collection (Kawish Handbags and other Mooi categories are unaffected).
- **Precedence Rule**: If both a collection discount and a matching category discount apply, the category-specific discount takes priority. Percentages are **never stacked**.
- **Checkout Recalculation**: Prices and discounts are recomputed on the server during order creation. Client-submitted prices are never trusted.

---

## 6. Initial Administrator Credentials

A default administrator is automatically seeded on first launch:
- **Email**: `admin@kawishmooi.com`
- **Password**: `AdminPassword2026!`
- **Login Route**: `/admin/login`

Credentials can be customized in `.env` using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

---

## 7. Setup & Deployment Instructions

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```

### Environment Variables (`.env.example`)
```env
# Neon PostgreSQL connection string (e.g. postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require)
# If omitted, the app runs with persistent local PGlite automatically
DATABASE_URL=""

# Cloudinary image storage (optional for production uploads)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Auth Secret & Initial Admin
AUTH_SECRET="your-32-char-random-secret-key"
ADMIN_EMAIL="admin@kawishmooi.com"
ADMIN_PASSWORD="AdminPassword2026!"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Vercel Deployment
1. Connect your repository to Vercel.
2. Add your Neon `DATABASE_URL` and `AUTH_SECRET` in Vercel Project Settings > Environment Variables.
3. Deploy! Next.js App Router and Server Actions run seamlessly on Vercel's edge/node runtimes.
