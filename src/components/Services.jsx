import React, { useState } from "react"
import { servicesList } from "../data"
import { Clock, Sparkles } from "lucide-react"

export default function Services({ onSelectService }) {
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const categories = ["Tous", ...new Set(servicesList.map(s => s.category))];

  const filteredServices = selectedCategory === "Tous" 
    ? servicesList 
    : servicesList.filter(s => s.category === selectedCategory);

  return (
    <section
      id="services"
      style={{
        padding: "100px 24px",
        background: "#0d0d0d",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span
            style={{
              fontSize: "0.85rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--primary-gold)",
              fontWeight: "600",
              display: "block",
              marginBottom: "8px",
            }}
          >
            NOTRE CARTE
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "16px" }}>
            Soins d'Exception & <span className="gold-text">Rituels de Beauté</span>
          </h2>
          <div
            style={{
              width: "80px",
              height: "2px",
              background: "var(--gold-grad)",
              margin: "0 auto 24px",
            }}
          />
          <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
            Offrez-vous ou offrez à vos proches une parenthèse enchantée de pure détente. Retrouvez notre sélection spéciale pour des résultats sublimes.
          </p>
        </div>

        {/* Category Filter */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "btn-gold" : "btn-outline"}
              style={{
                padding: "8px 20px",
                fontSize: "0.8rem",
                borderRadius: "30px",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
          }}
        >
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="glass-panel glass-card-hover"
              style={{
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                position: "relative",
                border: "1px solid rgba(212, 175, 55, 0.12)",
                background: "rgba(18, 18, 18, 0.6)",
              }}
            >
              {/* Service Category */}
              <span
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--primary-gold)",
                  marginBottom: "12px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                {service.category}
              </span>

              {/* Title & Price */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3 style={{ fontSize: "1.3rem", color: "var(--text-primary)" }}>{service.name}</h3>
                <span
                  className="gold-text"
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: "700",
                    fontFamily: "var(--font-serif)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {service.price.toLocaleString("fr-FR")} F
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  lineHeight: "1.5",
                  marginBottom: "24px",
                  flexGrow: 1,
                }}
              >
                {service.description}
              </p>

              {/* Benefits list */}
              {service.benefits && (
                <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {service.benefits.map((benefit, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <Sparkles size={12} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Duration & Action */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid rgba(212, 175, 55, 0.1)",
                  paddingTop: "20px",
                  marginTop: "auto",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                  <Clock size={16} />
                  <span style={{ fontSize: "0.85rem" }}>{service.duration}</span>
                </div>
                <button
                  onClick={() => onSelectService(service)}
                  className="btn-gold"
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.75rem",
                  }}
                >
                  Réserver
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
