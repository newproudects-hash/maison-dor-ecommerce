import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin token from environment variable (never hardcoded)
const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN;

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

  // 2. Protect /admin routes (except /admin/login)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const adminToken = request.cookies.get('admin_token')?.value;

    // Verify against env var — never a hardcoded string
    if (!ADMIN_TOKEN || adminToken !== ADMIN_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Block /admin from search engine crawlers
  if (path.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
