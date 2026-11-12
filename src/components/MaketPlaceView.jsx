import React, { useState, useMemo, useEffect, useRef } from 'react';
import { requestFirebasePushToken, sendLocalTestNotification } from '../firebase';
import { fetchPosters } from '../api/cloudflare';

// IMPORTATION DES SOUS-COMPOSANTS MODULAIRES DE LA MARKETPLACE
import {
  DEFAULT_KTFA_ITEMS,
  INITIAL_DEMO_ORDERS,
  COUNTRY_CONFIGS,
  CAMEROON_CITIES
} from './marketplace/marketplaceConstants';
import { playAlibabaChime } from './marketplace/marketplaceAudio';
import { printOfficialReceipt } from './marketplace/receiptPrinter';

import MarketplaceHeader from './marketplace/MarketplaceHeader';
import ProductCard from './marketplace/ProductCard';
import ProductDetailModal from './marketplace/ProductDetailModal';
import CheckoutModal from './marketplace/CheckoutModal';
import CartDrawerModal from './marketplace/CartDrawerModal';
import OrderReceiptModal from './marketplace/OrderReceiptModal';
import MemberRegisterModal from './marketplace/MemberRegisterModal';
import MemberProfileModal from './marketplace/MemberProfileModal';
import SellerChatModal from './marketplace/SellerChatModal';
import NotificationCenterModal from './marketplace/NotificationCenterModal';
import LiveEventToast from './marketplace/LiveEventToast';
import ExitIntentModal from './marketplace/ExitIntentModal';
import PwaInstallPrompt from './marketplace/PwaInstallPrompt';
import MarketplaceDockBar from './marketplace/MarketplaceDockBar';

