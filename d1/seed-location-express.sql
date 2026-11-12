-- ==============================================================================
-- LOCATION EXPRESS GABON - SEED D1 (VOITURES & APPARTEMENTS MEUBLÉS)
-- Style : Neumorphisme & Clairmorphisme Mobile-First
-- ==============================================================================

-- 1. Inscription du Tenant "location-express"
INSERT OR REPLACE INTO tenants (
  slug, name, whatsapp, admin_key, custom_domain, theme_choice, catalog_type,
  license_status, license_expiry, license_plan, settings_json
) VALUES (
  'location-express',
  'Location Express Gabon',
  '24162744533',
  'Client2026',
  'locationexpressgabon.com',
  'neumorphic_rental',
  'location_auto_meuble',
  'active',
  '2030-01-01',
  'pro',
  json('{
    "site_layout": "neumorphic_rental",
    "theme_choice": "neumorphic_rental",
    "catalog_type": "location_auto_meuble",
    "company_name": "Location Express Gabon",
    "company_logo_url": "/logo-location-express.jpg",
    "tagline": "Location de Véhicules et d'Appartements Meublés",
    "city_location": "Owendo & Libreville, Gabon",
    "whatsapp_number": "24162744533",
    "contact_email": "santanaviciento1975@gmail.com",
    "contact_phone": "+241 62 74 45 33",
    "admin_code": "Client2026",
    "default_whatsapp_message": "👋 Bonjour Location Express Gabon, je souhaite réserver le véhicule Mazda CX-5 ou un meublé.",
    "hero_badge": "LOCATION DE VÉHICULES ET D'APPARTEMENTS MEUBLÉS",
    "hero_title": "Location Express Gabon",
    "hero_subtitle": "Voyagez, Séjournez... en toute sérénité ! Flotte de SUV Mazda CX-5 récents et appartements meublés de grand standing à Owendo et Libreville.",
    "about_title": "Location Express Gabon - Voyagez, Séjournez... en toute sérénité !",
    "about_description": "Location Express Gabon vous accompagne pour tous vos séjours et déplacements au Gabon (Owendo, Libreville et intérieur). Flotte de SUV Mazda récents et appartements meublés sécurisés grand confort.",
    "color_primary": "#0062FF",
    "color_secondary": "#00D68F",
    "color_accent": "#00A3FF",
    "color_bg_main": "#F0F4FA",
    "color_bg_secondary": "#FFFFFF",
    "stat1_value": "+50",
    "stat1_label": "Véhicules & Meublés",
    "stat2_value": "24h/7j",
    "stat2_label": "Réservation WhatsApp",
    "stat3_value": "100%",
    "stat3_label": "Sécurité & Confort",
    "stat4_value": "Owendo",
    "stat4_label": "Libreville & Gabon",
    "promo_banner_active": "true",
    "promo_banner_text": "🚗 Voyagez, Séjournez... en toute sérénité ! Flotte Mazda CX-5 disponible à Owendo & Libreville",
    "posters_badge": "CATALOGUE DISPONIBLE",
    "posters_title": "Nos Véhicules & Meublés",
    "posters_subtitle": "Consultez les photos et réservez en 1 clic sur WhatsApp.",
    "show_posters_section": "true",
    "show_videos_section": "false",
    "show_packages_section": "false",
    "show_devis_calculator": "false",
    "show_cart": "false",
    "custom_posters": [
      {
        "id": "car-01",
        "title": "Mazda CX-5 SUV Luxe Blanche",
        "category": "Voiture",
        "format": "SUV / Crossover Luxe",
        "dimensions": "5 Places • Boîte Auto • Climatisation Pro",
        "price_fcfa": 45000,
        "price_eur": 69,
        "badge": "VÉHICULE DU FLYER",
        "image_url": "/flyer-location-express.jpg",
        "images": [
          "/flyer-location-express.jpg",
          "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
        ],
        "description": "Mazda CX-5 récent, très confortable et économique. Parfait pour vos déplacements et séjours d'affaires à Owendo et Libreville. Climatisation intégrale, intérieur soigné et grand confort de conduite.",
        "features": [
          "Véhicules récents et bien entretenus (Flyer Officiel)",
          "Boîte automatique séquentielle fluide",
          "Climatisation intégrale grand confort",
          "Assurance tous risques incluse",
          "Disponible immédiatement à Owendo & Libreville"
        ]
      },
      {
        "id": "house-01",
        "title": "Villa de Luxe 3 Chambres - La Sablière",
        "category": "Meublé",
        "format": "Villa VIP",
        "dimensions": "3 Chambres • Salon VIP • Piscine",
        "price_fcfa": 75000,
        "price_eur": 115,
        "badge": "COUP DE COEUR",
        "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        "images": [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
        ],
        "description": "Somptueuse villa meublée à La Sablière avec piscine privée, grand salon contemporain et suites parentales climatisées. Environnement sécurisé haut standing.",
        "features": [
          "Wifi Fibre Optique très haut débit illimité",
          "Groupe électrogène automatique & Cuve 2000L",
          "Sécurité gardiennage 24h/24 & caméras",
          "Toutes les pièces entièrement climatisées",
          "Cuisine américaine tout équipée avec lave-vaisselle"
        ]
      },
      {
        "id": "car-02",
        "title": "Hyundai Tucson Crossover Éco",
        "category": "Voiture",
        "format": "Crossover Urbain",
        "dimensions": "5 Places • Essence • Automatique",
        "price_fcfa": 40000,
        "price_eur": 61,
        "badge": "ÉCONOMIQUE",
        "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        "images": [
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
        ],
        "description": "Crossover urbain moderne, très économique en consommation de carburant et extrêmement agréable à conduire pour tous vos déplacements à Libreville.",
        "features": [
          "Consommation ultra réduite en milieu urbain",
          "Écran tactile multimédia Bluetooth & caméra de recul",
          "Climatisation automatique fraîche",
          "Intérieur propre et confortable"
        ]
      },
      {
        "id": "house-02",
        "title": "Appartement F2 Standing - Haut de Gué-Gué",
        "category": "Meublé",
        "format": "Appartement T2",
        "dimensions": "1 Chambre • Grand Salon • Cuisine Ouverte",
        "price_fcfa": 35000,
        "price_eur": 53,
        "badge": "POPULAIRE",
        "image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        "images": [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80"
        ],
        "description": "Charmant appartement meublé dans un immeuble résidentiel au Haut de Gué-Gué. Quartier sécurisé, calme et facilement accessible.",
        "features": [
          "Smart TV connectée avec Canal+ et Netflix",
          "Autonomie en eau et en électricité continue",
          "Ménage inclus 3 fois par semaine",
          "Machine à laver et literie haut de gamme"
        ]
      },
      {
        "id": "car-03",
        "title": "Toyota Hilux Double Cabine 4x4",
        "category": "Voiture",
        "format": "Pick-Up Tout-Terrain",
        "dimensions": "5 Places • Grande Benne • Diesel",
        "price_fcfa": 55000,
        "price_eur": 84,
        "badge": "TOUT-TERRAIN",
        "image_url": "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80",
        "images": [
          "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"
        ],
        "description": "La référence du tout-terrain au Gabon. Prêt pour affronter les pistes difficiles ou transporter du matériel en toute sérénité.",
        "features": [
          "Châssis renforcé tout-terrain & pare-buffles",
          "Grande benne arrière pour valises ou matériel",
          "Moteur Turbo Diesel économique et endurant"
        ]
      },
      {
        "id": "house-03",
        "title": "Studio Cosy Design - Batterie 4",
        "category": "Meublé",
        "format": "Studio Équipé",
        "dimensions": "Lit King Size • Kitchenette • Balcon",
        "price_fcfa": 25000,
        "price_eur": 38,
        "badge": "DISPONIBLE",
        "image_url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        "images": [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80"
        ],
        "description": "Studio moderne et intime à proximité du bord de mer et des commerces de Batterie 4. Idéal pour un séjour professionnel court ou une escapade.",
        "features": [
          "Proche de tous les restaurants et commerces",
          "Climatisation neuve & eau chaude continue",
          "Wifi fibre optique & espace bureau"
        ]
      }
    ]
  }')
);

-- 2. Clône pour le slug court 'l' (sans custom_domain pour éviter le conflit UNIQUE)
INSERT OR REPLACE INTO tenants (
  slug, name, whatsapp, admin_key, custom_domain, theme_choice, catalog_type,
  license_status, license_expiry, license_plan, settings_json
) SELECT 
  'l', name, whatsapp, admin_key, NULL, theme_choice, catalog_type,
  license_status, license_expiry, license_plan, settings_json
FROM tenants WHERE slug = 'location-express';

-- 3. Licence SaaS active
INSERT OR REPLACE INTO saas_licenses (
  id, tenant_slug, client_name, status, plan_name, monthly_price_fcfa, expires_at
) VALUES (
  'lic-location-express',
  'location-express',
  'Location Express Gabon',
  'active',
  'Standard Pro',
  25000,
  '2030-01-01 00:00:00'
);
