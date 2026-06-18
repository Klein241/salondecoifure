-- ================================================================
-- FIX COMPLET RLS - The Alpha Beauty (version robuste)
-- Chaque bloc protege par EXCEPTION pour tables manquantes
-- ================================================================

-- 1. SITE SETTINGS
DO $$ BEGIN
  ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_site_settings" ON public.site_settings;
  CREATE POLICY "allow_all_site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'site_settings: table absente, ignoree'; END $$;

-- 2. SERVICES
DO $$ BEGIN
  ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_services" ON public.services;
  CREATE POLICY "allow_all_services" ON public.services FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'services: table absente, ignoree'; END $$;

-- 3. PRODUCTS
DO $$ BEGIN
  ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_products" ON public.products;
  CREATE POLICY "allow_all_products" ON public.products FOR ALL USING (true) WITH CHECK (true);
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'products: table absente, ignoree'; END $$;

-- 4. PROMO CODES
DO $$ BEGIN
  ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_promo_codes" ON public.promo_codes;
  CREATE POLICY "allow_all_promo_codes" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'promo_codes: table absente, ignoree'; END $$;

-- 5. PACKS
DO $$ BEGIN
  ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_packs" ON public.packs;
  CREATE POLICY "allow_all_packs" ON public.packs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'packs: table absente, ignoree'; END $$;

-- 6. GALLERY IMAGES
DO $$ BEGIN
  ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_gallery" ON public.gallery_images;
  CREATE POLICY "allow_all_gallery" ON public.gallery_images FOR ALL USING (true) WITH CHECK (true);
  ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS group_id TEXT DEFAULT NULL;
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'gallery_images: table absente, ignoree'; END $$;

-- 7. AFFILIATES
DO $$ BEGIN
  ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_affiliates" ON public.affiliates;
  CREATE POLICY "allow_all_affiliates" ON public.affiliates FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'affiliates: table absente, ignoree'; END $$;

-- 8. APPOINTMENTS
DO $$ BEGIN
  ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_appointments" ON public.appointments;
  CREATE POLICY "allow_all_appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'appointments: table absente, ignoree'; END $$;

-- 9. REVIEWS
DO $$ BEGIN
  ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_reviews" ON public.reviews;
  CREATE POLICY "allow_all_reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'reviews: table absente, ignoree'; END $$;

-- 10. STAFF
DO $$ BEGIN
  ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_staff" ON public.staff;
  CREATE POLICY "allow_all_staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'staff: table absente, ignoree'; END $$;

-- 11. WALLETS (optionnel)
DO $$ BEGIN
  ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_wallets" ON public.wallets;
  CREATE POLICY "allow_all_wallets" ON public.wallets FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'wallets: table absente, ignoree'; END $$;

-- 12. WALLET TRANSACTIONS (optionnel)
DO $$ BEGIN
  ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "allow_all_wallet_transactions" ON public.wallet_transactions;
  CREATE POLICY "allow_all_wallet_transactions" ON public.wallet_transactions FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'wallet_transactions: table absente, ignoree'; END $$;

-- ----------------------------------------------------------------
-- 13. GALLERY CATEGORIES (creation si inexistante)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES public.gallery_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_gallery_categories" ON public.gallery_categories;
CREATE POLICY "allow_all_gallery_categories" ON public.gallery_categories FOR ALL USING (true) WITH CHECK (true);

-- Colonne subcategory_id sur gallery_images
DO $$ BEGIN
  ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS subcategory_id TEXT REFERENCES public.gallery_categories(id) ON DELETE SET NULL;
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'gallery_images subcategory_id: table absente, ignoree'; END $$;

-- ----------------------------------------------------------------
-- 14. STORAGE BUCKETS + POLICIES
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('gallery', 'gallery', true),
  ('service-images', 'service-images', true),
  ('product-images', 'product-images', true),
  ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Supprimer anciennes policies storage
DROP POLICY IF EXISTS "gallery_public_select"  ON storage.objects;
DROP POLICY IF EXISTS "gallery_public_insert"  ON storage.objects;
DROP POLICY IF EXISTS "gallery_public_update"  ON storage.objects;
DROP POLICY IF EXISTS "gallery_public_delete"  ON storage.objects;
DROP POLICY IF EXISTS "products_public_select" ON storage.objects;
DROP POLICY IF EXISTS "products_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "products_public_update" ON storage.objects;
DROP POLICY IF EXISTS "products_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "services_public_select" ON storage.objects;
DROP POLICY IF EXISTS "services_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "assets_public_select"   ON storage.objects;
DROP POLICY IF EXISTS "assets_public_insert"   ON storage.objects;

-- Nouvelles policies storage permissives
CREATE POLICY "gallery_public_select"  ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "gallery_public_insert"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "gallery_public_update"  ON storage.objects FOR UPDATE USING (bucket_id = 'gallery');
CREATE POLICY "gallery_public_delete"  ON storage.objects FOR DELETE USING (bucket_id = 'gallery');

CREATE POLICY "products_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "products_public_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "products_public_update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "products_public_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

CREATE POLICY "services_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "services_public_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'service-images');

CREATE POLICY "assets_public_select"   ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "assets_public_insert"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets');

-- ----------------------------------------------------------------
SELECT 'FIX RLS COMPLET - Succes!' AS status;
-- ----------------------------------------------------------------
