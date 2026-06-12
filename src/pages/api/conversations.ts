import type { APIRoute } from 'astro';
import { connectDB } from '../../lib/db';
import { Conversation } from '../../models/Conversation';
import { getUserIdFromCookies } from '../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const userId = getUserIdFromCookies(cookies);
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  await connectDB();
  const conversations = await Conversation.find({ participants: userId })
    .populate('participants', '-password')
    .sort({ lastMessageAt: -1 })
    .lean();

  return new Response(JSON.stringify(conversations));
};
