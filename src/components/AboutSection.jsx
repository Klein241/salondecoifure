import React from 'react';
import {
  Sparkles,
  Heart,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Award,
  Users,
} from 'lucide-react';
import { formatWhatsAppUrl } from '../api/cloudflare';

export function AboutSection({
  settings = {},
  whatsappNumber,
}) {
  const showSection =
    settings.show_about_section !== false &&
    settings.show_about_section !== 'false';

  if (!showSection) return null;

  const badge = settings.about_badge || 'NOTRE HISTOIRE & SAVOIR-FAIRE';
  const title = settings.about_title || 'L’Excellence et la Passion au Cœur de nos Créations';
  const subtitle =
    settings.about_subtitle ||
    'Découvrez notre vision, nos valeurs et nos engagements de qualité pour vous offrir le meilleur.';
  const description =
    settings.about_description ||
    `Depuis notre création, nous mettons notre savoir-faire au service de l'excellence. Chaque formule, chaque création et chaque détail est pensé pour sublimer votre quotidien et répondre aux plus hauts standards de qualité.\n\nNous privilégions des ingrédients rigoureusement sélectionnés, une écoute attentive de nos clients et un service sur-mesure pour vous accompagner avec soin.`;

  const layout = settings.about_layout || 'right'; // 'left' | 'center' | 'right'

  // Photos avec replis élégants
  const photo1 =
    settings.about_photo1 ||
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80';
  const photo2 =
    settings.about_photo2 ||
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80';
  const photo3 =
    settings.about_photo3 ||
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80';

  const ctaText = settings.about_cta_text || 'Échanger avec nous sur WhatsApp';
  const companyName = settings.company_name || 'Notre Entreprise';

  const handleWhatsAppClick = () => {
    const cleanPhone = String(whatsappNumber || '').replace(/\D/g, '');
    const message = `👋 Bonjour ${companyName}, j'ai lu votre présentation sur votre site et j'aimerais échanger avec vous.`;
    const url = formatWhatsAppUrl(cleanPhone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Mosaïque des 3 Photos
  const renderPhotoGrid = (customClass = '') => (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${customClass}`}>
      {/* Grande Photo Principale */}
      <div className="col-span-2 sm:col-span-1 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group aspect-[4/5] sm:aspect-auto sm:h-full min-h-[260px] bg-black/40">
        <img
          src={photo1}
          alt="À propos 1"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 backdrop-blur border border-white/10 inline-block mb-1">
            Excellence & Authenticité
          </span>
        </div>
      </div>

      {/* Colonne des 2 Photos Secondaires */}
      <div className="col-span-2 sm:col-span-1 flex flex-row sm:flex-col gap-3 sm:gap-4">
        <div className="flex-1 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-xl relative group aspect-[4/3] bg-black/40">
          <img
            src={photo2}
            alt="À propos 2"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
        </div>
        <div className="flex-1 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-xl relative group aspect-[4/3] bg-black/40">
          <img
            src={photo3}
            alt="À propos 3"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
        </div>
      </div>
    </div>
  );

  // Bloc Texte de présentation
  const renderTextContent = (textClass = '') => (
    <div className={`space-y-6 ${textClass}`}>
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{badge}</span>
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
          style={{ color: 'var(--text-title, #ffffff)' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-sm sm:text-base mt-3 font-medium leading-relaxed"
            style={{ color: 'var(--color-primary, #f59e0b)' }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div
        className="text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line"
        style={{ color: 'var(--text-muted, #94a3b8)' }}
      >
        {description}
      </div>

      {/* 3 Points Forts / Piliers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div
          className="p-3.5 rounded-2xl border flex items-center gap-3 transition-colors"
          style={{
            backgroundColor: 'var(--bg-card, rgba(18,24,38,0.7))',
            borderColor: 'var(--border-subtle, rgba(255,255,255,0.08))',
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block" style={{ color: 'var(--text-title, #ffffff)' }}>
              100% Qualité
            </span>
            <span className="text-[10px] text-slate-400 block">Exigence certifiée</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-2xl border flex items-center gap-3 transition-colors"
          style={{
            backgroundColor: 'var(--bg-card, rgba(18,24,38,0.7))',
            borderColor: 'var(--border-subtle, rgba(255,255,255,0.08))',
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block" style={{ color: 'var(--text-title, #ffffff)' }}>
              Confiance & Soin
            </span>
            <span className="text-[10px] text-slate-400 block">Accompagnement VIP</span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-2xl border flex items-center gap-3 transition-colors"
          style={{
            backgroundColor: 'var(--bg-card, rgba(18,24,38,0.7))',
            borderColor: 'var(--border-subtle, rgba(255,255,255,0.08))',
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block" style={{ color: 'var(--text-title, #ffffff)' }}>
              Satisfaction 100%
            </span>
            <span className="text-[10px] text-slate-400 block">Clients ravis</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      {ctaText && (
        <div className="pt-2">
          <button
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: '#25d366',
            }}
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>{ctaText}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <section
      id="about-section"
      className="py-16 md:py-24 border-t border-b transition-colors relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-secondary, #0c101a)',
        borderColor: 'var(--border-subtle, rgba(255,255,255,0.08))',
      }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* DISPOSITION 1 : PHOTOS À GAUCHE, TEXTE À DROITE */}
        {layout === 'left' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6">{renderPhotoGrid()}</div>
            <div className="lg:col-span-6">{renderTextContent()}</div>
          </div>
        )}

        {/* DISPOSITION 2 : TEXTE À GAUCHE, PHOTOS À DROITE */}
        {layout === 'right' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">{renderTextContent()}</div>
            <div className="lg:col-span-6 order-1 lg:order-2">{renderPhotoGrid()}</div>
          </div>
        )}

        {/* DISPOSITION 3 : DISPOSITION CENTRÉE (PHOTOS AU CENTRE / ALIGNÉES) */}
        {layout === 'center' && (
          <div className="max-w-5xl mx-auto space-y-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{badge}</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
                style={{ color: 'var(--text-title, #ffffff)' }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className="text-sm sm:text-base mt-3 font-medium leading-relaxed max-w-2xl mx-auto"
                  style={{ color: 'var(--color-primary, #f59e0b)' }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* 3 Photos disposées en 3 colonnes élégantes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[photo1, photo2, photo3].map((src, i) => (
                <div
                  key={i}
                  className="rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-xl relative aspect-[3/4] group bg-black/40"
                >
                  <img
                    src={src}
                    alt={`À propos ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                </div>
              ))}
            </div>

            <div
              className="max-w-3xl mx-auto text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line text-center"
              style={{ color: 'var(--text-muted, #94a3b8)' }}
            >
              {description}
            </div>

            {ctaText && (
              <div>
                <button
                  onClick={handleWhatsAppClick}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-extrabold text-sm text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: '#25d366' }}
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{ctaText}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
