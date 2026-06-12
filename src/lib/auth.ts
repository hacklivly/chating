import jwt from 'jsonwebtoken';
import type { AstroCookies } from 'astro';

const SECRET = () => import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'dev-secret';

export function signToken(userId: string) {
  return jwt.sign({ userId }, SECRET(), { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, SECRET()) as { userId: string };
  } catch {
    return null;
  }
}

export function getUserIdFromCookies(cookies: AstroCookies): string | null {
  const token = cookies.get('token')?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId || null;
}