export default function MaketPlaceView({
  settings = {},
  posters = [],
  currency = 'XAF',
  whatsappNumber = '237694473414',
  onNavigateAdmin = null
}) {
  // ----------------------------------------------------
  // GESTION DU THÈME CLAIR / SOMBRE (CLAIRMORPHISME LUXE)
  // ----------------------------------------------------
  const [isLight, setIsLight] = useState(() => {
    try {
      const saved = localStorage.getItem('ktfa_theme_mode');
      if (saved) return saved === 'light';
    } catch (e) {}
    return true; // Mode Clairmorphisme par défaut
  });

  const toggleTheme = () => {
    setIsLight(prev => {
      const next = !prev;
      try { localStorage.setItem('ktfa_theme_mode', next ? 'light' : 'dark'); } catch (e) {}
      return next;
    });
  };

  // ----------------------------------------------------
  // GESTION PAYS & DEVISE
  // ----------------------------------------------------
  const [selectedUserCountry, setSelectedUserCountry] = useState(() => {
    try {
      return localStorage.getItem('ktfa_user_country') || 'cameroun';
    } catch (e) {
      return 'cameroun';
    }
  });

  const countryConfig = useMemo(() => {
    return COUNTRY_CONFIGS[selectedUserCountry] || COUNTRY_CONFIGS.cameroun;
  }, [selectedUserCountry]);

  const officialWhatsapp = useMemo(() => {
    return countryConfig.whatsappSupport || whatsappNumber || '237694473414';
  }, [countryConfig, whatsappNumber]);

  // ----------------------------------------------------
  // CATALOGUE DE PRODUITS
  // ----------------------------------------------------
  const [catalogItems, setCatalogItems] = useState(() => {
    if (Array.isArray(posters) && posters.length > 0) return posters;
    if (Array.isArray(settings?.custom_posters) && settings.custom_posters.length > 0) return settings.custom_posters;
    return DEFAULT_KTFA_ITEMS;
  });

  useEffect(() => {
    if (Array.isArray(posters) && posters.length > 0) {
      setCatalogItems(posters);
    }
  }, [posters]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productMediaTab, setProductMediaTab] = useState('video');

  // OUVERTURE AUTOMATIQUE DU PRODUIT VIA LIEN DIRECT DE PARTAGE (?prod=...)
  useEffect(() => {
    if (typeof window === 'undefined' || !catalogItems || catalogItems.length === 0) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const prodId = urlParams.get('prod');
      if (prodId) {
        const found = catalogItems.find(p => String(p.id) === String(prodId));
        if (found) {
          setSelectedProduct(found);
        }
      }
    } catch (e) {}
  }, [catalogItems]);

  const categories = useMemo(() => {
    const set = new Set();
    catalogItems.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [catalogItems]);

  const filteredItems = useMemo(() => {
    return catalogItems.filter(p => {
      if (!p) return false;
      const titleStr = String(p.title || '');
      const descStr = String(p.description || '');
      const catStr = String(p.category || '');
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        descStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catStr.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [catalogItems, selectedCategory, searchQuery]);

  // NOTE: setNotificationStatus est déclaré plus bas — le useEffect auto-push
  // est déplacé après la déclaration de notificationStatus (voir section NOTIFICATIONS)

  // ----------------------------------------------------
  // DIAPORAMA HERO (2 SECONDES SUR MOBILE)
  // ----------------------------------------------------
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (!catalogItems || catalogItems.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % catalogItems.length);
    }, 2000);
    return () => clearInterval(slideInterval);
  }, [catalogItems]);

  // ----------------------------------------------------
  // COMPTE À REBOURS VENTE FLASH ALIBABA STYLE
  // ----------------------------------------------------
  const [flashSecondsLeft, setFlashSecondsLeft] = useState(3 * 3600 + 42 * 60 + 18);

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSecondsLeft(prev => (prev > 1 ? prev - 1 : 4 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatFlashTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ----------------------------------------------------
  // NOTIFICATIONS, TOAST TEMPS RÉEL & SNOOZE 10 MIN
  // ----------------------------------------------------
  const [activeLiveEvent, setActiveLiveEvent] = useState(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  // Synchronisation automatique silencieuse du token Push si déjà autorisé
  // (placé ICI, APRÈS la déclaration de notificationStatus — règle React des Hooks)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setNotificationStatus('granted');
      requestFirebasePushToken().catch(() => {});
    }
  }, []);

  const checkLiveToastSnoozed = () => {
    try {
      const snoozedUntil = localStorage.getItem('ktfa_live_toast_snoozed_until');
      if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) {
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleCloseLiveToast = () => {
    setActiveLiveEvent(null);
    try {
      // Pause de 10 minutes après fermeture manuelle
      localStorage.setItem('ktfa_live_toast_snoozed_until', (Date.now() + 10 * 60 * 1000).toString());
    } catch (e) {}
  };

  // ----------------------------------------------------
  // GESTION DES NOTIFICATIONS PUSH RÉELLES POUR NOUVEAUX PRODUITS
  // ----------------------------------------------------
  useEffect(() => {
    if (!catalogItems || catalogItems.length === 0) return;

    // Le produit le plus récent uploadé
    const newestProduct = catalogItems[0];
    if (!newestProduct || !newestProduct.id) return;

    const lastNotified = localStorage.getItem('ktfa_last_notified_prod_id');

    // Si un nouveau produit a été uploadé depuis la dernière visite
    if (lastNotified && String(lastNotified) !== String(newestProduct.id)) {
      setActiveLiveEvent({
        id: `event-${newestProduct.id}`,
        type: 'deal',
        badge: '🔥 NOUVEL ARRIVAGE',
        title: `🔥 Nouvel Arrivage : ${newestProduct.title}`,
        message: `${newestProduct.price_fcfa ? `${Number(newestProduct.price_fcfa).toLocaleString()} FCFA — ` : ''}Disponible dès maintenant en 4x sans caution !`,
        teaser: 'Stock disponible en boutique à Douala et Yaoundé.',
        priceMonthly: `${newestProduct.monthly_fcfa ? `${Number(newestProduct.monthly_fcfa).toLocaleString()} F / tranche` : 'Échelonné en 4x'}`,
        image: newestProduct.image_url || '/icon-192.png',
        time: "À l'instant",
        productId: newestProduct.id
      });

      if (soundEnabled) {
        playAlibabaChime(soundEnabled);
      }

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            if (reg && reg.showNotification) {
              reg.showNotification(`🔥 Nouvel Arrivage : ${newestProduct.title}`, {
                body: `${newestProduct.price_fcfa ? `${Number(newestProduct.price_fcfa).toLocaleString()} FCFA — ` : ''}Disponible en paiement échelonné 4x sans caution à Douala et Yaoundé !`,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                image: newestProduct.image_url || undefined,
                vibrate: [200, 100, 200, 100, 200],
                tag: `ktfa-new-${newestProduct.id}`,
                renotify: true,
                requireInteraction: true,
                data: { url: `/?t=ktfa&prod=${newestProduct.id}` },
                actions: [{ action: 'explore', title: 'Voir le produit' }]
              });
            }
          }).catch(() => {});
        }
      }
    }

    localStorage.setItem('ktfa_last_notified_prod_id', String(newestProduct.id));

    // Vérification des annonces push du serveur
    const checkServerPush = async () => {
      try {
        const res = await fetch('/api/push/latest?tenant=ktfa');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.latest && json.latest.id) {
            const lastServerPush = localStorage.getItem('ktfa_last_server_push_id');
            if (lastServerPush !== json.latest.id) {
              localStorage.setItem('ktfa_last_server_push_id', json.latest.id);

              setActiveLiveEvent({
                id: json.latest.id,
                type: 'deal',
                badge: '📢 ANNONCE OFFICIELLE',
                title: json.latest.title,
                message: json.latest.message,
                teaser: 'Disponible chez KTFA FLEX.',
                priceMonthly: 'Paiement en 4 tranches',
                image: json.latest.image || '/icon-192.png',
                time: "À l'instant",
                productId: json.latest.productId
              });

              if (soundEnabled) playAlibabaChime(soundEnabled);

              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then((reg) => {
                    if (reg && reg.showNotification) {
                      reg.showNotification(json.latest.title, {
                        body: json.latest.message,
                        icon: '/icon-192.png',
                        badge: '/icon-192.png',
                        image: json.latest.image || undefined,
                        vibrate: [200, 100, 200, 100, 200],
                        tag: json.latest.id,
                        renotify: true,
                        requireInteraction: true,
                        data: { url: json.latest.productId ? `/?t=ktfa&prod=${json.latest.productId}` : '/?t=ktfa' },
                        actions: [{ action: 'explore', title: 'Voir les détails' }]
                      });
                    }
                  }).catch(() => {});
                }
              }
            }
          }
        }
      } catch (e) {}
    };

    const interval = setInterval(checkServerPush, 30000);
    return () => clearInterval(interval);
  }, [catalogItems, soundEnabled]);

  const handleEnableNotifications = async () => {
    try {
      const res = await requestFirebasePushToken();
      if (res.success && res.permission === 'granted') {
        setNotificationStatus('granted');
        playAlibabaChime(soundEnabled);
        const newest = catalogItems && catalogItems[0];
        const title = newest ? `🔥 Nouvel Arrivage : ${newest.title}` : '🔥 Bienvenue sur KTFA FLEX';
        const body = newest
          ? `${newest.price_fcfa ? `${Number(newest.price_fcfa).toLocaleString()} FCFA — ` : ''}Disponible en 4 tranches sans caution à Douala et Yaoundé !`
          : 'Découvrez nos facilités de paiement échelonné sans frais.';
        const targetUrl = newest ? `/?t=ktfa&prod=${newest.id}` : '/?t=ktfa';
        const imageUrl = newest?.image_url || '/icon-192.png';

        await sendLocalTestNotification(title, body, targetUrl, imageUrl);
      } else if (res.error) {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied') {
          setNotificationStatus('denied');
        }
      }
    } catch (err) {
      console.warn('[Enable push err]:', err);
    }
  };

  const handleTestPushNotification = async () => {
    playAlibabaChime(soundEnabled);
    const newest = catalogItems && catalogItems[0];
    const title = newest ? `🔥 Nouvel Arrivage : ${newest.title}` : '🔥 Vente Flash KTFA FLEX';
    const body = newest
      ? `${newest.price_fcfa ? `${Number(newest.price_fcfa).toLocaleString()} FCFA — ` : ''}Disponible en paiement échelonné 4x sans caution !`
      : 'Arrivage débloqué sans caution ! 4 tranches actives.';
    const targetUrl = newest ? `/?t=ktfa&prod=${newest.id}` : '/?t=ktfa';
    const imageUrl = newest?.image_url || '/icon-192.png';

    const ok = await sendLocalTestNotification(title, body, targetUrl, imageUrl);
    return ok;
  };

  // ----------------------------------------------------
  // GESTION DU PANIER
  // ----------------------------------------------------
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ktfa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('ktfa_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    playAlibabaChime(soundEnabled);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // ----------------------------------------------------
  // GESTION CHECKOUT & COMMANDE ÉCHELONNÉE
  // ----------------------------------------------------
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutPlanTranches, setCheckoutPlanTranches] = useState(4);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('orange_money');
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    city: CAMEROON_CITIES[0] || 'Douala',
    address: '',
    idCardNumber: '',
    profession: ''
  });

  const handleStartCheckout = (product, tranches = 4) => {
    setCheckoutProduct(product);
    setCheckoutPlanTranches(tranches);
    setCheckoutStep(1);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ktfa_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // ----------------------------------------------------
  // REÇUS OFFICIELS & COMMANDES
  // ----------------------------------------------------
  const [orders, setOrders] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ktfa_user_profile');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const userSpecificKey = `ktfa_orders_${(u.phone || u.id || '').replace(/\s+/g, '')}`;
        const savedUserOrders = localStorage.getItem(userSpecificKey);
        if (savedUserOrders) {
          const parsed = JSON.parse(savedUserOrders);
          if (Array.isArray(parsed)) return parsed;
        }
        // Pour tout compte inscrit ou connecté : historique vide au départ (pas de commandes fictives)
        return [];
      }
      const saved = localStorage.getItem('ktfa_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null);

  useEffect(() => {
    try {
      if (userProfile && userProfile.phone) {
        const userSpecificKey = `ktfa_orders_${userProfile.phone.replace(/\s+/g, '')}`;
        const savedUserOrders = localStorage.getItem(userSpecificKey);
        if (savedUserOrders) {
          const parsed = JSON.parse(savedUserOrders);
          if (Array.isArray(parsed)) setOrders(parsed);
          else setOrders([]);
        } else {
          setOrders([]);
        }
      }
    } catch (e) {}
  }, [userProfile?.phone]);

  useEffect(() => {
    try {
      localStorage.setItem('ktfa_orders', JSON.stringify(orders));
      if (userProfile && userProfile.phone) {
        const userSpecificKey = `ktfa_orders_${userProfile.phone.replace(/\s+/g, '')}`;
        localStorage.setItem(userSpecificKey, JSON.stringify(orders));
      }
    } catch (e) {}
  }, [orders, userProfile]);

  const ordersDelivered = useMemo(() => orders.filter(o => o.statusCategory === 'delivered'), [orders]);
  const ordersPaidPending = useMemo(() => orders.filter(o => o.statusCategory === 'paid_pending'), [orders]);
  const ordersInProgress = useMemo(() => orders.filter(o => o.statusCategory === 'in_progress'), [orders]);

  const handleConfirmOrder = (orderData) => {
    const productToOrder = (orderData && orderData.product) || checkoutProduct;
    if (!productToOrder) return;

    const tranchesCount = Number(
      (orderData && orderData.tranches) ||
      checkoutPlanTranches ||
      productToOrder.installment_tranches ||
      4
    );

    const isCash = orderData && orderData.plan === 'cash';
    const deliveryFee = Number(orderData?.deliveryFee || 0);
    const orderTotal = Number(orderData?.totalPrice || (productToOrder.price_fcfa + deliveryFee));
    const trancheAmount = isCash ? orderTotal : Math.round(orderTotal / tranchesCount);
    const receiptNum = `KTFA-${countryConfig.id === 'cameroun' ? 'CMR' : 'INT'}-${Math.floor(100000 + Math.random() * 900000)}`;

    const chosenPaymentMethod = (orderData && orderData.paymentMethod) || checkoutPaymentMethod || 'orange_money';
    const paymentMethodLabel = chosenPaymentMethod === 'mtn_momo'
      ? 'MTN Mobile Money'
      : 'Orange Money Cameroun';

    const clientName = (orderData && orderData.form && orderData.form.name) || checkoutForm.name || userProfile?.name || 'Client KTFA';
    const clientPhone = (orderData && orderData.form && orderData.form.phone) || checkoutForm.phone || userProfile?.phone || officialWhatsapp;
    const clientCity = (orderData && orderData.form && orderData.form.city) || checkoutForm.city || userProfile?.city || countryConfig.primaryCity;
    const clientAddress = orderData?.exactDeliveryAddress || (orderData && orderData.form && orderData.form.address) || checkoutForm.address || 'Douala / Yaoundé';

    const newOrder = {
      id: 'ord-' + Date.now(),
      receiptNumber: receiptNum,
      title: productToOrder.title,
      image_url: productToOrder.image_url,
      totalPrice: orderTotal,
      paidAmount: trancheAmount,
      deliveryFee,
      includeDelivery: orderData?.includeDelivery ?? true,
      deliveryAddress: orderData?.exactDeliveryAddress || '',
      pickupNotes: orderData?.selfPickupNotes || '',
      currency: 'FCFA',
      orderDate: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      statusLabel: isCash ? 'Règlement Intégral Encaissé' : `Tranche 1/${tranchesCount} Encaissée`,
      statusCategory: isCash ? 'paid_pending' : 'in_progress',
      planTotalTranches: isCash ? 1 : tranchesCount,
      tranchesPaidCount: 1,
      paymentMethod: paymentMethodLabel,
      client: {
        name: clientName,
        phone: clientPhone,
        city: clientCity,
        address: clientAddress,
        memberId: userProfile?.memberId || `${countryConfig.codePrefix || 'MEM'}-884920`
      }
    };

    setOrders(prev => [newOrder, ...prev]);
    setIsCheckoutOpen(false);
    setSelectedOrderReceipt(newOrder);
    playAlibabaChime(soundEnabled);
  };

  const handlePrintReceipt = (order) => {
    printOfficialReceipt(order, countryConfig);
  };

  // ----------------------------------------------------
  // GESTION PWA & INSTALLATION
  // ----------------------------------------------------
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        const stored = localStorage.getItem('ktfa_pwa_installed') === 'true';
        return isStandalone || stored;
      }
    } catch (e) {}
    return false;
  });

  const [showPwaFloating, setShowPwaFloating] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  const isIosDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isPwaInstalled) {
        setShowPwaFloating(true);
      }
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setShowPwaFloating(false);
      try { localStorage.setItem('ktfa_pwa_installed', 'true'); } catch (e) {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // iOS : pas de beforeinstallprompt — afficher le bouton flottant après 3s si non installé
    let iosTimer = null;
    if (isIosDevice && !isPwaInstalled) {
      iosTimer = setTimeout(() => {
        try {
          const snoozed = localStorage.getItem('ktfa_pwa_ios_snooze');
          if (snoozed && Date.now() < parseInt(snoozed, 10)) return;
        } catch (e) {}
        setShowPwaFloating(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, [isPwaInstalled, isIosDevice]);

  // INSTALLATION PWA : Android via prompt natif / iPhone via téléchargement direct du package Apple .mobileconfig
  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      // ANDROID : prompt natif Chrome/Edge
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setIsPwaInstalled(true);
        setShowPwaFloating(false);
        try { localStorage.setItem('ktfa_pwa_installed', 'true'); } catch (e) {}
      }
      setDeferredPrompt(null);
    } else if (isIosDevice) {
      // IPHONE / IOS : Téléchargement direct du package Apple MobileConfig (WebClip natif sans schéma)
      const tenant = (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('t')) || 'ktfa';
      window.location.href = `/api/install-ios.mobileconfig?t=${encodeURIComponent(tenant)}`;
      setShowPwaFloating(false);
    } else {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
          title: settings?.company_name || 'KTFA FLEX',
          url: window.location.href
        }).catch(() => {});
      } else {
        setIsPwaModalOpen(true);
      }
    }
  };

  // ----------------------------------------------------
  // GESTION DU CHAT VENDEUR ALIBABA STYLE
  // ----------------------------------------------------
  const [isSellerChatOpen, setIsSellerChatOpen] = useState(false);
  const [sellerChatProduct, setSellerChatProduct] = useState(null);
  const [sellerChatMessages, setSellerChatMessages] = useState([]);

  const handleOpenSellerChat = (product) => {
    setSellerChatProduct(product);
    setSelectedProduct(null);
    setIsSellerChatOpen(true);
    playAlibabaChime(soundEnabled);

    if (sellerChatMessages.length === 0) {
      setSellerChatMessages([
        {
          id: 'welcome-1',
          sender: 'seller',
          text: `👋 Bonjour ! Je suis votre conseiller officiel ${settings?.company_name || 'KTFA FLEX'} (${countryConfig.name} ${countryConfig.flag}). Je vois que vous consultez "${product?.title || 'notre catalogue'}". Avez-vous une question sur l'échelonnement en 4x sans caution ou la livraison express ?`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleSendCustomerTextMessage = (text) => {
    if (!text || !text.trim()) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'client',
      text: text.trim(),
      time: now
    };
    setSellerChatMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      let replyText = `✅ Bien noté ! Nos conseillers à ${countryConfig.primaryCity} traitent votre demande en direct. Vous pouvez aussi valider votre contrat directement en 4x sans caution.`;
      if (text.includes('livraison')) {
        replyText = `🚚 Nos délais de livraison sont de 24h à 48h à ${countryConfig.primaryCity} et toutes régions environnantes avec remise en mains propres.`;
      } else if (text.includes('Pièces') || text.includes('échelonné')) {
        replyText = `📋 Dossier 100% simplifié : CNI valide, numéro WhatsApp actif et localisation. 0 garant et 0 caution bancaire exigée !`;
      }

      setSellerChatMessages(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'seller',
          text: replyText,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      playAlibabaChime(soundEnabled);
    }, 900);
  };

  const handleSendProductInChat = (product) => {
    if (!product) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setSellerChatMessages(prev => [
      ...prev,
      {
        id: 'msg-prod-' + Date.now(),
        sender: 'client',
        productCard: product,
        time: now
      }
    ]);
  };

  // ----------------------------------------------------
  // GESTION DU PROFIL ET DE L'ESPACE MEMBRE
  // ----------------------------------------------------
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('register'); // 'login' | 'register' | 'reset'

  const handleOpenClientSpace = () => {
    if (userProfile) {
      setIsProfileModalOpen(true);
    } else {
      setAuthModalMode('login');
      setIsRegisterModalOpen(true);
    }
  };

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setIsRegisterModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalMode('register');
    setIsRegisterModalOpen(true);
  };

  const handleLogout = () => {
    setUserProfile(null);
    try {
      localStorage.removeItem('ktfa_user_profile');
    } catch (e) {}
    setIsProfileModalOpen(false);
  };

  // ----------------------------------------------------
  // POPUP DE RÉTENTION DE SORTIE (EXIT INTENT)
  // ----------------------------------------------------
  const [isExitIntentOpen, setIsExitIntentOpen] = useState(false);
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitIntentTriggered && !userProfile) {
        setIsExitIntentOpen(true);
        setExitIntentTriggered(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitIntentTriggered, userProfile]);

  // ----------------------------------------------------
  // GESTION DES FAVORIS
  // ----------------------------------------------------
  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // ----------------------------------------------------
  // RENDU PRINCIPAL COMPOSÉ DE SOUS-MODULES ISOLÉS
  // ----------------------------------------------------
  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#FFFDF9] text-[#2C221D]' : 'bg-[#0B0E14] text-white'} transition-colors duration-300 pb-28 font-inter selection:bg-amber-400 selection:text-slate-950`}>
      {/* 1. HEADER COMPLET (FOMO BANNER, COMMUTATEUR THÈME, HERO DIAPORAMA 2S, RECHERCHE & FILTRES) */}
      <MarketplaceHeader
        isLight={isLight}
        toggleTheme={toggleTheme}
        settings={settings}
        countryConfig={countryConfig}
        flashSecondsLeft={flashSecondsLeft}
        formatFlashTime={formatFlashTime}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        userProfile={userProfile}
        handleOpenClientSpace={handleOpenClientSpace}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        setIsNotificationCenterOpen={setIsNotificationCenterOpen}
        unreadNotificationsCount={unreadNotificationsCount}
        setUnreadNotificationsCount={setUnreadNotificationsCount}
        catalogItems={catalogItems}
        currentSlideIndex={currentSlideIndex}
        setCurrentSlideIndex={setCurrentSlideIndex}
        setSelectedProduct={setSelectedProduct}
        handleStartCheckout={handleStartCheckout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCount={filteredItems.length}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* 2. GRILLE DES PRODUITS 3D BOMBÉS */}
      <main className="max-w-6xl mx-auto px-4 py-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-semibold opacity-60">Aucun produit ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredItems.map(item => (
              <ProductCard
                key={item.id}
                item={item}
                isLight={isLight}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={toggleFavorite}
                onSelectProduct={setSelectedProduct}
                onStartCheckout={handleStartCheckout}
              />
            ))}
          </div>
        )}
      </main>

      {/* 3. MODALE DÉTAIL DU PRODUIT */}
      <ProductDetailModal
        key={selectedProduct ? selectedProduct.id : 'no-product'}
        product={selectedProduct}
        catalogItems={catalogItems}
        onSelectProduct={setSelectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        isLight={isLight}
        productMediaTab={productMediaTab}
        setProductMediaTab={setProductMediaTab}
        officialWhatsapp={officialWhatsapp}
        onAddToCart={addToCart}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSellerChat={handleOpenSellerChat}
        onStartCheckout={handleStartCheckout}
        userProfile={userProfile}
      />

      {/* 4. MODALE DE SOUSCRIPTION & PAIEMENT ÉCHELONNÉ (CHECKOUT) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct}
        checkoutProduct={checkoutProduct}
        isLight={isLight}
        countryConfig={countryConfig}
        checkoutPlanTranches={checkoutPlanTranches}
        setCheckoutPlanTranches={setCheckoutPlanTranches}
        checkoutPaymentMethod={checkoutPaymentMethod}
        setCheckoutPaymentMethod={setCheckoutPaymentMethod}
        checkoutStep={checkoutStep}
        setCheckoutStep={setCheckoutStep}
        checkoutForm={checkoutForm}
        setCheckoutForm={setCheckoutForm}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* 5. TIROIR PANIER D'ACHAT */}
      <CartDrawerModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        isLight={isLight}
        cart={cart}
        cartItems={cart}
        onUpdateQuantity={updateCartQty}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        officialWhatsapp={officialWhatsapp}
      />

      {/* 6. MODALE REÇU OFFICIEL D'ENCAISSEMENT & ÉCHÉANCIER */}
      <OrderReceiptModal
        order={selectedOrderReceipt}
        isOpen={Boolean(selectedOrderReceipt)}
        onClose={() => setSelectedOrderReceipt(null)}
        isLight={isLight}
        countryConfig={countryConfig}
        onPrintReceipt={handlePrintReceipt}
        officialWhatsapp={officialWhatsapp}
      />

      {/* 7. AUTHENTIFICATION : SE CONNECTER / CRÉER UN COMPTE (5 CHAMPS) */}
      <MemberRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        isLight={isLight}
        initialMode={authModalMode}
        countryConfig={countryConfig}
        availableCities={CAMEROON_CITIES}
        officialWhatsapp={officialWhatsapp}
        onLoginSuccess={(profile) => {
          setUserProfile(profile);
          playAlibabaChime(soundEnabled);
        }}
        onRegisterSuccess={(profile) => {
          setUserProfile(profile);
          playAlibabaChime(soundEnabled);
        }}
      />

      {/* 8. ESPACE MEMBRE VIP & COMMANDES */}
      <MemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        isLight={isLight}
        userProfile={userProfile}
        settings={settings}
        countryConfig={countryConfig}
        whatsappNumber={officialWhatsapp}
        ordersDelivered={ordersDelivered}
        ordersPaidPending={ordersPaidPending}
        ordersInProgress={ordersInProgress}
        onSelectReceipt={setSelectedOrderReceipt}
        onLogout={handleLogout}
      />

      {/* 9. CHAT SESSION VENDEUR OFFICIEL */}
      <SellerChatModal
        isOpen={isSellerChatOpen}
        onClose={() => setIsSellerChatOpen(false)}
        isLight={isLight}
        settings={settings}
        officialWhatsapp={officialWhatsapp}
        sellerChatProduct={sellerChatProduct}
        sellerChatMessages={sellerChatMessages}
        handleSendCustomerTextMessage={handleSendCustomerTextMessage}
        handleSendProductInChat={handleSendProductInChat}
        handleStartCheckout={handleStartCheckout}
        addToCart={addToCart}
        playAlibabaChime={() => playAlibabaChime(soundEnabled)}
        catalogItems={catalogItems}
      />

      {/* 10. CENTRE DE NOTIFICATIONS TEMPS RÉEL */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        isLight={isLight}
        settings={settings}
        catalogItems={catalogItems}
        onSelectProduct={setSelectedProduct}
        countryConfig={countryConfig}
        notificationStatus={notificationStatus}
        handleEnableNotifications={handleEnableNotifications}
        onTestPushNotification={handleTestPushNotification}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        userProfile={userProfile}
        onOpenRegister={() => {
          setRegisterStep(1);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* 11. TOAST ARRIVAGES TEMPS RÉEL AVEC SNOOZE 10 MIN ET MUTE */}
      <LiveEventToast
        activeLiveEvent={activeLiveEvent}
        activeEvent={activeLiveEvent}
        onClose={handleCloseLiveToast}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isLight={isLight}
        notificationStatus={notificationStatus}
        onEnablePush={handleEnableNotifications}
      />

      {/* 12. POPUP DE RÉTENTION DE SORTIE (EXIT INTENT) */}
      <ExitIntentModal
        isOpen={isExitIntentOpen}
        onClose={() => setIsExitIntentOpen(false)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        isLight={isLight}
        countryConfig={countryConfig}
        officialWhatsapp={officialWhatsapp}
      />

      {/* 13. PROMPT & BOUTON FLOTTANT INSTALLATION PWA */}
      <PwaInstallPrompt
        showFloating={showPwaFloating}
        isInstalled={isPwaInstalled}
        isModalOpen={isPwaModalOpen}
        setIsModalOpen={setIsPwaModalOpen}
        isLight={isLight}
        isIos={isIosDevice}
        onInstall={handleInstallPwa}
        onEnablePush={handleEnableNotifications}
        onSnooze={() => {
          try { localStorage.setItem('ktfa_pwa_ios_snooze', String(Date.now() + 24 * 3600 * 1000)); } catch(e) {}
          setShowPwaFloating(false);
          setIsPwaModalOpen(false);
        }}
      />

      {/* 14. BARRE DE NAVIGATION FLOTTANTE INFÉRIEURE (DOCK BAR 3D) */}
      <MarketplaceDockBar
        isLight={isLight}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isProfileModalOpen={isProfileModalOpen}
        userProfile={userProfile}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenClientSpace={handleOpenClientSpace}
        onOpenFlashDeals={() => {
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        officialWhatsapp={officialWhatsapp}
      />
    </div>
  );
}
