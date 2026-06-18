-- ================================================================
-- FIX COMPLET RLS - The Alpha Beauty
-- A executer dans Supabase SQL Editor
-- ================================================================

-- 1. SITE SETTINGS
DROP POLICY IF EXISTS "Admin peut modifier" ON public.site_settings;
DROP POLICY IF EXISTS "Admin can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public peut lire" ON public.site_settings;
DROP POLICY IF EXISTS "allow_all_site_settings" ON public.site_settings;
CREATE POLICY "allow_all_site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- 2. SERVICES
DROP POLICY IF EXISTS "Admin peut gerer les services" ON public.services;
DROP POLICY IF EXISTS "Public peut lire les services" ON public.services;
DROP POLICY IF EXISTS "allow_all_services" ON public.services;
CREATE POLICY "allow_all_services" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- 3. PRODUCTS
DROP POLICY IF EXISTS "Admin peut gerer les produits" ON public.products;
DROP POLICY IF EXISTS "Public peut lire les produits" ON public.products;
DROP POLICY IF EXISTS "allow_all_products" ON public.products;
CREATE POLICY "allow_all_products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Ajouter colonne images (array) si elle n'existe pas
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 4. PROMO CODES
DROP POLICY IF EXISTS "Admin peut gerer les promos" ON public.promo_codes;
DROP POLICY IF EXISTS "Public peut lire les promos" ON public.promo_codes;
DROP POLICY IF EXISTS "allow_all_promo_codes" ON public.promo_codes;
CREATE POLICY "allow_all_promo_codes" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);

-- 5. PACKS (loyalty)
DROP POLICY IF EXISTS "Admin peut gerer les packs" ON public.packs;
DROP POLICY IF EXISTS "Public peut lire les packs" ON public.packs;
DROP POLICY IF EXISTS "allow_all_packs" ON public.packs;
CREATE POLICY "allow_all_packs" ON public.packs FOR ALL USING (true) WITH CHECK (true);

-- 6. GALLERY IMAGES
DROP POLICY IF EXISTS "gallery_images_public_read" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_all_access" ON public.gallery_images;
DROP POLICY IF EXISTS "Admin modifie la galerie" ON public.gallery_images;
DROP POLICY IF EXISTS "allow_all_gallery" ON public.gallery_images;
CREATE POLICY "allow_all_gallery" ON public.gallery_images FOR ALL USING (true) WITH CHECK (true);

-- Ajouter colonne group_id si elle n'existe pas
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS group_id TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS gallery_images_group_id_idx ON public.gallery_images(group_id);

-- 7. AFFILIATES / CLIENTS
DROP POLICY IF EXISTS "allow_all_affiliates" ON public.affiliates;
CREATE POLICY "allow_all_affiliates" ON public.affiliates FOR ALL USING (true) WITH CHECK (true);

-- 8. APPOINTMENTS
DROP POLICY IF EXISTS "allow_all_appointments" ON public.appointments;
CREATE POLICY "allow_all_appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- 9. REVIEWS
DROP POLICY IF EXISTS "allow_all_reviews" ON public.reviews;
CREATE POLICY "allow_all_reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- 10. STAFF
DROP POLICY IF EXISTS "allow_all_staff" ON public.staff;
CREATE POLICY "allow_all_staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);

-- 11. WALLETS (loyalty points)
DROP POLICY IF EXISTS "allow_all_wallets" ON public.wallets;
CREATE POLICY "allow_all_wallets" ON public.wallets FOR ALL USING (true) WITH CHECK (true);

-- 12. WALLET TRANSACTIONS
DROP POLICY IF EXISTS "allow_all_wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "allow_all_wallet_transactions" ON public.wallet_transactions FOR ALL USING (true) WITH CHECK (true);

-- 13. GALLERY CATEGORIES (nouvelle table)
CREATE TABLE IF NOT EXISTS public.gallery_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES public.gallery_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_gallery_categories" ON public.gallery_categories;
CREATE POLICY "allow_all_gallery_categories" ON public.gallery_categories FOR ALL USING (true) WITH CHECK (true);

-- Ajouter subcategory_id sur gallery_images
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS subcategory_id TEXT REFERENCES public.gallery_categories(id) ON DELETE SET NULL;

-- STORAGE BUCKETS
DO $$
DECLARE bucket_names TEXT[] := ARRAY['gallery', 'service-images', 'product-images', 'site-assets'];
  b TEXT;
BEGIN
  FOREACH b IN ARRAY bucket_names LOOP
    BEGIN
      DELETE FROM storage.policies WHERE bucket_id = b;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN
      INSERT INTO storage.buckets (id, name, public) VALUES (b, b, true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END LOOP;
END $$;

INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT 'allow_all_' || b, b, op, 'true'
FROM unnest(ARRAY['gallery','service-images','product-images','site-assets']) b,
     unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE']) op
ON CONFLICT DO NOTHING;

SELECT 'Fix RLS complet applique avec succes !' as status;
