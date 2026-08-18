import Image from 'next/image';
import Link from 'next/link';
import Marquee from '@/components/sections/Marquee';
import ProductCard from '@/components/ui/ProductCard';
import { getProductsByPlacement, getCategories, getHomePageSettings } from '@/lib/sanity/queries';
import { mapSanityProduct } from '@/lib/sanity/mapper';
import { getImageUrl } from '@/lib/sanity/client';
import type { SanityProductRaw, Category } from '@/types';

export const revalidate = 60;

export default async function Home() {
  let rawHome: SanityProductRaw[] = [];
  let rawNewArrivals: SanityProductRaw[] = [];
  let rawBestSellers: SanityProductRaw[] = [];
  let rawFeatured: SanityProductRaw[] = [];
  let rawCategories: Category[] = [];
  let homeSettings: Record<string, unknown> | null = null;

  try {
    const settled = await Promise.allSettled([
      getProductsByPlacement('home', 8),
      getProductsByPlacement('new_arrivals', 6),
      getProductsByPlacement('best_sellers', 6),
      getProductsByPlacement('featured', 6),
      getCategories(),
      getHomePageSettings(),
    ]);
    rawHome         = settled[0].status === 'fulfilled' ? settled[0].value as SanityProductRaw[] : [];
    rawNewArrivals  = settled[1].status === 'fulfilled' ? settled[1].value as SanityProductRaw[] : [];
    rawBestSellers  = settled[2].status === 'fulfilled' ? settled[2].value as SanityProductRaw[] : [];
    rawFeatured     = settled[3].status === 'fulfilled' ? settled[3].value as SanityProductRaw[] : [];
    rawCategories   = settled[4].status === 'fulfilled' ? settled[4].value as Category[] : [];
    homeSettings    = settled[5].status === 'fulfilled' ? settled[5].value as Record<string, unknown> : null;
  } catch {
    // Sanity fetch failed entirely, sections will be empty
  }

  // Deduplicate products across sections — a product shouldn't appear twice on the same page
  const seenIds = new Set<string>();
  const dedup = (items: SanityProductRaw[]) => (items || []).map(mapSanityProduct).filter(p => {
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });

  const homeProducts    = dedup(rawHome);
  const newArrivals     = dedup(rawNewArrivals);
  const bestSellers     = dedup(rawBestSellers);
  const featuredProducts = dedup(rawFeatured);

  // Hero image: prefer Sanity, fallback to local /hero.jpg
  const heroSrc = homeSettings?.heroImage ? (getImageUrl(homeSettings.heroImage) || '/hero.jpg') : '/hero.jpg';
  const heroMobileSrc = homeSettings?.heroImageMobile ? (getImageUrl(homeSettings.heroImageMobile) || heroSrc) : heroSrc;

  // Announcement bar
  const announcement = homeSettings?.announcementBar as { enabled?: boolean, text?: string, bgColor?: string } | undefined;

  return (
    <main className="min-h-screen bg-white text-neutral-900 overflow-x-hidden font-sans relative">


      {/* 1. Hero Section */}
      <section className="relative w-full bg-neutral-900 flex items-center justify-center overflow-hidden">
        {/* Mobile hero */}
        <Image
          src={heroMobileSrc}
          alt="Maison D'Or - Luxury is in the details"
          width={800}
          height={1000}
          className="block md:hidden w-full h-auto"
          referrerPolicy="no-referrer"
          priority
          quality={100}
          unoptimized={heroMobileSrc.startsWith('http')}
        />
        {/* Desktop hero */}
        <Image
          src={heroSrc}
          alt="Maison D'Or - Luxury is in the details"
          width={1920}
          height={1080}
          className="hidden md:block w-full h-auto"
          referrerPolicy="no-referrer"
          priority
          quality={100}
          unoptimized={heroSrc.startsWith('http')}
        />
      </section>

      {/* 2. Thin Marquee */}
      <Marquee text={homeSettings?.marqueeText as string | undefined} />

      {/* 2.5 Home (الرئيسية) */}
      {homeProducts.length > 0 && (
        <section className="pt-12 pb-4 md:pt-16 md:pb-8 px-4 md:px-8 bg-white">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-xl md:text-3xl font-serif font-black text-neutral-900 tracking-wide uppercase">تشكيلة الرئيسية</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 max-w-7xl mx-auto">
            {homeProducts.map((product) => (
              <ProductCard key={product.id + 'home'} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 3. New Arrivals */}
      {newArrivals.length > 0 && (
        <section id="store" className="pt-12 pb-8 md:pt-20 md:pb-12 px-4 md:px-8 bg-white">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-xl md:text-3xl font-serif font-black text-neutral-900 tracking-wide uppercase">وصولات جديدة</h2>
            <p className="text-neutral-500 text-[11px] md:text-xs mt-3 max-w-md mx-auto leading-relaxed">
              مجموعتنا الجديدة مصممة لترافقك في كل مناسباتك.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 max-w-7xl mx-auto">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/boutique" className="inline-flex items-center gap-2 border-2 border-neutral-900 text-neutral-900 px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-900 hover:text-white transition-all duration-300">
              عرض الكل
            </Link>
          </div>
        </section>
      )}

      {/* 4. Categories */}
      {rawCategories.length > 0 && (
        <section id="categories" className="w-full py-8 md:py-16 bg-neutral-50">
          <div className="text-center mb-8 md:mb-10 px-4">
            <h2 className="text-xl md:text-3xl font-serif font-black text-neutral-900 tracking-wide uppercase">الأقسام</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full gap-2 px-2 md:px-6 max-w-[1400px] mx-auto">
            {rawCategories.map((cat) => (
              <Link key={cat._id} href={`/boutique/${cat.slug}`} className="relative aspect-[4/5] w-full group overflow-hidden cursor-pointer bg-white border border-neutral-200 rounded-md md:rounded-xl shadow-sm hover:shadow-lg transition-all">
                <Image
                  src={getImageUrl(cat.image) || '/hero.jpg'}
                  alt={typeof cat.title === 'string' ? cat.title : (cat.title?.ar || cat.title?.fr || cat.title?.en || 'Catégorie')}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                  <p className="text-white text-[9px] md:text-xs font-bold tracking-wider uppercase">
                    {typeof cat.title === 'string' ? cat.title : (cat.title?.ar || cat.title?.fr || cat.title?.en || 'قسم')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-12 md:py-16 px-4 md:px-8 bg-white">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-xl md:text-3xl font-serif font-black text-neutral-900 tracking-wide uppercase">الأكثر مبيعاً</h2>
            <p className="text-neutral-500 text-[11px] md:text-xs mt-3 max-w-md mx-auto leading-relaxed">
              المنتجات الأكثر طلباً من عملائنا.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 max-w-7xl mx-auto">
            {bestSellers.map((product) => (
              <ProductCard key={product.id + 'bs'} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
