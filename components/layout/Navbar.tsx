'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { getCart } from '@/lib/store/cartStore';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';

/** Premium hand-crafted bag/cart SVG icon — thin lines, luxury feel */
function LuxuryCartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Bag body */}
      <path d="M6 2 L4 22 L20 22 L18 2 Z" />
      {/* Handles */}
      <path d="M9 2 C9 -1 15 -1 15 2" />
      {/* Inner detail line */}
      <line x1="6.5" y1="8" x2="17.5" y2="8" strokeWidth="0.8" />
    </svg>
  );
}

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

  const isHome = pathname === '/';
  const navClass = (scrolled || !isHome)
    ? 'bg-neutral-900 border-neutral-800 shadow-md'
    : 'bg-black/30 backdrop-blur-md border-white/10';

  return (
    <>
      <nav className={`sticky top-0 left-0 w-full z-30 px-4 md:px-8 py-3 flex items-center justify-between border-b transition-all duration-300 ${navClass}`}>
        {/* Left: hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity p-1"
          aria-label="Menu"
        >
          <Menu strokeWidth={1.5} className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Center: Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-sm md:text-lg font-serif font-black tracking-widest uppercase text-white select-none">
            MAISON D&apos;OR
          </h1>
        </Link>

        {/* Right: Luxury Cart Button */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative text-white hover:opacity-75 transition-opacity p-1"
          aria-label="السلة"
        >
          <LuxuryCartIcon className="w-[22px] h-[22px] md:w-[26px] md:h-[26px]" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute -top-1.5 -right-1.5 bg-[#C9A84C] text-black text-[9px] font-black rounded-full w-[17px] h-[17px] flex items-center justify-center shadow-md"
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
