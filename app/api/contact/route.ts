import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getFromCache, setCache } from '@/lib/cache/redis';
import { getServerSupabase } from '@/lib/supabase/server';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  subject: z.string().max(100),
  message: z.string().min(5).max(2000),
});

// ✅ SECURITY FIX (VULN-012): Fail-Closed Rate Limiting for Contact Form
// Skill: performing-api-rate-limiting-bypass (Anthropic Cybersecurity Skills)
// MITRE ATT&CK: T1499 (Endpoint DoS)
async function checkContactRateLimit(ip: string): Promise<boolean> {
  const now = Date.now();
  const redisKey = `rl:contact:${ip}`;

  try {
    type RlEntry = { count: number; resetTime: number; blockedUntil?: number };
    const cached = await getFromCache<RlEntry>(redisKey);
    const entry = cached || { count: 0, resetTime: now + 60_000 };

    if (entry.blockedUntil && now < entry.blockedUntil) return false;

    if (now > entry.resetTime) {
      await setCache(redisKey, { count: 1, resetTime: now + 60_000 }, 120);
      return true;
    }

    entry.count++;
    if (entry.count > 3) {
      if (!entry.blockedUntil) {
        entry.blockedUntil = now + (15 * 60 * 1000); // 15 mins block
        console.error(`[Security Alert] IP ${ip} has exceeded the rate limit for contact API and is blocked.`);
      }
      await setCache(redisKey, entry, 15 * 60);
      return false;
    }
    await setCache(redisKey, entry, 120);
    return true;
  } catch {
    // ✅ FAIL CLOSED
    console.error('[Rate Limit] Redis unavailable — failing closed for security');
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // ✅ Enforce Rate Limiting
    const ip = req.headers.get('cf-connecting-ip')
            || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
            || 'unknown';
    const isAllowed = await checkContactRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: 'لقد أرسلت رسائل كثيرة. يرجى المحاولة لاحقاً.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { name, phone, subject, message } = result.data;

    // ✅ Save directly to Supabase instead of Telegram
    try {
      const supabase = getServerSupabase();
      const { error: supabaseError } = await supabase.from('contact_messages').insert([{
        name,
        phone: phone || null,
        subject,
        message,
        created_at: new Date().toISOString()
      }]);
      
      if (supabaseError) {
        console.error('[Contact API] Supabase insert error:', supabaseError.message);
        // We still return success to the user so they don't know the backend failed, 
        // or we can return an error. Returning 500 is better if it fails.
        throw new Error('Failed to save message');
      }
    } catch (dbError) {
      console.error('[Contact API] DB Error:', dbError);
      return NextResponse.json({ success: false, error: 'حدث خطأ في السيرفر. يرجى المحاولة لاحقاً.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
