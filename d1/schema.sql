-- ==========================================
-- DIGITAL MARK PRO - Cloudflare D1 Database
-- Schema SQL
-- ==========================================

-- Table des Vidéos Publicitaires
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT NOT NULL,         -- 'tiktok_reels', 'spot_tv', 'motion_design', 'vsl_ecommerce', 'ugc'
  format TEXT NOT NULL,           -- '9:16', '16:9', '1:1'
  duration TEXT NOT NULL,         -- '15s', '30s', '45s', '60s'
  resolution TEXT DEFAULT '4K Ultra HD',
  video_url TEXT NOT NULL,
  preview_url TEXT,
  thumbnail_url TEXT NOT NULL,
  price_fcfa INTEGER NOT NULL,
  price_eur INTEGER NOT NULL,
  badge TEXT,                     -- 'TOP VENTE', 'VIRAL REELS', 'SPOT 4K', 'MOTION VIP'
  description TEXT NOT NULL,
  features TEXT NOT NULL,         -- JSON array: ["Script & Copywriting inclus", "Voix-off Studio Pro", ...]
  views_count INTEGER DEFAULT 1420,
  likes_count INTEGER DEFAULT 185,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Affiches & Graphismes Publicitaires / Produits
CREATE TABLE IF NOT EXISTS posters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,         -- 'Affiche Événementielle', 'Bannière Social Ads', 'Flyer Commercial', 'Carrousel', 'Produits'
  format TEXT NOT NULL,           -- 'A3/A2 Print', 'Story 1080x1920', 'Post 1080x1080', 'Billboard 4x3'
  dimensions TEXT NOT NULL,
  image_url TEXT NOT NULL,
  images TEXT,
  video_url TEXT,
  price_fcfa INTEGER NOT NULL,
  price_eur INTEGER NOT NULL,
  badge TEXT,
  description TEXT NOT NULL,
  features TEXT NOT NULL,         -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Packs Marketing & Formules
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  price_fcfa INTEGER NOT NULL,
  price_eur INTEGER NOT NULL,
  period TEXT DEFAULT 'par mois / projet',
  is_popular BOOLEAN DEFAULT 0,
  features TEXT NOT NULL,         -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de Suivi des Demandes / Clics WhatsApp / Devis
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  client_name TEXT,
  client_phone TEXT,
  service_type TEXT NOT NULL,     -- 'video', 'poster', 'package', 'devis'
  item_id TEXT,
  item_title TEXT,
  details TEXT,
  estimated_price_fcfa INTEGER,
  whatsapp_message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'closed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de Configuration Système
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Table des Visites et Vues Réelles du Site (Trafic 100% Réel)
CREATE TABLE IF NOT EXISTS site_traffic_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,          -- Identifiant unique du visiteur (localStorage)
  session_id TEXT NOT NULL,          -- Identifiant de la session/visite (sessionStorage)
  page_path TEXT DEFAULT '/',        -- Page visitée
  referrer TEXT,                     -- Provenance du visiteur
  user_agent TEXT,                   -- Navigateur / Appareil
  country TEXT DEFAULT 'Inconnu',    -- Pays détecté par Cloudflare Edge (request.cf.country)
  city TEXT DEFAULT 'Inconnue',      -- Ville détectée par Cloudflare Edge (request.cf.city)
  is_unique_visit INTEGER DEFAULT 0, -- 1 si nouvelle visite/session, 0 si rechargement de page
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table d'Agrégation Rapide du Trafic Réel
CREATE TABLE IF NOT EXISTS site_traffic_stats (
  metric TEXT PRIMARY KEY,           -- 'total_views', 'total_visits'
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialisation des compteurs réels à 0 si non existants
INSERT OR IGNORE INTO site_traffic_stats (metric, count) VALUES ('total_views', 0);
INSERT OR IGNORE INTO site_traffic_stats (metric, count) VALUES ('total_visits', 0);

-- ========================================================
-- NIVEAU INGÉNIERIE : MULTI-TENANCY EDGE & LICENCES SAAS
-- ========================================================

-- Table des Tenants (Edge Multi-Tenancy Zéro-Deploy & Zéro-Build)
CREATE TABLE IF NOT EXISTS tenants (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  admin_key TEXT NOT NULL,
  custom_domain TEXT UNIQUE,
  theme_choice TEXT DEFAULT '1',
  catalog_type TEXT DEFAULT 'cosmetique', -- 'cosmetique', 'agence', 'restaurant', 'coiffure'
  license_status TEXT DEFAULT 'active',   -- 'active', 'suspended', 'trial'
  license_expiry TEXT,                    -- Date ISO YYYY-MM-DD
  license_plan TEXT DEFAULT 'pro',        -- 'starter', 'pro', 'vip'
  license_notes TEXT,
  settings_json TEXT DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de Gestion des Licences & Kill-Switch THE GREATSOFT
CREATE TABLE IF NOT EXISTS saas_licenses (
  id TEXT PRIMARY KEY,
  tenant_slug TEXT NOT NULL,
  client_name TEXT NOT NULL,
  status TEXT DEFAULT 'active',           -- 'active', 'suspended', 'trial'
  plan_name TEXT DEFAULT 'Standard Pro',
  monthly_price_fcfa INTEGER DEFAULT 25000,
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  kill_switch_active INTEGER DEFAULT 0,  -- 1 si suspension manuelle forcée
  suspension_reason TEXT,
  last_payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- MODULE MARKETPLACE : AVIS CLIENTS, NOTIFICATIONS PUSH & COMMANDES
-- ========================================================

-- Table des Avis & Commentaires Clients (Persistante Cloudflare D1)
CREATE TABLE IF NOT EXISTS product_reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  author TEXT NOT NULL,
  city TEXT,
  rating INTEGER DEFAULT 5,
  comment TEXT NOT NULL,
  is_verified INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Abonnements Push FCM & WebPush
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  tenant_slug TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform TEXT,
  client_name TEXT,
  client_phone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Commandes & Reçus Clients
CREATE TABLE IF NOT EXISTS customer_orders (
  id TEXT PRIMARY KEY,
  receipt_number TEXT NOT NULL,
  tenant_slug TEXT NOT NULL,
  client_phone TEXT,
  client_name TEXT,
  order_data_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
