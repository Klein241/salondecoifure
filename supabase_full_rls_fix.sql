-- ================================================================
-- FIX COMPLET RLS - The Alpha Beauty
-- A executer dans Supabase SQL Editor
-- ================================================================

-- ----------------------------------------------------------------
-- 1. TABLES PRINCIPALES
-- ----------------------------------------------------------------

-- SITE SETTINGS
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_site_settings" ON public.site_settings;
CREATE POLICY "allow_all_site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- SERVICES
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_services" ON public.services;
CREATE POLICY "allow_all_services" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- PRODUCTS
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_products" ON public.products;
CREATE POLICY "allow_all_products" ON public.products FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- PROMO CODES
ALTER TABLE IF EXISTS public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_promo_codes" ON public.promo_codes;
CREATE POLICY "allow_all_promo_codes" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);

-- PACKS
ALTER TABLE IF EXISTS public.packs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_packs" ON public.packs;
CREATE POLICY "allow_all_packs" ON public.packs FOR ALL USING (true) WITH CHECK (true);

-- GALLERY IMAGES
ALTER TABLE IF EXISTS public.gallery_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_gallery" ON public.gallery_images;
CREATE POLICY "allow_all_gallery" ON public.gallery_images FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS group_id TEXT DEFAULT NULL;

-- AFFILIATES
ALTER TABLE IF EXISTS public.affiliates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_affiliates" ON public.affiliates;
CREATE POLICY "allow_all_affiliates" ON public.affiliates FOR ALL USING (true) WITH CHECK (true);

-- APPOINTMENTS
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_appointments" ON public.appointments;
CREATE POLICY "allow_all_appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- REVIEWS
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_reviews" ON public.reviews;
CREATE POLICY "allow_all_reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- STAFF
ALTER TABLE IF EXISTS public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_staff" ON public.staff;
CREATE POLICY "allow_all_staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);

-- WALLETS
ALTER TABLE IF EXISTS public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_wallets" ON public.wallets;
CREATE POLICY "allow_all_wallets" ON public.wallets FOR ALL USING (true) WITH CHECK (true);

-- WALLET TRANSACTIONS
ALTER TABLE IF EXISTS public.wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "allow_all_wallet_transactions" ON public.wallet_transactions FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------
-- 2. GALLERY CATEGORIES (nouvelle table)
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

-- Lier gallery_images aux sous-categories
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS subcategory_id TEXT REFERENCES public.gallery_categories(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------
-- 3. STORAGE BUCKETS (methode correcte sans storage.policies)
-- ----------------------------------------------------------------

-- Creer les buckets s ils n existent pas
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('gallery', 'gallery', true),
  ('service-images', 'service-images', true),
  ('product-images', 'product-images', true),
  ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Politiques storage sur storage.objects (methode correcte Supabase)
DROP POLICY IF EXISTS "gallery_public_select"   ON storage.objects;
DROP POLICY IF EXISTS "gallery_public_insert"   ON storage.objects;
DROP POLICY IF EXISTS "gallery_public_update"   ON storage.objects;
DROP POLICY IF EXISTS "gallery_public_delete"   ON storage.objects;
DROP POLICY IF EXISTS "products_public_select"  ON storage.objects;
DROP POLICY IF EXISTS "products_public_insert"  ON storage.objects;
DROP POLICY IF EXISTS "products_public_update"  ON storage.objects;
DROP POLICY IF EXISTS "products_public_delete"  ON storage.objects;
DROP POLICY IF EXISTS "services_public_select"  ON storage.objects;
DROP POLICY IF EXISTS "services_public_insert"  ON storage.objects;
DROP POLICY IF EXISTS "assets_public_select"    ON storage.objects;
DROP POLICY IF EXISTS "assets_public_insert"    ON storage.objects;

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
SELECT 'Fix RLS + Storage complet - OK!' AS status;
-- ----------------------------------------------------------------
