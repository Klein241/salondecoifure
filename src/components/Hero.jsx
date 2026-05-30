import React from "react"
import { Sparkles, Phone, MapPin } from "lucide-react"

export default function Hero({ onBookNow }) {
  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px 60px",
        background: "radial-gradient(circle at top right, rgba(212, 175, 55, 0.08) 0%, #0b0b0b 70%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Ornaments */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "-5%",
          width: "300px",
          height: "300px",
          background: "rgba(212, 175, 55, 0.03)",
          filter: "blur(80px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "-5%",
          width: "400px",
          height: "400px",
          background: "rgba(212, 175, 55, 0.05)",
          filter: "blur(100px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "48px",
          alignItems: "center",
        }}
        className="hero-grid"
      >
        {/* Left text section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} style={{ color: "var(--primary-gold)" }} />
            <span
              style={{
                fontSize: "0.85rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--primary-gold)",
                fontWeight: "600",
              }}
            >
              L'EXCELLENCE DE LA BEAUTÉ
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: "1.1",
              fontFamily: "var(--font-serif)",
            }}
          >
            Sublimez Votre <br />
            <span className="gold-text">Éclat Naturel</span>
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              lineHeight: "1.6",
              maxWidth: "540px",
            }}
          >
            Bienvenue chez <strong>The Alpha Beauty</strong>. Plongez dans un univers de détente absolue, de raffinement et de soins esthétiques d'exception conçus spécialement pour votre bien-être.
          </p>

          {/* Quick Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              margin: "12px 0 24px",
            }}
          >
            <div
              className="glass-panel"
              style={{
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "1px solid rgba(212, 175, 55, 0.1)",
              }}
            >
              <MapPin size={20} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Adresse</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Alibadeng au Transfo</p>
              </div>
            </div>

            <div
              className="glass-panel"
              style={{
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "1px solid rgba(212, 175, 55, 0.1)",
              }}
            >
              <Phone size={20} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Contact</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>077 00 40 73 / 062 88 70 94</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <button onClick={onBookNow} className="btn-gold" style={{ padding: "16px 36px" }}>
              Prendre Rendez-vous
            </button>
            <a
              href="#services"
              className="btn-outline"
              style={{
                padding: "16px 36px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Découvrir nos soins
            </a>
          </div>
        </div>

        {/* Right media section holding the flyer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
          className="hero-image-container"
        >
          {/* Neon gold shadow circle behind */}
          <div
            style={{
              position: "absolute",
              width: "80%",
              height: "80%",
              background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
              zIndex: 0,
            }}
          />

          <div
            className="glass-panel"
            style={{
              padding: "12px",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              transform: "rotate(1deg)",
              transition: "transform 0.5s ease",
              zIndex: 1,
              maxWidth: "420px",
              width: "100%",
            }}
          >
            {/* Displaying user's flyer */}
            <img
              src="/media__1779855006746.jpg"
              alt="The Alpha Beauty Flyer Spécial Fête des Mères"
              style={{
                width: "100%",
                borderRadius: "8px",
                display: "block",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .hero-grid {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
        }
      `}</style>
    </section>
  );
}
