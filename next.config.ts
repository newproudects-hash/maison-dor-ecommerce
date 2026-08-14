import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // ─── Remote Image Patterns ────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
    // ضغط الصور أوتوماتيكياً
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 ساعة لكاش الصور
  },

  // ─── Cache Headers (الطبقة الثانية من الكاش — بعد Cloudflare) ────────────
  async headers() {
    return [
      // ─── صفحات المنتجات: كاش 4 ساعات في Cloudflare ─────────────────────
      {
        source: '/produits/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=14400, stale-while-revalidate=86400',
          },
          { key: 'Cache-Tag', value: 'product-pages' },
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },
      // ─── البوتيك والأقسام: كاش ساعتين ──────────────────────────────────
      {
        source: '/boutique/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=7200, stale-while-revalidate=43200',
          },
          { key: 'Cache-Tag', value: 'boutique-pages' },
        ],
      },
      // ─── الصفحة الرئيسية: كاش 4 ساعات ──────────────────────────────────
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=14400, stale-while-revalidate=86400',
          },
          { key: 'Cache-Tag', value: 'home-page' },
        ],
      },
      // ─── صفحات ثابتة: about, contact, privacy ────────────────────────────
      {
        source: '/(about|contact|privacy|terms|shipping)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // ─── API العام للأقسام: كاش 5 دقائق ────────────────────────────────
      {
        source: '/api/categories',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      // ─── لا كاش للطلبات والأدمن (بيانات حساسة وديناميكية) ──────────────
      {
        source: '/api/orders/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache' }],
      },
      {
        source: '/api/revalidate',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, private' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/commander/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/merci',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      // ─── ملفات Next.js الثابتة: كاش سنة (اسمها يتغير مع كل بناء) ────────
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ─── الصور الثابتة في /public ───────────────────────────────────────
      {
        source: '/:path*.{jpg,jpeg,png,webp,svg,ico,gif}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  transpilePackages: ['motion'],

  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = { ignored: /.*/ };
    }
    return config;
  },
};

export default nextConfig;
