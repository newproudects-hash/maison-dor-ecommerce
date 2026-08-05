/*
 * ACTIVE SKILLS: supermemory (credentials saved)
 * Sanity Project: 4ryu7eeg | Dataset: product
 */
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
type SanityImageSource = Parameters<ReturnType<typeof createImageUrlBuilder>['image']>[0];

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-01-01',
  useCdn: process.env.NODE_ENV === 'production', // CDN in production for speed
  token: process.env.SANITY_API_TOKEN,
});

// Image URL Builder
const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// Helper to get max quality optimized WebP images
export function getImageUrl(source: any, width: number = 800): string {
  return urlFor(source)
    .width(width)
    .quality(95)        // High luxury quality
    .format('webp')     // Best compression
    .url();
}
