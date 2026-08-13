'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ShoppingBag, Heart } from 'lucide-react';
import { addToCart } from '@/lib/store/cartStore';
import type { Product } from '@/types';

const MAX_QTY = 20;

export default function ProductClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load wishlist state from localStorage
  useEffect(() => {
    try {
      const wishlist: string[] = JSON.parse(localStorage.getItem('maison_wishlist') || '[]');
      setWishlisted(wishlist.includes(product.id));
    } catch { /* ignore */ }
  }, [product.id]);

  // Cleanup timeout on unmount (fixes memory leak)
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAdd = () => {
    // Add once with correct quantity — no loop!
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      slug: product.slug,
      size: selectedSize,
      color: selectedColor,
      quantity: qty,
    });
    setAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = () => {
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
    <div className="flex flex-col gap-6">
      {/* Colors */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3">
            Couleur
            {selectedColor && (
              <span className="ml-2 text-neutral-700 normal-case font-normal tracking-normal">
                — {selectedColor}
              </span>
            )}
          </p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((color: string) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color ? 'border-neutral-900 scale-110 shadow-md' : 'border-neutral-200'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Couleur ${color}`}
                aria-pressed={selectedColor === color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3">Taille</p>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                  selectedSize === size
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3">Quantité</p>
        <div className="flex items-center border-2 border-neutral-200 rounded-xl w-fit overflow-hidden">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="px-4 py-3 hover:bg-neutral-100 transition-colors"
            aria-label="Diminuer la quantité"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-5 py-3 font-black text-neutral-900 text-lg min-w-[60px] text-center">
            {qty}
          </span>
          <button
            onClick={() => setQty(Math.min(MAX_QTY, qty + 1))}
            className="px-4 py-3 hover:bg-neutral-100 transition-colors"
            aria-label="Augmenter la quantité"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={handleAdd}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-sm border-2 ${
            added ? 'border-green-600 bg-green-50 text-green-700' : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {added ? '✓ Ajouté' : 'Ajouter au panier'}
        </button>

        <button
          onClick={() => {
            handleAdd();
            // Optional: trigger cart drawer open here if there is a global state, or redirect to checkout
            // But since cart opens automatically when cart-updated is fired (if configured), we can just redirect or open.
            // Let's redirect to checkout immediately for "Order Now"
            window.location.href = '/commander';
          }}
          className="flex-[1.5] flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm tracking-wide transition-all duration-300 shadow-lg bg-[#082215] text-white hover:bg-[#0d3020] hover:shadow-xl hover:-translate-y-0.5"
        >
          Commander Maintenant
        </button>
        <button
          onClick={handleWishlist}
          className={`border-2 rounded-2xl px-4 py-4 transition-colors ${
            wishlisted
              ? 'border-red-400 text-red-500 bg-red-50'
              : 'border-neutral-200 hover:border-red-300 hover:text-red-500 hover:bg-red-50'
          }`}
          aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
        </button>
      </div>
    </div>
  );
}
