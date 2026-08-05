'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingBag, Heart } from 'lucide-react';
import { addToCart } from '@/lib/store/cartStore';

export default function ProductClient({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Colors */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-3">Couleur</p>
          <div className="flex gap-2">
            {product.colors.map((color: string, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedColor(i)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === i ? 'border-neutral-900 scale-110' : 'border-neutral-200'}`}
                style={{ backgroundColor: color }}
                aria-label={`Couleur ${color}`}
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
            {product.sizes.map((size: string, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedSize(i)}
                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${selectedSize === i ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}
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
        <div className="flex items-center gap-0 border-2 border-neutral-200 rounded-xl w-fit overflow-hidden">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:bg-neutral-100 transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-5 py-3 font-black text-neutral-900 text-lg min-w-[60px] text-center">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-4 py-3 hover:bg-neutral-100 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={handleAdd}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-sm hover:shadow-md ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-[#082215] text-white hover:bg-[#0d3020]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {added ? '✓ Ajouté au panier !' : 'Ajouter au panier'}
        </button>
        <button className="border-2 border-neutral-200 rounded-2xl px-4 py-4 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
