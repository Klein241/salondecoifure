import React from 'react';
import { Film, MessageCircle, ArrowUp, ShieldCheck, Zap } from 'lucide-react';

export function Footer({ whatsappNumber, companyName }) {
  const cleanPhone = String(whatsappNumber || '').replace(/\D/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    '👋 Bonjour DIGITAL MARK PRO, je souhaite un devis pour une création publicitaire.'
  )}`;

  return (
    <footer className="bg-[#070a10] border-t border-white/10 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Film className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="font-display font-extrabold text-lg text-white">
                  {companyName || 'DIGITAL MARK PRO'}
                </div>
                <div className="text-[11px] text-amber-400/90 font-medium">Studio Créatif & Production Publicitaire</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Votre partenaire de création vidéo, graphisme publicitaire et stratégie marketing
              high-impact. Livraison en 24–48h, droits commerciaux inclus.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { label: '🎬 Galerie Vidéos', href: '#videos-section' },
                { label: '🎨 Affiches & Graphismes', href: '#posters-section' },
                { label: '📦 Packs & Formules', href: '#packages-section' },
                { label: '🧮 Simulateur de Devis', href: '#devis-section' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact Instantané
            </h4>
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm px-5 py-3 rounded-xl font-bold gap-2 mb-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-500/25 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              Commencer sur WhatsApp
            </a>
            <p className="text-xs text-gray-400">
              Réponse garantie sous 1h en semaine.
              <br />
              Livraison vidéo dès 24h ouvrées.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>
            © {new Date().getFullYear()} {companyName || 'DIGITAL MARK PRO'} — Tous droits réservés
          </span>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Haute Performance · Sécurisé · CDN Global 24/7</span>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Haut de page"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
