import React, { useState, useEffect, useCallback } from "react"
import {
  getAllWallets, getAllPacks, getAllTransactions, getAllReservations,
  getFideliteSettings, updateFideliteSettings,
  createPack, updatePack, deletePack,
  octroierPointsAdmin, honorerReservation,
  expirerPointsPasses, getAuditLogs,
  formatPoints, formatFcfa, calculerValeurWallet
} from "../fidelite"
import {
  Gem, Settings, Package, Users, CreditCard, Calendar, Shield,
  Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp,
  RefreshCw, Loader, CheckCircle, AlertTriangle, Crown,
  Star, TrendingUp, Clock, Gift, Zap, BarChart2, FileText
} from "lucide-react"

const C = {
  gold: "#d4af37", goldLight: "#f0d060", goldDark: "#aa771c",
  bg: "#0b0b0b", card: "#111", cardHover: "#161616",
  border: "#222", green: "#22c55e", orange: "#f97316",
  red: "#ef4444", blue: "#3b82f6", purple: "#a855f7",
  text: "#e0e0e0", muted: "#666"
}

const Input = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", color: C.muted, fontSize: "0.78rem", marginBottom: 5 }}>{label}</label>}
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: "0.88rem",
        outline: "none", boxSizing: "border-box", transition: "border-color 0.2s"
      }}
      onFocus={e => e.target.style.borderColor = C.gold}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  </div>
)

const Toggle = ({ label, value, onChange, description }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
    <div>
      <p style={{ margin: 0, color: C.text, fontSize: "0.88rem" }}>{label}</p>
      {description && <p style={{ margin: "2px 0 0", color: C.muted, fontSize: "0.72rem" }}>{description}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
        background: value ? `linear-gradient(135deg, ${C.goldDark}, ${C.gold})` : C.border,
        position: "relative", transition: "background 0.3s", flexShrink: 0
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: value ? 25 : 3, width: 20, height: 20,
        background: "#fff", borderRadius: "50%", transition: "left 0.3s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.5)"
      }} />
    </button>
  </div>
)

