'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Check, ChevronRight, ChevronLeft,
  Star, Shield, Truck, RefreshCcw, Heart, ZoomIn
} from 'lucide-react';
import type { Product } from '@/types';
import { addToCart } from '@/lib/store/cartStore';
import ProductCard from '@/components/ui/ProductCard';

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colorVariants?.[0]?.colorName || product.colors?.[0]
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.[0]
  );
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  // If color variant has a specific image, use it
  const activeColorVariant = product.colorVariants?.find(v => v.colorName === selectedColor);
  const activeImages = activeColorVariant?.imageUrl
    ? [activeColorVariant.imageUrl, ...images.filter(img => img !== activeColorVariant.imageUrl)]
    : images;

  const handleAddToCart = useCallback((redirect = false) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      slug: product.slug,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);

    if (redirect) {
      window.location.href = '/commander';
    }
  }, [product, selectedSize, selectedColor, quantity]);

  const handlePrevImage = () => setSelectedImageIdx((i) => (i - 1 + activeImages.length) % activeImages.length);
  const handleNextImage = () => setSelectedImageIdx((i) => (i + 1) % activeImages.length);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <main className="min-h-screen bg-[#faf9f7] text-neutral-900" dir="rtl">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 flex-wrap">
          <Link href="/" className="hover:text-neutral-700 transition-colors">الرئيسية</Link>
          <ChevronLeft className="w-3 h-3 rotate-180" />
          <Link href="/boutique" className="hover:text-neutral-700 transition-colors">المتجر</Link>
          <ChevronLeft className="w-3 h-3 rotate-180" />
          <Link href={`/boutique/${product.category}`} className="hover:text-neutral-700 transition-colors capitalize">{product.category}</Link>
          <ChevronLeft className="w-3 h-3 rotate-180" />
          <span className="text-neutral-700 font-semibold truncate max-w-[150px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Layout */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* ─── Image Gallery ─── */}
          <div className="space-y-3 lg:sticky lg:top-[80px]">
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-100 group shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIdx}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImages[selectedImageIdx] || '/hero.jpg'}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Nav Arrows */}
              {activeImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronRight className="w-5 h-5 text-neutral-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronLeft className="w-5 h-5 text-neutral-700" />
                  </button>
                </>
              )}

              {/* Zoom Button */}
              <button
                onClick={() => setZoomOpen(true)}
                className="absolute left-3 bottom-3 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                aria-label="Zoom image"
              >
                <ZoomIn className="w-4 h-4 text-neutral-700" />
              </button>

              {/* Discount Badge */}
              {discount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {activeImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {activeImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`shrink-0 relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImageIdx
                        ? 'border-neutral-900 scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-neutral-300'
                    }`}
                  >
                    <Image src={img || '/hero.jpg'} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Info ─── */}
          <div className="space-y-6 lg:pt-2">
            {/* Category Tag */}
            <div>
              <Link
                href={`/boutique/${product.category}`}
                className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 hover:text-amber-700 transition-colors"
              >
                {product.category}
              </Link>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-black leading-tight text-neutral-900 mb-3">
                {product.name}
              </h1>
              {/* Rating (decorative) */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-neutral-500 font-medium">(جودة مضمونة)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-neutral-900">
                {product.price.toLocaleString('fr-DZ')} DA
              </span>
              {product.originalPrice && (
                <span className="text-xl text-neutral-400 line-through font-medium">
                  {product.originalPrice.toLocaleString('fr-DZ')} DA
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-neutral-600 leading-relaxed text-sm md:text-base border-t border-neutral-100 pt-5">
                {product.description}
              </p>
            )}

            {/* Color Variants */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div className="space-y-3 border-t border-neutral-100 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-700">اللون</span>
                  <span className="text-xs text-neutral-500 font-medium">{selectedColor}</span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.colorVariants.map((v) => (
                    <div key={v.colorName} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => { setSelectedColor(v.colorName); setSelectedImageIdx(0); }}
                        title={v.colorName}
                        className={`relative overflow-hidden border-2 transition-all hover:scale-110 shadow-sm ${
                          v.imageUrl ? 'w-14 h-14 rounded-xl' : 'w-9 h-9 rounded-full'
                        } ${
                          selectedColor === v.colorName
                            ? 'border-neutral-900 scale-110 shadow-md ring-2 ring-neutral-900 ring-offset-2'
                            : 'border-neutral-200'
                        }`}
                        style={!v.imageUrl ? { backgroundColor: v.colorHex || '#999' } : undefined}
                      >
                        {v.imageUrl && (
                          <img
                            src={v.imageUrl}
                            alt={v.colorName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        {selectedColor === v.colorName && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Check className="w-4 h-4 text-white drop-shadow-md" />
                          </span>
                        )}
                      </button>
                      <span className={`text-[10px] font-semibold text-center leading-tight max-w-[56px] truncate ${
                        selectedColor === v.colorName ? 'text-neutral-900' : 'text-neutral-500'
                      }`}>
                        {v.colorName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simple Colors (if no colorVariants) */}
            {(!product.colorVariants || product.colorVariants.length === 0) && product.colors && product.colors.length > 0 && (
              <div className="space-y-3 border-t border-neutral-100 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-700">اللون</span>
                  <span className="text-xs text-neutral-500 font-medium">{selectedColor}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((c) => {
                    const isHex = c.startsWith('#');
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        title={c}
                        className={`relative rounded-full font-bold border-2 transition-all hover:scale-110 flex items-center justify-center ${
                          isHex ? 'w-9 h-9 p-0 shadow-sm' : 'px-4 py-2 text-xs'
                        } ${
                          selectedColor === c
                            ? isHex
                              ? 'border-neutral-900 shadow-md ring-2 ring-neutral-900 ring-offset-2'
                              : 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                            : isHex
                              ? 'border-neutral-200'
                              : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                        }`}
                        style={isHex ? { backgroundColor: c } : undefined}
                      >
                        {isHex ? (
                          selectedColor === c && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow-md" />
                            </span>
                          )
                        ) : (
                          c
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3 border-t border-neutral-100 pt-5">
                <span className="text-sm font-bold text-neutral-700">المقاس</span>
                <div className="flex gap-2 flex-wrap mt-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                        selectedSize === s
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-105'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="space-y-3 border-t border-neutral-100 pt-5">
              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-neutral-700">الكمية</span>
                <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:shadow-sm transition-all font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-black text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(20, q + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-white hover:shadow-sm transition-all font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart + Wishlist */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => handleAddToCart(false)}
                    whileTap={{ scale: 0.97 }}
                    disabled={!product.inStock}
                    className={`flex-1 py-4 rounded-2xl font-bold tracking-wide text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-300 border-2 ${
                      added
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                        : product.inStock
                          ? 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-900'
                          : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {added ? (
                        <motion.span
                          key="added"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          تمت الإضافة
                        </motion.span>
                      ) : (
                        <motion.span
                          key="add"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          {product.inStock ? 'إضافة للسلة' : 'نفذ من المخزون'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={!product.inStock}
                    className={`flex-[1.5] py-4 rounded-2xl font-black tracking-wide text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
                      product.inStock
                        ? 'bg-[#082215] text-white hover:bg-[#0d3020] hover:shadow-xl hover:-translate-y-0.5'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    اطلب الآن
                  </button>

                  <button
                    onClick={() => setWishlisted(w => !w)}
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                      wishlisted
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 hover:bg-red-50 hover:border-red-300'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-5">
              {[
                { icon: Truck, label: 'شحن سريع' },
                { icon: Shield, label: 'دفع آمن' },
                { icon: RefreshCcw, label: 'إرجاع مجاني' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                  <Icon className="w-5 h-5 text-neutral-600" />
                  <span className="text-[11px] font-bold text-neutral-600 text-center">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-neutral-100 bg-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 mb-8 text-center">
              قد يعجبك أيضاً
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-2xl aspect-[4/5]"
            >
              <Image
                src={activeImages[selectedImageIdx] || '/hero.jpg'}
                alt={product.name}
                fill
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
