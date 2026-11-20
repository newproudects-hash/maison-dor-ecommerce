# 📘 الدليل الشامل لربط Meta Pixel مع Conversions API (CAPI) في مشاريع Next.js

هذا الدليل يشرح البنية الاحترافية المعتمدة في هذا المشروع لتتبع إعلانات فيسبوك وإنستغرام (Meta Ads) بنسبة دقة 100%، والتغلب على موانع الإعلانات (Ad Blockers) وتحديثات آبل (iOS 14+ / Safari ITP)، مع منع التكرار (Deduplication).

---

## 🎯 فكرة النظام (الهندسة المعمارية)

يعتمد التتبع على **نظام هجين مزدوج (Hybrid Tracking)**:
1. **من طرف المتصفح (Client-side):** عبر مكتبة `fbq` لتسجيل التفاعلات الفورية (PageView, Purchase).
2. **من طرف السيرفر (Server-side CAPI):** عبر إرسال الطلب مباشرة من سيرفر Next.js إلى Meta Graph API.
3. **منع التكرار (Deduplication):** إرسال نفس `event_id` (مثلاً `purchase_ORD-12345`) في كلا الطرفين، لتقوم فيسبوك باحتساب الطلب مرة واحدة فقط مع رفع جودة المطابقة (Event Match Quality - EMQ).
4. **طبقة الطوارئ (AdBlock Fallback):** في حال قام مانع الإعلانات بحجب كود جافاسكريبت، يتم حقن بيكسل صورة خفي (`<img> beacon`) لضمان وصول التحويل.

---

## 📁 الملفات المطلوبة وطريقة عملها

### 1️⃣ ملف المساعد للعميل: `lib/metaPixel.ts`
مسؤول عن:
- حماية استدعاء دالة `fbq` والتأكد من تحميلها.
- إعادة المحاولة تلقائياً (Retry) حتى 5 مرات في حال تأخر تحميل السكربت.
- منع تكرار نفس الحدث خلال 3 ثوانٍ (`deduplication window`).

```typescript
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '888489174201321';

const firedEvents = new Set<string>();

function getEventKey(name: string, data: Record<string, unknown>): string {
  return `${name}_${JSON.stringify(data)}_${Math.floor(Date.now() / 3000)}`;
}

function retryFbq(name: string, data: Record<string, unknown>, retries = 5): void {
  if (typeof window === 'undefined') return;

  const tryFire = (attempt: number) => {
    const fbq = (window as Window & { fbq?: Function }).fbq;
    if (typeof fbq === 'function') {
      const key = getEventKey(name, data);
      if (firedEvents.has(key)) return;
      firedEvents.add(key);
      setTimeout(() => firedEvents.delete(key), 10_000);

      fbq('track', name, data);
    } else if (attempt < retries) {
      setTimeout(() => tryFire(attempt + 1), 500);
    }
  };

  tryFire(0);
}

export const pageview = () => retryFbq('PageView', {});
export const event = (name: string, data: Record<string, unknown> = {}) => retryFbq(name, data);
```

---

### 2️⃣ مكون البيكسل في الواجهة: `components/analytics/MetaPixel.tsx`
مسؤول عن:
- حقن سكربت `fbevents.js` باستراتيجية `afterInteractive` لتسريع تحميل الموقع.
- تتبع التنقل بين الصفحات في Next.js App Router عبر `usePathname()`.
- إضافة كود `<noscript>` كاحتياط.

```tsx
'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { META_PIXEL_ID, pageview } from '@/lib/metaPixel';

export default function MetaPixel() {
  const pathname = usePathname();
  const initialized = useRef(false);
  const lastPath = useRef('');

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    setTimeout(() => pageview(), 300);
  }, [pathname]);

  return (
    <>
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
```

يتم وضعه في `app/layout.tsx`:
```tsx
import MetaPixel from '@/components/analytics/MetaPixel';

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
```

---

### 3️⃣ مسار الخادم CAPI: `app/api/meta-capi/route.ts`
مسؤول عن:
- استقبال أحداث التحويل من السيرفر.
- تشفير بيانات العميل (الهاتف، الإيميل) بخوارزمية **SHA-256** حسب متطلبات Meta.
- توحيد صيغة رقم الهاتف الجزائري (تحويل `05...` إلى `2135...`).
- إرسال الـ IP و الـ User-Agent لرفع جودة المطابقة (EMQ 8+/10).
- إرسال الطلب لـ `graph.facebook.com/v21.0/{PIXEL_ID}/events`.

