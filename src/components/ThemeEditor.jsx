import React, { useState, useEffect } from "react"
import { updateTenantTheme } from "../supabase"
import { DEFAULT_THEME } from "../TenantContext"
import { Palette, Type, Save, RotateCcw, Eye } from "lucide-react"
import templates from "../templates/index.js"

const THEME_COLORS = [
  { key: "--bg-color", label: "Fond principal", group: "couleurs" },
  { key: "--panel-bg", label: "Fond des panneaux", group: "couleurs" },
  { key: "--primary-gold", label: "Couleur principale", group: "couleurs" },
  { key: "--light-gold", label: "Couleur claire", group: "couleurs" },
  { key: "--dark-gold", label: "Couleur foncee", group: "couleurs" },
  { key: "--text-primary", label: "Texte principal", group: "couleurs" },
  { key: "--text-secondary", label: "Texte secondaire", group: "couleurs" },
  { key: "--accent-red", label: "Couleur d'accent", group: "couleurs" },
]

const GOOGLE_FONTS = [
  "Playfair Display", "Inter", "Poppins", "Roboto", "Montserrat",
  "Lora", "Merriweather", "Oswald", "Raleway", "Open Sans",
  "Cormorant Garamond", "EB Garamond", "Quicksand", "Nunito",
  "Bodoni Moda", "Italiana", "Source Sans Pro"
]

const PRESET_THEMES = [
  { name: "Luxe Sombre (Alpha Beauty)", preset: { "--bg-color": "#0b0b0b", "--primary-gold": "#D4AF37", "--text-primary": "#f5f5f5", "--text-secondary": "#a0a0a0", mode: "dark" } },
  { name: "Elegant Clair (Cosmetique)", preset: { "--bg-color": "#FFF8F0", "--primary-gold": "#C5A55A", "--text-primary": "#1a1a1a", "--text-secondary": "#6b6b6b", mode: "light" } },
  { name: "Nature Vert (Spa)", preset: { "--bg-color": "#0a1a15", "--primary-gold": "#64B48C", "--text-primary": "#f0f5f2", "--text-secondary": "#90b0a0", mode: "dark" } },
  { name: "Rose Doux (Nail Art)", preset: { "--bg-color": "#1a0a1a", "--primary-gold": "#DC96C8", "--text-primary": "#f5f0f5", "--text-secondary": "#b0a0b0", mode: "dark" } },
  { name: "Chaleur (Restaurant)", preset: { "--bg-color": "#1a0f0a", "--primary-gold": "#C8783C", "--text-primary": "#f5f0e8", "--text-secondary": "#b0a090", mode: "dark" } },
  { name: "Moderne (Barbershop)", preset: { "--bg-color": "#111111", "--primary-gold": "#C8A03C", "--text-primary": "#f0f0f0", "--text-secondary": "#999999", mode: "dark" } },
]

export default function ThemeEditor({ tenant, onClose, onSaved }) {
  const tmpl = tenant?.template ? templates[tenant.template] : null
  const [themeData, setThemeData] = useState({ ...DEFAULT_THEME, ...(tmpl?.defaultTheme || {}) })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const applyPreset = (preset) => {
    setThemeData(prev => ({ ...prev, ...preset }))
  }

  const handleSave = async () => {
    setSaving(true)
    await updateTenantTheme(tenant.id, themeData)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if (onSaved) onSaved(themeData)
  }

  const handleReset = () => {
    const base = tmpl?.defaultTheme || DEFAULT_THEME
    setThemeData({ ...DEFAULT_THEME, ...base })
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "16px", width: "100%", maxWidth: "720px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Palette size={20} style={{ color: "#D4AF37" }} />
              <h3 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.3rem", color: "#f5f5f5" }}>Editeur de Theme</h3>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#888", marginTop: "4px" }}>{tenant?.name}</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleReset} style={{ padding: "8px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#999", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}>
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "8px 18px", background: "linear-gradient(135deg,#D4AF37,#AA771C)", border: "none", borderRadius: "8px", color: "#000", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}>
              <Save size={14} /> {saving ? "Sauvegarde..." : saved ? "Sauvegarde !" : "Sauvegarder"}
            </button>
            <button onClick={onClose} style={{ padding: "8px 14px", background: "transparent", border: "1px solid rgba(255,50,50,0.3)", borderRadius: "8px", color: "#ff6b6b", cursor: "pointer", fontSize: "0.82rem" }}>Fermer</button>
          </div>
        </div>

        <div style={{ overflow: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Preset themes */}
          <div>
            <h4 style={{ fontSize: "0.82rem", color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Themes Predefinies</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {PRESET_THEMES.map(p => (
                <button key={p.name} onClick={() => applyPreset(p.preset)}
                  style={{ padding: "6px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "20px", color: "#ccc", cursor: "pointer", fontSize: "0.78rem" }}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color pickers */}
          <div>
            <h4 style={{ fontSize: "0.82rem", color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}><Palette size={14} /> Couleurs</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {THEME_COLORS.map(({ key, label }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <input type="color" value={themeData[key] || "#000000"} onChange={e => setThemeData(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{ width: "36px", height: "36px", border: "none", borderRadius: "50%", padding: "2px", background: "transparent", cursor: "pointer" }} />
                  <div>
                    <div style={{ fontSize: "0.82rem", color: "#f5f5f5", fontWeight: "500" }}>{label}</div>
                    <div style={{ fontSize: "0.72rem", color: "#666", fontFamily: "monospace" }}>{themeData[key] || "non definie"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <h4 style={{ fontSize: "0.82rem", color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}><Type size={14} /> Typographie</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "6px" }}>Police Titres</label>
                <select value={themeData["--font-serif"]?.split(",")[0].replace(/'/g, "") || "Playfair Display"}
                  onChange={e => setThemeData(prev => ({ ...prev, "--font-serif": `'${e.target.value}', Georgia, serif` }))}
                  style={{ width: "100%", padding: "10px", background: "#111", border: "1px solid rgba(255,255,255,0.1)", color: "#f5f5f5", borderRadius: "8px", outline: "none" }}>
                  {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "6px" }}>Police Corps</label>
                <select value={themeData["--font-sans"]?.split(",")[0].replace(/'/g, "") || "Inter"}
                  onChange={e => setThemeData(prev => ({ ...prev, "--font-sans": `'${e.target.value}', system-ui, sans-serif` }))}
                  style={{ width: "100%", padding: "10px", background: "#111", border: "1px solid rgba(255,255,255,0.1)", color: "#f5f5f5", borderRadius: "8px", outline: "none" }}>
                  {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Mode */}
          <div>
            <h4 style={{ fontSize: "0.82rem", color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Mode</h4>
            <div style={{ display: "flex", gap: "10px" }}>
              {["dark", "light"].map(m => (
                <button key={m} onClick={() => setThemeData(prev => ({ ...prev, mode: m }))}
                  style={{ padding: "8px 20px", background: themeData.mode === m ? "rgba(212,175,55,0.15)" : "transparent", border: `1px solid ${themeData.mode === m ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", color: themeData.mode === m ? "#D4AF37" : "#888", cursor: "pointer", fontSize: "0.85rem", textTransform: "capitalize" }}>
                  {m === "dark" ? "Sombre" : "Clair"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
