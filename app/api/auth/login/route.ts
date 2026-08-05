import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Very basic hardcoded admin auth for MVP
    // User can change these in .env later if needed
    if (email === 'admin@maisondor.com' && password === 'admin123') {
      const cookieStore = await cookies();
      cookieStore.set('admin_token', 'maison-dor-admin-secured', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Identifiants invalides' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
