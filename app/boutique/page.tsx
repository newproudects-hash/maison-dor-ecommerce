import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { getProducts, getCategories } from '@/lib/sanity/queries';
import { mapSanityProduct } from '@/lib/sanity/mapper';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "المتجر | MAISON D'OR",
    description: "اكتشف مجموعتنا الحصرية من الحقائب والإكسسوارات الفاخرة.",
  };
}

export default async function BoutiquePage() {
  let rawProductsData: { products: unknown[] } = { products: [] };
  let rawCategories: { _id: string; slug: string; title: string | { ar?: string; fr?: string; en?: string } }[] = [];

  try {
    const settled = await Promise.allSettled([
      getProducts({ page: 1, perPage: 100 }),
      getCategories(),
    ]);
    rawProductsData = settled[0].status === 'fulfilled' ? (settled[0].value as typeof rawProductsData) : { products: [] };
    rawCategories   = settled[1].status === 'fulfilled' ? (settled[1].value as typeof rawCategories) : [];
  } catch {
    // Sanity fetch failed, sections will be empty
  }

  const filtered = (rawProductsData?.products || []).map(mapSanityProduct);

  return (
    <main className="min-h-screen bg-white text-neutral-900">

      {/* Hero */}
      <section className="relative bg-[#082215] text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%), radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 50%)' }}
        />
        <div className="relative z-10">
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase font-bold mb-3">مجموعة 2026</p>
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-wider uppercase mb-4">متجرنا</h1>
          <p className="text-neutral-300 max-w-md mx-auto text-sm leading-relaxed">
            اكتشف مجموعتنا الحصرية من الحقائب والإكسسوارات الفاخرة.
          </p>
        </div>
      </section>

      {/* Filter Pills */}
      <div className="sticky top-[52px] z-20 bg-white border-b border-neutral-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide max-w-7xl mx-auto">
          <Link
            href="/boutique"
            className="shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all bg-neutral-900 text-white"
          >
            الكل
          </Link>
          {rawCategories.map((cat) => (
            <Link
              key={cat._id}
              href={`/boutique/${cat.slug}`}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            >
              {typeof cat.title === 'string' ? cat.title : (cat.title?.ar || cat.title?.fr || cat.title?.en || 'قسم')}
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <section className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
        <p className="text-neutral-400 text-xs mb-6 tracking-wide">{filtered.length} منتج</p>
        
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">لا توجد منتجات.‏</p>
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
