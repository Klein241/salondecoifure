import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Zap,
  Star,
  Crown,
  Rocket,
  ArrowRight,
} from 'lucide-react';
import {
  formatWhatsAppUrl,
  buildDevisWhatsAppMessage,
  logInquiry,
} from '../api/cloudflare';

export function PackagesSection({ packages, currency, whatsappNumber, settings = {} }) {
  const icons = [Zap, Star, Crown];
  const colors = [
    {
      accent: 'text-sky-400',
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
      btn: 'bg-sky-500 hover:bg-sky-400 text-black',
    },
    {
      accent: 'text-amber-400',
      border: 'border-amber-500/50',
      bg: 'bg-amber-500/10',
      btn: 'bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:brightness-110',
    },
    {
      accent: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      btn: 'bg-purple-600 hover:bg-purple-500 text-white',
    },
  ];

  const handleOrderPack = (pkg) => {
    const message = buildDevisWhatsAppMessage({
      serviceType: pkg.name,
      format: 'Pack Complet',
      duration: null,
      options: pkg.features || [],
      totalPriceFcfa: pkg.price_fcfa,
      totalPriceEur: pkg.price_eur,
      currency,
      clientBrand: '',
      companyName: settings.company_name || 'Notre Entreprise',
    });
    logInquiry({
      service_type: 'package',
      item_id: pkg.id,
      item_title: pkg.name,
      estimated_price_fcfa: pkg.price_fcfa,
      whatsapp_message: message,
    });
    const url = formatWhatsAppUrl(whatsappNumber, message);
    window.open(url, '_blank');
  };

  const sectionBadge = settings.packages_badge || 'Formules & Packs Sur-Mesure';
  const sectionTitle = settings.packages_title || 'Choisissez votre Pack Idéal';
  const sectionSubtitle =
    settings.packages_subtitle ||
    'Des formules calibrées pour booster votre activité quelle que soit la taille de votre projet. Commandez en 1 clic sur WhatsApp.';

  return (
    <section 
      id="packs" 
      className="py-16 md:py-20 border-t transition-colors"
      style={{
        backgroundColor: 'var(--bg-main, #0c101a)',
        borderColor: 'var(--border-subtle, rgba(255,255,255,0.1))',
      }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{sectionBadge}</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: 'var(--text-title, #ffffff)' }}
          >
            {sectionTitle}
          </h2>
          <p 
            className="text-sm sm:text-base mt-3 leading-relaxed"
            style={{ color: 'var(--text-muted, #94a3b8)' }}
          >
            {sectionSubtitle}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {packages.map((pkg, idx) => {
            const Icon = icons[idx] || Rocket;
            const style = colors[idx] || colors[0];
            const isPopular = pkg.is_popular || idx === 1;
            const priceDisplay =
              currency === 'EUR'
                ? `${pkg.price_eur} €`
                : `${pkg.price_fcfa.toLocaleString('fr-FR')} FCFA`;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-xl ${
                  isPopular
                    ? 'shadow-2xl scale-[1.02]'
                    : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-card, rgba(18,24,38,0.85))',
                  borderColor: isPopular ? 'var(--accent-gold, #f59e0b)' : 'var(--border-subtle, rgba(255,255,255,0.1))',
                }}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-center py-1.5 text-xs font-black uppercase tracking-widest">
                    ⭐ Le Plus Populaire — Meilleur Rapport Qualité/Prix
                  </div>
                )}

                <div className={`p-7 ${isPopular ? 'pt-11' : 'pt-7'} flex flex-col flex-1`}>
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${style.accent}`} />
                    </div>
                    <div>
                      <h3 
                        className="text-lg font-extrabold"
                        style={{ color: 'var(--text-title, #ffffff)' }}
                      >
                        {pkg.name}
                      </h3>
                      <p 
                        className="text-xs"
                        style={{ color: 'var(--text-muted, #94a3b8)' }}
                      >
                        {pkg.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div 
                    className="mb-5 pb-5 border-b"
                    style={{ borderColor: 'var(--border-subtle, rgba(255,255,255,0.1))' }}
                  >
                    <div className={`text-3xl font-black ${style.accent} font-display`}>
                      {priceDisplay}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{pkg.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {(pkg.features || []).map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-200">
                        <CheckCircle2
                          className={`w-4 h-4 ${style.accent} shrink-0 mt-0.5`}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleOrderPack(pkg)}
                    className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${style.btn}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Commander ce pack sur WhatsApp</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Strip */}
        {settings.show_guarantees !== false && settings.show_guarantees !== 'false' && (
          <div className="mt-12 max-w-4xl mx-auto glass-panel border border-white/10 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              {
                emoji: settings.guarantee1_emoji || '⚡',
                title: settings.guarantee1_title || 'Livraison 24h-48h',
                sub: settings.guarantee1_sub || 'Délai garanti par écrit',
              },
              {
                emoji: settings.guarantee2_emoji || '🔒',
                title: settings.guarantee2_title || 'Droits 100% cédés',
                sub: settings.guarantee2_sub || 'Utilisation commerciale libre',
              },
              {
                emoji: settings.guarantee3_emoji || '🔄',
                title: settings.guarantee3_title || 'Révisions illimitées',
                sub: settings.guarantee3_sub || "Jusqu'à votre satisfaction",
              },
              {
                emoji: settings.guarantee4_emoji || '💬',
                title: settings.guarantee4_title || 'Support WhatsApp',
                sub: settings.guarantee4_sub || 'Réponse en moins de 1h',
              },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-sm font-bold text-white">{item.title}</div>
                <div className="text-xs text-gray-400">{item.sub}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
