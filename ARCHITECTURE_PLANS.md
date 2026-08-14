# MAISON D'OR — خطط القوة المعمارية الكاملة
# Architecture Power Plans — Cache & Scale Engineering

**كُتب بتاريخ:** 2026-08-14  
**المشروع:** متجر Maison D'Or (Next.js 15 + Sanity + Supabase + Vercel)  
**الهدف:** تحمل 40,000 زائر يومياً مع الحفاظ على 0$ تكلفة أو أقل تكلفة ممكنة

---

> ⚠️ **ملاحظة المراجع الناقد (Critical Reviewer):**
> قبل قراءة الخطط، يجب أن تفهم حقيقة واحدة: لا يوجد نظام مجاني يضمن 40k زائر/يوم للأبد.
> القوة الحقيقية تأتي من تقليل ما يصل إلى قواعد البيانات إلى أدنى مستوى ممكن،
> وليس من استخدام عدد كبير من الأدوات. كثرة الأدوات = كثرة نقاط الفشل.

---

## المعلومات التي تحتاج أن تجهزها أنت

قبل البدء في تطبيق أي خطة، ستحتاج إلى التالي:

### ما تحتاجه للخطة الأولى (أبسط خطة)
```
□ حساب Cloudflare (مجاني) — موقع cloudflare.com
□ دومين مشترى من Namecheap أو أي مزود
□ متغيرات البيئة في Vercel:
  - NEXT_PUBLIC_SANITY_PROJECT_ID=4zyu7eeg
  - NEXT_PUBLIC_SANITY_DATASET=production
  - SANITY_API_TOKEN=...
  - NEXT_PUBLIC_SUPABASE_URL=...
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  - SUPABASE_SERVICE_ROLE_KEY=...
  - ADMIN_EMAIL=...
  - ADMIN_PASSWORD=...
  - ADMIN_SECRET_TOKEN=...
```

### ما تحتاجه للخطة الثانية والثالثة (نظام Redis)
```
□ حساب Upstash Redis #1 (مجاني) — upstash.com
  - احفظ: UPSTASH_REDIS_REST_URL_1
  - احفظ: UPSTASH_REDIS_REST_TOKEN_1
□ حساب Upstash Redis #2 (مجاني) — حساب إيميل مختلف في upstash.com
  - احفظ: UPSTASH_REDIS_REST_URL_2
  - احفظ: UPSTASH_REDIS_REST_TOKEN_2
```

### ما تحتاجه للخطة الرابعة (Cloudflare Full Cache)
```
□ كل ما سبق +
□ Cloudflare Account Token (للـ Webhooks)
□ Cloudflare Zone ID (يوجد في Dashboard الدومين)
□ Sanity Webhook Secret (من Sanity → API → Webhooks)
```

---

## الخطة الأولى: "القاعدة الصلبة"
### **ISR + Vercel Edge Cache + Cloudflare Static Assets**
**المستوى:** ✅ مناسب الآن | **التكلفة:** $0/شهر

### كيف تعمل:
```
زائر
  ↓
Cloudflare [يحجب Bots، يرسل الصور/CSS/JS من CDNه]
  ↓ (صفحات HTML فقط)
Vercel Edge Cache [الصفحة محفوظة لمدة revalidate ثانية]
  ↓ (عند انتهاء الكاش فقط)
Next.js Server → يسأل Sanity
  ↓
يرجع الصفحة → Vercel يحفظها → يرسلها لـ Cloudflare → للزائر
```

### ما الذي سيتغير في الكود:

**1. `next.config.ts` — ضبط Headers للكاش:**
```typescript
// يُضاف داخل nextConfig
async headers() {
  return [
    {
      // صفحات المنتجات: كاش قوي
      source: '/produits/:slug*',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        { key: 'Vary', value: 'Accept-Encoding' },
      ],
    },
    {
      // صفحة البوتيك والأقسام: كاش متوسط
      source: '/boutique/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=1800, stale-while-revalidate=43200' },
      ],
    },
    {
      // الصفحة الرئيسية: كاش قوي
      source: '/',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
      ],
    },
    {
      // API العام (categories): كاش
      source: '/api/categories',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
      ],
    },
    {
      // API الطلبات: لا كاش أبداً (بيانات حساسة)
      source: '/api/orders',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache' },
      ],
    },
    {
      // صفحات الأدمن: لا كاش أبداً
      source: '/admin/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, private' },
      ],
    },
  ];
},
```

