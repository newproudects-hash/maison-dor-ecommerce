'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  Settings, 
  Truck, 
  Save, 
  Zap, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw 
} from 'lucide-react';
import { DEFAULT_DELIVERY_PRICES, DeliveryPriceItem } from '@/lib/data/wilayas';

interface DeliveryPrice extends DeliveryPriceItem {
  id?: string;
}

export default function ShippingDashboard() {
  const adminPath = typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] || 'admin') : 'admin';
  const studioPath = process.env.NEXT_PUBLIC_STUDIO_PATH || 'studio';
  const router = useRouter();

  const [prices, setPrices] = useState<DeliveryPrice[]>(DEFAULT_DELIVERY_PRICES);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalMessage, setGlobalMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<number, 'saving' | 'saved' | 'error' | null>>({});

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setGlobalMessage({ text, type });
    setTimeout(() => setGlobalMessage(null), 4000);
  };

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Instant load from localStorage cache
      try {
        const local = localStorage.getItem('delivery_prices_cache');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPrices(parsed);
          }
        }
      } catch {}

      // 2. Fresh fetch from server
      const res = await fetch('/api/delivery-prices', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPrices(data);
          try { localStorage.setItem('delivery_prices_cache', JSON.stringify(data)); } catch {}
        }
      }
    } catch (e) {
      console.error('[ShippingDashboard] Fetch error:', e);
      // Fallback already pre-set to DEFAULT_DELIVERY_PRICES
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const handlePriceChange = (code: number, field: 'home_price' | 'office_price', value: string) => {
    const val = parseInt(value, 10) || 0;
    setPrices(prev => prev.map(p => p.wilaya_code === code ? { ...p, [field]: val } : p));
  };

  // Helper to persist to API with resilient multi-tier fallback
  const sendPriceUpdate = async (endpoint: string, payload: any) => {
    let res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // Fallback: try PATCH or alternative delivery endpoint
      res = await fetch('/api/delivery-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    return res;
  };

  // Save single Wilaya price
  const handleSaveSingle = async (price: DeliveryPrice) => {
    setSaveStatus(prev => ({ ...prev, [price.wilaya_code]: 'saving' }));
    try {
      const payload = { 
        wilaya_code: price.wilaya_code, 
        wilaya_name: price.wilaya_name,
        wilaya_ar: price.wilaya_ar,
        home_price: Number(price.home_price) || 0, 
        office_price: Number(price.office_price) || 0,
        is_active: price.is_active ?? true,
      };

      // 1. Immediately update local state & client localStorage so checkout reflects it instantly
      const updatedList = prices.map(p => p.wilaya_code === price.wilaya_code ? { ...p, ...payload } : p);
      setPrices(updatedList);
      try { localStorage.setItem('delivery_prices_cache', JSON.stringify(updatedList)); } catch {}

      // 2. Persist to server
      const res = await sendPriceUpdate('/api/admin/delivery-prices', payload);

      if (res.ok) {
        setSaveStatus(prev => ({ ...prev, [price.wilaya_code]: 'saved' }));
        setTimeout(() => setSaveStatus(prev => ({ ...prev, [price.wilaya_code]: null })), 2500);
        showNotification(`✓ تم حفظ سعر ولاية ${price.wilaya_ar} (${price.home_price} دج للمنزل / ${price.office_price} دج للمكتب) بنجاح!`, 'success');
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Save error:', err);
        setSaveStatus(prev => ({ ...prev, [price.wilaya_code]: 'error' }));
        setTimeout(() => setSaveStatus(prev => ({ ...prev, [price.wilaya_code]: null })), 3000);
        showNotification(`فشل حفظ ولاية ${price.wilaya_ar}: ${err.message || 'خطأ في الخادم'}`, 'error');
      }
    } catch (e: any) {
      console.error(e);
      setSaveStatus(prev => ({ ...prev, [price.wilaya_code]: 'error' }));
      showNotification('خطأ في الاتصال بالخادم', 'error');
    }
  };

  // Save All Wilayas at once
  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      // 1. Save to local storage cache immediately
      try { localStorage.setItem('delivery_prices_cache', JSON.stringify(prices)); } catch {}

      // 2. Persist to server
      const res = await sendPriceUpdate('/api/admin/delivery-prices', { prices });
      const result = await res.json().catch(() => ({}));

      if (res.ok && result.success !== false) {
        showNotification(`✓ تم حفظ جميع أسعار التوصيل بنجاح (${prices.length} ولاية)!`, 'success');
      } else {
        showNotification(result.message || 'تم تحديث الأسعار محلياً ولكن حدث خطأ في الخادم', 'error');
      }
    } catch (e: any) {
      console.error('[ShippingDashboard] Save all error:', e);
      showNotification('تم تحديث الأسعار في المتصفح، تحقق من اتصال الإنترنت', 'error');
    } finally {
      setSavingAll(false);
    }
  };

  // Restore official NOEST Express prices
  const handleRestoreDefaults = async () => {
    if (!confirm('هل تريد استعادة جميع أسعار NOEST Express الرسمية وتطبيقها الآن؟')) {
      return;
    }
    setPrices(DEFAULT_DELIVERY_PRICES);
    try { localStorage.setItem('delivery_prices_cache', JSON.stringify(DEFAULT_DELIVERY_PRICES)); } catch {}
    setSavingAll(true);
    try {
      const res = await sendPriceUpdate('/api/admin/delivery-prices', { prices: DEFAULT_DELIVERY_PRICES });
      if (res.ok) {
        showNotification('✓ تم استعادة أسعار NOEST وحفظها بنجاح!', 'success');
      } else {
        showNotification('تم استعادة الأسعار محلياً وفشل الحفظ بالخادم.', 'error');
      }
    } catch (err) {
      showNotification('تم تطبيق الأسعار محلياً، تأكد من الاتصال.', 'error');
    } finally {
      setSavingAll(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${adminPath}/login`);
  };

  const filteredPrices = useMemo(() => {
    if (!searchQuery.trim()) return prices;
    const q = searchQuery.toLowerCase().trim();
    return prices.filter(p => 
      String(p.wilaya_code).includes(q) ||
      (p.wilaya_ar && p.wilaya_ar.includes(q)) ||
      (p.wilaya_name && p.wilaya_name.toLowerCase().includes(q))
    );
  }, [prices, searchQuery]);

  return (
    <div className="min-h-screen font-sans" style={{ background: '#0f172a', color: '#f1f5f9' }}>
      
      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 flex flex-col" style={{ background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-6 py-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h1 className="font-serif text-lg font-black tracking-widest uppercase flex items-center gap-1.5" style={{ color: '#C9A84C' }}>
            <span>👑</span>
            <span>LA MAISON DOR</span>
            <span>🏅</span>
          </h1>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1 block">لوحة التحكم الإدارية</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {[
            { icon: Truck,    label: 'أسعار التوصيل',       href: `/${adminPath}/dashboard/shipping`, active: true },
            { icon: Zap,      label: 'إعدادات البيكسل',      href: `/${adminPath}/dashboard/pixel`,    active: false },
            { icon: Settings, label: 'إدارة المحتوى (Sanity)', href: `/${studioPath}`,                active: false },
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-red-500/10"
            style={{ color: '#ef4444' }}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <main className="ml-64 p-8 pb-16">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-wide text-white">أسعار التوصيل — NOEST Express</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 58 ولاية مهيأة
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">تعديل أسعار التوصيل للمنزل والمكتب مع الحفظ الفوري في قاعدة البيانات والواجهة</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRestoreDefaults}
              disabled={savingAll || loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all disabled:opacity-50"
              title="إعادة ضبط جميع الأسعار حسب جدول NOEST الرسمي"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استعادة أسعار NOEST الرسمية</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={savingAll || loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#C9A84C] hover:bg-[#b8953d] text-black transition-all shadow-lg shadow-[#C9A84C]/20 disabled:opacity-50 cursor-pointer"
            >
              {savingAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ جميع الأسعار</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Toast Message */}
        {globalMessage && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${
            globalMessage.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/15 text-red-300 border border-red-500/30'
          }`}>
            {globalMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <span>{globalMessage.text}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم العربي، الفرنسي، أو رقم الولاية..."
              className="w-full pr-11 pl-4 py-3 rounded-xl text-xs font-medium bg-[#1e293b] border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            عرض {filteredPrices.length} من أصل {prices.length} ولاية
          </span>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                  {['الرمز', 'الولاية (بالعربية)', 'الولاية (بالفرنسية)', 'توصيل للمنزل (DA)', 'استلام من المكتب (StopDesk) (DA)', 'الحالة', 'الإجراء'].map(h => (
                    <th key={h} className="px-5 py-4 text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#C9A84C]" />
                        <span className="text-sm font-bold">جاري تحميل الأسعار...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPrices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      لم يتم العثور على أي ولاية مطابقة للبحث.
                    </td>
                  </tr>
                ) : (
                  filteredPrices.map((price) => {
                    const status = saveStatus[price.wilaya_code];
                    return (
                      <tr key={price.wilaya_code} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 font-mono font-black text-sm text-[#C9A84C]">
                          {String(price.wilaya_code).padStart(2, '0')}
                        </td>
                        <td className="px-5 py-4 font-bold text-sm text-white">
                          {price.wilaya_ar}
                        </td>
                        <td className="px-5 py-4 font-medium text-sm text-slate-300">
                          {price.wilaya_name}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number"
                              min={0}
                              step={50}
                              value={price.home_price}
                              onChange={(e) => handlePriceChange(price.wilaya_code, 'home_price', e.target.value)}
                              className="w-28 px-3 py-2 rounded-xl text-sm font-bold bg-black/40 border border-white/10 text-white outline-none focus:border-[#C9A84C] transition-colors text-center"
                            />
                            <span className="text-xs text-slate-400 font-bold">DA</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number"
                              min={0}
                              step={50}
                              value={price.office_price}
                              onChange={(e) => handlePriceChange(price.wilaya_code, 'office_price', e.target.value)}
                              className="w-28 px-3 py-2 rounded-xl text-sm font-bold bg-black/40 border border-white/10 text-white outline-none focus:border-[#C9A84C] transition-colors text-center"
                            />
                            <span className="text-xs text-slate-400 font-bold">DA</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">
                            متاحة
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button 
                            onClick={() => handleSaveSingle(price)}
                            disabled={status === 'saving'}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              status === 'saving'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : status === 'saved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : status === 'error'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-[#C9A84C]/15 text-[#C9A84C] hover:bg-[#C9A84C]/30 border border-[#C9A84C]/30'
                            }`}
                          >
                            {status === 'saving' ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>جاري...</span>
                              </>
                            ) : status === 'saved' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>تم الحفظ</span>
                              </>
                            ) : status === 'error' ? (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                                <span>فشل</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                <span>حفظ</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
