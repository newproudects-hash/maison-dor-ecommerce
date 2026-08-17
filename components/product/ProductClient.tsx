'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Minus, ShoppingBag, Heart, Check } from 'lucide-react';
import { addToCart } from '@/lib/store/cartStore';
import { trackEvent } from '@/components/analytics/Pixels';
import type { Product, ColorVariant } from '@/types';

const MAX_QTY = 20;

interface ProductClientProps {
  product: Product;
  onVariantSelect?: (imageUrl?: string) => void;
}

export default function ProductClient({ product, onVariantSelect }: ProductClientProps) {
  const hasVariants = product.colorVariants && product.colorVariants.length > 0;
  const hasLegacyColors = product.colors && product.colors.length > 0;

  // Default selected color/variant - NOW UNDEFINED TO FORCE SELECTION
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notify parent of initial variant image on mount
  useEffect(() => {
    if (hasVariants && selectedVariant?.imageUrl) {
      onVariantSelect?.(selectedVariant.imageUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load wishlist state from localStorage
  useEffect(() => {
    try {
      const wishlist: string[] = JSON.parse(localStorage.getItem('maison_wishlist') || '[]');
      setWishlisted(wishlist.includes(product.id));
    } catch { /* ignore */ }
  }, [product.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleVariantClick = (variant: ColorVariant) => {
    setSelectedVariant(variant);
    setError(null);
    onVariantSelect?.(variant.imageUrl);
  };

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    setError(null);
  };

  const handleAdd = (redirect = false) => {
    if (hasVariants && !selectedVariant) {
      setError("الرجاء اختيار اللون");
      return;
    }
    if (!hasVariants && hasLegacyColors && !selectedColor) {
      setError("الرجاء اختيار اللون");
      return;
    }

    const colorLabel = selectedVariant?.colorName || selectedColor;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: selectedVariant?.imageUrl || product.image,
      category: product.category,
      slug: product.slug,
      size: selectedSize,
      color: colorLabel,
      quantity: qty,
    });
    setAdded(true);
    
    // Trigger Ads Pixel for AddToCart
    trackEvent('AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price * qty,
      currency: 'DZD',
    });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 2000);

    if (redirect) {
      window.location.href = '/commander';
    }
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

      {/* ── Color Variants WITH Images ── */}
      {hasVariants && (
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3">
            اللون
            {selectedVariant && (
              <span className="ml-2 text-neutral-700 normal-case font-normal tracking-normal">
                — {selectedVariant.colorName}
              </span>
            )}
          </p>
          <div className="flex gap-3 flex-wrap">
            {product.colorVariants!.map((variant, i) => {
              const isSelected = selectedVariant?.colorName === variant.colorName;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={() => handleVariantClick(variant)}
                    aria-label={`Couleur ${variant.colorName}`}
                    aria-pressed={isSelected}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-neutral-900 scale-105 shadow-lg ring-2 ring-neutral-900 ring-offset-1'
                        : 'border-neutral-200 hover:border-neutral-500 hover:shadow-md'
                    }`}
                  >
                    {variant.imageUrl ? (
                      <Image
                        src={variant.imageUrl}
                        alt={variant.colorName}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: variant.colorHex || '#ccc' }}
                      />
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                  <span className={`text-[10px] font-semibold text-center leading-tight max-w-[64px] truncate ${
                    isSelected ? 'text-neutral-900' : 'text-neutral-500'
                  }`}>
                    {variant.colorName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Legacy plain colors (only if no image variants) ── */}
      {!hasVariants && hasLegacyColors && (
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3">
            اللون
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
                onClick={() => handleColorClick(color)}
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

      {/* ── Sizes ── */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3">المقاس</p>
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

      {/* ── Quantity ── */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3">الكمية</p>
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

      {/* ── Action Buttons ── */}
      <div className="flex flex-col gap-3 mt-2">
        {error && <p className="text-red-500 text-sm font-bold animate-pulse">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={() => handleAdd(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-sm border-2 ${
            added ? 'border-green-600 bg-green-50 text-green-700' : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {added ? '✓ تمت الإضافة' : 'إضافة للسلة'}
        </button>

        <button
          onClick={() => handleAdd(true)}
          className="flex-[1.5] flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm tracking-wide transition-all duration-300 shadow-lg bg-[#082215] text-white hover:bg-[#0d3020] hover:shadow-xl hover:-translate-y-0.5"
        >
          اطلب الآن
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
    </div>
  );
}
