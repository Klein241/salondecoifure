/**
 * ==============================================================================
 * KTFA FLEX MARKETPLACE — BACKEND CLOUDFLARE WORKER DÉDIÉ (D1 + R2 + SPA ASSETS)
 * ==============================================================================
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 1. Service Worker & FCM Push Service Worker
    if ((url.pathname === '/sw.js' || url.pathname === '/firebase-messaging-sw.js') && request.method === 'GET') {
      const swCode = `/** KTFA FLEX Universal Push Service Worker */
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

try {
  firebase.initializeApp({
    apiKey: "AIzaSyDummyKeyForFCMWorkerInitializationOnly",
    projectId: "thegreatsoft-fcm",
    messagingSenderId: "1054362148492",
    appId: "1:1054362148492:web:c61fa25deaa424bbd18f4a"
  });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(function(payload) {
    var title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || 'KTFA FLEX 💎';
    var body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || 'Nouvel arrivage disponible !';
    var icon = (payload.notification && payload.notification.icon) || '/icon-192.png';
    return self.registration.showNotification(title, {
      body: body,
      icon: icon,
      badge: '/icon-192.png',
      data: { url: '/' },
      vibrate: [200, 100, 200, 100, 200]
    });
  });
} catch(e) {}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if ('focus' in client) { return client.focus(); }
    }
    if (clients.openWindow) { return clients.openWindow('/'); }
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

    // 2. API Routes (/api/*)
    if (url.pathname.startsWith('/api/')) {
      try {
        // --- 0. MEDIA STREAMING & UPLOAD VIA CLOUDFLARE R2 ---
        if (url.pathname.startsWith('/api/media/') && (request.method === 'GET' || request.method === 'HEAD')) {
          if (!env.R2_STORAGE) return new Response('R2 non disponible', { status: 503 });
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

          if (!object) return new Response('Fichier introuvable', { status: 404 });

          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set('etag', object.httpEtag);
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          headers.set('Access-Control-Allow-Origin', '*');

          if (rangeHeader && object.range) {
            headers.set('Content-Range', `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`);
            return new Response(object.body, { status: 206, headers });
          }

          return new Response(object.body, { headers });
        }

        if (url.pathname === '/api/upload' && request.method === 'POST') {
          if (!env.R2_STORAGE) {
            return jsonResponse({ success: false, error: 'Stockage R2 non configuré' }, 503);
          }
          const formData = await request.formData();
          const file = formData.get('file');
          if (!file) {
            return jsonResponse({ success: false, error: 'Aucun fichier fourni' }, 400);
          }

          const originalName = file.name || 'upload';
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

        // --- A. CATALOGUE / POSTERS ---
        if (url.pathname === '/api/posters' && request.method === 'GET') {
          if (env.DB) {
            const result = await env.DB.prepare(
              'SELECT * FROM posters ORDER BY popular DESC, price_fcfa DESC'
            ).all();
            if (result && result.results && result.results.length > 0) {
              const formatted = result.results.map(item => {
                let parsedFeatures = [];
                try {
                  parsedFeatures = typeof item.features === 'string' ? JSON.parse(item.features) : item.features;
                } catch(e) {
                  parsedFeatures = [item.features];
                }
                let parsedImages = [];
                try {
                  parsedImages = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
                } catch(e) {
                  parsedImages = [item.image_url];
                }
                return {
                  ...item,
                  features: parsedFeatures,
                  images: Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages : [item.image_url],
                  popular: Boolean(item.popular)
                };
              });
              return jsonResponse({ success: true, count: formatted.length, data: formatted });
            }
          }
          return jsonResponse({ success: true, count: 0, data: [] });
        }

        if (url.pathname === '/api/posters' && request.method === 'POST') {
          const body = await request.json();
          if (env.DB && body.id && body.title) {
            await env.DB.prepare(
              `INSERT OR REPLACE INTO posters (
                id, title, category, format, dimensions, price_fcfa, price_eur,
                installment_months, monthly_fcfa, rating, reviews_count, badge, badge_color,
                image_url, images, description, features, popular
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
              body.id,
              body.title,
              body.category || 'Général',
              body.format || 'Standard',
              body.dimensions || '',
              body.price_fcfa || 0,
              body.price_eur || 0,
              body.installment_months || 4,
              body.monthly_fcfa || Math.round((body.price_fcfa || 0) / 4),
              body.rating || 5.0,
              body.reviews_count || 0,
              body.badge || '',
              body.badge_color || '',
              body.image_url || '',
              JSON.stringify(body.images || [body.image_url || '']),
              body.description || '',
              JSON.stringify(body.features || []),
              body.popular ? 1 : 0
            ).run();
            return jsonResponse({ success: true, message: 'Produit enregistré' });
          }
          return jsonResponse({ success: false, error: 'Données produit invalides' }, 400);
        }

        if (url.pathname.startsWith('/api/posters/') && request.method === 'DELETE') {
          const posterId = decodeURIComponent(url.pathname.replace('/api/posters/', ''));
          if (env.DB && posterId) {
            await env.DB.prepare('DELETE FROM posters WHERE id = ?').bind(posterId).run();
            return jsonResponse({ success: true, message: 'Produit supprimé' });
          }
          return jsonResponse({ success: false, error: 'ID de produit invalide' }, 400);
        }

        // --- B. SETTINGS ---
        if (url.pathname === '/api/settings' && request.method === 'GET') {
          const settingsObj = {};
          if (env.DB) {
            const rows = await env.DB.prepare('SELECT key, value FROM settings').all();
            if (rows && rows.results) {
              for (const r of rows.results) {
                settingsObj[r.key] = r.value;
              }
            }
          }
          return jsonResponse({ success: true, data: settingsObj });
        }

        if (url.pathname === '/api/settings' && request.method === 'POST') {
          const body = await request.json();
          if (env.DB && body && typeof body === 'object') {
            for (const [key, value] of Object.entries(body)) {
              if (value !== undefined && value !== null) {
                const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
                await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
                  .bind(key, strVal)
                  .run();
              }
            }
            return jsonResponse({ success: true, message: 'Paramètres enregistrés' });
          }
          return jsonResponse({ success: false, error: 'Données invalides' }, 400);
        }

        // --- C. MEMBRES ---
        if (url.pathname === '/api/members' && request.method === 'POST') {
          const m = await request.json();
          if (env.DB && m.full_name && m.whatsapp_number) {
            const id = 'mem_' + Date.now().toString(36);
            await env.DB.prepare(
              `INSERT OR REPLACE INTO members (
                id, full_name, whatsapp_number, email, city, profession, monthly_budget, identity_doc_url, referral_code
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
              id,
              m.full_name,
              m.whatsapp_number,
              m.email || '',
              m.city || 'Douala',
              m.profession || '',
              m.monthly_budget || '',
              m.identity_doc_url || '',
              m.referral_code || ''
            ).run();
            return jsonResponse({ success: true, member_id: id, message: 'Adhésion validée' });
          }
          return jsonResponse({ success: false, error: 'Nom et WhatsApp requis' }, 400);
        }

        if (url.pathname === '/api/members' && request.method === 'GET') {
          if (env.DB) {
            const rows = await env.DB.prepare('SELECT * FROM members ORDER BY created_at DESC LIMIT 100').all();
            return jsonResponse({ success: true, count: rows.results?.length || 0, data: rows.results || [] });
          }
          return jsonResponse({ success: true, count: 0, data: [] });
        }

        // --- D. ANALYTICS ---
        if (url.pathname === '/api/analytics/track' && request.method === 'POST') {
          if (env.DB) {
            const b = await request.json();
            const country = request.cf?.country || 'Cameroun';
            const city = request.cf?.city || 'Douala';
            await env.DB.prepare(
              `INSERT INTO site_traffic_logs (visitor_id, session_id, page_path, referrer, user_agent, country, city, is_unique_visit)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
              b.visitor_id || 'anonymous',
              b.session_id || 'session',
              b.page_path || '/',
              b.referrer || '',
              b.user_agent || '',
              country,
              city,
              b.is_unique_visit ? 1 : 0
            ).run().catch(() => {});

            await env.DB.prepare(
              `INSERT INTO site_traffic_stats (metric, count, updated_at) VALUES ('total_views', 1, CURRENT_TIMESTAMP)
               ON CONFLICT(metric) DO UPDATE SET count = count + 1, updated_at = CURRENT_TIMESTAMP`
            ).run().catch(() => {});

            if (b.is_unique_visit) {
              await env.DB.prepare(
                `INSERT INTO site_traffic_stats (metric, count, updated_at) VALUES ('total_visits', 1, CURRENT_TIMESTAMP)
                 ON CONFLICT(metric) DO UPDATE SET count = count + 1, updated_at = CURRENT_TIMESTAMP`
              ).run().catch(() => {});
            }
          }
          return jsonResponse({ success: true });
        }

        if (url.pathname === '/api/analytics/stats' && request.method === 'GET') {
          let stats = { total_views: 0, total_visits: 0 };
          if (env.DB) {
            const rows = await env.DB.prepare('SELECT metric, count FROM site_traffic_stats').all();
            if (rows && rows.results) {
              for (const r of rows.results) {
                stats[r.metric] = r.count;
              }
            }
          }
          return jsonResponse({ success: true, data: stats });
        }

        return jsonResponse({ success: false, error: 'Route introuvable' }, 404);
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }

    // 3. Static Assets & Zero-Flash Edge SSR Hydration
    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      const isHtml =
        url.pathname === '/' ||
        url.pathname === '/index.html' ||
        (!url.pathname.includes('.') && !url.pathname.startsWith('/api/'));

      if (isHtml && assetResponse.status === 200) {
        let html = await assetResponse.text();

        // Récupération des données pour hydratation instantanée
        let initialSettings = { company_name: 'KTFA FLEX' };
        let initialPosters = [];
        if (env.DB) {
          try {
            const [sRows, pRows] = await Promise.all([
              env.DB.prepare('SELECT key, value FROM settings').all(),
              env.DB.prepare('SELECT * FROM posters ORDER BY popular DESC, price_fcfa DESC').all()
            ]);
            if (sRows && sRows.results) {
              for (const r of sRows.results) initialSettings[r.key] = r.value;
            }
            if (pRows && pRows.results) {
              initialPosters = pRows.results.map(p => ({
                ...p,
                features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
                images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || [p.image_url]),
                popular: Boolean(p.popular)
              }));
            }
          } catch(e) {}
        }

        const preloadedScript = `
    <!-- KTFA ZERO-FLASH SSR HYDRATION -->
    <script id="ktfa-preloaded-state">
      window.__INITIAL_SETTINGS__ = ${JSON.stringify(initialSettings)};
      window.__INITIAL_POSTERS__ = ${JSON.stringify(initialPosters)};
    </script>
`;
        if (html.includes('</head>')) {
          html = html.replace('</head>', `${preloadedScript}\n</head>`);
        } else {
          html += preloadedScript;
        }

        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
          },
        });
      }

      return assetResponse;
    }

    return new Response('KTFA FLEX Edge Gateway Active', { status: 200 });
  },
};
