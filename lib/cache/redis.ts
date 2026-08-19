/**
 * lib/cache/redis.ts
 * ==========================================
 * نظام Redis المزدوج مع توزيع الضغط (Sharding)
 * يدعم حتى 4 حسابات Upstash مجانية = 40,000 طلب/يوم
 *
 * الاستخدام:
 *   const data = await getOrFetch('product:tomi', () => fetchFromSanity(), 3600);
 * ملاحظة: إذا لم تُضبط متغيرات Redis، يعمل النظام بدونها (graceful fallback)
 */

import crypto from 'crypto';

type RedisClient = {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: string, options?: { ex: number }) => Promise<unknown>;
  del: (...keys: string[]) => Promise<unknown>;
};

// ─── بناء عميل Upstash بسيط بدون مكتبة خارجية (HTTP REST API) ───────────────
function createUpstashClient(url: string, token: string): RedisClient {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const call = async (command: unknown[]) => {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(command),
      // لا تحفظ هذه الطلبات في كاش Next.js
      cache: 'no-store',
    });
    const json = await res.json() as { result?: unknown };
    return json.result;
  };

  return {
    get: (key) => call(['GET', key]),
    set: (key, value, opts) =>
      opts?.ex ? call(['SET', key, value, 'EX', opts.ex]) : call(['SET', key, value]),
    del: (...keys) => call(['DEL', ...keys]),
  };
}

// ─── إنشاء قائمة العملاء بناءً على المتغيرات المتاحة ─────────────────────────
function buildClients(): RedisClient[] {
  const clients: RedisClient[] = [];

  const configs = [
    { url: process.env.UPSTASH_REDIS_REST_URL_1, token: process.env.UPSTASH_REDIS_REST_TOKEN_1 },
    { url: process.env.UPSTASH_REDIS_REST_URL_2, token: process.env.UPSTASH_REDIS_REST_TOKEN_2 },
    { url: process.env.UPSTASH_REDIS_REST_URL_3, token: process.env.UPSTASH_REDIS_REST_TOKEN_3 },
    { url: process.env.UPSTASH_REDIS_REST_URL_4, token: process.env.UPSTASH_REDIS_REST_TOKEN_4 },
  ];

  for (const { url, token } of configs) {
    if (url && token) clients.push(createUpstashClient(url, token));
  }

  return clients;
}

const clients = buildClients();
const isEnabled = clients.length > 0;

// ─── خوارزمية Consistent Hashing لتوزيع الضغط ───────────────────────────────
function getClient(key: string): RedisClient | null {
  if (!isEnabled) return null;
  // FIX #41: Proper hashing for distribution instead of sum of ASCII
  const hashString = crypto.createHash('md5').update(key).digest('hex');
  const hash = parseInt(hashString.slice(0, 8), 16);
  return clients[hash % clients.length];
}

// ─── القراءة من الكاش ────────────────────────────────────────────────────────
export async function getFromCache<T>(key: string): Promise<T | null> {
  const client = getClient(key);
  if (!client) return null;
  try {
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw as string) as T;
  } catch {
    return null; // فشل الكاش لا يوقف الموقع
  }
}

// ─── الكتابة في الكاش ─────────────────────────────────────────────────────────
export async function setCache<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  const client = getClient(key);
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch {
    // non-fatal
  }
}

// ─── مسح مفتاح أو مجموعة مفاتيح من كل الحسابات ──────────────────────────────
export async function invalidateCache(...keys: string[]): Promise<void> {
  if (!isEnabled || keys.length === 0) return;
  try {
    await Promise.allSettled(
      clients.map((client) => client.del(...keys))
    );
  } catch {
    // non-fatal
  }
}

// ─── الدالة الذكية: اقرأ من الكاش أو اجلب من المصدر وحفظ ────────────────────
// تحمي من Cache Stampede (تزاحم الطلبات على نفس البيانات)
const pendingFetches = new Map<string, Promise<unknown>>();

export async function getOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 3600
): Promise<T> {
  // 1. جرب الكاش أولاً
  const cached = await getFromCache<T>(key);
  if (cached !== null) return cached;

  // 2. إذا يوجد طلب معلق لنفس المفتاح، انتظر نتيجته
  if (pendingFetches.has(key)) {
    return pendingFetches.get(key) as Promise<T>;
  }

  // 3. أنشئ طلباً جديداً، احفظه كـ "معلق"
  const promise = fetcher()
    .then(async (data) => {
      // Don't cache empty results or data flagged as non-cacheable
      const shouldSkipCache =
        data === null ||
        data === undefined ||
        (data as Record<string, unknown>)?._nocache === true ||
        (Array.isArray(data) && data.length === 0) ||
        (typeof data === 'object' && !Array.isArray(data) && (data as Record<string, unknown>).products !== undefined && Array.isArray((data as Record<string, unknown>).products) && ((data as Record<string, unknown>).products as unknown[]).length === 0);

      if (!shouldSkipCache) {
        await setCache(key, data, ttlSeconds);
      }
      pendingFetches.delete(key);
      return data;
    })
    .catch((err) => {
      pendingFetches.delete(key);
      throw err;
    });

  pendingFetches.set(key, promise);
  return promise;
}

// ─── معلومات تشخيصية ─────────────────────────────────────────────────────────
export function getCacheStatus() {
  return {
    enabled: isEnabled,
    clientCount: clients.length,
    maxDailyRequests: clients.length * 10_000,
  };
}
