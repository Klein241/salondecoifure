import { useState, useCallback } from "react"

// ─── Bibliothèque de blocs disponibles ───────────────────────────────────────
const BLOCK_LIBRARY = [
  {
    id: "hero",
    label: "Hero / Bannière",
    icon: "🏠",
    category: "Essentiel",
    description: "Bannière principale avec titre, slogan et CTA",
    preview: { bg: "linear-gradient(135deg,#1a1a2e,#16213e)", color: "#D4AF37", text: "HERO BANNER" }
  },
  {
    id: "services",
    label: "Services / Prestations",
    icon: "✂️",
    category: "Contenu",
    description: "Grille des services avec prix et descriptions",
    preview: { bg: "#111", color: "#D4AF37", text: "SERVICES" }
  },
  {
    id: "booking",
    label: "Réservation",
    icon: "📅",
    category: "Essentiel",
    description: "Formulaire de prise de rendez-vous en ligne",
    preview: { bg: "#0d1117", color: "#58a6ff", text: "BOOKING" }
  },
  {
    id: "gallery",
    label: "Galerie Photos",
    icon: "🖼️",
    category: "Contenu",
    description: "Grille de photos avant/après et réalisations",
    preview: { bg: "#1a1a1a", color: "#fff", text: "GALLERY" }
  },
  {
    id: "shop",
    label: "Boutique / Shop",
    icon: "🛒",
    category: "Commerce",
    description: "Catalogue produits avec panier et commande",
    preview: { bg: "#0f0f0f", color: "#D4AF37", text: "SHOP" }
  },
  {
    id: "testimonials",
    label: "Avis Clients",
    icon: "⭐",
    category: "Social",
    description: "Témoignages et notes des clients",
    preview: { bg: "#141414", color: "#ffd700", text: "REVIEWS ★★★★★" }
  },
  {
    id: "team",
    label: "Notre Équipe",
    icon: "👥",
    category: "Contenu",
    description: "Présentation des membres de l'équipe",
    preview: { bg: "#1c1c1c", color: "#aaa", text: "TEAM" }
  },
  {
    id: "about",
    label: "À Propos",
    icon: "ℹ️",
    category: "Contenu",
    description: "Histoire et valeurs de la marque",
    preview: { bg: "#181818", color: "#ccc", text: "ABOUT" }
  },
  {
    id: "affiliate",
    label: "Programme Parrainage",
    icon: "🤝",
    category: "Commerce",
    description: "Système de parrainage et commissions",
    preview: { bg: "#0a0a0a", color: "#D4AF37", text: "AFFILIATE" }
  },
  {
    id: "promo",
    label: "Codes Promo / Offres",
    icon: "🏷️",
    category: "Commerce",
    description: "Bannière promotionnelle et codes de réduction",
    preview: { bg: "#1a0a0a", color: "#ff6b6b", text: "PROMO BANNER" }
  },
  {
    id: "contact",
    label: "Contact / Localisation",
    icon: "📍",
    category: "Essentiel",
    description: "Coordonnées, carte et formulaire de contact",
    preview: { bg: "#0d1117", color: "#3fb950", text: "CONTACT" }
  },
  {
    id: "whatsapp",
    label: "Bouton WhatsApp",
    icon: "📱",
    category: "Essentiel",
    description: "Bouton flottant WhatsApp pour contact rapide",
    preview: { bg: "#128C7E", color: "#fff", text: "WhatsApp" }
  },
  {
    id: "portal",
    label: "Espace Client",
    icon: "🔐",
    category: "Avancé",
    description: "Login, historique RDV, fidélité, profil",
    preview: { bg: "#0d1117", color: "#8b949e", text: "CLIENT PORTAL" }
  },
  {
    id: "newsletter",
    label: "Newsletter",
    icon: "📧",
    category: "Marketing",
    description: "Inscription à la newsletter",
    preview: { bg: "#161b22", color: "#58a6ff", text: "NEWSLETTER" }
  },
  {
    id: "stats",
    label: "Statistiques / Chiffres",
    icon: "📊",
    category: "Social",
    description: "Compteurs animés : clients, années, etc.",
    preview: { bg: "#111", color: "#D4AF37", text: "100+ clients • 5 ans" }
  },
]