**2. `lib/sanity/queries.ts` — ضبط revalidate في كل fetch:**
```typescript
// جلب منتج واحد — كاش ساعة كاملة
const bySlug = await sanityClient.fetch(
  `*[_type == "product" && slug.current == $slug][0] { ${PRODUCT_FIELDS} }`,
  { slug: decodedSlug },
  { next: { revalidate: 3600, tags: [`product-${decodedSlug}`] } }
);

// جلب كل المنتجات — كاش 30 دقيقة
// جلب الأقسام — كاش ساعتين
```

**3. إعدادات Cloudflare (يدوياً من Dashboard):**
- Caching → Configuration → Browser Cache TTL → 4 hours
- Rules → Cache Rules: Static Assets (CSS, JS, Images) → Cache Everything

### ما يتحمله هذا النظام (بصدق):
| الموردة | الشهري | اليومي (تقريب) |
|---------|---------|----------------|
| Vercel Bandwidth | ~100 GB | ~3.3 GB |
| Sanity API Requests | مئات الآلاف | بضع مئات فقط (الكاش!) |
| Cloudflare Requests | لا نهائي | لا نهائي |
| **زوار يصلون لـ Vercel** | ~200,000-250,000 | ~7,000-8,000 |
| **زوار إجمالي (مع Cloudflare)** | ~350,000-400,000 | ~12,000-15,000 |

> 🔴 **انتقاد المراجع:** هذه الخطة تعتمد على Vercel كـ bottleneck.
> إذا كان 40,000 شخص يدخلون كل يوم وـ 30% فقط يصلون لـ Vercel، هذا 12,000 طلب/يوم لـ Vercel.
> الـ 100 GB ستنفد في أقل من 20 يوم بافتراض أن الصفحة 300 كيلوبايت.

---

## الخطة الثانية: "الطبقة الثانية" 
### **ISR + 2x Redis Sharding + Cloudflare**
**المستوى:** ✅✅ قوي | **التكلفة:** $0/شهر

### كيف تعمل:
```
زائر
  ↓
Cloudflare [CDN + Bot Protection + صور/CSS/JS cached]
  ↓ (HTML فقط)
Vercel Edge Cache [محفوظ محلياً]
  ↓ (عند انتهاء الكاش أو طلب جديد)
Redis Layer [حسابان Upstash — يقرؤون البيانات بدل Sanity]
  ↓ (فقط عند عدم وجود البيانات في Redis)
Sanity / Supabase
  ↓
يُحفظ في Redis → يُرسل لـ Vercel → للزائر
```

### الكود الجديد المطلوب:

**[NEW] `lib/cache/redis.ts` — نظام Redis المزدوج:**
```typescript
import { Redis } from '@upstash/redis';

// حساب Redis الأول
const redis1 = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL_1!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN_1!,
});

// حساب Redis الثاني
const redis2 = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL_2!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN_2!,
});

// خوارزمية توزيع الضغط — كل slug يختار حساباً ثابتاً
function getRedisClient(key: string): Redis {
  const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % 2 === 0 ? redis1 : redis2;
}

// قراءة من الكاش
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient(key);
    const data = await client.get(key);
    return data as T | null;
  } catch {
    return null; // فشل الكاش لا يوقف الموقع
  }
}

// كتابة في الكاش
export async function setCache<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  try {
    const client = getRedisClient(key);
    await client.setex(key, ttlSeconds, value as string);
  } catch {
    // فشل الكتابة لا يوقف الموقع
  }
}

// مسح الكاش (عند تحديث Sanity)
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    await Promise.allSettled([
      redis1.del(pattern),
      redis2.del(pattern),
    ]);
  } catch {
    // non-fatal
  }
}
```

