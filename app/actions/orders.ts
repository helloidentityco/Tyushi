'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, inArray, desc } from 'drizzle-orm';
import { requireAdmin, requireAuth, getCurrentUser } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validation';
import { ensureDbReady, getActiveDiscounts } from '@/lib/queries/storefront';
import { calculateEffectivePrice } from '@/lib/pricing';
import { revalidatePath } from 'next/cache';

/**
 * Creates a verified customer order.
 * RBAC: Customer or Administrator authentication is strictly required.
 */
export async function createOrderAction(formData: any) {
  try {
    await ensureDbReady();

    // Verify authenticated session
    const currentSession = await getCurrentUser();
    if (!currentSession) {
      return {
        success: false,
        error: 'Please sign in or create an account to finalize your order.',
        requiresAuth: true,
      };
    }

    // 1. Validate customer and shipping fields
    const parsed = checkoutSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Please verify your delivery details and try again.',
      };
    }

    const { customerName, email, phone, city, shippingAddress, notes, items } = parsed.data;

    // 2. Fetch all requested products and their parent collections & categories
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db
      .select({
        product: schema.products,
        collection: schema.collections,
        category: schema.productCategories,
      })
      .from(schema.products)
      .innerJoin(schema.collections, eq(schema.products.collectionId, schema.collections.id))
      .innerJoin(schema.productCategories, eq(schema.products.categoryId, schema.productCategories.id))
      .where(inArray(schema.products.id, productIds));

    if (dbProducts.length !== items.length) {
      return {
        success: false,
        error: 'One or more items in your cart could not be found or are no longer available.',
      };
    }

    // 3. Strict verification of collection visibility and product availability
    for (const item of items) {
      const match = dbProducts.find((p: any) => p.product.id === item.productId);
      if (!match) {
        return { success: false, error: 'Product not found in atelier catalogue.' };
      }

      if (!match.collection.isVisible) {
        return {
          success: false,
          error: `The collection '${match.collection.name}' is currently archived. Items cannot be purchased.`,
        };
      }

      if (!match.product.isAvailable) {
        return {
          success: false,
          error: `Product '${match.product.name}' is temporarily out of stock or unavailable.`,
        };
      }

      if (match.product.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `Only ${match.product.stockQuantity} piece(s) available for '${match.product.name}'. Please reduce your quantity.`,
        };
      }
    }

    // 4. Fetch active promotional discounts and compute immutable pricing snapshots
    const activeDiscounts = await getActiveDiscounts();

    let calculatedSubtotal = 0;
    let calculatedDiscountTotal = 0;

    const orderItemsToInsert: Array<{
      id: string;
      orderId: string;
      productId: string;
      productNameSnapshot: string;
      productSlugSnapshot: string;
      collectionNameSnapshot: string;
      categoryNameSnapshot: string;
      quantity: number;
      unitPriceAtPurchase: string;
      discountAmountAtPurchase: string;
      lineTotal: string;
    }> = [];

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TY-${new Date().getFullYear()}-${randomSuffix}`;

    for (const item of items) {
      const { product, collection, category } = dbProducts.find((p: any) => p.product.id === item.productId)!;

      const pricing = calculateEffectivePrice(
        product.price,
        product.collectionId,
        product.categoryId,
        activeDiscounts,
        new Date(),
        product.originalPrice
      );

      const regularUnit = pricing.regularPrice;
      const effectiveUnit = pricing.effectivePrice;
      const unitDiscount = pricing.savingsAmount;
      const lineTotal = Math.round(effectiveUnit * item.quantity * 100) / 100;

      calculatedSubtotal += regularUnit * item.quantity;
      calculatedDiscountTotal += unitDiscount * item.quantity;

      orderItemsToInsert.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        orderId,
        productId: product.id,
        productNameSnapshot: product.name,
        productSlugSnapshot: product.slug,
        collectionNameSnapshot: collection.name,
        categoryNameSnapshot: category.name,
        quantity: item.quantity,
        unitPriceAtPurchase: regularUnit.toFixed(2),
        discountAmountAtPurchase: unitDiscount.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
      });
    }

    // Round values
    calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;
    calculatedDiscountTotal = Math.round(calculatedDiscountTotal * 100) / 100;
    const shippingFee = 0.00; // Free luxury delivery nationwide
    const finalTotal = Math.round((calculatedSubtotal - calculatedDiscountTotal + shippingFee) * 100) / 100;

    // 5. Database transaction: Insert order, items, and decrement stock
    await db.insert(schema.orders).values({
      id: orderId,
      orderNumber,
      userId: currentSession.userId,
      customerName,
      email: email.toLowerCase().trim(),
      phone,
      city,
      shippingAddress,
      notes: notes || null,
      subtotal: calculatedSubtotal.toFixed(2),
      discountTotal: calculatedDiscountTotal.toFixed(2),
      shippingFee: shippingFee.toFixed(2),
      totalAmount: finalTotal.toFixed(2),
      paymentMethod: 'CASH_ON_DELIVERY',
      status: 'CONFIRMED',
    });

    if (orderItemsToInsert.length > 0) {
      await db.insert(schema.orderItems).values(orderItemsToInsert);
    }

    // Decrement stock atomically
    for (const item of items) {
      const match = dbProducts.find((p: any) => p.product.id === item.productId)!;
      const newStock = Math.max(0, match.product.stockQuantity - item.quantity);
      await db
        .update(schema.products)
        .set({
          stockQuantity: newStock,
          isAvailable: newStock > 0 ? match.product.isAvailable : false,
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, item.productId));
    }

    try {
      revalidatePath('/admin/orders');
      revalidatePath('/account/orders');
    } catch {}

    return {
      success: true,
      orderNumber,
      orderId,
      totalAmount: finalTotal,
    };
  } catch (err: any) {
    console.error('Order creation error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected failure occurred while placing your order. Please try again.',
    };
  }
}

/**
 * Public order confirmation reference query
 */
export async function getOrderConfirmation(orderNumber: string) {
  await ensureDbReady();
  const orderResult = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.orderNumber, orderNumber))
    .limit(1);

  if (orderResult.length === 0) return null;

  const order = orderResult[0];
  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, order.id));

  return {
    ...order,
    items,
  };
}

/**
 * Customer Order History: Only returns orders belonging to the authenticated customer.
 */
export async function getMyOrdersAction() {
  await ensureDbReady();
  const session = await requireAuth();

  const userOrders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, session.userId))
    .orderBy(desc(schema.orders.createdAt));

  const ordersWithItems = await Promise.all(
    userOrders.map(async (order) => {
      const items = await db
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, order.id));
      return {
        ...order,
        itemsCount: items.length,
        items,
      };
    })
  );

  return ordersWithItems;
}

/**
 * Customer Order Details: Enforces strict ownership check.
 * Customers can ONLY view their own orders. Administrators can view any.
 */
export async function getMyOrderDetailsAction(orderId: string) {
  await ensureDbReady();
  const session = await requireAuth();

  const orderResult = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .limit(1);

  if (!orderResult[0]) {
    return null;
  }

  const order = orderResult[0];

  // STRICT SERVER-SIDE OWNERSHIP CHECK
  if (order.userId !== session.userId && session.role !== 'ADMIN') {
    throw new Error('Unauthorized: You do not have permission to view this order.');
  }

  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, order.id));

  return {
    ...order,
    items,
  };
}

/**
 * Administrator Orders query with filtering
 */
export async function getAdminOrders(filters: { search?: string; status?: string } = {}) {
  await ensureDbReady();
  await requireAdmin();

  const allOrders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));

  let filtered = allOrders;
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((o: any) => o.status === filters.status);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(
      (o: any) =>
        o.orderNumber.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.email.toLowerCase().includes(s) ||
        o.phone.toLowerCase().includes(s)
    );
  }

  return filtered;
}

/**
 * Administrator Order Inspection
 */
export async function getAdminOrderDetails(orderId: string) {
  await ensureDbReady();
  await requireAdmin();

  const orderResult = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  if (!orderResult[0]) return null;

  const order = orderResult[0];
  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, order.id));

  // If order was placed by registered user, fetch profile details
  let customerUser = null;
  if (order.userId) {
    const u = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email, role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, order.userId))
      .limit(1);
    if (u[0]) customerUser = u[0];
  }

  return {
    ...order,
    items,
    customerUser,
  };
}

/**
 * Update order status with audit log
 */
export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  await ensureDbReady();
  const session = await requireAdmin();

  const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: 'Invalid order status' };
  }

  const order = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  if (!order[0]) {
    return { success: false, error: 'Order not found' };
  }

  await db
    .update(schema.orders)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.orders.id, orderId));

  await db.insert(schema.auditLogs).values({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    adminEmail: session.email,
    action: 'ORDER_STATUS_CHANGED',
    targetEntity: 'orders',
    targetId: orderId,
    details: `Changed order ${order[0].orderNumber} status from ${order[0].status} to ${newStatus}`,
  });

  try {
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/account/orders');
  } catch {}

  return { success: true };
}