const CATEGORIES = ["Tous", "Essentiel", "Contenu", "Commerce", "Social", "Marketing", "Avancé"]

const TEMPLATES = {
  beauty_salon: {
    label: "Salon de Beauté",
    icon: "💅",
    defaultBlocks: ["hero", "services", "booking", "gallery", "testimonials", "team", "whatsapp", "portal"]
  },
  cosmetics: {
    label: "Cosmétique",
    icon: "✨",
    defaultBlocks: ["hero", "shop", "gallery", "about", "testimonials", "whatsapp", "contact"]
  },
  spa: {
    label: "Spa & Bien-être",
    icon: "🧖",
    defaultBlocks: ["hero", "services", "booking", "gallery", "testimonials", "about", "whatsapp"]
  },
  custom: {
    label: "Personnalisé",
    icon: "⚙️",
    defaultBlocks: ["hero", "contact", "whatsapp"]
  }
}

// ─── Préview d'un bloc ───────────────────────────────────────────────────────
function BlockPreviewCard({ block, isEnabled, onToggle, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: isEnabled
          ? "2px solid rgba(212,175,55,0.6)"
          : "2px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        background: isEnabled
          ? "rgba(212,175,55,0.06)"
          : hover ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
        padding: "14px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex", alignItems: "center", gap: "12px"
      }}
      onClick={() => onToggle(block.id)}
    >
      {/* Block mini preview */}
      <div style={{
        width: "48px", height: "36px", borderRadius: "6px", flexShrink: 0,
        background: block.preview.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.5rem", color: block.preview.color,
        fontWeight: "700", letterSpacing: "0.05em",
        overflow: "hidden", textAlign: "center",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        {block.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: isEnabled ? "#D4AF37" : "#f5f5f5" }}>
            {block.label}
          </span>
          {isEnabled && <span style={{ fontSize: "0.65rem", background: "rgba(212,175,55,0.2)", color: "#D4AF37", borderRadius: "4px", padding: "1px 6px" }}>✓ Actif</span>}
        </div>
        <p style={{ fontSize: "0.72rem", color: "#888", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {block.description}
        </p>
      </div>

      {/* Controls */}
      {isEnabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flexShrink: 0 }}
          onClick={e => e.stopPropagation()}>
          <button onClick={() => onMoveUp(block.id)} disabled={!canMoveUp}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px",
              color: canMoveUp ? "#D4AF37" : "#444", cursor: canMoveUp ? "pointer" : "default",
              fontSize: "0.7rem", padding: "2px 6px", lineHeight: 1 }}>▲</button>
          <button onClick={() => onMoveDown(block.id)} disabled={!canMoveDown}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px",
              color: canMoveDown ? "#D4AF37" : "#444", cursor: canMoveDown ? "pointer" : "default",
              fontSize: "0.7rem", padding: "2px 6px", lineHeight: 1 }}>▼</button>
        </div>
      )}

      {/* Toggle */}
      <div style={{
        width: "36px", height: "20px", borderRadius: "10px", flexShrink: 0,
        background: isEnabled ? "#D4AF37" : "rgba(255,255,255,0.1)",
        position: "relative", transition: "background 0.2s", cursor: "pointer"
      }}>
        <div style={{
          position: "absolute", top: "3px",
          left: isEnabled ? "18px" : "3px",
          width: "14px", height: "14px",
          borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
        }} />
      </div>
    </div>
  )
}

