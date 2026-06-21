import React, { useState, useEffect } from "react"
import { servicesList, staffList, getStoredData } from "../data"
import { Calendar as CalendarIcon, Clock, Star, Check, Sparkles, AlertCircle } from "lucide-react"
import confetti from "canvas-confetti"
import { getServices, getStaff, getAppointments, createAppointment, getAffiliates, saveAffiliate, getPromoCodes, incrementPromoCodeUses, supabase } from "../supabase"

export default function Booking({ preSelectedService, currentUser, onBookingSuccess, siteSettings = { allow_specialist_selection: true }, tenantId = null, referralCode = '' }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientInfo, setClientInfo] = useState({ name: "", email: "", phone: "", affiliateCode: "" });
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [appliedAffiliate, setAppliedAffiliate] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"];

  useEffect(() => {
    async function loadData() {
      const dbServices = await getServices(tenantId);
      setServices(dbServices || servicesList);
      
      const dbStaff = await getStaff(tenantId);
      setStaff(dbStaff || staffList);
      
      const dbApps = await getAppointments(tenantId);
      setAppointments(dbApps || []);
      
      const dbAffs = await getAffiliates();
      setAffiliates(dbAffs || []);

      const dbPromos = await getPromoCodes();
      setPromoCodes(dbPromos || []);

      if (supabase) {
        try {
          const { data: profiles } = await supabase.from("profiles").select("email, name");
          if (profiles) setAllProfiles(profiles);
        } catch (e) {
          console.error("Error loading profiles:", e);
        }
      }
    }
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (preSelectedService) {
      setSelectedService(preSelectedService);
      setStep(3);
    }
  }, [preSelectedService]);

  // Read ref code from URL search parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode && affiliates.length > 0) {
      setClientInfo(prev => ({ ...prev, affiliateCode: refCode }));
      
      const typedCode = refCode.trim().toLowerCase();
      const affMatch = affiliates.find(aff => aff.code.toLowerCase() === typedCode);
      if (affMatch) {
        if (currentUser && currentUser.email.toLowerCase() === affMatch.clientEmail.toLowerCase()) {
          setErrorMsg("Vous ne pouvez pas utiliser votre propre code de parrainage !");
          setReferralDiscount(0);
          setAppliedAffiliate(null);
        } else {
          const profileMatch = allProfiles.find(p => p.email.toLowerCase() === affMatch.clientEmail.toLowerCase());
          const referrerName = profileMatch ? profileMatch.name : (affMatch.clientName || affMatch.clientEmail);
          setReferralDiscount(0.1); // 10% discount
          setAppliedAffiliate(referrerName);
          setPromoDiscount(0);
          setAppliedPromo(null);
          setErrorMsg("");
        }
      }
    }
  }, [affiliates, allProfiles, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setClientInfo({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        affiliateCode: ""
      });
    }
  }, [currentUser]);

  // Get booked slots for the selected date and staff to prevent double booking
  const getBookedSlots = () => {
    if (!selectedDate || !selectedStaff) return [];
    return appointments
      .filter(app => app.date === selectedDate && app.staffId === selectedStaff.id && app.status !== "Annulé" && app.status !== "cancelled")
      .map(app => app.time);
  };

  const bookedSlots = getBookedSlots();

  // Validate discount code
  const handleValidateReferral = async () => {
    const typedCode = clientInfo.affiliateCode.trim().toUpperCase();
    const typedCodeLower = typedCode.toLowerCase();
    if (!typedCode) return;

    // 1. Check if it is an affiliate/parrainage code
    const affMatch = affiliates.find(aff => aff.code.toLowerCase() === typedCodeLower);
    if (affMatch) {
      if (currentUser && currentUser.email.toLowerCase() === affMatch.clientEmail.toLowerCase()) {
        setErrorMsg("Vous ne pouvez pas utiliser votre propre code de parrainage !");
        setReferralDiscount(0);
        setAppliedAffiliate(null);
        return;
      }
      const profileMatch = allProfiles.find(p => p.email.toLowerCase() === affMatch.clientEmail.toLowerCase());
      const referrerName = profileMatch ? profileMatch.name : (affMatch.clientName || affMatch.clientEmail);
      setReferralDiscount(0.1);
      setAppliedAffiliate(referrerName);
      setPromoDiscount(0);
      setAppliedPromo(null);
      setErrorMsg("");
      return;
    }

    // 2. Check promo codes — STRICTLY from Supabase only
    // Never accept codes not created by admin
    if (promoCodes.length === 0 && !supabase) {
      setErrorMsg("Code invalide ou non autorise. Seuls les codes generés par l'administration sont acceptés.");
      setReferralDiscount(0); setPromoDiscount(0); setAppliedPromo(null); setAppliedAffiliate(null);
      return;
    }

    const promoMatch = promoCodes.find(p => p.code.toLowerCase() === typedCodeLower);
    if (!promoMatch) {
      setErrorMsg("Code invalide ou non autorisé. Seuls les codes générés par l'administration sont acceptés.");
      setReferralDiscount(0); setPromoDiscount(0); setAppliedPromo(null); setAppliedAffiliate(null);
      return;
    }
    if (!promoMatch.isActive) {
      setErrorMsg("Ce code promo est inactif.");
      setPromoDiscount(0); setAppliedPromo(null);
      return;
    }
    if (promoMatch.currentUses >= promoMatch.maxUses) {
      setErrorMsg("Ce code promo a expiré (nombre maximal d'utilisations atteint).");
      setPromoDiscount(0); setAppliedPromo(null);
      return;
    }
    setPromoDiscount(promoMatch.discountPercent / 100);
    setAppliedPromo(promoMatch);
    setReferralDiscount(0);
    setAppliedAffiliate(null);
    setErrorMsg("");
  };


  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setStep(3);
  };

  const handleStaffSelect = (stf) => {
    setSelectedStaff(stf);
    setStep(3);
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTime) {
      setErrorMsg("Veuillez sélectionner une date et un créneau horaire.");
      return;
    }
    setErrorMsg("");
    setStep(4);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const discountMultiplier = referralDiscount + promoDiscount;
    const finalPrice = selectedService.price * (1 - discountMultiplier);
    const appliedCode = clientInfo.affiliateCode.trim();
    
    // Create new appointment
    const newAppointment = {
      id: "APT-" + Math.floor(100000 + Math.random() * 900000),
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientPhone: clientInfo.phone,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      price: finalPrice,
      date: selectedDate,
      time: selectedTime,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      status: "En attente",
      referralUsed: referralDiscount > 0,
      promoCodeUsed: appliedPromo ? appliedPromo.code : null,
      rescheduled: false
    };

    // Save to Supabase (with fallback)
    await createAppointment(newAppointment);

    // If referral code used, update rewards for the owner
    if (referralDiscount > 0 && appliedCode) {
      const match = affiliates.find(aff => aff.code.toLowerCase() === appliedCode.toLowerCase());
      if (match) {
        const updatedAff = {
          ...match,
          pointsEarned: (match.pointsEarned || 0) + 100, // 100 points per referral
          totalReferrals: (match.totalReferrals || 0) + 1
        };
        await saveAffiliate(updatedAff);
      }
    }

    // If promo code used, increment uses in base
    if (promoDiscount > 0 && appliedPromo) {
      await incrementPromoCodeUses(appliedPromo.code);
    }

    // Trigger celebration
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    onBookingSuccess(newAppointment);
    
    // Reset state
    setStep(5);
  }

  const getMinDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <section
      id="booking"
      style={{
        padding: "100px 24px",
        background: "#0d0d0d",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{ fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600", display: "block", marginBottom: "8px" }}>
            PLANIFIER VOTRE VISITE
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", marginBottom: "12px" }}>
            Réservation <span className="gold-text">En Ligne</span>
          </h2>
          <div style={{ width: "60px", height: "2px", background: "var(--gold-grad)", margin: "0 auto" }} />
        </div>

        {/* Step Indicator */}
        {step < 5 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
              padding: "0 10px",
            }}
          >
            {/* Indicateur 4 etapes: Soin > Date > Infos > Confirmation */}
            {(() => {
              const stepMap = [1, 3, 4, 5];
              const stepLabels = ["Soin", "Date", "Infos", "Fin"];
              const curV = stepMap.indexOf(step) >= 0 ? stepMap.indexOf(step) + 1 : 1;
              return stepMap.map((actualS, idx) => {
                const vs = idx + 1;
                const isDone = curV > vs;
                const isCurrent = curV === vs;
                return (
                  <div key={vs} style={{ display: "flex", alignItems: "center", flex: vs < 4 ? 1 : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <button
                        onClick={() => isDone && setStep(actualS)}
                        disabled={!isDone}
                        style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          border: isCurrent ? "2px solid var(--primary-gold)" : isDone ? "2px solid rgba(212,175,55,0.6)" : "2px solid rgba(255,255,255,0.1)",
                          background: isDone ? "var(--primary-gold)" : isCurrent ? "rgba(212,175,55,0.1)" : "transparent",
                          color: isDone ? "#121212" : isCurrent ? "var(--primary-gold)" : "var(--text-secondary)",
                          fontWeight: "700", cursor: isDone ? "pointer" : "default",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "var(--transition-smooth)",
                        }}
                      >
                        {isDone ? <Check size={16} /> : vs}
                      </button>
                      <span style={{ fontSize: "0.58rem", color: isCurrent ? "var(--primary-gold)" : "rgba(255,255,255,0.35)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{stepLabels[idx]}</span>
                    </div>
                    {vs < 4 && (
                      <div style={{ height: "2px", flex: 1, background: isDone ? "var(--gold-grad)" : "rgba(255,255,255,0.1)", margin: "0 8px", marginBottom: "18px" }} />
                    )}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Step Content */}
        <div className="glass-panel" style={{ padding: "40px", border: "1px solid rgba(212, 175, 55, 0.15)", position: "relative" }}>
          
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "24px", color: "var(--primary-gold)" }}>1. Sélectionnez votre soin</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    style={{
                      padding: "20px",
                      borderRadius: "8px",
                      border: "1px solid rgba(212, 175, 55, 0.1)",
                      background: "rgba(255, 255, 255, 0.02)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "var(--transition-smooth)",
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>{service.name}</h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{service.duration} • {service.category}</p>
                    </div>
                    <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--primary-gold)" }}>{service.price.toLocaleString("fr-FR")} F</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Staff Selection */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "24px", color: "var(--primary-gold)" }}>2. Choisissez votre spécialiste</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                {staff.map((staff) => (
                  <div
                    key={staff.id}
                    onClick={() => handleStaffSelect(staff)}
                    style={{
                      padding: "24px",
                      borderRadius: "8px",
                      border: "1px solid rgba(212, 175, 55, 0.1)",
                      background: "rgba(255, 255, 255, 0.02)",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "var(--transition-smooth)",
                    }}
                  >
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 16px", border: "2px solid var(--primary-gold)" }}
                    />
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>{staff.name}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "8px" }}>{staff.role}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "0.8rem", color: "var(--primary-gold)" }}>
                      <Star size={12} fill="currentColor" />
                      <span>{staff.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="btn-outline"
                style={{ marginTop: "30px", fontSize: "0.75rem", padding: "8px 16px" }}
              >
                Retour
              </button>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "24px", color: "var(--primary-gold)" }}>2. Sélectionnez la date et l'heure</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Date Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CalendarIcon size={14} /> Date de rendez-vous :
                  </label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime("");
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                      borderRadius: "4px",
                      color: "var(--text-primary)",
                      padding: "12px",
                      fontSize: "1rem",
                      fontFamily: "var(--font-sans)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Time Slots Grid */}
                {selectedDate && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} /> Créneaux disponibles :
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }} className="time-grid">
                      {timeSlots.map((time) => {
                        const isBooked = bookedSlots.includes(time);
                        return (
                          <button
                            key={time}
                            disabled={isBooked}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            style={{
                              padding: "12px 6px",
                              borderRadius: "4px",
                              border: isBooked
                                ? "1px solid transparent"
                                : selectedTime === time
                                ? "1px solid var(--primary-gold)"
                                : "1px solid rgba(255,255,255,0.08)",
                              background: isBooked
                                ? "rgba(255,255,255,0.02)"
                                : selectedTime === time
                                ? "rgba(212,175,55,0.15)"
                                : "rgba(255,255,255,0.04)",
                              color: isBooked
                                ? "rgba(255,255,255,0.15)"
                                : selectedTime === time
                                ? "var(--primary-gold)"
                                : "var(--text-primary)",
                              cursor: isBooked ? "not-allowed" : "pointer",
                              textDecoration: isBooked ? "line-through" : "none",
                              fontSize: "0.9rem",
                              fontWeight: "600",
                              transition: "var(--transition-smooth)",
                            }}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FF4500", fontSize: "0.85rem", marginTop: "16px" }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-outline"
                  style={{ fontSize: "0.75rem", padding: "8px 16px" }}
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleDateTimeConfirm}
                  className="btn-gold"
                  style={{ fontSize: "0.75rem", padding: "8px 20px" }}
                  disabled={!selectedDate || !selectedTime}
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Final Info & Checkout */}
          {step === 4 && (
            <form onSubmit={handleFormSubmit}>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "24px", color: "var(--primary-gold)" }}>4. Informations personnelles</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="form-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Nom Complet : *</label>
                  <input
                    type="text"
                    required
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
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
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Téléphone : *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 077 00 40 73"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
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
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "span 2" }} className="full-col">
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Email : *</label>
                  <input
                    type="email"
                    required
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
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
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "span 2" }} className="full-col">
                  <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Code de réduction ou parrainage (optionnel) :</label>
                  <div className="promo-button-container" style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Carte fidélité ou code parrainage"
                      value={clientInfo.affiliateCode}
                      onChange={(e) => setClientInfo({ ...clientInfo, affiliateCode: e.target.value })}
                      style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "4px",
                        color: "var(--text-primary)",
                        padding: "10px",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleValidateReferral}
                      className="btn-outline"
                      style={{ padding: "10px 16px", fontSize: "0.75rem" }}
                    >
                      Appliquer
                    </button>
                  </div>
                  {appliedAffiliate && (
                    <div style={{ fontSize: "0.82rem", color: "#228B22", marginTop: "6px", fontWeight: "600" }}>
                      ✓ Code de parrainage validé ! Parrainé(e) par : <span style={{ textDecoration: "underline" }}>{appliedAffiliate}</span> (-10%)
                    </div>
                  )}
                  {appliedPromo && (
                    <div style={{ fontSize: "0.82rem", color: "#228B22", marginTop: "6px", fontWeight: "600" }}>
                      ✓ Code Fidélité validé ! Carte de : <span style={{ textDecoration: "underline" }}>{appliedPromo.clientName}</span> (-{appliedPromo.discountPercent}%)
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Card */}
              <div
                style={{
                  background: "rgba(212, 175, 55, 0.04)",
                  border: "1px solid rgba(212, 175, 55, 0.15)",
                  borderRadius: "8px",
                  padding: "24px",
                  marginTop: "30px",
                }}
              >
                <h4 style={{ fontSize: "1.1rem", marginBottom: "12px", borderBottom: "1px solid rgba(212,175,55,0.1)", paddingBottom: "8px" }}>
                  Récapitulatif de votre rendez-vous
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Soin :</span>
                    <span style={{ fontWeight: "600" }}>{selectedService?.name}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Spécialiste :</span>
                    <span style={{ fontWeight: "600" }}>{selectedStaff?.name}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Date & Heure :</span>
                    <span style={{ fontWeight: "600" }}>{selectedDate} à {selectedTime}</span>
                  </div>
                  {referralDiscount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#228B22" }}>
                      <span>Remise Parrainage (10%) :</span>
                      <span>- {(selectedService?.price * referralDiscount).toLocaleString("fr-FR")} F</span>
                    </div>
                  )}
                  {promoDiscount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#228B22" }}>
                      <span>Remise Fidélité ({appliedPromo?.discountPercent}%) :</span>
                      <span>- {(selectedService?.price * promoDiscount).toLocaleString("fr-FR")} F</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      paddingTop: "12px",
                      marginTop: "4px",
                      fontSize: "1.1rem",
                      fontWeight: "700",
                    }}
                  >
                    <span>Total à régler :</span>
                    <span className="gold-text">
                      {(selectedService?.price * (1 - referralDiscount - promoDiscount)).toLocaleString("fr-FR")} F
                    </span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FF4500", fontSize: "0.85rem", marginTop: "16px" }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-outline"
                  style={{ fontSize: "0.75rem", padding: "8px 16px" }}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="btn-gold"
                  style={{ fontSize: "0.75rem", padding: "8px 24px" }}
                >
                  Confirmer le rendez-vous
                </button>
              </div>
            </form>
          )}

          {/* Step 5: Success State */}
          {step === 5 && (
            <div style={{ textAlign: "center", padding: "30px 10px" }} className="animate-fade-in">
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "2px solid var(--primary-gold)",
                  color: "var(--primary-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Sparkles size={36} />
              </div>
              <h3 style={{ fontSize: "1.8rem", marginBottom: "12px" }}>Réservation Confirmée !</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", maxWidth: "480px", margin: "0 auto 24px" }}>
                Merci pour votre confiance. Votre rendez-vous est enregistré avec succès. Un email de confirmation a été envoyé.
              </p>
              
              <div
                className="glass-panel"
                style={{
                  padding: "20px",
                  maxWidth: "400px",
                  margin: "0 auto 30px",
                  border: "1px solid rgba(212,175,55,0.1)",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Soin :</span>
                  <span style={{ fontWeight: "600" }}>{selectedService?.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Praticien :</span>
                  <span style={{ fontWeight: "600" }}>{selectedStaff?.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Date & Heure :</span>
                  <span style={{ fontWeight: "600" }}>{selectedDate} à {selectedTime}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedService(null);
                  setSelectedStaff(null);
                  setSelectedDate("");
                  setSelectedTime("");
                  setReferralDiscount(0);
                  setStep(1);
                }}
                className="btn-gold"
                style={{ fontSize: "0.8rem" }}
              >
                Prendre un autre rendez-vous
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .time-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          .full-col {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </section>
  );
}




