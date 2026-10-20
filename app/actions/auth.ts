'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  removeSessionCookie,
  getCurrentUser,
  getCurrentSession,
} from '@/lib/auth';
import { adminLoginSchema, userLoginSchema, registerCustomerSchema } from '@/lib/validation';
import { ensureDbReady } from '@/lib/queries/storefront';

/**
 * Public customer registration.
 * SERVER-ENFORCED: Always assigns role 'CUSTOMER'.
 */
export async function registerCustomerAction(prevState: any, formData: FormData) {
  try {
    await ensureDbReady();

    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const parsed = registerCustomerSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Please check your registration details.',
      };
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in.',
      };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const userId = `usr-cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Strictly enforce CUSTOMER role
    await db.insert(schema.users).values({
      id: userId,
      name: parsed.data.name.trim(),
      email,
      passwordHash,
      role: 'CUSTOMER',
    });

    // Issue signed JWT session token
    const token = await createSessionToken({
      userId,
      email,
      name: parsed.data.name.trim(),
      role: 'CUSTOMER',
    });

    await setSessionCookie(token);

    return {
      success: true,
      user: {
        id: userId,
        email,
        name: parsed.data.name.trim(),
        role: 'CUSTOMER' as const,
      },
    };
  } catch (err: any) {
    console.error('Customer registration error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during account creation.',
    };
  }
}

/**
 * Universal login action for both Customers and Administrators.
 */
export async function loginUserAction(prevState: any, formData: FormData) {
  try {
    await ensureDbReady();

    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const parsed = userLoginSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid email or password.',
      };
    }

    const email = parsed.data.email.toLowerCase().trim();
    const userResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const user = userResult[0];
    const isMatch = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'ADMIN' | 'CUSTOMER',
    });

    await setSessionCookie(token);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'CUSTOMER',
      },
    };
  } catch (err: any) {
    console.error('Login action error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during login.',
    };
  }
}

/**
 * Admin-specific login action (for /admin/login compatibility)
 */
export async function loginAdminAction(prevState: any, formData: FormData) {
  try {
    await ensureDbReady();
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const parsed = adminLoginSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' };
    }

    const email = parsed.data.email.toLowerCase().trim();
    const userResult = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

    if (userResult.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }

    const user = userResult[0];

    if (user.role !== 'ADMIN') {
      return { success: false, error: 'Access denied: Administrator privileges required.' };
    }

    const isMatch = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password' };
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'ADMIN',
    });

    await setSessionCookie(token);

    // Record audit log
    await db.insert(schema.auditLogs).values({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminEmail: user.email,
      action: 'ADMIN_LOGIN',
      targetEntity: 'users',
      targetId: user.id,
      details: 'Administrator logged in successfully',
    });

    return { success: true };
  } catch (err: any) {
    console.error('Login action error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred during login.' };
  }
}

/**
 * Universal logout action
 */
export async function logoutUserAction() {
  const session = await getCurrentUser();
  if (session && session.role === 'ADMIN') {
    try {
      await db.insert(schema.auditLogs).values({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        adminEmail: session.email,
        action: 'LOGOUT',
        targetEntity: 'users',
        targetId: session.userId,
        details: 'User logged out',
      });
    } catch {
      // Ignore audit fail on logout
    }
  }
  await removeSessionCookie();
  return { success: true };
}

export const logoutAdminAction = logoutUserAction;

export async function getCurrentUserAction() {
  return getCurrentUser();
}

export const getCurrentAdminSessionAction = getCurrentUserAction;
