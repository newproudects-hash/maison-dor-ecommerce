import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Marquee from '@/components/sections/Marquee';
import ProductCard from '@/components/ui/ProductCard';
import { getNewArrivals, getProducts, getCategories } from '@/lib/sanity/queries';
import { mapSanityProduct } from '@/lib/sanity/mapper';
import { getImageUrl } from '@/lib/sanity/client';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const [rawNewArrivals, rawProductsData, rawCategories] = await Promise.all([
    getNewArrivals(),
    getProducts({ page: 1, perPage: 12 }),
    getCategories(),
  ]);

  const newArrivals = rawNewArrivals.map(mapSanityProduct);
  const products = rawProductsData.products.map(mapSanityProduct);
  
  // Categorize for homepage sections
  const offers = products.slice(0, 3);
  const trending = products.slice(3, 9);

  return (
    <main className="min-h-screen bg-white text-neutral-900 overflow-x-hidden font-sans relative">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative w-full bg-neutral-100 flex items-center justify-center overflow-hidden">
        <Image
          src="https://res.cloudinary.com/doxg77zqk/image/upload/v1785660883/Girl_writing_style_on_bag_202608020949.jpg"
          alt="Hero Fashion"
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
          priority
          referrerPolicy="no-referrer"
        />
      </section>

      {/* 2. Thin Marquee */}
      <Marquee />

      {/* 3. New Arrivals */}
      <section id="store" className="pt-12 pb-8 md:pt-20 md:pb-12 px-4 md:px-8 bg-white">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-xl md:text-3xl font-serif font-black text-neutral-900 tracking-wide uppercase">Nouveautés</h2>
          <p className="text-neutral-500 text-[11px] md:text-xs mt-3 max-w-md mx-auto leading-relaxed">
            Notre nouvelle collection est conçue pour résister à vos activités tout en vous gardant élégante.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 max-w-7xl mx-auto">
          {newArrivals.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/boutique" className="inline-flex items-center gap-2 border-2 border-neutral-900 text-neutral-900 px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-900 hover:text-white transition-all duration-300">
            Voir tout
          </Link>
        </div>
      </section>

      {/* 4. Categories */}
      <section id="categories" className="w-full py-8 md:py-16 bg-neutral-50">
        <div className="text-center mb-8 md:mb-10 px-4">
          <h2 className="text-xl md:text-3xl font-serif font-black text-neutral-900 tracking-wide uppercase">Catégories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full gap-2 px-2 md:px-6 max-w-[1400px] mx-auto">
          {rawCategories.map((cat: any) => (
            <Link key={cat._id} href={`/boutique/${cat.slug}`} className="relative aspect-[4/5] w-full group overflow-hidden cursor-pointer bg-white border border-neutral-200 rounded-md md:rounded-xl shadow-sm hover:shadow-lg transition-all">
              <Image
                src={getImageUrl(cat.image) || 'https://picsum.photos/seed/placeholder/300/300'}
                alt={cat.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                <p className="text-white text-[9px] md:text-xs font-bold tracking-wider uppercase">{cat.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Special Offers */}
      {offers.length > 0 && (
        <section className="py-12 md:py-16 px-4 md:px-8 bg-white">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-xl md:text-3xl font-serif font-black text-neutral-900 tracking-wide uppercase">Offres Spéciales</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 max-w-7xl mx-auto">
            {offers.map((product: any) => (
              <ProductCard key={product.id + 'offer'} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Trending */}
      {trending.length > 0 && (
        <section className="py-12 md:py-16 px-4 md:px-8 bg-neutral-50">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-xl md:text-3xl font-serif font-black text-neutral-900 tracking-wide uppercase">Tendances</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 max-w-7xl mx-auto">
            {trending.map((product: any) => (
              <ProductCard key={product.id + 'trending'} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
