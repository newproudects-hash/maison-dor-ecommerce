import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, getRelatedProducts } from '@/lib/sanity/queries';
import { mapSanityProduct } from '@/lib/sanity/mapper';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 3600;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lamaisondor.online';
  try {
    const raw = await getProduct(decodeURIComponent(slug));
    if (!raw) return { title: 'Produit introuvable' };
    const product = mapSanityProduct(raw);
    return {
      title: `${product.name} — MAISON D'OR`,
      description: product.description || `Découvrez ${product.name} chez MAISON D'OR. Livraison rapide.`,
      openGraph: {
        title: `${product.name} | MAISON D'OR`,
        description: product.description || '',
        url: `${baseUrl}/produits/${slug}`,
        images: [{ url: product.image }],
      },
    };
  } catch {
    return { title: "MAISON D'OR" };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  let raw: unknown = null;
  try {
    raw = await getProduct(decodedSlug);
    // Extra fallback: if slug looks like a Sanity _id, search by _id directly
    if (!raw && /^[a-z0-9-]{20,}$/.test(decodedSlug)) {
      raw = await getProduct(decodedSlug);
    }
  } catch {
    // fall through to notFound
  }

  if (!raw) return notFound();

  const product = mapSanityProduct(raw);

  // Get related products
  let related: ReturnType<typeof mapSanityProduct>[] = [];
  try {
    const rawRelated = await getRelatedProducts(product.id, product.id);
    related = Array.isArray(rawRelated) ? rawRelated.map(mapSanityProduct) : [];
  } catch {
    // silent fail - related products are optional
  }

  return <ProductDetailClient product={product} related={related} />;
}
