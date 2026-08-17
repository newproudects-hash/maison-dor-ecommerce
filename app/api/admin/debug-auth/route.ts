import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const ip = req.headers.get('cf-connecting-ip')
          || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
          || 'unknown';

  console.warn(
    `[Honeytoken] An attacker or automated scanner attempted to access the fake admin debug endpoint. IP: ${ip} Path: /api/admin/debug-auth Method: GET`
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

  console.warn(
    `[Honeytoken] An attacker attempted a POST to the fake admin debug endpoint. IP: ${ip} Payload: ${payload}`
  );

  return NextResponse.json(
    { error: 'Unauthorized', message: 'Invalid debug token provided.' },
    { status: 401 }
  );
}
