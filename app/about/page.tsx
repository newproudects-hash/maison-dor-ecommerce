import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez l'histoire de MAISON D'OR et notre engagement pour le luxe en Algérie.",
};

// FIX #32: Rich About page with history, contact info, and images
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] min-h-[400px] flex items-center justify-center">
        <Image src="/hero.jpg" alt="Maison D'Or Boutique" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-white mb-4 tracking-wide">Notre Histoire</h1>
          <p className="text-neutral-300 max-w-2xl mx-auto text-sm md:text-base">L'élégance à la française, l'âme algérienne.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div>
            <h2 className="text-3xl font-serif font-black mb-6 uppercase tracking-wide">Qui sommes-nous ?</h2>
            <div className="space-y-6 text-neutral-600 leading-relaxed text-sm md:text-base">
              <p>
                Fondée avec une passion inébranlable pour le luxe et le raffinement, <strong>MAISON D'OR</strong> est bien plus qu'une simple boutique de maroquinerie. C'est une célébration de la femme moderne, confiante et élégante.
              </p>
              <p>
                Notre aventure a commencé avec une vision claire : rendre les accessoires de luxe accessibles à toutes les femmes en Algérie, sans jamais compromettre la qualité ni le service. Chaque sac, chaque portefeuille, chaque accessoire que nous proposons est soigneusement sélectionné auprès des meilleurs artisans.
              </p>
              <p>
                Nous croyons que le luxe ne réside pas seulement dans le produit, mais dans l'expérience complète : de la découverte sur notre site jusqu'au moment où vous déballez votre commande chez vous.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
            <Image src="/hero.jpg" alt="Collection Maison d'Or" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-black uppercase tracking-wide">Nos Valeurs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-serif">1</div>
              <h3 className="font-bold text-lg mb-4 uppercase">Qualité Supérieure</h3>
              <p className="text-neutral-500 text-sm">Nous ne faisons aucun compromis sur les matériaux et les finitions de nos produits.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-serif">2</div>
              <h3 className="font-bold text-lg mb-4 uppercase">Service Client</h3>
              <p className="text-neutral-500 text-sm">Votre satisfaction est notre priorité absolue. Nous sommes à votre écoute 7j/7.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-serif">3</div>
              <h3 className="font-bold text-lg mb-4 uppercase">Confiance</h3>
              <p className="text-neutral-500 text-sm">Paiement sécurisé à la livraison et politique de retour flexible pour un achat sans stress.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <h2 className="text-3xl font-serif font-black mb-12 uppercase tracking-wide">Contactez-nous</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">Téléphone</p>
              <p className="text-neutral-500 text-sm mt-1">0561 63 10 29</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">Email</p>
              <p className="text-neutral-500 text-sm mt-1">contact@maisondor.dz</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">Siège</p>
              <p className="text-neutral-500 text-sm mt-1">Alger, Algérie</p>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center pb-20">
        <Link href="/boutique" className="inline-block bg-[#082215] text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#0d3020] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1">
          Découvrir la collection
        </Link>
      </div>
    </main>
  );
}
