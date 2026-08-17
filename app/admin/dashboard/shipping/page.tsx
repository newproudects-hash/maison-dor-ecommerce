'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Settings, ShoppingBag, Truck, Save } from 'lucide-react';

interface DeliveryPrice {
  id: string;
  wilaya_code: number;
  wilaya_name: string;
  wilaya_ar: string;
  home_price: number;
  office_price: number;
  is_active: boolean;
}

export default function ShippingDashboard() {
  const adminPath = typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] || 'admin') : 'admin';
  const studioPath = typeof window !== 'undefined' ? (window.location.pathname.split('/')[2] || 'studio') : 'studio';
  const router = useRouter();
  const [prices, setPrices] = useState<DeliveryPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/delivery-prices');
      if (res.ok) {
        const data = await res.json();
        setPrices(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
   
  }, []);

  const handlePriceChange = (code: number, field: 'home_price' | 'office_price', value: string) => {
    const val = parseInt(value) || 0;
    setPrices(prev => prev.map(p => p.wilaya_code === code ? { ...p, [field]: val } : p));
  };

  const handleSave = async (price: DeliveryPrice) => {
    setSaving(true);
    try {
      // Create a new API route for updating prices
      const res = await fetch(`/api/${adminPath}/delivery-prices`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wilaya_code: price.wilaya_code, 
          home_price: price.home_price, 
          office_price: price.office_price 
        }),
      });
      if (res.ok) {
        alert('تم حفظ السعر بنجاح');
      } else {
        alert('حدث خطأ أثناء الحفظ');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${adminPath}/login`);
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: '#0f172a', color: '#f1f5f9' }}>
      
      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 flex flex-col" style={{ background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-6 py-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h1 className="font-serif text-xl font-black tracking-widest uppercase" style={{ color: '#C9A84C' }}>
            MAISON D&apos;OR
          </h1>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Admin Panel</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'الطلبات', href: `/${adminPath}/dashboard`, active: false },
            { icon: Truck,           label: 'أسعار التوصيل', href: `/${adminPath}/dashboard/shipping`, active: true },
            { icon: Settings,        label: 'إدارة المحتوى (Sanity)', href: `/${studioPath}`, active: false },
          ].map(({ icon: Icon, label, href, active }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-right"
              style={{
                background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                color: active ? '#C9A84C' : '#94a3b8',
              }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="px-3 pb-6 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
            style={{ color: '#ef4444' }}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <main className="ml-64 p-8 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black tracking-wide text-white">أسعار التوصيل</h2>
            <p className="text-sm text-slate-400 mt-1">إدارة أسعار التوصيل لكل ولاية</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['رقم', 'الولاية', 'سعر التوصيل للمنزل (DA)', 'سعر التوصيل للمكتب (DA)', 'حفظ'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-10 text-center">جاري التحميل...</td></tr>
                ) : (
                  prices.map((price) => (
                    <tr key={price.wilaya_code} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-5 py-4 font-black text-sm text-slate-400">{price.wilaya_code}</td>
                      <td className="px-5 py-4 font-bold text-sm text-white">{price.wilaya_name} - {price.wilaya_ar}</td>
                      <td className="px-5 py-4">
                        <input 
                          type="number"
                          value={price.home_price}
                          onChange={(e) => handlePriceChange(price.wilaya_code, 'home_price', e.target.value)}
                          className="w-24 px-3 py-2 rounded-lg text-sm bg-black/20 border border-white/10 text-white outline-none focus:border-amber-500/50"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <input 
                          type="number"
                          value={price.office_price}
                          onChange={(e) => handlePriceChange(price.wilaya_code, 'office_price', e.target.value)}
                          className="w-24 px-3 py-2 rounded-lg text-sm bg-black/20 border border-white/10 text-white outline-none focus:border-amber-500/50"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <button 
                          onClick={() => handleSave(price)}
                          disabled={saving}
                          className="p-2 bg-amber-500/20 text-amber-500 rounded-lg hover:bg-amber-500/30 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
