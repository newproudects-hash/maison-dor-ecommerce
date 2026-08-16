'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { getCart } from '@/lib/store/cartStore';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';

/** Apple SF-style minimal bag icon */
function AppleBagIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Bag body — slightly rounded rectangle */}
      <rect x="4" y="10" width="20" height="15" rx="2.5" ry="2.5" />
      {/* Handle */}
      <path d="M10 10 C10 5.5 18 5.5 18 10" />
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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === '/';
  const navBg = scrolled
    ? 'bg-black/90 backdrop-blur-md border-neutral-800 shadow-lg'
    : 'bg-black border-neutral-800 shadow-sm';

  return (
    <>
      <nav className={`sticky top-0 w-full z-50 px-4 md:px-8 py-3.5 flex items-center justify-between border-b transition-all duration-300 ${navBg}`}>
        {/* Left visually (First in DOM due to RTL): Cart */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative text-white/90 hover:text-white transition-colors p-1"
          aria-label="السلة"
        >
          <AppleBagIcon className="w-[22px] h-[22px] md:w-6 md:h-6" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                className="absolute -top-1.5 -right-1.5 bg-[#C9A84C] text-black text-[9px] font-black rounded-full w-[16px] h-[16px] flex items-center justify-center shadow"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Center: Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-[13px] md:text-base font-serif font-black tracking-[0.2em] uppercase text-white select-none">
            MAISON D&apos;OR
          </h1>
        </Link>

        {/* Right visually (Last in DOM due to RTL): Hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center text-white/90 hover:text-white transition-colors p-1"
          aria-label="القائمة"
        >
          <Menu strokeWidth={1.4} className="w-[22px] h-[22px] md:w-6 md:h-6" />
        </button>
      </nav>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
