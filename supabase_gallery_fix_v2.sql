-- =============================================================
-- THE ALPHA BEAUTY - FIX GALERIE RLS v2
-- L admin utilise auth custom (non Supabase Auth) donc auth.uid() = null
-- => is_admin() retourne false => RLS bloque l upload.
-- Solution: autoriser toutes operations storage (anon inclus).
-- =============================================================

-- 1. Nettoyage complet des anciennes politiques
DROP POLICY IF EXISTS "Lecture publique gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin update gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete gallery" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique de la galerie" ON storage.objects;
DROP POLICY IF EXISTS "Admin modifie la galerie" ON storage.objects;
DROP POLICY IF EXISTS "Admin modifie service-images" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique service-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert service-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update service-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete service-images" ON storage.objects;
DROP POLICY IF EXISTS "allow_all_storage_access" ON storage.objects;

-- 2. S assurer que les buckets existent et sont publics
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Politique globale : TOUT acces autorise sur storage.objects
CREATE POLICY "allow_all_storage_access"
ON storage.objects FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Nettoyage et recréation des politiques gallery_images
DROP POLICY IF EXISTS "Admin modifie la galerie" ON public.gallery_images;
DROP POLICY IF EXISTS "Lecture publique galerie" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_public_read" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_all_access" ON public.gallery_images;

CREATE POLICY "gallery_images_public_read"
ON public.gallery_images FOR SELECT
USING (true);

CREATE POLICY "gallery_images_all_access"
ON public.gallery_images FOR ALL
USING (true)
WITH CHECK (true);
