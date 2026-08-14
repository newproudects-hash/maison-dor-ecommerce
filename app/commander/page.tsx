'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Check, Home, Building2, ShoppingBag } from 'lucide-react';
import { getCart, clearCart, getCartTotal, CartItem } from '@/lib/store/cartStore';
import { WILAYAS, LIVRAISON_DOMICILE, LIVRAISON_BUREAU } from '@/lib/data/wilayas';
import Navbar from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';
import { generateOrderNumber } from '@/lib/utils/orderNumber';

type DeliveryType = 'domicile' | 'bureau';

export default function CommanderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cart] = useState<CartItem[]>(getCart);

  const [form, setForm] = useState({
    prenom: '', nom: '', phone: '', wilaya: '', adresse: '',
  });
  const [delivery, setDelivery] = useState<DeliveryType>('domicile');

  const subtotal = getCartTotal(cart);
  const shipping = delivery === 'domicile' ? LIVRAISON_DOMICILE : LIVRAISON_BUREAU;
  const total = subtotal + shipping;

  const isStep1Valid = form.prenom && form.nom && form.phone && form.wilaya;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const orderNumber = generateOrderNumber();
      const wilayaCode = WILAYAS.findIndex(w => w === form.wilaya) + 1;
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          firstName: form.prenom,
          lastName: form.nom,
          phone: form.phone,
          wilayaName: form.wilaya,
          wilayaCode: wilayaCode.toString().padStart(2, '0'),
          deliveryType: delivery,
          deliveryPrice: shipping,
          address: form.adresse,
          items: cart.map(item => ({
          productId: item.productId,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          imageUrl: item.image,
          slug: item.slug,
        })),
          subtotal,
          total
        })
      });
      
      if (!res.ok) throw new Error('Erreur réseau');
      
      clearCart();
      router.push(`/merci?orderId=${orderNumber}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      console.error('[Commander] Submit error:', msg);
      alert('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && step === 1) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Navbar />
        <ShoppingBag className="w-12 h-12 text-neutral-300 mt-20" />
        <p className="text-neutral-500">Votre panier est vide.</p>
        <Link href="/boutique" className="text-sm underline text-neutral-700">Retour à la boutique</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-20 pb-16 px-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-serif font-black tracking-wide text-center mb-8">Finaliser la commande</h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step > s ? 'bg-[#082215] text-white' : step === s ? 'bg-[#082215] text-white ring-4 ring-green-200' : 'bg-neutral-200 text-neutral-400'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`h-0.5 w-16 md:w-24 transition-all ${step > s ? 'bg-[#082215]' : 'bg-neutral-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-8 mb-8">
          {['Informations', 'Livraison', 'Confirmation'].map((label, i) => (
            <span key={label} className={`text-xs font-bold tracking-wider uppercase ${step === i + 1 ? 'text-[#082215]' : 'text-neutral-400'}`}>
              {label}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1: Info */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-serif font-black text-lg">Vos informations</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide block mb-1.5">Prénom</label>
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                      placeholder="Votre prénom"
                      className="w-full border-2 border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#082215] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide block mb-1.5">Nom</label>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      placeholder="Votre nom"
                      className="w-full border-2 border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#082215] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide block mb-1.5">Numéro de téléphone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0561631029"
                    className="w-full border-2 border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#082215] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide block mb-1.5">Wilaya</label>
                  <select
                    value={form.wilaya}
                    onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                    className="w-full border-2 border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#082215] transition-colors bg-white appearance-none"
                  >
                    <option value="">Sélectionner votre wilaya...</option>
                    {WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide block mb-1.5">Détails de l'adresse</label>
                  <textarea
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                    placeholder="Cité, rue, numéro d'appartement..."
                    rows={3}
                    className="w-full border-2 border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#082215] transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full bg-[#082215] text-white py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#0d3020] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuer <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Delivery */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-serif font-black text-lg">Mode de livraison</h2>

                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${delivery === 'domicile' ? 'border-[#082215] bg-[#082215]/5' : 'border-neutral-200 hover:border-neutral-300'}`}>
                  <input type="radio" name="delivery" value="domicile" checked={delivery === 'domicile'} onChange={() => setDelivery('domicile')} className="hidden" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${delivery === 'domicile' ? 'border-[#082215]' : 'border-neutral-300'}`}>
                    {delivery === 'domicile' && <div className="w-2.5 h-2.5 rounded-full bg-[#082215]" />}
                  </div>
                  <Home className={`w-6 h-6 ${delivery === 'domicile' ? 'text-[#082215]' : 'text-neutral-400'}`} />
                  <div className="flex-1">
                    <p className="font-bold text-sm">Livraison à domicile</p>
                    <p className="text-neutral-400 text-xs mt-0.5">Livré directement chez vous en 2–5 jours</p>
                  </div>
                  <span className="font-black text-sm text-[#082215]">+{LIVRAISON_DOMICILE} DA</span>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${delivery === 'bureau' ? 'border-[#082215] bg-[#082215]/5' : 'border-neutral-200 hover:border-neutral-300'}`}>
                  <input type="radio" name="delivery" value="bureau" checked={delivery === 'bureau'} onChange={() => setDelivery('bureau')} className="hidden" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${delivery === 'bureau' ? 'border-[#082215]' : 'border-neutral-300'}`}>
                    {delivery === 'bureau' && <div className="w-2.5 h-2.5 rounded-full bg-[#082215]" />}
                  </div>
                  <Building2 className={`w-6 h-6 ${delivery === 'bureau' ? 'text-[#082215]' : 'text-neutral-400'}`} />
                  <div className="flex-1">
                    <p className="font-bold text-sm">Retrait en bureau (Stop Desk)</p>
                    <p className="text-neutral-400 text-xs mt-0.5">À retirer au bureau de livraison le plus proche</p>
                  </div>
                  <span className="font-black text-sm text-[#082215]">+{LIVRAISON_BUREAU} DA</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 border-2 border-neutral-200 text-neutral-600 px-5 py-4 rounded-2xl font-bold text-sm hover:border-neutral-400 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-[#082215] text-white py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#0d3020] transition-colors">
                  Continuer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="font-serif font-black text-lg">Résumé de votre commande</h2>

                {/* Customer Info Summary */}
                <div className="bg-neutral-50 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Client</p>
                  <p className="text-sm font-semibold text-neutral-800">{form.prenom} {form.nom}</p>
                  <p className="text-sm text-neutral-500">{form.phone}</p>
                  <p className="text-sm text-neutral-500">{form.wilaya}</p>
                  {form.adresse && <p className="text-sm text-neutral-500">{form.adresse}</p>}
                  <p className="text-sm text-neutral-500 mt-1">
                    {delivery === 'domicile' ? '🏠 Livraison à domicile' : '🏢 Stop Desk'}
                  </p>
                </div>

                {/* Cart Items */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Articles</p>
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-neutral-800 leading-tight">{item.name}</p>
                        <div className="flex gap-2 text-[10px] text-neutral-500 mt-0.5">
                          {item.size && <span>Taille: {item.size}</span>}
                          {item.color && (
                            <span className="flex items-center gap-1">
                              Couleur: <span className="w-2 h-2 rounded-full border border-neutral-200" style={{ backgroundColor: item.color }} />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">x{item.quantity}</p>
                      </div>
                      <p className="font-black text-sm">{(item.price * item.quantity).toLocaleString('fr-DZ')} DA</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-neutral-100 pt-4">
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Sous-total</span>
                    <span className="font-semibold text-neutral-800">{subtotal.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Livraison ({delivery === 'domicile' ? 'Domicile' : 'Stop Desk'})</span>
                    <span className="font-semibold text-neutral-800">{shipping} DA</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-100">
                    <span>Total</span>
                    <span>{total.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex items-center gap-1.5 border-2 border-neutral-200 text-neutral-600 px-5 py-4 rounded-2xl font-bold text-sm hover:border-neutral-400 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-[#082215] text-white py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#0d3020] transition-colors disabled:opacity-50">
                  {isSubmitting ? <span className="animate-pulse">Traitement...</span> : <><Check className="w-4 h-4" /> Confirmer la commande</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
