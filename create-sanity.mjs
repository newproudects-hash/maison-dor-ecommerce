import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '4zyu7eeg',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: 'skBhArp7GR9RwUatbe3ICHGrpxXoeO7Fd0QwPYqhoNcMx7wFMuIHPYIX3uE1SZvrDUSAylbAHnl8euUft2gCYt8k8DEEPhqUsFldltM1sVS17UfPCLALa3kBXfMAzCHRiBjj5LBQD1XUCmul7pqnKw8oIimIcJzCMbaUx86VRRmescm5H2yG'
});

async function createFakeProduct() {
  try {
    // 1. Create a category first
    const categoryDoc = {
      _type: 'category',
      title: {
        ar: 'أحذية رياضية',
        fr: 'Chaussures de sport',
        en: 'Sneakers'
      },
      slug: {
        _type: 'slug',
        current: 'sneakers'
      },
      description: {
        ar: 'أفضل الأحذية الرياضية',
        fr: 'Les meilleures chaussures',
        en: 'Best sneakers'
      }
    };
    
    console.log('Creating category...');
    const createdCategory = await client.create(categoryDoc);
    console.log('Category created:', createdCategory._id);

    // 2. Create a product
    const productDoc = {
      _type: 'product',
      title: {
        ar: 'حذاء نايك إير ماكس',
        fr: 'Nike Air Max',
        en: 'Nike Air Max'
      },
      slug: {
        _type: 'slug',
        current: 'nike-air-max-test'
      },
      description: {
        ar: 'حذاء مريح جداً للرياضة والمشي',
        fr: 'Chaussure très confortable',
        en: 'Very comfortable shoe'
      },
      originalPrice: 15000,
      price: 12500,
      inStock: true,
      colors: ['#000000', '#FFFFFF', '#FF0000'],
      sizes: ['40', '41', '42', '43'],
      placement: ['home', 'new_arrivals'],
      category: {
        _type: 'reference',
        _ref: createdCategory._id
      }
      // Note: Skipping images for now since it requires uploading a file first
    };

    console.log('Creating product...');
    const createdProduct = await client.create(productDoc);
    console.log('Product created:', createdProduct._id);
    
    console.log('Success! Fake product added.');
  } catch (error) {
    console.error('Error:', error);
  }
}

createFakeProduct();
