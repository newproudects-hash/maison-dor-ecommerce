'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';

export default function StudioPage() {
  return (
    <div dir="ltr" className="min-h-screen w-full bg-white">
      <NextStudio config={config} />
    </div>
  );
}
