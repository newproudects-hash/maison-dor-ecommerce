'use client';

import Script from 'next/script';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

interface PixelConfig {
  pixelId: string;
  adAccountName?: string | null;
  accessToken?: string | null;
  testEventCode?: string | null;
  conversionEvent: string;
  testMode: boolean;
  enabled: boolean;
}

export default function Pixels({ pixelConfig }: { pixelConfig?: PixelConfig | null }) {
  const fbPixel = pixelConfig?.enabled ? (pixelConfig?.pixelId || FB_PIXEL_ID) : null;
  const isEnabled = pixelConfig ? pixelConfig.enabled : true;

  if (!isEnabled) return null;

  return (
    <>
      {/* Global Config for Helpers */}
      <Script id="store-pixel-config" strategy="beforeInteractive">
        {`window.STORE_PIXEL_CONFIG = ${JSON.stringify(pixelConfig || {})};`}
      </Script>

      {/* Facebook Pixel */}
      {fbPixel && (
        <>
          <Script
            id="fb-pixel"
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
                fbq('init', '${fbPixel}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img height="1" width="1" style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${fbPixel}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* TikTok Pixel */}
      {TIKTOK_PIXEL_ID && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('${TIKTOK_PIXEL_ID}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}

// Analytics Helpers
export const trackEvent = (eventName: string, data: any = {}, options?: { eventID?: string }) => {
  if (typeof window === 'undefined') return;
  
  const config = (window as any).STORE_PIXEL_CONFIG || {};
  if (config.enabled === false) return;

  // Facebook Standard Event mapping
  const fbEventName = eventName;
  
  // Facebook
  if ((window as any).fbq) {
    const standardEvents = [
      'AddPaymentInfo', 'AddToCart', 'AddToWishlist', 'CompleteRegistration', 
      'Contact', 'CustomizeProduct', 'Donate', 'FindLocation', 
      'InitiateCheckout', 'Lead', 'Purchase', 'Schedule', 'Search', 
      'StartTrial', 'SubmitApplication', 'Subscribe', 'ViewContent'
    ];
    const isStandard = standardEvents.includes(fbEventName);
    const method = isStandard ? 'track' : 'trackCustom';

    const fbOptions: Record<string, unknown> = {};
    if (options?.eventID) fbOptions.eventID = options.eventID;
    // Removed manual test_event_code for client-side events as it interferes with browser auto-routing

    if (Object.keys(fbOptions).length > 0) {
      (window as any).fbq(method, fbEventName, data, fbOptions);
    } else {
      (window as any).fbq(method, fbEventName, data);
    }
  }
  
  // TikTok
  if ((window as any).ttq) {
    (window as any).ttq.track(eventName, data);
  }
};
