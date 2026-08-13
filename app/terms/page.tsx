import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation du site MAISON D'OR.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-28 pb-20">
        <h1 className="text-3xl md:text-4xl font-serif font-black mb-3">Conditions d'utilisation</h1>
        <p className="text-neutral-400 text-sm mb-10">Dernière mise à jour : Août 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">1. Acceptation des conditions</h2>
            <p>En utilisant le site MAISON D'OR, vous acceptez pleinement et sans réserve les présentes conditions d'utilisation.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">2. Produits et Prix</h2>
            <p>Les prix indiqués sont en Dinar Algérien (DA) et sont définitifs. Nous nous réservons le droit de modifier les prix à tout moment. Les produits demeurent la propriété de MAISON D'OR jusqu'au paiement complet.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">3. Commandes</h2>
            <p>Toute commande passée sur le site est ferme. Cependant, nous nous réservons le droit d'annuler une commande en cas d'indisponibilité du produit ou de litige précédent avec le client.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">4. Propriété intellectuelle</h2>
            <p>Tout le contenu du site (textes, images, logos) est la propriété exclusive de MAISON D'OR. Toute reproduction est interdite sans autorisation écrite.</p>
          </section>
        </div>

        <Link href="/" className="inline-block mt-12 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          ← Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
