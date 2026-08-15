'use client';

import { useState } from 'react';
import ProductGallery from './ProductGallery';
import ProductClient from './ProductClient';
import type { Product } from '@/types';

export default function ProductInteractive({ product }: { product: Product }) {
  // If the user selects a color variant that has an image, we track its URL here
  const [selectedVariantImageUrl, setSelectedVariantImageUrl] = useState<string | undefined>(undefined);

  // We pass this callback to ProductClient so it can notify us when a variant is selected
  const handleVariantSelect = (imageUrl?: string) => {
    setSelectedVariantImageUrl(imageUrl);
  };

  return (
    <>
      <ProductGallery 
        images={product.images && product.images.length > 0 ? product.images : [product.image]} 
        alt={product.name}
        selectedVariantImage={selectedVariantImageUrl}
      />
      <div className="flex flex-col justify-center gap-6">
        <div>
          <p className="text-amber-600 text-xs tracking-[0.25em] uppercase font-bold mb-2 capitalize">{product.category}</p>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-neutral-900 leading-tight">{product.name}</h1>
        </div>

        <p className="text-4xl font-black text-neutral-900">{product.price.toLocaleString('fr-DZ')} <span className="text-2xl font-bold text-neutral-500">DA</span></p>

        <p className="text-neutral-500 text-sm leading-relaxed">{product.description}</p>

        <ProductClient 
          product={product} 
          onVariantSelect={handleVariantSelect} 
        />

        {/* Delivery info */}
        <div className="bg-neutral-50 rounded-2xl p-4 space-y-2 mt-4">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span>🚚</span>
            <span>Livraison partout en Algérie — 2 à 5 jours ouvrables</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span>✅</span>
            <span>Retours acceptés dans 30 jours</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span>🔒</span>
            <span>Paiement sécurisé à la livraison</span>
          </div>
        </div>
      </div>
    </>
  );
}
