'use client';

import { useEffect, useRef } from 'react';

const DEFAULT_ITEMS = [
  'LIVRAISON RAPIDE',
  'QUALITÉ PREMIUM',
  "MAISON D'OR",
  'NOUVEAUX ARRIVAGES',
  'PAIEMENT À LA LIVRAISON',
  'ARTISANAT LUXE',
  'LIVRAISON PARTOUT EN ALGÉRIE',
  '✦',
];

export default function Marquee({ text }: { text?: string }) {
  // Build items from text prop or defaults
  const items = text
    ? text.split('✦').map(s => s.trim()).filter(Boolean)
    : DEFAULT_ITEMS;

  return (
    <div className="w-full overflow-hidden bg-black border-y border-neutral-800 py-3 flex">
      <div className="flex animate-marquee-scroll whitespace-nowrap will-change-transform">
        {Array.from({ length: 50 }).map((_, blockIndex) => (
          <div key={blockIndex} className="flex shrink-0">
            {items.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center shrink-0 px-8"
              >
                {item === '✦' ? (
                  <span className="text-[#C9A84C] text-lg">✦</span>
                ) : (
                  <span className="text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase text-white">
                    {item}
                  </span>
                )}
              </span>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        .animate-marquee-scroll {
          /* Adjust duration based on how many items we scroll. 
             Since we shift by 1 block (-2%), the speed depends on block width.
             A generic 15s usually feels right for an average block. */
          animation: marquee-scroll 15s linear infinite;
        }
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-2%); } /* 100% / 50 blocks = 2% per block */
        }
      `}</style>
    </div>
  );
}
