import type { APIRoute } from 'astro';
import { connectDB } from '../../../lib/db';
import { User } from '../../../models/User';
import { getUserIdFromCookies } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ params, cookies }) => {
  const userId = getUserIdFromCookies(cookies);
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  await connectDB();
  const user = await User.findById(params.id).select('-password');
  if (!user) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  return new Response(JSON.stringify(user));
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const userId = getUserIdFromCookies(cookies);
  if (!userId || userId !== params.id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  await connectDB();
  const body = await request.json();
  const allowed = ['name', 'avatar'];
  const update: Record<string, any> = {};
  for (const key of allowed) { if (body[key] !== undefined) update[key] = body[key]; }

  const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
  return new Response(JSON.stringify(user));
};
