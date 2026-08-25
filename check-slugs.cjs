require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
});

async function run() {
  const products = await client.fetch(`*[_type == "product"]{ title, "slug": slug.current, inStock }`);
  console.log('Total products:', products.length);
  products.forEach(p => {
    // Check for trailing spaces or weird characters
    if (p.slug && (p.slug.endsWith(' ') || p.slug.startsWith(' '))) {
      console.log('WEIRD SLUG FOUND:', JSON.stringify(p.slug), 'for product:', p.title);
    }
  });
  console.log('Sample slugs:', products.slice(0, 5).map(p => p.slug));
}

run().catch(console.error);
