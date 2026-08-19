require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false
});

async function run() {
  const categoryId = "f082a10e-b2e6-4f08-b9ec-a42c4d08b037";
  const filter = `*[_type == "product" && category._ref == $categoryId && inStock != false]`;
  const products = await client.fetch(filter, { categoryId });
  console.log("Found products with category._ref:", products.length);

  const products2 = await client.fetch(`*[_type == "product" && inStock != false]`);
  console.log("Total in-stock products:", products2.length);
  
  if (products2.length > 0) {
    console.log("First product category ref:", products2[0].category._ref);
  }
}
run().catch(console.error);
