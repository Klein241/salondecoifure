// ========================================================
// DIGITAL MARK PRO - Cloudflare Worker Backend (Edge API)
// Integrates 100% with Cloudflare D1, R2 and Workers Static Assets
// ========================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

// --- FONCTIONNALITÉ A : DYNAMIC EDGE MULTI-TENANCY ---
async function resolveTenant(request, env, url) {
  if (!env.DB) return null;
  const host = (request.headers.get('host') || '').toLowerCase();
  let queryTenant = url.searchParams.get('tenant') || url.searchParams.get('t') || request.headers.get('x-tenant-slug');

  // Fallback 1: Si absent des query params, vérifier le header Referer (ex: appel API depuis la SPA)
  if (!queryTenant) {
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        const refUrl = new URL(referer);
        queryTenant = refUrl.searchParams.get('tenant') || refUrl.searchParams.get('t');
      } catch (e) {}
    }
  }

  let slugToFind = null;
  if (queryTenant) {
    slugToFind = queryTenant.split('/')[0].split('?')[0].split('&')[0].toLowerCase().trim();
  } else if (host) {
    try {
      // 1. Recherche par nom de domaine personnalisé exact
      const customMatch = await env.DB.prepare(
        'SELECT * FROM tenants WHERE custom_domain = ? LIMIT 1'
      ).bind(host).first();
      if (customMatch) return customMatch;

      // 2. Recherche par sous-domaine
      const parts = host.split('.');
      if (parts.length >= 3) {
        const subdomain = parts[0];
        if (subdomain !== 'digital-mark-pro' && subdomain !== 'the-greatsoft' && subdomain !== 'localhost') {
          slugToFind = subdomain;
        }
      }
    } catch (e) {
      return null;
    }
  }

  if (slugToFind) {
    try {
      const tenant = await env.DB.prepare(
        'SELECT * FROM tenants WHERE slug = ? LIMIT 1'
      ).bind(slugToFind).first();
      return tenant;
    } catch (e) {
      return null;
    }
  }
  return null;
}


// --- FONCTIONNALITÉ C : GESTION DE LICENCE & KILL-SWITCH SAAS ---
async function checkLicenseStatus(tenant, env) {
  let status = 'active';
  let expiry = null;
  let killSwitch = false;
  let reason = '';
  let clientName = env.COMPANY_NAME || 'Cette enseigne';

  if (tenant) {
    status = tenant.license_status || 'active';
    expiry = tenant.license_expiry;
    clientName = tenant.name || clientName;
    reason = tenant.license_notes || 'Régularisation administrative requise';
  } else if (env.DB) {
    try {
      const rows = await env.DB.prepare(
        "SELECT key, value FROM settings WHERE key IN ('license_status', 'license_expiry', 'kill_switch_active', 'suspension_reason', 'company_name')"
      ).all();
      const map = {};
      (rows.results || []).forEach(r => { map[r.key] = r.value; });
      if (map.license_status) status = map.license_status;
      if (map.license_expiry) expiry = map.license_expiry;
      if (map.kill_switch_active === '1') killSwitch = true;
      if (map.suspension_reason) reason = map.suspension_reason;
      if (map.company_name) clientName = map.company_name;
    } catch (e) {}
  }

  // Suspension manuelle forcée ou statut suspended
  if (killSwitch || status === 'suspended') {
    return { active: false, reason: reason || 'Accès administrativement suspendu par THE GREATSOFT', clientName };
  }

  // Vérification de la date d'expiration de la licence
  if (expiry) {
    const expDate = new Date(expiry);
    if (!isNaN(expDate.getTime()) && expDate < new Date()) {
      return { active: false, reason: 'Licence SaaS arrivée à expiration', clientName };
    }
  }

  return { active: true, status, expiry, clientName };
}

function renderKillSwitchPage(clientName, reason) {
  return `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accès Suspendu — THE GREATSOFT Cloud Edge</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:'Plus Jakarta Sans',sans-serif; }
    body { background:#030712; color:#f3f4f6; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:1.5rem; background-image:radial-gradient(ellipse at top, rgba(239,68,68,0.15), transparent 70%); }
    .card { background:rgba(15,23,42,0.85); border:1px solid rgba(239,68,68,0.35); border-radius:1.5rem; max-width:34rem; width:100%; padding:2.5rem 2rem; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.7), 0 0 50px rgba(239,68,68,0.2); backdrop-filter:blur(20px); }
    .badge { display:inline-flex; align-items:center; gap:0.5rem; padding:0.4rem 1.1rem; border-radius:9999px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1.75rem; }
    .dot { width:8px; height:8px; border-radius:50%; background:#ef4444; box-shadow:0 0 10px #ef4444; animation:pulse 2s infinite; }
    h1 { font-size:1.6rem; font-weight:800; color:#fff; line-height:1.25; margin-bottom:0.75rem; letter-spacing:-0.02em; }
    p { font-size:0.9rem; color:#94a3b8; line-height:1.6; margin-bottom:1.5rem; }
    .notice { background:rgba(30,41,59,0.7); border:1px solid rgba(71,85,105,0.7); border-radius:1rem; padding:1.2rem; font-size:0.85rem; color:#e2e8f0; margin-bottom:1.75rem; text-align:left; line-height:1.5; }
    .notice-title { font-size:0.75rem; text-transform:uppercase; font-weight:700; color:#ef4444; margin-bottom:0.35rem; font-family:'JetBrains Mono',monospace; }
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:0.5rem; width:100%; padding:0.95rem; border-radius:0.85rem; background:linear-gradient(135deg,#2563eb,#6366f1); color:#fff; font-weight:700; font-size:0.9rem; text-decoration:none; transition:transform 0.2s, box-shadow 0.2s; box-shadow:0 10px 25px -5px rgba(99,102,241,0.4); }
    .btn:hover { transform:translateY(-1px); box-shadow:0 15px 30px -5px rgba(99,102,241,0.6); }
    .footer { margin-top:1.75rem; font-size:0.75rem; color:#64748b; font-family:'JetBrains Mono',monospace; }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> Suspension Administrative</div>
    <h1>Plateforme en cours de régularisation</h1>
    <p>L'accès aux services en ligne pour <strong>${clientName}</strong> a été momentanément restreint par le centre de commande THE GREATSOFT.</p>
    <div class="notice">
      <div class="notice-title">Motif de la suspension</div>
      <strong>${reason}</strong><br><br>
      Si vous êtes le propriétaire ou le gestionnaire de cet établissement, veuillez contacter votre chargé de compte THE GREATSOFT pour rétablir immédiatement vos services.
    </div>
    <a href="https://wa.me/24177624383?text=Bonjour%20THE%20GREATSOFT,%20je%20souhaite%20r%C3%A9gulariser%20la%20licence%20administrative%20de%20la%20plateforme%20${encodeURIComponent(clientName)}" class="btn" target="_blank">
      💬 Contacter le Support THE GREATSOFT sur WhatsApp
    </a>
    <div class="footer">THE GREATSOFT CLOUD EDGE • LICENSING GUARD v2.0</div>
  </div>
</body>
</html>`;
}

