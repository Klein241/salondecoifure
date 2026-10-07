import React, { useState } from 'react';
import { X, MessageCircle, SlidersHorizontal, CheckCircle2, Copy, Check } from 'lucide-react';
import { buildVideoWhatsAppMessage, formatWhatsAppUrl, logInquiry } from '../api/cloudflare';

/**
 * Modal pour personnaliser le brief avant envoi WhatsApp
 */
export function CustomBriefModal({ video, whatsappNumber, currency, onClose }) {
  const [clientBrand, setClientBrand] = useState('');
  const [clientNote, setClientNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!video) return null;

  const message = buildVideoWhatsAppMessage({
    video,
    currency,
    customNote: clientNote,
    clientBrand,
  });

  const handleSend = () => {
    logInquiry({
      service_type: 'video_brief',
      item_id: video.id,
      item_title: video.title,
      estimated_price_fcfa: video.price_fcfa,
      whatsapp_message: message,
    });
    const url = formatWhatsAppUrl(whatsappNumber, message);
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#111624] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Personnaliser mon Brief</h3>
              <p className="text-xs text-gray-400 truncate max-w-xs">{video.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Brand Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-1.5">
              Nom de votre entreprise / Marque
            </label>
            <input
              type="text"
              value={clientBrand}
              onChange={(e) => setClientBrand(e.target.value)}
              placeholder="Ex : Mon E-shop, Restaurant Paris, Agence XYZ..."
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Brief / Note */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-1.5">
              Précisions & consignes spécifiques
            </label>
            <textarea
              rows={4}
              value={clientNote}
              onChange={(e) => setClientNote(e.target.value)}
              placeholder="Ex : Je vends des produits cosmétiques, couleur verte et blanche pour la marque, accroche en français, musique énergique..."
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 resize-none transition-colors"
            />
          </div>

          {/* Preview of WhatsApp Message */}
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-[11px] font-bold text-emerald-400 uppercase mb-2 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              Aperçu du message WhatsApp :
            </p>
            <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-mono max-h-36 overflow-y-auto">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleCopy}
              className="btn-secondary flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier le message</span>
                </>
              )}
            </button>
            <button
              onClick={handleSend}
              className="btn-whatsapp flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Envoyer sur WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
