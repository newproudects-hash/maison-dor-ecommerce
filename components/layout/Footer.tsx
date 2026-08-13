import Link from 'next/link';

const FacebookIcon = () => (
  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

const TelegramIcon = () => (
  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
);

const TikTokIcon = () => (
  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.07 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
);

const WhatsAppIcon = () => (
  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.398 0 0 5.405 0 12.051c0 2.302.597 4.509 1.733 6.444L.012 24l5.653-1.488C7.545 23.551 9.756 24 12.031 24 18.667 24 24 18.595 24 12.051 24 5.405 18.667 0 12.031 0zm.003 20.089c-1.892 0-3.743-.509-5.362-1.472l-.385-.228-3.987 1.047 1.066-3.882-.25-.399c-1.063-1.696-1.624-3.666-1.624-5.698C1.492 5.066 5.577.973 10.016.973c4.439 0 8.523 4.093 8.523 8.532 0 4.44-4.084 8.532-8.524 8.532h-.002zm4.678-6.386c-.256-.128-1.517-.749-1.751-.834-.234-.085-.404-.128-.574.128-.17.256-.66.834-.809 1.005-.149.171-.298.192-.554.064-.256-.128-1.083-.399-2.063-1.277-.763-.683-1.278-1.528-1.427-1.784-.149-.256-.016-.394.112-.522.115-.115.256-.299.384-.448.128-.149.171-.256.256-.427.085-.17.042-.32-.022-.448-.064-.128-.574-1.387-.787-1.899-.208-.499-.418-.431-.574-.439-.149-.008-.319-.009-.49-.009-.17 0-.447.064-.681.32-.234.256-.895.875-.895 2.134 0 1.259.916 2.476 1.044 2.646.128.17 1.803 2.753 4.368 3.86.611.264 1.087.421 1.458.539.613.194 1.171.167 1.614.101.497-.074 1.517-.619 1.73-1.216.213-.597.213-1.109.149-1.216-.064-.107-.234-.171-.49-.299z"/></svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#082215] text-white py-10 md:py-16 px-4 md:px-8 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-4xl font-serif font-black tracking-widest uppercase mb-8">
          MAISON D'OR
        </h2>
        
        <div className="flex items-center gap-5 md:gap-6 mb-8">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="opacity-80 hover:opacity-100 hover:text-[#1877F2] transition-all hover:scale-110"><FacebookIcon /></a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="opacity-80 hover:opacity-100 hover:text-[#26A5E4] transition-all hover:scale-110"><TelegramIcon /></a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="opacity-80 hover:opacity-100 hover:text-white transition-all hover:scale-110"><TikTokIcon /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-80 hover:opacity-100 hover:text-[#E1306C] transition-all hover:scale-110"><InstagramIcon /></a>
          <a href="https://wa.me/213555123456" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="opacity-80 hover:opacity-100 hover:text-[#25D366] transition-all hover:scale-110"><WhatsAppIcon /></a>
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
