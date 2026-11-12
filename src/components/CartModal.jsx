import React, { useState } from 'react';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  User,
  FileText,
} from 'lucide-react';
import { formatWhatsAppUrl, buildCartWhatsAppMessage, logInquiry } from '../api/cloudflare';

export function CartModal({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currency = 'XAF',
  whatsappNumber,
  settings = {},
}) {
  const [clientName, setClientName] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  if (!isOpen) return null;

  const totalItemsCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  let totalFcfa = 0;
  let totalEur = 0;
  cartItems.forEach((item) => {
    const qty = item.quantity || 1;
    const itemPriceFcfa = (Number(item.price_fcfa) || 0) * qty;
    const itemPriceEur = (Number(item.price_eur) || Math.round(itemPriceFcfa / 655)) * qty;
    totalFcfa += itemPriceFcfa;
    totalEur += itemPriceEur;
  });

  const totalFormatted =
    currency === 'EUR' ? `${totalEur} €` : `${totalFcfa.toLocaleString('fr-FR')} FCFA`;

  const companyName = settings.company_name || 'Notre Entreprise';

  const handleCheckoutWhatsApp = () => {
    if (cartItems.length === 0) return;
    const cleanPhone = String(whatsappNumber || '').replace(/\D/g, '');
    const message = buildCartWhatsAppMessage({
      cartItems,
      currency,
      siteUrl: window.location.origin,
      clientInfo: {
        name: clientName.trim(),
        city: clientCity.trim(),
        notes: clientNotes.trim(),
      },
      companyName,
    });

    logInquiry({
      type: 'cart_order',
      client_name: clientName,
      details: JSON.stringify({
        itemsCount: totalItemsCount,
        totalFcfa,
        totalEur,
        items: cartItems.map((i) => ({ title: i.title, qty: i.quantity, price: i.price_fcfa })),
      }),
    });

    const url = formatWhatsAppUrl(cleanPhone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-secondary, #0c101a)',
          color: 'var(--text-main, #f8fafc)',
        }}
      >
        {/* En-tête Modale */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">Mon Panier</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-black">
                  {totalItemsCount} article{totalItemsCount > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Commande groupée directement sur WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du Panier (Scrollable) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/5 text-slate-500 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8 opacity-40" />
              </div>
              <h4 className="font-bold text-white text-base">Votre panier est vide</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Parcourez nos réalisations et produits, puis cliquez sur "Ajouter au Panier" pour cumuler votre commande.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors cursor-pointer"
              >
                Explorer le Catalogue
              </button>
            </div>
          ) : (
            <>
              {/* Liste des articles ajoutés */}
              <div className="space-y-2.5">
                {cartItems.map((item) => {
                  const qty = item.quantity || 1;
                  const itemPriceFcfa = (Number(item.price_fcfa) || 0) * qty;
                  const itemPriceEur = (Number(item.price_eur) || Math.round(itemPriceFcfa / 655)) * qty;
                  const linePriceStr =
                    currency === 'EUR' ? `${itemPriceEur} €` : `${itemPriceFcfa.toLocaleString('fr-FR')} FCFA`;

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl border border-white/5 bg-black/40 flex items-center gap-3 transition-colors"
                    >
                      {/* Miniature Image / Vidéo */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0">
                        {item.thumbnail_url || item.image_url ? (
                          <img
                            src={item.thumbnail_url || item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Infos article */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                          {item.title}
                        </h4>
                        <div className="text-xs font-black text-amber-400 mt-0.5">
                          {linePriceStr}
                        </div>
                      </div>

                      {/* Sélecteur de Quantité */}
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Diminuer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white font-mono">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Augmenter"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Bouton Supprimer */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Retirer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Formulaire Express Coordonnées (Optionnel) */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Informations de Livraison (Optionnel) :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Votre nom / prénom"
                      className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      placeholder="Ville / Quartier"
                      className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Instructions, date souhaitée ou précisions..."
                    className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pied de Modale (Total & Bouton WhatsApp) */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total de la commande :</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Prix direct producteur
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-amber-400">
                  {totalFormatted}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClearCart}
                className="px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400 text-xs font-semibold transition-colors cursor-pointer"
                title="Vider le panier"
              >
                Vider
              </button>

              <button
                type="button"
                onClick={handleCheckoutWhatsApp}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span>
                  Commander sur WhatsApp ({totalItemsCount} article{totalItemsCount > 1 ? 's' : ''})
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
