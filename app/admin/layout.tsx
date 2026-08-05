import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

/*
 * ACTIVE SKILLS: ui-ux-pro-max
 * DECISION: Admin dashboard uses a simpler system font (Inter) for better data readability,
 * bypassing the luxury fonts of the storefront.
 */

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Admin | MAISON D'OR",
  description: "Système d'administration Maison d'Or",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-[#0A0A0A] text-white selection:bg-gold-primary selection:text-black`}>
      {children}
    </div>
  );
}
