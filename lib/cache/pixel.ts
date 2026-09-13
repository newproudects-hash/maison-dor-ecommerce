import { Redis } from '@upstash/redis';
import { unstable_cache } from 'next/cache';

// Use the first Redis instance for configuration
const redisUrl = process.env.UPSTASH_REDIS_REST_URL_1;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN_1;

let redis: Redis | null = null;

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
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
    if (!redis) return null;
    try {
      const data = await redis.get<PixelConfig>(PIXEL_CONFIG_KEY);
      return data || null;
    } catch (error) {
      console.error('Error fetching pixel config from Redis:', error);
      return null;
    }
  },
  ['pixel-config-cache'],
  { tags: ['pixel-config'] }
);

export async function savePixelConfig(config: Partial<PixelConfig>): Promise<PixelConfig> {
  if (!redis) throw new Error('Redis is not configured');
  
  const current = (await getPixelConfig()) || {
    pixelId: '',
    conversionEvent: 'Purchase',
    testMode: false,
    enabled: true,
    updatedAt: new Date().toISOString(),
  };

  const updated: PixelConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(PIXEL_CONFIG_KEY, updated);
  return updated;
}
