import { getServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic'; // Never pre-render admin pages


/*
 * ACTIVE SKILLS: ui-ux-pro-max
 * DECISION: Direct form submission for price updates
 */

async function updatePrice(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const home_price = formData.get('home_price') as string;
  const office_price = formData.get('office_price') as string;
  const is_active = formData.get('is_active') === 'true';

  const supabase = getServerSupabase();
  await supabase
    .from('delivery_prices')
    .update({ 
      home_price: Number(home_price), 
      office_price: Number(office_price),
      is_active
    })
    .eq('id', id);

  revalidatePath('/admin/dashboard/delivery');
}

export default async function AdminDeliveryPage() {
  const supabase = getServerSupabase();
  const { data: prices } = await supabase
    .from('delivery_prices')
    .select('*')
    .order('wilaya_code', { ascending: true });

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <main className="flex-1 flex flex-col p-10 overflow-hidden">
        
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="p-2 border border-white/10 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-widest uppercase text-white">Tarifs de Livraison</h2>
            <p className="text-white/50 text-sm">Gérez les prix pour les 58 Wilayas.</p>
          </div>
        </header>

        {/* Table */}
        <div className="bg-[#111] border border-white/10 flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="text-xs uppercase tracking-widest text-white/50 bg-white/5 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-bold border-b border-white/10">Code</th>
                <th className="px-6 py-4 font-bold border-b border-white/10">Wilaya (Fr)</th>
                <th className="px-6 py-4 font-bold border-b border-white/10">Wilaya (Ar)</th>
                <th className="px-6 py-4 font-bold border-b border-white/10">À Domicile (DA)</th>
                <th className="px-6 py-4 font-bold border-b border-white/10">Point Relais (DA)</th>
                <th className="px-6 py-4 font-bold border-b border-white/10 text-center">Active</th>
                <th className="px-6 py-4 font-bold border-b border-white/10 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {prices?.map((w) => (
                <tr key={w.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 font-mono text-gold-primary">{w.wilaya_code}</td>
                  <td className="px-6 py-3 font-bold">{w.wilaya_name}</td>
                  <td className="px-6 py-3" dir="rtl">{w.wilaya_ar}</td>
                  
                  <td className="px-6 py-3" colSpan={4}>
                    <form action={updatePrice} className="flex items-center gap-4 w-full">
                      <input type="hidden" name="id" value={w.id} />
                      <input 
                        type="number" 
                        name="home_price" 
                        defaultValue={w.home_price}
                        className="bg-[#0A0A0A] border border-white/20 p-2 text-white w-24 focus:border-gold-primary outline-none"
                      />
                      <input 
                        type="number" 
                        name="office_price" 
                        defaultValue={w.office_price}
                        className="bg-[#0A0A0A] border border-white/20 p-2 text-white w-24 focus:border-gold-primary outline-none"
                      />
                      <select 
                        name="is_active" 
                        defaultValue={w.is_active ? 'true' : 'false'}
                        className="bg-[#0A0A0A] border border-white/20 p-2 text-white focus:border-gold-primary outline-none"
                      >
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                      </select>
                      
                      <button 
                        type="submit" 
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gold-primary transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        Sauvegarder
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
