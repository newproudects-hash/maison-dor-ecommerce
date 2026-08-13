// MAISON D'OR - Utility Functions (Consolidated)

// Class name merger
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Sanitize user input to prevent XSS
export function sanitize(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// Validate Algerian phone number (05x, 06x, 07x + 8 digits)
export function isValidAlgerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '');
  return /^0[567]\d{8}$/.test(cleaned);
}

// Format price in Algerian Dinar
export function formatPrice(price: number): string {
  return price.toLocaleString('fr-DZ') + ' DA';
}

// Generate unique order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return 'MDO-' + timestamp + '-' + random;
}

// In-memory rate limiter per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}