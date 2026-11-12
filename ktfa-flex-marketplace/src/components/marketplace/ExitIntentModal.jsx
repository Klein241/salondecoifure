import React from 'react';
import { X, MessageCircle } from 'lucide-react';

export default function ExitIntentModal({
  isOpen,
  onClose,
  onOpenRegister,
  officialWhatsapp,
  countryConfig = {}
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md rounded-[32px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-emerald-400/60 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.3)] text-center">
        
        {/* BOUTON FERMER */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ICÔNE ANIMÉE */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-amber-400 to-emerald-500 p-0.5 shadow-[0_10px_25px_rgba(16,185,129,0.5)]">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl">
            🎁
          </div>
        </div>

        <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider mb-2">
          Offre Spéciale Visiteur
        </div>

        <h3 className="text-lg sm:text-xl font-black text-white mb-1.5 leading-snug">
          Ne partez pas les mains vides !
        </h3>
        
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Acquérez vos équipements favoris dès aujourd'hui et réglez en <strong className="text-emerald-400">4 tranches mensuelles sans avance bancaire</strong> à {countryConfig.primaryCity || 'Douala'} & {countryConfig.secondaryCity || 'Yaoundé'} {countryConfig.flag || '🇨🇲'}.
        </p>

        {/* AVANTAGE EXCLUSIF */}
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-left mb-5 flex items-center gap-3">
          <span className="text-2xl">🚚</span>
          <div className="text-[11px] text-slate-300 leading-tight">
            <strong className="text-emerald-300 font-bold">Livraison Prioritaire Offerte :</strong> pour toute inscription finalisée aujourd'hui.
          </div>
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose && onClose();
              onOpenRegister && onOpenRegister();
            }}
            className="w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-[0_8px_20px_rgba(16,185,129,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            Créer mon compte en 2 min (4x sans caution)
          </button>

          <a
            href={`https://wa.me/${officialWhatsapp}?text=${encodeURIComponent('Bonjour KTFA FLEX ! J\'ai vu l\'offre spéciale paiement échelonné 4x et je souhaite commander.')}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Poser une question sur WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
