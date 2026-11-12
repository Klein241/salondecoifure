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
  AlertCircle,
  XCircle,
  Trash2,
  Download,
  Bell,
  Instagram,
  Facebook,
  ExternalLink,
  User,
  Users,
  Gift,
  Compass,
  Navigation,
  Copy,
  Info,
  RefreshCw
} from 'lucide-react';
import { FormattedProductDescription } from './FormattedProductDescription';

// Plats et spécialités authentiques de BURGYS GABON (Five Star Burgers Libreville)
const DEFAULT_BURGYS_ITEMS = [
  {
    id: 'burgys-01',
    title: 'Big Hero Burger (Signature Five Star)',
    category: 'Burgers',
    format: 'Burger Signature Géant',
    dimensions: 'Double Steak Pur Bœuf • Triple Bun Brioché • Double Cheddar',
    price_fcfa: 5500,
    price_eur: 8.5,
    rating: 4.9,
    reviews_count: 142,
    badge: 'SIGNATURE ⭐',
    badge_color: 'bg-rose-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Le burger star de Burgys : double steak pur bœuf grillé minute à la flamme, triple bun brioché artisanal toasté au beurre, double tranche de cheddar anglais affiné fondu, salade iceberg croquante, cornichons et sauce secrète Burgys.',
    features: ['Double steak 100% pur bœuf', 'Triple bun brioché moelleux', 'Double cheddar fondu', 'Sauce secrète maison Burgys'],
    popular: true
  },
  {
    id: 'burgys-02',
    title: 'Spicy Burgy Chicken',
    category: 'Burgers',
    format: 'Burger Poulet Épicé',
    dimensions: 'Filet Croustillant Cajun • Sauce Piquante • Cheddar',
    price_fcfa: 4500,
    price_eur: 7,
    rating: 4.8,
    reviews_count: 118,
    badge: 'SPICY 🔥',
    badge_color: 'bg-red-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Généreux filet de poulet frais mariné aux épices cajun, panure ultra-croustillante dorée minute, sauce piquante du chef, cheddar fondant, tomate fraîche et salade croquante.',
    features: ['Poulet mariné 24h & pané minute', 'Sauce piquante maison', 'Cheddar fondu onctueux', 'Pain brioché toasté'],
    popular: true
  },
  {
    id: 'burgys-03',
    title: 'Classic Burgy Beef Cheese',
    category: 'Burgers',
    format: 'Burger Pur Bœuf',
    dimensions: 'Steak Haché 150g • Cheddar Fondu • Sauce Burger',
    price_fcfa: 4000,
    price_eur: 6,
    rating: 4.8,
    reviews_count: 96,
    badge: 'BEST SELLER',
    badge_color: 'bg-amber-500 text-slate-950 font-black',
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'L’authentique classique burger : steak haché pur bœuf juteux, cheddar affiné fondant, oignons rouges émincés, tomate fraîche, cornichons aigre-doux et sauce burger maison.',
    features: ['Steak pur bœuf 150g', 'Cheddar fondant', 'Crudités fraîches du jour', 'Sauce burger artisanale'],
    popular: true
  },
  {
    id: 'burgys-04',
    title: 'Double Burgy Bacon Cheese',
    category: 'Burgers',
    format: 'Double Steak & Bacon',
    dimensions: '2 Steaks Bœuf • Tranches Bacon • Double Fromage',
    price_fcfa: 6000,
    price_eur: 9,
    rating: 5.0,
    reviews_count: 89,
    badge: 'GOURMAND 🥓',
    badge_color: 'bg-amber-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Pour les vrais amateurs de viande : deux généreux steaks bœuf grillés, tranches de bacon croustillant, double cheddar fondant et sauce barbecue fumée.',
    features: ['2 steaks pur bœuf grillés', 'Bacon croustillant', 'Double cheddar', 'Sauce barbecue fumée'],
    popular: true
  },
  {
    id: 'burgys-05',
    title: 'Burgy BBQ Smoked',
    category: 'Burgers',
    format: 'Burger Fumé Feu de Bois',
    dimensions: 'Steak Grillé • Oignons Crispy • Sauce BBQ Fumée',
    price_fcfa: 5000,
    price_eur: 7.5,
    rating: 4.7,
    reviews_count: 64,
    badge: 'SMOKY BBQ',
    badge_color: 'bg-orange-600 text-white font-bold',
    image_url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Steak pur bœuf braisé au feu de bois, oignons frits croustillants, bacon doré, cheddar maturé et sauce barbecue fumée au bois d’hickory.',
    features: ['Cuisson braisée fumée', 'Oignons frits ultra-croustillants', 'Cheddar fondu', 'Pain bun doré'],
    popular: false
  },
  {
    id: 'burgys-06',
    title: 'Burgy Crispy Fish',
    category: 'Burgers',
    format: 'Burger Poisson Croustillant',
    dimensions: 'Filet de Poisson Pané • Sauce Tartare • Salade',
    price_fcfa: 4500,
    price_eur: 7,
    rating: 4.7,
    reviews_count: 52,
    badge: 'CRISPY FISH',
    badge_color: 'bg-cyan-600 text-white font-bold',
    image_url: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Délicieux filet de poisson blanc pané doré minute, sauce tartare maison aux herbes fraîches, cornichons croquants et salade iceberg dans un pain brioché.',
    features: ['Poisson pané croustillant', 'Sauce tartare maison', 'Salade iceberg fraîche', 'Bun brioché'],
    popular: false
  },
  {
    id: 'burgys-07',
    title: 'Curly Fries Burgys (Culte !)',
    category: 'Sides & Frites',
    format: 'Portion Frites Torsadées',
    dimensions: 'Frites Torsadées Croustillantes • Épices Secrètes',
    price_fcfa: 2000,
    price_eur: 3,
    rating: 5.0,
    reviews_count: 210,
    badge: 'CULTE ⭐',
    badge_color: 'bg-amber-400 text-slate-950 font-black',
    image_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'La signature incontournable de Burgys Gabon ! Des frites torsadées dorées à la perfection, assaisonnées d’un mélange secret d’épices douces savoureuses.',
    features: ['Frites en spirale ultra-croustillantes', 'Assaisonnement secret Burgys', 'Servies chaudes minute', 'Sauce au choix incluse'],
    popular: true
  },
  {
    id: 'burgys-08',
    title: 'Loaded Cheese & Bacon Fries',
    category: 'Sides & Frites',
    format: 'Frites Gourmandes Nappées',
    dimensions: 'Grande Portion Frites • Cheddar Coulant • Éclats Bacon',
    price_fcfa: 3000,
    price_eur: 4.5,
    rating: 4.9,
    reviews_count: 134,
    badge: 'CHEDDAR MELT 🧀',
    badge_color: 'bg-yellow-500 text-slate-950 font-black',
    image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Grande portion de frites croustillantes généreusement nappée de sauce cheddar anglaise chaude et coulante, parsemée de véritables éclats de bacon croustillant.',
    features: ['Cheddar chaud coulant', 'Bacon grillé en éclats', 'Portion généreuse à partager', 'Frites dorées fraîches'],
    popular: true
  },
  {
    id: 'burgys-09',
    title: 'Crispy Chicken Tenders (x5)',
    category: 'Poulet & Tenders',
    format: '5 Aiguillettes de Poulet Panées',
    dimensions: '100% Filet Poulet • Panure Croustillante • 2 Sauces',
    price_fcfa: 3500,
    price_eur: 5.5,
    rating: 4.8,
    reviews_count: 88,
    badge: '100% POULET',
    badge_color: 'bg-rose-500 text-white font-bold',
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80'
    ],
    description: '5 aiguillettes de poulet marinées aux herbes et panées dans une chapelure ultra-croustillante. Servies bien chaudes avec 2 sauces au choix (BBQ, Mayo épicée, Ail).',
    features: ['Véritable filet de poulet', 'Panure dorée croustillante', '2 sauces offertes', 'Idéal à grignoter ou en menu'],
    popular: true
  },
  {
    id: 'burgys-10',
    title: 'Menu Combo Big Hero (Complet)',
    category: 'Menus Combos',
    format: 'Menu Complet avec Boisson',
    dimensions: '1 Burger Big Hero + 1 Curly Fries + 1 Boisson 33cl',
    price_fcfa: 7000,
    price_eur: 11,
    rating: 5.0,
    reviews_count: 175,
    badge: 'OFFRE COMBO 🔥',
    badge_color: 'bg-red-600 text-white font-black',
    image_url: 'https://www.retailgroup-brands.com/assets/burgys-DDjXYIWF.jpg',
    images: [
      'https://www.retailgroup-brands.com/assets/burgys-DDjXYIWF.jpg'
    ],
    description: 'Le festin solo complet de référence : 1 Burger Big Hero double steak cheddar + 1 portion généreuse de célèbres Curly Fries torsadées + 1 boisson fraîche 33cl au choix.',
    features: ['Burger Big Hero géant', 'Curly Fries torsadées incluses', 'Boisson fraîche 33cl au choix', 'Économie de 1 000 FCFA'],
    popular: true
  },
  {
    id: 'burgys-11',
    title: 'Box Party Tenders & Fries (Partage)',
    category: 'Menus Combos',
    format: 'Box Partage 2-3 personnes',
    dimensions: '8 Tenders Poulet • 2 Curly Fries • 4 Sauces • 2 Boissons',
    price_fcfa: 10500,
    price_eur: 16,
    rating: 4.9,
    reviews_count: 68,
    badge: 'FAMILY BOX 🎁',
    badge_color: 'bg-amber-500 text-slate-950 font-black',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Parfait pour vos soirées match ou repas entre amis : 8 tenders de poulet croustillants, 2 grandes portions de Curly Fries, 4 sauces dipping et 2 canettes fraîches.',
    features: ['8 Tenders croustillants', 'Double portion Curly Fries', '4 sauces dipping au choix', '2 boissons 33cl fraîches'],
    popular: true
  },
  {
    id: 'burgys-12',
    title: 'Milkshake Gourmet Onctueux',
    category: 'Boissons & Desserts',
    format: 'Grand Gobelet 40cl',
    dimensions: 'Glace Artisanale • Lait Frais • Topping Chantilly',
    price_fcfa: 2500,
    price_eur: 4,
    rating: 4.9,
    reviews_count: 82,
    badge: 'GOURMAND 🍧',
    badge_color: 'bg-pink-500 text-white font-bold',
    image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Milkshake onctueux mixé minute avec de la glace premium et du lait entier. Parfum au choix : Vanille Bourbon, Chocolat Intense, Fraise des bois, Oreo ou Caramel beurre salé.',
    features: ['Mixé minute ultra-onctueux', 'Glace de qualité supérieure', 'Chantilly & nappage gourmand', '5 parfums disponibles'],
    popular: true
  },
  {
    id: 'burgys-13',
    title: 'Canette Fraîche 33cl Glacée',
    category: 'Boissons & Desserts',
    format: 'Canette 33cl',
    dimensions: 'Coca-Cola • Fanta • Sprite • Djino • Schweppes',
    price_fcfa: 1000,
    price_eur: 1.5,
    rating: 4.7,
    reviews_count: 45,
    badge: 'GLACÉ 🥤',
    badge_color: 'bg-slate-700 text-white font-medium',
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Votre soda favori servi ultra-frais pour accompagner vos burgers et frites (Coca-Cola Original, Coca Zéro, Fanta Orange, Sprite Citron, Djino Pamplemousse).',
    features: ['Canette 33cl fraîche', 'Choix du parfum sur WhatsApp', 'Paille incluse'],
    popular: false
  },
  {
    id: 'burgys-14',
    title: 'Eau Minérale Naturelle Andza 50cl',
    category: 'Boissons & Desserts',
    format: 'Bouteille 50cl',
    dimensions: 'Pure Eau Minérale du Gabon',
    price_fcfa: 500,
    price_eur: 0.8,
    rating: 4.8,
    reviews_count: 30,
    badge: 'NATURELLE 💧',
    badge_color: 'bg-blue-600 text-white font-medium',
    image_url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'L’eau minérale emblématique du Gabon, fraîche et désaltérante.',
    features: ['Source naturelle des plateaux Batéké', 'Servie bien fraîche', '50cl format individuel'],
    popular: false
  }
];

