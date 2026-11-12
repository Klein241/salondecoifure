// ==============================================================================
// GESTION DU THÈME & CHARTE GRAPHIQUE DYNAMIQUE
// ==============================================================================

export const DEFAULT_THEME = {
  color_primary: '#f59e0b',
  color_secondary: '#d97706',
  color_accent: '#fbbf24',
  color_bg_main: '#0a0d14',
  color_bg_secondary: '#0f141f',
  color_bg_card: '#121826',
  color_text_title: '#ffffff',
  color_text_main: '#f8fafc',
  color_text_muted: '#94a3b8',
  color_border: '#273549',
  color_btn_bg: '#f59e0b',
  color_btn_text: '#0b0f19',
  color_btn_hover: '#d97706',
  color_links: '#f59e0b',
  color_links_hover: '#fbbf24',
};

export const COSMETIC_LIGHT_THEME = {
  color_primary: '#A26F1C',
  color_secondary: '#C18A2E',
  color_accent: '#E6B957',
  color_bg_main: '#FAEFDD',
  color_bg_secondary: '#FFF8F0',
  color_bg_card: '#FFFFFF',
  color_text_title: '#302318',
  color_text_main: '#24211D',
  color_text_muted: '#6b5e51',
  color_border: '#DCC18A',
  color_btn_bg: '#A26F1C',
  color_btn_text: '#FFFFFF',
  color_btn_hover: '#C18A2E',
  color_links: '#A26F1C',
  color_links_hover: '#C18A2E',
};

/**
 * Détecte si une couleur hexadécimale est claire ou sombre (luminance relative)
 */
export function isColorLight(hex) {
  if (!hex || typeof hex !== 'string') return false;
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6 && clean.length !== 3) return false;
  const r = parseInt(clean.length === 3 ? clean[0] + clean[0] : clean.substring(0, 2), 16);
  const g = parseInt(clean.length === 3 ? clean[1] + clean[1] : clean.substring(2, 4), 16);
  const b = parseInt(clean.length === 3 ? clean[2] + clean[2] : clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65;
}

/**
 * Analyse le texte brut d'une palette (ex: générée par IA ou copié/collé)
 * et extrait chaque code hexadécimal vers sa clé correspondante avec détection de contraste.
 */
export function parseColorPalette(rawText) {
  const result = {};
  if (!rawText || typeof rawText !== 'string') return result;

  const lines = rawText.split('\n');
  for (const line of lines) {
    const hexMatch = line.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
    if (!hexMatch) continue;
    const hex = hexMatch[0].toUpperCase();
    const lowerLine = line.toLowerCase();

    // 1. TEXTE SPÉCIFIQUE (Vérifié AVANT 'secondaire' ou 'fond' pour éviter les faux positifs)
    if (
      lowerLine.includes('texte secondaire') ||
      lowerLine.includes('texte discret') ||
      lowerLine.includes('texte atténué') ||
      lowerLine.includes('texte clair') ||
      lowerLine.includes('sous-titre')
    ) {
      result.color_text_muted = hex;
    } else if (
      lowerLine.includes('texte sombre') ||
      lowerLine.includes('texte foncé') ||
      lowerLine.includes('texte noir')
    ) {
      result.color_text_title = hex;
      result.color_text_main = hex;
    } else if (
      lowerLine.includes('texte des boutons') ||
      lowerLine.includes('texte du bouton') ||
      lowerLine.includes('texte bouton')
    ) {
      result.color_btn_text = hex;
    } else if (
      lowerLine.includes('titre') ||
      lowerLine.includes('titres') ||
      lowerLine.includes('heading')
    ) {
      result.color_text_title = hex;
    } else if (
      lowerLine.includes('texte') ||
      lowerLine.includes('police') ||
      lowerLine.includes('text')
    ) {
      result.color_text_main = hex;
    }
    // 2. FONDS & ARRIÈRE-PLANS
    else if (
      lowerLine.includes('fond secondaire') ||
      lowerLine.includes('fond carte') ||
      lowerLine.includes('fond des cartes') ||
      lowerLine.includes('fond de carte') ||
      lowerLine.includes('couleur blanche') ||
      lowerLine.includes('blanche') ||
      (lowerLine.includes('blanc') && !lowerLine.includes('texte'))
    ) {
      result.color_bg_secondary = hex;
      result.color_bg_card = hex;
    } else if (
      lowerLine.includes('fond') ||
      lowerLine.includes('arriere-plan') ||
      lowerLine.includes('arrière-plan')
    ) {
      result.color_bg_main = hex;
    }
    // 3. BOUTONS & SURVOLS
    else if (
      lowerLine.includes('survol des boutons') ||
      lowerLine.includes('bouton survol') ||
      lowerLine.includes('bouton hover')
    ) {
      result.color_btn_hover = hex;
    } else if (
      lowerLine.includes('survol') && lowerLine.includes('lien')
    ) {
      result.color_links_hover = hex;
    } else if (
      lowerLine.includes('bouton') ||
      lowerLine.includes('boutons') ||
      lowerLine.includes('cta')
    ) {
      result.color_btn_bg = hex;
    }
    // 4. BORDURES
    else if (
      lowerLine.includes('bordure') ||
      lowerLine.includes('bordures') ||
      lowerLine.includes('border')
    ) {
      result.color_border = hex;
    }
    // 5. LIENS
    else if (
      lowerLine.includes('lien') ||
      lowerLine.includes('liens')
    ) {
      result.color_links = hex;
    }
    // 6. COULEUR PRINCIPALE
    else if (
      lowerLine.includes('principale') ||
      lowerLine.includes('primaire') ||
      lowerLine.includes('primary')
    ) {
      result.color_primary = hex;
    }
    // 7. COULEUR SECONDAIRE (uniquement si ce n'est ni texte ni fond)
    else if (
      lowerLine.includes('secondaire') ||
      lowerLine.includes('secondary')
    ) {
      result.color_secondary = hex;
    }
    // 8. ACCENTS / TERTIAIRE
    else if (
      lowerLine.includes('accent') ||
      lowerLine.includes('tertiaire') ||
      lowerLine.includes('claire')
    ) {
      result.color_accent = hex;
    }
  }

  // 9. DÉDUCTIONS INTELLIGENTES ET ADAPTATION AU CONTRASTE
  if (result.color_primary && !result.color_btn_bg) {
    result.color_btn_bg = result.color_primary;
  }
  if (result.color_secondary && !result.color_btn_hover) {
    result.color_btn_hover = result.color_secondary;
  }
  if (result.color_accent && !result.color_links) {
    result.color_links = result.color_accent;
  } else if (result.color_primary && !result.color_links) {
    result.color_links = result.color_primary;
  }

  // Vérifier si le fond est clair pour adapter immédiatement titres et cartes
  const isBgLight = isColorLight(result.color_bg_main);
  if (isBgLight) {
    if (!result.color_bg_card) result.color_bg_card = '#FFFFFF';
    if (!result.color_bg_secondary) result.color_bg_secondary = '#FFFFFF';

    if (!result.color_text_title || isColorLight(result.color_text_title)) {
      result.color_text_title = '#152B3A';
    }
    if (!result.color_text_main || isColorLight(result.color_text_main)) {
      result.color_text_main = '#24211D';
    }
    if (!result.color_text_muted || isColorLight(result.color_text_muted)) {
      result.color_text_muted = '#587487';
    }
    if (!result.color_border) {
      result.color_border = '#D6E2EA';
    }

    if (!result.color_btn_text) {
      result.color_btn_text = isColorLight(result.color_btn_bg || result.color_primary) ? '#111827' : '#FFFFFF';
    }
  } else {
    if (!result.color_text_title) result.color_text_title = '#FFFFFF';
    if (!result.color_text_main) result.color_text_main = '#F8FAFC';
    if (!result.color_text_muted) result.color_text_muted = '#94A3B8';
    if (!result.color_border) result.color_border = 'rgba(255,255,255,0.1)';
    if (!result.color_btn_text) {
      result.color_btn_text = isColorLight(result.color_btn_bg || result.color_primary) ? '#111827' : '#FFFFFF';
    }
  }

  return result;
}

