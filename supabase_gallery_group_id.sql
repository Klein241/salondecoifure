-- Ajouter la colonne group_id a gallery_images
-- Pour regrouper les images uploadees ensemble
ALTER TABLE public.gallery_images 
ADD COLUMN IF NOT EXISTS group_id TEXT DEFAULT NULL;

-- Index pour accelerer les requetes par group_id
CREATE INDEX IF NOT EXISTS gallery_images_group_id_idx 
ON public.gallery_images(group_id);
