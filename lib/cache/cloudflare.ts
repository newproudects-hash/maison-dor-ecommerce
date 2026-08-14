/**
 * lib/cache/cloudflare.ts
 * ==========================================
 * أداة مسح كاش Cloudflare عند تحديث المحتوى
 *
 * الاستخدام:
 *   await purgeCloudflareByTags(['product-pages', 'home-page']);
 *   await purgeCloudflareByUrls(['https://maisondor.dz/produits/tomi']);
 *
 * ملاحظة: إذا لم تُضبط متغيرات Cloudflare، تُتجاهل العملية بأمان
 */

const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_BASE = `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/cache/purge`;

// ─── مسح الكاش بالـ Tags (الأسرع والأذكى) ───────────────────────────────────
export async function purgeCloudflareByTags(tags: string[]): Promise<boolean> {
  if (!CF_ZONE_ID || !CF_API_TOKEN || tags.length === 0) return false;

  try {
    const res = await fetch(CF_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
      cache: 'no-store',
    });
    const json = await res.json() as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

// ─── مسح الكاش بالـ URLs المحددة ─────────────────────────────────────────────
export async function purgeCloudflareByUrls(urls: string[]): Promise<boolean> {
  if (!CF_ZONE_ID || !CF_API_TOKEN || urls.length === 0) return false;

  try {
    const res = await fetch(CF_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: urls }),
      cache: 'no-store',
    });
    const json = await res.json() as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

// ─── مسح كاش كل الموقع (استخدم بحذر!) ────────────────────────────────────────
export async function purgeAllCloudflareCache(): Promise<boolean> {
  if (!CF_ZONE_ID || !CF_API_TOKEN) return false;

  try {
    const res = await fetch(CF_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ purge_everything: true }),
      cache: 'no-store',
    });
    const json = await res.json() as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
