-- ================================================================
-- THE ALPHA BEAUTY - SCRIPT COMPLET V3
-- Execute ce script entier dans le SQL Editor de Supabase
-- Il supprime d'abord TOUTES les politiques existantes avant
-- de les recreer proprement.
-- ================================================================

-- ETAPE 1: Supprimer toutes les politiques storage existantes
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- ETAPE 2: Supprimer toutes les politiques des tables applicatives
DROP POLICY IF EXISTS "Lecture publique de la galerie" ON public.gallery_images;
DROP POLICY IF EXISTS "Admin modifie la galerie" ON public.gallery_images;
DROP POLICY IF EXISTS "pub_select_gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "admin_all_gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "pub_select_services" ON public.services;
DROP POLICY IF EXISTS "admin_all_services" ON public.services;
DROP POLICY IF EXISTS "pub_select_products" ON public.products;
DROP POLICY IF EXISTS "admin_all_products" ON public.products;
DROP POLICY IF EXISTS "pub_select_settings" ON public.site_settings;
DROP POLICY IF EXISTS "admin_update_settings" ON public.site_settings;

-- ETAPE 3: Recreer la fonction is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END; $$;

-- ETAPE 4: Definir le role admin (mettez votre email)
INSERT INTO public.profiles (id, email, name, role, created_at)
SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'name', 'Admin'), 'admin', NOW()
FROM auth.users au
WHERE au.email = 'thealphabeauty98@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ETAPE 5: Creer les buckets de stockage
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- ETAPE 6: Politiques storage - gallery
CREATE POLICY "pub_sel_gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "admin_ins_gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
CREATE POLICY "admin_upd_gallery" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.is_admin());
CREATE POLICY "admin_del_gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.is_admin());

-- ETAPE 7: Politiques storage - service-images
CREATE POLICY "pub_sel_svc_img" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "admin_ins_svc_img" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'service-images' AND public.is_admin());
CREATE POLICY "admin_upd_svc_img" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'service-images' AND public.is_admin());
CREATE POLICY "admin_del_svc_img" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'service-images' AND public.is_admin());

-- ETAPE 8: Politiques storage - product-images
CREATE POLICY "pub_sel_prod_img" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "admin_ins_prod_img" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "admin_upd_prod_img" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "admin_del_prod_img" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.is_admin());

-- ETAPE 9: Politiques storage - site-assets
CREATE POLICY "pub_sel_assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "admin_ins_assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());
CREATE POLICY "admin_upd_assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-assets' AND public.is_admin());
CREATE POLICY "admin_del_assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-assets' AND public.is_admin());

-- ETAPE 10: Politiques gallery_images
CREATE POLICY "pub_sel_gallery_img" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "admin_all_gallery_img" ON public.gallery_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ETAPE 11: Politiques services (activer RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_sel_services" ON public.services FOR SELECT USING (true);
CREATE POLICY "admin_all_services" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ETAPE 12: Ajouter colonne promo_type aux codes promo
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS promo_type text DEFAULT 'unique';

-- ETAPE 13: Creer la table products (boutique)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  category text DEFAULT 'Soin',
  image_url text,
  in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_sel_products" ON public.products FOR SELECT USING (true);
CREATE POLICY "admin_all_products" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ETAPE 14: Creer la table site_settings (parametres du site)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'main',
  site_name text DEFAULT 'The Alpha Beauty',
  address text DEFAULT 'Alibadeng, Gabon',
  phone text DEFAULT '+241 077 00 40 73',
  whatsapp text DEFAULT '+241077004073',
  logo_url text DEFAULT NULL,
  favicon_url text DEFAULT NULL,
  allow_specialist_selection boolean DEFAULT true,
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_sel_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admin_all_settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Inserer les parametres par defaut
INSERT INTO public.site_settings (id, site_name, address, phone, whatsapp, allow_specialist_selection)
VALUES ('main', 'The Alpha Beauty', 'Alibadeng, Gabon', '+241 077 00 40 73', '+241077004073', true)
ON CONFLICT (id) DO NOTHING;

-- VERIFICATION FINALE
SELECT 'ADMIN DEFINI:' as info, id, email, role FROM public.profiles WHERE role = 'admin';
SELECT 'PARAMETRES:' as info, id, site_name, allow_specialist_selection FROM public.site_settings;
SELECT 'BUCKETS:' as info, id, name, public FROM storage.buckets WHERE id IN ('gallery','service-images','product-images','site-assets');
