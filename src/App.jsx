import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VideoShowcase } from './components/VideoShowcase';
import { PosterShowcase } from './components/PosterShowcase';
import { PackagesSection } from './components/PackagesSection';
import { DevisCalculator } from './components/DevisCalculator';
import { CustomBriefModal } from './components/CustomBriefModal';
import { AdminBackOffice } from './components/AdminBackOffice';
import { Footer } from './components/Footer';
import {
  fetchVideos,
  fetchPosters,
  fetchPackages,
  fetchSettings,
  saveSettings,
} from './api/cloudflare';
import { Sparkles, MessageCircle, X } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname.toLowerCase().replace(/\/+$/, '');
  });

  const [currency, setCurrency] = useState('XAF');
  const [videos, setVideos] = useState([]);
  const [posters, setPosters] = useState([]);
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState({
    company_name: 'DIGITAL MARK PRO',
    tagline: 'Studio de Création Vidéo & Graphisme Publicitaire',
    whatsapp_number: '+241077004073',
    default_whatsapp_message:
      '👋 Bonjour DIGITAL MARK PRO, je souhaite lancer un projet publicitaire.',
    promo_banner_active: true,
    promo_banner_text:
      '🔥 OFFRE SPÉCIALE : -20% sur votre 1ère vidéo publicitaire 4K avec le code PROMO20 !',
    hero_badge: 'STUDIO DE CRÉATION VIDÉO & GRAPHISME PUBLICITAIRE',
    hero_title: 'Des Vidéos & Affiches qui Captivent et Font Exploser vos Ventes',
    hero_subtitle:
      'Ne laissez plus vos prospects défiler sans s\'arrêter. Nous concevons vos spots publicitaires 4K, vidéos virales TikTok/Reels et affiches magnétiques, livrés sous 48h et prêts à être sponsorisés.',
    hero_cta_primary: 'Voir les Vidéos',
    hero_cta_whatsapp: 'Commander sur WhatsApp',
    stat1_value: '+120M',
    stat1_label: 'Vues cumulées générées',
    stat2_value: '24h - 48h',
    stat2_label: 'Délai moyen de livraison',
    stat3_value: '100%',
    stat3_label: 'Droits commerciaux cédés',
    stat4_value: '+850',
    stat4_label: 'Vidéos & affiches créées',
    default_currency: 'XAF',
    eur_rate: '655',
    admin_code: '2026',
  });

  const [loading, setLoading] = useState(true);
  const [activeBriefItem, setActiveBriefItem] = useState(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Écouteur de navigation (popstate)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname.toLowerCase().replace(/\/+$/, ''));
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

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
          setSettings((prev) => ({ ...prev, ...loadedSettings }));
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
    return () => {
      isMounted = false;
    };
  }, []);

  // Mise à jour des paramètres
  const handleUpdateSettings = async (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (newSettings.default_currency) {
      setCurrency(newSettings.default_currency);
    }
    await saveSettings(newSettings);
  };

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/login/admin');
    setCurrentPath('/login/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSite = () => {
    window.history.pushState(null, '', '/');
    setCurrentPath('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappNumber = settings.whatsapp_number || '+241077004073';

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
        onUpdatePosters={setPosters}
        packages={packages}
        onUpdatePackages={setPackages}
        onExitToSite={navigateToSite}
      />
    );
  }

  // ========================================================
  // ROUTE 2 : LANDING PAGE PUBLIQUE
  // ========================================================
  const showBanner =
    !isBannerDismissed &&
    (settings.promo_banner_active === 'true' || settings.promo_banner_active === true) &&
    settings.promo_banner_text;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
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
        onNavigateAdmin={navigateToAdmin}
        onOpenDevis={() => {
          const el = document.getElementById('devis-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Bannière Hero d'impact avec textes dynamiques */}
      <Hero
        whatsappNumber={whatsappNumber}
        settings={settings}
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
      <div id="videos-section">
        <VideoShowcase
          videos={videos}
          currency={currency}
          whatsappNumber={whatsappNumber}
          onCustomBrief={(video) =>
            setActiveBriefItem({ type: 'video', data: video })
          }
        />
      </div>

      {/* 4. Section Affiches & Bannières Publicitaires */}
      <div id="posters-section">
        <PosterShowcase
          posters={posters}
          currency={currency}
          whatsappNumber={whatsappNumber}
          onCustomBrief={(poster) =>
            setActiveBriefItem({ type: 'poster', data: poster })
          }
        />
      </div>

      {/* 5. Packs & Forfaits Complets */}
      <div id="packages-section">
        <PackagesSection
          packages={packages}
          currency={currency}
          whatsappNumber={whatsappNumber}
        />
      </div>

      {/* 6. Simulateur de Devis Personnalisé en direct */}
      <section id="devis-section" className="py-20 px-4 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Devis Instantané
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Calculez votre devis sur-mesure
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto">
            Sélectionnez vos options et envoyez directement votre cahier des charges chiffré sur WhatsApp à notre équipe.
          </p>
        </div>
        <DevisCalculator
          currency={currency}
          whatsappNumber={whatsappNumber}
        />
      </section>

      {/* 7. Footer complet (100% White-Label) */}
      <Footer
        whatsappNumber={whatsappNumber}
        companyName={settings.company_name || 'DIGITAL MARK PRO'}
      />

      {/* Bouton Flottant WhatsApp Rapide */}
      <a
        href={`https://wa.me/${String(whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(
          settings.default_whatsapp_message ||
            '👋 Bonjour DIGITAL MARK PRO, je souhaite démarrer un projet publicitaire.'
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
        />
      )}
    </div>
  );
}