**[MODIFY] `lib/sanity/queries.ts` — يمر على Redis أولاً:**
```typescript
import { getFromCache, setCache } from '@/lib/cache/redis';

export async function getProduct(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const cacheKey = `product:${decodedSlug}`;

  // 1. جرب الكاش أولاً (Redis)
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  // 2. اسأل Sanity فقط إذا لم يجد في الكاش
  const product = await sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug][0] { ${PRODUCT_FIELDS} }`,
    { slug: decodedSlug },
    { next: { revalidate: 3600, tags: [`product-${decodedSlug}`] } }
  );

  // 3. احفظ في Redis للمرة القادمة
  if (product) await setCache(cacheKey, product, 7200); // ساعتين

  return product || null;
}
```

### ما يتحمله هذا النظام:
| الموردة | الشهري | اليومي |
|---------|---------|--------|
| Redis Requests (حسابان) | 20,000/يوم × 30 = 600,000 | 20,000 طلب |
| Vercel Bandwidth | ~60-70 GB | ~2 GB (أقل بسبب Redis) |
| Sanity API | بضع عشرات | 10-20 طلب فقط |
| **زوار إجمالي** | ~500,000-600,000 | **~18,000-20,000** |

> 🔴 **انتقاد المراجع:** لا تزال مشكلة: حد Redis المجاني هو 10,000 طلب/يوم لكل حساب.
> إذا كل زائر يفتح 3 صفحات = 3 طلبات Redis. 20,000 طلب تكفي لـ 6,666 زائر.
> الحل الحقيقي ليس في Redis ولكن في Cloudflare Full Page Cache!

---

## الخطة الثالثة: "قلعة الكاش"
### **Cloudflare Full Page Cache + ISR + Redis**
**المستوى:** ✅✅✅ قوي جداً | **التكلفة:** $0/شهر

### الفكرة الجوهرية:
نأمر Cloudflare بأن يحفظ **صفحات الـ HTML كاملة** وليس فقط الملفات الثابتة.
هذا يعني أن 95% من الزوار **لن يصلوا إلى Vercel أبداً**.

### كيف تعمل:
```
زائر → maisondor.dz/produits/tomi-watch
  ↓
Cloudflare يبحث في كاشه عن هذه الصفحة
  ├─ إذا وجدها (CACHE HIT): يرسلها فوراً ← لا يصل شيء لـ Vercel
  └─ إذا لم يجدها (CACHE MISS): يمرر الطلب لـ Vercel
       ↓
     Vercel يجيب
       ↓ (في الطريق العودة)
     Cloudflare يحفظ الـ HTML في كاشه
       ↓ الـ 10,000 زائر القادم → CACHE HIT من Cloudflare
```

### ما الكود المطلوب لجعل هذا يعمل:

**مشكلة:** Cloudflare لا يحفظ الصفحات الديناميكية افتراضياً.
**الحل:** نضيف Header خاصاً في كل Response يخبر Cloudflare بحفظ الصفحة.

**[MODIFY] `next.config.ts`:**
```typescript
async headers() {
  return [
    {
      source: '/produits/:slug*',
      headers: [
        // s-maxage يخبر Cloudflare بالحفظ لمدة 4 ساعات
        // stale-while-revalidate يخلي Cloudflare يرد بالنسخة القديمة بينما يجدد
        { key: 'Cache-Control', value: 'public, s-maxage=14400, stale-while-revalidate=86400' },
        // Cloudflare Cache Tag لمسح كاش منتج معين عند تحديثه
        { key: 'Cache-Tag', value: 'product-pages' },
      ],
    },
    {
      source: '/',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=14400, stale-while-revalidate=86400' },
        { key: 'Cache-Tag', value: 'home-page' },
      ],
    },
    {
      source: '/boutique/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=7200, stale-while-revalidate=43200' },
        { key: 'Cache-Tag', value: 'boutique-pages' },
      ],
    },
    // ——— لا كاش لهذه الصفحات أبداً ———
    {
      source: '/api/orders',
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    },
    {
      source: '/admin/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-store, private' }],
    },
    {
      source: '/commander',
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    },
  ];
},
```

**إعداد Cloudflare (يدوياً):**
```
1. Cloudflare Dashboard → اختر دومينك
2. Rules → Cache Rules → Create Rule
3. اسم القاعدة: "Cache All HTML Pages"
4. الشرط: hostname = maisondor.dz
   AND path لا يحتوي على: /api OR /admin OR /commander OR /studio
