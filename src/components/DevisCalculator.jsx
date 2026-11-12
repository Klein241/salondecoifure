import React, { useState } from 'react';
import {
  Calculator,
  Sparkles,
  Zap,
  CheckCircle2,
  MessageCircle,
  Clock,
  Mic,
  FileText,
  Sliders,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  formatWhatsAppUrl,
  buildDevisWhatsAppMessage,
  logInquiry,
} from '../api/cloudflare';

export function DevisCalculator({
  currency,
  whatsappNumber,
  isOpenModal = false,
  onClose = null,
  settings = {},
}) {
  const [serviceType, setServiceType] = useState('tiktok_916');
  const [duration, setDuration] = useState('30s');
  const [selectedOptions, setSelectedOptions] = useState([
    'scripting',
    'subtitles',
  ]);
  const [clientBrand, setClientBrand] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Prestations de base
  const services = {
    tiktok_916: {
      name: 'Vidéo TikTok & Reels (9:16 Vertical)',
      basePriceFcfa: 25000,
      basePriceEur: 39,
      format: '9:16 Vertical HD',
    },
    spot_169: {
      name: 'Spot Publicitaire Cinéma (16:9 4K)',
      basePriceFcfa: 55000,
      basePriceEur: 85,
      format: '16:9 4K Ultra HD',
    },
    motion_3d: {
      name: 'Motion Design 2D/3D & Animation Produit',
      basePriceFcfa: 45000,
      basePriceEur: 69,
      format: '16:9 ou 9:16 au choix',
    },
    poster: {
      name: 'Affiche Publicitaire & Graphisme',
      basePriceFcfa: 15000,
      basePriceEur: 25,
      format: 'A3/A2 Print + Post Réseaux',
    },
    pack_mix: {
      name: 'Pack Mixte (Vidéo + 2 Affiches)',
      basePriceFcfa: 60000,
      basePriceEur: 95,
      format: 'Multiformat complet',
    },
  };

  // Options additionnelles
  const availableOptions = [
    {
      id: 'scripting',
      name: 'Script & Copywriting persuasif',
      priceFcfa: 5000,
      priceEur: 8,
      includedDefault: true,
    },
    {
      id: 'subtitles',
      name: 'Sous-titres animés captivants (Karaoké style)',
      priceFcfa: 5000,
      priceEur: 8,
      includedDefault: true,
    },
    {
      id: 'voiceover_pro',
      name: 'Voix-off Studio Professionnelle (Humaine)',
      priceFcfa: 10000,
      priceEur: 15,
    },
    {
      id: 'express_24h',
      name: 'Livraison Ultra-Express en 24h garantie',
      priceFcfa: 15000,
      priceEur: 20,
    },
    {
      id: 'multi_format',
      name: 'Déclinaison en 2 formats (16:9 + 9:16)',
      priceFcfa: 10000,
      priceEur: 15,
    },
  ];

  const toggleOption = (optId) => {
    if (selectedOptions.includes(optId)) {
      setSelectedOptions(selectedOptions.filter((id) => id !== optId));
    } else {
      setSelectedOptions([...selectedOptions, optId]);
    }
  };

  // Calcul du prix
  const currentService = services[serviceType] || services.tiktok_916;
  let totalPriceFcfa = currentService.basePriceFcfa;
  let totalPriceEur = currentService.basePriceEur;

  // Calcul durée supplémentaire
  if (duration === '60s') {
    totalPriceFcfa += 10000;
    totalPriceEur += 15;
  }

  // Calcul des options
  selectedOptions.forEach((optId) => {
    const opt = availableOptions.find((o) => o.id === optId);
    if (opt) {
      totalPriceFcfa += opt.priceFcfa;
      totalPriceEur += opt.priceEur;
    }
  });

  const handleSendDevis = () => {
    const chosenOptionsLabels = selectedOptions.map((optId) => {
      const opt = availableOptions.find((o) => o.id === optId);
      return opt ? opt.name : optId;
    });

    const message = buildDevisWhatsAppMessage({
      serviceType: currentService.name,
      format: currentService.format,
      duration: serviceType !== 'poster' ? duration : 'Format Visuel Unique',
      options: chosenOptionsLabels,
      totalPriceFcfa,
      totalPriceEur,
      currency,
      clientBrand,
      clientPhone,
      companyName: settings.company_name || 'Notre Entreprise',
    });

    logInquiry({
      service_type: 'devis',
      item_title: currentService.name,
      details: `Options: ${chosenOptionsLabels.join(', ')}`,
      estimated_price_fcfa: totalPriceFcfa,
      whatsapp_message: message,
    });

    const url = formatWhatsAppUrl(whatsappNumber, message);
    window.open(url, '_blank');
  };

  const content = (
    <div 
      className="p-6 sm:p-8 md:p-10 border rounded-2xl max-w-4xl mx-auto shadow-2xl transition-colors"
      style={{
        backgroundColor: 'var(--bg-card, #101420)',
        borderColor: 'var(--border-subtle, rgba(255,255,255,0.1))',
        color: 'var(--text-main, #f8fafc)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
            <Calculator className="w-4 h-4" />
            <span>{settings.devis_badge || 'Estimation Instantanée en Direct'}</span>
          </div>
          <h3 
            className="text-2xl sm:text-3xl font-extrabold"
            style={{ color: 'var(--text-title, #ffffff)' }}
          >
            {settings.devis_title || 'Simulateur de Devis Express'}
          </h3>
          <p 
            className="text-xs sm:text-sm mt-1"
            style={{ color: 'var(--text-muted, #94a3b8)' }}
          >
            {settings.devis_subtitle ||
              'Configurez votre besoin sur-mesure et transmettez votre devis directement sur WhatsApp en 1 clic.'}
          </p>
        </div>

        {isOpenModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Configuration Steps */}
        <div className="md:col-span-7 space-y-6">
          {/* 1. Choix du service */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-2">
              1. Type de support principal :
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(services).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setServiceType(key)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer ${
                    serviceType === key
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-amber-400 font-bold">
                    {currency === 'EUR' ? `${item.basePriceEur} €` : `${item.basePriceFcfa.toLocaleString()} F`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Durée (pour les vidéos) */}
          {serviceType !== 'poster' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-2">
                2. Durée souhaitée :
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['15s - 25s', '30s - 45s', '60s (+10 000 F)'].map((d, idx) => {
                  const val = ['20s', '30s', '60s'][idx];
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(val)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        duration === val
                          ? 'border-amber-500 bg-amber-500 text-black'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Options additionnelles */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-2">
              3. Options & Services Spéciaux :
            </label>
            <div className="space-y-2">
              {availableOptions.map((opt) => {
                const isChecked = selectedOptions.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs sm:text-sm cursor-pointer ${
                      isChecked
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-black'
                            : 'border-gray-500'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                      </div>
                      <span className="font-medium">{opt.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-300">
                      +{currency === 'EUR' ? `${opt.priceEur} €` : `${opt.priceFcfa.toLocaleString()} F`}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Summary & WhatsApp Submission */}
        <div className="md:col-span-5 flex flex-col justify-between bg-black/40 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Récapitulatif de votre devis :
            </h4>

            <div className="text-xs text-gray-300 space-y-2 pb-4 border-b border-white/10">
              <div className="flex justify-between">
                <span className="text-gray-400">Prestation :</span>
                <span className="font-semibold text-right">{currentService.name}</span>
              </div>
              {serviceType !== 'poster' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Durée :</span>
                  <span className="font-semibold">{duration}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Format :</span>
                <span className="font-semibold">{currentService.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Options incluses :</span>
                <span className="font-semibold text-emerald-400">
                  {selectedOptions.length} sélectionnée(s)
                </span>
              </div>
            </div>

            {/* Optional Client Information */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[11px] text-gray-400 font-semibold block mb-1">
                  Nom de votre entreprise / Marque (optionnel) :
                </label>
                <input
                  type="text"
                  value={clientBrand}
                  onChange={(e) => setClientBrand(e.target.value)}
                  placeholder="Ex : E-shop Luxury, Restaurant Le Gourmet..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 font-semibold block mb-1">
                  Votre Téléphone / WhatsApp :
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ex : +241 77 XX XX XX"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Total & Action */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase block">
                Total Estimé du Devis :
              </span>
              <div className="text-3xl font-extrabold text-amber-400 font-display">
                {currency === 'EUR'
                  ? `${totalPriceEur} €`
                  : `${totalPriceFcfa.toLocaleString('fr-FR')} FCFA`}
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Devis sans engagement • Validation immédiate
              </p>
            </div>

            <button
              onClick={handleSendDevis}
              className="btn-whatsapp w-full py-3.5 text-sm rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Transmettre ce devis sur WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isOpenModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <section 
      id="simulateur" 
      className="py-16 transition-colors"
      style={{
        backgroundColor: 'var(--bg-secondary, #0a0d14)',
      }}
    >
      <div className="container mx-auto px-4">{content}</div>
    </section>
  );
}
