'use client';

import Script from 'next/script';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// ─── Pixel ID من المتغيرات البيئية (أفضل ممارسة من ميتا) ───────────────────
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '4407767339511765';

// ─── مكوّن داخلي: يتتبع تغييرات الصفحة في Next.js SPA ─────────────────────
// السبب: في Next.js لا تحدث إعادة تحميل كاملة للصفحة عند التنقل،
// لذا يجب إطلاق PageView يدوياً عند كل تغيير في المسار.
function FacebookPixelPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return null;
}

// ─── المكوّن الرئيسي ─────────────────────────────────────────────────────────
export default function FacebookPixel() {
  return (
    <>
      {/* Facebook Pixel Base Code — يُحمَّل مرة واحدة بعد التفاعل */}
      <Script
        id="facebook-pixel"
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
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />

      {/* NoScript fallback للمتصفحات التي تعطّل JavaScript */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* 
        متتبع تغيير الصفحات — ضروري في Next.js App Router
        Suspense مطلوب بسبب useSearchParams() حسب توثيق Next.js 
      */}
      <Suspense fallback={null}>
        <FacebookPixelPageViewTracker />
      </Suspense>
    </>
  );
}
