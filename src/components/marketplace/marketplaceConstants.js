// ========================================================
// 1. CATALOGUE OFFICIEL KTFA FLEX (12 ARTICLES HIGH-TECH & BUSINESS)
// ========================================================
export const DEFAULT_KTFA_ITEMS = [
  {
    id: 'ktfa-01',
    title: 'Apple iPhone 15 Pro Max 256GB Titane',
    category: 'High-Tech & Smartphones',
    format: 'Smartphone Flagship Apple',
    dimensions: 'Puce A17 Pro • Écran 6.7" ProMotion • Caméra 48MP Zoom 5x • Titane Naturel',
    price_fcfa: 850000,
    price_eur: 1295,
    installment_months: 4,
    monthly_fcfa: 212500,
    rating: 5.0,
    reviews_count: 84,
    badge: 'FLAGSHIP APPLE 📱',
    badge_color: 'bg-emerald-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    description: 'Le summum de la technologie Apple conçu en titane aérospatial ultra-léger et résistant. Écran immersif 120Hz ProMotion, zoom optique 5x et autonomie exceptionnelle pour les professionnels exigeants. Disponible au comptant ou en 4 tranches souples.',
    features: ['Garantie constructeur 12 mois', 'Paiement échelonné 4x 212 500 F', 'Livraison sécurisée avec signature', 'Coque de protection & verre trempé offerts'],
    popular: true
  },
  {
    id: 'ktfa-02',
    title: 'Samsung Galaxy S24 Ultra 512GB Titanium',
    category: 'High-Tech & Smartphones',
    format: 'Smartphone IA Révolutionnaire',
    dimensions: 'Galaxy AI Intégrée • S-Pen Inclus • Capteur 200MP • Snapdragon 8 Gen 3',
    price_fcfa: 790000,
    price_eur: 1205,
    installment_months: 4,
    monthly_fcfa: 197500,
    rating: 4.9,
    reviews_count: 62,
    badge: 'GALAXY AI 🤖',
    badge_color: 'bg-blue-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    description: 'Le monstre de puissance Samsung boosté à l\'intelligence artificielle. Traduction instantanée, retouche photo intelligente, écran Dynamic AMOLED 2X ultra-lumineux et stylet S-Pen pour une productivité absolue.',
    features: ['Galaxy AI intégrée sans abonnement', 'Paiement échelonné 4x 197 500 F', 'Chargeur ultra-rapide 45W offert', 'Film protecteur hydrogel posé en atelier'],
    popular: true
  },
  {
    id: 'ktfa-03',
    title: 'Apple MacBook Air M2 13.6" 256GB SSD',
    category: 'Informatique & Bureautique',
    format: 'Ultrabook Pro Léger & Puissant',
    dimensions: 'Puce Apple M2 • 8GB RAM • 256GB SSD • Autonomie 18h • Écran Liquid Retina',
    price_fcfa: 650000,
    price_eur: 990,
    installment_months: 4,
    monthly_fcfa: 162500,
    rating: 5.0,
    reviews_count: 56,
    badge: 'BEST-SELLER PRO 💻',
    badge_color: 'bg-indigo-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    description: 'L\'ordinateur portable idéal pour les cadres, étudiants et entrepreneurs. Fin, silencieux sans ventilateur, avec une batterie qui tient toute la journée et des performances impressionnantes.',
    features: ['Clavier Magic Keyboard rétroéclairé', 'Paiement échelonné 4x 162 500 F', 'Housse de transport antichoc offerte', 'Pack Microsoft Office 365 configuré'],
    popular: true
  },
  {
    id: 'ktfa-04',
    title: 'Smart TV Samsung 55" Crystal UHD 4K HDR',
    category: 'Électroménager & Maison',
    format: 'Téléviseur Connecté 4K',
    dimensions: 'Résolution 4K UHD 3840x2160 • Smart Hub Tizen • Dolby Digital Plus • 3x HDMI',
    price_fcfa: 320000,
    price_eur: 488,
    installment_months: 4,
    monthly_fcfa: 80000,
    rating: 4.8,
    reviews_count: 73,
    badge: '4K ULTRA HD 📺',
    badge_color: 'bg-amber-500 text-slate-950 font-black',
    image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    description: 'Plongez au cœur de vos divertissements avec des contrastes saisissants grâce au processeur Crystal 4K. Compatible Netflix, YouTube, Canal+ et Prime Video.',
    features: ['Accès direct Netflix & YouTube', 'Paiement échelonné 4x 80 000 F', 'Support mural inclinable offert', 'Installation & réglage à domicile offerts'],
    popular: true
  },
  {
    id: 'ktfa-05',
    title: 'Réfrigérateur Combiné NoFrost Hisense 300L',
    category: 'Électroménager & Maison',
    format: 'Réfrigérateur / Congélateur Éco',
    dimensions: 'Capacité 300L • Technologie Total NoFrost • Multi Air Flow • Finition Inox',
    price_fcfa: 270000,
    price_eur: 412,
    installment_months: 3,
    monthly_fcfa: 90000,
    rating: 4.9,
    reviews_count: 48,
    badge: 'TOTAL NO FROST ❄️',
    badge_color: 'bg-cyan-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80',
    description: 'Préservez la fraîcheur optimale de vos aliments sans aucune corvée de givre grâce au système Total No Frost. Économique en énergie et silencieux, idéal pour les familles camerounaises.',
    features: ['Technologie Multi Air Flow', 'Paiement échelonné 3x 90 000 F', 'Garantie compresseur 2 ans', 'Régulateur de tension inclus'],
    popular: true
  },
  {
    id: 'ktfa-06',
    title: 'Pack Starter Entrepreneur Clé en Main',
    category: 'Packs Business & Tontine',
    format: 'Équipement Pro Complet',
    dimensions: 'PC HP 15" Core i5 • Imprimante HP Smart Tank Wifi • Onduleur 650VA Pro',
    price_fcfa: 380000,
    price_eur: 580,
    installment_months: 4,
    monthly_fcfa: 95000,
    rating: 5.0,
    reviews_count: 91,
    badge: 'PACK BUSINESS 💼',
    badge_color: 'bg-purple-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    description: 'Le kit d\'indépendance professionnelle par excellence ! Tout le nécessaire pour lancer votre cabinet, agence, boutique ou bureau à domicile : PC rapide, imprimante à recharge économique et onduleur.',
    features: ['Pack 3-en-1 prêt à l\'emploi', 'Paiement échelonné 4x 95 000 F', 'Suite bureautique configurée', 'Assistance prioritaire 6 mois'],
    popular: true
  },
  {
    id: 'ktfa-07',
    title: 'Sony PlayStation 5 Slim Standard + 2 Manettes',
    category: 'Gaming & Mobilité',
    format: 'Console Next-Gen avec Lecteur',
    dimensions: 'Lecteur Blu-Ray 4K • SSD 1TB Ultra-Rapide • 2 Manettes DualSense Sans Fil',
    price_fcfa: 420000,
    price_eur: 640,
    installment_months: 3,
    monthly_fcfa: 140000,
    rating: 5.0,
    reviews_count: 110,
    badge: 'NEXT-GEN GAMING 🎮',
    badge_color: 'bg-blue-700 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    description: 'Vivez des sensations uniques en 4K jusqu\'à 120 FPS avec le retour haptique révolutionnaire de la manette DualSense. Livrée avec 2 manettes officielles.',
    features: ['2 manettes DualSense incluses', 'Paiement échelonné 3x 140 000 F', 'Jeu EA Sports FC 24 offert', 'Garantie échange à neuf 6 mois'],
    popular: true
  },
  {
    id: 'ktfa-08',
    title: 'Climatiseur Split Inverter Gree 1.5 CV Éco',
    category: 'Électroménager & Maison',
    format: 'Climatiseur Silencieux Haute Efficacité',
    dimensions: 'Capacité 12 000 BTU (1.5 CV) • Gaz R32 Écologique • Mode Turbo & Nuit Silencieux',
    price_fcfa: 255000,
    price_eur: 389,
    installment_months: 3,
    monthly_fcfa: 85000,
    rating: 4.8,
    reviews_count: 65,
    badge: 'INVERTER ÉCO ❄️',
    badge_color: 'bg-teal-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1614633833026-062045db10b7?auto=format&fit=crop&w=800&q=80',
    description: 'Gardez votre maison ou bureau à une fraîcheur agréable même en pleine canicule. La technologie Inverter Gree consomme jusqu\'à 60% d\'énergie en moins comparé aux climatiseurs classiques.',
    features: ['Consommation réduite classe A++', 'Paiement échelonné 3x 85 000 F', 'Kit tuyauterie 3m inclus', 'Garantie compresseur 3 ans'],
    popular: true
  },
  {
    id: 'ktfa-09',
    title: 'Machine à Laver LG 8kg Smart Inverter Direct Drive',
    category: 'Électroménager & Maison',
    format: 'Lave-Linge Frontal Intelligent',
    dimensions: 'Capacité 8kg • 1400 Tr/min • Moteur Direct Drive Silencieux • Vapeur Steam+',
    price_fcfa: 340000,
    price_eur: 518,
    installment_months: 4,
    monthly_fcfa: 85000,
    rating: 4.9,
    reviews_count: 42,
    badge: 'DIRECT DRIVE 🌀',
    badge_color: 'bg-sky-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    description: 'Prenez soin de tous vos textiles avec le tambour 6 Motion Direct Drive qui adapte ses mouvements pour un lavage doux et efficace. Fonction vapeur éliminant 99.9% des allergènes.',
    features: ['Moteur garanti 10 ans LG', 'Paiement échelonné 4x 85 000 F', 'Programme express 15 min', 'Économie d\'eau & d\'électricité'],
    popular: false
  },
  {
    id: 'ktfa-10',
    title: 'Groupe Électrogène Inverter Silencieux 3.5 kVA',
    category: 'Packs Business & Tontine',
    format: 'Générateur Électrique Portatif',
    dimensions: 'Puissance 3500W Max • Démarrage Électrique & Lanceur • Sortie Pure Sinus 230V',
    price_fcfa: 390000,
    price_eur: 595,
    installment_months: 4,
    monthly_fcfa: 97500,
    rating: 4.9,
    reviews_count: 79,
    badge: 'COURANT PUR ⚡',
    badge_color: 'bg-amber-600 text-slate-950 font-black',
    image_url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80',
    description: 'Ne laissez plus les coupures de courant paralyser votre confort ou votre business. Technologie Inverter délivrant un courant parfaitement stable sans danger pour les appareils sensibles.',
    features: ['Autonomie 8h en continu', 'Paiement échelonné 4x 97 500 F', 'Bruit ultra-atténué < 65dB', 'Roulettes & poignée de transport'],
    popular: true
  },
  {
    id: 'ktfa-11',
    title: 'Pack Salon Moderne Cuir & Tissu Confort 5 Places',
    category: 'Maison & Confort',
    format: 'Salon Panoramique Confort',
    dimensions: 'Canapé 3 Places + 2 Fauteuils Relax • Mousse Haute Résilience 35kg/m³',
    price_fcfa: 540000,
    price_eur: 823,
    installment_months: 4,
    monthly_fcfa: 135000,
    rating: 5.0,
    reviews_count: 33,
    badge: 'LUXE & CONFORT 🛋️',
    badge_color: 'bg-orange-600 text-white font-black',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    description: 'Sublimez votre intérieur avec cet ensemble alliant le cuir de qualité et le tissu antitache soyeux. Assise spacieuse et profonde pour de merveilleux moments de détente.',
    features: ['Structure bois massif traité', 'Paiement échelonné 4x 135 000 F', 'Coussins déco assortis offerts', 'Livraison & installation incluses'],
    popular: false
  },
  {
    id: 'ktfa-12',
    title: 'Trottinette Électrique Xiaomi Pro 4 Longue Portée',
    category: 'Gaming & Mobilité',
    format: 'Trottinette Électrique Urbaine',
    dimensions: 'Moteur 350W • Vitesse max 25 km/h • Autonomie 45 km • Pneus 10" Tubeless',
    price_fcfa: 225000,
    price_eur: 343,
    installment_months: 3,
    monthly_fcfa: 75000,
    rating: 4.8,
    reviews_count: 51,
    badge: 'ÉCO-MOBILITÉ ⚡',
    badge_color: 'bg-emerald-500 text-slate-950 font-black',
    image_url: 'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=800&q=80',
    description: 'Dites adieu aux embouteillages urbains. Déplacez-vous rapidement, sans carburant et en toute sécurité. Pliage facile en 3 secondes.',
    features: ['Autonomie jusqu\'à 45 km', 'Paiement échelonné 3x 75 000 F', 'Double frein à disque avant/arrière', 'Casque de protection offert'],
    popular: true
  }
];

