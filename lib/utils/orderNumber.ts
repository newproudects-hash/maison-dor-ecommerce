export function generateOrderNumber(): string {
  // Use crypto.randomUUID() for cryptographically secure unguessable order IDs
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const uuid = crypto.randomUUID().split('-')[0].toUpperCase();
    return `MDO-${uuid}`;
  }
  // Fallback for older browsers
  const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `MDO-${randomStr}`;
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-DZ')} DA`;
}
