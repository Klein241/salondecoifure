import React, { useState } from "react"
import { galleryItems } from "../data"
import { Sparkles } from "lucide-react"
import Lightbox from "./Lightbox"

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const categories = ["Tous", "Visage", "Corps", "Massages", "Salon"];

  const handleCardClick = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const filteredItems = activeFilter === "Tous"
    ? galleryItems
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <section
      id="gallery"
      style={{
        padding: "100px 24px",
        background: "#0b0b0b",
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
            NOTRE INSPIRATION
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "16px" }}>
            Galerie & <span className="gold-text">Créations</span>
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
            Aperçu de notre institut et des résultats magnifiques obtenus lors de nos rituels de beauté et de bien-être.
          </p>
        </div>

        {/* Filters */}
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
              onClick={() => setActiveFilter(cat)}
              className={activeFilter === cat ? "btn-gold" : "btn-outline"}
              style={{
                padding: "6px 16px",
                fontSize: "0.75rem",
                borderRadius: "30px",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="gallery-card-container"
              onClick={() => handleCardClick(galleryItems.indexOf(item))}
              style={{
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                height: "360px",
                border: "1px solid rgba(212, 175, 55, 0.1)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className="gallery-image"
              />

              {/* Overlay Content */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(11, 11, 11, 0.9) 0%, rgba(11, 11, 11, 0.2) 60%, transparent 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "24px",
                  opacity: 0,
                  transition: "opacity 0.4s ease",
                }}
                className="gallery-overlay"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Sparkles size={12} style={{ color: "var(--primary-gold)" }} />
                  <span
                    style={{
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--primary-gold)",
                    }}
                  >
                    {item.category}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hover styling for gallery cards */}
      <style>{`
        .gallery-card-container {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }
        .gallery-card-container:hover .gallery-image {
          transform: scale(1.08);
        }
        .gallery-card-container:hover .gallery-overlay {
          opacity: 1 !important;
        }
      `}</style>
      <Lightbox 
        images={galleryItems} 
        currentIndex={currentIndex} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onNext={handleNext} 
        onPrev={handlePrev} 
      />
    </section>
  );
}