// Données démo initiales pour les 3 rubriques requises (Localisées au Cameroun)
export const INITIAL_DEMO_ORDERS = [
  {
    id: 'ORD-KTFA-2026-001',
    receiptNumber: 'REC-KTFA-8821-DELIV',
    productId: 'ktfa-04',
    title: 'Smart TV Samsung 55" Crystal UHD 4K HDR',
    category: 'Électroménager & Maison',
    image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    statusCategory: 'delivered', // "Déjà payé et livré"
    statusLabel: 'Déjà payé et livré',
    orderDate: '12 Janvier 2026',
    deliveryDate: '15 Janvier 2026 à 14h30',
    deliveryAddress: 'Quartier Bonapriso, Douala',
    recipientName: 'Kamga Jean-Paul',
    recipientPhone: '+237 699 12 34 56',
    paymentMode: 'Paiement Comptant (Orange Money *150#)',
    transactionRef: 'OM-CM-984410291',
    totalPrice: 320000,
    paidAmount: 320000,
    remainingAmount: 0,
    installments: [
      { tranche: 'Tranche unique (Comptant 100%)', date: '12/01/2026', amount: 320000, status: 'Payé', ref: 'OM-CM-984410291' }
    ],
    deliveryTracking: {
      status: 'Livré au destinataire avec signature',
      carrier: 'KTFA Express Douala 🇨🇲',
      signature: 'Kamga J-P. (Reçu en main propre)'
    }
  },
  {
    id: 'ORD-KTFA-2026-002',
    receiptNumber: 'REC-KTFA-9104-PAID',
    productId: 'ktfa-07',
    title: 'Sony PlayStation 5 Slim Standard + 2 Manettes',
    category: 'Gaming & Mobilité',
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    statusCategory: 'paid_pending', // "Payé non livré"
    statusLabel: 'Payé non livré',
    orderDate: '04 Février 2026',
    estimatedDelivery: '10 Février 2026 (En cours d\'acheminement)',
    deliveryAddress: 'Quartier Bastos, Yaoundé',
    recipientName: 'Nguele Priscille',
    recipientPhone: '+237 677 88 99 00',
    paymentMode: 'Paiement Intégral 100% (MTN Mobile Money *126#)',
    transactionRef: 'MTN-CM-772910384',
    totalPrice: 420000,
    paidAmount: 420000,
    remainingAmount: 0,
    installments: [
      { tranche: 'Règlement Intégral', date: '04/02/2026', amount: 420000, status: 'Payé', ref: 'MTN-CM-772910384' }
    ],
    deliveryTracking: {
      status: 'En préparation logistique / Expédition Yaoundé',
      carrier: 'KTFA Cargo Express Cameroun',
      signature: 'En attente'
    }
  },
  {
    id: 'ORD-KTFA-2026-003',
    receiptNumber: 'REC-KTFA-7749-INSTALL',
    productId: 'ktfa-01',
    title: 'Apple iPhone 15 Pro Max 256GB Titane',
    category: 'High-Tech & Smartphones',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    statusCategory: 'in_progress', // "En cours de paiement"
    statusLabel: 'En cours de paiement',
    orderDate: '18 Janvier 2026',
    estimatedDelivery: 'Dès validation de la 4ème échéance',
    deliveryAddress: 'Quartier Akwa, Douala',
    recipientName: 'Fotso Patrick',
    recipientPhone: '+237 691 44 20 18',
    paymentMode: 'Paiement Échelonné 4x (MTN MoMo *126#)',
    transactionRef: 'KTFA-CMR-ECH-2026-0182',
    totalPrice: 850000,
    paidAmount: 425000,
    remainingAmount: 425000,
    planTotalTranches: 4,
    tranchesPaidCount: 2,
    nextDueAmount: 212500,
    nextDueDate: '18 Février 2026',
    installments: [
      { tranche: 'Tranche 1/4 (Acompte Initial)', date: '18/01/2026', amount: 212500, status: 'Payé', ref: 'MOMO-CMR-8812904' },
      { tranche: 'Tranche 2/4 (2ème Tranche Février)', date: '05/02/2026', amount: 212500, status: 'Payé', ref: 'MOMO-CMR-9904123' },
      { tranche: 'Tranche 3/4 (3ème Tranche Mars)', date: '18/03/2026', amount: 212500, status: 'À venir', ref: 'En attente' },
      { tranche: 'Tranche 4/4 (Solde & Livraison)', date: '18/04/2026', amount: 212500, status: 'À venir', ref: 'En attente' }
    ],
    deliveryTracking: {
      status: 'Réservé au coffre-fort logistique KTFA Douala (Échéance 50%)',
      carrier: 'KTFA Direct Delivery Cameroun',
      signature: 'Réservation vérifiée'
    }
  }
];

