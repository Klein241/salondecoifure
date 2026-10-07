import React, { useState, useEffect, useCallback } from "react"
import {
  getWallet, getPacks, getFideliteSettings, getTransactions, getReservationsClient,
  acheterPack, payerAvecPoints, creerReservationAnticipee,
  calculerValeurWallet, calculerPlafondDeduction, calculerCashback,
  formatPoints, formatFcfa,
  subscribeWallet, unsubscribeWallet
} from "../fidelite"
import {
  Gem, Star, ShoppingCart, CreditCard, Calendar, Clock, ChevronRight,
  TrendingUp, Gift, Zap, CheckCircle, AlertTriangle, Loader, RefreshCw,
  Package, Sparkles, Crown, Info, ArrowUpRight, ArrowDownLeft
} from "lucide-react"

const COLORS = {
  gold: "#d4af37",
  goldLight: "#f0d060",
  goldDark: "#aa771c",
  bg: "#0b0b0b",
  card: "#161616",
  cardHover: "#1e1e1e",
  border: "#2a2a2a",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
  text: "#e8e8e8",
  muted: "#888"
}

const typeLabels = {
  achat_pack: { label: "Achat pack", icon: ShoppingCart, color: COLORS.green },
  cashback: { label: "Cashback", icon: TrendingUp, color: COLORS.blue },
  deduction_service: { label: "Service payé", icon: CreditCard, color: COLORS.orange },
  bonus_parrainage: { label: "Parrainage", icon: Gift, color: COLORS.purple },
  expiration: { label: "Expiration", icon: Clock, color: COLORS.red },
  ajustement_admin: { label: "Ajustement", icon: Sparkles, color: COLORS.gold }
}

