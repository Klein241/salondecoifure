import React from 'react';
import {
  Play,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Clock,
  Award,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

export function Hero({
  whatsappNumber,
  settings = {},
  onExploreVideos,
  onOpenDevis,
}) {
  const cleanPhone = String(whatsappNumber || '').replace(/\D/g, '');
  const whatsAppHeroUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    settings.default_whatsapp_message ||
      '👋 Bonjour DIGITAL MARK PRO ! Je souhaite lancer un projet de vidéo ou d\'affiche publicitaire.'
  )}`;

  const heroBadge =
    settings.hero_badge || 'STUDIO DE CRÉATION VIDÉO & GRAPHISME PUBLICITAIRE';
  const heroTitle =
    settings.hero_title ||
    'Des Vidéos & Affiches qui Captivent et Font Exploser vos Ventes';
  const heroSubtitle =
    settings.hero_subtitle ||
    'Ne laissez plus vos prospects défiler sans s\'arrêter. Nous concevons vos spots publicitaires 4K, vidéos virales TikTok/Reels et affiches magnétiques, livrés sous 48h et prêts à être sponsorisés.';
  const ctaPrimary = settings.hero_cta_primary || 'Voir les Vidéos';
  const ctaWhatsApp = settings.hero_cta_whatsapp || 'Commander sur WhatsApp';

  const stat1Value = settings.stat1_value || '+120M';
  const stat1Label = settings.stat1_label || 'Vues cumulées générées';
  const stat2Value = settings.stat2_value || '24h - 48h';
  const stat2Label = settings.stat2_label || 'Délai moyen de livraison';
  const stat3Value = settings.stat3_value || '100%';
  const stat3Label = settings.stat3_label || 'Droits commerciaux cédés';
  const stat4Value = settings.stat4_value || '+850';
  const stat4Label = settings.stat4_label || 'Vidéos & affiches créées';

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-white/10 bg-gradient-to-b from-[#0a0d14] via-[#0d121c] to-[#0a0d14]">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-amber-500/30 text-xs md:text-sm font-semibold text-amber-300 shadow-lg shadow-amber-500/10">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{heroBadge}</span>
          </div>

          {/* Impact Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            {heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onExploreVideos}
              className="btn-primary w-full sm:w-auto px-8 py-4 text-base rounded-xl font-bold flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{ctaPrimary}</span>
            </button>

            <a
              href={whatsAppHeroUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full sm:w-auto px-8 py-4 text-base rounded-xl font-bold flex items-center justify-center gap-3 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{ctaWhatsApp}</span>
            </a>

            <button
              onClick={onOpenDevis}
              className="btn-secondary w-full sm:w-auto px-6 py-4 text-sm rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Simulateur Devis</span>
            </button>
          </div>
        </div>

        {/* Live Reassurance Stats Ribbon */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 text-center border-white/5 hover:border-amber-500/30 transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">
              {stat1Value}
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">{stat1Label}</p>
          </div>

          <div className="glass-panel p-4 text-center border-white/5 hover:border-amber-500/30 transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {stat2Value}
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">{stat2Label}</p>
          </div>

          <div className="glass-panel p-4 text-center border-white/5 hover:border-amber-500/30 transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
              {stat3Value}
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">{stat3Label}</p>
          </div>

          <div className="glass-panel p-4 text-center border-white/5 hover:border-amber-500/30 transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-display">
              {stat4Value}
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">{stat4Label}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
