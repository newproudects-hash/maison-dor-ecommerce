import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  async redirects() {
    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';
    const studioPath = process.env.NEXT_PUBLIC_STUDIO_PATH || 'studio';
    
    const rules = [];
    
    // Block direct access to the original /admin if a secret path is set
    if (adminPath !== 'admin') {
      rules.push(
        { source: '/admin', destination: '/404', permanent: false },
        { source: '/admin/:path*', destination: '/404', permanent: false },
        { source: '/api/admin/:path*', destination: '/404', permanent: false }
      );
    }
    
    // Block direct access to the original /studio if a secret path is set
    if (studioPath !== 'studio') {
      rules.push(
        { source: '/studio', destination: '/404', permanent: false },
        { source: '/studio/:path*', destination: '/404', permanent: false }
      );
    }
    
    return rules;
  },

  async rewrites() {
    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';
    const studioPath = process.env.NEXT_PUBLIC_STUDIO_PATH || 'studio';
    
    const rules = [];
    
    if (adminPath !== 'admin') {
      rules.push(
        { source: `/${adminPath}`, destination: '/admin' },
        { source: `/${adminPath}/:path*`, destination: '/admin/:path*' },
        { source: `/api/${adminPath}/:path*`, destination: '/api/admin/:path*' }
      );
    }
    
    if (studioPath !== 'studio') {
      rules.push(
        { source: `/${studioPath}`, destination: '/studio' },
        { source: `/${studioPath}/:path*`, destination: '/studio/:path*' }
      );
    }
    
    return rules;
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
      // ─── Global Security Headers ──────────────────────────────────────────
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com https://snap.licdn.com https://sc-static.net https://*.tiktok.com https://analytics.tiktok.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://cdn.sanity.io https://res.cloudinary.com https://images.unsplash.com https://upload.wikimedia.org https://img.icons8.com https://*.fbcdn.net https://*.facebook.com",
              "connect-src 'self' https://*.sanity.io https://*.upstash.io https://*.supabase.co https://api.telegram.org https://www.google-analytics.com https://analytics.google.com https://*.facebook.com",
              "frame-src 'self'",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
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
        source: `/${process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin'}/:path*`,
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
