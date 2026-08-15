'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { getCart, removeFromCart, updateQuantity, clearCart, getCartTotal, CartItem } from '@/lib/store/cartStore';
import { CartItemDeleteButton } from './CartItemDeleteButton';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// FIX #29/#30: Smart color display — show name if not a hex, show swatch only if valid hex
function ColorBadge({ color }: { color: string }) {
  const isHex = /^#[0-9A-Fa-f]{3,6}$/.test(color);
  return (
    <span className="flex items-center gap-1">
      Couleur:
      {isHex
        ? <span className="w-3 h-3 rounded-full border border-neutral-200 inline-block" style={{ backgroundColor: color }} />
        : <strong className="text-neutral-700">{color}</strong>
      }
    </span>
  );
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clearConfirm, setClearConfirm] = useState(false);

  const refreshCart = useCallback(() => setCart(getCart()), []);

  useEffect(() => {
    refreshCart();
    const handler = () => refreshCart();
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, [isOpen, refreshCart]);

  const total = getCartTotal(cart);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleClearAll = () => {
    clearCart();
    setClearConfirm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 300 }}
            dragElastic={0.1}
            onDragEnd={(e, info) => {
              if (info.offset.x > 100) onClose();
            }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-800" />
                {/* FIX #26: "Ma Panier" → "Mon Panier" */}
                <span className="font-serif font-black text-neutral-900 tracking-wide text-lg">Mon Panier</span>
                {itemCount > 0 && (
                  <span className="bg-neutral-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{itemCount}</span>
                )}
              </div>
              <button onClick={onClose} className="text-neutral-400 hover:text-red-500 hover:rotate-90 hover:bg-red-50 transition-all duration-300 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                  <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 font-medium">Votre panier est vide</p>
                  <button onClick={onClose} className="text-sm text-neutral-800 underline underline-offset-2 hover:text-neutral-600 transition-colors">
                    Continuer les achats
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-4 p-5"
                    >
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-sm text-neutral-900 leading-tight">{item.name}</p>
                          <div className="flex gap-2 items-center text-xs text-neutral-500 mt-1">
                            {item.size && <span>Taille: <strong className="text-neutral-700">{item.size}</strong></span>}
                            {/* FIX #30: Use ColorBadge instead of raw backgroundColor */}
                            {item.color && <ColorBadge color={item.color} />}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 border border-neutral-200 rounded-lg overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-neutral-100 transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-sm font-bold min-w-[24px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-neutral-100 transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-black text-neutral-900">{(item.price * item.quantity).toLocaleString('fr-DZ')} DA</p>
                        </div>
                      </div>
                      {/* FIX #36: Use CartItemDeleteButton instead of window.confirm() */}
                      <CartItemDeleteButton item={item} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-100 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Sous-total</span>
                    <span className="font-semibold text-neutral-800">{total.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Livraison</span>
                    <span className="font-semibold text-neutral-800">Calculé à l&apos;étape suivante</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-neutral-900 pt-3 border-t border-neutral-100">
                    <span>Total</span>
                    <span className="text-xl">{total.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>

                {/* FIX #35: Add clear cart button */}
                <div className="flex items-center justify-end">
                  {clearConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">Vider tout?</span>
                      <button onClick={handleClearAll} className="text-xs font-bold text-red-500 hover:underline">Oui</button>
                      <button onClick={() => setClearConfirm(false)} className="text-xs font-bold text-neutral-400 hover:underline">Non</button>
                    </div>
                  ) : (
                    <button onClick={() => setClearConfirm(true)} className="text-xs text-neutral-400 hover:text-red-400 transition-colors underline-offset-2 hover:underline">
                      Vider le panier
                    </button>
                  )}
                </div>

                <Link
                  href="/commander"
                  onClick={onClose}
                  className="block w-full py-4 text-center rounded-2xl font-black tracking-wide text-white bg-gradient-to-r from-[#082215] to-[#0a2a1a] shadow-[0_10px_20px_rgba(8,34,21,0.2)] hover:shadow-[0_15px_30px_rgba(8,34,21,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Passer la commande <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
