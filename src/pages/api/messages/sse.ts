import type { APIRoute } from 'astro';
import { getUserIdFromCookies } from '../../../lib/auth';
import { eventBus } from '../../../lib/events';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const userId = getUserIdFromCookies(cookies);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: string) => {
        try { controller.enqueue(encoder.encode(`data: ${data}\n\n`)); } catch {}
      };

      send(JSON.stringify({ type: 'connected' }));

      const unsub = eventBus.subscribe(`messages:${userId}`, send);
      const typingUnsub = eventBus.subscribe(`typing:${userId}`, send);
      const callUnsub = eventBus.subscribe(`call:${userId}`, send);
      const heartbeat = setInterval(() => { send(JSON.stringify({ type: 'ping' })); }, 30000);

      cleanup = () => { unsub(); typingUnsub(); callUnsub(); clearInterval(heartbeat); };
    },
    cancel() {
      cleanup?.();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
};
