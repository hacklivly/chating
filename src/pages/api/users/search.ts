import type { APIRoute } from 'astro';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';
import { getUserIdFromCookies } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
  const userId = getUserIdFromCookies(cookies);
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  await connectDB();
  const q = url.searchParams.get('q') || '';
  const users = await User.find({
    _id: { $ne: userId },
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ]
  }).select('-password').limit(20);

  return new Response(JSON.stringify(users));
};
