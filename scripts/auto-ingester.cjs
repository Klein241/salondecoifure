// ==============================================================================
// THE GREATSOFT — MODULE D'AUTO-INGESTION DE CONTENU & SCRAPING HEADLESS
// ==============================================================================
// Permet d'extraire automatiquement l'identité d'un client et ses produits
// depuis un site web, une page publique ou un texte brut sans saisie manuelle.
// ==============================================================================

const https = require('https');
const http = require('http');

/**
 * Télécharge le contenu HTML brut d'une URL publique
 */
function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const isSocialMeta = targetUrl.includes('facebook.com') || targetUrl.includes('fb.watch') || targetUrl.includes('instagram.com');
      const userAgent = isSocialMeta
        ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      const options = {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 10000,
      };

      const req = client.get(targetUrl, options, (res) => {
        // Suivre redirections (301, 302)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchUrl(res.headers.location).then(resolve).catch(reject);
        }

        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      });

      req.on('error', (err) => resolve('')); // Résoudre vide en cas d'erreur réseau
      req.on('timeout', () => { req.destroy(); resolve(''); });
    } catch (e) {
      resolve('');
    }
  });
}

/**
 * Nettoie les balises HTML et décode entités basiques
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrait les métadonnées OpenGraph et HTML standard
 */
function extractMeta(html, targetUrl) {
  const result = {
    title: '',
    description: '',
    image: '',
    siteName: '',
    whatsapp: '',
    items: [],
  };

  if (!html) return result;

  function decodeEntities(str) {
    if (!str) return '';
    return str
      .replace(/&#xe9;/gi, 'é')
      .replace(/&#xe8;/gi, 'è')
      .replace(/&#xea;/gi, 'ê')
      .replace(/&#xe0;/gi, 'à')
      .replace(/&#xf4;/gi, 'ô')
      .replace(/&#xee;/gi, 'î')
      .replace(/&#xa0;/gi, ' ')
      .replace(/&#xb7;/gi, '·')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  // 1. Titre
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
                       html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:title["']/i);
  const titleTagMatch = html.match(/<title>(.*?)<\/title>/i);
  result.title = decodeEntities((ogTitleMatch ? ogTitleMatch[1] : (titleTagMatch ? titleTagMatch[1] : '')).trim());

  // Nettoyage du titre (ex: "Nom Client | Accueil")
  if (result.title.includes('|')) result.title = result.title.split('|')[0].trim();
  if (result.title.includes('—')) result.title = result.title.split('—')[0].trim();
  if (result.title.includes('-')) result.title = result.title.split('-')[0].trim();

  // 2. Description / Bio
  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
                      html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  result.description = decodeEntities((ogDescMatch ? ogDescMatch[1] : '').trim());

  // 3. Image principale / Logo
  const ogImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i) ||
                     html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:image["']/i);
  result.image = ogImgMatch ? ogImgMatch[1].trim() : '';

  const waMatch = html.match(/wa\.me\/(?:(?:\+?([0-9]{8,15})))/i) ||
                  html.match(/whatsapp\.com\/send\?phone=([0-9]+)/i) ||
                  html.match(/(?:\+?241|\+?237|\+?225)[\s\-]?[0-9]{8,9}/i);
  if (waMatch) {
    result.whatsapp = (waMatch[1] || waMatch[0]).replace(/[^0-9]/g, '');
  }

  // 5. Extraction des photos et prix détectés
  // Recherche d'images produit avec alt ou légendes
  const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi;
  let imgMatch;
  const foundImages = [];

  while ((imgMatch = imgRegex.exec(html)) !== null && foundImages.length < 20) {
    const src = imgMatch[1];
    const alt = imgMatch[2];
    if (src && !src.includes('icon') && !src.includes('logo') && !src.includes('svg') && !src.includes('analytics')) {
      let fullUrl = src;
      if (src.startsWith('//')) fullUrl = 'https:' + src;
      else if (src.startsWith('/') && targetUrl) {
        try { fullUrl = new URL(src, targetUrl).href; } catch(e){}
      }
      if (fullUrl.startsWith('http')) {
        foundImages.push({ url: fullUrl, title: alt || 'Produit Phare' });
      }
    }
  }

  // 6. Extraction des prix détectés dans le texte brut
  const rawText = stripHtml(html);
  const priceRegex = /([A-Za-zÀ-ÿ0-9\s]{3,30}?)\s*[:—–-]?\s*([0-9]{1,3}(?:[\s.,][0-9]{3})*|[0-9]{3,6})\s*(FCFA|XAF|EUR|€|frs|F)\b/gi;
  let priceMatch;
  const detectedProducts = [];

  while ((priceMatch = priceRegex.exec(rawText)) !== null && detectedProducts.length < 15) {
    const itemTitle = priceMatch[1].replace(/[\n\r]+/g, ' ').trim();
    const rawNum = priceMatch[2].replace(/[\s.,]/g, '');
    const priceNum = parseInt(rawNum, 10);
    const currency = priceMatch[3];

    if (itemTitle.length >= 3 && priceNum >= 500 && priceNum <= 500000) {
      detectedProducts.push({
        title: itemTitle.slice(0, 40),
        price_fcfa: priceNum,
        currency,
        description: `Article sélectionné par notre équipe. Disponible immédiatement sur commande.`,
      });
    }
  }

  // Assembler les items
  if (detectedProducts.length > 0) {
    result.items = detectedProducts.map((p, idx) => ({
      ...p,
      image_url: foundImages[idx]?.url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    }));
  } else if (foundImages.length > 0) {
    // Si pas de prix explicites, utiliser les photos trouvées avec prix par défaut
    result.items = foundImages.slice(0, 8).map((img, idx) => ({
      title: img.title.length > 3 ? img.title.slice(0, 35) : `Prestation & Soin VIP #${idx + 1}`,
      price_fcfa: 10000 + (idx * 2500),
      currency: 'FCFA',
      description: 'Prestation et produit de référence disponible en salon ou sur commande WhatsApp.',
      image_url: img.url,
    }));
  }

  return result;
}

/**
 * Fonction Principale d'Ingestion
 */
async function autoIngestFromUrl(urlOrText, options = {}) {
  const isUrl = typeof urlOrText === 'string' && (urlOrText.startsWith('http://') || urlOrText.startsWith('https://'));

  if (isUrl) {
    console.log(`\n🔍 [AUTO-INGEST] Scraping intelligent de l'URL : ${urlOrText}...`);
    const html = await fetchUrl(urlOrText);
    if (!html) {
      console.log(`   ⚠️ Impossible de récupérer la page (site protégé ou indisponible).`);
      return null;
    }
    const extracted = extractMeta(html, urlOrText);
    console.log(`   ✅ Extraction réussie : "${extracted.title || 'Client'}" | WhatsApp: ${extracted.whatsapp || 'Détecté plus tard'} | ${extracted.items.length} produits extraits.`);
    return extracted;
  }

  return null;
}

module.exports = {
  autoIngestFromUrl,
  extractMeta,
};
