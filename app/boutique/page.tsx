import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/ui/ProductCard';
import { getProducts, getCategories } from '@/lib/sanity/queries';
import { mapSanityProduct } from '@/lib/sanity/mapper';

export const revalidate = 60;

export default async function BoutiquePage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c: activeCategory = 'all' } = await searchParams;
  
  let rawProductsData: { products: unknown[] } = { products: [] };
  let rawCategories: { _id: string; slug: string; title: string | { ar?: string; fr?: string; en?: string } }[] = [];

  try {
    [rawProductsData, rawCategories] = await Promise.all([
      getProducts({ page: 1, perPage: 100, categorySlug: activeCategory === 'all' ? undefined : activeCategory }),
      getCategories(),
    ]);
  } catch {
    // Sanity fetch failed, sections will be empty
  }

  const filtered = (rawProductsData?.products || []).map(mapSanityProduct);

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 bg-[#082215] text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%), radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 50%)' }}
        />
        <div className="relative z-10 animate-fade-in-up">
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase font-bold mb-3">Collection 2026</p>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-wider uppercase mb-4">Notre Boutique</h1>
          <p className="text-neutral-300 max-w-md mx-auto text-sm leading-relaxed">
            Découvrez notre collection exclusive de sacs luxueux, conçus pour la femme moderne.
          </p>
        </div>
      </section>

      {/* Filter Pills */}
      <div className="sticky top-[52px] z-20 bg-white border-b border-neutral-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide max-w-7xl mx-auto">
          <Link
            href="/boutique"
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
              activeCategory === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Tout
          </Link>
          {rawCategories.map((cat) => (
            <Link
              key={cat._id}
              href={`/boutique?c=${cat.slug}`}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                activeCategory === cat.slug
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {typeof cat.title === 'string' ? cat.title : (cat.title?.ar || cat.title?.fr || cat.title?.en || 'قسم')}
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <section className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
        <p className="text-neutral-400 text-xs mb-6 tracking-wide">{filtered.length} articles</p>
        
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">Aucun article trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
