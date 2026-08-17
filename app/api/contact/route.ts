import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getFromCache, setCache } from '@/lib/cache/redis';
import { escapeMarkdown, sendSecurityAlertToTelegram } from '@/lib/utils/telegram';

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
        await sendSecurityAlertToTelegram(
          'Rate Limit Exceeded (Contact API)',
          `IP ${ip} has exceeded the rate limit (3 req/min) and is blocked for 15 minutes.`,
          ip
        );
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

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // ✅ SECURITY FIX (VULN-013): Markdown Injection Prevention
    const safeName = escapeMarkdown(name);
    const safePhone = phone ? escapeMarkdown(phone) : 'غير محدد';
    const safeSubject = escapeMarkdown(subject);
    const safeMessage = escapeMarkdown(message);

    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      const text = `
📬 *رسالة جديدة من صفحة الاتصال*

👤 *الاسم:* ${safeName}
📞 *الهاتف:* ${safePhone}
📋 *الموضوع:* ${safeSubject}

💬 *الرسالة:*
${safeMessage}

⏰ ${new Date().toLocaleString('ar-DZ')}
`;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
