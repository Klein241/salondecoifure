// =======================================================
// DIGITAL MARK PRO - API Client & WhatsApp Engine
// =======================================================

import {
  INITIAL_VIDEOS,
  INITIAL_POSTERS,
  INITIAL_PACKAGES,
  INITIAL_SETTINGS,
} from '../data/initialData';

const LOCAL_STORAGE_KEY_VIDEOS = 'dmp_videos';
const LOCAL_STORAGE_KEY_POSTERS = 'dmp_posters';
const LOCAL_STORAGE_KEY_PACKAGES = 'dmp_packages';
const LOCAL_STORAGE_KEY_SETTINGS = 'dmp_settings';

export function getActiveTenantSlug() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const rawTenant = params.get('t') || params.get('tenant');
  if (rawTenant) {
    const cleanTenant = rawTenant.split('/')[0].split('?')[0].split('&')[0].toLowerCase().trim();
    try {
      sessionStorage.setItem('dmp_active_tenant', cleanTenant);
    } catch (e) {}
    return cleanTenant;
  }

  // Si on est à la racine sans paramètre de tenant dans l'URL (?t= ou ?tenant=),
  // on NE DOIT PAS restaurer un ancien tenant en cache de session : l'utilisateur visite le Master !
  if (!window.location.search.includes('t=') && !window.location.search.includes('tenant=')) {
    try {
      sessionStorage.removeItem('dmp_active_tenant');
    } catch (e) {}
    return '';
  }

  try {
    const cached = sessionStorage.getItem('dmp_active_tenant') || '';
    return cached.split('/')[0].split('?')[0].split('&')[0].toLowerCase().trim();
  } catch (e) {
    return '';
  }
}

export function getTenantQueryParam(existingParam = '') {
  const t = getActiveTenantSlug();
  if (!t) return existingParam ? `?${existingParam}` : '';
  if (existingParam) return `?t=${encodeURIComponent(t)}&${existingParam}`;
  return `?t=${encodeURIComponent(t)}`;
}

export function getTenantHeaders() {
  const t = getActiveTenantSlug();
  return t ? { 'X-Tenant-Slug': t } : {};
}

export function getScopedStorageKey(baseKey) {
  const t = getActiveTenantSlug();
  return t ? `${baseKey}_${t}` : baseKey;
}

function getLocalItem(key, fallback) {
  try {
    const saved = localStorage.getItem(getScopedStorageKey(key));
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return fallback;
}

function setLocalItem(key, data) {
  try {
    localStorage.setItem(getScopedStorageKey(key), JSON.stringify(data));
  } catch (e) {
    console.warn('Storage write error:', e);
  }
}

// 1. VIDEOS API
export async function fetchVideos(category = 'all') {
  try {
    const query = getTenantQueryParam(category !== 'all' ? `category=${category}` : '');
    const res = await fetch(`/api/videos${query}`, {
      headers: getTenantHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setLocalItem(LOCAL_STORAGE_KEY_VIDEOS, data.data);
        return data.data;
      }
    }
  } catch (err) {
    // Mode local ou hors ligne
  }

  const cached = getLocalItem(LOCAL_STORAGE_KEY_VIDEOS, INITIAL_VIDEOS);
  if (category && category !== 'all') {
    return cached.filter((v) => v.category === category);
  }
  return cached;
}

export async function saveVideo(videoData) {
  try {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videoData),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('saveVideo error:', e);
  }
  return { success: true };
}

export async function deleteVideo(id) {
  try {
    const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('deleteVideo error:', e);
  }
  return { success: true };
}

