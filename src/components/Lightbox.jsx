import React, { useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export default function Lightbox({ images, currentIndex, isOpen, onClose, onNext, onPrev }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11, 11, 11, 0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeBg 0.3s ease forwards",
      }}
    >
      {/* Top Bar (Counter & Close) */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          right: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#ffffff",
          zIndex: 10010,
        }}
      >
        <span style={{ fontSize: "0.85rem", letterSpacing: "0.1em", color: "var(--text-secondary)" }}>
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          className="lightbox-close-btn"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "90%",
          maxHeight: "80%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          zIndex: 10005,
        }}
      >
        <img
          src={currentImage.image}
          alt={currentImage.title}
          style={{
            maxWidth: "85vw",
            maxHeight: "70vh",
            objectFit: "contain",
            borderRadius: "4px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.8)",
            animation: "scaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        />

        {/* Legend */}
        <div style={{ textAlign: "center", color: "#ffffff", animation: "fadeText 0.35s ease forwards" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px", color: "var(--primary-gold)" }}>
            {currentImage.title}
          </h4>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)" }}>
            {currentImage.category}
          </span>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        style={{
          position: "absolute",
          left: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#ffffff",
          cursor: "pointer",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          zIndex: 10008,
        }}
        className="nav-arrow"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        style={{
          position: "absolute",
          right: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#ffffff",
          cursor: "pointer",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          zIndex: 10008,
        }}
        className="nav-arrow"
      >
        <ChevronRight size={24} />
      </button>

      {/* Embedded slide-in animations styles */}
      <style>{`
        @keyframes fadeBg {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeText {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-arrow:hover {
          background: rgba(212,175,55,0.15) !important;
          color: var(--primary-gold) !important;
          border-color: var(--primary-gold) !important;
        }
        .lightbox-close-btn:hover {
          background: rgba(178,34,34,0.2) !important;
          color: #FF4500 !important;
        }
      `}</style>
    </div>
  );
}

