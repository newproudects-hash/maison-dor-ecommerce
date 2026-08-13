import { getImageUrl } from './client';
import type { Product } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

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

  const images: AnyObj[] = Array.isArray(p.images) ? p.images : [];

  return {
    id: String(p._id || ''),
    name: getName(p.title),
    price: Number(p.price) || 0,
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
    image: images.length > 0 ? (getImageUrl(images[0]) || '/hero.jpg') : '/hero.jpg',
    images: images.length > 0 ? images.map((img) => getImageUrl(img) || '/hero.jpg') : ['/hero.jpg'],
    category: (p.category as AnyObj)?.slug || 'sacs',
    slug: String(p.slug || ''),
    description: getDesc(p.description),
    colors: Array.isArray(p.colors) ? (p.colors as string[]) : [],
    sizes: Array.isArray(p.sizes) ? (p.sizes as string[]) : [],
    placement: Array.isArray(p.placement) ? (p.placement as string[]) : [],
    inStock: p.inStock !== false,
  };
}
