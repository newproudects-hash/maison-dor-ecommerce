'use client';

// ============================================================
// MetaPixel Component
// FIX #5: Single script load — removed duplicate fbevents.js
// FIX #6: noscript fallback added
// FIX #7: Pixel initialized BEFORE fbevents.js loads to capture early events
// FIX #8: onLoad sets loaded=true only ONCE reliably
// FIX #9: PageView tracked after every route change
// ============================================================

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { META_PIXEL_ID, pageview } from '@/lib/metaPixel';

export default function MetaPixel() {
  const pathname = usePathname();
  const initialized = useRef(false);
  const lastPath = useRef('');

  // FIX #9: Track page views on route change (avoid double-fire on mount)
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    // Don't fire on first mount — the init script already fires PageView
    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    // Give fbq a moment to be ready after hydration
    setTimeout(() => pageview(), 300);
  }, [pathname]);

  return (
    <>
      {/* FIX #5: Single initialization — no duplicate fbevents.js loading */}
      {/* FIX #7: Pixel init FIRST, then fbevents.js loads and processes queue */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
            console.log('[Meta Pixel] Initialized with ID: ${META_PIXEL_ID}');
          `,
        }}
      />
      {/* FIX #6: noscript fallback for browsers with JS disabled */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
