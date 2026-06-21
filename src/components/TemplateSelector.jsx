import React from "react"
import templates from "../templates/index.js"

const ICONS = {
  beauty_salon: "💇‍♀️",
  cosmetics: "🧴",
  barbershop: "💈",
  nail_salon: "💅",
  spa_wellness: "🧖",
  restaurant: "🍽️",
  photo_studio: "📸",
  custom: "⚙️"
}

const DESCRIPTIONS = {
  beauty_salon: "Institut, salon, soins",
  cosmetics: "E-commerce, boutique produits",
  barbershop: "Barbershop, coiffeur homme",
  nail_salon: "Onglerie, nail art",
  spa_wellness: "Spa, detente, massage",
  restaurant: "Restaurant, traiteur, cafe",
  photo_studio: "Studio photo, video, artiste",
  custom: "N importe quel secteur - libre"
}

export default function TemplateSelector({ value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
      {Object.entries(templates).map(([key, tmpl]) => (
        <button key={key} onClick={() => onChange(key)}
          style={{
            padding: "14px 10px",
            background: value === key ? "rgba(212,175,55,0.12)" : key === "custom" ? "rgba(108,99,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${value === key ? "rgba(212,175,55,0.5)" : key === "custom" ? "rgba(108,99,255,0.25)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: "10px", color: "#f5f5f5", cursor: "pointer", textAlign: "center", transition: "all 0.2s"
          }}>
          <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>{ICONS[key] || "🏪"}</div>
          <div style={{ fontSize: "0.76rem", fontWeight: "700", color: value === key ? "#D4AF37" : key === "custom" ? "#A29BFE" : "#f5f5f5", marginBottom: "4px" }}>{tmpl.name}</div>
          <div style={{ fontSize: "0.65rem", color: "#666", lineHeight: "1.3" }}>{DESCRIPTIONS[key] || ""}</div>
        </button>
      ))}
    </div>
  )
}
