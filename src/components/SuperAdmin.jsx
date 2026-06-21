import React, { useState, useEffect } from "react"
import SiteBuilder from "./SiteBuilder"
import {
  LayoutDashboard, Store, Palette, Settings, Users, LogOut,
  Plus, Search, Globe, BarChart3, TrendingUp, Activity,
  ChevronRight, Copy, CheckCircle, X, Save, Shield, ExternalLink,
  RefreshCw, Eye, Sparkles
} from "lucide-react"
import {
  listAllTenants, createTenant, updateTenant, deleteTenant,
  getTenantStats, updateTenantTheme, getTenantTheme, uploadImage
} from "../supabase"
import TenantCard from "./TenantCard"
import ThemeEditor from "./ThemeEditor"
import TemplateSelector from "./TemplateSelector"
import templates from "../templates/index.js"

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tenants", label: "Tenants", icon: Store },
  { id: "builder", label: "Site Builder", icon: Sparkles },
  { id: "settings", label: "Parametres", icon: Settings },
]

// SQL migration script to display to user
const SQL_MIGRATION = `-- ========================================
-- HOSANNE PLATFORM — Migration Multi-Tenant
-- Executer dans Supabase SQL Editor
-- ========================================

-- 1. Table des tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  template TEXT DEFAULT 'beauty_salon',
  domain TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  owner_email TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table des themes
CREATE TABLE IF NOT EXISTS tenant_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  theme_data JSONB NOT NULL DEFAULT '{}',
  mode TEXT DEFAULT 'dark',
  custom_css TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

-- 3. Table SuperAdmin
CREATE TABLE IF NOT EXISTS superadmin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ajouter tenant_id aux tables existantes
ALTER TABLE services ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE gallery_categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 5. Creer le tenant Alpha Beauty
INSERT INTO tenants (slug, name, template, owner_email)
VALUES ('alpha-beauty', 'The Alpha Beauty', 'beauty_salon', 'admin@alpha.com')
ON CONFLICT (slug) DO NOTHING;

-- 6. Associer les donnees existantes a Alpha Beauty
UPDATE services SET tenant_id = (SELECT id FROM tenants WHERE slug = 'alpha-beauty') WHERE tenant_id IS NULL;
UPDATE staff SET tenant_id = (SELECT id FROM tenants WHERE slug = 'alpha-beauty') WHERE tenant_id IS NULL;
UPDATE appointments SET tenant_id = (SELECT id FROM tenants WHERE slug = 'alpha-beauty') WHERE tenant_id IS NULL;
UPDATE gallery_images SET tenant_id = (SELECT id FROM tenants WHERE slug = 'alpha-beauty') WHERE tenant_id IS NULL;
UPDATE gallery_categories SET tenant_id = (SELECT id FROM tenants WHERE slug = 'alpha-beauty') WHERE tenant_id IS NULL;
UPDATE products SET tenant_id = (SELECT id FROM tenants WHERE slug = 'alpha-beauty') WHERE tenant_id IS NULL;
UPDATE site_settings SET tenant_id = (SELECT id FROM tenants WHERE slug = 'alpha-beauty') WHERE tenant_id IS NULL;
UPDATE reviews SET tenant_id = (SELECT id FROM tenants WHERE slug = 'alpha-beauty') WHERE tenant_id IS NULL;
UPDATE promo_codes SET tenant_id = (SELECT id FROM tenants WHERE slug = 'alpha-beauty') WHERE tenant_id IS NULL;
UPDATE affiliates SET tenant_id = (SELECT id FROM tenants WHERE slug = 'alpha-beauty') WHERE tenant_id IS NULL;

-- 7. Votre superadmin (remplacer par votre user_id Supabase)
-- INSERT INTO superadmin_users (user_id, email, name)
-- VALUES ('VOTRE-USER-ID-ICI', 'superadmin@hosanne.com', 'SuperAdmin Hosanne');`

