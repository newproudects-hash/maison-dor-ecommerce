'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, ShoppingBag } from 'lucide-react';
import { getCart } from '@/lib/store/cartStore';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const update = () => {
      const cart = getCart();
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    update();
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // FIX #31: Solid background on non-home pages or when scrolled
  const isHome = pathname === '/';
  const navClass = (scrolled || !isHome)
    ? 'bg-neutral-900 border-neutral-800 shadow-md'
    : 'bg-black/30 backdrop-blur-md border-white/10';

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-30 px-4 md:px-8 py-3 flex items-center justify-between border-b transition-all duration-300 ${navClass}`}>
        {/* Left: hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity p-1"
          aria-label="Menu"
        >
          <Menu strokeWidth={2.5} className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Center: Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-sm md:text-lg font-serif font-black tracking-widest uppercase text-white select-none">
            MAISON D'OR
          </h1>
        </Link>

        {/* Right: Cart */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative text-white hover:opacity-70 transition-opacity p-1 flex items-center gap-1.5"
          aria-label="Cart"
        >
          <ShoppingBag strokeWidth={2.5} className="w-5 h-5 md:w-6 md:h-6" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
