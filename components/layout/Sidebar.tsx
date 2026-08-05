'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronDown, X, Globe, Home, Store, Grid3x3 } from 'lucide-react';
import { getCart, CartItem } from '@/lib/store/cartStore';
import { CATEGORIES } from '@/lib/data/products';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇩🇿', sub: 'الجزائر' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', sub: 'France' },
  { code: 'en', label: 'English', flag: '🇬🇧', sub: 'UK / US' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('fr');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[300px] z-50 flex flex-col overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #082215 0%, #0d3020 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="text-white font-serif font-black tracking-widest text-lg">MAISON D'OR</span>
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">

              {/* Home */}
              <Link href="/" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all group">
                <Home className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                <span className="font-semibold tracking-wide text-sm">Accueil</span>
              </Link>

              {/* Store */}
              <Link href="/boutique" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all group">
                <Store className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                <span className="font-semibold tracking-wide text-sm">Boutique</span>
              </Link>

              {/* Category Accordion */}
              <div>
                <button
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Grid3x3 className="w-5 h-5 opacity-70" />
                    <span className="font-semibold tracking-wide text-sm">Catégories</span>
                  </div>
                  <motion.div animate={{ rotate: categoryOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 opacity-60" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {categoryOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pr-2 pb-2 space-y-1">
                        {CATEGORIES.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/boutique/${cat.id}`}
                            onClick={onClose}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 group-hover:bg-amber-400" />
                            {cat.labelFr}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language */}
              <div>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 opacity-70" />
                    <span className="font-semibold tracking-wide text-sm">
                      {LANGUAGES.find(l => l.code === activeLang)?.flag} Langue
                    </span>
                  </div>
                  <motion.div animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 opacity-60" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pr-2 pb-2 space-y-1">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => { setActiveLang(lang.code); setLangOpen(false); onClose(); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-left ${
                              activeLang === lang.code
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <span className="text-xl">{lang.flag}</span>
                            <div>
                              <div className="font-semibold">{lang.label}</div>
                              <div className="text-xs opacity-60">{lang.sub}</div>
                            </div>
                            {activeLang === lang.code && <span className="ml-auto text-amber-400 text-xs">✓</span>}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10">
              <p className="text-white/30 text-xs text-center tracking-widest">© 2026 MAISON D'OR</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
