-- ================================================================
-- THE ALPHA BEAUTY — PATCH SÉCURITÉ P1
-- À exécuter dans le SQL Editor de Supabase APRÈS v3 + fidelite
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1. Étendre is_admin() pour inclure superadmin
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
END; $$;

-- Fonction complémentaire pour le staff (admin + superadmin + gerant)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'gerant')
  );
END; $$;

-- ────────────────────────────────────────────────────────────────
-- 2. fidelite_audit_logs : autoriser le staff à insérer
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "audit_admin_all" ON fidelite_audit_logs;

-- Lecture : admin et superadmin seulement
CREATE POLICY "audit_admin_select" ON fidelite_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('superadmin', 'admin')
    )
  );

-- Insertion : staff (admin + superadmin + gerant) autorisé à logger
CREATE POLICY "audit_staff_insert" ON fidelite_audit_logs
  FOR INSERT WITH CHECK (public.is_staff());

-- Pas de UPDATE/DELETE pour personne (l'audit est immuable)

-- ────────────────────────────────────────────────────────────────
-- 3. fidelite_factures : séparer les politiques RLS
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "factures_own_select" ON fidelite_factures;
DROP POLICY IF EXISTS "factures_staff_all" ON fidelite_factures;

-- Client : lecture de ses propres factures
CREATE POLICY "factures_own_select" ON fidelite_factures
  FOR SELECT USING (client_id = auth.uid());

-- Staff : lecture de toutes les factures
CREATE POLICY "factures_staff_select" ON fidelite_factures
  FOR SELECT USING (public.is_staff());

-- Staff : création de factures
CREATE POLICY "factures_staff_insert" ON fidelite_factures
  FOR INSERT WITH CHECK (public.is_staff());

-- Admin : modification et suppression
CREATE POLICY "factures_admin_update" ON fidelite_factures
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "factures_admin_delete" ON fidelite_factures
  FOR DELETE USING (public.is_admin());

-- ────────────────────────────────────────────────────────────────
-- 4. fidelite_transactions : étendre l'écriture au superadmin
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "ftx_staff_write" ON fidelite_transactions;

CREATE POLICY "ftx_staff_write" ON fidelite_transactions
  FOR INSERT WITH CHECK (public.is_staff());

-- ────────────────────────────────────────────────────────────────
-- 5. wallets : étendre les droits d'écriture au superadmin
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "wallet_no_client_write" ON wallets;

CREATE POLICY "wallet_staff_write" ON wallets
  FOR ALL USING (public.is_staff());

-- ────────────────────────────────────────────────────────────────
-- 6. packs : étendre les droits admin au superadmin
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "packs_admin_all" ON packs;

CREATE POLICY "packs_admin_all" ON packs
  FOR ALL USING (public.is_admin());

-- ────────────────────────────────────────────────────────────────
-- VÉRIFICATION
-- ────────────────────────────────────────────────────────────────
SELECT 'is_admin function updated' as status, prosrc
FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = 'public'::regnamespace;

SELECT 'is_staff function created' as status, prosrc
FROM pg_proc WHERE proname = 'is_staff' AND pronamespace = 'public'::regnamespace;

SELECT 'audit_logs policies' as info, policyname, cmd
FROM pg_policies WHERE tablename = 'fidelite_audit_logs';

SELECT 'factures policies' as info, policyname, cmd
FROM pg_policies WHERE tablename = 'fidelite_factures';
