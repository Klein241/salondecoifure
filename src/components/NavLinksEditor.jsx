import React, { useState } from "react"
import { Plus, X, GripVertical } from "lucide-react"

const SECTION_OPTIONS = [
  "home", "services", "gallery", "booking", "shop", "about",
  "contact", "reviews", "menu", "portfolio", "blog", "affiliate", "team"
]

export default function NavLinksEditor({ links = [], onChange }) {
  const [items, setItems] = useState(links.length > 0 ? links : [
    { id: "home", label: "Accueil" },
    { id: "services", label: "Services" },
    { id: "contact", label: "Contact" }
  ])

  const update = (next) => { setItems(next); if (onChange) onChange(next) }

  const addLink = () => {
    update([...items, { id: "home", label: "Nouveau Lien" }])
  }

  const remove = (idx) => update(items.filter((_, i) => i !== idx))

  const change = (idx, field, val) => {
    update(items.map((item, i) => i === idx ? { ...item, [field]: val } : item))
  }

  return (
    <div>
      <p style={{ fontSize: "0.78rem", color: "#888", marginBottom: "12px" }}>Definissez les liens de navigation du site</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <GripVertical size={14} style={{ color: "#555", flexShrink: 0 }} />
            <select value={item.id} onChange={e => change(idx, "id", e.target.value)}
              style={{ padding: "8px 10px", background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#f5f5f5", borderRadius: "6px", fontSize: "0.82rem", outline: "none" }}>
              {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={item.label} onChange={e => change(idx, "label", e.target.value)} placeholder="Libelle"
              style={{ flex: 1, padding: "8px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#f5f5f5", fontSize: "0.82rem", outline: "none" }} />
            <button onClick={() => remove(idx)} style={{ background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", padding: "4px" }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addLink} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "6px", color: "#D4AF37", cursor: "pointer", fontSize: "0.8rem" }}>
        <Plus size={13} /> Ajouter un lien
      </button>
    </div>
  )
}
