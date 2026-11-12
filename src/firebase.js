// ==============================================================================
// FIREBASE CONFIGURATION & PUSH NOTIFICATION SYSTEM (KTFA FLEX CAMEROUN 🇨🇲)
// ==============================================================================
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported as isMessagingSupported } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyDDOJSgjx30yjdLDm5HOXqXoQ5kYdWknz4",
  authDomain: "maket-place-4c42a.firebaseapp.com",
  projectId: "maket-place-4c42a",
  storageBucket: "maket-place-4c42a.firebasestorage.app",
  messagingSenderId: "1004444456478",
  appId: "1:1004444456478:web:95d6f8a77ecc886755400f",
  measurementId: "G-PJP8HG88W4"
};

// Singleton Firebase App
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Analytics singleton
export let firebaseAnalytics = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      try {
        firebaseAnalytics = getAnalytics(firebaseApp);
      } catch (e) {
        console.warn("[Firebase Analytics] init warning:", e);
      }
    }
  }).catch(() => {});
}

export const VAPID_KEY = "BFgFLDkcMq3LSw6v16EB9hRxbf5zLW1al8EB4oyX0m40UTbPmVliUgUMJWSpbeplggK-yu-oD6ph7pYmCA_VfUA";

/**
 * Obtenir l'enregistrement Service Worker actif
 */
async function getOrRegisterServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register("/sw.js");
    }
    // Attendre que le service worker soit totalement actif et prêt
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.warn("[SW registration err]:", err);
    return null;
  }
}

/**
 * Demander la permission et enregistrer le Token FCM & Web Push
 */
export async function requestFirebasePushToken() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return {
      success: false,
      error: "Ce navigateur ne prend pas en charge les notifications push web."
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error: "Permission de notification refusée par l'utilisateur."
      };
    }

    const messagingSupported = await isMessagingSupported();
    let token = null;

    if (messagingSupported) {
      try {
        const messaging = getMessaging(firebaseApp);
        const swReg = await getOrRegisterServiceWorker();

        token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg || undefined
        }).catch((err) => {
          console.warn("[FCM getToken fallback warning]:", err);
          return null;
        });

        // Écouter les messages reçus en premier plan (Foreground)
        onMessage(messaging, (payload) => {
          console.log("[FCM Foreground Message]:", payload);
          if (typeof window !== "undefined" && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent("ktfa-firebase-notification", { detail: payload }));
          }
        });
      } catch (fcmErr) {
        console.warn("[FCM init warn]:", fcmErr);
      }
    }

    const finalToken = token || `web-push-fcm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 1. Sauvegarde locale dans le navigateur
    const subRecord = {
      timestamp: new Date().toISOString(),
      permission: "granted",
      token: finalToken,
      platform: navigator.userAgent
    };
    try {
      localStorage.setItem("ktfa_push_subscription", JSON.stringify(subRecord));
    } catch (e) {}

    // 2. Synchronisation en arrière-plan avec la base de données D1 Cloudflare
    fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: finalToken,
        tenant: "ktfa",
        platform: navigator.userAgent
      })
    }).catch((apiErr) => {
      console.warn("[Push API Sync notice]:", apiErr);
    });

    return {
      success: true,
      permission: "granted",
      token: finalToken
    };
  } catch (error) {
    console.error("[FCM Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie une notification push locale immédiate sur le terminal
 * Compatible Mobile Android (Tiroir de notifications natif & Écran de verrouillage) & Desktop
 */
export async function sendLocalTestNotification(
  title = "🔥 Nouvel Arrivage KTFA FLEX",
  body = "Disponible dès maintenant en paiement échelonné 4x sans caution à Douala et Yaoundé !",
  targetUrl = "/?t=ktfa",
  imageUrl = "/icon-192.png"
) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    const res = await requestFirebasePushToken();
    if (!res.success) return false;
  }

  try {
    // Méthode prioritaire : ServiceWorkerRegistration (Compatible Mobile Android PWA)
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          image: imageUrl || undefined,
          vibrate: [200, 100, 200, 100, 200],
          tag: "ktfa-offer-" + Date.now(),
          renotify: true,
          requireInteraction: true,
          data: { url: targetUrl },
          actions: [
            { action: "explore", title: "Explorer" }
          ]
        });
        return true;
      }
    }

    // Repli : Constructeur classique pour navigateurs desktop
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png"
    });
    return true;
  } catch (err) {
    console.warn("[sendLocalTestNotification err]:", err);
    return false;
  }
}

/**
 * Récupère l'abonnement push existant en localStorage
 */
export function getPushSubscriptionRecord() {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("ktfa_push_subscription");
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}
