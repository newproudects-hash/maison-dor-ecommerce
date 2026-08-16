'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

interface StickyHeaderProps {
  announcementText?: string;
  announcementBg?: string;
  announcementEnabled?: boolean;
}

export default function StickyHeader({
  announcementText,
  announcementBg,
  announcementEnabled,
}: StickyHeaderProps) {
  const pathname = usePathname();
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';
  const studioPath = process.env.NEXT_PUBLIC_STUDIO_PATH || 'studio';
  
  if (pathname.startsWith(`/${adminPath}`) || pathname.startsWith(`/${studioPath}`)) {
    return null;
  }

  return (
    <div className="sticky top-0 left-0 w-full z-40">
      {/* Announcement Bar */}
      {announcementEnabled && announcementText && (
        <div
          className="w-full text-black text-center text-xs font-bold py-2 tracking-wide"
          style={{ backgroundColor: announcementBg || '#C9A84C' }}
        >
          {announcementText}
        </div>
      )}
      {/* Navbar */}
      <Navbar />
    </div>
  );
}
