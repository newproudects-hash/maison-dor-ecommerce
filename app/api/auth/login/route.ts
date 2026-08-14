import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sendSecurityAlertToTelegram } from '@/lib/utils/telegram';

// Brute-force protection: track login attempts per IP
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: Request) {
  try {
    // Rate limit by IP (Support Cloudflare cf-connecting-ip)
    const ip = req.headers.get('cf-connecting-ip')
            || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
            || 'unknown';
    const now = Date.now();
    const attempts = loginAttempts.get(ip);

    if (attempts && now < attempts.blockedUntil) {
      return NextResponse.json(
        { success: false, message: 'تم تجاوز عدد المحاولات. حاول مرة أخرى بعد 15 دقيقة.' },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    // Admin credentials from environment variables (NEVER hardcoded)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_TOKEN) {
      return NextResponse.json(
        { success: false, message: 'Admin not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SECRET_TOKEN in .env' },
        { status: 500 }
      );
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Reset attempt count on success
      loginAttempts.delete(ip);
      
      await sendSecurityAlertToTelegram(
        'Admin Login Success',
        `Successful login to the Admin Dashboard.\n\nEmail: ${email}`,
        ip
      );

      const cookieStore = await cookies();
      cookieStore.set('admin_token', ADMIN_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return NextResponse.json({ success: true });
    }

    // Track failed attempt
    const prev = loginAttempts.get(ip);
    const newCount = (prev?.count || 0) + 1;
    if (newCount >= MAX_ATTEMPTS) {
      if (!prev || prev.blockedUntil === 0) {
        await sendSecurityAlertToTelegram(
          'Brute Force Admin Login Attempt',
          `Multiple failed login attempts (>= ${MAX_ATTEMPTS}) detected for admin panel.\n\nAttempted Email: ${email}\nAction: IP Blocked for 15 minutes.`,
          ip
        );
      }
      loginAttempts.set(ip, { count: newCount, blockedUntil: now + BLOCK_DURATION_MS });
    } else {
      loginAttempts.set(ip, { count: newCount, blockedUntil: 0 });
    }

    return NextResponse.json(
      { success: false, message: `بيانات الدخول غير صحيحة. (${MAX_ATTEMPTS - newCount} محاولات متبقية)` },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ success: false, message: 'خطأ في الخادم' }, { status: 500 });
  }
}
