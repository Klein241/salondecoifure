-- =============================================================
-- THE ALPHA BEAUTY - BASE DE DONNÉES - MISE À JOUR V2
-- =============================================================

-- 1. Ajout de la colonne image_url à la table des services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Création de la table de la galerie d'images
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    category text DEFAULT 'Salon',
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer RLS sur gallery_images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour gallery_images
CREATE POLICY "Lecture publique de la galerie" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Admin modifie la galerie" ON public.gallery_images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);

-- 3. Création du bucket de stockage pour les images de services
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques RLS pour le bucket service-images
CREATE POLICY "Lecture publique service-images" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "Admin modifie service-images" ON storage.objects FOR ALL USING (
  bucket_id = 'service-images' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);
