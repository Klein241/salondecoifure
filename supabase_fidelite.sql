-- ============================================================
-- SYSTÈME DE FIDÉLITÉ — The Alpha Beauty
-- Migrations 001 à 013 + RLS + Fonctions
-- Exécuter dans l'ordre exact dans Supabase SQL Editor
-- ============================================================

-- Migration 001 : Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- Migration 002 : Packs configurés par l'admin
-- ============================================================
create table if not exists packs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'default',
  nom text not null,
  prix_fcfa numeric not null,
  points_base numeric not null,    -- points_achetes (n'expirent jamais)
  points_bonus numeric not null default 0,  -- points_gagnes (expirent)
  is_featured boolean default false,
  actif boolean default true,
  ordre int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- Migration 003 : Configuration fidélité par tenant
-- ============================================================
create table if not exists fidelite_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'default',
  valeur_point_fcfa numeric not null default 10,
  taux_cashback_pct numeric not null default 5,
  expiration_points_gagnes_jours int not null default 60,
  plafond_deduction_pct numeric not null default 10,
  montant_avance_resa numeric not null default 2500,
  taux_reduction_resa_pct numeric not null default 5,
  cumul_resa_points_interdit boolean not null default true,
  points_parrainage_parrain numeric not null default 100,
  reduction_parrainage_filleul_pct numeric not null default 10,
  points_min_pour_utiliser numeric not null default 50,
  cashback_sur_pack_actif boolean not null default false,
  updated_at timestamptz default now(),
  unique(tenant_id)
);

-- Insérer les settings par défaut
insert into fidelite_settings (tenant_id) values ('default')
on conflict (tenant_id) do nothing;

-- ============================================================
-- Migration 004 : Portefeuille client
-- ============================================================
create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  tenant_id text not null default 'default',
  points_achetes numeric not null default 0 check (points_achetes >= 0),
  points_gagnes numeric not null default 0 check (points_gagnes >= 0),
  updated_at timestamptz default now(),
  unique(user_id, tenant_id)
);

-- ============================================================
-- Migration 005 : Transactions (source de vérité)
-- ============================================================
create table if not exists fidelite_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid references wallets(id) on delete cascade,
  tenant_id text not null default 'default',
  type text not null check (type in (
    'achat_pack',
    'cashback',
    'deduction_service',
    'bonus_parrainage',
    'expiration',
    'ajustement_admin'
  )),
  points_achetes_delta numeric not null default 0,
  points_gagnes_delta numeric not null default 0,
  montant_fcfa numeric default 0,
  expires_at timestamptz,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Index performance
create index if not exists idx_ftx_wallet on fidelite_transactions(wallet_id);
create index if not exists idx_ftx_expires on fidelite_transactions(expires_at) where expires_at is not null;
create index if not exists idx_wallets_user_tenant on wallets(user_id, tenant_id);

-- ============================================================
-- Migration 006 : Séquences de factures fidélité
-- ============================================================
create table if not exists fidelite_factures (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'default',
  client_id uuid references profiles(id),
  transaction_id uuid references fidelite_transactions(id),
  numero_facture text unique not null,
  montant_total numeric not null default 0,
  montant_cash numeric not null default 0,
  points_utilises numeric default 0,
  reduction_fcfa numeric default 0,
  type_facture text default 'service',  -- service | achat_pack | avance
  service_nom text,
  cashback_obtenu numeric default 0,
  pdf_url text,
  created_at timestamptz default now()
);

create table if not exists fidelite_facture_sequences (
  tenant_id text unique not null,
  derniere_valeur int default 0
);

insert into fidelite_facture_sequences (tenant_id) values ('default')
on conflict (tenant_id) do nothing;

-- Fonction numéro facture fidélité
create or replace function prochain_numero_fidelite(p_tenant_id text)
returns text as $$
declare
  seq int;
  annee text := to_char(now(), 'YYYY');
begin
  insert into fidelite_facture_sequences (tenant_id, derniere_valeur)
  values (p_tenant_id, 1)
  on conflict (tenant_id) do update
    set derniere_valeur = fidelite_facture_sequences.derniere_valeur + 1
  returning derniere_valeur into seq;
  return upper(p_tenant_id) || '-FID-' || annee || '-' || lpad(seq::text, 4, '0');
end;
$$ language plpgsql;

-- ============================================================
-- Migration 007 : Réservations anticipées fidélité
-- ============================================================
create table if not exists fidelite_reservations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id),
  tenant_id text not null default 'default',
  service_nom text not null,
  prix_service numeric not null,
  date_rdv timestamptz not null,
  statut text not null default 'en_attente'
    check (statut in ('en_attente','confirmee','annulee','honoree')),
  avance_payee boolean default false,
  montant_avance numeric default 0,
  reduction_appliquee numeric default 0,
  prix_final_cash numeric,
  note_client text,
  created_at timestamptz default now()
);

-- ============================================================
-- Migration 008 : Audit logs fidélité
-- ============================================================
create table if not exists fidelite_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'default',
  user_id uuid references profiles(id),
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- Migration 009 : RLS — activer sur toutes les tables fidélité
-- ============================================================
alter table packs enable row level security;
alter table fidelite_settings enable row level security;
alter table wallets enable row level security;
alter table fidelite_transactions enable row level security;
alter table fidelite_factures enable row level security;
alter table fidelite_reservations enable row level security;
alter table fidelite_audit_logs enable row level security;

