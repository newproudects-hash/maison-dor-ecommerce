import { NextResponse } from 'next/server';
import { getAnonSupabase } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderId');

    if (!orderNumber) {
      return NextResponse.json({ success: false, error: 'Numéro de commande requis' }, { status: 400 });
    }

    const supabase = getAnonSupabase();

    const { data: order, error } = await supabase
      .from('orders')
      .select('status, created_at, customer_name, total')
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Commande non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
