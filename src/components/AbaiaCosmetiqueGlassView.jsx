import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Eye,
  PhoneCall,
  Share2,
  Check,
  X,
  Star,
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  Plus,
  Minus,
  ShieldCheck,
  Leaf,
  Zap,
  Heart,
  ExternalLink,
  Bell,
  Smartphone,
  BellRing,
  ChevronRight,
  Droplets,
  Award,
  Package,
  Sun,
  Moon,
} from 'lucide-react';
import { FormattedProductDescription } from './FormattedProductDescription';

// ── Composant Logo Officiel Abaïa Cosmétique ──
export function AbaiaCosmetiqueLogo({ className = 'w-10 h-10', showText = false, logoUrl = '', isDarkMode = false }) {
  const fallbackLogo = '/api/media/1791544033926-WhatsApp_Image_2026-05-26_at_22.10.42.webp';
  const [imgSrc, setImgSrc] = useState(logoUrl || fallbackLogo);

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative ${className} rounded-full overflow-hidden border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.35)] bg-amber-50 shrink-0 flex items-center justify-center`}>
        <img
          src={imgSrc}
          alt="Abaïa Cosmétique"
          className="w-full h-full object-cover"
          onError={() => setImgSrc('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80')}
        />
      </div>
      {showText && (
        <div className="leading-tight">
          <span className={`font-black text-sm sm:text-base tracking-[0.15em] block drop-shadow-sm font-display ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Abaïa <span className="text-amber-500">COSMÉTIQUE</span>
          </span>
          <span className={`text-[7.5px] sm:text-[8.5px] font-bold tracking-[0.2em] uppercase block ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
            L'élégance de votre peau au naturel
          </span>
        </div>
      )}
    </div>
  );
}

export function AbaiaCosmetiqueGlassView({
  settings = {},
  posters = [],
  currency = 'FCFA',
  whatsappNumber = '237698548016',
  onNavigateAdmin,
  onAddToCart,
  cart = [],
  cartCount = 0,
  isCartOpen = false,
  setIsCartOpen,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isPreview = false,
  forceMobileLayout = false,
}) {
  const brandName = settings.company_name || 'Abaïa Cosmétique';
  const brandTagline = settings.tagline || "L’élégance de votre peau au naturel";
  const cleanPhone = String(settings.whatsapp_number || whatsappNumber).replace(/\D/g, '') || '237698548016';
  const whatsappDisplay = settings.whatsapp_display || (cleanPhone.startsWith('237') ? `+237 ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 9)} ${cleanPhone.slice(9)}` : `+${cleanPhone}`);

  const heroMainTitle = settings.hero_title || 'L’ÉLÉGANCE ET LA BEAUTÉ DE VOTRE PEAU';
  const heroTitleAccent = settings.hero_title_accent || 'AU NATUREL.';
  const heroSubtitle = settings.hero_subtitle || "Découvrez la crème hydratante visage & corps Abaïa Cosmétique enrichie à 5% d'urée, le Gel Métisse unifiant, le Lait Caramel et le Gel Douche Perfecte Glow. Des soins d'exception conçus pour sublimer et unifier votre teint sans agresser votre épiderme.";
  const heroChip1 = settings.hero_pill_1 || '100% ACTIFS PURS';
  const heroChip2 = settings.hero_pill_2 || 'FORMULE 5% URÉE';
  const heroChip3 = settings.hero_pill_3 || 'ÉCLAT & ANTI-TACHES';
  const heroChip4 = settings.hero_pill_4 || 'TESTÉ & VALIDÉ';
  const heroCtaText = settings.hero_cta_primary || 'COMMANDER SUR WHATSAPP';
  const catalogTitle = settings.catalog_title || 'Nos Soins d’Exception';
  const catalogSubtitle = settings.catalog_subtitle || 'Chaque produit est formulé pour sublimer votre peau avec douceur et efficacité. Touchez une carte pour voir les détails et commander sur WhatsApp.';

  // ── GESTION INTELLIGENTE DU THÈME : MODE CLAIR PAR DÉFAUT + BASCULE 1-CLIC ──
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      if (settings.default_theme_mode === 'dark') return true;
      if (settings.default_theme_mode === 'light') return false;
      const saved = localStorage.getItem('abaia_theme_mode');
      if (saved) return saved === 'dark';
    } catch (e) {}
    // Par défaut : MODE CLAIR (élégant, lumineux, ivoire & cristal)
    return false;
  });

  const setMode = (dark) => {
    setIsDarkMode(dark);
    try {
      localStorage.setItem('abaia_theme_mode', dark ? 'dark' : 'light');
    } catch (e) {}
  };

  const toggleTheme = () => {
    setMode(!isDarkMode);
  };

  // Synchronisation dynamique du document (body & html) pour éliminer tout fond noir parasite (sauf en aperçu studio)
  useEffect(() => {
    if (typeof document !== 'undefined' && !isPreview) {
      if (isDarkMode) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
        document.body.style.backgroundColor = '#07090e';
        document.body.style.color = '#f8fafc';
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
        document.body.style.backgroundColor = '#FAF7F2';
        document.body.style.color = '#0f172a';
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, isPreview]);

  // Fond d'ambiance cosmétique & végétale
  const bgSkincare = settings.hero_banner_image ||
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=85';

  // Produits par défaut authentiques Abaïa Cosmétique
  const defaultCosmetics = [
    {
      id: 'post-02',
      title: 'Crème hydratante visage & corps',
      subtitle: 'Enrichie à 5% d’urée & Eau de Rose',
      volume: '300 ml',
      price_fcfa: 5000,
      price_eur: 7.5,
      badge: 'BEST-SELLER',
      tag: '5% URÉE',
      image_url: '/api/media/1791543996825-abaia.webp',
      fallback_img: 'https://images.unsplash.com/photo-1608248597359-548455d3e070?auto=format&fit=crop&w=800&q=80',
      rating: '4.9',
      reviewsCount: 142,
      description: 'Découvrez la crème hydratante visage et corps Abaia Cosmétique, enrichie à 5% d’urée, eau de rose, niacinamide, huile d’argan et amande douce. Hydratation profonde 24h sans effet gras.',
      composition: ['Urée 5%', 'Eau de rose', 'Niacinamide', 'Glycérine', 'Huile d’argan', 'Amande douce', 'Allantoïne'],
      mode: 'Appliquer sur une peau légèrement humide matin et soir, puis masser délicatement pendant quelques secondes.',
      contenance: '300 ml',
      dates: 'Fabrication : 2026 | Expiration : 2028'
    },
    {
      id: 'post-03',
      title: 'Gel Métisse teint métisse',
      subtitle: 'Arbutin, Glutathion & Vitamine C',
      volume: '500 ml',
      price_fcfa: 8000,
      price_eur: 12.5,
      badge: 'ÉCLAT SUBLIME',
      tag: 'GLUTATHION',
      image_url: '/api/media/1791547896073-Capture_d__cran_2026-10-09_131041.webp',
      fallback_img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      rating: '4.9',
      reviewsCount: 118,
      description: 'Conçu pour unifier le teint, estomper les taches, éliminer les zones d’ombre et révéler l’éclat naturel des peaux métisses et noires en toute douceur.',
      composition: ['Arbutin', 'Glutathion pur', 'Vitamine C active', 'Acide kojique doux'],
      mode: 'Usage externe. Appliquer matin et soir sur une peau propre et sèche après le bain.',
      contenance: '500 ml',
      dates: 'Fabrication : 2026 | Expiration : 2028'
    },
    {
      id: 'post-01',
      title: 'Gel Douche Perfecte Glow',
      subtitle: 'Curcuma, Malice & Vitamine E',
      volume: '300 ml',
      price_fcfa: 4500,
      price_eur: 7.0,
      badge: 'PURIFIANT',
      tag: 'CURCUMA BIO',
      image_url: '/api/media/1791543950951-1001672994.webp',
      fallback_img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      rating: '4.8',
      reviewsCount: 96,
      description: 'Gel douche soyeux qui nettoie en profondeur, purifie les pores, apporte un coup d’éclat immédiat et laisse un voile satiné et délicatement parfumé.',
      composition: ['Curcuma bio', 'Poudre de malice', 'Vitamine E', 'Acide kojique'],
      mode: 'Matin et soir, masser une noisette sur peau humide jusqu’à mousse onctueuse, puis rincer abondamment.',
      contenance: '300 ml',
      dates: 'Fabrication : 2026 | Expiration : 12/2026'
    },
    {
      id: 'post-04',
      title: 'Lait Caramel Éclat Naturel',
      subtitle: 'Acide Kojique, Argan & Vitamine C',
      volume: '500 ml',
      price_fcfa: 8000,
      price_eur: 12.5,
      badge: 'RITUEL NOURRISSANT',
      tag: 'ACIDE KOJIQUE',
      image_url: '/api/media/1791548135374-Lait_Caramel___clat_naturel_Aba_a.webp',
      fallback_img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
      rating: '4.9',
      reviewsCount: 104,
      description: 'Lait corporel haute nutrition pour unifier le teint, régénérer l’élasticité de l’épiderme et donner un fini velouté caramel ultra séduisant sans démarcation.',
      composition: ['Acide kojique', 'Vitamine C', 'Acide salicylique', 'Huile d’argan pure'],
      mode: 'Appliquer généreusement sur tout le corps matin et soir après la douche.',
      contenance: '500 ml',
      dates: 'Fabrication : 2026 | Expiration : 2028'
    }
  ];

  // Fusion dynamique des produits
  const cosmeticsCatalog = useMemo(() => {
    if (Array.isArray(posters) && posters.length > 0) {
      return posters.map((p, idx) => {
        const matchingDefault = defaultCosmetics.find(d => String(d.id) === String(p.id)) || defaultCosmetics[idx % defaultCosmetics.length];
        return {
          ...matchingDefault,
          ...p,
          title: p.title || matchingDefault.title,
          price_fcfa: Number(p.price_fcfa) || matchingDefault.price_fcfa,
          image_url: p.image_url || matchingDefault.image_url,
          description: p.description || matchingDefault.description,
          features: Array.isArray(p.features) && p.features.length > 0 ? p.features : matchingDefault.composition
        };
      });
    }
    return defaultCosmetics;
  }, [posters]);

  // États d'Interactivité
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [detailItem, setDetailItem] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [copiedShareId, setCopiedShareId] = useState(null);
  const [addedItemToast, setAddedItemToast] = useState(null);

  // 4 Cartes Ingrédients Nobles (Dynamiques & Personnalisables depuis le Studio)
  const ingredientCards = [
    {
      id: 'ing_uree',
      title: settings.ingredient_1_title || 'URÉE PURE 5% & EAU DE ROSE',
      tag: settings.ingredient_1_tag || 'Hydratation Intense',
      badgeIcon: Droplets,
      desc: settings.ingredient_1_desc || 'L’urée retient l’eau dans les couches profondes de l’épiderme pour lisser les rugosités, tandis que l’eau de rose apaise et affine le grain de peau.',
      badgeColor: 'text-amber-500'
    },
    {
      id: 'ing_glutathion',
      title: settings.ingredient_2_title || 'GLUTATHION & VITAMINE C',
      tag: settings.ingredient_2_tag || 'Éclat & Teint Unifié',
      badgeIcon: Sparkles,
      desc: settings.ingredient_2_desc || 'Le duo antioxydant roi qui régule la mélanine, estompe les taches d’hyperpigmentation et redonne un éclat uniforme et sain sans décaper.',
      badgeColor: 'text-amber-600'
    },
    {
      id: 'ing_argan',
      title: settings.ingredient_3_title || 'HUILE D’ARGAN & AMANDE DOUCE',
      tag: settings.ingredient_3_tag || 'Nutrition Suprême',
      badgeIcon: Leaf,
      desc: settings.ingredient_3_desc || 'Riche en acides gras essentiels et vitamine E naturelle, elle nourrit intensément, prévient le vieillissement cutané et adoucit la peau.',
      badgeColor: 'text-emerald-600'
    },
    {
      id: 'ing_curcuma',
      title: settings.ingredient_4_title || 'CURCUMA BIO & ACIDE KOJIQUE',
      tag: settings.ingredient_4_tag || 'Purification & Glow',
      badgeIcon: Zap,
      desc: settings.ingredient_4_desc || 'Propriétés antibactériennes et purifiantes uniques. Élimine les impuretés et affine la texture cutanée pour un toucher velours irrésistible.',
      badgeColor: 'text-rose-500'
    }
  ];

  // 6 Engagements Qualité
  const qualityCommitments = [
    settings.commitment_1 || '100% Ingrédients Rigoureusement Sélectionnés',
    settings.commitment_2 || 'Zéro Parabène ni Produits Décapants Agressifs',
    settings.commitment_3 || 'Non Testé sur les Animaux (Cruelty-Free)',
    settings.commitment_4 || 'Efficacité Testée et Approuvée sur Peaux Noires & Métisses',
    settings.commitment_5 || 'Hydratation & Confort 24h sans Film Gras',
    settings.commitment_6 || 'Fabrication Authentique Certifiée Yaoundé, Cameroun'
  ];

  // Actions Panier & Commande
  const handleOpenDetailModal = (product) => {
    setDetailItem(product);
    setDetailQty(1);
  };

  const handleQuickAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        title: product.title,
        price_fcfa: product.price_fcfa,
        price_eur: product.price_eur,
        thumbnail_url: product.image_url,
        slug: product.slug || product.id,
        type: 'poster'
      });
      setAddedItemToast(product.title);
      setTimeout(() => setAddedItemToast(null), 2500);
    }
  };

  const handleConfirmModalAddToCart = () => {
    if (!detailItem) return;
    if (onAddToCart) {
      for (let i = 0; i < detailQty; i++) {
        onAddToCart({
          id: detailItem.id,
          title: detailItem.title,
          price_fcfa: detailItem.price_fcfa,
          price_eur: detailItem.price_eur,
          thumbnail_url: detailItem.image_url,
          slug: detailItem.slug || detailItem.id,
          type: 'poster'
        });
      }
    }
    setDetailItem(null);
    if (setIsCartOpen) setIsCartOpen(true);
  };

  const handleOrderWhatsAppSingle = (product, qty = 1, e) => {
    if (e) e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://abaia-cosmetique.mynexus.workers.dev';
    const imgUrl = (product.image_url || '').startsWith('http') ? product.image_url : `${origin}${product.image_url}`;
    
    let msg = `Bonjour ${brandName} ! ✨\nJe souhaite commander :\n\n`;
    msg += `• ${qty}x ${product.title} (${product.volume || 'Format standard'})\n`;
    msg += `  💰 Prix : ${(product.price_fcfa * qty).toLocaleString('fr-FR')} FCFA\n`;
    msg += `  📸 Visuel produit : ${imgUrl}\n\n`;
    msg += `📍 Livraison souhaitée à domicile / bureau.\n`;
    msg += `Merci de me confirmer la disponibilité et le délai de livraison !`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareProduct = (product, e) => {
    if (e) e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://abaia-cosmetique.mynexus.workers.dev';
    const directUrl = `${origin}/?p=${encodeURIComponent(product.slug || product.id)}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: product.title,
        text: `Découvrez "${product.title}" sur ${brandName} :`,
        url: directUrl
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
      setCopiedShareId(product.id);
      setTimeout(() => setCopiedShareId(null), 2500);
    }
  };

  const currentHeroProduct = cosmeticsCatalog[activeHeroIdx] || cosmeticsCatalog[0];

  return (
    <div
      className={`relative ${isPreview ? 'w-full min-h-full overflow-hidden' : 'min-h-screen overflow-x-hidden'} font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-500 ${
        isDarkMode ? 'bg-[#07090e] text-slate-100' : 'bg-[#FAF7F2] text-slate-900'
      }`}
    >

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BACKGROUND LUXE NATURE & VELOURS COSMÉTIQUE (MODE CLAIR & SOMBRE)   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-0 pointer-events-none transition-opacity duration-500`}>
        <img
          src={bgSkincare}
          alt="Abaïa Cosmétique Ambiance"
          className={`w-full h-full object-cover object-center transform scale-105 transition-all duration-500 ${
            isDarkMode ? 'filter brightness-75 opacity-90' : 'filter brightness-105 opacity-20'
          }`}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=85';
          }}
        />
        {/* Filtre Verre Frosted Glass Multi-Couches */}
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isDarkMode
              ? 'bg-gradient-to-b from-black/85 via-slate-950/70 to-slate-950/95'
              : 'bg-gradient-to-b from-[#FFFDF9]/85 via-[#FAF6F0]/92 to-[#F5EFEB]/98'
          }`}
        />
        {/* Halos Lumineux Décoratifs Ambrés & Pêche */}
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
            isDarkMode ? 'bg-amber-500/10' : 'bg-amber-400/20'
          }`}
        />
        <div
          className={`absolute top-2/3 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
            isDarkMode ? 'bg-rose-500/10' : 'bg-rose-300/25'
          }`}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CONTENEUR PRINCIPAL DU SITE GLASSMORPHISM                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className={`relative z-10 w-full mx-auto ${forceMobileLayout ? 'px-2.5 py-2 space-y-3' : 'max-w-7xl px-3 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-4 sm:space-y-8'}`}>

        {/* ── 1. NAVBAR EN VERRE FLOTTANT (AVEC BASCULEUR SOLEIL/LUNE) ── */}
        <header className="sticky top-2 sm:top-4 z-40">
          <nav
            className={`w-full backdrop-blur-2xl rounded-full px-3.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between transition-all duration-300 ${
              isDarkMode
                ? 'bg-slate-950/45 border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/35'
                : 'bg-white/80 border border-amber-900/10 shadow-[0_14px_35px_rgba(180,140,100,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)] hover:border-amber-900/20'
            }`}
          >
            {/* Logo Abaïa Cosmétique */}
            <a href="#hero" className="flex items-center gap-2.5 sm:gap-3 group">
              <AbaiaCosmetiqueLogo
                className="w-8 h-8 sm:w-10 sm:h-10"
                showText={true}
                logoUrl={settings.company_logo_url}
                isDarkMode={isDarkMode}
              />
            </a>

            {/* Navigation Liens Desktop (Masqués en mode smartphone/preview mobile) */}
            {!forceMobileLayout && (
              <div className={`hidden md:flex items-center gap-7 text-xs font-semibold tracking-wider ${
                isDarkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
                <a href="#hero" className={`transition-colors border-b-2 pb-0.5 ${
                  isDarkMode ? 'text-white hover:text-amber-400 border-amber-400' : 'text-slate-950 hover:text-amber-600 border-amber-600 font-bold'
                }`}>
                  ACCUEIL
                </a>
                <a href="#catalogue" className={`transition-colors uppercase ${
                  isDarkMode ? 'hover:text-amber-400' : 'hover:text-amber-700'
                }`}>
                  NOS SOINS ({cosmeticsCatalog.length} ARTICLES)
                </a>
                <a href="#bienfaits" className={`transition-colors uppercase ${
                  isDarkMode ? 'hover:text-amber-400' : 'hover:text-amber-700'
                }`}>
                  ACTIFS & NATURE
                </a>
                <a href="#engagements" className={`transition-colors uppercase ${
                  isDarkMode ? 'hover:text-amber-400' : 'hover:text-amber-700'
                }`}>
                  ENGAGEMENTS
                </a>
                <button
                  onClick={() => setIsFlyerModalOpen(true)}
                  className={`transition-colors uppercase flex items-center gap-1 font-bold ${
                    isDarkMode ? 'text-amber-300 hover:text-amber-400' : 'text-amber-800 hover:text-amber-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>AFFICHE OFFICIELLE</span>
                </button>
              </div>
            )}

            {/* Boutons d'Action (Sélecteur Mode Clair/Sombre + WhatsApp + Panier) */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* BASCULEUR VISIBLE MODE CLAIR | MODE SOMBRE (AFFICHAGE EXPLICITE CLAIR / SOMBRE) */}
              <div
                className={`p-0.5 rounded-full border backdrop-blur-md flex items-center shadow-inner transition-colors ${
                  isDarkMode
                    ? 'bg-white/10 border-white/20'
                    : 'bg-amber-900/10 border-amber-900/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setMode(false)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold transition-all duration-300 ${
                    !isDarkMode
                      ? 'bg-amber-500 text-slate-950 shadow-[0_2px_8px_rgba(245,158,11,0.4)] scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Activer le Mode Clair"
                >
                  <Sun className={`w-3.5 h-3.5 ${!isDarkMode ? 'text-slate-950 fill-slate-950' : 'text-slate-400'}`} />
                  <span>Clair</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode(true)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-amber-500 text-slate-950 shadow-[0_2px_8px_rgba(245,158,11,0.4)] scale-105'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                  title="Activer le Mode Sombre"
                >
                  <Moon className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-950 fill-slate-950' : 'text-slate-600'}`} />
                  <span>Sombre</span>
                </button>
              </div>

              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${
                  isDarkMode
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-600/30 text-amber-900'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{whatsappDisplay}</span>
              </a>

              <button
                onClick={() => setIsCartOpen && setIsCartOpen(true)}
                className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-lg ${
                  isDarkMode
                    ? 'bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-300'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/40 text-amber-900'
                }`}
                title="Panier & Commande"
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-md animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </nav>
        </header>

        {/* ── BANDEAU INTERACTIF PWA & ALERTES ── */}
        {showBanner && (
          <div
            className={`backdrop-blur-xl border rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors ${
              isDarkMode
                ? 'bg-gradient-to-r from-amber-950/80 via-slate-950/90 to-amber-900/60 border-amber-400/30 text-white'
                : 'bg-gradient-to-r from-amber-100/90 via-white/95 to-amber-50/90 border-amber-500/30 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow ${
                isDarkMode ? 'bg-amber-500/20 border-amber-400/40 text-amber-400' : 'bg-amber-500/15 border-amber-600/30 text-amber-700'
              }`}>
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black flex items-center gap-2">
                  <span>{settings.promo_banner_text || "L’excellence des soins naturels pour sublimer votre peau !"}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[8px] font-black uppercase">Exclusif</span>
                </h4>
                <p className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Commandez en direct sur WhatsApp avec conseils personnalisés et livraison rapide.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Bonjour Abaïa Cosmétique ! Je souhaite échanger avec une conseillère beauté.")}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Conseil Beauté</span>
              </a>

              <button
                onClick={() => setShowBanner(false)}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition shrink-0 ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
                    : 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-600 hover:text-black'
                }`}
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── 2. HERO SECTION : L’ÉLÉGANCE ET LA BEAUTÉ DE VOTRE PEAU AU NATUREL ── */}
        <section id="hero" className={forceMobileLayout ? "flex flex-col gap-4 items-center pt-1 pb-3" : "grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center pt-1 pb-3 sm:pb-6"}>

          {/* Panneau Gauche : Typographie Glassmorphism & Micro-Badges 2x2 */}
          <div
            className={`${forceMobileLayout ? 'w-full' : 'lg:col-span-7'} backdrop-blur-2xl rounded-[26px] sm:rounded-[34px] p-4 sm:p-9 transition-all duration-500 ${
              isDarkMode
                ? 'bg-slate-950/40 border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_1px_1.5px_rgba(255,255,255,0.35)]'
                : 'bg-white/80 border border-amber-900/10 shadow-[0_20px_50px_rgba(180,140,100,0.14),inset_0_1.5px_2px_rgba(255,255,255,0.95)]'
            }`}
          >
            {/* Sur-titre officiel */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] sm:text-xs font-bold uppercase tracking-wider mb-3 ${
              isDarkMode ? 'bg-amber-500/20 border-amber-400/30 text-amber-300' : 'bg-amber-500/15 border-amber-600/30 text-amber-800'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{brandTagline}</span>
            </div>

            {/* Grand Titre */}
            <h1 className={`${forceMobileLayout ? 'text-2xl sm:text-3xl leading-snug' : 'text-3xl sm:text-5xl xl:text-6xl leading-[1.08]'} font-black tracking-tight font-display ${
              isDarkMode ? 'text-white' : 'text-slate-950'
            }`}>
              {heroMainTitle}<br />
              <span className={`text-transparent bg-clip-text ${
                isDarkMode
                  ? 'bg-gradient-to-r from-amber-300 via-rose-200 to-yellow-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                  : 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700'
              }`}>
                {heroTitleAccent}
              </span>
            </h1>

            {/* Sous-titre */}
            <p className={`mt-3 sm:mt-4 text-[12px] sm:text-sm leading-relaxed max-w-xl ${
              isDarkMode ? 'text-slate-200/90' : 'text-slate-700'
            }`}>
              {heroSubtitle}
            </p>

            {/* 4 Micro-Chips en Verre : GRILLE 2x2 PARFAITE SUR MOBILE */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 sm:my-6">
              <div className={`backdrop-blur-md border rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center gap-1 shadow-sm ${
                isDarkMode ? 'bg-white/5 border-white/20' : 'bg-amber-500/10 border-amber-600/20'
              }`}>
                <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <span className={`text-[8.5px] sm:text-[9.5px] font-black tracking-wider uppercase ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {heroChip1}
                </span>
              </div>
              <div className={`backdrop-blur-md border rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center gap-1 shadow-sm ${
                isDarkMode ? 'bg-white/5 border-white/20' : 'bg-amber-500/10 border-amber-600/20'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                <span className={`text-[8.5px] sm:text-[9.5px] font-black tracking-wider uppercase ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {heroChip2}
                </span>
              </div>
              <div className={`backdrop-blur-md border rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center gap-1 shadow-sm ${
                isDarkMode ? 'bg-white/5 border-white/20' : 'bg-amber-500/10 border-amber-600/20'
              }`}>
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                <span className={`text-[8.5px] sm:text-[9.5px] font-black tracking-wider uppercase ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {heroChip3}
                </span>
              </div>
              <div className={`backdrop-blur-md border rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center gap-1 shadow-sm ${
                isDarkMode ? 'bg-white/5 border-white/20' : 'bg-amber-500/10 border-amber-600/20'
              }`}>
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" />
                <span className={`text-[8.5px] sm:text-[9.5px] font-black tracking-wider uppercase ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {heroChip4}
                </span>
              </div>
            </div>

            {/* Boutons d'Appel à l'Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Bonjour Abaïa Cosmétique ! 🌸 Je souhaite commander des soins pour ma routine beauté.")}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(245,158,11,0.35)] transition-all hover:scale-[1.02] active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{heroCtaText}</span>
              </a>

              <a
                href="#catalogue"
                className={`px-5 py-3.5 rounded-2xl backdrop-blur-md border font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition ${
                  isDarkMode
                    ? 'bg-white/10 hover:bg-white/15 border-white/25 text-white'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-600/30 text-amber-950'
                }`}
              >
                <span>DÉCOUVRIR LES SOINS</span>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </a>
            </div>
          </div>

          {/* Panneau Droit : Carte Vitrine 3D Bombée du Produit Phare */}
          <div className={`${forceMobileLayout ? 'w-full' : 'lg:col-span-5'} flex flex-col justify-center`}>
            <div
              onClick={() => handleOpenDetailModal(currentHeroProduct)}
              className="group relative rounded-3xl p-5 sm:p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              style={{
                background: isDarkMode
                  ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(15, 23, 42, 0.60) 45%, rgba(2, 6, 23, 0.85) 100%)'
                  : 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(252, 249, 245, 0.92) 50%, rgba(246, 240, 232, 0.96) 100%)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(215, 198, 175, 0.7)',
                boxShadow: isDarkMode
                  ? '0 20px 45px rgba(0,0,0,0.5), inset 0 1.5px 2px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.5)'
                  : '0 18px 40px rgba(180, 140, 100, 0.18), inset 0 2px 3px rgba(255,255,255,1), inset 0 -2px 4px rgba(210, 195, 180, 0.35)'
              }}
            >
              {/* Badge Phare */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                  ★ PRODUIT VEDETTE
                </span>
                <div className={`flex items-center gap-1 text-xs font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{currentHeroProduct.rating || '4.9'} ({currentHeroProduct.reviewsCount || '140'}+ avis)</span>
                </div>
              </div>

              {/* Photo du produit avec coins arrondis et ombre douce */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/5 border border-amber-900/10 mb-4 shadow-inner">
                <img
                  src={currentHeroProduct.image_url}
                  alt={currentHeroProduct.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = currentHeroProduct.fallback_img || 'https://images.unsplash.com/photo-1608248597359-548455d3e070?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md bg-black/60 border border-white/20 text-amber-300">
                    {currentHeroProduct.volume || 'Format 300 ml'}
                  </span>
                  <span className="text-sm font-black text-slate-950 px-3 py-1 rounded-lg bg-amber-500 shadow-md">
                    {currentHeroProduct.price_fcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <h3 className={`text-lg font-black transition-colors font-display line-clamp-1 ${
                isDarkMode ? 'text-white group-hover:text-amber-300' : 'text-slate-950 group-hover:text-amber-700'
              }`}>
                {currentHeroProduct.title}
              </h3>
              <p className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? 'text-slate-300/90' : 'text-slate-600'}`}>
                {currentHeroProduct.subtitle || currentHeroProduct.description}
              </p>

              <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${
                isDarkMode ? 'border-white/10' : 'border-amber-900/10'
              }`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrderWhatsAppSingle(currentHeroProduct, 1, e);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Commander en 1 Clic</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleQuickAddToCart(currentHeroProduct, e)}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/20 border-white/20 text-amber-300'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-600/30 text-amber-800'
                  }`}
                  title="Ajouter au Panier"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. SECTION CATALOGUE : CARTES 3D SUR 2 COLONNES SUR MOBILE ── */}
        <section id="catalogue" className={`pt-8 sm:pt-14 pb-8 sm:pb-12 border-t ${
          isDarkMode ? 'border-white/10' : 'border-amber-900/10'
        }`}>
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-2 ${
              isDarkMode ? 'bg-amber-500/20 border-amber-400/30 text-amber-300' : 'bg-amber-500/15 border-amber-600/30 text-amber-800'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gamme Soins & Beauté Naturelle</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-extrabold font-display ${
              isDarkMode ? 'text-white' : 'text-slate-950'
            }`}>
              {catalogTitle}
            </h2>
            <p className={`text-xs sm:text-sm mt-2 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {catalogSubtitle}
            </p>
          </div>

          {/* GRILLE 2 COLONNES STRICTES SUR MOBILE & 4 COLONNES SUR DESKTOP */}
          <div className={forceMobileLayout ? "grid grid-cols-2 gap-2 sm:gap-2.5" : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"}>
            {cosmeticsCatalog.map((item, idx) => {
              return (
                <div
                  key={item.id || idx}
                  onClick={() => handleOpenDetailModal(item)}
                  className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 text-left transition-all duration-300 hover:-translate-y-2 active:scale-[0.98] cursor-pointer"
                  style={{
                    background: isDarkMode
                      ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.13) 0%, rgba(15, 23, 42, 0.65) 45%, rgba(2, 6, 23, 0.88) 100%)'
                      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 250, 246, 0.92) 50%, rgba(247, 241, 233, 0.96) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(220, 205, 185, 0.65)',
                    boxShadow: isDarkMode
                      ? '0 12px 28px -4px rgba(0, 0, 0, 0.45), 0 4px 10px -2px rgba(0, 0, 0, 0.3), inset 0 1.5px 2px rgba(255, 255, 255, 0.42), inset 0 -2px 4px rgba(0, 0, 0, 0.45)'
                      : '0 12px 26px -4px rgba(180, 140, 100, 0.18), 0 4px 10px -2px rgba(0, 0, 0, 0.04), inset 0 2px 3px rgba(255, 255, 255, 1), inset 0 -2px 4px rgba(215, 200, 185, 0.35)'
                  }}
                >
                  {/* Photo Produit & Badge 3D */}
                  <div>
                    <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-black/5 mb-2 sm:mb-3 shadow-inner">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = item.fallback_img || 'https://images.unsplash.com/photo-1608248597359-548455d3e070?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />

                      {/* Badge Supérieur */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-md backdrop-blur-md bg-amber-500 text-slate-950 text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider shadow">
                          {item.tag || item.badge || 'SOIN NATUREL'}
                        </span>
                      </div>

                      {/* Bouton Partage Rapide */}
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={(e) => handleShareProduct(item, e)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full backdrop-blur-md bg-black/50 hover:bg-amber-500 hover:text-slate-950 text-white/90 flex items-center justify-center transition shadow"
                          title="Partager ce produit"
                        >
                          {copiedShareId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Format / Contenance en bas de l'image */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] sm:text-[10px] text-white">
                        <span className="px-2 py-0.5 rounded backdrop-blur-md bg-black/60 font-semibold border border-white/10">
                          {item.volume || 'Soin Pro'}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-300 font-bold bg-black/60 px-1.5 py-0.5 rounded">
                          <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                          <span>{item.rating || '4.9'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Titre & Description Courte */}
                    <h3 className={`text-xs sm:text-sm font-bold transition-colors line-clamp-1 sm:line-clamp-2 font-display ${
                      isDarkMode ? 'text-white group-hover:text-amber-300' : 'text-slate-950 group-hover:text-amber-700'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 line-clamp-1 leading-snug ${
                      isDarkMode ? 'text-slate-300/80' : 'text-slate-600'
                    }`}>
                      {item.subtitle || item.description}
                    </p>
                  </div>

                  {/* Prix & Boutons d'Action */}
                  <div className={`mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t flex items-center justify-between gap-1.5 ${
                    isDarkMode ? 'border-white/10' : 'border-amber-900/10'
                  }`}>
                    <div>
                      <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold uppercase block">Tarif</span>
                      <span className={`text-xs sm:text-base font-extrabold tracking-tight font-display ${
                        isDarkMode ? 'text-amber-400' : 'text-amber-800'
                      }`}>
                        {item.price_fcfa.toLocaleString('fr-FR')} <span className="text-[9px] sm:text-[10px] font-normal">{currency}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleQuickAddToCart(item, e)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border flex items-center justify-center transition active:scale-90 ${
                          isDarkMode
                            ? 'bg-white/10 hover:bg-white/20 border-white/20 text-amber-300'
                            : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-600/30 text-amber-800'
                        }`}
                        title="Ajouter au Panier"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOrderWhatsAppSingle(item, 1, e)}
                        className="px-2 sm:px-2.5 py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[9px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1 transition shadow active:scale-95"
                        title="Commander sur WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden xs:inline">WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. SECTION ACTIFS & BIENFAITS NATURELS (4 CARTES EN VERRE) ── */}
        <section id="bienfaits" className={`pt-8 sm:pt-12 pb-8 border-t ${
          isDarkMode ? 'border-white/10' : 'border-amber-900/10'
        }`}>
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-2 ${
              isDarkMode ? 'bg-amber-500/20 border-amber-400/30 text-amber-300' : 'bg-amber-500/15 border-amber-600/30 text-amber-800'
            }`}>
              <Leaf className="w-3.5 h-3.5" />
              <span>Synergie Végétale & Dermatologique</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-extrabold font-display ${
              isDarkMode ? 'text-white' : 'text-slate-950'
            }`}>
              Nos Ingrédients Nobles
            </h2>
            <p className={`text-xs sm:text-sm mt-2 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Une sélection d’actifs précieux reconnus par la science pour hydrater, nourrir et protéger la peau.
            </p>
          </div>

          <div className={forceMobileLayout ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"}>
            {ingredientCards.map((card) => {
              const IconComp = card.badgeIcon;
              return (
                <div
                  key={card.id}
                  className={`rounded-2xl p-4 sm:p-5 backdrop-blur-xl border shadow-lg flex flex-col justify-between transition-all ${
                    isDarkMode
                      ? 'bg-gradient-to-b from-white/[0.10] via-slate-900/60 to-slate-950/80 border-white/20'
                      : 'bg-gradient-to-b from-white via-[#FCFAF7] to-[#F7F2EA] border-amber-900/15'
                  }`}
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 shadow ${
                      isDarkMode ? 'bg-amber-500/20 border-amber-400/30 text-amber-300' : 'bg-amber-500/15 border-amber-600/30 text-amber-700'
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold tracking-wider uppercase block mb-1 ${
                      isDarkMode ? 'text-amber-300' : 'text-amber-700'
                    }`}>
                      {card.tag}
                    </span>
                    <h3 className={`text-sm sm:text-base font-bold font-display ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {card.title}
                    </h3>
                    <p className={`text-xs mt-2 leading-relaxed ${
                      isDarkMode ? 'text-slate-300/85' : 'text-slate-600'
                    }`}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 5. SECTION ENGAGEMENTS QUALITÉ (6 PILIERS D'EXCELLENCE) ── */}
        <section id="engagements" className={`pt-8 sm:pt-12 pb-12 border-t ${
          isDarkMode ? 'border-white/10' : 'border-amber-900/10'
        }`}>
          <div
            className={`backdrop-blur-2xl rounded-[24px] sm:rounded-[32px] p-5 sm:p-10 shadow-2xl transition-all ${
              isDarkMode ? 'bg-slate-950/45 border border-white/20' : 'bg-white/85 border border-amber-900/10'
            }`}
          >
            <div className="max-w-3xl mx-auto text-center mb-8">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-2 ${
                isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' : 'bg-amber-500/15 text-amber-800 border-amber-600/30'
              }`}>
                <Award className="w-3.5 h-3.5" /> Charte de Beauté & Éthique
              </span>
              <h2 className={`text-2xl sm:text-3xl font-extrabold font-display ${
                isDarkMode ? 'text-white' : 'text-slate-950'
              }`}>
                Nos 6 Engagements de Qualité
              </h2>
            </div>

            <div className={forceMobileLayout ? "grid grid-cols-1 gap-2 max-w-4xl mx-auto" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 max-w-4xl mx-auto"}>
              {qualityCommitments.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3.5 rounded-xl backdrop-blur-md border ${
                    isDarkMode ? 'bg-white/5 border-white/15' : 'bg-amber-50/80 border-amber-900/10'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                    isDarkMode ? 'bg-amber-500/20 border-amber-400/40 text-amber-300' : 'bg-amber-500/15 border-amber-600/30 text-amber-700'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER GLASSMORPHISM ── */}
        <footer className={`border-t py-8 text-center text-xs space-y-2 ${
          isDarkMode ? 'border-white/10 text-slate-400' : 'border-amber-900/10 text-slate-600'
        }`}>
          <div className="flex items-center justify-center gap-3">
            <AbaiaCosmetiqueLogo className="w-7 h-7" showText={true} logoUrl={settings.company_logo_url} isDarkMode={isDarkMode} />
          </div>
          <p>© 2026 {brandName}. Tous droits réservés. L’élégance de votre peau au naturel.</p>
          <div className="flex items-center justify-center gap-4 text-[11px] pt-1">
            <a href="#hero" className={`transition ${isDarkMode ? 'hover:text-amber-300' : 'hover:text-amber-700 font-medium'}`}>Accueil</a>
            <span>•</span>
            <a href="#catalogue" className={`transition ${isDarkMode ? 'hover:text-amber-300' : 'hover:text-amber-700 font-medium'}`}>Catalogue</a>
            <span>•</span>
            <button onClick={toggleTheme} className="hover:underline font-bold text-amber-600">
              {isDarkMode ? 'Basculer en Mode Clair ☀️' : 'Basculer en Mode Sombre 🌙'}
            </button>
            <span>•</span>
            <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="text-amber-600 font-bold hover:underline">WhatsApp Direct</a>
            {onNavigateAdmin && (
              <>
                <span>•</span>
                <button onClick={onNavigateAdmin} className="text-slate-400 hover:text-slate-600 transition">Administration</button>
              </>
            )}
          </div>
        </footer>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALE DÉTAIL SOIN GLASSMORPHISM (COMMANDE EN 1 CLIC)                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {detailItem && (
        <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn`}>
          <div
            className={`relative w-full max-w-lg rounded-3xl backdrop-blur-2xl border p-5 sm:p-7 max-h-[92vh] overflow-y-auto ${
              isDarkMode
                ? 'bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-black/95 border-white/25 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.3)]'
                : 'bg-gradient-to-b from-white/98 via-[#FCFAF7]/98 to-[#F7F2EA]/98 border-amber-900/15 text-slate-900 shadow-[0_25px_60px_rgba(180,140,100,0.25),inset_0_2px_3px_rgba(255,255,255,1)]'
            }`}
          >
            {/* Bouton Fermer */}
            <button
              onClick={() => setDetailItem(null)}
              className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition z-10 ${
                isDarkMode ? 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-slate-600 hover:text-black'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Photo Produit & En-tête */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-black/5 border border-amber-900/10 shrink-0 shadow-md">
                <img
                  src={detailItem.image_url}
                  alt={detailItem.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = detailItem.fallback_img || 'https://images.unsplash.com/photo-1608248597359-548455d3e070?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              <div className="text-left flex-1">
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'bg-amber-500/20 border-amber-400/30 text-amber-300' : 'bg-amber-500/15 border-amber-600/30 text-amber-800'
                }`}>
                  {detailItem.tag || detailItem.badge || 'SOIN NATUREL'}
                </span>
                <h3 className={`text-base sm:text-lg font-black mt-1 font-display ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                  {detailItem.title}
                </h3>
                <p className={`text-xs font-semibold mt-0.5 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                  Contenance : {detailItem.volume || detailItem.contenance || '300 ml'}
                </p>
                <div className={`text-lg font-extrabold mt-1 font-display ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  {detailItem.price_fcfa.toLocaleString('fr-FR')} {currency}
                </div>
              </div>
            </div>

            {/* Description & Actifs avec Respect Intégral des Puces et Paragraphes */}
            <div className={`mt-4 pt-3 border-t text-left space-y-3 ${isDarkMode ? 'border-white/10' : 'border-amber-900/10'}`}>
              <FormattedProductDescription
                description={detailItem.description}
                isDarkMode={isDarkMode}
              />

              {detailItem.mode && !detailItem.description?.toLowerCase().includes('mode d') && !detailItem.description?.toLowerCase().includes('conseil d') && (
                <div className={`p-3 rounded-xl border text-xs ${
                  isDarkMode ? 'bg-white/5 border-white/10' : 'bg-amber-500/10 border-amber-600/20'
                }`}>
                  <span className={`font-bold block mb-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>Conseil d’utilisation :</span>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{detailItem.mode}</p>
                </div>
              )}

              {Array.isArray(detailItem.composition) && detailItem.composition.length > 0 && !detailItem.description?.toLowerCase().includes('composition') && (
                <div className="text-xs">
                  <span className={`font-bold block mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Actifs Clés :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {detailItem.composition.map((comp, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-amber-500/15 text-amber-900'
                      }`}>
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sélecteur de Quantité */}
            <div className={`mt-4 pt-3 border-t flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-amber-900/10'}`}>
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Quantité :</span>
              <div className={`flex items-center gap-3 border rounded-xl px-2.5 py-1 ${
                isDarkMode ? 'bg-white/10 border-white/20' : 'bg-amber-500/10 border-amber-600/20'
              }`}>
                <button
                  onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                  className={isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className={`text-sm font-black min-w-[20px] text-center ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>{detailQty}</span>
                <button
                  onClick={() => setDetailQty(detailQty + 1)}
                  className={isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Boutons d'Action Commande */}
            <div className={`mt-5 pt-3 border-t flex flex-col sm:flex-row gap-2.5 ${isDarkMode ? 'border-white/10' : 'border-amber-900/10'}`}>
              <button
                type="button"
                onClick={() => handleOrderWhatsAppSingle(detailItem, detailQty)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Commander sur WhatsApp ({(detailItem.price_fcfa * detailQty).toLocaleString('fr-FR')} {currency})</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmModalAddToCart}
                className={`py-3 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 ${
                  isDarkMode ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-600/30 text-amber-950'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Au Panier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALE AFFICHE OFFICIELLE (FLYER GRAND FORMAT)                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isFlyerModalOpen && (
        <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md`}>
          <div className={`relative max-w-lg w-full rounded-3xl backdrop-blur-2xl border p-4 shadow-2xl ${
            isDarkMode ? 'bg-slate-950/95 border-white/20 text-white' : 'bg-white/95 border-amber-900/15 text-slate-900'
          }`}>
            <button
              onClick={() => setIsFlyerModalOpen(false)}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition z-10 ${
                isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-black'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>Visuel Officiel Abaïa Cosmétique</h4>
            <div className="rounded-2xl overflow-hidden bg-black/5 max-h-[75vh] flex items-center justify-center">
              <img
                src={settings.hero_banner_image || '/api/media/1791544082634-banni_re.webp'}
                alt="Affiche Officielle"
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80';
                }}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setIsFlyerModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isDarkMode ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-900'
                }`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOAST CONFIRMATION AJOUT AU PANIER                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {addedItemToast && (
        <div className={`${isPreview ? 'absolute' : 'fixed'} bottom-20 right-6 z-50 border backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce ${
          isDarkMode ? 'bg-slate-900/95 border-amber-400/40 text-white' : 'bg-white/95 border-amber-600/40 text-slate-900'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold">{addedItemToast} ajouté au panier !</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BOUTON FLOTTANT MODE CLAIR / SOMBRE (ACCÈS RAPIDE 1-TAP)            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className={`${isPreview ? 'absolute' : 'fixed'} bottom-6 left-3 sm:left-6 z-40`}>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDarkMode ? "Passer au Mode Clair" : "Passer au Mode Sombre"}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            isDarkMode
              ? 'bg-slate-950/85 border-amber-400/40 text-amber-300 shadow-[0_8px_25px_rgba(0,0,0,0.6)]'
              : 'bg-white/95 border-amber-600/30 text-slate-900 shadow-[0_8px_25px_rgba(180,140,100,0.25)]'
          }`}
          title={isDarkMode ? "Basculer en Mode Clair" : "Basculer en Mode Sombre"}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="text-[11px] sm:text-xs font-black">Mode Clair</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-amber-800" />
              <span className="text-[11px] sm:text-xs font-black">Mode Sombre</span>
            </>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BOUTON FLOTTANT WHATSAPP DIRECT                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <a
        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Bonjour Abaïa Cosmétique ! Je souhaite passer une commande.")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter sur WhatsApp"
        className={`${isPreview ? 'absolute' : 'fixed'} bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-full shadow-[0_10px_35px_rgba(245,158,11,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 group`}
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-slate-950 group-hover:rotate-12 transition-transform duration-300" />
        <span className="hidden sm:inline text-xs sm:text-sm font-bold tracking-wide">
          Discuter sur WhatsApp
        </span>
      </a>

    </div>
  );
}