5. الإجراء: Cache Eligibility = Eligible for Cache
6. احفظ القاعدة
```

**[NEW] `app/api/revalidate/route.ts` — لمسح كاش Cloudflare عند تحديث Sanity:**
```typescript
import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  // التحقق من أن الطلب قادم من Sanity
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { _type, slug } = body;

  try {
    // 1. مسح كاش Next.js
    if (_type === 'product' && slug?.current) {
      revalidateTag(`product-${slug.current}`);
      revalidatePath(`/produits/${slug.current}`);
    }
    if (_type === 'category') {
      revalidateTag('categories');
      revalidatePath('/boutique');
    }
    revalidatePath('/');

    // 2. مسح كاش Cloudflare (إذا لديك API Token)
    if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID) {
      const tags = _type === 'product' ? ['product-pages'] : ['boutique-pages', 'home-page'];
      await fetch(
        `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/cache/purge`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tags }),
        }
      );
    }

    return NextResponse.json({ success: true, revalidated: _type });
  } catch (error) {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
```

### ما يتحمله هذا النظام:
| الموردة | الشهري | اليومي |
|---------|---------|--------|
| Cloudflare Requests | لا نهائي | لا نهائي |
| Vercel Bandwidth (95% محمي!) | ~10-20 GB فقط | ~500 MB |
| Sanity API | بضع عشرات | 5-10 طلب |
| Redis | للأشياء الديناميكية فقط | أقل من 1,000 |
| **زوار إجمالي** | **لا نهائي تقريباً** | **40,000+ بدون مشكلة** |

> 🔴 **انتقاد المراجع:** ممتاز. لكن فيها نقطة ضعف واحدة:
> "الزائر الأول" لكل صفحة جديدة سيصل لـ Vercel. إذا عندك 1000 منتج وكل منتج
> طلبه 5 أشخاص في نفس الوقت أول مرة، الـ 5000 طلب ستصل لـ Vercel في نفس الوقت (Cache Stampede).
> الخطة الرابعة تحل هذه المشكلة.

---

## الخطة الرابعة: "المنصة الحصينة"
### **Cloudflare Full Cache + ISR + Redis + Cache Stampede Protection + Browser Cache**
**المستوى:** ✅✅✅✅ وحش | **التكلفة:** $0-20/شهر

### ما يُضاف في هذه الخطة فوق الخطة الثالثة:

**1. Browser Cache (كاش المتصفح) — التحكم الكامل:**
```typescript
// في next.config.ts — ضبط كاش المتصفح لعناصر ثابتة
async headers() {
  return [
    // ... (نفس ما سبق) +
    {
      // الصور الثابتة في /public — كاش سنة كاملة
      source: '/(.*).(jpg|jpeg|png|webp|svg|ico)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      // ملفات JavaScript و CSS — كاش سنة (Next.js يغير اسمها عند كل تعديل)
      source: '/_next/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ];
},
```

**2. Cache Stampede Protection — منع الانهيار عند أول طلب:**
```typescript
// في lib/cache/redis.ts — إضافة "قفل" لمنع الازدحام
const pendingRequests = new Map<string, Promise<unknown>>();

export async function getOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  // 1. تحقق من الكاش أولاً
  const cached = await getFromCache<T>(key);
  if (cached) return cached;

  // 2. إذا يوجد طلب معلق لنفس المفتاح، انتظر نتيجته (لا تضاعف الطلبات)
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  // 3. أنشئ الطلب واحفظه كـ "معلق"
  const fetchPromise = fetcher().then(async (data) => {
    if (data) await setCache(key, data, ttl);
    pendingRequests.delete(key);
    return data;
  }).catch((err) => {
    pendingRequests.delete(key);
    throw err;
  });

  pendingRequests.set(key, fetchPromise);
  return fetchPromise;
}
```

**3. كاش المتصفح لسلة التسوق (Zustand Persist):**
```typescript
// lib/store/cartStore.ts — سلة التسوق تُحفظ في localStorage
// لا تصل إلى الـ Server أبداً
import { persist } from 'zustand/middleware';

// يجب أن تكون السلة محفوظة في localStorage وليس في Redis
// هذا يعني 0 طلبات سيرفر لقراءة السلة
```

**4. اختبار الأداء (Load Testing) — قبل الإطلاق:**
```bash
# استخدم أداة k6 المجانية لاختبار الموقع
# من موقع k6.io — اختبر قبل الإطلاق الحقيقي

# محاكاة 100 مستخدم في نفس الوقت:
k6 run --vus 100 --duration 30s load-test.js
```

### ما يتحمله هذا النظام (الأرقام النهائية):
| الموردة | الشهري | اليومي | ملاحظة |
|---------|---------|--------|---------|
| Cloudflare | ∞ | ∞ | مجاني للأبد |
| Vercel Bandwidth | ~5-15 GB | ~200-500 MB | 95%+ محمي بـ CF |
| Sanity | بضع طلبات | < 20 طلب | الكاش يمنع الوصول |
| Supabase | طلبات الطلبات فقط | حسب المبيعات | لا قراءة غير ضرورية |
| Redis (حسابان) | 600,000 طلب | 20,000 طلب | للـ miss cache فقط |
| **إجمالي الزوار** | **1,000,000+** | **40,000-100,000** | ✅ |

---

## مقارنة الخطط الأربع

| الخطة | التكلفة | الزوار/يوم | التعقيد | متى تستخدمها |
|-------|---------|------------|---------|--------------|
| 1️⃣ القاعدة الصلبة | $0 | ~10,000 | بسيط | الآن |
| 2️⃣ الطبقة الثانية | $0 | ~20,000 | متوسط | بعد أول 1000 طلب |
| 3️⃣ قلعة الكاش | $0 | ~40,000+ | متقدم | عند الإطلاق الرسمي |
| 4️⃣ المنصة الحصينة | $0-20 | ~100,000+ | عالي | عند النجاح التجاري |

---

## التسلسل المنطقي للتطبيق

```
المرحلة 1 (الآن):
□ طبق Cloudflare DNS على الدومين
□ فعّل Cache Rules في Cloudflare
□ ضبط Cache-Control Headers في next.config.ts
□ تأكد أن سلة التسوق في Zustand Persist (localStorage)

المرحلة 2 (عند التحقق من العمل):
□ أنشئ حسابي Upstash Redis
□ أضف متغيرات البيئة في Vercel
□ نفذ كود lib/cache/redis.ts
□ عدّل queries.ts لتمر على Redis أولاً

المرحلة 3 (عند الإطلاق الرسمي):
□ أنشئ app/api/revalidate/route.ts
□ أضف Sanity Webhook يضرب هذا الـ API
□ أضف Cache-Tag Headers لـ Cloudflare
□ اختبر النظام بـ k6 أو Postman
```

---

## متغيرات البيئة الكاملة المطلوبة

```env
# ─── Sanity ───────────────────────────────────
NEXT_PUBLIC_SANITY_PROJECT_ID=4zyu7eeg
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token
SANITY_WEBHOOK_SECRET=random_secret_string_32_chars

# ─── Supabase ─────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ─── Redis (الخطة 2 والما فوق) ────────────────
UPSTASH_REDIS_REST_URL_1=https://xxx-1.upstash.io
UPSTASH_REDIS_REST_TOKEN_1=your_token_1
UPSTASH_REDIS_REST_URL_2=https://xxx-2.upstash.io
UPSTASH_REDIS_REST_TOKEN_2=your_token_2

# ─── Cloudflare (الخطة 3 والما فوق) ──────────
CLOUDFLARE_API_TOKEN=your_cf_api_token
CLOUDFLARE_ZONE_ID=your_zone_id

# ─── Google Sheets ────────────────────────────
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY="..."
GOOGLE_SHEET_ID=...

# ─── Admin ────────────────────────────────────
ADMIN_EMAIL=admin@maisondor.dz
ADMIN_PASSWORD=your_strong_password
ADMIN_SECRET_TOKEN=your_secret_token_48_chars

# ─── App ──────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://www.maisondor.dz
NODE_ENV=production
```

---

> ✅ **الخلاصة النهائية من المراجع الناقد:**
> الخطة الثالثة (قلعة الكاش) هي الحل الأمثل لـ 40,000 زائر/يوم بـ $0.
> السر في "Cloudflare Cache Everything" وليس في كثرة الأدوات.
> Redis جيد لكنه ليس السلاح الأساسي — Cloudflare هو السلاح الأساسي.
> ابدأ بالخطة الأولى، قيّم الأداء، ثم انتقل للثالثة عند الإطلاق.
