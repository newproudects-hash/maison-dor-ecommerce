import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez l'histoire de MAISON D'OR.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-28 pb-20 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-black mb-6">À propos de MAISON D'OR</h1>
        
        <div className="prose prose-neutral mx-auto text-neutral-600 leading-relaxed space-y-6">
          <p className="text-lg">
            MAISON D'OR est née d'une passion pour l'élégance et le raffinement. Notre mission est d'offrir aux femmes algériennes un accès privilégié à des sacs et accessoires de luxe, alliant qualité exceptionnelle et design intemporel.
          </p>
          <p>
            Chaque pièce de notre collection est soigneusement sélectionnée pour répondre aux exigences des femmes modernes, qui recherchent à la fois style, praticité et distinction.
          </p>
          <p>
            Nous nous engageons à offrir une expérience d'achat incomparable, avec une livraison rapide et sécurisée partout en Algérie, et un service client toujours à votre écoute.
          </p>
        </div>

        <Link href="/boutique" className="inline-block mt-12 bg-[#082215] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#0d3020] transition-colors">
          Découvrir la collection
        </Link>
      </div>
    </main>
  );
}
