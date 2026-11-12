import React from 'react';
import { Bell, X, Volume2, VolumeX } from 'lucide-react';

export default function NotificationCenterModal({
  isOpen,
  onClose,
  isLight,
  settings,
  catalogItems = [],
  onSelectProduct,
  countryConfig = {},
  notificationStatus = 'default',
  handleEnableNotifications,
  soundEnabled,
  setSoundEnabled,
  userProfile,
  onOpenRegister,
  onSelectCategory
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[32px] border-2 p-5 sm:p-7 shadow-2xl scrollbar-none transition-all ${
          isLight
            ? 'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF5EE] border-amber-300 text-[#2C221D] shadow-[0_25px_60px_rgba(200,150,110,0.22),inset_0_2px_4px_rgba(255,255,255,1)]'
            : 'bg-slate-950 border-emerald-500/50 text-white shadow-[0_30px_70px_rgba(0,0,0,0.95)]'
        }`}
      >
        {/* LISERÉ DORÉ LUMINESCENT SUPÉRIEUR */}
        {isLight && (
          <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent pointer-events-none rounded-full" />
        )}

        {/* HEADER DU CENTRE DE NOTIFICATIONS */}
        <div className={`flex items-center justify-between pb-3.5 border-b mb-4 ${
          isLight ? 'border-amber-200/80' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-sm ${
              isLight
                ? 'bg-amber-100/80 border-amber-300 text-amber-700'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}>
              <Bell className="w-4 h-4 bell-wiggle" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                Centre d'Alertes {settings?.company_name || 'KTFA FLEX'}
              </h3>
              <p className={`text-[10px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
                Notifications en temps réel • {countryConfig?.name || 'Cameroun'} {countryConfig?.flag || '🇨🇲'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
              isLight ? 'bg-white hover:bg-amber-50 border-amber-200 text-[#6C584C] shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BANNIÈRE DISCRÈTE SI LES NOTIFICATIONS NE SONT PAS ENCORE AUTORISÉES */}
        {notificationStatus !== 'granted' && (
          <div className={`p-3 rounded-2xl border mb-3.5 flex items-center justify-between gap-2.5 ${
            isLight ? 'bg-amber-50/80 border-amber-300' : 'bg-slate-900 border-amber-500/40'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <div className={`text-xs font-black truncate ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                  Alertes & Arrivages en Direct
                </div>
                <div className={`text-[10px] truncate ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
                  Recevez les ventes flash et disponibilités 4x sans frais
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="px-3 py-1.5 rounded-xl font-black text-xs bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white shrink-0 active:scale-95 cursor-pointer shadow-sm"
            >
              Activer
            </button>
          </div>
        )}

        {/* FEED DES DERNIÈRES ALERTES EN DIRECT BASÉ SUR LES PRODUITS RÉELS */}
        <div className="space-y-2.5 mb-4">
          {Array.isArray(catalogItems) && catalogItems.slice(0, 3).map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => {
                if (onSelectProduct) {
                  onSelectProduct(item);
                  onClose();
                }
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-95 ${
                isLight ? 'bg-white/95 hover:bg-amber-50/50 border-amber-200/90 shadow-sm' : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                  idx === 0
                    ? isLight ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-amber-500/20 text-amber-400'
                    : isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {idx === 0 ? '🔥 NOUVEL ARRIVAGE' : '⚡ DISPONIBLE 4X SANS FRAIS'}
                </span>
                <span className={`text-[10px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-500'}`}>
                  {idx === 0 ? "À l'instant" : `Il y a ${idx * 15} min`}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {item.image_url && (
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-amber-300/40 bg-slate-900">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-black truncate ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                    {item.title}
                  </div>
                  <p className={`text-[10px] leading-relaxed truncate ${isLight ? 'text-[#6C584C]' : 'text-slate-400'}`}>
                    {item.price_fcfa ? `${Number(item.price_fcfa).toLocaleString()} FCFA` : ''} · Échelonné en {item.installment_tranches || 4}x sans caution
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* ALERTE MOYENS DE PAIEMENT */}
          <div className={`p-3 rounded-2xl border transition-all ${
            isLight ? 'bg-white/95 border-amber-200/90 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                isLight ? 'bg-sky-100 text-sky-900 border border-sky-200' : 'bg-sky-500/20 text-sky-400'
              }`}>
                💳 Règlement Sécurisé
              </span>
              <span className={`text-[10px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-500'}`}>En continu</span>
            </div>
            <div className={`text-xs font-black mb-0.5 ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
              Orange Money 🟠 et MTN Mobile Money 🟡
            </div>
            <p className={`text-[10px] leading-relaxed ${isLight ? 'text-[#6C584C]' : 'text-slate-400'}`}>
              Réglez votre acompte de 1ère tranche en ligne et téléchargez instantanément votre reçu officiel avec signature électronique.
            </p>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className={`pt-3 border-t flex items-center justify-between gap-2 ${
          isLight ? 'border-amber-200/70' : 'border-slate-800'
        }`}>
          <button
            type="button"
            onClick={() => setSoundEnabled && setSoundEnabled(!soundEnabled)}
            className={`text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight ? 'text-[#6C584C] hover:text-[#2C221D]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span>Son des alertes : {soundEnabled ? 'Actif' : 'Coupé'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (!userProfile && onOpenRegister) {
                onOpenRegister();
              }
            }}
            className={`font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 shadow-sm'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
            }`}
          >
            {userProfile ? 'Fermer' : 'Rejoindre l\'Espace VIP'}
          </button>
        </div>
      </div>
    </div>
  );
}