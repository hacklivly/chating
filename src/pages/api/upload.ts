import type { APIRoute } from 'astro';
import { getUserIdFromCookies } from '../../lib/auth';
import { uploadImage } from '../../lib/cloudinary';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const userId = getUserIdFromCookies(cookies);
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) return new Response(JSON.stringify({ error: 'No file' }), { status: 400 });

  const url = await uploadImage(file);
  return new Response(JSON.stringify({ url }));
};