export const COUNTRY_CONFIGS = {
  cameroun: {
    id: 'cameroun',
    name: 'Cameroun',
    flag: '🇨🇲',
    currency: 'FCFA',
    codePrefix: 'CMR',
    cities: [
      'Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Maroua',
      'Bamenda', 'Kribi', 'Limbe', 'Ngaoundéré', 'Bertoua',
      'Ebolowa', 'Dschang', 'Kumba', 'Loum', 'Nkongsamba', 'Edéa'
    ],
    primaryCity: 'Douala',
    secondaryCity: 'Yaoundé',
    carrier: 'KTFA Logistics Cameroun',
    mobileMoneyTitle: 'MTN MoMo & Orange Money Cameroun',
    mobileMoneyHint: 'Paiement sans frais via MTN (*126#) ou Orange (*150#)'
  },
  gabon: {
    id: 'gabon',
    name: 'Gabon',
    flag: '🇬🇦',
    currency: 'FCFA',
    codePrefix: 'GAB',
    cities: [
      'Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda',
      'Mouila', 'Lambaréné', 'Tchibanga', 'Koulamoutou', 'Makokou',
      'Akanda', 'Owendo', 'Ntoum'
    ],
    primaryCity: 'Libreville',
    secondaryCity: 'Port-Gentil',
    carrier: 'Gabon Logistics Express',
    mobileMoneyTitle: 'Airtel Money & Moov Money Gabon',
    mobileMoneyHint: 'Paiement sans frais via Airtel (*150#) ou Moov Africa (*555#)'
  },
  cote_divoire: {
    id: 'cote_divoire',
    name: "Côte d'Ivoire",
    flag: '🇨🇮',
    currency: 'FCFA',
    codePrefix: 'CIV',
    cities: [
      'Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Korhogo',
      'Daloa', 'Man', 'Gagnoa', 'Grand-Bassam', 'Anyama', 'Bingerville'
    ],
    primaryCity: 'Abidjan',
    secondaryCity: 'Yamoussoukro',
    carrier: 'Ivoire Express Logistics',
    mobileMoneyTitle: 'Wave, Orange Money & MTN MoMo CI',
    mobileMoneyHint: 'Paiement instantané via Wave, Orange ou MTN MoMo'
  },
  senegal: {
    id: 'senegal',
    name: 'Sénégal',
    flag: '🇸🇳',
    currency: 'FCFA',
    codePrefix: 'SEN',
    cities: [
      'Dakar', 'Thiès', 'Touba', 'Saint-Louis', 'Ziguinchor',
      'Mbour', 'Kaolack', 'Rufisque', 'Tambacounda'
    ],
    primaryCity: 'Dakar',
    secondaryCity: 'Thiès',
    carrier: 'Sénégal Cargo Express',
    mobileMoneyTitle: 'Wave & Orange Money Sénégal',
    mobileMoneyHint: 'Paiement instantané sans frais via Wave ou Orange Money'
  },
  rdc: {
    id: 'rdc',
    name: 'RD Congo',
    flag: '🇨🇩',
    currency: 'USD / FC',
    codePrefix: 'RDC',
    cities: [
      'Kinshasa', 'Lubumbashi', 'Goma', 'Bukavu', 'Kisangani',
      'Matadi', 'Kananga', 'Mbuji-Mayi', 'Kolwezi'
    ],
    primaryCity: 'Kinshasa',
    secondaryCity: 'Lubumbashi',
    carrier: 'Congo Express Cargo',
    mobileMoneyTitle: 'M-Pesa (Vodacom), Airtel & Orange RDC',
    mobileMoneyHint: 'Paiement direct via M-Pesa, Airtel Money ou Orange Money'
  },
  congo_brazza: {
    id: 'congo_brazza',
    name: 'Congo-Brazzaville',
    flag: '🇨🇬',
    currency: 'FCFA',
    codePrefix: 'COG',
    cities: [
      'Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso', 'Oyo'
    ],
    primaryCity: 'Brazzaville',
    secondaryCity: 'Pointe-Noire',
    carrier: 'Congo Rapide Delivery',
    mobileMoneyTitle: 'MTN Mobile Money & Airtel Money Congo',
    mobileMoneyHint: 'Règlement instantané via MTN MoMo ou Airtel Money'
  },
  benin: {
    id: 'benin',
    name: 'Bénin',
    flag: '🇧🇯',
    currency: 'FCFA',
    codePrefix: 'BEN',
    cities: [
      'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Djougou', 'Bohicon', 'Autre Ville / Saisie manuelle'
    ],
    primaryCity: 'Cotonou',
    secondaryCity: 'Porto-Novo',
    carrier: 'Bénin Express Delivery',
    mobileMoneyTitle: 'MTN MoMo, Moov Flooz & Celtiis Bénin',
    mobileMoneyHint: 'Paiement direct via MTN MoMo ou Moov Flooz'
  },
  togo: {
    id: 'togo',
    name: 'Togo',
    flag: '🇹🇬',
    currency: 'FCFA',
    codePrefix: 'TGO',
    cities: [
      'Lomé', 'Kara', 'Sokodé', 'Kpalimé', 'Atakpamé', 'Dapaong', 'Autre Ville / Saisie manuelle'
    ],
    primaryCity: 'Lomé',
    secondaryCity: 'Kara',
    carrier: 'Togo Logistics Express',
    mobileMoneyTitle: 'T-Money & Moov Flooz Togo',
    mobileMoneyHint: 'Paiement direct via T-Money (*145#) ou Moov Flooz'
  },
  guinee: {
    id: 'guinee',
    name: 'Guinée Conakry',
    flag: '🇬🇳',
    currency: 'GNF',
    codePrefix: 'GIN',
    cities: [
      'Conakry', 'Kankan', 'Kindia', 'Nzérékoré', 'Labé', 'Boké', 'Autre Ville / Saisie manuelle'
    ],
    primaryCity: 'Conakry',
    secondaryCity: 'Kindia',
    carrier: 'Guinée Express Fret',
    mobileMoneyTitle: 'Orange Money Guinée & MTN MoMo',
    mobileMoneyHint: 'Paiement via Orange Money Guinée ou MTN MoMo'
  },
  mali: {
    id: 'mali',
    name: 'Mali',
    flag: '🇲🇱',
    currency: 'FCFA',
    codePrefix: 'MLI',
    cities: [
      'Bamako', 'Sikasso', 'Ségou', 'Mopti', 'Kayes', 'Koutiala', 'Autre Ville / Saisie manuelle'
    ],
    primaryCity: 'Bamako',
    secondaryCity: 'Sikasso',
    carrier: 'Mali Express Cargo',
    mobileMoneyTitle: 'Orange Money Mali, Moov & Wave',
    mobileMoneyHint: 'Paiement sans frais via Orange Money ou Wave'
  },
  burkina: {
    id: 'burkina',
    name: 'Burkina Faso',
    flag: '🇧🇫',
    currency: 'FCFA',
    codePrefix: 'BFA',
    cities: [
      'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Autre Ville / Saisie manuelle'
    ],
    primaryCity: 'Ouagadougou',
    secondaryCity: 'Bobo-Dioulasso',
    carrier: 'Faso Express Delivery',
    mobileMoneyTitle: 'Orange Money BF & Moov Money',
    mobileMoneyHint: 'Paiement instantané via Orange Money ou Moov'
  },
  france: {
    id: 'france',
    name: 'France & Europe',
    flag: '🇫🇷',
    currency: 'EUR (€)',
    codePrefix: 'EUR',
    cities: [
      'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Lille', 'Nantes', 'Strasbourg', 'Bruxelles', 'Genève', 'Autre Ville / Saisie manuelle'
    ],
    primaryCity: 'Paris',
    secondaryCity: 'Lyon',
    carrier: 'Colissimo & DHL International',
    mobileMoneyTitle: 'Carte Bancaire, Virement SEPA & Apple Pay',
    mobileMoneyHint: 'Paiement sécurisé par CB ou virement bancaire'
  },
  international: {
    id: 'international',
    name: 'International (Autre Pays)',
    flag: '🌍',
    currency: 'FCFA / EUR / USD',
    codePrefix: 'INT',
    cities: [
      'Capitale / Ville Principale', 'Centre Urbain', 'Province / Région', 'Autre Ville / Saisie manuelle'
    ],
    primaryCity: 'Ville Principale',
    secondaryCity: 'Régions',
    carrier: 'DHL Express & Fret International',
    mobileMoneyTitle: 'Paiement International & Mobile Money',
    mobileMoneyHint: 'Règlement sécurisé multi-devises et expédition internationale'
  }
};

export const CAMEROON_CITIES = COUNTRY_CONFIGS.cameroun.cities;

export const EDUCATION_LEVELS = [
  'Secondaire / Baccalauréat',
  'Bac+2 / BTS / DUT',
  'Licence / Bac+3',
  'Master / Bac+5',
  'Doctorat / Diplôme d\'Ingénieur',
  'Autodidacte / Entrepreneur'
];
