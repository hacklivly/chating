import type { APIRoute } from 'astro';
import { getUserIdFromCookies } from '../../lib/auth';
import { eventBus } from '../../lib/events';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const userId = getUserIdFromCookies(cookies);
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { receiver, typing } = await request.json();
  eventBus.publish(`typing:${receiver}`, { type: 'typing', sender: userId, typing });
  return new Response(JSON.stringify({ ok: true }));
};
