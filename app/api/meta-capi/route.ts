// ============================================================
// Meta Conversions API (CAPI) — Server-Side Purchase Event
// FIX #16: Server-side pixel — survives ad blockers & iOS ITP
// FIX #17: Phone hashing with SHA-256 for privacy compliance
// FIX #18: Deduplication event_id prevents double counting
// FIX #19: Proper error handling + logging
// FIX #20: Test event code support for debugging
// ============================================================

import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Hash a string with SHA-256 (Meta CAPI requirement)
function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

// Normalize Algerian phone to international format
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return '213' + digits.slice(1); // 0561... → 213561...
  }
  return digits;
}

export async function POST(req: Request) {
  try {
    const {
      event_name,
      order_id,
      phone,
      value,
      currency,
      content_ids,
      num_items,
    } = await req.json();

    const accessToken = process.env.META_ACCESS_TOKEN;
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || '888489174201321';
    const testEventCode = process.env.META_TEST_EVENT_CODE;

    // FIX #16: If no access token, log and return gracefully (don't break checkout)
    if (!accessToken || accessToken === 'PASTE_YOUR_META_CAPI_TOKEN_HERE') {
      console.warn('[Meta CAPI] ⚠️ META_ACCESS_TOKEN not configured — skipping server-side event.');
      console.warn('[Meta CAPI] To enable CAPI: Business Manager → Events Manager → Pixel → Settings → Conversions API');
      return NextResponse.json({ success: false, error: 'CAPI token not configured', skipped: true });
    }

    const eventTime = Math.floor(Date.now() / 1000);
    
    // FIX #18: event_id = orderId to deduplicate between client pixel and CAPI
    const eventId = `purchase_${order_id || Date.now()}`;

    // FIX #17: Hash customer data per Meta privacy requirements
    const userData: Record<string, string | string[]> = {};
    if (phone) {
      const normalized = normalizePhone(phone);
      userData.ph = sha256(normalized);
    }

    // Get client IP and user agent from request for better matching
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    const userAgent = req.headers.get('user-agent') || '';

    const eventData: Record<string, unknown> = {
      data: [
        {
          event_name: event_name || 'Purchase',
          event_time: eventTime,
          event_id: eventId,
          action_source: 'website',
          event_source_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.maisondor.dz'}/merci`,
          user_data: {
            ...userData,
            client_ip_address: clientIp,
            client_user_agent: userAgent,
          },
          custom_data: {
            value: value || 0,
            currency: currency || 'DZD',
            content_ids: content_ids || [],
            content_type: 'product',
            num_items: num_items || 1,
            order_id: order_id,
          },
        },
      ],
    };

    // FIX #20: Add test event code if set (for Events Manager Test Events tab)
    if (testEventCode) {
      eventData.test_event_code = testEventCode;
    }

    const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Meta CAPI] ❌ API error:', JSON.stringify(result));
      return NextResponse.json({ success: false, error: result.error?.message || 'Meta API error' }, { status: 500 });
    }

    console.log('[Meta CAPI] ✅ Purchase event sent successfully:', JSON.stringify(result));
    return NextResponse.json({ success: true, result, event_id: eventId });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Meta CAPI] ❌ Exception:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
