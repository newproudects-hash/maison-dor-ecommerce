export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000; // 4 أرقام
  return `MDO-${year}-${random}`;
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-DZ')} DA`;
}
