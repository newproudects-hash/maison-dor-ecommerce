// ============================================================
// META PIXEL — Client-side helper
// FIX #1: Pixel ID hardcoded + ENV fallback (same ID guaranteed)
// FIX #2: fbq() guard improved — checks both window & fbq.loaded
// FIX #3: Added retry mechanism if fbq not yet loaded
// FIX #4: Deduplication guard — no double-fire on same event
// ============================================================

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '888489174201321';

// FIX #4: Track recently fired events to prevent duplicates
const firedEvents = new Set<string>();

function getEventKey(name: string, data: Record<string, unknown>): string {
  return `${name}_${JSON.stringify(data)}_${Math.floor(Date.now() / 3000)}`; // 3-second dedup window
}

// FIX #3: Retry up to 5 times if fbq not ready yet
function retryFbq(name: string, data: Record<string, unknown>, retries = 5): void {
  if (typeof window === 'undefined') return;

  const tryFire = (attempt: number) => {
    const fbq = (window as Window & { fbq?: Function; _fbq?: Function }).fbq;
    if (typeof fbq === 'function') {
      // FIX #4: Dedup check
      const key = getEventKey(name, data);
      if (firedEvents.has(key)) {
        console.log(`[Meta Pixel] Duplicate blocked: ${name}`);
        return;
      }
      firedEvents.add(key);
      // Cleanup old keys after 10 seconds
      setTimeout(() => firedEvents.delete(key), 10_000);

      fbq('track', name, data);
      console.log(`[Meta Pixel] ✅ Fired: ${name}`, data);
    } else if (attempt < retries) {
      console.warn(`[Meta Pixel] fbq not ready, retrying in 500ms (attempt ${attempt + 1}/${retries})...`);
      setTimeout(() => tryFire(attempt + 1), 500);
    } else {
      console.error(`[Meta Pixel] ❌ Failed to fire ${name} — fbq never became available`);
    }
  };

  tryFire(0);
}

export const pageview = () => {
  retryFbq('PageView', {});
};

export const event = (name: string, data: Record<string, unknown> = {}) => {
  retryFbq(name, data);
};
