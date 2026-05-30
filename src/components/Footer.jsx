import React from "react"
import { Phone, MapPin, Clock, Sparkles } from "lucide-react"

export default function Footer() {
  return (
    <footer
      style={{
        background: "#090909",
        borderTop: "1px solid rgba(212, 175, 55, 0.1)",
        padding: "60px 24px 30px",
        color: "var(--text-secondary)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "40px",
          marginBottom: "40px",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h3
              className="gold-text"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.3rem",
                fontWeight: "700",
                letterSpacing: "0.1em",
              }}
            >
              THE ALPHA BEAUTY
            </h3>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary-gold)" }}>
              Institut de Beauté
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", lineHeight: "1.6" }}>
            Votre havre de paix et de beauté à Alibadeng. Des soins personnalisés pour révéler votre éclat unique.
          </p>
        </div>

        {/* Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4 style={{ color: "var(--text-primary)", fontSize: "1rem", letterSpacing: "0.05em" }}>Contactez-Nous</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Phone size={16} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
              <span>077 00 40 73 / 062 88 70 94</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <MapPin size={16} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
              <span>Alibadeng au Transfo, Libreville</span>
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4 style={{ color: "var(--text-primary)", fontSize: "1rem", letterSpacing: "0.05em" }}>Horaires d'Ouverture</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={16} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
              <div>
                <div>Lundi - Samedi : 09h00 - 19h00</div>
                <div style={{ color: "var(--primary-gold)", fontSize: "0.75rem", marginTop: "2px" }}>Dimanche : Sur rendez-vous uniquement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.05)", marginBottom: "30px" }} />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          fontSize: "0.75rem",
        }}
      >
        <p>© {new Date().getFullYear()} The Alpha Beauty. Tous droits réservés.</p>
        <p style={{ fontStyle: "italic", display: "flex", alignItems: "center", gap: "4px" }}>
          La beauté, notre passion, votre satisfaction, notre priorité ! <Sparkles size={10} style={{ color: "var(--primary-gold)" }} />
        </p>
      </div>
    </footer>
  );
}
