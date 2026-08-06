import { getImageUrl } from './client';

export type SanityProduct = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  images: any[];
  colors: string[];
  sizes: string[];
  inStock: boolean;
  placement: string[];
  category: { _id: string; title: string; slug: string };
};

export function mapSanityProduct(p: SanityProduct) {
  // Extract correct language string (fallback: ar -> fr -> en)
  const getName = (titleObj: any) => typeof titleObj === 'string' ? titleObj : (titleObj?.ar || titleObj?.fr || titleObj?.en || 'بدون اسم');
  const getDesc = (descObj: any) => typeof descObj === 'string' ? descObj : (descObj?.ar || descObj?.fr || descObj?.en || '');

  return {
    id: p._id,
    name: getName(p.title),
    price: p.price,
    image: p.images && p.images.length > 0 ? getImageUrl(p.images[0]) : 'https://picsum.photos/seed/placeholder/400/500',
    category: p.category?.slug || 'sacs',
    slug: p.slug,
    description: getDesc(p.description),
    colors: p.colors || [],
    sizes: p.sizes || [],
    placement: p.placement || [],
  };
}
