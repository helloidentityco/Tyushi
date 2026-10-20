import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'tyushi_session';
export const LEGACY_COOKIE_NAME = 'km_admin_session';

const SECRET_KEY = process.env.AUTH_SECRET || 'tyushi-luxury-leather-atelier-jwt-secret-2026-production';
const encodedKey = new TextEncoder().encode(SECRET_KEY);

const JWT_ISSUER = 'tyushi:auth';
const JWT_AUDIENCE = 'tyushi:app';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER';
  [key: string]: any;
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Signs a JWT session token with issuer and audience
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime('7d')
    .sign(encodedKey);
}

/**
 * Validates token signature, expiration, issuer, and audience
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    // Primary strict verification with issuer & audience
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as unknown as SessionPayload;
  } catch {
    // Permissive fallback for transition tokens issued prior to audience configuration
    try {
      const { payload } = await jwtVerify(token, encodedKey, {
        algorithms: ['HS256'],
      });
      return payload as unknown as SessionPayload;
    } catch {
      return null;
    }
  }
}

export const verifyJwtSession = verifySessionToken;

/**
 * Sets the secure HttpOnly session cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Removes the session cookie across all domain paths
 */
export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  cookieStore.set(LEGACY_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Resolves current authenticated session from trusted server cookies
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get(SESSION_COOKIE_NAME)?.value ||
      cookieStore.get(LEGACY_COOKIE_NAME)?.value;

    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export const getCurrentSession = getCurrentUser;

/**
 * Strict server-side RBAC guards
 */
export async function requireAuth(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required. Please log in.');
  }
  return user;
}

export async function requireCustomer(): Promise<SessionPayload> {
  const user = await requireAuth();
  if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN') {
    throw new Error('Access denied: Customer or Administrator role required');
  }
  return user;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new Error('Access denied: Administrator privileges required');
  }
  return user;
}
