// -------------------------------------------
// MAISON D''OR — Centralized TypeScript Types
// -------------------------------------------

// --- Cart -----------------------------------
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  size?: string;
  color?: string;
}

// --- Product --------------------------------
export interface ColorVariant {
  colorName: string;
  colorHex?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  slug: string;
  description: string;
  colors: string[];
  colorVariants?: ColorVariant[];
  sizes: string[];
  placement: string[];
  inStock: boolean;
}

// --- Order ----------------------------------
export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
}

export interface Order {
  orderNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  wilayaName: string;
  wilayaCode: string;
  deliveryType: 'domicile' | 'bureau';
  deliveryPrice: number;
  address?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
}

// --- Category -------------------------------
export interface Category {
  _id: string;
  title: string | { ar?: string; fr?: string; en?: string };
  slug: string;
  image?: unknown;
  heroImage?: unknown;
  order?: number;
}

// --- Admin ----------------------------------
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  wilaya: string;
  wilaya_code?: string;
  delivery_type: string;
  delivery_price: number;
  address?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  created_at: string;
}

// --- Sanity Raw -----------------------------
export interface SanityProductRaw {
  _id: string;
  slug: string;
  title: string | { ar?: string; fr?: string; en?: string };
  description?: string | { ar?: string; fr?: string; en?: string };
  price: number;
  originalPrice?: number;
  images: unknown[];
  colors: string[];
  colorVariants?: { colorName: string; colorHex?: string; imageUrl?: string }[];
  sizes: string[];
  inStock: boolean;
  placement: string[];
  category: { _id: string; title: string | { ar?: string; fr?: string; en?: string }; slug: string };
}
