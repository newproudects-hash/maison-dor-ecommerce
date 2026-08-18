import { getImageUrl } from './client';
import type { Product } from '@/types';

// FIX #40: Use Record<string, unknown> instead of any for safe parsing
type AnyObj = Record<string, unknown>;

// Accept any value from GROQ results — we validate internally
export function mapSanityProduct(input: unknown): Product {
  const p = input as AnyObj;

  const getName = (obj: unknown): string => {
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') {
      const o = obj as Record<string, string>;
      return o.ar || o.fr || o.en || 'Produit sans nom';
    }
    return 'Produit sans nom';
  };

  const getDesc = (obj: unknown): string => {
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') {
      const o = obj as Record<string, string>;
      return o.ar || o.fr || o.en || '';
    }
    return '';
  };

  const rawSlug = String(p.slug || '');
  const images: AnyObj[] = Array.isArray(p.images) ? p.images : [];
  // If slug is empty, create one from the title as fallback to prevent 404
  const fallbackSlug = rawSlug || getName(p.title)
    .toLowerCase()
    .replace(/[\s\u0600-\u06FF]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || String(p._id || '');

  return {
    id: String(p._id || ''),
    name: getName(p.title),
    price: Number(p.price) || 0,
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
    image: images.length > 0 ? (getImageUrl(images[0]) || '/hero.jpg') : '/hero.jpg',
    images: images.length > 0 ? images.map((img) => getImageUrl(img) || '/hero.jpg') : ['/hero.jpg'],
    category: String((p.category as AnyObj)?.slug || 'sacs'),
    slug: fallbackSlug,
    description: getDesc(p.description),
    colors: Array.isArray(p.colors) ? (p.colors as string[]) : [],
    colorVariants: Array.isArray(p.colorVariants) ? p.colorVariants.map((v: unknown) => {
      const vObj = v as Record<string, unknown>;
      return {
        colorName: String(vObj?.colorName || ''),
        colorHex: vObj?.colorHex ? String(vObj.colorHex) : undefined,
        imageUrl: vObj?.imageUrl ? String(vObj.imageUrl) : undefined,
      };
    }) : [],
    sizes: Array.isArray(p.sizes) ? (p.sizes as string[]) : [],
    placement: Array.isArray(p.placement) ? (p.placement as string[]) : [],
    inStock: p.inStock !== false,
  };
}
