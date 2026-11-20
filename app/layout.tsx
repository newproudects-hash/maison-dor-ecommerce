import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/layout/BackToTop';
import StickyHeader from '@/components/layout/StickyHeader';
import MetaPixel from '@/components/analytics/MetaPixel';
import { getHomePageSettings } from '@/lib/sanity/queries';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: "👑 LA MAISON DOR 🏅 — متجر فاخر في الجزائر",
    template: "%s | 👑 LA MAISON DOR 🏅",
  },
  description: "اكتشف مجموعة 👑 LA MAISON DOR 🏅 الحصرية — حقائب، إكسسوارات وأزياء فاخرة بالتوصيل لكل الجزائر.",
  authors: [{ name: "👑 LA MAISON DOR 🏅" }],
  creator: "👑 LA MAISON DOR 🏅",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.maisondor.dz'),
  openGraph: {
    type: 'website',
    locale: 'ar_DZ',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.maisondor.dz',
    siteName: "👑 LA MAISON DOR 🏅",
    title: "👑 LA MAISON DOR 🏅 — متجر فاخر في الجزائر",
    description: "مجموعة حصرية من الحقائب والإكسسوارات الفاخرة بالتوصيل لكل الجزائر.",
    images: [{ url: '/hero.jpg', width: 1920, height: 1080, alt: "👑 LA MAISON DOR 🏅" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "👑 LA MAISON DOR 🏅",
    description: "حقائب وإكسسوارات فاخرة — التوصيل لكل الجزائر.",
    images: ['/hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch announcement bar settings server-side
  let homeSettings: Record<string, unknown> | null = null;
  try {
    homeSettings = await getHomePageSettings();
  } catch { /* non-fatal */ }

  const announcement = homeSettings?.announcementBar as
    { enabled?: boolean; text?: string; bgColor?: string } | undefined;

  return (
    <html lang="ar" dir="rtl">
      <body className={`${playfair.variable} ${jakarta.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <MetaPixel />
        {/* Sticky header (announcement bar + navbar) on ALL pages */}
        <StickyHeader
          announcementEnabled={announcement?.enabled}
          announcementText={announcement?.text}
          announcementBg={announcement?.bgColor}
        />
        {children}
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
