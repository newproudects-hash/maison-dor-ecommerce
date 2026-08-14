import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import ProductGallery from '@/components/product/ProductGallery';
import ProductClient from '@/components/product/ProductClient';
import ProductCard from '@/components/ui/ProductCard';
import { getProduct, getRelatedProducts } from '@/lib/sanity/queries';
import { mapSanityProduct } from '@/lib/sanity/mapper';

export const revalidate = 60;

// Dynamic SEO metadata per product
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.maisondor.dz';
  try {
    const raw = await getProduct(slug);
    if (!raw) return { title: 'Produit introuvable' };
    const p = mapSanityProduct(raw);
    return {
      title: p.name,
      description: p.description || `${p.name} — ${p.price.toLocaleString('fr-DZ')} DA. Livraison partout en Algérie.`,
      openGraph: {
        title: `${p.name} | MAISON D'OR`,
        description: p.description || `Disponible à ${p.price.toLocaleString('fr-DZ')} DA`,
        images: [{ url: p.image, alt: p.name }],
        url: `${baseUrl}/produits/${slug}`,
      },
    };
  } catch {
    return { title: "MAISON D'OR" };
  }
}


export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let rawProduct: unknown = null;
  try {
    rawProduct = await getProduct(slug);
  } catch {
    // Silent fail
  }

  if (!rawProduct) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Navbar />
        <p className="text-neutral-500 text-lg mt-20">Produit introuvable.</p>
        <Link href="/boutique" className="text-sm underline text-neutral-700">Retour à la boutique</Link>
      </main>
    );
  }

  const product = mapSanityProduct(rawProduct);
  let related: ReturnType<typeof mapSanityProduct>[] = [];
  try {
    const rp = rawProduct as Record<string, any>;
    const rawRelated = await getRelatedProducts(rp.category?._id, rp._id);
    related = rawRelated.map(mapSanityProduct);
  } catch {
    // Non-fatal — related products are optional
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.maisondor.dz';

  // JSON-LD structured data for Google Shopping
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    url: `${baseUrl}/produits/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'DZD',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: "MAISON D'OR" },
    },
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* JSON-LD structured data for Google Shopping */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <div className="pt-16 max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 py-5">
          <Link href="/" className="hover:text-neutral-700 transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/boutique" className="hover:text-neutral-700 transition-colors">Boutique</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/boutique/${product.category}`} className="hover:text-neutral-700 transition-colors capitalize">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-700 font-semibold">{product.name}</span>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pb-16">
          {/* Image Gallery */}
          <ProductGallery images={product.images && product.images.length > 0 ? product.images : [product.image]} alt={product.name} />

          {/* Info */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <p className="text-amber-600 text-xs tracking-[0.25em] uppercase font-bold mb-2 capitalize">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-neutral-900 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2 mt-3">
              </div>
            </div>

            <p className="text-4xl font-black text-neutral-900">{product.price.toLocaleString('fr-DZ')} <span className="text-2xl font-bold text-neutral-500">DA</span></p>

            <p className="text-neutral-500 text-sm leading-relaxed">{product.description}</p>

            {/* Client Component for Variant Selection and Add to Cart */}
            <ProductClient product={product} />

            {/* Delivery info */}
            <div className="bg-neutral-50 rounded-2xl p-4 space-y-2 mt-4">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span>🚚</span>
                <span>Livraison partout en Algérie — 2 à 5 jours ouvrables</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span>✅</span>
                <span>Retours acceptés dans 30 jours</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span>🔒</span>
                <span>Paiement sécurisé à la livraison</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="py-12 border-t border-neutral-100">
            <h2 className="text-xl md:text-2xl font-serif font-black text-neutral-900 tracking-wide uppercase mb-8 text-center">
              Vous pourriez aussi aimer
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
