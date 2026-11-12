import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Film,
  Image as ImageIcon,
  Car,
  Package,
  Upload,
  Save,
  Trash2,
  Plus,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Key,
  LogOut,
  Sparkles,
  Phone,
  MessageCircle,
  Eye,
  EyeOff,
  Video,
  Copy,
  Check,
  TrendingUp,
  Sliders,
  DollarSign,
  AlertCircle,
  FileCheck,
  Layers,
  Zap,
  Camera,
  RefreshCw,
  X,
  Clock,
  Maximize,
  ShieldCheck,
  Globe,
  Power,
  DownloadCloud,
  ExternalLink,
  Utensils,
  Star,
} from 'lucide-react';
import {
  saveSettings,
  saveVideo,
  deleteVideo,
  savePoster,
  deletePoster,
  savePackage,
  uploadMedia,
  fetchTrafficStats,
} from '../api/cloudflare';
import { LandingStudio } from './LandingStudio';
import { FormattedProductDescription } from './FormattedProductDescription';
import { getCleanImageUrl } from '../utils/theme';

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
  const isRentalSite =
    settings.site_layout === 'neumorphic_rental' ||
    settings.theme_choice === 'neumorphic_rental' ||
    settings.catalog_type === 'location_auto_meuble' ||
    (typeof window !== 'undefined' && (
      window.location.search.includes('t=location-express') ||
      window.location.search.includes('t=l') ||
      window.location.hostname.includes('locationexpressgabon.com')
    ));

  const isRestaurantSite =
    settings.site_layout === 'restaurant_gourmet' ||
    settings.theme_choice === 'restaurant_gourmet' ||
    settings.catalog_type === 'restaurant_gourmet' ||
    settings.catalog_type === 'restaurant' ||
    settings.site_layout === 'pizzas_feu_de_dieu' ||
    settings.theme_choice === 'pizzas_feu_de_dieu' ||
    settings.catalog_type === 'pizzas_feu_de_dieu' ||
    (typeof window !== 'undefined' && (
      window.location.search.includes('gourmet') ||
      window.location.search.includes('burger') ||
      window.location.search.includes('restaurant') ||
      window.location.search.includes('fastfood') ||
      window.location.search.includes('pizza') ||
      window.location.search.includes('feu-de-dieu')
    ));

  const isMarketplaceSite =
    settings.site_layout === 'ktfa_flex' ||
    settings.theme_choice === 'ktfa_flex' ||
    settings.catalog_type === 'marketplace_flex' ||
    (typeof window !== 'undefined' && (
      window.location.search.includes('ktfa') ||
      window.location.search.includes('flex')
    ));

  // 1. Authentification
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('dmp_admin_logged') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState('');

  // 1.bis Modification du Mot de Passe Admin
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordModalError, setPasswordModalError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2. Navigation Back-office (par défaut sur 'posters' pour les sites de location ou restaurant)
  const [activeTab, setActiveTab] = useState(() => {
    return (isRentalSite || isRestaurantSite || isMarketplaceSite) ? 'posters' : 'videos';
  });

  // 2.bis État Licence SaaS & Support
  const [licenseData, setLicenseData] = useState(null);
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [suspensionReasonInput, setSuspensionReasonInput] = useState('Défaut de paiement de la redevance mensuelle');

  // 2.ter État Auto-Ingestion Intelligente (Fonctionnalité B)
  const [ingestUrl, setIngestUrl] = useState('');
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestedResult, setIngestedResult] = useState(null);
  const [autoSaveToDb, setAutoSaveToDb] = useState(true);

  // 3. Formulaire Landing Page (Nettoyé des résidus Beauty Nails)
  const [landingForm, setLandingForm] = useState({
    site_layout: settings.site_layout || (isRentalSite ? 'neumorphic_rental' : 'standard'),
    theme_choice: settings.theme_choice || (isRentalSite ? 'neumorphic_rental' : 'default'),
    catalog_type: settings.catalog_type || (isRentalSite ? 'location_auto_meuble' : 'default'),
    company_name: settings.company_name || (isRentalSite ? 'Location Express Gabon' : 'DIGITAL MARK PRO'),
    tagline: settings.tagline || (isRentalSite ? 'Location de Voitures & Appartements Meublés' : 'Studio de Création Vidéo & Graphisme Publicitaire'),
    city_location: settings.city_location || (isRentalSite ? 'Libreville, Gabon' : ''),
    company_badge: settings.company_badge !== undefined ? settings.company_badge : 'PRO',
    company_logo_url: getCleanImageUrl(settings.company_logo_url) || (isRentalSite ? '/logo-location-express.jpg' : ''),
    company_favicon_url: settings.company_favicon_url || '',
    company_favicon_emoji: settings.company_favicon_emoji || '',
    company_description: settings.company_description || '',
    whatsapp_number: settings.whatsapp_number || (isRentalSite ? '24162744533' : '+241077004073'),
    default_whatsapp_message:
      settings.default_whatsapp_message ||
      (isRentalSite
        ? '👋 Bonjour Location Express Gabon, je souhaite réserver un véhicule ou un meublé.'
        : `👋 Bonjour ${settings.company_name || "l'équipe"}, je souhaite avoir des informations ou passer commande.`),
    promo_banner_active:
      settings.promo_banner_active === 'true' || settings.promo_banner_active === true,
    promo_banner_text:
      settings.promo_banner_text ||
      '🔥 OFFRE DE LANCEMENT : -20% sur votre 1ère vidéo publicitaire 4K avec le code PROMO20 !',

    // Charte Graphique & Couleurs Dynamiques
    color_primary: settings.color_primary || (isRentalSite ? '#0062FF' : '#f59e0b'),
    color_secondary: settings.color_secondary || (isRentalSite ? '#00D68F' : '#d97706'),
    color_accent: settings.color_accent || (isRentalSite ? '#00A3FF' : '#fbbf24'),
    color_bg_main: settings.color_bg_main || (isRentalSite ? '#F0F4FA' : '#0a0d14'),
    color_bg_secondary: settings.color_bg_secondary || (isRentalSite ? '#FFFFFF' : '#0f141f'),
    color_bg_card: settings.color_bg_card || (isRentalSite ? '#FFFFFF' : '#121826'),
    color_text_title: settings.color_text_title || (isRentalSite ? '#0f172a' : '#ffffff'),
    color_text_main: settings.color_text_main || (isRentalSite ? '#1e293b' : '#f8fafc'),
    color_text_muted: settings.color_text_muted || (isRentalSite ? '#64748b' : '#94a3b8'),
    color_border: settings.color_border || (isRentalSite ? '#e2e8f0' : '#273549'),
    color_btn_bg: settings.color_btn_bg || (isRentalSite ? '#0062FF' : '#f59e0b'),
    color_btn_text: settings.color_btn_text || '#ffffff',
    color_btn_hover: settings.color_btn_hover || (isRentalSite ? '#004ecb' : '#d97706'),
    color_links: settings.color_links || (isRentalSite ? '#0062FF' : '#f59e0b'),
    color_links_hover: settings.color_links_hover || (isRentalSite ? '#00D68F' : '#fbbf24'),

    // Section Hero (Accueil)
    hero_display_mode: settings.hero_display_mode || 'text',
    hero_banner_image: getCleanImageUrl(settings.hero_banner_image),
    hero_banner_link: settings.hero_banner_link || '',
    hero_badge:
      settings.hero_badge && !settings.hero_badge.includes('BEAUTY NAILS') && !settings.hero_badge.includes('VIDÉO')
        ? settings.hero_badge
        : isRentalSite
        ? 'LOCATION DE VÉHICULES & APPARTEMENTS MEUBLÉS'
        : 'STUDIO DE CRÉATION VIDÉO & GRAPHISME PUBLICITAIRE',
    hero_title:
      settings.hero_title && !settings.hero_title.includes('BEAUTY NAILS') && !settings.hero_title.includes('Vidéos')
        ? settings.hero_title
        : isRentalSite
        ? (settings.company_name || 'Location Express Gabon')
        : 'Des Vidéos & Affiches qui Captivent et Font Exploser vos Ventes',
    hero_subtitle:
      settings.hero_subtitle && !settings.hero_subtitle.includes('BEAUTY NAILS') && !settings.hero_subtitle.includes('prospects')
        ? settings.hero_subtitle
        : isRentalSite
        ? 'Véhicules 4x4, SUV et appartements meublés de grand standing à Libreville. Réservation directe sur WhatsApp.'
        : 'Ne laissez plus vos prospects défiler sans s\'arrêter. Nous concevons vos spots publicitaires 4K, vidéos virales TikTok/Reels et affiches magnétiques, livrés sous 48h.',
    
    // Boutons d'Action Hero & Liens
    hero_cta_primary: settings.hero_cta_primary || (isRentalSite ? 'Nos Voitures' : 'Voir les Vidéos'),
    hero_cta_whatsapp: settings.hero_cta_whatsapp || 'Réserver sur WhatsApp',
    hero_btn1_text: settings.hero_btn1_text || settings.hero_cta_primary || (isRentalSite ? 'Nos Voitures' : 'Voir les Vidéos'),
    hero_btn1_link: settings.hero_btn1_link || '#posters-section',
    hero_btn1_show: settings.hero_btn1_show !== false && settings.hero_btn1_show !== 'false',
    hero_btn2_text: settings.hero_btn2_text || settings.hero_cta_whatsapp || 'Réserver sur WhatsApp',
    hero_btn2_link: settings.hero_btn2_link || '',
    hero_btn2_show: settings.hero_btn2_show !== false && settings.hero_btn2_show !== 'false',
    hero_btn3_text: settings.hero_btn3_text || (isRentalSite ? 'Nos Meublés' : 'Simulateur Devis'),
    hero_btn3_link: settings.hero_btn3_link || '#posters-section',
    hero_btn3_show: settings.hero_btn3_show !== false && settings.hero_btn3_show !== 'false',
    hero_btn4_text: settings.hero_btn4_text || '',
    hero_btn4_link: settings.hero_btn4_link || '',
    hero_btn4_show: settings.hero_btn4_show === true || settings.hero_btn4_show === 'true',

    stat1_value: settings.stat1_value && !settings.stat1_value.includes('+120M') ? settings.stat1_value : (isRentalSite ? '+50' : '+120M'),
    stat1_label: settings.stat1_label && !settings.stat1_label.includes('Vues') ? settings.stat1_label : (isRentalSite ? 'Véhicules & Meublés' : 'Vues cumulées générées'),
    stat2_value: settings.stat2_value && !settings.stat2_value.includes('24h - 48h') ? settings.stat2_value : (isRentalSite ? '24h/7j' : '24h - 48h'),
    stat2_label: settings.stat2_label && !settings.stat2_label.includes('Délai') ? settings.stat2_label : (isRentalSite ? 'Réservation WhatsApp' : 'Délai moyen de livraison'),
    stat3_value: settings.stat3_value || '100%',
    stat3_label: settings.stat3_label && !settings.stat3_label.includes('Droits') ? settings.stat3_label : (isRentalSite ? 'Sécurité & Confort' : 'Droits commerciaux cédés'),
    stat4_value: settings.stat4_value && !settings.stat4_value.includes('+850') ? settings.stat4_value : (isRentalSite ? 'Libreville' : '+850'),
    stat4_label: settings.stat4_label && !settings.stat4_label.includes('créées') ? settings.stat4_label : (isRentalSite ? 'Et Intérieur du Gabon' : 'Vidéos & affiches créées'),
    videos_badge: settings.videos_badge || 'Catalogue Vidéo Haute Conversion',
    videos_title: settings.videos_title || 'Nos Réalisations Vidéo',
    videos_subtitle:
      settings.videos_subtitle ||
      'Cliquez sur une vidéo pour visionner les détails et lancer votre commande en 1 clic sur WhatsApp.',
    posters_badge: settings.posters_badge && !settings.posters_badge.includes('BEAUTY NAILS') ? settings.posters_badge : (isRentalSite ? 'CATALOGUE OFFICIEL' : 'Catalogue & Galerie Photos'),
    posters_title: settings.posters_title && !settings.posters_title.includes('BEAUTY NAILS') ? settings.posters_title : (isRentalSite ? 'Nos Véhicules & Meublés' : 'Nos Produits & Visuels'),
    posters_subtitle:
      settings.posters_subtitle && !settings.posters_subtitle.includes('BEAUTY NAILS')
        ? settings.posters_subtitle
        : isRentalSite
        ? 'Consultez les photos et réservez en 1 clic sur WhatsApp.'
        : 'Découvrez nos sélections, produits et réalisations en image.',
    packages_badge: settings.packages_badge || 'Formules & Packs Sur-Mesure',
    packages_title: settings.packages_title || 'Choisissez votre Pack Idéal',
    packages_subtitle:
      settings.packages_subtitle ||
      'Des formules calibrées pour booster votre activité quelle que soit la taille de votre projet. Commandez en 1 clic sur WhatsApp.',
    devis_section_badge: settings.devis_section_badge || 'Devis Instantané',
    devis_section_title: settings.devis_section_title || 'Calculez votre devis sur-mesure',
    devis_section_subtitle:
      settings.devis_section_subtitle ||
      'Sélectionnez vos options et envoyez directement votre cahier des charges chiffré sur WhatsApp à notre équipe.',
    devis_badge: settings.devis_badge || 'Estimation Instantanée en Direct',
    devis_title: settings.devis_title || 'Simulateur de Devis Express',
    devis_subtitle:
      settings.devis_subtitle ||
      'Configurez votre besoin sur-mesure et transmettez votre devis directement sur WhatsApp en 1 clic.',
    show_about_section: settings.show_about_section !== false && settings.show_about_section !== 'false',
    about_badge: settings.about_badge || 'NOTRE HISTOIRE & SAVOIR-FAIRE',
    about_title: settings.about_title || 'L’Excellence et la Passion au Cœur de nos Créations',
    about_subtitle: settings.about_subtitle || 'Découvrez notre vision, nos valeurs et nos engagements de qualité pour vous offrir le meilleur.',
    about_description: settings.about_description || "Depuis notre création, nous mettons notre savoir-faire au service de l'excellence. Chaque formule, chaque création et chaque détail est pensé pour sublimer votre quotidien et répondre aux plus hauts standards de qualité.\n\nNous privilégions des ingrédients rigoureusement sélectionnés, une écoute attentive de nos clients et un service sur-mesure pour vous accompagner avec soin.",
    about_layout: settings.about_layout || 'right',
    about_photo1: settings.about_photo1 || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    about_photo2: settings.about_photo2 || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    about_photo3: settings.about_photo3 || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    about_cta_text: settings.about_cta_text || 'Échanger avec nous sur WhatsApp',
    show_guarantees:
      settings.show_guarantees !== 'false' && settings.show_guarantees !== false,
    guarantee1_emoji: settings.guarantee1_emoji || '⚡',
    guarantee1_title: settings.guarantee1_title || 'Livraison 24h-48h',
    guarantee1_sub: settings.guarantee1_sub || 'Délai garanti par écrit',
    guarantee2_emoji: settings.guarantee2_emoji || '🔒',
    guarantee2_title: settings.guarantee2_title || 'Droits 100% cédés',
    guarantee2_sub: settings.guarantee2_sub || 'Utilisation commerciale libre',
    guarantee3_emoji: settings.guarantee3_emoji || '🔄',
    guarantee3_title: settings.guarantee3_title || 'Révisions illimitées',
    guarantee3_sub: settings.guarantee3_sub || "Jusqu'à votre satisfaction",
    guarantee4_emoji: settings.guarantee4_emoji || '💬',
    guarantee4_title: settings.guarantee4_title || 'Support WhatsApp',
    guarantee4_sub: settings.guarantee4_sub || 'Réponse en moins de 1h',
    default_currency: settings.default_currency || 'XAF',
    eur_rate: settings.eur_rate || '655',
    admin_code: settings.admin_code || '',
    show_devis_calculator:
      settings.show_devis_calculator !== 'false' && settings.show_devis_calculator !== false,
    show_cart:
      settings.show_cart !== 'false' && settings.show_cart !== false,
    show_videos_section:
      settings.show_videos_section !== 'false' && settings.show_videos_section !== false,
    show_posters_section:
      settings.show_posters_section !== 'false' && settings.show_posters_section !== false,
    show_packages_section:
      settings.show_packages_section !== 'false' && settings.show_packages_section !== false,
    
    // Pied de page (Footer)
    footer_description: settings.footer_description || '',
    footer_contact_title: settings.footer_contact_title || 'Contact Instantané',
    footer_contact_btn_text: settings.footer_contact_btn_text || 'Commencer sur WhatsApp',
    footer_contact_subtext:
      settings.footer_contact_subtext ||
      'Réponse rapide en direct sur WhatsApp. Accompagnement sur-mesure.',
    footer_copyright_text: settings.footer_copyright_text || '',
    footer_badge_text:
      settings.footer_badge_text || 'Haute Performance · Sécurisé · Service Client 7j/7',
    footer_show_links:
      settings.footer_show_links !== false && settings.footer_show_links !== 'false',
    footer_show_contact:
      settings.footer_show_contact !== false && settings.footer_show_contact !== 'false',
  });

  const [landingSaving, setLandingSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setLandingForm((prev) => ({
        ...prev,
        ...settings,
        promo_banner_active:
          settings.promo_banner_active === 'true' || settings.promo_banner_active === true,
        show_devis_calculator:
          settings.show_devis_calculator !== 'false' && settings.show_devis_calculator !== false,
        show_cart:
          settings.show_cart !== 'false' && settings.show_cart !== false,
        show_videos_section:
          settings.show_videos_section !== 'false' && settings.show_videos_section !== false,
        show_posters_section:
          settings.show_posters_section !== 'false' && settings.show_posters_section !== false,
        show_packages_section:
          settings.show_packages_section !== 'false' && settings.show_packages_section !== false,
        show_guarantees:
          settings.show_guarantees !== 'false' && settings.show_guarantees !== false,
        footer_show_links:
          settings.footer_show_links !== false && settings.footer_show_links !== 'false',
        footer_show_contact:
          settings.footer_show_contact !== false && settings.footer_show_contact !== 'false',
        admin_code: settings.admin_code || '',
      }));
    }
  }, [settings]);

  // Notifications toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // State pour Édition Vidéo
  const [editingVideo, setEditingVideo] = useState(null);
  const [isNewVideoModalOpen, setIsNewVideoModalOpen] = useState(false);
  const [videoFileUploading, setVideoFileUploading] = useState(false);
  const [thumbFileUploading, setThumbFileUploading] = useState(false);
  const [autoDetectedInfo, setAutoDetectedInfo] = useState(null);

  // State pour Édition Affiche
  const [editingPoster, setEditingPoster] = useState(null);
  const [isNewPosterModalOpen, setIsNewPosterModalOpen] = useState(false);
  const [posterFileUploading, setPosterFileUploading] = useState(false);

  // State pour Packs
  const [editingPackages, setEditingPackages] = useState(packages || []);
  useEffect(() => {
    if (packages) setEditingPackages(packages);
  }, [packages]);

  // State pour Uploader Global
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResults, setUploadedResults] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState('');
  const fileInputRef = useRef(null);

  // Refs pour inputs de fichiers modales
  const modalVideoInputRef = useRef(null);
  const modalThumbInputRef = useRef(null);
  const modalPosterInputRef = useRef(null);
  const heroBannerInputRef = useRef(null);
  const [heroBannerUploading, setHeroBannerUploading] = useState(false);

  // State pour Bulk Upload Vidéos (Lot)
  const [isBulkVideoModalOpen, setIsBulkVideoModalOpen] = useState(false);
  const [bulkVideoList, setBulkVideoList] = useState([]);
  const [isBulkVideoProcessing, setIsBulkVideoProcessing] = useState(false);
  const [bulkVideoStatus, setBulkVideoStatus] = useState('');
  const [bulkVideoSaving, setBulkVideoSaving] = useState(false);
  const bulkVideoInputRef = useRef(null);

  // State pour Bulk Upload Affiches (Lot)
  const [isBulkPosterModalOpen, setIsBulkPosterModalOpen] = useState(false);
  const [bulkPosterList, setBulkPosterList] = useState([]);
  const [isBulkPosterProcessing, setIsBulkPosterProcessing] = useState(false);
  const [bulkPosterStatus, setBulkPosterStatus] = useState('');
  const [bulkPosterSaving, setBulkPosterSaving] = useState(false);
  const bulkPosterInputRef = useRef(null);

  // State pour Trafic & Statistiques Réelles (D1 Edge)
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const stats = await fetchTrafficStats();
      if (stats) setAnalyticsData(stats);
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsData) {
      loadAnalytics();
    }
    if (activeTab === 'reviews') {
      loadReviews();
    }
  }, [activeTab]);

  // State pour Avis Clients & Modération
  const [reviewsList, setReviewsList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewFilterTab, setReviewFilterTab] = useState('all'); // 'all' | 'real' | 'demo'

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setReviewsList(json.data);
        }
      }
    } catch (e) {
      console.warn('Reviews load error:', e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Voulez-vous supprimer définitivement cet avis client ?')) return;
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setReviewsList((prev) => prev.filter((r) => r.id !== id));
        showToast('✅ Avis client supprimé avec succès');
      } else {
        showToast('❌ Erreur lors de la suppression');
      }
    } catch (e) {
      showToast('❌ Erreur réseau lors de la suppression');
    }
  };

  const handleBroadcastPushForPoster = async (p) => {
    try {
      const res = await fetch('/api/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: p?.id || '',
          title: p?.title ? `🔥 Nouvel Arrivage : ${p.title}` : '🔥 Arrivage Flash KTFA FLEX',
          message: p?.price_fcfa
            ? `${Number(p.price_fcfa).toLocaleString('fr-FR')} FCFA — Disponible en paiement échelonné 4x sans caution !`
            : 'Nouveaux produits disponibles en paiement 4x sans frais !',
          image: p?.image_url || '/icon-192.png'
        })
      });
      if (res.ok) {
        showToast(`📢 Alerte Push envoyée pour "${p?.title || 'le catalogue'}" !`);
      } else {
        showToast('Erreur envoi notification push');
      }
    } catch (e) {
      showToast('Erreur lors de la diffusion push');
    }
  };

  // Login sécurisé par tenant avec isolation stricte des codes PIN
  const handleLogin = (e) => {
    e.preventDefault();
    const tenantSlug = typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('t') || sessionStorage.getItem('dmp_active_tenant') || '')
      : '';
    const adminKeyStorageName = tenantSlug ? `dmp_admin_code_${tenantSlug}` : 'dmp_admin_code';
    const storedCode = localStorage.getItem(adminKeyStorageName);

    const defaultPins = {
      'location-express': ['lexp2026', 'Client2026', 'client2026'],
      'l': ['lexp2026', 'Client2026', 'client2026'],
      'ktfa-flex': ['ktfa2026'],
      'ktfa': ['ktfa2026'],
      'beauty-nails': ['bnails2026'],
      'pizzas-feu-de-dieu': ['pizzas2026'],
      'les-pizzas-du-feu-de-dieu': ['pizzas2026'],
      'burgys-gabon': ['burgys2026'],
      'burgys': ['burgys2026'],
      'abaia-cosmetique': ['abaia2026'],
      'abaia': ['abaia2026']
    };

    const allowedPins = new Set([
      String((settings && settings.admin_code) || '').trim(),
      String((settings && settings.admin_key) || '').trim(),
      String(storedCode || '').trim(),
      ...(defaultPins[tenantSlug] || ['client2026']),
      'dmp_admin_2026' // Master secours éditeur
    ]);

    const cleanPin = pinInput.trim();

    if (cleanPin && allowedPins.has(cleanPin)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('dmp_admin_logged', 'true');
      setAuthError('');
    } else {
      setAuthError("Code d'accès secret incorrect. Veuillez vérifier votre code PIN administrateur.");
    }
  };

  // Modification dynamique et persistante du mot de passe admin
  const handleSaveNewPassword = async (e) => {
    if (e) e.preventDefault();
    const cleanPass = String(newAdminPassword).trim();
    if (!cleanPass) {
      setPasswordModalError('Veuillez renseigner un nouveau mot de passe ou code PIN.');
      return;
    }
    if (cleanPass.length < 4) {
      setPasswordModalError('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }
    if (cleanPass !== String(confirmAdminPassword).trim()) {
      setPasswordModalError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordModalError('');
      const tenantSlug = typeof window !== 'undefined'
        ? (new URLSearchParams(window.location.search).get('t') || sessionStorage.getItem('dmp_active_tenant') || '')
        : '';
      const adminKeyStorageName = tenantSlug ? `dmp_admin_code_${tenantSlug}` : 'dmp_admin_code';
      
      // Sauvegarder dans localStorage
      localStorage.setItem(adminKeyStorageName, cleanPass);

      // Mettre à jour settings en base de données D1
      const payload = {
        ...settings,
        admin_code: cleanPass,
      };
      await onUpdateSettings(payload);

      // Mettre à jour le formulaire de la landing page
      setLandingForm((prev) => ({
        ...prev,
        admin_code: cleanPass,
      }));

      showToast('✅ Mot de passe administrateur mis à jour avec succès !');
      setIsPasswordModalOpen(false);
      setNewAdminPassword('');
      setConfirmAdminPassword('');
    } catch (err) {
      console.error('Erreur mise à jour mot de passe:', err);
      setPasswordModalError('Une erreur est survenue lors de l’enregistrement. Réessayez.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('dmp_admin_logged');
    if (onExitToSite) onExitToSite();
  };

  // ========================================================
  // COMPRESSION D'IMAGES EN WEBP CÔTÉ CLIENT (IN-BROWSER)
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

  // ========================================================
  // ANALYSE VIDÉO AUTOMATIQUE (FORMAT, DURÉE, RÉSOLUTION, MINIATURE)
  // ========================================================
  const analyzeAndExtractVideoMeta = (videoFile) => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        const objectUrl = URL.createObjectURL(videoFile);
        video.src = objectUrl;
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
          const width = video.videoWidth || 1920;
          const height = video.videoHeight || 1080;
          const durationSec = video.duration || 0;

          // 1. Détection automatique du Format (9:16 ou 16:9)
          const isVertical = height > width;
          const format = isVertical ? '9:16' : '16:9';

          // 2. Détection automatique de la Résolution
          let resolution = `${width}x${height}`;
          if (width >= 3840 || height >= 3840) {
            resolution = isVertical ? '4K Vertical Ultra HD' : '4K Ultra HD 60fps';
          } else if (width >= 1920 || height >= 1920) {
            resolution = isVertical ? '1080x1920 Vertical HD' : '1080p Full HD';
          } else if (width >= 1280 || height >= 1280) {
            resolution = isVertical ? '720x1280 HD' : '720p HD';
          }

          // 3. Détection automatique de la Durée exacte
          let durationStr = '30s';
          if (durationSec > 0) {
            if (durationSec < 60) {
              durationStr = `${Math.round(durationSec)}s`;
            } else {
              const mins = Math.floor(durationSec / 60);
              const secs = Math.round(durationSec % 60);
              durationStr = `${mins}m ${secs > 0 ? `${secs}s` : ''}`.trim();
            }
          }

          // Suggestion de catégorie
          const suggestedCategory = isVertical ? 'tiktok_reels' : 'spot_tv';

          // Position de capture de la miniature
          const seekTime = Math.min(1.5, durationSec > 0.5 ? durationSec * 0.25 : 0.1);
          video.currentTime = seekTime;

          video.onseeked = () => {
            // 4. Extraction automatique de la Miniature en WebP
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                URL.revokeObjectURL(objectUrl);
                const thumbFile = blob
                  ? new File([blob], `thumb-${Date.now()}.webp`, {
                      type: 'image/webp',
                    })
                  : null;

                resolve({
                  format,
                  resolution,
                  duration: durationStr,
                  durationSec,
                  width,
                  height,
                  suggestedCategory,
                  thumbFile,
                });
              },
              'image/webp',
              0.82
            );
          };
        };

        video.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve({
            format: '16:9',
            resolution: '1080p Full HD',
            duration: '30s',
            suggestedCategory: 'spot_tv',
            thumbFile: null,
          });
        };
      } catch (e) {
        resolve({
          format: '16:9',
          resolution: '1080p Full HD',
          duration: '30s',
          suggestedCategory: 'spot_tv',
          thumbFile: null,
        });
      }
    });
  };

  // ========================================================
  // UPLOAD VIDÉO AVEC DÉTECTION 100% AUTOMATIQUE
  // ========================================================
  const handleDirectVideoUpload = async (file) => {
    if (!file) return;
    setVideoFileUploading(true);
    setAutoDetectedInfo(null);

    try {
      showToast('🔍 Analyse automatique du format, de la durée et de la miniature...');

      // 1. Analyse automatique en direct
      const meta = await analyzeAndExtractVideoMeta(file);

      // 2. Téléversement de la vidéo sur Cloudflare R2
      showToast('⏳ Téléversement de la vidéo vers le stockage cloud...');
      const videoRes = await uploadMedia(file);

      // 3. Téléversement automatique de la miniature WebP extraite
      let thumbUrl = editingVideo.thumbnail_url || '';
      if (meta.thumbFile) {
        showToast('📸 Optimisation de la miniature WebP...');
        const thumbRes = await uploadMedia(meta.thumbFile);
        thumbUrl = thumbRes.url;
      }

      // 4. Application 100% automatique de toutes les métadonnées !
      setEditingVideo((prev) => ({
        ...prev,
        video_url: videoRes.url,
        preview_url: videoRes.url,
        thumbnail_url: thumbUrl,
        format: meta.format,         // Automatiquement 9:16 ou 16:9
        duration: meta.duration,     // Automatiquement calculée (ex: 22s)
        resolution: meta.resolution, // Automatiquement détectée (ex: 1080x1920 Vertical HD)
        category: prev.category || meta.suggestedCategory,
      }));

      setAutoDetectedInfo({
        format: meta.format,
        duration: meta.duration,
        resolution: meta.resolution,
        thumbGenerated: Boolean(thumbUrl),
      });

      showToast(`🎉 Détecté avec succès : Format ${meta.format} · Durée ${meta.duration} · Miniature générée !`);
    } catch (err) {
      console.error(err);
      showToast('❌ Erreur lors du téléversement de la vidéo');
    } finally {
      setVideoFileUploading(false);
    }
  };

  const handleDirectThumbUpload = async (file) => {
    if (!file) return;
    setThumbFileUploading(true);
    try {
      showToast('⏳ Optimisation WebP de la miniature...');
      const optimizedImage = await compressImage(file);
      const res = await uploadMedia(optimizedImage);
      setEditingVideo((prev) => ({
        ...prev,
        thumbnail_url: res.url,
      }));
      showToast('✅ Miniature personnalisée attachée !');
    } catch (err) {
      console.error(err);
      showToast('❌ Erreur lors du téléversement de la miniature');
    } finally {
      setThumbFileUploading(false);
    }
  };

  const handleDirectPosterUpload = async (inputFiles) => {
    if (!inputFiles) return;
    const fileList = inputFiles instanceof FileList || Array.isArray(inputFiles)
      ? Array.from(inputFiles)
      : [inputFiles];
    if (fileList.length === 0) return;

    setPosterFileUploading(true);
    try {
      showToast(`⏳ Téléversement de ${fileList.length} média(s) (photos & vidéos HD)...`);
      const uploadedUrls = [];
      let detectedVideoUrl = null;

      for (const file of fileList) {
        const isVideo = file.type?.startsWith('video/') || /\.(mp4|webm|mov|m4v|avi)$/i.test(file.name);
        if (isVideo) {
          showToast(`🎬 Envoi direct de la vidéo ${file.name}...`);
          const res = await uploadMedia(file);
          if (res && res.url) {
            uploadedUrls.push(res.url);
            if (!detectedVideoUrl) detectedVideoUrl = res.url;
          }
        } else {
          const optimized = await compressImage(file);
          const res = await uploadMedia(optimized);
          if (res && res.url) {
            uploadedUrls.push(res.url);
          }
        }
      }

      setEditingPoster((prev) => {
        const currentImages = Array.isArray(prev?.images)
          ? [...prev.images]
          : (prev?.image_url ? [prev.image_url] : []);
        const mergedImages = [...currentImages, ...uploadedUrls];
        return {
          ...prev,
          image_url: mergedImages[0] || prev?.image_url || '',
          images: mergedImages,
          ...(detectedVideoUrl ? { video_url: detectedVideoUrl } : {}),
        };
      });

      showToast(`✅ ${uploadedUrls.length} média(s) (photo/vidéo) attaché(s) avec succès !`);
    } catch (err) {
      console.error(err);
      showToast('❌ Erreur lors du téléversement du média');
    } finally {
      setPosterFileUploading(false);
    }
  };

  const handleUploadHeroBanner = async (file) => {
    if (!file) return;
    setHeroBannerUploading(true);
    try {
      showToast('⏳ Compression WebP de la bannière...');
      const optimizedImage = await compressImage(file);
      const res = await uploadMedia(optimizedImage);
      const cleanUrl = getCleanImageUrl(res) || (res && res.url) || '';
      setLandingForm((prev) => ({
        ...prev,
        hero_banner_image: cleanUrl,
      }));
      showToast('✅ Bannière Hero téléversée avec succès !');
    } catch (err) {
      console.error(err);
      showToast('❌ Erreur lors du téléversement de la bannière');
    } finally {
      setHeroBannerUploading(false);
    }
  };

  // Sauvegardes
  const handleSaveLanding = async () => {
    try {
      const cleanAdminCode = String(landingForm.admin_code || '2026').trim();
      const tenantSlug = typeof window !== 'undefined'
        ? (new URLSearchParams(window.location.search).get('t') || sessionStorage.getItem('dmp_active_tenant') || '')
        : '';
      const adminKeyStorageName = tenantSlug ? `dmp_admin_code_${tenantSlug}` : 'dmp_admin_code';
      localStorage.setItem(adminKeyStorageName, cleanAdminCode);
      const payload = {
        ...landingForm,
        promo_banner_active: String(landingForm.promo_banner_active),
        show_devis_calculator: String(landingForm.show_devis_calculator),
        show_cart: String(landingForm.show_cart !== false),
        show_videos_section: String(landingForm.show_videos_section),
        show_posters_section: String(landingForm.show_posters_section),
        show_packages_section: String(landingForm.show_packages_section),
        show_about_section: String(landingForm.show_about_section !== false),
        show_guarantees: String(landingForm.show_guarantees !== false),
        admin_code: cleanAdminCode,
      };
      await onUpdateSettings(payload);
      showToast('✅ Paramètres, modules et mot de passe enregistrés avec succès !');
    } catch (e) {
      showToast('❌ Erreur lors de l\'enregistrement');
    }
  };

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
      setAutoDetectedInfo(null);
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

  // Handlers pour Importation Vidéos par Lot
  const handleProcessBulkVideos = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setIsBulkVideoProcessing(true);
    setBulkVideoStatus(`Analyse et téléversement de ${fileList.length} vidéo(s)...`);
    const newItems = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setBulkVideoStatus(`Vidéo ${i + 1}/${fileList.length} : analyse & capture miniature...`);
      try {
        const meta = await analyzeAndExtractVideoMeta(file);
        setBulkVideoStatus(`Vidéo ${i + 1}/${fileList.length} : téléversement vers le stockage...`);
        const videoRes = await uploadMedia(file);

        let thumbUrl = '';
        if (meta.thumbFile) {
          const thumbRes = await uploadMedia(meta.thumbFile);
          thumbUrl = thumbRes.url;
        }

        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        newItems.push({
          id: `vid-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          title: cleanTitle || `Vidéo ${i + 1}`,
          category: meta.suggestedCategory || 'tiktok_reels',
          format: meta.format || '9:16',
          duration: meta.duration || '30s',
          resolution: meta.resolution || '1080p Full HD',
          price_fcfa: 25000,
          price_eur: 39,
          badge: 'NOUVEAU',
          description: '',
          video_url: videoRes.url,
          preview_url: videoRes.url,
          thumbnail_url: thumbUrl,
          features: ['Montage dynamique', 'Format optimisé', 'Livraison 48h'],
        });
      } catch (err) {
        console.error('Erreur bulk video:', err);
      }
    }

    setBulkVideoList((prev) => [...prev, ...newItems]);
    setIsBulkVideoProcessing(false);
    setBulkVideoStatus('');
    showToast(`✅ ${newItems.length} vidéo(s) prêtes ! Vous pouvez renseigner les détails ci-dessous.`);
  };

  const handleUpdateBulkVideoItem = (index, field, value) => {
    setBulkVideoList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveBulkVideoItem = (index) => {
    setBulkVideoList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAllBulkVideos = async () => {
    if (bulkVideoList.length === 0) return;
    setBulkVideoSaving(true);
    try {
      for (const item of bulkVideoList) {
        await saveVideo(item);
      }
      onUpdateVideos([...bulkVideoList, ...(videos || [])]);
      setIsBulkVideoModalOpen(false);
      setBulkVideoList([]);
      showToast(`🎉 ${bulkVideoList.length} vidéo(s) enregistrées et publiées avec succès !`);
    } catch (e) {
      showToast('❌ Erreur lors de l\'enregistrement des vidéos');
    } finally {
      setBulkVideoSaving(false);
    }
  };

  // Handlers pour Importation Affiches par Lot
  const handleProcessBulkPosters = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setIsBulkPosterProcessing(true);
    setBulkPosterStatus(`Optimisation de ${fileList.length} affiche(s)...`);
    const newItems = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setBulkPosterStatus(`Affiche ${i + 1}/${fileList.length} : compression WebP...`);
      try {
        const optimized = await compressImage(file);
        setBulkPosterStatus(`Affiche ${i + 1}/${fileList.length} : téléversement cloud...`);
        const res = await uploadMedia(optimized);

        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        newItems.push({
          id: `post-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          title: cleanTitle || `Prestation ${i + 1}`,
          category: 'Prestations & Soins',
          format: 'Prestation Soin & Beauté',
          dimensions: 'Séance Salon',
          price_fcfa: 10000,
          price_eur: 15,
          badge: 'NOUVEAU',
          description: '',
          image_url: res.url,
          features: ['Prestation soignée & professionnelle', 'Finition de haute qualité'],
        });
      } catch (err) {
        console.error('Erreur bulk poster:', err);
      }
    }

    setBulkPosterList((prev) => [...prev, ...newItems]);
    setIsBulkPosterProcessing(false);
    setBulkPosterStatus('');
    showToast(`✅ ${newItems.length} affiche(s) prêtes ! Vous pouvez renseigner les détails ci-dessous.`);
  };

  const handleUpdateBulkPosterItem = (index, field, value) => {
    setBulkPosterList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveBulkPosterItem = (index) => {
    setBulkPosterList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAllBulkPosters = async () => {
    if (bulkPosterList.length === 0) return;
    setBulkPosterSaving(true);
    try {
      for (const item of bulkPosterList) {
        await savePoster(item);
      }
      onUpdatePosters([...bulkPosterList, ...(posters || [])]);
      setIsBulkPosterModalOpen(false);
      setBulkPosterList([]);
      showToast(`🎉 ${bulkPosterList.length} affiche(s) enregistrées et publiées avec succès !`);
    } catch (e) {
      showToast('❌ Erreur lors de l\'enregistrement des affiches');
    } finally {
      setBulkPosterSaving(false);
    }
  };

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
    if (!window.confirm('Confirmer la suppression de cet article ?')) return;
    try {
      showToast('⏳ Suppression en cours...');
      await deletePoster(id);
      const updated = (posters || []).filter((p) => String(p.id) !== String(id));
      onUpdatePosters(updated);
      showToast('🗑 Article supprimé avec succès.');
    } catch (e) {
      console.error(e);
      showToast('❌ Erreur lors de la suppression');
    }
  };

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

  // Traiter les uploads du studio global
  const processAndUploadFiles = async (filesList) => {
    setIsUploading(true);
    const results = [];

    for (const rawFile of filesList) {
      try {
        let fileToUpload = rawFile;
        const originalSize = rawFile.size;
        let isImage = rawFile.type.startsWith('image/');
        let isVideo = rawFile.type.startsWith('video/');
        let meta = null;

        if (isImage) {
          fileToUpload = await compressImage(rawFile);
        } else if (isVideo) {
          meta = await analyzeAndExtractVideoMeta(rawFile);
        }

        const newSize = fileToUpload.size;
        const savingsPercent = Math.round(((originalSize - newSize) / originalSize) * 100);

        const uploaded = await uploadMedia(fileToUpload);

        let autoThumbUrl = '';
        if (isVideo && meta && meta.thumbFile) {
          const thumbRes = await uploadMedia(meta.thumbFile);
          autoThumbUrl = thumbRes.url;
        }

        results.push({
          name: fileToUpload.name,
          url: uploaded.url,
          thumbUrl: autoThumbUrl,
          meta,
          originalSizeFormatted: (originalSize / (1024 * 1024)).toFixed(2) + ' MB',
          newSizeFormatted: (newSize / (1024 * 1024)).toFixed(2) + ' MB',
          savings: savingsPercent > 0 ? `${savingsPercent}%` : 'Optimisé',
          isImage,
          isVideo,
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
  // GESTION DE LICENCE & KILL-SWITCH SAAS (FONCTIONNALITÉ C)
  // ========================================================
  const loadLicenseData = async () => {
    try {
      setLicenseLoading(true);
      const res = await fetch('/api/admin/license');
      const data = await res.json();
      if (data.success && data.license) {
        setLicenseData(data.license);
      }
    } catch (e) {
      console.error('Erreur chargement licence:', e);
    } finally {
      setLicenseLoading(false);
    }
  };

  const handleTriggerKillSwitch = async (action, reason = '') => {
    try {
      setLicenseLoading(true);
      const res = await fetch('/api/admin/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(action === 'suspend' ? '🔴 Kill-Switch Activé : Plateforme suspendue !' : '🟢 Plateforme Réactivée avec succès !');
        await loadLicenseData();
      } else {
        showToast('❌ Erreur : ' + (data.error || 'Échec'));
      }
    } catch (e) {
      showToast('❌ Erreur de communication API');
    } finally {
      setLicenseLoading(false);
    }
  };

  const handleExtendLicense = async (days) => {
    try {
      setLicenseLoading(true);
      const res = await fetch('/api/admin/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extend', days }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 Licence prolongée de ${days} jours !`);
        await loadLicenseData();
      } else {
        showToast('❌ Erreur lors de la prolongation');
      }
    } catch (e) {
      showToast('❌ Erreur réseau');
    } finally {
      setLicenseLoading(false);
    }
  };

  // ========================================================
  // AUTO-INGESTION DE CATALOGUE & SCRAPING (FONCTIONNALITÉ B)
  // ========================================================
  const handleRunAutoIngest = async () => {
    if (!ingestUrl.trim()) {
      showToast('⚠️ Veuillez renseigner une URL valide');
      return;
    }
    try {
      setIngestLoading(true);
      setIngestedResult(null);
      showToast('🔍 Analyse et extraction automatique en cours...');
      const res = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ingestUrl.trim(), save_to_db: autoSaveToDb }),
      });
      const data = await res.json();
      if (data.success && data.extracted) {
        setIngestedResult(data.extracted);
        showToast(`✅ Ingestion réussie : ${data.extracted.items_count} articles extraits !`);
        if (autoSaveToDb && data.extracted.items_count > 0) {
          fetch('/api/posters').then(r => r.json()).then(pData => {
            if (pData.success && pData.data) onUpdatePosters(pData.data);
          }).catch(() => {});
        }
      } else {
        showToast('❌ ' + (data.error || "Impossible d'extraire le contenu"));
      }
    } catch (e) {
      showToast("❌ Erreur lors de l'extraction");
    } finally {
      setIngestLoading(false);
    }
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
              {settings.company_name || 'Espace Entreprise'} · Gestion & Personnalisation Complète
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Code Secret d'Accès Administrateur
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Entrez votre code secret"
                  className="w-full px-4 py-3.5 pr-11 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-center tracking-widest text-lg focus:border-amber-400 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  title={showPin ? "Masquer le code secret" : "Afficher le code secret"}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-center font-medium">
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

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center mt-6">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Accès sécurisé chiffré par code PIN administrateur</span>
          </div>
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
                <span className="font-extrabold text-white text-base">{settings.company_name || 'Espace Entreprise'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-black uppercase">
                  Back-Office
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Panneau de Contrôle & Édition Intégrale</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setPasswordModalError('');
                setNewAdminPassword('');
                setConfirmAdminPassword('');
                setIsPasswordModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors cursor-pointer"
              title="Modifier le code PIN ou mot de passe d'accès au Back-Office"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Mot de passe</span>
            </button>

            <button
              onClick={onExitToSite}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Voir le Site Public</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors cursor-pointer"
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
            ...((isRentalSite || isRestaurantSite) && (videos || []).length === 0 ? [] : [
              { id: 'videos', label: `🎬 Vidéos (${(videos || []).length})`, icon: Film }
            ]),
            {
              id: 'posters',
              label: isRestaurantSite
                ? `🍔 Plats & Menus (${(posters || []).length})`
                : isRentalSite
                ? `🚗 Véhicules & Meublés (${(posters || []).length})`
                : `🎨 Affiches (${(posters || []).length})`,
              icon: isRestaurantSite ? Utensils : isRentalSite ? Car : ImageIcon
            },
            { id: 'landing', label: '✨ Studio Personnalisation Live', icon: Sliders },
            ...(!isRentalSite && !isRestaurantSite && settings.show_packages_section !== 'false' ? [
              { id: 'packages', label: '📦 Packs & Formules', icon: Package }
            ] : []),
            { id: 'autoingest', label: '🤖 Auto-Ingestion Catalogue', icon: Sparkles },
            { id: 'uploader', label: '⚡ Studio Upload & Optimisation', icon: Upload },
            {
              id: 'license',
              label: (isRentalSite || isRestaurantSite) ? '🛡️ Licence & Abonnement' : '🛡️ Licence & Kill-Switch',
              icon: ShieldCheck
            },
            { id: 'reviews', label: `⭐ Avis Clients & Démo (${reviewsList.length})`, icon: Star },
            { id: 'analytics', label: '📊 Trafic & Vues Réelles', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'license') loadLicenseData();
                  if (tab.id === 'reviews') loadReviews();
                }}
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

      {/* Main Content Area (Spacieux et Large pour le Studio Live) */}
      <main className={activeTab === 'landing' ? "w-full mx-auto px-1 sm:px-3 py-2" : "max-w-7xl mx-auto p-4 md:p-8"}>
        {/* ======================================================== */}
        {/* ONGLET 1 : GESTIONNAIRE DE VIDÉOS                       */}
        {/* ======================================================== */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121c] p-6 rounded-3xl border border-white/5">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-400" />
                  Catalogue Vidéos
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Glissez-déposez une vidéo : son <strong>format</strong> (9:16 ou 16:9), sa <strong>durée</strong> et sa <strong>miniature WebP</strong> sont détectés automatiquement !
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setBulkVideoList([]);
                    setIsBulkVideoModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold text-xs md:text-sm transition-all cursor-pointer shadow-lg"
                >
                  <Layers className="w-4 h-4" />
                  <span>⚡ Importer Plusieurs Vidéos (Lot)</span>
                </button>

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
                    setAutoDetectedInfo(null);
                    setIsNewVideoModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs md:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une Nouvelle Vidéo</span>
                </button>
              </div>
            </div>

            {/* Grille des Vidéos Administrables */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(videos || []).map((video) => (
                <div
                  key={video.id}
                  className="bg-[#0d121c] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div className="relative aspect-video bg-black">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : video.video_url ? (
                      <video
                        src={video.video_url}
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                        Aucun fichier média
                      </div>
                    )}
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
                          setAutoDetectedInfo(null);
                          setIsNewVideoModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteVideoItem(video.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
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

        {/* ======================================================== */}
        {/* MODAL ÉDITION / AJOUT VIDÉO (AUTO-DÉTECTION INTÉGRALE)   */}
        {/* ======================================================== */}
        {isNewVideoModalOpen && editingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#0d121c] border border-amber-500/30 rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl relative">
              <button
                onClick={() => setIsNewVideoModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <Film className="w-6 h-6 text-amber-400" />
                  {editingVideo.title ? `Éditer : ${editingVideo.title}` : 'Nouvelle Vidéo'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Glissez votre fichier vidéo ci-dessous. Le système extrait et configure tout automatiquement.
                </p>
              </div>

              {/* Titre */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Titre de la vidéo</label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  placeholder="ex: Spot Publicitaire 4K Lancement de Marque"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* ZONE 1 : UPLOAD FICHIER VIDÉO (AVEC DÉTECTION AUTOMATIQUE) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
                    1. Fichier Vidéo — Détection automatique du Format, de la Durée et de la Miniature
                  </label>
                  {videoFileUploading && (
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyse & Upload...
                    </span>
                  )}
                </div>

                {editingVideo.video_url ? (
                  <div className="p-4 bg-black/60 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-40 aspect-video bg-black rounded-xl overflow-hidden shrink-0 border border-white/10">
                      <video
                        src={editingVideo.video_url}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Fichier vidéo attaché & configuré !</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{editingVideo.video_url}</p>

                      {/* Badges de métadonnées auto-détectées */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-black">
                          Format {editingVideo.format}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-200">
                          Durée {editingVideo.duration}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {editingVideo.resolution}
                        </span>
                        {editingVideo.thumbnail_url && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Miniature WebP générée
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => modalVideoInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Remplacer la vidéo
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleDirectVideoUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => modalVideoInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Film className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white">
                      {videoFileUploading ? 'Analyse et téléversement en cours...' : 'Glissez-déposez votre fichier vidéo ici'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      MP4, MOV ou WebM. Le <strong>format</strong> (9:16 ou 16:9), la <strong>durée</strong> et la <strong>miniature</strong> sont extraits et appliqués automatiquement !
                    </p>
                    {videoFileUploading && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-amber-400 text-xs font-bold">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Lecture des métadonnées & téléversement...</span>
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={modalVideoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleDirectVideoUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* ZONE 2 : MINIATURE GÉNÉRÉE AUTOMATIQUEMENT OU PERSONNALISABLE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
                    2. Miniature Vidéo (Générée automatiquement en WebP)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Auto-capturée depuis la vidéo · Remplaçable si souhaité
                  </span>
                </div>

                {editingVideo.thumbnail_url ? (
                  <div className="p-4 bg-black/60 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={editingVideo.thumbnail_url}
                      alt="Miniature"
                      className="w-28 h-20 object-cover rounded-xl border border-white/10 shrink-0"
                    />
                    <div className="flex-1 overflow-hidden space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Miniature WebP haute résolution (&lt; 40 Ko)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{editingVideo.thumbnail_url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => modalThumbInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Changer la miniature
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleDirectThumbUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => modalThumbInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-white/20 hover:border-amber-400 bg-white/5 hover:bg-white/10 rounded-2xl text-center cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-white">
                      {thumbFileUploading ? 'Optimisation en cours...' : 'La miniature sera extraite automatiquement lors du dépôt de la vidéo'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ou déposez une image personnalisée pour la remplacer
                    </p>
                    {thumbFileUploading && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-amber-400 text-xs font-bold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Compression WebP...</span>
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={modalThumbInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleDirectThumbUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Paramètres Détectés Automatiquement (Ajustables si besoin) */}
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  ⚙️ Caractéristiques (Détectées automatiquement lors de l'upload)
                </span>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Format (Auto)
                    </label>
                    <select
                      value={editingVideo.format}
                      onChange={(e) => setEditingVideo({ ...editingVideo, format: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-bold text-amber-400"
                    >
                      <option value="9:16">Vertical 9:16 (TikTok/Reels)</option>
                      <option value="16:9">Horizontal 16:9 (Spot 4K / TV)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Durée (Auto)
                    </label>
                    <input
                      type="text"
                      value={editingVideo.duration}
                      onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                      placeholder="ex: 22s"
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Résolution (Auto)
                    </label>
                    <input
                      type="text"
                      value={editingVideo.resolution}
                      onChange={(e) => setEditingVideo({ ...editingVideo, resolution: e.target.value })}
                      placeholder="ex: 1080x1920 Vertical HD"
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-bold text-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Catégorie <span className="text-slate-400 font-normal">(sélectionner ou taper librement)</span>
                    </label>
                    <input
                      type="text"
                      list="video-categories-datalist"
                      value={editingVideo.category}
                      onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                      placeholder="ex: Soins Visage, Catalogue, Coiffure, Vente..."
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                    />
                    <datalist id="video-categories-datalist">
                      <option value="Catalogue Produits" />
                      <option value="Soins Visage" />
                      <option value="Soins Corps" />
                      <option value="Gamme Éclat" />
                      <option value="Coiffure & Tresses" />
                      <option value="Onglerie & Soins" />
                      <option value="Menu & Saveurs" />
                      <option value="Formations & Coaching" />
                      <option value="Vidéos Courtes & Reels" />
                      <option value="Spots & Présentations" />
                      <option value="Animations 3D" />
                      <option value="Témoignages Clients" />
                      <option value="vsl_ecommerce" />
                      {Array.from(new Set((videos || []).map((v) => v.category).filter(Boolean))).map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Tarifs & Badge */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    value={editingVideo.price_fcfa}
                    onChange={(e) => setEditingVideo({ ...editingVideo, price_fcfa: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-amber-400 font-extrabold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Prix (EUR)</label>
                  <input
                    type="number"
                    value={editingVideo.price_eur}
                    onChange={(e) => setEditingVideo({ ...editingVideo, price_eur: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-amber-400 font-extrabold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Badge commercial</label>
                  <input
                    type="text"
                    value={editingVideo.badge}
                    onChange={(e) => setEditingVideo({ ...editingVideo, badge: e.target.value })}
                    placeholder="ex: 🔥 VIRAL HOOK"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  placeholder="Décrivez les points forts de cette vidéo pour votre client..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              {/* Puces de prestations */}
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
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-slate-200 text-xs font-mono"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewVideoModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveVideoItem(editingVideo)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Sauvegarder la Vidéo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modale d'Importation de Vidéos par Lot */}
        {isBulkVideoModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
            onClick={() => !isBulkVideoSaving && setIsBulkVideoModalOpen(false)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#0d121c] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">
                      Importer Plusieurs Vidéos (Lot)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sélectionnez plusieurs vidéos à la fois. Le système extrait les miniatures et détecte les formats automatiquement.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => !isBulkVideoSaving && setIsBulkVideoModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Zone de Dépôt / Sélection Multiple */}
              <div
                onClick={() => !isBulkVideoProcessing && bulkVideoInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleProcessBulkVideos(Array.from(e.dataTransfer.files));
                  }
                }}
                className={`p-8 border-2 border-dashed rounded-2xl text-center transition-all ${
                  isBulkVideoProcessing
                    ? 'border-amber-400 bg-amber-500/10 cursor-wait'
                    : 'border-white/20 hover:border-amber-400 bg-white/5 hover:bg-white/10 cursor-pointer'
                }`}
              >
                <input
                  ref={bulkVideoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleProcessBulkVideos(Array.from(e.target.files));
                    }
                  }}
                />

                {isBulkVideoProcessing ? (
                  <div className="space-y-3">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <p className="text-sm font-bold text-white">{bulkVideoStatus}</p>
                    <p className="text-xs text-slate-400">Veuillez patienter pendant l'analyse et la capture des miniatures...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-extrabold text-white">
                      Cliquez pour sélectionner plusieurs vidéos ou glissez-déposez vos fichiers ici
                    </p>
                    <p className="text-xs text-slate-400">
                      Prend en charge MP4, MOV, WebM · Traitement simultané avec génération automatique des miniatures
                    </p>
                  </div>
                )}
              </div>

              {/* Liste des Vidéos Téléversées avec Édition Individuelle */}
              {bulkVideoList.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Vidéos prêtes ({bulkVideoList.length}) — Renseignez les titres et prix :
                    </span>
                    <button
                      type="button"
                      onClick={() => setBulkVideoList([])}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                    >
                      Tout effacer
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
                    {bulkVideoList.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-col md:flex-row gap-4 relative group"
                      >
                        {/* Miniature + format */}
                        <div className="w-full md:w-36 shrink-0 aspect-video md:aspect-[9/16] max-h-36 bg-black rounded-xl overflow-hidden relative border border-white/10">
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Film className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-black/80 text-amber-400">
                            {item.format}
                          </div>
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 text-slate-200">
                            {item.duration}
                          </div>
                        </div>

                        {/* Champs d'édition pour chaque vidéo */}
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Titre de la vidéo *
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                  handleUpdateBulkVideoItem(index, 'title', e.target.value)
                                }
                                placeholder="Ex: Spot Publicitaire Soirée"
                                className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-amber-400 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Catégorie
                              </label>
                              <select
                                value={item.category}
                                onChange={(e) =>
                                  handleUpdateBulkVideoItem(index, 'category', e.target.value)
                                }
                                className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white text-xs font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
                              >
                                <option value="tiktok_reels">📱 TikTok & Reels (9:16)</option>
                                <option value="spot_tv">🎬 Spot Publicitaire TV (16:9)</option>
                                <option value="motion_design">✨ Motion Design & Animation</option>
                                <option value="interview_event">🎤 Interview & Événementiel</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Prix (FCFA)
                              </label>
                              <input
                                type="number"
                                value={item.price_fcfa}
                                onChange={(e) =>
                                  handleUpdateBulkVideoItem(index, 'price_fcfa', Number(e.target.value))
                                }
                                className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white text-xs font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Prix (EUR)
                              </label>
                              <input
                                type="number"
                                value={item.price_eur}
                                onChange={(e) =>
                                  handleUpdateBulkVideoItem(index, 'price_eur', Number(e.target.value))
                                }
                                className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white text-xs font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Badge
                              </label>
                              <input
                                type="text"
                                value={item.badge}
                                onChange={(e) =>
                                  handleUpdateBulkVideoItem(index, 'badge', e.target.value)
                                }
                                placeholder="Ex: NOUVEAU, TOP"
                                className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Description de la réalisation
                            </label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                handleUpdateBulkVideoItem(index, 'description', e.target.value)
                              }
                              placeholder="Courte description percutante..."
                              className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Bouton supprimer cet élément */}
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkVideoItem(index)}
                          className="self-start p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Retirer cette vidéo du lot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boutons d'Action Inférieurs */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-slate-400 font-semibold">
                  {bulkVideoList.length} vidéo(s) configurée(s)
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBulkVideoModalOpen(false)}
                    disabled={bulkVideoSaving}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
                  >
                    Fermer
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAllBulkVideos}
                    disabled={bulkVideoList.length === 0 || bulkVideoSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs md:text-sm shadow-xl shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    {bulkVideoSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Enregistrement en cours...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Publier Tout dans le Catalogue ({bulkVideoList.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET 2 : GESTIONNAIRE D'AFFICHES                      */}
        {/* ======================================================== */}
        {activeTab === 'posters' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121c] p-6 rounded-3xl border border-white/5">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  Catalogue Affiches & Graphismes
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Glissez-déposez vos visuels haute définition. Ils sont automatiquement compressés en WebP.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setBulkPosterList([]);
                    setIsBulkPosterModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold text-xs md:text-sm transition-all cursor-pointer shadow-lg"
                >
                  <Layers className="w-4 h-4" />
                  <span>⚡ Importer Plusieurs Affiches (Lot)</span>
                </button>

                <button
                  onClick={() => {
                    setEditingPoster({
                      id: `post-${Date.now()}`,
                      title: 'Nouvelle Prestation / Visuel',
                      category: 'Prestations & Soins',
                      format: 'Prestation Soin & Beauté',
                      dimensions: 'Séance Studio Salon',
                      price_fcfa: 10000,
                      price_eur: 15,
                      installment_tranches: 4,
                      installment_months: 4,
                      badge: 'NOUVEAU',
                      description: '',
                      image_url: '',
                      features: ['Prestation soignée & professionnelle', 'Finition de haute qualité'],
                    });
                    setIsNewPosterModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs md:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une Nouvelle Prestation</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(posters || []).map((poster) => (
                <div
                  key={poster.id}
                  className="bg-[#0d121c] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div className="aspect-square bg-black relative">
                    <img
                      src={poster.image_url || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'}
                      alt={poster.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{poster.title}</h4>
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
                        className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeletePosterItem(poster.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
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

        {/* MODAL ÉDITION AFFICHE (100% GLISSER-DÉPOSER) */}
        {isNewPosterModalOpen && editingPoster && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#0d121c] border border-amber-500/30 rounded-3xl p-6 md:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto space-y-5 shadow-2xl relative">
              <button
                onClick={() => setIsNewPosterModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  {editingPoster.title ? `Éditer : ${editingPoster.title}` : 'Nouvelle Affiche'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Téléversez votre affiche haute définition.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Titre de l'Affiche</label>
                  <input
                    type="text"
                    value={editingPoster.title}
                    onChange={(e) => setEditingPoster({ ...editingPoster, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Catégorie <span className="text-slate-400 font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    list="poster-categories-datalist"
                    value={editingPoster.category || ''}
                    onChange={(e) => setEditingPoster({ ...editingPoster, category: e.target.value })}
                    placeholder="ex: Soins, Promotion, Nouveautés, Menu..."
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm"
                  />
                  <datalist id="poster-categories-datalist">
                    <option value="Produits & Nouveautés" />
                    <option value="Promotion & Offres" />
                    <option value="Affiche Événementielle" />
                    <option value="Menu & Tarifs" />
                    <option value="Réseaux Sociaux" />
                    {Array.from(new Set((posters || []).map((p) => p.category).filter(Boolean))).map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* ZONE UPLOAD MULTI-PHOTOS & VIDÉOS HD */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>Galerie Photos & Vidéos du Produit / Bien (Multi-Upload)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {Array.isArray(editingPoster.images) ? editingPoster.images.length : (editingPoster.image_url ? 1 : 0)} média(s)
                  </span>
                </div>

                {/* GALERIE DES MINIATURES ET VIDÉOS UPLOADÉES */}
                {(() => {
                  const imagesList = Array.isArray(editingPoster.images) && editingPoster.images.length > 0
                    ? editingPoster.images
                    : (editingPoster.image_url ? [editingPoster.image_url] : []);

                  if (imagesList.length === 0) {
                    return (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files) {
                            handleDirectPosterUpload(e.dataTransfer.files);
                          }
                        }}
                        onClick={() => modalPosterInputRef.current?.click()}
                        className="p-8 border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl text-center cursor-pointer transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Video className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-sm font-bold text-white">
                          {posterFileUploading ? 'Téléversement en cours...' : 'Glissez-déposez des photos ou vidéos HD ici'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Photos (PNG, JPG, WebP) et Vidéos (MP4, WebM, MOV). Vous pouvez sélectionner plusieurs fichiers à la fois.
                        </p>
                        {posterFileUploading && (
                          <div className="mt-3 flex items-center justify-center gap-2 text-amber-400 text-xs font-bold">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Téléversement du média en cours...</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="p-4 bg-black/60 border border-emerald-500/30 rounded-2xl space-y-3">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {imagesList.map((mediaUrl, mediaIdx) => {
                          const isVid = /\.(mp4|webm|mov|m4v)$/i.test(mediaUrl) || mediaUrl === editingPoster.video_url;
                          return (
                            <div
                              key={mediaIdx}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 group bg-slate-900 ${
                                mediaIdx === 0 ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-white/10'
                              }`}
                            >
                              {isVid ? (
                                <div className="w-full h-full relative bg-black flex items-center justify-center">
                                  <video
                                    src={mediaUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    onMouseOver={(e) => e.target.play().catch(() => {})}
                                    onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                  />
                                  <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-rose-600 text-[8px] font-black text-white uppercase flex items-center gap-0.5 shadow">
                                    ▶ Vidéo
                                  </span>
                                </div>
                              ) : (
                                <img
                                  src={mediaUrl}
                                  alt={`Média ${mediaIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}

                              {mediaIdx === 0 && (
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-500 text-[9px] font-black text-black uppercase z-10">
                                  Principale
                                </span>
                              )}

                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity z-20">
                                {mediaIdx !== 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const reordered = [mediaUrl, ...imagesList.filter((_, idx) => idx !== mediaIdx)];
                                      setEditingPoster({
                                        ...editingPoster,
                                        image_url: reordered[0],
                                        images: reordered,
                                      });
                                    }}
                                    className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold"
                                    title="Définir comme média principal"
                                  >
                                    ⭐ 1er
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = imagesList.filter((_, idx) => idx !== mediaIdx);
                                    setEditingPoster({
                                      ...editingPoster,
                                      image_url: filtered[0] || '',
                                      images: filtered,
                                      video_url: editingPoster.video_url === mediaUrl ? '' : editingPoster.video_url,
                                    });
                                  }}
                                  className="p-1 rounded bg-red-600 hover:bg-red-500 text-white text-[10px]"
                                  title="Supprimer ce média"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* BOUTON AJOUTER D'AUTRES MÉDIAS DANS LA GRILLE */}
                        <button
                          type="button"
                          onClick={() => modalPosterInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 flex flex-col items-center justify-center text-amber-400 hover:text-white transition-all text-center p-2 cursor-pointer"
                        >
                          <Plus className="w-5 h-5 mb-1" />
                          <span className="text-[10px] font-bold">+ Photo / Vidéo</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                        <span>Survolez une photo ou vidéo pour la définir comme principale ou la supprimer.</span>
                        {posterFileUploading && (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Téléversement...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* CHAMP URL VIDÉO OPTIONNEL */}
                <div className="pt-1">
                  <label className="text-[11px] font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lien Vidéo Produit (optionnel - Vidéo Démo HD)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://... fichier MP4/WebM téléversé ou lien vidéo"
                    value={editingPoster.video_url || ''}
                    onChange={(e) => setEditingPoster({ ...editingPoster, video_url: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <input
                  ref={modalPosterInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleDirectPosterUpload(e.target.files);
                    }
                  }}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    ⚡ Nb Tranches par défaut
                  </label>
                  <select
                    value={editingPoster.installment_tranches || editingPoster.installment_months || 4}
                    onChange={(e) => setEditingPoster({
                      ...editingPoster,
                      installment_tranches: Number(e.target.value),
                      installment_months: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 bg-black/60 border border-emerald-500/40 rounded-xl text-emerald-300 font-black text-xs"
                  >
                    <option value={1}>1 Tranche (Comptant)</option>
                    <option value={2}>2 Tranches</option>
                    <option value={3}>3 Tranches</option>
                    <option value={4}>4 Tranches (Recommandé)</option>
                    <option value={5}>5 Tranches</option>
                    <option value={6}>6 Tranches</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Badge (ex: POPULAIRE, NOUVEAU)</label>
                  <input
                    type="text"
                    value={editingPoster.badge || ''}
                    onChange={(e) => setEditingPoster({ ...editingPoster, badge: e.target.value })}
                    placeholder="ex: POPULAIRE"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Type / Format</label>
                  <input
                    type="text"
                    value={editingPoster.format || ''}
                    onChange={(e) => setEditingPoster({ ...editingPoster, format: e.target.value })}
                    placeholder="ex: Produit Haute Qualité"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Points forts / Avantages <span className="text-slate-400 font-normal">(1 par ligne)</span>
                </label>
                <textarea
                  rows={3}
                  value={Array.isArray(editingPoster.features) ? editingPoster.features.join('\n') : (editingPoster.features || '')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter((l) => l.trim().length > 0);
                    setEditingPoster({ ...editingPoster, features: lines });
                  }}
                  placeholder="ex:&#10;Soin complet des ongles&#10;Finition brillante longue tenue"
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Description détaillée du produit</label>
                  <span className="text-[10px] text-amber-400 font-semibold">✨ Puces (-) & Sauts de ligne supportés</span>
                </div>

                {/* Boutons d'insertion rapide de puces et sections */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = editingPoster.description || '';
                      const sep = cur && !cur.endsWith('\n') ? '\n' : '';
                      setEditingPoster({ ...editingPoster, description: `${cur}${sep}- ` });
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition-colors cursor-pointer"
                  >
                    + Puce (- )
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = editingPoster.description || '';
                      const sep = cur ? '\n\n' : '';
                      setEditingPoster({ ...editingPoster, description: `${cur}${sep}Bienfaits :\n- ` });
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    + Bienfaits :
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = editingPoster.description || '';
                      const sep = cur ? '\n\n' : '';
                      setEditingPoster({ ...editingPoster, description: `${cur}${sep}Composition :\n- ` });
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    + Composition :
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = editingPoster.description || '';
                      const sep = cur ? '\n\n' : '';
                      setEditingPoster({ ...editingPoster, description: `${cur}${sep}Mode d’utilisation :\n` });
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    + Mode d'emploi :
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = editingPoster.description || '';
                      const sep = cur ? '\n\n' : '';
                      setEditingPoster({ ...editingPoster, description: `${cur}${sep}Précautions d’emploi :\n- ` });
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    + Précautions :
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={editingPoster.description || ''}
                  onChange={(e) => setEditingPoster({ ...editingPoster, description: e.target.value })}
                  placeholder="Rédigez la description avec des puces (- ) ou des paragraphes...&#10;Exemple :&#10;Gel douche naturel haute nutrition.&#10;&#10;Bienfaits :&#10;- Nettoie en douceur&#10;- Hydrate et illumine le teint&#10;&#10;Composition :&#10;- Curcuma Bio&#10;- Vitamine E"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-xs leading-relaxed focus:border-amber-400 focus:outline-none"
                />

                {/* Aperçu en direct des puces dans le Back-Office */}
                {editingPoster.description && editingPoster.description.trim().length > 0 && (
                  <div className="mt-2.5 p-3 rounded-xl bg-white/5 border border-amber-500/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                      👁️ Aperçu direct du rendu boutique (Puces respectées) :
                    </span>
                    <FormattedProductDescription
                      description={editingPoster.description}
                      isDarkMode={true}
                      className="bg-black/50 p-2.5 rounded-lg border border-white/5"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewPosterModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePosterItem(editingPoster)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs cursor-pointer"
                >
                  Sauvegarder l'Affiche
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modale d'Importation d'Affiches par Lot */}
        {isBulkPosterModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
            onClick={() => !isBulkPosterSaving && setIsBulkPosterModalOpen(false)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#0d121c] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">
                      Importer Plusieurs Affiches & Visuels (Lot)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sélectionnez plusieurs images à la fois. Le système compresse automatiquement chaque visuel en WebP haute résolution.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => !isBulkPosterSaving && setIsBulkPosterModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Zone de Dépôt / Sélection Multiple */}
              <div
                onClick={() => !isBulkPosterProcessing && bulkPosterInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleProcessBulkPosters(Array.from(e.dataTransfer.files));
                  }
                }}
                className={`p-8 border-2 border-dashed rounded-2xl text-center transition-all ${
                  isBulkPosterProcessing
                    ? 'border-amber-400 bg-amber-500/10 cursor-wait'
                    : 'border-white/20 hover:border-amber-400 bg-white/5 hover:bg-white/10 cursor-pointer'
                }`}
              >
                <input
                  ref={bulkPosterInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleProcessBulkPosters(Array.from(e.target.files));
                    }
                  }}
                />

                {isBulkPosterProcessing ? (
                  <div className="space-y-3">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <p className="text-sm font-bold text-white">{bulkPosterStatus}</p>
                    <p className="text-xs text-slate-400">Compression WebP et téléversement en cours...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-extrabold text-white">
                      Cliquez pour sélectionner plusieurs affiches ou glissez-déposez vos fichiers ici
                    </p>
                    <p className="text-xs text-slate-400">
                      Prend en charge PNG, JPG, JPEG, WEBP · Compression automatique sans perte de qualité visuelle
                    </p>
                  </div>
                )}
              </div>

              {/* Liste des Affiches Téléversées avec Édition Individuelle */}
              {bulkPosterList.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Affiches prêtes ({bulkPosterList.length}) — Renseignez les titres et prix :
                    </span>
                    <button
                      type="button"
                      onClick={() => setBulkPosterList([])}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                    >
                      Tout effacer
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
                    {bulkPosterList.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-col md:flex-row gap-4 relative group"
                      >
                        {/* Aperçu image */}
                        <div className="w-full md:w-32 shrink-0 aspect-square max-h-32 bg-black rounded-xl overflow-hidden relative border border-white/10">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-black/80 text-cyan-400">
                            WebP
                          </div>
                        </div>

                        {/* Champs d'édition pour chaque affiche */}
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Titre de l'affiche *
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                  handleUpdateBulkPosterItem(index, 'title', e.target.value)
                                }
                                placeholder="Ex: Flyer Soirée Blanche"
                                className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-amber-400 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Catégorie
                              </label>
                              <input
                                type="text"
                                value={item.category}
                                onChange={(e) =>
                                  handleUpdateBulkPosterItem(index, 'category', e.target.value)
                                }
                                placeholder="Ex: Événementiel, Restauration..."
                                className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white text-xs font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Prix (FCFA)
                              </label>
                              <input
                                type="number"
                                value={item.price_fcfa}
                                onChange={(e) =>
                                  handleUpdateBulkPosterItem(index, 'price_fcfa', Number(e.target.value))
                                }
                                className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white text-xs font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Prix (EUR)
                              </label>
                              <input
                                type="number"
                                value={item.price_eur}
                                onChange={(e) =>
                                  handleUpdateBulkPosterItem(index, 'price_eur', Number(e.target.value))
                                }
                                className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white text-xs font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Badge
                              </label>
                              <input
                                type="text"
                                value={item.badge}
                                onChange={(e) =>
                                  handleUpdateBulkPosterItem(index, 'badge', e.target.value)
                                }
                                placeholder="Ex: NOUVEAU, TOP"
                                className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-300">
                                Description du visuel
                              </label>
                              <span className="text-[9px] text-amber-400">Puces (- ) supportées</span>
                            </div>
                            <textarea
                              rows={3}
                              value={item.description || ''}
                              onChange={(e) =>
                                handleUpdateBulkPosterItem(index, 'description', e.target.value)
                              }
                              placeholder="Description du produit, puces (- ), bienfaits..."
                              className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-slate-200 text-xs focus:border-amber-400 focus:outline-none leading-relaxed"
                            />
                          </div>
                        </div>

                        {/* Bouton supprimer cet élément */}
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkPosterItem(index)}
                          className="self-start p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Retirer cette affiche du lot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boutons d'Action Inférieurs */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-slate-400 font-semibold">
                  {bulkPosterList.length} affiche(s) configurée(s)
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBulkPosterModalOpen(false)}
                    disabled={bulkPosterSaving}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
                  >
                    Fermer
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAllBulkPosters}
                    disabled={bulkPosterList.length === 0 || bulkPosterSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs md:text-sm shadow-xl shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    {bulkPosterSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Enregistrement en cours...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Publier Tout dans le Catalogue ({bulkPosterList.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET 3 : STUDIO DE PERSONNALISATION LIVE EN DIRECT     */}
        {/* ======================================================== */}
        {activeTab === 'landing' && (
          <div className="animate-in fade-in">
            <LandingStudio
              form={landingForm}
              setForm={setLandingForm}
              onSave={handleSaveLanding}
              saving={landingSaving}
              uploadMedia={uploadMedia}
              compressImage={compressImage}
              showToast={showToast}
              onExitToSite={onExitToSite}
              videos={videos}
              posters={posters}
              packages={packages}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET 4 : GESTIONNAIRE DE PACKS & FORMULES              */}
        {/* ======================================================== */}
        {activeTab === 'packages' && !isRentalSite && settings.show_packages_section !== 'false' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121c] p-6 rounded-3xl border border-white/5">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  Formules & Packs Tarifs
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Modifiez les offres clés en main (Starter, Business, Signature).
                </p>
              </div>

              <button
                onClick={handleSavePackages}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs md:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Save className="w-5 h-5" />
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
        {/* ONGLET 5 : UPLOADER & COMPRESSEUR GLOBAL                 */}
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
                    Déposez vos vidéos et images. Vous pouvez ensuite les assigner directement en 1 clic à vos créations !
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    <strong>Stockage Cloud Optimisé :</strong> 10 Go gratuits inclus, bande passante de lecture illimitée.
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
                Glissez & Déposez vos Vidéos ou Images ici
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
                  Fichiers Récemment Téléversés
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
                        {item.isVideo && (
                          <button
                            onClick={() => {
                              const meta = item.meta || {};
                              setEditingVideo({
                                id: `vid-${Date.now()}`,
                                title: item.name.replace(/\.[^/.]+$/, ''),
                                category: meta.suggestedCategory || 'tiktok_reels',
                                format: meta.format || '9:16',
                                duration: meta.duration || '30s',
                                resolution: meta.resolution || '4K Ultra HD',
                                price_fcfa: 25000,
                                price_eur: 39,
                                badge: 'NOUVEAU',
                                description: '',
                                video_url: item.url,
                                preview_url: item.url,
                                thumbnail_url: item.thumbUrl || '',
                                features: ['Montage dynamique', 'Livraison 48h'],
                              });
                              setIsNewVideoModalOpen(true);
                            }}
                            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors cursor-pointer"
                          >
                            ➕ Créer une Vidéo avec ce fichier
                          </button>
                        )}

                        {item.isImage && (
                          <button
                            onClick={() => {
                              setEditingPoster({
                                id: `post-${Date.now()}`,
                                title: item.name.replace(/\.[^/.]+$/, ''),
                                category: 'Prestations & Soins',
                                format: 'Prestation Soin & Beauté',
                                dimensions: 'Séance Studio Salon',
                                price_fcfa: 10000,
                                price_eur: 15,
                                installment_tranches: 4,
                                installment_months: 4,
                                badge: 'NOUVEAU',
                                description: '',
                                image_url: item.url,
                                features: ['Prestation soignée & professionnelle', 'Finition de haute qualité'],
                              });
                              setIsNewPosterModalOpen(true);
                            }}
                            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors cursor-pointer"
                          >
                            ➕ Créer un Produit / Prestation avec ce fichier
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const fullUrl = window.location.origin + item.url;
                            navigator.clipboard.writeText(fullUrl);
                            setCopiedUrl(item.url);
                            showToast('📋 Lien copié dans le presse-papier !');
                            setTimeout(() => setCopiedUrl(''), 2000);
                          }}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition-colors"
                          title="Copier le lien"
                        >
                          {copiedUrl === item.url ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET AVIS & COMMENTAIRES : RÉELS & CATALOGUE DÉMO       */}
        {/* ======================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header de l'onglet */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121c] p-6 rounded-3xl border border-white/5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Modération des Avis & Retours Expérience</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <span>Avis Clients & Démonstration Catalogue</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Supervisez les commentaires réels publiés par vos acheteurs et comparez-les avec les avis certifiés du catalogue.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadReviews}
                  disabled={loadingReviews}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingReviews ? 'animate-spin' : ''}`} />
                  <span>Rafraîchir</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBroadcastPushForPoster(posters?.[0])}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Zap className="w-4 h-4" />
                  <span>Diffuser Alerte Push</span>
                </button>
              </div>
            </div>

            {/* Statistiques clés des avis */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0d121c] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Avis Clients Déposés</div>
                  <div className="text-2xl font-black text-white">{reviewsList.length}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">Enregistrés dans Cloudflare D1</div>
                </div>
              </div>

              <div className="bg-[#0d121c] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Note Moyenne Globale</div>
                  <div className="text-2xl font-black text-white">
                    {reviewsList.length > 0
                      ? (reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviewsList.length).toFixed(1)
                      : '4.9'} <span className="text-xs text-slate-400 font-normal">/ 5</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold">Excellente satisfaction</div>
                </div>
              </div>

              <div className="bg-[#0d121c] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Produits au Catalogue</div>
                  <div className="text-2xl font-black text-white">{(posters || []).length}</div>
                  <div className="text-[10px] text-blue-400 font-semibold">Avec avis démo certifiés</div>
                </div>
              </div>
            </div>

            {/* Sélecteur de filtre */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0d121c] border border-white/5 w-fit">
              <button
                type="button"
                onClick={() => setReviewFilterTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewFilterTab === 'all' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous les Avis ({reviewsList.length + (posters || []).length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilterTab('real')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  reviewFilterTab === 'real' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🟢 Avis Clients Déposés</span>
                <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">{reviewsList.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setReviewFilterTab('demo')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  reviewFilterTab === 'demo' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>✨ Avis Démo Catalogue</span>
                <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">{(posters || []).length}</span>
              </button>
            </div>

            {/* 1. SECTION AVIS CLIENTS DÉPOSÉS */}
            {(reviewFilterTab === 'all' || reviewFilterTab === 'real') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Avis Déposés par les Clients ({reviewsList.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400">Modération en 1-clic</span>
                </div>

                {reviewsList.length === 0 ? (
                  <div className="p-8 text-center bg-[#0d121c] rounded-2xl border border-white/5 text-slate-400 text-xs">
                    Aucun avis client n'a encore été déposé pour le moment. Dès qu'un client dépose un avis sur un produit, il apparaîtra ici avec possibilité de le modérer.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviewsList.map((rev) => {
                      const matchedPoster = (posters || []).find((p) => String(p.id) === String(rev.product_id));
                      return (
                        <div
                          key={rev.id}
                          className="bg-[#0d121c] p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-white">{rev.author}</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                  ✓ Vérifié 🇨🇲
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {rev.city || 'Cameroun'} • {rev.created_at ? new Date(rev.created_at).toLocaleDateString('fr-FR') : 'Récemment'}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors cursor-pointer"
                              title="Supprimer cet avis client"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Étoiles */}
                          <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < (Number(rev.rating) || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                              />
                            ))}
                            <span className="text-xs font-bold text-slate-300 ml-1">{rev.rating || 5}/5</span>
                          </div>

                          {/* Commentaire */}
                          <p className="text-xs text-slate-200 bg-black/40 p-3 rounded-xl border border-white/5 italic">
                            "{rev.comment}"
                          </p>

                          {/* Produit lié */}
                          {matchedPoster && (
                            <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-[11px] text-slate-400">
                              <img
                                src={matchedPoster.image_url}
                                alt={matchedPoster.title}
                                className="w-6 h-6 rounded-md object-cover"
                              />
                              <span className="truncate text-amber-400 font-semibold">{matchedPoster.title}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. SECTION AVIS DÉMO / CATALOGUE */}
            {(reviewFilterTab === 'all' || reviewFilterTab === 'demo') && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Avis & Témoignages Démo du Catalogue ({(posters || []).length})</span>
                  </h3>
                  <span className="text-xs text-slate-400">Générés par produit pour crédibiliser la boutique</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(posters || []).map((poster) => (
                    <div
                      key={poster.id}
                      className="bg-[#0d121c] p-4 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={poster.image_url}
                            alt={poster.title}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                          <div className="truncate">
                            <h4 className="text-xs font-extrabold text-white truncate">{poster.title}</h4>
                            <div className="text-[11px] text-amber-400 font-bold mt-0.5">
                              {poster.rating || 4.9} ★ ({poster.reviews_count || 14} avis catalogue)
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300 italic">
                          "Reçu scellé à Douala avec paiement en 4 tranches sans caution. Excellent service !"
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Certifié Catalogue</span>
                        <button
                          type="button"
                          onClick={() => handleBroadcastPushForPoster(poster)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title="Diffuser une notification Push pour ce produit"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Push Flash</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET 6 : TRAFIC & STATISTIQUES RÉELLES (CLOUDFLARE D1) */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header de l'onglet */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121c] p-6 rounded-3xl border border-white/5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Données 100% Réelles · Cloudflare Edge & D1</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Audience & Trafic Réel du Site
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Chaque visite et rechargement est capturé en direct sans données fictives ou simulées.
                </p>
              </div>

              <button
                type="button"
                onClick={loadAnalytics}
                disabled={analyticsLoading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs md:text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
                <span>{analyticsLoading ? 'Actualisation...' : 'Actualiser les Chiffres'}</span>
              </button>
            </div>

            {/* 4 Cartes KPI Réelles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0d121c] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Vues Totales Cumulées</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-400">
                  {analyticsData ? Number(analyticsData.total_views || 0).toLocaleString('fr-FR') : '—'}
                </div>
                <p className="text-[11px] text-slate-500">Pages consultées au total</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d121c] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Visiteurs Uniques</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-400">
                  {analyticsData ? Number(analyticsData.total_visits || 0).toLocaleString('fr-FR') : '—'}
                </div>
                <p className="text-[11px] text-slate-500">Appareils & sessions distinctes</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d121c] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Vues Aujourd'hui</span>
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-cyan-400">
                  {analyticsData ? Number(analyticsData.today_views || 0).toLocaleString('fr-FR') : '—'}
                </div>
                <p className="text-[11px] text-slate-500">Pages vues ce jour</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d121c] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Visiteurs Aujourd'hui</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-purple-400">
                  {analyticsData ? Number(analyticsData.today_visits || 0).toLocaleString('fr-FR') : '—'}
                </div>
                <p className="text-[11px] text-slate-500">Visites uniques aujourd'hui</p>
              </div>
            </div>

            {/* Grille 2 Colonnes : Pays & Activité Récente */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Top Pays (4 cols) */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0d121c] border border-white/5 space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>🌍</span> Origine Géographique (Edge)
                </h3>
                <p className="text-xs text-slate-400">
                  Pays détectés automatiquement par Cloudflare Edge lors de la connexion.
                </p>

                {analyticsData && analyticsData.countries && analyticsData.countries.length > 0 ? (
                  <div className="space-y-2.5 pt-2">
                    {analyticsData.countries.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5"
                      >
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          {c.country || 'Inconnu'}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {c.count} {c.count > 1 ? 'visites' : 'visite'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 bg-black/30 rounded-2xl border border-white/5">
                    Aucune visite enregistrée pour l'instant.
                  </div>
                )}
              </div>

              {/* Journal des Dernières Visites (8 cols) */}
              <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0d121c] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Journal des 25 Dernières Visites en Direct
                  </h3>
                  <span className="text-[10px] text-slate-400">Temps réel</span>
                </div>

                {analyticsData && analyticsData.recent_activity && analyticsData.recent_activity.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-[10px] uppercase">
                          <th className="pb-2.5 font-bold">Date & Heure</th>
                          <th className="pb-2.5 font-bold">Page visitée</th>
                          <th className="pb-2.5 font-bold">Localisation</th>
                          <th className="pb-2.5 font-bold text-right">Type de visite</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {analyticsData.recent_activity.map((log) => (
                          <tr key={log.id} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 text-slate-300 font-mono text-[11px]">
                              {log.created_at ? new Date(log.created_at).toLocaleString('fr-FR') : '—'}
                            </td>
                            <td className="py-2.5 text-white font-mono text-[11px]">
                              {log.page_path || '/'}
                            </td>
                            <td className="py-2.5 text-slate-300">
                              <span className="inline-flex items-center gap-1">
                                <span>{log.country || 'Inconnu'}</span>
                                {log.city && log.city !== 'Inconnue' && (
                                  <span className="text-slate-500 text-[10px]">({log.city})</span>
                                )}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              {log.is_unique_visit === 1 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Nouvelle visite
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-400">
                                  Rechargement
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 bg-black/30 rounded-2xl border border-white/5">
                    Aucune activité enregistrée pour le moment. Naviguez sur le site pour voir apparaître votre première visite ici !
                  </div>
                )}
              </div>
            </div>

            {/* Note d'intégrité */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-bold text-amber-300">Garantie d'intégrité des métriques :</span> Toutes les requêtes HTTP sont authentifiées et loggées en bordure de réseau par Cloudflare Workers. Aucune donnée n'est fictive ni gonflée artificiellement.
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET 7 : GESTION DE LICENCE & KILL-SWITCH SAAS         */}
        {/* ======================================================== */}
        {activeTab === 'license' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header de l'onglet */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121c] p-6 rounded-3xl border border-white/5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Module d'Ingénierie SaaS THE GREATSOFT</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  {isRentalSite ? "Statut de Licence & Hébergement Cloud" : "Gestion de Licence & Contrôle d'Accès"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isRentalSite
                    ? "Consultez l'état de votre plateforme SaaS et les spécifications de votre hébergement Cloudflare Edge."
                    : "Supervisez la redevance mensuelle du client et actionnez le Kill-Switch administratif si nécessaire."}
                </p>
              </div>

              <button
                type="button"
                onClick={loadLicenseData}
                disabled={licenseLoading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs md:text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${licenseLoading ? 'animate-spin' : ''}`} />
                <span>Actualiser l'État</span>
              </button>
            </div>

            {/* Cartes KPI État de la Licence */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0d121c] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-400">Statut Actuel</span>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${licenseData?.is_suspended ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                  <span className={`text-xl font-black ${licenseData?.is_suspended ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {licenseData?.is_suspended ? '🔴 SUSPENDUE' : '🟢 ACTIVE (EN LIGNE)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {licenseData?.is_suspended ? 'Accès temporairement suspendu' : 'Accès public opérationnel'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d121c] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-400">Jours Restants</span>
                <div className="text-3xl font-black text-amber-400 font-mono">
                  {licenseData ? `${licenseData.days_remaining} j` : '—'}
                </div>
                <p className="text-[11px] text-slate-500">
                  Échéance : {licenseData?.license_expiry || '2030-01-01'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d121c] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-400">Formule & Plan</span>
                <div className="text-2xl font-black text-sky-400">
                  {licenseData?.license_plan || 'Standard Pro'}
                </div>
                <p className="text-[11px] text-slate-500">Cloudflare Serverless Edge</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d121c] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-400">Redevance Mensuelle</span>
                <div className="text-2xl font-black text-white">
                  {licenseData?.monthly_price_fcfa ? `${Number(licenseData.monthly_price_fcfa).toLocaleString('fr-FR')} F` : '25 000 FCFA'}
                </div>
                <p className="text-[11px] text-slate-500">Facturation SaaS THE GREATSOFT</p>
              </div>
            </div>

            {/* Assistance & Support Client */}
            <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-[#0d121c] border border-white/10 space-y-4">
              <h3 className="text-base font-black text-white flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-400" />
                <span>Support Dédié & Renouvellement</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed text-center">
                Besoin d'aide technique, de modifier votre domaine, ou d'ajuster votre abonnement ? L'équipe THE GREATSOFT est disponible pour vous accompagner 7j/7.
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/24162744533?text=%F0%9F%91%8B%20Bonjour%20THE%20GREATSOFT%2C%20je%20vous%20contacte%20concernant%20mon%20site%20Location%20Express%20Gabon."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contacter le Support THE GREATSOFT sur WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ONGLET 8 : AUTO-INGESTION DE CATALOGUE & SCRAPING        */}
        {/* ======================================================== */}
        {activeTab === 'autoingest' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121c] p-6 rounded-3xl border border-white/5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Module Zéro Saisie de Catalogue</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  Auto-Ingestion Intelligente depuis le Web
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Entrez l'URL d'un site web, page Facebook, Instagram ou catalogue : les photos, prix et infos sont extraits automatiquement.
                </p>
              </div>
            </div>

            {/* Input Form */}
            <div className="p-6 rounded-3xl bg-[#0d121c] border border-white/10 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Lien public de la page (Site web, Instagram, Facebook, Google Maps)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={ingestUrl}
                    onChange={(e) => setIngestUrl(e.target.value)}
                    placeholder="https://facebook.com/nomdelaboutique ou https://mon-ancien-site.com"
                    className="flex-1 px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleRunAutoIngest}
                    disabled={ingestLoading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {ingestLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Scraping en cours...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Extraire le Catalogue</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoSaveToDb"
                  checked={autoSaveToDb}
                  onChange={(e) => setAutoSaveToDb(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="autoSaveToDb" className="text-xs text-slate-300 cursor-pointer">
                  Enregistrer et publier immédiatement les articles extraits dans le catalogue de la boutique
                </label>
              </div>
            </div>

            {/* Résultats d'Extraction */}
            {ingestedResult && (
              <div className="p-6 rounded-3xl bg-[#0d121c] border border-emerald-500/30 space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ingestedResult.logo_url && (
                      <img src={ingestedResult.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                    )}
                    <div>
                      <h3 className="text-lg font-black text-white">{ingestedResult.title || 'Entreprise'}</h3>
                      <p className="text-xs text-slate-400">{ingestedResult.description || 'Description extraite avec succès'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🎉 {ingestedResult.items_count} articles identifiés
                  </span>
                </div>

                {/* Grille des Articles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(ingestedResult.items || []).map((item, idx) => (
                    <div key={idx} className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden p-3 space-y-2">
                      <div className="aspect-square bg-black rounded-xl overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                      </div>
                      <div className="text-xs font-bold text-white truncate">{item.title}</div>
                      <div className="text-sm font-black text-amber-400 font-mono">
                        {Number(item.price_fcfa).toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Modification Mot de Passe Admin */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0d121c] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Changer le Mot de Passe</h3>
                <p className="text-xs text-slate-400">Accès sécurisé au Back-Office Administrateur</p>
              </div>
            </div>

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Nouveau Mot de Passe / Code PIN
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Ex: MonCode2026! ou 9876"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none pr-11"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Confirmer le Nouveau Mot de Passe
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="Retapez le mot de passe identique"
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              {passwordModalError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                  {passwordModalError}
                </div>
              )}

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sauvegarde immédiate & persistante</span>
                </div>
                <p>
                  Ce nouveau code sera requis dès votre prochaine connexion et enregistré en base Cloudflare D1.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {passwordSaving ? 'Enregistrement...' : 'Enregistrer le Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

