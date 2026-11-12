import React, { useState, useEffect } from 'react';
import MaketPlaceView from './components/MaketPlaceView';
import AdminBackOffice from './components/AdminBackOffice';
import { fetchPosters, fetchSettings, trackPageView } from './api/cloudflare';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') return window.location.pathname;
    return '/';
  });

  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_SETTINGS__) {
      return window.__INITIAL_SETTINGS__;
    }
    try {
      const saved = localStorage.getItem('ktfa_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      company_name: 'KTFA FLEX',
      tagline: 'Marketplace & Paiement Échelonné Cameroun',
      whatsapp_number: '237694473414',
      default_currency: 'XAF',
    };
  });

  const [posters, setPosters] = useState(() => {
    if (typeof window !== 'undefined' && Array.isArray(window.__INITIAL_POSTERS__)) {
      return window.__INITIAL_POSTERS__;
    }
    try {
      const saved = localStorage.getItem('ktfa_posters');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [currency, setCurrency] = useState('XAF');

  // Navigation SPA interne fluide
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedSettings, loadedPosters] = await Promise.all([
          fetchSettings(),
          fetchPosters(),
        ]);
        if (loadedSettings && Object.keys(loadedSettings).length > 0) {
          setSettings(loadedSettings);
          if (loadedSettings.default_currency) setCurrency(loadedSettings.default_currency);
        }
        if (loadedPosters && loadedPosters.length > 0) {
          setPosters(loadedPosters);
        }
      } catch (err) {
        console.warn('Initial data load notice:', err);
      }
    }
    loadData();
    trackPageView();
  }, []);

  const whatsappNumber =
    settings.whatsapp_number && !settings.whatsapp_number.includes('077004073')
      ? settings.whatsapp_number
      : '237694473414';

  // ROUTE 1 : ACCÈS AU BACK-OFFICE ADMINISTRATEUR
  if (
    currentPath === '/login/admin' ||
    currentPath === '/login/admin/' ||
    currentPath === '/admin' ||
    currentPath === '/admin/'
  ) {
    return (
      <AdminBackOffice
        settings={settings}
        onUpdateSettings={setSettings}
        posters={posters}
        onUpdatePosters={setPosters}
        onExitToSite={() => navigateTo('/')}
      />
    );
  }

  // ROUTE 2 : VITRINE MARKETPLACE PUBLIQUE
  return (
    <div className="min-h-screen bg-[#07090e] text-white">
      <MaketPlaceView
        settings={settings}
        posters={posters}
        currency={currency}
        whatsappNumber={whatsappNumber}
        onNavigateAdmin={() => navigateTo('/login/admin')}
        onUpdatePosters={setPosters}
      />
    </div>
  );
}
