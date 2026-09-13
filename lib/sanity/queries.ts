import { sanityClient } from './client';
import { getOrFetch } from '../cache/redis';

// ── Shared Field Projection ──
const PRODUCT_FIELDS = `
  _id,
  "slug": slug.current,
  title,
  description,
  price,
  images,
  colors,
  colorVariants[] {
    colorName,
    colorHex,
    "imageUrl": image.asset->url
  },
  sizes,
  inStock,
  placement,
  "category": category->{ _id, title, "slug": slug.current }
`;

// ── Get all products with Pagination ──
export async function getProducts({
  page = 1,
  perPage = 24,
  categorySlug,
  categoryId,
}: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  categoryId?: string;
}) {
  const offset = (page - 1) * perPage;
  
  let filter = `*[_type == "product" && inStock != false]`;
  if (categoryId) {
    filter = `*[_type == "product" && category._ref == $categoryId && inStock != false]`;
  } else if (categorySlug) {
    filter = `*[_type == "product" && category->slug.current == $categorySlug && inStock != false]`;
  }

  // Use getOrFetch for caching the products list
  const cacheKey = `v3:products:${categoryId || categorySlug || 'all'}:p${page}:s${perPage}`;
  
  const result = await getOrFetch(
    cacheKey,
    async () => {
      const [products, total] = await Promise.all([
        sanityClient.fetch(
          `${filter} | order(_createdAt desc) [${offset}...${offset + perPage}] { ${PRODUCT_FIELDS} }`,
          { categorySlug, categoryId },
          { next: { tags: ['products', 'products-list'] } }
        ),
        sanityClient.fetch(
          `count(${filter})`,
          { categorySlug, categoryId },
          { next: { tags: ['products', 'products-list'] } }
        ),
      ]);
      // Don't cache empty results - might be a query bug or slug mismatch
      if (!products || products.length === 0) {
        return { products: [], total: 0, pages: 0, _nocache: true };
      }
      return { products, total, pages: Math.ceil(total / perPage) };
    },
    60 // Cache for 60 seconds to reflect Sanity updates quickly
  );

  return result;
}

// ── Placement Based Queries ──
export async function getProductsByPlacement(placementVal: string, limit = 6) {
  const cacheKey = `v3:placement:${placementVal}:${limit}`;
  return getOrFetch(
    cacheKey,
    async () => sanityClient.fetch(
      `*[_type == "product" && $placementVal in placement && inStock != false]
       | order(_createdAt desc) [0...$limit] { ${PRODUCT_FIELDS} }`,
      { placementVal, limit },
      { next: { tags: ['products', 'products-list'] } }
    ),
    60 // Cache for 60 seconds
  );
}

// ── Single Product (triple fallback to handle all slug formats) ──
export async function getProduct(slug: string) {
  // slug from URL: might be "MONTRES%20TOMI" or "montres-tomi"
  const rawSlug = slug;                        // as-is from URL: "MONTRES%20TOMI"
  const decodedSlug = decodeURIComponent(slug);
  const dashedSlug = decodedSlug.replace(/\s+/g, '-');
  const spacedSlug = decodedSlug.replace(/-/g, ' ');

  const cacheKey = `v3:product:${rawSlug}`;
  
  return getOrFetch(
    cacheKey,
    async () => {
      // 1. Search by various slug formats (case-insensitive) or _id
      const query = `*[_type == "product" && (
        lower(slug.current) == lower($rawSlug) ||
        lower(slug.current) == lower($decodedSlug) ||
        lower(slug.current) == lower($dashedSlug) ||
        lower(slug.current) == lower($spacedSlug) ||
        _id == $rawSlug
      )][0] { ${PRODUCT_FIELDS} }`;

      const match = await sanityClient.fetch(query, {
        rawSlug,
        decodedSlug,
        dashedSlug,
        spacedSlug
      }, { next: { tags: ['products', `product-${rawSlug}`, `product-${decodedSlug}`] } });

      if (match) return match;

      // 2. Last resort: search by title (handles slugs with Arabic or special chars)
      const byTitle = await sanityClient.fetch(
        `*[_type == "product" && (title.ar match $q || title.fr match $q || title.en match $q)][0] { ${PRODUCT_FIELDS} }`,
        { q: decodedSlug },
        { next: { tags: ['products', `product-${decodedSlug}`] } }
      );
      return byTitle || null;
    },
    60 // Cache for 60 seconds
  );
}

// ── Related Products ──
export async function getRelatedProducts(categoryId: string, currentId: string) {
  const cacheKey = `v3:related:${categoryId}:${currentId}`;
  return getOrFetch(
    cacheKey,
    async () => sanityClient.fetch(
      `*[_type == "product" && category._ref == $categoryId && _id != $currentId && inStock != false]
       | order(_createdAt desc) [0...4] { ${PRODUCT_FIELDS} }`,
      { categoryId, currentId },
      { next: { tags: ['products', 'products-list'] } }
    ),
    60 // Cache for 60 seconds
  );
}

// ── All Categories ──
export async function getCategories() {
  return getOrFetch(
    'v3:categories:all',
    async () => sanityClient.fetch(
      `*[_type == "category"] | order(order asc) {
        _id, title, "slug": slug.current, image, heroImage
      }`,
      {},
      { next: { tags: ['categories'] } }
    ),
    60 // Cache for 60 seconds
  );
}

// ── Site Settings ──
export async function getSiteSettings() {
  return getOrFetch(
    'v3:settings:site',
    async () => sanityClient.fetch(
      `*[_type == "settings"][0] {
        heroImage, boutiqueHeroImage, marqueeText, socialLinks
      }`,
      {},
      { next: { tags: ['home-settings'] } }
    ),
    120 // Site settings rarely change, cache for 120s
  );
}

// ── Home Page Settings (Singleton) ──
export async function getHomePageSettings() {
  return getOrFetch(
    'v3:settings:home',
    async () => sanityClient.fetch(
      `*[_type == "homePage"][0] {
        heroImage,
        heroImageMobile,
        marqueeText,
        announcementBar
      }`,
      {},
      { next: { tags: ['home-settings'] } }
    ),
    60 // Cache for 60 seconds
  );
}
