-- Table pour le carousel de l'accueil
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Politique RLS
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hero_banners_public_read" ON hero_banners FOR SELECT USING (true);
CREATE POLICY "hero_banners_admin_all" ON hero_banners FOR ALL USING (true);
