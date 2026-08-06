import { sanityClient } from './client';

// ── Shared Field Projection ──
const PRODUCT_FIELDS = `
  _id,
  "slug": slug.current,
  title,
  description,
  price,
  images,
  colors,
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
    ? `*[_type == "product" && category->slug.current == $categorySlug && inStock == true]`
    : `*[_type == "product" && inStock == true]`;

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

  return { products, total, pages: Math.ceil(total / perPage) };
}

// ── Placement Based Queries ──
export async function getProductsByPlacement(placementVal: string, limit = 6) {
  return sanityClient.fetch(
    `*[_type == "product" && $placementVal in placement && inStock == true]
     | order(_createdAt desc) [0...$limit] { ${PRODUCT_FIELDS} }`,
    { placementVal, limit }
  );
}

// ── Single Product ──
export async function getProduct(slug: string) {
  return sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug][0] { ${PRODUCT_FIELDS} }`,
    { slug }
  );
}

// ── Related Products ──
export async function getRelatedProducts(categoryId: string, currentId: string) {
  return sanityClient.fetch(
    `*[_type == "product" && category._ref == $categoryId && _id != $currentId && inStock == true]
     | order(_createdAt desc) [0...4] { ${PRODUCT_FIELDS} }`,
    { categoryId, currentId }
  );
}

// ── All Categories ──
export async function getCategories() {
  return sanityClient.fetch(
    `*[_type == "category"] | order(order asc) {
      _id, title, "slug": slug.current, image, heroImage
    }`
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
