import { getServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import OrderStatusSelect from './OrderStatusSelect';

export const dynamic = 'force-dynamic'; // Never pre-render admin pages


/*
 * ACTIVE SKILLS: ui-ux-pro-max
 * DECISION: Table view with color-coded status pills
 */

// Server Action for updating order status
async function updateOrderStatus(formData: FormData) {
  'use server';
  const orderId = formData.get('orderId') as string;
  const newStatus = formData.get('status') as string;
  if (!orderId || !newStatus) return;
  const supabase = getServerSupabase();
  await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  revalidatePath('/admin/dashboard/orders');
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = getServerSupabase();

  // FIX #55: Add limit + FIX #28: filter by search query
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (q) {
    query = query.ilike('order_number', `%${q}%`);
  }

  const { data: orders } = await query;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'shipped': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-white/10 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En Attente';
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <main className="flex-1 flex flex-col p-10 overflow-hidden">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 border border-white/10 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold tracking-widest uppercase text-white">Commandes</h2>
              <p className="text-white/50 text-sm">Gestion des commandes clients.</p>
            </div>
          </div>

          <div className="flex items-center bg-[#111] border border-white/10 px-4 py-2 w-72">
            <svg className="w-4 h-4 text-white/50 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            {/* FIX #28: Real search form instead of fake span */}
            <form method="GET" className="flex-1">
              <input
                name="q"
                defaultValue={q || ''}
                placeholder="Chercher N° MDO..."
                className="bg-transparent border-none text-sm text-white/70 w-full outline-none placeholder:text-white/40"
              />
            </form>
          </div>
        </header>

        {/* Table */}
        <div className="bg-[#111] border border-white/10 flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="text-xs uppercase tracking-widest text-white/50 bg-white/5 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-bold border-b border-white/10">N° Commande</th>
                <th className="px-6 py-4 font-bold border-b border-white/10">Date</th>
                <th className="px-6 py-4 font-bold border-b border-white/10">Client</th>
                <th className="px-6 py-4 font-bold border-b border-white/10">Wilaya</th>
                <th className="px-6 py-4 font-bold border-b border-white/10">Total</th>
                <th className="px-6 py-4 font-bold border-b border-white/10">Statut</th>
                <th className="px-6 py-4 font-bold border-b border-white/10 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-gold-primary">{order.order_number}</td>
                    <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('fr-DZ')}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{order.first_name} {order.last_name}</div>
                      <div className="text-xs text-white/50">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {/* FIX #18: field is 'wilaya' not 'wilaya_name' */}
                      {order.wilaya} ({order.wilaya_code})
                      <div className="text-xs text-white/50">
                        {/* FIX #19: delivery_type is 'domicile'/'bureau' not 'home' */}
                        {order.delivery_type === 'domicile' ? 'Domicile' : 'Stop Desk'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">{order.total.toLocaleString('fr-DZ')} DA</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.status}
                        updateAction={updateOrderStatus}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                    Aucune commande trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
