'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import * as fpixel from '@/lib/fpixel';

export default function FacebookPixel() {
  const [loaded, setLoaded] = useState(false);
  const [pixelId, setPixelId] = useState<string>('');
  const pathname = usePathname();

  // جلب الـ Pixel ID من الإعدادات (Supabase أو .env fallback)
  useEffect(() => {
    fetch('/api/admin/pixel-settings')
      .then(r => r.json())
      .then(d => {
        if (d.pixelId) setPixelId(d.pixelId);
      })
      .catch(() => {
        // fallback: استخدم القيمة من .env مباشرةً
        if (fpixel.FB_PIXEL_ID) setPixelId(fpixel.FB_PIXEL_ID);
      });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    fpixel.pageview();
  }, [pathname, loaded]);

  // لا تحمّل الـ Pixel إذا ما في ID
  if (!pixelId) return null;

  return (
    <>
      {/* ① تهيئة fbq أولاً (inline — بدون src) */}
      <Script
        id="fb-pixel-init"
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
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      {/* ② تحميل مكتبة fbevents.js من CDN (src منفصل) */}
      <Script
        id="fb-pixel-sdk"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}
