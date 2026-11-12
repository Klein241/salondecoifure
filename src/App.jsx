import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VideoShowcase } from './components/VideoShowcase';
import { PosterShowcase } from './components/PosterShowcase';
import { PackagesSection } from './components/PackagesSection';
import { AboutSection } from './components/AboutSection';
import { DevisCalculator } from './components/DevisCalculator';
import { CustomBriefModal } from './components/CustomBriefModal';
import { CartModal } from './components/CartModal';
import { AdminBackOffice } from './components/AdminBackOffice';
import { Footer } from './components/Footer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { NeumorphicRentalView } from './components/NeumorphicRentalView';
import { RestaurantGourmetView } from './components/RestaurantGourmetView';
import { BurgysFastFoodView } from './components/BurgysFastFoodView';
import { PizzasFeuDeDieuView } from './components/PizzasFeuDeDieuView';
import { AbaiaCosmetiqueGlassView } from './components/AbaiaCosmetiqueGlassView';
import MaketPlaceView from './components/MaketPlaceView';
import {
  fetchVideos,
  fetchPosters,
  fetchPackages,
  fetchSettings,
  saveSettings,
  trackPageView,
  fetchTrafficStats,
  getActiveTenantSlug,
  getScopedStorageKey,
} from './api/cloudflare';
import { INITIAL_SETTINGS } from './data/initialData';
import { applyThemeToDom, getCleanImageUrl } from './utils/theme';
import { Sparkles, MessageCircle, X } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname.toLowerCase().replace(/\/+$/, '');
  });

  const [currency, setCurrency] = useState('XAF');
  const [videos, setVideos] = useState([]);
  const [posters, setPosters] = useState(() => {
    const tenantSlug = (getActiveTenantSlug() || '').toLowerCase();
    if (
      typeof window !== 'undefined' &&
      Array.isArray(window.__INITIAL_POSTERS__) &&
      window.__INITIAL_POSTERS__.length > 0 &&
      (!tenantSlug || (window.__INITIAL_SETTINGS__ && window.__INITIAL_SETTINGS__.tenant_slug === tenantSlug))
    ) {
      return window.__INITIAL_POSTERS__;
    }
    try {
      const scopedKey = getScopedStorageKey('dmp_posters');
      const saved = localStorage.getItem(scopedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState(() => {
    const tenantSlug = (getActiveTenantSlug() || '').toLowerCase();

    // 1. Priorité 1 : État injecté par le serveur Worker Cloudflare (Zero-Flash SSR)
    if (
      typeof window !== 'undefined' &&
      window.__INITIAL_SETTINGS__ &&
      (!tenantSlug || window.__INITIAL_SETTINGS__.tenant_slug === tenantSlug)
    ) {
      return {
        ...INITIAL_SETTINGS,
        ...window.__INITIAL_SETTINGS__,
      };
    }

    // 2. Priorité 2 : Cache LocalStorage strictement isolé par tenant (Scoped)
    let parsed = {};
    try {
      const scopedKey = getScopedStorageKey('dmp_settings');
      const saved = localStorage.getItem(scopedKey);
      if (saved) parsed = JSON.parse(saved);
    } catch (e) {}

    const scopedAdminKey = getScopedStorageKey('dmp_admin_code');
    const savedAdminCode = localStorage.getItem(scopedAdminKey);

    return {
      ...INITIAL_SETTINGS,
      ...parsed,
      ...(savedAdminCode ? { admin_code: savedAdminCode } : {}),
    };
  });

  const [loading, setLoading] = useState(true);
  const [activeBriefItem, setActiveBriefItem] = useState(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [trafficStats, setTrafficStats] = useState(null);

  // Panier multi-articles strictement isolé par tenant
  const [cart, setCart] = useState(() => {
    try {
      const scopedCartKey = getScopedStorageKey('dmp_cart');
      const saved = localStorage.getItem(scopedCartKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const scopedCartKey = getScopedStorageKey('dmp_cart');
      localStorage.setItem(scopedCartKey, JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + 1,
        };
        return updated;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Écouteur de navigation (popstate)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname.toLowerCase().replace(/\/+$/, ''));
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Synchronisation dynamique du Titre de page, du Favicon et de l'icône PWA
  useEffect(() => {
    const brandName = settings.company_name || 'Notre Entreprise';
    const tagline = settings.tagline || 'Site Officiel';
    document.title = `${brandName} — ${tagline}`;

    let faviconLink = document.querySelector("link[rel~='icon']");
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(faviconLink);
    }

    let appleIcon = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.getElementsByTagName('head')[0].appendChild(appleIcon);
    }

    const realIcon = getCleanImageUrl(settings.company_logo_url) || settings.company_favicon_url;
    if (realIcon) {
      faviconLink.href = realIcon;
      appleIcon.href = realIcon;
    } else {
      faviconLink.href = '/favicon.svg';
      appleIcon.href = '/favicon.svg';
    }
  }, [
    settings.company_name,
    settings.tagline,
    settings.company_logo_url,
    settings.company_favicon_url,
  ]);

  // Synchronisation dynamique du Thème et des Couleurs
  useEffect(() => {
    applyThemeToDom(settings);
  }, [
    settings.color_primary,
    settings.color_secondary,
    settings.color_accent,
    settings.color_bg_main,
    settings.color_bg_secondary,
    settings.color_bg_card,
    settings.color_text_title,
    settings.color_text_main,
    settings.color_text_muted,
    settings.color_border,
    settings.color_btn_bg,
    settings.color_btn_text,
    settings.color_btn_hover,
    settings.color_links,
    settings.color_links_hover,
  ]);

  // Chargement des données au démarrage
  useEffect(() => {
    let isMounted = true;

    async function loadAllData() {
      try {
        setLoading(true);
        const [loadedSettings, loadedVideos, loadedPosters, loadedPackages] =
          await Promise.all([
            fetchSettings(),
            fetchVideos('all'),
            fetchPosters(),
            fetchPackages(),
          ]);

        if (!isMounted) return;

        if (loadedSettings && Object.keys(loadedSettings).length > 0) {
          const scopedAdminKey = getScopedStorageKey('dmp_admin_code');
          const savedAdminCode = localStorage.getItem(scopedAdminKey);
          setSettings((prev) => ({
            ...prev,
            ...loadedSettings,
            admin_code:
              loadedSettings.admin_code ||
              savedAdminCode ||
              prev.admin_code ||
              '2026',
          }));
          if (loadedSettings.default_currency) {
            setCurrency(loadedSettings.default_currency);
          }
        }

        if (loadedVideos && loadedVideos.length > 0) {
          setVideos(loadedVideos);
        }

        if (loadedPosters && loadedPosters.length > 0) {
          setPosters(loadedPosters);
        }

        if (loadedPackages && loadedPackages.length > 0) {
          setPackages(loadedPackages);
        }
      } catch (err) {
        console.error('Erreur chargement données:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAllData();

    // Suivi de visite réel (pas de données fictives)
    trackPageView();
    fetchTrafficStats().then((stats) => {
      if (isMounted && stats) setTrafficStats(stats);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Mise à jour des paramètres
  const handleUpdateSettings = async (newSettings) => {
    if (newSettings.admin_code) {
      const scopedAdminKey = getScopedStorageKey('dmp_admin_code');
      localStorage.setItem(scopedAdminKey, String(newSettings.admin_code).trim());
    }
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (newSettings.default_currency) {
      setCurrency(newSettings.default_currency);
    }
    await saveSettings(newSettings);
  };

  // Mise à jour et synchronisation immédiate des affiches / articles
  const handleUpdatePosters = (updatedPosters) => {
    setPosters(updatedPosters);
    try {
      const scopedKey = getScopedStorageKey('dmp_posters');
      localStorage.setItem(scopedKey, JSON.stringify(updatedPosters));
      if (typeof window !== 'undefined') {
        window.__INITIAL_POSTERS__ = updatedPosters;
        if (window.__INITIAL_SETTINGS__ && Array.isArray(window.__INITIAL_SETTINGS__.custom_posters)) {
          window.__INITIAL_SETTINGS__.custom_posters = updatedPosters;
        }
      }
      setSettings((prev) => ({
        ...prev,
        custom_posters: updatedPosters,
      }));
    } catch (e) {}
  };

  const getTenantQuery = () => {
    if (typeof window === 'undefined') return '';
    const t = getActiveTenantSlug();
    return t ? `?t=${encodeURIComponent(t)}` : '';
  };

  const navigateToAdmin = () => {
    const q = getTenantQuery();
    window.history.pushState(null, '', `/login/admin${q}`);
    setCurrentPath('/login/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSite = () => {
    const q = getTenantQuery();
    window.history.pushState(null, '', `/${q}`);
    setCurrentPath('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappNumber = settings.whatsapp_number || '+241077004073';

  // Visibilité dynamique des modules (activable / désactivable en 1 clic)
  const showCart =
    settings.show_cart !== false &&
    settings.show_cart !== 'false';
  const showDevis =
    settings.show_devis_calculator !== false &&
    settings.show_devis_calculator !== 'false';
  const showVideos =
    settings.show_videos_section !== false &&
    settings.show_videos_section !== 'false';
  const showPosters =
    settings.show_posters_section !== false &&
    settings.show_posters_section !== 'false';
  const showPackages =
    settings.show_packages_section !== false &&
    settings.show_packages_section !== 'false';
  const showAbout =
    settings.show_about_section !== false &&
    settings.show_about_section !== 'false';

  // ========================================================
  // ROUTE 1 : ACCÈS BACK-OFFICE ADMIN SUR /login/admin
  // ========================================================
  if (currentPath === '/login/admin' || currentPath === '/login/admin/') {
    return (
      <AdminBackOffice
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        videos={videos}
        onUpdateVideos={setVideos}
        posters={posters}
        onUpdatePosters={handleUpdatePosters}
        packages={packages}
        onUpdatePackages={setPackages}
        onExitToSite={navigateToSite}
      />
    );
  }

  const activeTenantSlug = (getActiveTenantSlug() || '').toLowerCase();
  const currentHostname = typeof window !== 'undefined' ? window.location.host.toLowerCase() : '';

  // ========================================================
  // ROUTE EXCLUSIVE ABAÏA COSMÉTIQUE (STYLE GLASSMORPHISM EXACT ABAÏA JUICE)
  // Cartes 3D bombées et ressorties sur 2 colonnes sur mobile,
  // fond verre somptueux, modale détaillée et commande WhatsApp.
  // ========================================================
  const isAbaiaCosmetiqueLayout =
    activeTenantSlug === 'abaia-cosmetique' ||
    activeTenantSlug === 'abiai-cosmetique' ||
    activeTenantSlug === 'abaia' ||
    activeTenantSlug.includes('abaia') ||
    currentHostname.includes('abaia-cosmetique') ||
    currentHostname.includes('abiai-cosmetique') ||
    (settings.company_name && settings.company_name.toLowerCase().includes('abaia')) ||
    settings.site_layout === 'abaia_cosmetique' ||
    settings.theme_choice === 'abaia_cosmetique' ||
    settings.catalog_type === 'cosmetique_glass';

  if (isAbaiaCosmetiqueLayout) {
    return (
      <AbaiaCosmetiqueGlassView
        settings={settings}
        posters={posters}
        currency={currency}
        whatsappNumber={whatsappNumber}
        onNavigateAdmin={navigateToAdmin}
        onAddToCart={handleAddToCart}
        cart={cart}
        cartCount={cartCount}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    );
  }

  // ========================================================
  // ROUTE EXCLUSIVE KTFA FLEX (MARKETPLACE & PAIEMENT ÉCHELONNÉ)
  // Strictement isolé : composant 100% indépendant avec formulaire d'inscription
  // complet (9 champs), Espace Membre (Déjà payé et livré, Payé non livré,
  // En cours de paiement), catalogue en cartes et reçus téléchargeables.
  // ========================================================
  const isKtfaFlexLayout =
    activeTenantSlug === 'ktfa-flex' ||
    activeTenantSlug === 'ktfa' ||
    activeTenantSlug === 'ktfaflex' ||
    activeTenantSlug.includes('ktfa') ||
    settings.site_layout === 'ktfa_flex' ||
    settings.theme_choice === 'ktfa_flex' ||
    settings.catalog_type === 'marketplace_flex';

  if (isKtfaFlexLayout) {
    const cleanMarketplacePosters = Array.isArray(posters) && posters.length > 0
      ? posters
      : (Array.isArray(settings?.custom_posters) && settings.custom_posters.length > 0 ? settings.custom_posters : []);

    return (
      <MaketPlaceView
        settings={settings}
        posters={cleanMarketplacePosters}
        currency={currency}
        whatsappNumber={
          (settings.whatsapp_number && !settings.whatsapp_number.includes('077004073') && !settings.whatsapp_number.includes('699000000'))
            ? settings.whatsapp_number
            : '237694473414'
        }
        onNavigateAdmin={navigateToAdmin}
        onUpdatePosters={setPosters}
      />
    );
  }

  // ========================================================
  // ROUTE 2A : DÉTECTION FAST-FOOD BURGYS GABON (ROUGE CRIMSON & CHEDDAR GOLD)
  // Strictement isolé : le Fast-Food Burgys Gabon avec "Mon Espace",
  // ses 14 plats, ses burgers 5 étoiles, ses Curly Fries cultes et commande WhatsApp
  // ========================================================
  const isBurgysLayout =
    activeTenantSlug === 'burgys-gabon' ||
    activeTenantSlug.includes('burgy') ||
    settings.site_layout === 'burgys_fastfood' ||
    settings.theme_choice === 'burgys_fastfood';

  if (isBurgysLayout) {
    return (
      <BurgysFastFoodView
        settings={settings}
        posters={posters}
        currency={currency}
        whatsappNumber={whatsappNumber}
        onNavigateAdmin={navigateToAdmin}
      />
    );
  }

  // ========================================================
  // ROUTE 2B : DÉTECTION PIZZERIA AU FEU DE BOIS "LES PIZZAS DU FEU DE DIEU"
  // Strictement isolé : Pizzeria artisanale au feu de bois avec "Mon Espace",
  // ses 14 pizzas & spécialités, fond noir braise & orange flamboyant, commande WhatsApp
  // ========================================================
  const isPizzasFeuDeDieuLayout =
    activeTenantSlug === 'les-pizzas-du-feu-de-dieu' ||
    activeTenantSlug === 'pizzas-feu-de-dieu' ||
    activeTenantSlug.includes('feu-de-dieu') ||
    activeTenantSlug.includes('feudedieu') ||
    (activeTenantSlug.includes('pizza') && !activeTenantSlug.includes('gourmet')) ||
    settings.site_layout === 'pizzas_feu_de_dieu' ||
    settings.theme_choice === 'pizzas_feu_de_dieu';

  if (isPizzasFeuDeDieuLayout) {
    return (
      <PizzasFeuDeDieuView
        settings={settings}
        posters={posters}
        currency={currency}
        whatsappNumber={whatsappNumber}
        onNavigateAdmin={navigateToAdmin}
      />
    );
  }

  // ========================================================
  // ROUTE 2B : DÉTECTION MODE RESTAURANT GOURMET EXPRESS (GLASSMORPHISM TEAL)
  // Strictement isolé : préserve 100% le thème Teal et la carte Gourmet Express originale
  // ========================================================
  const isRestaurantLayout =
    activeTenantSlug === 'gourmet-express' ||
    activeTenantSlug === 'restaurant-gourmet' ||
    (activeTenantSlug.includes('gourmet') && !activeTenantSlug.includes('burgy')) ||
    settings.site_layout === 'restaurant_gourmet' ||
    settings.theme_choice === 'restaurant_gourmet' ||
    settings.catalog_type === 'restaurant_gourmet' ||
    settings.catalog_type === 'restaurant' ||
    (typeof window !== 'undefined' && window.location.search.includes('layout=restaurant'));

  if (isRestaurantLayout) {
    return (
      <RestaurantGourmetView
        settings={settings}
        posters={posters}
        currency={currency}
        whatsappNumber={whatsappNumber}
        onNavigateAdmin={navigateToAdmin}
      />
    );
  }

  // ========================================================
  // ROUTE 2C : DÉTECTION MODE NEUMORPHIQUE & LOCATION VOITURES/MEUBLÉS
  // ========================================================
  const isNeumorphicLayout =
    settings.site_layout === 'neumorphic_rental' ||
    settings.theme_choice === 'neumorphic_rental' ||
    settings.catalog_type === 'location_auto_meuble' ||
    activeTenantSlug === 'location-express' ||
    activeTenantSlug === 'l' ||
    activeTenantSlug.includes('location') ||
    activeTenantSlug.includes('rental') ||
    activeTenantSlug.includes('auto') ||
    (typeof window !== 'undefined' && window.location.search.includes('layout=neumorphic'));

  if (isNeumorphicLayout) {
    return (
      <NeumorphicRentalView
        settings={settings}
        posters={posters}
        currency={currency}
        whatsappNumber={whatsappNumber}
        onNavigateAdmin={navigateToAdmin}
      />
    );
  }

  // ========================================================
  // GARDE-FOU ANTI-FLASH : TENANT EN COURS DE CHARGEMENT
  // ========================================================
  // Si l'URL demande un client spécifique (?t=... ou ?tenant=...)
  // mais que ses données ne sont pas encore prêtes (en attente du réseau),
  // on affiche un écran de chargement élégant pour NE JAMAIS faire flasher
  // le template ou les données d'un autre client (ex: Beauty Nails).
  const isTenantRequested = Boolean(activeTenantSlug);
  const isTenantDataReady = Boolean(
    !isTenantRequested ||
    (typeof window !== 'undefined' && window.__INITIAL_SETTINGS__ && window.__INITIAL_SETTINGS__.tenant_slug === activeTenantSlug) ||
    (settings && settings.tenant_slug === activeTenantSlug)
  );

  if (isTenantRequested && !isTenantDataReady && loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white px-4">
        <div className="relative mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/50 border-t-transparent animate-spin" />
        </div>
        <div className="text-sm font-medium text-zinc-300 tracking-wide">
          Chargement de votre espace...
        </div>
        <div className="text-xs text-zinc-500 mt-1 font-mono">
          {activeTenantSlug}
        </div>
      </div>
    );
  }

  // ========================================================
  // ROUTE 3 : LANDING PAGE PUBLIQUE STANDARD (SALON / BEAUTÉ / LUXE)
  // ========================================================
  const showBanner =
    !isBannerDismissed &&
    (settings.promo_banner_active === 'true' || settings.promo_banner_active === true) &&
    settings.promo_banner_text;

  return (
    <div
      className="min-h-screen selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-300"
      style={{
        backgroundColor: settings.color_bg_main || 'var(--bg-main, #07090e)',
        color: settings.color_text_main || 'var(--text-main, #f8fafc)',
      }}
    >
      {/* Bandeau d'Annonce / Promo en haut */}
      {showBanner && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-black py-2.5 px-4 font-bold text-xs md:text-sm text-center relative z-50 flex items-center justify-center gap-3 shadow-lg">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{settings.promo_banner_text}</span>
          <button
            onClick={() => setIsBannerDismissed(true)}
            className="p-1 rounded-full hover:bg-black/10 transition-colors ml-2"
            title="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Barre de navigation */}
      <Navbar
        currency={currency}
        setCurrency={setCurrency}
        whatsappNumber={whatsappNumber}
        companyName={settings.company_name}
        tagline={settings.tagline}
        companyBadge={
          settings.company_badge !== undefined ? settings.company_badge : 'PRO'
        }
        logoUrl={getCleanImageUrl(settings.company_logo_url)}
        companyIconEmoji={settings.company_icon_emoji || ''}
        onNavigateAdmin={navigateToAdmin}
        onNavigateHome={navigateToSite}
        showDevis={showDevis}
        showVideos={showVideos}
        showPosters={showPosters}
        showPackages={showPackages}
        showAbout={showAbout}
        showCart={showCart}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenDevis={() => {
          const el = document.getElementById('devis-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Bannière Hero d'impact avec textes dynamiques */}
      <Hero
        whatsappNumber={whatsappNumber}
        settings={settings}
        trafficStats={trafficStats}
        showDevis={showDevis}
        showVideos={showVideos}
        onExploreVideos={() => {
          const el = document.getElementById('videos-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenDevis={() => {
          const el = document.getElementById('devis-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3. Section Vidéos YouTube-Style avec Modale au Clic */}
      {showVideos && (
        <div id="videos-section">
          <VideoShowcase
            videos={videos}
            currency={currency}
            whatsappNumber={whatsappNumber}
            settings={settings}
            showCart={showCart}
            onAddToCart={handleAddToCart}
            onCustomBrief={(video) =>
              setActiveBriefItem({ type: 'video', data: video })
            }
          />
        </div>
      )}

      {/* 4. Section Affiches & Bannières Publicitaires */}
      {showPosters && (
        <div id="posters-section">
          <PosterShowcase
            posters={posters}
            currency={currency}
            whatsappNumber={whatsappNumber}
            settings={settings}
            showCart={showCart}
            onAddToCart={handleAddToCart}
            onCustomBrief={(poster) =>
              setActiveBriefItem({ type: 'poster', data: poster })
            }
          />
        </div>
      )}

      {/* 5. Packs & Forfaits Complets */}
      {showPackages && (
        <div id="packages-section">
          <PackagesSection
            packages={packages}
            currency={currency}
            whatsappNumber={whatsappNumber}
            settings={settings}
          />
        </div>
      )}

      {/* 5B. Section À Propos & Histoire de la Marque */}
      {showAbout && (
        <AboutSection
          settings={settings}
          whatsappNumber={whatsappNumber}
        />
      )}

      {/* 6. Simulateur de Devis Personnalisé en direct (Activé / Désactivé en 1 Clic) */}
      {showDevis && (
        <section
          id="devis-section"
          className="py-20 px-4 max-w-7xl mx-auto border-t transition-colors duration-300"
          style={{
            borderColor: 'var(--border-subtle, rgba(255,255,255,0.08))',
          }}
        >
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> {settings.devis_section_badge || 'Devis Instantané'}
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold"
              style={{ color: 'var(--text-title, #ffffff)' }}
            >
              {settings.devis_section_title || 'Calculez votre devis sur-mesure'}
            </h2>
            <p
              className="text-sm md:text-base mt-2 max-w-xl mx-auto"
              style={{ color: 'var(--text-muted, #94a3b8)' }}
            >
              {settings.devis_section_subtitle ||
                'Sélectionnez vos options et envoyez directement votre cahier des charges chiffré sur WhatsApp à notre équipe.'}
            </p>
          </div>
          <DevisCalculator
            currency={currency}
            whatsappNumber={whatsappNumber}
            settings={settings}
          />
        </section>
      )}

      {/* 7. Footer complet (100% White-Label) */}
      <Footer
        whatsappNumber={whatsappNumber}
        companyName={settings.company_name || 'Notre Entreprise'}
        showDevis={showDevis}
        showVideos={showVideos}
        showPosters={showPosters}
        showPackages={showPackages}
        showAbout={showAbout}
        settings={settings}
      />

      {/* Bouton Flottant WhatsApp Rapide */}
      <a
        href={`https://wa.me/${String(whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(
          settings.default_whatsapp_message ||
            `👋 Bonjour ${settings.company_name || "l'équipe"}, je souhaite échanger avec vous.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter sur WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold rounded-full shadow-[0_10px_35px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white group-hover:rotate-12 transition-transform duration-300" />
        <span className="hidden sm:inline text-sm font-semibold tracking-wide">
          Discuter sur WhatsApp
        </span>
      </a>

      {/* Modale de Personnalisation de Brief */}
      {activeBriefItem && (
        <CustomBriefModal
          isOpen={!!activeBriefItem}
          onClose={() => setActiveBriefItem(null)}
          item={activeBriefItem.data}
          itemType={activeBriefItem.type}
          whatsappNumber={whatsappNumber}
          currency={currency}
          settings={settings}
        />
      )}

      {/* Panier Multi-Articles (WhatsApp) */}
      {showCart && (
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          currency={currency}
          whatsappNumber={whatsappNumber}
          settings={settings}
        />
      )}

      {/* Bannière d'Installation PWA (1-Clic Mobile & Desktop) */}
      <PWAInstallBanner
        companyName={settings.company_name || 'Notre Application'}
        logoUrl={getCleanImageUrl(settings.company_logo_url)}
      />
    </div>
  );
}
