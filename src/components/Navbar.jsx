import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  MessageCircle,
  Settings,
  Menu,
  X,
  PhoneCall,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  Calculator,
  Lock,
} from 'lucide-react';

export function Navbar({
  currency,
  setCurrency,
  whatsappNumber,
  companyName = 'DIGITAL MARK PRO',
  onNavigateAdmin,
  onOpenDevis,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cleanPhone = String(whatsappNumber || '').replace(/\D/g, '');
  const quickWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    '👋 Bonjour DIGITAL MARK PRO, je souhaite échanger avec vous concernant un projet publicitaire.'
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-[#0a0d14]/85 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-3 group text-decoration-none">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Film className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                {companyName || 'DIGITAL MARK PRO'}
              </span>
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium tracking-wide">
              Vidéos & Affiches Publicitaires
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <a
            href="#videos-section"
            className="text-sm font-semibold text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Film className="w-4 h-4 text-amber-400" />
            <span>Vidéos</span>
          </a>
          <a
            href="#posters-section"
            className="text-sm font-semibold text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Affiches</span>
          </a>
          <a
            href="#packages-section"
            className="text-sm font-semibold text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Packs & Tarifs</span>
          </a>
          <button
            onClick={onOpenDevis}
            className="text-sm font-semibold text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Simulateur Devis</span>
          </button>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setCurrency('XAF')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                currency === 'XAF'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              FCFA
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                currency === 'EUR'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              EUR (€)
            </button>
          </div>

          {/* Quick WhatsApp Action Button */}
          <a
            href={quickWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp Direct</span>
          </a>

          {/* Admin Back-Office Button */}
          <button
            onClick={onNavigateAdmin}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-amber-400 transition-colors"
            title="Administration (/login/admin)"
            aria-label="Accéder au back-office administrateur"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0d121c] border-b border-white/10 px-4 py-5 space-y-4 animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-3">
            <a
              href="#videos-section"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-gray-200 hover:text-amber-400"
            >
              🎬 Vidéos Publicitaires
            </a>
            <a
              href="#posters-section"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-gray-200 hover:text-amber-400"
            >
              🎨 Affiches & Bannières
            </a>
            <a
              href="#packages-section"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-gray-200 hover:text-amber-400"
            >
              📦 Packs & Formules
            </a>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDevis();
              }}
              className="text-left px-3 py-2 text-sm font-semibold text-gray-200 hover:text-amber-400"
            >
              🧮 Simulateur de Devis
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              className="text-left px-3 py-2 text-sm font-semibold text-amber-400 hover:text-amber-300"
            >
              🔒 Accès Back-Office (/login/admin)
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
