import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const userLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerCustomerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const collectionUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  heroImageUrl: z.string().url('Must be a valid image URL'),
  bannerImageUrl: z.string().url('Must be a valid image URL'),
  isVisible: z.boolean(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Product slug is required'),
  collectionId: z.string().min(1, 'Please select a collection'),
  categoryId: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Detailed description is required'),
  price: z.coerce.number().positive('Selling price must be greater than zero'),
  originalPrice: z.coerce.number().positive('Original price must be greater than zero').optional().nullable(),
  mainImageUrl: z.string().url('Main image URL is required'),
  secondaryImageUrl: z.string().url().optional().or(z.literal('')),
  imageUrls: z.array(z.string().url()).optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sku: z.string().optional().or(z.literal('')),
  stockQuantity: z.coerce.number().int().min(0).default(10),
  leatherDetails: z.string().min(3, 'Leather details are required'),
  dimensions: z.string().min(2, 'Dimensions are required'),
  length: z.coerce.number().positive().optional().nullable(),
  width: z.coerce.number().positive().optional().nullable(),
  height: z.coerce.number().positive().optional().nullable(),
  dimensionsUnit: z.string().default('inches'),
  color: z.string().min(2, 'Color is required'),
  careInstructions: z.string().min(5, 'Care instructions are required'),
}).refine(data => {
  if (data.originalPrice && data.originalPrice <= data.price) {
    return false;
  }
  return true;
}, {
  message: 'Original reference price must be strictly greater than the discounted selling price',
  path: ['originalPrice'],
});

export const discountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Discount title is required'),
  scope: z.enum(['COLLECTION', 'CATEGORY']),
  collectionId: z.string().min(1, 'Collection is required'),
  categoryId: z.string().optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  discountValue: z.coerce.number().positive('Discount value must be greater than zero'),
  discountPercent: z.coerce.number().int().min(0).max(100).optional().nullable(),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
}).refine(data => {
  if (data.scope === 'CATEGORY' && !data.categoryId) {
    return false;
  }
  return true;
}, {
  message: 'Category is required when scope is CATEGORY',
  path: ['categoryId'],
}).refine(data => {
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: 'Percentage discount cannot exceed 100%',
  path: ['discountValue'],
}).refine(data => {
  if (data.startsAt && data.endsAt) {
    return new Date(data.startsAt).getTime() <= new Date(data.endsAt).getTime();
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endsAt'],
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(50),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(7, 'Valid contact number is required'),
  city: z.string().min(2, 'City is required'),
  shippingAddress: z.string().min(10, 'Complete shipping address is required'),
  notes: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
});
