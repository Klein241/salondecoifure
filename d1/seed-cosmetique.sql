-- ==============================================================================
-- ABAIA COSMÉTIQUE - MODÈLE DE DÉMARRAGE SECTEUR COSMÉTIQUE, SOINS & BEAUTÉ
-- ==============================================================================
-- Ce fichier contient les produits, affiches, formules et réglages par défaut
-- pour cloner en 1-clic l'expérience Abaia Cosmétique pour un nouveau client.
-- ==============================================================================

-- 1. Table des Vidéos / Spots Cosmétiques
INSERT OR REPLACE INTO videos (
  id, title, slug, category, format, duration, resolution,
  video_url, preview_url, thumbnail_url, price_fcfa, price_eur,
  badge, description, features, views_count, likes_count, display_order
) VALUES
(
  'vid-01',
  'Crème hydratante visage & corps – 300 ml',
  'creme-hydratante-visage-corps',
  'creme_hydratante',
  '9:16',
  '30s',
  '4K Ultra HD',
  'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-light-40157-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-light-40157-large.mp4',
  '/api/media/1791543996825-abaia.webp',
  6500,
  9.91,
  'BEST-SELLER BEAUTÉ',
  'Crème hydratante visage et corps enrichie à 5% d’urée, eau de rose, niacinamide et huile d’argan. Pénètre rapidement sans fini gras.',
  '["Enrichie à 5% d''urée & Eau de rose", "Niacinamide, Huile d''argan & Amande douce", "Hydratation profonde visage et corps 24h", "Flacon pompe 300 ml hygiénique", "Convient à tous les types de peau", "Fabrication certifiée"]',
  4280,
  520,
  1
),
(
  'vid-02',
  'Spot Présentation Gamme Complète Éclat Naturel',
  'spot-presentation-gamme-eclat',
  'creme_hydratante',
  '9:16',
  '25s',
  '1080x1920 Vertical HD',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1232-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1232-large.mp4',
  '/api/media/1791547896073-Capture_d__cran_2026-10-09_131041.webp',
  7000,
  10.0,
  'OFFRE DUO',
  'Découvrez notre rituel complet : Gel Douche purifiant, Lait Caramel nourrissant et Crème Hydratante réparatrice.',
  '["Routine complète matin et soir", "Uniformise le teint sans agresser", "Actifs éclaircissants et nourrissants doux", "Résultats visibles dès 14 jours", "Conseils d''utilisation personnalisés par WhatsApp"]',
  6150,
  710,
  2
);

