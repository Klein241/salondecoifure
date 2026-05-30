import React, { useState, useEffect } from "react"
import { getStoredData, setStoredData } from "../data"
import { supabase, getAppointments, updateAppointmentStatus, getAffiliateByEmail, saveAffiliate, createReview } from "../supabase"
import { User, Calendar, Award, Trash2, Copy, CheckCircle } from "lucide-react"

export default function Portal({ currentUser, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [affiliate, setAffiliate] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    // Load appointments for this user
    const apps = await getAppointments();
    const userApps = apps.filter(app => app.clientEmail.toLowerCase() === currentUser.email.toLowerCase());
    setAppointments(userApps);

    // Load affiliate information for this user
    let userAff = await getAffiliateByEmail(currentUser.email);
    
    if (!userAff) {
      // Auto-generate affiliate code for new client
      const code = currentUser.name.split(" ")[0].toUpperCase() + Math.floor(100 + Math.random() * 900);
      userAff = {
        code,
        clientName: currentUser.name,
        clientEmail: currentUser.email,
        pointsEarned: 100, // starting gift points
        totalReferrals: 0
      };
      await saveAffiliate(userAff);
    }
    
    setAffiliate(userAff);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ text: "Veuillez remplir tous les champs.", type: "error" });
      return;
    }

    if (supabase) {
      if (isRegistering) {
        if (!name || !phone) {
          setMessage({ text: "Veuillez remplir le nom et le téléphone.", type: "error" });
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, phone, role: "client" }
          }
        });
        if (error) {
          setMessage({ text: error.message, type: "error" });
          return;
        }
        
        // Auto-generate affiliate code in affiliates table
        const code = name.split(" ")[0].toUpperCase() + Math.floor(100 + Math.random() * 900);
        await saveAffiliate({
          code,
          clientName: name,
          clientEmail: email,
          pointsEarned: 100,
          totalReferrals: 0
        });

        setMessage({ text: "Inscription réussie ! Vous êtes connecté.", type: "success" });
        if (data.user) {
          onLoginSuccess({
            id: data.user.id,
            name,
            email,
            phone,
            role: "client"
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          // Check local fallback just in case
          const users = getStoredData("users", [
            { name: "Admin Alpha", email: "admin@alpha.com", password: "admin", role: "admin", phone: "077004073" }
          ]);
          const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
          if (user) {
            onLoginSuccess(user);
            setMessage({ text: "Connexion réussie (Local fallback) !", type: "success" });
          } else {
            setMessage({ text: "Email ou mot de passe incorrect.", type: "error" });
          }
          return;
        }
        
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile) {
          onLoginSuccess(profile);
        } else {
          onLoginSuccess({
            id: data.user.id,
            name: data.user.user_metadata?.name || "Client",
            email: data.user.email,
            phone: data.user.user_metadata?.phone || "",
            role: data.user.user_metadata?.role || "client"
          });
        }
        setMessage({ text: "Connexion réussie !", type: "success" });
      }
    } else {
      // Local fallback auth
      const users = getStoredData("users", [
        { name: "Admin Alpha", email: "admin@alpha.com", password: "admin", role: "admin", phone: "077004073" }
      ]);

      if (isRegistering) {
        if (!name || !phone) {
          setMessage({ text: "Veuillez remplir le nom et le téléphone.", type: "error" });
          return;
        }
        const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          setMessage({ text: "Cet email est déjà enregistré.", type: "error" });
          return;
        }
        
        const newUser = { name, email, password, phone, role: "client" };
        users.push(newUser);
        setStoredData("users", users);
        
        onLoginSuccess(newUser);
        setMessage({ text: "Inscription réussie !", type: "success" });
      } else {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
          onLoginSuccess(user);
          setMessage({ text: "Connexion réussie !", type: "success" });
        } else {
          setMessage({ text: "Email ou mot de passe incorrect.", type: "error" });
        }
      }
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) return;

    await updateAppointmentStatus(id, "Annulé");
    setMessage({ text: "Rendez-vous annulé avec succès.", type: "success" });
    await loadUserData();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}?ref=${affiliate?.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmé":
      case "confirmed": return "#228B22";
      case "Annulé":
      case "cancelled": return "#B22222";
      default: return "var(--primary-gold)";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Confirmé":
      case "confirmed": return "Confirmé";
      case "Annulé":
      case "cancelled": return "Annulé";
      default: return "En attente";
    }
  };

  if (!currentUser) {
    return (
      <section
        id="portal"
        style={{
          padding: "100px 24px",
          background: "#0b0b0b",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="glass-panel" style={{ maxWidth: "450px", width: "100%", padding: "40px", border: "1px solid rgba(212,175,55,0.15)" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: "8px" }} className="gold-text">
            {isRegistering ? "Créer un Compte" : "Espace Client"}
          </h2>
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "30px" }}>
            {isRegistering ? "Inscrivez-vous pour gérer vos rendez-vous et vos récompenses." : "Connectez-vous pour accéder à vos rendez-vous et parrainages."}
          </p>

          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {isRegistering && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Nom Complet :</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "4px",
                      color: "var(--text-primary)",
                      padding: "10px",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Téléphone :</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 077004073"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "4px",
                      color: "var(--text-primary)",
                      padding: "10px",
                      outline: "none",
                    }}
                  />
                </div>
              </>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Adresse Email :</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "4px",
                  color: "var(--text-primary)",
                  padding: "10px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Mot de Passe :</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "4px",
                  color: "var(--text-primary)",
                  padding: "10px",
                  outline: "none",
                }}
              />
            </div>

            {message.text && (
              <p style={{ color: message.type === "error" ? "#FF4500" : "#228B22", fontSize: "0.85rem", textAlign: "center" }}>
                {message.text}
              </p>
            )}

            <button type="submit" className="btn-gold" style={{ marginTop: "10px" }}>
              {isRegistering ? "Créer mon compte" : "Se Connecter"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "24px", color: "var(--text-secondary)" }}>
            {isRegistering ? "Déjà un compte ?" : "Pas encore de compte ?"} &nbsp;
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setMessage({ text: "", type: "" });
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary-gold)",
                cursor: "pointer",
                fontWeight: "600",
                textDecoration: "underline",
              }}
            >
              {isRegistering ? "Se connecter" : "S'inscrire"}
            </button>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="portal"
      style={{
        padding: "100px 24px",
        background: "#0b0b0b",
        minHeight: "80vh",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Welcome Banner */}
        <div
          className="glass-panel"
          style={{
            padding: "32px",
            border: "1px solid rgba(212,175,55,0.2)",
            marginBottom: "40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "6px" }}>
              Bienvenue, <span className="gold-text">{currentUser.name}</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Email : {currentUser.email} • Mobile : {currentUser.phone}
            </p>
          </div>

          {/* Loyalty points card */}
          <div
            style={{
              background: "rgba(212,175,55,0.06)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "8px",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(212,175,55,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-gold)",
              }}
            >
              <Award size={24} />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
                Points de Fidélité
              </span>
              <h3 style={{ fontSize: "1.6rem", color: "var(--primary-gold)" }}>{affiliate?.pointsEarned || 0} pts</h3>
            </div>
          </div>
        </div>

        {message.text && (
          <div
            className="glass-panel"
            style={{
              padding: "16px",
              borderColor: message.type === "error" ? "rgba(178,34,34,0.3)" : "rgba(34,139,34,0.3)",
              background: message.type === "error" ? "rgba(178,34,34,0.05)" : "rgba(34,139,34,0.05)",
              color: message.type === "error" ? "#FF4500" : "#228B22",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            {message.text}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px" }} className="portal-grid">
          
          {/* Left Column: Appointments */}
          <div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
              Vos rendez-vous
            </h3>

            {appointments.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                Vous n'avez aucun rendez-vous pour le moment.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {appointments.map((app) => (
                  <div
                    key={app.id}
                    className="glass-panel"
                    style={{
                      padding: "20px",
                      border: `1px solid ${app.status === "cancelled" ? "rgba(178,34,34,0.15)" : "rgba(212,175,55,0.1)"}`,
                      background: app.status === "cancelled" ? "rgba(178,34,34,0.02)" : "rgba(255, 255, 255, 0.01)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "1rem", fontWeight: "600" }}>{app.serviceName}</span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            background: getStatusColor(app.status) + "20",
                            color: getStatusColor(app.status),
                            fontWeight: "700",
                          }}
                        >
                          {getStatusText(app.status)}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={12} /> {app.date} à {app.time}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <User size={12} /> Praticien : {app.staffName}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <span style={{ fontWeight: "700", color: "var(--primary-gold)" }}>{app.price.toLocaleString("fr-FR")} F</span>
                      {app.status === "En attente" || app.status === "pending" && (
                        <button
                          onClick={() => handleCancelAppointment(app.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#FF4500",
                            cursor: "pointer",
                            padding: "6px",
                          }}
                          title="Annuler le rendez-vous"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Affiliate Program */}
          <div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
              Votre programme de parrainage
            </h3>

            <div
              className="glass-panel"
              style={{
                padding: "24px",
                border: "1px solid rgba(212,175,55,0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Partagez votre lien de parrainage avec vos proches. Ils bénéficient de <strong>-10%</strong> sur leur premier soin, et vous gagnez <strong>100 points</strong> de fidélité pour chaque parrainage validé !
              </p>

              {/* Code Box */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Votre code de parrainage :</label>
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: "4px",
                    padding: "12px",
                    textAlign: "center",
                    fontSize: "1.3rem",
                    fontWeight: "800",
                    color: "var(--primary-gold)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {affiliate?.code}
                </div>
              </div>

              {/* Share link button */}
              <button
                onClick={handleCopyLink}
                className="btn-outline"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "0.8rem",
                  padding: "10px",
                }}
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                <span>{copied ? "Lien copié !" : "Copier le lien d'invitation"}</span>
              </button>

              <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.08)" }} />

              {/* Affiliate Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "center" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "4px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Total Parrainages</span>
                  <h4 style={{ fontSize: "1.2rem", marginTop: "4px" }}>{affiliate?.totalReferrals || 0}</h4>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "4px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Paliers Cadeaux</span>
                  <h4 style={{ fontSize: "1.2rem", marginTop: "4px", color: "var(--primary-gold)" }}>
                    {Math.floor((affiliate?.pointsEarned || 0) / 500)} / 1
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .portal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
