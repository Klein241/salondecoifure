import React, { useState, useRef, useEffect } from 'react';
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
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeVideo, setActiveVideo] = useState(videos[0] || null);
  const [modalVideo, setModalVideo] = useState(null); // Modale d'ouverture au clic
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [modalIsPlaying, setModalIsPlaying] = useState(true);
  const [modalIsMuted, setModalIsMuted] = useState(false);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);

  const mainVideoRef = useRef(null);
  const modalVideoRef = useRef(null);

  // Sync activeVideo when videos change
  useEffect(() => {
    if (videos && videos.length > 0 && !activeVideo) {
      setActiveVideo(videos[0]);
    }
  }, [videos, activeVideo]);

  // Fermer la modale avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalVideo(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Catégories
  const categories = [
    { id: 'all', label: 'Toutes les Créations', icon: Film },
    { id: 'tiktok_reels', label: 'TikTok & Reels 9:16', icon: Flame },
    { id: 'spot_tv', label: 'Spots Publicitaires 16:9', icon: Sparkles },
    { id: 'motion_design', label: 'Motion Design 3D', icon: Layers },
    { id: 'ugc', label: 'UGC & Créateurs', icon: Eye },
    { id: 'vsl_ecommerce', label: 'VSL & Vente', icon: Zap },
  ];

  const filteredVideos =
    selectedCategory === 'all'
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  const formatPrice = (v) => {
    if (!v) return '';
    if (currency === 'EUR') return `${v.price_eur || Math.round((v.price_fcfa || 25000) / 655)} €`;
    return `${(v.price_fcfa || 25000).toLocaleString('fr-FR')} FCFA`;
  };

  // Au clic sur une carte : OUVRIR LA MODALE (ne pas scroller vers le haut)
  const handleOpenModal = (video) => {
    setModalVideo(video);
    setModalIsPlaying(true);
    setModalIsMuted(false);
  };

  const handleWhatsAppOrder = (video) => {
    const cleanPhone = String(whatsappNumber || '').replace(/\D/g, '');
    const message = buildVideoWhatsAppMessage({
      video,
      currency,
      siteUrl: window.location.origin,
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
    <section className="py-16 md:py-24 bg-[#0a0d14] relative border-b border-white/5">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
              <Film className="w-3.5 h-3.5" /> Catalogue Vidéo Haute Conversion
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Nos Réalisations Vidéo
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl">
              Cliquez sur une vidéo pour visionner les détails et lancer votre commande en 1 clic sur WhatsApp.
            </p>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille des Vidéos YouTube-Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isVertical = video.format === '9:16';
            return (
              <div
                key={video.id}
                className="group relative rounded-2xl bg-gradient-to-b from-[#111622] to-[#0d121c] border border-white/5 hover:border-amber-500/30 transition-all duration-300 overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
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
                      className="text-base font-bold text-white group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-2"
                    >
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  {/* Pied de Carte : Prix & Boutons d'Action */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Tarif Dès
                      </span>
                      <span className="text-base font-extrabold text-amber-400">
                        {formatPrice(video)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(video)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors"
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => handleWhatsAppOrder(video)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
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
      {/* MODALE VIDÉO GRAND FORMAT (OUVERTURE AU CLIC SANS SCROLL) */}
      {/* ======================================================== */}
      {modalVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setModalVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0d121c] border border-amber-500/30 rounded-2xl md:rounded-3xl shadow-2xl shadow-black flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton Fermer */}
            <button
              onClick={() => setModalVideo(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors border border-white/10"
              title="Fermer la vidéo (Échap)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Lecteur Vidéo dans la modale */}
            <div className="relative aspect-video w-full bg-black rounded-t-2xl md:rounded-t-3xl overflow-hidden">
              <video
                ref={modalVideoRef}
                src={modalVideo.video_url || modalVideo.preview_url}
                poster={modalVideo.thumbnail_url}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Détails & Actions */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {modalVideo.badge && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase bg-amber-500 text-black">
                        {modalVideo.badge}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/10 text-white">
                      Format {modalVideo.format || '16:9'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/10 text-slate-300">
                      Durée {modalVideo.duration}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {modalVideo.resolution}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-3xl font-extrabold text-white">
                    {modalVideo.title}
                  </h3>
                </div>

                {/* Prix dans la modale */}
                <div className="text-left md:text-right bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-xs uppercase font-bold text-slate-400 block">
                    Tarif du pack
                  </span>
                  <span className="text-2xl md:text-3xl font-black text-amber-400">
                    {formatPrice(modalVideo)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm md:text-base leading-relaxed bg-[#0a0d14] p-4 rounded-xl border border-white/5">
                {modalVideo.description}
              </p>

              {/* Liste des prestations incluses */}
              {modalVideo.features && modalVideo.features.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-extrabold text-amber-400 tracking-wider mb-3">
                    Ce qui est inclus dans cette vidéo :
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

              {/* Boutons d'Action WhatsApp */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => handleWhatsAppOrder(modalVideo)}
                  className="w-full sm:flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-sm md:text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Commander ce style sur WhatsApp</span>
                </button>

                {onCustomBrief && (
                  <button
                    onClick={() => {
                      const v = modalVideo;
                      setModalVideo(null);
                      onCustomBrief(v);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    <span>Personnaliser mon brief</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
