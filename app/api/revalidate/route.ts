/**
 * app/api/revalidate/route.ts
 * ==========================================
 * Webhook handler — يستقبل إشارات من Sanity عند تحديث المحتوى
 * ويمسح الكاش في: Next.js + Redis + Cloudflare
 *
 * إعداد Sanity Webhook:
 *   URL: https://www.maisondor.dz/api/revalidate
 *   Method: POST
 *   Trigger on: create, update, delete
 *   Header: x-webhook-secret = [SANITY_WEBHOOK_SECRET]
 */

import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { invalidateCache } from '@/lib/cache/redis';
import { purgeCloudflareByTags, purgeCloudflareByUrls } from '@/lib/cache/cloudflare';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.maisondor.dz';

// التحقق من هوية الطلب (أنه قادم من Sanity وليس من هاكر)
function isValidRequest(req: Request): boolean {
  const secret = req.headers.get('x-webhook-secret');
  const expectedSecret = process.env.SANITY_WEBHOOK_SECRET;
  if (!expectedSecret) return true; // إذا لم يُضبط السر، نقبل الطلب (بيئة تطوير)
  return secret === expectedSecret;
}

export async function POST(req: Request) {
  // 1. التحقق من هوية الطلب
  if (!isValidRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const docType = body._type as string | undefined;
  const slug = (body.slug as { current?: string } | undefined)?.current;

  const nextTags: string[] = [];
  const redisCacheKeys: string[] = [];
  const cloudflareUrls: string[] = [];
  const cloudflareTags: string[] = [];

  // ─── منتج تم تحديثه ─────────────────────────────────────────────────────
  if (docType === 'product') {
    if (slug) {
      nextTags.push(`product-${slug}`);
      redisCacheKeys.push(`product:${slug}`, `related:${slug}`);
      cloudflareUrls.push(`${APP_URL}/produits/${slug}`);
    }
    // أعد تحميل صفحة البوتيك لأن قائمة المنتجات تغيرت
    nextTags.push('products-list');
    revalidatePath('/boutique');
    revalidatePath('/');
    cloudflareUrls.push(`${APP_URL}/boutique`, `${APP_URL}/`);
    cloudflareTags.push('product-pages', 'home-page');
  }

  // ─── قسم (category) تم تحديثه ───────────────────────────────────────────
  if (docType === 'category') {
    nextTags.push('categories');
    redisCacheKeys.push('categories');
    revalidatePath('/boutique');
    revalidatePath('/');
    cloudflareUrls.push(`${APP_URL}/boutique`, `${APP_URL}/`);
    cloudflareTags.push('boutique-pages', 'home-page');
  }

  // ─── الصفحة الرئيسية تم تحديثها ─────────────────────────────────────────
  if (docType === 'homePage') {
    nextTags.push('home-settings');
    revalidatePath('/');
    cloudflareUrls.push(`${APP_URL}/`);
    cloudflareTags.push('home-page');
  }

  // ─── تطبيق إعادة التحقق في Next.js ──────────────────────────────────────
  for (const tag of nextTags) {
    revalidateTag(tag);
  }
  if (slug) revalidatePath(`/produits/${slug}`);

  // ─── مسح Redis و Cloudflare بالتوازي ────────────────────────────────────
  const [redisResult, cfTagsResult, cfUrlsResult] = await Promise.allSettled([
    invalidateCache(...redisCacheKeys),
    purgeCloudflareByTags(cloudflareTags),
    purgeCloudflareByUrls(cloudflareUrls),
  ]);

  return NextResponse.json({
    success: true,
    revalidated: {
      type: docType,
      slug: slug || null,
      nextTags,
      redisCacheKeys,
      cloudflare: {
        tags: cfTagsResult.status === 'fulfilled' ? cfTagsResult.value : false,
        urls: cfUrlsResult.status === 'fulfilled' ? cfUrlsResult.value : false,
      },
      redis: redisResult.status === 'fulfilled',
    },
  });
}

// صفحة اختبار بسيطة — تأكد أن الـ Webhook يعمل
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/revalidate',
    description: 'Sanity → Next.js + Redis + Cloudflare cache invalidation webhook',
    cloudflareConfigured: !!(process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN),
    redisConfigured: !!(process.env.UPSTASH_REDIS_REST_URL_1),
    sanitySecretConfigured: !!(process.env.SANITY_WEBHOOK_SECRET),
  });
}
