import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Grid,
  Heart,
  Home,
  ShoppingBag,
  MessageCircle,
  MapPin,
  Car,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Calendar,
  Clock,
  Calculator,
  Share2,
  Moon,
  Sun,
  Download,
  Smartphone,
  Mail,
} from 'lucide-react';

export function NeumorphicRentalView({
  settings = {},
  posters = [],
  currency = 'XAF',
  whatsappNumber = '24162744533',
  isPreview = false,
}) {
  // Filtre actif : 'all' | 'meuble' | 'voiture'
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Mode Sombre (Dark Mode) avec persistance dans le navigateur
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('location_express_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('location_express_dark_mode', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Support PWA (Installation mobile en 1 clic sur l'écran d'accueil)
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstallable, setIsPwaInstallable] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPwaInstallable(true);
    };

    const handleAppInstalled = () => {
      setPwaInstalled(true);
      setIsPwaInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) {
      alert("Pour installer l'application sur iPhone : appuyez sur le bouton Partager ⎋ de Safari puis sur 'Sur l'écran d'accueil' 📲.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPwaInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Basculer un favori
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Catalogue effectif avec intégration native du véhicule vedette Mazda CX-5 du flyer officiel
  const effectivePosters = useMemo(() => {
    if (Array.isArray(posters) && posters.length > 0) {
      const hasRentalItems = posters.some((p) => {
        const cat = (p.category || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return cat.includes('voiture') || cat.includes('meuble') || title.includes('mazda') || title.includes('villa') || title.includes('toyota') || title.includes('appart');
      });
      if (hasRentalItems) return posters;
    }
    if (Array.isArray(settings.custom_posters) && settings.custom_posters.length > 0) {
      return settings.custom_posters;
    }
    return [
      {
        id: 'car-mazda-cx5',
        title: 'Mazda CX-5 SUV Luxe Blanche',
        category: 'Voiture',
        format: 'SUV / Crossover Luxe',
        dimensions: '5 Places • Boîte Auto • Climatisation Pro',
        price_fcfa: 45000,
        price_eur: 69,
        badge: 'VÉHICULE DU FLYER',
        image_url: '/flyer-location-express.jpg',
        images: [
          '/flyer-location-express.jpg',
          'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
        ],
        description: "Mazda CX-5 récent, très confortable et économique. Parfait pour vos déplacements d'affaires et séjours à Owendo et Libreville. Climatisation intégrale, intérieur soigné et grand confort de conduite.",
        features: [
          'Véhicules récents et bien entretenus (Flyer Officiel)',
          'Boîte automatique séquentielle fluide',
          'Climatisation intégrale grand confort',
          'Assurance tous risques incluse',
          'Disponible immédiatement à Owendo & Libreville'
        ]
      },
      {
        id: 'house-villa-sabliere',
        title: 'Villa de Luxe 3 Chambres - La Sablière',
        category: 'Meublé',
        format: 'Villa VIP',
        dimensions: '3 Chambres • Salon VIP • Piscine',
        price_fcfa: 75000,
        price_eur: 115,
        badge: 'COUP DE COEUR',
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Somptueuse villa meublée à La Sablière avec piscine privée, grand salon contemporain et suites parentales climatisées. Environnement hautement sécurisé.',
        features: [
          'Wifi Fibre Optique très haut débit illimité',
          'Groupe électrogène automatique & Cuve 2000L',
          'Sécurité gardiennage 24h/24 & caméras',
          'Toutes les pièces entièrement climatisées',
          'Cuisine américaine tout équipée'
        ]
      },
      {
        id: 'car-prado',
        title: 'Toyota Land Cruiser Prado TXL',
        category: 'Voiture',
        format: 'SUV / 4x4 Luxe',
        dimensions: '7 Places • Boîte Auto • Climatisation',
        price_fcfa: 60000,
        price_eur: 92,
        badge: '4x4 PUISSANT',
        image_url: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Toyota Prado tout confort, idéal pour Libreville et missions professionnelles. Véhicule puissant, spacieux et sécurisé.',
        features: [
          'Moteur V6 robuste & transmission 4x4 intégrale',
          'Climatisation bi-zone ultra-fraîche',
          'Boîte automatique & 7 vraies places',
          'Assurance tous risques incluse'
        ]
      },
      {
        id: 'house-guegue',
        title: 'Appartement F2 Standing - Haut de Gué-Gué',
        category: 'Meublé',
        format: 'Appartement T2',
        dimensions: '1 Chambre • Grand Salon • Cuisine Ouverte',
        price_fcfa: 35000,
        price_eur: 53,
        badge: 'POPULAIRE',
        image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Charmant appartement meublé dans un quartier résidentiel au Haut de Gué-Gué. Quartier sécurisé, calme et facilement accessible.',
        features: [
          'Smart TV connectée avec Canal+ et Netflix',
          'Autonomie en eau et en électricité continue',
          'Ménage inclus 3 fois par semaine'
        ]
      },
      {
        id: 'car-hilux',
        title: 'Toyota Hilux Double Cabine 4x4',
        category: 'Voiture',
        format: 'Pick-Up Tout-Terrain',
        dimensions: '5 Places • Grande Benne • Diesel',
        price_fcfa: 55000,
        price_eur: 84,
        badge: 'TOUT-TERRAIN',
        image_url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'La référence du tout-terrain au Gabon. Prêt pour affronter les pistes ou transporter du matériel en toute sérénité.',
        features: [
          'Châssis renforcé tout-terrain & pare-buffles',
          'Grande benne arrière pour bagages ou matériel',
          'Moteur Turbo Diesel économique et endurant'
        ]
      },
      {
        id: 'house-batterie4',
        title: 'Studio Cosy Design - Batterie 4',
        category: 'Meublé',
        format: 'Studio Équipé',
        dimensions: 'Lit King Size • Kitchenette • Balcon',
        price_fcfa: 25000,
        price_eur: 38,
        badge: 'DISPONIBLE',
        image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Studio moderne et intime à proximité du bord de mer et des commerces de Batterie 4.',
        features: [
          'Proche de tous les commerces',
          'Climatisation neuve & eau chaude',
          'Wifi fibre optique & espace bureau'
        ]
      }
    ];
  }, [posters, settings.custom_posters]);

  // Filtrage intelligent
  const filteredItems = useMemo(() => {
    return effectivePosters.filter((item) => {
      // 1. Filtre catégorie
      const cat = (item.category || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      const isMeuble =
        cat.includes('meubl') ||
        cat.includes('maison') ||
        cat.includes('villa') ||
        cat.includes('appart') ||
        cat.includes('studio') ||
        title.includes('villa') ||
        title.includes('appart') ||
        title.includes('studio') ||
        title.includes('meubl');

      if (activeFilter === 'meuble' && !isMeuble) return false;
      if (activeFilter === 'voiture' && isMeuble) return false;

      // 2. Recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const desc = (item.description || '').toLowerCase();
        const feats = Array.isArray(item.features)
          ? item.features.join(' ').toLowerCase()
          : '';
        return (
          title.includes(q) ||
          cat.includes(q) ||
          desc.includes(q) ||
          feats.includes(q)
        );
      }
      return true;
    });
  }, [effectivePosters, activeFilter, searchQuery]);

  // Séparation en 2 sections "Featured" et "Best Seller" pour le design 100% fidèle
  const featuredList = useMemo(() => {
    if (activeFilter !== 'all' || searchQuery.trim()) {
      return filteredItems;
    }
    return filteredItems.slice(0, 2);
  }, [filteredItems, activeFilter, searchQuery]);

  const bestSellerList = useMemo(() => {
    if (activeFilter !== 'all' || searchQuery.trim()) {
      return [];
    }
    return filteredItems.slice(2);
  }, [filteredItems, activeFilter, searchQuery]);

  // Fonctions utilitaires pour le calendrier et l'agenda
  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getFutureDateStr = (days = 2, baseDateStr = null) => {
    const base = baseDateStr ? new Date(baseDateStr) : new Date();
    base.setDate(base.getDate() + days);
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, '0');
    const d = String(base.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDateFr = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    } catch (e) {
      return dateStr;
    }
  };

  // État de l'Agenda & Dates de réservation
  const [bookingStartDate, setBookingStartDate] = useState(() => getTodayStr());
  const [bookingEndDate, setBookingEndDate] = useState(() => getFutureDateStr(3));

  // Calcul automatique de la durée en jours
  const bookingDuration = useMemo(() => {
    if (!bookingStartDate || !bookingEndDate) return 1;
    const s = new Date(bookingStartDate);
    const e = new Date(bookingEndDate);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingStartDate, bookingEndDate]);

  // Calcul automatique du montant total
  const bookingTotalPrice = useMemo(() => {
    if (!selectedItem?.price_fcfa) return 0;
    return selectedItem.price_fcfa * bookingDuration;
  }, [selectedItem, bookingDuration]);

  // Réglage rapide de la durée (+1j, +3j, +7j, etc.)
  const handleQuickDuration = (days) => {
    const base = bookingStartDate || getTodayStr();
    setBookingEndDate(getFutureDateStr(days, base));
  };

  const handleStartDateChange = (val) => {
    setBookingStartDate(val);
    if (val && bookingEndDate && val >= bookingEndDate) {
      setBookingEndDate(getFutureDateStr(1, val));
    }
  };

  // Ouvrir la modale détail d'un produit
  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setActivePhotoIndex(0);
  };

  // Récupérer la liste complète des photos pour un item
  const getItemImages = (item) => {
    if (!item) return [];
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    }
    if (item.image_url) {
      return [item.image_url];
    }
    return [
      'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80',
    ];
  };

  // Générer le lien WhatsApp de réservation avec Photo + Dates + Calcul Automatique
  const getWhatsAppBookingLink = (item) => {
    const rawNum = (
      whatsappNumber ||
      settings.whatsapp_number ||
      '24162744533'
    ).replace(/[^0-9]/g, '');

    const isMeuble = (item?.category || '').toLowerCase().includes('meubl');
    const unitLabel = isMeuble ? 'nuit' : 'jour';

    // Obtenir l'URL absolue de l'image (pour que WhatsApp charge directement l'aperçu photo)
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://digital-mark-pro.mynexus.workers.dev';

    let imgUrl = item?.image_url || '';
    if (Array.isArray(item?.images) && item.images.length > 0) {
      imgUrl = item.images[activePhotoIndex] || item.images[0] || imgUrl;
    }

    const absoluteImgUrl = imgUrl.startsWith('http')
      ? imgUrl
      : `${origin}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;

    const unitPriceStr = item?.price_fcfa
      ? `${Number(item.price_fcfa).toLocaleString('fr-FR')} FCFA / ${unitLabel}`
      : 'Sur devis';

    const totalPriceStr = bookingTotalPrice
      ? `${Number(bookingTotalPrice).toLocaleString('fr-FR')} FCFA`
      : unitPriceStr;

    const text = `👋 *NOUVELLE COMMANDE - LOCATION EXPRESS GABON*

${isMeuble ? '🏡 *Hébergement sélectionné*' : '🚗 *Véhicule sélectionné*'} : *${item?.title || 'Votre offre'}*
🖼️ *Photo du véhicule* : ${absoluteImgUrl}

📅 *PÉRIODE DE MISE À DISPOSITION* :
• Date de prise en charge : *${formatDateFr(bookingStartDate)}*
• Date de restitution : *${formatDateFr(bookingEndDate)}*
⏱️ *Durée définie* : *${bookingDuration} ${unitLabel}${bookingDuration > 1 ? 's' : ''}*

💰 *CALCUL DU MONTANT À PAYER* :
• Tarif unitaire : ${unitPriceStr}
💵 *TOTAL ESTIMÉ* : *${totalPriceStr}*

Pouvez-vous me confirmer la disponibilité du véhicule pour ces dates ? Merci !`;

    return `https://wa.me/${rawNum}?text=${encodeURIComponent(text)}`;
  };

  const logoSrc = settings.company_logo_url || '/logo-location-express.jpg';

  return (
    <div
      className={`min-h-screen pb-32 transition-colors duration-300 antialiased selection:bg-blue-600 selection:text-white relative ${
        isDarkMode ? 'bg-[#0B0F19] text-slate-100' : 'bg-[#F0F4FA] text-slate-800'
      }`}
    >
      {/* =========================================================================
          1. HEADER HAUT DE PAGE : COURBE DYNAMIQUE BLEU ÉLECTRIQUE -> VERT ÉMERAUDE
          ========================================================================= */}
      <div 
        className="relative bg-gradient-to-r from-[#0062FF] via-[#00A3FF] to-[#00D68F] pt-6 pb-16 px-5 sm:px-6 rounded-b-[44px] shadow-[0_15px_35px_rgba(0,98,255,0.22)] overflow-hidden max-w-xl mx-auto"
        style={settings.color_primary && settings.color_secondary ? {
          background: `linear-gradient(135deg, ${settings.color_primary}, ${settings.color_secondary})`
        } : undefined}
      >
        {/* Cercles décoratifs organiques en arrière-plan */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* BANDEAU SLOGAN & ANNONCE OFFICIEL DU FLYER */}
        {(settings.promo_banner_active === true || settings.promo_banner_active === 'true' || !settings.promo_banner_text) && (
          <div className="relative z-10 mb-3 py-1.5 px-3 rounded-2xl bg-black/35 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">
              {settings.promo_banner_text || "🚗 Voyagez, Séjournez... en toute sérénité ! Flotte Mazda CX-5 à Owendo"}
            </span>
          </div>
        )}

        {/* LIGNE SUPÉRIEURE : MENU 4 POINTS + LOGO OFFICIEL + BOUTON DARK MODE */}
        <div className="flex items-center justify-between relative z-10 gap-3">
          {/* Menu 4 points */}
          <button
            onClick={() => setActiveFilter('all')}
            className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm hover:bg-white/30 active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Réinitialiser les filtres"
          >
            <Grid className="w-5 h-5 text-white" />
          </button>

          {/* LOGO OFFICIEL LOCATION EXPRESS GABON */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={logoSrc}
              alt={settings.company_name || 'Location Express Gabon'}
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-2xl bg-white/95 p-1 shadow-lg border border-amber-300/60 shrink-0"
            />
            <div className="text-left overflow-hidden">
              <h1 className="text-white font-black text-sm sm:text-base leading-tight tracking-tight truncate drop-shadow-sm">
                {settings.company_name || 'Location Express Gabon'}
              </h1>
              <p className="text-white/90 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-200 shrink-0" />
                <span className="truncate">{settings.city_location || 'Owendo & Libreville, Gabon 🇬🇦'}</span>
              </p>
            </div>
          </div>

          {/* ACTIONS HAUT DROITE : DARK MODE + WHATSAPP DIRECT */}
          <div className="flex items-center gap-2 shrink-0">
            {/* BOUTON BASCULE MODE SOMBRE (DARK MODE) */}
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm hover:bg-white/30 active:scale-95 transition-all cursor-pointer"
              title={isDarkMode ? 'Passer en Mode Clair' : 'Passer en Mode Sombre'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-300 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-white animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* BOUTON ASSISTANCE WHATSAPP DIRECTE */}
            <button
              onClick={() => {
                const num = (
                  whatsappNumber ||
                  settings.whatsapp_number ||
                  '24162744533'
                ).replace(/[^0-9]/g, '');
                window.open(`https://wa.me/${num}`, '_blank');
              }}
              className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-emerald-600 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title="Assistance WhatsApp Directe"
            >
              <MessageCircle className="w-5 h-5 fill-emerald-600 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* BARRE DE RECHERCHE EN PILULE (S'ADAPTE AU MODE CLAIR / SOMBRE) */}
        <div className="mt-5 relative z-10">
          <div
            className={`rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.08)] py-3 px-5 flex items-center gap-3.5 transition-all ${
              isDarkMode
                ? 'bg-[#151D2E]/95 border border-slate-700/80 text-white'
                : 'bg-white border border-white/90 text-slate-800'
            }`}
          >
            <Search className="w-5 h-5 text-blue-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une voiture, un meublé, un quartier..."
              className={`text-xs sm:text-sm font-medium bg-transparent outline-none w-full ${
                isDarkMode ? 'text-white placeholder-slate-400' : 'text-slate-800 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* BANNIÈRE INSTALLATION APPLICATION PWA (SI DISPONIBLE OU MOBILE) */}
        {isPwaInstallable && !pwaInstalled && (
          <div className="mt-3 relative z-10 flex items-center justify-between bg-black/35 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-2 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Smartphone className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Installez l'application sur votre écran d'accueil</span>
            </div>
            <button
              onClick={handleInstallPwa}
              className="px-3 py-1 bg-white text-blue-700 rounded-xl text-xs font-black shadow hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
            >
              Installer
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. BOUTONS FLOTTANTS CLAIRMORPHISME / NEUMORPHISME (MEUBLÉS, VOITURES, TOUT)
          ========================================================================= */}
      <div className="max-w-xl mx-auto px-5 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-3 gap-3">
          {/* BOUTON MEUBLÉS (FILTRE LES MAISONS / APPARTEMENTS) */}
          <button
            onClick={() =>
              setActiveFilter((prev) => (prev === 'meuble' ? 'all' : 'meuble'))
            }
            className={`rounded-2xl p-3 text-center transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center cursor-pointer ${
              activeFilter === 'meuble'
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_12px_28px_rgba(0,98,255,0.35)] scale-[1.03] border-2 border-white'
                : isDarkMode
                ? 'bg-[#151D2E]/90 backdrop-blur-xl border border-slate-700/80 text-slate-200 shadow-[6px_6px_16px_rgba(0,0,0,0.5),-3px_-3px_10px_rgba(255,255,255,0.02)] hover:bg-[#1E293B]'
                : 'bg-white/85 backdrop-blur-xl border border-white/90 text-slate-700 shadow-[6px_6px_16px_rgba(180,195,215,0.25),-4px_-4px_12px_rgba(255,255,255,0.95)] hover:bg-white'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                activeFilter === 'meuble'
                  ? 'bg-white/20 text-white'
                  : isDarkMode
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs font-black mt-1.5 tracking-tight">
              Meublés
            </span>
            <span
              className={`text-[10px] font-medium leading-none mt-0.5 ${
                activeFilter === 'meuble' ? 'text-blue-100' : isDarkMode ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              Appartements
            </span>
          </button>

          {/* BOUTON VOITURES */}
          <button
            onClick={() =>
              setActiveFilter((prev) =>
                prev === 'voiture' ? 'all' : 'voiture'
              )
            }
            className={`rounded-2xl p-3 text-center transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center cursor-pointer ${
              activeFilter === 'voiture'
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_12px_28px_rgba(0,98,255,0.35)] scale-[1.03] border-2 border-white'
                : isDarkMode
                ? 'bg-[#151D2E]/90 backdrop-blur-xl border border-slate-700/80 text-slate-200 shadow-[6px_6px_16px_rgba(0,0,0,0.5),-3px_-3px_10px_rgba(255,255,255,0.02)] hover:bg-[#1E293B]'
                : 'bg-white/85 backdrop-blur-xl border border-white/90 text-slate-700 shadow-[6px_6px_16px_rgba(180,195,215,0.25),-4px_-4px_12px_rgba(255,255,255,0.95)] hover:bg-white'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                activeFilter === 'voiture'
                  ? 'bg-white/20 text-white'
                  : isDarkMode
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Car className="w-5 h-5" />
            </div>
            <span className="text-xs font-black mt-1.5 tracking-tight">
              Voitures
            </span>
            <span
              className={`text-[10px] font-medium leading-none mt-0.5 ${
                activeFilter === 'voiture' ? 'text-blue-100' : isDarkMode ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              4x4 & Berlines
            </span>
          </button>

          {/* BOUTON TOUT AFFICHER */}
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className={`rounded-2xl p-3 text-center transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center cursor-pointer ${
              activeFilter === 'all' && !searchQuery
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_12px_28px_rgba(16,185,129,0.35)] scale-[1.03] border-2 border-white'
                : isDarkMode
                ? 'bg-[#151D2E]/90 backdrop-blur-xl border border-slate-700/80 text-slate-200 shadow-[6px_6px_16px_rgba(0,0,0,0.5),-3px_-3px_10px_rgba(255,255,255,0.02)] hover:bg-[#1E293B]'
                : 'bg-white/85 backdrop-blur-xl border border-white/90 text-slate-700 shadow-[6px_6px_16px_rgba(180,195,215,0.25),-4px_-4px_12px_rgba(255,255,255,0.95)] hover:bg-white'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                activeFilter === 'all' && !searchQuery
                  ? 'bg-white/20 text-white'
                  : isDarkMode
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-black mt-1.5 tracking-tight">
              Tout Voir
            </span>
            <span
              className={`text-[10px] font-medium leading-none mt-0.5 ${
                activeFilter === 'all' && !searchQuery
                  ? 'text-emerald-100'
                  : isDarkMode ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              Véhicules & Maisons
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. CONTENU PRINCIPAL : CARTES NEUMORPHIQUES EN STRICTEMENT 2 COLONNES
          ========================================================================= */}
      <main className="max-w-xl mx-auto px-5 sm:px-6 mt-8 space-y-8">
        {/* BANNIÈRE FILTRE ACTIF */}
        {activeFilter !== 'all' && (
          <div
            className={`flex items-center justify-between rounded-2xl p-3 px-4 text-xs font-semibold shadow-sm ${
              isDarkMode
                ? 'bg-blue-950/60 border border-blue-800/80 text-blue-200'
                : 'bg-blue-50/80 border border-blue-200/60 text-blue-900'
            }`}
          >
            <span>
              Affichage :{' '}
              <strong>
                {activeFilter === 'meuble'
                  ? '🏡 Tous les Appartements Meublés'
                  : '🚗 Toutes les Voitures'}
              </strong>
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className="text-blue-500 hover:underline text-[11px] font-bold cursor-pointer"
            >
              Réinitialiser
            </button>
          </div>
        )}

        {/* SECTION 1 : "FEATURED" (STRICTEMENT 2 COLONNES) */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2
              className={`text-lg font-black tracking-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              {activeFilter === 'meuble'
                ? 'Meublés Disponibles'
                : activeFilter === 'voiture'
                ? 'Véhicules Disponibles'
                : 'Featured'}
            </h2>
            <button
              onClick={() => {
                setActiveFilter(activeFilter === 'meuble' ? 'all' : 'meuble');
              }}
              className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          {featuredList.length === 0 ? (
            <div
              className={`rounded-3xl p-8 text-center shadow-sm border ${
                isDarkMode
                  ? 'bg-[#151D2E] border-slate-800 text-slate-400'
                  : 'bg-white border-slate-100 text-slate-500'
              }`}
            >
              <p className="text-sm font-medium">
                Aucun article ne correspond à votre recherche.
              </p>
            </div>
          ) : (
            /* GRILLE STRICTE 2 COLONNES */
            <div className="grid grid-cols-2 gap-3.5">
              {featuredList.map((item) => {
                const images = getItemImages(item);
                const isLiked = Boolean(favorites[item.id]);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className={`group rounded-3xl p-3 relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#151D2E] border border-slate-800/90 shadow-[6px_6px_18px_rgba(0,0,0,0.5),-3px_-3px_12px_rgba(255,255,255,0.02)] hover:shadow-[8px_8px_22px_rgba(0,0,0,0.7)]'
                        : 'bg-white border border-white/90 shadow-[6px_6px_16px_rgba(180,195,215,0.22),-4px_-4px_12px_rgba(255,255,255,0.95)] hover:shadow-[8px_8px_20px_rgba(180,195,215,0.3)]'
                    }`}
                  >
                    {/* BOUTON COEUR FLOTTANT BLEU EN HAUT À DROITE */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className={`absolute top-4 right-4 z-10 w-7 h-7 rounded-full backdrop-blur-sm shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-transform ${
                        isDarkMode
                          ? 'bg-slate-900/80 text-blue-400 border border-slate-700/60'
                          : 'bg-white/95 text-blue-600'
                      }`}
                      title="Ajouter aux favoris"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isLiked
                            ? 'fill-blue-500 text-blue-500'
                            : 'text-blue-500 hover:fill-blue-500'
                        }`}
                      />
                    </button>

                    {/* VIGNETTE PHOTO CARÉE */}
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-900/10 flex items-center justify-center relative">
                      <img
                        src={images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* BADGE DU NOMBRE DE PHOTOS */}
                      {images.length > 1 && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white font-bold flex items-center gap-1 shadow-sm">
                          📷 {images.length} photos
                        </span>
                      )}

                      {/* BADGE CATÉGORIE / ÉTAT */}
                      {item.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* INFOS & TARIFS */}
                    <div className="mt-2.5">
                      <h3
                        className={`font-extrabold text-xs sm:text-sm line-clamp-1 leading-snug ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-[10px] sm:text-[11px] font-medium truncate mt-0.5 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        {item.dimensions || item.format || 'Disponible'}
                      </p>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-blue-500 font-black text-xs sm:text-sm tracking-tight">
                          {item.price_fcfa
                            ? `${Number(item.price_fcfa).toLocaleString('fr-FR')} F`
                            : 'Sur devis'}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          {item.category?.toLowerCase().includes('meubl') ? '/ nuit' : '/ jour'}
                        </span>
                      </div>

                      {/* BOUTON AGENDA & RÉSERVATION */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(item);
                        }}
                        className={`w-full mt-2 py-1.5 px-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isDarkMode
                            ? 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100'
                        }`}
                      >
                        <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>Agenda & Calculateur</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2 : "BEST SELLER" (STRICTEMENT 2 COLONNES) */}
        {bestSellerList.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2
                className={`text-lg font-black tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Best Seller
              </h2>
              <button
                onClick={() => setActiveFilter('all')}
                className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* GRILLE STRICTE 2 COLONNES */}
            <div className="grid grid-cols-2 gap-3.5">
              {bestSellerList.map((item) => {
                const images = getItemImages(item);
                const isLiked = Boolean(favorites[item.id]);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className={`group rounded-3xl p-3 relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#151D2E] border border-slate-800/90 shadow-[6px_6px_18px_rgba(0,0,0,0.5),-3px_-3px_12px_rgba(255,255,255,0.02)] hover:shadow-[8px_8px_22px_rgba(0,0,0,0.7)]'
                        : 'bg-white border border-white/90 shadow-[6px_6px_16px_rgba(180,195,215,0.22),-4px_-4px_12px_rgba(255,255,255,0.95)] hover:shadow-[8px_8px_20px_rgba(180,195,215,0.3)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className={`absolute top-4 right-4 z-10 w-7 h-7 rounded-full backdrop-blur-sm shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-transform ${
                        isDarkMode
                          ? 'bg-slate-900/80 text-blue-400 border border-slate-700/60'
                          : 'bg-white/95 text-blue-600'
                      }`}
                      title="Ajouter aux favoris"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isLiked
                            ? 'fill-blue-500 text-blue-500'
                            : 'text-blue-500 hover:fill-blue-500'
                        }`}
                      />
                    </button>

                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-900/10 flex items-center justify-center relative">
                      <img
                        src={images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {images.length > 1 && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white font-bold flex items-center gap-1 shadow-sm">
                          📷 {images.length} photos
                        </span>
                      )}
                      {item.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5">
                      <h3
                        className={`font-extrabold text-xs sm:text-sm line-clamp-1 leading-snug ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-[10px] sm:text-[11px] font-medium truncate mt-0.5 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        {item.dimensions || item.format || 'Disponible'}
                      </p>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-blue-500 font-black text-xs sm:text-sm tracking-tight">
                          {item.price_fcfa
                            ? `${Number(item.price_fcfa).toLocaleString('fr-FR')} F`
                            : 'Sur devis'}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          {item.category?.toLowerCase().includes('meubl') ? '/ nuit' : '/ jour'}
                        </span>
                      </div>

                      {/* BOUTON AGENDA & RÉSERVATION */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(item);
                        }}
                        className={`w-full mt-2 py-1.5 px-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isDarkMode
                            ? 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100'
                        }`}
                      >
                        <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>Agenda & Calculateur</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          4. MODALE DÉTAIL & GALERIE MULTI-PHOTOS (RÉPOND EXACTEMENT AU BESOIN)
          "quand on clique sur une miniture on pour voir les image de la maison"
          ========================================================================= */}
      {selectedItem && (
        <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200`}>
          <div
            className={`rounded-[32px] max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 relative space-y-4 ${
              isDarkMode
                ? 'bg-[#151D2E] border border-slate-700/80 text-white'
                : 'bg-white border border-white/90 text-slate-900'
            }`}
          >
            {/* BOUTON FERMER */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* GRANDE PHOTO PRINCIPALE */}
            {(() => {
              const images = getItemImages(selectedItem);
              const currentImg = images[activePhotoIndex] || images[0];

              return (
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                    <img
                      src={currentImg}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover transition-all duration-300"
                    />

                    {/* FLÈCHES NAVIGATION PHOTOS */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActivePhotoIndex((prev) =>
                              prev === 0 ? images.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActivePhotoIndex((prev) =>
                              prev === images.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* COMPTEUR DE PHOTO */}
                    <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-xs font-bold text-white">
                      {activePhotoIndex + 1} / {images.length}
                    </span>

                    {/* BADGE TYPE */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                      {selectedItem.category || 'Location'}
                    </span>
                  </div>

                  {/* CARROUSEL DE MINIATURES (CLIQUER POUR CHANGER DE PHOTO) */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                      {images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            activePhotoIndex === idx
                              ? 'border-blue-500 scale-105 shadow-md ring-2 ring-blue-500/40'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TITRE ET TARIF */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3
                    className={`text-xl font-black leading-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {selectedItem.title}
                  </h3>
                  <p
                    className={`text-xs font-semibold mt-1 flex items-center gap-1.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      {selectedItem.dimensions ||
                        selectedItem.format ||
                        'Libreville'}
                    </span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-blue-500 font-black text-lg">
                    {selectedItem.price_fcfa
                      ? `${Number(selectedItem.price_fcfa).toLocaleString('fr-FR')} F`
                      : 'Sur Devis'}
                  </div>
                  <div
                    className={`text-[11px] font-bold ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {selectedItem.category?.toLowerCase().includes('meubl')
                      ? 'Tarif par nuitée'
                      : 'Tarif par jour'}
                  </div>
                </div>
              </div>

              {selectedItem.description && (
                <p
                  className={`text-xs leading-relaxed mt-3 p-3 rounded-2xl border ${
                    isDarkMode
                      ? 'bg-slate-900/60 border-slate-700/80 text-slate-300'
                      : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}
                >
                  {selectedItem.description}
                </p>
              )}
            </div>

            {/* ÉQUIPEMENTS & POINTS FORTS */}
            {Array.isArray(selectedItem.features) &&
              selectedItem.features.length > 0 && (
                <div>
                  <h4
                    className={`text-xs font-black uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    Équipements & Prestations Incluses :
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedItem.features.map((feat, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-xs font-medium p-2 rounded-xl border shadow-sm ${
                          isDarkMode
                            ? 'bg-slate-900/70 border-slate-800 text-slate-200'
                            : 'bg-white border-slate-100 text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* =========================================================================
                MODULE AGENDA & CALCUL AUTOMATIQUE DE LA DURÉE ET DU MONTANT
                "lorsque le client envoi sa commande sur whatsapp ça doit aller avec l'image
                de la voiture choisi plus la date dont il voudrait que le vehicule soit mis
                à son service pour cela ajouter un bouton agenda pour définir la durée et
                que la durée défini, un calcul automatique est fait pour définir le montant à payer"
                ========================================================================= */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 transition-all shadow-inner ${
                isDarkMode
                  ? 'bg-gradient-to-br from-slate-900/90 to-[#0e1626] border-blue-500/30'
                  : 'bg-gradient-to-br from-blue-50/70 to-emerald-50/40 border-blue-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Agenda & Durée de Mise à Disposition
                    </h4>
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Définissez vos dates pour calculer le montant total
                    </p>
                  </div>
                </div>

                {/* Badge Durée en Direct */}
                <div className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black shrink-0 shadow-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{bookingDuration} jour{bookingDuration > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* SÉLECTEURS DE DATES DE DÉBUT ET FIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="space-y-1">
                  <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    📅 Mise à disposition (Début) :
                  </label>
                  <input
                    type="date"
                    value={bookingStartDate}
                    min={getTodayStr()}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition-all ${
                      isDarkMode
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-blue-400'
                        : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500 shadow-sm'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    📅 Restitution du véhicule (Fin) :
                  </label>
                  <input
                    type="date"
                    value={bookingEndDate}
                    min={bookingStartDate || getTodayStr()}
                    onChange={(e) => setBookingEndDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition-all ${
                      isDarkMode
                        ? 'bg-slate-950/80 border-slate-700 text-white focus:border-blue-400'
                        : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              {/* BOUTONS RAPIDES DE DURÉE */}
              <div>
                <span className={`text-[10px] font-bold block mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Raccourcis de durée :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '1 jour', days: 1 },
                    { label: '2 jours', days: 2 },
                    { label: '3 jours', days: 3 },
                    { label: '5 jours', days: 5 },
                    { label: '1 semaine (7j)', days: 7 },
                    { label: '2 semaines (14j)', days: 14 },
                    { label: '1 mois (30j)', days: 30 },
                  ].map((dur) => (
                    <button
                      key={dur.days}
                      type="button"
                      onClick={() => handleQuickDuration(dur.days)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        bookingDuration === dur.days
                          ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400 scale-105'
                          : isDarkMode
                          ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARTE DE CALCUL DU MONTANT TOTAL */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDarkMode
                    ? 'bg-black/50 border-emerald-500/30'
                    : 'bg-white/90 border-emerald-200 shadow-sm'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Montant Calculé ({bookingDuration} jour{bookingDuration > 1 ? 's' : ''}) :
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                    <span>
                      {selectedItem.price_fcfa
                        ? `${Number(selectedItem.price_fcfa).toLocaleString('fr-FR')} F`
                        : '0 F'}
                    </span>
                    <span>×</span>
                    <span className="font-bold text-blue-400">{bookingDuration} j</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base sm:text-lg font-black text-emerald-500">
                    {bookingTotalPrice
                      ? `${Number(bookingTotalPrice).toLocaleString('fr-FR')} FCFA`
                      : 'Sur Devis'}
                  </div>
                  {selectedItem.price_eur && (
                    <div className="text-[10px] font-semibold text-slate-400">
                      ≈ {(selectedItem.price_eur * bookingDuration).toLocaleString('fr-FR')} €
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BOUTON D'ACTION : COMMANDE WHATSAPP 1-CLIC AVEC PHOTO + DATES + MONTANT TOTAL */}
            <div className="pt-2">
              <a
                href={getWhatsAppBookingLink(selectedItem)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-[0_10px_25px_rgba(16,185,129,0.35)] flex flex-col items-center justify-center gap-0.5 transition-all transform active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                  <span>
                    Commander sur WhatsApp (
                    {bookingTotalPrice
                      ? `${Number(bookingTotalPrice).toLocaleString('fr-FR')} F`
                      : 'Sur devis'}
                    )
                  </span>
                </div>
                <span className="text-[10px] font-normal text-emerald-100/90">
                  📷 Avec photo du véhicule • Du {formatDateFr(bookingStartDate)} au {formatDateFr(bookingEndDate)} ({bookingDuration} j)
                </span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. BARRE DE NAVIGATION EN BAS (PILULE FLOTTANTE NEUMORPHIQUE ÉPURÉE)
          "L'accès au back office admin ne doit pas être visible sur l'app" -> SUPPRIMÉ !
          ========================================================================= */}
      <nav
        className={`${
          isPreview ? 'sticky bottom-3' : 'fixed bottom-4'
        } left-4 right-4 max-w-sm mx-auto backdrop-blur-xl rounded-full py-3.5 px-8 flex justify-around items-center z-40 transition-colors ${
          isDarkMode
            ? 'bg-[#151D2E]/95 border border-slate-800 shadow-[0_12px_35px_rgba(0,0,0,0.6)]'
            : 'bg-white/95 border border-slate-100/90 shadow-[0_12px_32px_rgba(0,0,0,0.12)]'
        }`}
      >
        {/* BOUTON ACCUEIL (HOME) */}
        <button
          onClick={() => {
            setActiveFilter('all');
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center text-blue-500 cursor-pointer active:scale-95 transition-transform"
          title="Accueil"
        >
          <Home className="w-5 h-5" />
          <span className="w-4 h-1 bg-blue-500 rounded-full mt-1"></span>
        </button>

        {/* BOUTON MEUBLÉS */}
        <button
          onClick={() => {
            setActiveFilter('meuble');
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform ${
            activeFilter === 'meuble'
              ? 'text-blue-500'
              : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
          }`}
          title="Appartements Meublés"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Meublés</span>
        </button>

        {/* BOUTON VOITURES */}
        <button
          onClick={() => {
            setActiveFilter('voiture');
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform ${
            activeFilter === 'voiture'
              ? 'text-blue-500'
              : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
          }`}
          title="Véhicules & Voitures"
        >
          <Car className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Voitures</span>
        </button>

        {/* BOUTON WHATSAPP DIRECT */}
        <button
          onClick={() => {
            const num = (
              whatsappNumber ||
              settings.whatsapp_number ||
              '24162744533'
            ).replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${num}`, '_blank');
          }}
          className="flex flex-col items-center justify-center text-emerald-500 hover:scale-110 cursor-pointer active:scale-95 transition-transform"
          title="Contacter sur WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-emerald-500 text-emerald-500" />
          <span className="text-[9px] font-bold mt-0.5">Contact</span>
        </button>
      </nav>
    </div>
  );
}
