export interface CartItem {
  id: string; // variant key (productId + size + color)
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  slug: string;
  size?: string;
  color?: string;
}

const CART_KEY = 'maison_dor_cart';
const MAX_QUANTITY_PER_ITEM = 20;
const MAX_TOTAL_CART_ITEMS = 50; // FIX #23: Limit max items in cart

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// Create a unique key for each variant (product + size + color)
function variantKey(productId: string, size?: string, color?: string): string {
  return `${productId}__${size || 'none'}__${color || 'none'}`;
}

export function addToCart(item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) {
  const cart = getCart();
  const key = variantKey(item.productId, item.size, item.color);
  const qty = item.quantity || 1;

  const existing = cart.find((i) => i.id === key);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, MAX_QUANTITY_PER_ITEM);
  } else {
    // FIX #23: Check total distinct items to prevent localStorage overflow attack
    if (cart.length >= MAX_TOTAL_CART_ITEMS) {
      alert("Votre panier est plein. Veuillez procéder au paiement ou supprimer des articles.");
      return;
    }
    cart.push({ ...item, id: key, quantity: qty });
  }
  saveCart(cart);
  window.dispatchEvent(new Event('cart-updated'));
}

export const removeFromCart = (id: string) => {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  window.dispatchEvent(new Event('cart-updated'));
};

export const updateQuantity = (id: string, delta: number) => {
  const cart = getCart().map((i) =>
    i.id === id
      ? { ...i, quantity: Math.min(Math.max(1, i.quantity + delta), MAX_QUANTITY_PER_ITEM) }
      : i
  );
  saveCart(cart);
  window.dispatchEvent(new Event('cart-updated'));
};

export function clearCart() {
  saveCart([]);
  window.dispatchEvent(new Event('cart-updated'));
}

export function getCartTotal(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function getCartCount(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}