// Image de secours absolue pour tout plat qui échoue
const FALLBACK_BURGER_IMG = 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80';

// Catégories officielles de BURGYS GABON
const CATEGORIES = [
  { id: 'all', label: 'Tout', icon: Utensils },
  { id: 'Burgers', label: 'Burgers', icon: Layers },
  { id: 'Sides & Frites', label: 'Frites & Sides', icon: Flame },
  { id: 'Poulet & Tenders', label: 'Tenders & Poulet', icon: Sparkles },
  { id: 'Menus Combos', label: 'Combos & Box', icon: Tag },
  { id: 'Boissons & Desserts', label: 'Boissons & Shakes', icon: Coffee }
];

export function BurgysFastFoodView({
  settings = {},
  posters = [],
  currency = 'XAF',
  whatsappNumber = '24165009000',
  onNavigateAdmin,
  isPreview = false
}) {
  // Fusionner les plats de la BD avec ceux par défaut de Burgys
  const menuItems = useMemo(() => {
    if (posters && posters.length > 0) {
      return posters.map((p, idx) => {
        let cleanImg = p.image_url || FALLBACK_BURGER_IMG;
        if (cleanImg.includes('photo-1576107232684-1279f3908594')) {
          cleanImg = 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80';
        } else if (cleanImg.includes('photo-1559839914-ba2a95c9a762')) {
          cleanImg = 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80';
        }
        return {
          id: p.id || `dish-${idx}`,
          title: p.title || 'Plat Burgys',
          category: p.category || (idx % 2 === 0 ? 'Burgers' : 'Sides & Frites'),
          format: p.format || 'Menu Burger',
          dimensions: p.dimensions || 'Préparé minute avec des produits frais',
          price_fcfa: Number(p.price_fcfa) || 4500,
          price_eur: Number(p.price_eur) || Math.round(Number(p.price_fcfa) / 655) || 7,
          rating: p.rating || 4.8,
          reviews_count: p.reviews_count || (85 + (idx * 7)),
          badge: p.badge || (idx === 0 ? 'SIGNATURE ⭐' : 'POPULAIRE'),
          badge_color: p.badge_color || (idx === 0 ? 'bg-rose-600 text-white font-black' : 'bg-amber-500 text-slate-950 font-black'),
          image_url: cleanImg,
          images: [cleanImg],
          description: p.description || 'Burger gourmet préparé minute à la commande avec des ingrédients de qualité.',
          features: Array.isArray(p.features) ? p.features : ['Cuisiné minute', 'Qualité garantie', 'Livraison rapide'],
          popular: p.popular !== undefined ? Boolean(p.popular) : (idx < 6)
        };
      });
    }
    return DEFAULT_BURGYS_ITEMS;
  }, [posters]);

  // États de l'interface
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState(null);
  const [favorites, setFavorites] = useState({});

  // Panier & Commandes
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Espace Client ("Mon Espace")
  const [isClientSpaceOpen, setIsClientSpaceOpen] = useState(false);
  const [clientSpaceTab, setClientSpaceTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');

  // Personnalisation plat (Screen 2)
  const [dishSize, setDishSize] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const [supplements, setSupplements] = useState({
    addCheese: false,
    extraPatty: false,
    addCurlyFries: false,
    addSaucePiquante: false,
    addDrink: false
  });

  // Mode de livraison / Table
  const [orderType, setOrderType] = useState('livraison');
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [deliveryCity, setDeliveryCity] = useState('Glass');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Géolocalisation GPS en direct
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoSuccessMessage, setGeoSuccessMessage] = useState('');
  const [geoErrorMessage, setGeoErrorMessage] = useState('');

  // Affiliation / Parrainage
  const [copiedReferral, setCopiedReferral] = useState(false);
  const referralCode = 'BURGY-VIP77';
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?t=burgys-gabon&ref=${referralCode}`
    : `https://digital-mark-pro.mynexus.workers.dev/?t=burgys-gabon&ref=${referralCode}`;

  // Identité de l'enseigne Burgys Gabon
  const restaurantName = settings.company_name || 'Burgys Gabon';
  const restaurantLogo = settings.company_logo_url || 'https://www.retailgroup-brands.com/assets/burgys-Cu7iutVY.png';
  const targetWhatsapp = (settings.whatsapp_number || whatsappNumber || '24165009000').replace(/[^0-9]/g, '');
  const heroTitle = settings.hero_title || 'Burgys Gabon';
  const heroBadge = settings.hero_badge || '🍔 FIVE STAR BURGERS · LIBREVILLE';
  const heroSubtitle = settings.hero_subtitle || 'Steaks grillés minute à la flamme, buns briochés dorés et nos légendaires Curly Fries !';
  const promoTitle = settings.promo_combo_title || 'Menu Combo Big Hero + Curly Fries';
  const promoBadge = settings.promo_combo_badge || 'OFFRE DU MOMENT 🔥';
  const promoDiscount = settings.promo_combo_discount || '7 000 FCFA';
  const promoOldPrice = settings.promo_combo_old_price || '8 000 FCFA';
  const promoImage = settings.hero_banner_image || 'https://www.retailgroup-brands.com/assets/burgys-DDjXYIWF.jpg';
  const showPromoCombo = settings.show_promo_combo !== false && settings.show_promo_combo !== 'false';
  const instagramUrl = settings.instagram_url || 'https://www.instagram.com/burgys.gabon/';
  const facebookUrl = settings.facebook_url || 'https://www.facebook.com/p/Burgys-Gabon-61568903933765/';
  const phoneDisplay = settings.phone_display || '065 00 90 00 / 011 44 11 11';

  // Historique des commandes du client stocké en LocalStorage
  const storageOrderKey = useMemo(() => {
    return 'dmp_orders_burgys-gabon';
  }, []);

  const [orders, setOrders] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(storageOrderKey);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {}
    return [
      {
        id: 'BG-8924',
        date: 'Aujourd’hui à 12:45',
        type: 'livraison',
        destination: 'Livraison Glass (en face pharmacie)',
        status: 'en_cours',
        statusLabel: 'En cours de préparation 🔥',
        statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        total: 7000,
        items: [
          { title: 'Menu Combo Big Hero (Complet)', size: 'Regular', quantity: 1, price: 7000, extras: ['Extra Cheddar Fondu'] }
        ]
      },
      {
        id: 'BG-7510',
        date: 'Hier à 19:30',
        type: 'livraison',
        destination: 'Livraison Nzeng-Ayong',
        status: 'livre',
        statusLabel: 'Livré avec succès ✅',
        statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        total: 12500,
        items: [
          { title: 'Double Burgy Bacon Cheese', size: 'Large', quantity: 1, price: 7000, extras: ['Extra Cheddar'] },
          { title: 'Crispy Chicken Tenders (x5)', size: 'Regular', quantity: 1, price: 3500, extras: [] },
          { title: 'Curly Fries Burgys (Culte !)', size: 'Regular', quantity: 1, price: 2000, extras: [] }
        ]
      }
    ];
  });

  // Géolocalisation GPS en un clic
  const handleGetLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGeoErrorMessage('La géolocalisation n’est pas supportée par votre navigateur.');
      return;
    }
    setGeoLoading(true);
    setGeoErrorMessage('');
    setGeoSuccessMessage('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coordsObj = {
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
          mapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
          accuracy: Math.round(accuracy)
        };
        setGeoCoords(coordsObj);
        setGeoLoading(false);
        setGeoSuccessMessage(`Position GPS détectée avec succès (précision ~${Math.round(accuracy)}m) !`);
        setDeliveryAddress(prev => prev ? `${prev} (GPS: ${coordsObj.mapsUrl})` : `Repère GPS exact : ${coordsObj.mapsUrl}`);
      },
      (err) => {
        setGeoLoading(false);
        setGeoErrorMessage('Impossible de détecter votre position. Veuillez autoriser l’accès GPS dans votre navigateur.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCopyReferral = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 3000);
    }
  };

  const handleShareReferralWhatsApp = () => {
    const text = `🍔 Salut ! Commande les meilleurs burgers et Curly Fries de Libreville chez Burgys Gabon avec mon lien de parrainage et bénéficie d'une réduction exclusive : ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReorder = (order) => {
    const newItems = order.items.map((item, idx) => ({
      cartId: `reorder-${Date.now()}-${idx}`,
      dish: menuItems.find(m => m.title.toLowerCase().includes(item.title.toLowerCase())) || menuItems[0],
      size: item.size || 'Regular',
      supplements: item.extras || [],
      quantity: item.quantity || 1,
      unitPrice: Math.round(item.price / (item.quantity || 1)),
      totalPrice: item.price
    }));
    setCart(prev => [...prev, ...newItems]);
    setIsClientSpaceOpen(false);
    setIsCartOpen(true);
  };

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

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders;
    return orders.filter(o => o.status === orderFilter);
  }, [orders, orderFilter]);

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
      addCurlyFries: false,
      addSaucePiquante: false,
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
    if (supps.addCurlyFries) base += 1500;
    if (supps.addSaucePiquante) base += 300;
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
    if (supplements.addCheese) suppList.push('Extra Cheddar Fondu (+500 F)');
    if (supplements.extraPatty) suppList.push('Double Steak Bœuf (+1 500 F)');
    if (supplements.addCurlyFries) suppList.push('Portion Curly Fries (+1 500 F)');
    if (supplements.addSaucePiquante) suppList.push('Sauce Secrète Piquante (+300 F)');
    if (supplements.addDrink) suppList.push('Boisson Canette 33cl (+1 000 F)');

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
    let destinationLabel = '';
    if (orderType === 'table') {
      destinationInfo = `🍽️ *SUR PLACE À TABLE :* ${tableNumber || 'Table non précisée'}`;
      destinationLabel = `Sur place à table (${tableNumber || 'Table 1'})`;
    } else if (orderType === 'livraison') {
      destinationInfo = `🛵 *LIVRAISON À DOMICILE :*\n📍 Zone : *${deliveryCity}*\n🏠 Adresse / Repère : *${deliveryAddress || 'Non précisé'}*\n👤 Client : *${clientName || 'Gourmand Burgys'}* (Tél: ${clientPhone || 'Voir WhatsApp'})`;
      destinationLabel = `Livraison à ${deliveryCity} (${deliveryAddress || 'Adresse en cours'})`;
    } else {
      destinationInfo = `🛍️ *À EMPORTER (RETRAIT COMPTOIR)*\n👤 Client : *${clientName || 'Gourmand Burgys'}*`;
      destinationLabel = 'Retrait au comptoir';
    }

    let itemsList = '';
    const recordedItems = [];
    cart.forEach((item, idx) => {
      itemsList += `\n${idx + 1}. *${item.dish.title}* (${item.size})\n   ↳ Qté : ${item.quantity} x ${item.unitPrice.toLocaleString('fr-FR')} F = *${item.totalPrice.toLocaleString('fr-FR')} FCFA*`;
      if (item.supplements.length > 0) {
        itemsList += `\n   ↳ Extras : ${item.supplements.join(', ')}`;
      }
      recordedItems.push({
        title: item.dish.title,
        size: item.size,
        quantity: item.quantity,
        price: item.totalPrice,
        extras: item.supplements
      });
    });

    const newOrderId = `BG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderEntry = {
      id: newOrderId,
      date: 'À l’instant',
      type: orderType,
      destination: destinationLabel,
      status: 'en_cours',
      statusLabel: 'En cours de préparation 🔥',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      total: cartTotalFcfa,
      items: recordedItems
    };

    const updated = [newOrderEntry, ...orders];
    setOrders(updated);
    try {
      localStorage.setItem(storageOrderKey, JSON.stringify(updated));
    } catch (e) {}

    const primaryDishImage = cart[0]?.dish?.image_url || promoImage;
    const absoluteDishImage = primaryDishImage.startsWith('http')
      ? primaryDishImage
      : `https://digital-mark-pro.mynexus.workers.dev${primaryDishImage.startsWith('/') ? '' : '/'}${primaryDishImage}`;

    let gpsNotice = '';
    if (geoCoords && geoCoords.mapsUrl) {
      gpsNotice = `\n📍 *Position GPS exacte du client :* ${geoCoords.mapsUrl}\n`;
    }

    const message = `🍔 *NOUVELLE COMMANDE — BURGYS GABON (FIVE STAR BURGERS)* 🍔\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔖 *Référence Commande : ${newOrderId}*\n` +
      `${destinationInfo}\n` +
      gpsNotice +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *DÉTAIL DE LA COMMANDE :*${itemsList}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *TOTAL À REGLER : ${cartTotalFcfa.toLocaleString('fr-FR')} FCFA*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📸 *Aperçu de la commande :* ${absoluteDishImage}\n\n` +
      `_Envoyé depuis le Menu Digital Burgys Gabon (Glass & Nzeng-Ayong)._`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${targetWhatsapp}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-slate-100 font-sans selection:bg-red-500 selection:text-white relative overflow-x-hidden pb-28">

      {/* LUEUR VIBRANTE BURGYS EN ARRIÈRE-PLAN */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-28 -left-20 w-[440px] h-[440px] bg-gradient-to-br from-red-600/35 via-rose-600/25 to-transparent rounded-full blur-[100px] animate-pulse duration-1000" />
        <div className="absolute top-[20%] -right-20 w-[380px] h-[380px] bg-gradient-to-bl from-amber-500/30 via-orange-600/20 to-transparent rounded-full blur-[90px]" />
        <div className="absolute top-[48%] left-[5%] w-[340px] h-[340px] bg-red-700/15 rounded-full blur-[110px]" />
        <div className="absolute -bottom-24 right-[10%] w-[440px] h-[440px] bg-gradient-to-tr from-amber-600/25 via-red-600/20 to-transparent rounded-full blur-[120px]" />
      </div>

      {/* CONTENEUR MOBILE-FIRST */}
      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col px-4 pt-4 pb-6">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsClientSpaceOpen(true)}
              className="w-10 h-10 rounded-2xl bg-white/8 backdrop-blur-xl border border-white/15 flex items-center justify-center text-amber-400 hover:bg-white/15 hover:text-white transition-all shadow-md cursor-pointer"
              title="Ouvrir Mon Espace Client (Commandes, Affiliation, GPS)"
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if ('Notification' in window) {
                  Notification.requestPermission().then((perm) => {
                    if (perm === 'granted') {
                      alert('🔔 Notifications Burgys Gabon activées ! Vous recevrez nos offres exclusives et nouveaux burgers.');
                    } else {
                      alert('Notifications push bloquées ou désactivées dans votre navigateur.');
                    }
                  });
                } else {
                  alert('🔔 Burgys Gabon : Offres exclusives disponibles au 065 00 90 00 !');
                }
              }}
              className="relative w-10 h-10 rounded-2xl bg-red-500/15 backdrop-blur-xl border border-red-400/30 flex items-center justify-center text-red-400 hover:bg-red-500/25 hover:text-white transition-all shadow-md cursor-pointer"
              title="Activer les Alertes & Nouveaux Burgers Burgys"
            >
              <Bell className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 shadow-[0_0_8px_#fbbf24]" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1px] flex items-center justify-center hover:scale-105 transition-transform"
              title="Suivez Burgys Gabon sur Instagram"
            >
              <div className="w-full h-full bg-[#0a0b10] rounded-[11px] flex items-center justify-center text-white hover:text-rose-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </div>
            </a>

            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-600 transition-colors shadow-md"
              title="Suivez Burgys Gabon sur Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>

            <div className="relative pl-1">
              <img
                src={restaurantLogo}
                alt={restaurantName}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_BURGER_IMG; }}
                className="w-11 h-11 rounded-2xl object-contain bg-black/60 p-1 border-2 border-amber-500/50 shadow-[0_4px_16px_rgba(220,38,38,0.4)]"
              />
            </div>
          </div>
        </header>

        {/* BANDEAU BURGYS GABON */}
        <div className="mb-4 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600/20 text-amber-300 border border-red-500/30 backdrop-blur-md">
            <span>{heroBadge}</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Burgys</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
              Gabon
            </span>
          </h1>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium">
            <button
              onClick={() => {
                setClientSpaceTab('about');
                setIsClientSpaceOpen(true);
              }}
              className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Glass (après KFC) & Nzeng-Ayong</span>
            </button>

            <a
              href={`https://wa.me/${targetWhatsapp}?text=${encodeURIComponent('Bonjour Burgys Gabon, je souhaite passer commande !')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-400/30 text-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-500/25 transition-colors font-mono font-bold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{phoneDisplay.split('/')[0].trim()}</span>
            </a>
          </div>
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="relative mb-5">
          <div className="flex items-center gap-2.5 bg-white/8 backdrop-blur-2xl border border-white/15 rounded-2xl px-3.5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_2px_rgba(255,255,255,0.15)] focus-within:border-red-400/80 focus-within:bg-white/12 transition-all">
            <Search className="w-5 h-5 text-amber-400/80 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un burger, frites, tenders, shake..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-400/60 focus:outline-none"
            />
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setSelectedCategory('all')}
                className="p-1.5 rounded-xl bg-white/10 text-amber-300 hover:bg-white/20 transition-colors cursor-pointer"
                title="Toutes les catégories"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CATÉGORIES */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mb-5 scrollbar-none -mx-4 px-4">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 flex flex-col items-center justify-center gap-1.5 w-18 h-18 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-red-600 via-rose-600 to-amber-600 border-amber-300/40 text-white shadow-[0_10px_25px_rgba(220,38,38,0.5)] scale-105 font-black'
                    : 'bg-white/6 backdrop-blur-xl border-white/10 text-slate-300 hover:bg-white/12 hover:border-white/25 hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white stroke-[2.5]' : 'text-amber-400'}`} />
                <span className="text-[11px] font-medium leading-none truncate max-w-[64px]">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* BANNIÈRE PROMO */}
        {showPromoCombo && selectedCategory === 'all' && !searchQuery && (
          <div className="relative mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-red-950/60 via-[#181014]/85 to-[#0d0e14]/95 backdrop-blur-2xl border border-red-500/30 p-5 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_2px_rgba(255,255,255,0.2)]">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5 z-10 flex-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-red-600/30 px-2.5 py-0.5 rounded-full border border-red-400/30 backdrop-blur-md">
                  <Flame className="w-3 h-3 text-red-400 fill-red-400" />
                  {promoBadge}
                </span>
                <h3 className="text-base font-black text-white leading-tight drop-shadow-sm">
                  {promoTitle}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-amber-400 font-mono drop-shadow">
                    {promoDiscount}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {promoOldPrice}
                  </span>
                </div>
                <div className="pt-1.5">
                  <button
                    onClick={() => {
                      const comboItem = menuItems.find(m => m.id === 'burgys-10') || menuItems[0];
                      openDishCustomizer(comboItem);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white text-xs font-black shadow-[0_4px_20px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Commander ce Combo
                  </button>
                </div>
              </div>

              <div className="relative w-36 h-32 shrink-0 flex items-center justify-center">
                <img
                  src={promoImage}
                  alt={promoTitle}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_BURGER_IMG; }}
                  className="w-full h-full object-cover rounded-2xl border border-amber-400/20 shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION LA CARTE BURGYS */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>La Carte Burgys</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                {filteredDishes.length}
              </span>
            </h2>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-bold text-amber-400 hover:text-white transition-colors"
            >
              Tout afficher
            </button>
          </div>

          {/* GRILLE DES PLATS (AVEC ONERROR FALLBACK STRICT) */}
          <div className="grid grid-cols-2 gap-3.5">
            {filteredDishes.map((dish) => {
              const isFav = Boolean(favorites[dish.id]);
              return (
                <div
                  key={dish.id}
                  onClick={() => openDishCustomizer(dish)}
                  className="group relative bg-gradient-to-b from-white/8 via-[#161824]/60 to-[#0e1017]/80 backdrop-blur-2xl border border-white/10 hover:border-red-500/50 rounded-3xl p-3 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_32px_rgba(220,38,38,0.25)] hover:-translate-y-1 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2 z-10">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm ${dish.badge_color || 'bg-red-600 text-white font-black'}`}>
                      {dish.badge || 'BURGYS'}
                    </span>
                    <button
                      onClick={(e) => toggleFavorite(e, dish.id)}
                      className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="relative w-full h-28 my-1 flex items-center justify-center bg-black/30 rounded-2xl overflow-hidden">
                    <img
                      src={dish.image_url}
                      alt={dish.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_BURGER_IMG;
                      }}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300 shadow-md border border-white/10"
                    />
                  </div>

                  <div className="space-y-1 mt-2">
                    <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {dish.title}
                    </h3>
                    <p className="text-[10px] text-slate-300/70 line-clamp-1">
                      {dish.dimensions || dish.category}
                    </p>

                    <div className="flex items-center justify-between pt-1.5">
                      <div className="space-y-0.5">
                        <span className="text-xs md:text-sm font-black text-amber-300 font-mono">
                          {dish.price_fcfa.toLocaleString('fr-FR')} F
                        </span>
                        <span className="block text-[9px] text-slate-400 font-mono">
                          ~ {dish.price_eur} €
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDishCustomizer(dish);
                        }}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(220,38,38,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
            <div className="p-8 text-center bg-[#151722]/50 rounded-3xl border border-red-500/20 space-y-3">
              <Utensils className="w-8 h-8 text-amber-400/50 mx-auto" />
              <p className="text-xs text-slate-400">
                Aucun plat ne correspond à votre recherche "{searchQuery}".
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-xs text-amber-400 font-bold underline"
              >
                Réinitialiser la carte
              </button>
            </div>
          )}
        </div>

      </div>

      {/* SCREEN 2 : CUSTOMIZE MODAL */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md mx-auto h-[92vh] flex flex-col rounded-t-[36px] overflow-hidden bg-gradient-to-b from-[#181116]/95 via-[#11131c]/95 to-[#0a0b10]/98 backdrop-blur-3xl border-t border-x border-red-500/30 shadow-[0_-25px_60px_rgba(0,0,0,0.85)] relative">
            <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between">
              <button
                onClick={() => setSelectedDish(null)}
                className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors shadow-lg cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => toggleFavorite(e, selectedDish.id)}
                className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:text-rose-400 transition-colors shadow-lg cursor-pointer"
              >
                <Heart className={`w-5 h-5 ${favorites[selectedDish.id] ? 'text-rose-500 fill-rose-500' : ''}`} />
              </button>
            </div>

            <div className="relative w-full h-[36vh] shrink-0 bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={selectedDish.image_url}
                alt={selectedDish.title}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_BURGER_IMG; }}
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181116] via-transparent to-black/40" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-28 space-y-4 -mt-6 relative z-10">
              <div className="bg-gradient-to-b from-white/10 via-[#1e141a]/60 to-[#12131d]/70 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600/30 text-amber-300 border border-red-500/40 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{selectedDish.badge || 'BURGYS FIVE STAR'}</span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-black text-white leading-tight drop-shadow-sm">
                    {selectedDish.title}
                  </h2>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-amber-400 font-mono drop-shadow">
                      {selectedDish.price_fcfa.toLocaleString('fr-FR')} F
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      ~ {selectedDish.price_eur} €
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="font-extrabold text-white">{selectedDish.rating || 4.9}</span>
                  </div>
                  <span className="text-slate-400">({selectedDish.reviews_count || 120} avis gourmands)</span>
                </div>

                <FormattedProductDescription
                  description={selectedDish.description}
                  isDarkMode={true}
                  className="pt-1"
                />
              </div>

              <div className="space-y-3.5 bg-gradient-to-b from-white/8 via-[#181119]/50 to-[#11131c]/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span>Personnalisez votre Burger</span>
                  <span className="text-[10px] text-slate-400 font-normal">Selon vos envies</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-200">Format & Portion</label>
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
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-black border-amber-300/40 shadow-[0_4px_16px_rgba(220,38,38,0.5)]'
                            : 'bg-white/6 backdrop-blur-md border-white/10 text-slate-300 hover:bg-white/12'
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

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/6 backdrop-blur-md border border-white/10 hover:border-amber-400/30 transition-all">
                    <span className="text-xs text-white flex items-center gap-2">
                      <span>🧀 Extra Cheddar Fondu</span>
                      <strong className="text-[10px] text-amber-400 font-mono">+500 F</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSupplements(s => ({ ...s, addCheese: !s.addCheese }))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        supplements.addCheese ? 'bg-gradient-to-r from-red-600 to-amber-500 shadow-md' : 'bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        supplements.addCheese ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/6 backdrop-blur-md border border-white/10 hover:border-amber-400/30 transition-all">
                    <span className="text-xs text-white flex items-center gap-2">
                      <span>🥩 Double Steak Bœuf Pur</span>
                      <strong className="text-[10px] text-amber-400 font-mono">+1 500 F</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSupplements(s => ({ ...s, extraPatty: !s.extraPatty }))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        supplements.extraPatty ? 'bg-gradient-to-r from-red-600 to-amber-500 shadow-md' : 'bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        supplements.extraPatty ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/6 backdrop-blur-md border border-white/10 hover:border-amber-400/30 transition-all">
                    <span className="text-xs text-white flex items-center gap-2">
                      <span>🍟 Portion Curly Fries Torsadées</span>
                      <strong className="text-[10px] text-amber-400 font-mono">+1 500 F</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSupplements(s => ({ ...s, addCurlyFries: !s.addCurlyFries }))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        supplements.addCurlyFries ? 'bg-gradient-to-r from-red-600 to-amber-500 shadow-md' : 'bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        supplements.addCurlyFries ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/6 backdrop-blur-md border border-white/10 hover:border-amber-400/30 transition-all">
                    <span className="text-xs text-white flex items-center gap-2">
                      <span>🌶️ Sauce Secrète Piquante Burgys</span>
                      <strong className="text-[10px] text-amber-400 font-mono">+300 F</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSupplements(s => ({ ...s, addSaucePiquante: !s.addSaucePiquante }))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        supplements.addSaucePiquante ? 'bg-gradient-to-r from-red-600 to-amber-500 shadow-md' : 'bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        supplements.addSaucePiquante ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/6 backdrop-blur-md border border-white/10 hover:border-amber-400/30 transition-all">
                    <span className="text-xs text-white flex items-center gap-2">
                      <span>🥤 Canette Fraîche 33cl au Choix</span>
                      <strong className="text-[10px] text-amber-400 font-mono">+1 000 F</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSupplements(s => ({ ...s, addDrink: !s.addDrink }))}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        supplements.addDrink ? 'bg-gradient-to-r from-red-600 to-amber-500 shadow-md' : 'bg-slate-700/80'
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

            <div className="absolute bottom-0 inset-x-0 bg-[#0c0d14]/90 backdrop-blur-2xl border-t border-white/15 p-4 flex items-center justify-between gap-3 z-30 shadow-[0_-10px_35px_rgba(0,0,0,0.7)]">
              <div className="flex items-center gap-3 bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-white/10 text-amber-400 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-black text-sm text-white w-4 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-7 h-7 rounded-lg bg-white/10 text-amber-400 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-black text-xs md:text-sm flex items-center justify-between shadow-[0_6px_25px_rgba(220,38,38,0.55)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  <span>Ajouter au Panier</span>
                </span>
                <span className="font-mono text-sm border-l border-white/25 pl-3">
                  {currentCustomizedPrice.toLocaleString('fr-FR')} F
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DOCK BAR DE BURGYS GABON (AVEC MON ESPACE) */}
      <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40">
        <div className="bg-[#12131d]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-2 flex items-center justify-around shadow-[0_15px_40px_rgba(0,0,0,0.7)]">

          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setIsCartOpen(false); setIsClientSpaceOpen(false); }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 transition-colors cursor-pointer ${
              !isClientSpaceOpen && !isCartOpen ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] font-bold">Carte</span>
          </button>

          <button
            onClick={() => {
              const comboItem = menuItems.find(m => m.id === 'burgys-10') || menuItems[0];
              openDishCustomizer(comboItem);
            }}
            className="flex flex-col items-center gap-1 py-1.5 px-3 text-slate-300 hover:text-amber-400 transition-colors"
          >
            <Flame className="w-5 h-5 text-red-400" />
            <span className="text-[10px] font-medium">Offres</span>
          </button>

          <button
            onClick={() => { setIsCartOpen(true); setIsClientSpaceOpen(false); }}
            className="relative -mt-6 w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-black flex items-center justify-center border-2 border-slate-900 animate-pulse">
                {cartTotalCount}
              </span>
            )}
          </button>

          {/* BOUTON MON ESPACE (BURGYS GABON) */}
          <button
            onClick={() => { setIsClientSpaceOpen(true); setIsCartOpen(false); }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 transition-colors cursor-pointer ${
              isClientSpaceOpen ? 'text-amber-400 font-bold scale-105' : 'text-slate-300 hover:text-amber-400'
            }`}
          >
            <div className="relative">
              <User className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
            </div>
            <span className="text-[10px] font-medium">Mon Espace</span>
          </button>

          <a
            href={`https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(`Bonjour Burgys Gabon, je souhaite me faire livrer un repas.`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 py-1.5 px-3 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">WhatsApp</span>
          </a>

        </div>
      </div>

      {/* MODAL MON ESPACE CLIENT */}
      {isClientSpaceOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md mx-auto h-[90vh] flex flex-col rounded-t-[36px] bg-[#10121b] border-t border-x border-red-500/30 shadow-2xl relative overflow-hidden">

            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 p-[1px] flex items-center justify-center">
                  <div className="w-full h-full bg-[#10121b] rounded-[15px] flex items-center justify-center text-amber-400">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">Mon Espace Client</h3>
                    <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                      VIP BURGYS ⭐
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Commandes, Parrainage & Localisation Express</p>
                </div>
              </div>

              <button
                onClick={() => setIsClientSpaceOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 p-2 bg-[#0c0d14] border-b border-white/10 overflow-x-auto scrollbar-none">
              {[
                { id: 'orders', label: 'Commandes', icon: ShoppingBag, count: orders.length },
                { id: 'affiliation', label: 'Affiliation & Bonus', icon: Gift, badge: 'Nouveau' },
                { id: 'location', label: 'Localisation GPS', icon: Navigation },
                { id: 'about', label: 'À Propos', icon: Info },
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = clientSpaceTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setClientSpaceTab(tab.id)}
                    className={`shrink-0 flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-300'}`}>
                        {tab.count}
                      </span>
                    )}
                    {tab.badge && (
                      <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-black">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ONGLET 1 : COMMANDES */}
              {clientSpaceTab === 'orders' && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: 'all', label: 'Toutes' },
                      { id: 'en_cours', label: 'En cours 🔥' },
                      { id: 'livre', label: 'Livrées ✅' },
                      { id: 'annule', label: 'Annulées ❌' },
                    ].map(flt => (
                      <button
                        key={flt.id}
                        onClick={() => setOrderFilter(flt.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          orderFilter === flt.id
                            ? 'bg-amber-400 text-slate-950 font-black border-amber-300'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {flt.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {filteredOrders.map(order => (
                      <div
                        key={order.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2.5 shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-amber-300">
                              #{order.id}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              • {order.date}
                            </span>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${order.statusColor}`}>
                            {order.statusLabel}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="truncate">{order.destination}</span>
                        </div>

                        <div className="bg-black/30 rounded-xl p-2.5 space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-slate-200">
                                {it.quantity}x {it.title} <span className="text-[10px] text-slate-400">({it.size})</span>
                              </span>
                              <span className="font-mono text-amber-300 font-bold">
                                {it.price.toLocaleString('fr-FR')} F
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Total payé</span>
                            <span className="text-sm font-mono font-black text-white">
                              {order.total.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReorder(order)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Recommander</span>
                            </button>

                            <a
                              href={`https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(`Bonjour Burgys Gabon, je souhaite suivre l'état de ma commande #${order.id}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 flex items-center gap-1 transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Suivre</span>
                            </a>
                          </div>
                        </div>

                      </div>
                    ))}

                    {filteredOrders.length === 0 && (
                      <div className="py-10 text-center text-slate-400 text-xs space-y-2">
                        <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                        <p>Aucune commande dans cette section.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ONGLET 2 : AFFILIATION */}
              {clientSpaceTab === 'affiliation' && (
                <div className="space-y-4">
                  <div className="relative rounded-3xl p-5 bg-gradient-to-br from-amber-500/25 via-red-950/40 to-black/80 border border-amber-400/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">Programme Ambassadeur</h4>
                          <p className="text-[10px] text-amber-300 font-medium">Gagnez du cashback & des burgers offerts</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                        ACTIF
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="bg-black/50 rounded-2xl p-2.5 text-center border border-white/10">
                        <div className="text-xl font-mono font-black text-amber-400">7</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-tight">Filleuls Inscrits</div>
                      </div>

                      <div className="bg-black/50 rounded-2xl p-2.5 text-center border border-white/10">
                        <div className="text-xl font-mono font-black text-emerald-400">3 500 F</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-tight">Bonus Cumulé</div>
                      </div>

                      <div className="bg-black/50 rounded-2xl p-2.5 text-center border border-white/10">
                        <div className="text-xl font-mono font-black text-rose-400">1 Offert</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-tight">Big Hero Burger</div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                      Partagez votre lien exclusif à vos amis à Libreville. Pour chaque commande passée avec votre lien, vous touchez <strong>500 FCFA</strong> de réduction directe sur vos burgers !
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <label className="text-xs font-bold text-white block">
                      Votre Lien de Parrainage Personnel :
                    </label>

                    <div className="flex items-center gap-2 bg-black/50 rounded-xl p-2 border border-white/15">
                      <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="bg-transparent text-xs text-amber-300 font-mono flex-1 outline-none truncate"
                      />
                      <button
                        onClick={handleCopyReferral}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedReferral ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedReferral ? 'Copié !' : 'Copier'}</span>
                      </button>
                    </div>

                    <button
                      onClick={handleShareReferralWhatsApp}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Partager mon lien sur WhatsApp à mes amis</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ONGLET 3 : LOCALISATION GPS */}
              {clientSpaceTab === 'location' && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-red-600/30 text-amber-400 flex items-center justify-center">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Localisation GPS Express</h4>
                        <p className="text-[10px] text-slate-400">Guidez le livreur Burgys au mètre près</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Cliquez sur le bouton ci-dessous pour capturer votre position satellite exacte à Libreville (Glass, Nzeng-Ayong, Akanda, etc.) afin que le livreur ne perde pas une minute.
                    </p>

                    <button
                      onClick={handleGetLocation}
                      disabled={geoLoading}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      <Compass className={`w-4 h-4 ${geoLoading ? 'animate-spin' : ''}`} />
                      <span>{geoLoading ? 'Acquisition du signal GPS...' : '📍 Détecter ma Position GPS Actuelle'}</span>
                    </button>

                    {geoSuccessMessage && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{geoSuccessMessage}</p>
                          <a
                            href={geoCoords?.mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-[11px] block mt-1 hover:text-white"
                          >
                            Ouvrir dans Google Maps ({geoCoords?.lat}, {geoCoords?.lng})
                          </a>
                        </div>
                      </div>
                    )}

                    {geoErrorMessage && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{geoErrorMessage}</span>
                      </div>
                    )}

                    {geoCoords && (
                      <a
                        href={`https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(`Bonjour Burgys Gabon, voici mon repère GPS exact pour ma livraison à Libreville : ${geoCoords.mapsUrl}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-500/30 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Envoyer ma position au livreur sur WhatsApp</span>
                      </a>
                    )}
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <h5 className="text-xs font-bold text-amber-300">Zones de Livraison Express Couvertes :</h5>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Glass (Rayon 5 min)', 'Nzeng-Ayong', 'Centre-Ville & Bord de Mer', 'Louis & Batterie 4', 'Akanda / Angondjé', 'Owendo'].map((z, idx) => (
                        <span key={idx} className="text-[10px] bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
                          {z}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 4 : À PROPOS */}
              {clientSpaceTab === 'about' && (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-lg">
                    <img
                      src="https://www.retailgroup-brands.com/assets/burgys-2-BaWNA7DF.jpg"
                      alt="Restaurant Burgys Gabon"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_BURGER_IMG; }}
                      className="w-full h-36 object-cover"
                    />
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-white">BURGYS GABON — Five Star Burgers</h4>
                        <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                          LIBREVILLE
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Enseigne fast-food gourmet n°1 à Libreville. Nos steaks 100% pur bœuf sont grillés minute à la flamme, nos buns briochés sont toastés au beurre et nos Curly Fries torsadées sont devenues cultes !
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Nos 2 Adresses à Libreville :
                    </h5>

                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <strong className="text-white block font-bold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          <span>1. Burgys Glass (Restaurant & Terrasse)</span>
                        </strong>
                        <p className="text-[11px] text-slate-400">
                          Boulevard Triomphal, juste après le KFC, Libreville.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <strong className="text-white block font-bold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          <span>2. Burgys Nzeng-Ayong (Comptoir & Drive)</span>
                        </strong>
                        <p className="text-[11px] text-slate-400">
                          Station-service de Nzeng-Ayong, Carrefour GP, Libreville.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Horaires d’ouverture :</span>
                      </span>
                      <strong className="text-white font-mono">7j/7 de 11h à 23h</strong>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Hotline Commandes :</span>
                      </span>
                      <strong className="text-amber-300 font-mono">{phoneDisplay}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsClientSpaceOpen(false);
                      setIsQrModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-white/15 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>Afficher le QR Code pour commander à table</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* MODAL DU PANIER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md mx-auto max-h-[90vh] flex flex-col rounded-t-[36px] bg-[#10121b] border-t border-x border-red-500/30 shadow-2xl relative overflow-hidden">

            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  Panier Burgys ({cartTotalCount} {cartTotalCount > 1 ? 'articles' : 'article'})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Comment souhaitez-vous recevoir votre repas ?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'livraison', label: '🛵 Livraison', desc: 'À domicile' },
                    { id: 'table', label: '🍽️ À Table', desc: 'En resto' },
                    { id: 'emporter', label: '🛍️ Emporter', desc: 'Comptoir' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setOrderType(m.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        orderType === m.id
                          ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-black border-amber-300/40 shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/25'
                      }`}
                    >
                      <div className="text-xs leading-tight">{m.label}</div>
                      <div className="text-[9px] opacity-75">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {orderType === 'table' && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-red-500/25 space-y-2">
                  <label className="block text-xs font-bold text-amber-300">Numéro de votre Table ou Restaurant</label>
                  <input
                    type="text"
                    placeholder="Ex: Table 4 (Glass), Terrasse 2 (Nzeng-Ayong)..."
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    💡 Le serveur vous apportera votre commande directement à table.
                  </p>
                </div>
              )}

              {orderType === 'livraison' && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-red-500/25 space-y-2.5">
                  <label className="block text-xs font-bold text-amber-300">Quartier & Adresse de Livraison (Libreville)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Glass', 'Nzeng-Ayong', 'Centre-Ville', 'Akanda', 'Owendo'].map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setDeliveryCity(city)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          deliveryCity === city
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-amber-300/40'
                            : 'bg-black/30 text-slate-300 border-white/10'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Adresse / Repère précis (ex: Glass, à côté de..., portail noir)..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-500/25 transition-all cursor-pointer"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                    <span>{geoCoords ? '📍 Position GPS attachée au livreur' : '📍 Attacher ma position GPS exacte (1 clic)'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Votre nom..."
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      placeholder="Numéro WhatsApp..."
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Articles Sélectionnés
                </label>

                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <img
                      src={item.dish.image_url}
                      alt={item.dish.title}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_BURGER_IMG; }}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.dish.title}</h4>
                      <p className="text-[10px] text-amber-300 font-mono">
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
                    Votre panier est vide. Choisissez vos burgers sur la carte pour commander !
                  </div>
                )}
              </div>

            </div>

            {cart.length > 0 && (
              <div className="p-4 bg-black/60 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold">Total à Régler :</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400 font-mono">
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                  <span>Envoyer la Commande sur WhatsApp (1 Clic)</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL QR CODE MENU BURGYS GABON */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#11131c] border border-red-500/30 p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-red-600/20">
              <QrCode className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">{restaurantName}</h3>
              <p className="text-xs text-amber-400/90 mt-0.5">Menu Digital Five Star & Commande en Ligne</p>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://digital-mark-pro.mynexus.workers.dev/?t=burgys-gabon')}`}
                alt="QR Code Menu Burgys Gabon"
                className="w-44 h-44 object-contain mx-auto"
              />
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Vos clients flashent ce QR code avec leur smartphone pour consulter la carte de Burgys Gabon et commander en 1 clic.
            </p>

            <div className="pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-amber-300 border border-red-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

export default BurgysFastFoodView;
