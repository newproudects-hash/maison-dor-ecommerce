import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/ui/ProductCard';
import { getProducts, getCategories } from '@/lib/sanity/queries';
import { mapSanityProduct } from '@/lib/sanity/mapper';
import { getImageUrl } from '@/lib/sanity/client';

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  const [rawProductsData, rawCategories] = await Promise.all([
    getProducts({ page: 1, perPage: 100, categorySlug: category }),
    getCategories(),
  ]);

  const catInfo = rawCategories.find((c: any) => c.slug === category);
  const products = rawProductsData.products.map(mapSanityProduct);

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 h-[40vh] md:h-[50vh] overflow-hidden bg-neutral-900">
        <Image
          src={catInfo?.image ? getImageUrl(catInfo.image) : 'https://picsum.photos/seed/default/1200/600'}
          alt={catInfo?.title || 'Catégorie'}
          fill
          className="object-cover opacity-60"
          referrerPolicy="no-referrer"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-center text-white px-4">
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase font-bold mb-3">Collection MAISON D'OR</p>
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-wider uppercase mb-2">
            {catInfo?.title || 'Tous les articles'}
          </h1>
          <p className="text-white/70 text-sm max-w-sm mx-auto">{products.length} articles dans cette catégorie</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="px-4 md:px-8 py-4 max-w-7xl mx-auto border-b border-neutral-100">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-700 transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/boutique" className="hover:text-neutral-700 transition-colors">Boutique</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-700 font-semibold">{catInfo?.title || category}</span>
        </nav>
      </div>

      {/* Products */}
      <section className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-neutral-400 text-lg">Aucun article dans cette catégorie.</p>
            <Link href="/boutique" className="mt-4 inline-block text-sm text-neutral-700 underline">
              Voir toute la boutique
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