```typescript
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return '213' + digits.slice(1);
  }
  return digits;
}

export async function POST(req: Request) {
  try {
    const { order_id, phone, value, currency, content_ids, num_items } = await req.json();
    const accessToken = process.env.META_ACCESS_TOKEN;
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const testEventCode = process.env.META_TEST_EVENT_CODE;

    if (!accessToken) {
      return NextResponse.json({ skipped: true, message: 'CAPI not configured' });
    }

    const eventId = `purchase_${order_id || Date.now()}`;
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    const userAgent = req.headers.get('user-agent') || '';

    const payload: any = {
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: `${process.env.NEXT_PUBLIC_APP_URL}/merci`,
        user_data: {
          ph: phone ? sha256(normalizePhone(phone)) : undefined,
          client_ip_address: clientIp,
          client_user_agent: userAgent,
        },
        custom_data: {
          value: Number(value) || 0,
          currency: currency || 'DZD',
          content_ids: content_ids || [],
          content_type: 'product',
          num_items: num_items || 1,
          order_id: order_id,
        },
      }],
    };

    if (testEventCode) payload.test_event_code = testEventCode;

    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return NextResponse.json({ success: res.ok, result: data, event_id: eventId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

---

### 4️⃣ إطلاق حدث الشراء في صفحة الشكر: `app/merci/page.tsx`
عند إتمام الطلب، يتم توجيه العميل إلى `/merci?orderId=...&phone=...`.
الآلية الثلاثية المنفذة:
1. **فحص الـ SessionStorage:** لمنع إطلاق البيكسل عند عمل Refresh للصفحة.
2. **إطلاق Client-side Pixel:**
   ```typescript
   fbq('track', 'Purchase', purchaseData, { eventID: `purchase_${orderId}` });
   ```
3. **إطلاق Server-side CAPI:**
   ```typescript
   fetch('/api/meta-capi', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ ... }),
   });
   ```
4. **Fallback Image Beacon:** إذا كان `fbq` معطلاً بسبب AdBlock، يتم إنشاء وسم `<img>` سري يرسل الحدث لفيسبوك مباشرة.

---

## ⚙️ المتغيرات البيئية المطلوبة (`.env.local` أو Vercel)

```env
# 1. معرف البيكسل (متاح للفرونت إند)
NEXT_PUBLIC_META_PIXEL_ID=888489174201321

# 2. رمز وصول Conversions API من لوحة Meta Business
META_ACCESS_TOKEN=EAAxxxxxxx...

# 3. كود اختبار الأحداث (اختياري، يوضع للتجربة في تبويب Test Events ثم يحذف)
# META_TEST_EVENT_CODE=TEST12345

# 4. رابط الموقع الأساسي
NEXT_PUBLIC_APP_URL=https://www.maisondor.dz
```

---

## 🧪 خطوات استخراج Access Token من Meta Business Suite

1. افتح **Meta Events Manager** (مدير الأحداث).
2. اختر البيكسل الخاص بك.
3. انتقل إلى تبويب **الإعدادات (Settings)**.
4. انزل إلى قسم **Conversions API (واجهة برمجة تطبيقات التحويلات)**.
5. تحت خيار "الإعداد اليدوي"، اضغط على **إنشاء رمز وصول (Generate access token)**.
6. انسخ التوكن والصقه في متغير `META_ACCESS_TOKEN` في Vercel.

---

## 🚀 كيفية استخدام هذا النظام في أي مشروع آخر

1. انسخ مجلد `components/analytics/MetaPixel.tsx`.
2. انسخ ملف `lib/metaPixel.ts`.
3. انسخ مسار الخادم `app/api/meta-capi/route.ts`.
4. في صفحة إنهاء الطلب أو صفحة الشكر، أرسل بيانات الشراء مع `order_id` موحد لكلا المسارين.
5. ضع البيكسل ID وتوكن الـ CAPI في متغيرات البيئة.
6. انتهى! ستحصل على نسبة دقة 100% في تتبع المبيعات.

