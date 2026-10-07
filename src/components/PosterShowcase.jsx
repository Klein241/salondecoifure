import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  formatWhatsAppUrl,
  buildPosterWhatsAppMessage,
  logInquiry,
} from '../api/cloudflare';

export function PosterShowcase({ posters, currency, whatsappNumber }) {
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleWhatsAppOrder = (poster) => {
    const message = buildPosterWhatsAppMessage({
      poster,
      currency,
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
    });
    navigator.clipboard.writeText(message);
    setCopiedId(poster.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <section id="affiches" className="py-16 bg-[#0c101a] border-t border-b border-white/10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Direction Artistique & Graphisme</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Affiches & Visuels <span className="gradient-text-cyan">Publicitaires</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base mt-3 leading-relaxed">
            Donnez une image de marque inoubliable à votre entreprise. Nos designs combinent
            typographie magnétique, retouche photo avancée et calibrage prêt pour l'impression ou
            la sponsorisation Meta & Google.
          </p>
        </div>

        {/* Grid of Posters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posters.map((poster) => {
            const priceDisplay =
              currency === 'EUR'
                ? `${poster.price_eur} €`
                : `${poster.price_fcfa.toLocaleString('fr-FR')} FCFA`;

            return (
              <div
                key={poster.id}
                className="group glass-panel border border-white/10 hover:border-cyan-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Image Container with Zoom & Badge */}
                <div
                  className="relative aspect-[3/4] overflow-hidden bg-black cursor-pointer"
                  onClick={() => setSelectedPoster(poster)}
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
                    <span className="bg-black/70 backdrop-blur px-2 py-0.5 rounded font-medium">
                      {poster.format}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoster(poster);
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
                      onClick={() => setSelectedPoster(poster)}
                      className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1"
                    >
                      {poster.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {poster.description}
                    </p>

                    <div className="mt-3 space-y-1 text-[11px] text-gray-300">
                      {(poster.features || []).slice(0, 2).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        Prix de conception
                      </span>
                      <span className="text-base font-extrabold text-cyan-400 font-display">
                        {priceDisplay}
                      </span>
                    </div>

                    <button
                      onClick={() => handleWhatsAppOrder(poster)}
                      className="btn-whatsapp text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Commander</span>
                    </button>
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
          onClick={() => setSelectedPoster(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#111624] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPoster(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:text-amber-400 transition-colors"
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

                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedPoster.description}
                </p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-gray-300 uppercase block mb-1">
                    Spécifications techniques :
                  </span>
                  <div className="text-xs text-gray-300 space-y-1.5">
                    <div>📐 Format : <strong>{selectedPoster.format}</strong></div>
                    <div>📏 Résolution : <strong>{selectedPoster.dimensions}</strong></div>
                    {(selectedPoster.features || []).map((feat, i) => (
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

                <button
                  onClick={() => handleWhatsAppOrder(selectedPoster)}
                  className="btn-whatsapp w-full py-3.5 text-sm rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Commander cette affiche sur WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
