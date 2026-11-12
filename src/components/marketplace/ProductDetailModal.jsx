import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Play,
  Film,
  CheckCircle2,
  ShoppingBag,
  MessageCircle,
  Percent,
  Share2,
  Star,
  ThumbsUp,
  Send,
  User,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { getCatalogReviews } from './catalogReviewsData';

export default function ProductDetailModal({
  product,
  catalogItems = [],
  onSelectProduct,
  isOpen = true,
  isLight,
  currency = 'FCFA',
  productMediaTab = 'photos',
  setProductMediaTab,
  onClose,
  onAddToCart,
  onOpenCart,
  onOpenSellerChat,
  onOpenChat,
  onStartCheckout,
  onCheckout,
  userProfile
}) {
  // ===================================================================
  // 1. TOUS LES HOOKS EN TÊTE DU COMPOSANT (RESPECT DES RÈGLES REACT)
  // ===================================================================
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // 8 Produits recommandés ("Ces produits pourraient aussi vous intéresser")
  const recommendedProducts = useMemo(() => {
    if (!catalogItems || !product) return [];
    const others = catalogItems.filter((p) => String(p.id) !== String(product.id));
    const sameCategory = others.filter((p) => p.category && p.category === product.category);
    const otherCategories = others.filter((p) => !p.category || p.category !== product.category);
    return [...sameCategory, ...otherCategories].slice(0, 8);
  }, [catalogItems, product]);

  // État des avis réels & catalogue
  const [realReviews, setRealReviews] = useState([]);
  const [reviewTabFilter, setReviewTabFilter] = useState('all'); // 'all' | 'real' | 'catalog'
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState(userProfile?.name || '');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // État du mode plein écran & Zoom de l'image
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Détection propre de la vidéo (MP4, WEBM, MOV, YouTube)
  const currentProductVideo = useMemo(() => {
    if (!product) return null;
    if (product.video_url && typeof product.video_url === 'string') return product.video_url;

    let mediaList = [];
    if (Array.isArray(product.images)) mediaList = product.images;
    else if (typeof product.images === 'string' && product.images.startsWith('[')) {
      try { mediaList = JSON.parse(product.images); } catch (e) {}
    }
    const found = mediaList.find((u) => typeof u === 'string' && (/\.(mp4|webm|mov|m4v)$/i.test(u) || /youtube\.com|youtu\.be/i.test(u)));
    if (found) return found;

    if (product.image_url && (/\.(mp4|webm|mov|m4v)$/i.test(product.image_url) || /youtube\.com|youtu\.be/i.test(product.image_url))) {
      return product.image_url;
    }
    return null;
  }, [product]);

  // Détection d'un lien YouTube éventuel
  const youtubeEmbedUrl = useMemo(() => {
    if (!currentProductVideo || typeof currentProductVideo !== 'string') return null;
    const isYouTube = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/\s]+)/i;
    const match = currentProductVideo.match(isYouTube);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&playsinline=1` : null;
  }, [currentProductVideo]);

  // Si le produit a une vidéo, activer l'onglet vidéo par défaut
  useEffect(() => {
    if (currentProductVideo && setProductMediaTab) {
      setProductMediaTab('video');
    }
  }, [currentProductVideo, setProductMediaTab]);

  // Avis certifiés catalogue spécifiques au produit (vide si nouveau produit / arrivage)
  const catalogReviews = useMemo(() => {
    return getCatalogReviews(product);
  }, [product]);

  // Chargement des avis réels depuis l'API Cloudflare D1 + LocalStorage
  useEffect(() => {
    if (!product || !product.id) return;

    let isMounted = true;
    const loadRealReviews = async () => {
      let d1Reviews = [];
      try {
        const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(product.id)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            d1Reviews = json.data.map((r) => ({
              id: r.id,
              isReal: true,
              author: r.author,
              city: r.city,
              rating: r.rating,
              comment: r.comment,
              date: r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : "Récemment"
            }));
          }
        }
      } catch (e) {
        console.warn('[Fetch D1 reviews]:', e);
      }

      // Compléter avec le localStorage si disponible
      let localReviews = [];
      try {
        const saved = localStorage.getItem(`ktfa_reviews_${product.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            localReviews = parsed.map((r) => ({ ...r, isReal: true }));
          }
        }
      } catch (e) {}

      // Fusion sans doublons par ID
      const map = new Map();
      [...d1Reviews, ...localReviews].forEach((rev) => {
        if (!map.has(rev.id)) map.set(rev.id, rev);
      });

      if (isMounted) {
        setRealReviews(Array.from(map.values()));
      }
    };

    loadRealReviews();
    return () => {
      isMounted = false;
    };
  }, [product?.id]);

  // Synchronisation du nom d'utilisateur connecté
  useEffect(() => {
    if (userProfile?.name) {
      setReviewName(userProfile.name);
    }
  }, [userProfile]);

  // Réinitialiser le zoom à la fermeture
  useEffect(() => {
    if (!isZoomModalOpen) {
      setZoomScale(1);
    }
  }, [isZoomModalOpen]);

  // ===================================================================
  // 2. RETOUR ANTICIPÉ UNIQUEMENT APRÈS LES HOOKS
  // ===================================================================
  if (!product || isOpen === false) return null;

  const handleChat = onOpenSellerChat || onOpenChat;
  const handleCheckout = onStartCheckout || onCheckout;

  const tranchesCount = product.installment_tranches || product.installment_months || 4;
  const monthlyAmount = product.monthly_fcfa || Math.round((product.price_fcfa || 0) / tranchesCount);

  // Tous les avis combinés
  const allReviews = [...realReviews, ...catalogReviews];
  const displayedReviews =
    reviewTabFilter === 'real'
      ? realReviews
      : reviewTabFilter === 'catalog'
      ? catalogReviews
      : allReviews;

  // Calcul note moyenne harmonisée
  const totalReviewsDisplayCount = allReviews.length;
  const avgRatingDisplay = (product.rating || '4.9').toString();

  // SOUMISSION D'UN NOUVEL AVIS RÉEL PAR UN CLIENT
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      alert('Veuillez renseigner votre nom et votre commentaire.');
      return;
    }

    const newRev = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      product_id: String(product.id),
      isReal: true,
      author: reviewName.trim(),
      city: userProfile?.city || 'Douala / Yaoundé',
      rating: Number(reviewRating),
      date: "À l'instant",
      comment: reviewComment.trim()
    };

    // 1. Mise à jour immédiate du state
    const updated = [newRev, ...realReviews];
    setRealReviews(updated);

    // 2. Sauvegarde dans localStorage
    try {
      localStorage.setItem(`ktfa_reviews_${product.id}`, JSON.stringify(updated));
    } catch (err) {}

    // 3. Envoi au serveur Cloudflare D1
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newRev.id,
          product_id: product.id,
          author: newRev.author,
          city: newRev.city,
          rating: newRev.rating,
          comment: newRev.comment
        })
      });
    } catch (apiErr) {
      console.warn('[Save review API warn]:', apiErr);
    }

    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setShowReviewForm(false);
    }, 2000);
  };

  // PARTAGE DU PRODUIT (FICHIER IMAGE + LIEN)
  const handleShareProduct = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?t=ktfa&prod=${product.id}`;
    const shareText = `Découvrez "${product.title}" sur KTFA FLEX — Échelonné en ${tranchesCount}x sans frais 🇨🇲\n${shareUrl}`;

    if (navigator.share) {
      try {
        if (product.image_url && navigator.canShare) {
          try {
            const res = await fetch(product.image_url, { mode: 'cors' });
            if (res.ok) {
              const blob = await res.blob();
              const file = new File(
                [blob],
                `${(product.title || 'produit').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`,
                { type: blob.type || 'image/jpeg' }
              );
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: product.title,
                  text: shareText
                });
                return;
              }
            }
          } catch (fileErr) {}
        }
        await navigator.share({
          title: product.title,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      prompt('Copiez ce lien officiel :', shareUrl);
    }
  };

  return (
    <>
      {/* ======================================================== */}
      {/* MODAL PRINCIPALE DÉTAIL DU PRODUIT                       */}
      {/* ======================================================== */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[32px] border-2 p-5 sm:p-7 scrollbar-none transition-all ${
            isLight
              ? 'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF5EE] border-amber-300/90 text-[#2C221D] shadow-[0_25px_60px_rgba(200,150,110,0.22),inset_0_2px_4px_rgba(255,255,255,1)]'
              : 'bg-slate-950 border-emerald-500/50 text-white shadow-[0_30px_70px_rgba(0,0,0,0.95),inset_0_3px_6px_rgba(255,255,255,0.2)]'
          }`}
        >
          {isLight && (
            <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent pointer-events-none rounded-full" />
          )}

          {/* BOUTONS D'EN-TÊTE : PARTAGE & FERMETURE */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button
              type="button"
              onClick={handleShareProduct}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${
                copiedLink
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : isLight
                  ? 'bg-white hover:bg-amber-50 border-amber-200 text-[#6C584C]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Partager ce produit (Image + Lien)"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-amber-50 border-amber-200 text-[#6C584C] shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {copiedLink && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold text-center animate-in fade-in duration-200 shadow-md flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Lien officiel copié ! Prêt à être partagé.
            </div>
          )}

          {/* COMMUTATEUR VIDÉO HD / PHOTOS (SANS MENTION ALIBABA) */}
          {currentProductVideo && (
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setProductMediaTab && setProductMediaTab('video')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  productMediaTab === 'video'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : isLight ? 'bg-white border border-amber-200 text-[#6C584C] hover:bg-amber-50' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Vidéo Démo HD</span>
              </button>
              <button
                type="button"
                onClick={() => setProductMediaTab && setProductMediaTab('photos')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  productMediaTab === 'photos'
                    ? isLight
                      ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white shadow-md'
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : isLight ? 'bg-white border border-amber-200 text-[#6C584C] hover:bg-amber-50' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Photos HD</span>
              </button>
            </div>
          )}

          {/* ZONE VIDÉO OU IMAGE PRINCIPALE */}
          <div
            className={`aspect-[16/10] rounded-2xl overflow-hidden mb-4 relative ${
              isLight
                ? 'bg-[#F5ECE1] border-2 border-amber-200/80 shadow-[inset_0_2px_6px_rgba(180,140,100,0.12)]'
                : 'bg-black border border-emerald-500/30'
            }`}
          >
            {currentProductVideo && productMediaTab === 'video' ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                {youtubeEmbedUrl ? (
                  <iframe
                    src={youtubeEmbedUrl}
                    title={product.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      src={currentProductVideo}
                      poster={product.image_url}
                      controls
                      playsInline
                      preload="auto"
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      className="w-full h-full object-contain bg-black"
                    />
                    {!isVideoPlaying && (
                      <button
                        type="button"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.play().then(() => {
                              setIsVideoPlaying(true);
                            }).catch(() => {
                              // Fallback autoplay avec coupure son puis réactivation
                              if (videoRef.current) {
                                videoRef.current.muted = true;
                                videoRef.current.play().then(() => {
                                  setIsVideoPlaying(true);
                                  videoRef.current.muted = false;
                                }).catch(() => {});
                              }
                            });
                          }
                        }}
                        className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer border-2 border-white/80"
                        title="Lancer la vidéo"
                      >
                        <Play className="w-7 h-7 fill-current ml-0.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div
                onClick={() => setIsZoomModalOpen(true)}
                className="w-full h-full relative group cursor-zoom-in"
              >
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/20 shadow-md">
                  <Maximize2 className="w-3 h-3 text-amber-400" />
                  <span>Cliquer pour zoomer</span>
                </div>
              </div>
            )}
          </div>

          {/* INFOS PRODUIT & AVIS HARMONISÉS AVEC LE CATALOGUE */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider ${
                isLight ? 'text-[#D97706]' : 'text-emerald-500'
              }`}
            >
              {product.category}
            </span>

            <div className="flex items-center gap-1 text-xs">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(Number(avgRatingDisplay))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className={`font-black text-xs ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                {avgRatingDisplay}
              </span>
              <span className={`text-[10px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
                ({totalReviewsDisplayCount} avis)
              </span>
            </div>
          </div>

          <h2 className={`text-base sm:text-lg font-black mb-2 ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
            {product.title}
          </h2>
          <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-[#6C584C]' : 'text-slate-300'}`}>
            {product.description}
          </p>

          {product.features && (
            <div className="space-y-1.5 mb-4">
              {product.features.map((feat, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-amber-500' : 'text-emerald-500'}`} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}

          {/* ENCADRÉ PRIX COMPTANT & ÉCHELONNÉ */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 mb-3 ${
            isLight
              ? 'bg-white/95 border-amber-200/90 shadow-[0_4px_12px_rgba(200,160,120,0.1),inset_0_1px_2px_rgba(255,255,255,1)]'
              : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div>
              <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
                Prix Comptant
              </div>
              <div className={`text-base font-black ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                {Number(product.price_fcfa || 0).toLocaleString()} FCFA
              </div>
            </div>
            <div className="text-right">
              <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-[#B45309]' : 'text-amber-500'}`}>
                Échelonné en {tranchesCount} tranches
              </div>
              <div className={`text-sm font-black ${isLight ? 'text-[#D97706]' : 'text-emerald-500'}`}>
                {monthlyAmount.toLocaleString()} F / tranche
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BANDE RECOMMANDATIONS : CES PRODUITS POURRAIENT AUSSI    */}
          {/* VOUS INTÉRESSER (JUSQU'À 8 PRODUITS)                     */}
          {/* ======================================================== */}
          {recommendedProducts.length > 0 && (
            <div className={`p-4 rounded-2xl border mb-4 ${
              isLight
                ? 'bg-gradient-to-b from-amber-50/60 to-white border-amber-200/90 shadow-xs'
                : 'bg-slate-900/60 border-slate-800 shadow-md'
            }`}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                    Recommandations : ces produits pourraient aussi vous intéresser
                  </h4>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  {recommendedProducts.length} articles
                </span>
              </div>

              {/* BANDE DÉFILANTE HORIZONTALE DE 8 PRODUITS */}
              <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
                {recommendedProducts.map((recProd) => (
                  <div
                    key={recProd.id}
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(recProd);
                      }
                    }}
                    className={`w-32 sm:w-36 shrink-0 rounded-2xl border-2 p-2 flex flex-col justify-between transition-all cursor-pointer group snap-start ${
                      isLight
                        ? 'bg-white hover:bg-amber-50/50 border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-md'
                        : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/60 shadow-md'
                    }`}
                  >
                    <div>
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-black mb-1.5 relative">
                        <img
                          src={recProd.image_url}
                          alt={recProd.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[7px] font-black text-amber-400 uppercase">
                          {recProd.installment_tranches || 4}x
                        </span>
                      </div>
                      <h5 className={`text-[10px] font-black line-clamp-2 leading-tight ${
                        isLight ? 'text-[#2C221D] group-hover:text-amber-800' : 'text-white group-hover:text-emerald-400'
                      }`}>
                        {recProd.title}
                      </h5>
                    </div>

                    <div className="mt-1.5 pt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      <span className={`text-[10px] font-black ${isLight ? 'text-[#D97706]' : 'text-emerald-400'}`}>
                        {Number(recProd.price_fcfa || 0).toLocaleString()} F
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase group-hover:underline">Voir</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOUTON RAPIDE DE PARTAGE WHATSAPP */}
          <div className="flex items-center gap-2 mb-4">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Découvrez "${product.title}" sur KTFA FLEX — Paiement en 4x sans frais à Douala et Yaoundé 🇨🇲 : ${
                  typeof window !== 'undefined'
                    ? `${window.location.origin}${window.location.pathname}?t=ktfa&prod=${product.id}`
                    : ''
                }`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Partager sur WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleShareProduct}
              className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-amber-500" />
              <span>{copiedLink ? 'Copié !' : 'Partager image'}</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* SECTION AVIS : VUES SÉPARÉES AVIS RÉELS & CATALOGUE      */}
          {/* ======================================================== */}
          <div className={`p-4 rounded-2xl border mb-5 ${
            isLight ? 'bg-amber-50/50 border-amber-200/80' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className={`text-xs sm:text-sm font-black ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                  Avis & Évaluations Clients
                </h4>
                <p className={`text-[10px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
                  {allReviews.length === 0
                    ? 'Nouveau produit · 0 avis pour le moment'
                    : `${realReviews.length} avis client(s) vérifié(s)${catalogReviews.length > 0 ? ` · ${catalogReviews.length} certifié(s) catalogue` : ''}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer active:scale-95 border ${
                  isLight
                    ? 'bg-white hover:bg-amber-100/70 border-amber-300 text-amber-800 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                }`}
              >
                {showReviewForm ? 'Fermer' : '⭐ Donner mon avis'}
              </button>
            </div>

            {/* ONGLETS DE FILTRE DES AVIS (POUR L'ADMIN ET LES VISITEURS) */}
            <div className="flex items-center gap-1 mb-3 p-1 rounded-xl bg-black/10 dark:bg-slate-950/60 text-[10px] font-black">
              <button
                type="button"
                onClick={() => setReviewTabFilter('all')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  reviewTabFilter === 'all'
                    ? isLight ? 'bg-white text-slate-900 shadow' : 'bg-slate-800 text-white shadow'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tous ({allReviews.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewTabFilter('real')}
                className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  reviewTabFilter === 'real'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500'
                }`}
              >
                <span>Avis Clients ({realReviews.length})</span>
              </button>
              {catalogReviews.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReviewTabFilter('catalog')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    reviewTabFilter === 'catalog'
                      ? isLight ? 'bg-white text-slate-900 shadow' : 'bg-slate-800 text-white shadow'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Catalogue ({catalogReviews.length})
                </button>
              )}
            </div>

            {/* FORMULAIRE D'AVIS DÉPLIABLE */}
            {showReviewForm && (
              <form
                onSubmit={handleAddReview}
                className="mb-4 p-3 rounded-xl border bg-white/90 dark:bg-slate-900/90 border-amber-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-200"
              >
                <div className="text-xs font-black text-amber-600 dark:text-amber-400">
                  Votre évaluation sur {product.title}
                </div>

                {/* SÉLECTEUR D'ÉTOILES */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold ml-1.5 text-amber-500">
                    {reviewRating} / 5 étoiles
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Votre nom et prénom (ex: Paul M.)"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Partagez votre avis (qualité, rapidité de livraison, facilités 4x sans frais...)"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                {reviewSuccess && (
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Votre avis a été enregistré et publié avec succès !
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  Publier mon avis
                </button>
              </form>
            )}

            {/* LISTE DES AVIS AVEC BADGES DISTINCTS (RÉEL VS CATALOGUE) */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {displayedReviews.length === 0 ? (
                <div className={`p-4 text-center rounded-xl border text-xs ${
                  isLight ? 'bg-white/80 border-amber-200/60 text-[#8C7D73]' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  <p className="font-extrabold text-amber-500 mb-0.5">✨ Aucun avis pour le moment sur ce produit</p>
                  <p className="text-[11px]">Soyez le premier client vérifié à partager votre expérience après livraison !</p>
                </div>
              ) : (
                displayedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`p-2.5 rounded-xl border text-xs ${
                      rev.isReal
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : isLight
                        ? 'bg-white border-amber-100 shadow-xs'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={isLight ? 'text-[#2C221D]' : 'text-white'}>{rev.author}</span>
                        {rev.isReal ? (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-md font-black flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Client Vérifié 🇨🇲
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-md font-extrabold flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> Certifié Catalogue
                          </span>
                        )}
                      </div>
                      <span className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${
                            s <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-[#6C584C]' : 'text-slate-300'}`}>
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LES 3 BOUTONS DU BAS : HARMONISÉS EN CLAIRMORPHISME 3D DORÉ */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                if (onAddToCart) onAddToCart(product);
                if (onClose) onClose();
                if (onOpenCart) onOpenCart();
              }}
              className={`border font-bold py-3 px-1.5 rounded-2xl text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-amber-50 border-amber-200/90 text-[#4A3B32] shadow-[0_4px_12px_rgba(200,160,120,0.12),inset_0_1px_2px_rgba(255,255,255,1)]'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-white shadow-[0_4px_10px_rgba(0,0,0,0.5)]'
              }`}
              title="Ajouter au Panier"
            >
              <ShoppingBag className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-amber-600' : ''}`} />
              <span className="truncate">Panier</span>
            </button>

            <button
              type="button"
              onClick={() => handleChat && handleChat(product)}
              className={`font-black py-3 px-1.5 rounded-2xl text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                isLight
                  ? 'bg-gradient-to-b from-amber-50 to-[#FDF4EA] hover:bg-amber-100/70 border-2 border-amber-300 text-amber-900 shadow-[0_4px_12px_rgba(200,160,120,0.15),inset_0_1px_2px_rgba(255,255,255,1)]'
                  : 'bg-gradient-to-b from-blue-500/25 via-sky-500/20 to-blue-600/35 hover:from-blue-500/35 hover:to-blue-600/45 border-2 border-blue-400/60 text-blue-200 shadow-[0_4px_14px_rgba(59,130,246,0.35)]'
              }`}
              title="Discuter avec le vendeur"
            >
              <MessageCircle className={`w-3.5 h-3.5 shrink-0 animate-pulse ${isLight ? 'text-amber-600' : 'text-blue-300'}`} />
              <span className="truncate">Discuter</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (handleCheckout) handleCheckout(product);
                if (onClose) onClose();
              }}
              className={`font-black py-3 px-1.5 rounded-2xl text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                isLight
                  ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-[0_8px_20px_rgba(217,119,6,0.35),inset_0_2px_3px_rgba(255,255,255,0.4)]'
                  : 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 shadow-[0_8px_18px_rgba(16,185,129,0.5),inset_0_2px_3px_rgba(255,255,255,0.4)]'
              }`}
              title={`Souscrire en ${tranchesCount} tranches sans caution`}
            >
              <Percent className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Par Tranche</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL PLEIN ÉCRAN & ZOOM INTERACTIF DE L'IMAGE           */}
      {/* ======================================================== */}
      {isZoomModalOpen && (
        <div
          onClick={() => setIsZoomModalOpen(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl text-white z-20"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="text-xs font-bold text-amber-400 truncate">{product.title}</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-md text-slate-300 shrink-0">
                {Math.round(zoomScale * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoomScale((prev) => Math.max(prev - 0.5, 1)); }}
                disabled={zoomScale <= 1}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white cursor-pointer transition-all"
                title="Dézoomer (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoomScale((prev) => Math.min(prev + 0.5, 3.5)); }}
                disabled={zoomScale >= 3.5}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white cursor-pointer transition-all"
                title="Zoomer (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoomScale(1); }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-all"
                title="Réinitialiser (100%)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsZoomModalOpen(false)}
                className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-all ml-1 shadow-md"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 w-full max-w-4xl flex items-center justify-center overflow-auto p-2"
            onClick={() => setZoomScale((prev) => (prev > 1.2 ? 1 : 2))}
          >
            <img
              src={product.image_url}
              alt={product.title}
              style={{
                transform: `scale(${zoomScale})`,
                transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
              }}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl cursor-pointer select-none"
            />
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-center select-none">
            💡 Touchez l'image pour basculer le zoom • Utilisez les boutons + / - pour ajuster
          </div>
        </div>
      )}
    </>
  );
}
