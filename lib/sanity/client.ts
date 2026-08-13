/*
 * Sanity Project: 4zyu7eeg | Dataset: production
 */
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '4zyu7eeg';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
});

import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Image URL Builder
const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Helper to get max quality optimized WebP images
export function getImageUrl(source: SanityImageSource, width: number = 800): string {
  if (!source) return '';
  try {
    return urlFor(source)
      .width(width)
      .quality(95)
      .format('webp')
      .url();
  } catch {
    return '';
  }
}
