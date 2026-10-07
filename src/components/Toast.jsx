import React, { createContext, useContext, useState, useCallback } from "react"
import { X } from "lucide-react"

const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be within ToastProvider")
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: "fixed", top: "80px", right: "20px", zIndex: 10000,
        display: "flex", flexDirection: "column", gap: "10px",
        maxWidth: "400px", pointerEvents: "none",
      }}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }) {
  const palette = {
    success: { border: "#228B22", bg: "rgba(34,139,34,0.1)" },
    error: { border: "#B22222", bg: "rgba(178,34,34,0.1)" },
    info: { border: "#D4AF37", bg: "rgba(212,175,55,0.1)" },
  }
  const c = palette[toast.type] || palette.info
  const icons = { success: "\u2713", error: "\u2717", info: "i" }

  return (
    <div style={{
      pointerEvents: "auto",
      background: c.bg,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderLeft: "4px solid " + c.border,
      borderRight: "1px solid " + c.border + "40",
      borderTop: "1px solid " + c.border + "40",
      borderBottom: "1px solid " + c.border + "40",
      borderRadius: "10px",
      padding: "16px 18px",
      color: "#f0f0f0",
      fontSize: "0.88rem",
      lineHeight: "1.4",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      animation: "toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      minWidth: "300px",
    }}>
      <span style={{
        width: "24px", height: "24px", borderRadius: "50%",
        background: c.border + "25", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "0.85rem", color: c.border,
        flexShrink: 0, fontWeight: "700",
      }}>
        {icons[toast.type] || icons.info}
      </span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button onClick={onClose} style={{
        background: "rgba(255,255,255,0.06)", border: "none",
        color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "4px",
        borderRadius: "4px", flexShrink: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <X size={14} />
      </button>
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
