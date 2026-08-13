// ─── Category type used across the app ───────────────────
// Categories are now loaded dynamically from Sanity CMS.
// This file is kept for backwards compatibility only.

export interface CategoryStub {
  id: string;
  label: string;
  labelAr: string;
  labelFr: string;
  image: string;
}

// Empty static fallback — real categories come from Sanity via getCategories()
export const CATEGORIES: CategoryStub[] = [];

// Product type is defined in types/index.ts
// Do NOT add mock product data here.
