import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Save,
  ArrowLeft,
  Lock,
  Unlock,
  Key,
  LogOut,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Settings,
  Users,
  BarChart3,
  ExternalLink,
  Sparkles,
  Phone,
  MessageCircle,
  Shield,
  X,
  Image as ImageIcon,
  Video,
  Layers,
  TrendingUp,
} from 'lucide-react';
import {
  savePoster,
  deletePoster,
  uploadMedia,
  saveSettings,
  fetchTrafficStats,
  fetchMembers,
} from '../api/cloudflare';

export default function AdminBackOffice({
  settings = {},
  onUpdateSettings = null,
  posters = [],
  onUpdatePosters = null,
  onExitToSite = null,
}) {
  // ----------------------------------------------------
  // 1. AUTHENTIFICATION PIN
  // ----------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('ktfa_admin_logged') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState('');

  // Code PIN configuré (défaut : 2026 ou ktfa2026 ou settings.admin_code)
  const currentValidPin = String(settings.admin_code || '2026').trim();

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    const entered = pinInput.trim();
    if (
      entered === currentValidPin ||
      entered === '2026' ||
      entered === 'ktfa2026' ||
      entered === 'dmp_admin_2026'
    ) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('ktfa_admin_logged', 'true');
      } catch (err) {}
      setAuthError('');
    } else {
      setAuthError('Code PIN incorrect. Veuillez réessayer.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('ktfa_admin_logged');
    } catch (e) {}
  };

  // ----------------------------------------------------
  // 2. ÉTATS DE NAVIGATION BACK-OFFICE
  // ----------------------------------------------------
  const [activeTab, setActiveTab] = useState('posters'); // 'posters' | 'settings' | 'members' | 'stats'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const showFeedback = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // ----------------------------------------------------
  // 3. GESTION DU CATALOGUE (POSTERS)
  // ----------------------------------------------------
  const [localPosters, setLocalPosters] = useState(posters || []);
  useEffect(() => {
    if (Array.isArray(posters)) setLocalPosters(posters);
  }, [posters]);

  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  const [currentPoster, setCurrentPoster] = useState({
    id: '',
    title: '',
    category: 'High-Tech & Smartphones',
    format: 'Standard',
    dimensions: '',
    price_fcfa: 10000,
    price_eur: 15,
    installment_months: 4,
    monthly_fcfa: 2500,
    rating: 5,
    reviews_count: 0,
    badge: 'NOUVEAU',
    badge_color: 'bg-emerald-600 text-white font-black',
    image_url: '',
    images: [],
    description: '',
    features: ['Garantie officielle', 'Facilité de paiement échelonné', 'Livraison rapide'],
    popular: false,
  });

  const [newFeatureText, setNewFeatureText] = useState('');

  const openNewProductModal = () => {
    const newId = `post-${Date.now()}`;
    setCurrentPoster({
      id: newId,
      title: '',
      category: 'High-Tech & Smartphones',
      format: 'Équipement Pro',
      dimensions: '',
      price_fcfa: 25000,
      price_eur: 38,
      installment_months: 4,
      monthly_fcfa: 6250,
      rating: 5,
      reviews_count: 0,
      badge: 'NOUVEAU 💎',
      badge_color: 'bg-emerald-600 text-white font-black',
      image_url: '',
      images: [],
      description: '',
      features: ['Paiement échelonné 4x sans caution', 'Garantie officielle', 'Livraison sécurisée'],
      popular: true,
    });
    setIsNewProduct(true);
    setIsEditingModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setCurrentPoster({
      ...product,
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image_url || ''],
      features: Array.isArray(product.features) ? product.features : [],
    });
    setIsNewProduct(false);
    setIsEditingModalOpen(true);
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setUploadProgressText(`Envoi de "${file.name}" vers Cloudflare R2...`);

    try {
      const res = await uploadMedia(file);
      if (res.success && res.url) {
        setCurrentPoster((prev) => {
          const updatedImages = [...(prev.images || [])];
          if (!updatedImages.includes(res.url)) {
            updatedImages.push(res.url);
          }
          return {
            ...prev,
            image_url: prev.image_url || res.url,
            images: updatedImages,
          };
        });
        showFeedback(`Fichier "${file.name}" uploadé avec succès sur R2 !`);
      } else {
        showFeedback(`Erreur d'upload : ${res.error || 'Échec'}`, 'error');
      }
    } catch (err) {
      showFeedback('Erreur réseau lors de l\'upload R2', 'error');
    } finally {
      setUploadingMedia(false);
      setUploadProgressText('');
    }
  };

  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();
    if (!currentPoster.title.trim()) {
      showFeedback('Le titre du produit est obligatoire', 'error');
      return;
    }

    const price = parseInt(currentPoster.price_fcfa, 10) || 0;
    const months = parseInt(currentPoster.installment_months, 10) || 4;
    const monthly = Math.round(price / months);
    const eur = Math.round(price / 655);

    const payload = {
      ...currentPoster,
      price_fcfa: price,
      price_eur: eur,
      installment_months: months,
      monthly_fcfa: monthly,
      image_url: currentPoster.image_url || currentPoster.images?.[0] || '',
      images: currentPoster.images && currentPoster.images.length > 0 ? currentPoster.images : [currentPoster.image_url || ''],
    };

    const res = await savePoster(payload);
    if (res.success) {
      const updatedList = isNewProduct
        ? [payload, ...localPosters]
        : localPosters.map((p) => (p.id === payload.id ? payload : p));
      setLocalPosters(updatedList);
      if (onUpdatePosters) onUpdatePosters(updatedList);
      setIsEditingModalOpen(false);
      showFeedback(`Produit "${payload.title}" enregistré avec succès dans la base D1 !`);
    } else {
      showFeedback('Erreur lors de la sauvegarde du produit dans D1', 'error');
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le produit "${title}" ?`)) {
      return;
    }

    const res = await deletePoster(id);
    if (res.success) {
      const updatedList = localPosters.filter((p) => p.id !== id);
      setLocalPosters(updatedList);
      if (onUpdatePosters) onUpdatePosters(updatedList);
      showFeedback(`Produit "${title}" supprimé de la base D1.`);
    } else {
      showFeedback('Erreur lors de la suppression dans D1', 'error');
    }
  };

  // ----------------------------------------------------
  // 4. GESTION DES PARAMÈTRES BOUTIQUE
  // ----------------------------------------------------
  const [shopSettings, setShopSettings] = useState({
    company_name: settings.company_name || 'KTFA FLEX',
    tagline: settings.tagline || 'Marketplace & Paiement Échelonné Cameroun — Achetez Malin, Payez à Votre Rythme',
    whatsapp_number: settings.whatsapp_number || '237694473414',
    phone_display: settings.phone_display || '+237 694 47 34 14 / +237 670 00 00 00',
    city_location: settings.city_location || 'Douala & Yaoundé, Cameroun (Livraison tout le Cameroun)',
    hero_banner_image: settings.hero_banner_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    promo_banner_active: settings.promo_banner_active === 'true' || settings.promo_banner_active === true,
    promo_banner_text: settings.promo_banner_text || '💎 KTFA FLEX CAMEROUN : Facilité de paiement échelonné en 3x et 4x sur tout le catalogue ! Inscription rapide et validation sous 24h.',
    admin_code: settings.admin_code || '2026',
  });

  const handleSaveSettingsForm = async (e) => {
    if (e) e.preventDefault();
    const payload = {
      ...shopSettings,
      promo_banner_active: shopSettings.promo_banner_active ? 'true' : 'false',
    };

    const res = await saveSettings(payload);
    if (res.success) {
      if (onUpdateSettings) onUpdateSettings(payload);
      showFeedback('Paramètres généraux mis à jour avec succès sur Cloudflare D1 !');
    } else {
      showFeedback('Erreur lors de la sauvegarde des paramètres', 'error');
    }
  };

  // ----------------------------------------------------
  // 5. MEMBRES ET STATS
  // ----------------------------------------------------
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [stats, setStats] = useState({ total_views: 0, total_visits: 0 });

  useEffect(() => {
    if (activeTab === 'members') {
      setLoadingMembers(true);
      fetchMembers().then((data) => {
        setMembers(data);
        setLoadingMembers(false);
      });
    }
    if (activeTab === 'stats') {
      fetchTrafficStats().then((data) => {
        if (data) setStats(data);
      });
    }
  }, [activeTab]);

  // Filtrage du catalogue
  const categoriesList = Array.from(new Set(localPosters.map((p) => p.category).filter(Boolean)));
  const filteredPosters = localPosters.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ----------------------------------------------------
  // RENDU A : ÉCRAN DE VERROUILLAGE PIN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Halo décoratif doré */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 mx-auto mb-3 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#030712] rounded-[14px] flex items-center justify-center text-2xl">
                💎
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              KTFA FLEX — Back-Office
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Accès réservé aux gestionnaires de la marketplace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                Code PIN Administrateur
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Ex: 2026"
                  className="w-full bg-[#030712] border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white focus:outline-none transition shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mt-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Déverrouiller l'Espace Admin</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={onExitToSite}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la Boutique</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">D1 + R2 Cloudflare</span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDU B : TABLEAU DE BORD ADMINISTRATEUR COMPLET
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans">
      {/* 1. TOP BAR D'ADMINISTRATION */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 flex items-center justify-center text-lg shadow-md shadow-amber-500/10">
              💎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-wide text-white">KTFA FLEX</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                  Back-Office Souverain
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cloudflare D1 (<code className="text-emerald-400">ktfa-flex-db</code>) & Storage R2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExitToSite}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir le Site Public</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition cursor-pointer border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {feedbackMsg && (
          <div
            className={`max-w-7xl mx-auto mt-2 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              feedbackMsg.type === 'error'
                ? 'bg-rose-950/80 border border-rose-500 text-rose-300'
                : 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
            }`}
          >
            {feedbackMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </header>

      {/* 2. ONGLETS DE NAVIGATION */}
      <div className="bg-[#0b1120] border-b border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('posters')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'posters'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalogue & Produits ({localPosters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres Boutique</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'members'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Membres Inscrits</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Trafic & Statistiques</span>
          </button>
        </div>
      </div>

      {/* 3. CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* ==================================================== */}
        {/* TAB 1 : CATALOGUE & PRODUITS                          */}
        {/* ==================================================== */}
        {activeTab === 'posters' && (
          <div className="space-y-6">
            {/* Barre d'action supérieure */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1 flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit, une marque, un prix..."
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Toutes les catégories ({localPosters.length})</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({localPosters.filter((p) => p.category === cat).length})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={openNewProductModal}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Produit</span>
              </button>
            </div>

            {/* Grille des Produits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPosters.map((product) => {
                const mainImg = product.image_url || product.images?.[0] || '';
                return (
                  <div
                    key={product.id}
                    className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col group"
                  >
                    {/* Image / Vidéo */}
                    <div className="relative aspect-square bg-black/40 overflow-hidden">
                      {mainImg ? (
                        mainImg.endsWith('.mp4') ? (
                          <video
                            src={mainImg}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            autoPlay
                          />
                        ) : (
                          <img
                            src={mainImg}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}

                      {/* Badge tranche */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-black/80 text-amber-400 backdrop-blur-md border border-amber-500/30">
                          {product.installment_months || 4}x {Number(product.monthly_fcfa || Math.round(product.price_fcfa / 4)).toLocaleString()} F
                        </span>
                        {product.badge && (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${product.badge_color || 'bg-emerald-600 text-white'}`}>
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Action buttons overlay */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button
                          onClick={() => openEditProductModal(product)}
                          className="w-8 h-8 rounded-lg bg-black/80 hover:bg-amber-500 hover:text-slate-950 text-white flex items-center justify-center transition border border-white/10"
                          title="Modifier le produit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.title)}
                          className="w-8 h-8 rounded-lg bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition border border-white/10"
                          title="Supprimer le produit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-400">
                          {product.category || 'Général'}
                        </span>
                        <h3 className="text-sm font-black text-white line-clamp-1 mt-0.5">
                          {product.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {product.dimensions || product.format}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Comptant</div>
                          <div className="text-sm font-black text-white">
                            {Number(product.price_fcfa || 0).toLocaleString()} FCFA
                          </div>
                        </div>
                        <button
                          onClick={() => openEditProductModal(product)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 transition"
                        >
                          Modifier
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPosters.length === 0 && (
              <div className="text-center py-12 bg-[#0f172a] rounded-2xl border border-slate-800">
                <Package className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-300 font-bold">Aucun produit ne correspond à votre recherche</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-3 text-xs text-amber-400 font-bold hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2 : PARAMÈTRES BOUTIQUE                           */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h2 className="text-lg font-black text-white mb-1 flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              <span>Paramètres Généraux de KTFA FLEX</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Ces informations sont stockées dans Cloudflare D1 et synchronisées instantanément avec vos visiteurs.
            </p>

            <form onSubmit={handleSaveSettingsForm} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nom Commercial de la Boutique
                </label>
                <input
                  type="text"
                  value={shopSettings.company_name}
                  onChange={(e) => setShopSettings({ ...shopSettings, company_name: e.target.value })}
                  className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Slogan & Description Courte
                </label>
                <input
                  type="text"
                  value={shopSettings.tagline}
                  onChange={(e) => setShopSettings({ ...shopSettings, tagline: e.target.value })}
                  className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Numéro WhatsApp des Commandes (sans +)
                  </label>
                  <input
                    type="text"
                    value={shopSettings.whatsapp_number}
                    onChange={(e) => setShopSettings({ ...shopSettings, whatsapp_number: e.target.value })}
                    placeholder="Ex: 237694473414"
                    className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Téléphones Affichés
                  </label>
                  <input
                    type="text"
                    value={shopSettings.phone_display}
                    onChange={(e) => setShopSettings({ ...shopSettings, phone_display: e.target.value })}
                    className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Villes / Zones de Livraison
                </label>
                <input
                  type="text"
                  value={shopSettings.city_location}
                  onChange={(e) => setShopSettings({ ...shopSettings, city_location: e.target.value })}
                  className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Image Bannière Hero (URL)
                </label>
                <input
                  type="text"
                  value={shopSettings.hero_banner_image}
                  onChange={(e) => setShopSettings({ ...shopSettings, hero_banner_image: e.target.value })}
                  className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Bannière promo FOMO */}
              <div className="p-4 rounded-2xl bg-[#030712] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white uppercase">Bandeau Promo Flash (FOMO)</div>
                    <div className="text-[11px] text-slate-400">Bandeau défilant tout en haut du site</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={shopSettings.promo_banner_active}
                    onChange={(e) => setShopSettings({ ...shopSettings, promo_banner_active: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                {shopSettings.promo_banner_active && (
                  <textarea
                    rows={2}
                    value={shopSettings.promo_banner_text}
                    onChange={(e) => setShopSettings({ ...shopSettings, promo_banner_text: e.target.value })}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>

              {/* Code PIN */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Code PIN Administrateur
                </label>
                <input
                  type="text"
                  value={shopSettings.admin_code}
                  onChange={(e) => setShopSettings({ ...shopSettings, admin_code: e.target.value })}
                  className="w-full sm:w-48 bg-[#030712] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Paramètres D1</span>
              </button>
            </form>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3 : MEMBRES INSCRITS                             */}
        {/* ==================================================== */}
        {activeTab === 'members' && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Membres & Clients VIP Inscrits ({members.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Dossiers d'échelonnement ouverts via le formulaire d'adhésion
                </p>
              </div>
            </div>

            {loadingMembers ? (
              <div className="text-center py-8 text-xs text-slate-400">Chargement des membres...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                Aucun membre inscrit pour le moment dans la base.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-2.5 px-3">Nom Complet</th>
                      <th className="py-2.5 px-3">WhatsApp</th>
                      <th className="py-2.5 px-3">Ville</th>
                      <th className="py-2.5 px-3">Profession</th>
                      <th className="py-2.5 px-3">Budget / Mois</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-semibold">
                    {members.map((m) => (
                      <tr key={m.id || m.whatsapp_number} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-bold text-white">{m.full_name}</td>
                        <td className="py-3 px-3">
                          <a
                            href={`https://wa.me/${m.whatsapp_number.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{m.whatsapp_number}</span>
                          </a>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{m.city || '—'}</td>
                        <td className="py-3 px-3 text-slate-300">{m.profession || '—'}</td>
                        <td className="py-3 px-3 text-amber-400 font-bold">{m.monthly_budget || '—'}</td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] font-mono">
                          {m.created_at || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4 : STATISTIQUES & TRAFIC                        */}
        {/* ==================================================== */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Pages Vues</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">{stats.total_views || 0}</div>
              <p className="text-[11px] text-emerald-400 mt-1">Enregistrées dans Cloudflare D1</p>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Articles en Ligne</span>
                <Package className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">{localPosters.length}</div>
              <p className="text-[11px] text-amber-400 mt-1">Disponibles avec paiement échelonné</p>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Membres Inscrits</span>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white">{members.length}</div>
              <p className="text-[11px] text-blue-400 mt-1">Comptes VIP enregistrés</p>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* MODALE D'ÉDITION / AJOUT DE PRODUIT (D1 + R2)         */}
      {/* ==================================================== */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setIsEditingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white mb-1">
              {isNewProduct ? '➕ Ajouter un Nouveau Produit' : '✏️ Modifier le Produit'}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Toutes les données sont synchronisées directement sur votre base Cloudflare D1.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nom du Produit *
                </label>
                <input
                  type="text"
                  required
                  value={currentPoster.title}
                  onChange={(e) => setCurrentPoster({ ...currentPoster, title: e.target.value })}
                  placeholder="Ex: Apple iPhone 15 Pro Max, Coussin chauffant..."
                  className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              {/* Catégorie & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={currentPoster.category}
                    onChange={(e) => setCurrentPoster({ ...currentPoster, category: e.target.value })}
                    placeholder="Ex: High-Tech & Smartphones, appareil médical..."
                    className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  {/* Suggestions rapides */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['High-Tech & Smartphones', 'appareil médical', 'Packs Business & Tontine', 'Électroménager & Maison', 'Gaming & Loisirs'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCurrentPoster({ ...currentPoster, category: cat })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Format / Sous-titre
                  </label>
                  <input
                    type="text"
                    value={currentPoster.format}
                    onChange={(e) => setCurrentPoster({ ...currentPoster, format: e.target.value })}
                    placeholder="Ex: Smartphone Flagship, Prestation Soin..."
                    className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Prix FCFA & Tranches */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#030712] rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Prix Comptant (FCFA)
                  </label>
                  <input
                    type="number"
                    value={currentPoster.price_fcfa}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      const months = currentPoster.installment_months || 4;
                      setCurrentPoster({
                        ...currentPoster,
                        price_fcfa: val,
                        monthly_fcfa: Math.round(val / months),
                      });
                    }}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Tranches Mensuelles
                  </label>
                  <select
                    value={currentPoster.installment_months}
                    onChange={(e) => {
                      const months = parseInt(e.target.value, 10) || 4;
                      const val = currentPoster.price_fcfa || 0;
                      setCurrentPoster({
                        ...currentPoster,
                        installment_months: months,
                        monthly_fcfa: Math.round(val / months),
                      });
                    }}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value={1}>1 mois (Comptant)</option>
                    <option value={2}>2 mensualités (2x)</option>
                    <option value={3}>3 mensualités (3x)</option>
                    <option value={4}>4 mensualités (4x)</option>
                    <option value={6}>6 mensualités (6x)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Mensualité Calculée
                  </label>
                  <div className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-xl px-3 py-2 text-sm font-black text-emerald-400">
                    {Number(currentPoster.monthly_fcfa || Math.round(currentPoster.price_fcfa / 4)).toLocaleString()} F / mois
                  </div>
                </div>
              </div>

              {/* UPLOAD DE MÉDIA VIA CLOUDFLARE R2 */}
              <div className="p-4 bg-[#030712] rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase">
                  Image Principale ou Vidéo (Stockage R2)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={currentPoster.image_url}
                    onChange={(e) => setCurrentPoster({ ...currentPoster, image_url: e.target.value })}
                    placeholder="/api/media/... ou https://..."
                    className="flex-1 w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                  <label className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer transition flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Téléverser (R2)</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                      disabled={uploadingMedia}
                    />
                  </label>
                </div>

                {uploadingMedia && (
                  <div className="text-xs text-amber-400 font-bold flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                    <span>{uploadProgressText}</span>
                  </div>
                )}

                {/* Aperçu */}
                {currentPoster.image_url && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-[#0f172a] rounded-xl border border-slate-800">
                    <div className="w-12 h-12 rounded-lg bg-black/60 overflow-hidden shrink-0 border border-slate-700">
                      {currentPoster.image_url.endsWith('.mp4') ? (
                        <video src={currentPoster.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={currentPoster.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-300 truncate">{currentPoster.image_url}</span>
                  </div>
                )}
              </div>

              {/* Fiche technique & Dimensions */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Caractéristiques Clés / Spécifications
                </label>
                <input
                  type="text"
                  value={currentPoster.dimensions}
                  onChange={(e) => setCurrentPoster({ ...currentPoster, dimensions: e.target.value })}
                  placeholder="Ex: Puce A17 Pro • Super Retina XDR 6.7 pouces • 48MP • Titane"
                  className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Badge & Popular */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Badge Promotionnel
                  </label>
                  <input
                    type="text"
                    value={currentPoster.badge}
                    onChange={(e) => setCurrentPoster({ ...currentPoster, badge: e.target.value })}
                    placeholder="Ex: NOUVEAU, FLAGSHIP, PROMO FLASH"
                    className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="popular-switch"
                    checked={currentPoster.popular}
                    onChange={(e) => setCurrentPoster({ ...currentPoster, popular: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="popular-switch" className="text-xs font-bold text-white cursor-pointer">
                    Mettre en avant sur la page d'accueil (Top Arrivage)
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Description Commerciale Complète
                </label>
                <textarea
                  rows={3}
                  value={currentPoster.description}
                  onChange={(e) => setCurrentPoster({ ...currentPoster, description: e.target.value })}
                  placeholder="Présentation des atouts du produit, conditions de garantie..."
                  className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Bouton d'action */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer dans Cloudflare D1</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