let tablesChecked = false;
async function ensureTables(db) {
  if (!db || tablesChecked) return;
  try {
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS product_reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        author TEXT NOT NULL,
        city TEXT,
        rating INTEGER DEFAULT 5,
        comment TEXT NOT NULL,
        is_verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS push_subscriptions (
        id TEXT PRIMARY KEY,
        tenant_slug TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        platform TEXT,
        client_name TEXT,
        client_phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS customer_orders (
        id TEXT PRIMARY KEY,
        receipt_number TEXT NOT NULL,
        tenant_slug TEXT NOT NULL,
        client_phone TEXT,
        client_name TEXT,
        order_data_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`)
    ]);
    tablesChecked = true;
  } catch (err) {
    console.warn('[ensureTables warn]:', err);
  }
}

async function sendBackgroundFcmNotification(env, tenantSlug, pushItem) {
  if (!env.DB || !pushItem) return { sent: 0, reason: 'no_db_or_item' };
  try {
    const slug = tenantSlug || 'ktfa';
    const rows = await env.DB.prepare(
      'SELECT token FROM push_subscriptions WHERE tenant_slug = ? OR tenant_slug = ? ORDER BY last_active_at DESC LIMIT 500'
    ).bind(slug, 'ktfa').all();

    const tokens = (rows.results || [])
      .map(r => r.token)
      .filter(t => t && typeof t === 'string' && !t.startsWith('web-push-fcm-') && t.length > 20);

    if (tokens.length === 0) {
      return { sent: 0, reason: 'no_fcm_tokens' };
    }

    const fcmServerKey = env.FCM_SERVER_KEY || 'AIzaSyDDOJSgjx30yjdLDm5HOXqXoQ5kYdWknz4';
    const targetUrl = pushItem.productId
      ? `https://digital-mark-pro.mynexus.workers.dev/?t=${slug}&prod=${pushItem.productId}`
      : `https://digital-mark-pro.mynexus.workers.dev/?t=${slug}`;

    const chunkSize = 500;
    let totalSent = 0;
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk = tokens.slice(i, i + chunkSize);
      const payload = {
        registration_ids: chunk,
        priority: 'high',
        notification: {
          title: pushItem.title || '🔥 Nouvel Arrivage KTFA FLEX',
          body: pushItem.message || 'Disponible dès maintenant en paiement échelonné 4x sans caution !',
          icon: 'https://digital-mark-pro.mynexus.workers.dev/icon-192.png',
          image: pushItem.image || undefined,
          click_action: targetUrl
        },
        data: {
          title: pushItem.title || '🔥 Nouvel Arrivage KTFA FLEX',
          body: pushItem.message || 'Disponible dès maintenant en paiement échelonné 4x sans caution !',
          image: pushItem.image || '',
          url: targetUrl,
          productId: pushItem.productId || ''
        }
      };

      const fcmRes = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=' + fcmServerKey
        },
        body: JSON.stringify(payload)
      });
      if (fcmRes.ok) {
        totalSent += chunk.length;
      }
    }
    return { sent: totalSent, tokensCount: tokens.length };
  } catch (err) {
    console.error('[sendBackgroundFcmNotification err]:', err);
    return { sent: 0, error: err.message };
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Auto-vérification des tables D1 en arrière-plan
    if (env.DB) {
      ctx.waitUntil(ensureTables(env.DB));
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Protection & Redirection intelligente si l'utilisateur a tapé ?t=slug/login/admin
    const rawT = url.searchParams.get('t') || url.searchParams.get('tenant');
    if (rawT && rawT.includes('/login/admin')) {
      const cleanSlug = rawT.split('/')[0].split('?')[0].split('&')[0].trim();
      return Response.redirect(`${url.origin}/login/admin?t=${cleanSlug}`, 302);
    }

    // Redirection permanente vers l'instance dédiée souveraine de KTFA FLEX
    const cleanT = (rawT || '').split('/')[0].split('?')[0].split('&')[0].toLowerCase().trim();
    if (cleanT === 'ktfa' || cleanT === 'ktfa-flex' || cleanT === 'ktfaflex') {
      const redirectPath = url.pathname.startsWith('/login/admin') ? '/login/admin' : url.pathname;
      return Response.redirect(`https://ktfa-flex.mynexus.workers.dev${redirectPath}`, 301);
    }

    // Endpoint Service Worker Push universel /sw.js & Firebase Messaging /firebase-messaging-sw.js
    if ((url.pathname === '/sw.js' || url.pathname === '/firebase-messaging-sw.js') && request.method === 'GET') {
      const swCode = `/** THE GREATSOFT & KTFA FLEX Universal Push Service Worker */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

try {
  firebase.initializeApp({
    apiKey: "AIzaSyDDOJSgjx30yjdLDm5HOXqXoQ5kYdWknz4",
    authDomain: "maket-place-4c42a.firebaseapp.com",
    projectId: "maket-place-4c42a",
    storageBucket: "maket-place-4c42a.firebasestorage.app",
    messagingSenderId: "1004444456478",
    appId: "1:1004444456478:web:95d6f8a77ecc886755400f",
    measurementId: "G-PJP8HG88W4"
  });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(function(payload) {
    var title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || 'Ces offres sont faites pour vous...';
    var body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || '😮 Salut ! Ne manquez pas ces offres à durée limitée : paiement en 4x sans frais.';
    var icon = (payload.notification && payload.notification.icon) || '/icon-192.png';
    var image = (payload.notification && payload.notification.image) || (payload.data && payload.data.image) || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80';
    var targetUrl = (payload.data && payload.data.url) || '/?t=ktfa';
    return self.registration.showNotification(title, {
      body: body,
      icon: icon,
      badge: '/icon-192.png',
      image: image,
      data: { url: targetUrl },
      vibrate: [200, 100, 200, 100, 200],
      tag: 'ktfa-offer',
      renotify: true,
      requireInteraction: true,
      actions: [
        { action: 'explore', title: 'Explorer' }
      ]
    });
  });
} catch(e) {
  console.debug('FCM Background SW init notice:', e);
}

self.addEventListener('push', function(event) {
  var data = {
    title: '🔥 Nouvel Arrivage KTFA FLEX',
    body: 'Disponible dès maintenant en paiement échelonné 4x sans caution à Douala et Yaoundé !',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    image: '/icon-192.png',
    url: '/?t=ktfa'
  };
  try { if (event.data) { data = Object.assign(data, event.data.json()); } } catch (e) { if (event.data) data.body = event.data.text(); }
  var options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || data.icon || '/icon-192.png',
    image: data.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    data: { url: data.url || '/?t=ktfa' },
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'ktfa-offer',
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'explore', title: 'Explorer' }
    ]
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || '/?t=ktfa';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url && client.url.includes('?t=ktfa') && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) { return clients.openWindow(targetUrl); }
  }));
});`;
      return new Response(swCode, {
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 1. Résolution dynamique du Tenant (Edge Multi-Tenancy)
    const activeTenant = await resolveTenant(request, env, url);

    // 2. Intercepteur Kill-Switch & Licence SaaS THE GREATSOFT
    const licenseCheck = await checkLicenseStatus(activeTenant, env);
    if (!licenseCheck.active) {
      if (url.pathname === '/api/admin/license') {
        // Laisser passer l'API d'administration de licence pour permettre la réactivation
      } else if (url.pathname.startsWith('/api/')) {
        return jsonResponse({
          success: false,
          error: 'LICENSE_SUSPENDED',
          message: licenseCheck.reason,
          client_name: licenseCheck.clientName
        }, 403);
      } else if (!url.pathname.startsWith('/assets/')) {
        return new Response(renderKillSwitchPage(licenseCheck.clientName, licenseCheck.reason), {
          status: 403,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    }

    // API Routes (/api/*)
    if (url.pathname.startsWith('/api/')) {
      try {
        // --- 1. VIDEOS ENDPOINTS ---
        if (url.pathname === '/api/videos' && request.method === 'GET') {
          if (!env.DB) return errorResponse('D1 database not bound', 503);
          
          if (activeTenant) {
            if (activeTenant.settings_json) {
              try {
                const parsed = JSON.parse(activeTenant.settings_json);
                if (Array.isArray(parsed.custom_videos) && parsed.custom_videos.length > 0) {
                  return jsonResponse({ success: true, count: parsed.custom_videos.length, data: parsed.custom_videos });
                }
              } catch (e) {}
            }
            // Un tenant isolé ne doit jamais hériter des vidéos d'agence par défaut
            return jsonResponse({ success: true, count: 0, data: [] });
          }

          const category = url.searchParams.get('category');
          let result;
          if (category && category !== 'all') {
            result = await env.DB.prepare(
              'SELECT * FROM videos WHERE category = ? ORDER BY display_order ASC, created_at DESC'
            ).bind(category).all();
          } else {
            result = await env.DB.prepare(
              'SELECT * FROM videos ORDER BY display_order ASC, created_at DESC'
            ).all();
          }

          const videos = (result.results || []).map((v) => ({
            ...v,
            features: typeof v.features === 'string' ? JSON.parse(v.features || '[]') : v.features,
          }));

          return jsonResponse({ success: true, count: videos.length, data: videos });
        }

        // CREATE OR UPDATE VIDEO
        if (url.pathname === '/api/videos' && request.method === 'POST') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const body = await request.json();
          const id = body.id || `vid-${Date.now()}`;
          const featuresStr = JSON.stringify(body.features || []);

          await env.DB.prepare(
            `INSERT OR REPLACE INTO videos (
              id, title, slug, category, format, duration, resolution,
              video_url, preview_url, thumbnail_url, price_fcfa, price_eur,
              badge, description, features, views_count, likes_count, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            id,
            body.title || 'Nouvelle Vidéo',
            body.slug || `video-${Date.now()}`,
            body.category || 'tiktok_reels',
            body.format || '9:16',
            body.duration || '30s',
            body.resolution || '4K Ultra HD',
            body.video_url || '',
            body.preview_url || body.video_url || '',
            body.thumbnail_url || '',
            Number(body.price_fcfa) || 25000,
            Number(body.price_eur) || 39,
            body.badge || '',
            body.description || '',
            featuresStr,
            Number(body.views_count) || 1200,
            Number(body.likes_count) || 85,
            Number(body.display_order) || 0
          ).run();

          return jsonResponse({ success: true, message: 'Vidéo enregistrée avec succès', id }, 201);
        }

        if (url.pathname.startsWith('/api/videos/') && request.method === 'DELETE') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const id = url.pathname.replace('/api/videos/', '');
          await env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true, message: 'Vidéo supprimée' });
        }

        // --- 2. POSTERS ENDPOINTS ---
        if (url.pathname === '/api/posters' && request.method === 'GET') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const activeTenant = await resolveTenant(request, env, url);
          if (activeTenant && activeTenant.settings_json) {
            try {
              const parsed = JSON.parse(activeTenant.settings_json);
              if (Array.isArray(parsed.custom_posters) && parsed.custom_posters.length > 0) {
                return jsonResponse({ success: true, count: parsed.custom_posters.length, data: parsed.custom_posters });
              } else if (activeTenant.catalog_type === 'marketplace_flex' || activeTenant.slug.includes('ktfa')) {
                return jsonResponse({ success: true, count: 0, data: [] });
              }
            } catch (e) {}
          }
          const result = await env.DB.prepare('SELECT * FROM posters ORDER BY created_at DESC').all();
          const posters = (result.results || []).map((p) => {
            let imagesArr = [];
            if (p.images) {
              imagesArr = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images;
            } else if (p.image_url) {
              imagesArr = [p.image_url];
            }
            return {
              ...p,
              features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features,
              images: imagesArr,
            };
          });
          return jsonResponse({ success: true, count: posters.length, data: posters });
        }

        if (url.pathname === '/api/posters' && request.method === 'POST') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const body = await request.json();
          const activeTenant = await resolveTenant(request, env, url);

          if (activeTenant) {
            let settings = {};
            try { settings = JSON.parse(activeTenant.settings_json || '{}'); } catch (e) {}
            let customPosters = Array.isArray(settings.custom_posters) ? [...settings.custom_posters] : [];
            const id = body.id || `post-${Date.now()}`;
            const imagesList = Array.isArray(body.images) && body.images.length > 0
              ? body.images
              : (body.image_url ? [body.image_url] : []);
            const newItem = {
              id,
              title: body.title || 'Prestation',
              category: body.category || 'Prestations & Soins',
              format: body.format || 'Prestation Soin & Beauté',
              dimensions: body.dimensions || 'Séance Studio Salon',
              image_url: body.image_url || (imagesList[0] || ''),
              images: imagesList,
              video_url: body.video_url || '',
              installment_tranches: Number(body.installment_tranches) || 4,
              monthly_fcfa: Number(body.monthly_fcfa) || Math.round((Number(body.price_fcfa) || 0) / (Number(body.installment_tranches) || 4)),
              price_fcfa: Number(body.price_fcfa) || 10000,
              price_eur: Number(body.price_eur) || 15,
              badge: body.badge || '',
              description: body.description || '',
              features: Array.isArray(body.features) ? body.features : [],
              rating: body.rating || '4.9',
              reviews_count: Number(body.reviews_count) || 14
            };
            const existingIdx = customPosters.findIndex((p) => p.id === id);
            if (existingIdx >= 0) {
              customPosters[existingIdx] = newItem;
            } else {
              customPosters.unshift(newItem);
            }
            settings.custom_posters = customPosters;
            await env.DB.prepare('UPDATE tenants SET settings_json = ? WHERE slug = ?')
              .bind(JSON.stringify(settings), activeTenant.slug)
              .run();

            // Synchronisation systématique dans la table posters D1 pour requêtes SQL globales
            try {
              const featuresJson = JSON.stringify(newItem.features || []);
              await env.DB.prepare(
                `INSERT OR REPLACE INTO posters (
                  id, title, category, format, dimensions, image_url,
                  price_fcfa, price_eur, badge, description, features
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
              ).bind(
                newItem.id,
                newItem.title,
                newItem.category,
                newItem.format,
                newItem.dimensions,
                newItem.image_url,
                newItem.price_fcfa,
                newItem.price_eur,
                newItem.badge,
                newItem.description,
                featuresJson
              ).run();
            } catch (syncErr) {
              console.warn('Sync posters D1 warning:', syncErr);
            }

            // Enregistrement officiel de la notification push pour diffusion automatique
            const latestPush = {
              id: `notif-${id}-${Date.now()}`,
              productId: id,
              title: `🔥 Nouvel Arrivage : ${newItem.title}`,
              message: `${newItem.price_fcfa ? `${Number(newItem.price_fcfa).toLocaleString('fr-FR')} FCFA — ` : ''}Disponible en paiement échelonné 4x sans caution !`,
              image: newItem.image_url || '/icon-192.png',
              timestamp: Date.now()
            };
            settings.latest_push_broadcast = latestPush;
            try {
              if (env.DB && activeTenant) {
                await env.DB.prepare('UPDATE tenants SET settings_json = ? WHERE slug = ?')
                  .bind(JSON.stringify(settings), activeTenant.slug).run();
              }
            } catch (pushSaveErr) {
              console.warn('Sync push settings err:', pushSaveErr);
            }

            // Diffusion Push en arrière-plan vers tous les téléphones abonnés (même avec app fermée)
            ctx.waitUntil(sendBackgroundFcmNotification(env, activeTenant.slug, latestPush));

            return jsonResponse({ success: true, message: 'Prestation enregistrée pour ce client', id, tenant: activeTenant.slug, push: latestPush }, 201);
          }

          // Fallback global pour site par défaut
          const id = body.id || `post-${Date.now()}`;
          const featuresStr = JSON.stringify(body.features || []);

          await env.DB.prepare(
            `INSERT OR REPLACE INTO posters (
              id, title, category, format, dimensions, image_url,
              price_fcfa, price_eur, badge, description, features
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            id,
            body.title || 'Nouvelle Prestation',
            body.category || 'Prestations & Soins',
            body.format || 'Prestation Soin & Beauté',
            body.dimensions || '1080x1080',
            body.image_url || '',
            Number(body.price_fcfa) || 10000,
            Number(body.price_eur) || 15,
            body.badge || '',
            body.description || '',
            featuresStr
          ).run();

          return jsonResponse({ success: true, message: 'Affiche enregistrée', id }, 201);
        }

        if (url.pathname.startsWith('/api/posters/') && request.method === 'DELETE') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const id = decodeURIComponent(url.pathname.replace('/api/posters/', ''));
          const activeTenant = await resolveTenant(request, env, url);

          if (activeTenant) {
            let settings = {};
            try { settings = JSON.parse(activeTenant.settings_json || '{}'); } catch (e) {}
            let customPosters = Array.isArray(settings.custom_posters) ? [...settings.custom_posters] : [];
            customPosters = customPosters.filter((p) => String(p.id) !== String(id));
            settings.custom_posters = customPosters;
            await env.DB.prepare('UPDATE tenants SET settings_json = ? WHERE slug = ?')
              .bind(JSON.stringify(settings), activeTenant.slug)
              .run();

            // Synchroniser l'alias jumeau s'il s'agit des Pizzas du feu de Dieu ou de KTFA FLEX
            if (activeTenant.slug === 'les-pizzas-du-feu-de-dieu') {
              await env.DB.prepare('UPDATE tenants SET settings_json = ? WHERE slug = ?')
                .bind(JSON.stringify(settings), 'pizzas-feu-de-dieu')
                .run().catch(() => {});
            } else if (activeTenant.slug === 'pizzas-feu-de-dieu') {
              await env.DB.prepare('UPDATE tenants SET settings_json = ? WHERE slug = ?')
                .bind(JSON.stringify(settings), 'les-pizzas-du-feu-de-dieu')
                .run().catch(() => {});
            } else if (activeTenant.slug === 'ktfa-flex') {
              await env.DB.prepare('UPDATE tenants SET settings_json = ? WHERE slug = ?')
                .bind(JSON.stringify(settings), 'ktfa')
                .run().catch(() => {});
            } else if (activeTenant.slug === 'ktfa') {
              await env.DB.prepare('UPDATE tenants SET settings_json = ? WHERE slug = ?')
                .bind(JSON.stringify(settings), 'ktfa-flex')
                .run().catch(() => {});
            }

            // Supprimer également de la table posters si existant
            await env.DB.prepare('DELETE FROM posters WHERE id = ?').bind(id).run().catch(() => {});

            return jsonResponse({ success: true, message: 'Article supprimé pour ce restaurant', deleted_id: id, count: customPosters.length });
          }

          await env.DB.prepare('DELETE FROM posters WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true, message: 'Affiche supprimée', deleted_id: id });
        }

        // --- 3. PACKAGES ENDPOINTS ---
        if (url.pathname === '/api/packages' && request.method === 'GET') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const result = await env.DB.prepare('SELECT * FROM packages ORDER BY price_fcfa ASC').all();
          const packages = (result.results || []).map((pkg) => ({
            ...pkg,
            features: typeof pkg.features === 'string' ? JSON.parse(pkg.features || '[]') : pkg.features,
            popular: Boolean(pkg.popular),
          }));
          return jsonResponse({ success: true, count: packages.length, data: packages });
        }

        if (url.pathname === '/api/packages' && request.method === 'POST') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const body = await request.json();
          const id = body.id || `pkg-${Date.now()}`;
          const featuresStr = JSON.stringify(body.features || []);

          await env.DB.prepare(
            `INSERT OR REPLACE INTO packages (
              id, name, tagline, price_fcfa, price_eur, turnaround, popular, description, features
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            id,
            body.name || 'Nouveau Pack',
            body.tagline || '',
            Number(body.price_fcfa) || 45000,
            Number(body.price_eur) || 69,
            body.turnaround || '48h',
            body.popular ? 1 : 0,
            body.description || '',
            featuresStr
          ).run();

          return jsonResponse({ success: true, message: 'Pack enregistré', id }, 201);
        }

        // --- 4. SETTINGS ENDPOINTS ---
        if (url.pathname === '/api/settings' && request.method === 'GET') {
          if (!env.DB) {
            return jsonResponse({
              whatsapp_number: env.DEFAULT_WHATSAPP || '24177000000',
              company_name: env.COMPANY_NAME || 'DIGITAL MARK PRO',
            });
          }
          const result = await env.DB.prepare('SELECT key, value FROM settings').all();
          const settings = {};
          (result.results || []).forEach((row) => {
            settings[row.key] = row.value;
          });

          // Overlay du tenant résolu dynamiquement (Zéro-Build Multi-Tenancy)
          if (activeTenant) {
            settings['company_name'] = activeTenant.name;
            settings['whatsapp_number'] = activeTenant.whatsapp;
            // Code PIN admin strictement isolé par tenant (ne jamais écraser avec le JSON hérité)
            const defaultPinBySlug = {
              'location-express': 'lexp2026',
              'l': 'lexp2026',
              'ktfa-flex': 'ktfa2026',
              'ktfa': 'ktfa2026',
              'beauty-nails': 'bnails2026',
              'pizzas-feu-de-dieu': 'pizzas2026',
              'les-pizzas-du-feu-de-dieu': 'pizzas2026',
              'burgys-gabon': 'burgys2026',
              'burgys': 'burgys2026',
              'abaia-cosmetique': 'abaia2026',
              'abaia': 'abaia2026'
            };
            const dedicatedPin = activeTenant.admin_key || defaultPinBySlug[activeTenant.slug] || 'client2026';
            settings['admin_code'] = dedicatedPin;
            settings['admin_key'] = dedicatedPin;
            settings['license_status'] = activeTenant.license_status;
            settings['license_expiry'] = activeTenant.license_expiry;
            settings['license_plan'] = activeTenant.license_plan;
            settings['custom_domain'] = activeTenant.custom_domain || '';
            if (activeTenant.settings_json) {
              try {
                const parsed = JSON.parse(activeTenant.settings_json);
                delete parsed.admin_code;
                delete parsed.admin_key;
                Object.assign(settings, parsed);
              } catch (e) {}
            }
            // Réassignation forcée post-merge pour garantir l'indépendance du mot de passe
            settings['admin_code'] = dedicatedPin;
            settings['admin_key'] = dedicatedPin;

            // Sécurité anti-fuite : nettoyer les résidus de l'ancien contenu (ex: BEAUTY NAILS) si ce n'est pas ce client
            if (activeTenant.slug !== 'beauty-nails') {
              if (settings.hero_title && (settings.hero_title.includes('BEAUTY NAILS') || settings.hero_title.includes('Vidéos & Affiches'))) {
                settings.hero_title = activeTenant.name;
              }
              if (settings.hero_subtitle && (settings.hero_subtitle.includes('BEAUTY NAILS') || settings.hero_subtitle.includes('prospects'))) {
                settings.hero_subtitle = activeTenant.catalog_type === 'location_auto_meuble'
                  ? 'Véhicules 4x4, SUV et appartements meublés de grand standing à Libreville. Réservation directe sur WhatsApp.'
                  : `Bienvenue chez ${activeTenant.name}. Découvrez notre catalogue et réservez directement sur WhatsApp.`;
              }
              if (settings.hero_badge && (settings.hero_badge.includes('BEAUTY NAILS') || settings.hero_badge.includes('STUDIO DE CRÉATION'))) {
                settings.hero_badge = activeTenant.catalog_type === 'location_auto_meuble'
                  ? 'LOCATION DE VÉHICULES & APPARTEMENTS MEUBLÉS'
                  : `BIENVENUE CHEZ ${activeTenant.name.toUpperCase()}`;
              }
              if (settings.about_title && settings.about_title.includes('BEAUTY NAILS')) {
                settings.about_title = activeTenant.name;
              }
            }
          }

          return jsonResponse({ success: true, data: settings, is_tenant: Boolean(activeTenant), tenant_slug: activeTenant?.slug });
        }

        if (url.pathname === '/api/settings' && request.method === 'POST') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const body = await request.json();

          // Si un tenant actif est configuré (ex: beauty-nails), enregistrer dans sa fiche dédiée !
          if (activeTenant) {
            let currentTenantSettings = {};
            try {
              if (activeTenant.settings_json) {
                currentTenantSettings = JSON.parse(activeTenant.settings_json);
              }
            } catch (e) {}

            const merged = { ...currentTenantSettings, ...body };
            const newName = body.company_name || activeTenant.name;
            const newWhatsapp = (body.whatsapp_number || activeTenant.whatsapp || '').replace(/[^0-9]/g, '');
            const newAdminKey = body.admin_code || activeTenant.admin_key;
            const newCustomDomain = body.custom_domain !== undefined ? body.custom_domain : activeTenant.custom_domain;

            await env.DB.prepare(
              `UPDATE tenants 
               SET name = ?, whatsapp = ?, admin_key = ?, custom_domain = ?, settings_json = ?
               WHERE slug = ?`
            ).bind(newName, newWhatsapp, newAdminKey, newCustomDomain, JSON.stringify(merged), activeTenant.slug).run();

            // Synchronisation de l'alias court 'l' et 'location-express'
            if (activeTenant.slug === 'location-express') {
              await env.DB.prepare(
                `UPDATE tenants SET name = ?, whatsapp = ?, admin_key = ?, settings_json = ? WHERE slug = 'l'`
              ).bind(newName, newWhatsapp, newAdminKey, JSON.stringify(merged)).run();
            } else if (activeTenant.slug === 'l') {
              await env.DB.prepare(
                `UPDATE tenants SET name = ?, whatsapp = ?, admin_key = ?, settings_json = ? WHERE slug = 'location-express'`
              ).bind(newName, newWhatsapp, newAdminKey, JSON.stringify(merged)).run();
            } else if (activeTenant.slug === 'les-pizzas-du-feu-de-dieu') {
              await env.DB.prepare(
                `UPDATE tenants SET name = ?, whatsapp = ?, admin_key = ?, settings_json = ? WHERE slug = 'pizzas-feu-de-dieu'`
              ).bind(newName, newWhatsapp, newAdminKey, JSON.stringify(merged)).run();
            } else if (activeTenant.slug === 'pizzas-feu-de-dieu') {
              await env.DB.prepare(
                `UPDATE tenants SET name = ?, whatsapp = ?, admin_key = ?, settings_json = ? WHERE slug = 'les-pizzas-du-feu-de-dieu'`
              ).bind(newName, newWhatsapp, newAdminKey, JSON.stringify(merged)).run();
            } else if (activeTenant.slug === 'ktfa-flex') {
              await env.DB.prepare(
                `UPDATE tenants SET name = ?, whatsapp = ?, admin_key = ?, settings_json = ? WHERE slug = 'ktfa'`
              ).bind(newName, newWhatsapp, newAdminKey, JSON.stringify(merged)).run();
            } else if (activeTenant.slug === 'ktfa') {
              await env.DB.prepare(
                `UPDATE tenants SET name = ?, whatsapp = ?, admin_key = ?, settings_json = ? WHERE slug = 'ktfa-flex'`
              ).bind(newName, newWhatsapp, newAdminKey, JSON.stringify(merged)).run();
            }

            return jsonResponse({ 
              success: true, 
              message: `Paramètres enregistrés avec succès pour le client ${newName}`,
              is_tenant: true,
              tenant_slug: activeTenant.slug 
            });
          }

          // Sinon, mise à jour des paramètres globaux de l'agence
          for (const [key, value] of Object.entries(body)) {
            await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
              .bind(key, String(value))
              .run();
          }
          return jsonResponse({ success: true, message: 'Paramètres enregistrés' });
        }

        // --- GESTION DE LICENCE & STATUT SAAS (FONCTIONNALITÉ C) ---
        if (url.pathname === '/api/admin/license' && request.method === 'GET') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const activeTenant = await resolveTenant(request, env, url);
          const map = {
            license_status: 'active',
            license_expiry: '2030-01-01',
            kill_switch_active: '0',
            suspension_reason: '',
            license_plan: 'Standard Pro',
            monthly_price_fcfa: '25000',
            company_name: activeTenant?.name || env.COMPANY_NAME || 'Location Express Gabon'
          };

          if (activeTenant) {
            map.license_status = activeTenant.license_status || 'active';
            map.license_expiry = activeTenant.license_expiry || '2030-01-01';
            map.license_plan = activeTenant.license_plan || 'Standard Pro';
            map.company_name = activeTenant.name || 'Location Express Gabon';
            map.is_suspended = activeTenant.license_status === 'suspended';
          } else {
            const rows = await env.DB.prepare(
              "SELECT key, value FROM settings WHERE key IN ('license_status', 'license_expiry', 'kill_switch_active', 'suspension_reason', 'license_plan', 'monthly_price_fcfa', 'company_name')"
            ).all();
            (rows.results || []).forEach(r => { map[r.key] = r.value; });
          }

          const expDate = new Date(map.license_expiry);
          const diffTime = expDate - new Date();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return jsonResponse({
            success: true,
            license: {
              ...map,
              is_suspended: map.kill_switch_active === '1' || map.license_status === 'suspended',
              days_remaining: daysLeft > 0 ? daysLeft : 0,
              is_expired: daysLeft <= 0
            }
          });
        }

        if (url.pathname === '/api/admin/license' && request.method === 'POST') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const body = await request.json().catch(() => ({}));
          const action = body.action; // 'suspend', 'activate', 'extend'

          if (action === 'suspend') {
            const reason = body.reason || 'Défaut de paiement de la redevance mensuelle';
            await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('kill_switch_active', '1'), ('license_status', 'suspended'), ('suspension_reason', ?)")
              .bind(reason).run();
            return jsonResponse({ success: true, message: 'Kill-Switch activé. La plateforme est suspendue.', status: 'suspended' });
          }

          if (action === 'activate') {
            await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('kill_switch_active', '0'), ('license_status', 'active'), ('suspension_reason', '')")
              .run();
            return jsonResponse({ success: true, message: 'Plateforme réactivée avec succès.', status: 'active' });
          }

          if (action === 'extend') {
            const days = Number(body.days) || 30;
            const currentExp = new Date();
            currentExp.setDate(currentExp.getDate() + days);
            const newExpStr = currentExp.toISOString().split('T')[0];
            await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('kill_switch_active', '0'), ('license_status', 'active'), ('license_expiry', ?)")
              .bind(newExpStr).run();
            return jsonResponse({ success: true, message: `Licence prolongée de ${days} jours jusqu'au ${newExpStr}`, expiry: newExpStr });
          }

          return errorResponse('Action non reconnue (valeurs admises : suspend, activate, extend)', 400);
        }

        // --- AUTO-INGESTION DE CONTENU & SCRAPING HEADLESS (FONCTIONNALITÉ B) ---
        if (url.pathname === '/api/admin/ingest' && request.method === 'POST') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const body = await request.json().catch(() => ({}));
          const targetUrl = body.url;
          const saveToDb = body.save_to_db === true;

          if (!targetUrl || !targetUrl.startsWith('http')) {
            return errorResponse('URL valide requise (http:// ou https://)');
          }

          try {
            const res = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
              }
            });

            const html = await res.text();

            // Extraction Titre
            const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["'](.*?)["']/i) ||
                                 html.match(/<meta\s+content=["'](.*?)["']\s+(?:property|name)=["']og:title["']/i);
            const titleTagMatch = html.match(/<title>(.*?)<\/title>/i);
            let extractedTitle = (ogTitleMatch ? ogTitleMatch[1] : (titleTagMatch ? titleTagMatch[1] : '')).trim();
            if (extractedTitle.includes('|')) extractedTitle = extractedTitle.split('|')[0].trim();
            if (extractedTitle.includes('—')) extractedTitle = extractedTitle.split('—')[0].trim();

            // Extraction Description
            const ogDescMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:description|description)["']\s+content=["'](.*?)["']/i) ||
                                html.match(/<meta\s+content=["'](.*?)["']\s+(?:property|name)=["'](?:og:description|description)["']/i);
            const extractedDesc = ogDescMatch ? ogDescMatch[1].trim() : '';

            // Extraction Image / Logo
            const ogImgMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["'](.*?)["']/i) ||
                               html.match(/<meta\s+content=["'](.*?)["']\s+(?:property|name)=["']og:image["']/i);
            const extractedImg = ogImgMatch ? ogImgMatch[1].trim() : '';

            // Extraction WhatsApp / Tél
            const waMatch = html.match(/wa\.me\/(?:(?:\+?([0-9]{8,15})))/i) ||
                            html.match(/whatsapp\.com\/send\?phone=([0-9]+)/i) ||
                            html.match(/(?:\+?241|0)[0-9]{7,8}/i);
            const extractedWa = waMatch ? (waMatch[1] || waMatch[0]).replace(/[^0-9]/g, '') : '';

            // Extraction des prix et produits dans le texte
            const cleanText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
            const priceRegex = /([A-Za-zÀ-ÿ0-9\s]{3,35}?)\s*[:—–-]?\s*([0-9]{1,3}(?:[\s.,][0-9]{3})*|[0-9]{3,6})\s*(FCFA|XAF|EUR|€|frs|F)\b/gi;
            let match;
            const extractedItems = [];
            while ((match = priceRegex.exec(cleanText)) !== null && extractedItems.length < 12) {
              const pTitle = match[1].trim();
              const pPrice = parseInt(match[2].replace(/[\s.,]/g, ''), 10);
              if (pTitle.length >= 3 && pPrice >= 500 && pPrice <= 500000) {
                extractedItems.push({
                  title: pTitle.slice(0, 40),
                  price_fcfa: pPrice,
                  category: 'Catalogue Extrait',
                  description: `Article extrait automatiquement depuis ${targetUrl}`,
                  image_url: extractedImg || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
                });
              }
            }

            // Sauvegarde en D1 si demandée
            if (saveToDb && extractedItems.length > 0) {
              for (const item of extractedItems) {
                const id = `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                await env.DB.prepare(
                  `INSERT INTO posters (id, title, category, format, dimensions, image_url, price_fcfa, price_eur, badge, description, features)
                   VALUES (?, ?, ?, 'Carré HD', '1080x1080', ?, ?, ?, 'INGESTION AUTO', ?, '["Disponible immédiatement"]')`
                ).bind(id, item.title, item.category, item.image_url, item.price_fcfa, Math.round(item.price_fcfa / 655), item.description).run();
              }

              if (extractedTitle) {
                await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('company_name', ?)")
                  .bind(extractedTitle).run();
              }
              if (extractedWa) {
                await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('whatsapp_number', ?)")
                  .bind(extractedWa).run();
              }
            }

            return jsonResponse({
              success: true,
              extracted: {
                title: extractedTitle,
                description: extractedDesc,
                logo_url: extractedImg,
                whatsapp: extractedWa,
                items_count: extractedItems.length,
                items: extractedItems,
                saved_to_db: saveToDb
              }
            });
          } catch (err) {
            return errorResponse(`Erreur d'ingestion : ${err.message}`, 500);
          }
        }

        // --- MULTI-TENANCY EDGE : GESTION DES TENANTS (FONCTIONNALITÉ A) ---
        if (url.pathname === '/api/tenants' && request.method === 'GET') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          try {
            const { results } = await env.DB.prepare('SELECT * FROM tenants ORDER BY created_at DESC').all();
            return jsonResponse({ success: true, count: (results || []).length, tenants: results || [] });
          } catch (e) {
            return jsonResponse({ success: true, count: 0, tenants: [] });
          }
        }

        if (url.pathname === '/api/tenants' && request.method === 'POST') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const body = await request.json().catch(() => ({}));
          const slug = (body.slug || '').toLowerCase().trim();
          const name = body.name || 'Nouveau Client';
          const whatsapp = (body.whatsapp || '24177624383').replace(/[^0-9]/g, '');
          const adminKey = body.admin_key || Math.floor(100000 + Math.random() * 900000).toString();
          const customDomain = body.custom_domain || null;
          const themeChoice = body.theme_choice || '1';
          const catalogType = body.catalog_type || 'cosmetique';
          const licensePlan = body.license_plan || 'pro';
          const licenseExpiry = body.license_expiry || '2026-12-31';

          if (!slug) return errorResponse('Slug du tenant obligatoire');

          await env.DB.prepare(
            `INSERT OR REPLACE INTO tenants (slug, name, whatsapp, admin_key, custom_domain, theme_choice, catalog_type, license_status, license_expiry, license_plan, settings_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`
          ).bind(slug, name, whatsapp, adminKey, customDomain, themeChoice, catalogType, licenseExpiry, licensePlan, JSON.stringify(body.settings || {})).run();

          const siteUrl = `https://${slug}.mynexus.workers.dev`;
          const directUrl = `https://digital-mark-pro.mynexus.workers.dev/?t=${slug}`;
          const directAdminUrl = `https://digital-mark-pro.mynexus.workers.dev/login/admin?t=${slug}`;
          return jsonResponse({
            success: true,
            message: 'Tenant créé en 0.2s avec Zéro-Build !',
            tenant: {
              slug,
              name,
              siteUrl,
              directUrl,
              adminUrl: directAdminUrl,
              subdomainAdminUrl: `${siteUrl}/login/admin`,
              whatsapp,
              license_status: 'active'
            }
          }, 201);
        }

        // --- 5. R2 STORAGE UPLOADS ---
        if (url.pathname === '/api/upload' && request.method === 'POST') {
          if (!env.R2_STORAGE) {
            return errorResponse('Stockage R2 non configuré', 503);
          }
          const formData = await request.formData();
          const file = formData.get('file');
          if (!file) {
            return errorResponse('Aucun fichier fourni');
          }

          const originalName = file.name || 'upload';
          const fileExtension = originalName.split('.').pop().toLowerCase();
          const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `${Date.now()}-${safeName}`;

          await env.R2_STORAGE.put(filename, file.stream(), {
            httpMetadata: {
              contentType: file.type || 'application/octet-stream',
            },
          });

          const fileUrl = `/api/media/${filename}`;
          return jsonResponse({
            success: true,
            key: filename,
            url: fileUrl,
            size: file.size,
            type: file.type,
          });
        }

        // --- 6. SERVE MEDIA FROM R2 WITH ULTRA-FAST VIDEO STREAMING (HTTP 206 RANGE) ---
        if (url.pathname.startsWith('/api/media/') && request.method === 'GET') {
          if (!env.R2_STORAGE) return errorResponse('R2 non disponible', 503);
          const key = decodeURIComponent(url.pathname.replace('/api/media/', ''));

          const rangeHeader = request.headers.get('Range');
          let object;

          if (rangeHeader) {
            object = await env.R2_STORAGE.get(key, {
              range: request.headers,
              onlyIf: request.headers,
            });
          } else {
            object = await env.R2_STORAGE.get(key, {
              onlyIf: request.headers,
            });
          }

          if (!object) return errorResponse('Fichier introuvable', 404);

          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set('etag', object.httpEtag);
          headers.set('Accept-Ranges', 'bytes');
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          for (const [k, v] of Object.entries(corsHeaders)) {
            headers.set(k, v);
          }

          // Détection stricte du Content-Type pour streaming vidéo natif sans blocage
          const lowerKey = key.toLowerCase();
          if (lowerKey.endsWith('.mp4')) headers.set('Content-Type', 'video/mp4');
          else if (lowerKey.endsWith('.webm')) headers.set('Content-Type', 'video/webm');
          else if (lowerKey.endsWith('.mov')) headers.set('Content-Type', 'video/quicktime');
          else if (lowerKey.endsWith('.webp')) headers.set('Content-Type', 'image/webp');
          else if (lowerKey.endsWith('.jpg') || lowerKey.endsWith('.jpeg')) headers.set('Content-Type', 'image/jpeg');
          else if (lowerKey.endsWith('.png')) headers.set('Content-Type', 'image/png');

          if (object.range) {
            const totalSize = object.size;
            const start = object.range.offset ?? 0;
            const end = object.range.length ? start + object.range.length - 1 : totalSize - 1;
            headers.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
            headers.set('Content-Length', String(object.range.length || (end - start + 1)));
            return new Response(object.body, { status: 206, headers });
          }

          return new Response(object.body, { status: 200, headers });
        }

        // --- 7. TRAFIC & ANALYTICS 100% RÉELS (VUES ET VISITES NON FICTIVES) ---
        if (url.pathname === '/api/analytics/track' && request.method === 'POST') {
          if (!env.DB) return errorResponse('D1 non disponible', 503);
          const body = await request.json().catch(() => ({}));
          const visitorId = body.visitor_id || 'anonymous';
          const sessionId = body.session_id || `sess-${Date.now()}`;
          const pagePath = body.page_path || '/';
          const referrer = body.referrer || '';
          const isNewSession = body.is_new_session === true ? 1 : 0;
          const userAgent = request.headers.get('user-agent') || '';
          const country = request.headers.get('cf-ipcountry') || request.cf?.country || 'Inconnu';
          const city = request.cf?.city || 'Inconnue';

          try {
            // Insertion du log de visite réel
            await env.DB.prepare(
              `INSERT INTO site_traffic_logs (visitor_id, session_id, page_path, referrer, user_agent, country, city, is_unique_visit)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(visitorId, sessionId, pagePath, referrer, userAgent, country, city, isNewSession).run();

            // Incrémentation du compteur de vues totales
            await env.DB.prepare(
              `INSERT INTO site_traffic_stats (metric, count, updated_at) VALUES ('total_views', 1, CURRENT_TIMESTAMP)
               ON CONFLICT(metric) DO UPDATE SET count = count + 1, updated_at = CURRENT_TIMESTAMP`
            ).run();

            // Si c'est une nouvelle session/visite, incrémentation du compteur de visites uniques
            if (isNewSession) {
              await env.DB.prepare(
                `INSERT INTO site_traffic_stats (metric, count, updated_at) VALUES ('total_visits', 1, CURRENT_TIMESTAMP)
                 ON CONFLICT(metric) DO UPDATE SET count = count + 1, updated_at = CURRENT_TIMESTAMP`
              ).run();
            }
          } catch (dbErr) {
            console.error('Tracking log error:', dbErr);
          }

          return jsonResponse({
            success: true,
            tracked: true,
            country,
            city,
          });
        }

        if (url.pathname === '/api/analytics/stats' && request.method === 'GET') {
          if (!env.DB) return errorResponse('D1 non disponible', 503);

          try {
            // 1. Vues et visites totales cumulées
            const statsRes = await env.DB.prepare(
              `SELECT metric, count FROM site_traffic_stats`
            ).all();

            let totalViews = 0;
            let totalVisits = 0;
            (statsRes.results || []).forEach((row) => {
              if (row.metric === 'total_views') totalViews = Number(row.count) || 0;
              if (row.metric === 'total_visits') totalVisits = Number(row.count) || 0;
            });

            // Si site_traffic_stats est vide, fallback direct sur count() des logs réels
            if (totalViews === 0) {
              const countRes = await env.DB.prepare(
                `SELECT COUNT(*) as total_views, COUNT(DISTINCT session_id) as total_visits FROM site_traffic_logs`
              ).first();
              if (countRes) {
                totalViews = Number(countRes.total_views) || 0;
                totalVisits = Number(countRes.total_visits) || 0;
              }
            }

            // 2. Statistiques réelles du jour (Aujourd'hui)
            const todayRes = await env.DB.prepare(
              `SELECT 
                COUNT(*) as today_views,
                COUNT(DISTINCT session_id) as today_visits
               FROM site_traffic_logs 
               WHERE date(created_at) = date('now')`
            ).first();

            const todayViews = todayRes ? (Number(todayRes.today_views) || 0) : 0;
            const todayVisits = todayRes ? (Number(todayRes.today_visits) || 0) : 0;

            // 3. Origine géographique réelle (Top pays)
            const countriesRes = await env.DB.prepare(
              `SELECT country, COUNT(*) as count 
               FROM site_traffic_logs 
               WHERE country IS NOT NULL AND country != ''
               GROUP BY country 
               ORDER BY count DESC 
               LIMIT 8`
            ).all();

            // 4. Dernières visites réelles en direct
            const recentRes = await env.DB.prepare(
              `SELECT id, page_path, country, city, is_unique_visit, created_at 
               FROM site_traffic_logs 
               ORDER BY created_at DESC 
               LIMIT 25`
            ).all();

            return jsonResponse({
              success: true,
              data: {
                total_views: totalViews,
                total_visits: totalVisits,
                today_views: todayViews,
                today_visits: todayVisits,
                countries: countriesRes.results || [],
                recent_activity: recentRes.results || [],
              },
            });
          } catch (e) {
            console.error('Analytics stats error:', e);
            return jsonResponse({
              success: true,
              data: {
                total_views: 0,
                total_visits: 0,
                today_views: 0,
                today_visits: 0,
                countries: [],
                recent_activity: [],
              },
            });
          }
        }

        // --- 11. PUSH NOTIFICATION SUBSCRIBERS ENDPOINTS ---
        if (url.pathname === '/api/push/subscribe' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const token = body.token;
          if (!token) return errorResponse('Token push manquant', 400);

          const tenantSlug = body.tenant || (activeTenant ? activeTenant.slug : 'ktfa');
          const platform = body.platform || request.headers.get('user-agent') || 'Inconnu';
          const clientName = body.name || 'Visiteur';
          const clientPhone = body.phone || '';

          if (env.DB) {
            try {
              await env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS push_subscriptions (
                  id TEXT PRIMARY KEY,
                  tenant_slug TEXT NOT NULL,
                  token TEXT NOT NULL UNIQUE,
                  platform TEXT,
                  client_name TEXT,
                  client_phone TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
              `).run();

              const subId = 'sub_' + Math.random().toString(36).substring(2, 10);
              await env.DB.prepare(`
                INSERT INTO push_subscriptions (id, tenant_slug, token, platform, client_name, client_phone, last_active_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(token) DO UPDATE SET
                  last_active_at = CURRENT_TIMESTAMP,
                  tenant_slug = excluded.tenant_slug
              `).bind(subId, tenantSlug, token, platform, clientName, clientPhone).run();
            } catch (d1Err) {
              console.warn('[Push DB warn]:', d1Err);
            }
          }

          return jsonResponse({
            success: true,
            message: 'Abonnement push enregistré avec succès',
            tenant: tenantSlug
          });
        }

        if (url.pathname === '/api/push/subscribers' && request.method === 'GET') {
          if (!env.DB) return jsonResponse({ success: true, count: 0, subscribers: [] });
          try {
            const tenantSlug = url.searchParams.get('tenant') || (activeTenant ? activeTenant.slug : null);
            let result;
            if (tenantSlug) {
              result = await env.DB.prepare(
                'SELECT id, tenant_slug, platform, client_name, created_at, last_active_at FROM push_subscriptions WHERE tenant_slug = ? ORDER BY created_at DESC LIMIT 100'
              ).bind(tenantSlug).all();
            } else {
              result = await env.DB.prepare(
                'SELECT id, tenant_slug, platform, client_name, created_at, last_active_at FROM push_subscriptions ORDER BY created_at DESC LIMIT 100'
              ).all();
            }
            return jsonResponse({
              success: true,
              count: (result.results || []).length,
              subscribers: result.results || []
            });
          } catch (e) {
            return jsonResponse({ success: true, count: 0, subscribers: [], error: e.message });
          }
        }

        // --- 12. PUSH BROADCAST & DERNIÈRE NOTIFICATION OFFICIELLE ---
        if (url.pathname === '/api/push/latest' && request.method === 'GET') {
          let latestPush = null;
          let tSettings = null;
          try {
            if (activeTenant && activeTenant.settings_json) {
              tSettings = JSON.parse(activeTenant.settings_json);
            }
          } catch (e) {}

          if (tSettings && tSettings.latest_push_broadcast) {
            latestPush = tSettings.latest_push_broadcast;
          } else if (env.DB) {
            try {
              const currentTenantSlug = activeTenant ? activeTenant.slug : 'ktfa';
              const latestPoster = await env.DB.prepare(
                'SELECT id, title, price_fcfa, image_url, created_at FROM posters WHERE tenant_slug = ? ORDER BY created_at DESC LIMIT 1'
              ).bind(currentTenantSlug).first();
              if (latestPoster) {
                latestPush = {
                  id: `notif-${latestPoster.id}`,
                  productId: latestPoster.id,
                  title: `🔥 Nouvel Arrivage : ${latestPoster.title}`,
                  message: `${latestPoster.price_fcfa ? `${Number(latestPoster.price_fcfa).toLocaleString('fr-FR')} FCFA — ` : ''}Disponible en paiement échelonné 4x sans caution !`,
                  image: latestPoster.image_url || '/icon-192.png',
                  timestamp: Date.now()
                };
              }
            } catch (e) {
              console.warn('Fallback push latest D1 err:', e);
            }
          }
          return jsonResponse({ success: true, latest: latestPush });
        }

        if (url.pathname === '/api/push/broadcast' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const currentTenantSlug = body.tenant || (activeTenant ? activeTenant.slug : 'ktfa');
          const pushItem = {
            id: body.id || `notif-${Date.now()}`,
            productId: body.productId || '',
            title: body.title || '🔥 Nouvel Arrivage KTFA FLEX',
            message: body.message || 'Disponible dès maintenant en paiement échelonné 4x sans caution !',
            image: body.image || '/icon-192.png',
            timestamp: Date.now()
          };

          if (env.DB) {
            try {
              let tSettings = {};
              if (activeTenant && activeTenant.settings_json) {
                tSettings = JSON.parse(activeTenant.settings_json || '{}');
              }
              tSettings.latest_push_broadcast = pushItem;
              if (activeTenant) {
                await env.DB.prepare('UPDATE tenants SET settings_json = ? WHERE slug = ?')
                  .bind(JSON.stringify(tSettings), activeTenant.slug).run().catch(() => {});
              }
            } catch (sErr) {}
          }

          // Diffusion réelle FCM en arrière-plan (réveille les smartphones fermés)
          ctx.waitUntil(sendBackgroundFcmNotification(env, currentTenantSlug, pushItem));
          return jsonResponse({ success: true, broadcasted: pushItem });
        }

        // --- 13. AVIS & COMMENTAIRES CLIENTS (D1 PERSISTANT + MODÉRATION ADMIN) ---
        if (url.pathname === '/api/reviews' && request.method === 'GET') {
          if (!env.DB) return jsonResponse({ success: true, data: [] });
          try {
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS product_reviews (
                id TEXT PRIMARY KEY,
                product_id TEXT NOT NULL,
                author TEXT NOT NULL,
                city TEXT,
                rating INTEGER DEFAULT 5,
                comment TEXT NOT NULL,
                is_verified INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `).run();

            const prodId = url.searchParams.get('product_id');
            let query;
            if (prodId) {
              query = await env.DB.prepare(
                'SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC'
              ).bind(prodId).all();
            } else {
              query = await env.DB.prepare(
                'SELECT * FROM product_reviews ORDER BY created_at DESC LIMIT 200'
              ).all();
            }
            return jsonResponse({ success: true, data: query.results || [] });
          } catch (e) {
            return jsonResponse({ success: true, data: [], error: e.message });
          }
        }

        if (url.pathname === '/api/reviews' && request.method === 'POST') {
          if (!env.DB) return errorResponse('Base de données non disponible', 503);
          const body = await request.json().catch(() => ({}));
          if (!body.product_id || !body.author || !body.comment) {
            return errorResponse('Champs obligatoires manquants (product_id, author, comment)', 400);
          }

          try {
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS product_reviews (
                id TEXT PRIMARY KEY,
                product_id TEXT NOT NULL,
                author TEXT NOT NULL,
                city TEXT,
                rating INTEGER DEFAULT 5,
                comment TEXT NOT NULL,
                is_verified INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `).run();

            const revId = body.id || `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            await env.DB.prepare(`
              INSERT INTO product_reviews (id, product_id, author, city, rating, comment, is_verified)
              VALUES (?, ?, ?, ?, ?, ?, 1)
            `).bind(
              revId,
              String(body.product_id),
              body.author.trim(),
              body.city || 'Douala / Yaoundé',
              Number(body.rating) || 5,
              body.comment.trim()
            ).run();

            return jsonResponse({
              success: true,
              message: 'Avis enregistré avec succès',
              review: {
                id: revId,
                product_id: body.product_id,
                author: body.author,
                city: body.city || 'Douala / Yaoundé',
                rating: Number(body.rating) || 5,
                comment: body.comment,
                created_at: new Date().toISOString()
              }
            }, 201);
          } catch (e) {
            return errorResponse(`Erreur enregistrement avis : ${e.message}`, 500);
          }
        }

        if (url.pathname.startsWith('/api/reviews/') && request.method === 'DELETE') {
          if (!env.DB) return errorResponse('Base de données non disponible', 503);
          const revId = decodeURIComponent(url.pathname.replace('/api/reviews/', ''));
          try {
            await env.DB.prepare('DELETE FROM product_reviews WHERE id = ?').bind(revId).run();
            return jsonResponse({ success: true, message: 'Avis supprimé avec succès', id: revId });
          } catch (e) {
            return errorResponse(`Erreur suppression avis : ${e.message}`, 500);
          }
        }

        return errorResponse('Route API non trouvée', 404);
      } catch (err) {
        console.error('API Error:', err);
        return errorResponse(err.message || 'Erreur interne du serveur', 500);
      }
    }

    // --- 1B. APPLE IOS NATIVE WEBCLIP CONFIGURATION PROFILE (.mobileconfig) ---
    if ((url.pathname === '/api/install-ios.mobileconfig' || url.pathname === '/install.mobileconfig') && request.method === 'GET') {
      let companyName = 'KTFA FLEX';
      let targetUrl = `${url.origin}/?t=ktfa`;
      if (activeTenant) {
        companyName = activeTenant.name || 'KTFA FLEX';
        targetUrl = `${url.origin}/?t=${activeTenant.slug}`;
      } else {
        const tParam = url.searchParams.get('t');
        if (tParam) targetUrl = `${url.origin}/?t=${tParam}`;
      }

      const safeName = companyName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>${safeName}</string>
            <key>PayloadDescription</key>
            <string>Package WebClip d'installation ${safeName}</string>
            <key>PayloadDisplayName</key>
            <string>${safeName}</string>
            <key>PayloadIdentifier</key>
            <string>com.ktfaflex.app.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>9a7d8c52-7d2e-4b72-a0b5-9b2f6b3a0e12</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>${targetUrl}</string>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Package Installation ${safeName}</string>
    <key>PayloadIdentifier</key>
    <string>com.ktfaflex.app.profile</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>3f8c7b61-4a1e-4c82-b1c4-8a1e5d2b9f34</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

      return new Response(xml, {
        headers: {
          'Content-Type': 'application/x-apple-aspen-config; charset=utf-8',
          'Content-Disposition': `attachment; filename="${companyName.replace(/[^a-zA-Z0-9]/g, '_')}.mobileconfig"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // --- 1. DYNAMIC PWA MANIFEST (WHITE-LABEL CLONES) ---
    if ((url.pathname === '/manifest.json' || url.pathname === '/manifest.webmanifest') && request.method === 'GET') {
      let companyName = env.COMPANY_NAME || 'Mon Entreprise';
      let tagline = '';
      let logoUrl = '';
      let colorBg = '#07090e';
      let colorPrimary = '#0a0d14';

      if (env.DB) {
        try {
          const res = await env.DB.prepare(
            "SELECT key, value FROM settings WHERE key IN ('company_name', 'tagline', 'company_logo_url', 'color_bg_main', 'color_primary', 'hero_description')"
          ).all();
          (res.results || []).forEach((row) => {
            if (row.key === 'company_name' && row.value) companyName = row.value;
            if (row.key === 'tagline' && row.value) tagline = row.value;
            if (row.key === 'company_logo_url' && row.value) logoUrl = row.value;
            if (row.key === 'color_bg_main' && row.value) colorBg = row.value;
            if (row.key === 'color_primary' && row.value) colorPrimary = row.value;
          });
        } catch (e) {}
      }

      if (activeTenant) {
        companyName = activeTenant.name || companyName;
        if (activeTenant.slug === 'ktfa' || activeTenant.slug === 'ktfa-flex') {
          logoUrl = '/icon-512.png';
          companyName = 'KTFA FLEX';
          tagline = 'Marketplace & Paiement Échelonné';
          colorBg = '#3e4148';
          colorPrimary = '#D97706';
        } else if (activeTenant.settings_json) {
          try {
            const parsed = JSON.parse(activeTenant.settings_json);
            if (parsed.tagline) tagline = parsed.tagline;
            if (parsed.company_logo_url) logoUrl = parsed.company_logo_url;
            if (parsed.color_bg_main) colorBg = parsed.color_bg_main;
            if (parsed.color_primary) colorPrimary = parsed.color_primary;
          } catch (e) {}
        }
      }

      const fullLogoUrl = logoUrl
        ? (logoUrl.startsWith('http') ? logoUrl : `${url.origin}${logoUrl}`)
        : `${url.origin}/icon-192.png`;
      let mimeType = 'image/png';
      if (fullLogoUrl.endsWith('.webp')) mimeType = 'image/webp';
      else if (fullLogoUrl.endsWith('.svg')) mimeType = 'image/svg+xml';
      else if (fullLogoUrl.endsWith('.jpg') || fullLogoUrl.endsWith('.jpeg')) mimeType = 'image/jpeg';

      const shortName = companyName.length > 25 ? companyName.slice(0, 25) : companyName;

      const manifest = {
        name: companyName,
        short_name: shortName,
        description: tagline || `Application officielle ${companyName}`,
        start_url: activeTenant ? `/?t=${activeTenant.slug}` : '/',
        scope: '/',
        display: 'standalone',
        background_color: colorBg,
        theme_color: colorPrimary,
        orientation: 'portrait-primary',
        icons: [
          {
            src: `${url.origin}/icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${url.origin}/icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${url.origin}/icon-maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      };

      return new Response(JSON.stringify(manifest), {
        headers: {
          'Content-Type': 'application/manifest+json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // --- 2. DYNAMIC FAVICON & PWA ICONS (Direct Stream from R2 or High-Res Fallback) ---
    const isIconRequest =
      url.pathname === '/favicon.svg' ||
      url.pathname === '/favicon.ico' ||
      url.pathname === '/icon-192.png' ||
      url.pathname === '/icon-512.png' ||
      url.pathname === '/pwa-icon.png' ||
      url.pathname.startsWith('/apple-touch-icon');

    if (isIconRequest && request.method === 'GET') {
      let companyName = env.COMPANY_NAME || 'Mon Entreprise';
      let logoUrl = '';
      let colorPrimary = '#f59e0b';

      if (env.DB) {
        try {
          const res = await env.DB.prepare(
            "SELECT key, value FROM settings WHERE key IN ('company_name', 'company_logo_url', 'color_primary')"
          ).all();
          (res.results || []).forEach((row) => {
            if (row.key === 'company_name' && row.value) companyName = row.value;
            if (row.key === 'company_logo_url' && row.value) logoUrl = row.value;
            if (row.key === 'color_primary' && row.value) colorPrimary = row.value;
          });
        } catch (e) {}
      }

      if (activeTenant && (activeTenant.slug === 'ktfa' || activeTenant.slug === 'ktfa-flex')) {
        if (
          url.pathname === '/icon-192.png' ||
          url.pathname === '/icon-512.png' ||
          url.pathname === '/icon-maskable-512.png' ||
          url.pathname.startsWith('/apple-touch-icon')
        ) {
          if (env.ASSETS) {
            return env.ASSETS.fetch(request);
          }
        }
        logoUrl = '/icon-512.png';
        companyName = 'KTFA FLEX';
      }

      if (logoUrl) {
        // Direct stream from R2 if stored locally (avoid redirect failures on mobile)
        if (logoUrl.startsWith('/api/media/') && env.R2_STORAGE) {
          const key = decodeURIComponent(logoUrl.replace('/api/media/', ''));
          try {
            const object = await env.R2_STORAGE.get(key);
            if (object) {
              const headers = new Headers();
              object.writeHttpMetadata(headers);
              headers.set('Cache-Control', 'public, max-age=86400');
              headers.set('Access-Control-Allow-Origin', '*');
              return new Response(object.body, { headers });
            }
          } catch (e) {
            console.error('R2 icon load error:', e);
          }
        }
        // Fallback: absolute redirect (valid for URL constructors)
        const absoluteUrl = logoUrl.startsWith('http') ? logoUrl : new URL(logoUrl, url.origin).toString();
        return Response.redirect(absoluteUrl, 302);
      }

      const initial = (companyName.trim()[0] || '★').toUpperCase();
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="42" fill="${colorPrimary}"/><text x="96" y="128" font-size="96" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900">${initial}</text></svg>`;
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // --- 3. DYNAMIC HTML INJECTION (Open Graph / WhatsApp / Meta Tags) ---
    const isHtmlRequest =
      request.headers.get('accept')?.includes('text/html') ||
      url.pathname === '/' ||
      url.pathname === '/index.html' ||
      (!url.pathname.includes('.') && !url.pathname.startsWith('/api/'));

    if (isHtmlRequest && env.ASSETS) {
      try {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.status === 200) {
          let html = await assetRes.text();
          let companyName = env.COMPANY_NAME || 'Mon Entreprise';
          let tagline = '';
          let heroTitle = '';
          let heroBadge = '';
          let heroDesc = '';
          let logoUrl = '';
          let bannerUrl = '';
          let colorPrimary = '#0a0d14';

          if (env.DB) {
            try {
              const res = await env.DB.prepare(
                "SELECT key, value FROM settings WHERE key IN ('company_name', 'tagline', 'hero_title', 'hero_badge', 'hero_description', 'company_logo_url', 'hero_banner_url', 'hero_banner_image', 'color_primary')"
              ).all();
              (res.results || []).forEach((row) => {
                if (row.key === 'company_name' && row.value) companyName = row.value;
                if (row.key === 'tagline' && row.value) tagline = row.value;
                if (row.key === 'hero_title' && row.value) heroTitle = row.value;
                if (row.key === 'hero_badge' && row.value) heroBadge = row.value;
                if (row.key === 'hero_description' && row.value) heroDesc = row.value;
                if (row.key === 'company_logo_url' && row.value) logoUrl = row.value;
                if ((row.key === 'hero_banner_url' || row.key === 'hero_banner_image') && row.value) bannerUrl = row.value;
                if (row.key === 'color_primary' && row.value) colorPrimary = row.value;
              });
            } catch (e) {}
          }

          // Personnalisation prioritaire pour le Tenant actif (Multi-Tenancy)
          if (activeTenant) {
            companyName = activeTenant.name || companyName;
            if (activeTenant.slug === 'ktfa' || activeTenant.slug === 'ktfa-flex') {
              companyName = 'KTFA FLEX';
              tagline = 'Marketplace Officielle & Paiement par Tranche';
              heroTitle = 'KTFA FLEX — Achetez Malin, Payez à Votre Rythme';
              heroDesc = 'Catalogue officiel High-Tech & Business avec facilité de paiement par tranche sans caution.';
              logoUrl = '/logos/ktfa_official_logo.jpg';
              bannerUrl = '/logos/ktfa_official_logo.jpg';
              colorPrimary = '#D97706';
            }
            if (activeTenant.settings_json) {
              try {
                const parsed = JSON.parse(activeTenant.settings_json);
                if (parsed.company_name) companyName = parsed.company_name;
                if (parsed.tagline) tagline = parsed.tagline;
                if (parsed.hero_title) heroTitle = parsed.hero_title;
                if (parsed.hero_badge) heroBadge = parsed.hero_badge;
                if (parsed.hero_description) heroDesc = parsed.hero_description;
                if (parsed.company_logo_url) logoUrl = parsed.company_logo_url;
                if (parsed.hero_banner_image || parsed.hero_banner_url) bannerUrl = parsed.hero_banner_image || parsed.hero_banner_url;
                if (parsed.color_primary) colorPrimary = parsed.color_primary;
              } catch (e) {}
            }
          }

          // Détection d'un produit spécifique pour l'aperçu WhatsApp / Open Graph (?prod=..., ?p=..., ?v=...)
          const targetProdSlug = url.searchParams.get('prod') || url.searchParams.get('product') || url.searchParams.get('item');
          const targetVideoSlug = url.searchParams.get('v') || url.searchParams.get('video');
          const targetPosterSlug = targetProdSlug || url.searchParams.get('p') || url.searchParams.get('poster') || url.searchParams.get('photo');

          let specificItemTitle = '';
          let specificItemDesc = '';
          let specificItemImg = '';

          // 1. Recherche dans les produits par défaut KTFA FLEX si c'est un code ktfa-XX
          const KTFA_DEFAULT_MAP = {
            'ktfa-01': {
              title: 'Apple iPhone 15 Pro Max 256GB Titane',
              price: '850 000 FCFA (4x 212 500 F)',
              img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
              desc: 'Le summum de la technologie Apple en titane aérospatial. Disponible au comptant ou en 4 tranches sans caution sur KTFA FLEX Cameroun 🇨🇲.'
            },
            'ktfa-02': {
              title: 'Samsung Galaxy S24 Ultra 512GB Titanium',
              price: '790 000 FCFA (4x 197 500 F)',
              img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
              desc: 'Le monstre de puissance Samsung boosté à l\'IA. Disponible au comptant ou en 4 tranches sans caution sur KTFA FLEX Cameroun 🇨🇲.'
            },
            'ktfa-03': {
              title: 'Apple MacBook Air M2 13.6" 256GB SSD',
              price: '650 000 FCFA (4x 162 500 F)',
              img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
              desc: 'L\'ultrabook pro léger et puissant avec puce M2. Échelonné en 4 tranches sans caution sur KTFA FLEX.'
            },
            'ktfa-04': {
              title: 'Smart TV Samsung Crystal UHD 65" 4K',
              price: '490 000 FCFA (4x 122 500 F)',
              img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
              desc: 'Immersion cinéma 4K exceptionnelle pour votre salon. Échelonné en 4 tranches sans caution sur KTFA FLEX.'
            },
            'ktfa-05': {
              title: 'Sony PlayStation 5 Slim 1TB + 2 Manettes',
              price: '450 000 FCFA (4x 112 500 F)',
              img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
              desc: 'La console nouvelle génération 4K 120fps. Échelonné en 4 tranches sans caution sur KTFA FLEX.'
            },
            'ktfa-06': {
              title: 'Pack Tontine Électroménager Salon & Cuisine',
              price: '950 000 FCFA (4x 237 500 F)',
              img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
              desc: 'Équipez entièrement votre foyer en 4 tranches sans caution avec KTFA FLEX.'
            },
            'ktfa-07': {
              title: 'Générateur Électrique Silencieux 7.5 KVA Inverter',
              price: '580 000 FCFA (4x 145 000 F)',
              img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
              desc: 'Autonomie électrique totale contre les délestages. Échelonné en 4 tranches sur KTFA FLEX.'
            },
            'ktfa-08': {
              title: 'Canon EOS R50 Mirrorless Pack Créateur 4K',
              price: '520 000 FCFA (4x 130 000 F)',
              img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
              desc: 'Le boîtier photo & vidéo 4K pour créateurs et professionnels. Échelonné en 4 tranches sur KTFA FLEX.'
            },
            'ktfa-09': {
              title: 'Apple iPad Air M2 11" 128GB Wi-Fi',
              price: '490 000 FCFA (4x 122 500 F)',
              img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
              desc: 'Puissance M2 et écran Liquid Retina pour études et travail. Échelonné en 4 tranches sans caution.'
            },
            'ktfa-10': {
              title: 'Climatiseur Inverter Gree 1.5 CV Basse Conso',
              price: '320 000 FCFA (4x 80 000 F)',
              img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
              desc: 'Fraîcheur instantanée et économie d\'énergie jusqu\'à 60%. Échelonné en 4 tranches sans caution.'
            },
            'ktfa-11': {
              title: 'Pack Salon Luxe Canapé Cuir 6 Places & Table',
              price: '850 000 FCFA (4x 212 500 F)',
              img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
              desc: 'Prestige et confort haut de gamme pour votre salon. Échelonné en 4 tranches sans caution.'
            },
            'ktfa-12': {
              title: 'Station Énergie Solaire Portative 2000W + Panneau',
              price: '750 000 FCFA (4x 187 500 F)',
              img: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
              desc: 'Énergie solaire autonome 220V partout avec vous. Échelonné en 4 tranches sans caution sur KTFA FLEX.'
            }
          };

          if (targetProdSlug && KTFA_DEFAULT_MAP[targetProdSlug]) {
            const defItem = KTFA_DEFAULT_MAP[targetProdSlug];
            specificItemTitle = defItem.title;
            specificItemDesc = `${defItem.price} — ${defItem.desc}`;
            specificItemImg = defItem.img;
          }

          // 2. Recherche dans tenantSettings.custom_posters (produits ajoutés via l'admin)
          if (!specificItemTitle && activeTenant) {
            try {
              let tSettings = {};
              if (activeTenant.settings_json) tSettings = JSON.parse(activeTenant.settings_json);
              if (Array.isArray(tSettings.custom_posters)) {
                const foundItem = tSettings.custom_posters.find(p => String(p.id) === String(targetPosterSlug) || p.slug === targetPosterSlug);
                if (foundItem) {
                  specificItemTitle = foundItem.title;
                  const priceStr = foundItem.price_fcfa ? `${Number(foundItem.price_fcfa).toLocaleString('fr-FR')} FCFA` : '';
                  specificItemDesc = foundItem.description
                    ? `${priceStr ? `${priceStr} — ` : ''}${foundItem.description}`
                    : `${priceStr ? `${priceStr} — ` : ''}Disponible en paiement échelonné 4x sans caution sur KTFA FLEX Cameroun 🇨🇲.`;
                  specificItemImg = foundItem.image_url || foundItem.thumbnail_url || (Array.isArray(foundItem.images) ? foundItem.images[0] : '');
                }
              }
            } catch (tErr) {}
          }

          // 3. Recherche dans la base de données D1 (posters ou vidéos personnalisées)
          if (!specificItemTitle && env.DB) {
            try {
              if (targetVideoSlug) {
                const vidRes = await env.DB.prepare(
                  'SELECT title, description, price_fcfa, price_eur, thumbnail_url, preview_url, video_url FROM videos WHERE slug = ? OR id = ? LIMIT 1'
                ).bind(targetVideoSlug, targetVideoSlug).first();
                if (vidRes) {
                  specificItemTitle = vidRes.title;
                  const priceStr = vidRes.price_fcfa ? `${Number(vidRes.price_fcfa).toLocaleString('fr-FR')} FCFA` : '';
                  specificItemDesc = vidRes.description
                    ? `${priceStr ? `${priceStr} — ` : ''}${vidRes.description}`
                    : `${priceStr ? `${priceStr} — ` : ''}Découvrez cet article et commandez directement sur WhatsApp.`;
                  specificItemImg = vidRes.thumbnail_url || vidRes.preview_url || vidRes.video_url || '';
                }
              } else if (targetPosterSlug) {
                const postRes = await env.DB.prepare(
                  'SELECT title, description, price_fcfa, price_eur, image_url, thumbnail_url FROM posters WHERE slug = ? OR id = ? LIMIT 1'
                ).bind(targetPosterSlug, targetPosterSlug).first();
                if (postRes) {
                  specificItemTitle = postRes.title;
                  const priceStr = postRes.price_fcfa ? `${Number(postRes.price_fcfa).toLocaleString('fr-FR')} FCFA` : '';
                  specificItemDesc = postRes.description
                    ? `${priceStr ? `${priceStr} — ` : ''}${postRes.description}`
                    : `${priceStr ? `${priceStr} — ` : ''}Découvrez ce produit et commandez directement sur WhatsApp.`;
                  specificItemImg = postRes.image_url || postRes.thumbnail_url || '';
                }
              }
            } catch (err) {
              console.error('Error fetching specific item for OG preview:', err);
            }
          }

          const pageTitle = specificItemTitle
            ? `${specificItemTitle} — ${companyName}`
            : (tagline
                ? `${companyName} — ${tagline}`
                : (heroTitle ? `${companyName} | ${heroTitle}` : `${companyName} | Site Officiel`));

          const ogDesc = specificItemDesc
            ? specificItemDesc
            : (heroDesc ||
               tagline ||
               `Découvrez les produits et prestations de ${companyName}. Commandez facilement sur WhatsApp.`);

          let previewImage = specificItemImg || bannerUrl || logoUrl || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80';
          if (previewImage && previewImage.startsWith('/')) {
            previewImage = `${url.origin}${previewImage}`;
          }
          const faviconHref = logoUrl
            ? (logoUrl.startsWith('/') ? `${url.origin}${logoUrl}` : logoUrl)
            : `${url.origin}/icon-192.png`;

          html = html.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);
          html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${pageTitle.replace(/"/g, '&quot;')}" />`);
          html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${ogDesc.replace(/"/g, '&quot;')}" />`);
          html = html.replace(/<meta\s+property=["']og:site_name["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:site_name" content="${companyName.replace(/"/g, '&quot;')}" />`);
          html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image" content="${previewImage}" />\n    <meta property="og:image:secure_url" content="${previewImage}" />\n    <meta property="og:url" content="${url.href}" />`);
          html = html.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${ogDesc.replace(/"/g, '&quot;')}" />`);
          html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:title" content="${pageTitle.replace(/"/g, '&quot;')}" />`);
          html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:description" content="${ogDesc.replace(/"/g, '&quot;')}" />`);
          html = html.replace(/<meta\s+name=["']twitter:card["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:image" content="${previewImage}" />`);
          html = html.replace(/<meta\s+name=["']apple-mobile-web-app-title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="apple-mobile-web-app-title" content="${companyName.replace(/"/g, '&quot;').slice(0, 25)}" />`);
          html = html.replace(/<link rel="apple-touch-icon" href=".*?" \/>/i, `<link rel="apple-touch-icon" href="${faviconHref}" />`);
          html = html.replace(/<link rel="icon" href=".*?" \/>/i, `<link rel="icon" href="${faviconHref}" />`);

          // INJECTION AUTOMATIQUE DU SDK PUSH & AUDIENCE THE GREATSOFT + ZERO-FLASH SSR PRELOAD
          let initialSettingsPayload = null;
          let initialPostersPayload = null;

          if (activeTenant) {
            let tenantSettings = {};
            if (activeTenant.settings_json) {
              try {
                tenantSettings = JSON.parse(activeTenant.settings_json);
              } catch (e) {}
            }

            if (Array.isArray(tenantSettings.custom_posters) && tenantSettings.custom_posters.length > 0) {
              initialPostersPayload = tenantSettings.custom_posters;
            }

            const defaultPinBySlug = {
              'location-express': 'lexp2026',
              'l': 'lexp2026',
              'ktfa-flex': 'ktfa2026',
              'ktfa': 'ktfa2026',
              'beauty-nails': 'bnails2026',
              'pizzas-feu-de-dieu': 'pizzas2026',
              'les-pizzas-du-feu-de-dieu': 'pizzas2026',
              'burgys-gabon': 'burgys2026',
              'burgys': 'burgys2026',
              'abaia-cosmetique': 'abaia2026',
              'abaia': 'abaia2026'
            };
            const dedicatedPin = activeTenant.admin_key || defaultPinBySlug[activeTenant.slug] || 'client2026';

            delete tenantSettings.admin_code;
            delete tenantSettings.admin_key;

            initialSettingsPayload = {
              company_name: activeTenant.name || companyName,
              whatsapp_number: activeTenant.whatsapp,
              license_status: activeTenant.license_status,
              license_expiry: activeTenant.license_expiry,
              license_plan: activeTenant.license_plan,
              custom_domain: activeTenant.custom_domain || '',
              ...tenantSettings,
              admin_code: dedicatedPin,
              admin_key: dedicatedPin,
              is_tenant: true,
              tenant_slug: activeTenant.slug,
            };

            // Nettoyage strict anti-fuite de Beauty Nails pour tout autre client
            if (activeTenant.slug !== 'beauty-nails') {
              if (initialSettingsPayload.hero_title && (initialSettingsPayload.hero_title.includes('BEAUTY NAILS') || initialSettingsPayload.hero_title.includes('Vidéos & Affiches'))) {
                initialSettingsPayload.hero_title = activeTenant.name;
              }
              if (initialSettingsPayload.hero_subtitle && (initialSettingsPayload.hero_subtitle.includes('BEAUTY NAILS') || initialSettingsPayload.hero_subtitle.includes('prospects'))) {
                initialSettingsPayload.hero_subtitle = activeTenant.catalog_type === 'location_auto_meuble'
                  ? 'Véhicules 4x4, SUV et appartements meublés de grand standing à Libreville. Réservation directe sur WhatsApp.'
                  : `Bienvenue chez ${activeTenant.name}. Découvrez notre catalogue et réservez directement sur WhatsApp.`;
              }
              if (initialSettingsPayload.hero_badge && (initialSettingsPayload.hero_badge.includes('BEAUTY NAILS') || initialSettingsPayload.hero_badge.includes('STUDIO DE CRÉATION'))) {
                initialSettingsPayload.hero_badge = activeTenant.catalog_type === 'location_auto_meuble'
                  ? 'LOCATION DE VÉHICULES & APPARTEMENTS MEUBLÉS'
                  : `BIENVENUE CHEZ ${activeTenant.name.toUpperCase()}`;
              }
              if (initialSettingsPayload.promo_banner_text && initialSettingsPayload.promo_banner_text.includes('pose')) {
                initialSettingsPayload.promo_banner_text = '';
                initialSettingsPayload.promo_banner_active = 'false';
              }
              if (initialSettingsPayload.about_title && initialSettingsPayload.about_title.includes('BEAUTY NAILS')) {
                initialSettingsPayload.about_title = activeTenant.name;
              }
              if (initialSettingsPayload.about_description && initialSettingsPayload.about_description.includes('BEAUTY NAILS')) {
                initialSettingsPayload.about_description = '';
              }
            }
          }

          const currentTenantSlug = activeTenant ? activeTenant.slug : 'master';
          const currentTenantName = activeTenant ? activeTenant.name : companyName;
          const preloadedScript = `
    <!-- ZERO-FLASH PRELOADED STATE (EDGE SSR HYDRATION) -->
    <script id="dmp-preloaded-state">
      window.__INITIAL_TENANT__ = ${JSON.stringify(activeTenant ? activeTenant.slug : '')};
      window.__INITIAL_SETTINGS__ = ${JSON.stringify(initialSettingsPayload)};
      window.__INITIAL_POSTERS__ = ${JSON.stringify(initialPostersPayload)};
    </script>
    <!-- THE GREATSOFT UNIVERSAL AUDIENCE & PUSH NOTIFICATION SDK -->
    <script src="https://the-greatsoft.mynexus.workers.dev/tracker.js" data-app="digital-mark-pro" data-tenant="${currentTenantSlug}" data-tags="${encodeURIComponent(currentTenantName)}" defer></script>
`;
          if (html.includes('</head>')) {
            html = html.replace('</head>', `${preloadedScript}\n</head>`);
          } else {
            html += preloadedScript;
          }

          return new Response(html, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          });
        }
      } catch (e) {
        console.error('HTML inject error:', e);
      }
    }

    // Serve Frontend Static Assets via Cloudflare Workers Assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('DIGITAL MARK PRO Running', { status: 200 });
  },
};
