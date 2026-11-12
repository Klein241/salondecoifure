import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Pin,
  ShoppingBag,
  Percent,
  Send,
  Smile
} from 'lucide-react';

export default function SellerChatModal({
  isOpen,
  onClose,
  isLight,
  settings,
  officialWhatsapp,
  sellerChatProduct,
  sellerChatMessages = [],
  handleSendCustomerTextMessage,
  handleSendProductInChat,
  handleStartCheckout,
  addToCart,
  playAlibabaChime,
  catalogItems = []
}) {
  const [isChatCatalogDrawerOpen, setIsChatCatalogDrawerOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatInputText, setChatInputText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg h-[90vh] flex flex-col rounded-[32px] border-2 shadow-2xl overflow-hidden transition-all ${
        isLight
          ? 'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF5EE] border-amber-300 text-[#2C221D] shadow-[0_30px_80px_rgba(200,150,110,0.25)]'
          : 'bg-slate-950 border-blue-500/40 text-white shadow-[0_30px_80px_rgba(0,0,0,0.95)]'
      }`}>
        
        {/* LISERÉ DORÉ LUMINESCENT SUPÉRIEUR */}
        {isLight && (
          <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent pointer-events-none rounded-full" />
        )}

        {/* 1. HEADER DU CHAT VENDEUR */}
        <div className={`p-3.5 sm:p-4 border-b flex items-center justify-between gap-3 shrink-0 ${
          isLight ? 'bg-white/95 border-amber-200/80' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full p-0.5 shadow-md ${
                isLight
                  ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B]'
                  : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500'
              }`}>
                <div className={`w-full h-full rounded-full flex items-center justify-center font-black text-xs ${isLight ? 'bg-[#FFFDF9] text-[#2C221D]' : 'bg-slate-900 text-white'}`}>
                  🏪
                </div>
              </div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                isLight ? 'bg-amber-500 border-white' : 'bg-emerald-500 border-slate-900'
              } animate-pulse`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-xs sm:text-sm font-black ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                  Conseiller Vendeur Officiel
                </h3>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                  isLight
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                }`}>
                  Vérifié ✓
                </span>
              </div>
              <p className={`text-[10px] flex items-center gap-1 font-medium ${isLight ? 'text-[#78716C]' : 'text-slate-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                {settings?.company_name || 'KTFA FLEX'} • Répond en direct ⚡
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`https://wa.me/${officialWhatsapp}?text=${encodeURIComponent(
                sellerChatProduct
                  ? `Bonjour, je discute avec vous concernant le produit "${sellerChatProduct.title}" (${sellerChatProduct.price_fcfa} FCFA). Pouvez-vous m'en dire plus sur l'échelonnement 4x ?`
                  : `Bonjour, je souhaite discuter avec un conseiller ${settings?.company_name || 'KTFA FLEX'}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-xl transition-colors ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500'
              }`}
              title="Bascule directe sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-amber-50 border border-amber-200 text-[#6C584C] shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. BANNIÈRE PRODUIT ÉPINGLÉ AU-DESSUS DU CHAT */}
        {sellerChatProduct && (
          <div className={`p-2.5 border-b shrink-0 flex items-center justify-between gap-2.5 ${
            isLight ? 'bg-amber-50/70 border-amber-200/80' : 'bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-blue-500/30'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-12 h-12 rounded-xl overflow-hidden border shrink-0 ${isLight ? 'bg-white border-amber-200' : 'bg-slate-800 border-slate-700'}`}>
                <img
                  src={sellerChatProduct.image_url}
                  alt={sellerChatProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className={`flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide ${
                  isLight ? 'text-[#D97706]' : 'text-blue-500'
                }`}>
                  <Pin className="w-3 h-3 shrink-0" />
                  <span>Produit Épinglé</span>
                </div>
                <h4 className={`text-xs font-bold truncate max-w-[180px] sm:max-w-xs ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                  {sellerChatProduct.title}
                </h4>
                <div className={`text-[10px] font-black ${isLight ? 'text-[#D97706]' : 'text-emerald-600'}`}>
                  {sellerChatProduct.installment_tranches || 4}x {Number(sellerChatProduct.monthly_fcfa || Math.round((Number(sellerChatProduct.price_fcfa) || 0) / (sellerChatProduct.installment_tranches || 4))).toLocaleString('fr-FR')} F / tranche
                  <span className={`font-normal ml-1 ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>({Number(sellerChatProduct.price_fcfa || 0).toLocaleString('fr-FR')} FCFA)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => {
                  handleStartCheckout(sellerChatProduct);
                }}
                className={`font-black text-[10px] px-2.5 py-1.5 rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer ${
                  isLight
                    ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white shadow-sm'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950'
                }`}
              >
                Commander {sellerChatProduct.installment_tranches || 4}x
              </button>
              <button
                onClick={() => handleSendProductInChat(sellerChatProduct)}
                className={`text-[9px] underline font-medium text-center cursor-pointer ${isLight ? 'text-amber-700 hover:text-amber-900' : 'text-blue-300 hover:text-white'}`}
              >
                Insérer fiche
              </button>
            </div>
          </div>
        )}

        {/* 3. DISCUSSION MESSAGES */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin ${isLight ? 'bg-[#FAF6F0]/80' : 'bg-slate-950/50'}`}>
          {/* Chips de démarrage rapide */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              '📦 Délais de livraison ?',
              '📋 Pièces pour payer par tranche ?',
              '💰 Premier acompte ?',
              '🛡️ Garantie et facture ?'
            ].map((quickText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendCustomerTextMessage(quickText)}
                className={`shrink-0 text-[10px] border px-2.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-amber-50 border-amber-200 text-[#4A3B32] shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-blue-400 text-slate-300 hover:text-white'
                }`}
              >
                {quickText}
              </button>
            ))}
          </div>

          {sellerChatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'client' ? 'items-end' : 'items-start'}`}
            >
              {msg.productCard ? (
                <div className={`max-w-[280px] sm:max-w-xs rounded-2xl border-2 p-3 shadow-lg mb-1 animate-in zoom-in-95 duration-200 ${
                  isLight ? 'bg-white border-amber-300 shadow-md' : 'bg-slate-900 border-emerald-500/40 shadow-lg'
                }`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      isLight ? 'text-amber-900 bg-amber-100 border border-amber-200' : 'text-amber-500 bg-amber-500/10'
                    }`}>
                      Fiche Article Partagée
                    </span>
                    <span className={`text-[10px] ml-auto ${isLight ? 'text-[#8C7D73]' : 'text-slate-500'}`}>{msg.time}</span>
                  </div>
                  <div className={`w-full h-28 rounded-xl overflow-hidden mb-2 border ${isLight ? 'bg-[#FAF6F0] border-amber-200' : 'bg-slate-800 border-slate-700'}`}>
                    <img
                      src={msg.productCard.image_url}
                      alt={msg.productCard.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className={`text-xs font-bold mb-1 leading-snug line-clamp-2 ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                    {msg.productCard.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs font-black mb-2.5">
                    <span className={`font-extrabold ${isLight ? 'text-[#D97706]' : 'text-emerald-500'}`}>
                      {msg.productCard.installment_tranches || 4}x {Number(msg.productCard.monthly_fcfa || Math.round((Number(msg.productCard.price_fcfa) || 0) / (msg.productCard.installment_tranches || 4))).toLocaleString('fr-FR')} F / tranche
                    </span>
                    <span className={`font-medium text-[11px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
                      {Number(msg.productCard.price_fcfa || 0).toLocaleString('fr-FR')} F
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(msg.productCard);
                        playAlibabaChime && playAlibabaChime();
                      }}
                      className={`font-bold py-1.5 px-2 rounded-xl text-[10px] flex items-center justify-center gap-1 border active:scale-95 cursor-pointer ${
                        isLight
                          ? 'bg-amber-50 hover:bg-amber-100 text-[#4A3B32] border-amber-200'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                      }`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Panier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleStartCheckout(msg.productCard);
                      }}
                      className={`font-black py-1.5 px-2 rounded-xl text-[10px] flex items-center justify-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer ${
                        isLight
                          ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950'
                      }`}
                    >
                      <Percent className="w-3 h-3" />
                      <span>Souscrire</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[85%] sm:max-w-sm rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-md ${
                    msg.sender === 'client'
                      ? isLight
                        ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white rounded-tr-none shadow-sm'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                      : isLight
                      ? 'bg-white border-2 border-amber-200 text-[#2C221D] rounded-tl-none shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      msg.sender === 'client' ? (isLight ? 'text-amber-100' : 'text-emerald-200/80') : (isLight ? 'text-[#8C7D73]' : 'text-slate-500')
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 4. TIROIR CATALOGUE DU VENDEUR (ALIBABA STYLE) */}
        {isChatCatalogDrawerOpen && (
          <div className={`border-t-2 p-3 max-h-56 overflow-y-auto animate-in slide-in-from-bottom duration-200 ${
            isLight ? 'bg-white border-amber-200' : 'bg-slate-900/95 border-emerald-500/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-black uppercase flex items-center gap-1.5 ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
                <span>🛍️</span> Catalogue du Vendeur (Cliquez pour envoyer)
              </span>
              <button
                type="button"
                onClick={() => setIsChatCatalogDrawerOpen(false)}
                className={`p-1 rounded-lg cursor-pointer ${isLight ? 'text-[#6C584C] hover:text-[#2C221D]' : 'text-slate-400 hover:text-white'}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {catalogItems.map((prod) => (
                <div
                  key={prod.id}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                    isLight ? 'bg-[#FAF6F0] border-amber-200/80 hover:border-amber-400' : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border ${isLight ? 'bg-white border-amber-200' : 'bg-slate-800 border-slate-700'}`}>
                      <img src={prod.image_url} alt={prod.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h5 className={`text-[11px] font-bold truncate max-w-[130px] ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>{prod.title}</h5>
                      <div className={`text-[10px] font-bold ${isLight ? 'text-[#D97706]' : 'text-emerald-500'}`}>
                        {prod.installment_tranches || 4}x {Number(prod.monthly_fcfa || Math.round((Number(prod.price_fcfa) || 0) / (prod.installment_tranches || 4))).toLocaleString('fr-FR')} F / tranche
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleSendProductInChat(prod);
                      setIsChatCatalogDrawerOpen(false);
                    }}
                    className={`font-black text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 shadow cursor-pointer active:scale-95 ${
                      isLight
                        ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    <Send className="w-3 h-3" />
                    <span>Envoyer</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. SELECTEUR D'EMOJIS */}
        {showEmojiPicker && (
          <div className={`border-t px-3 py-2 flex items-center gap-2 overflow-x-auto ${isLight ? 'bg-white border-amber-200' : 'bg-slate-900 border-slate-800'}`}>
            {['👋', '🔥', '👍', '📦', '❤️', '⚡', '💳', '🇨🇲', '🇬🇦', '🤝'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setChatInputText(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* 6. BARRE D'ENVOI DU CHAT */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (chatInputText.trim()) {
              handleSendCustomerTextMessage(chatInputText);
              setChatInputText('');
            }
          }}
          className={`p-2 sm:p-3 border-t flex items-center gap-1.5 sm:gap-2 shrink-0 w-full max-w-full overflow-hidden box-border ${
            isLight ? 'bg-white border-amber-200/80' : 'bg-slate-900/95 border-slate-800'
          }`}
        >
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl transition-colors cursor-pointer flex items-center justify-center ${
              showEmojiPicker
                ? 'bg-amber-500/20 text-amber-500'
                : isLight ? 'bg-amber-50 text-[#6C584C] hover:text-[#2C221D] border border-amber-200' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Insérer un Emoji"
          >
            <Smile className="w-4 h-4 shrink-0" />
          </button>

          {/* BOUTON CATALOGUE VENDEUR (ALIBABA STYLE) */}
          <button
            type="button"
            onClick={() => setIsChatCatalogDrawerOpen(!isChatCatalogDrawerOpen)}
            className={`h-9 sm:h-10 px-2 sm:px-2.5 shrink-0 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-sm cursor-pointer ${
              isChatCatalogDrawerOpen
                ? isLight
                  ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white font-black'
                  : 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_#10b981]'
                : isLight
                ? 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
                : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
            }`}
            title="Ouvrir le catalogue vendeur pour envoyer un produit"
          >
            <ShoppingBag className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-700' : 'text-emerald-500'}`} />
            <span className="hidden md:inline text-[11px]">Catalogue</span>
          </button>

          <input
            type="text"
            value={chatInputText}
            onChange={(e) => setChatInputText(e.target.value)}
            placeholder="Écrivez au vendeur..."
            className={`min-w-0 flex-1 w-full rounded-xl px-2.5 sm:px-3 h-9 sm:h-10 text-xs focus:outline-none ${
              isLight
                ? 'bg-[#FAF6F0] border border-amber-200 text-[#2C221D] placeholder-[#A89F91] focus:border-amber-400'
                : 'bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-blue-500'
            }`}
          />

          <button
            type="submit"
            disabled={!chatInputText.trim()}
            className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center disabled:opacity-40 ${
              isLight
                ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white'
            }`}
            title="Envoyer le message"
          >
            <Send className="w-4 h-4 shrink-0" />
          </button>
        </form>

      </div>
    </div>
  );
}
