import React, { useState } from "react"
import { supabase } from "../supabase"
import { getStoredData, setStoredData } from "../data"
import { Lock, Mail, ChevronLeft, Sparkles } from "lucide-react"

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (supabase) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          // Fallback to local storage admin
          const users = getStoredData("users", [
            { name: "Admin Alpha", email: "admin@alpha.com", password: "admin", role: "admin", phone: "077004073" }
          ]);
          const localUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
          if (localUser && localUser.role === "admin") {
            onLoginSuccess(localUser);
          } else {
            setError("Email ou mot de passe incorrect.");
          }
          setLoading(false);
          return;
        }

        // Fetch user profile to verify role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        const userObj = profile || {
          id: data.user.id,
          name: data.user.user_metadata?.name || "Admin",
          email: data.user.email,
          phone: data.user.user_metadata?.phone || "",
          role: data.user.user_metadata?.role || "client"
        };

        if (userObj.role === "admin") {
          onLoginSuccess(userObj);
        } else {
          // Logout because they are not admin
          await supabase.auth.signOut();
          setError("Accès refusé. Cet espace est réservé aux administrateurs.");
        }
      } else {
        // Pure local fallback auth
        const users = getStoredData("users", [
          { name: "Admin Alpha", email: "admin@alpha.com", password: "admin", role: "admin", phone: "077004073" }
        ]);
        const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (matchedUser) {
          if (matchedUser.role === "admin") {
            onLoginSuccess(matchedUser);
          } else {
            setError("Accès refusé. Cet espace est réservé aux administrateurs.");
          }
        } else {
          setError("Email ou mot de passe incorrect.");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSite = () => {
    window.location.href = "/";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at center, #1a1a1a 0%, #0d0d0d 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      color: "var(--text-primary)"
    }}>
      <div className="glass-panel" style={{
        maxWidth: "420px",
        width: "100%",
        padding: "40px 32px",
        borderRadius: "12px",
        border: "1px solid rgba(212, 175, 55, 0.15)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
        position: "relative",
        textAlign: "center"
      }}>
        
        {/* Decorative Gold Crown/Icon */}
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "rgba(212, 175, 55, 0.08)",
          border: "1px solid rgba(212, 175, 55, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          color: "var(--primary-gold)"
        }}>
          <Sparkles size={28} />
        </div>

        <span style={{
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--primary-gold)",
          fontWeight: "600"
        }}>
          The Alpha Beauty
        </span>
        <h2 style={{
          fontSize: "1.6rem",
          marginTop: "6px",
          marginBottom: "30px",
          fontWeight: "500",
          fontFamily: "'Playfair Display', serif"
        }}>
          Espace Administratif
        </h2>

        {error && (
          <div style={{
            background: "rgba(255, 69, 0, 0.08)",
            border: "1px solid rgba(255, 69, 0, 0.2)",
            borderRadius: "6px",
            padding: "12px",
            color: "#ff6b6b",
            fontSize: "0.85rem",
            marginBottom: "20px",
            textAlign: "left"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
              Adresse Email
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", display: "flex" }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@alpha.com"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                className="admin-input"
              />
            </div>
          </div>

          <div style={{ textAlign: "left", marginBottom: "8px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
              Mot de passe
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", display: "flex" }}>
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                className="admin-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, var(--primary-gold) 0%, #aa771c 100%)",
              color: "#000000",
              fontWeight: "600",
              fontSize: "0.9rem",
              padding: "14px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "transform 0.2s, opacity 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "10px"
            }}
            className="btn-gold"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <button
          onClick={handleBackToSite}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            cursor: "pointer",
            marginTop: "24px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.color = "var(--primary-gold)"}
          onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}
        >
          <ChevronLeft size={16} />
          Retour au site client
        </button>

      </div>

      <style>{`
        .admin-input:focus {
          border-color: var(--primary-gold) !important;
          box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.2);
        }
      `}</style>
    </div>
  );
}