-- ============================================================
-- Migration 010 : Politiques RLS — packs (lecture publique)
-- ============================================================
drop policy if exists "packs_public_select" on packs;
create policy "packs_public_select" on packs
  for select using (actif = true);

drop policy if exists "packs_admin_all" on packs;
create policy "packs_admin_all" on packs
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin','superadmin')
    )
  );

-- ============================================================
-- Migration 011 : Politiques RLS — fidelite_settings
-- ============================================================
drop policy if exists "fidelite_settings_read" on fidelite_settings;
create policy "fidelite_settings_read" on fidelite_settings
  for select using (true);

drop policy if exists "fidelite_settings_admin" on fidelite_settings;
create policy "fidelite_settings_admin" on fidelite_settings
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin','superadmin')
    )
  );

-- ============================================================
-- Migration 012 : Politiques RLS — wallets
-- ============================================================
-- Client voit son propre wallet
drop policy if exists "wallet_own_select" on wallets;
create policy "wallet_own_select" on wallets
  for select using (user_id = auth.uid());

-- Admin/gérant voit tous les wallets
drop policy if exists "wallet_staff_select" on wallets;
create policy "wallet_staff_select" on wallets
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('superadmin','admin','gerant')
    )
  );

-- CRITIQUE : aucune écriture directe côté client
drop policy if exists "wallet_no_client_write" on wallets;
create policy "wallet_no_client_write" on wallets
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('superadmin','admin','gerant')
    )
  );

-- ============================================================
-- Migration 013 : Politiques RLS — transactions + factures
-- ============================================================
-- Client voit ses propres transactions
drop policy if exists "ftx_own_select" on fidelite_transactions;
create policy "ftx_own_select" on fidelite_transactions
  for select using (
    wallet_id in (
      select id from wallets where user_id = auth.uid()
    )
  );

-- Staff voit toutes les transactions
drop policy if exists "ftx_staff_select" on fidelite_transactions;
create policy "ftx_staff_select" on fidelite_transactions
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('superadmin','admin','gerant')
    )
  );

-- Écriture transactions : admin/gérant seulement
drop policy if exists "ftx_staff_write" on fidelite_transactions;
create policy "ftx_staff_write" on fidelite_transactions
  for insert with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('superadmin','admin','gerant')
    )
  );

-- Factures : client voit les siennes
drop policy if exists "factures_own_select" on fidelite_factures;
create policy "factures_own_select" on fidelite_factures
  for select using (client_id = auth.uid());

drop policy if exists "factures_staff_all" on fidelite_factures;
create policy "factures_staff_all" on fidelite_factures
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('superadmin','admin','gerant')
    )
  );

-- Réservations : client voit les siennes
drop policy if exists "resa_own_select" on fidelite_reservations;
create policy "resa_own_select" on fidelite_reservations
  for select using (client_id = auth.uid());

drop policy if exists "resa_client_insert" on fidelite_reservations;
create policy "resa_client_insert" on fidelite_reservations
  for insert with check (client_id = auth.uid());

drop policy if exists "resa_staff_all" on fidelite_reservations;
create policy "resa_staff_all" on fidelite_reservations
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('superadmin','admin','gerant')
    )
  );

-- Audit logs : admin seulement
drop policy if exists "audit_admin_all" on fidelite_audit_logs;
create policy "audit_admin_all" on fidelite_audit_logs
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('superadmin','admin')
    )
  );

-- ============================================================
-- Données de démonstration — packs par défaut
-- ============================================================
insert into packs (tenant_id, nom, prix_fcfa, points_base, points_bonus, is_featured, ordre) values
  ('default', 'Découverte',  5000,  500,  50,   false, 1),
  ('default', 'Essentiel',  10000, 1000, 150,   false, 2),
  ('default', 'Confort',    20000, 2000, 400,   true,  3),
  ('default', 'Prestige',   40000, 4000, 1040,  false, 4)
on conflict do nothing;

-- ============================================================
-- FIN DES MIGRATIONS INITIALES
-- ============================================================

-- ============================================================
-- Migration 014 : Nouveaux paramètres (si tables déjà existantes)
-- Exécuter UNIQUEMENT si vous appliquez sur une BDD existante
-- ============================================================
-- alter table fidelite_settings add column if not exists points_min_pour_utiliser numeric not null default 50;
-- alter table fidelite_settings add column if not exists cashback_sur_pack_actif boolean not null default false;

-- ============================================================
-- Vérifications post-déploiement :
-- □ Toutes les tables créées : packs, fidelite_settings, wallets,
--   fidelite_transactions, fidelite_factures, fidelite_reservations,
--   fidelite_audit_logs, fidelite_facture_sequences
-- □ RLS activé sur chaque table
-- □ Politiques créées (vérifier dans Auth > Policies)
-- □ 4 packs par défaut insérés
-- □ fidelite_settings (default) créée avec points_min_pour_utiliser et cashback_sur_pack_actif
-- ============================================================
