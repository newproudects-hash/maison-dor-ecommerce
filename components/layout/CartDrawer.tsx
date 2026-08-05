'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { getCart, removeFromCart, updateQuantity, getCartTotal, CartItem } from '@/lib/store/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
    const handler = () => setCart(getCart());
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, [isOpen]);

  const total = getCartTotal(cart);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

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
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-800" />
                <span className="font-serif font-black text-neutral-900 tracking-wide text-lg">Ma Panier</span>
                {itemCount > 0 && (
                  <span className="bg-neutral-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{itemCount}</span>
                )}
              </div>
              <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 transition-colors p-1 rounded-lg hover:bg-neutral-100">
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
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-sm text-neutral-900 leading-tight">{item.name}</p>
                          <p className="text-xs text-neutral-400 mt-0.5 capitalize">{item.category}</p>
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
                          <p className="font-black text-neutral-900">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-neutral-300 hover:text-red-400 transition-colors self-start mt-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                    <span className="font-semibold text-neutral-800">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Livraison</span>
                    <span className="font-semibold text-neutral-800">Calculé à l'étape suivante</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-100">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/commander"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full bg-[#082215] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-[#0d3020] transition-colors group"
                >
                  Commander
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
