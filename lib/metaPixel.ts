export const META_PIXEL_ID = '888489174201321';

export const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

export const event = (name: string, data = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, data);
  }
};
