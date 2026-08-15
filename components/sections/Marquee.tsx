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
  const trackRef = useRef<HTMLDivElement>(null);

  // Build items from text prop or defaults
  const items = text
    ? text.split('✦').map(s => s.trim()).filter(Boolean)
    : DEFAULT_ITEMS;

  // Duplicate items enough times for seamless infinite loop
  const repeated = [...items, ...items, ...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Use CSS animation for buttery smooth loop
    const totalItems = items.length;
    const singleWidth = track.scrollWidth / 4; // we have 4x items
    track.style.setProperty('--marquee-width', `${singleWidth}px`);
  }, [items.length]);

  return (
    <div
      className="w-full overflow-hidden bg-black text-white border-y border-neutral-800"
      style={{ paddingBlock: '10px' }}
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform"
        style={{
          animation: 'marquee-scroll 25s linear infinite',
        }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center shrink-0"
            style={{ paddingInline: '2rem' }}
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

      <style jsx>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
