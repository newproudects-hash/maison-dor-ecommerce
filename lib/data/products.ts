export interface Product {
  id: number;
  name: string;
  nameAr: string;
  nameFr: string;
  price: number;
  image: string;
  category: string;
  slug: string;
  description: string;
  colors: string[];
  sizes: string[];
}

export const CATEGORIES = [
  { id: 'sacs', label: 'Sacs à Main', labelAr: 'حقائب يد', labelFr: 'Sacs à Main', image: 'https://picsum.photos/seed/cat-sacs/600/400' },
  { id: 'soiree', label: 'Sacs de Soirée', labelAr: 'حقائب سهرة', labelFr: 'Sacs de Soirée', image: 'https://picsum.photos/seed/cat-soiree/600/400' },
  { id: 'tote', label: 'Tote Bags', labelAr: 'توت باقز', labelFr: 'Tote Bags', image: 'https://picsum.photos/seed/cat-tote/600/400' },
  { id: 'dos', label: 'Sacs à Dos', labelAr: 'حقائب ظهر', labelFr: 'Sacs à Dos', image: 'https://picsum.photos/seed/cat-dos/600/400' },
  { id: 'pochettes', label: 'Pochettes', labelAr: 'محافظ', labelFr: 'Pochettes', image: 'https://picsum.photos/seed/cat-pochettes/600/400' },
  { id: 'nouveautes', label: 'Nouveautés', labelAr: 'جديدنا', labelFr: 'Nouveautés', image: 'https://picsum.photos/seed/cat-nouveau/600/400' },
];

export const PRODUCTS: Product[] = [
  { id: 1, name: 'Classic Tote', nameAr: 'حقيبة كلاسيك', nameFr: 'Tote Classique', price: 120, image: 'https://picsum.photos/seed/bag1/600/750', category: 'tote', slug: 'classic-tote', description: 'Crafted from premium leather with a clean, minimalist design perfect for everyday use.', colors: ['#1a1a1a', '#8B6914', '#4a5568'], sizes: ['S', 'M', 'L'] },
  { id: 2, name: 'Leather Satchel', nameAr: 'حقيبة جلد فاخرة', nameFr: 'Sacoche en Cuir', price: 250, image: 'https://picsum.photos/seed/bag2/600/750', category: 'sacs', slug: 'leather-satchel', description: 'A timeless satchel made from full-grain leather, ideal for the modern woman.', colors: ['#6B4E3D', '#2D3748', '#1a1a1a'], sizes: ['M', 'L'] },
  { id: 3, name: 'Mini Crossbody', nameAr: 'حقيبة كروسبودي صغيرة', nameFr: 'Mini Sac Bandoulière', price: 95, image: 'https://picsum.photos/seed/bag3/600/750', category: 'pochettes', slug: 'mini-crossbody', description: 'A compact yet stylish crossbody bag with an adjustable strap.', colors: ['#E2E8F0', '#FBD38D', '#FC8181'], sizes: ['One Size'] },
  { id: 4, name: 'Woven Basket', nameAr: 'حقيبة مجدولة', nameFr: 'Panier Tressé', price: 85, image: 'https://picsum.photos/seed/bag4/600/750', category: 'tote', slug: 'woven-basket', description: 'A chic woven basket bag for beach days or casual outings.', colors: ['#D69E2E', '#C05621'], sizes: ['M', 'L'] },
  { id: 5, name: 'Evening Clutch', nameAr: 'حقيبة سهرة', nameFr: 'Pochette de Soirée', price: 145, image: 'https://picsum.photos/seed/bag5/600/750', category: 'soiree', slug: 'evening-clutch', description: 'An exquisite evening clutch adorned with subtle gold hardware.', colors: ['#1a1a1a', '#D4AF37', '#8B0000'], sizes: ['One Size'] },
  { id: 6, name: 'Everyday Backpack', nameAr: 'حقيبة ظهر يومية', nameFr: 'Sac à Dos Quotidien', price: 175, image: 'https://picsum.photos/seed/bag6/600/750', category: 'dos', slug: 'everyday-backpack', description: 'A sleek backpack that seamlessly blends fashion and function.', colors: ['#2D3748', '#1a1a1a', '#744210'], sizes: ['M', 'L'] },
  { id: 7, name: 'Structured Handbag', nameAr: 'حقيبة رسمية', nameFr: 'Sac Structuré', price: 320, image: 'https://picsum.photos/seed/bag7/600/750', category: 'sacs', slug: 'structured-handbag', description: 'A refined structured handbag for the professional wardrobe.', colors: ['#1a1a1a', '#C05621'], sizes: ['M'] },
  { id: 8, name: 'Velvet Soirée Bag', nameAr: 'حقيبة مخملية', nameFr: 'Sac Velours Soirée', price: 195, image: 'https://picsum.photos/seed/bag8/600/750', category: 'soiree', slug: 'velvet-soiree-bag', description: 'Luxurious velvet evening bag with a jewelled clasp.', colors: ['#553C9A', '#1a1a1a', '#D4AF37'], sizes: ['One Size'] },
  { id: 9, name: 'Canvas Tote', nameAr: 'توت كانفاس', nameFr: 'Tote Toile', price: 65, image: 'https://picsum.photos/seed/bag9/600/750', category: 'tote', slug: 'canvas-tote', description: 'A relaxed canvas tote with embroidered detailing.', colors: ['#E2E8F0', '#FBD38D'], sizes: ['M', 'L', 'XL'] },
  { id: 10, name: 'Flap Chain Bag', nameAr: 'حقيبة سلسلة', nameFr: 'Sac à Rabat Chaîne', price: 280, image: 'https://picsum.photos/seed/bag10/600/750', category: 'sacs', slug: 'flap-chain-bag', description: 'A classic flap bag with a gold chain strap.', colors: ['#1a1a1a', '#D4AF37'], sizes: ['S', 'M'] },
  { id: 11, name: 'Mini Backpack', nameAr: 'حقيبة ظهر صغيرة', nameFr: 'Mini Sac à Dos', price: 130, image: 'https://picsum.photos/seed/bag11/600/750', category: 'dos', slug: 'mini-backpack', description: 'An adorable mini backpack with gold zippers.', colors: ['#553C9A', '#E2E8F0', '#1a1a1a'], sizes: ['One Size'] },
  { id: 12, name: 'Suede Pochette', nameAr: 'محفظة جلد الغزال', nameFr: 'Pochette Suédée', price: 110, image: 'https://picsum.photos/seed/bag12/600/750', category: 'pochettes', slug: 'suede-pochette', description: 'A buttery soft suede pochette for a touch of luxury.', colors: ['#C9A96E', '#8B6914', '#4a5568'], sizes: ['One Size'] },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}
