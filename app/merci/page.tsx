'use client';

import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ShoppingBag, CheckCircle, Loader2 } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

function MerciContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'MD-' + Math.floor(10000 + Math.random() * 90000);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sound effect
  useEffect(() => {
    try {
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.15 + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.35);
      });
    } catch {
      // Audio not supported
    }
  }, []);

  // Confetti
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#D4AF37', '#082215', '#25D366', '#1877F2', '#E1306C', '#ffffff', '#FBD38D'];
    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; angle: number; spin: number }[] = [];

    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.15,
      });
    }

    let frame: number;
    let alive = true;

    const animate = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.05; // gravity
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      frame = requestAnimationFrame(animate);
    };

    animate();

    const timeout = setTimeout(() => {
      alive = false;
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4500);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Confetti canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(8,34,21,0.05) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Check circle animation */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-[#082215] flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-14 h-14 text-amber-400" strokeWidth={1.5} />
            </div>
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-[#082215]"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.2, repeat: 2, ease: 'easeOut', delay: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber-400"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.4, repeat: 2, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-amber-600 text-xs tracking-[0.3em] uppercase font-bold mb-3">Commande confirmée</p>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-neutral-900 mb-4">
            Merci pour votre confiance ! 🎁
          </h1>
          <p className="text-neutral-500 text-sm md:text-base leading-relaxed mb-2">
            Votre commande a été reçue avec succès. Notre équipe vous contactera très prochainement pour confirmation.
          </p>
          <p className="text-neutral-400 text-sm mb-8">
            Numéro de commande: <span className="font-black text-neutral-900">{orderId}</span>
          </p>

          {/* What's next */}
          <div className="bg-neutral-50 rounded-2xl p-5 mb-8 text-left space-y-3">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider text-center mb-4">Prochaines étapes</p>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#082215] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
              <p className="text-sm text-neutral-600">Vous recevrez un appel de confirmation dans les 24h.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#082215] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
              <p className="text-sm text-neutral-600">Votre commande sera expédiée sous 1–2 jours ouvrables.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#082215] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
              <p className="text-sm text-neutral-600">Livraison estimée: 2–5 jours ouvrables.</p>
            </div>
          </div>

          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[#082215] text-white px-8 py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-[#0d3020] transition-colors shadow-lg hover:shadow-xl"
          >
            <ShoppingBag className="w-4 h-4" />
            Continuer les achats
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function MerciPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <MerciContent />
    </Suspense>
  );
}
