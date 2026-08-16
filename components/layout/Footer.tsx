'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TelegramIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram" className="w-7 h-7 md:w-8 md:h-8 hover:scale-110 transition-transform drop-shadow-md" />
);

const TikTokIcon = () => (
  <img src="https://img.icons8.com/color/96/tiktok--v1.png" alt="TikTok" className="w-7 h-7 md:w-8 md:h-8 hover:scale-110 transition-transform drop-shadow-md" />
);

const WhatsAppIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-7 h-7 md:w-8 md:h-8 hover:scale-110 transition-transform drop-shadow-md" />
);

export default function Footer() {
  const pathname = usePathname();
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';
  const studioPath = process.env.NEXT_PUBLIC_STUDIO_PATH || 'studio';
  
  if (pathname.startsWith(`/${adminPath}`) || pathname.startsWith(`/${studioPath}`)) {
    return null;
  }

  return (
    <footer className="bg-[#082215] text-white py-10 md:py-16 px-4 md:px-8 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-4xl font-serif font-black tracking-widest uppercase mb-8">
          MAISON D'OR
        </h2>
        
        <div className="flex items-center justify-center gap-8 md:gap-10 mb-8">
          <a href="https://chat.whatsapp.com/LoMHVJuVw3Y2lvsvC7Kg9l?s=hd&p=i&mlu=4&amv=0" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex items-center justify-center transition-all hover:scale-110 drop-shadow-md"><WhatsAppIcon /></a>
          <a href="https://t.me/hdkd017" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="flex items-center justify-center transition-all hover:scale-110 drop-shadow-md"><TelegramIcon /></a>
          <a href="https://www.tiktok.com/@abdeldjalilrouibi?_r=1&_t=ZS-98wMVUKUMpI" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="flex items-center justify-center transition-all hover:scale-110 drop-shadow-md"><TikTokIcon /></a>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-[11px] md:text-sm font-medium text-neutral-300/80 mb-10">
          <Link href="/about" className="hover:text-white transition-colors">À propos</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Politique de confidentialité</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</Link>
          <Link href="/shipping" className="hover:text-white transition-colors">Expédition & Livraison</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        
        <div className="w-full max-w-md border-t border-white/20 pt-8 text-[10px] md:text-xs text-neutral-400 font-medium">
          © {new Date().getFullYear()} MAISON D'OR. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
