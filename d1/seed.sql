-- ==========================================
-- DIGITAL MARK PRO - Cloudflare D1 Seed Data
-- ==========================================

-- Insertion des Vidéos Publicitaires
INSERT OR REPLACE INTO videos (
  id, title, slug, category, format, duration, resolution,
  video_url, preview_url, thumbnail_url, price_fcfa, price_eur,
  badge, description, features, views_count, likes_count, display_order
) VALUES
(
  'vid-01',
  'Spot Publicitaire Cinématique 4K - Lancement de Marque',
  'spot-cinema-4k-lancement',
  'spot_tv',
  '16:9',
  '30s',
  '4K Ultra HD 60fps',
  'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-light-40157-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-light-40157-large.mp4',
  'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
  65000,
  99,
  'SPOT CINÉMA 4K',
  'Spot publicitaire haut de gamme avec cadrage cinématographique, étalonnage couleur cinéma (Color Grading), sound design immersif et hook captivant dès la 2ème seconde pour captiver votre audience.',
  '["Cadrage cinématographique & B-Rolls 4K", "Voix-off Studio Pro (Accent au choix)", "Sound Design & Mixage audio immersif", "Scripting & Copywriting persuasif inclus", "Sous-titrage animé & Effets de rythme", "Cession des droits commerciaux illimités", "Délai de livraison : 48h ouvrées"]',
  3820,
  342,
  1
),
(
  'vid-02',
  'Vidéo TikTok & Reels E-Commerce Viral Hook',
  'tiktok-reels-ecommerce-viral',
  'tiktok_reels',
  '9:16',
  '20s',
  '1080x1920 Vertical HD',
  'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80',
  25000,
  39,
  'BEST-SELLER VIRAL',
  'Format vertical ultra-dynamique calibré pour l''algorithme TikTok, Instagram Reels et YouTube Shorts. Conçu avec les techniques d''accroche psychologique pour maximiser le taux de rétention et déclencher l''achat.',
  '["Format optimisé TikTok / Reels / Shorts 9:16", "Hook visuel & textuel explosif (< 3 sec)", "Sous-titres dynamiques style Alex Hormozi", "Musique tendance libre de droits", "Call-To-Action (CTA) percutant vers votre boutique", "A/B Testing : 2 accroches différentes offertes", "Livraison Express en 24h à 48h"]',
  5910,
  614,
  2
),
(
  'vid-03',
  'Motion Design 3D & Animation Produit Électronique',
  'motion-design-3d-produit',
  'motion_design',
  '16:9',
  '35s',
  '4K Ultra HD',
  'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-green-screen-41223-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-green-screen-41223-large.mp4',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  45000,
  69,
  'MOTION 3D ELITE',
  'Animation vectorielle et modélisation 3D pour présenter votre application, logiciel SaaS, gadget technologique ou service immatériel avec un rendu futuriste et ultra-professionnel.',
  '["Animations 2D/3D et modélisation fluide", "Storyboarding et conception graphique sur-mesure", "Intégration d''éléments d''interface UI animés", "Synchronisation son/image au millième de seconde", "Voix-off IA ultra-réaliste ou humaine", "Formats 16:9 + 9:16 inclus", "2 séries de retouches offertes"]',
  2740,
  210,
  3
),
(
  'vid-04',
  'Vidéo UGC (Contenu Créateur) Témoignage Produit',
  'ugc-createur-temoignage-produit',
  'ugc',
  '9:16',
  '30s',
  '1080x1920 Vertical HD',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1232-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1232-large.mp4',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  35000,
  55,
  'AUTHENTIQUE UGC',
  'Vidéo de style User-Generated Content filmée au smartphone haute qualité par un créateur. Aspect 100% naturel qui casse les barrières de méfiance et génère 3x plus de clics sur les publicités Facebook et TikTok Ads.',
  '["Créateur de contenu dédié adapté à votre cible", "Angle unboxing, test en direct ou transformation avant/après", "Rendu naturel non-promotionnel à fort impact", "Montage dynamique avec zooms et cuts rythmés", "Sous-titres colorés et stickers natifs", "Prêt pour sponsorisation Meta & TikTok Ads", "Délai moyen : 48h"]',
  4210,
  389,
  4
),
(
  'vid-05',
  'Vidéo de Vente VSL (Video Sales Letter) High Ticket',
  'vsl-video-sales-letter-high-ticket',
  'vsl_ecommerce',
  '16:9',
  '60s',
  '4K Ultra HD',
  'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
  'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
  50000,
  79,
  'CONVERSION MAX',
  'Format vidéo spécialement conçu pour les pages de capture et tunnels de vente. Structure narrative éprouvée : Problème -> Agitation -> Solution unique -> Preuve sociale -> Appel à l''action irrésistible.',
  '["Copywriting hypnotique basé sur les biais décisionnels", "Voix-off persuasive studio avec intonations stratégiques", "Typographie kinetic animée & graphismes d''autorité", "Optimisation pour page Web & temps de chargement éclair", "Dossier de conversion : Script complet fourni au client", "Export multirésolution pour Web & Réseaux"]',
  1980,
  165,
  5
),
(
  'vid-06',
  'Spot Publicitaire Réseaux Sociaux Restauration & Food',
  'spot-pub-restauration-food-luxury',
  'spot_tv',
  '9:16',
  '25s',
  '4K Vertical 60fps',
  'https://assets.mixkit.co/videos/preview/mixkit-top-aerial-shot-of-seashore-with-rocks-1090-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-top-aerial-shot-of-seashore-with-rocks-1090-large.mp4',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  30000,
  49,
  'GOURMET 4K',
  'Spot appétissant et sensoriel pour restaurants, fast-foods premium, pâtisseries et traiteurs. Gros plans texturés, bruits de cuisson réalistes et accroche qui donne faim instantanément.',
  '["Prises de vue macro / slow-motion 60fps", "Sound design ASMR appétissant (grésillement, croustillant)", "Mise en avant des prix et offres spéciales du moment", "Animations de localisation & bouton WhatsApp / Téléphone", "Format adapté aux Stories Instagram & Facebook", "Livraison en 24h-48h"]',
  3150,
  290,
  6
);

