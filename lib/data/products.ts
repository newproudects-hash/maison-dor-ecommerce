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
  { id: 'sacs', label: 'Sacs Ã  Main', labelAr: 'Ø­Ù‚Ø§Ø¦Ø¨ ÙŠØ¯', labelFr: 'Sacs Ã  Main', image: '/hero.jpg' },
  { id: 'soiree', label: 'Sacs de SoirÃ©e', labelAr: 'Ø­Ù‚Ø§Ø¦Ø¨ Ø³Ù‡Ø±Ø©', labelFr: 'Sacs de SoirÃ©e', image: '/hero.jpg' },
  { id: 'tote', label: 'Tote Bags', labelAr: 'ØªÙˆØª Ø¨Ø§Ù‚Ø²', labelFr: 'Tote Bags', image: '/hero.jpg' },
  { id: 'dos', label: 'Sacs Ã  Dos', labelAr: 'Ø­Ù‚Ø§Ø¦Ø¨ Ø¸Ù‡Ø±', labelFr: 'Sacs Ã  Dos', image: '/hero.jpg' },
  { id: 'pochettes', label: 'Pochettes', labelAr: 'Ù…Ø­Ø§ÙØ¸', labelFr: 'Pochettes', image: '/hero.jpg' },
  { id: 'nouveautes', label: 'NouveautÃ©s', labelAr: 'Ø¬Ø¯ÙŠØ¯Ù†Ø§', labelFr: 'NouveautÃ©s', image: '/hero.jpg' },
];

export const PRODUCTS: Product[] = [
  { id: 1, name: 'Classic Tote', nameAr: 'Ø­Ù‚ÙŠØ¨Ø© ÙƒÙ„Ø§Ø³ÙŠÙƒ', nameFr: 'Tote Classique', price: 120, image: '/hero.jpg', category: 'tote', slug: 'classic-tote', description: 'Crafted from premium leather with a clean, minimalist design perfect for everyday use.', colors: ['#1a1a1a', '#8B6914', '#4a5568'], sizes: ['S', 'M', 'L'] },
  { id: 2, name: 'Leather Satchel', nameAr: 'Ø­Ù‚ÙŠØ¨Ø© Ø¬Ù„Ø¯ ÙØ§Ø®Ø±Ø©', nameFr: 'Sacoche en Cuir', price: 250, image: '/hero.jpg', category: 'sacs', slug: 'leather-satchel', description: 'A timeless satchel made from full-grain leather, ideal for the modern woman.', colors: ['#6B4E3D', '#2D3748', '#1a1a1a'], sizes: ['M', 'L'] },
  { id: 3, name: 'Mini Crossbody', nameAr: 'Ø­Ù‚ÙŠØ¨Ø© ÙƒØ±ÙˆØ³Ø¨ÙˆØ¯ÙŠ ØµØºÙŠØ±Ø©', nameFr: 'Mini Sac BandouliÃ¨re', price: 95, image: '/hero.jpg', category: 'pochettes', slug: 'mini-crossbody', description: 'A compact yet stylish crossbody bag with an adjustable strap.', colors: ['#E2E8F0', '#FBD38D', '#FC8181'], sizes: ['One Size'] },
  { id: 4, name: 'Woven Basket', nameAr: 'Ø­Ù‚ÙŠØ¨Ø© Ù…Ø¬Ø¯ÙˆÙ„Ø©', nameFr: 'Panier TressÃ©', price: 85, image: '/hero.jpg', category: 'tote', slug: 'woven-basket', description: 'A chic woven basket bag for beach days or casual outings.', colors: ['#D69E2E', '#C05621'], sizes: ['M', 'L'] },
  { id: 5, name: 'Evening Clutch', nameAr: 'Ø­Ù‚ÙŠØ¨Ø© Ø³Ù‡Ø±Ø©', nameFr: 'Pochette de SoirÃ©e', price: 145, image: '/hero.jpg', category: 'soiree', slug: 'evening-clutch', description: 'An exquisite evening clutch adorned with subtle gold hardware.', colors: ['#1a1a1a', '#D4AF37', '#8B0000'], sizes: ['One Size'] },
  { id: 6, name: 'Everyday Backpack', nameAr: 'Ø­Ù‚ÙŠØ¨Ø© Ø¸Ù‡Ø± ÙŠÙˆÙ…ÙŠØ©', nameFr: 'Sac Ã  Dos Quotidien', price: 175, image: '/hero.jpg', category: 'dos', slug: 'everyday-backpack', description: 'A sleek backpack that seamlessly blends fashion and function.', colors: ['#2D3748', '#1a1a1a', '#744210'], sizes: ['M', 'L'] },
  { id: 7, name: 'Structured Handbag', nameAr: 'Ø­Ù‚ÙŠØ¨Ø© Ø±Ø³Ù…ÙŠØ©', nameFr: 'Sac StructurÃ©', price: 320, image: '/hero.jpg', category: 'sacs', slug: 'structured-handbag', description: 'A refined structured handbag for the professional wardrobe.', colors: ['#1a1a1a', '#C05621'], sizes: ['M'] },
  { id: 8, name: 'Velvet SoirÃ©e Bag', nameAr: 'Ø­Ù‚ÙŠØ¨Ø© Ù…Ø®Ù…Ù„ÙŠØ©', nameFr: 'Sac Velours SoirÃ©e', price: 195, image: '/hero.jpg', category: 'soiree', slug: 'velvet-soiree-bag', description: 'Luxurious velvet evening bag with a jewelled clasp.', colors: ['#553C9A', '#1a1a1a', '#D4AF37'], sizes: ['One Size'] },
  { id: 9, name: 'Canvas Tote', nameAr: 'ØªÙˆØª ÙƒØ§Ù†ÙØ§Ø³', nameFr: 'Tote Toile', price: 65, image: '/hero.jpg', category: 'tote', slug: 'canvas-tote', description: 'A relaxed canvas tote with embroidered detailing.', colors: ['#E2E8F0', '#FBD38D'], sizes: ['M', 'L', 'XL'] },
  { id: 10, name: 'Flap Chain Bag', nameAr: 'Ø­Ù‚ÙŠØ¨Ø© Ø³Ù„Ø³Ù„Ø©', nameFr: 'Sac Ã  Rabat ChaÃ®ne', price: 280, image: '/hero.jpg', category: 'sacs', slug: 'flap-chain-bag', description: 'A classic flap bag with a gold chain strap.', colors: ['#1a1a1a', '#D4AF37'], sizes: ['S', 'M'] },
  { id: 11, name: 'Mini Backpack', nameAr: 'Ø­Ù‚ÙŠØ¨Ø© Ø¸Ù‡Ø± ØµØºÙŠØ±Ø©', nameFr: 'Mini Sac Ã  Dos', price: 130, image: '/hero.jpg', category: 'dos', slug: 'mini-backpack', description: 'An adorable mini backpack with gold zippers.', colors: ['#553C9A', '#E2E8F0', '#1a1a1a'], sizes: ['One Size'] },
  { id: 12, name: 'Suede Pochette', nameAr: 'Ù…Ø­ÙØ¸Ø© Ø¬Ù„Ø¯ Ø§Ù„ØºØ²Ø§Ù„', nameFr: 'Pochette SuÃ©dÃ©e', price: 110, image: '/hero.jpg', category: 'pochettes', slug: 'suede-pochette', description: 'A buttery soft suede pochette for a touch of luxury.', colors: ['#C9A96E', '#8B6914', '#4a5568'], sizes: ['One Size'] },
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
