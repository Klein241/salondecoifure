import React, { useState, useEffect } from 'react';
import { Download, X, Share2, Smartphone, Check } from 'lucide-react';

export function PWAInstallBanner({ companyName = 'Notre Entreprise', logoUrl = '' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
  });

  useEffect(() => {
    // Vérifier si déjà installé (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    // Détecter iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      isIosDevice &&
      !userAgent.includes('crios') &&
      !userAgent.includes('fxios') &&
      !userAgent.includes('opios');

    if (isSafari) {
      setIsIos(true);
    }

    // Écouter l'événement standard d'installation Chrome / Android / Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (dismissed || (!isInstallable && !isIos)) {
    return null;
  }

  return (
    <>
      {/* Bannière Flottante Discrète & Élégante */}
      <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-[#0e1422]/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-11 h-11 rounded-xl object-contain bg-white/5 p-1 border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shrink-0 shadow-lg text-black font-black text-lg">
                📲
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold truncate text-white">
                Installer {companyName}
              </h4>
              <p className="text-[11px] text-slate-300 truncate">
                Accès direct 1-clic depuis votre écran d'accueil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guide Modale pour utilisateurs iPhone / iOS Safari */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-sm bg-[#0e1422] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Installer sur iPhone / iPad</span>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pour ajouter <strong>{companyName}</strong> à votre écran d'accueil comme une application :
            </p>

            <ol className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>
                  Appuyez sur le bouton de <strong>Partage</strong> en bas de Safari (l'icône avec un carré et une flèche vers le haut <Share2 className="w-3.5 h-3.5 inline text-amber-400 mx-0.5" />).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>
                  Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>
                  Touchez <strong>« Ajouter »</strong> en haut à droite. L'application est installée !
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-extrabold text-xs shadow-lg mt-2 cursor-pointer"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
