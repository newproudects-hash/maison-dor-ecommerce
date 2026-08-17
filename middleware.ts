import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ SECURITY FIX (VULN-015): Removed NEXT_PUBLIC_ prefix to prevent Admin Path Leakage to Client JS
const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN;
const ADMIN_PATH = process.env.ADMIN_PATH || 'admin';
const STUDIO_PATH = process.env.STUDIO_PATH || 'studio';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // ✅ SECURITY FIX (VULN-007): Case-Sensitivity Middleware Bypass
  // Skill: testing-for-broken-access-control
  // MITRE ATT&CK: T1190 (Exploit Public-Facing Application)
  // A path like `/Admin/orders` would bypass `path.startsWith('/admin')`.
  const normalizedPath = path.toLowerCase();
  
  const adminPathLower = ADMIN_PATH.toLowerCase();
  const studioPathLower = STUDIO_PATH.toLowerCase();

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
  if ((normalizedPath.startsWith(`/${adminPathLower}`) && normalizedPath !== `/${adminPathLower}/login`) || normalizedPath.startsWith(`/${studioPathLower}`)) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (!ADMIN_TOKEN || adminToken !== ADMIN_TOKEN) {
      return NextResponse.redirect(new URL(`/${ADMIN_PATH}/login`, request.url));
    }
  }

  // 2b. Protect API admin routes
  if (normalizedPath.startsWith(`/api/${adminPathLower}`)) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (!ADMIN_TOKEN || adminToken !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 3. Block admin/studio from search engine crawlers
  if (normalizedPath.startsWith(`/${adminPathLower}`) || normalizedPath.startsWith(`/${studioPathLower}`)) {
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