-- Insertion des Affiches & Visuels Publicitaires
INSERT OR REPLACE INTO posters (
  id, title, category, format, dimensions, image_url,
  price_fcfa, price_eur, badge, description, features
) VALUES
(
  'post-01',
  'Affiche Événementielle Prestige & Conférence VIP',
  'Affiche Événementielle',
  'A3 / A2 Haute Définition',
  '3508 x 4961 px (300 DPI)',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
  15000,
  25,
  'PRESTIGE PRINT',
  'Conception graphique haut de gamme pour soirées d''exception, conférences, concerts et galas d''entreprise. Typographie percutante, contrastes luxueux et hiérarchie visuelle irréprochable.',
  '["Fichier prêt à imprimer (CMJN 300 DPI avec fonds perdus)", "Déclinaison écran HD (RVB pour réseaux sociaux)", "Typographies sous licence commerciale", "Retouche photo avancée des intervenants incluse", "Livraison sous 24h en formats PDF, PNG et JPEG"]'
),
(
  'post-02',
  'Bannière Publicitaire Social Ads & Campagne Meta / Google',
  'Bannière Social Ads',
  'Pack Multiformat (Story, Feed, Paysage)',
  '1080x1080, 1080x1920, 1200x628',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
  20000,
  35,
  'PACK 3 FORMATS',
  'Ensemble de visuels publicitaires calibrés pour les campagnes sponsorisées. Conçus selon les règles des 20% de texte de Facebook et optimisés pour générer un taux de clic (CTR) record.',
  '["Pack de 3 formats : Carré (Post), Story (9:16), Bannière Web (16:9)", "Design axé sur la psychologie de conversion", "Mise en valeur magnétique de votre offre ou promotion", "Fichiers légers optimisés pour chargement instantané", "Modifications illimitées jusqu''à satisfaction"]'
),
(
  'post-03',
  'Carrousel Instagram & LinkedIn Stratégique (7-10 Slides)',
  'Carrousel',
  'Carrousel Éducatif & Vente',
  '1080x1350 px (Format Portrait)',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  25000,
  39,
  'ENGAGEMENT X5',
  'Carrousel séquentiel à fort engagement pour asseoir votre autorité, éduquer votre audience et convertir vos abonnés en clients. Diapositives connectées avec effet de glissement infini.',
  '["Structure 7 à 10 diapositives avec continuité visuelle", "Conception graphique adaptée à votre charte de marque", "Relecture et mise en forme de votre texte/contenu", "Slide finale avec appel à l''action puissant (CTA)", "Format PNG HD haute fidélité prêt à publier"]'
),
(
  'post-04',
  'Flyer Commercial & Dépliant Promotionnel Street / Digital',
  'Flyer Commercial',
  'A5 Recto/Verso',
  '2480 x 3508 px',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
  12000,
  20,
  'OFFRE PROMO',
  'Support de communication incontournable pour vos inaugurations, promotions de saison, menus de restaurant ou présentations d''offres de service en distribution physique ou partage WhatsApp.',
  '["Design Recto ou Recto/Verso au choix", "Intégration d''un QR Code interactif vers votre WhatsApp/Site", "Format d''impression professionnel + version PDF interactive", "Mise en avant des tarifs et avantages clients", "Livraison en 24h ouvrées"]'
);

