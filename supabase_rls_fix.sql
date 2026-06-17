-- ====================================================
-- SUPABASE STORAGE & TABLE RLS FIX
-- A executer dans le SQL Editor de Supabase
-- ====================================================

-- 1. STORAGE : Bucket "gallery" - autoriser upload admin
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies Storage gallery
DELETE FROM storage.policies WHERE bucket_id = 'gallery';

CREATE POLICY "gallery_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "gallery_insert_auth"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "gallery_delete_auth"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery');

-- 2. STORAGE : Bucket "product-images"
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DELETE FROM storage.policies WHERE bucket_id = 'product-images';

CREATE POLICY "product_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_insert_auth"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product_images_delete_auth"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');

-- 3. STORAGE : Bucket "site-assets"
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DELETE FROM storage.policies WHERE bucket_id = 'site-assets';

CREATE POLICY "site_assets_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "site_assets_insert_auth"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "site_assets_delete_auth"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets');

-- 4. TABLE products : autoriser insert/update/delete pour utilisateurs authentifies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "products_insert_auth" ON public.products;
CREATE POLICY "products_insert_auth"
  ON public.products FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "products_update_auth" ON public.products;
CREATE POLICY "products_update_auth"
  ON public.products FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "products_delete_auth" ON public.products;
CREATE POLICY "products_delete_auth"
  ON public.products FOR DELETE TO authenticated USING (true);

-- 5. TABLE gallery_images : deja cree, ajouter policy insert sans restriction
DROP POLICY IF EXISTS "gallery_insert_admin" ON public.gallery_images;
CREATE POLICY "gallery_insert_auth"
  ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_delete_admin" ON public.gallery_images;
CREATE POLICY "gallery_delete_auth"
  ON public.gallery_images FOR DELETE TO authenticated USING (true);

SELECT 'OK - Politiques RLS mises a jour avec succes' AS status;
