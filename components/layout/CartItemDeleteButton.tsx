'use client';

import { useState } from 'react';
import { removeFromCart, CartItem } from '@/lib/store/cartStore';
import { Trash2 } from 'lucide-react';

// FIX #36: Replace window.confirm() with inline inline UI confirmation
export function CartItemDeleteButton({ item }: { item: CartItem }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-neutral-500 text-center leading-tight">Supprimer?</span>
        <div className="flex gap-1">
          <button
            onClick={() => removeFromCart(item.id)}
            className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-md hover:bg-red-600 transition-colors"
          >
            Oui
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-2 py-0.5 bg-neutral-200 text-neutral-700 text-[10px] font-bold rounded-md hover:bg-neutral-300 transition-colors"
          >
            Non
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
      aria-label="Supprimer l'article"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
