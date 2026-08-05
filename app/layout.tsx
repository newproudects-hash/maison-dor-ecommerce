import type {Metadata} from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import Footer from '@/components/layout/Footer';
import './globals.css'; // Global styles

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: "MAISON D'OR",
  description: "L'élégance à votre portée — Collection exclusive de sacs de luxe",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${jakarta.variable} font-sans antialiased flex flex-col min-h-screen`} suppressHydrationWarning>
        {children}
        <Footer />
      </body>
    </html>
  );
}
