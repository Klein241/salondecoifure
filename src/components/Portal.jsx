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
  Gift
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
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    const apps = await getAppointments();
    const userApps = apps.filter(app => app.clientEmail.toLowerCase() === currentUser.email.toLowerCase());
    setAppointments(userApps);

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
          setMessage({ text: "Veuillez remplir le nom et le t\u00e9l\u00e9phone.", type: "error" });
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name, phone, role: "client" } }
        });
        if (error) { setMessage({ text: error.message, type: "error" }); return; }

        const code = name.split(" ")[0].toUpperCase() + Math.floor(100 + Math.random() * 900);
        await saveAffiliate({ code, clientName: name, clientEmail: email, pointsEarned: 100, totalReferrals: 0 });

        setMessage({ text: "Inscription r\u00e9ussie ! Vous \u00eates connect\u00e9.", type: "success" });
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
            setMessage({ text: "Connexion r\u00e9ussie (Local fallback) !", type: "success" });
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
        setMessage({ text: "Connexion r\u00e9ussie !", type: "success" });
      }
    } else {
      const users = getStoredData("users", [
        { name: "Admin Alpha", email: "admin@alpha.com", password: "admin", role: "admin", phone: "077004073" }
      ]);
      if (isRegistering) {
        if (!name || !phone) { setMessage({ text: "Veuillez remplir le nom et le t\u00e9l\u00e9phone.", type: "error" }); return; }
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          setMessage({ text: "Cet email est d\u00e9j\u00e0 enregistr\u00e9.", type: "error" }); return;
        }
        const newUser = { name, email, password, phone, role: "client" };
        users.push(newUser);
        setStoredData("users", users);
        onLoginSuccess(newUser);
        setMessage({ text: "Inscription r\u00e9ussie !", type: "success" });
      } else {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) { onLoginSuccess(user); setMessage({ text: "Connexion r\u00e9ussie !", type: "success" }); }
        else { setMessage({ text: "Email ou mot de passe incorrect.", type: "error" }); }
      }
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("\u00cates-vous s\u00fbr de vouloir annuler ce rendez-vous ?")) return;
    await updateAppointmentStatus(id, "Annul\u00e9");
    setMessage({ text: "Rendez-vous annul\u00e9 avec succ\u00e8s.", type: "success" });
    await loadUserData();
  };

  const handleReschedule = async (e, appId) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      setMessage({ text: "Veuillez choisir une date et une heure.", type: "error" }); return;
    }
    await rescheduleAppointment(appId, rescheduleDate, rescheduleTime);
    setMessage({ text: "Rendez-vous d\u00e9plac\u00e9 avec succ\u00e8s !", type: "success" });
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
    setMessage({ text: "Profil mis \u00e0 jour avec succ\u00e8s !", type: "success" });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}?ref=${affiliate?.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirm\u00e9": case "confirmed": return "#228B22";
      case "Annul\u00e9": case "cancelled": return "#B22222";
      default: return "var(--primary-gold)";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Confirm\u00e9": case "confirmed": return "Confirm\u00e9";
      case "Annul\u00e9": case "cancelled": return "Annul\u00e9";
      default: return "En attente";
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "4px",
    color: "var(--text-primary)",
    padding: "10px",
    outline: "none",
  };

  if (!currentUser) {
    return (
      <section id="portal" style={{ padding: "100px 24px", background: "#0b0b0b", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-panel" style={{ maxWidth: "450px", width: "100%", padding: "40px", border: "1px solid rgba(212,175,55,0.15)" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: "8px" }} className="gold-text">
            {isRegistering ? "Cr\u00e9er un Compte" : "Espace Client"}
          </h2>
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "30px" }}>
            {isRegistering ? "Inscrivez-vous pour g\u00e9rer vos rendez-vous et vos r\u00e9compenses." : "Connectez-vous pour acc\u00e9der \u00e0 vos rendez-vous et parrainages."}
          </p>

          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {isRegistering && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Nom Complet :</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>T\u00e9l\u00e9phone :</label>
                  <input type="tel" required placeholder="e.g. 077004073" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                </div>
              </>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Adresse Email :</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Mot de Passe :</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>

            {message.text && (
              <p style={{ color: message.type === "error" ? "#FF4500" : "#228B22", fontSize: "0.85rem", textAlign: "center" }}>{message.text}</p>
            )}

            <button type="submit" className="btn-gold" style={{ marginTop: "10px" }}>
              {isRegistering ? "Cr\u00e9er mon compte" : "Se Connecter"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "24px", color: "var(--text-secondary)" }}>
            {isRegistering ? "D\u00e9j\u00e0 un compte ?" : "Pas encore de compte ?"}&nbsp;
            <button
              onClick={() => { setIsRegistering(!isRegistering); setMessage({ text: "", type: "" }); }}
              style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
            >
              {isRegistering ? "Se connecter" : "S'inscrire"}
            </button>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="portal" style={{ padding: "100px 24px", background: "#0b0b0b", minHeight: "80vh" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Welcome Banner */}
        <div className="glass-panel" style={{ padding: "32px", border: "1px solid rgba(212,175,55,0.2)", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "6px" }}>
              Bienvenue, <span className="gold-text">{currentUser.name}</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Email : {currentUser.email} &bull; Mobile : {currentUser.phone}
            </p>
          </div>
          <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(212,175,55,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-gold)" }}>
              <Award size={24} />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>Points de Fid\u00e9lit\u00e9</span>
              <h3 style={{ fontSize: "1.6rem", color: "var(--primary-gold)" }}>{affiliate?.pointsEarned || 0} pts</h3>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className="glass-panel" style={{ padding: "16px", borderColor: message.type === "error" ? "rgba(178,34,34,0.3)" : "rgba(34,139,34,0.3)", background: message.type === "error" ? "rgba(178,34,34,0.05)" : "rgba(34,139,34,0.05)", color: message.type === "error" ? "#FF4500" : "#228B22", marginBottom: "24px", textAlign: "center" }}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px", overflowX: "auto" }}>
          {[
            { id: "appointments", label: "Mes Rendez-vous", icon: Calendar },
            { id: "profile", label: "Mon Profil", icon: User },
            { id: "referral", label: "Parrainage & Fid\u00e9lit\u00e9", icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage({ text: "", type: "" }); }}
              style={{
                background: "none",
                border: "none",
                color: activeTab === tab.id ? "var(--primary-gold)" : "var(--text-secondary)",
                fontWeight: "600",
                fontSize: "1rem",
                padding: "10px 16px",
                cursor: "pointer",
                borderBottom: activeTab === tab.id ? "2px solid var(--primary-gold)" : "2px solid transparent",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: MES RENDEZ-VOUS */}
        {activeTab === "appointments" && (
          <div>
            <h3 className="gold-text" style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Vos rendez-vous</h3>

            {appointments.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                Vous n'avez aucun rendez-vous pour le moment.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {appointments.map(app => {
                  const isPast = app.date < new Date().toISOString().split("T")[0];
                  const isCompleted = (app.status === "Confirm\u00e9" || app.status === "confirmed") && isPast;
                  const appReview = reviews.find(r => r.appointmentId === app.id);
                  const canCancel = app.status === "En attente" || app.status === "pending";
                  const canReschedule = (canCancel || app.status === "Confirm\u00e9" || app.status === "confirmed") && !isPast;

                  return (
                    <div key={app.id} className="glass-panel" style={{ padding: "20px", border: "1px solid " + (app.status === "cancelled" || app.status === "Annul\u00e9" ? "rgba(178,34,34,0.15)" : "rgba(212,175,55,0.1)"), background: app.status === "cancelled" || app.status === "Annul\u00e9" ? "rgba(178,34,34,0.02)" : "rgba(255,255,255,0.01)", display: "flex", flexDirection: "column", gap: "14px" }}>

                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <span style={{ fontSize: "1rem", fontWeight: "600" }}>{app.serviceName}</span>
                            <span style={{ fontSize: "0.7rem", padding: "3px 8px", borderRadius: "12px", background: getStatusColor(app.status) + "20", color: getStatusColor(app.status), fontWeight: "700" }}>
                              {getStatusText(app.status)}
                            </span>
                            {app.rescheduled && (
                              <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "8px", background: "rgba(100,149,237,0.15)", color: "#6495ED", fontWeight: "600" }}>D\u00e9plac\u00e9</span>
                            )}
                          </div>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={12} /> {app.date} \u00e0 {app.time}
                          </p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <User size={12} /> Praticien : {app.staffName}
                          </p>
                        </div>
                        <span style={{ fontWeight: "700", color: "var(--primary-gold)", fontSize: "1.1rem" }}>{app.price.toLocaleString("fr-FR")} F</span>
                      </div>

                      {/* Reschedule inline form */}
                      {reschedulingAppId === app.id && (
                        <form onSubmit={e => handleReschedule(e, app.id)} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "4px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Nouvelle Date :</label>
                            <input type="date" required value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "6px 10px", color: "#fff", fontSize: "0.85rem", outline: "none" }} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Nouvelle Heure :</label>
                            <input type="time" required value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "6px 10px", color: "#fff", fontSize: "0.85rem", outline: "none" }} />
                          </div>
                          <button type="submit" className="btn-gold" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>Valider</button>
                          <button type="button" onClick={() => setReschedulingAppId(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: "4px", padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer" }}>Annuler</button>
                        </form>
                      )}

                      {/* Action buttons */}
                      {reschedulingAppId !== app.id && (
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          {canReschedule && (
                            <button onClick={() => { setReschedulingAppId(app.id); setRescheduleDate(app.date); setRescheduleTime(app.time); }} className="btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Clock size={14} /> D\u00e9placer
                            </button>
                          )}
                          {canCancel && (
                            <button onClick={() => handleCancelAppointment(app.id)} style={{ background: "none", border: "1px solid rgba(255,69,0,0.2)", borderRadius: "4px", color: "#FF4500", padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Trash2 size={14} /> Annuler
                            </button>
                          )}
                        </div>
                      )}

                      {/* Review for completed past appointments */}
                      {isCompleted && (
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                          {appReview ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
                              <div style={{ display: "flex" }}>
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={14} fill={s <= appReview.rating ? "var(--primary-gold)" : "none"} color="var(--primary-gold)" />
                                ))}
                              </div>
                              <span style={{ color: "var(--text-secondary)" }}>
                                <em>"{appReview.comment || "Sans commentaire"}"</em>
                              </span>
                            </div>
                          ) : reviewingApp?.id === app.id ? (
                            <form onSubmit={handleLeaveReview} style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "6px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Votre note :</span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  {[1,2,3,4,5].map(s => (
                                    <button key={s} type="button" onClick={() => setReviewRating(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                                      <Star size={20} fill={s <= reviewRating ? "var(--primary-gold)" : "none"} color="var(--primary-gold)" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <textarea
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                                placeholder="Partagez votre exp\u00e9rience..."
                                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#fff", padding: "8px", outline: "none", fontSize: "0.85rem", minHeight: "50px", resize: "vertical" }}
                              />
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button type="submit" className="btn-gold" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>Soumettre</button>
                                <button type="button" onClick={() => setReviewingApp(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: "4px", padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer" }}>Annuler</button>
                              </div>
                            </form>
                          ) : (
                            <button onClick={() => { setReviewingApp(app); setReviewRating(5); setReviewComment(""); }} className="btn-gold" style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                              <MessageSquare size={14} /> Laisser un avis
                            </button>
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

        {/* TAB 2: MON PROFIL */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <form onSubmit={handleUpdateProfile} className="glass-panel" style={{ maxWidth: "600px", width: "100%", padding: "32px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 className="gold-text" style={{ fontSize: "1.3rem", marginBottom: "10px" }}>Modifier mes informations</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Nom Complet :</label>
                <input type="text" required value={profileName} onChange={e => setProfileName(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>T\u00e9l\u00e9phone :</label>
                <input type="tel" required value={profilePhone} onChange={e => setProfilePhone(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Adresse Email (non modifiable) :</label>
                <input type="email" readOnly value={currentUser.email} style={{ ...inputStyle, color: "var(--text-secondary)", cursor: "not-allowed", opacity: 0.6 }} />
              </div>

              <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "10px 0" }} />
              <h4 className="gold-text" style={{ fontSize: "1.1rem" }}>Changer le mot de passe</h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Nouveau mot de passe :</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Laisser vide pour ne pas modifier" style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Confirmer le nouveau mot de passe :</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Laisser vide pour ne pas modifier" style={inputStyle} />
              </div>

              <button type="submit" className="btn-gold" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px" }}>
                <Save size={16} /> Enregistrer les modifications
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: PARRAINAGE & FIDELITE */}
        {activeTab === "referral" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px" }} className="portal-grid">

            {/* Left: Tiers & Progress */}
            <div>
              <h3 className="gold-text" style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Votre Progression de Fid\u00e9lit\u00e9</h3>
              <div className="glass-panel" style={{ padding: "24px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "20px" }}>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Progression vers le prochain palier</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--primary-gold)" }}>{affiliate?.pointsEarned || 0} / 1000 pts</span>
                  </div>
                  <div style={{ width: "100%", height: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ width: Math.min(100, ((affiliate?.pointsEarned || 0) / 1000) * 100) + "%", height: "100%", background: "linear-gradient(90deg, var(--primary-gold), #fff)", borderRadius: "6px", transition: "width 0.5s ease" }} />
                  </div>
                </div>

                <h4 className="gold-text" style={{ fontSize: "1.1rem", marginTop: "10px" }}>Paliers de R\u00e9compenses</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { pts: 300, desc: "Soin visage express offert", icon: Sparkles },
                    { pts: 500, desc: "Shampooing & brushing gratuit", icon: Gift },
                    { pts: 800, desc: "Coupe & coiffage signature", icon: Award },
                    { pts: 1000, desc: "Soin rituel premium complet", icon: Award }
                  ].map((tier, idx) => {
                    const reached = (affiliate?.pointsEarned || 0) >= tier.pts;
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "6px", background: reached ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.02)", border: reached ? "1px solid rgba(212,175,55,0.25)" : "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ color: reached ? "var(--primary-gold)" : "var(--text-secondary)" }}>
                            <tier.icon size={20} />
                          </div>
                          <div>
                            <p style={{ fontSize: "0.9rem", fontWeight: reached ? "700" : "500", color: reached ? "var(--text-primary)" : "var(--text-secondary)" }}>{tier.desc}</p>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{tier.pts} points requis</span>
                          </div>
                        </div>
                        {reached
                          ? <span style={{ fontSize: "0.8rem", color: "var(--primary-gold)", fontWeight: "700" }}>D\u00e9bloqu\u00e9 !</span>
                          : <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>En cours</span>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Code & Stats */}
            <div>
              <h3 className="gold-text" style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Inviter des proches</h3>
              <div className="glass-panel" style={{ padding: "24px", border: "1px solid rgba(212,175,55,0.15)", display: "flex", flexDirection: "column", gap: "18px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  Partagez votre code ou lien de parrainage. Vos proches b\u00e9n\u00e9ficient de <strong>-10%</strong> sur leur premier soin, et vous gagnez <strong>100 points</strong> pour chaque parrainage valid\u00e9 !
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Votre code de parrainage :</label>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "4px", padding: "12px", textAlign: "center", fontSize: "1.3rem", fontWeight: "800", color: "var(--primary-gold)", letterSpacing: "0.08em" }}>
                    {affiliate?.code}
                  </div>
                </div>

                <button onClick={handleCopyLink} className="btn-outline" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "0.8rem", padding: "10px" }}>
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Lien copi\u00e9 !" : "Copier le lien d'invitation"}</span>
                </button>

                <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.08)" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "center" }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Total Parrainages</span>
                    <h4 style={{ fontSize: "1.2rem", marginTop: "4px" }}>{affiliate?.totalReferrals || 0}</h4>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Points Cadeaux</span>
                    <h4 style={{ fontSize: "1.2rem", marginTop: "4px", color: "var(--primary-gold)" }}>{affiliate?.pointsEarned || 0} pts</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
