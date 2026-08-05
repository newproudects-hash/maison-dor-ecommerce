'use client';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'قيد الانتظار' },
  { value: 'confirmed', label: 'مؤكدة' },
  { value: 'shipped',   label: 'قيد التوصيل' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'cancelled', label: 'ملغاة' },
];

interface Props {
  orderId: string;
  currentStatus: string;
  updateAction: (formData: FormData) => Promise<void>;
}

export default function OrderStatusSelect({ orderId, currentStatus, updateAction }: Props) {
  return (
    <form action={updateAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={(e) => {
          const form = e.target.closest('form');
          if (form) form.requestSubmit();
        }}
        className="bg-[#0A0A0A] border border-white/20 text-xs text-white p-2 outline-none cursor-pointer rounded-sm hover:border-white/40 transition-colors"
      >
        {STATUS_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </form>
  );
}
