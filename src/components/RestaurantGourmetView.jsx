import React, { useState, useMemo } from 'react';
import {
  Search,
  Sliders,
  Plus,
  Minus,
  Heart,
  Star,
  ShoppingBag,
  Utensils,
  Flame,
  QrCode,
  MapPin,
  Clock,
  ArrowLeft,
  Check,
  Share2,
  MessageCircle,
  X,
  ChevronRight,
  Filter,
  Tag,
  Sparkles,
  Coffee,
  Pizza,
  Layers,
  Send,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Download,
  Bell
} from 'lucide-react';
import { FormattedProductDescription } from './FormattedProductDescription';

const FALLBACK_DISH_IMG = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80';

// Plats et spécialités par défaut de GOURMET EXPRESS
const DEFAULT_RESTAURANT_ITEMS = [
  {
    id: 'food-01',
    title: 'Spicy Chicken Burger Gourmet',
    category: 'Burgers',
    format: 'Burger Signature',
    dimensions: 'Double Filet Épicé • Sauce Secrète • Frites',
    price_fcfa: 4500,
    price_eur: 7,
    rating: 4.8,
    reviews_count: 120,
    badge: 'SPICY',
    badge_color: 'bg-rose-500/80 text-white',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Filet de poulet croustillant et mariné aux épices locales, salade croquante, tomate fraîche, oignons caramélisés et notre sauce signature piquante maison dans un pain brioché artisanal doré.',
    features: ['Poulet frais mariné 24h', 'Pain brioché toasté au beurre', 'Sauce secrète maison du chef', 'Frites dorées incluses'],
    popular: true
  },
  {
    id: 'food-02',
    title: 'Classic Double Beef Cheese',
    category: 'Burgers',
    format: 'Burger Pur Bœuf',
    dimensions: '2 Steaks Pur Bœuf 150g • Double Cheddar Fondu',
    price_fcfa: 5500,
    price_eur: 8.5,
    rating: 4.9,
    reviews_count: 98,
    badge: 'BEST SELLER',
    badge_color: 'bg-amber-500/90 text-black',
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Deux généreux steaks hachés pur bœuf grillés à la flamme, double tranche de cheddar anglais affiné fondu, cornichons craquants, sauce barbecue fumée.',
    features: ['100% Viande bovine sélectionnée', 'Double fromage fondu onctueux', 'Grillé minute à la flamme'],
    popular: true
  },
  {
    id: 'food-03',
    title: 'Poulet Fermier Braisé & Alloco Doré',
    category: 'Grillades',
    format: 'Spécialité Braisée',
    dimensions: '1/2 Poulet Braisé • Bananes Alloco • Piment Vert',
    price_fcfa: 6500,
    price_eur: 10,
    rating: 4.9,
    reviews_count: 154,
    badge: 'SPÉCIALITÉ',
    badge_color: 'bg-emerald-500/90 text-black font-black',
    image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Le grand classique incontournable : demi-poulet fermier braisé au charbon de bois avec marinade secrète d’Owendo, servi avec des bananes alloco fondantes et sauce pimentée.',
    features: ['Volaille locale fraîche braisée', 'Alloco fait maison doré minute', 'Sauce oignons et tomate confite', 'Piment vert parfumé'],
    popular: true
  },
  {
    id: 'food-04',
    title: 'Bar Braisé de l’Estuaire & Bâton de Manioc',
    category: 'Traditionnel',
    format: 'Poisson Braisé',
    dimensions: 'Poisson Entier Frais (800g) • Manioc • Piment Rouge',
    price_fcfa: 8000,
    price_eur: 12.5,
    rating: 5.0,
    reviews_count: 87,
    badge: 'CHEF VIP',
    badge_color: 'bg-sky-500/90 text-black font-black',
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Poisson Bar frais de la baie de Libreville assaisonné aux herbes de chez nous, braisé à point au feu de bois. Servi avec bâton de manioc moelleux et citron vert.',
    features: ['Pêche fraîche du jour', 'Braisage traditionnel au charbon', 'Accompagné de bâton de manioc ou riz blanc'],
    popular: true
  },
  {
    id: 'food-05',
    title: 'Pizza Royale Artisanale Feu de Bois',
    category: 'Pizzas',
    format: 'Pizza 33cm',
    dimensions: 'Pâte Maison Maturation 48h • Mozzarella Fiori',
    price_fcfa: 7500,
    price_eur: 11.5,
    rating: 4.7,
    reviews_count: 64,
    badge: 'FEU DE BOIS',
    badge_color: 'bg-amber-600/90 text-white',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Sauce tomate San Marzano, mozzarella fondante généreuse, jambon supérieur, champignons frais de Paris sautés et origan sauvage sur une pâte étalée à la main.',
    features: ['Pâte fine croustillante', 'Cuisson authentique au feu de bois', 'Mozzarella 100% lait'],
    popular: false
  },
  {
    id: 'food-06',
    title: 'Gâteau Pâtissier d’Anniversaire Chocolat & Fruits',
    category: 'Gâteaux',
    format: 'Gâteau Événementiel',
    dimensions: '8-10 Personnes • Chocolat Pur Beurre • Fraises',
    price_fcfa: 18000,
    price_eur: 27.5,
    rating: 4.9,
    reviews_count: 42,
    badge: 'SUR COMMANDE',
    badge_color: 'bg-purple-500/90 text-white',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Création artisanale de notre chef pâtissier : génoise aérienne vanillée, ganache montée chocolat noir intense et topping fruits frais. Personnalisation du message offerte sur WhatsApp !',
    features: ['Pâtisserie 100% pur beurre', 'Message d’anniversaire personnalisé', 'Emballage luxe festif'],
    popular: false
  },
  {
    id: 'food-07',
    title: 'Cocktail Signature Passion-Mangue Givré',
    category: 'Boissons',
    format: 'Cocktail Frais 40cl',
    dimensions: 'Fruits Frais Mixés • Menthe • Glace Pilée',
    price_fcfa: 3000,
    price_eur: 4.5,
    rating: 4.8,
    reviews_count: 53,
    badge: 'RAFRAÎCHISSANT',
    badge_color: 'bg-teal-400 text-slate-950 font-bold',
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Pur nectar de fruits de la passion du Gabon et mangue mûre, pressés minute, relevés d’un trait de citron vert, sirop de canne et feuilles de menthe fraîche pilée.',
    features: ['Sans alcool ou avec touche arrangée', '100% Fruits naturels sans conservateur', 'Servi ultra frais avec paille en bambou'],
    popular: true
  },
  {
    id: 'food-08',
    title: 'Plateau Dégustation Grillades Mixtes VIP',
    category: 'Grillades',
    format: 'Plateau Partage (2-3 pers.)',
    dimensions: 'Brochettes Bœuf • Ailes BBQ • Saucisses • Alloco & Frites',
    price_fcfa: 15000,
    price_eur: 23,
    rating: 5.0,
    reviews_count: 76,
    badge: 'PLATEAU VIP',
    badge_color: 'bg-amber-400 text-slate-950 font-black',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Le festin complet pour vos soirées et tablées conviviales : 4 brochettes de bœuf tendre mariné, ailes de poulet caramélisées au feu de bois, saucisses fumées, double portion alloco & frites.',
    features: ['Idéal pour 2 à 3 personnes', 'Mix complet viandes et accompagnements', '3 Sauces dégustation offertes'],
    popular: true
  }
];

