'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import * as metaPixel from '@/lib/metaPixel';

export default function MetaPixel() {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!loaded) return;
    metaPixel.pageview();
  }, [pathname, loaded]);

  return (
    <>
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
            fbq('init', '${metaPixel.META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <Script
        id="meta-pixel-sdk"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}
