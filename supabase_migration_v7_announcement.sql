-- Migration V7: Ajouter le toggle pour la bande d'annonce
-- Executer dans le SQL Editor de Supabase

-- Ajouter la colonne pour activer/desactiver la bande d'annonce
ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS promo_banner_active BOOLEAN DEFAULT true;

-- Mettre a jour la ligne principale
UPDATE public.site_settings 
SET promo_banner_active = true 
WHERE id = 'main' AND promo_banner_active IS NULL;

-- Verification
SELECT id, site_name, promo_banner, promo_banner_active FROM public.site_settings WHERE id = 'main';
