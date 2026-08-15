'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', subject: 'Question sur un produit', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', phone: '', subject: 'Question sur un produit', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

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
                  <p className="font-bold text-neutral-900">Heures d&apos;ouverture</p>
                  <p className="text-neutral-500">Sam - Jeu : 9h00 - 18h00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-neutral-900">Envoyez-nous un message</h2>

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <p className="text-xl font-bold text-neutral-900">Message envoyé !</p>
                <p className="text-sm text-neutral-500">Nous vous répondrons dans les plus brefs délais.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-sm underline text-neutral-500 hover:text-neutral-800"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                    placeholder="0555 12 34 56"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Sujet</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white"
                  >
                    <option>Question sur un produit</option>
                    <option>Suivi de commande</option>
                    <option>Réclamation / Retour</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none"
                    placeholder="Comment pouvons-nous vous aider ?"
                  />
                </div>
                {status === 'error' && (
                  <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                    Erreur lors de l&apos;envoi. Veuillez réessayer.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-[#082215] text-white font-bold py-4 rounded-xl hover:bg-[#0d3020] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {status === 'sending' ? (
                    <span className="animate-pulse">Envoi en cours...</span>
                  ) : (
                    <><Send className="w-4 h-4" /> Envoyer le message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center mt-16">
          <Link href="/" className="inline-block text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
