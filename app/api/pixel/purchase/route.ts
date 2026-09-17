import { NextResponse } from 'next/server';
import { getPixelConfig } from '@/lib/cache/pixel';
import crypto from 'crypto';

// ─── Meta Conversions API (CAPI) — Server-Side Purchase Event ────────────────
// Fires Purchase from the SERVER directly to Meta Graph API.
// This is NOT affected by AdBlockers, iOS ITP, or fbq load timing issues.

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, phone, value, currency, contentIds, numItems } = body;

    if (!orderId || !phone || !value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Load pixel config from Redis (same source as admin dashboard)
    const config = await getPixelConfig();

    if (!config?.enabled) {
      return NextResponse.json({ skipped: true, reason: 'Pixel tracking disabled' });
    }

    if (!config.pixelId || !config.accessToken) {
      return NextResponse.json({ skipped: true, reason: 'Pixel ID or access token not configured' });
    }

    // Send standard Purchase event to Meta CAPI
    const eventName = 'Purchase';

    // Build CAPI payload
    const eventTime = Math.floor(Date.now() / 1000);
    const cleanPhone = phone.replace(/\D/g, '');

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: orderId, // deduplication with client-side pixel
          action_source: 'website',
          user_data: {
            ph: [hashValue(cleanPhone)], // SHA-256 hashed phone
          },
          custom_data: {
            currency: currency || 'DZD',
            value: Number(value),
            content_ids: contentIds || [],
            content_type: 'product',
            num_items: numItems || 1,
            order_id: orderId,
          },
        },
      ],
      ...(config.testMode && config.testEventCode
        ? { test_event_code: config.testEventCode }
        : {}),
    };

    // Send to Meta Graph API
    const capiUrl = `https://graph.facebook.com/v19.0/${config.pixelId}/events?access_token=${config.accessToken}`;

    const capiRes = await fetch(capiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const capiData = await capiRes.json();

    if (!capiRes.ok) {
      console.error('[CAPI] Meta API error:', capiData);
      return NextResponse.json({ error: 'Meta CAPI error', details: capiData }, { status: 502 });
    }

    console.log(`[CAPI] Purchase event sent for order ${orderId}:`, capiData);
    return NextResponse.json({ success: true, events_received: capiData.events_received });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[CAPI] Server error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
