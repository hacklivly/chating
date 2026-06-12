import type { APIRoute } from 'astro';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';
import { getUserIdFromCookies } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const userId = getUserIdFromCookies(cookies);
  if (userId) {
    await connectDB();
    await User.updateOne({ _id: userId }, { online: false, lastSeen: new Date() });
  }
  cookies.delete('token', { path: '/' });
  return new Response(JSON.stringify({ ok: true }));
};
