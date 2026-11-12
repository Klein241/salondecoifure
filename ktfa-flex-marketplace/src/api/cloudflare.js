// ==============================================================================
// KTFA FLEX MARKETPLACE — CLIENT API CLOUDFLARE D1
// ==============================================================================

const LOCAL_STORAGE_KEY_SETTINGS = 'ktfa_settings';
const LOCAL_STORAGE_KEY_POSTERS = 'ktfa_posters';

export function getScopedStorageKey(baseKey) {
  return `ktfa_${baseKey}`;
}

// 1. POSTERS / CATALOGUE D1 API
export async function fetchPosters(forceRefresh = false) {
  // 1. Interroger la base Cloudflare D1 en direct
  try {
    const res = await fetch('/api/posters', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_POSTERS, JSON.stringify(data.data));
          if (typeof window !== 'undefined') {
            window.__INITIAL_POSTERS__ = data.data;
          }
        } catch (e) {}
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[D1 fetchPosters notice]:', err);
  }

  // 2. Fallback SSR injecté si disponible
  if (
    typeof window !== 'undefined' &&
    Array.isArray(window.__INITIAL_POSTERS__) &&
    window.__INITIAL_POSTERS__.length > 0
  ) {
    return window.__INITIAL_POSTERS__;
  }

  // 3. Fallback LocalStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_POSTERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return [];
}

export async function savePoster(posterData) {
  try {
    const res = await fetch('/api/posters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(posterData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('savePoster error:', err);
  }
  return { success: false };
}

export async function deletePoster(posterId) {
  try {
    const res = await fetch(`/api/posters/${encodeURIComponent(posterId)}`, {
      method: 'DELETE',
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('deletePoster error:', err);
  }
  return { success: false };
}

export async function uploadMedia(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('uploadMedia error:', err);
  }
  return { success: false, error: 'Échec de l\'envoi du fichier' };
}

// 2. SETTINGS API
export async function fetchSettings() {
  try {
    const res = await fetch('/api/settings', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(data.data));
          if (typeof window !== 'undefined') {
            window.__INITIAL_SETTINGS__ = data.data;
          }
        } catch (e) {}
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[D1 fetchSettings notice]:', err);
  }

  // Fallback SSR injecté
  if (typeof window !== 'undefined' && window.__INITIAL_SETTINGS__) {
    return window.__INITIAL_SETTINGS__;
  }

  // Fallback LocalStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return {};
}

export async function saveSettings(newSettings) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
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

// 3. ANALYTICS & TRAFIC REEL
export async function trackPageView() {
  try {
    let visitorId = localStorage.getItem('ktfa_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('ktfa_visitor_id', visitorId);
    }

    let sessionId = sessionStorage.getItem('ktfa_session_id');
    const isNewSession = !sessionId;
    if (isNewSession) {
      sessionId = 's_' + Math.random().toString(36).substring(2, 12);
      sessionStorage.setItem('ktfa_session_id', sessionId);
    }

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: visitorId,
        session_id: sessionId,
        page_path: window.location.pathname,
        referrer: document.referrer || '',
        user_agent: navigator.userAgent,
        is_unique_visit: isNewSession ? 1 : 0,
      }),
    });
  } catch (e) {}
}

export async function fetchTrafficStats() {
  try {
    const res = await fetch('/api/analytics/stats');
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (e) {}
  return null;
}

// 4. MEMBRES API
export async function fetchMembers() {
  try {
    const res = await fetch('/api/members');
    if (res.ok) {
      const data = await res.json();
      return data.data || [];
    }
  } catch (e) {}
  return [];
}
