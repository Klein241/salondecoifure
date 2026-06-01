import React, { useState, useEffect } from "react"
import { getStoredData, setStoredData } from "../data"
import {
  supabase,
  getAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  getAffiliateByEmail,
  saveAffiliate,
  getReviews,
  createReview
} from "../supabase"
import {
  User,
  Calendar,
  Award,
  Trash2,
  Copy,
  CheckCircle,
  Star,
  Save,
  Clock,
  MessageSquare,
  Sparkles,
  Gift,
  CreditCard,
  Lock,
  ChevronRight,
  Shield,
  Phone,
  Mail,
  ChevronDown
} from "lucide-react"

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

  // Tab Navigation
  const [activeTab, setActiveTab] = useState("appointments");
  const [reviews, setReviews] = useState([]);

  // Profile Edit
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reschedule
  const [reschedulingAppId, setReschedulingAppId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // Review
  const [reviewingApp, setReviewingApp] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    const apps = await getAppointments();
    const userApps = apps.filter(app => app.clientEmail.toLowerCase() === currentUser.email.toLowerCase());
    setAppointments(userApps.sort((a, b) => new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time)));

    let userAff = await getAffiliateByEmail(currentUser.email);
    if (!userAff) {
      const code = currentUser.name.split(" ")[0].toUpperCase() + Math.floor(100 + Math.random() * 900);
      userAff = {
        code,
        clientName: currentUser.name,
        clientEmail: currentUser.email,
        pointsEarned: 100,
        totalReferrals: 0
      };
      await saveAffiliate(userAff);
    }
    setAffiliate(userAff);

    setProfileName(currentUser.name);
    setProfilePhone(currentUser.phone || "");

    const allReviews = await getReviews();
    setReviews(allReviews || []);
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
          email, password,
          options: { data: { name, phone, role: "client" } }
        });
        if (error) { setMessage({ text: error.message, type: "error" }); return; }

        const code = name.split(" ")[0].toUpperCase() + Math.floor(100 + Math.random() * 900);
        await saveAffiliate({ code, clientName: name, clientEmail: email, pointsEarned: 100, totalReferrals: 0 });

        setMessage({ text: "Inscription réussie ! Vous êtes connecté.", type: "success" });
        if (data.user) {
          onLoginSuccess({ id: data.user.id, name, email, phone, role: "client" });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
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
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
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
      const users = getStoredData("users", [
        { name: "Admin Alpha", email: "admin@alpha.com", password: "admin", role: "admin", phone: "077004073" }
      ]);
      if (isRegistering) {
        if (!name || !phone) { setMessage({ text: "Veuillez remplir le nom et le téléphone.", type: "error" }); return; }
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          setMessage({ text: "Cet email est déjà enregistré.", type: "error" }); return;
        }
        const newUser = { name, email, password, phone, role: "client" };
        users.push(newUser);
        setStoredData("users", users);
        onLoginSuccess(newUser);
        setMessage({ text: "Inscription réussie !", type: "success" });
      } else {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) { onLoginSuccess(user); setMessage({ text: "Connexion réussie !", type: "success" }); }
        else { setMessage({ text: "Email ou mot de passe incorrect.", type: "error" }); }
      }
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) return;
    await updateAppointmentStatus(id, "Annulé");
    setMessage({ text: "Rendez-vous annulé avec succès.", type: "success" });
    await loadUserData();
  };

  const handleReschedule = async (e, appId) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      setMessage({ text: "Veuillez choisir une date et une heure.", type: "error" }); return;
    }
    await rescheduleAppointment(appId, rescheduleDate, rescheduleTime);
    setMessage({ text: "Rendez-vous déplacé avec succès !", type: "success" });
    setReschedulingAppId(null);
    setRescheduleDate("");
    setRescheduleTime("");
    await loadUserData();
  };

  const handleLeaveReview = async (e) => {
    e.preventDefault();
    if (!reviewingApp) return;
    const reviewObj = {
      appointmentId: reviewingApp.id,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split("T")[0]
    };
    await createReview(reviewObj);
    setMessage({ text: "Merci pour votre avis !", type: "success" });
    setReviewingApp(null);
    setReviewComment("");
    setReviewRating(5);
    await loadUserData();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName || !profilePhone) {
      setMessage({ text: "Veuillez remplir tous les champs obligatoires.", type: "error" }); return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: "Le nouveau mot de passe et sa confirmation ne correspondent pas.", type: "error" }); return;
    }

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (newPassword) {
            const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
            if (pwdError) throw pwdError;
          }
          await supabase.auth.updateUser({ data: { name: profileName, phone: profilePhone } });
          await supabase.from("profiles").update({ name: profileName, phone: profilePhone }).eq("id", user.id);
        }
      } catch (err) {
        console.error("Error updating profile in Supabase:", err);
        setMessage({ text: "Erreur : " + err.message, type: "error" }); return;
      }
    }

    const users = getStoredData("users", []);
    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
        let updated = { ...u, name: profileName, phone: profilePhone };
        if (newPassword) updated.password = newPassword;
        return updated;
      }
      return u;
    });
    setStoredData("users", updatedUsers);

    onLoginSuccess({ ...currentUser, name: profileName, phone: profilePhone });
    setNewPassword("");
    setConfirmPassword("");
    setMessage({ text: "Profil mis à jour avec succès !", type: "success" });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/reservation?ref=${affiliate?.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmé": case "confirmed": return "#10B981"; // Green
      case "Annulé": case "cancelled": return "#EF4444"; // Red
      default: return "#F59E0B"; // Gold/Yellow
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Confirmé": case "confirmed": return "Confirmé";
      case "Annulé": case "cancelled": return "Annulé";
      default: return "En attente";
    }
  };

  const inputStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    color: "#ffffff",
    padding: "12px 16px",
    fontSize: "0.9rem",
    outline: "none",
    transition: "all 0.2s ease",
    width: "100%",
  };

  // -------------------------------------------------------------
  // Loyalty Level Calculations
  // -------------------------------------------------------------
  const points = affiliate?.pointsEarned || 0;
  let tierName = "BRONZE";
  let tierColor = "#CD7F32"; // Bronze
  let cardGradient = "linear-gradient(135deg, #2D1A10 0%, #120905 100%)";
  let nextTierPoints = 300;
  let cardBadgeText = "Membre Bronze";

  if (points >= 1000) {
    tierName = "PLATINE";
    tierColor = "#E5E4E2"; // Platinum
    cardGradient = "linear-gradient(135deg, #1C1D21 0%, #070809 100%)";
    nextTierPoints = 1000;
    cardBadgeText = "Ambassadeur Platine";
  } else if (points >= 800) {
    tierName = "OR";
    tierColor = "#D4AF37"; // Gold
    cardGradient = "linear-gradient(135deg, #3A2E12 0%, #151004 100%)";
    nextTierPoints = 1000;
    cardBadgeText = "Client Privilège Or";
  } else if (points >= 500) {
    tierName = "ARGENT";
    tierColor = "#C0C0C0"; // Silver
    cardGradient = "linear-gradient(135deg, #2B303A 0%, #0F1217 100%)";
    nextTierPoints = 800;
    cardBadgeText = "Membre Argent";
  } else if (points >= 300) {
    tierName = "BRONZE PLUS";
    tierColor = "#CD7F32";
    cardGradient = "linear-gradient(135deg, #3D2316 0%, #1A0E08 100%)";
    nextTierPoints = 500;
    cardBadgeText = "Membre Bronze Plus";
  }

  // Next appointment countdown details
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingApps = appointments.filter(app => app.date >= todayStr && app.status !== "Annulé" && app.status !== "cancelled");
  const nextApp = upcomingApps.length > 0 ? upcomingApps[upcomingApps.length - 1] : null; // Sorted descending, so last is nearest in future

  // Stats calculation
  const totalCompletedApps = appointments.filter(app => {
    const isPast = app.date < todayStr;
    return (app.status === "Confirmé" || app.status === "confirmed") && isPast;
  }).length;

  if (!currentUser) {
    return (
      <section id="portal" style={{ padding: "120px 24px", background: "radial-gradient(circle at center, #181818 0%, #0b0b0b 100%)", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-panel scale-in" style={{ maxWidth: "460px", width: "100%", padding: "40px", border: "1px solid rgba(212,175,55,0.15)", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
          
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--primary-gold)" }}>
              <User size={24} />
            </div>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600" }}>
              Espace Personnel
            </span>
            <h2 style={{ fontSize: "1.8rem", marginTop: "6px", fontFamily: "var(--font-serif)" }} className="gold-text">
              {isRegistering ? "Créer un Compte" : "Connexion"}
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "8px" }}>
              {isRegistering ? "Créez votre profil pour réserver plus rapidement et suivre vos cadeaux de fidélité." : "Accédez à vos rendez-vous, vos parrainages et vos récompenses de fidélité."}
            </p>
          </div>

          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isRegistering && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="auth-row-mobile">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Nom Complet :</label>
                  <input type="text" required placeholder="Marie-Claire" value={name} onChange={e => setName(e.target.value)} style={inputStyle} className="premium-input" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Téléphone :</label>
                  <input type="tel" required placeholder="077004073" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} className="premium-input" />
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Adresse Email :</label>
              <input type="email" required placeholder="nom@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} className="premium-input" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Mot de Passe :</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} className="premium-input" />
            </div>

            {message.text && (
              <div style={{ padding: "10px", borderRadius: "6px", background: message.type === "error" ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)", border: `1px solid ${message.type === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`, color: message.type === "error" ? "#ff6b6b" : "#34d399", fontSize: "0.85rem", textAlign: "center" }}>
                {message.text}
              </div>
            )}

            <button type="submit" className="btn-gold" style={{ marginTop: "8px", padding: "14px", fontWeight: "600", width: "100%", justifyContent: "center", display: "flex", gap: "8px" }}>
              <span>{isRegistering ? "Créer mon compte" : "Se Connecter"}</span>
              <ChevronRight size={16} />
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "24px", color: "var(--text-secondary)" }}>
            {isRegistering ? "Déjà un compte ?" : "Pas encore de compte ?"}&nbsp;
            <button
              onClick={() => { setIsRegistering(!isRegistering); setMessage({ text: "", type: "" }); }}
              style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer", fontWeight: "600", textDecoration: "underline", outline: "none" }}
            >
              {isRegistering ? "Se connecter" : "S'inscrire gratuitement"}
            </button>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="portal" style={{ padding: "120px 24px 80px", background: "#0b0b0b", minHeight: "90vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Premium Dashboard Header & Virtual Card layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px", marginBottom: "40px" }} className="portal-header-grid">
          
          {/* Welcome Info & Bio */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600", display: "block", marginBottom: "6px" }}>
              Votre Espace Personnel
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontFamily: "var(--font-serif)", marginBottom: "16px" }}>
              Ravi de vous revoir, <br />
              <span className="gold-text">{currentUser.name}</span>
            </h1>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                <Mail size={14} style={{ color: "var(--primary-gold)" }} />
                <span>{currentUser.email}</span>
              </div>
              {currentUser.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  <Phone size={14} style={{ color: "var(--primary-gold)" }} />
                  <span>{currentUser.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Virtual Loyalty Pass Card */}
          <div style={{ display: "flex", justifyContent: "flex-end" }} className="portal-card-container">
            <div className="loyalty-card" style={{
              background: cardGradient,
              border: `1px solid rgba(255,255,255,0.08)`,
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Golden Chip Effect */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div style={{
                  width: "42px",
                  height: "30px",
                  background: "linear-gradient(135deg, #e5c060 0%, #aa771c 100%)",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "inset 0 1px 3px rgba(255,255,255,0.3)",
                  position: "relative"
                }}>
                  <div style={{ position: "absolute", top: "50%", left: "0", right: "0", height: "1px", background: "rgba(0,0,0,0.15)" }} />
                  <div style={{ position: "absolute", left: "50%", top: "0", bottom: "0", width: "1px", background: "rgba(0,0,0,0.15)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>THE ALPHA BEAUTY</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: tierColor, letterSpacing: "0.05em", marginTop: "2px" }}>{tierName} MEMBER</span>
                </div>
              </div>

              {/* Points display */}
              <div style={{ marginBottom: "25px" }}>
                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Solde Fidélité</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
                  <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "#ffffff", fontFamily: "var(--font-serif)" }}>{points}</span>
                  <span style={{ fontSize: "0.9rem", color: "var(--primary-gold)", fontWeight: "600" }}>points</span>
                </div>
              </div>

              {/* Footer of the card */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", display: "block" }}>Titulaire</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ffffff", letterSpacing: "0.02em" }}>{currentUser.name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", display: "block" }}>Code Unique</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary-gold)", letterSpacing: "0.05em" }}>{affiliate?.code}</span>
                </div>
              </div>

              {/* Holographic glowing orb background element */}
              <div style={{
                position: "absolute",
                bottom: "-40px",
                right: "-40px",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${tierColor}15 0%, transparent 70%)`,
                filter: "blur(10px)",
                pointerEvents: "none"
              }} />
              <div className="card-shine" />
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className="glass-panel slide-up" style={{ padding: "16px", borderColor: message.type === "error" ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)", background: message.type === "error" ? "rgba(239, 68, 68, 0.05)" : "rgba(16, 185, 129, 0.05)", color: message.type === "error" ? "#f87171" : "#34d399", borderRadius: "8px", marginBottom: "30px", textAlign: "center" }}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "35px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px", overflowX: "auto", position: "sticky", top: "70px", zIndex: 90, background: "#0b0b0b" }}>
          {[
            { id: "appointments", label: "Mes Rendez-vous", icon: Calendar },
            { id: "profile", label: "Mon Profil", icon: User },
            { id: "referral", label: "Parrainage & Fidélité", icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage({ text: "", type: "" }); }}
              style={{
                background: activeTab === tab.id ? "rgba(212,175,55,0.08)" : "none",
                border: "none",
                color: activeTab === tab.id ? "var(--primary-gold)" : "var(--text-secondary)",
                fontWeight: "600",
                fontSize: "0.92rem",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: MES RENDEZ-VOUS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "appointments" && (
          <div className="slide-up">
            
            {/* Quick stats micro-dashboard */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "30px" }} className="portal-stats-row">
              <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "6px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Soin(s) complété(s)</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ffffff" }}>{totalCompletedApps}</span>
              </div>
              <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "6px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Statut de fidélité</span>
                <span style={{ fontSize: "1.1rem", fontWeight: "700", color: tierColor, display: "flex", alignItems: "center", gap: "6px", height: "100%" }}>
                  <Award size={16} /> {tierName}
                </span>
              </div>
              <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "6px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Prochain Soin</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "600", color: nextApp ? "var(--primary-gold)" : "var(--text-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {nextApp ? `${nextApp.date} à ${nextApp.time}` : "Aucun de prévu"}
                </span>
              </div>
            </div>

            {/* Pulsing Next Appointment Alert */}
            {nextApp && (
              <div className="glass-panel pulse-glow-gold" style={{ padding: "20px", border: "1px solid rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.03)", borderRadius: "8px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "var(--primary-gold)", letterSpacing: "0.08em", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "6px", height: "6px", background: "var(--primary-gold)", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
                    Votre Prochain Soin Arrive
                  </span>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#ffffff", marginTop: "4px" }}>
                    {nextApp.serviceName} avec {nextApp.staffName}
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Le {new Date(nextApp.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {nextApp.time}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById("app-" + nextApp.id);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="btn-outline"
                  style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                >
                  Gérer la réservation
                </button>
              </div>
            )}

            <h3 style={{ fontSize: "1.2rem", color: "#ffffff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} style={{ color: "var(--primary-gold)" }} />
              <span>Historique des Réservations</span>
            </h3>

            {appointments.length === 0 ? (
              <div className="glass-panel" style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Calendar size={36} style={{ opacity: 0.3 }} />
                <p>Vous n'avez pas encore effectué de réservation chez nous.</p>
                <button onClick={() => window.history.pushState({}, "", "/reservation")} className="btn-gold" style={{ fontSize: "0.8rem", padding: "10px 20px", marginTop: "8px" }}>
                  Prendre Rendez-vous
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {appointments.map(app => {
                  const isPast = app.date < todayStr;
                  const isCompleted = (app.status === "Confirmé" || app.status === "confirmed") && isPast;
                  const appReview = reviews.find(r => r.appointmentId === app.id);
                  const canCancel = (app.status === "En attente" || app.status === "pending") && !isPast;
                  const canReschedule = (app.status === "En attente" || app.status === "pending" || app.status === "Confirmé" || app.status === "confirmed") && !isPast;

                  return (
                    <div
                      key={app.id}
                      id={"app-" + app.id}
                      className="glass-panel app-item-card"
                      style={{
                        padding: "24px",
                        border: "1px solid " + (app.status === "cancelled" || app.status === "Annulé" ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.05)"),
                        background: app.status === "cancelled" || app.status === "Annulé" ? "rgba(239,68,68,0.01)" : "rgba(255,255,255,0.01)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                      }}
                    >
                      {/* Top line: Service and status */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#ffffff" }}>{app.serviceName}</h4>
                            <span style={{ fontSize: "0.68rem", padding: "4px 10px", borderRadius: "20px", background: getStatusColor(app.status) + "12", color: getStatusColor(app.status), fontWeight: "700", border: `1px solid ${getStatusColor(app.status)}25` }}>
                              {getStatusText(app.status)}
                            </span>
                            {app.rescheduled && (
                              <span style={{ fontSize: "0.68rem", padding: "3px 8px", borderRadius: "20px", background: "rgba(59,130,246,0.1)", color: "#60a5fa", fontWeight: "600", border: "1px solid rgba(59,130,246,0.15)" }}>
                                Reporté
                              </span>
                            )}
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginTop: "12px" }} className="app-card-details">
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                              <Calendar size={14} style={{ color: "var(--primary-gold)" }} />
                              <span>{new Date(app.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" })} à {app.time}</span>
                            </p>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                              <User size={14} style={{ color: "var(--primary-gold)" }} />
                              <span>Praticien : {app.staffName}</span>
                            </p>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: "700", color: "var(--primary-gold)", fontSize: "1.2rem", display: "block" }}>
                            {app.price.toLocaleString("fr-FR")} F
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>ID: {app.id}</span>
                        </div>
                      </div>

                      {/* Reschedule action form */}
                      {reschedulingAppId === app.id && (
                        <form onSubmit={e => handleReschedule(e, app.id)} className="slide-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "flex-end", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Nouvelle Date :</label>
                            <input type="date" required min={getMinDate()} value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} style={{ ...inputStyle, padding: "8px 12px" }} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Créneau Horaire :</label>
                            <select required value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} style={{ ...inputStyle, padding: "8px 12px" }}>
                              <option value="">Sélectionnez l'heure</option>
                              {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button type="submit" className="btn-gold" style={{ padding: "10px 18px", fontSize: "0.8rem", height: "38px" }}>Confirmer</button>
                            <button type="button" onClick={() => setReschedulingAppId(null)} className="btn-outline" style={{ padding: "10px 18px", fontSize: "0.8rem", height: "38px" }}>Annuler</button>
                          </div>
                        </form>
                      )}

                      {/* Card Footer Actions */}
                      {(canReschedule || canCancel || isCompleted) && (
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "14px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                          
                          {/* Reschedule / Cancel action buttons */}
                          {canReschedule && reschedulingAppId !== app.id && (
                            <button onClick={() => setReschedulingAppId(app.id)} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", padding: "8px 16px" }}>
                              <Clock size={14} /> Déplacer
                            </button>
                          )}
                          {canCancel && (
                            <button onClick={() => handleCancelAppointment(app.id)} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", padding: "8px 16px", background: "none", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                              <Trash2 size={14} /> Annuler
                            </button>
                          )}

                          {/* Completed reviews flow */}
                          {isCompleted && (
                            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                              {appReview ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ display: "flex", gap: "2px" }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star key={star} size={14} style={{ fill: star <= appReview.rating ? "var(--primary-gold)" : "none", color: "var(--primary-gold)" }} />
                                    ))}
                                  </div>
                                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                                    "{appReview.comment || "Pas de commentaire laissé."}"
                                  </span>
                                </div>
                              ) : (
                                <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                                  {reviewingApp?.id === app.id ? (
                                    <form onSubmit={handleLeaveReview} style={{ width: "100%", background: "rgba(255,255,255,0.01)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(212,175,55,0.15)", display: "flex", flexDirection: "column", gap: "12px" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Évaluez votre soin :</span>
                                        <div style={{ display: "flex", gap: "4px" }}>
                                          {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                              key={star}
                                              type="button"
                                              onMouseEnter={() => setHoverRating(star)}
                                              onMouseLeave={() => setHoverRating(0)}
                                              onClick={() => setReviewRating(star)}
                                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-gold)", padding: "2px" }}
                                            >
                                              <Star size={20} style={{ fill: star <= (hoverRating || reviewRating) ? "var(--primary-gold)" : "none" }} />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <textarea
                                        value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                        placeholder="Comment s'est passée votre visite chez nous ? Votre avis nous est précieux..."
                                        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#fff", padding: "10px 12px", outline: "none", fontSize: "0.85rem", minHeight: "60px", resize: "vertical", width: "100%" }}
                                      />
                                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                        <button type="submit" className="btn-gold" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>Soumettre</button>
                                        <button type="button" onClick={() => setReviewingApp(null)} className="btn-outline" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>Annuler</button>
                                      </div>
                                    </form>
                                  ) : (
                                    <button onClick={() => { setReviewingApp(app); setReviewRating(5); setReviewComment(""); }} className="btn-gold" style={{ padding: "8px 16px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                      <MessageSquare size={14} /> Laisser un avis
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: MON PROFIL */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "profile" && (
          <div className="slide-up" style={{ display: "flex", justifyContent: "center" }}>
            <form onSubmit={handleUpdateProfile} className="glass-panel" style={{ maxWidth: "600px", width: "100%", padding: "32px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <User size={20} style={{ color: "var(--primary-gold)" }} />
                <h3 className="gold-text" style={{ fontSize: "1.3rem" }}>Modifier mes informations</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="profile-row-mobile">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Nom Complet :</label>
                  <input type="text" required value={profileName} onChange={e => setProfileName(e.target.value)} style={inputStyle} className="premium-input" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Téléphone :</label>
                  <input type="tel" required value={profilePhone} onChange={e => setProfilePhone(e.target.value)} style={inputStyle} className="premium-input" />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Adresse Email (non modifiable) :</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                  <input type="email" readOnly value={currentUser.email} style={{ ...inputStyle, paddingLeft: "42px", color: "rgba(255,255,255,0.4)", cursor: "not-allowed", opacity: 0.6 }} />
                </div>
              </div>

              <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "10px 0" }} />
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Lock size={18} style={{ color: "var(--primary-gold)" }} />
                <h4 className="gold-text" style={{ fontSize: "1.1rem" }}>Changer le mot de passe</h4>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="profile-row-mobile">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Nouveau mot de passe :</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Laisser vide" style={inputStyle} className="premium-input" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Confirmer le mot de passe :</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Laisser vide" style={inputStyle} className="premium-input" />
                </div>
              </div>

              <button type="submit" className="btn-gold" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px", padding: "14px", fontWeight: "600" }}>
                <Save size={16} /> Enregistrer les modifications
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: PARRAINAGE & FIDELITE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "referral" && (
          <div className="slide-up portal-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px" }}>

            {/* Left: Tiers & Progress */}
            <div>
              <h3 className="gold-text" style={{ fontSize: "1.2rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={18} />
                <span>Statut et Paliers de Progression</span>
              </h3>
              <div className="glass-panel" style={{ padding: "30px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "24px" }}>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Progression vers le prochain statut</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--primary-gold)" }}>{points} / {nextTierPoints} pts</span>
                  </div>
                  <div style={{ width: "100%", height: "10px", background: "rgba(255,255,255,0.04)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ width: Math.min(100, (points / nextTierPoints) * 100) + "%", height: "100%", background: "linear-gradient(90deg, var(--primary-gold), #fff)", borderRadius: "6px", transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h4 style={{ fontSize: "1rem", color: "#ffffff", marginBottom: "4px" }}>Paliers cadeaux déblocables :</h4>
                  {[
                    { pts: 300, desc: "Soin visage express offert", icon: Sparkles },
                    { pts: 500, desc: "Shampooing & brushing gratuit", icon: Gift },
                    { pts: 800, desc: "Coupe & coiffage signature", icon: Award },
                    { pts: 1000, desc: "Soin rituel premium complet", icon: Award }
                  ].map((tier, idx) => {
                    const reached = points >= tier.pts;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 18px",
                          borderRadius: "8px",
                          background: reached ? "rgba(212,175,55,0.05)" : "rgba(255,255,255,0.01)",
                          border: reached ? "1px solid rgba(212,175,55,0.2)" : "1px solid rgba(255,255,255,0.03)",
                          transition: "all 0.3s"
                        }}
                        className={reached ? "active-tier-row" : ""}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div style={{ color: reached ? "var(--primary-gold)" : "rgba(255,255,255,0.3)" }}>
                            <tier.icon size={20} />
                          </div>
                          <div>
                            <p style={{ fontSize: "0.9rem", fontWeight: reached ? "600" : "500", color: reached ? "#ffffff" : "var(--text-secondary)" }}>{tier.desc}</p>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Requis : {tier.pts} points</span>
                          </div>
                        </div>
                        {reached ? (
                          <span style={{ fontSize: "0.8rem", color: "var(--primary-gold)", fontWeight: "700" }}>Débloqué !</span>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>En cours</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Code & Stats */}
            <div>
              <h3 className="gold-text" style={{ fontSize: "1.2rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Gift size={18} />
                <span>Inviter des proches</span>
              </h3>
              <div className="glass-panel" style={{ padding: "30px", border: "1px solid rgba(212,175,55,0.15)", display: "flex", flexDirection: "column", gap: "20px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  Devenez ambassadeur de The Alpha Beauty. Vos proches bénéficient de <strong>-10%</strong> sur leur premier soin grâce à votre code, et vous remportez <strong>100 points</strong> par parrainage validé !
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Votre code de parrainage :</label>
                  <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", padding: "14px", textAlign: "center", fontSize: "1.4rem", fontWeight: "800", color: "var(--primary-gold)", letterSpacing: "0.1em" }}>
                    {affiliate?.code}
                  </div>
                </div>

                <button onClick={handleCopyLink} className="btn-outline" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "0.88rem", padding: "12px" }}>
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  <span>{copied ? "Lien copié !" : "Copier le lien d'invitation"}</span>
                </button>

                <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "8px 0" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", textAlign: "center" }}>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "14px", borderRadius: "8px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Amis Parrainés</span>
                    <h4 style={{ fontSize: "1.4rem", marginTop: "6px", color: "#ffffff", fontWeight: "700" }}>{affiliate?.totalReferrals || 0}</h4>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "14px", borderRadius: "8px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Cumul Cadeaux</span>
                    <h4 style={{ fontSize: "1.4rem", marginTop: "6px", color: "var(--primary-gold)", fontWeight: "700" }}>
                      {Math.floor(points / 300)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        /* Smooth Entrance Animations */
        .scale-in {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Premium Loyalty Pass styling */
        .loyalty-card {
          width: 100%;
          max-width: 380px;
          aspect-ratio: 1.586;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .loyalty-card:hover {
          transform: translateY(-5px) rotate(1deg);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
        }
        .card-shine {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.03) 100%);
          pointer-events: none;
        }

        /* Hover animations for cards and lists */
        .app-item-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .app-item-card:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 175, 55, 0.22) !important;
          box-shadow: 0 10px 24px rgba(0,0,0,0.3);
        }
        
        .active-tier-row {
          box-shadow: 0 4px 12px rgba(212,175,55,0.05);
        }

        .premium-input:focus {
          border-color: var(--primary-gold) !important;
          box-shadow: 0 0 0 1px rgba(212,175,55,0.2) !important;
        }

        /* Pulse glow animation */
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        
        .pulse-glow-gold {
          box-shadow: 0 4px 15px rgba(212,175,55,0.03);
          transition: all 0.3s;
        }
        .pulse-glow-gold:hover {
          box-shadow: 0 6px 20px rgba(212,175,55,0.08);
          border-color: var(--primary-gold) !important;
        }

        @media (max-width: 900px) {
          .portal-header-grid {
            grid-template-columns: 1fr !important;
            gap: 24px;
            text-align: center;
          }
          .portal-header-grid > div {
            align-items: center !important;
            justify-content: center !important;
          }
          .portal-card-container {
            justify-content: center !important;
          }
        }

        @media (max-width: 768px) {
          .portal-grid {
            grid-template-columns: 1fr !important;
          }
          .auth-row-mobile, .profile-row-mobile {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .portal-stats-row {
            grid-template-columns: 1fr !important;
          }
          .app-card-details {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
          }
        }
      `}</style>
    </section>
  );
}
