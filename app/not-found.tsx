import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-8xl md:text-9xl font-serif font-black text-neutral-100 mb-6 drop-shadow-sm">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Page Introuvable</h2>
        <p className="text-neutral-500 mb-10 max-w-md mx-auto leading-relaxed">
          Il semble que la page que vous cherchez n'existe plus ou a été déplacée. Ne vous inquiétez pas, notre boutique est toujours ouverte.
        </p>
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 bg-[#082215] text-white px-8 py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-[#0d3020] transition-colors shadow-lg hover:shadow-xl"
        >
          <ShoppingBag className="w-4 h-4" />
          Découvrir nos produits
        </Link>
      </div>
    </main>
  );
}
