'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, Truck, Save, Zap, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

export default function PixelSettingsPage() {
  const adminPath = typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] || 'admin') : 'admin';
  const studioPath = process.env.NEXT_PUBLIC_STUDIO_PATH || 'studio';
  const router = useRouter();

  const [pixelId, setPixelId] = useState('');
  const [currentPixelId, setCurrentPixelId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [showId, setShowId] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pixel-settings')
      .then(r => r.json())
      .then(d => {
        setPixelId(d.pixelId || '');
        setCurrentPixelId(d.pixelId || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/admin/pixel-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixelId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentPixelId(data.pixelId || pixelId);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${adminPath}/login`);
  };

  const isActive = (href: string) => typeof window !== 'undefined' && window.location.pathname === href;

  const navItems = [
    { icon: Truck,    label: 'أسعار التوصيل',       href: `/${adminPath}/dashboard/shipping` },
    { icon: Zap,      label: 'إعدادات البيكسل',      href: `/${adminPath}/dashboard/pixel`    },
    { icon: Settings, label: 'إدارة المحتوى (Sanity)', href: `/${studioPath}`                },
  ];

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
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = typeof window !== 'undefined' && window.location.pathname.startsWith(href) && href !== `/${studioPath}`;
            return (
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
            );
          })}
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
            <h2 className="text-2xl font-black tracking-wide text-white flex items-center gap-3">
              <Zap className="w-7 h-7" style={{ color: '#C9A84C' }} />
              إعدادات البيكسل
            </h2>
            <p className="text-sm text-slate-400 mt-1">أدخل رقم Facebook Pixel الخاص بك ليُطبّق على المتجر فورًا</p>
          </div>
        </div>

        <div className="max-w-xl">
          {/* ── بطاقة الإعداد ── */}
          <div className="rounded-2xl p-6" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}>

            {/* حالة التحميل */}
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400 py-4">
                <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                جاري تحميل الإعدادات...
              </div>
            ) : (
              <>
                {/* الـ Pixel ID الحالي */}
                {currentPixelId && (
                  <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#C9A84C' }} />
                    <span className="text-slate-300">البيكسل الحالي:</span>
                    <span className="font-mono font-bold" style={{ color: '#C9A84C' }}>
                      {currentPixelId}
                    </span>
                  </div>
                )}

                {!currentPixelId && (
                  <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <XCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span className="text-slate-300">لا يوجد Pixel ID محدد حاليًا</span>
                  </div>
                )}

                {/* الحقل */}
                <label className="block text-xs font-bold tracking-widest uppercase text-slate-400 mb-2">
                  Facebook / Meta Pixel ID
                </label>
                <div className="relative">
                  <input
                    id="pixel-id-input"
                    type={showId ? 'text' : 'password'}
                    value={pixelId}
                    onChange={e => setPixelId(e.target.value)}
                    placeholder="مثال: 4407767339511765"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl text-sm font-mono text-white outline-none transition-all pr-11"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowId(v => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    title={showId ? 'إخفاء' : 'إظهار'}
                  >
                    {showId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  احصل عليه من: Meta Business Manager → Events Manager → الـ Pixel → الإعدادات
                </p>

                {/* زر الحفظ */}
                <button
                  id="save-pixel-btn"
                  onClick={handleSave}
                  disabled={saving || !pixelId.trim()}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: status === 'saved'
                      ? 'rgba(34,197,94,0.15)'
                      : status === 'error'
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(201,168,76,0.15)',
                    border: `1px solid ${
                      status === 'saved' ? 'rgba(34,197,94,0.3)'
                      : status === 'error' ? 'rgba(239,68,68,0.3)'
                      : 'rgba(201,168,76,0.3)'
                    }`,
                    color: status === 'saved' ? '#4ade80'
                      : status === 'error' ? '#f87171'
                      : '#C9A84C',
                    opacity: (saving || !pixelId.trim()) ? 0.5 : 1,
                    cursor: (saving || !pixelId.trim()) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : status === 'saved' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : status === 'error' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {saving ? 'جاري الحفظ...' : status === 'saved' ? '✓ تم الحفظ!' : status === 'error' ? '✗ فشل الحفظ' : 'حفظ البيكسل'}
                  </span>
                </button>
              </>
            )}
          </div>

          {/* ── ملاحظة مهمة ── */}
          <div className="mt-4 px-4 py-3 rounded-xl text-xs text-slate-400" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="font-bold text-slate-300 mb-1">📌 ملاحظة</p>
            <p>بعد الحفظ، يُطبّق الـ Pixel ID فورًا على المتجر بدون الحاجة لإعادة نشر. إذا تركت الحقل فارغًا وحفظت، سيتوقف تتبع البيكسل.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
