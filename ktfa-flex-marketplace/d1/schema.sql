-- ==============================================================================
-- KTFA FLEX MARKETPLACE — SCHÉMA CLOUDFLARE D1 (BASE DÉDIÉE)
-- ==============================================================================

-- 1. Table des Articles & Produits de la Marketplace
CREATE TABLE IF NOT EXISTS posters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  format TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  price_fcfa INTEGER NOT NULL,
  price_eur INTEGER NOT NULL,
  installment_months INTEGER DEFAULT 4,
  monthly_fcfa INTEGER,
  rating REAL DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  badge TEXT,
  badge_color TEXT,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT NOT NULL,         -- Tableau JSON de caractéristiques
  popular BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Membres & Clients Inscrits
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL UNIQUE,
  email TEXT,
  city TEXT NOT NULL,
  profession TEXT,
  monthly_budget TEXT,
  identity_doc_url TEXT,
  referral_code TEXT,
  status TEXT DEFAULT 'active',    -- 'active', 'pending_verification', 'suspended'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des Commandes & Plans d'Acomptes
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  member_id TEXT,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  payment_mode TEXT NOT NULL,     -- 'cash', 'installments'
  total_price_fcfa INTEGER NOT NULL,
  down_payment_fcfa INTEGER NOT NULL,
  remaining_balance_fcfa INTEGER NOT NULL,
  installment_months INTEGER DEFAULT 1,
  monthly_payment_fcfa INTEGER DEFAULT 0,
  delivery_status TEXT DEFAULT 'pending_payment', -- 'paid_delivered', 'paid_pending_delivery', 'paying_in_progress'
  receipt_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des Règlements de Tranches & Versements
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  installment_number INTEGER NOT NULL,
  amount_fcfa INTEGER NOT NULL,
  payment_method TEXT NOT NULL,   -- 'orange_money', 'mtn_momo', 'cash', 'bank'
  transaction_ref TEXT,
  status TEXT DEFAULT 'validated', -- 'pending', 'validated', 'rejected'
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table des Paramètres de la Boutique
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 6. Table des Visites & Trafic Réel
CREATE TABLE IF NOT EXISTS site_traffic_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_path TEXT DEFAULT '/',
  referrer TEXT,
  user_agent TEXT,
  country TEXT DEFAULT 'Cameroun',
  city TEXT DEFAULT 'Douala',
  is_unique_visit INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table des Compteurs Statistiques
CREATE TABLE IF NOT EXISTS site_traffic_stats (
  metric TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_traffic_stats (metric, count) VALUES ('total_views', 0);
INSERT OR IGNORE INTO site_traffic_stats (metric, count) VALUES ('total_visits', 0);