// 2. POSTERS API
export async function fetchPosters(forceRefresh = false) {
  const tenantSlug = getActiveTenantSlug();

  // 1. Toujours interroger la base Cloudflare D1 en direct pour garantir les nouveaux produits en temps réel
  try {
    const res = await fetch(`/api/posters${getTenantQueryParam()}`, {
      headers: { ...getTenantHeaders(), 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        setLocalItem(LOCAL_STORAGE_KEY_POSTERS, data.data);
        if (typeof window !== 'undefined') {
          window.__INITIAL_POSTERS__ = data.data;
          if (window.__INITIAL_SETTINGS__) {
            window.__INITIAL_SETTINGS__.custom_posters = data.data;
          }
        }
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[D1 fetchPosters error]:', err);
  }

  // 2. Fallback SSR injecté si disponible
  if (
    typeof window !== 'undefined' &&
    Array.isArray(window.__INITIAL_POSTERS__) &&
    window.__INITIAL_POSTERS__.length > 0 &&
    (!tenantSlug || (window.__INITIAL_SETTINGS__ && window.__INITIAL_SETTINGS__.tenant_slug === tenantSlug))
  ) {
    setLocalItem(LOCAL_STORAGE_KEY_POSTERS, window.__INITIAL_POSTERS__);
    return window.__INITIAL_POSTERS__;
  }

  return getLocalItem(LOCAL_STORAGE_KEY_POSTERS, INITIAL_POSTERS);
}

export async function savePoster(posterData) {
  try {
    const res = await fetch(`/api/posters${getTenantQueryParam()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getTenantHeaders() },
      body: JSON.stringify(posterData),
    });
    const current = getLocalItem(LOCAL_STORAGE_KEY_POSTERS, []);
    const existingIndex = current.findIndex(p => String(p.id) === String(posterData.id));
    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...posterData };
    } else {
      updated = [posterData, ...current];
    }
    setLocalItem(LOCAL_STORAGE_KEY_POSTERS, updated);
    if (typeof window !== 'undefined') {
      window.__INITIAL_POSTERS__ = updated;
      if (window.__INITIAL_SETTINGS__ && Array.isArray(window.__INITIAL_SETTINGS__.custom_posters)) {
        window.__INITIAL_SETTINGS__.custom_posters = updated;
      }
    }
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('savePoster error:', e);
  }
  return { success: true };
}

export async function deletePoster(id) {
  try {
    // 1. Appel immédiat au backend Cloudflare D1
    const res = await fetch(`/api/posters/${encodeURIComponent(id)}${getTenantQueryParam()}`, { 
      method: 'DELETE',
      headers: getTenantHeaders(),
    });

    // 2. Éviction immédiate du cache LocalStorage
    const current = getLocalItem(LOCAL_STORAGE_KEY_POSTERS, []);
    const updated = current.filter((p) => String(p.id) !== String(id));
    setLocalItem(LOCAL_STORAGE_KEY_POSTERS, updated);

    // 3. Éviction immédiate de l'état mémoire SSR / Global
    if (typeof window !== 'undefined') {
      if (Array.isArray(window.__INITIAL_POSTERS__)) {
        window.__INITIAL_POSTERS__ = window.__INITIAL_POSTERS__.filter(p => String(p.id) !== String(id));
      }
      if (window.__INITIAL_SETTINGS__ && Array.isArray(window.__INITIAL_SETTINGS__.custom_posters)) {
        window.__INITIAL_SETTINGS__.custom_posters = window.__INITIAL_SETTINGS__.custom_posters.filter(p => String(p.id) !== String(id));
      }
    }

    if (res.ok) return await res.json();
  } catch (e) {
    console.error('deletePoster error:', e);
  }
  return { success: true };
}

// 3. PACKAGES API
export async function fetchPackages() {
  try {
    const res = await fetch(`/api/packages${getTenantQueryParam()}`, {
      headers: getTenantHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setLocalItem(LOCAL_STORAGE_KEY_PACKAGES, data.data);
        return data.data;
      }
    }
  } catch (err) {}

  return getLocalItem(LOCAL_STORAGE_KEY_PACKAGES, INITIAL_PACKAGES);
}

export async function savePackage(pkgData) {
  try {
    const res = await fetch(`/api/packages${getTenantQueryParam()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getTenantHeaders() },
      body: JSON.stringify(pkgData),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('savePackage error:', e);
  }
  return { success: true };
}

// 4. SETTINGS API
export async function fetchSettings() {
  const tenantSlug = getActiveTenantSlug();
  const adminKeyStorageName = tenantSlug ? `dmp_admin_code_${tenantSlug}` : 'dmp_admin_code';

  // 1. Toujours synchroniser avec Cloudflare D1 en direct
  try {
    const res = await fetch(`/api/settings${getTenantQueryParam()}`, {
      headers: { ...getTenantHeaders(), 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        const savedAdminCode = localStorage.getItem(adminKeyStorageName);
        const merged = { ...data.data };
        if (savedAdminCode && !merged.admin_code) {
          merged.admin_code = savedAdminCode;
        } else if (merged.admin_code) {
          localStorage.setItem(adminKeyStorageName, merged.admin_code);
        }
        setLocalItem(LOCAL_STORAGE_KEY_SETTINGS, merged);
        if (typeof window !== 'undefined') {
          window.__INITIAL_SETTINGS__ = merged;
          if (Array.isArray(merged.custom_posters) && merged.custom_posters.length > 0) {
            window.__INITIAL_POSTERS__ = merged.custom_posters;
          }
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('[D1 fetchSettings error]:', err);
  }

  // 2. Zero-Flash SSR Fallback
  if (
    typeof window !== 'undefined' &&
    window.__INITIAL_SETTINGS__ &&
    (!tenantSlug || window.__INITIAL_SETTINGS__.tenant_slug === tenantSlug)
  ) {
    const preloaded = window.__INITIAL_SETTINGS__;
    setLocalItem(LOCAL_STORAGE_KEY_SETTINGS, preloaded);
    return preloaded;
  }

  const fallback = getLocalItem(LOCAL_STORAGE_KEY_SETTINGS, INITIAL_SETTINGS);
  const savedAdminCode = localStorage.getItem(adminKeyStorageName);
  if (savedAdminCode && fallback) {
    fallback.admin_code = savedAdminCode;
  }
  return fallback;
}

export async function saveSettings(newSettings) {
  const tenantSlug = getActiveTenantSlug();
  const adminKeyStorageName = tenantSlug ? `dmp_admin_code_${tenantSlug}` : 'dmp_admin_code';

  try {
    if (newSettings && newSettings.admin_code) {
      localStorage.setItem(adminKeyStorageName, String(newSettings.admin_code).trim());
    }
    setLocalItem(LOCAL_STORAGE_KEY_SETTINGS, newSettings);
    const res = await fetch(`/api/settings${getTenantQueryParam()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getTenantHeaders() },
      body: JSON.stringify(newSettings),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('saveSettings error:', e);
  }
  return { success: true };
}

// 5. UPLOAD MEDIA
export async function uploadMedia(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur lors du téléversement');
  }

  return await res.json();
}

// 6. WHATSAPP LOGGING & FORMATTING
export async function logInquiry(inquiryData) {
  try {
    await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData),
    });
  } catch (e) {}
}

export function formatWhatsAppUrl(phoneNumber, message) {
  const cleanPhone = String(phoneNumber || '').replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

const FRIENDLY_CATEGORIES = {
  vsl_ecommerce: 'Catalogue Produits',
  tiktok_reels: 'Vidéos Courtes',
  spot_tv: 'Spots & Présentations',
  motion_design: 'Animations 3D',
  ugc: 'Témoignages Clients',
  soins_visage: 'Soins Visage',
  soins_corps: 'Soins Corps',
  gamme_eclat: 'Gamme Éclat',
  creme_hydratante: 'Crèmes Hydratantes',
  coiffure: 'Coiffure & Tresses',
  manucure: 'Onglerie & Manucure',
  restaurant: 'Menu & Plats',
  coaching: 'Accompagnement & Coaching',
};

export function buildVideoWhatsAppMessage({
  video,
  currency = 'XAF',
  siteUrl = '',
  customBrief = {},
  companyName = 'Notre Entreprise',
}) {
  const originUrl = siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const priceStr =
    currency === 'EUR'
      ? `${video.price_eur || Math.round((video.price_fcfa || 25000) / 655)} €`
      : `${(video.price_fcfa || 25000).toLocaleString('fr-FR')} FCFA`;

  // Lien direct vers l'article sur le site (ouvre directement la modale et déclenche l'aperçu riche dans WhatsApp)
  const itemSlug = video.slug || video.id;
  const directLink = originUrl ? `${originUrl}/?v=${encodeURIComponent(itemSlug)}` : '';

  let msg = `🛍️ *COMMANDE — ${companyName}*\n\n`;
  msg += `📦 *Article :* ${video.title}\n`;
  msg += `💰 *Prix :* ${priceStr}\n`;
  if (customBrief && customBrief.notes) {
    msg += `📝 *Note / Consigne :* ${customBrief.notes}\n`;
  }

  msg += `\nBonjour ! Je souhaite commander cet article. Merci de me confirmer la disponibilité et les modalités de livraison. 🙏`;
  if (directLink) {
    msg += `\n\n${directLink}`;
  }
  return msg;
}

export function buildPosterWhatsAppMessage({
  poster,
  currency = 'XAF',
  siteUrl = '',
  customBrief = {},
  companyName = 'Notre Entreprise',
}) {
  const originUrl = siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const priceStr =
    currency === 'EUR'
      ? `${poster.price_eur || Math.round((poster.price_fcfa || 15000) / 655)} €`
      : `${(poster.price_fcfa || 15000).toLocaleString('fr-FR')} FCFA`;

  // Lien direct vers l'article sur le site (ouvre directement la fiche produit et déclenche l'aperçu riche dans WhatsApp)
  const itemSlug = poster.slug || poster.id;
  const directLink = originUrl ? `${originUrl}/?p=${encodeURIComponent(itemSlug)}` : '';

  let msg = `🛍️ *COMMANDE — ${companyName}*\n\n`;
  msg += `📦 *Article :* ${poster.title}\n`;
  msg += `💰 *Prix :* ${priceStr}\n`;
  if (customBrief && customBrief.notes) {
    msg += `📝 *Note / Consigne :* ${customBrief.notes}\n`;
  }

  msg += `\nBonjour ! Je souhaite commander cet article. Merci de me confirmer la disponibilité et les modalités de livraison. 🙏`;
  if (directLink) {
    msg += `\n\n${directLink}`;
  }
  return msg;
}

export function buildDevisWhatsAppMessage({
  serviceType,
  format,
  duration,
  options = [],
  totalPriceFcfa,
  totalPriceEur,
  currency = 'XAF',
  clientBrand = '',
  details = {},
  companyName = 'Notre Entreprise',
}) {
  let msg = `🧮 *DEVIS SUR-MESURE SIMULÉ — ${companyName}*\n\n`;
  if (serviceType) msg += `🎯 *Prestation :* ${serviceType}\n`;
  if (format) msg += `📐 *Format :* ${format}\n`;
  if (duration) msg += `⏱ *Durée :* ${duration}\n`;
  if (options && options.length > 0) {
    msg += `✨ *Options :* ${options.join(', ')}\n`;
  }
  if (clientBrand) msg += `🏢 *Entreprise / Marque :* ${clientBrand}\n`;

  const priceStr =
    currency === 'EUR'
      ? `${totalPriceEur || 0} €`
      : `${(totalPriceFcfa || 0).toLocaleString('fr-FR')} FCFA`;

  if (totalPriceFcfa || totalPriceEur) {
    msg += `\n💰 *Total estimé :* ${priceStr}\n`;
  } else if (details && details.totalPriceFormatted) {
    msg += `\n💰 *Total estimé :* ${details.totalPriceFormatted}\n`;
  }

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  if (originUrl) msg += `\n🔗 *Référence :* ${originUrl}\n`;
  msg += `\nPouvons-nous valider ce devis ensemble ?`;
  return msg;
}

export function buildCartWhatsAppMessage({
  cartItems = [],
  currency = 'XAF',
  siteUrl = '',
  clientInfo = {},
  companyName = 'Notre Entreprise',
}) {
  const originUrl = siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const totalItemsCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  let totalFcfa = 0;
  let totalEur = 0;

  let msg = `🛒 *COMMANDE GROUPÉE (${totalItemsCount} article${totalItemsCount > 1 ? 's' : ''}) — ${companyName}*\n\n`;

  cartItems.forEach((item, index) => {
    const qty = item.quantity || 1;
    const itemPriceFcfa = (Number(item.price_fcfa) || 0) * qty;
    const itemPriceEur = (Number(item.price_eur) || Math.round(itemPriceFcfa / 655)) * qty;
    totalFcfa += itemPriceFcfa;
    totalEur += itemPriceEur;

    const priceFormatted =
      currency === 'EUR' ? `${itemPriceEur} €` : `${itemPriceFcfa.toLocaleString('fr-FR')} FCFA`;
    const itemSlug = item.slug || item.id;
    const directLink = originUrl
      ? `${originUrl}/?${item.type === 'poster' ? 'p' : 'v'}=${encodeURIComponent(itemSlug)}`
      : '';

    msg += `${index + 1}️⃣ *${item.title}* ${qty > 1 ? `(x${qty})` : ''}\n`;
    msg += `   💰 Tarif : ${priceFormatted}\n`;
    if (directLink) {
      msg += `   🔗 Fiche : ${directLink}\n`;
    }
    msg += `\n`;
  });

  const totalStr =
    currency === 'EUR' ? `${totalEur} €` : `${totalFcfa.toLocaleString('fr-FR')} FCFA`;
  msg += `─────────────────────────\n`;
  msg += `💵 *TOTAL DU PANIER :* ${totalStr}\n`;

  if (clientInfo && clientInfo.name) {
    msg += `👤 *Client :* ${clientInfo.name}\n`;
  }
  if (clientInfo && clientInfo.city) {
    msg += `📍 *Ville / Livraison :* ${clientInfo.city}\n`;
  }
  if (clientInfo && clientInfo.notes) {
    msg += `📝 *Instructions :* ${clientInfo.notes}\n`;
  }

  msg += `\n👋 Bonjour ${companyName} ! Je souhaite commander l'ensemble de ce panier. Merci de me confirmer les modalités. 🙏`;
  return msg;
}

// =======================================================
// 6. ANALYTICS & STATISTIQUES RÉELLES (VUES & VISITES)
// =======================================================

// Enregistrement d'une vue / visite réelle (aucune donnée fictive)
export async function trackPageView() {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Visiteur Unique (persistant par navigateur)
    let visitorId = localStorage.getItem('dmp_visitor_id');
    if (!visitorId) {
      visitorId = 'vis_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('dmp_visitor_id', visitorId);
    }

    // 2. Session / Visite Unique (par session de navigation)
    let isNewSession = false;
    let sessionId = sessionStorage.getItem('dmp_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      sessionStorage.setItem('dmp_session_id', sessionId);
      isNewSession = true;
    }

    const payload = {
      visitor_id: visitorId,
      session_id: sessionId,
      page_path: window.location.pathname + window.location.search,
      referrer: document.referrer || '',
      is_new_session: isNewSession,
    };

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (err) {
    console.warn('Analytics track warning:', err);
  }
}

// Récupération des statistiques réelles du site (vues cumulées, visites, etc.)
export async function fetchTrafficStats() {
  try {
    const res = await fetch('/api/analytics/stats');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('fetchTrafficStats warning:', err);
  }

  return {
    total_views: 0,
    total_visits: 0,
    today_views: 0,
    today_visits: 0,
    countries: [],
    recent_activity: [],
  };
}
