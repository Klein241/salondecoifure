import React, { useState } from "react"
import { GripVertical, Eye, EyeOff, Plus, X, Edit3 } from "lucide-react"

const ALL_SECTIONS = [
  { id: "hero", label: "Page d Accueil (Hero)", icon: "🏠", description: "Banniere principale avec texte et image" },
  { id: "services", label: "Services / Prestations", icon: "⭐", description: "Liste de vos services avec prix" },
  { id: "gallery", label: "Galerie Photos", icon: "🖼️", description: "Galerie d images par categories" },
  { id: "booking", label: "Reservation en Ligne", icon: "📅", description: "Formulaire de prise de rendez-vous" },
  { id: "shop", label: "Boutique / Produits", icon: "🛍️", description: "Catalogue produits avec commandes" },
  { id: "about", label: "A Propos", icon: "ℹ️", description: "Presentation de votre entreprise" },
  { id: "contact", label: "Contact", icon: "📞", description: "Formulaire de contact et coordonnees" },
  { id: "reviews", label: "Avis Clients", icon: "💬", description: "Temoignages et notes clients" },
  { id: "menu", label: "Menu / Carte", icon: "📋", description: "Menu pour restaurant ou carte de services" },
  { id: "portfolio", label: "Portfolio / Realisations", icon: "💼", description: "Showcase de vos projets" },
  { id: "blog", label: "Blog / Actualites", icon: "📝", description: "Articles et actualites" },
  { id: "affiliate", label: "Programme Parrainage", icon: "🤝", description: "Systeme de parrainage clients" },
  { id: "fidelite", label: "Carte de Fidelite", icon: "🏆", description: "Programme de fidelite avec points" },
  { id: "team", label: "Notre Equipe", icon: "👥", description: "Presentation de votre equipe" },
]

export default function SectionsEditor({ activeSections = [], onChange }) {
  const [active, setActive] = useState(activeSections)

  const toggle = (sectionId) => {
    const next = active.includes(sectionId) ? active.filter(s => s !== sectionId) : [...active, sectionId]
    setActive(next)
    if (onChange) onChange(next)
  }

  return (
    <div>
      <p style={{ fontSize: "0.78rem", color: "#888", marginBottom: "14px" }}>
        Activez les sections que vous voulez afficher sur le site. Glissez pour reordonner.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {ALL_SECTIONS.map(sec => {
          const isOn = active.includes(sec.id)
          return (
            <div key={sec.id}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 14px", borderRadius: "8px",
                background: isOn ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isOn ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.06)"}`,
                cursor: "pointer", transition: "all 0.2s"
              }}
              onClick={() => toggle(sec.id)}
            >
              <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{sec.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.84rem", fontWeight: "600", color: isOn ? "#f5f5f5" : "#888" }}>{sec.label}</div>
                <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "2px" }}>{sec.description}</div>
              </div>
              <div style={{
                width: "36px", height: "20px", borderRadius: "10px",
                background: isOn ? "rgba(212,175,55,0.8)" : "rgba(255,255,255,0.1)",
                position: "relative", flexShrink: 0, transition: "background 0.2s"
              }}>
                <div style={{
                  position: "absolute", top: "2px", width: "16px", height: "16px",
                  borderRadius: "50%", background: isOn ? "#000" : "#555",
                  transition: "left 0.2s", left: isOn ? "18px" : "2px"
                }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: "14px", padding: "10px 14px", background: "rgba(212,175,55,0.04)", borderRadius: "8px", border: "1px solid rgba(212,175,55,0.1)" }}>
        <span style={{ fontSize: "0.75rem", color: "#D4AF37" }}>
          {active.length} section{active.length !== 1 ? "s" : ""} activee{active.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  )
}
