import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Car,
  Layout,
  Type,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Bell,
  MessageCircle,
  Save,
  Eye,
  Smartphone,
  Monitor,
  Upload,
  Check,
  X,
  Sparkles,
  Link as LinkIcon,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Zap,
  Play,
  RotateCcw,
  Scissors,
  Layers,
  MousePointer,
  Heart,
  Utensils,
  Flame,
  QrCode,
  MapPin,
  Lock,
  Key,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { parseColorPalette, DEFAULT_THEME, COSMETIC_LIGHT_THEME, getCleanImageUrl } from '../utils/theme';
import { NeumorphicRentalView } from './NeumorphicRentalView';
import { RestaurantGourmetView } from './RestaurantGourmetView';
import { AbaiaCosmetiqueGlassView } from './AbaiaCosmetiqueGlassView';

export function LandingStudio({
  form,
  setForm,
  onSave,
  saving = false,
  uploadMedia,
  compressImage,
  showToast,
  onExitToSite,
  videos = [],
  posters = [],
  packages = [],
}) {
  const isRestaurantLayout =
    form.site_layout === 'restaurant_gourmet' ||
    form.theme_choice === 'restaurant_gourmet' ||
    form.catalog_type === 'restaurant_gourmet' ||
    (typeof window !== 'undefined' && (
      window.location.search.includes('t=gourmet') ||
      window.location.search.includes('t=burger') ||
      window.location.search.includes('t=restaurant') ||
      window.location.search.includes('t=fastfood')
    ));

  const isRentalLayout =
    !isRestaurantLayout && (
      form.site_layout === 'neumorphic_rental' ||
      form.theme_choice === 'neumorphic_rental' ||
      form.catalog_type === 'location_auto_meuble' ||
      (typeof window !== 'undefined' && (
        window.location.search.includes('t=location-express') ||
        window.location.search.includes('t=l') ||
        window.location.hostname.includes('locationexpressgabon.com')
      ))
    );

  const isAbaiaCosmetiqueLayout =
    !isRestaurantLayout &&
    !isRentalLayout &&
    (
      form.site_layout === 'abaia_cosmetique' ||
      form.theme_choice === 'abaia_cosmetique' ||
      form.catalog_type === 'cosmetique_glass' ||
      (form.company_name && form.company_name.toLowerCase().includes('abaia')) ||
      (typeof window !== 'undefined' && (
        window.location.search.includes('t=abaia') ||
        window.location.search.includes('abaia-cosmetique') ||
        window.location.search.includes('abiai-cosmetique') ||
        window.location.hostname.includes('abaia-cosmetique') ||
        window.location.hostname.includes('abiai-cosmetique')
      ))
    );

  const [activeSection, setActiveSection] = useState(() => (
    isRestaurantLayout
      ? 'restaurant_identity'
      : isRentalLayout
      ? 'identity'
      : isAbaiaCosmetiqueLayout
      ? 'cosmetique_identity'
      : 'hero'
  ));
  const [previewDevice, setPreviewDevice] = useState('desktop'); // Mode bureau spacieux par défaut
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Mode plein écran prévisualisation
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [isPastePaletteOpen, setIsPastePaletteOpen] = useState(false);
  const [pastedPaletteText, setPastedPaletteText] = useState('');

  // Garantir qu'une section Abaia valide est toujours active
  useEffect(() => {
    if (isAbaiaCosmetiqueLayout && (!activeSection || !activeSection.startsWith('cosmetique_'))) {
      setActiveSection('cosmetique_identity');
    }
  }, [isAbaiaCosmetiqueLayout, activeSection]);
  
  // Refs pour les uploads de fichiers et le scroll du panneau de prévisualisation
  const previewPaneRef = useRef(null);
  const logoInputRef = useRef(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const heroBannerInputRef = useRef(null);
  const [heroBannerUploading, setHeroBannerUploading] = useState(false);
  const aboutPhoto1InputRef = useRef(null);
  const aboutPhoto2InputRef = useRef(null);
  const aboutPhoto3InputRef = useRef(null);
  const [aboutPhotoUploading, setAboutPhotoUploading] = useState({ 1: false, 2: false, 3: false });

  // Scroll automatique vers la section de configuration quand on clique dans l'aperçu
  const handleSelectSectionFromPreview = (sectionId) => {
    setActiveSection(sectionId);
    setTimeout(() => {
      const el = document.getElementById(`studio-section-${sectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  // Upload du Logo Image (Nettoie et extrait directement l'URL pour éviter l'erreur React #31)
  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLogoUploading(true);
      const compressed = await compressImage(file, 600, 600, 0.9);
      const res = await uploadMedia(compressed, 'logos');
      const cleanUrl = getCleanImageUrl(res) || (res && res.url) || '';
      if (cleanUrl) {
        setForm((prev) => ({ ...prev, company_logo_url: cleanUrl }));
        if (showToast) showToast('✅ Logo image téléversé avec succès !');
      } else {
        throw new Error('URL de logo invalide renvoyée par le serveur');
      }
    } catch (err) {
      if (showToast) showToast('❌ Échec du téléversement du logo : ' + err.message);
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  // Upload de la Bannière Hero (Nettoie et extrait directement l'URL pour éviter l'image cassée [object Object])
  const handleUploadHeroBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setHeroBannerUploading(true);
      const compressed = await compressImage(file, 1920, 1080, 0.88);
      const res = await uploadMedia(compressed, 'hero_banners');
      const cleanUrl = getCleanImageUrl(res) || (res && res.url) || '';
      if (cleanUrl) {
        setForm((prev) => ({
          ...prev,
          hero_banner_image: cleanUrl,
          hero_display_mode: 'banner', // Active directement le mode bannière !
        }));
        if (showToast) showToast('✅ Bannière Hero téléversée et activée !');
      } else {
        throw new Error('URL de bannière invalide renvoyée par le serveur');
      }
    } catch (err) {
      if (showToast) showToast('❌ Échec du téléversement de la bannière : ' + err.message);
    } finally {
      setHeroBannerUploading(false);
      if (heroBannerInputRef.current) heroBannerInputRef.current.value = '';
    }
  };

  // Upload des 3 photos de la section À Propos
  const handleUploadAboutPhoto = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAboutPhotoUploading((prev) => ({ ...prev, [index]: true }));
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      const res = await uploadMedia(compressed, 'about_photos');
      const cleanUrl = getCleanImageUrl(res) || (res && res.url) || '';
      if (cleanUrl) {
        setForm((prev) => ({ ...prev, [`about_photo${index}`]: cleanUrl }));
        if (showToast) showToast(`✅ Photo ${index} de la section À propos ajoutée !`);
      } else {
        throw new Error('URL d\'image invalide renvoyée');
      }
    } catch (err) {
      if (showToast) showToast(`❌ Erreur téléversement photo ${index} : ` + err.message);
    } finally {
      setAboutPhotoUploading((prev) => ({ ...prev, [index]: false }));
      if (index === 1 && aboutPhoto1InputRef.current) aboutPhoto1InputRef.current.value = '';
      if (index === 2 && aboutPhoto2InputRef.current) aboutPhoto2InputRef.current.value = '';
      if (index === 3 && aboutPhoto3InputRef.current) aboutPhoto3InputRef.current.value = '';
    }
  };

  // Traitement du texte collé de la palette des couleurs
  const handleApplyPastedPalette = () => {
    if (!pastedPaletteText.trim()) {
      if (showToast) showToast('Veuillez coller le texte de votre palette');
      return;
    }
    const parsed = parseColorPalette(pastedPaletteText);
    const keysCount = Object.keys(parsed).length;
    if (keysCount === 0) {
      if (showToast) showToast('⚠️ Aucun code couleur (#...) détecté dans le texte');
      return;
    }
    setForm((prev) => ({ ...prev, ...parsed }));
    setIsPastePaletteOpen(false);
    setPastedPaletteText('');
    if (showToast) showToast(`✨ ${keysCount} couleurs appliquées avec succès en direct !`);
  };

  // Application de presets
  const applyPresetTheme = (preset, name) => {
    setForm((prev) => ({ ...prev, ...preset }));
    if (showToast) showToast(`✨ Thème "${name}" appliqué !`);
  };

  // Valeurs dynamiques du formulaire pour l'aperçu
  const currentBgMain = form.color_bg_main || '#0a0d14';
  const currentBgSec = form.color_bg_secondary || '#0f141f';
  const currentBgCard = form.color_bg_card || '#121826';
  const currentPrimary = form.color_primary || '#f59e0b';
  const currentSecondary = form.color_secondary || '#d97706';
  const currentAccent = form.color_accent || '#fbbf24';
  const currentTextTitle = form.color_text_title || '#ffffff';
  const currentTextMain = form.color_text_main || '#f8fafc';
  const currentTextMuted = form.color_text_muted || '#94a3b8';
  const currentBorder = form.color_border || '#273549';
  const currentBtnBg = form.color_btn_bg || currentPrimary;
  const currentBtnText = form.color_btn_text || '#0b0f19';
  const currentBtnHover = form.color_btn_hover || currentSecondary;

  const cleanLogoUrl = getCleanImageUrl(form.company_logo_url);
  const cleanHeroBannerUrl = getCleanImageUrl(form.hero_banner_image);
  const isHeroBannerMode = form.hero_display_mode === 'banner' && !!cleanHeroBannerUrl;

  // Initiales de la marque si aucun logo
  const brandInitials = (form.company_name || 'DMP')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[700px] bg-[#07090e] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* ======================================================== */}
      {/* 1. STUDIO TOPBAR DE CONTRÔLE                              */}
      {/* ======================================================== */}
      <div className="h-16 px-6 bg-[#0c1019] border-b border-white/10 flex items-center justify-between gap-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Studio Live</span>
          </div>
          <span className="text-sm font-bold text-white hidden sm:inline">
            Personnalisation en Temps Réel
          </span>
          <span className="text-xs text-slate-400 hidden md:inline">
            (Cliquez sur n'importe quel élément de l'aperçu pour le modifier à gauche)
          </span>
        </div>

        {/* Sélecteur Desktop / Mobile & Bouton Enregistrer */}
        <div className="flex items-center gap-3">
          <div className="bg-black/60 p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                previewDevice === 'desktop'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Aperçu Grand Écran (Desktop)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ordinateur</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewDevice === 'mobile'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Aperçu Format Smartphone (Mobile)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Smartphone</span>
            </button>
          </div>

          {/* Bouton Agrandir / Plein Écran de l'aperçu */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isSidebarCollapsed
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 hover:text-white border-white/10 hover:bg-white/10'
            }`}
            title={isSidebarCollapsed ? "Réafficher le volet de configuration" : "Plein Écran : Agrandir l'espace de prévisualisation"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSidebarCollapsed ? 'Afficher Volet' : 'Plein Écran'}</span>
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Sauvegarde...' : 'Enregistrer Tout'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SPLIT SCREEN : GAUCHE (CONFIG) / DROITE (APERÇU)      */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ====================================================== */}
        {/* COLONNE GAUCHE : PANNEAU DE CONFIGURATION (SCROLLABLE)  */}
        {/* ====================================================== */}
        {!isSidebarCollapsed && (
          <div className="w-full lg:w-[440px] xl:w-[460px] h-full border-r border-white/10 bg-[#0a0d14] flex flex-col shrink-0 overflow-y-auto">
          {/* Navigation Rapide par Onglets / Accordéons */}
          <div className="p-4 border-b border-white/5 bg-[#0e131e] sticky top-0 z-10 backdrop-blur-md">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Sections de Personnalisation :
            </span>
            <div className={`grid ${(isRentalLayout || isRestaurantLayout || isAbaiaCosmetiqueLayout) ? 'grid-cols-2 gap-2' : 'grid-cols-3 sm:grid-cols-4 gap-1.5'}`}>
              {(isRestaurantLayout ? [
                { id: 'restaurant_identity', label: 'Enseigne & Marque', icon: Utensils, desc: 'Nom, logo, slogan' },
                { id: 'restaurant_theme', label: 'Charte & Glassmorphism', icon: Palette, desc: 'Teal, Ambre, Néon' },
                { id: 'restaurant_combo', label: 'Offre Promo & Combo', icon: Flame, desc: 'Limited Time 20% OFF' },
                { id: 'restaurant_services', label: 'Modes de Service & Villes', icon: MapPin, desc: 'Table QR, Livraison' },
                { id: 'restaurant_whatsapp', label: 'WhatsApp & Commandes', icon: MessageCircle, desc: 'Numéro de réception' },
                { id: 'restaurant_security', label: 'Sécurité & Code PIN', icon: ShieldCheck, desc: 'Accès Back-Office' },
              ] : isRentalLayout ? [
                { id: 'identity', label: 'Marque & Logo', icon: ImageIcon, desc: 'Nom, logo, slogan' },
                { id: 'vehicles', label: 'Flotte & Biens', icon: Car, desc: 'Mazda CX-5 & Meublés' },
                { id: 'colors', label: 'Couleurs & Design', icon: Palette, desc: 'Neumorphisme & Thème' },
                { id: 'whatsapp', label: 'WhatsApp & Vente', icon: MessageCircle, desc: 'Commandes 1-Clic' },
                { id: 'hero', label: 'En-tête & Owendo', icon: Layout, desc: 'Slogan & Localisation' },
                { id: 'footer', label: 'Contact & Coordonnées', icon: ShieldCheck, desc: 'Email, Téléphone' },
              ] : isAbaiaCosmetiqueLayout ? [
                { id: 'cosmetique_identity', label: 'Marque & WhatsApp', icon: ImageIcon, desc: 'Nom, logo, contact' },
                { id: 'cosmetique_theme', label: 'Glassmorphism & Mode', icon: Palette, desc: 'Clair/Sombre & Fond' },
                { id: 'cosmetique_hero', label: 'Hero & Micro-Puces', icon: Layout, desc: 'Titre & 4 puces 2x2' },
                { id: 'cosmetique_catalog', label: 'Catalogue & Cartes 3D', icon: Layers, desc: '2 col mobile, bombé' },
                { id: 'cosmetique_ingredients', label: 'Actifs Nobles', icon: Sparkles, desc: '4 actifs & bienfaits' },
                { id: 'cosmetique_commitments', label: 'Engagements Qualité', icon: ShieldCheck, desc: '6 garanties d’excellence' },
                { id: 'cosmetique_flyer', label: 'Affiche HD & Promo', icon: Eye, desc: 'Flyer & bandeau promo' },
                { id: 'cosmetique_security', label: 'Sécurité & Code PIN', icon: Lock, desc: 'Accès Back-Office' },
              ] : [
                { id: 'colors', label: 'Couleurs', icon: Palette },
                { id: 'logo', label: 'Logo & WhatsApp', icon: ImageIcon },
                { id: 'promo', label: 'Bandeau Promo', icon: Bell },
                { id: 'hero', label: 'Section Hero', icon: Layout },
                { id: 'about', label: 'À propos (3 Photos)', icon: Heart },
                { id: 'buttons', label: 'Boutons', icon: MousePointer },
                { id: 'stats', label: 'Statistiques', icon: TrendingUp },
                { id: 'guarantees', label: 'Garanties', icon: ShieldCheck },
                { id: 'sections', label: 'Titres & Badges', icon: Layers },
                { id: 'modules', label: 'Modules', icon: Sliders },
                { id: 'footer', label: 'Pied de page', icon: Layout },
              ]).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex ${(isRentalLayout || isRestaurantLayout || isAbaiaCosmetiqueLayout) ? 'flex-col items-start p-2.5 text-left' : 'items-center justify-center py-2 px-2'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? (isRestaurantLayout
                            ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 shadow-md ring-1 ring-teal-300'
                            : isAbaiaCosmetiqueLayout
                            ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                            : 'bg-amber-500 text-black shadow-md ring-1 ring-amber-400')
                        : 'bg-black/40 text-slate-300 hover:bg-white/5 hover:text-white border border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-extrabold truncate">{tab.label}</span>
                    </div>
                    {(isRentalLayout || isRestaurantLayout || isAbaiaCosmetiqueLayout) && tab.desc && (
                      <span className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-black/80 font-medium' : 'text-slate-400'}`}>
                        {tab.desc}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTENU ACCORDÉON / FORMULAIRES */}
          <div className="p-5 space-y-6">
            {isRestaurantLayout ? (
              <div className="space-y-6">
                {/* 1. ENSEIGNE & IDENTITÉ DU RESTAURANT */}
                {activeSection === 'restaurant_identity' && (
                  <div className="p-5 rounded-2xl bg-[#0e1722] border border-teal-500/40 ring-1 ring-teal-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Enseigne & Marque du Restaurant</h3>
                        <p className="text-[11px] text-teal-300/70">Nom, logo, slogan et accueil</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Nom de l'établissement</label>
                      <input
                        type="text"
                        value={form.company_name || ''}
                        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                        placeholder="Gourmet Express Libreville"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Slogan / Spécialité</label>
                      <input
                        type="text"
                        value={form.tagline || ''}
                        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        placeholder="Fast-Food Gourmet, Grillades Braisées & Pâtisserie Fine"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Badge de l'établissement</label>
                      <input
                        type="text"
                        value={form.company_badge || ''}
                        onChange={(e) => setForm({ ...form, company_badge: e.target.value })}
                        placeholder="PRO, CHEF ou VIP"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Titre d'Accueil Hero</label>
                      <input
                        type="text"
                        value={form.hero_title || ''}
                        onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                        placeholder="Good Food Good Mood!"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Salutation en En-tête</label>
                      <input
                        type="text"
                        value={form.hero_badge || ''}
                        onChange={(e) => setForm({ ...form, hero_badge: e.target.value })}
                        placeholder="Hi, Gourmand 👋"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Logo du Restaurant</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.company_logo_url || ''}
                          onChange={(e) => setForm({ ...form, company_logo_url: e.target.value })}
                          placeholder="https://..."
                          className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-teal-400"
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={logoUploading}
                          className="px-3.5 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{logoUploading ? 'Envoi...' : 'Image'}</span>
                        </button>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadLogo}
                        />
                      </div>
                      {form.company_logo_url && (
                        <div className="mt-2 p-2 bg-black/40 rounded-xl flex items-center gap-3 border border-white/10">
                          <img
                            src={getCleanImageUrl(form.company_logo_url)}
                            alt="Logo"
                            className="w-10 h-10 object-cover rounded-lg border border-teal-400/40"
                          />
                          <span className="text-[11px] text-teal-300 truncate font-mono">Logo actif</span>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, company_logo_url: '' })}
                            className="ml-auto text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. CHARTE & THÈMES GLASSMORPHIC */}
                {activeSection === 'restaurant_theme' && (
                  <div className="p-5 rounded-2xl bg-[#0e1722] border border-teal-500/40 ring-1 ring-teal-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Thèmes & Ambiances Glassmorphic</h3>
                        <p className="text-[11px] text-teal-300/70">Palettes 1-clic avec translucidité et néon</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          id: 'teal',
                          name: '🌊 Teal & Cyan Néon',
                          desc: 'Original de la capture',
                          bg: '#07181c',
                          accent: '#00E5C9',
                          card: '#0e353f'
                        },
                        {
                          id: 'amber',
                          name: '🔥 Ambre & Braisé',
                          desc: 'Grillades & charbon',
                          bg: '#140d07',
                          accent: '#f59e0b',
                          card: '#2b180d'
                        },
                        {
                          id: 'ruby',
                          name: '🍷 Bistrot & Rubis',
                          desc: 'Luxe & gastronomie',
                          bg: '#13090c',
                          accent: '#f43f5e',
                          card: '#260f16'
                        },
                        {
                          id: 'emerald',
                          name: '🌿 Fresh & Émeraude',
                          desc: 'Salades & bio fraîcheur',
                          bg: '#07170e',
                          accent: '#10b981',
                          card: '#0d2b1a'
                        }
                      ].map(theme => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setForm({
                              ...form,
                              color_bg_main: theme.bg,
                              color_accent: theme.accent,
                              color_primary: theme.accent,
                              color_bg_card: theme.card
                            });
                            showToast(`Palette ${theme.name} appliquée !`);
                          }}
                          className="p-3 rounded-xl border border-white/10 hover:border-teal-400/50 bg-black/40 text-left transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                            <span className="text-xs font-bold text-white group-hover:text-teal-300">{theme.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{theme.desc}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Couleur d'Accent Néon</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={form.color_accent || '#00E5C9'}
                            onChange={(e) => setForm({ ...form, color_accent: e.target.value, color_primary: e.target.value })}
                            className="w-10 h-10 rounded-xl border border-white/20 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={form.color_accent || '#00E5C9'}
                            onChange={(e) => setForm({ ...form, color_accent: e.target.value, color_primary: e.target.value })}
                            className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Couleur de Fond Immersif</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={form.color_bg_main || '#07181c'}
                            onChange={(e) => setForm({ ...form, color_bg_main: e.target.value })}
                            className="w-10 h-10 rounded-xl border border-white/20 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={form.color_bg_main || '#07181c'}
                            onChange={(e) => setForm({ ...form, color_bg_main: e.target.value })}
                            className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. OFFRE PROMO & BANNIÈRE COMBO */}
                {activeSection === 'restaurant_combo' && (
                  <div className="p-5 rounded-2xl bg-[#0e1722] border border-teal-500/40 ring-1 ring-teal-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-rose-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Bannière Offre Combo du Moment</h3>
                        <p className="text-[11px] text-teal-300/70">Mise en avant d'une promotion sur l'accueil</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <span className="text-xs font-bold text-white block">Activer la Bannière Promo</span>
                        <span className="text-[10px] text-slate-400">Affiche la carte "Limited Time Offer"</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.show_promo_combo !== false && form.show_promo_combo !== 'false'}
                        onChange={(e) => setForm({ ...form, show_promo_combo: e.target.checked })}
                        className="w-5 h-5 accent-teal-400 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Badge de l'offre</label>
                      <input
                        type="text"
                        value={form.promo_combo_badge || ''}
                        onChange={(e) => setForm({ ...form, promo_combo_badge: e.target.value })}
                        placeholder="Limited Time Offer"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Titre du Combo</label>
                      <input
                        type="text"
                        value={form.promo_combo_title || ''}
                        onChange={(e) => setForm({ ...form, promo_combo_title: e.target.value })}
                        placeholder="Spicy Burger Combo"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Remise / Promo</label>
                        <input
                          type="text"
                          value={form.promo_combo_discount || ''}
                          onChange={(e) => setForm({ ...form, promo_combo_discount: e.target.value })}
                          placeholder="20% OFF"
                          className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Ancien Prix Barré</label>
                        <input
                          type="text"
                          value={form.promo_combo_old_price || ''}
                          onChange={(e) => setForm({ ...form, promo_combo_old_price: e.target.value })}
                          placeholder="8 500 F"
                          className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MODES DE SERVICE & VILLES */}
                {activeSection === 'restaurant_services' && (
                  <div className="p-5 rounded-2xl bg-[#0e1722] border border-teal-500/40 ring-1 ring-teal-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Modes de Service & Villes</h3>
                        <p className="text-[11px] text-teal-300/70">À table par QR code, livraison ou emporter</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                        <div>
                          <span className="text-xs font-bold text-white block">🍽️ Commande à Table (QR Code)</span>
                          <span className="text-[10px] text-slate-400">Le client indique son numéro de table</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.enable_table_ordering !== 'false' && form.enable_table_ordering !== false}
                          onChange={(e) => setForm({ ...form, enable_table_ordering: e.target.checked })}
                          className="w-5 h-5 accent-teal-400 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                        <div>
                          <span className="text-xs font-bold text-white block">🛵 Livraison à Domicile</span>
                          <span className="text-[10px] text-slate-400">Avec saisie de l'adresse et de la ville</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.enable_home_delivery !== 'false' && form.enable_home_delivery !== false}
                          onChange={(e) => setForm({ ...form, enable_home_delivery: e.target.checked })}
                          className="w-5 h-5 accent-teal-400 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                        <div>
                          <span className="text-xs font-bold text-white block">🛍️ À Emporter (Click & Collect)</span>
                          <span className="text-[10px] text-slate-400">Récupération directe au comptoir</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.enable_takeaway !== 'false' && form.enable_takeaway !== false}
                          onChange={(e) => setForm({ ...form, enable_takeaway: e.target.checked })}
                          className="w-5 h-5 accent-teal-400 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Villes / Zones de Livraison</label>
                      <input
                        type="text"
                        value={form.city_location || ''}
                        onChange={(e) => setForm({ ...form, city_location: e.target.value })}
                        placeholder="Libreville, Owendo & Port-Gentil"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">Séparées par des virgules</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Frais de Livraison Estimés</label>
                      <input
                        type="text"
                        value={form.delivery_fee_text || ''}
                        onChange={(e) => setForm({ ...form, delivery_fee_text: e.target.value })}
                        placeholder="1 500 F à Libreville · 2 500 F à Owendo"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                      />
                    </div>
                  </div>
                )}

                {/* 5. WHATSAPP & COMMANDES */}
                {activeSection === 'restaurant_whatsapp' && (
                  <div className="p-5 rounded-2xl bg-[#0e1722] border border-teal-500/40 ring-1 ring-teal-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">WhatsApp & Réception des Commandes</h3>
                        <p className="text-[11px] text-teal-300/70">Numéro direct pour tables et livraisons</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Numéro WhatsApp (avec indicatif)</label>
                      <input
                        type="text"
                        value={form.whatsapp_number || ''}
                        onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                        placeholder="24177624383"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-teal-400"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">Ex: 241XXXXXXXX (sans le signe +)</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Message d'accompagnement par défaut</label>
                      <textarea
                        rows={3}
                        value={form.default_whatsapp_message || ''}
                        onChange={(e) => setForm({ ...form, default_whatsapp_message: e.target.value })}
                        placeholder="Bonjour, je souhaite passer une commande sur votre carte Gourmet Express."
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-teal-400"
                      />
                    </div>

                    {form.whatsapp_number && (
                      <div className="pt-2">
                        <a
                          href={`https://wa.me/${(form.whatsapp_number || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Tester le lien WhatsApp en direct</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. SÉCURITÉ & CODE PIN ADMINISTRATEUR */}
                {activeSection === 'restaurant_security' && (
                  <div className="p-5 rounded-2xl bg-[#0e1722] border border-teal-500/40 ring-1 ring-teal-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Sécurité & Code PIN Administrateur</h3>
                        <p className="text-[11px] text-teal-300/70">Code secret personnel pour gérer la carte et les prix</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Code PIN Secret du Back-Office</label>
                        <div className="flex gap-2">
                          <input
                            type={showAdminPin ? 'text' : 'password'}
                            value={form.admin_code || ''}
                            onChange={(e) => setForm({ ...form, admin_code: e.target.value })}
                            placeholder="Entrez votre code secret"
                            className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-teal-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPin(!showAdminPin)}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            {showAdminPin ? 'Masquer' : 'Afficher'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const newPin = Math.floor(100000 + Math.random() * 900000).toString();
                            setForm({ ...form, admin_code: newPin });
                            setShowAdminPin(true);
                            showToast(`Nouveau PIN généré : ${newPin}`);
                          }}
                          className="px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Générer un PIN à 6 chiffres</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                        Ce code secret est sauvegardé de façon sécurisée dans votre base de données Cloudflare D1. Aucun code hardcodé n'est utilisé.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : isRentalLayout ? (
              <div className="space-y-6">
                {/* 1. MARQUE & IDENTITÉ */}
                {activeSection === 'identity' && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Identité & Logo Officiel</h3>
                        <p className="text-[11px] text-slate-400">Nom de l'établissement et logo</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Nom de l'entreprise</label>
                      <input
                        type="text"
                        value={form.company_name || ''}
                        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                        placeholder="Location Express Gabon"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Slogan / Sous-titre</label>
                      <input
                        type="text"
                        value={form.tagline || ''}
                        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        placeholder="Location de Voitures & Appartements Meublés"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Ville & Localisation</label>
                      <input
                        type="text"
                        value={form.city_location || ''}
                        onChange={(e) => setForm({ ...form, city_location: e.target.value })}
                        placeholder="Libreville, Gabon 🇬🇦"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Badge de l'entreprise</label>
                      <input
                        type="text"
                        value={form.company_badge || ''}
                        onChange={(e) => setForm({ ...form, company_badge: e.target.value })}
                        placeholder="PRO ou OFFICIEL"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Logo Officiel (URL ou Téléversement)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.company_logo_url || ''}
                          onChange={(e) => setForm({ ...form, company_logo_url: e.target.value })}
                          placeholder="/logo-location-express.jpg"
                          className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={logoUploading}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{logoUploading ? 'Envoi...' : 'Image'}</span>
                        </button>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadLogo}
                        />
                      </div>
                      {form.company_logo_url && (
                        <div className="mt-2 p-2 bg-black/40 rounded-xl flex items-center gap-3 border border-white/10">
                          <img
                            src={getCleanImageUrl(form.company_logo_url)}
                            alt="Aperçu logo"
                            className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1"
                          />
                          <span className="text-[11px] text-slate-400 truncate">{form.company_logo_url}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION VÉHICULES DU FLYER & MEUBLÉS */}
                {activeSection === 'vehicles' && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Flotte & Véhicules du Flyer</h3>
                        <p className="text-[11px] text-slate-400">Mazda CX-5 SUV & Meublés</p>
                      </div>
                    </div>

                    {/* CARTE DU VÉHICULE VEDETTE MAZDA CX-5 DU FLYER */}
                    <div className="p-3.5 rounded-xl bg-black/60 border border-blue-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                          ⭐ VÉHICULE VEDETTE DU FLYER
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">45 000 FCFA / jour</span>
                      </div>

                      <div className="flex gap-3 items-center">
                        <img
                          src="/flyer-location-express.jpg"
                          alt="Mazda CX-5 Flyer Officiel"
                          className="w-20 h-20 object-cover rounded-xl border border-white/15 shrink-0 shadow-md"
                        />
                        <div className="space-y-1 overflow-hidden">
                          <h4 className="text-xs font-bold text-white truncate">Mazda CX-5 SUV Luxe Blanche</h4>
                          <p className="text-[11px] text-slate-300">
                            5 Places • Boîte Automatique • Climatisation Pro
                          </p>
                          <span className="inline-block text-[10px] text-blue-400 font-semibold">
                            📍 Flotte disponible à Owendo & Libreville
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-white/5 space-y-1.5 text-[11px] text-slate-300">
                        <span className="font-bold text-white block">Engagements Officiels du Flyer :</span>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Véhicules récents et bien entretenus</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Appartements meublés confortables</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Service fiable et professionnel</span>
                        </div>
                      </div>
                    </div>

                    {/* GESTION COMPLÈTE DU CATALOGUE */}
                    <div className="pt-2">
                      <p className="text-xs text-slate-400 mb-2">
                        Pour ajouter un nouveau véhicule ou appartement meublé avec galerie multi-photos :
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const tabBtn = document.querySelector('button[title*="Véhicules"], button[title*="Affiches"], button[title*="Catalogue"]');
                          if (tabBtn) tabBtn.click();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                      >
                        <Car className="w-4 h-4" />
                        <span>Ouvrir la Gestion des Véhicules & Meublés</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. COULEURS & THÈME NEUMORPHIQUE */}
                {activeSection === 'colors' && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Couleurs & Thème Neumorphique</h3>
                        <p className="text-[11px] text-slate-400">Dégradé d'en-tête et reflets</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-2">Préréglages 1-Clic :</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setForm({
                            ...form,
                            color_primary: '#0062FF',
                            color_secondary: '#00D68F',
                            color_accent: '#00A3FF'
                          })}
                          className="p-3 rounded-xl bg-black/50 border border-blue-500/30 hover:border-blue-400 text-left flex items-center gap-2.5 cursor-pointer"
                        >
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#0062FF] to-[#00D68F] shrink-0 shadow" />
                          <div>
                            <span className="text-xs font-bold text-white block">Bleu & Émeraude</span>
                            <span className="text-[10px] text-slate-400 block">Officiel Location Express</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setForm({
                            ...form,
                            color_primary: '#1E3A8A',
                            color_secondary: '#3B82F6',
                            color_accent: '#60A5FA'
                          })}
                          className="p-3 rounded-xl bg-black/50 border border-white/10 hover:border-blue-500/40 text-left flex items-center gap-2.5 cursor-pointer"
                        >
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] shrink-0 shadow" />
                          <div>
                            <span className="text-xs font-bold text-white block">Bleu Nuit VIP</span>
                            <span className="text-[10px] text-slate-400 block">Luxe & Prestige</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <div>
                          <span className="text-xs font-bold text-white block">Dégradé Header (Début)</span>
                          <span className="text-[10px] text-slate-400 block">Couleur primaire gauche</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={form.color_primary || '#0062FF'}
                            onChange={(e) => setForm({ ...form, color_primary: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                          />
                          <input
                            type="text"
                            value={form.color_primary || '#0062FF'}
                            onChange={(e) => setForm({ ...form, color_primary: e.target.value })}
                            className="w-20 px-2 py-1 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <div>
                          <span className="text-xs font-bold text-white block">Dégradé Header (Fin)</span>
                          <span className="text-[10px] text-slate-400 block">Couleur secondaire droite</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={form.color_secondary || '#00D68F'}
                            onChange={(e) => setForm({ ...form, color_secondary: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                          />
                          <input
                            type="text"
                            value={form.color_secondary || '#00D68F'}
                            onChange={(e) => setForm({ ...form, color_secondary: e.target.value })}
                            className="w-20 px-2 py-1 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. WHATSAPP & CONTACT DIRECT */}
                {activeSection === 'whatsapp' && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">WhatsApp & Réservations</h3>
                        <p className="text-[11px] text-slate-400">Canal de vente et commandes 1-clic</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Numéro WhatsApp de réception</label>
                      <input
                        type="text"
                        value={form.whatsapp_number || ''}
                        onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                        placeholder="24162744533"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Format international sans '+' ni espaces (ex: 24162744533).</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Message d'accroche par défaut</label>
                      <textarea
                        rows={3}
                        value={form.default_whatsapp_message || ''}
                        onChange={(e) => setForm({ ...form, default_whatsapp_message: e.target.value })}
                        placeholder="👋 Bonjour Location Express Gabon, je souhaite réserver un véhicule ou un meublé."
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* 4. EN-TÊTE & LOCALISATION */}
                {activeSection === 'hero' && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">En-tête & Localisation</h3>
                        <p className="text-[11px] text-slate-400">Accroches visibles sur l'application</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Badge d'accueil</label>
                      <input
                        type="text"
                        value={form.hero_badge || ''}
                        onChange={(e) => setForm({ ...form, hero_badge: e.target.value })}
                        placeholder="LOCATION DE VÉHICULES & APPARTEMENTS MEUBLÉS"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Titre principal</label>
                      <input
                        type="text"
                        value={form.hero_title || ''}
                        onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                        placeholder="Location Express Gabon"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Slogan Officiel (du Flyer)</label>
                      <input
                        type="text"
                        value={form.tagline || ''}
                        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        placeholder="Voyagez, Séjournez... en toute sérénité !"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Ville & Localisation (du Flyer)</label>
                      <input
                        type="text"
                        value={form.city_location || ''}
                        onChange={(e) => setForm({ ...form, city_location: e.target.value })}
                        placeholder="Owendo & Libreville, Gabon 🇬🇦"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Bandeau Annonce en Haut</label>
                      <input
                        type="text"
                        value={form.promo_banner_text || ''}
                        onChange={(e) => setForm({ ...form, promo_banner_text: e.target.value })}
                        placeholder="🚗 Voyagez, Séjournez... en toute sérénité ! Flotte Mazda CX-5 disponible à Owendo"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Sous-titre / Description</label>
                      <textarea
                        rows={3}
                        value={form.hero_subtitle || ''}
                        onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
                        placeholder="Voyagez, Séjournez... en toute sérénité ! Véhicules récents et bien entretenus, appartements meublés grand confort à Owendo et Libreville."
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* 5. VITRINE & TITRES */}
                {activeSection === 'sections' && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Vitrine Catalogue & Badges</h3>
                        <p className="text-[11px] text-slate-400">Titres de sections de la boutique</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Badge de vitrine</label>
                      <input
                        type="text"
                        value={form.posters_badge || ''}
                        onChange={(e) => setForm({ ...form, posters_badge: e.target.value })}
                        placeholder="CATALOGUE OFFICIEL"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Titre de la vitrine</label>
                      <input
                        type="text"
                        value={form.posters_title || ''}
                        onChange={(e) => setForm({ ...form, posters_title: e.target.value })}
                        placeholder="Nos Véhicules & Meublés"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Sous-titre de la vitrine</label>
                      <textarea
                        rows={2}
                        value={form.posters_subtitle || ''}
                        onChange={(e) => setForm({ ...form, posters_subtitle: e.target.value })}
                        placeholder="Consultez les photos et réservez en 1 clic sur WhatsApp."
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* 6. PIED DE PAGE & COORDONNÉES */}
                {activeSection === 'footer' && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Pied de Page & Coordonnées</h3>
                        <p className="text-[11px] text-slate-400">Informations de contact officielles</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Email de contact</label>
                      <input
                        type="email"
                        value={form.contact_email || ''}
                        onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                        placeholder="santanaviciento1975@gmail.com"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Téléphone d'urgence / Appel</label>
                      <input
                        type="text"
                        value={form.contact_phone || ''}
                        onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                        placeholder="+241 62 74 45 33"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Adresse physique / Siège</label>
                      <input
                        type="text"
                        value={form.footer_address || ''}
                        onChange={(e) => setForm({ ...form, footer_address: e.target.value })}
                        placeholder="Libreville, Gabon"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : isAbaiaCosmetiqueLayout ? (
              <div className="space-y-6">
                {/* 1. ENSEIGNE & MARQUE ABAIA COSMETIQUE */}
                {(activeSection === 'cosmetique_identity' || activeSection === 'identity' || activeSection === 'logo' || !activeSection || !activeSection.startsWith('cosmetique_')) && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Marque & WhatsApp Direct</h3>
                        <p className="text-[11px] text-slate-400">Nom de la marque, logo officiel et coordonnées de commande</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Nom de la marque</label>
                      <input
                        type="text"
                        value={form.company_name || ''}
                        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                        placeholder="Abaïa COSMÉTIQUE"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Slogan officiel / Tagline</label>
                      <input
                        type="text"
                        value={form.tagline || ''}
                        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        placeholder="L’élégance de votre peau au naturel"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Badge de l'enseigne</label>
                      <input
                        type="text"
                        value={form.company_badge || ''}
                        onChange={(e) => setForm({ ...form, company_badge: e.target.value })}
                        placeholder="OFFICIEL, VIP ou BIO"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Numéro WhatsApp Réception Commandes</label>
                      <input
                        type="text"
                        value={form.whatsapp_number || ''}
                        onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                        placeholder="237698548016"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-400"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Format international sans espaces ni signe + (ex: 237698548016 pour le Cameroun, 24177624383 pour le Gabon).
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Affichage du numéro sur le site</label>
                      <input
                        type="text"
                        value={form.whatsapp_display || ''}
                        onChange={(e) => setForm({ ...form, whatsapp_display: e.target.value })}
                        placeholder="+237 698 548 016"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Devise de facturation</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['FCFA', 'EUR', 'USD'].map((curr) => (
                          <button
                            key={curr}
                            type="button"
                            onClick={() => setForm({ ...form, default_currency: curr })}
                            className={`py-2 rounded-xl text-xs font-black transition-all ${
                              (form.default_currency || 'FCFA') === curr
                                ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                                : 'bg-black/60 text-slate-300 border border-white/10 hover:bg-white/5'
                            }`}
                          >
                            {curr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Logo Officiel de la Marque</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.company_logo_url || ''}
                          onChange={(e) => setForm({ ...form, company_logo_url: e.target.value })}
                          placeholder="https://..."
                          className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={logoUploading}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{logoUploading ? 'Envoi...' : 'Parcourir'}</span>
                        </button>
                      </div>
                      {form.company_logo_url && (
                        <div className="mt-2 p-2 bg-black/40 border border-white/10 rounded-xl flex items-center gap-3">
                          <img
                            src={form.company_logo_url}
                            alt="Logo Aperçu"
                            className="w-12 h-12 object-contain rounded-lg border border-white/10 bg-amber-50 p-1"
                          />
                          <span className="text-[11px] text-slate-300">Logo actif sur la boutique</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. GLASSMORPHISM & THÈME */}
                {(activeSection === 'cosmetique_theme' || activeSection === 'colors') && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Glassmorphism & Mode d'Affichage</h3>
                        <p className="text-[11px] text-slate-400">Mode Clair / Sombre par défaut et ambiance luxueuse en verre</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-2">Thème Initial par Défaut à l'Ouverture</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          onClick={() => setForm({ ...form, default_theme_mode: 'light' })}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            (form.default_theme_mode !== 'dark')
                              ? 'bg-gradient-to-b from-amber-50 to-white text-slate-900 border-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black flex items-center gap-1.5 text-amber-900">
                              ☀️ Mode Clair (Recommandé)
                            </span>
                            {(form.default_theme_mode !== 'dark') && (
                              <Check className="w-4 h-4 text-amber-600" />
                            )}
                          </div>
                          <p className="text-[10.5px] leading-relaxed text-slate-600">
                            Fond ivoire satiné, verre perlé translucide, texte contrasté et ombres ambrées douces. L'élégance cosmétique absolue.
                          </p>
                        </div>

                        <div
                          onClick={() => setForm({ ...form, default_theme_mode: 'dark' })}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            (form.default_theme_mode === 'dark')
                              ? 'bg-gradient-to-b from-slate-900 to-black text-white border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black flex items-center gap-1.5 text-amber-300">
                              🌙 Mode Sombre
                            </span>
                            {(form.default_theme_mode === 'dark') && (
                              <Check className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <p className="text-[10.5px] leading-relaxed text-slate-400">
                            Fond obsidienne profond, verre fumé avec reflets or et néons ambrés. Style nocturne d'exception.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-400/90 mt-2 block">
                        💡 Les visiteurs disposent en plus d'un sélecteur 1-clic [☀️ Clair | 🌙 Sombre] dans la barre de navigation et en bouton flottant pour basculer à tout moment.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Image de Fond d'Ambiance Verre Skincare</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.hero_banner_image || ''}
                          onChange={(e) => setForm({ ...form, hero_banner_image: e.target.value })}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => heroBannerInputRef.current?.click()}
                          disabled={heroBannerUploading}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{heroBannerUploading ? 'Envoi...' : 'Parcourir'}</span>
                        </button>
                      </div>

                      <div className="mt-2.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Fonds d'ambiance recommandés :</span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, hero_banner_image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=85' })}
                            className="p-1.5 rounded-xl border border-white/10 hover:border-amber-400/50 bg-black/40 text-left text-[9.5px] text-slate-300 transition"
                          >
                            🌸 Soin & Eau Pure
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, hero_banner_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=2000&q=85' })}
                            className="p-1.5 rounded-xl border border-white/10 hover:border-amber-400/50 bg-black/40 text-left text-[9.5px] text-slate-300 transition"
                          >
                            🧴 Crème & Poudré
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, hero_banner_image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=2000&q=85' })}
                            className="p-1.5 rounded-xl border border-white/10 hover:border-amber-400/50 bg-black/40 text-left text-[9.5px] text-slate-300 transition"
                          >
                            🌿 Botanique Vert
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SECTION HERO & MICRO-PUCES */}
                {(activeSection === 'cosmetique_hero' || activeSection === 'hero') && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Section Hero & Micro-Puces</h3>
                        <p className="text-[11px] text-slate-400">Grand titre d'accroche, mot accentué et 4 puces 2x2</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Grand Titre Principal Hero</label>
                      <input
                        type="text"
                        value={form.hero_title || ''}
                        onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                        placeholder="L’ÉLÉGANCE ET LA BEAUTÉ DE VOTRE PEAU"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Mot d'Accentuation en Dégradé Doré</label>
                      <input
                        type="text"
                        value={form.hero_title_accent || ''}
                        onChange={(e) => setForm({ ...form, hero_title_accent: e.target.value })}
                        placeholder="AU NATUREL."
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Sous-Titre de Présentation</label>
                      <textarea
                        rows={3}
                        value={form.hero_subtitle || ''}
                        onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
                        placeholder="Découvrez la crème hydratante visage & corps Abaïa Cosmétique enrichie à 5% d'urée, le Gel Métisse unifiant, le Lait Caramel et le Gel Douche Perfecte Glow..."
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <label className="text-xs font-bold text-slate-300 block mb-2">Les 4 Micro-Puces en Verre (Grille 2x2 sur Mobile)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-bold block mb-1">🌿 Puce 1 (Nature)</span>
                          <input
                            type="text"
                            value={form.hero_pill_1 || ''}
                            onChange={(e) => setForm({ ...form, hero_pill_1: e.target.value })}
                            placeholder="100% ACTIFS PURS"
                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-400 font-bold block mb-1">🛡️ Puce 2 (Urée)</span>
                          <input
                            type="text"
                            value={form.hero_pill_2 || ''}
                            onChange={(e) => setForm({ ...form, hero_pill_2: e.target.value })}
                            placeholder="FORMULE 5% URÉE"
                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-400 font-bold block mb-1">✨ Puce 3 (Éclat)</span>
                          <input
                            type="text"
                            value={form.hero_pill_3 || ''}
                            onChange={(e) => setForm({ ...form, hero_pill_3: e.target.value })}
                            placeholder="ÉCLAT & ANTI-TACHES"
                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-pink-400 font-bold block mb-1">❤️ Puce 4 (Testé)</span>
                          <input
                            type="text"
                            value={form.hero_pill_4 || ''}
                            onChange={(e) => setForm({ ...form, hero_pill_4: e.target.value })}
                            placeholder="TESTÉ & VALIDÉ"
                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <label className="text-xs font-bold text-slate-300 block mb-1">Texte Bouton d'Action Principal Hero</label>
                      <input
                        type="text"
                        value={form.hero_cta_primary || ''}
                        onChange={(e) => setForm({ ...form, hero_cta_primary: e.target.value })}
                        placeholder="COMMANDER SUR WHATSAPP"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* 4. CATALOGUE & CARTES 3D BOMBÉES */}
                {(activeSection === 'cosmetique_catalog' || activeSection === 'sections') && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Catalogue & Cartes 3D Bombées</h3>
                        <p className="text-[11px] text-slate-400">2 colonnes sur mobile, relief convexe et boutons d'action</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Titre de la Section Catalogue</label>
                      <input
                        type="text"
                        value={form.catalog_title || ''}
                        onChange={(e) => setForm({ ...form, catalog_title: e.target.value })}
                        placeholder="Nos Soins d’Exception"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Sous-Titre de la Section Catalogue</label>
                      <textarea
                        rows={2}
                        value={form.catalog_subtitle || ''}
                        onChange={(e) => setForm({ ...form, catalog_subtitle: e.target.value })}
                        placeholder="Chaque produit est formulé pour sublimer votre peau avec douceur et efficacité. Touchez une carte pour voir les détails et commander sur WhatsApp."
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 via-black/40 to-amber-900/40 border border-amber-500/30 space-y-2">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Spécifications Rendu 3D Cartes Produits (Actives) :
                      </span>
                      <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                        <li><strong className="text-white">2 Colonnes Strictes sur Mobile :</strong> Disposition `grid-cols-2` optimisée sans chevauchement.</li>
                        <li><strong className="text-white">Relief Bombé & Ressorti :</strong> Dégradé convexe 3D, biseau supérieur blanc éclatant et ombre portée modérée.</li>
                        <li><strong className="text-white">Boutons Intégrés :</strong> Bouton WhatsApp direct + Bouton Ajout au Panier (+) sur chaque carte.</li>
                        <li><strong className="text-white">Modale de Soin :</strong> Ingrédients, posologie, conseils d'utilisation et sélecteur de quantité au clic.</li>
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <span className="text-xs text-slate-300 font-bold block mb-2">Gestion des Articles du Catalogue :</span>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Pour ajouter de nouveaux soins, modifier les prix en FCFA ou mettre à jour les photos, utilisez l'onglet « Affiches & Produits » du menu supérieur.
                      </p>
                      <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Articles actuellement dans le catalogue :</span>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                          {Array.isArray(posters) && posters.length > 0 ? posters.length : 4} produits
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. ACTIFS & INGRÉDIENTS NOBLES */}
                {activeSection === 'cosmetique_ingredients' && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Actifs Nobles & Ingrédients Clés</h3>
                        <p className="text-[11px] text-slate-400">Les 4 piliers dermatologiques mis en valeur sur votre boutique</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Titre de la Section Ingrédients</label>
                      <input
                        type="text"
                        value={form.ingredients_section_title || ''}
                        onChange={(e) => setForm({ ...form, ingredients_section_title: e.target.value })}
                        placeholder="Nos Ingrédients Nobles"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Sous-Titre de la Section Ingrédients</label>
                      <input
                        type="text"
                        value={form.ingredients_section_subtitle || ''}
                        onChange={(e) => setForm({ ...form, ingredients_section_subtitle: e.target.value })}
                        placeholder="Synergie Végétale & Dermatologique"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <span className="text-xs font-bold text-amber-300 block">Les 4 Cartes Actifs :</span>

                      {/* Ingrédient 1 */}
                      <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-400">💧 Ingrédient #1</span>
                          <input
                            type="text"
                            value={form.ingredient_1_tag || ''}
                            onChange={(e) => setForm({ ...form, ingredient_1_tag: e.target.value })}
                            placeholder="Hydratation Intense"
                            className="px-2 py-0.5 bg-black/60 border border-white/10 rounded text-[10px] text-amber-300 text-right"
                          />
                        </div>
                        <input
                          type="text"
                          value={form.ingredient_1_title || ''}
                          onChange={(e) => setForm({ ...form, ingredient_1_title: e.target.value })}
                          placeholder="URÉE PURE 5% & EAU DE ROSE"
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white font-bold"
                        />
                        <textarea
                          rows={2}
                          value={form.ingredient_1_desc || ''}
                          onChange={(e) => setForm({ ...form, ingredient_1_desc: e.target.value })}
                          placeholder="L’urée retient l’eau dans les couches profondes de l’épiderme..."
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-[11px] text-slate-300"
                        />
                      </div>

                      {/* Ingrédient 2 */}
                      <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-400">✨ Ingrédient #2</span>
                          <input
                            type="text"
                            value={form.ingredient_2_tag || ''}
                            onChange={(e) => setForm({ ...form, ingredient_2_tag: e.target.value })}
                            placeholder="Éclat & Teint Unifié"
                            className="px-2 py-0.5 bg-black/60 border border-white/10 rounded text-[10px] text-amber-300 text-right"
                          />
                        </div>
                        <input
                          type="text"
                          value={form.ingredient_2_title || ''}
                          onChange={(e) => setForm({ ...form, ingredient_2_title: e.target.value })}
                          placeholder="GLUTATHION & VITAMINE C"
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white font-bold"
                        />
                        <textarea
                          rows={2}
                          value={form.ingredient_2_desc || ''}
                          onChange={(e) => setForm({ ...form, ingredient_2_desc: e.target.value })}
                          placeholder="Le duo antioxydant roi qui régule la mélanine..."
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-[11px] text-slate-300"
                        />
                      </div>

                      {/* Ingrédient 3 */}
                      <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-400">🌿 Ingrédient #3</span>
                          <input
                            type="text"
                            value={form.ingredient_3_tag || ''}
                            onChange={(e) => setForm({ ...form, ingredient_3_tag: e.target.value })}
                            placeholder="Nutrition Suprême"
                            className="px-2 py-0.5 bg-black/60 border border-white/10 rounded text-[10px] text-amber-300 text-right"
                          />
                        </div>
                        <input
                          type="text"
                          value={form.ingredient_3_title || ''}
                          onChange={(e) => setForm({ ...form, ingredient_3_title: e.target.value })}
                          placeholder="HUILE D’ARGAN & AMANDE DOUCE"
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white font-bold"
                        />
                        <textarea
                          rows={2}
                          value={form.ingredient_3_desc || ''}
                          onChange={(e) => setForm({ ...form, ingredient_3_desc: e.target.value })}
                          placeholder="Riche en acides gras essentiels et vitamine E naturelle..."
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-[11px] text-slate-300"
                        />
                      </div>

                      {/* Ingrédient 4 */}
                      <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-400">⚡ Ingrédient #4</span>
                          <input
                            type="text"
                            value={form.ingredient_4_tag || ''}
                            onChange={(e) => setForm({ ...form, ingredient_4_tag: e.target.value })}
                            placeholder="Purification & Glow"
                            className="px-2 py-0.5 bg-black/60 border border-white/10 rounded text-[10px] text-amber-300 text-right"
                          />
                        </div>
                        <input
                          type="text"
                          value={form.ingredient_4_title || ''}
                          onChange={(e) => setForm({ ...form, ingredient_4_title: e.target.value })}
                          placeholder="CURCUMA BIO & ACIDE KOJIQUE"
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white font-bold"
                        />
                        <textarea
                          rows={2}
                          value={form.ingredient_4_desc || ''}
                          onChange={(e) => setForm({ ...form, ingredient_4_desc: e.target.value })}
                          placeholder="Propriétés antibactériennes et purifiantes uniques..."
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-[11px] text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. ENGAGEMENTS QUALITÉ */}
                {(activeSection === 'cosmetique_commitments' || activeSection === 'guarantees') && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Engagements Qualité & Labels</h3>
                        <p className="text-[11px] text-slate-400">Les 6 promesses et garanties de votre marque</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Titre de la Section Engagements</label>
                      <input
                        type="text"
                        value={form.commitments_title || ''}
                        onChange={(e) => setForm({ ...form, commitments_title: e.target.value })}
                        placeholder="Nos Engagements d’Excellence"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-white/10">
                      <span className="text-xs font-bold text-slate-300 block">Les 6 Garanties :</span>
                      {[
                        { key: 'commitment_1', def: '100% Ingrédients Rigoureusement Sélectionnés' },
                        { key: 'commitment_2', def: 'Zéro Parabène ni Produits Décapants Agressifs' },
                        { key: 'commitment_3', def: 'Non Testé sur les Animaux (Cruelty-Free)' },
                        { key: 'commitment_4', def: 'Efficacité Testée et Approuvée sur Peaux Noires & Métisses' },
                        { key: 'commitment_5', def: 'Hydratation & Confort 24h sans Film Gras' },
                        { key: 'commitment_6', def: 'Fabrication Authentique Certifiée Yaoundé, Cameroun' }
                      ].map((item, idx) => (
                        <div key={item.key} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={form[item.key] || ''}
                            onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}
                            placeholder={item.def}
                            className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. AFFICHE HD & PROMO */}
                {(activeSection === 'cosmetique_flyer' || activeSection === 'promo') && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Affiche Officielle & Bandeau Promo</h3>
                        <p className="text-[11px] text-slate-400">Flyer HD grand format et bandeau d'alerte interactif</p>
                      </div>
                    </div>

                    {/* Bandeau Promo */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Bandeau d'Annonce Supérieur</span>
                        <input
                          type="checkbox"
                          checked={form.promo_banner_active === true || form.promo_banner_active === 'true'}
                          onChange={(e) => setForm({ ...form, promo_banner_active: e.target.checked })}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Texte de l'Annonce</label>
                        <input
                          type="text"
                          value={form.promo_banner_text || ''}
                          onChange={(e) => setForm({ ...form, promo_banner_text: e.target.value })}
                          placeholder="L’excellence des soins naturels pour sublimer votre peau !"
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Affiche Officielle */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Image du Flyer / Affiche Grand Format</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.flyer_image_url || form.hero_banner_image || ''}
                          onChange={(e) => setForm({ ...form, flyer_image_url: e.target.value })}
                          placeholder="/api/media/1791544082634-banni_re.webp"
                          className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => heroBannerInputRef.current?.click()}
                          disabled={heroBannerUploading}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{heroBannerUploading ? 'Envoi...' : 'Téléverser'}</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Cette affiche s'affiche en grand écran avec effet de zoom dès que le visiteur clique sur « AFFICHE OFFICIELLE » dans le menu.
                      </span>
                    </div>
                  </div>
                )}

                {/* 8. SÉCURITÉ & CODE PIN */}
                {activeSection === 'cosmetique_security' && (
                  <div className="p-5 rounded-2xl bg-[#0e1422] border border-amber-500/40 ring-1 ring-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Sécurité & Code PIN Gérant</h3>
                        <p className="text-[11px] text-slate-400">Protection du studio et accès aux fonctions d'administration</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Code PIN Secret</label>
                      <div className="relative">
                        <input
                          type={showAdminPin ? 'text' : 'password'}
                          value={form.admin_code || ''}
                          onChange={(e) => setForm({ ...form, admin_code: e.target.value })}
                          placeholder="client2026"
                          className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-400 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPin(!showAdminPin)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs font-bold"
                        >
                          {showAdminPin ? 'Masquer' : 'Afficher'}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Ce code protège les modifications de votre boutique.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* ---------------------------------------------------- */}
            {/* SECTION 1 : PALETTE & COULEURS DU SITE               */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-colors"
              className={`p-5 rounded-2xl border transition-all ${
                activeSection === 'colors'
                  ? 'bg-[#0e1422] border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#0d121c] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Charte Graphique & Couleurs</h3>
                    <p className="text-[11px] text-slate-400">Harmonie visuelle du site</p>
                  </div>
                </div>
              </div>

              {/* BOUTON MAGIQUE : COLLER LA PALETTE DES COULEURS */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setIsPastePaletteOpen(!isPastePaletteOpen)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-600/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Coller la palette des couleurs</span>
                  <ChevronDown
                    className={`w-4 h-4 ml-auto transition-transform ${
                      isPastePaletteOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isPastePaletteOpen && (
                  <div className="mt-3 p-4 bg-black/70 border border-amber-500/30 rounded-xl space-y-3 animate-in fade-in">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Collez ci-dessous la liste de couleurs extraite de votre flyer publicitaire.
                      Tous les codes hexadécimaux (<span className="text-amber-400 font-mono">#...</span>) seront automatiquement détectés et appliqués en direct :
                    </p>
                    <textarea
                      rows={6}
                      value={pastedPaletteText}
                      onChange={(e) => setPastedPaletteText(e.target.value)}
                      placeholder={`Exemple :\nCouleur principale : #A26F1C\nCouleur de fond principale : #FAEFDD\nCouleur des titres : #302318\nCouleur des boutons : #A26F1C`}
                      className="w-full p-3 bg-black/90 border border-white/15 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPastePaletteOpen(false)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyPastedPalette}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Appliquer au site</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* THÈMES RAPIDES EN 1 CLIC */}
              <div className="mb-4 pt-1">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  Préréglages 1-Clic :
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPresetTheme(DEFAULT_THEME, 'Sombre Tech VIP')}
                    className="p-2.5 rounded-xl bg-black/50 border border-white/10 hover:border-amber-500/40 text-left flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0a0d14] border border-amber-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">Sombre Tech VIP</span>
                      <span className="text-[10px] text-slate-400 block">Noir & Or studio</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTheme(COSMETIC_LIGHT_THEME, 'Crème Cosmétique')}
                    className="p-2.5 rounded-xl bg-[#FAEFDD]/15 border border-[#DCC18A]/40 hover:border-[#A26F1C] text-left flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#FAEFDD] border border-[#A26F1C] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-200 block">Crème Beauté</span>
                      <span className="text-[10px] text-amber-300/70 block">Soin & Élégance</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* SÉLECTEURS DE COULEURS INDIVIDUELS */}
              <div className="space-y-2.5 pt-2 border-t border-white/5">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  Sélecteurs de Couleurs :
                </span>
                {[
                  { key: 'color_primary', label: 'Couleur Principale', desc: 'Accents, reflets, bordures actives' },
                  { key: 'color_secondary', label: 'Couleur Secondaire', desc: 'Survols, dégradés' },
                  { key: 'color_accent', label: 'Couleur Accentuation', desc: 'Badges, points forts' },
                  { key: 'color_bg_main', label: 'Fond Principal (Page)', desc: 'Couleur de fond du site' },
                  { key: 'color_bg_secondary', label: 'Fond Secondaire / Cartes', desc: 'Panneaux et cartes' },
                  { key: 'color_text_title', label: 'Couleur des Titres', desc: 'Grands titres h1, h2, h3' },
                  { key: 'color_text_main', label: 'Couleur du Texte', desc: 'Paragraphes et descriptions' },
                  { key: 'color_border', label: 'Couleur des Bordures', desc: 'Lignes de séparation' },
                  { key: 'color_btn_bg', label: 'Fond des Boutons', desc: 'Couleur du bouton d\'action' },
                  { key: 'color_btn_text', label: 'Texte des Boutons', desc: 'Lisibilité sur le bouton' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 hover:border-white/10"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form[item.key] || '#f59e0b'}
                        onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={form[item.key] || ''}
                        onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}
                        placeholder="#HEX"
                        className="w-20 px-2 py-1 bg-black/70 border border-white/10 rounded-lg text-white font-mono text-[11px] uppercase focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 2 : LOGO & IDENTITÉ (IMAGE OBLIGATOIRE)     */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-logo"
              className={`p-5 rounded-2xl border transition-all ${
                activeSection === 'logo'
                  ? 'bg-[#0e1422] border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#0d121c] border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Logo & Identité Visuelle</h3>
                  <p className="text-[11px] text-slate-400">Image officielle de votre marque (pas d'emoji)</p>
                </div>
              </div>

              {/* TÉLÉVERSEMENT IMAGE LOGO */}
              <div className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-3 mb-4">
                <label className="text-xs font-bold text-slate-200 block">
                  Logo Officiel de l'Entreprise (Image)
                </label>

                {cleanLogoUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-black/80 rounded-xl border border-white/10">
                    <img
                      src={cleanLogoUrl}
                      alt="Logo"
                      className="w-14 h-14 object-contain rounded-lg bg-white/5 border border-white/10 p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-emerald-400 block">✅ Logo Image Actif</span>
                      <span className="text-[11px] text-slate-400 block truncate font-mono">
                        {cleanLogoUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, company_logo_url: '' })}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Supprimer le logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-base shrink-0">
                      {brandInitials}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <span className="font-bold block text-white">Monogramme par défaut actif</span>
                      Téléversez le logo de votre client ci-dessous pour le remplacer par son image.
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{logoUploading ? 'Compression & Envoi...' : '📷 Téléverser une image de Logo'}</span>
                  </button>
                </div>
              </div>

              {/* NOM & TEXTES DE MARQUE */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Nom de l'Entreprise ou Marque
                  </label>
                  <input
                    type="text"
                    value={form.company_name || ''}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    placeholder="ex: Mon Entreprise ou Marque"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Slogan / Description courte sous le nom
                  </label>
                  <input
                    type="text"
                    value={form.tagline || ''}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="ex: Boutique & Soins Beauté Naturelle"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Badge de Marque à côté du logo
                  </label>
                  <input
                    type="text"
                    value={form.company_badge !== undefined ? form.company_badge : 'PRO'}
                    onChange={(e) => setForm({ ...form, company_badge: e.target.value })}
                    placeholder="ex: PRO, VIP, STUDIO (ou laissez vide)"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Laissez vide pour supprimer le petit rectangle doré "PRO".
                  </span>
                </div>

                {/* NUMÉRO WHATSAPP DE RÉCEPTION DES COMMANDES */}
                <div className="pt-3 border-t border-white/10">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <MessageCircle className="w-4 h-4 fill-emerald-400/20 text-emerald-400 shrink-0" />
                    Numéro WhatsApp de Réception des Commandes & Devis
                  </label>
                  <input
                    type="text"
                    value={form.whatsapp_number || ''}
                    onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                    placeholder="ex: +241 77 62 43 83 ou 24177624383"
                    className="w-full px-3 py-2 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono text-xs focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Tous les boutons du site ("Commander sur WhatsApp", devis, boutons d'action) enverront directement leurs commandes à ce numéro.
                  </span>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 2 BIS : BANDEAU D'ANNONCE & PROMO EN HAUT    */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-promo"
              className={`p-5 rounded-2xl border transition-all ${
                activeSection === 'promo'
                  ? 'bg-[#0e1422] border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#0d121c] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Bandeau d'Annonce Promo</h3>
                    <p className="text-[11px] text-slate-400">Ruban d'offre spéciale tout en haut du site</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection(activeSection === 'promo' ? '' : 'promo')}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {activeSection === 'promo' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              {activeSection === 'promo' && (
                <div className="mt-4 space-y-4 pt-3 border-t border-white/5">
                  <label className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-xl cursor-pointer hover:border-white/20">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Afficher le bandeau promotionnel en haut du site
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Affiche un ruban d'alerte pour vos soldes, offres ou livraisons
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.promo_banner_active === 'true' || form.promo_banner_active === true}
                      onChange={(e) => setForm({ ...form, promo_banner_active: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </label>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Texte de l'Annonce Promotionnelle
                    </label>
                    <textarea
                      rows={2}
                      value={form.promo_banner_text || ''}
                      onChange={(e) => setForm({ ...form, promo_banner_text: e.target.value })}
                      placeholder="ex: 🔥 OFFRE SPÉCIALE : -20% sur votre commande cette semaine !"
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Astuce : Utilisez des emojis (🔥, ✨, 🚚, 🎁) pour capter immédiatement l'attention.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 3 : HERO : BANNIÈRE VS TITRE H1 (EXCLUSIVE) */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-hero"
              className={`p-5 rounded-2xl border transition-all ${
                activeSection === 'hero'
                  ? 'bg-[#0e1422] border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#0d121c] border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Layout className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Section Hero (Accueil)</h3>
                  <p className="text-[11px] text-slate-400">
                    Choisissez entre la Bannière Affiche OU le Titre Principal H1
                  </p>
                </div>
              </div>

              {/* SÉLECTEUR EXCLUSIF HERO : SOIT BANNIÈRE SOIT TITRE H1 */}
              <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2 mb-4">
                <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">
                  Mode d'affichage au centre du Hero :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      form.hero_display_mode === 'banner'
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-black/40 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="hero_display_mode"
                      value="banner"
                      checked={form.hero_display_mode === 'banner'}
                      onChange={() => setForm({ ...form, hero_display_mode: 'banner' })}
                      className="accent-amber-500"
                    />
                    <span className="text-xs font-bold">🖼️ Bannière Visuelle Hero</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      form.hero_display_mode !== 'banner'
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-black/40 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="hero_display_mode"
                      value="text"
                      checked={form.hero_display_mode !== 'banner'}
                      onChange={() => setForm({ ...form, hero_display_mode: 'text' })}
                      className="accent-amber-500"
                    />
                    <span className="text-xs font-bold">📝 Titre Principal H1 Texte</span>
                  </label>
                </div>
              </div>

              {/* CONFIGURATION SI BANNIÈRE VISUELLE SÉLECTIONNÉE */}
              {form.hero_display_mode === 'banner' ? (
                <div className="p-4 bg-black/50 border border-amber-500/30 rounded-xl space-y-3 animate-in fade-in">
                  <span className="text-xs font-black text-amber-300 block">
                    Bannière Visuelle Téléversée (Prend la place du H1) :
                  </span>

                  {cleanHeroBannerUrl ? (
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                        <img
                          src={cleanHeroBannerUrl}
                          alt="Bannière Hero"
                          className="w-full h-36 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, hero_banner_image: '' })}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-md transition-colors"
                          title="Supprimer la bannière"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-amber-500/40 rounded-xl text-center text-xs text-slate-400">
                      Aucune bannière téléversée pour le moment.
                    </div>
                  )}

                  <input
                    ref={heroBannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadHeroBanner}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => heroBannerInputRef.current?.click()}
                    disabled={heroBannerUploading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {heroBannerUploading ? 'Optimisation WebP & Envoi...' : '📷 Téléverser la Bannière Hero'}
                    </span>
                  </button>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Lien au clic sur la bannière (facultatif)
                    </label>
                    <input
                      type="text"
                      value={form.hero_banner_link || ''}
                      onChange={(e) => setForm({ ...form, hero_banner_link: e.target.value })}
                      placeholder="ex: https://wa.me/... ou #videos-section"
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* CONFIGURATION SI TITRE H1 SÉLECTIONNÉ */
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Badge de Sur-Titre
                    </label>
                    <input
                      type="text"
                      value={form.hero_badge || ''}
                      onChange={(e) => setForm({ ...form, hero_badge: e.target.value })}
                      placeholder="ex: STUDIO DE CRÉATION VIDÉO"
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Titre Principal H1
                    </label>
                    <textarea
                      rows={2}
                      value={form.hero_title || ''}
                      onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                      placeholder="Des Vidéos & Affiches qui Captivent..."
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Sous-titre d'Accroche
                    </label>
                    <textarea
                      rows={3}
                      value={form.hero_subtitle || ''}
                      onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
                      placeholder="Ne laissez plus vos prospects défiler..."
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 3B : SECTION À PROPOS (3 PHOTOS & HISTOIRE)  */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-about"
              className={`p-5 rounded-2xl border transition-all ${
                activeSection === 'about'
                  ? 'bg-[#0e1422] border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#0d121c] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Section À Propos & Histoire</h3>
                    <p className="text-[11px] text-slate-400">Présentation, 3 photos & disposition</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-1 rounded-xl border border-white/10 hover:border-white/20">
                  <input
                    type="checkbox"
                    checked={form.show_about_section !== false && form.show_about_section !== 'false'}
                    onChange={(e) => setForm({ ...form, show_about_section: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-300">Activer</span>
                </label>
              </div>

              {/* SÉLECTEUR DE DISPOSITION (LAYOUT : GAUCHE, CENTRE, DROITE) */}
              <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2 mb-4">
                <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">
                  Disposition des 3 photos :
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'left', label: 'À Gauche', icon: '🖼️ Texte Droite' },
                    { id: 'center', label: 'Au Centre', icon: '🖼️ 3 Colonnes' },
                    { id: 'right', label: 'À Droite', icon: 'Texte Gauche 🖼️' },
                  ].map((pos) => {
                    const isSelected = (form.about_layout || 'right') === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setForm({ ...form, about_layout: pos.id })}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/50'
                            : 'bg-black/40 border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <span className="text-xs font-bold block">{pos.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{pos.icon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CHAMPS TEXTUELS DE LA SECTION À PROPOS */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Badge / Surtitre :
                  </label>
                  <input
                    type="text"
                    value={form.about_badge || ''}
                    onChange={(e) => setForm({ ...form, about_badge: e.target.value })}
                    placeholder="NOTRE HISTOIRE & SAVOIR-FAIRE"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Grand Titre :
                  </label>
                  <input
                    type="text"
                    value={form.about_title || ''}
                    onChange={(e) => setForm({ ...form, about_title: e.target.value })}
                    placeholder="L’Excellence et la Passion au Cœur de nos Créations"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Sous-titre d'introduction :
                  </label>
                  <input
                    type="text"
                    value={form.about_subtitle || ''}
                    onChange={(e) => setForm({ ...form, about_subtitle: e.target.value })}
                    placeholder="Découvrez notre vision, nos valeurs et nos engagements de qualité."
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Histoire & Description détaillée :
                  </label>
                  <textarea
                    rows={4}
                    value={form.about_description || ''}
                    onChange={(e) => setForm({ ...form, about_description: e.target.value })}
                    placeholder="Racontez l'histoire de la marque, vos valeurs, vos ingrédients..."
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Texte du Bouton d'Action WhatsApp :
                  </label>
                  <input
                    type="text"
                    value={form.about_cta_text || ''}
                    onChange={(e) => setForm({ ...form, about_cta_text: e.target.value })}
                    placeholder="Échanger avec nous sur WhatsApp"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* LES 3 PHOTOS DE LA SECTION À PROPOS */}
              <div className="pt-3 border-t border-white/10 space-y-4">
                <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">
                  Les 3 Photos de Présentation :
                </span>

                {[1, 2, 3].map((num) => {
                  const key = `about_photo${num}`;
                  const currentPhotoUrl = getCleanImageUrl(form[key]);
                  const isUploading = aboutPhotoUploading[num];
                  const inputRef = num === 1 ? aboutPhoto1InputRef : num === 2 ? aboutPhoto2InputRef : aboutPhoto3InputRef;

                  return (
                    <div
                      key={num}
                      className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">
                            {num}
                          </span>
                          Photo #{num} {num === 1 ? '(Grande photo mise en avant)' : '(Photo secondaire)'}
                        </span>
                        {currentPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, [key]: '' })}
                            className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Retirer
                          </button>
                        )}
                      </div>

                      {/* Aperçu miniature */}
                      {currentPhotoUrl && (
                        <div className="h-28 rounded-lg overflow-hidden border border-white/10 relative bg-black/50 group">
                          <img
                            src={currentPhotoUrl}
                            alt={`Photo À Propos #${num}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Upload direct et URL */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={inputRef}
                          onChange={(e) => handleUploadAboutPhoto(num, e)}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => inputRef.current?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploading ? 'Téléversement...' : `Changer photo ${num}`}</span>
                        </button>

                        <input
                          type="text"
                          value={form[key] || ''}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          placeholder="Ou collez l'URL de l'image..."
                          className="flex-1 px-3 py-2 bg-black/70 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 4 : BOUTONS & REDIRECTIONS                   */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-buttons"
              className={`p-5 rounded-2xl border transition-all ${
                activeSection === 'buttons'
                  ? 'bg-[#0e1422] border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#0d121c] border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <MousePointer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Boutons d'Action & Liens</h3>
                  <p className="text-[11px] text-slate-400">
                    Configurez le texte et les liens de redirection de chaque bouton
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* BOUTON 1 */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-400">Bouton 1 (Principal)</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.hero_btn1_show !== false && form.hero_btn1_show !== 'false'}
                        onChange={(e) => setForm({ ...form, hero_btn1_show: e.target.checked })}
                        className="accent-amber-500"
                      />
                      <span>Afficher</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Texte</label>
                      <input
                        type="text"
                        value={form.hero_btn1_text !== undefined ? form.hero_btn1_text : (form.hero_cta_primary || 'Voir les Vidéos')}
                        onChange={(e) => setForm({ ...form, hero_btn1_text: e.target.value, hero_cta_primary: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Lien de redirection</label>
                      <input
                        type="text"
                        value={form.hero_btn1_link || '#videos-section'}
                        onChange={(e) => setForm({ ...form, hero_btn1_link: e.target.value })}
                        placeholder="#videos-section ou https://..."
                        className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* BOUTON 2 (WHATSAPP) */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-400">Bouton 2 (WhatsApp)</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.hero_btn2_show !== false && form.hero_btn2_show !== 'false'}
                        onChange={(e) => setForm({ ...form, hero_btn2_show: e.target.checked })}
                        className="accent-emerald-500"
                      />
                      <span>Afficher</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Texte</label>
                      <input
                        type="text"
                        value={form.hero_btn2_text !== undefined ? form.hero_btn2_text : (form.hero_cta_whatsapp || 'Commander sur WhatsApp')}
                        onChange={(e) => setForm({ ...form, hero_btn2_text: e.target.value, hero_cta_whatsapp: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Lien personnalisé (optionnel)</label>
                      <input
                        type="text"
                        value={form.hero_btn2_link || ''}
                        onChange={(e) => setForm({ ...form, hero_btn2_link: e.target.value })}
                        placeholder="Laissez vide pour lien WhatsApp auto"
                        className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* BOUTON 3 */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-300">Bouton 3 (Simulateur Devis / Autre)</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.hero_btn3_show !== false && form.hero_btn3_show !== 'false'}
                        onChange={(e) => setForm({ ...form, hero_btn3_show: e.target.checked })}
                        className="accent-amber-500"
                      />
                      <span>Afficher</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Texte</label>
                      <input
                        type="text"
                        value={form.hero_btn3_text || 'Simulateur Devis'}
                        onChange={(e) => setForm({ ...form, hero_btn3_text: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Lien de redirection</label>
                      <input
                        type="text"
                        value={form.hero_btn3_link || '#devis-section'}
                        onChange={(e) => setForm({ ...form, hero_btn3_link: e.target.value })}
                        placeholder="#devis-section ou https://..."
                        className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* BOUTON 4 (AJOUTABLE) */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-cyan-400">+ Bouton 4 Additionnel</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.hero_btn4_show === true || form.hero_btn4_show === 'true'}
                        onChange={(e) => setForm({ ...form, hero_btn4_show: e.target.checked })}
                        className="accent-cyan-500"
                      />
                      <span>Activer</span>
                    </label>
                  </div>
                  {(form.hero_btn4_show === true || form.hero_btn4_show === 'true') && (
                    <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Texte</label>
                        <input
                          type="text"
                          value={form.hero_btn4_text || ''}
                          onChange={(e) => setForm({ ...form, hero_btn4_text: e.target.value })}
                          placeholder="ex: Nos Formules"
                          className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Lien de redirection</label>
                        <input
                          type="text"
                          value={form.hero_btn4_link || ''}
                          onChange={(e) => setForm({ ...form, hero_btn4_link: e.target.value })}
                          placeholder="ex: #packages-section"
                          className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 5 : STATISTIQUES (COMPTEURS)                 */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-stats"
              className={`p-5 rounded-2xl border transition-all ${
                activeSection === 'stats'
                  ? 'bg-[#0e1422] border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#0d121c] border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Chiffres & Statistiques</h3>
                  <p className="text-[11px] text-slate-400">Les 4 indicateurs de réassurance sous le Hero</p>
                </div>
              </div>

              <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Compteurs Réels 100% Automatiques
                </span>
                <p>
                  Les indicateurs <strong>#1 (Vues du site)</strong> et <strong>#2 (Visiteurs uniques)</strong> se mettent à jour automatiquement avec le trafic réel enregistré dans votre base Cloudflare D1. Vous pouvez personnaliser leurs libellés ci-dessous.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="p-2.5 bg-black/50 border border-white/5 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-400 block">Indicateur #{num}</span>
                    <input
                      type="text"
                      value={form[`stat${num}_value`] || ''}
                      onChange={(e) => setForm({ ...form, [`stat${num}_value`]: e.target.value })}
                      placeholder="Chiffre (ex: +120M)"
                      className="w-full px-2 py-1 bg-black/70 border border-white/10 rounded-lg text-white text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={form[`stat${num}_label`] || ''}
                      onChange={(e) => setForm({ ...form, [`stat${num}_label`]: e.target.value })}
                      placeholder="Libellé"
                      className="w-full px-2 py-1 bg-black/70 border border-white/10 rounded-lg text-slate-300 text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 6 : GARANTIES & ENGAGEMENTS                  */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-guarantees"
              className={`p-5 rounded-2xl border transition-all ${
                activeSection === 'guarantees'
                  ? 'bg-[#0e1422] border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#0d121c] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Garanties & Engagements</h3>
                    <p className="text-[11px] text-slate-400">4 engagements de confiance client</p>
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.show_guarantees !== false && form.show_guarantees !== 'false'}
                    onChange={(e) => setForm({ ...form, show_guarantees: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span>Activer</span>
                </label>
              </div>

              <div className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="p-2.5 bg-black/50 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-300 block">Garantie #{num}</span>
                    <input
                      type="text"
                      value={form[`guarantee${num}_title`] || ''}
                      onChange={(e) => setForm({ ...form, [`guarantee${num}_title`]: e.target.value })}
                      placeholder="Titre de la garantie"
                      className="w-full px-2 py-1 bg-black/70 border border-white/10 rounded-lg text-white text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={form[`guarantee${num}_sub`] || ''}
                      onChange={(e) => setForm({ ...form, [`guarantee${num}_sub`]: e.target.value })}
                      placeholder="Description courte"
                      className="w-full px-2 py-1 bg-black/70 border border-white/10 rounded-lg text-slate-300 text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 7 : TITRES DES SECTIONS & CATALOGUES         */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-sections"
              className={`p-5 rounded-2xl border transition-all ${
                activeSection === 'sections'
                  ? 'bg-[#0e1422] border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#0d121c] border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Titres & Textes du Catalogue</h3>
                  <p className="text-[11px] text-slate-400">Titres des rubriques Vidéos, Affiches, Packs, Devis</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Rubrique Vidéos */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 block">Section Vidéos</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Badge au-dessus du titre</label>
                    <input
                      type="text"
                      value={form.videos_badge || ''}
                      onChange={(e) => setForm({ ...form, videos_badge: e.target.value })}
                      placeholder="ex: Galerie Vidéo & Présentation"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-amber-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Titre principal</label>
                    <input
                      type="text"
                      value={form.videos_title || ''}
                      onChange={(e) => setForm({ ...form, videos_title: e.target.value })}
                      placeholder="Titre Vidéos"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Sous-titre explicatif</label>
                    <input
                      type="text"
                      value={form.videos_subtitle || ''}
                      onChange={(e) => setForm({ ...form, videos_subtitle: e.target.value })}
                      placeholder="Sous-titre Vidéos"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-slate-300 text-[11px]"
                    />
                  </div>
                </div>

                {/* Rubrique Affiches / Galerie Photos */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-cyan-400 block">Section Affiches & Visuels Photos (Galerie)</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Badge au-dessus du titre (ex: DIRECTION ARTISTIQUE & GRAPHISME ou NOS PRODUITS)</label>
                    <input
                      type="text"
                      value={form.posters_badge || ''}
                      onChange={(e) => setForm({ ...form, posters_badge: e.target.value })}
                      placeholder="ex: DIRECTION ARTISTIQUE & GRAPHISME ou NOS PRODUITS EN IMAGE"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-cyan-500/30 focus:border-cyan-400 rounded-lg text-cyan-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Titre principal (ex: Affiches & Visuels Publicitaires ou Galerie Produits)</label>
                    <input
                      type="text"
                      value={form.posters_title || ''}
                      onChange={(e) => setForm({ ...form, posters_title: e.target.value })}
                      placeholder="ex: Affiches & Visuels Publicitaires ou Nos Produits"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 focus:border-amber-400 rounded-lg text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Sous-titre descriptif</label>
                    <input
                      type="text"
                      value={form.posters_subtitle || ''}
                      onChange={(e) => setForm({ ...form, posters_subtitle: e.target.value })}
                      placeholder="ex: découvrez nos produits en Image"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 focus:border-amber-400 rounded-lg text-slate-300 text-[11px]"
                    />
                  </div>
                </div>

                {/* Rubrique Packs */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 block">Section Formules & Packs</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Badge au-dessus du titre</label>
                    <input
                      type="text"
                      value={form.packages_badge || ''}
                      onChange={(e) => setForm({ ...form, packages_badge: e.target.value })}
                      placeholder="ex: Formules & Packs Sur-Mesure"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-amber-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Titre principal</label>
                    <input
                      type="text"
                      value={form.packages_title || ''}
                      onChange={(e) => setForm({ ...form, packages_title: e.target.value })}
                      placeholder="Titre Packs"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Sous-titre explicatif</label>
                    <input
                      type="text"
                      value={form.packages_subtitle || ''}
                      onChange={(e) => setForm({ ...form, packages_subtitle: e.target.value })}
                      placeholder="Sous-titre Packs"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-slate-300 text-[11px]"
                    />
                  </div>
                </div>

                {/* Rubrique Devis */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-purple-400 block">Section Simulateur de Devis</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Badge au-dessus du titre</label>
                    <input
                      type="text"
                      value={form.devis_section_badge || ''}
                      onChange={(e) => setForm({ ...form, devis_section_badge: e.target.value })}
                      placeholder="ex: Devis Instantané en Ligne"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-purple-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Titre principal</label>
                    <input
                      type="text"
                      value={form.devis_section_title || ''}
                      onChange={(e) => setForm({ ...form, devis_section_title: e.target.value })}
                      placeholder="Titre Simulateur Devis"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Sous-titre explicatif</label>
                    <input
                      type="text"
                      value={form.devis_section_subtitle || ''}
                      onChange={(e) => setForm({ ...form, devis_section_subtitle: e.target.value })}
                      placeholder="Sous-titre Devis"
                      className="w-full px-2.5 py-1.5 bg-black/70 border border-white/10 rounded-lg text-slate-300 text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 8 : ACTIVATION DES MODULES                   */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-modules"
              className={`p-5 rounded-2xl border transition-all ${
                activeSection === 'modules'
                  ? 'bg-[#0e1422] border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#0d121c] border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Activation des Modules (1 Clic)</h3>
                  <p className="text-[11px] text-slate-400">Masquez ou affichez les modules sur le site public</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { key: 'show_cart', label: 'Panier Multi-Articles (WhatsApp)', sub: 'Cumul d\'articles et commande groupée en 1 seul message' },
                  { key: 'show_devis_calculator', label: 'Simulateur de Devis Express', sub: 'Calculateur chiffré WhatsApp' },
                  { key: 'show_videos_section', label: 'Catalogue Vidéos', sub: 'Lecteur et galerie vidéos' },
                  { key: 'show_posters_section', label: 'Catalogue Affiches', sub: 'Galerie affiches et visuels' },
                  { key: 'show_packages_section', label: 'Formules & Packs', sub: 'Tarifs et abonnements' },
                ].map((mod) => (
                  <label
                    key={mod.key}
                    className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-white/15"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{mod.label}</span>
                      <span className="text-[10px] text-slate-400 block">{mod.sub}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={form[mod.key] !== false && form[mod.key] !== 'false'}
                      onChange={(e) => setForm({ ...form, [mod.key]: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 9 : PIED DE PAGE & BAS DE SITE (FOOTER)      */}
            {/* ---------------------------------------------------- */}
            <div
              id="studio-section-footer"
              className={`rounded-2xl border transition-all ${
                activeSection === 'footer'
                  ? 'border-amber-500/50 bg-[#0e1422] p-4 shadow-lg'
                  : 'border-white/5 bg-black/20 p-3 hover:border-white/10'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === 'footer' ? '' : 'footer')}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-white">
                    Pied de Page & Bas de Site (Footer)
                  </span>
                </div>
                {activeSection === 'footer' ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeSection === 'footer' && (
                <div className="mt-4 space-y-4 pt-3 border-t border-white/5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Description de l'Entreprise dans le Pied de Page
                    </label>
                    <textarea
                      rows={3}
                      value={form.footer_description || ''}
                      onChange={(e) => setForm({ ...form, footer_description: e.target.value })}
                      placeholder="Texte de présentation affiché sous le logo en bas de page..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Si vide, la description générale de la marque est reprise automatiquement.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Titre du Bloc Contact
                      </label>
                      <input
                        type="text"
                        value={form.footer_contact_title || ''}
                        onChange={(e) => setForm({ ...form, footer_contact_title: e.target.value })}
                        placeholder="ex: Contact Instantané"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Texte du Bouton WhatsApp
                      </label>
                      <input
                        type="text"
                        value={form.footer_contact_btn_text || ''}
                        onChange={(e) => setForm({ ...form, footer_contact_btn_text: e.target.value })}
                        placeholder="ex: Commencer sur WhatsApp"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Sous-texte de Réassurance Contact
                    </label>
                    <textarea
                      rows={2}
                      value={form.footer_contact_subtext || ''}
                      onChange={(e) => setForm({ ...form, footer_contact_subtext: e.target.value })}
                      placeholder="ex: Réponse garantie sous 1h en semaine. Livraison rapide."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Texte Copyright & Droits
                      </label>
                      <input
                        type="text"
                        value={form.footer_copyright_text || ''}
                        onChange={(e) => setForm({ ...form, footer_copyright_text: e.target.value })}
                        placeholder={`ex: © ${new Date().getFullYear()} ${form.company_name || 'Entreprise'} — Tous droits réservés`}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Badge de Réassurance (Bas de page)
                      </label>
                      <input
                        type="text"
                        value={form.footer_badge_text || ''}
                        onChange={(e) => setForm({ ...form, footer_badge_text: e.target.value })}
                        placeholder="ex: Haute Performance · Sécurisé · Service Client 7j/7"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-white/15">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Afficher les Liens de Navigation
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Liens rapides vers les sections actives
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.footer_show_links !== false && form.footer_show_links !== 'false'}
                        onChange={(e) => setForm({ ...form, footer_show_links: e.target.checked })}
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-white/15">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Afficher le Bloc Contact WhatsApp
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Bouton d'échange direct et sous-texte
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.footer_show_contact !== false && form.footer_show_contact !== 'false'}
                        onChange={(e) => setForm({ ...form, footer_show_contact: e.target.checked })}
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )}

        {/* ====================================================== */}
        {/* COLONNE DROITE : APERÇU EN TEMPS RÉEL (INTERACTIF)     */}
        {/* ====================================================== */}
        <div
          id="studio-live-preview-pane"
          ref={previewPaneRef}
          className="flex-1 min-h-0 min-w-0 h-full bg-[#05070b] overflow-y-auto overflow-x-hidden p-4 sm:p-6 relative"
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Badge interactif flottant et Boutons de Défilement Rapide */}
          <div className="sticky top-0 z-30 mb-4 flex items-center justify-between gap-3 pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-500/40 text-[11px] font-bold text-amber-300 shadow-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Aperçu synchronisé en direct • Cliquez pour modifier</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-2 py-1 rounded-xl border border-white/15 shadow-xl">
              <button
                type="button"
                onClick={() => previewPaneRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500 hover:text-black text-slate-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Défiler tout en haut"
              >
                ▲ Haut
              </button>
              <button
                type="button"
                onClick={() => previewPaneRef.current?.scrollTo({ top: previewPaneRef.current.scrollHeight, behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500 hover:text-black text-slate-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Défiler tout en bas"
              >
                ▼ Bas
              </button>
            </div>
          </div>

          {/* CONTENEUR DE L'APERÇU (ADAPTABLE DESKTOP OU SMARTPHONE HAUTE-FIDÉLITÉ) */}
          {isRestaurantLayout ? (
            <div className="w-full flex flex-col items-center justify-center py-2">
              {/* Cadre Smartphone Haute-Fidélité Restaurant Gourmet Glassmorphic */}
              <div className="w-[390px] max-w-full h-[780px] bg-slate-950 rounded-[48px] border-[8px] border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative flex flex-col overflow-hidden mx-auto my-2 ring-1 ring-teal-500/30 shrink-0">
                {/* Barre d'état smartphone Glassmorphic */}
                <div className="w-full bg-[#07181c] pt-2.5 px-6 pb-1.5 flex justify-between items-center text-[10px] font-bold text-teal-300 shrink-0 select-none z-30 border-b border-teal-500/20">
                  <span>9:41</span>
                  <div className="w-20 h-4 bg-black/60 rounded-full mx-auto flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-teal-400 mr-1.5 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <span className="font-mono flex items-center gap-1 text-teal-300">5G 100%</span>
                </div>

                {/* Écran scrollable de l'app restaurant */}
                <div className="w-full flex-1 overflow-y-auto scrollbar-none relative bg-[#07181c]">
                  <RestaurantGourmetView
                    settings={form}
                    posters={posters}
                    currency={form.default_currency || 'XAF'}
                    whatsappNumber={form.whatsapp_number || '24177624383'}
                    isPreview={true}
                  />
                </div>

                {/* Barre Home iPhone en bas */}
                <div className="w-full bg-[#07181c] py-1.5 flex justify-center items-center shrink-0 border-t border-teal-500/10">
                  <div className="w-28 h-1 bg-teal-400/40 rounded-full" />
                </div>
              </div>
            </div>
          ) : isRentalLayout ? (
            <div className="w-full flex flex-col items-center justify-center py-2">
              {/* Cadre Smartphone Haute-Fidélité iPhone avec Dynamic Island & Écran Scrollable Interne */}
              <div className="w-[380px] max-w-full h-[760px] bg-slate-950 rounded-[48px] border-[8px] border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative flex flex-col overflow-hidden mx-auto my-2 ring-1 ring-white/10 shrink-0">
                {/* Dynamic Island & Barre d'état */}
                <div className="w-full bg-[#0062FF] pt-2.5 px-6 pb-1.5 flex justify-between items-center text-[10px] font-bold text-white shrink-0 select-none z-30">
                  <span>9:41</span>
                  <div className="w-20 h-4 bg-black/60 rounded-full mx-auto flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <span className="font-mono flex items-center gap-1">5G 100%</span>
                </div>

                {/* Écran scrollable interne */}
                <div className="w-full flex-1 overflow-y-auto scrollbar-none relative bg-[#F0F4FA]">
                  <NeumorphicRentalView
                    settings={form}
                    posters={posters}
                    currency={form.default_currency || 'XAF'}
                    whatsappNumber={form.whatsapp_number || '24162744533'}
                    isPreview={true}
                  />
                </div>

                {/* Barre Home iPhone en bas */}
                <div className="w-full bg-slate-900 py-1.5 flex justify-center items-center shrink-0">
                  <div className="w-28 h-1 bg-white/40 rounded-full" />
                </div>
              </div>
            </div>
          ) : isAbaiaCosmetiqueLayout ? (
            <div className="w-full flex flex-col items-center justify-center py-2 animate-in fade-in duration-300">
              {previewDevice === 'mobile' ? (
                /* Cadre Smartphone Haute-Fidélité iPhone avec Rendu Glassmorphic 3D 2 Colonnes */
                <div className="w-[390px] max-w-full h-[790px] bg-slate-950 rounded-[48px] border-[8px] border-amber-950/60 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative flex flex-col overflow-hidden mx-auto my-2 ring-2 ring-amber-500/30 shrink-0">
                  {/* Dynamic Island & Barre d'état */}
                  <div className="w-full bg-slate-950/85 pt-2.5 px-6 pb-1.5 flex justify-between items-center text-[10px] font-bold text-amber-300 shrink-0 select-none z-30 border-b border-amber-500/20 backdrop-blur-md">
                    <span>9:41</span>
                    <div className="w-20 h-4 bg-black/70 rounded-full mx-auto flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    </div>
                    <span className="font-mono flex items-center gap-1 text-amber-300">5G 100%</span>
                  </div>

                  {/* Écran scrollable interne rendu AbaiaCosmetiqueGlassView avec mise en page mobile adaptée */}
                  <div className="w-full flex-1 overflow-y-auto scrollbar-none relative">
                    <AbaiaCosmetiqueGlassView
                      settings={form}
                      posters={posters}
                      currency={form.default_currency || 'FCFA'}
                      whatsappNumber={form.whatsapp_number || '237698548016'}
                      isPreview={true}
                      forceMobileLayout={true}
                    />
                  </div>

                  {/* Barre Home iPhone en bas */}
                  <div className="w-full bg-slate-950/90 py-1.5 flex justify-center items-center shrink-0 border-t border-amber-500/10">
                    <div className="w-28 h-1 bg-amber-400/40 rounded-full" />
                  </div>
                </div>
              ) : (
                /* Rendu Plein Écran Ordinateur Haute-Fidélité et Spacieux */
                <div className="w-full max-w-full bg-slate-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden my-2">
                  {/* Barre de navigation navigateur simulée */}
                  <div className="w-full bg-slate-900/90 px-4 py-2.5 flex items-center justify-between border-b border-white/10 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="flex-1 max-w-md mx-auto bg-black/50 rounded-lg px-3 py-1 text-[11px] font-mono text-center text-amber-300/90 border border-white/5 truncate">
                      https://abaia-cosmetique.mynexus.workers.dev
                    </div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      Vue Ordinateur Large
                    </div>
                  </div>
                  <div className="w-full overflow-y-auto relative">
                    <AbaiaCosmetiqueGlassView
                      settings={form}
                      posters={posters}
                      currency={form.default_currency || 'FCFA'}
                      whatsappNumber={form.whatsapp_number || '237698548016'}
                      isPreview={true}
                      forceMobileLayout={false}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`transition-all duration-300 w-full mx-auto pb-36 rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${
                previewDevice === 'mobile'
                  ? 'max-w-[390px] border-[6px] border-slate-800 rounded-[40px] shadow-[0_25px_60px_rgba(0,0,0,0.9)] my-4'
                  : 'max-w-[1200px]'
              }`}
              style={{
                backgroundColor: currentBgMain,
                color: currentTextMain,
              }}
            >
              <>
                {/* 0. BANDEAU PROMOTIONNEL / ANNONCE EN HAUT (CLIQUABLE) */}
            {(form.promo_banner_active === true || form.promo_banner_active === 'true') && form.promo_banner_text && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectSectionFromPreview('promo');
                }}
                className="group/promo relative bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-black py-2.5 px-4 font-bold text-xs md:text-sm text-center flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-105 transition-all z-20"
              >
                <div className="absolute top-1 right-2 opacity-0 group-hover/promo:opacity-100 bg-black text-amber-300 px-2 py-0.5 rounded text-[10px] font-extrabold shadow-md transition-opacity">
                  ✏️ Modifier l'Annonce
                </div>
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{form.promo_banner_text}</span>
              </div>
            )}

            {/* 1. BARRE DE NAVIGATION APERÇU (CLIQUABLE) */}
            <div
              onClick={() => handleSelectSectionFromPreview('logo')}
              className="group/nav relative border-b border-white/10 transition-all cursor-pointer hover:ring-2 hover:ring-amber-500/50"
              style={{ backgroundColor: currentBgSec }}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover/nav:opacity-100 bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-extrabold shadow-md z-30 transition-opacity">
                ✏️ Modifier Logo & En-tête
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {cleanLogoUrl ? (
                    <img
                      src={cleanLogoUrl}
                      alt="Logo"
                      className="w-10 h-10 object-contain rounded-xl bg-white/5 border border-white/10 p-1 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-sm shadow-md">
                      {brandInitials}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-extrabold text-sm sm:text-base tracking-tight"
                        style={{ color: currentTextTitle }}
                      >
                        {form.company_name || 'Notre Entreprise'}
                      </span>
                      {form.company_badge && (
                        <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                          {form.company_badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px]" style={{ color: currentTextMuted }}>
                      {form.tagline || 'Site Officiel'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-black/40 text-slate-300">
                    FCFA / EUR
                  </span>
                  <div
                    className="px-3 py-1 rounded-lg text-white font-bold text-xs flex items-center gap-1.5"
                    style={{ backgroundColor: '#25d366' }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. SECTION HERO APERÇU (CLIQUABLE) */}
            <div
              onClick={() => handleSelectSectionFromPreview('hero')}
              className="group/hero relative p-6 sm:p-10 text-center border-b border-white/10 transition-all cursor-pointer hover:ring-2 hover:ring-amber-500/50"
              style={{ backgroundColor: currentBgMain }}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover/hero:opacity-100 bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-extrabold shadow-md z-30 transition-opacity">
                ✏️ Modifier Hero (Bannière ou H1)
              </div>

              {/* Top Pill Badge */}
              {form.hero_badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-amber-500/30 text-[11px] font-semibold text-amber-300 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{form.hero_badge}</span>
                </div>
              )}

              {/* CENTRE DU HERO : SOIT BANNIÈRE HERO SOIT TITRE H1 */}
              {isHeroBannerMode ? (
                <div className="my-2 max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
                  <img
                    src={cleanHeroBannerUrl}
                    alt="Bannière"
                    className="w-full max-h-[360px] object-cover"
                  />
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-3 mb-6">
                  <h1
                    className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
                    style={{ color: currentTextTitle }}
                  >
                    {form.hero_title || 'Des Vidéos & Affiches qui Captivent et Font Exploser vos Ventes'}
                  </h1>
                  <p
                    className="text-xs sm:text-sm max-w-xl mx-auto leading-relaxed"
                    style={{ color: currentTextMuted }}
                  >
                    {form.hero_subtitle || 'Ne laissez plus vos prospects défiler sans s\'arrêter...'}
                  </p>
                </div>
              )}

              {/* BOUTONS D'ACTION DU HERO */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
                {form.hero_btn1_show !== false && form.hero_btn1_show !== 'false' && (
                  <div
                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg"
                    style={{
                      backgroundColor: currentBtnBg,
                      color: currentBtnText,
                    }}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{form.hero_btn1_text || form.hero_cta_primary || 'Voir les Vidéos'}</span>
                  </div>
                )}

                {form.hero_btn2_show !== false && form.hero_btn2_show !== 'false' && (
                  <div className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 bg-[#25d366] text-white shadow-lg">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{form.hero_btn2_text || form.hero_cta_whatsapp || 'Commander sur WhatsApp'}</span>
                  </div>
                )}

                {form.hero_btn3_show !== false && form.hero_btn3_show !== 'false' && (
                  <div
                    className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: currentBorder,
                      color: currentTextTitle,
                    }}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{form.hero_btn3_text || 'Simulateur Devis'}</span>
                  </div>
                )}

                {(form.hero_btn4_show === true || form.hero_btn4_show === 'true') && form.hero_btn4_text && (
                  <div
                    className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border border-cyan-500/40 text-cyan-300"
                    style={{ backgroundColor: 'rgba(6,182,212,0.1)' }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{form.hero_btn4_text}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. SECTION STATISTIQUES APERÇU (CLIQUABLE) */}
            <div
              onClick={() => handleSelectSectionFromPreview('stats')}
              className="group/stats relative p-4 border-b border-white/10 transition-all cursor-pointer hover:ring-2 hover:ring-amber-500/50"
              style={{ backgroundColor: currentBgSec }}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover/stats:opacity-100 bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-extrabold shadow-md z-30 transition-opacity">
                ✏️ Modifier Chiffres & Stats
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className="p-3 rounded-xl border"
                    style={{
                      backgroundColor: currentBgCard,
                      borderColor: currentBorder,
                    }}
                  >
                    <div
                      className="text-base sm:text-xl font-black"
                      style={{
                        color:
                          num === 1
                            ? currentPrimary
                            : num === 2
                            ? currentTextTitle
                            : num === 3
                            ? '#10b981'
                            : currentSecondary,
                      }}
                    >
                      {form[`stat${num}_value`] || '+100'}
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: currentTextMuted }}>
                      {form[`stat${num}_label`] || 'Label'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. SECTION GARANTIES APERÇU (CLIQUABLE) */}
            {form.show_guarantees !== false && form.show_guarantees !== 'false' && (
              <div
                onClick={() => handleSelectSectionFromPreview('guarantees')}
                className="group/guar relative p-6 border-b border-white/10 transition-all cursor-pointer hover:ring-2 hover:ring-amber-500/50"
                style={{ backgroundColor: currentBgMain }}
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover/guar:opacity-100 bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-extrabold shadow-md z-30 transition-opacity">
                  ✏️ Modifier Garanties
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {[1, 2, 3, 4].map((num) => (
                    <div
                      key={num}
                      className="p-3 rounded-xl border flex flex-col items-center justify-center"
                      style={{
                        backgroundColor: currentBgCard,
                        borderColor: currentBorder,
                      }}
                    >
                      <span className="text-xl mb-1">{form[`guarantee${num}_emoji`] || '⚡'}</span>
                      <span className="text-xs font-bold block" style={{ color: currentTextTitle }}>
                        {form[`guarantee${num}_title`] || 'Garantie'}
                      </span>
                      <span className="text-[10px] block mt-0.5" style={{ color: currentTextMuted }}>
                        {form[`guarantee${num}_sub`] || 'Détail'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. APERÇU CATALOGUES (VIDÉOS & AFFICHES) */}
            <div
              onClick={() => handleSelectSectionFromPreview('sections')}
              className="group/cat relative p-6 transition-all cursor-pointer hover:ring-2 hover:ring-amber-500/50"
              style={{ backgroundColor: currentBgSec }}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover/cat:opacity-100 bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-extrabold shadow-md z-30 transition-opacity">
                ✏️ Modifier Titres du Catalogue
              </div>

              <div className="text-center max-w-md mx-auto mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  {form.videos_badge || 'Catalogue Publicitaire'}
                </span>
                <h3 className="text-lg sm:text-xl font-black" style={{ color: currentTextTitle }}>
                  {form.videos_title || 'Nos Réalisations'}
                </h3>
                <p className="text-[11px] mt-1" style={{ color: currentTextMuted }}>
                  {form.videos_subtitle || 'Découvrez nos réalisations en direct'}
                </p>
              </div>

              {/* Échantillon de cartes pour visualisation du thème */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((card) => (
                  <div
                    key={card}
                    className="rounded-xl border overflow-hidden p-2.5 space-y-2"
                    style={{
                      backgroundColor: currentBgCard,
                      borderColor: currentBorder,
                    }}
                  >
                    <div className="h-20 rounded-lg bg-black/40 flex items-center justify-center text-xs text-slate-500 font-bold">
                      Visuel Produit #{card}
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold block truncate" style={{ color: currentTextTitle }}>
                        Formule VIP #{card}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black" style={{ color: currentPrimary }}>
                          25 000 FCFA
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          TOP VENTE
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5B. APERÇU SECTION AFFICHES / GALERIE PHOTOS (CLIQUABLE) */}
            {form.show_posters_section !== false && form.show_posters_section !== 'false' && (
              <div
                onClick={() => handleSelectSectionFromPreview('sections')}
                className="group/posters relative p-6 border-t border-white/10 transition-all cursor-pointer hover:ring-2 hover:ring-cyan-500/50"
                style={{ backgroundColor: currentBgMain }}
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover/posters:opacity-100 bg-cyan-500 text-black px-2 py-0.5 rounded text-[10px] font-extrabold shadow-md z-30 transition-opacity">
                  ✏️ Modifier Affiches & Visuels Photos
                </div>

                <div className="text-center max-w-md mx-auto mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2 bg-cyan-500/10 border border-cyan-500/20">
                    <ImageIcon className="w-3 h-3" />
                    <span>{form.posters_badge || 'Catalogue & Galerie Photos'}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black" style={{ color: currentTextTitle }}>
                    {form.posters_title || 'Nos Produits & Visuels'}
                  </h3>
                  <p className="text-[11px] mt-1" style={{ color: currentTextMuted }}>
                    {form.posters_subtitle || 'Découvrez nos sélections, produits et réalisations en image.'}
                  </p>
                </div>

                {/* Échantillon de cartes Affiches pour visualisation du rendu */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(posters && posters.length > 0 ? posters.slice(0, 4) : [1, 2, 3, 4]).map((p, idx) => {
                    const isReal = typeof p === 'object' && p !== null;
                    const imgUrl = isReal ? getCleanImageUrl(p.image_url) : null;
                    const title = isReal ? p.title : `Affiche / Produit #${idx + 1}`;
                    const price = isReal
                      ? `${(p.price_fcfa || 15000).toLocaleString('fr-FR')} FCFA`
                      : '15 000 FCFA';

                    return (
                      <div
                        key={isReal ? p.id : idx}
                        className="rounded-xl border overflow-hidden p-2 space-y-1.5 flex flex-col justify-between"
                        style={{
                          backgroundColor: currentBgCard,
                          borderColor: currentBorder,
                        }}
                      >
                        <div className="aspect-[3/4] rounded-lg bg-black/40 flex items-center justify-center overflow-hidden">
                          {imgUrl ? (
                            <img src={imgUrl} alt={title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold">Image #{idx + 1}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block truncate" style={{ color: currentTextTitle }}>
                            {title}
                          </span>
                          <span className="text-[10px] font-black" style={{ color: currentPrimary }}>
                            {price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5C. APERÇU SECTION À PROPOS EN DIRECT (CLIQUABLE) */}
            {form.show_about_section !== false && form.show_about_section !== 'false' && (
              <div
                onClick={() => handleSelectSectionFromPreview('about')}
                className="group/about relative p-6 border-t transition-all cursor-pointer hover:ring-2 hover:ring-pink-500/50"
                style={{
                  backgroundColor: currentBgSec,
                  borderColor: currentBorder,
                }}
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover/about:opacity-100 bg-pink-500 text-white px-2 py-0.5 rounded text-[10px] font-extrabold shadow-md z-30 transition-opacity">
                  ✏️ Modifier la Section À Propos
                </div>

                <div className="text-center max-w-md mx-auto mb-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-2 bg-pink-500/10 border border-pink-500/20">
                    <Heart className="w-3 h-3 text-pink-400" />
                    <span>{form.about_badge || 'Notre Histoire & Philosophie'}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black" style={{ color: currentTextTitle }}>
                    {form.about_title || 'L’Excellence au Cœur de nos Créations'}
                  </h3>
                  <p className="text-[11px] mt-1" style={{ color: currentTextMuted }}>
                    {form.about_subtitle || 'Découvrez notre vision et nos engagements.'}
                  </p>
                </div>

                {/* Disposition selon form.about_layout ('left' | 'center' | 'right') */}
                {form.about_layout === 'center' ? (
                  <div className="space-y-4 max-w-xl mx-auto">
                    <p className="text-[11px] text-center leading-relaxed line-clamp-3" style={{ color: currentTextMuted }}>
                      {form.about_description || 'Présentation de notre histoire et de notre passion pour l\'excellence.'}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[form.about_photo1, form.about_photo2, form.about_photo3].map((pUrl, pIdx) => {
                        const cleanP = getCleanImageUrl(pUrl);
                        return (
                          <div key={pIdx} className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                            {cleanP ? (
                              <img src={cleanP} alt={`À propos ${pIdx + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500 font-bold">
                                Photo #{pIdx + 1}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center max-w-2xl mx-auto">
                    {/* Colonne Photos */}
                    <div className={`grid grid-cols-2 gap-2 ${form.about_layout === 'left' ? 'order-1' : 'order-2'}`}>
                      <div className="col-span-2 aspect-[16/9] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                        {getCleanImageUrl(form.about_photo1) ? (
                          <img src={getCleanImageUrl(form.about_photo1)} alt="Photo 1" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-bold">
                            Grande Photo #1
                          </div>
                        )}
                      </div>
                      <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40">
                        {getCleanImageUrl(form.about_photo2) ? (
                          <img src={getCleanImageUrl(form.about_photo2)} alt="Photo 2" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500 font-bold">Photo #2</div>
                        )}
                      </div>
                      <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40">
                        {getCleanImageUrl(form.about_photo3) ? (
                          <img src={getCleanImageUrl(form.about_photo3)} alt="Photo 3" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500 font-bold">Photo #3</div>
                        )}
                      </div>
                    </div>

                    {/* Colonne Texte */}
                    <div className={`space-y-3 ${form.about_layout === 'left' ? 'order-2' : 'order-1'}`}>
                      <p className="text-[11px] leading-relaxed line-clamp-4" style={{ color: currentTextMuted }}>
                        {form.about_description || 'Depuis notre création, nous mettons notre savoir-faire au service de l\'excellence.'}
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-[11px] shadow-sm">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{form.about_cta_text || 'Échanger sur WhatsApp'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. APERÇU PIED DE PAGE EN DIRECT */}
            <div
              onClick={() => handleSelectSectionFromPreview('footer')}
              className="group/footer relative p-6 border-t transition-all cursor-pointer hover:ring-2 hover:ring-amber-500/50"
              style={{
                backgroundColor: currentBgMain,
                borderColor: currentBorder,
              }}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover/footer:opacity-100 bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-extrabold shadow-md z-30 transition-opacity">
                ✏️ Modifier le Pied de page
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {cleanLogoUrl ? (
                      <img src={cleanLogoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-lg border border-white/10" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {form.company_icon_emoji || '✨'}
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-xs" style={{ color: currentTextTitle }}>
                        {form.company_name || 'Votre Entreprise'}
                      </div>
                      <div className="text-[10px]" style={{ color: currentPrimary }}>
                        {form.tagline || 'Excellence & Qualité'}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: currentTextMuted }}>
                    {form.footer_description || form.company_description || 'Votre partenaire de confiance pour des produits et prestations haut de gamme.'}
                  </p>
                </div>

                {form.footer_show_links !== false && form.footer_show_links !== 'false' && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: currentTextTitle }}>
                      Navigation
                    </span>
                    <ul className="space-y-1 text-[11px]" style={{ color: currentTextMuted }}>
                      <li>• Accueil & Hero</li>
                      <li>• Catalogue & Produits</li>
                      <li>• Contact Direct</li>
                    </ul>
                  </div>
                )}

                {form.footer_show_contact !== false && form.footer_show_contact !== 'false' && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: currentTextTitle }}>
                      {form.footer_contact_title || 'Contact Instantané'}
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-[11px] mb-2 shadow-sm">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {form.footer_contact_btn_text || 'Commencer sur WhatsApp'}
                    </div>
                    <p className="text-[10px]" style={{ color: currentTextMuted }}>
                      {form.footer_contact_subtext || 'Réponse rapide en direct sur WhatsApp.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px]" style={{ borderColor: currentBorder, color: currentTextMuted }}>
                <span>
                  {form.footer_copyright_text || `© ${new Date().getFullYear()} ${form.company_name || 'Entreprise'} — Tous droits réservés`}
                </span>
                <span className="text-emerald-400 font-medium">
                  {form.footer_badge_text || 'Haute Performance · Sécurisé · Service Client 7j/7'}
                </span>
              </div>
            </div>
            </>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
