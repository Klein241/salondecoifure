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
  ExternalLink,
  Eye,
  Users,
} from 'lucide-react';
import { getCleanImageUrl } from '../utils/theme';

export function Hero({
  whatsappNumber,
  settings = {},
  trafficStats = {},
  onExploreVideos,
  onOpenDevis,
  showDevis = true,
  showVideos = true,
  onSectionClick, // Utilisé pour l'interaction Studio Live
}) {
  const cleanPhone = String(whatsappNumber || '').replace(/\D/g, '');
  const company = settings.company_name || 'Notre Entreprise';
  const whatsAppHeroUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    settings.default_whatsapp_message ||
      `👋 Bonjour ${company} ! Je souhaite échanger avec vous et passer commande.`
  )}`;

  // Mode d'affichage Hero : soit "banner", soit "text"
  const cleanHeroBanner = getCleanImageUrl(settings.hero_banner_image);
  const isBannerMode = settings.hero_display_mode === 'banner' && !!cleanHeroBanner;

  const heroBadge =
    settings.hero_badge || 'BIENVENUE SUR NOTRE SITE OFFICIEL';
  const heroTitle =
    settings.hero_title ||
    'Des Produits & Prestations d\'Exception';
  const heroSubtitle =
    settings.hero_subtitle ||
    'Découvrez notre catalogue, nos nouveautés exclusives et commandez directement sur WhatsApp.';

  // Bouton 1 (Principal)
  const btn1Text = settings.hero_btn1_text || settings.hero_cta_primary || 'Voir le Catalogue';
  const btn1Link = settings.hero_btn1_link || '#videos-section';
  const showBtn1 = settings.hero_btn1_show !== false && settings.hero_btn1_show !== 'false' && showVideos;

  // Bouton 2 (WhatsApp Direct)
  const btn2Text = settings.hero_btn2_text || settings.hero_cta_whatsapp || 'Commander sur WhatsApp';
  const btn2Link = settings.hero_btn2_link || whatsAppHeroUrl;
  const showBtn2 = settings.hero_btn2_show !== false && settings.hero_btn2_show !== 'false';

  // Bouton 3 (Simulateur Devis ou Action Secondaire)
  const btn3Text = settings.hero_btn3_text || 'Simulateur Devis';
  const btn3Link = settings.hero_btn3_link || '#devis-section';
  const showBtn3 = settings.hero_btn3_show !== false && settings.hero_btn3_show !== 'false' && showDevis;

  // Bouton 4 (Personnalisé / Ajouté)
  const btn4Text = settings.hero_btn4_text || '';
  const btn4Link = settings.hero_btn4_link || '';
  const showBtn4 = (settings.hero_btn4_show === true || settings.hero_btn4_show === 'true') && !!btn4Text;

  const handleLinkClick = (e, link, defaultAction) => {
    if (defaultAction) {
      e.preventDefault();
      defaultAction();
      return;
    }
    if (!link) return;
    if (link.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Formatage des nombres (ex: 12340 -> "12,3K")
  const formatCount = (n) => {
    if (n == null) return null;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  // Stat 1 : Vues réelles (analytics) ou valeur personnalisée admin
  const realViews = trafficStats ? formatCount(trafficStats.total_views) : null;
  const stat1Value = realViews || settings.stat1_value || '0';
  const stat1Label = realViews
    ? (settings.stat1_label || 'Vues cumulées')
    : (settings.stat1_label || 'Vues cumulées');
  const stat1IsReal = !!realViews;

  // Stat 2 : Visites uniques réelles ou valeur personnalisée admin
  const realVisits = trafficStats ? formatCount(trafficStats.total_visits) : null;
  const stat2Value = realVisits || settings.stat2_value || '0';
  const stat2Label = realVisits
    ? (settings.stat2_label || 'Visiteurs uniques')
    : (settings.stat2_label || 'Visiteurs uniques');
  const stat2IsReal = !!realVisits;

  // Stat 3 & 4 : valeurs configurées par l'admin
  const stat3Value = settings.stat3_value || '100%';
  const stat3Label = settings.stat3_label || 'Droits commerciaux cédés';
  const stat4Value = settings.stat4_value || '+850';
  const stat4Label = settings.stat4_label || 'Vidéos & affiches créées';

  return (
    <section
      onClick={() => onSectionClick && onSectionClick('hero')}
      className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 border-b border-white/10"
      style={{
        backgroundColor: settings.color_bg_main || 'var(--bg-main, #0a0d14)',
      }}
    >
      {/* Background Ambient Glows & Optional Banner Glow */}
      {cleanHeroBanner ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-3xl scale-110 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${cleanHeroBanner})` }}
        />
      ) : (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        </>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Top Pill Badge */}
          {heroBadge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-amber-500/30 text-xs md:text-sm font-semibold text-amber-300 shadow-lg shadow-amber-500/10">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{heroBadge}</span>
            </div>
          )}

          {/* CENTRE DU HERO : SOIT LA BANNIÈRE VISUELLE HERO SOIT LE TITRE H1 */}
          {isBannerMode ? (
            <div className="pt-2 max-w-5xl mx-auto">
              {settings.hero_banner_link ? (
                <a
                  href={settings.hero_banner_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/15 bg-black/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:border-amber-500/50">
                    <img
                      src={cleanHeroBanner}
                      alt={company}
                      className="w-full max-h-[520px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ) : (
                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/15 bg-black/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-amber-500/50">
                  <img
                    src={cleanHeroBanner}
                    alt={company}
                    className="w-full max-h-[520px] object-cover transition-transform duration-700 hover:scale-[1.02]"
                    loading="eager"
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Titre Principal H1 */}
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
                style={{ color: settings.color_text_title || 'var(--text-title, #ffffff)' }}
              >
                {heroTitle}
              </h1>

              {/* Sous-titre */}
              <p
                className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                style={{ color: settings.color_text_muted || 'var(--text-muted, #94a3b8)' }}
              >
                {heroSubtitle}
              </p>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 pt-4">
            {showBtn1 && (
              <a
                href={btn1Link}
                onClick={(e) => handleLinkClick(e, btn1Link, onExploreVideos)}
                className="btn-primary w-full sm:w-auto px-8 py-4 text-base rounded-xl font-bold flex items-center justify-center gap-3 cursor-pointer"
                style={{
                  backgroundColor: settings.color_btn_bg || undefined,
                  color: settings.color_btn_text || undefined,
                }}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{btn1Text}</span>
              </a>
            )}

            {showBtn2 && (
              <a
                href={btn2Link}
                target={btn2Link.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="btn-whatsapp w-full sm:w-auto px-8 py-4 text-base rounded-xl font-bold flex items-center justify-center gap-3 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{btn2Text}</span>
              </a>
            )}

            {showBtn3 && (
              <a
                href={btn3Link}
                onClick={(e) => handleLinkClick(e, btn3Link, onOpenDevis)}
                className="btn-secondary w-full sm:w-auto px-6 py-4 text-sm rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{btn3Text}</span>
              </a>
            )}

            {showBtn4 && (
              <a
                href={btn4Link}
                target={btn4Link.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="btn-secondary w-full sm:w-auto px-6 py-4 text-sm rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer border-amber-500/40 text-amber-300"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{btn4Text}</span>
              </a>
            )}
          </div>
        </div>

        {/* Live Reassurance Stats Ribbon */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="glass-panel p-4 text-center transition-all"
            style={{
              backgroundColor: settings.color_bg_card || undefined,
              borderColor: settings.color_border || undefined,
            }}
          >
            {stat1IsReal && (
              <Eye className="w-4 h-4 mx-auto mb-1 opacity-50" style={{ color: settings.color_primary || 'var(--accent-gold, #f59e0b)' }} />
            )}
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-display ${!trafficStats ? 'animate-pulse opacity-50' : ''}`}
              style={{ color: settings.color_primary || 'var(--accent-gold, #f59e0b)' }}
            >
              {stat1Value}
            </div>
            <p
              className="text-xs font-medium mt-1"
              style={{ color: settings.color_text_muted || undefined }}
            >
              {stat1Label}
            </p>
          </div>

          <div
            className="glass-panel p-4 text-center transition-all"
            style={{
              backgroundColor: settings.color_bg_card || undefined,
              borderColor: settings.color_border || undefined,
            }}
          >
            {stat2IsReal && (
              <Users className="w-4 h-4 mx-auto mb-1 opacity-50" style={{ color: settings.color_text_title || 'var(--text-title, #ffffff)' }} />
            )}
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-display ${!trafficStats ? 'animate-pulse opacity-50' : ''}`}
              style={{ color: settings.color_text_title || 'var(--text-title, #ffffff)' }}
            >
              {stat2Value}
            </div>
            <p
              className="text-xs font-medium mt-1"
              style={{ color: settings.color_text_muted || undefined }}
            >
              {stat2Label}
            </p>
          </div>

          <div
            className="glass-panel p-4 text-center transition-all"
            style={{
              backgroundColor: settings.color_bg_card || undefined,
              borderColor: settings.color_border || undefined,
            }}
          >
            <div
              className="text-2xl sm:text-3xl font-extrabold font-display"
              style={{ color: settings.color_accent || '#10b981' }}
            >
              {stat3Value}
            </div>
            <p
              className="text-xs font-medium mt-1"
              style={{ color: settings.color_text_muted || undefined }}
            >
              {stat3Label}
            </p>
          </div>

          <div
            className="glass-panel p-4 text-center transition-all"
            style={{
              backgroundColor: settings.color_bg_card || undefined,
              borderColor: settings.color_border || undefined,
            }}
          >
            <div
              className="text-2xl sm:text-3xl font-extrabold font-display"
              style={{ color: settings.color_secondary || '#06b6d4' }}
            >
              {stat4Value}
            </div>
            <p
              className="text-xs font-medium mt-1"
              style={{ color: settings.color_text_muted || undefined }}
            >
              {stat4Label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
