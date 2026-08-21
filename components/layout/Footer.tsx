'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 hover:scale-110 transition-transform drop-shadow-md" fill="none">
    <defs>
      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497"/>
        <stop offset="5%" stopColor="#fdf497"/>
        <stop offset="45%" stopColor="#fd5949"/>
        <stop offset="60%" stopColor="#d6249f"/>
        <stop offset="90%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" fill="url(#ig-grad)"/>
    <circle cx="12" cy="12" r="4.5" fill="none" stroke="white" strokeWidth="1.8"/>
    <circle cx="17.5" cy="6.5" r="1.1" fill="white"/>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 hover:scale-110 transition-transform drop-shadow-md" fill="#1877F2">
    <rect width="24" height="24" rx="5" fill="#1877F2"/>
    <path d="M16.5 8H14.5C13.9 8 13.5 8.4 13.5 9V11H16.5L16 14H13.5V21H10.5V14H8.5V11H10.5V9C10.5 7.1 11.9 5.5 14 5.5H16.5V8Z" fill="white"/>
  </svg>
);

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
          MAISON D&apos;OR
        </h2>
        
        <div className="flex items-center justify-center gap-6 md:gap-8 mb-8 flex-wrap">
          <a href="https://www.instagram.com/la_maison_dor_10?igsh=MXI5YWxoaTRpOThxcQ%3D%3D" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex items-center justify-center transition-all hover:scale-110">
            <InstagramIcon />
          </a>
          <a href="https://www.facebook.com/share/1BnoMw7tND/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex items-center justify-center transition-all hover:scale-110">
            <FacebookIcon />
          </a>
          <a href="https://chat.whatsapp.com/LoMHVJuVw3Y2lvsvC7Kg9l?s=hd&p=i&mlu=4&amv=0" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex items-center justify-center transition-all hover:scale-110 drop-shadow-md">
            <WhatsAppIcon />
          </a>
          <a href="https://t.me/hdkd017" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="flex items-center justify-center transition-all hover:scale-110 drop-shadow-md">
            <TelegramIcon />
          </a>
          <a href="https://www.tiktok.com/@abdeldjalilrouibi?_r=1&_t=ZS-98wMVUKUMpI" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="flex items-center justify-center transition-all hover:scale-110 drop-shadow-md">
            <TikTokIcon />
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-[11px] md:text-sm font-medium text-neutral-300/80 mb-10">
          <Link href="/about" className="hover:text-white transition-colors">من نحن</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
          <Link href="/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link>
          <Link href="/shipping" className="hover:text-white transition-colors">الشحن والتوصيل</Link>
          <Link href="/contact" className="hover:text-white transition-colors">تواصل معنا</Link>
        </div>
        
        <div className="w-full max-w-md border-t border-white/20 pt-8 text-[10px] md:text-xs text-neutral-400 font-medium">
          © {new Date().getFullYear()} MAISON D&apos;OR. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
