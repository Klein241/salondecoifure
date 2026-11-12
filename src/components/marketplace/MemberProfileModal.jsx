import React, { useState } from 'react';
import {
  X,
  Check,
  CheckCircle2,
  Truck,
  Clock,
  FileText,
  LogOut,
  Package as PackageBox,
  PackageCheck as PackageDelivered
} from 'lucide-react';

export default function MemberProfileModal({
  isOpen,
  onClose,
  isLight,
  userProfile,
  settings,
  countryConfig = {},
  whatsappNumber,
  ordersDelivered = [],
  ordersPaidPending = [],
  ordersInProgress = [],
  onSelectReceipt,
  onLogout
}) {
  const [activeProfileTab, setActiveProfileTab] = useState('delivered');
  const [isProfileInfoDrawerOpen, setIsProfileInfoDrawerOpen] = useState(false);

  if (!isOpen) return null;

  const activeOrdersList =
    activeProfileTab === 'delivered'
      ? ordersDelivered
      : activeProfileTab === 'paid_pending'
      ? ordersPaidPending
      : ordersInProgress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[32px] border-2 p-5 sm:p-7 shadow-2xl scrollbar-none ${
        isLight
          ? 'bg-white border-amber-300 text-slate-900 shadow-[0_25px_60px_rgba(200,150,110,0.2)]'
          : 'bg-slate-950 border-emerald-500/50 text-white shadow-[0_30px_70px_rgba(0,0,0,0.95)]'
      }`}>
        
        {/* BOUTONS ACTIONS SUPÉRIEURES (DÉCONNEXION & FERMER) */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {onLogout && userProfile && (
            <button
              onClick={() => {
                if (confirm('Voulez-vous vraiment vous déconnecter de votre compte KTFA FLEX ?')) {
                  onLogout();
                  onClose();
                }
              }}
              className="px-2.5 py-1 rounded-full border border-red-400/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          )}

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CARTE D'IDENTITÉ & PRIVILÈGE MEMBRE EN RELIEF 3D BOMBÉ */}
        <div className="rounded-[26px] bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 border-2 border-emerald-400/50 p-5 mb-5 shadow-[0_16px_36px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.25)] relative overflow-hidden">
          
          {/* Lueur supérieure dorée */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 animate-pulse" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-400 to-teal-500 p-0.5 shadow-[0_8px_20px_rgba(16,185,129,0.5)] flex items-center justify-center text-3xl shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  💎
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-black text-white">
                    {userProfile ? userProfile.name : `Espace Membre ${settings?.company_name || 'KTFA FLEX'}`}
                  </h2>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Membre VIP {countryConfig?.flag || '🇨🇲'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex flex-wrap gap-x-3 gap-y-1 mt-1 font-medium">
                  <span>ID : <strong className="text-emerald-400 font-mono font-bold">{userProfile?.memberId || `${countryConfig?.codePrefix || 'MEM'}-884920`}</strong></span>
                  <span>Ville : <strong className="text-white">{userProfile?.city || countryConfig?.primaryCity || 'Douala'}</strong></span>
                  <span>Tél : <strong className="text-white">{userProfile?.phone || whatsappNumber}</strong></span>
                </div>
              </div>
            </div>

            {/* PLAFOND & SCORE SOLVABILITÉ */}
            <div className="w-full sm:w-auto bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-3 text-left sm:text-right shrink-0">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Plafond Échelonné Débloqué</div>
              <div className="text-base font-black text-amber-300">
                {countryConfig?.currency === 'EUR (€)' ? '2 500 €' : countryConfig?.currency === 'USD / FC' ? '2 500 $' : '1 500 000 FCFA'}
              </div>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center sm:justify-end gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>0 Caution • Score 98/100</span>
              </div>
            </div>
          </div>

          {/* ACCRÉDITATIONS & AVANTAGES MEMBRE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-300 font-semibold">
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Frais dossier 0 F</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>3x & 4x sans garant</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Livraison {countryConfig.name}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Reçus officiels PDF</span>
            </div>
          </div>

          {/* BOUTON DÉROULANT : MES INFORMATIONS PERSONNELLES */}
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={() => setIsProfileInfoDrawerOpen(!isProfileInfoDrawerOpen)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
            >
              {isProfileInfoDrawerOpen ? '▲ Masquer mon dossier complet' : '▼ Voir mon dossier d\'inscription complet'}
            </button>
          </div>

          {/* TIROIR DÉTAILS INSCRIPTION */}
          {isProfileInfoDrawerOpen && userProfile && (
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div><span className="text-slate-500">Nom & Prénom(s) :</span> <strong className="text-white">{userProfile.name}</strong></div>
                <div><span className="text-slate-500">Téléphone / WhatsApp :</span> <strong className="text-white">{userProfile.phone}</strong></div>
                <div><span className="text-slate-500">Adresse E-mail :</span> <strong className="text-white">{userProfile.email}</strong></div>
                <div><span className="text-slate-500">Sexe :</span> <strong className="text-white">{userProfile.gender}</strong></div>
                <div><span className="text-slate-500">Date de naissance :</span> <strong className="text-white">{userProfile.birthDate || 'Non renseignée'}</strong></div>
                <div><span className="text-slate-500">Ville de résidence :</span> <strong className="text-white">{userProfile.city}</strong></div>
                <div><span className="text-slate-500">Profession / Activité :</span> <strong className="text-white">{userProfile.profession || 'Activité libérale'}</strong></div>
                <div><span className="text-slate-500">Niveau d'études :</span> <strong className="text-white">{userProfile.educationLevel}</strong></div>
              </div>
              {userProfile.motivation && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500">Motivation pour rejoindre KTFA FLEX :</span>
                  <p className="text-slate-200 italic mt-0.5">"{userProfile.motivation}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LES 3 RUBRIQUES STRICTES : */}
        <div className="mb-4">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
            Mes Commandes & Échéanciers :
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* 1. DÉJÀ PAYÉ ET LIVRÉ */}
            <button
              onClick={() => setActiveProfileTab('delivered')}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                activeProfileTab === 'delivered'
                  ? 'bg-gradient-to-b from-emerald-500/30 to-emerald-500/10 border-emerald-400 text-emerald-300 shadow-[0_8px_18px_rgba(16,185,129,0.4),inset_0_2px_3px_rgba(255,255,255,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <PackageDelivered className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
              <div className="text-[11px] sm:text-xs font-black leading-tight">Déjà payé et livré</div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 mt-1 inline-block">
                {ordersDelivered.length}
              </span>
            </button>

            {/* 2. PAYÉ NON LIVRÉ */}
            <button
              onClick={() => setActiveProfileTab('paid_pending')}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                activeProfileTab === 'paid_pending'
                  ? 'bg-gradient-to-b from-sky-500/30 to-sky-500/10 border-sky-400 text-sky-300 shadow-[0_8px_18px_rgba(14,165,233,0.4),inset_0_2px_3px_rgba(255,255,255,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-5 h-5 mx-auto mb-1 text-sky-400" />
              <div className="text-[11px] sm:text-xs font-black leading-tight">Payé non livré</div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-300 mt-1 inline-block">
                {ordersPaidPending.length}
              </span>
            </button>

            {/* 3. EN COURS DE PAIEMENT */}
            <button
              onClick={() => setActiveProfileTab('in_progress')}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                activeProfileTab === 'in_progress'
                  ? 'bg-gradient-to-b from-amber-500/30 to-amber-500/10 border-amber-400 text-amber-300 shadow-[0_8px_18px_rgba(245,158,11,0.4),inset_0_2px_3px_rgba(255,255,255,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-5 h-5 mx-auto mb-1 text-amber-400" />
              <div className="text-[11px] sm:text-xs font-black leading-tight">En cours de paiement</div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 mt-1 inline-block">
                {ordersInProgress.length}
              </span>
            </button>
          </div>
        </div>

        {/* LISTE DES COMMANDES */}
        <div className="space-y-3 mt-4">
          {(ordersDelivered.length + ordersPaidPending.length + ordersInProgress.length) === 0 ? (
            <div className={`text-center py-10 px-6 rounded-3xl border-2 space-y-3 ${
              isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto text-2xl shadow-inner">
                📦
              </div>
              <div>
                <h3 className={`text-sm font-black ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                  Bienvenue sur votre compte personnel KTFA FLEX !
                </h3>
                <p className={`text-xs mt-1 max-w-md mx-auto leading-relaxed ${isLight ? 'text-[#78716C]' : 'text-slate-400'}`}>
                  Votre profil est activé. Vous n'avez pas encore effectué de commande. Vos futurs achats échelonnés en 4 tranches sans caution, vos suivis de livraison et vos reçus officiels apparaîtront ici dès votre première souscription.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Explorer le catalogue des produits
              </button>
            </div>
          ) : activeOrdersList.length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-slate-900/40 border border-slate-800 p-5">
              <PackageBox className="w-8 h-8 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs text-slate-400 font-semibold">
                Aucun article dans la rubrique "{activeProfileTab === 'delivered' ? 'Déjà payé et livré' : (activeProfileTab === 'paid_pending' ? 'Payé non livré' : 'En cours de paiement')}".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeOrdersList.map(order => (
                <div
                  key={order.id}
                  onClick={() => onSelectReceipt && onSelectReceipt(order)}
                  className="group cursor-pointer rounded-[24px] bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 hover:border-emerald-500/60 p-3.5 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.6),inset_0_2px_3px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 flex flex-col justify-between"
                >
                  <div>
                    {/* PHOTO & STATUT BADGE */}
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 mb-2.5">
                      <img
                        src={order.image_url}
                        alt={order.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shadow-md ${
                          order.statusCategory === 'delivered'
                            ? 'bg-emerald-600 text-white'
                            : (order.statusCategory === 'paid_pending' ? 'bg-sky-600 text-white' : 'bg-amber-600 text-white')
                        }`}>
                          {order.statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* TITRE & DÉTAILS */}
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
                      {order.title}
                    </h4>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                      <span>Réf : {order.receiptNumber}</span>
                      <span>{order.orderDate}</span>
                    </div>

                    {/* PROGRESSION SI EN COURS DE PAIEMENT */}
                    {order.statusCategory === 'in_progress' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                          <span className="text-amber-400">Tranche {order.tranchesPaidCount || 1}/{order.planTotalTranches || 4} payée</span>
                          <span className="text-slate-300">{Math.round(((Number(order.paidAmount) || 0) / (Number(order.totalPrice) || 1)) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
                            style={{ width: `${Math.min(100, Math.round(((Number(order.paidAmount) || 0) / (Number(order.totalPrice) || 1)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VOIR REÇU */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] text-slate-400">Total réglé</div>
                      <div className="text-xs font-black text-emerald-400">
                        {Number(order.paidAmount || 0).toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>

                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                      <FileText className="w-3 h-3" />
                      <span>Voir Reçu</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
