import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import ProductInteractive from '@/components/product/ProductInteractive';
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
          <ProductInteractive product={product} />
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
