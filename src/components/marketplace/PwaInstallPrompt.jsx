import React from 'react';
import { Smartphone, Bell, X, Share2 } from 'lucide-react';

// =====================================================================
// COMPOSANT : PWA INSTALL PROMPT — Android & iOS
// - Android  → 1 clic direct : déclenche le prompt natif Chrome/Android
// - iOS      → Infobulle ultra-compacte avec flèche pointant sur 📤 Safari
//              (ZÉRO modale lourde, ZÉRO pavé de texte scolaire)
// =====================================================================

export default function PwaInstallPrompt({
  showFloating,
  isInstalled,
  isModalOpen,
  setIsModalOpen,
  isLight,
  isIos = false,
  onInstall,
  onEnablePush,
  onSnooze
}) {
  // Si déjà installé dans le smartphone (mode standalone), on n'affiche absolument rien
  if (isInstalled) return null;

  const handleClose = (e) => {
    e?.stopPropagation?.();
    setIsModalOpen(false);
    if (onSnooze) onSnooze();
  };

  const handleFloatingClick = () => {
    // 1-clic direct : installation native immédiate sur Android (prompt) et iPhone (package .mobileconfig)
    if (onInstall) onInstall();
  };

  return (
    <>
      {/* ━━━ 1. BOUTON FLOTTANT D'INSTALLATION ━━━ */}
      {showFloating && (
        <div className="fixed bottom-24 right-3.5 sm:bottom-24 sm:right-6 z-50 animate-bounce">
          <button
            onClick={handleFloatingClick}
            className="group relative flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(16,185,129,0.7),0_12px_24px_rgba(0,0,0,0.5)] border-2 border-white/80 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            title="Installer l'application KTFA FLEX"
            aria-label="Installer KTFA FLEX"
          >
            {/* PASTILLE ROUGE CLIGNOTANTE */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white"></span>
            </span>

            {/* LOGO OFFICIEL KTFA */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden shadow border border-white/80 shrink-0 bg-slate-900">
              <img src="/logos/ktfa_official_logo.jpg" alt="KTFA" className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col text-left leading-tight">
              <span className="tracking-tight font-black">
                {isIos ? '📲 Installer sur iPhone' : "📲 Installer l'App KTFA"}
              </span>
              <span className="text-[9px] font-extrabold uppercase text-slate-900/80">
                {isIos ? 'Ajouter à l\'accueil' : 'Arrivages & Alertes directes'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ━━━ 2. CONFIRMATION ULTRA-RAPIDE SANS SCHÉMA COMPLEXE ━━━ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-sm rounded-3xl p-5 border-2 ${
            isLight ? 'bg-white border-amber-400 text-slate-900' : 'bg-slate-950 border-amber-500/60 text-white'
          } shadow-2xl text-center`}>
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-2.5 shadow-lg border-2 border-amber-400 bg-slate-900">
              <img src="/logos/ktfa_official_logo.jpg" alt="KTFA" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-base font-black">
              {isIos ? '📲 Installer sur iPhone' : "📲 Installer l'App KTFA"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              {isIos
                ? 'Télécharger le package officiel pour ajouter KTFA FLEX à votre écran d’accueil'
                : 'Installation native directe en 1-clic sur votre écran d’accueil'}
            </p>

            <button
              onClick={() => {
                if (onInstall) onInstall();
                setIsModalOpen(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-102 active:scale-95 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isIos ? 'Télécharger & Installer le Package' : 'Installer maintenant (1-Clic)'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
