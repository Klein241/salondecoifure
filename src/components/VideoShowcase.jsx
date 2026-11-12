import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  Share2,
  Eye,
  Clock,
  Layers,
  Flame,
  Film,
  Zap,
  SlidersHorizontal,
  X,
  Send,
  ShoppingCart,
} from 'lucide-react';
import {
  formatWhatsAppUrl,
  buildVideoWhatsAppMessage,
  logInquiry,
} from '../api/cloudflare';

export function VideoShowcase({
  videos,
  currency,
  whatsappNumber,
  onCustomBrief,
  onAddToCart,
  showCart = true,
  settings = {},
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeVideo, setActiveVideo] = useState(videos[0] || null);
  const [modalVideo, setModalVideo] = useState(null); // Modale d'ouverture au clic
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [modalIsPlaying, setModalIsPlaying] = useState(true);
  const [modalIsMuted, setModalIsMuted] = useState(false);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);
  const [copiedShareId, setCopiedShareId] = useState(null);
  const [addedCartId, setAddedCartId] = useState(null);

  const handleAddToCart = (video, e) => {
    if (e) e.stopPropagation();
    if (onAddToCart) {
      onAddToCart({
        id: video.id,
        title: video.title,
        price_fcfa: video.price_fcfa,
        price_eur: video.price_eur,
        thumbnail_url: video.thumbnail_url || video.preview_url,
        slug: video.slug || video.id,
        type: 'video',
      });
      setAddedCartId(video.id);
      setTimeout(() => setAddedCartId(null), 2000);
    }
  };

  const mainVideoRef = useRef(null);
  const modalVideoRef = useRef(null);

  // Sync activeVideo when videos change
  useEffect(() => {
    if (videos && videos.length > 0 && !activeVideo) {
      setActiveVideo(videos[0]);
    }
  }, [videos, activeVideo]);

  // 1. Détection du lien direct dans l'URL (?v=ID ou ?video=ID ou #video-ID)
  useEffect(() => {
    if (!videos || videos.length === 0) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const targetParam = params.get('v') || params.get('video');
      const hash = window.location.hash ? window.location.hash.replace('#', '') : '';

      let found = null;
      if (targetParam) {
        found = videos.find((v) => String(v.id) === String(targetParam) || v.slug === targetParam);
      } else if (hash && !hash.startsWith('affiche-') && !hash.startsWith('poster-')) {
        const cleanHash = hash.replace('video-', '');
        found = videos.find((v) => String(v.id) === String(cleanHash) || v.slug === cleanHash);
      }

      if (found) {
        setActiveVideo(found);
        setModalVideo(found);
        setModalIsPlaying(true);
        setTimeout(() => {
          const el = document.getElementById('videos-section') || document.getElementById('videos');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (e) {}
  }, [videos]);

  // Fermer la modale avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Libellés conviviaux pour les slugs de catégories courants
  const categoryLabels = {
    all: settings.videos_all_label || 'Toutes les Réalisations',
    vsl_ecommerce: 'Catalogue Produits',
    tiktok_reels: 'Vidéos Courtes & Reels',
    spot_tv: 'Spots & Présentations',
    motion_design: 'Animations & 3D',
    ugc: 'Témoignages & Clients',
    soins_visage: 'Soins Visage',
    soins_corps: 'Soins Corps',
    gamme_eclat: 'Gamme Éclat',
    creme_hydratante: 'Crèmes Hydratantes',
    coiffure: 'Coiffure & Tresses',
    manucure: 'Onglerie & Soins',
    restaurant: 'Menu & Saveurs',
    coaching: 'Formations & Coaching',
  };

  // Catégories dynamiques basées sur les données réelles du client
  const categories = useMemo(() => {
    const rawCategories = Array.from(new Set((videos || []).map((v) => v.category).filter(Boolean)));
    if (rawCategories.length > 1) {
      return [
        { id: 'all', label: settings.videos_all_label || 'Tous nos Produits & Vidéos', icon: Film },
        ...rawCategories.map((catId) => ({
          id: catId,
          label: categoryLabels[catId.toLowerCase()] || catId.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          icon: Sparkles,
        })),
      ];
    }
    return [];
  }, [videos, settings.videos_all_label]);

  const filteredVideos =
    selectedCategory === 'all'
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  const formatPrice = (v) => {
    if (!v) return '';
    if (currency === 'EUR') return `${v.price_eur || Math.round((v.price_fcfa || 25000) / 655)} €`;
    return `${(v.price_fcfa || 25000).toLocaleString('fr-FR')} FCFA`;
  };

  // Au clic sur une carte : OUVRIR LA MODALE avec synchronisation d'URL
  const handleOpenModal = (video) => {
    setActiveVideo(video);
    setModalVideo(video);
    setModalIsPlaying(true);
    setModalIsMuted(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('v', video.slug || video.id);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  };

  // Fermer la modale et nettoyer l'URL
  const handleCloseModal = () => {
    setModalVideo(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('v');
      url.searchParams.delete('video');
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  };

  // Partage ou copie du lien direct vers la vidéo
  const handleShareVideo = (video, e) => {
    if (e) e.stopPropagation();
    const origin = window.location.origin;
    const directUrl = `${origin}/?v=${encodeURIComponent(video.slug || video.id)}`;

    if (navigator.share) {
      navigator
        .share({
          title: video.title,
          text: `Visionnez "${video.title}" sur ${settings.company_name || 'notre site'} :`,
          url: directUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(directUrl);
      setCopiedShareId(video.id);
      setTimeout(() => setCopiedShareId(null), 3000);
    }
  };

  const handleWhatsAppOrder = (video) => {
    const cleanPhone = String(whatsappNumber || '').replace(/\D/g, '');
    const message = buildVideoWhatsAppMessage({
      video,
      currency,
      siteUrl: window.location.origin,
      companyName: settings.company_name || 'Notre Entreprise',
    });
    const url = formatWhatsAppUrl(cleanPhone, message);
    logInquiry({
      type: 'video_order_direct',
      reference_id: video.id,
      title: video.title,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section 
      className="py-16 md:py-24 relative border-b transition-colors"
      style={{
        backgroundColor: 'var(--bg-main, #0a0d14)',
        borderColor: 'var(--border-subtle, rgba(255,255,255,0.05))',
      }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
              <Film className="w-3.5 h-3.5" /> {settings.videos_badge || 'Catalogue Vidéo Haute Conversion'}
            </div>
            <h2 
              className="text-3xl md:text-5xl font-black tracking-tight"
              style={{ color: 'var(--text-title, #ffffff)' }}
            >
              {settings.videos_title || 'Nos Réalisations Vidéo'}
            </h2>
            <p 
              className="text-sm md:text-base mt-2 max-w-2xl"
              style={{ color: 'var(--text-muted, #94a3b8)' }}
            >
              {settings.videos_subtitle || 'Cliquez sur une vidéo pour visionner les détails et lancer votre commande en 1 clic sur WhatsApp.'}
            </p>
          </div>

          {/* Filtres par catégorie (affichés uniquement si plusieurs catégories existent) */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                    style={!isActive ? { backgroundColor: 'var(--bg-secondary, rgba(255,255,255,0.05))', color: 'var(--text-main, #f8fafc)' } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Grille des Vidéos YouTube-Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isVertical = video.format === '9:16';
            return (
              <div
                key={video.id}
                className="group relative rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--bg-card, #111622)',
                  borderColor: 'var(--border-subtle, rgba(255,255,255,0.08))',
                }}
              >
                {/* Miniature / Aperçu Vidéo */}
                <div
                  onClick={() => handleOpenModal(video)}
                  onMouseEnter={() => setHoveredVideoId(video.id)}
                  onMouseLeave={() => setHoveredVideoId(null)}
                  className="relative aspect-video w-full overflow-hidden bg-black cursor-pointer group/thumb"
                >
                  {hoveredVideoId === video.id && video.preview_url ? (
                    <video
                      src={video.preview_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={video.thumbnail_url || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80'}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Play Button Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover/thumb:scale-110 transition-transform">
                    <div className="w-12 h-12 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-lg shadow-amber-500/40">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>

                  {/* Badges en haut */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {video.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black">
                        {video.badge}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {video.format || '16:9'}
                    </span>
                  </div>

                  {/* Durée & Résolution en bas */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    {video.duration && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-slate-200">
                        {video.duration}
                      </span>
                    )}
                    {video.resolution && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-amber-400">
                        {video.resolution}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenu de la Carte */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => handleOpenModal(video)}
                      className="text-base font-bold transition-colors cursor-pointer line-clamp-2"
                      style={{ color: 'var(--text-title, #ffffff)' }}
                    >
                      {video.title}
                    </h3>
                    <p 
                      className="text-xs mt-2 line-clamp-2 leading-relaxed"
                      style={{ color: 'var(--text-muted, #94a3b8)' }}
                    >
                      {video.description}
                    </p>
                  </div>

                  {/* Pied de Carte : Prix & Boutons d'Action */}
                  <div 
                    className="mt-5 pt-4 border-t flex items-center justify-between gap-3"
                    style={{ borderColor: 'var(--border-subtle, rgba(255,255,255,0.08))' }}
                  >
                    <div>
                      <span 
                        className="text-[10px] uppercase font-bold block"
                        style={{ color: 'var(--text-muted, #94a3b8)' }}
                      >
                        Tarif Dès
                      </span>
                      <span 
                        className="text-base font-extrabold"
                        style={{ color: 'var(--accent-gold, #f59e0b)' }}
                      >
                        {formatPrice(video)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleShareVideo(video, e)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-white/10 transition-all cursor-pointer"
                        title="Partager le lien direct de cette vidéo"
                      >
                        {copiedShareId === video.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {showCart && (
                        <button
                          onClick={(e) => handleAddToCart(video, e)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                            addedCartId === video.id
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border-white/10'
                          }`}
                          title="Ajouter au Panier"
                        >
                          {addedCartId === video.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ShoppingCart className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenModal(video)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => handleWhatsAppOrder(video)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODALE VIDÉO GRAND FORMAT : VIDÉO À GAUCHE & INFOS À DROITE */}
      {/* ======================================================== */}
      {modalVideo && (() => {
        const isVertical = modalVideo.format === '9:16';
        const isSquare = modalVideo.format === '1:1';

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
            onClick={handleCloseModal}
          >
            <div
              className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden bg-[#0d121c] border border-amber-500/30 rounded-2xl md:rounded-3xl shadow-2xl shadow-black flex flex-col lg:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton Fermer */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/80 hover:bg-red-500/90 text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer shadow-lg"
                title="Fermer la vidéo (Échap)"
              >
                <X className="w-5 h-5" />
              </button>

              {/* COLONNE GAUCHE : VIDÉO DANS SON FORMAT D'ORIGINE */}
              <div className="w-full lg:w-[48%] xl:w-[45%] bg-black flex items-center justify-center p-3 md:p-6 relative border-b lg:border-b-0 lg:border-r border-white/10 shrink-0">
                <div
                  className={`w-full flex items-center justify-center ${
                    isVertical
                      ? 'aspect-[9/16] max-h-[55vh] lg:max-h-[75vh] max-w-[340px] mx-auto'
                      : isSquare
                      ? 'aspect-square max-h-[55vh] lg:max-h-[70vh] max-w-[420px] mx-auto'
                      : 'aspect-video max-h-[55vh] lg:max-h-[70vh] w-full'
                  } rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 relative group`}
                >
                  <video
                    ref={modalVideoRef}
                    src={modalVideo.video_url || modalVideo.preview_url}
                    poster={modalVideo.thumbnail_url}
                    autoPlay
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
              </div>

              {/* COLONNE DROITE : DESCRIPTION & ACTIONS */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[60vh] lg:max-h-[92vh] flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  {/* Badges & Format */}
                  <div className="flex items-center gap-2 flex-wrap pr-10">
                    {modalVideo.badge && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase bg-amber-500 text-black shadow-md shadow-amber-500/20">
                        {modalVideo.badge}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/10 text-white border border-white/10">
                      Format {modalVideo.format || '16:9'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/10 text-slate-300">
                      ⏱ {modalVideo.duration}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {modalVideo.resolution}
                    </span>
                  </div>

                  {/* Titre & Prix */}
                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                      {modalVideo.title}
                    </h3>

                    <div className="inline-flex items-baseline gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <span className="text-[11px] uppercase font-bold text-slate-400">
                        Tarif Dès :
                      </span>
                      <span className="text-xl md:text-2xl font-black text-amber-400">
                        {formatPrice(modalVideo)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2">
                       Description du Projet
                    </h4>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed bg-[#0a0d14] p-4 rounded-xl border border-white/5">
                      {modalVideo.description || 'Projet publicitaire haut de gamme livré clé en main sous 48h.'}
                    </p>
                  </div>

                  {/* Ce qui est inclus */}
                  {modalVideo.features && modalVideo.features.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-amber-400 tracking-wider mb-2.5">
                        Inclus avec cette commande :
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {modalVideo.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs md:text-sm text-slate-300"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Boutons d'Action */}
                <div className="pt-5 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleShareVideo(modalVideo, e)}
                      className="py-3 px-4 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {copiedShareId === modalVideo.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Lien copié !</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 text-amber-400" />
                          <span>Partager le lien</span>
                        </>
                      )}
                    </button>

                    {showCart && (
                      <button
                        onClick={(e) => handleAddToCart(modalVideo, e)}
                        className={`py-3 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          addedCartId === modalVideo.id
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-white/5 hover:bg-amber-500/20 text-white border-white/10'
                        }`}
                        title="Ajouter au Panier"
                      >
                        {addedCartId === modalVideo.id ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Ajouté !</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 text-amber-400" />
                            <span>Panier</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleWhatsAppOrder(modalVideo)}
                      className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-sm md:text-base shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span>Commander sur WhatsApp</span>
                    </button>
                  </div>

                  {onCustomBrief && (
                    <button
                      onClick={() => {
                        const v = modalVideo;
                        handleCloseModal();
                        onCustomBrief(v);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <span>Personnaliser ma commande</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
