-- Migration V7 (CORRIGEE): Bandeau d'annonce desactivable
-- Executer dans le SQL Editor de Supabase

-- 1. Verifier les colonnes existantes de site_settings
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'site_settings';

-- 2. Ajouter les deux colonnes manquantes
ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS promo_banner TEXT DEFAULT '';

ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS promo_banner_active BOOLEAN DEFAULT true;

-- 3. Mettre a jour la ligne principale (si elle existe)
UPDATE public.site_settings 
SET 
  promo_banner = COALESCE(promo_banner, 'PROGRAMME FIDELITE : Accumulez des points a chaque visite !'),
  promo_banner_active = COALESCE(promo_banner_active, true)
WHERE id = 'main';

-- 4. Verification
SELECT id, site_name, promo_banner, promo_banner_active FROM public.site_settings WHERE id = 'main';
