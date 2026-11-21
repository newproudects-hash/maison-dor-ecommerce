import { handleSavePrices } from '@/lib/services/deliveryPrices';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(req: Request) {
  return handleSavePrices(req);
}

export async function POST(req: Request) {
  return handleSavePrices(req);
}
