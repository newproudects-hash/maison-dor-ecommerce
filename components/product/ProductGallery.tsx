'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export default function ProductGallery({ images: initialImages, alt, selectedVariantImage }: { images: string[], alt: string, selectedVariantImage?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If a variant image is selected, we want it to be part of the images array (usually prepended or just shown)
  const images = selectedVariantImage && !initialImages.includes(selectedVariantImage)
    ? [selectedVariantImage, ...initialImages]
    : initialImages;

  // React to variant selection
  useEffect(() => {
    if (selectedVariantImage) {
      const idx = images.indexOf(selectedVariantImage);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [selectedVariantImage, images]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 shadow-lg group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              fill
              className="object-cover object-center"
              referrerPolicy="no-referrer"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-neutral-800 shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-neutral-800 shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                currentIndex === i ? 'border-[#082215] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`${alt} thumb ${i}`} fill className="object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
