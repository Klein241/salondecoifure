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
  RefreshCw,
  Eye
} from 'lucide-react';

// Plats et spécialités artisanales au feu de bois de "LES PIZZAS DU FEU DE DIEU" (Libreville - Gabon)
const DEFAULT_PIZZA_ITEMS = [
  {
    id: 'pizza-01',
    title: 'La Reine du Feu de Dieu (Signature)',
    category: 'Pizzas Signatures',
    format: 'Pizza Cuite au Feu de Bois',
    dimensions: 'Sauce Tomate San Marzano • Mozzarella Fior di Latte • Jambon Supérieur • Champignons Frais',
    price_fcfa: 7000,
    price_eur: 11,
    rating: 5.0,
    reviews_count: 184,
    badge: 'SIGNATURE DU FEU 🔥',
    badge_color: 'bg-red-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'La recette emblématique de la cheffe Regina Rose Manga : pâte à maturation lente 48h croustillante et aérée, sauce tomate San Marzano mijotée maison, généreuse mozzarella fondante, chiffonnade de jambon blanc supérieur et champignons de Paris frais dorés au feu de bois.',
    features: ['Cuisson authentique au feu de bois', 'Sauce tomate San Marzano maison', 'Mozzarella fior di latte 100% lait', 'Origan sauvage & huile pimentée offerte'],
    popular: true
  },
  {
    id: 'pizza-02',
    title: 'La 4 Fromages Four à Bois',
    category: 'Fromages & Classiques',
    format: 'Pizza Gourmande au Feu de Bois',
    dimensions: 'Mozzarella • Gorgonzola Crémeux • Chèvre Doux • Parmesan Affiné 24 Mois',
    price_fcfa: 7500,
    price_eur: 11.5,
    rating: 4.9,
    reviews_count: 142,
    badge: '4 FROMAGES 🧀',
    badge_color: 'bg-amber-500 text-slate-950 font-black',
    image_url: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Une explosion d’onctuosité et de caractère : alliance parfaite de mozzarella filante, gorgonzola italien piquant, bûche de chèvre crémeuse et copeaux de parmesan affiné 24 mois avec un filet de miel doré d’acacia.',
    features: ['4 fromages nobles sélectionnés', 'Fond blanc crème ou fond rouge au choix', 'Touche de miel offerte', 'Pâte dorée croustillante'],
    popular: true
  },
  {
    id: 'pizza-03',
    title: 'La Carnivore Brasero BBQ',
    category: 'Viandes & BBQ',
    format: 'Pizza Viande Intense',
    dimensions: 'Bœuf Haché Épicé • Lardons Fumés • Pepperoni Doré • Oignons Confits • Sauce BBQ',
    price_fcfa: 8000,
    price_eur: 12.5,
    rating: 4.9,
    reviews_count: 165,
    badge: 'MAXI CARNIVORE 🥩',
    badge_color: 'bg-orange-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Pour les amateurs de viandes grillées : viande bovine pur bœuf assaisonnée à la flamme, lardons fumés croustillants, rondelles de pepperoni piquant, oignons rouges caramélisés et filet de sauce barbecue au bois fumé.',
    features: ['Triple garniture viandes de qualité', 'Sauce barbecue fumée', 'Garniture ultra-généreuse', 'Idéale pour gros appétit'],
    popular: true
  },
  {
    id: 'pizza-04',
    title: 'La Poulet Braisé & Épices Locales',
    category: 'Spécialités Braisées',
    format: 'Pizza Fusion Terroir Gabonais',
    dimensions: 'Volaille Braisée au Charbon • Poivrons Doux • Oignons • Sauce Blanche Épicée',
    price_fcfa: 7500,
    price_eur: 11.5,
    rating: 4.8,
    reviews_count: 128,
    badge: 'SPÉCIALITÉ GABONAISE 🇬🇦',
    badge_color: 'bg-emerald-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'L’incomparable saveur du poulet braisé de Libreville sur une pâte à pizza artisanale au feu de bois ! Filets de poulet marinés 24h aux épices traditionnelles, lamelles de poivrons doux croquants et sauce blanche onctueuse.',
    features: ['Poulet fermier mariné & braisé', 'Saveurs parfumées du Gabon', 'Mozzarella filante', 'Piment vert parfumé en option'],
    popular: true
  },
  {
    id: 'pizza-05',
    title: 'La Calzone Soufflée Royale',
    category: 'Pizzas Signatures',
    format: 'Chausson Doré au Four à Bois',
    dimensions: 'Jambon Supérieur • Jaune d’Œuf Coulant • Mozzarella • Champignons Frais',
    price_fcfa: 7500,
    price_eur: 11.5,
    rating: 5.0,
    reviews_count: 98,
    badge: 'CHAUSSON ROYAL 👑',
    badge_color: 'bg-purple-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1536964549204-cce9eab227bd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1536964549204-cce9eab227bd?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Chausson majestueux plié à la main et doré à haute température dans le four à bois : cœur fondant de mozzarella coulante, dés de jambon supérieur, champignons et son jaune d’œuf bio coulant à l’ouverture.',
    features: ['Pâte soufflée ultra-croustillante', 'Cœur fondant & œuf coulant', 'Arrosée d’huile d’olive & origan', 'Servie fumante minute'],
    popular: true
  },
  {
    id: 'pizza-06',
    title: 'La Margherita Napolitaine DOP',
    category: 'Fromages & Classiques',
    format: 'Classique Italienne Authentique',
    dimensions: 'Tomates San Marzano • Mozzarella di Bufala • Basilic Frais • Huile d’Olive Extra Vierge',
    price_fcfa: 5500,
    price_eur: 8.5,
    rating: 4.8,
    reviews_count: 110,
    badge: 'TRADITION ITALIENNE 🇮🇹',
    badge_color: 'bg-rose-500 text-white font-bold',
    image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'La simplicité dans toute sa perfection gastronomique. Pulpe de tomates San Marzano gorgées de soleil, tranches épaisses de mozzarella fraîche, basilic cueillie du jour et un trait d’huile d’olive extra vierge de première pression à froid.',
    features: ['Ingrédients DOP d’origine certifiée', 'Basilic frais parfumé', 'Pâte légère et digeste', 'Cuite en 90 secondes au four à bois'],
    popular: false
  },
  {
    id: 'pizza-07',
    title: 'La Piquante Diavola Feu Ardent',
    category: 'Viandes & BBQ',
    format: 'Pizza Piquante Pimentée',
    dimensions: 'Spianata Calabraise Piquante • Piments Oiseaux Marinés • Mozzarella • Sauce Tomate',
    price_fcfa: 7500,
    price_eur: 11.5,
    rating: 4.9,
    reviews_count: 135,
    badge: 'ULTRA PIQUANTE 🌶️',
    badge_color: 'bg-red-700 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Pour ceux qui aiment le vrai goût pimenté du feu ! Salami Spianata calabrais relevé au poivre rouge, mozzarella fondante, piments oiseaux locaux macérés à l’huile d’olive et origan sauvage.',
    features: ['Salami piquant tranché fin', 'Piment fort gabonais dosable', 'Sauce tomate corsée', 'Bouteille d’huile pimentée offerte'],
    popular: true
  },
  {
    id: 'pizza-08',
    title: 'La Spéciale Chef Regina (Prestige)',
    category: 'Pizzas Signatures',
    format: 'Pizza Gastronomique d’Auteur',
    dimensions: 'Filet de Bœuf Braisé • Roquette Sauvage • Parmesan 24 Mois • Crème de Balsamique',
    price_fcfa: 9500,
    price_eur: 14.5,
    rating: 5.0,
    reviews_count: 88,
    badge: 'CHEF VIP REGINA ⭐',
    badge_color: 'bg-amber-400 text-slate-950 font-black',
    image_url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'La création d’exception conçue par Regina Rose Manga : carpaccio de bœuf tendre mariné déposé après cuisson au feu de bois, lit de roquette fraîche poivrée, copeaux généreux de Parmigiano Reggiano 24 mois et réduction sirupeuse de vinaigre balsamique.',
    features: ['Création exclusive de la cheffe', 'Viande bovine tendre d’exception', 'Copeaux de parmesan affiné', 'Idéale pour soirées de gala & réceptions'],
    popular: true
  },
  {
    id: 'pizza-09',
    title: 'La Mer & Océan de l’Estuaire',
    category: 'Spécialités Braisées',
    format: 'Pizza Fruits de Mer Frais',
    dimensions: 'Gambas Sautées à la Persillade • Calamars Tendres • Mozzarella • Citron Vert',
    price_fcfa: 9000,
    price_eur: 14,
    rating: 4.8,
    reviews_count: 76,
    badge: 'FRUITS DE MER 🦐',
    badge_color: 'bg-cyan-600 text-white font-bold',
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Les trésors de l’Océan Atlantique et de l’Estuaire de Libreville : gambas décortiquées et revenues au beurre d’ail persillé, anneaux de calamars tendres, mozzarella crémeuse et zeste de citron vert râpé minute.',
    features: ['Pêche fraîche locale', 'Ail frais & persil du jardin', 'Saveur iodée délicate', 'Zeste de citron vert'],
    popular: false
  },
  {
    id: 'pizza-10',
    title: 'La Végétarienne Grillée du Terroir',
    category: 'Fromages & Classiques',
    format: 'Pizza Légumes Rôtis au Feu de Bois',
    dimensions: 'Aubergines Grillées • Courgettes • Poivrons Rouges Doux • Olives Kalamata • Roquette',
    price_fcfa: 6500,
    price_eur: 10,
    rating: 4.7,
    reviews_count: 64,
    badge: '100% VÉGÉ 🌱',
    badge_color: 'bg-emerald-500 text-slate-950 font-bold',
    image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Un festival de saveurs végétales : aubergines, courgettes et poivrons rôtis au préalable dans notre four à bois, olives noires de Kalamata, mozzarella fondante et roquette sauvage croquante.',
    features: ['Légumes maraîchers frais rôtis', 'Pâte digeste et saine', 'Riche en saveurs provençales', 'Adaptée régime végétarien'],
    popular: false
  },
  {
    id: 'pizza-11',
    title: 'Pain à l’Ail & Mozzarella Gratinée (Garlic Bread)',
    category: 'Sides & Pains à l’Ail',
    format: 'Pain Artisanal au Four à Bois',
    dimensions: 'Baguette Dorée • Beurre d’Ail Persillé • Double Mozzarella Coulante',
    price_fcfa: 3000,
    price_eur: 4.5,
    rating: 4.9,
    reviews_count: 150,
    badge: 'CÉLÈBRE SIDE 🧄',
    badge_color: 'bg-yellow-500 text-slate-950 font-bold',
    image_url: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'L’entrée chaude indispensable : pain maison doré minute dans le four à bois, imbibé d’un beurre battu à l’ail frais et au persil, recouvert d’une généreuse couche de mozzarella fondante et filante.',
    features: ['Croustillant à l’extérieur, moelleux à cœur', 'Ail frais de qualité', 'Idéal à partager à l’apéritif', 'Servi ultra-chaud'],
    popular: true
  },
  {
    id: 'pizza-12',
    title: 'Bruschetta Tomates Confites & Basilic',
    category: 'Sides & Pains à l’Ail',
    format: '3 Tartines de Campagne Grillées',
    dimensions: 'Pain Grillé au Feu de Bois • Tomates Concassées • Basilic Frais • Huile d’Olive',
    price_fcfa: 3500,
    price_eur: 5.5,
    rating: 4.8,
    reviews_count: 72,
    badge: 'FRAÎCHEUR 🍅',
    badge_color: 'bg-red-500 text-white font-bold',
    image_url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Tranches épaisses de pain au levain frottées à la gousse d’ail, garnies de dés de tomates mûres assaisonnées, basilic frais ciselé, fleur de sel et huile d’olive extra vierge.',
    features: ['3 pièces généreuses', 'Pain au levain grillé au charbon', 'Fraîcheur estivale garantie', 'Entrée saine et légère'],
    popular: false
  },
  {
    id: 'pizza-13',
    title: 'Tiramisu Maison Traditionnel au Café',
    category: 'Desserts & Boissons',
    format: 'Grand Pot Pâtissier Individuel',
    dimensions: 'Biscuits Cuillère • Expresso Torréfié • Mascarpone Onctueux • Cacao Amer',
    price_fcfa: 3000,
    price_eur: 4.5,
    rating: 5.0,
    reviews_count: 94,
    badge: 'DESSERT CULTE ☕',
    badge_color: 'bg-amber-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'La douceur italienne faite maison par notre équipe : biscuits savoyards délicatement imbibés d’expresso italien serré, crème mascarpone aérée et soyeuse, saupoudrée d’un cacao noir intense.',
    features: ['Recette 100% artisanale du jour', 'Véritable mascarpone italien', 'Café fraîchement moulu', 'Finition cacao amer'],
    popular: true
  },
  {
    id: 'pizza-14',
    title: 'Bissap Maison & Jus d’Ananas Frais 50cl',
    category: 'Desserts & Boissons',
    format: 'Bouteille Fraîche 50cl',
    dimensions: 'Fleurs d’Hibiscus du Gabon • Menthe Fraîche • Ananas Frais Pressé',
    price_fcfa: 1500,
    price_eur: 2.3,
    rating: 4.9,
    reviews_count: 112,
    badge: 'JUS NATUREL 🍍',
    badge_color: 'bg-rose-600 text-white font-bold',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Nos boissons artisanales signature préparées chaque matin : au choix, le grand classique Bissap glacé infusé aux feuilles de menthe poivrée, ou le pur jus d’ananas sucré de Ntoum sans sucre ajouté.',
    features: ['100% Naturel sans conservateur', 'Servi ultra-frais avec glaçons', 'Bouteille 50cl refermable', 'Choix du parfum sur WhatsApp'],
    popular: true
  }
];

