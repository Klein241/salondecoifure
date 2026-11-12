import React from 'react';
import { Volume2, VolumeX, X, Bell } from 'lucide-react';

export default function LiveEventToast({
  activeLiveEvent,
  activeEvent,
  isLight,
  soundEnabled,
  setSoundEnabled,
  onSelectEvent,
  onClose,
  notificationStatus,
  onEnablePush
}) {
  const currentEvent = activeLiveEvent || activeEvent;
  if (!currentEvent) return null;

  return (
    <div className="fixed bottom-44 sm:bottom-6 left-3 z-30 max-w-[280px] sm:max-w-xs animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        onClick={() => onSelectEvent && onSelectEvent(currentEvent)}
        className={`p-3 rounded-2xl border-2 flex items-start gap-2.5 relative overflow-hidden group cursor-pointer hover:border-amber-400 hover:scale-[1.02] active:scale-95 transition-all ${
          isLight
            ? 'bg-white/95 backdrop-blur-2xl border-amber-300 text-slate-900 shadow-[0_12px_28px_rgba(200,160,110,0.22)]'
            : 'bg-slate-950/95 backdrop-blur-2xl border-emerald-500/60 text-white shadow-[0_16px_36px_rgba(0,0,0,0.85)]'
        }`}
      >
        {/* LUEUR BOMBÉE AMBRE/ÉMERAUDE */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-teal-400 animate-pulse" />

        {/* MINIATURE DU PRODUIT */}
        <div className="relative shrink-0">
          <div className={`w-11 h-11 rounded-xl overflow-hidden border shadow-md ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <img
              src={currentEvent.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'}
              alt={currentEvent.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 text-xs">⚡</span>
        </div>

        {/* CONTENU TEXTE DU PRODUIT */}
        <div className="flex-1 min-w-0 pr-12">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">
              {currentEvent.badge || '⚡ OFFRE FLASH'}
            </span>
            <span className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              • {currentEvent.time || 'À l\'instant'}
            </span>
          </div>
          <div className={`text-[11px] font-black leading-tight truncate transition-colors ${
            isLight ? 'text-slate-900 group-hover:text-amber-700' : 'text-white group-hover:text-amber-300'
          }`}>
            {currentEvent.title}
          </div>
          <div className="text-[10px] text-amber-500 font-extrabold mt-0.5">
            {currentEvent.priceMonthly ? `Facilité : ${currentEvent.priceMonthly}` : 'Paiement en 4 tranches sans frais'}
          </div>
          <div className={`text-[9px] line-clamp-1 mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {currentEvent.message || currentEvent.teaser}
          </div>

          {/* BOUTON OPT-IN SYSTEME ANDROID SI NOTIFICATIONS NON ENCORE AUTORISEES */}
          {notificationStatus !== 'granted' && onEnablePush && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEnablePush();
              }}
              className="mt-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
            >
              <Bell className="w-2.5 h-2.5" />
              Activer les alertes smartphone
            </button>
          )}
        </div>

        {/* ACTIONS TOAST : MUTE/UNMUTE SON & FERMETURE AVEC DÉLAI 10 MIN */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSoundEnabled && setSoundEnabled(!soundEnabled);
            }}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-amber-500 hover:bg-slate-100' : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
            }`}
            title={soundEnabled ? "Couper le son des alertes" : "Activer le son des alertes"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              try {
                const snoozeUntil = Date.now() + 10 * 60 * 1000; // 10 minutes
                localStorage.setItem('ktfa_notif_snooze_until', snoozeUntil.toString());
              } catch (err) {}
              onClose && onClose();
            }}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-500 hover:text-white hover:bg-slate-800'
            }`}
            title="Fermer (pause de 10 minutes)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
