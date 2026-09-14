'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRoot() {
  const router = useRouter();

  useEffect(() => {
    const adminPath = typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] || 'admin') : 'admin';
    router.replace(`/${adminPath}/dashboard/shipping`);
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a] text-slate-400">
      <div className="animate-pulse">جاري التحويل...</div>
    </div>
  );
}
