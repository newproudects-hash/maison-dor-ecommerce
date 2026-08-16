'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { getCart, removeFromCart, updateQuantity, clearCart, getCartTotal, CartItem } from '@/lib/store/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function ColorBadge({ color }: { color: string }) {
  const isHex = /^#[0-9A-Fa-f]{3,6}$/.test(color);
  return (
    <span className="flex items-center gap-1">
      Couleur:
      {isHex
        ? <span className="w-3 h-3 rounded-full border border-neutral-200 inline-block shadow-sm" style={{ backgroundColor: color }} />
        : <strong className="text-neutral-700">{color}</strong>
      }
    </span>
  );
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const drawerVariants = {
  hidden: { x: '-100%' },
  visible: { 
    x: 0, 
    transition: { type: 'spring' as const, damping: 25, stiffness: 200, staggerChildren: 0.1, delayChildren: 0.1 } 
  },
  exit: { 
    x: '-100%', 
    transition: { type: 'spring' as const, damping: 30, stiffness: 250 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 200 } },
  exit: { opacity: 0, scale: 0.9, x: 50, transition: { duration: 0.2 } }
};

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
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-40"
          />

          <motion.aside
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 300 }}
            dragElastic={0.1}
            onDragEnd={(e, info) => {
              if (info.offset.x < -100) onClose();
            }}
            className="fixed top-0 left-0 h-full w-full sm:w-[450px] bg-white z-50 flex flex-col shadow-2xl rounded-r-[2rem] overflow-hidden border-r border-neutral-100"
          >
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between px-8 py-6 bg-neutral-50/50 backdrop-blur-xl border-b border-neutral-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg shadow-black/10">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-black text-neutral-900 tracking-wide text-xl leading-none">Mon Panier</span>
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">{itemCount} article{itemCount !== 1 && 's'}</span>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-neutral-400 hover:text-red-500 hover:bg-red-50 shadow-sm border border-neutral-100 transition-all duration-300 hover:rotate-90 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center h-full gap-5 text-center px-8"
                >
                  <div className="w-24 h-24 rounded-full bg-neutral-50 border-2 border-neutral-100 flex items-center justify-center shadow-inner">
                    <ShoppingBag className="w-10 h-10 text-neutral-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-black text-neutral-900 mb-2">Votre panier est vide</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">Découvrez notre collection et trouvez votre prochain coup de cœur.</p>
                  </div>
                  <button onClick={onClose} className="mt-4 px-8 py-3 bg-black text-white font-bold rounded-full text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-lg shadow-black/20 hover:scale-105 active:scale-95">
                    Découvrir
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        layout
                        className="flex gap-4 p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative"
                      >
                        <div className="relative w-24 h-28 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="pr-6">
                            <p className="font-bold text-sm text-neutral-900 leading-tight mb-1">{item.name}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-neutral-500">
                              {item.size && <span>Taille: <strong className="text-neutral-800">{item.size}</strong></span>}
                              {item.color && <ColorBadge color={item.color} />}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-lg p-0.5">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-neutral-600 transition-all">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-neutral-600 transition-all">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="font-black text-sm text-neutral-900">{(item.price * item.quantity).toLocaleString('fr-DZ')} DA</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-50 border-t border-neutral-100 p-6 sm:p-8 space-y-5 rounded-bl-[2rem]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-neutral-500 font-medium">
                    <span>Sous-total</span>
                    <span className="text-neutral-800">{total.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500 font-medium">
                    <span>Livraison</span>
                    <span className="text-emerald-600 font-bold">Calculé à l&apos;étape suivante</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-neutral-900 pt-4 border-t border-neutral-200">
                    <span>Total</span>
                    <span className="text-2xl">{total.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>

                <div className="flex items-center justify-end h-6">
                  {clearConfirm ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Vider tout?</span>
                      <button onClick={handleClearAll} className="text-xs font-black text-red-500 hover:text-red-600 uppercase">Oui</button>
                      <button onClick={() => setClearConfirm(false)} className="text-xs font-black text-neutral-400 hover:text-neutral-600 uppercase">Non</button>
                    </motion.div>
                  ) : (
                    <button onClick={() => setClearConfirm(true)} className="text-xs font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-wider">
                      Vider le panier
                    </button>
                  )}
                </div>

                <Link
                  href="/commander"
                  onClick={onClose}
                  className="relative group w-full py-4 rounded-2xl font-black tracking-widest uppercase text-xs text-white bg-black overflow-hidden flex items-center justify-center gap-3 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="relative z-10">Passer la commande</span> 
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </motion.div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
