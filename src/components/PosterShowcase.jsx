import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Eye,
  X,
  Maximize2,
  Copy,
  Check,
  Share2,
  ShoppingCart,
} from 'lucide-react';
import {
  formatWhatsAppUrl,
  buildPosterWhatsAppMessage,
  logInquiry,
} from '../api/cloudflare';
import { FormattedProductDescription } from './FormattedProductDescription';

export function PosterShowcase({
  posters,
  currency,
  whatsappNumber,
  onAddToCart,
  showCart = true,
  settings = {},
}) {
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedShareId, setCopiedShareId] = useState(null);
  const [addedCartId, setAddedCartId] = useState(null);

  const handleAddToCart = (poster, e) => {
    if (e) e.stopPropagation();
    if (onAddToCart) {
      onAddToCart({
        id: poster.id,
        title: poster.title,
        price_fcfa: poster.price_fcfa,
        price_eur: poster.price_eur,
        thumbnail_url: poster.image_url || poster.thumbnail_url,
        slug: poster.slug || poster.id,
        type: 'poster',
      });
      setAddedCartId(poster.id);
      setTimeout(() => setAddedCartId(null), 2000);
    }
  };

  // 1. Détection du lien direct dans l'URL (?p=ID ou ?poster=ID ou #affiche-ID)
  useEffect(() => {
    if (!posters || posters.length === 0) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const targetParam = params.get('p') || params.get('poster') || params.get('photo');
      const hash = window.location.hash ? window.location.hash.replace('#', '') : '';

      let found = null;
      if (targetParam) {
        found = posters.find((p) => String(p.id) === String(targetParam) || p.slug === targetParam);
      } else if (hash.startsWith('affiche-')) {
        const slug = hash.replace('affiche-', '');
        found = posters.find((p) => String(p.id) === String(slug) || p.slug === slug);
      } else if (hash.startsWith('poster-')) {
        const slug = hash.replace('poster-', '');
        found = posters.find((p) => String(p.id) === String(slug) || p.slug === slug);
      }

      if (found) {
        setSelectedPoster(found);
        setTimeout(() => {
          const el = document.getElementById('affiches') || document.getElementById('posters-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (e) {
      console.warn('Deep link parse error:', e);
    }
  }, [posters]);

  // Ouverture avec synchronisation de l'URL
  const openPoster = (poster) => {
    setSelectedPoster(poster);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('p', poster.slug || poster.id);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  };

  // Fermeture avec nettoyage de l'URL
  const closePoster = () => {
    setSelectedPoster(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      url.searchParams.delete('poster');
      url.searchParams.delete('photo');
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  };

  // Partage ou copie du lien direct de l'article
  const handleShareDirectLink = (poster, e) => {
    if (e) e.stopPropagation();
    const origin = window.location.origin;
    const directUrl = `${origin}/?p=${encodeURIComponent(poster.slug || poster.id)}`;

    if (navigator.share) {
      navigator
        .share({
          title: poster.title,
          text: `Découvrez "${poster.title}" sur ${settings.company_name || 'notre catalogue'} :`,
          url: directUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(directUrl);
      setCopiedShareId(poster.id);
      setTimeout(() => setCopiedShareId(null), 3000);
    }
  };

  const handleWhatsAppOrder = (poster) => {
    const message = buildPosterWhatsAppMessage({
      poster,
      currency,
      siteUrl: window.location.origin,
      companyName: settings.company_name || 'Notre Entreprise',
    });
    logInquiry({
      service_type: 'poster',
      item_id: poster.id,
      item_title: poster.title,
      estimated_price_fcfa: poster.price_fcfa,
      whatsapp_message: message,
    });
    const url = formatWhatsAppUrl(whatsappNumber, message);
    window.open(url, '_blank');
  };

  const handleCopy = (poster) => {
    const message = buildPosterWhatsAppMessage({
      poster,
      currency,
      siteUrl: window.location.origin,
      companyName: settings.company_name || 'Notre Entreprise',
    });
    navigator.clipboard.writeText(message);
    setCopiedId(poster.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <section 
      id="affiches" 
      className="py-16 border-t border-b transition-colors"
      style={{
        backgroundColor: 'var(--bg-secondary, #0c101a)',
        borderColor: 'var(--border-subtle, rgba(255,255,255,0.1))',
      }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{settings.posters_badge || 'Catalogue & Galerie Photos'}</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: 'var(--text-title, #ffffff)' }}
          >
            {settings.posters_title || 'Nos Produits & Visuels'}
          </h2>
          <p 
            className="text-sm sm:text-base mt-3 leading-relaxed"
            style={{ color: 'var(--text-muted, #94a3b8)' }}
          >
            {settings.posters_subtitle ||
              'Découvrez nos sélections, produits et réalisations en image.'}
          </p>
        </div>

        {/* Grid of Posters : 2 colonnes sur mobile, 3D bombé & ressorti */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {posters.map((poster) => {
            const priceDisplay =
              currency === 'EUR'
                ? `${poster.price_eur} €`
                : `${poster.price_fcfa.toLocaleString('fr-FR')} FCFA`;

            return (
              <div
                key={poster.id}
                className="group border overflow-hidden transition-all duration-300 hover:-translate-y-2 active:scale-[0.98] flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(15, 23, 42, 0.65) 45%, rgba(2, 6, 23, 0.88) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderColor: 'rgba(255, 255, 255, 0.22)',
                  borderRadius: '1.25rem',
                  boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.45), 0 4px 10px -2px rgba(0, 0, 0, 0.3), inset 0 1.5px 2px rgba(255, 255, 255, 0.42), inset 0 -2px 4px rgba(0, 0, 0, 0.45)'
                }}
              >
                {/* Image Container with Zoom & Badge */}
                <div
                  className="relative aspect-[3/4] overflow-hidden bg-black cursor-pointer"
                  onClick={() => openPoster(poster)}
                >
                  <img
                    src={poster.image_url}
                    alt={poster.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                      {poster.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    {poster.format && !poster.format.includes('A3') && !poster.format.includes('A2') && !poster.format.includes('A5') && !poster.format.includes('Print') && !poster.format.includes('Carrousel') ? (
                      <span className="bg-black/70 backdrop-blur px-2 py-0.5 rounded font-medium">
                        {poster.format}
                      </span>
                    ) : (
                      <span className="bg-black/70 backdrop-blur px-2 py-0.5 rounded font-medium">
                        {poster.badge || 'Prestation'}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPoster(poster);
                      }}
                      className="p-1.5 rounded-full bg-white/20 hover:bg-cyan-400 hover:text-black transition-colors"
                      title="Agrandir l'affiche"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => openPoster(poster)}
                      className="text-base font-bold transition-colors cursor-pointer line-clamp-1"
                      style={{ color: 'var(--text-title, #ffffff)' }}
                    >
                      {poster.title}
                    </h3>
                    <p 
                      className="text-xs mt-1.5 line-clamp-2 leading-relaxed"
                      style={{ color: 'var(--text-muted, #94a3b8)' }}
                    >
                      {poster.description}
                    </p>

                    <div className="mt-3 space-y-1 text-[11px] text-gray-300">
                      {(poster.features || [])
                        .filter((feat) => !feat.includes('CMJN') && !feat.includes('300 DPI') && !feat.includes('fonds perdus') && !feat.includes('Fichier HD Print') && !feat.includes('Format Réseaux') && !feat.includes('diapositives') && !feat.includes('charte de marque'))
                        .slice(0, 2)
                        .map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        {settings?.posters_price_label || 'Tarif'}
                      </span>
                      <span className="text-base font-extrabold text-cyan-400 font-display">
                        {priceDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleShareDirectLink(poster, e)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/10 transition-all cursor-pointer"
                        title="Partager le lien direct de ce produit"
                      >
                        {copiedShareId === poster.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {showCart && (
                        <button
                          onClick={(e) => handleAddToCart(poster, e)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                            addedCartId === poster.id
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border-white/10'
                          }`}
                          title="Ajouter au Panier"
                        >
                          {addedCartId === poster.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ShoppingCart className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleWhatsAppOrder(poster)}
                        className="btn-whatsapp text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Commander</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPoster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={closePoster}
        >
          <div
            className="relative max-w-4xl w-full bg-[#111624] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closePoster}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:text-amber-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview */}
            <div className="md:w-1/2 bg-black flex items-center justify-center p-4">
              <img
                src={selectedPoster.image_url}
                alt={selectedPoster.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Poster Details */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded">
                  {selectedPoster.category}
                </span>

                <h3 className="text-2xl font-bold text-white">{selectedPoster.title}</h3>

                <FormattedProductDescription
                  description={selectedPoster.description}
                  isDarkMode={true}
                />

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-gray-300 uppercase block mb-1">
                    {settings?.posters_specs_title || 'Détails de la prestation :'}
                  </span>
                  <div className="text-xs text-gray-300 space-y-1.5">
                    {selectedPoster.format && !selectedPoster.format.includes('A3') && !selectedPoster.format.includes('A2') && !selectedPoster.format.includes('A5') && !selectedPoster.format.includes('Print') && !selectedPoster.format.includes('Carrousel') && (
                      <div>✨ Formule : <strong>{selectedPoster.format}</strong></div>
                    )}
                    {selectedPoster.dimensions && !selectedPoster.dimensions.includes('DPI') && !selectedPoster.dimensions.includes('px') && !selectedPoster.dimensions.includes('1080') && !selectedPoster.dimensions.includes('3508') && (
                      <div>💅 Détail : <strong>{selectedPoster.dimensions}</strong></div>
                    )}
                    {(selectedPoster.features || [])
                      .filter((feat) => !feat.includes('CMJN') && !feat.includes('300 DPI') && !feat.includes('fonds perdus') && !feat.includes('Fichier HD Print') && !feat.includes('Format Réseaux') && !feat.includes('diapositives') && !feat.includes('charte de marque'))
                      .map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase">Tarif :</span>
                  <span className="text-2xl font-extrabold text-cyan-400 font-display">
                    {currency === 'EUR'
                      ? `${selectedPoster.price_eur} €`
                      : `${selectedPoster.price_fcfa.toLocaleString('fr-FR')} FCFA`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleShareDirectLink(selectedPoster, e)}
                    className="p-3 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    title="Partager le lien"
                  >
                    {copiedShareId === selectedPoster.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>

                  {showCart && (
                    <button
                      onClick={(e) => handleAddToCart(selectedPoster, e)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        addedCartId === selectedPoster.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/5 hover:bg-cyan-500/20 text-white border-white/10'
                      }`}
                    >
                      {addedCartId === selectedPoster.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Ajouté au panier !</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 text-cyan-400" />
                          <span>Ajouter au Panier</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleWhatsAppOrder(selectedPoster)}
                    className="btn-whatsapp flex-1 py-3 px-4 text-xs md:text-sm rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Commander Direct</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
