export const FB_PIXEL_ID = '4407767339511765';

export const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name: string, data = {}, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, data, options);
  }
};

export const customEvent = (name: string, data = {}, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', name, data, options);
  }
};
