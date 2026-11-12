import React from 'react';
import { X, Download } from 'lucide-react';
import { printOrderReceipt } from './receiptPrinter';

export default function OrderReceiptModal({
  order,
  isLight,
  onClose,
  countryConfig = {},
  settings = {}
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className={`relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-[32px] border-2 p-5 sm:p-7 shadow-2xl scrollbar-none transition-all ${
        isLight
          ? 'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF5EE] border-amber-300 text-[#2C221D] shadow-[0_30px_80px_rgba(200,150,110,0.25)]'
          : 'bg-slate-950 border-emerald-500/50 text-white shadow-[0_30px_70px_rgba(0,0,0,0.95),inset_0_3px_6px_rgba(255,255,255,0.2)]'
      }`}>
        {/* LISERÉ DORÉ LUMINESCENT SUPÉRIEUR */}
        {isLight && (
          <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent pointer-events-none rounded-full" />
        )}

        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
            isLight ? 'bg-white hover:bg-amber-50 border-amber-200 text-[#6C584C] shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* EN-TÊTE DU REÇU OFFICIEL */}
        <div className={`border-b pb-4 mb-4 ${isLight ? 'border-amber-200/80' : 'border-emerald-500/30'}`}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-amber-300/80 shadow-sm shrink-0 bg-slate-900">
                  <img src="/logos/ktfa_official_logo.jpg" alt="KTFA" className="w-full h-full object-cover" />
                </div>
                <span className={`text-lg font-black ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>KTFA FLEX</span>
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#D97706]' : 'text-emerald-400'}`}>
                Reçu Officiel d'Encaissement & Échéancier
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-black border px-2.5 py-0.5 rounded-full inline-block ${
                isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {order.receiptNumber}
              </span>
              <div className={`text-[10px] mt-1 ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>Date : {order.orderDate}</div>
            </div>
          </div>
        </div>

        {/* APERÇU PRODUIT */}
        <div className={`flex gap-3 rounded-2xl p-3 mb-4 items-center border ${
          isLight ? 'bg-white/95 border-amber-200/80 shadow-sm' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <img
            src={order.image_url}
            alt={order.title}
            className={`w-16 h-16 rounded-xl object-cover border ${isLight ? 'border-amber-200' : 'border-emerald-500/30'}`}
          />
          <div className="flex-1">
            <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-[#D97706]' : 'text-emerald-400'}`}>{order.category}</span>
            <h3 className={`text-xs sm:text-sm font-black ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>{order.title}</h3>
            <div className={`text-[11px] font-semibold mt-0.5 ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
              Statut : <span className={`font-bold ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>{order.statusLabel}</span>
            </div>
          </div>
        </div>

        {/* DÉCOMPTE FINANCIER & ÉCHÉANCES */}
        <div className={`rounded-2xl p-4 mb-4 space-y-2 text-xs border ${
          isLight ? 'bg-[#FAF6F0]/90 border-amber-200/80' : 'bg-slate-900/50 border-slate-800/80'
        }`}>
          <div className={`flex justify-between ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
            <span>Prix Total Commande :</span>
            <strong className={isLight ? 'text-[#2C221D]' : 'text-white'}>{Number(order.totalPrice || 0).toLocaleString('fr-FR')} FCFA</strong>
          </div>
          {Number(order.deliveryFee || 0) > 0 && (
            <div className={`flex justify-between text-[11px] ${isLight ? 'text-[#B45309]' : 'text-amber-400'}`}>
              <span>Frais de livraison inclus :</span>
              <span>+{Number(order.deliveryFee || 0).toLocaleString('fr-FR')} FCFA</span>
            </div>
          )}
          <div className={`flex justify-between font-bold ${isLight ? 'text-[#D97706]' : 'text-emerald-400'}`}>
            <span>Montant acompte / versé :</span>
            <span>{Number(order.paidAmount || 0).toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex justify-between text-rose-500 font-bold">
            <span>Reste à solder :</span>
            <span>{Math.max(0, Number(order.totalPrice || 0) - Number(order.paidAmount || 0)).toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className={`flex justify-between pt-1 border-t text-[11px] ${isLight ? 'border-amber-200/70 text-[#8C7D73]' : 'border-slate-800 text-slate-400'}`}>
            <span>Mode de paiement :</span>
            <span className={isLight ? 'text-[#2C221D]' : 'text-slate-200'}>{order.paymentMethod || order.paymentMode || 'Mobile Money'}</span>
          </div>
          <div className={`flex justify-between text-[11px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
            <span>Bénéficiaire :</span>
            <span className={isLight ? 'text-[#2C221D]' : 'text-slate-200'}>{order.client?.name || order.recipientName || 'Client'} ({order.client?.phone || order.recipientPhone || ''})</span>
          </div>
          <div className={`flex justify-between text-[11px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
            <span>Mode de réception :</span>
            <span className={`font-semibold ${isLight ? 'text-[#D97706]' : 'text-emerald-300'}`}>
              {order.includeDelivery
                ? `Livraison : ${order.deliveryAddress || order.client?.address || 'Adresse client'}`
                : `Retrait : ${order.pickupNotes || 'Acheminement personnel'}`}
            </span>
          </div>
        </div>

        {/* TABLEAU DES TRANCHES SI ÉCHELONNÉ */}
        {order.installments && order.installments.length > 0 && (
          <div className="mb-4">
            <div className={`text-[11px] font-bold uppercase mb-2 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>Historique des Échéances :</div>
            <div className="space-y-1.5">
              {order.installments.map((inst, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded-xl text-[11px] border ${
                    isLight ? 'bg-white border-amber-200' : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div>
                    <div className={`font-bold ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>{inst.tranche}</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>Date: {inst.date} • Réf: {inst.ref}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${isLight ? 'text-[#D97706]' : 'text-emerald-400'}`}>{Number(inst.amount || 0).toLocaleString('fr-FR')} FCFA</div>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                      inst.status === 'Payé'
                        ? (isLight ? 'bg-amber-100 text-amber-900' : 'bg-emerald-500/20 text-emerald-300')
                        : 'bg-amber-500/20 text-amber-700'
                    }`}>
                      {inst.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOUTON TÉLÉCHARGER LE REÇU OFFICIEL */}
        <button
          onClick={() => printOrderReceipt(order, countryConfig, settings)}
          className={`w-full font-black py-3 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            isLight
              ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-[0_8px_20px_rgba(217,119,6,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)]'
              : 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 shadow-[0_8px_20px_rgba(16,185,129,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)]'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Télécharger le Reçu Officiel (PDF / Imprimable)</span>
        </button>
      </div>
    </div>
  );
}
