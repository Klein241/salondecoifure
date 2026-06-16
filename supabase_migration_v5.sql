-- Migration V5: Nouveaux champs et tables pour The Alpha Beauty Phase 1

-- 1.1 Champ clé de voûte dans fidelite_settings
ALTER TABLE fidelite_settings 
  ADD COLUMN IF NOT EXISTS reduction_max_acceptable_pct numeric NOT NULL DEFAULT 40;

-- 1.2 Champs produits pour crédits
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS payable_with_credits BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS credit_discount_pct INTEGER DEFAULT 20;

-- 1.3 Champs gestion de stock
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_alert_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS stock_enabled BOOLEAN DEFAULT false;

-- 1.4 Table orders (commandes boutique)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'default',
  user_id UUID REFERENCES profiles(id),
  client_name TEXT,
  client_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_fcfa NUMERIC NOT NULL DEFAULT 0,
  discount_fcfa NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'whatsapp' 
    CHECK (payment_method IN ('whatsapp', 'credits', 'cash', 'mobile_money')),
  points_used NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Table stock_movements (mouvements de stock)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'default',
  product_id UUID REFERENCES products(id),
  product_name TEXT,
  movement_type TEXT NOT NULL 
    CHECK (movement_type IN ('entree', 'sortie_vente', 'sortie_ajustement', 'correction')),
  quantity INTEGER NOT NULL,
  quantity_before INTEGER,
  quantity_after INTEGER,
  note TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 Bucket Storage pour product-images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- Mettre à jour les politiques de stockage pour product-images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','admin')))
);

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','admin')))
);

-- 1.7 RLS Profil gérant
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_own" ON orders 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "orders_staff_all" ON orders 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','admin','gerant'))
);

CREATE POLICY "orders_insert_own" ON orders 
FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_staff_all" ON stock_movements 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','admin','gerant'))
);
