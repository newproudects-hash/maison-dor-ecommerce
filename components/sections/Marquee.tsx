'use client';

const DEFAULT_ITEMS = [
  'توصيل سريع',
  'جودة فاخرة',
  "MAISON D'OR",
  'وصولات جديدة',
  'الدفع عند الاستلام',
  'صناعة فاخرة',
  'التوصيل لكل الجزائر',
  '✦',
];

export default function Marquee({ text }: { text?: string }) {
  // Build items from text prop or defaults
  const items = text
    ? text.split('✦').map(s => s.trim()).filter(Boolean)
    : DEFAULT_ITEMS;

  // We duplicate enough so the track is very long.
  // CSS will shift by 1/(copies) of total width per "tick"
  const copies = 40;
  const allItems: string[] = [];
  for (let i = 0; i < copies; i++) {
    items.forEach(item => allItems.push(item));
  }

  return (
    <div className="w-full overflow-hidden bg-black border-y border-neutral-800 py-3">
      <div className="marquee-track flex whitespace-nowrap">
        {allItems.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center shrink-0 px-7"
          >
            {item === '✦' ? (
              <span className="text-[#C9A84C] text-base leading-none">✦</span>
            ) : (
              <span className="text-[10px] md:text-[11px] font-black tracking-[0.25em] uppercase text-white leading-none">
                {item}
              </span>
            )}
          </span>
        ))}
      </div>

      <style jsx>{`
        .marquee-track {
          /* shift 1 copy width (= 1/copies of total) in 3s */
          animation: scroll-left 3s linear infinite;
        }

        @keyframes scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-2.5%); }
        }
      `}</style>
    </div>
  );
}
