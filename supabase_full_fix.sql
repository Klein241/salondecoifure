-- ============================================================
-- ALPHA BEAUTY - CORRECTION COMPLETE SUPABASE
-- Executer EN UNE SEULE FOIS dans le SQL Editor
-- ============================================================

-- ══════════════════════════════════════════════
-- 1. TABLE profiles : ajouter les colonnes manquantes
-- ══════════════════════════════════════════════
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nom TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS prenom TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS telephone TEXT DEFAULT '';



-- RLS profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "profiles_insert_auth" ON public.profiles;
CREATE POLICY "profiles_insert_auth" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (true);

-- ══════════════════════════════════════════════
-- 2. TABLE products
-- ══════════════════════════════════════════════
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public" ON public.products FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "products_insert_auth" ON public.products;
CREATE POLICY "products_insert_auth" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "products_update_auth" ON public.products;
CREATE POLICY "products_update_auth" ON public.products FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "products_delete_auth" ON public.products;
CREATE POLICY "products_delete_auth" ON public.products FOR DELETE TO authenticated USING (true);

-- ══════════════════════════════════════════════
-- 3. TABLE site_settings
-- ══════════════════════════════════════════════
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_settings_select" ON public.site_settings;
CREATE POLICY "site_settings_select" ON public.site_settings FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "site_settings_insert" ON public.site_settings;
CREATE POLICY "site_settings_insert" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "site_settings_update" ON public.site_settings;
CREATE POLICY "site_settings_update" ON public.site_settings FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "site_settings_delete" ON public.site_settings;
CREATE POLICY "site_settings_delete" ON public.site_settings FOR DELETE TO authenticated USING (true);

-- ══════════════════════════════════════════════
-- 4. TABLE promo_codes
-- ══════════════════════════════════════════════
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promo_codes_select" ON public.promo_codes;
CREATE POLICY "promo_codes_select" ON public.promo_codes FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "promo_codes_insert" ON public.promo_codes;
CREATE POLICY "promo_codes_insert" ON public.promo_codes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "promo_codes_update" ON public.promo_codes;
CREATE POLICY "promo_codes_update" ON public.promo_codes FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "promo_codes_delete" ON public.promo_codes;
CREATE POLICY "promo_codes_delete" ON public.promo_codes FOR DELETE TO authenticated USING (true);

-- ══════════════════════════════════════════════
-- 5. TABLE gallery_images
-- ══════════════════════════════════════════════
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gallery_read_public" ON public.gallery_images;
CREATE POLICY "gallery_read_public" ON public.gallery_images FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "gallery_insert_auth" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_insert_admin" ON public.gallery_images;
CREATE POLICY "gallery_insert_auth" ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "gallery_delete_auth" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_delete_admin" ON public.gallery_images;
CREATE POLICY "gallery_delete_auth" ON public.gallery_images FOR DELETE TO authenticated USING (true);

-- ══════════════════════════════════════════════
-- 6. TABLE appointments (rendez-vous)
-- ══════════════════════════════════════════════
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "appt_select" ON public.appointments;
CREATE POLICY "appt_select" ON public.appointments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "appt_insert" ON public.appointments;
CREATE POLICY "appt_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "appt_insert_anon" ON public.appointments;
CREATE POLICY "appt_insert_anon" ON public.appointments FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "appt_update" ON public.appointments;
CREATE POLICY "appt_update" ON public.appointments FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "appt_delete" ON public.appointments;
CREATE POLICY "appt_delete" ON public.appointments FOR DELETE TO authenticated USING (true);

-- ══════════════════════════════════════════════
-- 7. TABLE services
-- ══════════════════════════════════════════════
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_select" ON public.services;
CREATE POLICY "services_select" ON public.services FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "services_write" ON public.services;
CREATE POLICY "services_write" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════
-- 8. TABLE staff
-- ══════════════════════════════════════════════
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_select" ON public.staff;
CREATE POLICY "staff_select" ON public.staff FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "staff_write" ON public.staff;
CREATE POLICY "staff_write" ON public.staff FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════
-- 9. STORAGE : Bucket gallery
-- ══════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "gallery_storage_select" ON storage.objects;
CREATE POLICY "gallery_storage_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "gallery_storage_insert" ON storage.objects;
CREATE POLICY "gallery_storage_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "gallery_storage_delete" ON storage.objects;
CREATE POLICY "gallery_storage_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery');

-- ══════════════════════════════════════════════
-- 10. STORAGE : Bucket product-images
-- ══════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "product_img_select" ON storage.objects;
CREATE POLICY "product_img_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_img_insert" ON storage.objects;
CREATE POLICY "product_img_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_img_delete" ON storage.objects;
CREATE POLICY "product_img_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');

-- ══════════════════════════════════════════════
-- 11. STORAGE : Bucket site-assets
-- ══════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "site_assets_select" ON storage.objects;
CREATE POLICY "site_assets_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "site_assets_insert" ON storage.objects;
CREATE POLICY "site_assets_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "site_assets_delete" ON storage.objects;
CREATE POLICY "site_assets_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets');

-- ══════════════════════════════════════════════
-- 12. Verification finale
-- ══════════════════════════════════════════════
SELECT 'profiles' AS table_name, column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name IN ('nom','prenom','telephone')
UNION ALL
SELECT 'OK - Politiques appliquees', 'Voir onglet Policies dans le dashboard Supabase';

