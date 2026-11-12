import React from 'react';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Bell,
  User,
  Lock,
  BadgePercent,
  ArrowRight,
  ChevronRight,
  Plus,
  FileText,
  Search,
  X
} from 'lucide-react';

export default function MarketplaceHeader({
  isLight,
  toggleTheme,
  settings,
  countryConfig,
  flashSecondsLeft,
  formatFlashTime,
  soundEnabled,
  setSoundEnabled,
  userProfile,
  handleOpenClientSpace,
  onOpenLogin,
  onOpenRegister,
  setRegisterStep,
  setIsRegisterModalOpen,
  setIsNotificationCenterOpen,
  unreadNotificationsCount,
  setUnreadNotificationsCount,
  onNavigateAdmin,
  catalogItems = [],
  currentSlideIndex = 0,
  setCurrentSlideIndex,
  setSelectedProduct,
  handleStartCheckout,
  searchQuery,
  setSearchQuery,
  filteredCount,
  categories = [],
  selectedCategory,
  setSelectedCategory
}) {
  return (
    <>
      {/* ======================================================== */}
      {/* 1. TOP BAR 3D CLAIRMORPHISME DORÉ & NAVIGATION LUXE     */}
      {/* ======================================================== */}
      <header className={`relative z-30 border-b ${
        isLight
          ? 'border-amber-200/60 bg-[#FAF6F0]/90 text-[#2C221D] shadow-[0_8px_24px_rgba(200,160,120,0.1)]'
          : 'border-emerald-500/20 bg-slate-950/80 text-white shadow-[0_10px_30px_rgba(0,0,0,0.7)]'
      } backdrop-blur-2xl sticky top-0`}>
        
        {/* BANNER PROMO BOMBÉE CHAMPAGNE DORÉ */}
        <div className={`${
          isLight
            ? 'bg-gradient-to-r from-[#FDF0E4] via-[#FAF6F0] to-[#FDF0E4] border-b border-amber-200/50 text-[#7C481F]'
            : 'bg-gradient-to-r from-emerald-950 via-slate-950 to-teal-950 border-b border-emerald-500/30 text-emerald-200'
        } px-3 py-1.5 text-center text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-2`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
          <span>💎 {settings?.company_name || 'KTFA FLEX'} : Payez en tranches personnalisées en {countryConfig.name} {countryConfig.flag} • Livraison express à {countryConfig.primaryCity}, {countryConfig.secondaryCity} & toutes régions</span>
          <span className={`hidden sm:inline ${
            isLight
              ? 'bg-amber-100/90 text-[#7C481F] border-amber-300/70 shadow-sm'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          } px-2 py-0.5 rounded-full text-[10px] font-bold border`}>
            0% de tracas
          </span>
        </div>

        {/* BANDEAU COMPTE À REBOURS VENTE FLASH ALIBABA STYLE */}
        <div className={`${
          isLight
            ? 'bg-gradient-to-r from-[#FAE8D7] via-[#FFF3E8] to-[#FAE8D7] border-b border-amber-300/60 text-[#6C3A14]'
            : 'bg-gradient-to-r from-amber-950 via-slate-950 to-red-950 border-b border-amber-500/40 text-slate-200'
        } px-3 py-1.5 flex items-center justify-between gap-2 text-[10px] sm:text-xs`}>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 font-black uppercase tracking-wide px-2 py-0.5 rounded-md border shadow-sm animate-pulse ${
              isLight
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400 text-[#8B4814]'
                : 'bg-gradient-to-r from-amber-500/30 to-red-500/30 border-amber-400/40 text-amber-400'
            }`}>
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Vente Flash 4x</span>
            </span>
            <span className={`${isLight ? 'text-[#7C481F] font-medium' : 'text-slate-200'} hidden sm:inline`}>Fin des quotas sans caution :</span>
            <span className={`font-mono font-black border px-2 py-0.5 rounded-md shadow-inner tracking-wider ${
              isLight
                ? 'text-[#8B4814] bg-white/90 border-amber-300 shadow-[inset_0_1px_2px_rgba(200,150,100,0.15)]'
                : 'text-amber-300 bg-slate-950/90 border-amber-500/40'
            }`}>
              {formatFlashTime(flashSecondsLeft)}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className={`text-[10px] font-extrabold ${isLight ? 'text-[#7C481F]' : 'text-emerald-300'} hidden md:inline`}>92% alloué aujourd'hui</span>
            </div>

            {/* TOGGLE SON DISCRET */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-amber-200 text-[#7C481F] hover:text-amber-600 shadow-sm'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-amber-300'
              }`}
              title={soundEnabled ? 'Couper le son des alertes' : 'Activer le son des alertes'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* NAVIGATION PRINCIPALE */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          {/* LOGO KTFA FLEX OFFICIEL COMPACTÉ ET PARFAIT SUR MOBILE */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-[14px] sm:rounded-[16px] overflow-hidden p-0.5 flex items-center justify-center transform active:scale-95 transition-transform bg-slate-900 shrink-0 ${
              isLight
                ? 'shadow-[0_4px_14px_rgba(200,150,100,0.2),inset_0_2px_4px_rgba(255,255,255,1)] border border-amber-300/80'
                : 'shadow-[0_4px_14px_rgba(16,185,129,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-emerald-500/40'
            }`}>
              <img
                src="/logos/ktfa_official_logo.jpg"
                alt="KTFA Logo Officiel"
                className="w-full h-full object-contain rounded-[12px] sm:rounded-[14px]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className={`text-base sm:text-xl font-black tracking-tight ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>KTFA</span>
                <span className={`text-base sm:text-xl font-black tracking-tight ${
                  isLight
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500'
                }`}>
                  FLEX
                </span>
                <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-full hidden sm:inline-block ${
                  isLight
                    ? 'bg-amber-100 text-[#8B4814] border border-amber-300/70 shadow-xs'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  Marketplace
                </span>
              </div>
              <p className={`text-[10px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'} hidden md:block font-medium truncate`}>
                Achetez Malin, Payez à Votre Rythme
              </p>
            </div>
          </div>

          {/* ACTIONS TOP BAR : 100% VISIBLE SUR MOBILE (CLOCHE, THEME, PAYS, CONNEXION / CRÉER UN COMPTE) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* 1. CLOCHE DE NOTIFICATION (TOUJOURS VISIBLE) */}
            <button
              onClick={() => {
                setIsNotificationCenterOpen(true);
                if (setUnreadNotificationsCount) setUnreadNotificationsCount(0);
              }}
              className={`relative p-2 sm:p-2.5 rounded-2xl border transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
                isLight
                  ? 'bg-white border-amber-200/80 text-amber-600 shadow-[0_4px_12px_rgba(200,160,120,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)]'
                  : 'bg-slate-900 hover:bg-slate-850 border-amber-500/40 text-amber-300 hover:text-white'
              }`}
              title="Centre de notifications & Alertes Flash"
            >
              <Bell className="w-4 h-4 text-amber-500 bell-wiggle" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* 2. TOGGLE MODE CLAIR / SOMBRE */}
            <button
              onClick={toggleTheme}
              className={`p-2 sm:p-2.5 rounded-2xl border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm shrink-0 ${
                isLight
                  ? 'bg-white border-amber-200/80 text-[#8B4814] hover:bg-amber-50 shadow-[0_4px_12px_rgba(200,160,120,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)]'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-700 text-amber-300 hover:text-white'
              }`}
              title={isLight ? 'Passer en Mode Sombre' : 'Passer en Mode Clair'}
            >
              {isLight ? <Moon className="w-4 h-4 text-amber-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* 3. SÉLECTEUR DE PAYS DYNAMIQUE */}
            <button
              onClick={() => {
                onOpenRegister ? onOpenRegister() : handleOpenClientSpace();
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-2xl border shrink-0 ${
                isLight
                  ? 'bg-white hover:bg-amber-50 border-amber-200/80 text-[#4A3B32] shadow-[0_4px_12px_rgba(200,160,120,0.1)]'
                  : 'bg-slate-900 hover:bg-slate-850 border-emerald-500/30 text-slate-300 hover:text-white'
              } text-xs transition-all cursor-pointer active:scale-95`}
              title={`Pays actuel : ${countryConfig.name}`}
            >
              <span className="text-sm">{countryConfig.flag}</span>
              <span className="font-extrabold text-[11px] hidden sm:inline">{countryConfig.name}</span>
            </button>

            {/* 4. SUR DESKTOP : ACTIONS MEMBRE (CONNEXION & CRÉER UN COMPTE) */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {userProfile ? (
                <button
                  onClick={handleOpenClientSpace}
                  className={`flex items-center gap-2 border-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    isLight
                      ? 'bg-gradient-to-b from-white to-[#F8F2EB] border-amber-300 text-[#4A3B32] shadow-[0_6px_16px_rgba(200,160,120,0.15)]'
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 border-emerald-500/50 text-emerald-300'
                  }`}
                  title="Mon Espace Client"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-extrabold max-w-[110px] truncate">
                    {(userProfile?.name || 'Membre').split(' ')[0]}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenLogin ? onOpenLogin() : handleOpenClientSpace()}
                    className={`px-3 py-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-amber-50 border-amber-200/90 text-[#6C584C] hover:text-[#8B4814] shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                    title="Se connecter"
                  >
                    Se connecter
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenRegister ? onOpenRegister() : handleOpenClientSpace()}
                    className={`px-3.5 py-2 rounded-2xl font-black text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 ${
                      isLight
                        ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-[0_6px_16px_rgba(217,119,6,0.35)]'
                        : 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 shadow-md'
                    }`}
                    title="Créer un compte en 4 champs"
                  >
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>Créer un compte</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BARRE D'ACTIONS RAPIDES MOBILE (100% DÉDIÉE ET VISIBLE SUR TOUS SMARTPHONES) */}
        <div className={`sm:hidden flex items-center justify-between gap-1.5 px-3 py-2 border-t ${
          isLight ? 'border-amber-200/60 bg-[#FDF9F3]/95' : 'border-slate-800 bg-slate-950/95'
        }`}>
          {/* BOUTON MON ESPACE (TOUJOURS VISIBLE) */}
          <button
            type="button"
            onClick={handleOpenClientSpace}
            className={`flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                : 'bg-slate-900 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{userProfile ? (userProfile?.name || 'Membre').split(' ')[0] : 'Mon Espace'}</span>
          </button>

          {!userProfile ? (
            <>
              {/* BOUTON SE CONNECTER */}
              <button
                type="button"
                onClick={() => onOpenLogin ? onOpenLogin() : handleOpenClientSpace()}
                className={`flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-white border-amber-200 text-[#4A3B32]'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <span>Se connecter</span>
              </button>

              {/* BOUTON CRÉER UN COMPTE */}
              <button
                type="button"
                onClick={() => onOpenRegister ? onOpenRegister() : handleOpenClientSpace()}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white shadow-amber-500/20'
                    : 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950'
                }`}
              >
                <span>Créer un compte</span>
              </button>
            </>
          ) : (
            <div className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold ${
              isLight ? 'bg-amber-100/70 border-amber-200 text-amber-800' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            }`}>
              Membre VIP {countryConfig.flag}
            </div>
          )}
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO BANNER EN RELIEF 3D BOMBÉ                        */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-4 sm:pt-6 pb-2 sm:pb-4">
        
        {/* VERSION MOBILE : MINI-CARTE DIAPORAMA 3D (2s) */}
        <div className="block sm:hidden">
          <div className={`relative rounded-[28px] overflow-hidden border-2 p-3.5 transition-all ${
            isLight
              ? 'border-amber-200/90 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#F5ECE1] shadow-[0_20px_45px_rgba(200,150,110,0.18),inset_0_3px_5px_rgba(255,255,255,1),inset_0_-3px_5px_rgba(220,180,130,0.12)]'
              : 'border-emerald-500/50 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900/90 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_3px_6px_rgba(255,255,255,0.2),inset_0_-4px_8px_rgba(0,0,0,0.6)]'
          }`}>
            {isLight && (
              <div className="absolute top-0 inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent pointer-events-none rounded-full" />
            )}
            
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                isLight
                  ? 'bg-amber-100/70 border border-amber-300/80 text-amber-900 shadow-sm'
                  : 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]'
              }`}>
                <Sparkles className="w-3 h-3 text-amber-500 animate-spin-slow" />
                <span>{(settings?.company_name || 'KTFA FLEX').toUpperCase()} {countryConfig.flag} {countryConfig.name.toUpperCase()}</span>
              </div>
              <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${
                isLight
                  ? 'text-[#6C584C] bg-white border-amber-200/80 shadow-sm'
                  : 'text-slate-300 bg-slate-950/80 border-slate-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>{currentSlideIndex + 1}/{catalogItems.length}</span>
              </div>
            </div>

            {catalogItems[currentSlideIndex] && (
              <div
                onClick={() => setSelectedProduct && setSelectedProduct(catalogItems[currentSlideIndex])}
                className={`relative w-full h-44 rounded-[22px] overflow-hidden cursor-pointer group ${
                  isLight
                    ? 'bg-[#F5ECE1] border border-amber-200/60 shadow-[inset_0_2px_6px_rgba(180,140,100,0.12)]'
                    : 'bg-slate-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]'
                }`}
              >
                <img
                  key={catalogItems[currentSlideIndex].id}
                  src={catalogItems[currentSlideIndex].image_url}
                  alt={catalogItems[currentSlideIndex].title}
                  className="w-full h-full object-cover animate-in fade-in duration-500"
                />

                <div className={`absolute inset-0 ${
                  isLight
                    ? 'bg-gradient-to-t from-[#2C221D]/80 via-[#2C221D]/20 to-transparent'
                    : 'bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent'
                }`} />

                <div className="absolute top-2 left-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black shadow-md ${
                    isLight
                      ? 'bg-white/95 text-amber-900 border border-amber-200'
                      : (catalogItems[currentSlideIndex].badge_color || 'bg-emerald-600 text-white')
                  }`}>
                    {catalogItems[currentSlideIndex].badge || 'FLEX DISPO'}
                  </span>
                </div>

                <div className={`absolute top-2 right-2 backdrop-blur-md px-2 py-0.5 rounded-xl text-[10px] font-black shadow-md ${
                  isLight
                    ? 'bg-white/95 border border-amber-300 text-amber-700'
                    : 'bg-slate-950/90 border border-emerald-500/50 text-emerald-300'
                }`}>
                  {catalogItems[currentSlideIndex].installment_tranches || 4}x {Number(catalogItems[currentSlideIndex].monthly_fcfa || Math.round((Number(catalogItems[currentSlideIndex].price_fcfa) || 0) / 4)).toLocaleString('fr-FR')} F / tranche
                </div>

                <div className="absolute bottom-2 inset-x-2.5">
                  <h3 className="text-xs font-black text-white leading-tight drop-shadow truncate">
                    {catalogItems[currentSlideIndex].title}
                  </h3>
                  <div className="flex items-center justify-between mt-0.5 text-[10px]">
                    <span className="text-amber-100">
                      Comptant : <strong className="text-white">{Number(catalogItems[currentSlideIndex].price_fcfa || 0).toLocaleString('fr-FR')} F</strong>
                    </span>
                    <span className="text-amber-300 font-bold flex items-center gap-0.5">
                      <span>Détails</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* INDICATEURS DU DIAPORAMA */}
            <div className="flex items-center justify-center gap-1 mt-2">
              {catalogItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentSlideIndex === idx
                      ? isLight
                        ? 'w-5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] shadow-[0_0_8px_#d97706]'
                        : 'w-5 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_#10b981]'
                      : isLight
                      ? 'w-1 bg-amber-200'
                      : 'w-1 bg-slate-700/60'
                  }`}
                />
              ))}
            </div>

            {/* BOUTONS ACTIONS RAPIDES MOBILE */}
            <div className={`grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t ${
              isLight ? 'border-amber-200/70' : 'border-slate-800/80'
            }`}>
              <button
                onClick={() => {
                  if (catalogItems[currentSlideIndex]) {
                    handleStartCheckout(catalogItems[currentSlideIndex]);
                  }
                }}
                className={`font-black py-2 px-2.5 rounded-2xl text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-[0_6px_16px_rgba(217,119,6,0.35),inset_0_2px_3px_rgba(255,255,255,0.4)]'
                    : 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 shadow-[0_6px_16px_rgba(16,185,129,0.4),inset_0_2px_3px_rgba(255,255,255,0.4)]'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Commander en 4x</span>
              </button>

              <button
                onClick={handleOpenClientSpace}
                className={`font-extrabold py-2 px-2.5 rounded-2xl text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-amber-50 border-2 border-amber-200/90 text-[#4A3B32] shadow-[0_4px_12px_rgba(200,160,120,0.12),inset_0_1px_2px_rgba(255,255,255,1)]'
                    : 'bg-gradient-to-b from-slate-850 to-slate-900 border border-emerald-500/40 text-emerald-300 shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.15)]'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-emerald-400'}`} />
                <span>Mon Espace & Reçus</span>
              </button>
            </div>
          </div>
        </div>

        {/* VERSION DESKTOP : CARTE DE PRÉSENTATION COMPLÈTE BOMBÉE 3D */}
        <div className={`hidden sm:block relative rounded-[32px] overflow-hidden border-2 p-8 backdrop-blur-2xl transition-all ${
          isLight
            ? 'border-amber-200/90 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EE] to-[#F5EBE0] shadow-[0_25px_60px_rgba(200,150,110,0.18),inset_0_3px_6px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(220,180,130,0.12)]'
            : 'border-emerald-500/40 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900/90 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_3px_6px_rgba(255,255,255,0.2),inset_0_-4px_8px_rgba(0,0,0,0.6)]'
        }`}>
          {isLight && (
            <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent pointer-events-none rounded-full" />
          )}

          <div className="relative z-10 max-w-2xl">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black mb-3 ${
              isLight
                ? 'bg-amber-100/80 border border-amber-300 text-amber-900 shadow-sm'
                : 'bg-gradient-to-b from-emerald-500/30 to-emerald-500/10 border border-emerald-400/50 text-emerald-300 shadow-[0_4px_12px_rgba(16,185,129,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)]'
            }`}>
              <BadgePercent className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>FACILITÉS DE PAIEMENT ÉCHELONNÉ EN 3X / 4X • {countryConfig.name.toUpperCase()} {countryConfig.flag}</span>
            </div>

            <h1 className={`text-3xl sm:text-4xl font-black leading-tight mb-3 tracking-tight ${
              isLight ? 'text-[#2C221D]' : 'text-white'
            }`}>
              Achetez vos équipements favoris, <br className="hidden sm:inline" />
              <span className={`text-transparent bg-clip-text ${
                isLight
                  ? 'bg-gradient-to-r from-[#D97706] via-[#B45309] to-[#92400E]'
                  : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400'
              }`}>
                payez par tranches sereinement.
              </span>
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed mb-6 font-medium ${
              isLight ? 'text-[#6C584C]' : 'text-slate-300'
            }`}>
              High-Tech, smartphones, électroménager et packs business avec flexibilité de paiement en {countryConfig.name}. Ouvrez votre compte en 5 étapes et suivez vos échéances et reçus en direct.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`font-black px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-[0_10px_25px_rgba(217,119,6,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)]'
                    : 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 shadow-[0_10px_25px_rgba(16,185,129,0.4),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3)]'
                }`}
              >
                <span>Découvrir le Catalogue</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={handleOpenClientSpace}
                className={`border-2 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-amber-50 border-amber-200/90 text-[#4A3B32] shadow-[0_8px_20px_rgba(200,160,120,0.12),inset_0_2px_3px_rgba(255,255,255,1)]'
                    : 'bg-gradient-to-b from-slate-850 to-slate-900 hover:from-slate-800 hover:to-slate-850 text-emerald-300 border-emerald-500/40 shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.15)]'
                }`}
              >
                <FileText className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-emerald-400'}`} />
                <span>Mon Espace & Mes Reçus</span>
              </button>
            </div>
          </div>

          {/* 4 CAPSULES BOMBÉES 3D EN BAS DU HERO */}
          <div className={`mt-8 pt-6 border-t grid grid-cols-4 gap-3 text-center ${
            isLight ? 'border-amber-200/80' : 'border-slate-800/80'
          }`}>
            <div className={`p-3 rounded-2xl border ${
              isLight
                ? 'bg-white/95 border-amber-200/80 shadow-[0_6px_16px_rgba(200,150,110,0.1),inset_0_1px_2px_rgba(255,255,255,1)]'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/30 shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.1)]'
            }`}>
              <div className={`font-black text-lg ${isLight ? 'text-[#D97706]' : 'text-emerald-400'}`}>3x & 4x</div>
              <div className={`text-[10px] font-bold ${isLight ? 'text-[#78716C]' : 'text-slate-400'}`}>Paiements échelonnés</div>
            </div>
            <div className={`p-3 rounded-2xl border ${
              isLight
                ? 'bg-white/95 border-amber-200/80 shadow-[0_6px_16px_rgba(200,150,110,0.1),inset_0_1px_2px_rgba(255,255,255,1)]'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/30 shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.1)]'
            }`}>
              <div className={`font-black text-lg ${isLight ? 'text-[#B45309]' : 'text-amber-400'}`}>0 Caution</div>
              <div className={`text-[10px] font-bold ${isLight ? 'text-[#78716C]' : 'text-slate-400'}`}>Dossier simplifié</div>
            </div>
            <div className={`p-3 rounded-2xl border ${
              isLight
                ? 'bg-white/95 border-amber-200/80 shadow-[0_6px_16px_rgba(200,150,110,0.1),inset_0_1px_2px_rgba(255,255,255,1)]'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/30 shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.1)]'
            }`}>
              <div className={`font-black text-lg ${isLight ? 'text-[#D97706]' : 'text-teal-400'}`}>Reçu Immédiat</div>
              <div className={`text-[10px] font-bold ${isLight ? 'text-[#78716C]' : 'text-slate-400'}`}>Téléchargeable en 1 clic</div>
            </div>
            <div className={`p-3 rounded-2xl border ${
              isLight
                ? 'bg-white/95 border-amber-200/80 shadow-[0_6px_16px_rgba(200,150,110,0.1),inset_0_1px_2px_rgba(255,255,255,1)]'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/30 shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.1)]'
            }`}>
              <div className={`font-black text-lg ${isLight ? 'text-[#B45309]' : 'text-cyan-400'}`}>Livraison {countryConfig.name}</div>
              <div className={`text-[10px] font-bold ${isLight ? 'text-[#78716C]' : 'text-slate-400'}`}>{countryConfig.primaryCity}, {countryConfig.secondaryCity} & Régions</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. RECHERCHE & CATÉGORIES                                */}
      {/* ======================================================== */}
      <section id="catalog-section" className="relative z-10 max-w-6xl mx-auto px-4 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
          <div className="relative w-full sm:max-w-md">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isLight ? 'text-amber-500' : 'text-emerald-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un iPhone, PC portable, TV 4K, Climatiseur..."
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 ${
                isLight
                  ? 'bg-white border-amber-200/90 text-[#2C221D] placeholder-[#A89F91] focus:border-amber-500 shadow-[0_6px_18px_rgba(200,160,120,0.1),inset_0_2px_4px_rgba(255,255,255,1)]'
                  : 'bg-slate-900/90 border-emerald-500/30 text-white placeholder-slate-500 focus:border-emerald-400 shadow-[0_6px_16px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(0,0,0,0.5)]'
              } text-xs sm:text-sm focus:outline-none transition-all`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className={`text-xs ${isLight ? 'text-[#78716C]' : 'text-slate-400'} self-end sm:self-center font-bold`}>
            <span className={`font-black text-sm ${isLight ? 'text-[#D97706]' : 'text-emerald-500'}`}>{filteredCount}</span> articles disponibles
          </div>
        </div>

        {/* CATÉGORIES EN CAPSULES BOMBÉES */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            const label = cat === 'all' ? '🔥 Tout le catalogue' : cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-[0_8px_18px_rgba(217,119,6,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)] scale-105'
                      : 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 shadow-[0_8px_18px_rgba(16,185,129,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] scale-105'
                    : isLight
                    ? 'bg-white hover:bg-amber-50 text-[#5C4D42] hover:text-[#2C221D] border-2 border-amber-200/80 shadow-[0_4px_12px_rgba(200,160,120,0.1),inset_0_1px_2px_rgba(255,255,255,1)]'
                    : 'bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 hover:text-white border border-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.1)]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