export default function SuperAdmin({ superAdminUser, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [tenants, setTenants] = useState([])
  const [tenantStats, setTenantStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewTenantModal, setShowNewTenantModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState(null)
  const [themeEditorTenant, setThemeEditorTenant] = useState(null)
  const [showSqlModal, setShowSqlModal] = useState(false)
  const [sqlCopied, setSqlCopied] = useState(false)
  const [message, setMessage] = useState(null)

  // Platform settings
  const [platformName, setPlatformName] = useState("Hosanne Platform")
  const [platformDomain, setPlatformDomain] = useState("hosanne.site")

  useEffect(() => { loadTenants() }, [])

  async function loadTenants() {
    setLoading(true)
    const data = await listAllTenants()
    setTenants(data || [])
    // Load stats for each tenant
    const statsObj = {}
    for (const t of data || []) {
      if (t.id) statsObj[t.id] = await getTenantStats(t.id)
    }
    setTenantStats(statsObj)
    setLoading(false)
  }

  async function handleToggleTenant(tenant) {
    await updateTenant(tenant.id, { active: !tenant.active })
    setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, active: !t.active } : t))
  }

  async function handleDeleteTenant(tenant) {
    if (!window.confirm(`Supprimer le tenant "${tenant.name}" ? Cette action est irreversible.`)) return
    await deleteTenant(tenant.id)
    setTenants(prev => prev.filter(t => t.id !== tenant.id))
    showMsg("Tenant supprime avec succes.", "success")
  }

  function handleVisitTenant(tenant) {
    window.open("/" + tenant.slug + "/", "_blank")
  }

  function showMsg(text, type = "info") {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalStats = {
    tenants: tenants.length,
    active: tenants.filter(t => t.active).length,
    appointments: Object.values(tenantStats).reduce((a, s) => a + (s?.appointments || 0), 0),
    products: Object.values(tenantStats).reduce((a, s) => a + (s?.products || 0), 0),
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#f5f5f5", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: "240px", background: "rgba(10,10,10,0.98)", borderRight: "1px solid rgba(212,175,55,0.1)", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 100 }}>
        <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "32px", height: "32px", background: "rgba(212,175,55,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} style={{ color: "#D4AF37" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#D4AF37", letterSpacing: "0.08em" }}>HOSANNE</div>
              <div style={{ fontSize: "0.62rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>SuperAdmin</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", background: activeTab === tab.id ? "rgba(212,175,55,0.1)" : "transparent", color: activeTab === tab.id ? "#D4AF37" : "#888", cursor: "pointer", fontSize: "0.85rem", fontWeight: activeTab === tab.id ? "600" : "400", transition: "all 0.2s", width: "100%", textAlign: "left" }}>
                <Icon size={16} />
                {tab.label}
                {activeTab === tab.id && <ChevronRight size={12} style={{ marginLeft: "auto" }} />}
              </button>
            )
          })}

          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button onClick={() => setShowSqlModal(true)}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "none", background: "rgba(100,180,140,0.08)", color: "#64B48C", cursor: "pointer", fontSize: "0.82rem", fontWeight: "500", width: "100%", textAlign: "left" }}>
              <Activity size={15} /> SQL Migration
            </button>
          </div>
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(212,175,55,0.08)" }}>
          <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "8px" }}>{superAdminUser?.email || "superadmin"}</div>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "transparent", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "8px", color: "#ff6b6b", cursor: "pointer", fontSize: "0.8rem", width: "100%" }}>
            <LogOut size={14} /> Deconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: "240px", flex: 1, padding: "32px", minHeight: "100vh" }}>

        {/* Toast */}
        {message && (
          <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, padding: "12px 20px", borderRadius: "10px", background: message.type === "success" ? "rgba(50,200,100,0.15)" : "rgba(212,175,55,0.12)", border: `1px solid ${message.type === "success" ? "rgba(50,200,100,0.4)" : "rgba(212,175,55,0.4)"}`, color: message.type === "success" ? "#4dd68c" : "#D4AF37", fontSize: "0.85rem", fontWeight: "500" }}>
            {message.text}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "2rem", color: "#f5f5f5", marginBottom: "6px" }}>Dashboard</h1>
              <p style={{ color: "#888", fontSize: "0.88rem" }}>Vue globale de la plateforme {platformName}</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {[
                { label: "Total Tenants", value: totalStats.tenants, icon: Store, color: "#D4AF37" },
                { label: "Tenants Actifs", value: totalStats.active, icon: CheckCircle, color: "#4dd68c" },
                { label: "Rendez-vous Total", value: totalStats.appointments, icon: TrendingUp, color: "#64B8DC" },
                { label: "Produits Total", value: totalStats.products, icon: BarChart3, color: "#DC96C8" },
              ].map(stat => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} style={{ background: "rgba(18,18,18,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</span>
                      <div style={{ width: "34px", height: "34px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} style={{ color: stat.color }} />
                      </div>
                    </div>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: stat.color }}>{stat.value}</div>
                  </div>
                )
              })}
            </div>

            {/* Recent Tenants */}
            <div style={{ background: "rgba(14,14,14,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.1rem", fontFamily: "Playfair Display,serif", color: "#f5f5f5" }}>Tenants Recents</h2>
                <button onClick={() => setActiveTab("tenants")} style={{ fontSize: "0.78rem", color: "#D4AF37", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  Voir tous <ChevronRight size={12} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {tenants.slice(0, 5).map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                    <span style={{ fontSize: "1.4rem" }}>{{"beauty_salon":"💇‍♀️","cosmetics":"🧴","barbershop":"💈","nail_salon":"💅","spa_wellness":"🧖","restaurant":"🍽️","photo_studio":"📸"}[t.template] || "🏪"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: "600", color: "#f5f5f5" }}>{t.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#666" }}>/{t.slug}/</div>
                    </div>
                    <span style={{ fontSize: "0.68rem", padding: "3px 10px", borderRadius: "20px", background: t.active ? "rgba(50,200,100,0.1)" : "rgba(255,50,50,0.08)", color: t.active ? "#4dd68c" : "#ff6b6b", border: `1px solid ${t.active ? "rgba(50,200,100,0.25)" : "rgba(255,50,50,0.15)"}` }}>
                      {t.active ? "Actif" : "Inactif"}
                    </span>
                    <button onClick={() => handleVisitTenant(t)} style={{ background: "none", border: "none", color: "#D4AF37", cursor: "pointer" }}>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TENANTS TAB */}
        {activeTab === "tenants" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "2rem", color: "#f5f5f5", marginBottom: "4px" }}>Tenants</h1>
                <p style={{ color: "#888", fontSize: "0.88rem" }}>{tenants.length} site{tenants.length !== 1 ? "s" : ""} enregistre{tenants.length !== 1 ? "s" : ""}</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={loadTenants} style={{ padding: "10px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888", cursor: "pointer" }}>
                  <RefreshCw size={15} />
                </button>
                <button onClick={() => { setEditingTenant(null); setShowNewTenantModal(true) }}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#D4AF37,#AA771C)", border: "none", borderRadius: "8px", color: "#000", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" }}>
                  <Plus size={15} /> Nouveau Tenant
                </button>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "24px" }}>
              <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#666" }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un tenant..."
                style={{ width: "100%", padding: "11px 16px 11px 42px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#f5f5f5", fontSize: "0.9rem", outline: "none", maxWidth: "400px" }} />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>Chargement...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                {filteredTenants.map(t => (
                  <TenantCard key={t.id} tenant={t} stats={tenantStats[t.id]}
                    onEdit={tenant => { setEditingTenant(tenant); setShowNewTenantModal(true) }}
                    onToggle={handleToggleTenant}
                    onDelete={handleDeleteTenant}
                    onTheme={setThemeEditorTenant}
                    onVisit={handleVisitTenant}
                  />
                ))}
                {filteredTenants.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "#666" }}>
                    <Store size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
                    <p>Aucun tenant trouve. <button onClick={() => setShowNewTenantModal(true)} style={{ background: "none", border: "none", color: "#D4AF37", cursor: "pointer", textDecoration: "underline" }}>Creer le premier ?</button></p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div>
            <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "2rem", color: "#f5f5f5", marginBottom: "24px" }}>Parametres Plateforme</h1>
            <div style={{ background: "rgba(14,14,14,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "28px", maxWidth: "600px" }}>
              <h3 style={{ color: "#D4AF37", fontSize: "1rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Globe size={16} /> Configuration Domaine
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nom de la Plateforme</label>
                  <input value={platformName} onChange={e => setPlatformName(e.target.value)}
                    style={{ width: "100%", padding: "11px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f5f5", fontSize: "0.9rem", outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Domaine Racine</label>
                  <input value={platformDomain} onChange={e => setPlatformDomain(e.target.value)} placeholder="hosanne.site"
                    style={{ width: "100%", padding: "11px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f5f5", fontSize: "0.9rem", outline: "none" }} />
                  <p style={{ fontSize: "0.72rem", color: "#666", marginTop: "6px" }}>Les tenants seront accessibles via : {platformDomain}/slug/</p>
                </div>
                <button style={{ padding: "12px 24px", background: "linear-gradient(135deg,#D4AF37,#AA771C)", border: "none", borderRadius: "8px", color: "#000", fontWeight: "700", cursor: "pointer", alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Save size={14} /> Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "builder" && selectedTenant && (
          <div style={{ height: "calc(100vh - 80px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(212,175,55,0.1)",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h2 style={{ color: "#D4AF37", fontFamily: "inherit", fontSize: "1.1rem", marginBottom: "4px" }}>
                  🧱 Site Builder — {selectedTenant.name}
                </h2>
                <p style={{ color: "#888", fontSize: "0.78rem" }}>Activez ou désactivez les blocs, réordonnez-les, prévisualisez en temps réel</p>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <SiteBuilder
                tenant={selectedTenant}
                currentTheme={null}
                onSave={(blocks) => {
                  console.log("Blocks saved for", selectedTenant.slug, blocks)
                }}
              />
            </div>
          </div>
        )}
        {activeTab === "builder" && !selectedTenant && (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🧱</div>
            <h3 style={{ color: "#D4AF37", marginBottom: "8px" }}>Sélectionnez un tenant</h3>
            <p style={{ color: "#888", marginBottom: "24px" }}>Choisissez un site dans la liste des tenants pour ouvrir le builder</p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              {tenants.map(t => (
                <button key={t.id} onClick={() => { setSelectedTenant(t); }}
                  style={{ padding: "12px 20px", borderRadius: "10px", cursor: "pointer",
                    background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)",
                    color: "#D4AF37", fontSize: "0.85rem", fontWeight: "600" }}>
                  {t.name || t.slug}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Theme Editor Modal */}
      {themeEditorTenant && (
        <ThemeEditor tenant={themeEditorTenant} onClose={() => setThemeEditorTenant(null)}
          onSaved={(themeData) => { showMsg("Theme sauvegarde !"); setThemeEditorTenant(null) }} />
      )}

      {/* New/Edit Tenant Modal */}
      {showNewTenantModal && (
        <NewTenantModal
          tenant={editingTenant}
          onClose={() => { setShowNewTenantModal(false); setEditingTenant(null) }}
          onSaved={async (tenantData) => {
            if (editingTenant) {
              await updateTenant(editingTenant.id, tenantData)
              showMsg("Tenant mis a jour !")
            } else {
              await createTenant(tenantData)
              showMsg("Tenant cree avec succes !")
            }
            setShowNewTenantModal(false); setEditingTenant(null)
            loadTenants()
          }}
        />
      )}

      {/* SQL Modal */}
      {showSqlModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#0a0a0a", border: "1px solid rgba(100,180,140,0.3)", borderRadius: "16px", width: "100%", maxWidth: "760px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ color: "#64B48C", fontSize: "1.1rem", fontFamily: "Playfair Display,serif" }}>Script SQL de Migration</h3>
                <p style={{ fontSize: "0.78rem", color: "#888", marginTop: "4px" }}>Executer ce script dans Supabase SQL Editor une seule fois</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => { navigator.clipboard.writeText(SQL_MIGRATION); setSqlCopied(true); setTimeout(() => setSqlCopied(false), 2000) }}
                  style={{ padding: "8px 16px", background: "rgba(100,180,140,0.1)", border: "1px solid rgba(100,180,140,0.3)", borderRadius: "8px", color: "#64B48C", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}>
                  {sqlCopied ? <><CheckCircle size={14} /> Copie !</> : <><Copy size={14} /> Copier</>}
                </button>
                <button onClick={() => setShowSqlModal(false)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}><X size={18} /></button>
              </div>
            </div>
            <pre style={{ overflow: "auto", padding: "20px 24px", fontSize: "0.75rem", color: "#a8e6cf", fontFamily: "Consolas, monospace", lineHeight: "1.6", background: "rgba(0,0,0,0.3)", flex: 1 }}>
              {SQL_MIGRATION}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

function NewTenantModal({ tenant, onClose, onSaved }) {
  const isEdit = !!tenant
  const [form, setForm] = useState({
    slug: tenant?.slug || "",
    name: tenant?.name || "",
    template: tenant?.template || "beauty_salon",
    owner_email: tenant?.owner_email || "",
    domain: tenant?.domain || "",
    logo_url: tenant?.logo_url || "",
  })
  const [saving, setSaving] = useState(false)
  const [slugError, setSlugError] = useState("")

  const validateSlug = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-")
    setForm(prev => ({ ...prev, slug: clean }))
    if (!clean) setSlugError("Le slug est requis")
    else setSlugError("")
  }

  const handleSave = async () => {
    if (!form.slug || !form.name) { setSlugError("Nom et slug requis"); return }
    setSaving(true)
    await onSaved(form)
    setSaving(false)
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "16px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.3rem", color: "#f5f5f5" }}>{isEdit ? "Modifier le Tenant" : "Nouveau Tenant"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}><X size={18} /></button>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nom du Site *</label>
            <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Abaia Cosmetique" style={{ width: "100%", padding: "11px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f5f5", fontSize: "0.9rem", outline: "none" }} />
          </div>

          {/* Slug */}
          <div>
            <label style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Slug URL *</label>
            <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
              <span style={{ padding: "11px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRight: "none", borderRadius: "8px 0 0 8px", color: "#666", fontSize: "0.85rem" }}>hosanne.site/</span>
              <input value={form.slug} onChange={e => validateSlug(e.target.value)} placeholder="abaia"
                style={{ flex: 1, padding: "11px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "none", borderRadius: "0 8px 8px 0", color: "#f5f5f5", fontSize: "0.9rem", outline: "none" }} />
            </div>
            {slugError && <p style={{ fontSize: "0.72rem", color: "#ff6b6b", marginTop: "4px" }}>{slugError}</p>}
            <p style={{ fontSize: "0.72rem", color: "#666", marginTop: "4px" }}>Admin: hosanne.site/{form.slug || "..."}/admin/</p>
          </div>

          {/* Template */}
          <div>
            <label style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type de Site *</label>
            <TemplateSelector value={form.template} onChange={t => setForm(prev => ({ ...prev, template: t }))} />
          </div>

          {/* Owner email */}
          <div>
            <label style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Proprietaire</label>
            <input type="email" value={form.owner_email} onChange={e => setForm(prev => ({ ...prev, owner_email: e.target.value }))}
              placeholder="client@exemple.com" style={{ width: "100%", padding: "11px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f5f5", fontSize: "0.9rem", outline: "none" }} />
          </div>

          {/* Custom domain */}
          <div>
            <label style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Domaine Personnalise (optionnel)</label>
            <input value={form.domain} onChange={e => setForm(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="www.abaia-cosmetique.com" style={{ width: "100%", padding: "11px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f5f5", fontSize: "0.9rem", outline: "none" }} />
            <p style={{ fontSize: "0.72rem", color: "#666", marginTop: "4px" }}>Le client pourra connecter son propre domaine</p>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888", cursor: "pointer", fontSize: "0.9rem" }}>Annuler</button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg,#D4AF37,#AA771C)", border: "none", borderRadius: "8px", color: "#000", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Save size={15} /> {saving ? "Sauvegarde..." : (isEdit ? "Mettre a jour" : "Creer le Tenant")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
