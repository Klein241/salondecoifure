import React from "react"

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "Inter, sans-serif" }}>
          <div style={{ textAlign: "center", maxWidth: "480px" }}>
            <div style={{ fontSize: "4rem", marginBottom: "24px" }}>⚠️</div>
            <h1 style={{ color: "#D4AF37", fontSize: "1.5rem", fontWeight: "700", marginBottom: "12px" }}>
              Une erreur est survenue
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "28px" }}>
              L'application a rencontré un problème inattendu. Veuillez rafraîchir la page ou contacter le support.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: "linear-gradient(135deg,#AA771C,#D4AF37)", border: "none", color: "#121212", fontWeight: "700", padding: "12px 28px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit" }}
            >
              Rafraîchir la page
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details style={{ marginTop: "24px", textAlign: "left", background: "rgba(178,34,34,0.1)", border: "1px solid rgba(178,34,34,0.3)", borderRadius: "8px", padding: "16px" }}>
                <summary style={{ color: "#FF4500", cursor: "pointer", fontSize: "0.8rem" }}>Détails de l'erreur (développement)</summary>
                <pre style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", marginTop: "12px", overflow: "auto" }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
