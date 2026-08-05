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
  isNewArrival: boolean;
  isFeatured: boolean;
  category: { _id: string; title: string; slug: string };
};

export function mapSanityProduct(p: SanityProduct) {
  return {
    id: p._id,
    name: p.title,
    price: p.price,
    image: p.images && p.images.length > 0 ? getImageUrl(p.images[0]) : 'https://picsum.photos/seed/placeholder/400/500',
    category: p.category?.slug || 'sacs',
    slug: p.slug,
    description: p.description || '',
    colors: p.colors || [],
    sizes: p.sizes || [],
  };
}