// ─── Preview du site (simulation) ────────────────────────────────────────────
function SitePreview({ tenant, enabledBlocks, theme }) {
  const isDark = theme?.mode !== "light"
  const bg = isDark ? "#0b0b0b" : "#FDF6EC"
  const gold = theme?.theme_data?.["--primary-gold"] || (isDark ? "#D4AF37" : "#B8860B")
  const textColor = isDark ? "#f5f5f5" : "#1C1C1C"
  const fontSerif = theme?.theme_data?.["--font-serif"] || "'Playfair Display', serif"

  const blockPreviews = {
    hero: (
      <div style={{ padding: "24px", textAlign: "center", background: `linear-gradient(135deg, ${bg}, rgba(${isDark ? "212,175,55" : "232,213,163"},0.15))`, borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.15)` }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: gold, marginBottom: "6px", textTransform: "uppercase" }}>— {tenant?.name || "Mon Site"} —</div>
        <div style={{ fontFamily: fontSerif, fontSize: "1.4rem", fontWeight: "700", color: gold, marginBottom: "4px" }}>{tenant?.name || "Mon Site"}</div>
        <div style={{ fontSize: "0.6rem", color: isDark ? "#aaa" : "#5A5040", marginBottom: "12px", fontStyle: "italic" }}>Votre slogan ici</div>
        <div style={{ display: "inline-block", padding: "5px 14px", background: gold, borderRadius: "20px", color: isDark ? "#000" : "#fff", fontSize: "0.6rem", fontWeight: "700" }}>Réserver</div>
      </div>
    ),
    services: (
      <div style={{ padding: "16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)` }}>
        <div style={{ fontSize: "0.65rem", fontWeight: "700", color: gold, textAlign: "center", marginBottom: "10px" }}>Nos Services</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
          {["Coiffure", "Soins", "Manucure"].map(s => (
            <div key={s} style={{ padding: "8px 4px", borderRadius: "6px", border: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.2)`, textAlign: "center", fontSize: "0.55rem", color: textColor }}>{s}</div>
          ))}
        </div>
      </div>
    ),
    booking: (
      <div style={{ padding: "16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)` }}>
        <div style={{ fontSize: "0.65rem", fontWeight: "700", color: gold, textAlign: "center", marginBottom: "8px" }}>📅 Réservation</div>
        <div style={{ background: `rgba(${isDark ? "212,175,55" : "197,165,90"},0.08)`, borderRadius: "8px", padding: "10px", border: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.15)` }}>
          <div style={{ fontSize: "0.55rem", color: isDark ? "#888" : "#5A5040" }}>Sélectionnez votre service et créneau</div>
        </div>
      </div>
    ),
    gallery: (
      <div style={{ padding: "16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)` }}>
        <div style={{ fontSize: "0.65rem", fontWeight: "700", color: gold, textAlign: "center", marginBottom: "8px" }}>🖼️ Galerie</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "4px" }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ aspectRatio: "1", borderRadius: "4px", background: `rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`, border: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)` }} />
          ))}
        </div>
      </div>
    ),
    shop: (
      <div style={{ padding: "16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)` }}>
        <div style={{ fontSize: "0.65rem", fontWeight: "700", color: gold, textAlign: "center", marginBottom: "8px" }}>🛒 Boutique</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {["Produit A — 5 000 F", "Produit B — 8 000 F"].map(p => (
            <div key={p} style={{ padding: "6px", borderRadius: "6px", border: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.2)`, fontSize: "0.52rem", color: textColor, textAlign: "center" }}>{p}</div>
          ))}
        </div>
      </div>
    ),
    testimonials: (
      <div style={{ padding: "16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`, textAlign: "center" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: "700", color: gold, marginBottom: "8px" }}>⭐ Avis Clients</div>
        <div style={{ fontSize: "0.55rem", color: isDark ? "#888" : "#888", fontStyle: "italic" }}>"Service exceptionnel, je recommande !"</div>
        <div style={{ color: gold, fontSize: "0.6rem", marginTop: "4px" }}>★★★★★</div>
      </div>
    ),
    whatsapp: (
      <div style={{ padding: "8px 16px", background: "rgba(18,140,126,0.1)", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`, textAlign: "center" }}>
        <span style={{ fontSize: "0.6rem", color: "#25D366" }}>📱 Bouton WhatsApp flottant activé</span>
      </div>
    ),
    about: (
      <div style={{ padding: "16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`, textAlign: "center" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: "700", color: gold, marginBottom: "6px" }}>À Propos</div>
        <div style={{ fontSize: "0.55rem", color: isDark ? "#888" : "#5A5040", lineHeight: 1.5 }}>Notre histoire et nos valeurs...</div>
      </div>
    ),
    contact: (
      <div style={{ padding: "16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`, textAlign: "center" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: "700", color: gold, marginBottom: "6px" }}>📍 Contact</div>
        <div style={{ fontSize: "0.55rem", color: isDark ? "#888" : "#5A5040" }}>Adresse • Téléphone • Email</div>
      </div>
    ),
    team: (
      <div style={{ padding: "16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)` }}>
        <div style={{ fontSize: "0.65rem", fontWeight: "700", color: gold, textAlign: "center", marginBottom: "8px" }}>👥 Équipe</div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width: "30px", height: "30px", borderRadius: "50%", background: `rgba(${isDark ? "212,175,55" : "197,165,90"},0.15)`, border: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.2)` }} />
          ))}
        </div>
      </div>
    ),
    affiliate: (
      <div style={{ padding: "12px 16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`, textAlign: "center" }}>
        <div style={{ fontSize: "0.6rem", color: gold }}>🤝 Programme Parrainage activé</div>
      </div>
    ),
    promo: (
      <div style={{ padding: "8px 16px", background: "rgba(139,0,0,0.08)", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`, textAlign: "center" }}>
        <span style={{ fontSize: "0.6rem", color: "#ff6b6b" }}>🏷️ Bannière Promo — 20% de réduction !</span>
      </div>
    ),
    portal: (
      <div style={{ padding: "12px 16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`, textAlign: "center" }}>
        <div style={{ fontSize: "0.6rem", color: isDark ? "#8b949e" : "#888" }}>🔐 Espace Client — Connexion / Mon compte</div>
      </div>
    ),
    newsletter: (
      <div style={{ padding: "12px 16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`, textAlign: "center" }}>
        <div style={{ fontSize: "0.6rem", color: "#58a6ff" }}>📧 Inscription Newsletter</div>
      </div>
    ),
    stats: (
      <div style={{ padding: "12px 16px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`, textAlign: "center" }}>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          {["500+ clients", "5 ans", "★ 4.9"].map(s => (
            <span key={s} style={{ fontSize: "0.6rem", color: gold, fontWeight: "700" }}>{s}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1, background: bg, borderRadius: "12px",
      overflow: "hidden", fontSize: "0.9rem",
      border: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.2)`,
      display: "flex", flexDirection: "column"
    }}>
      {/* Browser chrome mock */}
      <div style={{ background: isDark ? "#1a1a1a" : "#e8e8e8", padding: "8px 12px",
        display: "flex", alignItems: "center", gap: "6px",
        borderBottom: `1px solid rgba(${isDark ? "255,255,255" : "0,0,0"},0.1)` }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <div key={c} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, background: isDark ? "#2d2d2d" : "#fff",
          borderRadius: "4px", padding: "3px 10px",
          fontSize: "0.65rem", color: isDark ? "#888" : "#555" }}>
          hosanne.site/{tenant?.slug || "mon-site"}/
        </div>
      </div>

      {/* Site content preview */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {/* Navbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 14px", borderBottom: `1px solid rgba(${isDark ? "212,175,55" : "197,165,90"},0.1)`,
          background: isDark ? "rgba(0,0,0,0.5)" : "rgba(253,246,236,0.9)" }}>
          <span style={{ fontFamily: fontSerif, fontSize: "0.75rem", fontWeight: "700", color: gold }}>
            {tenant?.name || "Mon Site"}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {enabledBlocks.filter(b => ["services","gallery","booking","shop"].includes(b)).map(b => (
              <span key={b} style={{ fontSize: "0.5rem", color: isDark ? "#888" : "#5A5040", textTransform: "capitalize" }}>{b}</span>
            ))}
          </div>
        </div>

        {/* Render enabled blocks in order */}
        {enabledBlocks.map(blockId => (
          blockPreviews[blockId] ? (
            <div key={blockId}>{blockPreviews[blockId]}</div>
          ) : null
        ))}

        {/* Footer */}
        <div style={{ padding: "14px", textAlign: "center", background: isDark ? "#0a0a0a" : "#1C1C1C",
          marginTop: "auto" }}>
          <div style={{ fontSize: "0.6rem", color: gold, marginBottom: "4px" }}>{tenant?.name || "Mon Site"}</div>
          <div style={{ fontSize: "0.5rem", color: "#666" }}>© 2025 — Tous droits réservés</div>
        </div>
      </div>
    </div>
  )
}

// ─── Composant principal SiteBuilder ─────────────────────────────────────────
export default function SiteBuilder({ tenant, currentTheme, onSave, onClose }) {
  const templateKey = tenant?.template || "custom"
  const template = TEMPLATES[templateKey] || TEMPLATES.custom

  const [enabledBlocks, setEnabledBlocks] = useState(() => {
    const saved = localStorage.getItem(`builder_blocks_${tenant?.id}`)
    if (saved) { try { return JSON.parse(saved) } catch(e) {} }
    return template.defaultBlocks
  })
  const [activeCategory, setActiveCategory] = useState("Tous")
  const [search, setSearch] = useState("")
  const [saved, setSaved] = useState(false)
  const [previewDevice, setPreviewDevice] = useState("desktop")

  const toggleBlock = useCallback((blockId) => {
    setEnabledBlocks(prev => {
      if (prev.includes(blockId)) {
        if (blockId === "hero") return prev // hero toujours présent
        return prev.filter(b => b !== blockId)
      } else {
        return [...prev, blockId]
      }
    })
  }, [])

  const moveBlock = useCallback((blockId, direction) => {
    setEnabledBlocks(prev => {
      const idx = prev.indexOf(blockId)
      if (idx < 0) return prev
      const next = [...prev]
      if (direction === "up" && idx > 0) {
        [next[idx-1], next[idx]] = [next[idx], next[idx-1]]
      } else if (direction === "down" && idx < next.length - 1) {
        [next[idx], next[idx+1]] = [next[idx+1], next[idx]]
      }
      return next
    })
  }, [])

  const handleSave = () => {
    localStorage.setItem(`builder_blocks_${tenant?.id}`, JSON.stringify(enabledBlocks))
    if (onSave) onSave(enabledBlocks)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const filteredBlocks = BLOCK_LIBRARY.filter(b => {
    const matchCat = activeCategory === "Tous" || b.category === activeCategory
    const matchSearch = !search || b.label.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const enabledInOrder = enabledBlocks.filter(id => BLOCK_LIBRARY.find(b => b.id === id))
  const disabledBlocks = filteredBlocks.filter(b => !enabledBlocks.includes(b.id))

  return (
    <div style={{ display: "flex", height: "100%", gap: "0", overflow: "hidden" }}>

      {/* ── PANNEAU GAUCHE : bibliothèque de blocs ─────────────────── */}
      <div style={{ width: "320px", flexShrink: 0, borderRight: "1px solid rgba(212,175,55,0.1)",
        display: "flex", flexDirection: "column", overflow: "hidden", background: "rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#D4AF37" }}>
              🧱 Blocs ({BLOCK_LIBRARY.length})
            </span>
            <span style={{ fontSize: "0.72rem", color: "#888" }}>
              {enabledBlocks.length} actifs
            </span>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Rechercher un bloc..."
            style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
              color: "#f5f5f5", fontSize: "0.8rem", outline: "none" }} />
        </div>

        {/* Catégories */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(212,175,55,0.1)",
          display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "0.68rem",
                border: "1px solid rgba(212,175,55,0.2)",
                background: activeCategory === cat ? "rgba(212,175,55,0.15)" : "transparent",
                color: activeCategory === cat ? "#D4AF37" : "#888",
                cursor: "pointer", fontWeight: activeCategory === cat ? "600" : "400" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Active blocks (in order) */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {enabledInOrder.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "0.68rem", color: "#D4AF37", fontWeight: "600",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                ✓ Blocs actifs — ordre de la page
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {enabledInOrder.map((blockId, idx) => {
                  const block = BLOCK_LIBRARY.find(b => b.id === blockId)
                  if (!block) return null
                  return (
                    <BlockPreviewCard key={blockId} block={block} isEnabled={true}
                      onToggle={toggleBlock}
                      onMoveUp={() => moveBlock(blockId, "up")}
                      onMoveDown={() => moveBlock(blockId, "down")}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < enabledInOrder.length - 1} />
                  )
                })}
              </div>
            </div>
          )}

          {disabledBlocks.length > 0 && (
            <div>
              <p style={{ fontSize: "0.68rem", color: "#888", fontWeight: "600",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                + Ajouter un bloc
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {disabledBlocks.map(block => (
                  <BlockPreviewCard key={block.id} block={block} isEnabled={false}
                    onToggle={toggleBlock}
                    onMoveUp={() => {}} onMoveDown={() => {}}
                    canMoveUp={false} canMoveDown={false} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ padding: "16px", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
          <button onClick={handleSave}
            style={{ width: "100%", padding: "12px", borderRadius: "10px",
              background: saved ? "rgba(40,200,100,0.15)" : "linear-gradient(135deg, #D4AF37, #AA771C)",
              border: saved ? "1px solid rgba(40,200,100,0.4)" : "none",
              color: saved ? "#28c840" : "#0b0b0b",
              fontWeight: "700", fontSize: "0.85rem", cursor: "pointer",
              letterSpacing: "0.05em", transition: "all 0.3s" }}>
            {saved ? "✅ Sauvegardé !" : "💾 Sauvegarder la structure"}
          </button>
        </div>
      </div>

      {/* ── PANNEAU CENTRAL : preview ───────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "16px" }}>

        {/* Preview toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {[["desktop","🖥️ Bureau"],["tablet","📱 Tablette"],["mobile","📲 Mobile"]].map(([d, label]) => (
              <button key={d} onClick={() => setPreviewDevice(d)}
                style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "0.75rem",
                  border: "1px solid rgba(212,175,55,0.2)",
                  background: previewDevice === d ? "rgba(212,175,55,0.15)" : "transparent",
                  color: previewDevice === d ? "#D4AF37" : "#888", cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          <a href={`/${tenant?.slug || ""}/`} target="_blank" rel="noreferrer"
            style={{ fontSize: "0.75rem", color: "#D4AF37", textDecoration: "none",
              padding: "6px 14px", border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            🔗 Voir le vrai site
          </a>
        </div>

        {/* Preview container */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", overflow: "hidden" }}>
          <div style={{
            width: previewDevice === "mobile" ? "320px" : previewDevice === "tablet" ? "480px" : "100%",
            maxWidth: "100%",
            transition: "width 0.3s ease",
            display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            borderRadius: "12px", overflow: "hidden"
          }}>
            <SitePreview tenant={tenant} enabledBlocks={enabledBlocks} theme={currentTheme} />
          </div>
        </div>

        {/* Info bar */}
        <div style={{ marginTop: "12px", padding: "10px 16px",
          background: "rgba(212,175,55,0.04)", borderRadius: "8px",
          border: "1px solid rgba(212,175,55,0.1)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "#888" }}>
            📋 <strong style={{ color: "#D4AF37" }}>{enabledBlocks.length}</strong> blocs actifs •
            Template : <strong style={{ color: "#D4AF37" }}>{template.label}</strong>
          </span>
          <span style={{ fontSize: "0.72rem", color: "#666" }}>
            🔄 Aperçu en temps réel
          </span>
        </div>
      </div>
    </div>
  )
}
