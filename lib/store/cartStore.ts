export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  size?: string;
  color?: string;
}

const CART_KEY = 'maison_dor_cart';

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

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  saveCart(cart);
  window.dispatchEvent(new Event('cart-updated'));
}

export const removeFromCart = (id: number | string) => {
  const cart = getCart();
  const newCart = cart.filter(item => item.id !== id);
  saveCart(newCart);
  window.dispatchEvent(new Event('cart-updated'));
};

export const updateQuantity = (id: number | string, delta: number) => {
  const cart = getCart()
    .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  saveCart(cart);
  window.dispatchEvent(new Event('cart-updated'));
}

export function clearCart() {
  saveCart([]);
  window.dispatchEvent(new Event('cart-updated'));
}

export function getCartTotal(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
