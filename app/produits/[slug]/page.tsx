import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import ProductClient from '@/components/product/ProductClient';
import ProductCard from '@/components/ui/ProductCard';
import { getProduct, getRelatedProducts } from '@/lib/sanity/queries';
import { mapSanityProduct } from '@/lib/sanity/mapper';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rawProduct = await getProduct(slug);

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
  const rawRelated = await getRelatedProducts(rawProduct.category._id, rawProduct._id);
  const related = rawRelated.map(mapSanityProduct);

  return (
    <main className="min-h-screen bg-white text-neutral-900">
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
          {/* Image */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 shadow-lg animate-fade-in-up">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
              priority
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <p className="text-amber-600 text-xs tracking-[0.25em] uppercase font-bold mb-2 capitalize">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-neutral-900 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-amber-400">{'★★★★★'}</div>
                <span className="text-xs text-neutral-400">124 avis</span>
              </div>
            </div>

            <p className="text-4xl font-black text-neutral-900">${product.price}</p>

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
              {related.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
