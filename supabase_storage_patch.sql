-- =============================================================
-- THE ALPHA BEAUTY - PATCH POLITIQUES DE STOCKAGE SUPABASE (RLS)
-- =============================================================

-- 1. Création d'une fonction SECURITY DEFINER pour vérifier si l'utilisateur est admin
-- Cette fonction contourne les restrictions RLS de la table profiles lors de l'exécution
-- des politiques de stockage.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Initialisation et configuration des buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Nettoyage des anciennes politiques sur storage.objects pour repartir sur une base propre
DROP POLICY IF EXISTS "Lecture publique service-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin modifie service-images" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin update gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete gallery" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique de la galerie" ON storage.objects;
DROP POLICY IF EXISTS "Admin modifie la galerie" ON storage.objects;

-- 4. Nouvelles Politiques de Stockage RLS pour le bucket 'gallery'
CREATE POLICY "Lecture publique gallery" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery');

CREATE POLICY "Admin insert gallery" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

CREATE POLICY "Admin update gallery" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'gallery' AND public.is_admin());

CREATE POLICY "Admin delete gallery" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'gallery' AND public.is_admin());

-- 5. Nouvelles Politiques de Stockage RLS pour le bucket 'service-images'
CREATE POLICY "Lecture publique service-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'service-images');

CREATE POLICY "Admin insert service-images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'service-images' AND public.is_admin());

CREATE POLICY "Admin update service-images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'service-images' AND public.is_admin());

CREATE POLICY "Admin delete service-images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'service-images' AND public.is_admin());

-- 6. Mise à jour de la politique sur la table gallery_images pour utiliser la fonction is_admin
DROP POLICY IF EXISTS "Admin modifie la galerie" ON public.gallery_images;
CREATE POLICY "Admin modifie la galerie" 
ON public.gallery_images FOR ALL 
USING (public.is_admin());
