import React, { useState, useMemo } from 'react';
import { X, Percent, Wallet, Check, Phone, User, MapPin, Truck } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  checkoutProduct,
  product,
  isLight,
  checkoutPlan,
  setCheckoutPlan,
  selectedTranchesCount,
  checkoutPlanTranches,
  handleTranchesCountChange,
  setCheckoutPlanTranches,
  tranchePaymentDates,
  handleTrancheDateChange,
  countryConfig = {},
  checkoutPaymentMethod,
  setCheckoutPaymentMethod,
  checkoutForm,
  setCheckoutForm,
  onConfirmOrder
}) {
  const activeProduct = checkoutProduct || product;

  // Plan : tranches ou comptant
  const [localPlan, setLocalPlan] = useState('tranches');
  const currentPlan = checkoutPlan || localPlan;
  const handleSelectPlan = (p) => {
    setLocalPlan(p);
    if (setCheckoutPlan) setCheckoutPlan(p);
  };

  // Nombre de tranches
  const defaultCount = Number(
    selectedTranchesCount ||
    checkoutPlanTranches ||
    (activeProduct && (activeProduct.installment_tranches || activeProduct.installment_months)) ||
    4
  );
  const [localTranchesCount, setLocalTranchesCount] = useState(defaultCount);
  const currentTranchesCount = selectedTranchesCount || checkoutPlanTranches || localTranchesCount || 4;

  const handleSelectCount = (num) => {
    setLocalTranchesCount(num);
    if (handleTranchesCountChange) handleTranchesCountChange(num);
    if (setCheckoutPlanTranches) setCheckoutPlanTranches(num);
  };

  // Dates des échéances par défaut (Aujourd'hui, J+30, J+60, J+90, J+120, J+150)
  const defaultDates = useMemo(() => {
    return [0, 1, 2, 3, 4, 5].map((monthOffset) => {
      const d = new Date();
      d.setDate(d.getDate() + (monthOffset * 30));
      return d.toISOString().split('T')[0];
    });
  }, []);

  const [localDates, setLocalDates] = useState(defaultDates);
  const currentDates = (Array.isArray(tranchePaymentDates) && tranchePaymentDates.length >= currentTranchesCount)
    ? tranchePaymentDates
    : localDates;

  const handleDateChange = (idx, newDate) => {
    setLocalDates((prev) => {
      const updated = [...prev];
      updated[idx] = newDate;
      return updated;
    });
    if (handleTrancheDateChange) handleTrancheDateChange(idx, newDate);
  };

  // Méthode de paiement (Orange Money ou MTN MoMo)
  const [localPaymentMethod, setLocalPaymentMethod] = useState(checkoutPaymentMethod || 'orange_money');
  const currentPaymentMethod = checkoutPaymentMethod || localPaymentMethod;
  const handleSelectPaymentMethod = (method) => {
    setLocalPaymentMethod(method);
    if (setCheckoutPaymentMethod) setCheckoutPaymentMethod(method);
  };

  // Frais de livraison (strictement à la charge du client)
  const DELIVERY_FEE_FCFA = 2500;
  const [includeDelivery, setIncludeDelivery] = useState(true);
  const [exactDeliveryAddress, setExactDeliveryAddress] = useState(checkoutForm?.exactAddress || '');
  const [selfPickupNotes, setSelfPickupNotes] = useState(checkoutForm?.pickupNotes || '');

  // Infos de livraison rapides
  const [localClientName, setLocalClientName] = useState(checkoutForm?.name || '');
  const [localClientPhone, setLocalClientPhone] = useState(checkoutForm?.phone || '');
  const [localClientCity, setLocalClientCity] = useState(checkoutForm?.city || countryConfig?.primaryCity || 'Douala');
  const [localClientCni, setLocalClientCni] = useState(checkoutForm?.cni || '');

  if (!isOpen || !activeProduct) return null;

  const basePrice = Number(activeProduct.price_fcfa || 0);
  const deliveryFee = includeDelivery ? DELIVERY_FEE_FCFA : 0;
  const totalPrice = basePrice + deliveryFee;
  const trancheAmt = Math.floor(totalPrice / currentTranchesCount);

  const handleSubmit = () => {
    if (!localClientName.trim()) {
      alert('Veuillez renseigner votre nom et prénom.');
      return;
    }
    if (!localClientPhone.trim()) {
      alert('Veuillez renseigner votre numéro WhatsApp / téléphone.');
      return;
    }
    if (includeDelivery && !exactDeliveryAddress.trim()) {
      alert('Veuillez préciser la destination exacte de livraison (quartier, rue, repère).');
      return;
    }
    if (!includeDelivery && !selfPickupNotes.trim()) {
      alert('Veuillez expliquer comment votre commande va vous parvenir (ex: retrait direct en agence, contact d\'un proche, agence de voyage, etc.).');
      return;
    }

    const updatedForm = {
      ...(checkoutForm || {}),
      name: localClientName || checkoutForm?.name || 'Client KTFA',
      phone: localClientPhone || checkoutForm?.phone || '',
      city: localClientCity || checkoutForm?.city || countryConfig?.primaryCity || 'Douala',
      cni: localClientCni || '',
      address: includeDelivery ? exactDeliveryAddress : 'Retrait personnel / Agence'
    };

    if (setCheckoutForm) setCheckoutForm(updatedForm);

    if (onConfirmOrder) {
      onConfirmOrder({
        product: activeProduct,
        plan: currentPlan,
        tranches: currentTranchesCount,
        dates: currentDates,
        paymentMethod: currentPaymentMethod,
        includeDelivery,
        deliveryFee,
        exactDeliveryAddress,
        selfPickupNotes,
        totalPrice,
        form: updatedForm
      });
    }
  };

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
            : 'bg-slate-950 border-emerald-500/50 text-white shadow-[0_30px_70px_rgba(0,0,0,0.95),inset_0_3px_6px_rgba(255,255,255,0.2)]'
        }`}
      >
        {/* LISERÉ DORÉ LUMINESCENT SUPÉRIEUR */}
        {isLight && (
          <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent pointer-events-none rounded-full" />
        )}

        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer z-10 ${
            isLight ? 'bg-white hover:bg-amber-50 border-amber-200 text-[#6C584C] shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
            isLight
              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
              : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
          }`}>
            Souscription & Paiement par Tranche
          </span>
          <h2 className={`text-base sm:text-lg font-black mt-1 line-clamp-1 ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
            {activeProduct.title}
          </h2>
          <div className={`text-xs mt-0.5 ${isLight ? 'text-[#78716C]' : 'text-slate-400'}`}>
            Prix total : <span className={`font-black ${isLight ? 'text-[#D97706]' : 'text-white'}`}>{totalPrice.toLocaleString()} FCFA</span>
            {includeDelivery ? (
              <span className="text-[10px] text-amber-600 font-bold ml-1">(dont {deliveryFee.toLocaleString()} F de livraison)</span>
            ) : (
              <span className="text-[10px] text-slate-500 font-bold ml-1">(sans frais de livraison)</span>
            )}
          </div>
        </div>

        {/* CHOIX ENTRE PAIEMENT PAR TRANCHE ET PAIEMENT COMPTANT */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleSelectPlan('tranches')}
            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              currentPlan === 'tranches'
                ? isLight
                  ? 'bg-gradient-to-b from-amber-50 to-[#FFF7ED] border-amber-400 text-amber-950 shadow-sm'
                  : 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.3)]'
                : isLight
                ? 'bg-white border-amber-200/70 text-[#6C584C] hover:bg-amber-50/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className={`text-xs font-black flex items-center gap-1 ${isLight ? 'text-[#D97706]' : 'text-emerald-500'}`}>
              <Percent className="w-3.5 h-3.5" />
              <span>Paiement par Tranche</span>
            </span>
            <span className={`text-[10px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>Sans caution ni frais</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPlan('cash')}
            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              currentPlan === 'cash'
                ? isLight
                  ? 'bg-gradient-to-b from-amber-50 to-[#FFF7ED] border-amber-400 text-amber-950 shadow-sm'
                  : 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.3)]'
                : isLight
                ? 'bg-white border-amber-200/70 text-[#6C584C] hover:bg-amber-50/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className={`text-xs font-black flex items-center gap-1 ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
              <Wallet className="w-3.5 h-3.5" />
              <span>Comptant (100%)</span>
            </span>
            <span className={`text-[10px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>Règlement intégral</span>
          </button>
        </div>

        {currentPlan === 'tranches' ? (
          <div className="space-y-4 mb-4">
            {/* 1. CHOIX DU NOMBRE DE TRANCHES */}
            <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white/95 border-amber-200/90 shadow-sm' : 'bg-slate-900/80 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold uppercase flex items-center gap-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                  <span>🔢</span> Nombre de Tranches :
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${isLight ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                  Défaut vendeur : {activeProduct.installment_tranches || activeProduct.installment_months || 4} tranches
                </span>
              </div>
              
              <div className="grid grid-cols-5 gap-1.5">
                {[2, 3, 4, 5, 6].map((num) => {
                  const isSelected = currentTranchesCount === num;
                  const isDefault = Number(activeProduct.installment_tranches || activeProduct.installment_months || 4) === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSelectCount(num)}
                      className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? isLight
                            ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white font-black shadow-md scale-[1.03]'
                            : 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 font-black shadow-md scale-[1.03]'
                          : isLight
                          ? 'bg-white border-2 border-amber-200/80 text-[#6C584C] hover:bg-amber-50'
                          : 'bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black">{num}x</span>
                      <span className="text-[8px] uppercase tracking-tighter opacity-80">
                        {isDefault ? 'Défaut' : 'tranches'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-xs ${isLight ? 'border-amber-200/70' : 'border-slate-800/80'}`}>
                <span className={isLight ? 'text-[#78716C]' : 'text-slate-400'}>Montant par tranche :</span>
                <span className={`font-black text-sm ${isLight ? 'text-[#D97706]' : 'text-emerald-500'}`}>
                  {trancheAmt.toLocaleString()} FCFA <span className={`text-[10px] font-bold ${isLight ? 'text-[#8C7D73]' : 'text-emerald-300/80'}`}>/ tranche</span>
                </span>
              </div>
            </div>

            {/* 2. CALENDRIER DES TRANCHES */}
            <div className={`p-3.5 rounded-2xl border space-y-2.5 ${isLight ? 'bg-white/95 border-amber-200/90 shadow-sm' : 'bg-slate-900/80 border-emerald-500/30'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-black uppercase flex items-center gap-1.5 ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                  <span>📅</span> Calendrier des Tranches
                </span>
                <span className={`text-[9px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
                  Définissez la date de chaque tranche
                </span>
              </div>
              <p className={`text-[10px] leading-tight ${isLight ? 'text-[#78716C]' : 'text-slate-400'}`}>
                Personnalisez vos échéances selon vos rentrées d'argent (salaires, tontine, etc.).
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentDates.slice(0, currentTranchesCount).map((dateVal, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === currentTranchesCount - 1;
                  const itemAmount = isLast
                    ? (totalPrice - (trancheAmt * (currentTranchesCount - 1)))
                    : trancheAmt;

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isFirst
                          ? isLight
                            ? 'bg-amber-50/80 border-amber-300'
                            : 'bg-emerald-950/30 border-emerald-500/50'
                          : isLight
                          ? 'bg-white border-amber-200/80'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 ${
                          isFirst
                            ? isLight
                              ? 'bg-[#D97706] text-white'
                              : 'bg-emerald-500 text-slate-950'
                            : isLight
                            ? 'bg-amber-100 text-[#4A3B32]'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className={`text-xs font-black flex items-center gap-1.5 ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                            <span>Tranche {idx + 1}/{currentTranchesCount}</span>
                            {isFirst && (
                              <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                                isLight ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-500/20 text-emerald-600'
                              }`}>
                                Acompte
                              </span>
                            )}
                            {isLast && (
                              <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 uppercase">
                                Solde
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] font-extrabold ${isLight ? 'text-[#D97706]' : 'text-emerald-500'}`}>
                            {itemAmount.toLocaleString()} FCFA
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className={`text-[10px] font-semibold hidden sm:inline ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>Date :</label>
                        <input
                          type="date"
                          value={dateVal || ''}
                          onChange={(e) => handleDateChange(idx, e.target.value)}
                          className={`border font-mono text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none transition-colors ${
                            isLight
                              ? 'bg-white border-amber-300 text-[#2C221D] focus:border-amber-500 shadow-sm'
                              : 'bg-slate-900 border-slate-700 hover:border-emerald-500 focus:border-emerald-400 text-white'
                          }`}
                          required
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* VUE PAIEMENT COMPTANT */
          <div className={`p-4 rounded-2xl border mb-4 text-center space-y-1 ${
            isLight ? 'bg-white/95 border-amber-200/90 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className={`text-xs uppercase font-bold ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>Montant Intégral à régler :</div>
            <div className={`text-2xl font-black ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
              {totalPrice.toLocaleString()} FCFA
            </div>
            <p className={`text-[10px] font-bold ${isLight ? 'text-[#D97706]' : 'text-emerald-500'}`}>
              ✓ Pas d'échéances ultérieures • Expédition express sous 24h
            </p>
          </div>
        )}

        {/* 3. MODALITÉS & FRAIS DE LIVRAISON (À LA CHARGE DU CLIENT) */}
        <div className={`rounded-2xl border p-3.5 mb-3.5 ${
          isLight ? 'bg-white/95 border-amber-200/90 shadow-sm' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-black uppercase flex items-center gap-1.5 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
              <Truck className="w-3.5 h-3.5 text-amber-500" />
              <span>Frais & Mode de Livraison</span>
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase">
              À la charge du client
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setIncludeDelivery(true)}
              className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                includeDelivery
                  ? isLight
                    ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-black shadow-xs'
                    : 'bg-emerald-600/30 border-emerald-500 text-white font-black'
                  : isLight
                  ? 'bg-white border-amber-200/80 text-[#6C584C] hover:bg-amber-50'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">🚚 Avec Livraison</span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-black">
                  +{DELIVERY_FEE_FCFA.toLocaleString()} F
                </span>
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                Livré à domicile / bureau
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIncludeDelivery(false)}
              className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                !includeDelivery
                  ? isLight
                    ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-black shadow-xs'
                    : 'bg-emerald-600/30 border-emerald-500 text-white font-black'
                  : isLight
                  ? 'bg-white border-amber-200/80 text-[#6C584C] hover:bg-amber-50'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">🏢 Sans Livraison</span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                  0 FCFA
                </span>
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                Retrait ou acheminement perso
              </span>
            </button>
          </div>

          {/* CHAMP DESTINATION EXACTE SI AVEC LIVRAISON */}
          {includeDelivery ? (
            <div className="space-y-1 animate-in fade-in">
              <label className={`block text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                📍 Destination exacte à livrer (obligatoire)
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Douala, Bonamoussadi, face Total, portail blanc"
                value={exactDeliveryAddress}
                onChange={(e) => setExactDeliveryAddress(e.target.value)}
                className={`w-full text-xs font-medium rounded-xl px-3 py-2 border outline-none transition-all ${
                  isLight
                    ? 'bg-amber-50/40 border-amber-300 text-[#2C221D] focus:border-amber-500 shadow-xs'
                    : 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500'
                }`}
              />
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Les frais de {DELIVERY_FEE_FCFA.toLocaleString()} FCFA sont automatiquement inclus dans le calcul total.
              </p>
            </div>
          ) : (
            /* CHAMP EXPLICATIONS D'ACHEMINEMENT SI SANS LIVRAISON */
            <div className="space-y-1 animate-in fade-in">
              <label className={`block text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                📦 Comment votre commande va-t-elle vous parvenir ? (obligatoire)
              </label>
              <textarea
                rows={2}
                required
                placeholder="Précisez : ex. Retrait direct en agence à Akwa/Bastos, envoi par une agence de voyage précise, ou contact d'un proche à Douala..."
                value={selfPickupNotes}
                onChange={(e) => setSelfPickupNotes(e.target.value)}
                className={`w-full text-xs font-medium rounded-xl px-3 py-2 border outline-none transition-all resize-none ${
                  isLight
                    ? 'bg-amber-50/40 border-amber-300 text-[#2C221D] focus:border-amber-500 shadow-xs'
                    : 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500'
                }`}
              />
              <p className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                ✓ Aucun frais de livraison facturé. L'équipe préparera votre colis pour votre retrait.
              </p>
            </div>
          )}
        </div>

        {/* 4. COORDONNÉES CLIENT */}
        <div className={`rounded-2xl border p-3.5 mb-3.5 ${
          isLight ? 'bg-white/95 border-amber-200/90 shadow-sm' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className={`text-[11px] font-bold uppercase mb-2 flex items-center gap-1.5 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
            <User className="w-3.5 h-3.5 text-amber-500" />
            <span>Coordonnées de Livraison & Enregistrement</span>
          </div>

          <div className="space-y-2">
            <div>
              <input
                type="text"
                placeholder="Votre Nom & Prénom"
                value={localClientName}
                onChange={(e) => setLocalClientName(e.target.value)}
                className={`w-full text-xs font-semibold rounded-xl px-3 py-2 border outline-none transition-all ${
                  isLight
                    ? 'bg-amber-50/40 border-amber-200 text-[#2C221D] focus:border-amber-400'
                    : 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500'
                }`}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="tel"
                  placeholder="WhatsApp / Téléphone"
                  value={localClientPhone}
                  onChange={(e) => setLocalClientPhone(e.target.value)}
                  className={`w-full text-xs font-semibold rounded-xl px-3 py-2 border outline-none transition-all ${
                    isLight
                      ? 'bg-amber-50/40 border-amber-200 text-[#2C221D] focus:border-amber-400'
                      : 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500'
                  }`}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Ville (ex: Douala)"
                  value={localClientCity}
                  onChange={(e) => setLocalClientCity(e.target.value)}
                  className={`w-full text-xs font-semibold rounded-xl px-3 py-2 border outline-none transition-all ${
                    isLight
                      ? 'bg-amber-50/40 border-amber-200 text-[#2C221D] focus:border-amber-400'
                      : 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {currentPlan === 'tranches' && (
              <div className="pt-2 border-t border-amber-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
                    Numéro CNI ou Pièce d'identité (Dossier échelonné)
                  </span>
                  <span className="text-[9px] text-emerald-600 font-extrabold">Optionnel</span>
                </div>
                <input
                  type="text"
                  placeholder="Ex: CNI N° 100293849 ou Passeport"
                  value={localClientCni}
                  onChange={(e) => setLocalClientCni(e.target.value)}
                  className={`w-full text-xs font-semibold rounded-xl px-3 py-2 border outline-none transition-all ${
                    isLight
                      ? 'bg-amber-50/40 border-amber-200 text-[#2C221D] focus:border-amber-400'
                      : 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500'
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        {/* 4. SÉLECTION MOBILE MONEY */}
        <div className={`rounded-2xl border p-3.5 mb-4 text-xs ${
          isLight ? 'bg-white/95 border-amber-200/90 shadow-sm' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className={`text-[11px] font-bold uppercase mb-2 flex items-center justify-between ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-amber-500" />
              <span>Règlement Mobile Money {countryConfig?.flag || '🇨🇲'}</span>
            </span>
            <span className="text-[9px] font-extrabold text-amber-600">Sécurisé 100%</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={() => handleSelectPaymentMethod('orange_money')}
              className={`py-2 px-2.5 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentPaymentMethod === 'orange_money'
                  ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                  : isLight
                  ? 'bg-white border-amber-200 text-[#6C584C] hover:bg-amber-50'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>🟠</span>
              <span>Orange Money</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPaymentMethod('mtn_momo')}
              className={`py-2 px-2.5 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentPaymentMethod === 'mtn_momo'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm font-extrabold'
                  : isLight
                  ? 'bg-white border-amber-200 text-[#6C584C] hover:bg-amber-50'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>🟡</span>
              <span>MTN MoMo</span>
            </button>
          </div>

          <div className={`p-2.5 rounded-xl border text-[10px] leading-snug ${
            isLight ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-slate-950/80 border-emerald-500/30 text-emerald-200'
          }`}>
            {countryConfig?.mobileMoneyHint || 'Effectuez le paiement vers le compte officiel KTFA FLEX. Votre reçu certifié sera délivré instantanément.'}
          </div>
        </div>

        {/* BOUTON CONFIRMATION */}
        <button
          onClick={handleSubmit}
          className={`w-full font-black py-3 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            isLight
              ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-[0_8px_20px_rgba(217,119,6,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)]'
              : 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 shadow-[0_8px_20px_rgba(16,185,129,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)]'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>
            {currentPlan === 'tranches'
              ? `Valider le Paiement en ${currentTranchesCount} Tranches & Mon Reçu`
              : 'Valider le Paiement Comptant & Mon Reçu'}
          </span>
        </button>
      </div>
    </div>
  );
}