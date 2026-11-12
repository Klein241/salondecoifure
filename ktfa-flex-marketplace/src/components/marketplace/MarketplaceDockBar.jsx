import React from 'react';
import { ShoppingBag, Percent, User, Lock, MessageCircle } from 'lucide-react';

export default function MarketplaceDockBar({
  isLight,
  selectedCategory,
  onSelectCategory,
  isProfileModalOpen,
  cartCount = 0,
  onOpenCart,
  userProfile,
  onOpenClientSpace,
  officialWhatsapp
}) {
  return (
    <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40">
      <div className={`${
        isLight
          ? 'bg-white/95 border-amber-200/90 shadow-[0_15px_40px_rgba(200,150,110,0.22),inset_0_2px_4px_rgba(255,255,255,1)] text-[#78716C]'
          : 'bg-slate-950/90 border-emerald-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-3px_6px_rgba(0,0,0,0.5)] text-slate-400'
      } backdrop-blur-3xl border-2 rounded-[34px] p-2 flex items-center justify-around`}>
        
        {/* CATALOGUE */}
        <button
          onClick={() => {
            onSelectCategory && onSelectCategory('all');
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
            selectedCategory === 'all' && !isProfileModalOpen
              ? isLight ? 'text-[#D97706] font-black' : 'text-emerald-500 font-black'
              : isLight ? 'text-[#8C7D73] hover:text-[#2C221D]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-bold">Catalogue</span>
        </button>

        {/* ÉCHELONNÉ */}
        <button
          onClick={() => {
            onSelectCategory && onSelectCategory('Packs Business & Tontine');
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
            selectedCategory === 'Packs Business & Tontine'
              ? isLight ? 'text-[#D97706] font-black' : 'text-emerald-500 font-black'
              : isLight ? 'text-[#8C7D73] hover:text-[#2C221D]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Percent className="w-5 h-5" />
          <span className="text-[10px] font-bold">Échelonné</span>
        </button>

        {/* PANIER CENTRAL BOMBÉ (ORANGE AMBRÉ 3D) */}
        <button
          onClick={onOpenCart}
          className={`relative -top-5 w-14 h-14 rounded-2xl p-0.5 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer ${
            isLight
              ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] shadow-[0_12px_28px_rgba(217,119,6,0.5),inset_0_3px_5px_rgba(255,255,255,0.6),inset_0_-3px_5px_rgba(180,80,0,0.3)]'
              : 'bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-600 shadow-[0_12px_28px_rgba(16,185,129,0.6),inset_0_3px_5px_rgba(255,255,255,0.6),inset_0_-3px_5px_rgba(0,0,0,0.4)]'
          }`}
        >
          <div className={`w-full h-full ${isLight ? 'bg-white' : 'bg-slate-950/80'} backdrop-blur-xl rounded-[14px] flex items-center justify-center`}>
            <ShoppingBag className={`w-6 h-6 ${isLight ? 'text-[#D97706]' : 'text-emerald-500'}`} />
          </div>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md animate-pulse">
              {cartCount}
            </span>
          )}
        </button>

        {/* MON ESPACE */}
        <button
          onClick={onOpenClientSpace}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
            isProfileModalOpen
              ? isLight ? 'text-[#D97706] font-black' : 'text-emerald-500 font-black'
              : isLight ? 'text-[#8C7D73] hover:text-[#2C221D]' : 'text-slate-400 hover:text-white'
          }`}
          title={userProfile ? 'Accéder à mon espace' : 'Inscription obligatoire'}
        >
          <div className="relative">
            <User className={`w-5 h-5 ${
              userProfile 
                ? (isLight ? 'text-[#D97706]' : 'text-emerald-500')
                : (isLight ? 'text-amber-600' : 'text-slate-400')
            }`} />
            {userProfile && (
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full shadow-[0_0_8px_#f59e0b] animate-pulse ${isLight ? 'bg-amber-500' : 'bg-emerald-400'}`} />
            )}
          </div>
          <span className="text-[10px] font-bold">Mon Espace</span>
        </button>

        {/* WHATSAPP */}
        <a
          href={`https://wa.me/${officialWhatsapp}?text=${encodeURIComponent('Bonjour KTFA FLEX ! Je souhaite me renseigner sur le catalogue et les facilités de paiement échelonné.')}`}
          target="_blank"
          rel="noreferrer"
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
            isLight ? 'text-emerald-600 hover:text-emerald-700 font-semibold' : 'text-emerald-500 hover:text-emerald-400'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-bold">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
