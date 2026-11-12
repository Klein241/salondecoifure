import React from 'react';
import { Film, MessageCircle, ArrowUp, ShieldCheck, Zap } from 'lucide-react';
import { getCleanImageUrl } from '../utils/theme';

export function Footer({
  whatsappNumber,
  companyName,
  showDevis = true,
  showVideos = true,
  showPosters = true,
  showPackages = true,
  showAbout = true,
  settings = {},
}) {
  const brandName = settings.company_name || companyName || 'Notre Entreprise';
  const cleanPhone = String(whatsappNumber || '').replace(/\D/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `👋 Bonjour ${brandName}, je souhaite échanger avec vous.`
  )}`;

  const navLinks = [
    showVideos && { label: '🎬 Galerie Vidéos', href: '#videos-section' },
    showPosters && { label: '🎨 Affiches & Graphismes', href: '#posters-section' },
    showPackages && { label: '📦 Packs & Formules', href: '#packages-section' },
    showAbout && { label: '❤️ Notre Histoire & À propos', href: '#about-section' },
    showDevis && { label: '🧮 Simulateur de Devis', href: '#devis-section' },
  ].filter(Boolean);

  // Logo ou Icône dynamique
  const logoUrl = getCleanImageUrl(settings.company_logo_url);
  const isCosmetic = brandName.toLowerCase().includes('cosmet');
  const defaultEmoji = isCosmetic ? '✨' : '🎬';
  const iconEmoji = settings.company_icon_emoji || (logoUrl ? null : defaultEmoji);

  // Description, Textes et Options du Pied de page configurables
  const footerDesc =
    settings.footer_description ||
    settings.company_description ||
    'Votre partenaire de confiance pour des produits et prestations haut de gamme. Qualité certifiée et accompagnement réactif.';
  const footerContactTitle = settings.footer_contact_title || 'Contact Instantané';
  const footerContactBtn = settings.footer_contact_btn_text || 'Commencer sur WhatsApp';
  const footerContactSub =
    settings.footer_contact_subtext ||
    'Réponse rapide en direct sur WhatsApp. Accompagnement sur-mesure.';
  const footerCopyright =
    settings.footer_copyright_text ||
    `© ${new Date().getFullYear()} ${brandName} — Tous droits réservés`;
  const footerBadge =
    settings.footer_badge_text || 'Haute Performance · Sécurisé · Service Client 7j/7';
  const showNav =
    settings.footer_show_links !== false && settings.footer_show_links !== 'false';
  const showContact =
    settings.footer_show_contact !== false && settings.footer_show_contact !== 'false';

  return (
    <footer
      className="pt-12 pb-6 border-t transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-main, #070a10)',
        borderColor: 'var(--border-subtle, rgba(255,255,255,0.1))',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="w-10 h-10 object-contain rounded-xl border border-white/10 bg-white/5 p-1"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-lg">
                  {iconEmoji}
                </div>
              )}
              <div>
                <div
                  className="font-display font-extrabold text-lg"
                  style={{ color: 'var(--text-title, #ffffff)' }}
                >
                  {brandName}
                </div>
                <div
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--accent-gold, #f59e0b)' }}
                >
                  {settings.tagline || 'Excellence & Qualité'}
                </div>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-muted, #9ca3af)' }}
            >
              {footerDesc}
            </p>
          </div>

          {/* Quick Links */}
          {showNav && (
            <div>
              <h4
                className="text-sm font-bold uppercase tracking-wider mb-4"
                style={{ color: 'var(--text-title, #ffffff)' }}
              >
                Navigation
              </h4>
              {navLinks.length > 0 ? (
                <ul
                  className="space-y-2 text-sm"
                  style={{ color: 'var(--text-muted, #9ca3af)' }}
                >
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--text-muted, #9ca3af)' }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-muted, #9ca3af)' }}
                >
                  Catalogue accessible directement depuis l'accueil.
                </p>
              )}
            </div>
          )}

          {/* Contact */}
          {showContact && (
            <div>
              <h4
                className="text-sm font-bold uppercase tracking-wider mb-4"
                style={{ color: 'var(--text-title, #ffffff)' }}
              >
                {footerContactTitle}
              </h4>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm px-5 py-3 rounded-xl font-bold gap-2 mb-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-500/25 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                {footerContactBtn}
              </a>
              <p
                className="text-xs leading-relaxed whitespace-pre-line"
                style={{ color: 'var(--text-muted, #9ca3af)' }}
              >
                {footerContactSub}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div
          className="border-t pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderColor: 'var(--border-subtle, rgba(255,255,255,0.1))', color: 'var(--text-muted, #9ca3af)' }}
        >
          <span>{footerCopyright}</span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{footerBadge}</span>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            style={{ color: 'var(--text-title, #ffffff)' }}
            title="Haut de page"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
