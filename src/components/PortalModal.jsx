import React from "react"
import { X } from "lucide-react"
import Portal from "./Portal"

export default function PortalModal({ isOpen, onClose, currentUser, onLoginSuccess }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: "950px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          border: "1px solid rgba(212,175,55,0.25)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          padding: "10px",
          animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "none",
            color: "var(--primary-gold)",
            cursor: "pointer",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "var(--transition-smooth)",
          }}
        >
          <X size={20} />
        </button>

        {/* Portal component inside modal */}
        <div style={{ marginTop: "20px" }}>
          <Portal
            currentUser={currentUser}
            onLoginSuccess={(user) => {
              onLoginSuccess(user);
              if (user.role !== "admin") {
                // close modal for clients on success, but keep for admin
                onClose();
              }
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