// Catégories originales de GOURMET EXPRESS
const CATEGORIES = [
  { id: 'all', label: 'Tout', icon: Utensils },
  { id: 'Burgers', label: 'Burgers', icon: Layers },
  { id: 'Grillades', label: 'Grillades', icon: Flame },
  { id: 'Traditionnel', label: 'Traditionnel', icon: Sparkles },
  { id: 'Pizzas', label: 'Pizzas', icon: Pizza },
  { id: 'Gâteaux', label: 'Gâteaux', icon: Coffee },
  { id: 'Boissons', label: 'Boissons', icon: Coffee }
];

export function RestaurantGourmetView({
  settings = {},
  posters = [],
  currency = 'XAF',
  whatsappNumber = '24162744533',
  onNavigateAdmin,
  isPreview = false
}) {
  const menuItems = useMemo(() => {
    if (posters && posters.length > 0) {
      return posters.map((p, idx) => ({
        id: p.id || `dish-${idx}`,
        title: p.title || 'Plat Savoureux',
        category: p.category || (idx % 2 === 0 ? 'Burgers' : 'Grillades'),
        format: p.format || 'Menu Spécial',
        dimensions: p.dimensions || 'Préparé minute avec des produits frais',
        price_fcfa: Number(p.price_fcfa) || 4500,
        price_eur: Number(p.price_eur) || Math.round(Number(p.price_fcfa) / 655) || 7,
        rating: p.rating || 4.8,
        reviews_count: p.reviews_count || (85 + (idx * 7)),
        badge: p.badge || (idx === 0 ? 'SPICY' : 'POPULAIRE'),
        badge_color: p.badge_color || (idx === 0 ? 'bg-rose-500/80 text-white' : 'bg-teal-500/80 text-slate-950 font-bold'),
        image_url: p.image_url || FALLBACK_DISH_IMG,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image_url || FALLBACK_DISH_IMG],
        description: p.description || 'Plat cuisiné à la commande avec des ingrédients sélectionnés de première qualité.',
        features: Array.isArray(p.features) ? p.features : ['Cuisiné minute', 'Qualité garantie', 'Livraison rapide'],
        popular: p.popular !== undefined ? Boolean(p.popular) : (idx < 4)
      }));
    }
    return DEFAULT_RESTAURANT_ITEMS;
  }, [posters]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [dishSize, setDishSize] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const [supplements, setSupplements] = useState({
    addCheese: false,
    extraPatty: false,
    addAlloco: false,
    addSaucePiment: false,
    addDrink: false
  });

  const [orderType, setOrderType] = useState('livraison');
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [deliveryCity, setDeliveryCity] = useState('Libreville');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const restaurantName = settings.company_name || 'Gourmet Express';
  const restaurantLogo = settings.company_logo_url || null;
  const targetWhatsapp = (settings.whatsapp_number || whatsappNumber || '24162744533').replace(/[^0-9]/g, '');
  const heroTitle = settings.hero_title || 'Good Food Good Mood!';
  const heroBadge = settings.hero_badge || '🍽️ MENU DIGITAL & LIVRAISON EXPRESS';
  const heroSubtitle = settings.hero_subtitle || 'Commandez en 1 clic vos burgers gourmets, grillades braisées, plats traditionnels et gâteaux en direct sur WhatsApp.';
  const promoTitle = settings.promo_combo_title || 'Spicy Burger Combo';
  const promoBadge = settings.promo_combo_badge || 'Limited Time Offer';
  const promoDiscount = settings.promo_combo_discount || '20% OFF';
  const promoOldPrice = settings.promo_combo_old_price || '8 500 F';
  const showPromoCombo = settings.show_promo_combo !== false && settings.show_promo_combo !== 'false';

  const filteredDishes = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openDishCustomizer = (dish) => {
    setSelectedDish(dish);
    setDishSize('Regular');
    setQuantity(1);
    setSupplements({
      addCheese: false,
      extraPatty: false,
      addAlloco: false,
      addSaucePiment: false,
      addDrink: false
    });
  };

  const calculateDishUnitPrice = (dish, size, supps) => {
    if (!dish) return 0;
    let base = Number(dish.price_fcfa) || 4500;
    if (size === 'Large') base += 1000;
    if (size === 'X Large') base += 2000;
    if (supps.addCheese) base += 500;
    if (supps.extraPatty) base += 1500;
    if (supps.addAlloco) base += 1000;
    if (supps.addSaucePiment) base += 300;
    if (supps.addDrink) base += 1000;
    return base;
  };

  const currentCustomizedPrice = useMemo(() => {
    if (!selectedDish) return 0;
    return calculateDishUnitPrice(selectedDish, dishSize, supplements) * quantity;
  }, [selectedDish, dishSize, supplements, quantity]);

  const handleAddToCart = () => {
    if (!selectedDish) return;
    const unitPrice = calculateDishUnitPrice(selectedDish, dishSize, supplements);
    const suppList = [];
    if (supplements.addCheese) suppList.push('Extra Fromage (+500 F)');
    if (supplements.extraPatty) suppList.push('Double Viande (+1 500 F)');
    if (supplements.addAlloco) suppList.push('Alloco / Frites (+1 000 F)');
    if (supplements.addSaucePiment) suppList.push('Piment Maison (+300 F)');
    if (supplements.addDrink) suppList.push('Boisson Fraîche (+1 000 F)');

    const cartItem = {
      cartId: `${selectedDish.id}-${Date.now()}`,
      dish: selectedDish,
      size: dishSize,
      supplements: suppList,
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity
    };

    setCart(prev => [...prev, cartItem]);
    setSelectedDish(null);
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const cartTotalFcfa = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cart]);

  const cartTotalCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const handleDispatchWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let destinationInfo = '';
    if (orderType === 'table') {
      destinationInfo = `🍽️ *SUR PLACE À TABLE :* ${tableNumber || 'Table non précisée'}`;
    } else if (orderType === 'livraison') {
      destinationInfo = `🛵 *LIVRAISON À DOMICILE :*\n📍 Ville : *${deliveryCity}*\n🏠 Adresse / Repère : *${deliveryAddress || 'Non précisé'}*\n👤 Client : *${clientName || 'Gourmand'}* (Tél: ${clientPhone || 'Voir profil'})`;
    } else {
      destinationInfo = `🛍️ *À EMPORTER (RETRAIT AU COMPTOIR)*\n👤 Client : *${clientName || 'Gourmand'}*`;
    }

    let itemsList = '';
    cart.forEach((item, idx) => {
      itemsList += `\n${idx + 1}. *${item.dish.title}* (${item.size})\n   ↳ Qté : ${item.quantity} x ${item.unitPrice.toLocaleString('fr-FR')} F = *${item.totalPrice.toLocaleString('fr-FR')} FCFA*`;
      if (item.supplements.length > 0) {
        itemsList += `\n   ↳ Suppléments : ${item.supplements.join(', ')}`;
      }
    });

    const primaryDishImage = cart[0]?.dish?.image_url || '';
    const absoluteDishImage = primaryDishImage.startsWith('http')
      ? primaryDishImage
      : `https://digital-mark-pro.mynexus.workers.dev${primaryDishImage.startsWith('/') ? '' : '/'}${primaryDishImage}`;

    const message = `🍽️ *NOUVELLE COMMANDE EN LIGNE — ${restaurantName.toUpperCase()}* 🍽️\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${destinationInfo}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *DÉTAIL DE LA COMMANDE :*${itemsList}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *MONTANT TOTAL À REGLER : ${cartTotalFcfa.toLocaleString('fr-FR')} FCFA*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📸 *Aperçu du plat :* ${absoluteDishImage}\n\n` +
      `_Envoyé instantanément depuis le Menu Digital de ${restaurantName}._`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${targetWhatsapp}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#07181c] text-slate-100 font-sans selection:bg-teal-400 selection:text-slate-950 relative overflow-x-hidden pb-28">

      {/* LUEUR CYAN / TURQUOISE ORIGINALE GOURMET EXPRESS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-28 -left-20 w-[420px] h-[420px] bg-gradient-to-br from-teal-400/35 via-cyan-500/25 to-transparent rounded-full blur-[90px] animate-pulse duration-1000" />
        <div className="absolute top-[22%] -right-20 w-[360px] h-[360px] bg-gradient-to-bl from-amber-400/25 via-rose-500/15 to-transparent rounded-full blur-[80px]" />
        <div className="absolute top-[48%] left-[5%] w-[320px] h-[320px] bg-teal-500/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 right-[10%] w-[440px] h-[440px] bg-gradient-to-tr from-emerald-500/25 via-teal-400/20 to-transparent rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col px-4 pt-5 pb-6">

        {/* HEADER GOURMET EXPRESS */}
        <header className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-teal-300 hover:bg-white/20 hover:text-white transition-all shadow-md cursor-pointer"
              title="Scanner ou Afficher le QR Code du Menu"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if ('Notification' in window) {
                  Notification.requestPermission().then((perm) => {
                    if (perm === 'granted') {
                      alert('🔔 Notifications activées pour ' + restaurantName + ' ! Vous recevrez nos offres exclusives.');
                    } else {
                      alert('Notifications push bloquées ou désactivées dans votre navigateur.');
                    }
                  });
                } else {
                  alert('Votre navigateur ne supporte pas le Web Push.');
                }
              }}
              className="relative w-10 h-10 rounded-2xl bg-teal-500/15 backdrop-blur-xl border border-teal-300/30 flex items-center justify-center text-teal-300 hover:bg-teal-500/25 hover:text-white transition-all shadow-md cursor-pointer"
              title="Activer les Notifications Push"
            >
              <Bell className="w-5 h-5 text-teal-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 shadow-[0_0_8px_#fbbf24]" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-teal-200/90 font-medium">
                <span>{heroBadge}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-1.5 drop-shadow-sm">
                <span>{heroTitle.split(' ')[0] || 'Good Food'}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-teal-400">
                  {heroTitle.split(' ').slice(1).join(' ') || 'Good Mood!'}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {restaurantLogo ? (
              <img
                src={restaurantLogo}
                alt={restaurantName}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_DISH_IMG; }}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-white/30 shadow-[0_4px_16px_rgba(0,229,201,0.35)]"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-300 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-[0_4px_16px_rgba(0,229,201,0.4)]">
                {restaurantName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* RECHERCHE */}
        <div className="relative mb-5">
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl px-3.5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_2px_rgba(255,255,255,0.35)] focus-within:border-teal-300/80 focus-within:bg-white/15 transition-all">
            <Search className="w-5 h-5 text-teal-200/80 shrink-0" />
            <input
              type="text"
              placeholder="Search your favorite food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-teal-100/50 focus:outline-none"
            />
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="p-1 text-teal-200/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setSelectedCategory('all')}
                className="p-1.5 rounded-xl bg-white/10 text-teal-200 hover:bg-white/20 transition-colors cursor-pointer"
                title="Filtres avancés"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CATÉGORIES ORIGINALES DE GOURMET EXPRESS */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mb-6 scrollbar-none -mx-4 px-4">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 flex flex-col items-center justify-center gap-1.5 w-18 h-18 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-teal-300 to-cyan-400 border-white/40 text-slate-950 shadow-[0_10px_25px_rgba(0,229,201,0.45)] scale-105 font-black'
                    : 'bg-white/8 backdrop-blur-xl border-white/15 text-teal-100/80 hover:bg-white/15 hover:border-white/30 hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-slate-950 stroke-[2.5]' : 'text-teal-200'}`} />
                <span className="text-[11px] font-medium leading-none truncate max-w-[64px]">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* BANNIÈRE PROMO GOURMET EXPRESS */}
        {showPromoCombo && selectedCategory === 'all' && !searchQuery && (
          <div className="relative mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-white/15 via-[#0e3b43]/35 to-[#06242c]/65 backdrop-blur-2xl border border-white/25 border-t-white/40 p-5 shadow-[0_15px_35px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(255,255,255,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1.5 z-10">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-teal-200 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-md">
                  <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                  {promoBadge}
                </span>
                <h3 className="text-lg font-black text-white leading-tight drop-shadow-sm">
                  {promoTitle}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-teal-300 font-mono drop-shadow">
                    {promoDiscount}
                  </span>
                  <span className="text-xs text-teal-100/60 line-through">
                    {promoOldPrice}
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => openDishCustomizer(menuItems[0])}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-300 to-cyan-400 text-slate-950 text-xs font-black shadow-[0_4px_20px_rgba(0,229,201,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Order Now
                  </button>
                </div>
              </div>

              <div className="relative w-36 h-32 shrink-0 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80"
                  alt="Combo Burger"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_DISH_IMG; }}
                  className="w-full h-full object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION POPULAR NOW (PLATS GOURMET EXPRESS) */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Popular Now</span>
              <span className="text-xs font-mono text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-full border border-teal-500/30">
                {filteredDishes.length}
              </span>
            </h2>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-bold text-teal-300 hover:text-white transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {filteredDishes.map((dish) => {
              const isFav = Boolean(favorites[dish.id]);
              return (
                <div
                  key={dish.id}
                  onClick={() => openDishCustomizer(dish)}
                  className="group relative bg-gradient-to-b from-white/12 via-[#0e3b43]/30 to-[#071f25]/50 backdrop-blur-2xl border border-white/20 border-t-white/35 hover:border-teal-300/60 rounded-3xl p-3 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:-translate-y-1 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2 z-10">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm ${dish.badge_color || 'bg-teal-400/90 text-slate-950'}`}>
                      {dish.badge || 'PROMO'}
                    </span>
                    <button
                      onClick={(e) => toggleFavorite(e, dish.id)}
                      className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-teal-200/80 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="relative w-full h-28 my-1 flex items-center justify-center bg-black/20 rounded-2xl overflow-hidden">
                    <img
                      src={dish.image_url}
                      alt={dish.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_DISH_IMG;
                      }}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300 shadow-md border border-white/10"
                    />
                  </div>

                  <div className="space-y-1 mt-2">
                    <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-teal-300 transition-colors">
                      {dish.title}
                    </h3>
                    <p className="text-[10px] text-teal-100/70 line-clamp-1">
                      {dish.dimensions || dish.category}
                    </p>

                    <div className="flex items-center justify-between pt-1.5">
                      <div className="space-y-0.5">
                        <span className="text-xs md:text-sm font-black text-white font-mono">
                          {dish.price_fcfa.toLocaleString('fr-FR')} F
                        </span>
                        <span className="block text-[9px] text-teal-200/70 font-mono">
                          ~ {dish.price_eur} €
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDishCustomizer(dish);
                        }}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-300 to-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_4px_16px_rgba(0,229,201,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="Personnaliser et ajouter au panier"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDishes.length === 0 && (
            <div className="p-8 text-center bg-[#0d2f38]/30 rounded-3xl border border-teal-500/10 space-y-3">
              <Utensils className="w-8 h-8 text-teal-400/40 mx-auto" />
              <p className="text-xs text-slate-400">
                Aucun plat ne correspond à votre recherche "{searchQuery}".
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-xs text-teal-300 font-bold underline cursor-pointer"
              >
                Réinitialiser la carte
              </button>
            </div>
          )}
        </div>

      </div>

      {/* SCREEN 2 : CUSTOMIZE MODAL GOURMET EXPRESS */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md mx-auto h-[92vh] flex flex-col rounded-t-[36px] overflow-hidden bg-gradient-to-b from-[#0a2931]/80 via-[#071f25]/92 to-[#041317]/98 backdrop-blur-3xl border-t border-x border-white/25 shadow-[0_-25px_60px_rgba(0,0,0,0.8)] relative">
            <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between">
              <button
                onClick={() => setSelectedDish(null)}
                className="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-lg cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => toggleFavorite(e, selectedDish.id)}
                className="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:text-rose-400 transition-colors shadow-lg cursor-pointer"
              >
                <Heart className={`w-5 h-5 ${favorites[selectedDish.id] ? 'text-rose-500 fill-rose-500' : ''}`} />
              </button>
            </div>

            <div className="relative w-full h-[36vh] shrink-0 bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={selectedDish.image_url}
                alt={selectedDish.title}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_DISH_IMG; }}
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2931] via-transparent to-black/40" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-28 space-y-4 -mt-6 relative z-10">
              <div className="bg-gradient-to-b from-white/12 via-teal-900/20 to-[#071f25]/40 backdrop-blur-2xl border border-white/20 border-t-white/35 rounded-3xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-400/25 text-teal-200 border border-teal-300/30 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-teal-300" />
                  <span>{selectedDish.badge || 'SIGNATURE DU CHEF'}</span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-black text-white leading-tight drop-shadow-sm">
                    {selectedDish.title}
                  </h2>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-teal-300 font-mono drop-shadow">
                      {selectedDish.price_fcfa.toLocaleString('fr-FR')} F
                    </span>
                    <span className="block text-[10px] text-teal-200/70 font-mono">
                      ~ {selectedDish.price_eur} €
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-teal-100/80">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="font-extrabold text-white">{selectedDish.rating || 4.8}</span>
                  </div>
                  <span className="text-teal-200/60">({selectedDish.reviews_count || 120} avis)</span>
                </div>

                <FormattedProductDescription
                  description={selectedDish.description}
                  isDarkMode={true}
                  className="pt-1"
                />
              </div>

              <div className="space-y-3.5 bg-gradient-to-b from-white/10 via-[#0e3b43]/25 to-[#071f25]/45 backdrop-blur-2xl border border-white/20 border-t-white/30 rounded-3xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center justify-between">
                  <span>Customize (Personnalisation)</span>
                  <span className="text-[10px] text-teal-200/70 font-normal">Selon vos envies</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-200">Portion & Taille</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Regular', label: 'Regular', extra: 'Normal' },
                      { id: 'Large', label: 'Large', extra: '+1 000 F' },
                      { id: 'X Large', label: 'X Large', extra: '+2 000 F' },
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setDishSize(sz.id)}
                        className={`py-2 px-2.5 rounded-xl text-center border transition-all text-xs cursor-pointer ${
                          dishSize === sz.id
                            ? 'bg-gradient-to-r from-teal-300 to-cyan-400 text-slate-950 font-black border-white/40 shadow-[0_4px_16px_rgba(0,229,201,0.45)]'
                            : 'bg-white/8 backdrop-blur-md border-white/15 text-slate-200 hover:bg-white/15'
                        }`}
                      >
                        <div className="leading-tight">{sz.label}</div>
                        <div className="text-[9px] opacity-75 font-mono">{sz.extra}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-bold text-slate-200">Extras & Suppléments</label>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/8 backdrop-blur-md border border-white/15 hover:border-teal-300/40 transition-all">
                    <span className="text-xs text-white flex items-center gap-2">
                      <span>🧀 Extra Fromage Fondu</span>
                      <strong className="text-[10px] text-teal-300 font-mono">+500 F</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSupplements(s => ({ ...s, addCheese: !s.addCheese }))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        supplements.addCheese ? 'bg-gradient-to-r from-teal-300 to-cyan-400 shadow-md shadow-teal-500/40' : 'bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        supplements.addCheese ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/8 backdrop-blur-md border border-white/15 hover:border-teal-300/40 transition-all">
                    <span className="text-xs text-white flex items-center gap-2">
                      <span>🥩 Double Steak / Viande Grillée</span>
                      <strong className="text-[10px] text-teal-300 font-mono">+1 500 F</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSupplements(s => ({ ...s, extraPatty: !s.extraPatty }))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        supplements.extraPatty ? 'bg-gradient-to-r from-teal-300 to-cyan-400 shadow-md shadow-teal-500/40' : 'bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        supplements.extraPatty ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/8 backdrop-blur-md border border-white/15 hover:border-teal-300/40 transition-all">
                    <span className="text-xs text-white flex items-center gap-2">
                      <span>🍌 Alloco Banane / Frites Maison</span>
                      <strong className="text-[10px] text-teal-300 font-mono">+1 000 F</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSupplements(s => ({ ...s, addAlloco: !s.addAlloco }))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        supplements.addAlloco ? 'bg-gradient-to-r from-teal-300 to-cyan-400 shadow-md shadow-teal-500/40' : 'bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        supplements.addAlloco ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/8 backdrop-blur-md border border-white/15 hover:border-teal-300/40 transition-all">
                    <span className="text-xs text-white flex items-center gap-2">
                      <span>🌶️ Sauce Piment Rouge du Gabon</span>
                      <strong className="text-[10px] text-teal-300 font-mono">+300 F</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSupplements(s => ({ ...s, addSaucePiment: !s.addSaucePiment }))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        supplements.addSaucePiment ? 'bg-gradient-to-r from-teal-300 to-cyan-400 shadow-md shadow-teal-500/40' : 'bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        supplements.addSaucePiment ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/8 backdrop-blur-md border border-white/15 hover:border-teal-300/40 transition-all">
                    <span className="text-xs text-white flex items-center gap-2">
                      <span>🥤 Boisson Canette / Jus Frais</span>
                      <strong className="text-[10px] text-teal-300 font-mono">+1 000 F</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSupplements(s => ({ ...s, addDrink: !s.addDrink }))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        supplements.addDrink ? 'bg-gradient-to-r from-teal-300 to-cyan-400 shadow-md shadow-teal-500/40' : 'bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        supplements.addDrink ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

              </div>

            </div>

            <div className="absolute bottom-0 inset-x-0 bg-white/10 backdrop-blur-2xl border-t border-white/20 p-4 flex items-center justify-between gap-3 z-30 shadow-[0_-10px_35px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-white/15 text-teal-200 flex items-center justify-center hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-black text-sm text-white w-4 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-7 h-7 rounded-lg bg-white/15 text-teal-200 flex items-center justify-center hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-300 via-cyan-400 to-teal-300 text-slate-950 font-black text-xs md:text-sm flex items-center justify-between shadow-[0_6px_25px_rgba(0,229,201,0.5)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  <span>Ajouter au Panier</span>
                </span>
                <span className="font-mono text-sm border-l border-slate-950/25 pl-3">
                  {currentCustomizedPrice.toLocaleString('fr-FR')} F
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DOCK BAR GOURMET EXPRESS ORIGINALE (AVEC "À TABLE") */}
      <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40">
        <div className="bg-[#061d24]/70 backdrop-blur-2xl border border-white/20 border-t-white/35 rounded-3xl p-2 flex items-center justify-around shadow-[0_15px_40px_rgba(0,0,0,0.6)]">

          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setIsCartOpen(false); }}
            className="flex flex-col items-center gap-1 py-1.5 px-3 text-teal-300 hover:text-white transition-colors cursor-pointer"
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] font-bold">Carte</span>
          </button>

          <button
            onClick={() => { setSelectedCategory('all'); openDishCustomizer(menuItems[0]); }}
            className="flex flex-col items-center gap-1 py-1.5 px-3 text-teal-300/70 hover:text-teal-300 transition-colors cursor-pointer"
          >
            <Flame className="w-5 h-5 text-rose-400" />
            <span className="text-[10px] font-medium">Offres</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative -mt-6 w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-teal-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black flex items-center justify-center border-2 border-[#0b272f] animate-pulse">
                {cartTotalCount}
              </span>
            )}
          </button>

          {/* BOUTON ORIGINAL "À TABLE" DE GOURMET EXPRESS */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex flex-col items-center gap-1 py-1.5 px-3 text-teal-300/70 hover:text-teal-300 transition-colors cursor-pointer"
          >
            <QrCode className="w-5 h-5" />
            <span className="text-[10px] font-medium">À Table</span>
          </button>

          <a
            href={`https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(`Bonjour ${restaurantName}, je souhaite avoir des renseignements sur vos menus et livraisons.`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 py-1.5 px-3 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">WhatsApp</span>
          </a>

        </div>
      </div>

      {/* MODAL DU PANIER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md mx-auto max-h-[90vh] flex flex-col rounded-t-[36px] bg-[#092228] border-t border-x border-teal-500/30 shadow-2xl relative overflow-hidden">

            <div className="p-5 border-b border-teal-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-300" />
                <h3 className="text-base font-black text-white">
                  Votre Commande ({cartTotalCount} {cartTotalCount > 1 ? 'articles' : 'article'})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-teal-900/40 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Comment souhaitez-vous recevoir votre repas ?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'livraison', label: '🛵 Livraison', desc: 'À domicile' },
                    { id: 'table', label: '🍽️ À Table', desc: 'QR Code' },
                    { id: 'emporter', label: '🛍️ Emporter', desc: 'Comptoir' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setOrderType(m.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        orderType === m.id
                          ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-black border-teal-200 shadow-md shadow-teal-500/20'
                          : 'bg-[#0e353f]/40 border-teal-500/20 text-slate-300 hover:border-teal-500/40'
                      }`}
                    >
                      <div className="text-xs leading-tight">{m.label}</div>
                      <div className="text-[9px] opacity-75">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {orderType === 'table' && (
                <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 space-y-2">
                  <label className="block text-xs font-bold text-teal-300">Numéro de votre Table</label>
                  <input
                    type="text"
                    placeholder="Ex: Table 4, Terrasse 2, Salon VIP..."
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-[#07191d] border border-teal-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    💡 Le serveur vous apportera vos plats directement à cette table dès préparation.
                  </p>
                </div>
              )}

              {orderType === 'livraison' && (
                <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 space-y-2.5">
                  <label className="block text-xs font-bold text-teal-300">Adresse de Livraison</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Libreville', 'Owendo', 'Port-Gentil'].map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setDeliveryCity(city)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          deliveryCity === city
                            ? 'bg-teal-400 text-slate-950 border-teal-200'
                            : 'bg-black/30 text-slate-300 border-teal-500/20'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Quartier, rue et repère précis (ex: Batterie 4, à côté de la pharmacie)..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-[#07191d] border border-teal-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Votre nom..."
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="bg-[#07191d] border border-teal-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                    <input
                      type="text"
                      placeholder="Numéro WhatsApp..."
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="bg-[#07191d] border border-teal-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Articles Sélectionnés
                </label>

                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="p-3 rounded-2xl bg-[#0e353f]/40 border border-teal-500/20 flex items-center justify-between gap-3"
                  >
                    <img
                      src={item.dish.image_url}
                      alt={item.dish.title}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_DISH_IMG; }}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.dish.title}</h4>
                      <p className="text-[10px] text-teal-300/80 font-mono">
                        Portion : {item.size} • Qté : {item.quantity}
                      </p>
                      {item.supplements.length > 0 && (
                        <p className="text-[9px] text-slate-400 truncate">
                          + {item.supplements.join(', ')}
                        </p>
                      )}
                      <p className="text-xs font-black text-white font-mono mt-0.5">
                        {item.totalPrice.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="p-2 text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Retirer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Votre panier est vide. Choisissez vos plats sur la carte pour commander !
                  </div>
                )}
              </div>

            </div>

            {cart.length > 0 && (
              <div className="p-4 bg-[#07191d] border-t border-teal-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold">Total à Payer :</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-teal-300 font-mono">
                      {cartTotalFcfa.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      ~ {Math.round(cartTotalFcfa / 655)} €
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDispatchWhatsAppOrder}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                  <span>Envoyer la Commande sur WhatsApp (1 Clic)</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL QR CODE GOURMET EXPRESS */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#092228] border border-teal-500/30 p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-teal-900/40 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
              <QrCode className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">{restaurantName}</h3>
              <p className="text-xs text-teal-300/80 mt-0.5">Menu Digital & Commande en Ligne</p>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://digital-mark-pro.mynexus.workers.dev/?t=gourmet-express')}`}
                alt="QR Code Menu"
                className="w-44 h-44 object-contain mx-auto"
              />
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Vos clients peuvent scanner ce QR code directement avec l’appareil photo de leur smartphone pour consulter la carte et commander à table ou en livraison.
            </p>

            <div className="pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Imprimer pour les Tables</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default RestaurantGourmetView;
