import type { APIRoute } from 'astro';
import { connectDB } from '../../../lib/db';
import { Message } from '../../../models/Message';
import { Conversation } from '../../../models/Conversation';
import { getUserIdFromCookies } from '../../../lib/auth';
import { eventBus } from '../../../lib/events';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
  const userId = getUserIdFromCookies(cookies);
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  await connectDB();
  const otherUserId = url.searchParams.get('with');
  if (!otherUserId) return new Response(JSON.stringify({ error: 'Missing "with" param' }), { status: 400 });

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 50;

  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId },
    ]
  }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

  await Message.updateMany(
    { sender: otherUserId, receiver: userId, read: false },
    { read: true }
  );

  return new Response(JSON.stringify(messages.reverse()));
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const userId = getUserIdFromCookies(cookies);
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  await connectDB();
  const { receiver, content, type = 'text' } = await request.json();
  if (!receiver || !content) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });

  const message = await Message.create({ sender: userId, receiver, content, type });

  const participants = [userId, receiver].sort();
  await Conversation.findOneAndUpdate(
    { participants: { $all: participants, $size: 2 } },
    { participants, lastMessage: type === 'text' ? content : `[${type}]`, lastMessageAt: new Date() },
    { upsert: true, new: true }
  );

  eventBus.publish(`messages:${receiver}`, { ...message.toJSON(), _id: message._id.toString() });
  eventBus.publish(`messages:${userId}`, { ...message.toJSON(), _id: message._id.toString() });

  return new Response(JSON.stringify(message), { status: 201 });
};
