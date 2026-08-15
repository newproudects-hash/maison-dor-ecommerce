'use client';

import { useEffect, useState } from 'react';
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
  return (
    <div className="sticky top-0 left-0 w-full z-40">
      {/* Announcement Bar */}
      {announcementEnabled && announcementText && (
        <div
          className="w-full text-black text-center text-xs font-bold py-2 tracking-wide"
          style={{ backgroundColor: announcementBg || '#D4AF37' }}
        >
          {announcementText}
        </div>
      )}
      {/* Navbar */}
      <Navbar />
    </div>
  );
}
