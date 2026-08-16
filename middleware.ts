import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin credentials and dynamic paths from environment variables
const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN;
const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';
const STUDIO_PATH = process.env.NEXT_PUBLIC_STUDIO_PATH || 'studio';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Force HTTPS in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') === 'http'
  ) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https';
    return NextResponse.redirect(httpsUrl, 301);
  }

  // 2. Protect admin routes (except login) and studio
  if ((path.startsWith(`/${ADMIN_PATH}`) && path !== `/${ADMIN_PATH}/login`) || path.startsWith(`/${STUDIO_PATH}`)) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (!ADMIN_TOKEN || adminToken !== ADMIN_TOKEN) {
      return NextResponse.redirect(new URL(`/${ADMIN_PATH}/login`, request.url));
    }
  }

  // 2b. Protect API admin routes
  if (path.startsWith(`/api/${ADMIN_PATH}`)) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (!ADMIN_TOKEN || adminToken !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 3. Block admin/studio from search engine crawlers
  if (path.startsWith(`/${ADMIN_PATH}`) || path.startsWith(`/${STUDIO_PATH}`)) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
