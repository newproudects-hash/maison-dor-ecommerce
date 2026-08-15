import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/ui/ProductCard';
import type { Metadata } from 'next';
import { getProducts, getCategories } from '@/lib/sanity/queries';
import { mapSanityProduct } from '@/lib/sanity/mapper';
import { getImageUrl } from '@/lib/sanity/client';

export const revalidate = 60;

// Dynamic SEO metadata per category
export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.maisondor.dz';
  try {
    const categories = await getCategories();
    const catInfo = categories.find((c: { slug: string }) => c.slug === category);
    
    const catTitle = catInfo?.title 
      ? (typeof catInfo.title === 'string' ? catInfo.title : (catInfo.title.ar || catInfo.title.fr || catInfo.title.en || category))
      : category;

    return {
      title: `${catTitle} — Sacs et Accessoires`,
      description: `Découvrez notre collection de ${catTitle} de luxe chez MAISON D'OR.`,
      openGraph: {
        title: `${catTitle} | MAISON D'OR`,
        description: `Collection exclusive de ${catTitle} livrés partout en Algérie.`,
        url: `${baseUrl}/boutique/${category}`,
        images: catInfo?.image ? [{ url: getImageUrl(catInfo.image) }] : [{ url: '/hero.jpg' }],
      },
    };
  } catch {
    return { title: 'Boutique' };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  let rawProductsData: { products: unknown[] } = { products: [] };
  let rawCategories: { slug: string; title: string | { ar?: string; fr?: string; en?: string }; image: unknown }[] = [];

  try {
    [rawProductsData, rawCategories] = await Promise.all([
      getProducts({ page: 1, perPage: 100, categorySlug: category }),
      getCategories(),
    ]);
  } catch (err) {
    console.warn('[Category] Sanity fetch failed:', err);
  }

  const catInfo = rawCategories.find((c) => c.slug === category);
  const products = (rawProductsData?.products || []).map(mapSanityProduct);

  const catTitle = catInfo?.title 
    ? (typeof catInfo.title === 'string' ? catInfo.title : (catInfo.title.ar || catInfo.title.fr || catInfo.title.en || category))
    : category;

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 h-[40vh] md:h-[50vh] overflow-hidden bg-neutral-900">
        <Image
          src={catInfo?.image ? getImageUrl(catInfo.image) : '/hero.jpg'}
          alt={catTitle}
          fill
          className="object-cover opacity-60"
          referrerPolicy="no-referrer"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-center text-white px-4">
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase font-bold mb-3">Collection MAISON D'OR</p>
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-wider uppercase mb-2">
            {catTitle}
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
          <span className="text-neutral-700 font-semibold">{catTitle}</span>
        </nav>
      </div>

      {/* Filter Pills */}
      <div className="sticky top-[52px] z-20 bg-white border-b border-neutral-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide max-w-7xl mx-auto">
          <Link
            href="/boutique"
            className="shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          >
            Tout
          </Link>
          {rawCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/boutique/${cat.slug}`}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                category === cat.slug
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {typeof cat.title === 'string' ? cat.title : (cat.title?.ar || cat.title?.fr || cat.title?.en || cat.slug)}
            </Link>
          ))}
        </div>
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