// Image de secours absolue pour tout plat qui échoue
const FALLBACK_PIZZA_IMG = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80';

// Catégories officielles de LES PIZZAS DU FEU DE DIEU
const CATEGORIES = [
  { id: 'all', label: 'Toutes les Pizzas', icon: Pizza },
  { id: 'Pizzas Signatures', label: 'Signatures au Feu 🔥', icon: Flame },
  { id: 'Fromages & Classiques', label: 'Fromages & Napoli', icon: Layers },
  { id: 'Viandes & BBQ', label: 'Carnivore & BBQ', icon: Utensils },
  { id: 'Spécialités Braisées', label: 'Spécialités Terroir', icon: Sparkles },
  { id: 'Sides & Pains à l’Ail', label: 'Pains à l’Ail & Sides', icon: Tag },
  { id: 'Desserts & Boissons', label: 'Boissons & Desserts', icon: Coffee }
];

export function PizzasFeuDeDieuView({
  settings = {},
  posters = [],
  currency = 'XAF',
  whatsappNumber = '24166756156',
  onNavigateAdmin,
  isPreview = false
}) {
  // Fusionner les plats de la BD avec ceux par défaut des Pizzas du feu de Dieu
  const menuItems = useMemo(() => {
    if (posters && posters.length > 0) {
      return posters.map((p, idx) => ({
        id: p.id || `pizza-${idx}`,
        title: p.title || 'Pizza au Feu de Bois',
        category: p.category || (idx % 2 === 0 ? 'Pizzas Signatures' : 'Fromages & Classiques'),
        format: p.format || 'Pizza Cuite au Feu de Bois',
        dimensions: p.dimensions || 'Cuisson traditionnelle au four en briques réfractaires',
        price_fcfa: Number(p.price_fcfa) || 7000,
        price_eur: Number(p.price_eur) || Math.round(Number(p.price_fcfa) / 655) || 11,
        rating: p.rating || 4.9,
        reviews_count: p.reviews_count || (110 + (idx * 6)),
        badge: p.badge || (idx === 0 ? 'SIGNATURE DU FEU 🔥' : 'BEST SELLER'),
        badge_color: p.badge_color || (idx === 0 ? 'bg-red-600 text-white font-black' : 'bg-amber-500 text-slate-950 font-black'),
        image_url: p.image_url || FALLBACK_PIZZA_IMG,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image_url || FALLBACK_PIZZA_IMG],
        description: p.description || 'Pizza artisanale cuite minute dans notre four à bois traditionnel avec ingrédients frais.',
        features: Array.isArray(p.features) ? p.features : ['Cuite au feu de bois', 'Pâte maturation 48h', 'Mozzarella fior di latte'],
        popular: p.popular !== undefined ? Boolean(p.popular) : (idx < 6)
      }));
    }
    return DEFAULT_PIZZA_ITEMS;
  }, [posters]);

  // États de l'interface
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState(null);
  const [favorites, setFavorites] = useState({});

  // Panier & Commandes
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Espace Client ("Mon Espace")
  const [isClientSpaceOpen, setIsClientSpaceOpen] = useState(false);
  const [clientSpaceTab, setClientSpaceTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');

  // Personnalisation pizza (Screen Modal)
  const [dishSize, setDishSize] = useState('Moyenne (28cm)');
  const [quantity, setQuantity] = useState(1);
  const [supplements, setSupplements] = useState({
    doubleCheese: false,
    pimentMaison: true,
    olivesKalamata: false,
    oignonsConfits: false,
    huilePimentee: true
  });

  // Localisation GPS pour livraison
  const [gpsLocation, setGpsLocation] = useState(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Numéro WhatsApp officiel : priorité aux numéros réels des Pizzas du feu de Dieu
  const targetWhatsapp = useMemo(() => {
    const raw = settings.whatsapp_number || whatsappNumber || '24166756156';
    return String(raw).replace(/\D/g, '');
  }, [settings.whatsapp_number, whatsappNumber]);

  // Historique des commandes de pizzas (simulation réaliste et synchronisée)
  const [orders, setOrders] = useState([
    {
      id: 'PFD-8942',
      date: 'Hier à 19:45',
      destination: 'Libreville, Batterie 4 (près de l’Hôtel)',
      items: [
        { title: 'La Reine du Feu de Dieu (Signature)', quantity: 2, size: 'Grande (33cm)', price: 17000 },
        { title: 'Pain à l’Ail & Mozzarella Gratinée', quantity: 1, size: 'Portion', price: 3000 },
        { title: 'Bissap Maison Frais 50cl', quantity: 2, size: '50cl', price: 3000 }
      ],
      total: 23000,
      status: 'livre',
      statusLabel: 'Livrée avec succès ✅',
      statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    },
    {
      id: 'PFD-8965',
      date: 'Aujourd’hui à 13:10',
      destination: 'Libreville, Akébé Poteaux (carrefour)',
      items: [
        { title: 'La Carnivore Brasero BBQ', quantity: 1, size: 'Moyenne (28cm)', price: 8000 },
        { title: 'Tiramisu Maison Traditionnel', quantity: 2, size: 'Pot', price: 6000 }
      ],
      total: 14000,
      status: 'en_cours',
      statusLabel: 'En cuisson au four à bois 🔥',
      statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    },
    {
      id: 'PFD-8820',
      date: '3 Nov. 2026',
      destination: 'Owendo, SNI Carrefour',
      items: [
        { title: 'La Calzone Soufflée Royale', quantity: 1, size: 'Classique', price: 7500 }
      ],
      total: 7500,
      status: 'annule',
      statusLabel: 'Annulée par le client ❌',
      statusColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40'
    }
  ]);

  // Filtrer les plats
  const filteredDishes = useMemo(() => {
    return menuItems.filter(dish => {
      const matchCategory = selectedCategory === 'all' || dish.category === selectedCategory;
      const matchSearch = !searchQuery.trim() ||
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Plats populaires du moment
  const popularDishes = useMemo(() => {
    return menuItems.filter(d => d.popular).slice(0, 6);
  }, [menuItems]);

  // Gestion des favoris
  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calcul du prix ajusté selon la taille et suppléments
  const currentDishPrice = useMemo(() => {
    if (!selectedDish) return 0;
    let base = Number(selectedDish.price_fcfa) || 7000;
    if (dishSize === 'Grande (33cm)') base += 1500;
    if (dishSize === 'Familiale Géante (40cm)') base += 3500;
    if (supplements.doubleCheese) base += 1000;
    if (supplements.olivesKalamata) base += 500;
    if (supplements.oignonsConfits) base += 500;
    return base * quantity;
  }, [selectedDish, dishSize, supplements, quantity]);

  // Ajouter au panier
  const handleAddToCart = (dish, customOptions = null) => {
    const size = customOptions?.size || 'Moyenne (28cm)';
    const qty = customOptions?.quantity || 1;
    let unitPrice = Number(dish.price_fcfa) || 7000;
    if (size === 'Grande (33cm)') unitPrice += 1500;
    if (size === 'Familiale Géante (40cm)') unitPrice += 3500;
    if (customOptions?.supplements?.doubleCheese) unitPrice += 1000;
    if (customOptions?.supplements?.olivesKalamata) unitPrice += 500;
    if (customOptions?.supplements?.oignonsConfits) unitPrice += 500;

    const cartItemId = `${dish.id}-${size}-${JSON.stringify(customOptions?.supplements || {})}`;

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.cartItemId === cartItemId);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += qty;
        return next;
      }
      return [...prev, {
        ...dish,
        cartItemId,
        size,
        unitPrice,
        quantity: qty,
        supplements: customOptions?.supplements || {}
      }];
    });

    if (selectedDish) {
      setSelectedDish(null);
      setQuantity(1);
    }
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Détection GPS en temps réel
  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('La géolocalisation n’est pas prise en charge par votre navigateur.');
      return;
    }
    setIsDetectingGps(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coordsStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        const gmapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setGpsLocation({
          coords: coordsStr,
          accuracy: Math.round(accuracy),
          link: gmapsLink,
          label: `Position détectée (Précision: ~${Math.round(accuracy)}m)`
        });
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError('Impossible d’obtenir votre position GPS. Veuillez vérifier les autorisations de votre téléphone.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Génération du bon de commande WhatsApp
  const generateWhatsAppOrderLink = () => {
    if (cart.length === 0) return '#';
    let text = `🔥 *COMMANDE PIZZA EN LIGNE — LES PIZZAS DU FEU DE DIEU* 🔥\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    cart.forEach((item, idx) => {
      text += `🍕 *${item.quantity}x ${item.title}*\n`;
      text += `   • Taille : ${item.size}\n`;
      const supps = [];
      if (item.supplements?.doubleCheese) supps.push('Double Mozzarella (+1 000 F)');
      if (item.supplements?.olivesKalamata) supps.push('Olives Kalamata (+500 F)');
      if (item.supplements?.oignonsConfits) supps.push('Oignons Confits (+500 F)');
      if (item.supplements?.pimentMaison) supps.push('Piment maison inclus');
      if (supps.length > 0) text += `   • Extras : ${supps.join(', ')}\n`;
      text += `   • Sous-total : ${(item.unitPrice * item.quantity).toLocaleString('fr-FR')} FCFA\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *TOTAL À PAYER : ${cartTotal.toLocaleString('fr-FR')} FCFA* (~${Math.round(cartTotal / 655)} €)\n`;
    text += `⚡ Mode : Cuisson au feu de bois & Livraison Express\n`;

    if (gpsLocation) {
      text += `\n📍 *LOCALISATION GPS POUR LE LIVREUR :*\n`;
      text += `Coordonnées : ${gpsLocation.coords}\n`;
      text += `Google Maps : ${gpsLocation.link}\n`;
    }

    if (deliveryNotes.trim()) {
      text += `\n📝 *Indication adresse :* ${deliveryNotes.trim()}\n`;
    }

    text += `\n👋 Merci de me confirmer le délai estimé de livraison à Libreville !`;

    return `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(text)}`;
  };

  // Recommander depuis l'historique
  const handleReorder = (order) => {
    order.items.forEach(it => {
      handleAddToCart({
        id: `reorder-${Date.now()}-${Math.random()}`,
        title: it.title,
        price_fcfa: it.price / it.quantity,
        format: 'Pizza au Feu de Bois',
        category: 'Pizzas Signatures'
      }, {
        size: it.size || 'Moyenne (28cm)',
        quantity: it.quantity,
        supplements: {}
      });
    });
    setIsClientSpaceOpen(false);
    setIsCartOpen(true);
  };

  // Filtrage commandes client
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders;
    return orders.filter(o => o.status === orderFilter);
  }, [orders, orderFilter]);

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-32 selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      
      {/* ======================================================== */}
      {/* 1. ARRIÈRE-PLAN GOURMAND : PIZZA AVEC PART SÉPARÉE (FROMAGE ÉTIRÉ) */}
      {/* ======================================================== */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-100"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=2400&q=90')`,
          filter: 'brightness(0.92) contrast(1.05)',
        }}
      />

      {/* VOILE GLASSMORPHISM EN VERRE POLI ULTRA-TRANSPARENT */}
      {/* Voile transparent léger (laisse transparaître la pizza et la part séparée) */}
      <div className="fixed inset-0 z-0 bg-slate-950/40 backdrop-blur-[2px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-gradient-to-b from-orange-500/20 via-red-600/10 to-transparent blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-500/15 blur-[100px] pointer-events-none z-0" />

      {/* ======================================================== */}
      {/* 2. HEADER EN VERRE POLI ULTRA-TRANSPARENT */}
      {/* ======================================================== */}
      <header className="relative z-20 px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between border-b border-white/[0.12] backdrop-blur-2xl bg-black/35 sticky top-0 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => setSelectedCategory('all')}>
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/25 shadow-[0_0_25px_rgba(239,68,68,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-md bg-white/10 flex items-center justify-center p-0.5">
              <img
                src="/logo-pizzas-feu-de-dieu.jpg"
                alt="Les Pizzas du feu de Dieu"
                className="w-full h-full object-cover rounded-[14px] group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_PIZZA_IMG;
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border border-black" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                Les Pizzas du feu de Dieu
                <Flame className="w-4 h-4 text-orange-400 inline fill-orange-400 animate-pulse" />
              </h1>
            </div>
            <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 drop-shadow">
              <span>Four à Bois Artisanal</span>
              <span className="text-white/40">•</span>
              <span className="text-slate-200 font-medium">Libreville 🇬🇦</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* BOUTON MON ESPACE CLIENT */}
          <button
            onClick={() => setIsClientSpaceOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 hover:border-orange-400/60 text-orange-200 hover:text-white transition-all text-xs font-bold shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl cursor-pointer"
            title="Mon Espace Client (Commandes, Affiliation, GPS)"
          >
            <User className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Mon Espace</span>
          </button>

          {/* BOUTON ADMIN DISCRET */}
          {onNavigateAdmin && (
            <button
              onClick={onNavigateAdmin}
              className="w-9 h-9 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-all text-xs backdrop-blur-xl cursor-pointer"
              title="Accès Administrateur"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. BANNIÈRE VITRINE GLASSMORPHISM HAUT DE GAMME */}
      {/* ======================================================== */}
      <section className="relative z-10 px-4 sm:px-6 pt-5 pb-3">
        <div className="relative rounded-[32px] overflow-hidden border border-white/20 bg-white/[0.05] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] p-5 sm:p-7">
          <div className="relative z-10 max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/35 text-red-200 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
              <span>FOUR À BOIS ARTISANAL · LIBREVILLE</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              La Pizza Italienne d’Exception cuite au <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-amber-300">Feu de Dieu !</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed drop-shadow">
              Créations gastronomiques de la cheffe <strong className="text-white font-extrabold">Regina Rose Manga</strong> (RFI). Pâte à maturation lente 48h, sauce tomate San Marzano mijotée maison et mozzarella fondante.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={`https://wa.me/${targetWhatsapp}?text=${encodeURIComponent('Bonjour Les Pizzas du feu de Dieu ! Je souhaite commander des pizzas au feu de bois.')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white font-extrabold text-xs shadow-[0_8px_25px_rgba(239,68,68,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:brightness-110 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Commander sur WhatsApp</span>
              </a>

              <button
                onClick={() => setIsClientSpaceOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] text-white font-bold text-xs border border-white/20 transition-all backdrop-blur-xl shadow-md cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Mon Espace & Bonus</span>
              </button>
            </div>
          </div>

          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. BARRE DE RECHERCHE EN VERRE POLI */}
      {/* ======================================================== */}
      <section className="relative z-10 px-4 sm:px-6 pt-2 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-orange-300 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une pizza, un ingrédient, une boisson..."
            className="w-full bg-black/40 backdrop-blur-2xl border border-white/[0.18] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-400/60 focus:bg-black/50 shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SÉLECTEUR DE CATÉGORIES EN VERRE POLI */}
      {/* ======================================================== */}
      <section className="relative z-10 px-4 sm:px-6 py-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer backdrop-blur-xl ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600/90 to-orange-500/90 text-white shadow-[0_6px_25px_rgba(239,68,68,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-orange-300/50 scale-[1.02]'
                    : 'bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.15] text-slate-200 hover:border-white/25 shadow-sm'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-orange-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. GRILLE DES ARTICLES EN VRAIES CARTES GLASSMORPHISM */}
      {/* ======================================================== */}
      <section className="relative z-10 px-4 sm:px-6 pt-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 drop-shadow">
              <span>La Carte du Feu de Dieu</span>
              <span className="text-xs font-normal text-amber-300/80">({filteredDishes.length} spécialités)</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-300 font-medium">Cuisson au feu de bois</span>
        </div>

        {/* GRILLE DU MENU : 2 COLONNES STRICTES CONFORME À LA CAPTURE */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          {filteredDishes.map((dish) => {
            const isFav = Boolean(favorites[dish.id]);
            return (
              <div
                key={dish.id}
                onClick={() => setSelectedDish(dish)}
                className="group relative bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/20 border-t-white/35 hover:border-orange-400/60 rounded-3xl p-3 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                {/* 1. EN-TÊTE DE LA CARTE : BADGE À GAUCHE & COEUR FAVORIS À DROITE */}
                <div className="flex items-center justify-between mb-2 z-10">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm ${
                      dish.badge_color || 'bg-red-600/90 text-white'
                    }`}
                  >
                    {dish.badge || 'FEU DE BOIS 🔥'}
                  </span>
                  <button
                    onClick={(e) => toggleFavorite(e, dish.id)}
                    className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'text-rose-500 fill-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* 2. PHOTO DE L'ARTICLE AU CENTRE */}
                <div className="relative w-full h-28 sm:h-36 my-1 flex items-center justify-center bg-black/30 rounded-2xl overflow-hidden border border-white/10 shadow-md">
                  <img
                    src={dish.image_url}
                    alt={dish.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_PIZZA_IMG;
                    }}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-108 transition-transform duration-300"
                  />
                </div>

                {/* 3. INFORMATIONS TEXTUELLES : TITRE & SOUS-TITRE / INGRÉDIENTS */}
                <div className="space-y-1 mt-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {dish.title}
                  </h3>
                  <p className="text-[10px] text-slate-300/80 line-clamp-1">
                    {dish.dimensions || dish.category}
                  </p>

                  {/* 4. PIED DE CARTE : PRIX EN BAS À GAUCHE & BOUTON ROND '+' À DROITE */}
                  <div className="flex items-center justify-between pt-1.5">
                    <div className="space-y-0.5">
                      <span className="text-xs sm:text-sm md:text-base font-black text-white font-mono">
                        {dish.price_fcfa.toLocaleString('fr-FR')} F
                      </span>
                      <span className="text-[10px] text-slate-300/60 block font-sans">
                        ~ {dish.price_eur} €
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(dish);
                      }}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-300 hover:from-orange-500 hover:to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:shadow-orange-500/40 hover:scale-110 active:scale-95 transition-all cursor-pointer font-bold"
                      title="Ajouter au panier"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. MODAL DE PERSONNALISATION EN VERRE POLI ULTRA-TRANSPARENT */}
      {/* ======================================================== */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-0 sm:p-4">
          <div className="w-full max-w-lg bg-black/60 backdrop-blur-3xl border border-white/25 rounded-t-[36px] sm:rounded-[36px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)] max-h-[92vh] flex flex-col">
            <div className="relative aspect-video bg-black/50 shrink-0">
              <img
                src={selectedDish.image_url}
                alt={selectedDish.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_PIZZA_IMG;
                }}
              />
              <button
                onClick={() => setSelectedDish(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase shadow-lg border border-red-400/50">
                {selectedDish.badge || 'FEU DE BOIS 🔥'}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">{selectedDish.title}</h3>
                <p className="text-xs text-amber-300 font-medium mt-0.5">{selectedDish.dimensions}</p>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed">{selectedDish.description}</p>
              </div>

              {/* CHOIX DE LA TAILLE */}
              <div className="space-y-2">
                <span className="text-xs font-black text-white uppercase tracking-wider block">1. Choisissez la taille</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Moyenne (28cm)', desc: '1 Personne', extra: '+0 F' },
                    { label: 'Grande (33cm)', desc: '1-2 Personnes', extra: '+1 500 F' },
                    { label: 'Familiale Géante (40cm)', desc: 'Partage 3-4 pers.', extra: '+3 500 F' }
                  ].map(s => (
                    <button
                      key={s.label}
                      onClick={() => setDishSize(s.label)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer backdrop-blur-xl ${
                        dishSize === s.label
                          ? 'border-orange-400 bg-orange-600/30 text-white shadow-[0_4px_16px_rgba(249,115,22,0.4)]'
                          : 'border-white/15 bg-white/[0.05] text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{s.label.split(' ')[0]}</div>
                      <div className="text-[9px] text-slate-400">{s.desc}</div>
                      <div className="text-[10px] font-mono text-amber-300 font-bold mt-1">{s.extra}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SUPPLÉMENTS DU FEU */}
              <div className="space-y-2">
                <span className="text-xs font-black text-white uppercase tracking-wider block">2. Suppléments & Finitions</span>
                <div className="space-y-1.5">
                  {[
                    { key: 'doubleCheese', label: 'Extra Double Mozzarella Fondante', price: '+1 000 FCFA' },
                    { key: 'pimentMaison', label: 'Piment du Chef Maison (Fort & Parfumé)', price: 'Offert 🌶️' },
                    { key: 'olivesKalamata', label: 'Olives Noires de Kalamata', price: '+500 FCFA' },
                    { key: 'oignonsConfits', label: 'Oignons Rouges Caramélisés', price: '+500 FCFA' },
                    { key: 'huilePimentee', label: 'Huile Pimentée Artisanale du Four', price: 'Offerte 🔥' }
                  ].map(supp => (
                    <label
                      key={supp.key}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.05] border border-white/15 hover:border-white/30 backdrop-blur-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={supplements[supp.key]}
                          onChange={(e) => setSupplements(prev => ({ ...prev, [supp.key]: e.target.checked }))}
                          className="rounded text-orange-500 focus:ring-orange-400 h-4 w-4 bg-black/40 border-white/20"
                        />
                        <span className="text-xs text-slate-200">{supp.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300">{supp.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* QUANTITÉ */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-xl">
                <span className="text-xs font-bold text-white">Nombre de pizzas</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-base font-black text-white w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white hover:bg-red-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* PIED DU MODAL */}
            <div className="p-4 border-t border-white/15 bg-black/50 backdrop-blur-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Prix Total</span>
                <span className="text-lg font-black font-mono text-amber-300">
                  {currentDishPrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <button
                onClick={() => handleAddToCart(selectedDish, { size: dishSize, quantity, supplements })}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl hover:brightness-110 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ajouter à ma commande</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL PANIER EN VERRE POLI ULTRA-TRANSPARENT */}
      {/* ======================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-0 sm:p-4">
          <div className="w-full max-w-lg bg-black/60 backdrop-blur-3xl border border-white/25 rounded-t-[36px] sm:rounded-[36px] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            <div className="p-4 border-b border-white/15 flex items-center justify-between bg-white/[0.04]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm font-black text-white">Mon Panier Pizza ({cartCount})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-300 text-xs space-y-2">
                  <Pizza className="w-10 h-10 text-slate-500 mx-auto" />
                  <p>Votre panier est vide pour l’instant.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-4 py-2 rounded-2xl bg-red-600 text-white text-xs font-bold mt-2"
                  >
                    Voir la carte des pizzas
                  </button>
                </div>
              ) : (
                <>
                  {cart.map(item => (
                    <div
                      key={item.cartItemId}
                      className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-between gap-3 backdrop-blur-xl"
                    >
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <p className="text-[10px] text-amber-300 font-medium">Taille : {item.size}</p>
                        <p className="text-xs font-mono font-black text-slate-200 mt-1">
                          {(item.unitPrice * item.quantity).toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQty(item.cartItemId, -1)}
                          className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.cartItemId, 1)}
                          className="w-7 h-7 rounded-xl bg-red-600 flex items-center justify-center text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* ADRESSE DE LIVRAISON & GPS */}
                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider block flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>Adresse de Livraison (Libreville)</span>
                    </span>

                    <button
                      onClick={detectLiveLocation}
                      disabled={isDetectingGps}
                      className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-red-600/30 to-orange-500/30 border border-orange-400/40 text-orange-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-orange-600/40 transition-all cursor-pointer backdrop-blur-xl"
                    >
                      <Navigation className={`w-4 h-4 text-orange-400 ${isDetectingGps ? 'animate-spin' : ''}`} />
                      <span>{isDetectingGps ? 'Détection GPS en cours...' : gpsLocation ? 'Position GPS Validée ✅' : 'Détecter ma position GPS pour le livreur'}</span>
                    </button>

                    {gpsLocation && (
                      <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-[11px] text-emerald-200 space-y-1 backdrop-blur-xl">
                        <div className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{gpsLocation.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-300 font-mono truncate">{gpsLocation.coords}</div>
                      </div>
                    )}

                    {gpsError && (
                      <p className="text-[10px] text-rose-400">{gpsError}</p>
                    )}

                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Quartier, point de repère (ex: Akébé, pharmacie...)"
                      className="w-full bg-black/40 border border-white/20 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-400/60 backdrop-blur-xl"
                    />
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-white/15 bg-black/50 backdrop-blur-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total à payer</span>
                    <span className="text-lg font-black font-mono text-amber-300">
                      {cartTotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <span className="text-xs text-slate-300">~{Math.round(cartTotal / 655)} €</span>
                </div>

                <a
                  href={generateWhatsAppOrderLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl hover:brightness-110 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Envoyer la commande sur WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. MODAL « MON ESPACE CLIENT » EN VERRE POLI ULTRA-TRANSPARENT */}
      {/* ======================================================== */}
      {isClientSpaceOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-0 sm:p-4">
          <div className="w-full max-w-lg bg-black/60 backdrop-blur-3xl border border-white/25 rounded-t-[36px] sm:rounded-[36px] overflow-hidden shadow-2xl h-[92vh] flex flex-col">
            <div className="p-4 border-b border-white/15 flex items-center justify-between bg-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 p-[1px] flex items-center justify-center">
                  <div className="w-full h-full bg-black/50 backdrop-blur-md rounded-[15px] flex items-center justify-center text-amber-400">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">Mon Espace Client</h3>
                    <span className="text-[9px] font-bold bg-amber-500/25 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                      VIP FEU DE DIEU 🔥
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">Suivi, Parrainage & Localisation Express</p>
                </div>
              </div>

              <button
                onClick={() => setIsClientSpaceOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ONGLETS MON ESPACE */}
            <div className="flex items-center gap-1 p-2 bg-black/40 border-b border-white/15 overflow-x-auto scrollbar-none backdrop-blur-2xl">
              {[
                { id: 'orders', label: 'Commandes', icon: ShoppingBag, count: orders.length },
                { id: 'affiliation', label: 'Affiliation & Bonus', icon: Gift, badge: 'Pizza Offerte' },
                { id: 'location', label: 'Localisation GPS', icon: Navigation },
                { id: 'about', label: 'À Propos', icon: Info },
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = clientSpaceTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setClientSpaceTab(tab.id)}
                    className={`shrink-0 flex items-center gap-1.5 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer backdrop-blur-xl ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md border border-orange-300/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/40 text-white' : 'bg-white/15 text-slate-200'}`}>
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
              {/* ONGLET 1 : HISTORIQUE DES COMMANDES */}
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
                        className={`text-xs px-3.5 py-1.5 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl ${
                          orderFilter === flt.id
                            ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md'
                            : 'bg-white/[0.05] border-white/15 text-slate-300 hover:border-white/30'
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
                        className="bg-white/[0.05] border border-white/15 rounded-3xl p-4 space-y-2.5 shadow-lg backdrop-blur-2xl"
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

                        <div className="text-[11px] text-slate-200 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="truncate">{order.destination}</span>
                        </div>

                        <div className="bg-black/40 rounded-2xl p-2.5 space-y-1 border border-white/10">
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
                              className="px-3 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Recommander</span>
                            </button>

                            <a
                              href={`https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(`Bonjour Les Pizzas du feu de Dieu, je souhaite suivre l'état de ma commande #${order.id}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 flex items-center gap-1 transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Suivre</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ONGLET 2 : PROGRAMME AMBASSADEUR */}
              {clientSpaceTab === 'affiliation' && (
                <div className="space-y-4">
                  <div className="relative rounded-3xl p-5 bg-gradient-to-br from-amber-500/20 via-red-950/30 to-black/70 border border-amber-400/40 shadow-xl space-y-3 backdrop-blur-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">Programme Ambassadeur Pizza</h4>
                          <p className="text-[10px] text-amber-300 font-medium">Recommandez à vos proches & gagnez des pizzas</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                        ACTIF 🔥
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="bg-black/50 rounded-2xl p-2.5 text-center border border-white/10">
                        <div className="text-xl font-mono font-black text-amber-400">8</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-tight">Filleuls Inscrits</div>
                      </div>

                      <div className="bg-black/50 rounded-2xl p-2.5 text-center border border-white/10">
                        <div className="text-xl font-mono font-black text-emerald-400">5 000 F</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-tight">Bonus Cumulé</div>
                      </div>

                      <div className="bg-black/50 rounded-2xl p-2.5 text-center border border-white/10">
                        <div className="text-xl font-mono font-black text-red-400">1 Offerte</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-tight">Pizza Reine</div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-200 leading-relaxed pt-1">
                      Partagez votre lien exclusif. Dès qu'un ami commande avec votre code, vous cumulez <strong className="text-amber-300">1 000 FCFA de cagnotte</strong> et débloquez une pizza Reine au feu de bois offerte toutes les 5 commandes !
                    </p>
                  </div>

                  <div className="bg-white/[0.05] border border-white/15 rounded-3xl p-4 space-y-2.5 backdrop-blur-2xl">
                    <span className="text-xs font-bold text-white block">Votre lien de parrainage VIP</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://digital-mark-pro.mynexus.workers.dev/?t=les-pizzas-du-feu-de-dieu&ref=FEUDIEU-${targetWhatsapp.slice(-4)}`}
                        className="flex-1 bg-black/40 border border-white/15 rounded-2xl px-3.5 py-2 text-xs font-mono text-amber-300 select-all"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://digital-mark-pro.mynexus.workers.dev/?t=les-pizzas-du-feu-de-dieu&ref=FEUDIEU-${targetWhatsapp.slice(-4)}`);
                          alert('Lien copié dans le presse-papier !');
                        }}
                        className="px-3.5 py-2 rounded-2xl bg-amber-400 text-slate-950 text-xs font-black hover:bg-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </button>
                    </div>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`🔥 Commande les meilleures pizzas au feu de bois de Libreville chez "Les Pizzas du feu de Dieu" avec mon lien VIP pour avoir une boisson ou réduction offerte : https://digital-mark-pro.mynexus.workers.dev/?t=les-pizzas-du-feu-de-dieu&ref=FEUDIEU-${targetWhatsapp.slice(-4)}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Partager mon lien sur WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              {/* ONGLET 3 : LOCALISATION GPS POUR LIVRAISON */}
              {clientSpaceTab === 'location' && (
                <div className="space-y-4">
                  <div className="bg-white/[0.05] border border-white/15 rounded-3xl p-4 space-y-3 backdrop-blur-2xl">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-red-500" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Partager ma Position GPS</h4>
                        <p className="text-[10px] text-slate-400">Guider le livreur moto directement à votre porte</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      Cliquez ci-dessous pour détecter automatiquement vos coordonnées GPS. Le lien Google Maps sera joint à votre bon de commande WhatsApp pour une livraison sans appel inutile.
                    </p>

                    <button
                      onClick={detectLiveLocation}
                      disabled={isDetectingGps}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:brightness-110 transition-all"
                    >
                      <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
                      <span>{isDetectingGps ? 'Détection GPS en cours...' : gpsLocation ? 'Position GPS Actualisée ✅' : 'Détecter ma position GPS'}</span>
                    </button>

                    {gpsLocation && (
                      <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-xs text-emerald-200 space-y-1.5 backdrop-blur-xl">
                        <div className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{gpsLocation.label}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-300">Coordonnées : {gpsLocation.coords}</div>
                        <a
                          href={gpsLocation.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-amber-300 underline flex items-center gap-1"
                        >
                          <span>Voir sur Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {gpsError && (
                      <p className="text-xs text-rose-400">{gpsError}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ONGLET 4 : À PROPOS */}
              {clientSpaceTab === 'about' && (
                <div className="space-y-4">
                  <div className="bg-white/[0.05] border border-white/15 rounded-3xl p-4 space-y-3 backdrop-blur-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20 bg-black/50 shrink-0">
                        <img
                          src="/logo-pizzas-feu-de-dieu.jpg"
                          alt="Les Pizzas du feu de Dieu"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_PIZZA_IMG;
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">Les Pizzas du feu de Dieu</h4>
                        <p className="text-[11px] text-amber-300 font-medium">Four à Bois Artisanal • Libreville, Gabon</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      Fondée à Libreville par la cheffe <strong className="text-white">Regina Rose Manga</strong>, notre pizzeria perpétue la véritable tradition de la pizza au feu de bois. Notre passage remarqué sur <strong>RFI (*8 milliards de voisins*)</strong> illustre notre engagement pour une cuisine authentique, festive et accessible à tous les amoureux de la bonne table.
                    </p>

                    <div className="space-y-2 pt-2 border-t border-white/15 text-xs">
                      <div className="flex items-center gap-2 text-slate-200">
                        <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Libreville, Gabon (Livraison dans tout le Grand Libreville)</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200">
                        <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                        <span>Mardi au Dimanche : 11h30 – 23h30</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200">
                        <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Hotlines : 066 75 61 56 / 077 15 80 28</span>
                      </div>
                    </div>

                    {/* LIENS RÉSEAUX SOCIAUX */}
                    <div className="pt-3 border-t border-white/15 space-y-2">
                      <span className="text-xs font-bold text-white block">Nos Réseaux Sociaux Officiels</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <a
                          href="https://www.facebook.com/p/Les-Pizzas-du-feu-de-Dieu-61593494212855/"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2.5 rounded-2xl bg-blue-600/20 border border-blue-400/30 text-blue-200 hover:text-white text-xs font-bold transition-all backdrop-blur-xl"
                        >
                          <Facebook className="w-4 h-4 text-blue-400" />
                          <span>Facebook</span>
                        </a>

                        <a
                          href="https://www.instagram.com/lespizzasdufeudedieu/"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2.5 rounded-2xl bg-pink-600/20 border border-pink-400/30 text-pink-200 hover:text-white text-xs font-bold transition-all backdrop-blur-xl"
                        >
                          <Instagram className="w-4 h-4 text-pink-400" />
                          <span>Instagram</span>
                        </a>

                        <a
                          href="https://www.tiktok.com/@pizzeriafeudedieu"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2.5 rounded-2xl bg-purple-600/20 border border-purple-400/30 text-purple-200 hover:text-white text-xs font-bold transition-all backdrop-blur-xl"
                        >
                          <ExternalLink className="w-4 h-4 text-purple-400" />
                          <span>TikTok</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. DOCK BAR FLOTTANTE EN VERRE POLI ULTRA-TRANSPARENT */}
      {/* ======================================================== */}
      <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40">
        <div className="bg-black/45 backdrop-blur-3xl border border-white/[0.22] rounded-[32px] p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)]">
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
              selectedCategory === 'all' && !isClientSpaceOpen ? 'text-orange-400 font-extrabold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Pizza className="w-5 h-5" />
            <span className="text-[10px] font-bold">Carte</span>
          </button>

          <button
            onClick={() => { setSelectedCategory('Pizzas Signatures'); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
              selectedCategory === 'Pizzas Signatures' ? 'text-orange-400 font-extrabold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span className="text-[10px] font-bold">Signatures</span>
          </button>

          {/* BOUTON PANIER CENTRAL EN VERRE & FEU */}
          <button
            onClick={() => { setIsCartOpen(true); setIsClientSpaceOpen(false); }}
            className="relative -top-5 w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 p-0.5 shadow-[0_12px_30px_rgba(239,68,68,0.6),inset_0_1px_1px_rgba(255,255,255,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-full h-full bg-black/60 backdrop-blur-xl rounded-[14px] flex items-center justify-center text-white">
              <ShoppingBag className="w-6 h-6 text-amber-300" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-black">
                {cartCount}
              </span>
            )}
          </button>

          {/* BOUTON MON ESPACE (LES PIZZAS DU FEU DE DIEU) */}
          <button
            onClick={() => { setIsClientSpaceOpen(true); setIsCartOpen(false); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
              isClientSpaceOpen ? 'text-amber-300 font-extrabold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <div className="relative">
              <User className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse" />
            </div>
            <span className="text-[10px] font-bold">Mon Espace</span>
          </button>

          <a
            href={`https://wa.me/${targetWhatsapp}?text=${encodeURIComponent('Bonjour Les Pizzas du feu de Dieu ! Je souhaite commander.')}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 py-1 px-3 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
