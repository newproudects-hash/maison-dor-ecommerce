require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false
});
client.fetch('*[_type == "product"]{ _id, title, "categorySlug": category->slug.current, "categoryId": category._ref, inStock }').then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error);
