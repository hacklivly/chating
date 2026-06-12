import { defineMiddleware } from 'astro:middleware';
import { getUserIdFromCookies } from './lib/auth';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p)) || pathname.startsWith('/_') || pathname.includes('.')) {
    return next();
  }

  const userId = getUserIdFromCookies(context.cookies);
  if (!userId && !pathname.startsWith('/api/')) {
    return context.redirect('/login');
  }

  context.locals.userId = userId;
  return next();
});
