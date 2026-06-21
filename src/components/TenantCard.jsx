import React from "react"
import { Globe, Settings, Eye, Trash2, ToggleLeft, ToggleRight, Palette } from "lucide-react"

const ICONS = {
  beauty_salon: "💇‍♀️", cosmetics: "🧴", barbershop: "💈",
  nail_salon: "💅", spa_wellness: "🧖", restaurant: "🍽️", photo_studio: "📸"
}

export default function TenantCard({ tenant, stats, onEdit, onToggle, onDelete, onTheme, onVisit }) {
  const icon = ICONS[tenant.template] || "🏪"
  return (
    <div style={{ background: "rgba(18,18,18,0.8)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.1)"}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {tenant.logo_url
            ? <img src={tenant.logo_url} alt={tenant.name} style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover" }} />
            : <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>{icon}</div>
          }
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#f5f5f5", fontFamily: "Playfair Display,serif" }}>{tenant.name}</h3>
            <span style={{ fontSize: "0.72rem", color: "#888", fontFamily: "monospace" }}>/{tenant.slug}/</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.68rem", padding: "3px 10px", borderRadius: "20px", background: tenant.active ? "rgba(50,200,100,0.12)" : "rgba(255,50,50,0.1)", color: tenant.active ? "#4dd68c" : "#ff6b6b", border: `1px solid ${tenant.active ? "rgba(50,200,100,0.3)" : "rgba(255,50,50,0.2)"}` }}>
            {tenant.active ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {[
            { label: "Services", value: stats.services },
            { label: "RDV", value: stats.appointments },
            { label: "Produits", value: stats.products },
            { label: "Images", value: stats.images }
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "8px 4px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#D4AF37" }}>{s.value}</div>
              <div style={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Domain */}
      {tenant.domain && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", color: "#64B48C" }}>
          <Globe size={12} /> {tenant.domain}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={() => onVisit && onVisit(tenant)} title="Visiter" style={{ flex: 1, padding: "7px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px", color: "#D4AF37", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "0.78rem" }}>
          <Eye size={13} /> Visiter
        </button>
        <button onClick={() => onTheme && onTheme(tenant)} title="Theme" style={{ flex: 1, padding: "7px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px", color: "#D4AF37", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "0.78rem" }}>
          <Palette size={13} /> Theme
        </button>
        <button onClick={() => onEdit && onEdit(tenant)} title="Modifier" style={{ flex: 1, padding: "7px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#ccc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "0.78rem" }}>
          <Settings size={13} /> Modifier
        </button>
        <button onClick={() => onToggle && onToggle(tenant)} title="Activer/Desactiver" style={{ padding: "7px 10px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#aaa", cursor: "pointer" }}>
          {tenant.active ? <ToggleRight size={16} style={{ color: "#4dd68c" }} /> : <ToggleLeft size={16} />}
        </button>
        <button onClick={() => onDelete && onDelete(tenant)} title="Supprimer" style={{ padding: "7px 10px", background: "transparent", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "8px", color: "#ff6b6b", cursor: "pointer" }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
