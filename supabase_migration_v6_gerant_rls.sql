-- Migration V6: Ajouter le rôle 'gerant' aux politiques RLS existantes
-- Les tables orders et stock_movements (v5) incluent déjà le gérant.
-- Ceci corrige les tables plus anciennes.

-- Politique wallets: permettre au gérant de voir les wallets
DROP POLICY IF EXISTS "wallets_gerant_read" ON wallets;
CREATE POLICY "wallets_gerant_read" ON wallets
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerant')
);

-- Politique fidelite_transactions: permettre au gérant de lire
DROP POLICY IF EXISTS "tx_gerant_read" ON fidelite_transactions;
CREATE POLICY "tx_gerant_read" ON fidelite_transactions
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerant')
);

-- Politique fidelite_transactions: permettre au gérant d'insérer (octroyer points)
DROP POLICY IF EXISTS "tx_gerant_insert" ON fidelite_transactions;
CREATE POLICY "tx_gerant_insert" ON fidelite_transactions
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerant')
);

-- Politique appointments: permettre au gérant de lire et modifier
DROP POLICY IF EXISTS "appointments_gerant_all" ON appointments;
CREATE POLICY "appointments_gerant_all" ON appointments
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerant')
);

-- Politique products: permettre au gérant de lire les produits
DROP POLICY IF EXISTS "products_gerant_read" ON products;
CREATE POLICY "products_gerant_read" ON products
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerant')
);

-- Politique fidelite_audit_logs: permettre au gérant de lire
DROP POLICY IF EXISTS "audit_gerant_read" ON fidelite_audit_logs;
CREATE POLICY "audit_gerant_read" ON fidelite_audit_logs
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerant')
);

-- Politique fidelite_audit_logs: permettre au gérant d'insérer
DROP POLICY IF EXISTS "audit_gerant_insert" ON fidelite_audit_logs;
CREATE POLICY "audit_gerant_insert" ON fidelite_audit_logs
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerant')
);
