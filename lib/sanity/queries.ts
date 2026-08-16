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
}: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
}) {
  const offset = (page - 1) * perPage;
  const filter = categorySlug
    ? `*[_type == "product" && category->slug.current == $categorySlug && inStock != false]`
    : `*[_type == "product" && inStock != false]`;

  // Use getOrFetch for caching the products list
  const cacheKey = `v3:products:${categorySlug || 'all'}:p${page}:s${perPage}`;
  
  const result = await getOrFetch(
    cacheKey,
    async () => {
      const [products, total] = await Promise.all([
        sanityClient.fetch(
          `${filter} | order(_createdAt desc) [${offset}...${offset + perPage}] { ${PRODUCT_FIELDS} }`,
          { categorySlug }
        ),
        sanityClient.fetch(
          `count(${filter})`,
          { categorySlug }
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
  return sanityClient.fetch(
    `*[_type == "product" && $placementVal in placement && inStock != false]
     | order(_createdAt desc) [0...$limit] { ${PRODUCT_FIELDS} }`,
    { placementVal, limit }
  );
}

// ── Single Product (triple fallback to handle all slug formats) ──
export async function getProduct(slug: string) {
  // slug from URL: might be "MONTRES%20TOMI" or "montres-tomi"
  const rawSlug = slug;                        // as-is from URL: "MONTRES%20TOMI"
  const decodedSlug = decodeURIComponent(slug); // decoded:       "MONTRES TOMI"

  const cacheKey = `v3:product:${rawSlug}`;
  
  return getOrFetch(
    cacheKey,
    async () => {
      // 1. Search by raw slug (handles case where Sanity stored "%20" literally)
      const byRaw = await sanityClient.fetch(
        `*[_type == "product" && slug.current == $slug][0] { ${PRODUCT_FIELDS} }`,
        { slug: rawSlug }
      );
      if (byRaw) return byRaw;

      // 2. Search by decoded slug (handles normal slugs with spaces)
      if (decodedSlug !== rawSlug) {
        const byDecoded = await sanityClient.fetch(
          `*[_type == "product" && slug.current == $slug][0] { ${PRODUCT_FIELDS} }`,
          { slug: decodedSlug }
        );
        if (byDecoded) return byDecoded;
      }

      // 3. Fallback: search by _id
      const byId = await sanityClient.fetch(
        `*[_type == "product" && _id == $slug][0] { ${PRODUCT_FIELDS} }`,
        { slug: rawSlug }
      );
      return byId || null;
    },
    60 // Cache for 60 seconds
  );
}

// ── Related Products ──
export async function getRelatedProducts(categoryId: string, currentId: string) {
  return sanityClient.fetch(
    `*[_type == "product" && category._ref == $categoryId && _id != $currentId && inStock != false]
     | order(_createdAt desc) [0...4] { ${PRODUCT_FIELDS} }`,
    { categoryId, currentId }
  );
}

// ── All Categories ──
export async function getCategories() {
  return getOrFetch(
    'v3:categories:all',
    async () => sanityClient.fetch(
      `*[_type == "category"] | order(order asc) {
        _id, title, "slug": slug.current, image, heroImage
      }`
    ),
    60 // Cache for 60 seconds
  );
}

// ── Site Settings ──
export async function getSiteSettings() {
  return sanityClient.fetch(
    `*[_type == "settings"][0] {
      heroImage, boutiqueHeroImage, marqueeText, socialLinks
    }`
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
      }`
    ),
    60 // Cache for 60 seconds
  );
}
