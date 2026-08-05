'use client';

import { motion } from 'motion/react';

export default function Marquee() {
  return (
    <div className="w-full bg-black text-white py-2.5 md:py-3 overflow-hidden flex whitespace-nowrap text-[9px] md:text-[11px] tracking-widest uppercase font-bold border-y border-neutral-900 shadow-xl relative z-10">
      <motion.div
        className="flex gap-8"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
      >
        <span>✦ Nouvelle Collection 2026 ✦</span>
        <span>•</span>
        <span>Livraison Gratuite Dès 10 000 DA</span>
        <span>•</span>
        <span>Artisanat Premium</span>
        <span>•</span>
        <span>✦ Nouvelle Collection 2026 ✦</span>
        <span>•</span>
        <span>Livraison Gratuite Dès 10 000 DA</span>
        <span>•</span>
        <span>Artisanat Premium</span>
        <span>•</span>
        <span>✦ Nouvelle Collection 2026 ✦</span>
        <span>•</span>
        <span>Livraison Gratuite Dès 10 000 DA</span>
      </motion.div>
    </div>
  );
}
