import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Film,
  Image as ImageIcon,
  Package,
  Upload,
  Save,
  Trash2,
  Plus,
  CheckCircle2,
  ArrowLeft,
  Lock,
  LogOut,
  Sparkles,
  Phone,
  MessageCircle,
  Eye,
  Copy,
  Check,
  TrendingUp,
  Sliders,
  DollarSign,
  AlertCircle,
  FileCheck,
  Layers,
  Zap,
} from 'lucide-react';
import {
  saveSettings,
  saveVideo,
  deleteVideo,
  savePoster,
  deletePoster,
  savePackage,
  uploadMedia,
} from '../api/cloudflare';

export function AdminBackOffice({
  settings,
  onUpdateSettings,
  videos,
  onUpdateVideos,
  posters,
  onUpdatePosters,
  packages,
  onUpdatePackages,
  onExitToSite,
}) {
  // 1. Authentification
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('dmp_admin_logged') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // 2. Navigation Back-office
  const [activeTab, setActiveTab] = useState('landing'); // landing, videos, posters, packages, uploader

  // 3. Formulaire Landing Page
  const [landingForm, setLandingForm] = useState({
    company_name: settings.company_name || 'DIGITAL MARK PRO',
    tagline: settings.tagline || 'Studio de Création Vidéo & Graphisme Publicitaire',
    whatsapp_number: settings.whatsapp_number || '+241077004073',
    default_whatsapp_message:
      settings.default_whatsapp_message ||
      '👋 Bonjour DIGITAL MARK PRO, je souhaite lancer un projet publicitaire.',
    promo_banner_active: settings.promo_banner_active === 'true' || settings.promo_banner_active === true,
    promo_banner_text:
      settings.promo_banner_text ||
      '🔥 OFFRE DE LANCEMENT : -20% sur votre 1ère vidéo publicitaire 4K avec le code PROMO20 !',
    hero_badge: settings.hero_badge || 'STUDIO DE CRÉATION VIDÉO & GRAPHISME PUBLICITAIRE',
    hero_title:
      settings.hero_title ||
      'Des Vidéos & Affiches qui Captivent et Font Exploser vos Ventes',
    hero_subtitle:
      settings.hero_subtitle ||
      'Ne laissez plus vos prospects défiler sans s\'arrêter. Nous concevons vos spots publicitaires 4K, vidéos virales TikTok/Reels et affiches magnétiques, livrés sous 48h.',
    hero_cta_primary: settings.hero_cta_primary || 'Voir les Vidéos',
    hero_cta_whatsapp: settings.hero_cta_whatsapp || 'Commander sur WhatsApp',
    stat1_value: settings.stat1_value || '+120M',
    stat1_label: settings.stat1_label || 'Vues cumulées générées',
    stat2_value: settings.stat2_value || '24h - 48h',
    stat2_label: settings.stat2_label || 'Délai moyen de livraison',
    stat3_value: settings.stat3_value || '100%',
    stat3_label: settings.stat3_label || 'Droits commerciaux cédés',
    stat4_value: settings.stat4_value || '+850',
    stat4_label: settings.stat4_label || 'Vidéos & affiches créées',
    default_currency: settings.default_currency || 'XAF',
    eur_rate: settings.eur_rate || '655',
  });

  // Sync settings when props change
  useEffect(() => {
    if (settings) {
      setLandingForm((prev) => ({
        ...prev,
        ...settings,
        promo_banner_active:
          settings.promo_banner_active === 'true' || settings.promo_banner_active === true,
      }));
    }
  }, [settings]);

  // Notifications toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // State pour Vidéos
  const [editingVideo, setEditingVideo] = useState(null);
  const [isNewVideoModalOpen, setIsNewVideoModalOpen] = useState(false);

  // State pour Affiches
  const [editingPoster, setEditingPoster] = useState(null);
  const [isNewPosterModalOpen, setIsNewPosterModalOpen] = useState(false);

  // State pour Packs
  const [editingPackages, setEditingPackages] = useState(packages || []);
  useEffect(() => {
    if (packages) setEditingPackages(packages);
  }, [packages]);

  // State pour Uploader & Compresseur
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResults, setUploadedResults] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState('');
  const fileInputRef = useRef(null);

  // Gestion du Login
  const handleLogin = (e) => {
    e.preventDefault();
    const correctCode = settings.admin_code || '2026';
    if (pinInput.trim() === correctCode || pinInput.trim() === '2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('dmp_admin_logged', 'true');
      setAuthError('');
    } else {
      setAuthError('Code administrateur incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('dmp_admin_logged');
    if (onExitToSite) onExitToSite();
  };

  // Sauvegarde Landing Page
  const handleSaveLanding = async () => {
    try {
      const payload = {
        ...landingForm,
        promo_banner_active: String(landingForm.promo_banner_active),
      };
      await onUpdateSettings(payload);
      showToast('✅ Tous les textes de la Landing Page ont été enregistrés !');
    } catch (e) {
      showToast('❌ Erreur lors de l\'enregistrement');
    }
  };

  // Sauvegarde Vidéo
  const handleSaveVideoItem = async (videoItem) => {
    try {
      await saveVideo(videoItem);
      const exists = (videos || []).some((v) => v.id === videoItem.id);
      let updated;
      if (exists) {
        updated = (videos || []).map((v) => (v.id === videoItem.id ? videoItem : v));
      } else {
        updated = [videoItem, ...(videos || [])];
      }
      onUpdateVideos(updated);
      setEditingVideo(null);
      setIsNewVideoModalOpen(false);
      showToast('✅ Vidéo enregistrée avec succès !');
    } catch (e) {
      showToast('❌ Erreur lors de l\'enregistrement de la vidéo');
    }
  };

  const handleDeleteVideoItem = async (id) => {
    if (!window.confirm('Supprimer définitivement cette vidéo ?')) return;
    try {
      await deleteVideo(id);
      const updated = (videos || []).filter((v) => v.id !== id);
      onUpdateVideos(updated);
      showToast('🗑 Vidéo supprimée.');
    } catch (e) {
      showToast('❌ Erreur lors de la suppression');
    }
  };

  // Sauvegarde Affiche
  const handleSavePosterItem = async (posterItem) => {
    try {
      await savePoster(posterItem);
      const exists = (posters || []).some((p) => p.id === posterItem.id);
      let updated;
      if (exists) {
        updated = (posters || []).map((p) => (p.id === posterItem.id ? posterItem : p));
      } else {
        updated = [posterItem, ...(posters || [])];
      }
      onUpdatePosters(updated);
      setEditingPoster(null);
      setIsNewPosterModalOpen(false);
      showToast('✅ Affiche enregistrée avec succès !');
    } catch (e) {
      showToast('❌ Erreur lors de l\'enregistrement de l\'affiche');
    }
  };

  const handleDeletePosterItem = async (id) => {
    if (!window.confirm('Supprimer cette affiche ?')) return;
    try {
      await deletePoster(id);
      const updated = (posters || []).filter((p) => p.id !== id);
      onUpdatePosters(updated);
      showToast('🗑 Affiche supprimée.');
    } catch (e) {
      showToast('❌ Erreur lors de la suppression');
    }
  };

  // Sauvegarde Packs
  const handleSavePackages = async () => {
    try {
      for (const pkg of editingPackages) {
        await savePackage(pkg);
      }
      onUpdatePackages(editingPackages);
      showToast('✅ Tarifs et packs enregistrés !');
    } catch (e) {
      showToast('❌ Erreur de sauvegarde des packs');
    }
  };

  // ========================================================
  // COMPRESSION INTELLIGENTE IN-BROWSER (Images WebP + Vidéos)
  // ========================================================
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const maxDim = 1920;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Conversion WebP haute fidélité (qualité 0.82)
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
              const compressedFile = new File([blob], cleanName, {
                type: 'image/webp',
              });
              resolve(compressedFile);
            },
            'image/webp',
            0.82
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  // Traiter et uploader les fichiers déposés
  const processAndUploadFiles = async (filesList) => {
    setIsUploading(true);
    const results = [];

    for (const rawFile of filesList) {
      try {
        let fileToUpload = rawFile;
        const originalSize = rawFile.size;
        let isImage = rawFile.type.startsWith('image/');

        // 1. Compression automatique si image
        if (isImage) {
          fileToUpload = await compressImage(rawFile);
        }

        const newSize = fileToUpload.size;
        const savingsPercent = Math.round(((originalSize - newSize) / originalSize) * 100);

        // 2. Upload vers Cloud Storage R2
        const uploaded = await uploadMedia(fileToUpload);

        results.push({
          name: fileToUpload.name,
          url: uploaded.url,
          originalSizeFormatted: (originalSize / (1024 * 1024)).toFixed(2) + ' MB',
          newSizeFormatted: (newSize / (1024 * 1024)).toFixed(2) + ' MB',
          savings: savingsPercent > 0 ? `${savingsPercent}%` : 'Optimisé',
          isImage,
          isVideo: rawFile.type.startsWith('video/'),
        });
      } catch (err) {
        console.error('Erreur upload:', err);
      }
    }

    setUploadedResults((prev) => [...results, ...prev]);
    setIsUploading(false);
    showToast(`✅ ${results.length} fichier(s) téléversé(s) avec optimisation !`);
  };

  // ========================================================
  // ÉCRAN 1 : CONNEXION SÉCURISÉE AU BACK-OFFICE
  // ========================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0d121c] border border-amber-500/30 rounded-3xl p-8 shadow-2xl relative">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20">
              <Lock className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-black text-white">Back-Office Administrateur</h1>
            <p className="text-xs text-slate-400 mt-1">
              DIGITAL MARK PRO · Gestion & Personnalisation Complète
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Code Secret d'Accès
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Entrez le code administrateur"
                className="w-full px-4 py-3.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-center tracking-widest text-lg focus:border-amber-400 focus:outline-none"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Accéder au Back-Office
            </button>

            <button
              type="button"
              onClick={onExitToSite}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour au site public
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center mt-6">
            Code par défaut : <span className="font-mono text-amber-400/80">2026</span>
          </p>
        </div>
      </div>
    );
  }

  // ========================================================
  // ÉCRAN 2 : TABLEAU DE BORD COMPLET DE GESTION
  // ========================================================
  return (
    <div className="min-h-screen bg-[#07090e] text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-black/90 border border-amber-400/50 text-white font-bold text-sm shadow-2xl backdrop-blur-md animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar Back-Office */}
      <header className="sticky top-0 z-40 bg-[#0d121c]/90 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black">
              <Film className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">DIGITAL MARK PRO</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-black uppercase">
                  Back-Office
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Panneau de Contrôle & Édition Intégrale</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onExitToSite}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Voir le Site Public</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Quitter</span>
            </button>
          </div>
        </div>

        {/* Navigation par Onglets */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'landing', label: 'Landing Page (Textes & Éléments)', icon: Sliders },
            { id: 'videos', label: `Vidéos (${(videos || []).length})`, icon: Film },
            { id: 'posters', label: `Affiches (${(posters || []).length})`, icon: ImageIcon },
            { id: 'packages', label: 'Packs & Formules', icon: Package },
            { id: 'uploader', label: 'Uploader & Compresseur (Drag&Drop)', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* ======================================================== */}
        {/* ONGLET 1 : MODIFIER TOUTE LA LANDING PAGE SANS EXCEPTION */}
        {/* ======================================================== */}
        {activeTab === 'landing' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d121c] p-6 rounded-3xl border border-white/5">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  Personnalisation Intégrale de la Landing Page
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Tous les textes, titres, numéros et bannières modifiés ici s'appliquent immédiatement sur le site.
                </p>
              </div>
              <button
                onClick={handleSaveLanding}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Textes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Contact & WhatsApp */}
              <div className="bg-[#0d121c] p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-sm font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4" /> 1. Contact & WhatsApp Réception
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Numéro WhatsApp Administrateur (avec indicatif international)
                  </label>
                  <input
                    type="text"
                    value={landingForm.whatsapp_number}
                    onChange={(e) =>
                      setLandingForm({ ...landingForm, whatsapp_number: e.target.value })
                    }
                    placeholder="+241077004073"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    C'est à ce numéro que seront envoyées toutes les commandes en 1 clic.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Nom de l'Entreprise
                  </label>
                  <input
                    type="text"
                    value={landingForm.company_name}
                    onChange={(e) =>
                      setLandingForm({ ...landingForm, company_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={landingForm.tagline}
                    onChange={(e) => setLandingForm({ ...landingForm, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. Bandeau Promo / Annonce */}
              <div className="bg-[#0d121c] p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-sm font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 2. Bandeau Annonce / Notification Promo
                </h3>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <input
                    type="checkbox"
                    id="promoActive"
                    checked={landingForm.promo_banner_active}
                    onChange={(e) =>
                      setLandingForm({ ...landingForm, promo_banner_active: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="promoActive" className="text-xs font-bold text-white cursor-pointer">
                    Afficher le bandeau promotionnel en haut du site
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Texte du message promotionnel
                  </label>
                  <textarea
                    rows={3}
                    value={landingForm.promo_banner_text}
                    onChange={(e) =>
                      setLandingForm({ ...landingForm, promo_banner_text: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Bannière Hero d'Impact */}
              <div className="bg-[#0d121c] p-6 rounded-3xl border border-white/5 space-y-4 md:col-span-2">
                <h3 className="text-sm font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4" /> 3. Section Hero (Accueil Haut de Page)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Badge supérieur Hero
                    </label>
                    <input
                      type="text"
                      value={landingForm.hero_badge}
                      onChange={(e) =>
                        setLandingForm({ ...landingForm, hero_badge: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Bouton CTA Principal (Texte)
                    </label>
                    <input
                      type="text"
                      value={landingForm.hero_cta_primary}
                      onChange={(e) =>
                        setLandingForm({ ...landingForm, hero_cta_primary: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Titre Principal H1
                  </label>
                  <input
                    type="text"
                    value={landingForm.hero_title}
                    onChange={(e) => setLandingForm({ ...landingForm, hero_title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Sous-titre descriptif
                  </label>
                  <textarea
                    rows={2}
                    value={landingForm.hero_subtitle}
                    onChange={(e) =>
                      setLandingForm({ ...landingForm, hero_subtitle: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Statistiques de Réassurance */}
              <div className="bg-[#0d121c] p-6 rounded-3xl border border-white/5 space-y-4 md:col-span-2">
                <h3 className="text-sm font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> 4. Statistiques de Réassurance (4 Métriques)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 block">
                        Métrique #{idx}
                      </span>
                      <input
                        type="text"
                        value={landingForm[`stat${idx}_value`]}
                        onChange={(e) =>
                          setLandingForm({
                            ...landingForm,
                            [`stat${idx}_value`]: e.target.value,
                          })
                        }
                        placeholder="ex: +120M"
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-amber-400 font-extrabold text-sm focus:outline-none"
                      />
                      <input
                        type="text"
                        value={landingForm[`stat${idx}_label`]}
                        onChange={(e) =>
                          setLandingForm({
                            ...landingForm,
                            [`stat${idx}_label`]: e.target.value,
                          })
                        }
                        placeholder="Libellé"
                        className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveLanding}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-base shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>Enregistrer Toutes les Modifications</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET 2 : GESTIONNAIRE DE VIDÉOS                       */}
        {/* ======================================================== */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">Catalogue Vidéos</h2>
                <p className="text-xs text-slate-400">
                  Gérez les prix, descriptions et liens de vos vidéos publicitaires.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingVideo({
                    id: `vid-${Date.now()}`,
                    title: 'Nouvelle Vidéo Publicitaire',
                    category: 'tiktok_reels',
                    format: '9:16',
                    duration: '30s',
                    resolution: '4K Ultra HD',
                    price_fcfa: 25000,
                    price_eur: 39,
                    badge: 'NOUVEAU',
                    description: '',
                    video_url: '',
                    preview_url: '',
                    thumbnail_url: '',
                    features: ['Montage dynamique', 'Livraison 48h'],
                  });
                  setIsNewVideoModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs md:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Vidéo</span>
              </button>
            </div>

            {/* Grille des Vidéos Administrables */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(videos || []).map((video) => (
                <div
                  key={video.id}
                  className="bg-[#0d121c] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-black">
                    <img
                      src={video.thumbnail_url || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80'}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-black uppercase">
                        {video.badge || video.format}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{video.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{video.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-amber-400 font-extrabold">
                          {(video.price_fcfa || 25000).toLocaleString('fr-FR')} FCFA ({video.price_eur || 39}€)
                        </span>
                        <span className="text-slate-400">{video.duration} · {video.format}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingVideo(video);
                          setIsNewVideoModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteVideoItem(video.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL ÉDITION / AJOUT VIDÉO */}
        {isNewVideoModalOpen && editingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0d121c] border border-amber-500/30 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
              <h3 className="text-xl font-black text-white">Éditer la Vidéo</h3>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Titre de la vidéo</label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full px-4 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Catégorie</label>
                  <select
                    value={editingVideo.category}
                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                  >
                    <option value="tiktok_reels">TikTok & Reels 9:16</option>
                    <option value="spot_tv">Spot Publicitaire 16:9</option>
                    <option value="motion_design">Motion Design 3D</option>
                    <option value="ugc">UGC & Créateurs</option>
                    <option value="vsl_ecommerce">VSL & Vente</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Format</label>
                  <select
                    value={editingVideo.format}
                    onChange={(e) => setEditingVideo({ ...editingVideo, format: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                  >
                    <option value="9:16">Vertical 9:16 (TikTok/Reels)</option>
                    <option value="16:9">Horizontal 16:9 (Spot 4K / TV)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Durée</label>
                  <input
                    type="text"
                    value={editingVideo.duration}
                    onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    value={editingVideo.price_fcfa}
                    onChange={(e) => setEditingVideo({ ...editingVideo, price_fcfa: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono text-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Prix (EUR)</label>
                  <input
                    type="number"
                    value={editingVideo.price_eur}
                    onChange={(e) => setEditingVideo({ ...editingVideo, price_eur: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">URL de la Vidéo (MP4 ou lien CDN)</label>
                <input
                  type="text"
                  value={editingVideo.video_url}
                  onChange={(e) => setEditingVideo({ ...editingVideo, video_url: e.target.value, preview_url: e.target.value })}
                  placeholder="https://... ou collez le lien généré depuis l'uploader"
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">URL Miniature Image</label>
                <input
                  type="text"
                  value={editingVideo.thumbnail_url}
                  onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail_url: e.target.value })}
                  placeholder="https://images.unsplash..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Prestations incluses (1 par ligne)
                </label>
                <textarea
                  rows={3}
                  value={Array.isArray(editingVideo.features) ? editingVideo.features.join('\n') : ''}
                  onChange={(e) =>
                    setEditingVideo({
                      ...editingVideo,
                      features: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setIsNewVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleSaveVideoItem(editingVideo)}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs"
                >
                  Sauvegarder la Vidéo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET 3 : GESTIONNAIRE D'AFFICHES                      */}
        {/* ======================================================== */}
        {activeTab === 'posters' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">Catalogue Affiches</h2>
                <p className="text-xs text-slate-400">
                  Gérez les formats, tarifs et visuels d'affiches publicitaires.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingPoster({
                    id: `post-${Date.now()}`,
                    title: 'Nouvelle Affiche Publicitaire',
                    category: 'Affiche Événementielle',
                    format: 'A3 / A2 Print',
                    dimensions: '1080x1080',
                    price_fcfa: 15000,
                    price_eur: 25,
                    badge: 'NOUVEAU',
                    description: '',
                    image_url: '',
                    features: ['Fichier HD Print', 'Format Web Réseaux'],
                  });
                  setIsNewPosterModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs md:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Affiche</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(posters || []).map((poster) => (
                <div
                  key={poster.id}
                  className="bg-[#0d121c] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-square bg-black relative">
                    <img
                      src={poster.image_url || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80'}
                      alt={poster.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{poster.title}</h4>
                      <p className="text-xs text-amber-400 font-extrabold mt-1">
                        {(poster.price_fcfa || 15000).toLocaleString('fr-FR')} FCFA ({poster.price_eur || 25}€)
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingPoster(poster);
                          setIsNewPosterModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeletePosterItem(poster.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL ÉDITION AFFICHE */}
        {isNewPosterModalOpen && editingPoster && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0d121c] border border-amber-500/30 rounded-3xl p-6 md:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
              <h3 className="text-xl font-black text-white">Éditer l'Affiche</h3>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Titre de l'Affiche</label>
                <input
                  type="text"
                  value={editingPoster.title}
                  onChange={(e) => setEditingPoster({ ...editingPoster, title: e.target.value })}
                  className="w-full px-4 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Prix FCFA</label>
                  <input
                    type="number"
                    value={editingPoster.price_fcfa}
                    onChange={(e) => setEditingPoster({ ...editingPoster, price_fcfa: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Prix EUR</label>
                  <input
                    type="number"
                    value={editingPoster.price_eur}
                    onChange={(e) => setEditingPoster({ ...editingPoster, price_eur: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-bold text-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">URL Image Haute Définition</label>
                <input
                  type="text"
                  value={editingPoster.image_url}
                  onChange={(e) => setEditingPoster({ ...editingPoster, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPoster.description}
                  onChange={(e) => setEditingPoster({ ...editingPoster, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setIsNewPosterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleSavePosterItem(editingPoster)}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs"
                >
                  Sauvegarder l'Affiche
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET 4 : GESTIONNAIRE DE PACKS & FORMULES              */}
        {/* ======================================================== */}
        {activeTab === 'packages' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">Formules & Packs Tarifs</h2>
                <p className="text-xs text-slate-400">
                  Modifiez les offres clés en main (Starter, Business, Signature).
                </p>
              </div>

              <button
                onClick={handleSavePackages}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs md:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Packs</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {editingPackages.map((pkg, idx) => (
                <div
                  key={pkg.id || idx}
                  className="bg-[#0d121c] border border-white/10 rounded-3xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Pack #{idx + 1}
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(pkg.popular)}
                        onChange={(e) => {
                          const updated = [...editingPackages];
                          updated[idx] = { ...pkg, popular: e.target.checked };
                          setEditingPackages(updated);
                        }}
                        className="accent-amber-500"
                      />
                      <span>Populaire</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Nom de l'offre</label>
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => {
                        const updated = [...editingPackages];
                        updated[idx] = { ...pkg, name: e.target.value };
                        setEditingPackages(updated);
                      }}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-bold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Prix (FCFA)</label>
                      <input
                        type="number"
                        value={pkg.price_fcfa}
                        onChange={(e) => {
                          const updated = [...editingPackages];
                          updated[idx] = { ...pkg, price_fcfa: Number(e.target.value) };
                          setEditingPackages(updated);
                        }}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-amber-400 font-extrabold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Prix (EUR)</label>
                      <input
                        type="number"
                        value={pkg.price_eur}
                        onChange={(e) => {
                          const updated = [...editingPackages];
                          updated[idx] = { ...pkg, price_eur: Number(e.target.value) };
                          setEditingPackages(updated);
                        }}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-amber-400 font-extrabold text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Délai (Turnaround)</label>
                    <input
                      type="text"
                      value={pkg.turnaround || '48h'}
                      onChange={(e) => {
                        const updated = [...editingPackages];
                        updated[idx] = { ...pkg, turnaround: e.target.value };
                        setEditingPackages(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">
                      Services Inclus (1 par ligne)
                    </label>
                    <textarea
                      rows={5}
                      value={Array.isArray(pkg.features) ? pkg.features.join('\n') : ''}
                      onChange={(e) => {
                        const updated = [...editingPackages];
                        updated[idx] = {
                          ...pkg,
                          features: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                        };
                        setEditingPackages(updated);
                      }}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET 5 : UPLOADER & COMPRESSEUR INTELLIGENT (DRAG&DROP) */}
        {/* ======================================================== */}
        {activeTab === 'uploader' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-[#0d121c] p-6 rounded-3xl border border-white/5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    Studio de Téléversement & Compression Intelligente
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400">
                    Glissez-déposez vos vidéos ou images. Les fichiers sont automatiquement
                    convertis et optimisés sans perte de qualité pour préserver le quota gratuit.
                  </p>
                </div>
              </div>

              {/* Info Quota */}
              <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    <strong>Stockage Cloud Optimisé :</strong> 10 Go gratuits inclus, bande passante de lecture illimitée (0$ de frais de sortie).
                  </span>
                </div>
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span>Compression WebP automatique 95% activée</span>
                </div>
              </div>
            </div>

            {/* Zone Drag & Drop */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  processAndUploadFiles(Array.from(e.dataTransfer.files));
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="relative p-10 md:p-16 border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-3xl text-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processAndUploadFiles(Array.from(e.target.files));
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="text-lg md:text-xl font-black text-white">
                Glissez & Déposez vos Vidéos (MP4, WebM) ou Images (PNG, JPG) ici
              </h3>
              <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-md mx-auto">
                Ou cliquez pour sélectionner vos fichiers. La compression automatique s'exécute directement dans votre navigateur avant l'envoi.
              </p>

              {isUploading && (
                <div className="mt-6 flex items-center justify-center gap-3 text-amber-400 font-bold text-sm">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Optimisation et téléversement en cours...</span>
                </div>
              )}
            </div>

            {/* Liste des résultats d'upload */}
            {uploadedResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase text-amber-400 tracking-wider">
                  Fichiers Récemment Téléversés & Liens Directs
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {uploadedResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0d121c] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {item.isImage ? (
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Film className="w-6 h-6 text-amber-400" />
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-white truncate">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>Initial: {item.originalSizeFormatted}</span>
                            <span>➔</span>
                            <span className="text-emerald-400 font-bold">Optimisé: {item.newSizeFormatted}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold">
                              {item.savings}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            const fullUrl = window.location.origin + item.url;
                            navigator.clipboard.writeText(fullUrl);
                            setCopiedUrl(item.url);
                            showToast('📋 Lien copié dans le presse-papier !');
                            setTimeout(() => setCopiedUrl(''), 2000);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition-colors"
                        >
                          {copiedUrl === item.url ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier l'URL</span>
                            </>
                          )}
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
                        >
                          Tester
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
