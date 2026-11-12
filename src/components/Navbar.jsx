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
  Heart,
  ShoppingCart,
} from 'lucide-react';

export function Navbar({
  currency,
  setCurrency,
  whatsappNumber,
  companyName = 'Notre Entreprise',
  tagline = '',
  companyBadge = '',
  logoUrl = '',
  companyIconEmoji = '',
  onNavigateAdmin,
  onNavigateHome,
  onOpenDevis,
  onOpenCart,
  cartCount = 0,
  showCart = true,
  showDevis = true,
  showVideos = true,
  showPosters = true,
  showPackages = true,
  showAbout = true,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cleanPhone = String(whatsappNumber || '').replace(/\D/g, '');
  const quickWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `👋 Bonjour ${companyName || 'l\'équipe'}, je souhaite échanger avec vous.`
  )}`;

  const brandInitials = (companyName || 'ENT')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <header 
      className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors"
      style={{
        backgroundColor: 'var(--bg-secondary, #0a0d14)',
        borderColor: 'var(--border-subtle, rgba(255,255,255,0.1))',
      }}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Brand Logo (Image obligatoire, pas d'emoji) */}
        <a 
          href="/" 
          onClick={(e) => {
            if (onNavigateHome) {
              e.preventDefault();
              onNavigateHome();
            }
          }}
          className="flex items-center gap-3 group text-decoration-none cursor-pointer"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="w-11 h-11 rounded-xl object-contain bg-white/5 border border-white/10 p-1 shadow-lg group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform text-black font-black text-sm tracking-wider">
              <span>{brandInitials}</span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span 
                className="font-display font-extrabold text-xl tracking-tight transition-colors"
                style={{ color: 'var(--text-title, #ffffff)' }}
              >
                {companyName || 'Notre Entreprise'}
              </span>
              {companyBadge && (
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {companyBadge}
                </span>
              )}
            </div>
            <p 
              className="text-[11px] font-medium tracking-wide"
              style={{ color: 'var(--text-muted, #94a3b8)' }}
            >
              {tagline || (isCosmetic ? 'Boutique & Produits Beauté' : 'Vidéos & Affiches Publicitaires')}
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {showVideos && (
            <a
              href="#videos-section"
              className="text-sm font-semibold text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span>Vidéos</span>
            </a>
          )}
          {showPosters && (
            <a
              href="#posters-section"
              className="text-sm font-semibold text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Affiches</span>
            </a>
          )}
          {showPackages && (
            <a
              href="#packages-section"
              className="text-sm font-semibold text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Packs & Tarifs</span>
            </a>
          )}
          {showAbout && (
            <a
              href="#about-section"
              className="text-sm font-semibold text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 text-amber-400" />
              <span>À propos</span>
            </a>
          )}
          {showDevis && (
            <button
              onClick={onOpenDevis}
              className="text-sm font-semibold text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Simulateur Devis</span>
            </button>
          )}
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

          {/* Panier Multi-Commandes */}
          {showCart && (
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
              title="Mon Panier"
              aria-label="Mon Panier"
            >
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          )}

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
        <div 
          className="lg:hidden border-b px-4 py-5 space-y-4 animate-in slide-in-from-top-4 transition-colors"
          style={{
            backgroundColor: 'var(--bg-card, #0d121c)',
            borderColor: 'var(--border-subtle, rgba(255,255,255,0.1))',
          }}
        >
          <nav className="flex flex-col space-y-3">
            {showVideos && (
              <a
                href="#videos-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-gray-200 hover:text-amber-400"
              >
                🎬 Vidéos Publicitaires
              </a>
            )}
            {showPosters && (
              <a
                href="#posters-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-gray-200 hover:text-amber-400"
              >
                🎨 Affiches & Bannières
              </a>
            )}
            {showPackages && (
              <a
                href="#packages-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-gray-200 hover:text-amber-400"
              >
                📦 Packs & Formules
              </a>
            )}
            {showAbout && (
              <a
                href="#about-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-gray-200 hover:text-amber-400"
              >
                ❤️ Notre Histoire & À propos
              </a>
            )}
            {showCart && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCart();
                }}
                className="text-left px-3 py-2 text-sm font-semibold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center justify-between bg-amber-500/10 rounded-xl border border-amber-500/20"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Mon Panier</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-black">
                  {cartCount}
                </span>
              </button>
            )}
            {showDevis && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDevis();
                }}
                className="text-left px-3 py-2 text-sm font-semibold text-gray-200 hover:text-amber-400 cursor-pointer"
              >
                🧮 Simulateur de Devis
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
