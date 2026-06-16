import React, { createContext, useContext, useState, useCallback } from "react"
import { AlertTriangle, Trash2, X } from "lucide-react"

const ConfirmContext = createContext(null)

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider")
  return ctx
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({
        title: options.title || "Confirmer",
        message: options.message || "Êtes-vous sûr ?",
        confirmLabel: options.confirmLabel || "Confirmer",
        cancelLabel: options.cancelLabel || "Annuler",
        danger: options.danger !== false,
        resolve,
      })
    })
  }, [])

  const handleConfirm = () => { state?.resolve(true); setState(null) }
  const handleCancel = () => { state?.resolve(false); setState(null) }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={handleCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", background: "#161616", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "400px", border: state.danger ? "1px solid rgba(178,34,34,0.3)" : "1px solid rgba(212,175,55,0.2)", boxShadow: "0 32px 64px rgba(0,0,0,0.6)", animation: "confirmSlideIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
            <button onClick={handleCancel} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", borderRadius: "6px", padding: "4px", display: "flex", alignItems: "center" }}>
              <X size={16} />
            </button>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: state.danger ? "rgba(178,34,34,0.12)" : "rgba(212,175,55,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
              {state.danger ? <Trash2 size={22} color="#FF4500" /> : <AlertTriangle size={22} color="#D4AF37" />}
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#fff", marginBottom: "10px" }}>{state.title}</h3>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", lineHeight: "1.6", marginBottom: "24px" }}>{state.message}</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleCancel} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit" }}>
                {state.cancelLabel}
              </button>
              <button onClick={handleConfirm} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: state.danger ? "linear-gradient(135deg,#8B0000,#FF4500)" : "linear-gradient(135deg,#AA771C,#D4AF37)", color: state.danger ? "#fff" : "#121212", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit", boxShadow: state.danger ? "0 4px 15px rgba(178,34,34,0.3)" : "0 4px 15px rgba(212,175,55,0.3)" }}>
                {state.confirmLabel}
              </button>
            </div>
          </div>
          <style>{`@keyframes confirmSlideIn { from { transform: scale(0.92) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }`}</style>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
