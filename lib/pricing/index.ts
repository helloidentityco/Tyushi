export interface DiscountRecord {
  id: string;
  name: string;
  scope: 'COLLECTION' | 'CATEGORY';
  collectionId: string;
  categoryId?: string | null;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number | string | null;
  discountPercent?: number | null;
  isActive: boolean;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
}

export interface PricingResult {
  regularPrice: number; // Base selling price
  effectivePrice: number; // Final customer-facing price after promotion
  originalPrice?: number | null; // Optional crossed-out reference price
  hasDiscount: boolean;
  discountPercent: number;
  discountFormatted: string; // e.g. "15% OFF" or "Rs. 1,000 OFF"
  discountName?: string;
  discountType?: 'COLLECTION' | 'CATEGORY';
  savingsAmount: number;
}

/**
 * Checks whether a discount record is currently active based on isActive flag and date ranges.
 */
export function isDiscountValid(discount: DiscountRecord, referenceDate = new Date()): boolean {
  if (!discount.isActive) return false;

  const isFixed = discount.discountType === 'FIXED';
  const val = Number(discount.discountValue ?? discount.discountPercent ?? 0);

  if (isFixed) {
    if (val <= 0) return false;
  } else {
    const pct = Number(discount.discountPercent ?? discount.discountValue ?? 0);
    if (pct <= 0 || pct > 100) return false;
  }

  const now = referenceDate.getTime();

  if (discount.startsAt) {
    const startTime = new Date(discount.startsAt).getTime();
    if (now < startTime) return false;
  }

  if (discount.endsAt) {
    const endTime = new Date(discount.endsAt).getTime();
    if (now > endTime) return false;
  }

  return true;
}

/**
 * Resolves the applicable discount for a product based on its collection and category.
 * Precedence Rule:
 * 1. Category-specific discount matching both collectionId and categoryId takes highest priority.
 * 2. Collection-level discount applies if no matching category discount exists.
 * 3. Never stack discounts.
 */
export function resolveApplicableDiscount(
  collectionId: string,
  categoryId: string,
  allDiscounts: DiscountRecord[],
  referenceDate = new Date()
): DiscountRecord | null {
  const validDiscounts = allDiscounts.filter((d) => isDiscountValid(d, referenceDate));

  // 1. Look for matching CATEGORY discount scoped to this collection
  const categoryDiscount = validDiscounts.find(
    (d) => d.scope === 'CATEGORY' && d.collectionId === collectionId && d.categoryId === categoryId
  );
  if (categoryDiscount) {
    return categoryDiscount;
  }

  // 2. Look for COLLECTION discount
  const collectionDiscount = validDiscounts.find(
    (d) => d.scope === 'COLLECTION' && d.collectionId === collectionId
  );
  if (collectionDiscount) {
    return collectionDiscount;
  }

  return null;
}

/**
 * Calculates effective price and discount metadata for a product.
 * Supports both Percentage and Fixed Monetary promotions without stacking.
 */
export function calculateEffectivePrice(
  regularPriceInput: number | string,
  collectionId: string,
  categoryId: string,
  allDiscounts: DiscountRecord[],
  referenceDate = new Date(),
  originalPriceInput?: number | string | null
): PricingResult {
  const regularPrice = Math.round(Number(regularPriceInput) * 100) / 100;
  const rawOriginalPrice = originalPriceInput ? Number(originalPriceInput) : null;
  const originalPrice = rawOriginalPrice && rawOriginalPrice > regularPrice ? rawOriginalPrice : null;

  if (isNaN(regularPrice) || regularPrice <= 0) {
    return {
      regularPrice: 0,
      effectivePrice: 0,
      originalPrice: null,
      hasDiscount: false,
      discountPercent: 0,
      discountFormatted: '',
      savingsAmount: 0,
    };
  }

  const applicableDiscount = resolveApplicableDiscount(collectionId, categoryId, allDiscounts, referenceDate);

  if (!applicableDiscount) {
    const hasManualSale = !!originalPrice && originalPrice > regularPrice;
    const manualSavings = hasManualSale ? Math.round((originalPrice - regularPrice) * 100) / 100 : 0;
    const manualPercent = hasManualSale ? Math.round((manualSavings / originalPrice) * 100) : 0;

    return {
      regularPrice,
      effectivePrice: regularPrice,
      originalPrice,
      hasDiscount: hasManualSale,
      discountPercent: manualPercent,
      discountFormatted: hasManualSale ? `${manualPercent}% OFF` : '',
      savingsAmount: manualSavings,
    };
  }

  const isFixed = applicableDiscount.discountType === 'FIXED';
  let effective = regularPrice;
  let savings = 0;
  let formatted = '';
  let percent = 0;

  if (isFixed) {
    const fixedVal = Number(applicableDiscount.discountValue || 0);
    effective = Math.max(0, Math.round((regularPrice - fixedVal) * 100) / 100);
    savings = Math.round((regularPrice - effective) * 100) / 100;
    percent = Math.round((savings / regularPrice) * 100);
    formatted = `PKR ${fixedVal.toLocaleString()} OFF`;
  } else {
    const pct = Number(applicableDiscount.discountPercent ?? applicableDiscount.discountValue ?? 0);
    const multiplier = (100 - pct) / 100;
    effective = Math.max(0, Math.round(regularPrice * multiplier * 100) / 100);
    savings = Math.round((regularPrice - effective) * 100) / 100;
    percent = pct;
    formatted = `${pct}% OFF`;
  }

  return {
    regularPrice,
    effectivePrice: effective,
    originalPrice: originalPrice || (savings > 0 ? regularPrice : null),
    hasDiscount: savings > 0,
    discountPercent: percent,
    discountFormatted: formatted,
    discountName: applicableDiscount.name,
    discountType: applicableDiscount.scope,
    savingsAmount: savings,
  };
}

/**
 * Format currency in Pakistani Rupees (PKR)
 */
export function formatPKR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rs. 0';
  return `Rs. ${num.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}
