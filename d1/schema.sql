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

-- Table des Affiches & Graphismes Publicitaires
CREATE TABLE IF NOT EXISTS posters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,         -- 'Affiche Événementielle', 'Bannière Social Ads', 'Flyer Commercial', 'Carrousel'
  format TEXT NOT NULL,           -- 'A3/A2 Print', 'Story 1080x1920', 'Post 1080x1080', 'Billboard 4x3'
  dimensions TEXT NOT NULL,
  image_url TEXT NOT NULL,
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
