export function generateOrderNumber(): string {
  // FIX #10: Use timestamp + random to drastically reduce collision probability
  const now = Date.now();
  const random = Math.floor(Math.random() * 999) + 100; // 3 digits
  const suffix = (now % 100000).toString().padStart(5, '0'); // last 5 digits of timestamp
  return `MDO-${suffix}-${random}`;
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-DZ')} DA`;
}