/**
 * Applique dynamiquement les variables CSS au DOM (:root)
 */
export function applyThemeToDom(theme = {}) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (!root) return;

  const bgMain = theme.color_bg_main || DEFAULT_THEME.color_bg_main;
  const bgSec = theme.color_bg_secondary || DEFAULT_THEME.color_bg_secondary;
  const bgCard = theme.color_bg_card || bgSec;
  const primary = theme.color_primary || DEFAULT_THEME.color_primary;
  const secondary = theme.color_secondary || DEFAULT_THEME.color_secondary;
  const accent = theme.color_accent || DEFAULT_THEME.color_accent;
  const textTitle = theme.color_text_title || DEFAULT_THEME.color_text_title;
  const textMain = theme.color_text_main || DEFAULT_THEME.color_text_main;
  const textMuted = theme.color_text_muted || DEFAULT_THEME.color_text_muted;
  const border = theme.color_border || DEFAULT_THEME.color_border;
  const btnBg = theme.color_btn_bg || primary;
  const btnText = theme.color_btn_text || '#ffffff';
  const btnHover = theme.color_btn_hover || secondary;
  const links = theme.color_links || primary;
  const linksHover = theme.color_links_hover || secondary;

  root.style.setProperty('--bg-main', bgMain);
  root.style.setProperty('--bg-secondary', bgSec);
  root.style.setProperty('--bg-card', bgCard);
  root.style.setProperty('--accent-gold', primary);
  root.style.setProperty('--accent-gold-dark', secondary);
  root.style.setProperty('--accent-gold-light', accent);
  root.style.setProperty('--text-title', textTitle);
  root.style.setProperty('--text-main', textMain);
  root.style.setProperty('--text-muted', textMuted);
  root.style.setProperty('--border-subtle', border);
  root.style.setProperty('--btn-primary-bg', btnBg);
  root.style.setProperty('--btn-primary-text', btnText);
  root.style.setProperty('--btn-primary-hover', btnHover);
  root.style.setProperty('--color-links', links);
  root.style.setProperty('--color-links-hover', linksHover);
}

/**
 * Nettoie et valide une URL d'image (empêche les erreurs [object Object] et React #31)
 */
export function getCleanImageUrl(val) {
  if (!val) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '[object Object]' || trimmed === '') return '';
    return trimmed;
  }
  if (typeof val === 'object' && val !== null) {
    if (typeof val.url === 'string') {
      const trimmed = val.url.trim();
      if (trimmed === '[object Object]' || trimmed === '') return '';
      return trimmed;
    }
  }
  return '';
}