export default function Fidelite({ currentUser }) {
  const [wallet, setWallet] = useState(null)
  const [packs, setPacks] = useState([])
  const [settings, setSettings] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("wallet")
  const [buyingPack, setBuyingPack] = useState(null)
  const [toast, setToast] = useState(null)
  const [payModal, setPayModal] = useState(false)
  const [payForm, setPayForm] = useState({ service: "", prix: "", points: "" })
  const [resaModal, setResaModal] = useState(false)
  const [resaForm, setResaForm] = useState({ service: "", prix: "", date: "", note: "" })

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadData = useCallback(async () => {
    if (!currentUser?.id) return
    setLoading(true)
    try {
      const [w, p, s, txs, resas] = await Promise.all([
        getWallet(currentUser.id),
        getPacks(),
        getFideliteSettings(),
        getTransactions(currentUser.id),
        getReservationsClient(currentUser.id)
      ])
      setWallet(w)
      setPacks(p)
      setSettings(s)
      setTransactions(txs)
      setReservations(resas)
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Realtime wallet
  useEffect(() => {
    if (!currentUser?.id || !settings) return
    const channel = subscribeWallet(currentUser.id, "default", (newWallet) => {
      setWallet(newWallet)
    })
    return () => unsubscribeWallet(channel)
  }, [currentUser?.id, settings])

  const handleAcheterPack = async (pack) => {
    if (!currentUser?.id) return
    setBuyingPack(pack.id)
    try {
      const result = await acheterPack(currentUser.id, pack.id, currentUser.id)
      if (result.success) {
        setWallet(prev => prev
          ? { ...prev, points_achetes: result.nouveaux_points.achetes, points_gagnes: result.nouveaux_points.gagnes }
          : prev)
        showToast(`✨ Pack "${pack.nom}" acheté ! +${pack.points_base} pts acquis, +${pack.points_bonus} pts bonus`)
        setActiveTab("wallet")
        loadData()
      } else {
        showToast(result.error || "Erreur lors de l'achat", "error")
      }
    } finally {
      setBuyingPack(null)
    }
  }

  const handlePayer = async () => {
    if (!payForm.service || !payForm.prix || !payForm.points) return
    const result = await payerAvecPoints(
      currentUser.id,
      payForm.service,
      Number(payForm.prix),
      Number(payForm.points),
      currentUser.id
    )
    if (result.success) {
      showToast(`✅ Payé ${formatFcfa(result.prixCash)} en cash. Cashback: +${result.cashbackPts} pts`)
      setPayModal(false)
      setPayForm({ service: "", prix: "", points: "" })
      loadData()
    } else {
      showToast(result.error || "Erreur", "error")
    }
  }

  const handleResa = async () => {
    if (!resaForm.service || !resaForm.prix || !resaForm.date) return
    const result = await creerReservationAnticipee(
      currentUser.id,
      resaForm.service,
      Number(resaForm.prix),
      resaForm.date,
      resaForm.note
    )
    if (result.success) {
      showToast(`📅 Réservation créée ! Avance: ${formatFcfa(result.montant_avance)}`)
      setResaModal(false)
      setResaForm({ service: "", prix: "", date: "", note: "" })
      loadData()
    } else {
      showToast(result.error || "Erreur", "error")
    }
  }

  if (!currentUser) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.muted }}>
        <Gem size={40} color={COLORS.gold} style={{ marginBottom: 16 }} />
        <p>Connectez-vous pour accéder à votre portefeuille de fidélité.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.gold }}>
        <Loader size={32} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        <p style={{ marginTop: 12, color: COLORS.muted, fontSize: "0.85rem" }}>Chargement du portefeuille...</p>
      </div>
    )
  }

  const { totalPts, valeurFcfa } = calculerValeurWallet(wallet, settings)

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px", fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#2d0b0b" : "#0b1f0b",
          border: `1px solid ${toast.type === "error" ? COLORS.red : COLORS.green}`,
          borderRadius: 12, padding: "12px 20px", color: toast.type === "error" ? COLORS.red : COLORS.green,
          fontSize: "0.9rem", maxWidth: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          animation: "slideIn 0.3s ease"
        }}>
          <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
          {toast.msg}
        </div>
      )}

      {/* Header — Carte Portefeuille */}
      <div style={{
        background: `linear-gradient(135deg, #1a1400 0%, #0b0b0b 40%, #1a1400 100%)`,
        border: `1px solid ${COLORS.goldDark}`,
        borderRadius: 20, padding: "28px 24px", marginBottom: 20,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 150, height: 150,
          background: `radial-gradient(circle, ${COLORS.gold}22 0%, transparent 70%)`,
          borderRadius: "50%", pointerEvents: "none"
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.goldDark}, ${COLORS.gold})`,
            borderRadius: 12, padding: "10px",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Gem size={22} color="#000" />
          </div>
          <div>
            <p style={{ color: COLORS.goldLight, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>
              Programme Fidélité
            </p>
            <p style={{ color: COLORS.text, fontWeight: 700, fontSize: "1rem", margin: 0 }}>
              {currentUser.prenom || currentUser.nom || "Cliente"}
            </p>
          </div>
          <button onClick={loadData} style={{
            marginLeft: "auto", background: "transparent", border: "none",
            color: COLORS.muted, cursor: "pointer", padding: 8, borderRadius: 8
          }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Solde total */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ color: COLORS.goldLight, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
            Votre solde total
          </p>
          <p style={{ fontSize: "3rem", fontWeight: 800, color: "#fff", margin: "0 0 4px", lineHeight: 1 }}>
            {formatPoints(totalPts)}
            <span style={{ fontSize: "1.2rem", color: COLORS.gold, marginLeft: 8, fontWeight: 600 }}>pts</span>
          </p>
          <p style={{ color: COLORS.goldDark, fontSize: "0.9rem", margin: 0 }}>
            ≈ {formatFcfa(valeurFcfa)} de valeur
          </p>
        </div>

        {/* Détail deux types de points */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{
            background: "rgba(212,175,55,0.08)", borderRadius: 14,
            padding: "14px 16px", border: "1px solid rgba(212,175,55,0.15)"
          }}>
            <p style={{ color: COLORS.muted, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
              Points acquis
            </p>
            <p style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 700, margin: "0 0 4px" }}>
              {formatPoints(wallet?.points_achetes)}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: COLORS.green, fontSize: "0.72rem" }}>
              <CheckCircle size={12} />
              <span>N'expirent jamais</span>
            </div>
          </div>
          <div style={{
            background: "rgba(249,115,22,0.08)", borderRadius: 14,
            padding: "14px 16px", border: "1px solid rgba(249,115,22,0.15)"
          }}>
            <p style={{ color: COLORS.muted, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
              Points gagnés
            </p>
            <p style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 700, margin: "0 0 4px" }}>
              {formatPoints(wallet?.points_gagnes)}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: COLORS.orange, fontSize: "0.72rem" }}>
              <Clock size={12} />
              <span>Exp. dans {settings?.expiration_points_gagnes_jours}j</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Recharger", icon: ShoppingCart, tab: "packs", color: COLORS.gold },
          { label: "Utiliser", icon: CreditCard, action: () => setPayModal(true), color: COLORS.blue },
          { label: "Réserver", icon: Calendar, action: () => setResaModal(true), color: COLORS.purple }
        ].map((btn, i) => (
          <button key={btn.tab || btn.label || i} onClick={btn.action || (() => setActiveTab(btn.tab))} style={{
            background: COLORS.card, border: `1px solid ${COLORS.border}`,
            borderRadius: 14, padding: "14px 8px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            transition: "all 0.2s", color: btn.color
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = btn.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
          >
            <btn.icon size={20} />
            <span style={{ fontSize: "0.75rem", color: COLORS.text, fontWeight: 500 }}>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: COLORS.card, borderRadius: 12, padding: 4 }}>
        {[
          { key: "wallet", label: "Historique" },
          { key: "packs", label: "Packs" },
          { key: "resas", label: "Réservations" }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1, padding: "8px 12px", borderRadius: 10, border: "none",
            background: activeTab === tab.key ? `linear-gradient(135deg, ${COLORS.goldDark}, ${COLORS.gold})` : "transparent",
            color: activeTab === tab.key ? "#000" : COLORS.muted,
            fontWeight: activeTab === tab.key ? 700 : 500,
            fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s"
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu onglet Historique */}
      {activeTab === "wallet" && (
        <div>
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.muted }}>
              <Sparkles size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: "0.9rem" }}>Aucune transaction pour le moment.</p>
              <p style={{ margin: "8px 0 0", fontSize: "0.8rem", opacity: 0.6 }}>Achetez un pack pour commencer !</p>
            </div>
          ) : transactions.map(tx => {
            const meta = typeLabels[tx.type] || { label: tx.type, icon: Info, color: COLORS.muted }
            const IconComp = meta.icon
            const delta = (tx.points_achetes_delta || 0) + (tx.points_gagnes_delta || 0)
            const isPositive = delta > 0
            return (
              <div key={tx.id} style={{
                background: COLORS.card, borderRadius: 14, padding: "14px 16px",
                marginBottom: 8, border: `1px solid ${COLORS.border}`,
                display: "flex", alignItems: "center", gap: 14
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: `${meta.color}22`, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <IconComp size={18} color={meta.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", color: COLORS.text, fontWeight: 600, fontSize: "0.88rem" }}>
                    {meta.label}
                  </p>
                  {tx.note && (
                    <p style={{ margin: 0, color: COLORS.muted, fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tx.note}
                    </p>
                  )}
                  <p style={{ margin: "2px 0 0", color: COLORS.muted, fontSize: "0.72rem" }}>
                    {new Date(tx.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {delta !== 0 && (
                    <p style={{
                      margin: "0 0 2px", fontWeight: 700, fontSize: "0.95rem",
                      color: isPositive ? COLORS.green : COLORS.orange,
                      display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end"
                    }}>
                      {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      {isPositive ? "+" : ""}{formatPoints(delta)} pts
                    </p>
                  )}
                  {tx.montant_fcfa !== 0 && (
                    <p style={{ margin: 0, color: COLORS.muted, fontSize: "0.75rem" }}>
                      {tx.montant_fcfa > 0 ? "+" : ""}{formatFcfa(tx.montant_fcfa)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Contenu onglet Packs */}
      {activeTab === "packs" && (
        <div>
          <p style={{ color: COLORS.muted, fontSize: "0.82rem", marginBottom: 16, lineHeight: 1.6 }}>
            <Info size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Les points acquis n'expirent jamais. Les points bonus expirent après {settings?.expiration_points_gagnes_jours} jours.
          </p>
          {packs.map(pack => {
            const totalPoints = pack.points_base + pack.points_bonus
            const valeurPercue = totalPoints * (settings?.valeur_point_fcfa || 10)
            const isBuying = buyingPack === pack.id
            return (
              <div key={pack.id} style={{
                background: pack.is_featured
                  ? `linear-gradient(135deg, #1a1400 0%, #0d0d0d 60%, #1a1400 100%)`
                  : COLORS.card,
                border: `1px solid ${pack.is_featured ? COLORS.gold : COLORS.border}`,
                borderRadius: 18, padding: "20px", marginBottom: 12,
                position: "relative", overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}>
                {pack.is_featured && (
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    background: `linear-gradient(135deg, ${COLORS.goldDark}, ${COLORS.gold})`,
                    borderRadius: 8, padding: "3px 10px",
                    fontSize: "0.65rem", fontWeight: 700, color: "#000",
                    display: "flex", alignItems: "center", gap: 4
                  }}>
                    <Crown size={10} />
                    MEILLEUR CHOIX
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <p style={{ margin: "0 0 4px", color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>{pack.nom}</p>
                    <p style={{ margin: 0, color: COLORS.gold, fontSize: "1.4rem", fontWeight: 800 }}>
                      {formatFcfa(pack.prix_fcfa)}
                    </p>
                  </div>
                  <div style={{
                    background: "rgba(212,175,55,0.1)", borderRadius: 12,
                    padding: "8px 14px", textAlign: "center"
                  }}>
                    <p style={{ margin: 0, color: COLORS.gold, fontWeight: 800, fontSize: "1.3rem" }}>{formatPoints(totalPoints)}</p>
                    <p style={{ margin: 0, color: COLORS.muted, fontSize: "0.65rem" }}>pts total</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, background: "rgba(34,197,94,0.08)", borderRadius: 10, padding: "8px 12px" }}>
                    <p style={{ margin: "0 0 2px", color: COLORS.muted, fontSize: "0.65rem" }}>Points acquis</p>
                    <p style={{ margin: 0, color: COLORS.green, fontWeight: 700 }}>{formatPoints(pack.points_base)} pts</p>
                    <p style={{ margin: 0, color: COLORS.muted, fontSize: "0.65rem" }}>N'expirent jamais</p>
                  </div>
                  {pack.points_bonus > 0 && (
                    <div style={{ flex: 1, background: "rgba(249,115,22,0.08)", borderRadius: 10, padding: "8px 12px" }}>
                      <p style={{ margin: "0 0 2px", color: COLORS.muted, fontSize: "0.65rem" }}>Points bonus</p>
                      <p style={{ margin: 0, color: COLORS.orange, fontWeight: 700 }}>+{formatPoints(pack.points_bonus)} pts</p>
                      <p style={{ margin: 0, color: COLORS.muted, fontSize: "0.65rem" }}>Exp. {settings?.expiration_points_gagnes_jours}j</p>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: 0, color: COLORS.muted, fontSize: "0.75rem" }}>
                    Valeur perçue : <span style={{ color: COLORS.goldLight, fontWeight: 600 }}>{formatFcfa(valeurPercue)}</span>
                  </p>
                  <button
                    onClick={() => handleAcheterPack(pack)}
                    disabled={isBuying}
                    style={{
                      background: pack.is_featured
                        ? `linear-gradient(135deg, ${COLORS.goldDark}, ${COLORS.gold})`
                        : `rgba(212,175,55,0.15)`,
                      border: `1px solid ${COLORS.gold}`,
                      borderRadius: 12, padding: "10px 20px", cursor: isBuying ? "not-allowed" : "pointer",
                      color: pack.is_featured ? "#000" : COLORS.gold,
                      fontWeight: 700, fontSize: "0.85rem",
                      display: "flex", alignItems: "center", gap: 6,
                      opacity: isBuying ? 0.7 : 1, transition: "all 0.2s"
                    }}
                  >
                    {isBuying ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={14} />}
                    {isBuying ? "En cours..." : "Acheter"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Contenu onglet Réservations */}
      {activeTab === "resas" && (
        <div>
          <button onClick={() => setResaModal(true)} style={{
            width: "100%", background: `linear-gradient(135deg, ${COLORS.goldDark}, ${COLORS.gold})`,
            border: "none", borderRadius: 14, padding: "14px 20px", cursor: "pointer",
            color: "#000", fontWeight: 700, fontSize: "0.9rem", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
            <Calendar size={18} />
            Nouvelle réservation anticipée
          </button>

          {reservations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 20px", color: COLORS.muted }}>
              <Calendar size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: "0.85rem" }}>Aucune réservation anticipée.</p>
            </div>
          ) : reservations.map(resa => {
            const couleurStatut = {
              en_attente: COLORS.orange, confirmee: COLORS.blue,
              annulee: COLORS.red, honoree: COLORS.green
            }[resa.statut] || COLORS.muted

            return (
              <div key={resa.id} style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: 14, padding: "16px", marginBottom: 10
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ margin: "0 0 4px", color: "#fff", fontWeight: 600 }}>{resa.service_nom}</p>
                    <p style={{ margin: 0, color: COLORS.muted, fontSize: "0.8rem" }}>
                      {new Date(resa.date_rdv).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <span style={{
                    background: `${couleurStatut}22`, color: couleurStatut,
                    borderRadius: 8, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600,
                    textTransform: "capitalize"
                  }}>
                    {resa.statut.replace("_", " ")}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ color: COLORS.muted, fontSize: "0.8rem" }}>
                    Prix : <strong style={{ color: COLORS.text }}>{formatFcfa(resa.prix_service)}</strong>
                  </span>
                  {resa.avance_payee && (
                    <span style={{ color: COLORS.muted, fontSize: "0.8rem" }}>
                      Avance : <strong style={{ color: COLORS.gold }}>{formatFcfa(resa.montant_avance)}</strong>
                    </span>
                  )}
                  {resa.prix_final_cash && (
                    <span style={{ color: COLORS.muted, fontSize: "0.8rem" }}>
                      Solde dû : <strong style={{ color: COLORS.green }}>{formatFcfa(resa.prix_final_cash)}</strong>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal — Utiliser des points */}
      {payModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000,
          display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16
        }} onClick={() => setPayModal(false)}>
          <div style={{
            background: "#111", borderRadius: "20px 20px 0 0", padding: "24px 20px",
            width: "100%", maxWidth: 480, border: `1px solid ${COLORS.border}`,
            borderBottom: "none"
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: COLORS.gold, margin: "0 0 6px", fontSize: "1.1rem" }}>Utiliser mes points</h3>
            <p style={{ color: COLORS.muted, fontSize: "0.8rem", margin: "0 0 20px" }}>
              Solde : {formatPoints(totalPts)} pts — Plafond : {settings?.plafond_deduction_pct}% du prix
            </p>
            {["service", "prix", "points"].map((field, i) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: COLORS.muted, fontSize: "0.78rem", marginBottom: 6 }}>
                  {["Nom du service", "Prix du service (F)", "Points à utiliser"][i]}
                </label>
                <input
                  type={field === "service" ? "text" : "number"}
                  value={payForm[field]}
                  onChange={e => {
                    const newForm = { ...payForm, [field]: e.target.value }
                    if (field === "prix" && settings) {
                      const plafond = calculerPlafondDeduction(Number(e.target.value), settings)
                      const maxDispo = Math.min(plafond, totalPts)
                      newForm.points = String(maxDispo)
                    }
                    setPayForm(newForm)
                  }}
                  placeholder={["Ex: Manucure", "Ex: 15000", `Max: ${Math.min(calculerPlafondDeduction(Number(payForm.prix) || 0, settings || getDefaultSettings()), totalPts)}`][i]}
                  style={{
                    width: "100%", background: COLORS.card, border: `1px solid ${COLORS.border}`,
                    borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: "0.9rem",
                    outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
            ))}
            {payForm.prix && payForm.points && settings && (
              <div style={{
                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: "0.82rem"
              }}>
                <p style={{ margin: "0 0 4px", color: COLORS.blue }}>
                  Réduction : <strong>{formatFcfa(Number(payForm.points) * (settings.valeur_point_fcfa || 10))}</strong>
                </p>
                <p style={{ margin: "0 0 4px", color: COLORS.text }}>
                  Prix final : <strong>{formatFcfa(Math.max(0, Number(payForm.prix) - Number(payForm.points) * (settings.valeur_point_fcfa || 10)))}</strong>
                </p>
                <p style={{ margin: 0, color: COLORS.green }}>
                  Cashback estimé : <strong>+{calculerCashback(
                    Math.max(0, Number(payForm.prix) - Number(payForm.points) * (settings.valeur_point_fcfa || 10)),
                    settings
                  )} pts</strong>
                </p>
              </div>
            )}
            <button onClick={handlePayer} style={{
              width: "100%", background: `linear-gradient(135deg, ${COLORS.goldDark}, ${COLORS.gold})`,
              border: "none", borderRadius: 12, padding: "14px", cursor: "pointer",
              color: "#000", fontWeight: 700, fontSize: "0.9rem"
            }}>
              Confirmer le paiement
            </button>
          </div>
        </div>
      )}

      {/* Modal — Réservation anticipée */}
      {resaModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000,
          display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16
        }} onClick={() => setResaModal(false)}>
          <div style={{
            background: "#111", borderRadius: "20px 20px 0 0", padding: "24px 20px",
            width: "100%", maxWidth: 480, border: `1px solid ${COLORS.border}`,
            borderBottom: "none"
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: COLORS.purple, margin: "0 0 6px", fontSize: "1.1rem" }}>Réservation anticipée</h3>
            <p style={{ color: COLORS.muted, fontSize: "0.8rem", margin: "0 0 20px" }}>
              Avance : {formatFcfa(settings?.montant_avance_resa || 2500)} — Réduction : {settings?.taux_reduction_resa_pct}% sur le prochain RDV
            </p>
            {[
              { key: "service", label: "Service", type: "text", ph: "Ex: Pédicure + Manucure" },
              { key: "prix", label: "Prix estimé (F)", type: "number", ph: "Ex: 7500" },
              { key: "date", label: "Date & heure du RDV", type: "datetime-local", ph: "" },
              { key: "note", label: "Note (optionnel)", type: "text", ph: "Préférences..." }
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: COLORS.muted, fontSize: "0.78rem", marginBottom: 6 }}>{f.label}</label>
                <input
                  type={f.type}
                  value={resaForm[f.key]}
                  onChange={e => setResaForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.ph}
                  style={{
                    width: "100%", background: COLORS.card, border: `1px solid ${COLORS.border}`,
                    borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: "0.9rem",
                    outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
            ))}
            {resaForm.prix && settings && (
              <div style={{
                background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
                borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: "0.82rem"
              }}>
                <p style={{ margin: "0 0 4px", color: COLORS.purple }}>
                  Réduction totale : <strong>{formatFcfa(
                    (Number(resaForm.prix) * settings.taux_reduction_resa_pct / 100) + settings.montant_avance_resa
                  )}</strong>
                </p>
                <p style={{ margin: 0, color: COLORS.text }}>
                  Solde le jour J : <strong>{formatFcfa(Math.max(0,
                    Number(resaForm.prix) - (Number(resaForm.prix) * settings.taux_reduction_resa_pct / 100) - settings.montant_avance_resa
                  ))}</strong>
                </p>
              </div>
            )}
            <button onClick={handleResa} style={{
              width: "100%", background: `linear-gradient(135deg, #6b21a8, #a855f7)`,
              border: "none", borderRadius: 12, padding: "14px", cursor: "pointer",
              color: "#fff", fontWeight: 700, fontSize: "0.9rem"
            }}>
              Réserver avec avance
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