export default function AdminFidelite({ currentUser }) {
  const [activeSection, setActiveSection] = useState("apercu")
  const [settings, setSettings] = useState(null)
  const [packs, setPacks] = useState([])
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [reservations, setReservations] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Pack form
  const [packForm, setPackForm] = useState({ nom: "", prix_fcfa: "", points_base: "", points_bonus: "", is_featured: false, ordre: 0 })
  const [editingPack, setEditingPack] = useState(null)
  const [showPackForm, setShowPackForm] = useState(false)

  // Octroi manuel
  const [octroiModal, setOctroiModal] = useState(null) // walletId
  const [octroiForm, setOctroiForm] = useState({ points_achetes: "", points_gagnes: "", note: "" })

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, p, w, t, r, a] = await Promise.all([
        getFideliteSettings(),
        getAllPacks(),
        getAllWallets(),
        getAllTransactions(),
        getAllReservations(),
        getAuditLogs(50)
      ])
      setSettings(s)
      setPacks(p)
      setWallets(w)
      setTransactions(t)
      setReservations(r)
      setAuditLogs(a)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const handleSaveSettings = async () => {
    setSaving(true)
    const result = await updateFideliteSettings(settings)
    setSaving(false)
    if (result) showToast("✅ Paramètres enregistrés")
    else showToast("Erreur lors de la sauvegarde", "error")
  }

  const handleSavePack = async () => {
    if (!packForm.nom || !packForm.prix_fcfa || !packForm.points_base) {
      showToast("Remplissez tous les champs obligatoires", "error")
      return
    }
    const payload = {
      nom: packForm.nom,
      prix_fcfa: Number(packForm.prix_fcfa),
      points_base: Number(packForm.points_base),
      points_bonus: Number(packForm.points_bonus) || 0,
      is_featured: packForm.is_featured,
      ordre: Number(packForm.ordre) || 0,
      actif: true
    }
    let result
    if (editingPack) {
      result = await updatePack(editingPack, payload)
    } else {
      result = await createPack(payload)
    }
    if (result) {
      showToast(editingPack ? "✅ Pack modifié" : "✅ Pack créé")
      setShowPackForm(false)
      setEditingPack(null)
      setPackForm({ nom: "", prix_fcfa: "", points_base: "", points_bonus: "", is_featured: false, ordre: 0 })
      loadAll()
    } else {
      showToast("Erreur lors de la sauvegarde", "error")
    }
  }

  const handleDeletePack = async (id) => {
    if (!window.confirm("Désactiver ce pack ?")) return
    await deletePack(id)
    showToast("Pack désactivé")
    loadAll()
  }

  const handleEditPack = (pack) => {
    setPackForm({
      nom: pack.nom, prix_fcfa: String(pack.prix_fcfa),
      points_base: String(pack.points_base), points_bonus: String(pack.points_bonus),
      is_featured: pack.is_featured, ordre: pack.ordre || 0
    })
    setEditingPack(pack.id)
    setShowPackForm(true)
  }

  const handleOctroi = async () => {
    if (!octroiModal) return
    const wallet = wallets.find(w => w.id === octroiModal)
    if (!wallet) return
    const result = await octroierPointsAdmin(
      wallet.user_id,
      "ajustement_admin",
      Number(octroiForm.points_achetes) || 0,
      Number(octroiForm.points_gagnes) || 0,
      octroiForm.note,
      currentUser?.id
    )
    if (result.success) {
      showToast("✅ Points octroyés avec succès")
      setOctroiModal(null)
      setOctroiForm({ points_achetes: "", points_gagnes: "", note: "" })
      loadAll()
    } else {
      showToast(result.error || "Erreur", "error")
    }
  }

  const handleHonorer = async (id) => {
    const result = await honorerReservation(id)
    if (result.success) {
      showToast(`✅ Réservation honorée — Solde dû : ${formatFcfa(result.prixFinal)}`)
      loadAll()
    } else {
      showToast(result.error || "Erreur", "error")
    }
  }

  const handleExpirer = async () => {
    if (!window.confirm("Lancer l'expiration des points périmés ? Cette action est irréversible.")) return
    const result = await expirerPointsPasses()
    if (result.success) {
      showToast(`✅ ${result.expired} transaction(s) expirée(s)`)
      loadAll()
    } else {
      showToast("Erreur lors de l'expiration", "error")
    }
  }

  // Statistiques rapides
  const totalPtsAchetes = wallets.reduce((s, w) => s + (w.points_achetes || 0), 0)
  const totalPtsGagnes = wallets.reduce((s, w) => s + (w.points_gagnes || 0), 0)
  const totalClients = wallets.length
  const totalTransactions = transactions.length
  const resasEnAttente = reservations.filter(r => r.statut === "en_attente").length

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: C.gold }}>
        <Loader size={28} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        <p style={{ marginTop: 12, color: C.muted, fontSize: "0.85rem" }}>Chargement du module fidélité...</p>
      </div>
    )
  }

  const sections = [
    { key: "apercu", label: "Aperçu", icon: BarChart2 },
    { key: "packs", label: "Packs", icon: Package },
    { key: "clients", label: "Clients", icon: Users },
    { key: "reservations", label: "Réservations", icon: Calendar },
    { key: "parametres", label: "Paramètres", icon: Settings },
    { key: "audit", label: "Audit", icon: Shield }
  ]

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 80, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#1f0808" : "#081a08",
          border: `1px solid ${toast.type === "error" ? C.red : C.green}`,
          borderRadius: 12, padding: "12px 18px",
          color: toast.type === "error" ? C.red : C.green,
          fontSize: "0.85rem", maxWidth: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
        paddingBottom: 20, borderBottom: `1px solid ${C.border}`
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
          borderRadius: 12, padding: 10, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Gem size={20} color="#000" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>Système de Fidélité</h2>
          <p style={{ margin: 0, color: C.muted, fontSize: "0.8rem" }}>Gestion des packs, wallets et récompenses</p>
        </div>
        <button onClick={loadAll} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}>
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Nav Sections */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
        {sections.map(sec => (
          <button key={sec.key} onClick={() => setActiveSection(sec.key)} style={{
            background: activeSection === sec.key ? `linear-gradient(135deg, ${C.goldDark}, ${C.gold})` : C.card,
            border: `1px solid ${activeSection === sec.key ? C.gold : C.border}`,
            borderRadius: 10, padding: "8px 14px", cursor: "pointer",
            color: activeSection === sec.key ? "#000" : C.muted,
            fontWeight: activeSection === sec.key ? 700 : 500,
            fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.2s"
          }}>
            <sec.icon size={14} />
            {sec.label}
          </button>
        ))}
      </div>

      {/* ── APERÇU ── */}
      {activeSection === "apercu" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Clients actifs", value: totalClients, icon: Users, color: C.blue },
              { label: "Points acquis", value: formatPoints(totalPtsAchetes), icon: Star, color: C.green, suffix: " pts" },
              { label: "Points gagnés", value: formatPoints(totalPtsGagnes), icon: TrendingUp, color: C.orange, suffix: " pts" },
              { label: "Transactions", value: totalTransactions, icon: CreditCard, color: C.purple },
              { label: "Rés. en attente", value: resasEnAttente, icon: Calendar, color: C.gold }
            ].map((stat, i) => (
              <div key={i} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <stat.icon size={16} color={stat.color} />
                  <span style={{ color: C.muted, fontSize: "0.72rem", textTransform: "uppercase" }}>{stat.label}</span>
                </div>
                <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "1.4rem" }}>
                  {stat.value}<span style={{ fontSize: "0.8rem", color: C.muted }}>{stat.suffix || ""}</span>
                </p>
              </div>
            ))}
          </div>

          <div style={{
            background: `linear-gradient(135deg, #1a1400 0%, #0d0d0d 60%, #1a1400 100%)`,
            border: `1px solid ${C.goldDark}`, borderRadius: 16, padding: "20px"
          }}>
            <h4 style={{ color: C.gold, margin: "0 0 12px", fontSize: "0.95rem" }}>
              ⚡ Action rapide — Expiration des points
            </h4>
            <p style={{ color: C.muted, fontSize: "0.8rem", margin: "0 0 16px" }}>
              Purge les points gagnés dont la date d'expiration est dépassée. À lancer manuellement ou via cron.
            </p>
            <button onClick={handleExpirer} style={{
              background: `rgba(239,68,68,0.1)`, border: `1px solid ${C.red}`,
              borderRadius: 10, padding: "10px 18px", cursor: "pointer",
              color: C.red, fontWeight: 600, fontSize: "0.85rem",
              display: "flex", alignItems: "center", gap: 6
            }}>
              <Clock size={14} />
              Lancer l'expiration des points périmés
            </button>
          </div>
        </div>
      )}

      {/* ── PACKS ── */}
      {activeSection === "packs" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button onClick={() => { setShowPackForm(true); setEditingPack(null); setPackForm({ nom: "", prix_fcfa: "", points_base: "", points_bonus: "", is_featured: false, ordre: 0 }) }} style={{
              background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
              border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer",
              color: "#000", fontWeight: 700, fontSize: "0.85rem",
              display: "flex", alignItems: "center", gap: 6
            }}>
              <Plus size={16} />
              Nouveau pack
            </button>
          </div>

          {/* Formulaire pack */}
          {showPackForm && (
            <div style={{
              background: C.card, border: `1px solid ${C.gold}`, borderRadius: 16,
              padding: "20px", marginBottom: 20
            }}>
              <h4 style={{ color: C.gold, margin: "0 0 16px" }}>
                {editingPack ? "Modifier le pack" : "Créer un pack"}
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Input label="Nom *" value={packForm.nom} onChange={v => setPackForm(p => ({ ...p, nom: v }))} placeholder="Ex: Confort" />
                <Input label="Prix (FCFA) *" type="number" value={packForm.prix_fcfa} onChange={v => setPackForm(p => ({ ...p, prix_fcfa: v }))} placeholder="Ex: 20000" />
                <Input label="Points acquis (base) *" type="number" value={packForm.points_base} onChange={v => setPackForm(p => ({ ...p, points_base: v }))} placeholder="Ex: 2000" />
                <Input label="Points bonus (expirent)" type="number" value={packForm.points_bonus} onChange={v => setPackForm(p => ({ ...p, points_bonus: v }))} placeholder="Ex: 400" />
                <Input label="Ordre d'affichage" type="number" value={String(packForm.ordre)} onChange={v => setPackForm(p => ({ ...p, ordre: Number(v) }))} placeholder="1" />
              </div>
              <Toggle
                label="Mettre en avant (Meilleur choix)"
                description="Affiche un badge 'Meilleur choix' sur ce pack"
                value={packForm.is_featured}
                onChange={v => setPackForm(p => ({ ...p, is_featured: v }))}
              />
              {packForm.prix_fcfa && packForm.points_base && (
                <div style={{
                  background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)",
                  borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: "0.82rem"
                }}>
                  <p style={{ margin: "0 0 4px", color: C.gold }}>
                    Total points : <strong>{formatPoints(Number(packForm.points_base) + Number(packForm.points_bonus || 0))}</strong>
                  </p>
                  <p style={{ margin: 0, color: C.muted }}>
                    Valeur perçue : <strong style={{ color: C.text }}>{formatFcfa((Number(packForm.points_base) + Number(packForm.points_bonus || 0)) * (settings?.valeur_point_fcfa || 10))}</strong>
                  </p>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleSavePack} style={{
                  flex: 1, background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
                  border: "none", borderRadius: 10, padding: "12px", cursor: "pointer",
                  color: "#000", fontWeight: 700, fontSize: "0.88rem",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                }}>
                  <Save size={14} />
                  {editingPack ? "Enregistrer" : "Créer le pack"}
                </button>
                <button onClick={() => { setShowPackForm(false); setEditingPack(null) }} style={{
                  background: C.bg, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "12px 18px", cursor: "pointer", color: C.muted
                }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Liste des packs */}
          {packs.map(pack => (
            <div key={pack.id} style={{
              background: C.card, border: `1px solid ${pack.is_featured ? C.gold : C.border}`,
              borderRadius: 14, padding: "16px 18px", marginBottom: 10,
              display: "flex", alignItems: "center", gap: 16
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <p style={{ margin: 0, color: "#fff", fontWeight: 600 }}>{pack.nom}</p>
                  {pack.is_featured && (
                    <span style={{
                      background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
                      borderRadius: 6, padding: "2px 8px", fontSize: "0.6rem", fontWeight: 700, color: "#000"
                    }}>
                      ⭐ MEILLEUR CHOIX
                    </span>
                  )}
                  {!pack.actif && (
                    <span style={{ background: "#2d0b0b", borderRadius: 6, padding: "2px 8px", fontSize: "0.6rem", color: C.red }}>
                      INACTIF
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ color: C.gold, fontWeight: 700 }}>{formatFcfa(pack.prix_fcfa)}</span>
                  <span style={{ color: C.green, fontSize: "0.82rem" }}>{formatPoints(pack.points_base)} pts acquis</span>
                  {pack.points_bonus > 0 && (
                    <span style={{ color: C.orange, fontSize: "0.82rem" }}>+{formatPoints(pack.points_bonus)} pts bonus</span>
                  )}
                  <span style={{ color: C.muted, fontSize: "0.78rem" }}>Valeur {formatFcfa((pack.points_base + pack.points_bonus) * (settings?.valeur_point_fcfa || 10))}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => handleEditPack(pack)} style={{
                  background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: C.blue
                }}>
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDeletePack(pack.id)} style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: C.red
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CLIENTS ── */}
      {activeSection === "clients" && (
        <div>
          <p style={{ color: C.muted, fontSize: "0.82rem", marginBottom: 16 }}>
            {wallets.length} client(s) avec un portefeuille fidélité
          </p>
          {wallets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
              <Users size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
              <p>Aucun client avec un portefeuille fidélité.</p>
            </div>
          ) : wallets.map(w => {
            const profile = w.profiles
            const total = (w.points_achetes || 0) + (w.points_gagnes || 0)
            const valeur = total * (settings?.valeur_point_fcfa || 10)
            return (
              <div key={w.id} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
                padding: "14px 16px", marginBottom: 10,
                display: "flex", alignItems: "center", gap: 14
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.goldDark}33, ${C.gold}33)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.gold, fontWeight: 700, fontSize: "0.9rem", flexShrink: 0
                }}>
                  {(profile?.prenom || profile?.nom || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
                    {profile?.prenom || ""} {profile?.nom || "Client sans profil"}
                  </p>
                  <p style={{ margin: 0, color: C.muted, fontSize: "0.75rem" }}>
                    {profile?.telephone || "—"} • {formatPoints(w.points_achetes)} pts acquis + {formatPoints(w.points_gagnes)} pts gagnés = <span style={{ color: C.gold }}>{formatFcfa(valeur)}</span>
                  </p>
                </div>
                <button onClick={() => setOctroiModal(w.id)} style={{
                  background: "rgba(212,175,55,0.1)", border: `1px solid ${C.goldDark}`,
                  borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                  color: C.gold, fontSize: "0.75rem", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 5, flexShrink: 0
                }}>
                  <Gift size={13} />
                  Octroyer
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── RÉSERVATIONS ── */}
      {activeSection === "reservations" && (
        <div>
          {reservations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
              <Calendar size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
              <p>Aucune réservation anticipée.</p>
            </div>
          ) : reservations.map(r => {
            const profile = r.profiles
            const couleur = { en_attente: C.orange, confirmee: C.blue, annulee: C.red, honoree: C.green }[r.statut] || C.muted
            return (
              <div key={r.id} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
                padding: "16px", marginBottom: 10
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ margin: "0 0 2px", color: "#fff", fontWeight: 600 }}>
                      {profile?.prenom || ""} {profile?.nom || "Client"} — {r.service_nom}
                    </p>
                    <p style={{ margin: "0 0 2px", color: C.muted, fontSize: "0.8rem" }}>
                      {new Date(r.date_rdv).toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {profile?.telephone && (
                      <p style={{ margin: 0, color: C.muted, fontSize: "0.75rem" }}>📞 {profile.telephone}</p>
                    )}
                  </div>
                  <span style={{
                    background: `${couleur}22`, color: couleur,
                    borderRadius: 8, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600
                  }}>
                    {r.statut.replace("_", " ")}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: r.statut === "en_attente" ? 12 : 0 }}>
                  <span style={{ color: C.muted, fontSize: "0.8rem" }}>Prix : <strong style={{ color: C.text }}>{formatFcfa(r.prix_service)}</strong></span>
                  {r.avance_payee && <span style={{ color: C.muted, fontSize: "0.8rem" }}>Avance : <strong style={{ color: C.gold }}>{formatFcfa(r.montant_avance)}</strong></span>}
                  {r.prix_final_cash && <span style={{ color: C.muted, fontSize: "0.8rem" }}>Solde dû : <strong style={{ color: C.green }}>{formatFcfa(r.prix_final_cash)}</strong></span>}
                </div>
                {r.statut === "en_attente" && (
                  <button onClick={() => handleHonorer(r.id)} style={{
                    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                    borderRadius: 8, padding: "8px 14px", cursor: "pointer",
                    color: C.green, fontSize: "0.8rem", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                    <CheckCircle size={14} />
                    Marquer comme honorée
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── PARAMÈTRES ── */}
      {activeSection === "parametres" && settings && (
        <div>
          {/* Question Fondatrice */}
          <div style={{
            background: `linear-gradient(135deg, ${C.goldDark}22, ${C.gold}22)`,
            border: `1px solid ${C.gold}`, borderRadius: 16, padding: "24px", marginBottom: 30
          }}>
            <h4 style={{ color: C.gold, margin: "0 0 12px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Crown size={20} /> QUESTION FONDATRICE
            </h4>
            <p style={{ color: C.text, fontSize: "0.9rem", margin: "0 0 16px", lineHeight: 1.5 }}>
              Lors de vos meilleures promos (Tabaski, fêtes...), quel est le <strong>rabais maximum</strong> que vous accordez sur vos services TOUT EN RESTANT BÉNÉFICIAIRE ?
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <input
                type="number"
                value={String(settings.reduction_max_acceptable_pct ?? "")}
                onChange={e => setSettings(prev => ({ ...prev, reduction_max_acceptable_pct: Number(e.target.value) }))}
                style={{
                  background: C.bg, border: `2px solid ${C.goldDark}`, borderRadius: 10,
                  padding: "12px", color: C.gold, fontSize: "1.2rem", fontWeight: 700,
                  width: 100, textAlign: "center", outline: "none"
                }}
              />
              <span style={{ color: C.gold, fontSize: "1.2rem", fontWeight: 700 }}>%</span>
            </div>
            {(() => {
              const R = Number(settings.reduction_max_acceptable_pct) || 40;
              return (
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "12px", fontSize: "0.85rem" }}>
                  <p style={{ margin: "0 0 6px", color: C.muted }}>Ce plafond verrouille tout le système :</p>
                  <p style={{ margin: "0 0 4px", color: C.text }}>↳ Plafond crédits / service : <strong style={{ color: C.orange }}>{Math.floor(R * 0.8)}%</strong> (Max déduction)</p>
                  <p style={{ margin: "0 0 4px", color: C.text }}>↳ Réduction boutique max : <strong style={{ color: C.blue }}>{Math.floor(R * 0.9)}%</strong></p>
                  <p style={{ margin: 0, color: C.text }}>↳ Cashback automatique : <strong style={{ color: C.green }}>{Math.floor(R * 0.1)}%</strong> (Points gagnés)</p>
                </div>
              )
            })()}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            {[
              { key: "valeur_point_fcfa", label: "Valeur 1 point (FCFA)", type: "number" },
              { key: "taux_cashback_pct_override", label: "Cashback auto (%) [Force optionnel]", type: "number" },
              { key: "expiration_points_gagnes_jours", label: "Expiration points gagnés (jours)", type: "number" },
              { key: "plafond_deduction_pct_override", label: "Plafond déduction / service (%) [Force optionnel]", type: "number" },
              { key: "montant_avance_resa", label: "Avance réservation (FCFA)", type: "number" },
              { key: "taux_reduction_resa_pct", label: "Réduction prochain RDV (%)", type: "number" },
              { key: "points_parrainage_parrain", label: "Points parrainage (parrain)", type: "number" },
              { key: "reduction_parrainage_filleul_pct", label: "Réduction parrainage (filleul %)", type: "number" },
              { key: "points_min_pour_utiliser", label: "Seuil minimum pour utiliser pts", type: "number" }
            ].map(field => (
              <Input
                key={field.key}
                label={field.label}
                type={field.type}
                value={String(settings[field.key] ?? "")}
                onChange={v => setSettings(prev => ({ ...prev, [field.key]: field.type === "number" ? Number(v) : v }))}
              />
            ))}
          </div>

          <Toggle
            label="Interdire cumul réservation + points"
            description="Si activé, une cliente ne peut pas utiliser ses points ET une réduction de réservation sur le même service"
            value={settings.cumul_resa_points_interdit}
            onChange={v => setSettings(prev => ({ ...prev, cumul_resa_points_interdit: v }))}
          />

          <Toggle
            label="Cashback sur achat de pack"
            description="Si activé, la cliente reçoit aussi du cashback (points gagnés) quand elle achète un pack"
            value={settings.cashback_sur_pack_actif || false}
            onChange={v => setSettings(prev => ({ ...prev, cashback_sur_pack_actif: v }))}
          />

          {/* Prévisualisation dynamique */}
          {settings.valeur_point_fcfa && (
            <div style={{
              background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: 14, padding: "16px", marginBottom: 20
            }}>
              <p style={{ margin: "0 0 12px", color: C.gold, fontWeight: 600, fontSize: "0.88rem" }}>
                📊 Simulation live — Service à 15 000 F (cliente avec 500 pts)
              </p>
              {(() => {
                const vpf = Math.max(0.1, Number(settings.valeur_point_fcfa) || 10)
                const R = Number(settings.reduction_max_acceptable_pct) || 40;
                const plafond_deduction_pct = settings.plafond_deduction_pct_override ?? Math.floor(R * 0.8);
                const taux_cashback_pct = settings.taux_cashback_pct_override ?? Math.floor(R * 0.1);
                
                const prix = 15000
                const seuil = Number(settings.points_min_pour_utiliser) || 0
                const solde = 500
                const seuilOk = solde >= seuil
                const plafond_pts = Math.floor(prix * (plafond_deduction_pct / 100) / vpf)
                const pts_utilises = seuilOk ? Math.min(plafond_pts, solde) : 0
                const reduction_max = pts_utilises * vpf
                const prix_cash = prix - reduction_max
                const cashback = Math.floor(prix_cash * (taux_cashback_pct / 100) / vpf)
                return (
                  <>
                    <p style={{ margin: "0 0 4px", color: C.text, fontSize: "0.82rem" }}>
                      → 1 pt = <strong style={{ color: C.gold }}>{Number(vpf).toLocaleString("fr-FR")} F</strong>
                    </p>
                    <p style={{ margin: "0 0 4px", color: C.text, fontSize: "0.82rem" }}>
                      → Seuil : <strong style={{ color: seuilOk ? C.green : C.red }}>{seuil} pts {seuilOk ? "✓ atteint" : "✗ non atteint"}</strong>
                    </p>
                    <p style={{ margin: "0 0 4px", color: C.text, fontSize: "0.82rem" }}>
                      → Plafond déduction : <strong style={{ color: C.orange }}>{plafond_pts} pts</strong> ({Number(plafond_pts * vpf).toLocaleString("fr-FR")} F)
                    </p>
                    <p style={{ margin: "0 0 4px", color: C.text, fontSize: "0.82rem" }}>
                      → Points utilisés : <strong style={{ color: C.blue }}>{pts_utilises} pts</strong> → réduction de <strong>{Number(reduction_max).toLocaleString("fr-FR")} F</strong>
                    </p>
                    <p style={{ margin: "0 0 4px", color: C.text, fontSize: "0.82rem" }}>
                      → Prix cash : <strong style={{ color: "#fff" }}>{Number(prix_cash).toLocaleString("fr-FR")} F</strong>
                    </p>
                    <p style={{ margin: 0, color: C.text, fontSize: "0.82rem" }}>
                      → Cashback gagné : <strong style={{ color: C.green }}>+{cashback} pts</strong> (expirent dans {settings.expiration_points_gagnes_jours}j)
                    </p>
                  </>
                )
              })()}
            </div>
          )}

          <button onClick={handleSaveSettings} disabled={saving} style={{
            background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
            border: "none", borderRadius: 12, padding: "14px 28px", cursor: saving ? "not-allowed" : "pointer",
            color: "#000", fontWeight: 700, fontSize: "0.9rem",
            display: "flex", alignItems: "center", gap: 8, opacity: saving ? 0.7 : 1
          }}>
            {saving ? <Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
            {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
          </button>
        </div>
      )}

      {/* ── AUDIT ── */}
      {activeSection === "audit" && (
        <div>
          <p style={{ color: C.muted, fontSize: "0.82rem", marginBottom: 16 }}>
            Historique des {auditLogs.length} dernières actions
          </p>
          {auditLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>
              <Shield size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
              <p>Aucune entrée dans le journal d'audit.</p>
            </div>
          ) : auditLogs.map(log => (
            <div key={log.id} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: "12px 16px", marginBottom: 8,
              display: "flex", gap: 14, alignItems: "flex-start"
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "rgba(168,85,247,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Shield size={14} color={C.purple} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", color: C.text, fontWeight: 500, fontSize: "0.85rem" }}>
                  {log.action}
                  {log.profiles && (
                    <span style={{ color: C.muted, fontWeight: 400 }}> — par {log.profiles.prenom} {log.profiles.nom}</span>
                  )}
                </p>
                {log.details && (
                  <p style={{ margin: "0 0 2px", color: C.muted, fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {JSON.stringify(log.details)}
                  </p>
                )}
                <p style={{ margin: 0, color: C.muted, fontSize: "0.7rem" }}>
                  {new Date(log.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal — Octroi manuel de points */}
      {octroiModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 3000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setOctroiModal(null)}>
          <div style={{
            background: "#111", borderRadius: 20, padding: "28px 24px",
            width: "100%", maxWidth: 400, border: `1px solid ${C.gold}`
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: C.gold, margin: "0 0 6px" }}>Octroyer des points</h3>
            <p style={{ color: C.muted, fontSize: "0.8rem", margin: "0 0 20px" }}>
              Tous les ajustements manuels sont loggés dans l'audit.
            </p>
            <Input
              label="Points acquis (n'expirent jamais)"
              type="number"
              value={octroiForm.points_achetes}
              onChange={v => setOctroiForm(p => ({ ...p, points_achetes: v }))}
              placeholder="Ex: 0"
            />
            <Input
              label="Points gagnés (expirent)"
              type="number"
              value={octroiForm.points_gagnes}
              onChange={v => setOctroiForm(p => ({ ...p, points_gagnes: v }))}
              placeholder="Ex: 200"
            />
            <Input
              label="Motif (obligatoire)"
              value={octroiForm.note}
              onChange={v => setOctroiForm(p => ({ ...p, note: v }))}
              placeholder="Ex: Compensation retard, geste commercial..."
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleOctroi} style={{
                flex: 1, background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
                border: "none", borderRadius: 10, padding: "12px", cursor: "pointer",
                color: "#000", fontWeight: 700, fontSize: "0.88rem"
              }}>
                Confirmer l'octroi
              </button>
              <button onClick={() => setOctroiModal(null)} style={{
                background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "12px 16px", cursor: "pointer", color: C.muted
              }}>
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
