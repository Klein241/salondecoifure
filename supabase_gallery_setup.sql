-- ═══════════════════════════════════════════════════════════
-- SETUP GALERIE — À exécuter dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Créer la table gallery_images si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Salon',
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- 3. Policies : lecture publique, écriture admin seulement
DROP POLICY IF EXISTS "gallery_read_public" ON public.gallery_images;
CREATE POLICY "gallery_read_public"
  ON public.gallery_images FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "gallery_insert_admin" ON public.gallery_images;
CREATE POLICY "gallery_insert_admin"
  ON public.gallery_images FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "gallery_delete_admin" ON public.gallery_images;
CREATE POLICY "gallery_delete_admin"
  ON public.gallery_images FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Vérification
SELECT id, title, category, image_url, created_at FROM public.gallery_images ORDER BY created_at DESC LIMIT 10;
