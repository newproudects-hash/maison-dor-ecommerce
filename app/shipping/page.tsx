import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Expédition & Livraison",
  description: "Informations sur la livraison MAISON D'OR — partout en Algérie.",
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-28 pb-20">
        <h1 className="text-3xl md:text-4xl font-serif font-black mb-3">Expédition & Livraison</h1>
        <p className="text-neutral-400 text-sm mb-10">Livraison partout en Algérie 🇩🇿</p>

        <div className="space-y-8 text-neutral-600 leading-relaxed">
          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">🚚 Modes de livraison</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-neutral-800">Livraison à domicile</p>
                  <p className="text-sm text-neutral-500">Livraison directement chez vous</p>
                </div>
                <p className="font-bold text-[#082215]">Variable par wilaya</p>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-neutral-800">Retrait en bureau de livraison</p>
                  <p className="text-sm text-neutral-500">Plus économique, récupérez votre colis</p>
                </div>
                <p className="font-bold text-[#082215]">Variable par wilaya</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">⏱️ Délais de livraison</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-green-600">✓</span> Alger & banlieue : 1–2 jours ouvrables</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Grandes villes : 2–3 jours ouvrables</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Wilayas éloignées : 3–5 jours ouvrables</li>
            </ul>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">💳 Paiement</h2>
            <p>Paiement à la livraison uniquement (cash). Aucune carte bancaire requise.</p>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-2">↩️ Politique de retour</h2>
            <p>Retours acceptés sous 7 jours si le produit est dans son état d'origine avec son emballage. Contactez-nous d'abord via la page <Link href="/contact" className="text-[#082215] underline">Contact</Link>.</p>
          </div>
        </div>

        <Link href="/" className="inline-block mt-12 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          ← Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
