import React, { useState, useEffect } from "react"
import { Clock, Sparkles, Scissors, Users } from "lucide-react"
import { getServices } from "../supabase"
import { servicesList } from "../data"

export default function Services({ onSelectService }) {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices().then(data => {
      setServices(data && data.length > 0 ? data : servicesList);
      setLoading(false);
    }).catch(() => {
      setServices(servicesList);
      setLoading(false);
    });
  }, []);

  // Ensure Coiffure categories appear even if not in data yet
  const allCategories = ["Tous", ...new Set([
    ...services.map(s => s.category),
    "Coiffure Homme",
    "Coiffure Femme"
  ].filter(Boolean))];

  const filteredServices = selectedCategory === "Tous"
    ? services
    : services.filter(s => s.category === selectedCategory);

  const getCategoryIcon = (cat) => {
    if (cat && cat.toLowerCase().includes("coiffure")) return <Scissors size={14} style={{ color: "var(--primary-gold)" }} />;
    return <Sparkles size={14} style={{ color: "var(--primary-gold)" }} />;
  };

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
            Soins & <span className="gold-text">Coiffure d'Exception</span>
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
            Offrez-vous une parenthèse enchantée de pure détente. Soins esthétiques et coiffure homme & femme pour des résultats sublimes.
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
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "btn-gold" : "btn-outline"}
              style={{
                padding: "8px 20px",
                fontSize: "0.8rem",
                borderRadius: "30px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {(cat === "Coiffure Homme" || cat === "Coiffure Femme") && <Scissors size={12} />}
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
            <Sparkles size={32} style={{ animation: "spin 1s linear infinite", color: "var(--primary-gold)" }} />
            <p style={{ marginTop: "16px" }}>Chargement des prestations...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-secondary)" }}>
            <Scissors size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
            <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Aucune prestation dans cette catégorie.</p>
            <p style={{ fontSize: "0.85rem" }}>L'admin peut en ajouter depuis le backoffice.</p>
          </div>
        ) : (
          /* Services Grid */
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
                  padding: "0",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  position: "relative",
                  border: "1px solid rgba(212, 175, 55, 0.12)",
                  background: "rgba(18, 18, 18, 0.6)",
                  overflow: "hidden",
                  borderRadius: "12px",
                }}
              >
                {/* Service Image */}
                {service.image_url && (
                  <div style={{
                    width: "100%",
                    height: "220px",
                    overflow: "hidden",
                    position: "relative",
                  }}>
                    <img
                      src={service.image_url}
                      alt={service.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                    />
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(13,13,13,0.6) 0%, transparent 60%)",
                    }} />
                    <span style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--primary-gold)",
                      background: "rgba(0,0,0,0.7)",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                      {getCategoryIcon(service.category)}
                      {service.category}
                    </span>
                  </div>
                )}

                <div style={{ padding: "28px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  {/* Category badge if no image */}
                  {!service.image_url && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--primary-gold)",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontWeight: "500",
                      }}
                    >
                      {getCategoryIcon(service.category)}
                      {service.category}
                    </span>
                  )}

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
                    <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>{service.name}</h3>
                    <span
                      className="gold-text"
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: "700",
                        fontFamily: "var(--font-serif)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {Number(service.price).toLocaleString("fr-FR")} F
                    </span>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.88rem",
                      lineHeight: "1.5",
                      marginBottom: "20px",
                      flexGrow: 1,
                    }}
                  >
                    {service.description}
                  </p>

                  {/* Benefits list */}
                  {service.benefits && service.benefits.length > 0 && (
                    <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {service.benefits.slice(0, 3).map((benefit, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                          <Sparkles size={11} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
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
                      paddingTop: "16px",
                      marginTop: "auto",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                      <Clock size={14} />
                      <span style={{ fontSize: "0.82rem" }}>{service.duration}</span>
                    </div>
                    <button
                      onClick={() => onSelectService(service)}
                      className="btn-gold"
                      style={{
                        padding: "8px 18px",
                        fontSize: "0.75rem",
                      }}
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </section>
  );
}
