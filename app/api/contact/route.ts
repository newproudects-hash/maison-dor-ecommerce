import { NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  subject: z.string().max(100),
  message: z.string().min(5).max(2000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { name, phone, subject, message } = result.data;

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      const text = `
📬 *رسالة جديدة من صفحة الاتصال*

👤 *الاسم:* ${name}
📞 *الهاتف:* ${phone || 'غير محدد'}
📋 *الموضوع:* ${subject}

💬 *الرسالة:*
${message}

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
