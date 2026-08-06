'use client';

import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'قيد الانتظار', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/40' },
  { value: 'confirmed', label: 'تم التأكيد',    color: 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/40' },
  { value: 'shipped',   label: 'تم الشحن',      color: 'bg-orange-500/20 text-orange-400 border-orange-500/50 hover:bg-orange-500/40' },
  { value: 'delivered', label: 'تم التسليم',    color: 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/40' },
  { value: 'cancelled', label: 'ملغية',          color: 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/40' },
];

interface Props {
  orderId: string;
  currentStatus: string;
  updateAction: (formData: FormData) => Promise<void>;
}

export default function OrderStatusSelect({ orderId, currentStatus, updateAction }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const current = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  const handleSelect = async (value: string) => {
    setOpen(false);
    if (value === status) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('orderId', orderId);
    fd.append('status', value);
    await updateAction(fd);
    setStatus(value);
    setLoading(false);
  };

  return (
    <div className="relative inline-block text-right">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border rounded-sm transition-all ${current.color} ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? '...' : current.label} ▾
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-[#111] border border-white/20 rounded-sm shadow-2xl min-w-[140px] overflow-hidden">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-right px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all border-b border-white/5 last:border-0 ${opt.color} ${opt.value === status ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
