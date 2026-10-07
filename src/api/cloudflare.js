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

function getLocalItem(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return fallback;
}

function setLocalItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage write error:', e);
  }
}

// 1. VIDEOS API
export async function fetchVideos(category = 'all') {
  try {
    const res = await fetch(`/api/videos${category !== 'all' ? `?category=${category}` : ''}`);
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
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
export async function fetchPosters() {
  try {
    const res = await fetch('/api/posters');
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setLocalItem(LOCAL_STORAGE_KEY_POSTERS, data.data);
        return data.data;
      }
    }
  } catch (err) {}

  return getLocalItem(LOCAL_STORAGE_KEY_POSTERS, INITIAL_POSTERS);
}

export async function savePoster(posterData) {
  try {
    const res = await fetch('/api/posters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(posterData),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('savePoster error:', e);
  }
  return { success: true };
}

export async function deletePoster(id) {
  try {
    const res = await fetch(`/api/posters/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('deletePoster error:', e);
  }
  return { success: true };
}

// 3. PACKAGES API
export async function fetchPackages() {
  try {
    const res = await fetch('/api/packages');
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setLocalItem(LOCAL_STORAGE_KEY_PACKAGES, data.data);
        return data.data;
      }
    }
  } catch (err) {}

  return getLocalItem(LOCAL_STORAGE_KEY_PACKAGES, INITIAL_PACKAGES);
}

export async function savePackage(pkgData) {
  try {
    const res = await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        setLocalItem(LOCAL_STORAGE_KEY_SETTINGS, data.data);
        return data.data;
      }
    }
  } catch (err) {}

  return getLocalItem(LOCAL_STORAGE_KEY_SETTINGS, INITIAL_SETTINGS);
}

export async function saveSettings(newSettings) {
  try {
    setLocalItem(LOCAL_STORAGE_KEY_SETTINGS, newSettings);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

export function buildVideoWhatsAppMessage({ video, currency = 'XAF', siteUrl = '', customBrief = {} }) {
  const priceStr =
    currency === 'EUR'
      ? `${video.price_eur || 39} €`
      : `${(video.price_fcfa || 25000).toLocaleString('fr-FR')} FCFA`;

  let msg = `👋 *NOUVELLE COMMANDE VIDÉO — DIGITAL MARK PRO*\n\n`;
  msg += `🎬 *Projet :* ${video.title}\n`;
  msg += `📌 *Format :* ${video.format || '16:9'} (${video.resolution || '4K'})\n`;
  msg += `⏱ *Durée :* ${video.duration || '30s'}\n`;
  msg += `💰 *Tarif estimé :* ${priceStr}\n`;

  if (customBrief.brandName) msg += `🏢 *Marque / Entreprise :* ${customBrief.brandName}\n`;
  if (customBrief.objective) msg += `🎯 *Objectif :* ${customBrief.objective}\n`;
  if (customBrief.voiceover) msg += `🎙 *Voix-off souhaitée :* ${customBrief.voiceover}\n`;
  if (customBrief.notes) msg += `📝 *Consignes :* ${customBrief.notes}\n`;

  msg += `\n🔗 *Référence :* ${siteUrl || 'https://digital-mark-pro.mynexus.workers.dev'}\n`;
  msg += `\nJe souhaite échanger avec un créateur pour démarrer la production.`;
  return msg;
}

export function buildPosterWhatsAppMessage({ poster, currency = 'XAF', siteUrl = '', customBrief = {} }) {
  const priceStr =
    currency === 'EUR'
      ? `${poster.price_eur || 25} €`
      : `${(poster.price_fcfa || 15000).toLocaleString('fr-FR')} FCFA`;

  let msg = `🎨 *NOUVELLE COMMANDE AFFICHE — DIGITAL MARK PRO*\n\n`;
  msg += `🖼 *Modèle :* ${poster.title}\n`;
  msg += `📐 *Format :* ${poster.format || 'A3/A2'} (${poster.dimensions || '1080x1080'})\n`;
  msg += `💰 *Tarif estimé :* ${priceStr}\n`;

  if (customBrief.brandName) msg += `🏢 *Marque :* ${customBrief.brandName}\n`;
  if (customBrief.headline) msg += `✍️ *Texte d'accroche :* ${customBrief.headline}\n`;
  if (customBrief.notes) msg += `📝 *Consignes :* ${customBrief.notes}\n`;

  msg += `\nMerci de m'indiquer la disponibilité et les délais !`;
  return msg;
}

export function buildDevisWhatsAppMessage({ details, currency = 'XAF' }) {
  let msg = `🧮 *DEVIS SUR-MESURE SIMULÉ — DIGITAL MARK PRO*\n\n`;
  msg += `📋 *Détails du projet :*\n`;
  if (details.type) msg += `• Type : ${details.type}\n`;
  if (details.duration) msg += `• Durée : ${details.duration}\n`;
  if (details.voiceover) msg += `• Voix-off studio : Oui\n`;
  if (details.scripting) msg += `• Script copywriting : Inclus\n`;
  if (details.rushDelivery) msg += `• Livraison Express 24h : Oui\n`;
  msg += `\n💰 *Total estimé :* ${details.totalPriceFormatted}\n`;
  msg += `\nPouvons-nous valider ce devis ensemble ?`;
  return msg;
}
