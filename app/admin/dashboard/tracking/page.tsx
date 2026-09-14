'use client';

import React, { useEffect, useState } from 'react';
import { BarChart2, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type ConversionEvent = "Purchase" | "Purchase_Confirmed" | "Purchase_Delivered" | "Lead";

const EVENT_OPTIONS: { value: ConversionEvent; label: string; hint: string }[] = [
  { value: "Purchase", label: "شراء فوري (Purchase)", hint: "يتم احتساب الحدث فور إتمام الطلب (مناسب لأغلب المتاجر)" },
  { value: "Purchase_Confirmed", label: "شراء مؤكد (Purchase Confirmed)", hint: "يتم الاحتساب فقط بعد تأكيد الطلب من قبل الإدارة" },
  { value: "Purchase_Delivered", label: "شراء مستلم (Purchase Delivered)", hint: "يتم الاحتساب فقط بعد استلام العميل للطلب" },
  { value: "Lead", label: "عميل محتمل (Lead)", hint: "تسجيل الطلب كـ Lead بدلاً من Purchase (لتقليل التكلفة أو للمتاجر الجديدة)" },
];

export default function TrackingSettingsPage() {
  const [pixelId, setPixelId] = useState("");
  const [adAccountName, setAdAccountName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessTokenMasked, setAccessTokenMasked] = useState<string | null>(null);
  const [testEventCode, setTestEventCode] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [conversionEvent, setConversionEvent] = useState<ConversionEvent>("Purchase");
  const [showToken, setShowToken] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Use dynamic base path to support customized admin paths
  const adminPath = typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] || 'admin') : 'admin';

  useEffect(() => {
    let alive = true;
    fetch(`/api/${adminPath}/pixel-config`)
      .then(res => res.json())
      .then(res => {
        if (!alive || !res.data) return;
        const data = res.data;
        setPixelId(data.pixelId || "");
        setAdAccountName(data.adAccountName || "");
        setAccessTokenMasked(data.accessTokenMasked || null);
        setTestEventCode(data.testEventCode || "");
        setConversionEvent(data.conversionEvent || "Purchase");
        setTestMode(data.testMode || false);
        setEnabled(data.enabled ?? true);
        setLastSaved(data.updatedAt || null);
        setLoading(false);
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [adminPath]);

  async function handleSave() {
    setError(null);
    setSuccess(false);

    if (enabled && !pixelId.trim()) {
      setError("معرف البيكسل (Pixel ID) مطلوب");
      return;
    }
    if (enabled && !accessToken.trim() && !accessTokenMasked) {
      setError("التوكن الخاص بالتحويلات (Conversions API Token) مطلوب");
      return;
    }
    if (enabled && testMode && !testEventCode.trim()) {
      setError("كود الاختبار (Test Event Code) مطلوب عند تفعيل وضع الاختبار");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/${adminPath}/pixel-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixelId: pixelId.trim(),
          adAccountName: adAccountName.trim() || null,
          accessToken: accessToken.trim() || undefined,
          testEventCode: testEventCode.trim() || null,
          conversionEvent,
          testMode,
          enabled,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAccessTokenMasked(data.data.accessTokenMasked);
      setAccessToken("");
      setLastSaved(data.data.updatedAt);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-400">جاري التحميل...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto font-sans" dir="rtl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-wide text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-[#C9A84C]" />
            إعدادات التتبع والبيكسل
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            إدارة إعدادات Meta Pixel و Conversions API (CAPI) لربط المتجر بمدير إعلانات فيسبوك.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          style={{ background: '#C9A84C', color: '#0f172a' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التغييرات
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-bold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-bold">
          تم حفظ الإعدادات بنجاح
        </div>
      )}

      <div className="rounded-2xl p-6 space-y-8" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Toggle Enable */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <span className="text-sm font-bold text-white">
              تفعيل التتبع (Enable Tracking)
            </span>
            <p className="text-xs text-slate-400">عند تعطيل هذا الخيار، لن يتم إرسال أي أحداث إلى فيسبوك.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none ${
              enabled ? "bg-[#C9A84C]" : "bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                enabled ? "-translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Ad Account Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="text-sm font-bold text-white block mb-1">اسم الحساب الإعلاني</label>
            <span className="text-xs text-slate-400 block">اختياري: لمعرفتك فقط (لتمييز الحساب)</span>
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              dir="ltr"
              value={adAccountName}
              onChange={(e) => setAdAccountName(e.target.value)}
              placeholder="e.g. My Store - Main Account"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>
        </div>

        {/* Pixel ID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="text-sm font-bold text-white block mb-1">معرف البيكسل (Pixel ID)</label>
            <span className="text-xs text-slate-400 block">موجود في Events Manager داخل مدير الإعلانات</span>
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              dir="ltr"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="e.g. 1234567890123456"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A84C] transition-colors font-mono"
            />
          </div>
        </div>

        {/* Access Token */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="text-sm font-bold text-white block mb-1">رمز الوصول (Conversions API Token)</label>
            <span className="text-xs text-slate-400 block">قم بإنشائه من تبويب Settings داخل البيكسل</span>
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                dir="ltr"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder={accessTokenMasked ?? "EAA..."}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A84C] transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {accessTokenMasked && !accessToken && (
              <p className="text-xs text-slate-400 mt-2">
                محفوظ مسبقاً: <span dir="ltr" className="font-mono">{accessTokenMasked}</span>
              </p>
            )}
          </div>
        </div>

        {/* Event Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/5 pt-6">
          <div className="md:col-span-1">
            <label className="text-sm font-bold text-white block mb-1">حدث التحويل (Conversion Event)</label>
            <span className="text-xs text-slate-400 block">ما هو الحدث الذي ترغب بتحسين إعلاناتك بناءً عليه؟</span>
          </div>
          <div className="md:col-span-2">
            <div className="grid gap-3">
              {EVENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setConversionEvent(option.value)}
                  className={`text-right text-start rounded-xl border p-4 transition-all focus:outline-none ${
                    conversionEvent === option.value
                      ? "border-[#C9A84C] bg-[#C9A84C]/10"
                      : "border-slate-700/50 hover:border-slate-500 bg-slate-800/20"
                  }`}
                >
                  <span className="block text-sm font-bold text-white mb-1">
                    {option.label}
                  </span>
                  <span className="block text-xs text-slate-400">
                    {option.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test Mode */}
        <div className="flex items-start justify-between gap-4 border-t border-white/5 pt-6">
          <div className="space-y-1">
            <span className="text-sm font-bold text-white">
              وضع الاختبار (Test Mode)
            </span>
            <p className="text-xs text-slate-400">قم بتفعيله فقط لاختبار إرسال الأحداث لفيسبوك. (يجب تعطيله في الإنتاج)</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={testMode}
            onClick={() => setTestMode(!testMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none ${
              testMode ? "bg-[#C9A84C]" : "bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                testMode ? "-translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {testMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-bold text-amber-500">
              ⚠️ وضع الاختبار مفعل: تأكد من إيقافه بمجرد انتهاء الاختبار حتى لا يتم تجاهل التحويلات الحقيقية.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="text-sm font-bold text-white block mb-1">كود الاختبار (Test Event Code)</label>
                <span className="text-xs text-slate-400 block">مثال: TEST12345</span>
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  dir="ltr"
                  value={testEventCode}
                  onChange={(e) => setTestEventCode(e.target.value)}
                  placeholder="TEST..."
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono uppercase"
                />
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {lastSaved && (
        <p className="text-xs text-slate-500 mt-4 px-2">
          آخر حفظ: {new Date(lastSaved).toLocaleString('ar-DZ')}
        </p>
      )}
    </div>
  );
}
