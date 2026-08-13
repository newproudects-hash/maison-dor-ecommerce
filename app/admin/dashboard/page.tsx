'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LogOut, Package, TrendingUp, CheckCircle, Clock,
  RefreshCw, Filter, Eye, LayoutDashboard, Settings, ShoppingBag
} from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  wilaya: string;
  delivery_type: string;
  total: number;
  status: string;
  created_at: string;
}

// Status config
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'pending':   { label: 'قيد الانتظار', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  'confirmed': { label: 'مؤكد',         color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  'shipped':   { label: 'جاري التوصيل', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  'delivered': { label: 'تم التسليم',   color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  'cancelled': { label: 'ملغي',         color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.created_at.startsWith(today)).length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const filteredOrders = orders
    .filter(o => activeFilter === 'all' || o.status === activeFilter)
    .filter(o => {
      const term = searchTerm.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(term) ||
        o.customer_name.toLowerCase().includes(term) ||
        o.phone.includes(term) ||
        o.wilaya.toLowerCase().includes(term)
      );
    });

  const STATS = [
    { label: 'إجمالي الطلبات', value: orders.length, icon: Package,       color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
    { label: 'بانتظار التأكيد', value: pendingOrders,  icon: Clock,         color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'الإيرادات (DA)',  value: revenue.toLocaleString(), icon: TrendingUp, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'تم التسليم',      value: deliveredOrders, icon: CheckCircle,  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ background: '#0f172a', color: '#f1f5f9' }}>
      
      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 flex flex-col" style={{ background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <div className="px-6 py-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h1 className="font-serif text-xl font-black tracking-widest uppercase" style={{ color: '#C9A84C' }}>
            MAISON D&apos;OR
          </h1>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'الطلبات', href: '/admin/dashboard', active: true },
            { icon: ShoppingBag,     label: 'أسعار التوصيل', href: '/admin/dashboard/shipping', active: false },
            { icon: Settings,        label: 'إدارة المحتوى (Sanity)', href: '/studio', active: false },
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

        {/* Logout */}
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

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black tracking-wide text-white">لوحة التحكم</h2>
            <p className="text-sm text-slate-400 mt-1">
              {new Date().toLocaleDateString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>

        {/* ── STATS ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          {STATS.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-6 rounded-2xl"
              style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
              </div>
              <p className="text-3xl font-black text-white mb-1">{value}</p>
              <p className="text-xs font-bold text-slate-400 tracking-wide">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── ORDERS TABLE ──────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}>
          
          {/* Table Header */}
          <div className="px-6 py-5 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h3 className="font-serif text-lg font-black text-white">الطلبات الأخيرة</h3>
            
            {/* Status Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 mr-1" />
              {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
                  style={{
                    background: activeFilter === f ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
                    color: activeFilter === f ? '#C9A84C' : '#64748b',
                    border: activeFilter === f ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent',
                  }}
                >
                  {f === 'all' ? 'الكل' : STATUS_CONFIG[f]?.label || f}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <input
              type="text"
              placeholder="البحث برقم الطلب، اسم العميل، الهاتف، أو الولاية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['# الطلب', 'التاريخ', 'العميل', 'الولاية', 'التوصيل', 'المبلغ', 'الحالة', 'تغيير'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={`skeleton-row-${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {[...Array(8)].map((_, j) => (
                        <td key={`skeleton-col-${j}`} className="px-5 py-4">
                          <div className="h-4 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: `${60 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-500 text-sm">
                      لا توجد طلبات
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => {
                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending'];
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="transition-all"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td className="px-5 py-4 font-black text-sm" style={{ color: '#C9A84C' }}>
                          {order.order_number}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400">
                          {new Date(order.created_at).toLocaleDateString('ar-DZ', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-sm text-white">{order.customer_name}</p>
                          <p className="text-[10px] text-slate-500" dir="ltr">{order.phone}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300 font-medium">{order.wilaya}</td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded-md"
                            style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                            {order.delivery_type === 'home' ? '🏠 منزل' : '🏪 بريد'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-black text-sm text-white">
                          {order.total.toLocaleString()} DA
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide"
                            style={{ background: sc.bg, color: sc.color }}
                          >
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className="text-[10px] font-bold px-2 py-1.5 rounded-lg outline-none cursor-pointer transition-all"
                            style={{
                              background: 'rgba(255,255,255,0.07)',
                              color: '#94a3b8',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="confirmed">مؤكد</option>
                            <option value="shipped">جاري التوصيل</option>
                            <option value="delivered">تم التسليم</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-xs text-slate-500">
              {filteredOrders.length} طلب • يتحدث كل 30 ثانية
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-bold">مباشر</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
