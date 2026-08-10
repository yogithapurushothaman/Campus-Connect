import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'campusconnect-super-secret-jwt-key-2026'
);

export const AUTH_COOKIE_NAME = 'auth_token';

export interface UserSessionPayload {
  id: string;
  name: string;
  email: string;
  role: 'STAFF' | 'STUDENT';
}

/**
 * Hash plain password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Compare plain password with bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Sign JWT token containing user payload
 */
export async function signAuthToken(payload: UserSessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token string and extract payload
 */
export async function verifyAuthToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as 'STAFF' | 'STUDENT',
    };
  } catch (error) {
    return null;
  }
}

/**
 * Helper to get current session payload on server components or route handlers
 */
export async function getServerSession(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAuthToken(token);
}
