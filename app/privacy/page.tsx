import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: "Politique de confidentialité de MAISON D'OR — vos données sont protégées.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-28 pb-20">
        <h1 className="text-3xl md:text-4xl font-serif font-black mb-3">Politique de confidentialité</h1>
        <p className="text-neutral-400 text-sm mb-10">Dernière mise à jour : Août 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">1. Collecte des données</h2>
            <p>Nous collectons uniquement les informations nécessaires au traitement de votre commande : nom, prénom, numéro de téléphone, wilaya et adresse de livraison. Nous ne collectons aucune donnée de carte bancaire (paiement à la livraison uniquement).</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">2. Utilisation des données</h2>
            <p>Vos données sont utilisées exclusivement pour : confirmer et livrer votre commande, vous contacter en cas de besoin, et améliorer notre service. Nous ne vendons ni ne partageons vos données avec des tiers à des fins commerciales.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">3. Conservation des données</h2>
            <p>Vos données sont conservées pendant 3 ans après votre dernière commande, conformément à la législation algérienne.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">4. Vos droits</h2>
            <p>Vous pouvez demander l'accès, la rectification ou la suppression de vos données en nous contactant à tout moment via notre page <Link href="/contact" className="text-[#082215] underline">Contact</Link>.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">5. Cookies</h2>
            <p>Notre site utilise uniquement des cookies techniques nécessaires au bon fonctionnement (panier, session). Aucun cookie de traçage publicitaire n'est utilisé.</p>
          </section>
        </div>

        <Link href="/" className="inline-block mt-12 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          ← Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