-- Insertion des Packs Marketing
INSERT OR REPLACE INTO packages (
  id, name, tagline, price_fcfa, price_eur, period, is_popular, features
) VALUES
(
  'pack-starter',
  'Pack Starter Visibilité',
  'Idéal pour lancer un nouveau produit ou tester une campagne',
  45000,
  69,
  'par projet',
  0,
  '["2 Vidéos courtes TikTok/Reels (9:16)", "2 Affiches publicitaires réseaux sociaux", "Scripts de vente et accroches fournis", "Sous-titres dynamiques inclus", "Droits commerciaux 100% cédés", "Livraison en 72h"]'
),
(
  'pack-growth',
  'Pack Growth Booster',
  'Le pack le plus populaire pour dominer vos réseaux et doubler vos ventes',
  95000,
  149,
  'par mois / pack',
  1,
  '["5 Vidéos publicitaires (9:16 + 16:9)", "4 Affiches publicitaires & 1 Carrousel complet", "Voix-off Studio Pro incluse sur toutes les vidéos", "Montage dynamique & Sound Design haute intensité", "Déclinaisons multiformats (Post, Story, Ads)", "Support prioritaire direct WhatsApp 7j/7", "Livraison échelonnée ou groupée sous 48h"]'
),
(
  'pack-agency',
  'Pack Dominance Entreprise',
  'Production complète et accompagnement marketing mensuel haute intensité',
  190000,
  299,
  'par mois',
  0,
  '["12 Vidéos publicitaires 4K (Reels, TikTok, Spots Ciné)", "10 Visuels publicitaires & Carrousels stratégiques", "Gestion et paramétrage de vos campagnes publicitaires Meta Ads", "Direction artistique dédiée & scénarisation complète", "Réunions stratégiques mensuelles de cadrage", "Délais d''urgence 24h garantis", "Accès direct au directeur de production"]'
);

-- Insertion des Configurations Globales
INSERT OR REPLACE INTO settings (key, value) VALUES
('whatsapp_number', '24177000000'),
('company_name', 'DIGITAL MARK PRO'),
('agency_tagline', 'Studio Créatif Vidéo, Graphisme Publicitaire & Marketing High-Impact'),
('contact_email', 'contact@digitalmarkpro.com'),
('default_currency', 'FCFA');
