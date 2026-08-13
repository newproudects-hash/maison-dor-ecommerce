import { getImageUrl } from './client';
import type { Product } from '@/types';

export type SanityProduct = {
  _id: string;
  slug: string;
  title: string | { ar?: string; fr?: string; en?: string };
  description?: string | { ar?: string; fr?: string; en?: string };
  price: number;
  originalPrice?: number;
  images: any[];
  colors: string[];
  sizes: string[];
  inStock: boolean;
  placement: string[];
  category: { _id: string; title: string | { ar?: string; fr?: string; en?: string }; slug: string };
};

export function mapSanityProduct(p: SanityProduct): Product {
  // Extract correct language string (fallback: ar -> fr -> en)
  const getName = (titleObj: any) => typeof titleObj === 'string' ? titleObj : (titleObj?.ar || titleObj?.fr || titleObj?.en || 'Produit sans nom');
  const getDesc = (descObj: any) => typeof descObj === 'string' ? descObj : (descObj?.ar || descObj?.fr || descObj?.en || '');

  return {
    id: p._id,
    name: getName(p.title),
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.images && p.images.length > 0 ? getImageUrl(p.images[0]) : '/hero.jpg',
    images: p.images ? p.images.map(img => getImageUrl(img)) : ['/hero.jpg'],
    category: p.category?.slug || 'sacs',
    slug: p.slug,
    description: getDesc(p.description),
    colors: p.colors || [],
    sizes: p.sizes || [],
    placement: p.placement || [],
    inStock: p.inStock ?? true,
  };
}
