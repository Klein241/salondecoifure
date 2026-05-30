import React, { useState } from "react"
import { MessageSquare } from "lucide-react"

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    window.open("https://wa.me/24177004073", "_blank");
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 999,
        background: "#25D366",
        color: "#ffffff",
        borderRadius: "30px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: hovered ? "0 24px" : "0 16px",
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(37, 211, 102, 0.4)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        overflow: "hidden",
        maxWidth: hovered ? "300px" : "56px",
        gap: hovered ? "10px" : "0",
      }}
    >
      <MessageSquare size={24} style={{ flexShrink: 0 }} />
      <span
        style={{
          whiteSpace: "nowrap",
          fontSize: "0.88rem",
          fontWeight: "600",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s ease",
          display: hovered ? "inline" : "none",
        }}
      >
        Contactez-nous sur WhatsApp
      </span>

      {/* Pulsing visual effect */}
      <style>{`
        @keyframes whatsPulse {
          0% { boxShadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
          70% { boxShadow: 0 0 0 15px rgba(37, 211, 102, 0); }
          100% { boxShadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        .whatsapp-pulse {
          animation: whatsPulse 2s infinite;
        }
      `}</style>
    </div>
  );
}
