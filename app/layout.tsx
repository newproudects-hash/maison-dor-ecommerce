import type {Metadata} from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/layout/BackToTop';
import Pixels from '@/components/analytics/Pixels';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: "MAISON D'OR — Sacs de Luxe en Algérie",
    template: "%s | MAISON D'OR",
  },
  description: "Découvrez la collection exclusive MAISON D'OR — sacs, accessoires et mode femme de luxe livrés partout en Algérie.",
  // FIX #66: Removed deprecated meta keywords
  authors: [{ name: "MAISON D'OR" }],
  creator: "MAISON D'OR",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.maisondor.dz'),
  openGraph: {
    type: 'website',
    locale: 'fr_DZ',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.maisondor.dz',
    siteName: "MAISON D'OR",
    title: "MAISON D'OR — Sacs de Luxe en Algérie",
    description: "Collection exclusive de sacs et accessoires de luxe livrés partout en Algérie.",
    images: [{ url: '/hero.jpg', width: 1920, height: 1080, alt: "MAISON D'OR" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MAISON D'OR",
    description: "Sacs et accessoires de luxe — Livraison partout en Algérie.",
    images: ['/hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  // FIX #47: Use standard fr-DZ and auto direction to better support bilingual content
  return (
    <html lang="fr-DZ" dir="auto">
      {/* FIX #53: Removed unjustified suppressHydrationWarning */}
      <body className={`${playfair.variable} ${jakarta.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <Pixels />
        {children}
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
