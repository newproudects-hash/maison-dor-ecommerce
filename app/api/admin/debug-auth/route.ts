import { NextResponse } from 'next/server';
import { sendSecurityAlertToTelegram } from '@/lib/utils/telegram';

export async function GET(req: Request) {
  const ip = req.headers.get('cf-connecting-ip')
          || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
          || 'unknown';

  await sendSecurityAlertToTelegram(
    'Honeytoken Triggered (Admin Debug)',
    `An attacker or automated scanner attempted to access the fake admin debug endpoint.\n\nIP: ${ip}\nPath: /api/admin/debug-auth\nMethod: GET`,
    ip
  );

  // Return a generic error to not look suspicious, or pretend to be a real error
  return NextResponse.json(
    { error: 'Unauthorized', message: 'Invalid debug token provided.' },
    { status: 401 }
  );
}

export async function POST(req: Request) {
  const ip = req.headers.get('cf-connecting-ip')
          || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
          || 'unknown';

  let payload = '';
  try {
    const body = await req.json();
    payload = JSON.stringify(body, null, 2);
  } catch (e) {
    payload = 'Unparseable body';
  }

  await sendSecurityAlertToTelegram(
    'Honeytoken Triggered (Admin Debug POST)',
    `An attacker attempted a POST to the fake admin debug endpoint.\n\nIP: ${ip}\nPayload:\n${payload}`,
    ip
  );

  return NextResponse.json(
    { error: 'Unauthorized', message: 'Invalid debug token provided.' },
    { status: 401 }
  );
}