-- 2. Table des Affiches & Produits Cosmétiques
INSERT OR REPLACE INTO posters (
  id, title, category, format, dimensions, image_url, price_fcfa, price_eur, badge, description, features
) VALUES
(
  'post-01',
  'Gel Douche Perfecte Glow',
  'Affiche Événementielle',
  'A3 / A2 Haute Définition',
  '3508 x 4961 px (300 DPI)',
  '/api/media/1791543950951-1001672994.webp',
  6500,
  9.91,
  'PRESTIGE PRINT',
  'Abaia Cosmétique – Gel Douche Perfecte Glow\n\nDécouvrez le Gel Douche Perfecte Glow d’Abaia Cosmétique, conçu pour nettoyer, nourrir et sublimer la peau. Sa formule contient du curcuma, de la poudre de malice, de la vitamine E et de l’acide kojique.\n\nBienfaits :\n- Nettoie en douceur et purifie la peau.\n- Apporte de l’éclat au teint et contribue à son uniformité.\n- Hydrate et nourrit la peau.\n- Apporte douceur et fraîcheur.\n\nContenance : 300 ml',
  '["Curcuma, vitamine E et acide kojique","Nettoie en douceur et purifie la peau","Apporte éclat et uniformité au teint","Mousse onctueuse et parfum délicat","Contenance 300 ml"]'
),
(
  'post-02',
  'Crème hydratante visage & corps',
  'Bannière Social Ads',
  'Pack Multiformat (Story, Feed, Paysage)',
  '1080x1080, 1080x1920, 1200x628',
  '/api/media/1791543996825-abaia.webp',
  6500,
  9.91,
  'PACK 3 FORMATS',
  'Abaia Cosmétique – Crème hydratante visage & corps\n\nDécouvrez la crème hydratante visage et corps Abaia Cosmétique, enrichie à 5 % d’urée.\n\nComposition :\n- Eau de rose\n- Urée\n- Niacinamide\n- Glycérine\n- Huile d’argan\n- Amande douce\n- Allantoïne\n\nContenance : 300 ml',
  '["Enrichie à 5% d''urée","Eau de rose & Niacinamide","Huile d''argan et amande douce","Non grasse, pénétration ultra-rapide","Contenance 300 ml"]'
),
(
  'post-03',
  'Gel Métisse Éclaircissant',
  'Carrousel',
  'Carrousel Éducatif & Vente',
  '1080x1350 px (Format Portrait)',
  '/api/media/1791547896073-Capture_d__cran_2026-10-09_131041.webp',
  6500,
  9.91,
  'ENGAGEMENT X5',
  'Gel Métisse Éclaircissant\n\nDécouvrez le Gel Métisse Éclaircissant d’Abaïa Cosmétiques, conçu pour unifier le teint, illuminer la peau et révéler son éclat naturel.\n\nCONTENANCE : 500 ml\nCOMPOSITION : Arbutin, Glutathion, Vitamine C.',
  '["Arbutin, Glutathion & Vitamine C","Uniformise le teint et estompe les taches","Sans parabène, non testé sur les animaux","Grand format 500 ml économique","Formule douce haute efficacité"]'
),
(
  'post-04',
  'LAIT CARAMEL ÉCLAT NATUREL',
  'Flyer Commercial',
  'A5 Recto/Verso',
  '2480 x 3508 px',
  '/api/media/1791548135374-Lait_Caramel___clat_naturel_Aba_a.webp',
  6500,
  9.91,
  'OFFRE PROMO',
  'ABAÏA COSMÉTIQUES – LAIT CARAMEL ÉCLAT NATUREL\n\nLe Lait Caramel Éclat Naturel d’Abaïa Cosmétiques est un lait de toilette conçu pour unifier le teint, hydrater et nourrir la peau, tout en révélant son éclat naturel.\n\nCOMPOSITION : Acide kojique, Vitamine C, Acide salicylique, Huile d’argan.\nCONTENANCE : 500 ml',
  '["Acide kojique et Vitamine C","Hydrate, nourrit et illumine la peau","Formule naturelle convenant à tous types de peau","Grand flacon pompe 500 ml","Slogan : L’élégance de votre peau au naturel"]'
);

-- 3. Packs Cosmétiques
INSERT OR REPLACE INTO packages (
  id, name, tagline, price_fcfa, price_eur, period, is_popular, features
) VALUES
(
  'pack-01',
  'Pack Beauté Essentiel',
  'Duo Crème Hydratante + Gel Douche Glow',
  12000,
  18,
  'par commande',
  0,
  '["1x Crème Hydratante 300 ml", "1x Gel Douche Perfecte Glow 300 ml", "Livraison soignée", "Conseils d''application par WhatsApp"]'
),
(
  'pack-02',
  'Coffret Rituel Éclat Total',
  'Trio Crème + Gel Métisse + Lait Caramel',
  18500,
  28,
  'par commande',
  1,
  '["1x Crème Hydratante Visage & Corps 300 ml", "1x Gel Métisse Éclaircissant 500 ml", "1x Lait Caramel Éclat Naturel 500 ml", "1x Éponge exfoliante offerte", "Livraison prioritaire incluse", "Suivi beauté personnalisé WhatsApp 30 jours"]'
);
