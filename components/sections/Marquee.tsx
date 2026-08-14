'use client';

import { motion } from 'motion/react';

const DEFAULT_TEXT = 'LIVRAISON RAPIDE ✦ QUALITÉ PREMIUM ✦ MAISON D\'OR ✦ NOUVEAUX ARRIVAGES ✦ LIVRAISON GRATUITE DÈS 10 000 DA ✦ ARTISANAT PREMIUM ✦';

export default function Marquee({ text }: { text?: string }) {
  const content = text || DEFAULT_TEXT;
  // Repeat content 3x to ensure seamless loop
  const repeated = `${content}   ·   ${content}   ·   ${content}`;

  return (
    <div className="w-full bg-black text-white py-2.5 md:py-3 overflow-hidden flex whitespace-nowrap text-[9px] md:text-[11px] tracking-widest uppercase font-bold border-y border-neutral-900 shadow-xl relative z-10">
      <motion.div
        className="flex shrink-0"
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
      >
        <span className="pr-8">{repeated}</span>
        <span className="pr-8">{repeated}</span>
      </motion.div>
    </div>
  );
}
