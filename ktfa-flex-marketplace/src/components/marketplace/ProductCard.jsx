import React, { useState, useMemo } from 'react';
import { Heart, Plus, Play, Share2, Check, Star } from 'lucide-react';
import { getSynchronizedReviewsCount } from './catalogReviewsData';

export default function ProductCard({
  item,
  isLight,
  currency = 'FCFA',
  isFavorite = false,
  onToggleFavorite,
  onSelectProduct,
  onSelect,
  onStartCheckout,
  onCheckout
}) {
  const [copiedShare, setCopiedShare] = useState(false);
  const handleSelect = onSelectProduct || onSelect;
  const handleCheckout = onStartCheckout || onCheckout;
  const tranchesCount = item.installment_tranches || item.installment_months || 4;
  const monthlyAmount = item.monthly_fcfa || Math.round(item.price_fcfa / tranchesCount);
  const hasVideo = Boolean(
    item.video_url ||
    (Array.isArray(item.images) && item.images.some(u => /\.(mp4|webm|mov)$/i.test(u)))
  );

  const totalReviewsCount = useMemo(() => {
    return getSynchronizedReviewsCount(item);
  }, [item]);

  const handleShareClick = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?t=ktfa&prod=${item.id}`;
    const shareText = `Découvrez "${item.title}" sur KTFA FLEX — Échelonné en ${tranchesCount}x sans frais 🇨🇲\n${shareUrl}`;

    if (navigator.share) {
      try {
        if (item.image_url && navigator.canShare) {
          try {
            const res = await fetch(item.image_url, { mode: 'cors' });
            if (res.ok) {
              const blob = await res.blob();
              const file = new File([blob], `${(item.title || 'produit').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`, { type: blob.type || 'image/jpeg' });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: item.title,
                  text: shareText
                });
                return;
              }
            }
          } catch (fileErr) {
            console.warn('[Share file fallback to URL]:', fileErr);
          }
        }
        await navigator.share({
          title: item.title,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback presse-papier
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      prompt('Lien du produit :', shareUrl);
    }
  };

  return (
    <div
      onClick={() => handleSelect && handleSelect(item)}
      className={`group relative rounded-[28px] overflow-hidden border-2 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${
        isLight
          ? 'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF5EE] border-amber-200/90 shadow-[0_12px_32px_rgba(200,150,110,0.14),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(220,180,130,0.08)]'
          : 'bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900/90 border-emerald-500/40 shadow-[0_14px_36px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-3px_6px_rgba(0,0,0,0.6)]'
      }`}
    >
      {/* LISERÉ DORÉ LUMINESCENT SUPÉRIEUR */}
      {isLight && (
        <div className="absolute top-0 inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent pointer-events-none rounded-full" />
      )}

      {/* MINIATURE PRODUIT AVEC GESTION VIDÉO & FAVORIS */}
      <div className={`relative aspect-square rounded-[22px] overflow-hidden mb-3 ${
        isLight
          ? 'bg-[#F5ECE1] border border-amber-200/70 shadow-[inset_0_2px_6px_rgba(180,140,100,0.1)]'
          : 'bg-black/60 border border-emerald-500/30'
      }`}>
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* BADGE VIDÉO 4K HD */}
        {hasVideo && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md border border-rose-500/70 text-white text-[9px] font-black uppercase flex items-center gap-1 shadow-md">
              <Play className="w-2.5 h-2.5 fill-rose-500 text-rose-500 animate-pulse" />
              <span>Vidéo 4K</span>
            </span>
          </div>
        )}

        {/* BOUTON PARTAGER LE PRODUIT */}
        <button
          type="button"
          onClick={handleShareClick}
          className={`absolute top-2 right-11 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${
            copiedShare
              ? 'bg-emerald-500 text-white border border-emerald-400'
              : isLight
              ? 'bg-white/95 hover:bg-white text-stone-500 hover:text-amber-600 border border-amber-200/80 shadow-[0_3px_8px_rgba(200,150,110,0.15)] active:scale-90'
              : 'bg-slate-950/80 backdrop-blur-md border border-white/20 text-slate-300 hover:text-amber-300 shadow-[0_4px_8px_rgba(0,0,0,0.5)] active:scale-90'
          }`}
          title="Partager ce produit (Lien direct)"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {/* BOUTON FAVORIS BOMBÉ (LIKE AVEC CŒUR) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite && onToggleFavorite(item.id);
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${
            isLight
              ? 'bg-white/95 hover:bg-white text-stone-400 hover:text-rose-500 border border-amber-200/80 shadow-[0_3px_8px_rgba(200,150,110,0.15)] active:scale-90'
              : 'bg-slate-950/80 backdrop-blur-md border border-white/20 text-slate-300 hover:text-rose-400 shadow-[0_4px_8px_rgba(0,0,0,0.5)] active:scale-90'
          }`}
          title="Ajouter aux favoris"
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* INFOS PRODUIT */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className={`text-xs sm:text-sm font-black line-clamp-2 mb-1 transition-colors leading-tight ${
            isLight ? 'text-[#241A14] group-hover:text-[#D97706]' : 'text-white group-hover:text-emerald-300'
          }`}>
            {item.title}
          </h3>
          <p className={`text-[10px] sm:text-xs line-clamp-1 mb-1 font-medium ${
            isLight ? 'text-[#8C7D73]' : 'text-slate-400'
          }`}>
            {item.dimensions || item.category}
          </p>

          {/* ÉTOILES DORÉES D'AVIS & ÉVALUATION */}
          <div className="flex items-center gap-1 mb-2">
            <div className="text-amber-400 text-[11px] leading-none tracking-tighter">★★★★★</div>
            <span className={`text-[10px] font-bold ${isLight ? 'text-[#A89F91]' : 'text-slate-500'}`}>
              {totalReviewsCount === 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">Nouveau • 0 avis</span>
              ) : (
                <span>({item.rating || '4.9'}) • {totalReviewsCount} avis</span>
              )}
            </span>
          </div>
        </div>

        {/* PRIX ÉCHELONNÉ EN GROS & BOUTON COMMANDE (+) EN RELIEF BOMBÉ */}
        <div className={`pt-2.5 border-t ${
          isLight ? 'border-amber-200/70' : 'border-slate-800/80'
        } flex items-center justify-between gap-1.5`}>
          <div className="flex-1 min-w-0 pr-1">
            <div className={`text-[12px] sm:text-sm font-black leading-tight tracking-tight ${
              isLight ? 'text-[#D97706]' : 'text-emerald-500'
            }`}>
              {tranchesCount}x {Number(monthlyAmount || 0).toLocaleString('fr-FR')} F{' '}
              <span className={`text-[9px] sm:text-[10px] font-bold ${isLight ? 'text-[#8C7D73]' : 'text-emerald-200/80'}`}>
                / tranche
              </span>
            </div>
            <div className={`text-[9px] sm:text-[10px] font-medium truncate mt-0.5 ${
              isLight ? 'text-[#6C584C]' : 'text-slate-400'
            }`}>
              Comptant : {Number(item.price_fcfa || 0).toLocaleString('fr-FR')} {currency}
            </div>
          </div>

          {/* BOUTON + UNIQUE ET BOMBÉ EN RELIEF 3D (ORANGE AMBRÉ SUR LE MODÈLE) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCheckout && handleCheckout(item);
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black transition-all shrink-0 cursor-pointer ${
              isLight
                ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] hover:from-[#B45309] hover:to-[#D97706] text-white shadow-[0_6px_16px_rgba(217,119,6,0.35),inset_0_2px_3px_rgba(255,255,255,0.4)] active:scale-95'
                : 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 shadow-[0_6px_16px_rgba(16,185,129,0.5),inset_0_2px_3px_rgba(255,255,255,0.5)] active:scale-95'
            }`}
            title={`Commander en ${tranchesCount} tranches`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
