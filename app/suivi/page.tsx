'use client';

import { useState } from 'react';
import { Search, Package, Clock, CheckCircle, Truck, XCircle, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SuiviPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ status: string; created_at: string; total: number } | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // ✅ SECURITY: Send both orderId + phone — server requires both (Anti-IDOR)
      const res = await fetch(
        `/api/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Commande introuvable');
      }

      setResult(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', text: 'En attente de confirmation' };
      case 'confirmed': return { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50', text: 'Confirmée' };
      case 'shipped': return { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50', text: 'En cours de livraison' };
      case 'delivered': return { icon: Package, color: 'text-green-500', bg: 'bg-green-50', text: 'Livrée' };
      case 'cancelled': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', text: 'Annulée' };
      default: return { icon: Clock, color: 'text-neutral-500', bg: 'bg-neutral-50', text: 'Statut inconnu' };
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-black uppercase tracking-wide mb-3">تتبع طلبي</h1>
          <p className="text-neutral-500 text-sm">أدخل رقم الطلب ورقم هاتفك للتحقق من حالة طلبك</p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-neutral-100">
          <form onSubmit={handleTrack} className="flex flex-col gap-3">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="رقم الطلب (مثال: MDO-AB12CD)"
              required
              className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all font-medium text-center"
            />
            {/* ✅ SECURITY: Phone required for Anti-IDOR protection */}
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف المستخدم في الطلب"
                required
                pattern="^0[567]\d{8}$"
                autoComplete="tel"
                className="w-full pl-5 pr-12 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all font-medium text-center"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderId.trim() || !phone.trim()}
              className="w-full bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? 'جاري البحث...' : <><Search className="w-4 h-4" /> تتبع الطلب</>}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-center text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-bottom-2">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-10 p-6 sm:p-8 bg-neutral-50 rounded-2xl border border-neutral-200 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Commande N°</p>
                  <p className="text-xl font-black font-serif">{orderId}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-medium">{format(new Date(result.created_at), 'dd MMMM yyyy, HH:mm', { locale: fr })}</p>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-8">
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-4 text-center">Statut Actuel</p>
                
                {(() => {
                  const sInfo = getStatusInfo(result.status);
                  const Icon = sInfo.icon;
                  return (
                    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${sInfo.bg} border border-white/50`}>
                      <Icon className={`w-12 h-12 ${sInfo.color} mb-3`} />
                      <p className={`text-lg font-black ${sInfo.color} text-center`}>{sInfo.text}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
