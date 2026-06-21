import React, { useState, useEffect } from "react"
import { Menu, X, User, Award, ShieldAlert, Sparkles, ShoppingBag } from "lucide-react"

export default function Navbar({ currentRoute, currentUser, onLogout, openPortalModal, navigateTo: navTo, siteSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "home", label: "Accueil" },
    { id: "services", label: "Soins" },
    { id: "gallery", label: "Galerie" },
    { id: "booking", label: "Réservation", icon: Sparkles },
    { id: "affiliate", label: "Parrainage", icon: Award },
    { id: "boutique", label: "Boutique", icon: ShoppingBag },
  ];

  const handleNavClick = (id) => {
    setIsOpen(false);
    const paths = {
      home: "/",
      services: "/nos-services",
      gallery: "/galerie",
      booking: "/reservation",
      affiliate: "/parrainage",
      portal: "/EspaceClient",
      boutique: "/boutique",
      admin: "/admin"
    };
    const targetPath = paths[id] || "/";
    window.history.pushState({}, "", targetPath);
  };

  return (
    <nav
      className="glass-panel"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: "0",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: isScrolled ? "1px solid rgba(212, 175, 55, 0.25)" : "1px solid rgba(212, 175, 55, 0.1)",
        background: isScrolled ? "rgba(11, 11, 11, 0.92)" : "rgba(11, 11, 11, 0.75)",
        backdropFilter: "blur(12px)",
        transition: "var(--transition-smooth)",
        padding: isScrolled ? "10px 24px" : "18px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div
          onClick={() => handleNavClick("home")}
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            className="gold-text"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.45rem",
              fontWeight: "700",
              letterSpacing: "0.15rem",
              lineHeight: 1.1,
            }}
          >
            THE ALPHA BEAUTY
          </span>
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.25rem",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              marginTop: "2px",
            }}
          >
            Institut de Beauté
          </span>
        </div>

        {/* Desktop Navigation */}
        <div
          style={{
            display: "none",
            alignItems: "center",
            gap: "24px",
          }}
          className="desktop-menu-container"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: currentRoute === link.id ? "var(--primary-gold)" : "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "var(--transition-smooth)",
                  padding: "6px 0",
                  position: "relative",
                }}
              >
                {Icon && <Icon size={14} style={{ color: "var(--primary-gold)" }} />}
                {link.label}
                {currentRoute === link.id && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "1px",
                      background: "var(--gold-grad)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "none",
            alignItems: "center",
            gap: "12px",
          }}
          className="desktop-actions-container"
        >
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={() => handleNavClick(currentUser.role === "admin" ? "admin" : "portal")}
                className="btn-outline"
                style={{
                  padding: "8px 18px",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {currentUser.role === "admin" ? <ShieldAlert size={14} /> : <User size={14} />}
                <span>{currentUser.name}</span>
              </button>
              <button
                onClick={onLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={openPortalModal}
              className="btn-outline"
              style={{
                padding: "8px 18px",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <User size={14} />
              <span>Espace Client</span>
            </button>
          )}

          <button
            onClick={() => handleNavClick("booking")}
            className="btn-gold"
            style={{ padding: "8px 18px", fontSize: "0.75rem" }}
          >
            Réserver
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary-gold)",
            cursor: "pointer",
            display: "block",
          }}
          className="mobile-toggle"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(11, 11, 11, 0.98)",
            borderRadius: "0",
            borderTop: "1px solid rgba(212, 175, 55, 0.15)",
            borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: currentRoute === link.id ? "var(--primary-gold)" : "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 0",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                {Icon && <Icon size={16} />}
                {link.label}
              </button>
            );
          })}
          <hr style={{ border: "0", borderTop: "1px solid rgba(212, 175, 55, 0.1)" }} />
          {currentUser ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <button
                onClick={() => handleNavClick(currentUser.role === "admin" ? "admin" : "portal")}
                className="btn-outline"
                style={{ width: "100%", textAlign: "center", justifyContent: "center", display: "flex", gap: "8px" }}
              >
                {currentUser.role === "admin" ? <ShieldAlert size={16} /> : <User size={16} />}
                {currentUser.name}
              </button>
              <button
                onClick={onLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                openPortalModal();
              }}
              className="btn-outline"
              style={{ width: "100%", textAlign: "center", justifyContent: "center", display: "flex", gap: "8px" }}
            >
              <User size={16} />
              Espace Client
            </button>
          )}

          <button
            onClick={() => handleNavClick("booking")}
            className="btn-gold"
            style={{ width: "100%" }}
          >
            Réserver maintenant
          </button>
        </div>
      )}

      {/* Embedded CSS for responsive navbar classes */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-menu-container {
            display: flex !important;
          }
          .desktop-actions-container {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
