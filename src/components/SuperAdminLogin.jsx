import React, { useState } from "react"
import { supabase } from "../supabase"
import { Lock, Mail, ShieldCheck, ChevronLeft } from "lucide-react"

export default function SuperAdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return }
    setLoading(true); setError("")
    try {
      let authenticated = false

      // Try Supabase first
      if (supabase) {
        try {
          const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
          if (!authError && data?.user) {
            // Check superadmin table
            const { data: saProfile } = await supabase
              .from('superadmin_users')
              .select('*')
              .eq('user_id', data.user.id)
              .single()
            if (saProfile) {
              onLoginSuccess({ ...data.user, ...saProfile, role: "superadmin" })
              authenticated = true
            } else {
              await supabase.auth.signOut()
              setError("Acces refuse. Cet espace est reserve au SuperAdmin.")
              setLoading(false); return
            }
          }
        } catch (supaErr) {
          // Supabase failed — fall through to local
        }
      }

      // Local dev fallback (credentials: superadmin@hosanne.com / superadmin)
      if (!authenticated) {
        const LOCAL_ADMINS = [
          { email: "superadmin@hosanne.com", password: "superadmin" },
          { email: "admin@hosanne.com", password: "admin123" },
        ]
        const match = LOCAL_ADMINS.find(a => a.email === email && a.password === password)
        if (match) {
          onLoginSuccess({ id: "sa-local", email, name: "SuperAdmin Hosanne", role: "superadmin" })
          authenticated = true
        } else {
          setError("Email ou mot de passe incorrect.")
        }
      }
    } catch (err) {
      setError("Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top right, rgba(212,175,55,0.08) 0%, #050505 70%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "420px", width: "100%", background: "rgba(12,12,12,0.97)", borderRadius: "16px", border: "1px solid rgba(212,175,55,0.2)", padding: "48px 36px", boxShadow: "0 30px 60px rgba(0,0,0,0.8)", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#D4AF37" }}>
          <ShieldCheck size={30} />
        </div>
        <div style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#D4AF37", fontWeight: "700", marginBottom: "6px" }}>Hosanne Platform</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: "500", color: "#f5f5f5", marginBottom: "8px" }}>SuperAdmin</h2>
        <p style={{ fontSize: "0.76rem", color: "#555", marginBottom: "28px" }}>Dev: superadmin@hosanne.com / superadmin</p>

        {error && <div style={{ background: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "8px", padding: "12px", color: "#ff6b6b", fontSize: "0.85rem", marginBottom: "20px", textAlign: "left" }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "0.78rem", color: "#888", marginBottom: "6px", display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#666" }}><Mail size={15} /></span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="superadmin@hosanne.com"
                style={{ width: "100%", padding: "12px 16px 12px 42px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f5f5", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "0.78rem", color: "#888", marginBottom: "6px", display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#666" }}><Lock size={15} /></span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={{ width: "100%", padding: "12px 16px 12px 42px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f5f5", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{ marginTop: "8px", background: "linear-gradient(135deg, #D4AF37, #AA771C)", color: "#000", fontWeight: "700", fontSize: "0.9rem", padding: "14px", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.05em", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Connexion..." : "Acceder au SuperAdmin"}
          </button>
        </form>

        <button onClick={() => { window.history.pushState({}, "", "/"); window.dispatchEvent(new PopStateEvent("popstate")) }}
          style={{ background: "none", border: "none", color: "#666", fontSize: "0.82rem", cursor: "pointer", marginTop: "24px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <ChevronLeft size={14} /> Retour a la plateforme
        </button>
      </div>
    </div>
  )
}
