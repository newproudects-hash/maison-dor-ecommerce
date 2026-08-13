import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: "Contactez-nous",
  description: "Contactez MAISON D'OR pour toute question ou réclamation.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-20">
        <h1 className="text-3xl md:text-4xl font-serif font-black mb-12 text-center">Contactez-nous</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[#082215]">Nos Coordonnées</h2>
              <p className="text-neutral-500 mb-8 leading-relaxed">
                Notre équipe est à votre disposition pour répondre à toutes vos questions concernant nos produits ou vos commandes.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Téléphone</p>
                  <p className="text-neutral-500 font-mono">+213 555 12 34 56</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Email</p>
                  <p className="text-neutral-500">contact@maisondor.dz</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Boutique (À venir)</p>
                  <p className="text-neutral-500">Alger Centre, Algérie</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Heures d'ouverture</p>
                  <p className="text-neutral-500">Sam - Jeu : 9h00 - 18h00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-neutral-900">Envoyez-nous un message</h2>
            <form className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Nom complet</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all" placeholder="Votre nom" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Téléphone</label>
                <input type="tel" className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all" placeholder="0555 12 34 56" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Sujet</label>
                <select className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white">
                  <option>Question sur un produit</option>
                  <option>Suivi de commande</option>
                  <option>Réclamation / Retour</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
              </div>
              <button type="button" className="w-full bg-[#082215] text-white font-bold py-4 rounded-xl hover:bg-[#0d3020] transition-colors">
                Envoyer le message
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link href="/" className="inline-block text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
