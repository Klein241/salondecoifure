import React from 'react';
import { X, ShoppingBag, Plus, Minus, MessageCircle, Trash2 } from 'lucide-react';

export default function CartDrawerModal({
  isOpen,
  onClose,
  cart,
  cartItems,
  isLight,
  onUpdateQuantity,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onSendCartWhatsApp,
  officialWhatsapp = '237694473414'
}) {
  if (!isOpen) return null;

  const activeCart = Array.isArray(cart) && cart.length > 0
    ? cart
    : (Array.isArray(cartItems) ? cartItems : []);

  const handleQty = onUpdateQuantity || onUpdateQty;

  const cartCount = activeCart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartTotal = activeCart.reduce((acc, item) => acc + (item.price_fcfa || 0) * (item.quantity || 1), 0);

  const handleWhatsAppCheckout = () => {
    if (onSendCartWhatsApp) {
      onSendCartWhatsApp();
      return;
    }

    if (activeCart.length === 0) return;

    let msg = `🛒 *COMMANDE PANIER KTFA FLEX*\n\n`;
    activeCart.forEach((item, idx) => {
      const lineTotal = Number(item.price_fcfa || 0) * (item.quantity || 1);
      msg += `${idx + 1}. *${item.title}* x${item.quantity || 1} — ${lineTotal.toLocaleString('fr-FR')} FCFA\n`;
    });
    msg += `\n💰 *Total Comptant :* ${Number(cartTotal || 0).toLocaleString('fr-FR')} FCFA\n`;
    msg += `💳 *Option 4 Tranches :* ${Math.round((Number(cartTotal) || 0) / 4).toLocaleString('fr-FR')} FCFA / tranche\n\n`;
    msg += `Je souhaite valider ma commande avec le service client officiel.`;

    const cleanNumber = String(officialWhatsapp).replace(/[^\d]/g, '') || '237694473414';
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
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
            : 'bg-slate-950 border-emerald-500/50 text-white shadow-[0_30px_70px_rgba(0,0,0,0.95)]'
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

        <div className="flex items-center justify-between mb-4 pr-8">
          <div className="flex items-center gap-2">
            <ShoppingBag className={`w-5 h-5 ${isLight ? 'text-[#D97706]' : 'text-emerald-500'}`} />
            <h2 className={`text-base sm:text-lg font-black ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>Mon Panier KTFA FLEX</h2>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            isLight ? 'bg-amber-100 border-amber-200 text-amber-900' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          }`}>
            {cartCount} article{cartCount > 1 ? 's' : ''}
          </span>
        </div>

        {activeCart.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag className={`w-12 h-12 mx-auto mb-2 ${isLight ? 'text-amber-200' : 'text-slate-700'}`} />
            <p className={`text-xs ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>Votre panier est actuellement vide.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCart.map(item => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 gap-3 ${
                  isLight ? 'bg-white border-amber-200/80 shadow-sm' : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-amber-200/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold truncate ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>{item.title}</h4>
                  <div className={`text-[11px] font-black ${isLight ? 'text-[#D97706]' : 'text-emerald-400'}`}>
                    {Number(item.price_fcfa).toLocaleString()} FCFA
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleQty && handleQty(item.id, -1)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      isLight ? 'bg-amber-50 hover:bg-amber-100 text-[#4A3B32] border border-amber-200' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className={`text-xs font-bold w-4 text-center ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>{item.quantity || 1}</span>
                  <button
                    onClick={() => handleQty && handleQty(item.id, 1)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      isLight ? 'bg-amber-50 hover:bg-amber-100 text-[#4A3B32] border border-amber-200' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            <div className={`pt-3 border-t ${isLight ? 'border-amber-200/70' : 'border-slate-800'}`}>
              <div className={`flex justify-between text-xs mb-1 ${isLight ? 'text-[#78716C]' : 'text-slate-400'}`}>
                <span>Sous-total comptant :</span>
                <span className={`font-bold ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>{Number(cartTotal || 0).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className={`flex justify-between text-xs font-bold mb-4 ${isLight ? 'text-[#D97706]' : 'text-emerald-400'}`}>
                <span>Option échelonnée (4 tranches) :</span>
                <span>{Math.round((Number(cartTotal) || 0) / 4).toLocaleString('fr-FR')} FCFA / tranche</span>
              </div>

              <button
                onClick={handleWhatsAppCheckout}
                className={`w-full font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                  isLight
                    ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-[0_8px_20px_rgba(217,119,6,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)]'
                    : 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 shadow-lg'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Finaliser ma Commande sur WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}