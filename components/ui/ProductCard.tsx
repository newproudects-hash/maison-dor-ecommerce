'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { addToCart } from '@/lib/store/cartStore';

export default function ProductCard({ product }: { product: { id: string; name: string; price: number; image: string; category: string; slug: string } }) {
  const [wishlisted, setWishlisted] = React.useState(false);
  // FIX #68: Show feedback after adding to cart
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    try {
      const wishlist: string[] = JSON.parse(localStorage.getItem('maison_wishlist') || '[]');
      setWishlisted(wishlist.includes(product.id));
    } catch { /* ignore */ }
  }, [product.id]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ productId: product.id, name: product.name, price: product.price, image: product.image, category: product.category, slug: product.slug });
    // FIX #68: Briefly show a checkmark
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const wishlist: string[] = JSON.parse(localStorage.getItem('maison_wishlist') || '[]');
      const newWishlist = wishlisted
        ? wishlist.filter((id) => id !== product.id)
        : [...wishlist, product.id];
      localStorage.setItem('maison_wishlist', JSON.stringify(newWishlist));
      setWishlisted(!wishlisted);
    } catch { /* ignore */ }
  };

  return (
    <Link href={`/produits/${product.slug}`} className="group cursor-pointer relative aspect-[3/4] w-full rounded-lg md:rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-shadow duration-500 border border-neutral-100 block">
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        referrerPolicy="no-referrer"
      />
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/50"
        aria-label="Toggle Wishlist"
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
      </button>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-full p-3 md:p-5 flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs md:text-base font-bold text-white tracking-tight leading-none drop-shadow-sm">{product.name}</h3>
          <p className="text-sm md:text-lg font-extrabold text-amber-300 leading-none drop-shadow-sm">{product.price.toLocaleString('fr-DZ')} DA</p>
        </div>
        {/* FIX #68: Cart button with added feedback */}
        <button
          onClick={handleAdd}
          className={`ml-1 rounded-full p-2.5 md:p-3 shadow-lg transition-all duration-300 ${
            added
              ? 'bg-green-500 text-white scale-110 shadow-green-500/30'
              : 'bg-white text-black hover:scale-110 hover:bg-neutral-100'
          }`}
          aria-label="Ajouter au panier"
        >
          {added
            ? <Check className="w-5 h-5" />
            : <ShoppingBag className="w-5 h-5" />
          }
        </button>
      </div>
    </Link>
  );
}
