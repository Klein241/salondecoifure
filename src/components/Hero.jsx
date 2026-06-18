import React, { useState, useEffect } from "react"
import { Sparkles, Phone, MapPin, ArrowRight, Images } from "lucide-react"
import { getGalleryImages } from "../supabase"

function buildGroups(items) {
  const map = {}
  items.forEach(item => {
    const key = item.group_id || item.id
    if (!map[key]) map[key] = { groupId: key, title: item.title, images: [item], category: item.category }
    else map[key].images.push(item)
  })
  return Object.values(map).slice(0, 4)
}

export default function Hero({ onBookNow, onGalleryClick }) {
  const [groups, setGroups] = useState([])

  useEffect(() => {
    getGalleryImages().then(data => setGroups(buildGroups(data || []))).catch(() => {})
  }, [])

  return (
    <section
      id="home"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px", background: "radial-gradient(circle at top right, rgba(212, 175, 55, 0.08) 0%, #0b0b0b 70%)", position: "relative", overflow: "hidden" }}
    >
      {/* Background blobs */}
      <div style={{ position: "absolute", top: "10%", left: "-5%", width: "300px", height: "300px", background: "rgba(212,175,55,0.03)", filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "-5%", width: "400px", height: "400px", background: "rgba(212,175,55,0.05)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none" }} />

      {/* Main hero grid */}
      <div style={{ maxWidth: "1200px", width: "100%", display: "grid", gridTemplateColumns: "1fr", gap: "48px", alignItems: "center" }} className="hero-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} style={{ color: "var(--primary-gold)" }} />
            <span style={{ fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600" }}>L'EXCELLENCE DE LA BEAUTE</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: "1.1", fontFamily: "var(--font-serif)" }}>
            Sublimez Votre <br />
            <span className="gold-text">Eclat Naturel</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "540px" }}>
            Bienvenue chez <strong>The Alpha Beauty</strong>. Plongez dans un univers de detente absolue, de raffinement et de soins esthetiques d exception.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", margin: "12px 0 24px" }}>
            <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(212,175,55,0.1)" }}>
              <MapPin size={20} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
              <div><h4 style={{ fontSize: "0.85rem" }}>Adresse</h4><p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Alibadeng au Transfo</p></div>
            </div>
            <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(212,175,55,0.1)" }}>
              <Phone size={20} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
              <div><h4 style={{ fontSize: "0.85rem" }}>Contact</h4><p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>077 00 40 73 / 062 88 70 94</p></div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <button onClick={onBookNow} className="btn-gold" style={{ padding: "16px 36px" }}>Prendre Rendez-vous</button>
            <a href="#services" className="btn-outline" style={{ padding: "16px 36px", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Decouvrir nos soins</a>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }} className="hero-image-container">
          <div style={{ position: "absolute", width: "80%", height: "80%", background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)", zIndex: 0 }} />
          <div className="glass-panel" style={{ padding: "12px", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: "1px solid rgba(212,175,55,0.25)", transform: "rotate(1deg)", transition: "transform 0.5s ease", zIndex: 1, maxWidth: "420px", width: "100%" }}>
            <img src="/media__1779855006746.jpg" alt="The Alpha Beauty Flyer" style={{ width: "100%", borderRadius: "8px", display: "block", objectFit: "cover" }} />
          </div>
        </div>
      </div>

      {/* Gallery preview section */}
      {groups.length > 0 && (
        <div style={{ maxWidth: "1200px", width: "100%", marginTop: "60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Images size={18} style={{ color: "var(--primary-gold)" }} />
              <span style={{ fontSize: "0.85rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600" }}>Nos Creations</span>
            </div>
            <button
              onClick={() => { const el = document.getElementById("gallery"); if (el) el.scrollIntoView({ behavior: "smooth" }); if (onGalleryClick) onGalleryClick(); }}
              style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: "600" }}
            >
              Voir toute la galerie <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {groups.map(g => {
              const img = g.images[0]
              return (
                <div
                  key={g.groupId}
                  onClick={() => { const el = document.getElementById("gallery"); if (el) el.scrollIntoView({ behavior: "smooth" }); if (onGalleryClick) onGalleryClick(); }}
                  className="hero-gallery-card"
                  style={{ position: "relative", borderRadius: "10px", overflow: "hidden", height: "180px", cursor: "pointer", border: "1px solid rgba(212,175,55,0.12)" }}
                >
                  <div style={{ width: "100%", height: "100%", backgroundImage: `url(${img.image_url || img.image})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.5s ease" }} className="hero-gallery-img" />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)", display: "flex", alignItems: "flex-end", padding: "12px" }}>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{g.category}</span>
                      <p style={{ fontSize: "0.88rem", fontWeight: "700", color: "#fff", marginTop: "2px" }}>{g.title}</p>
                      {g.images.length > 1 && <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>{g.images.length} photos</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) { .hero-grid { grid-template-columns: 1.2fr 0.8fr !important; } }
        .hero-gallery-card:hover .hero-gallery-img { transform: scale(1.06); }
      `}</style>
    </section>
  )
}
