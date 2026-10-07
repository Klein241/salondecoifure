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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes (/api/*)
    if (url.pathname.startsWith('/api/')) {
      try {
        // --- 1. VIDEOS ENDPOINTS ---
        if (url.pathname === '/api/videos' && request.method === 'GET') {
          if (!env.DB) return errorResponse('D1 database not bound', 503);
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
          const result = await env.DB.prepare('SELECT * FROM posters ORDER BY created_at DESC').all();
          const posters = (result.results || []).map((p) => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features,
          }));
          return jsonResponse({ success: true, count: posters.length, data: posters });
        }

        if (url.pathname === '/api/posters' && request.method === 'POST') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const body = await request.json();
          const id = body.id || `post-${Date.now()}`;
          const featuresStr = JSON.stringify(body.features || []);

          await env.DB.prepare(
            `INSERT OR REPLACE INTO posters (
              id, title, category, format, dimensions, image_url,
              price_fcfa, price_eur, badge, description, features
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            id,
            body.title || 'Nouvelle Affiche',
            body.category || 'Affiche Événementielle',
            body.format || 'A3/A2 Print',
            body.dimensions || '1080x1080',
            body.image_url || '',
            Number(body.price_fcfa) || 15000,
            Number(body.price_eur) || 25,
            body.badge || '',
            body.description || '',
            featuresStr
          ).run();

          return jsonResponse({ success: true, message: 'Affiche enregistrée', id }, 201);
        }

        if (url.pathname.startsWith('/api/posters/') && request.method === 'DELETE') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const id = url.pathname.replace('/api/posters/', '');
          await env.DB.prepare('DELETE FROM posters WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true, message: 'Affiche supprimée' });
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
          return jsonResponse({ success: true, data: settings });
        }

        if (url.pathname === '/api/settings' && request.method === 'POST') {
          if (!env.DB) return errorResponse('D1 not bound', 503);
          const body = await request.json();
          for (const [key, value] of Object.entries(body)) {
            await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
              .bind(key, String(value))
              .run();
          }
          return jsonResponse({ success: true, message: 'Paramètres enregistrés' });
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

        // --- 6. SERVE MEDIA FROM R2 ---
        if (url.pathname.startsWith('/api/media/') && request.method === 'GET') {
          if (!env.R2_STORAGE) return errorResponse('R2 non disponible', 503);
          const key = url.pathname.replace('/api/media/', '');
          const object = await env.R2_STORAGE.get(key);
          if (!object) return errorResponse('Fichier introuvable', 404);

          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set('etag', object.httpEtag);
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');

          return new Response(object.body, { headers });
        }

        return errorResponse('Route API non trouvée', 404);
      } catch (err) {
        console.error('API Error:', err);
        return errorResponse(err.message || 'Erreur interne du serveur', 500);
      }
    }

    // Serve Frontend Static Assets via Cloudflare Workers Assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('DIGITAL MARK PRO Running', { status: 200 });
  },
};
