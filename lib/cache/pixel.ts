import { unstable_cache } from 'next/cache';

// ─── Uses the SAME HTTP-based Redis client pattern as lib/cache/redis.ts ───────
// No external @upstash/redis package needed — uses Upstash REST API directly

const redisUrl = process.env.UPSTASH_REDIS_REST_URL_1;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN_1;

async function redisFetch(commands: unknown[]): Promise<unknown> {
  if (!redisUrl || !redisToken) return null;
  const res = await fetch(redisUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });
  const json = await res.json() as { result?: unknown };
  return json.result;
}

export type ConversionEvent = 'Purchase' | 'Purchase_Confirmed' | 'Purchase_Delivered' | 'Lead';

export interface PixelConfig {
  pixelId: string;
  adAccountName?: string | null;
  accessToken?: string | null;
  testEventCode?: string | null;
  conversionEvent: ConversionEvent;
  testMode: boolean;
  enabled: boolean;
  updatedAt: string;
}

const PIXEL_CONFIG_KEY = 'store:pixel_config';

export const getPixelConfig = unstable_cache(
  async (): Promise<PixelConfig | null> => {
    if (!redisUrl || !redisToken) return null;
    try {
      const raw = await redisFetch(['GET', PIXEL_CONFIG_KEY]);
      if (!raw) return null;
      return typeof raw === 'string' ? JSON.parse(raw) as PixelConfig : raw as PixelConfig;
    } catch (error) {
      console.error('Error fetching pixel config from Redis:', error);
      return null;
    }
  },
  ['pixel-config-cache'],
  { tags: ['pixel-config'] }
);

export async function savePixelConfig(config: Partial<PixelConfig>): Promise<PixelConfig> {
  if (!redisUrl || !redisToken) throw new Error('Redis is not configured');

  let current: PixelConfig | null = null;
  try {
    const raw = await redisFetch(['GET', PIXEL_CONFIG_KEY]);
    if (raw) {
      current = typeof raw === 'string' ? JSON.parse(raw) as PixelConfig : raw as PixelConfig;
    }
  } catch { /* use defaults */ }

  const updated: PixelConfig = {
    pixelId: '',
    conversionEvent: 'Purchase',
    testMode: false,
    enabled: true,
    ...(current || {}),
    ...config,
    updatedAt: new Date().toISOString(),
  };

  await redisFetch(['SET', PIXEL_CONFIG_KEY, JSON.stringify(updated)]);
  return updated;
}
