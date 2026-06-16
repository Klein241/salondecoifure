import React, { useState, useEffect } from "react";
import { getAllWallets, octroierPointsAdmin, getOrdersAdmin } from "../fidelite";
import { getAppointments, updateAppointmentStatus } from "../supabase";
import StockManager from "./StockManager";
import TresorerieWidget from "./TresorerieWidget";
import { QRCodeSection } from "./QRCodeGenerator";
import { LayoutDashboard, Calendar, Package, Users, ShoppingBag, Gift, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const C = {
  bg: "#0b0b0b", card: "#111", border: "#222", text: "#e0e0e0", muted: "#666",
  gold: "#d4af37", green: "#22c55e", red: "#ef4444", orange: "#f97316"
};

export default function GerantDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointments, setAppointments] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Octroi manuel
  const [octroiModal, setOctroiModal] = useState(null);
  const [octroiForm, setOctroiForm] = useState({ points_achetes: "", points_gagnes: "", note: "" });

  const loadAllData = async () => {
    setLoading(true);
    const [apps, wals, ords] = await Promise.all([
      getAppointments(),
      getAllWallets(),
      getOrdersAdmin()
    ]);
    setAppointments(apps);
    setWallets(wals);
    setOrders(ords);
    setLoading(false);
  };

  useEffect(() => { loadAllData(); }, []);

  const handleUpdateAppStatus = async (id, status) => {
    await updateAppointmentStatus(id, status);
    loadAllData();
  };

  const handleOctroi = async () => {
    if (!octroiModal) return;
    const wallet = wallets.find(w => w.id === octroiModal);
    if (!wallet) return;
    const result = await octroierPointsAdmin(
      wallet.user_id,
      "ajustement_admin",
      Number(octroiForm.points_achetes) || 0,
      Number(octroiForm.points_gagnes) || 0,
      octroiForm.note,
      currentUser?.id
    );
    if (result.success) {
      setOctroiModal(null);
      setOctroiForm({ points_achetes: "", points_gagnes: "", note: "" });
      loadAllData();
    } else {
      alert(result.error);
    }
  };

  const tabs = [
    { id: "dashboard", label: "Trésorerie", icon: LayoutDashboard },
    { id: "appointments", label: "Rendez-vous", icon: Calendar },
    { id: "stock", label: "Stock", icon: Package },
    { id: "orders", label: "Commandes Shop", icon: ShoppingBag },
    { id: "clients", label: "Clients & Points", icon: Users }
  ];

  return (
    <div style={{ padding: "100px 24px", background: C.bg, minHeight: "100vh", color: C.text }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Banner */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 35 }}>
          <div>
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: C.gold, fontWeight: 600 }}>ESPACE GÉRANT</span>
            <h2 style={{ fontSize: "2rem", margin: "4px 0 0" }}>Bonjour, {currentUser?.prenom || currentUser?.name || "Gérant"}</h2>
          </div>
          <button onClick={onLogout} style={{ border: `1px solid ${C.red}55`, color: C.red, background: "transparent", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>
            Déconnexion
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 35, gap: 8, overflowX: "auto", paddingBottom: 8 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", border: "none",
              background: activeTab === tab.id ? `${C.gold}22` : "transparent",
              color: activeTab === tab.id ? C.gold : C.muted,
              borderRadius: 8, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
              borderBottom: activeTab === tab.id ? `2px solid ${C.gold}` : "none",
            }}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: DASHBOARD / TRESORERIE */}
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <TresorerieWidget />
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "30px" }}>
              <QRCodeSection siteUrl={window.location.origin} />
            </div>
          </div>
        )}

        {/* TAB: RENDEZ-VOUS */}
        {activeTab === "appointments" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ color: C.gold }}>Rendez-vous récents</h3>
              <button onClick={loadAllData} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", color: C.muted, cursor: "pointer" }}><RefreshCw size={14}/></button>
            </div>
            {appointments.map(app => (
              <div key={app.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#fff" }}>{app.clientName} - {app.serviceName}</h4>
                    <p style={{ margin: 0, color: C.muted, fontSize: "0.85rem" }}>{new Date(app.date).toLocaleDateString()} à {app.time} • {app.clientPhone}</p>
                  </div>
                  <div>
                    <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: "0.8rem", background: `${C.border}`, color: C.text }}>{app.status}</span>
                  </div>
                </div>
                {app.status === "En attente" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <button onClick={() => handleUpdateAppStatus(app.id, "Confirmé")} style={{ background: `${C.green}22`, color: C.green, border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><CheckCircle size={14}/> Confirmer</button>
                    <button onClick={() => handleUpdateAppStatus(app.id, "Annulé")} style={{ background: `${C.red}22`, color: C.red, border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><XCircle size={14}/> Annuler</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB: STOCK */}
        {activeTab === "stock" && (
          <StockManager currentUser={currentUser} />
        )}

        {/* TAB: COMMANDES */}
        {activeTab === "orders" && (
          <div>
            <h3 style={{ color: C.gold, marginBottom: 20 }}>Commandes Boutique</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textAlign: "left" }}>
                  <th style={{ padding: "10px 8px" }}>Date</th>
                  <th style={{ padding: "10px 8px" }}>Client</th>
                  <th style={{ padding: "10px 8px" }}>Paiement</th>
                  <th style={{ padding: "10px 8px" }}>Total</th>
                  <th style={{ padding: "10px 8px" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 8px", color: C.muted }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 8px", color: "#fff" }}>{o.client_name} <br/><span style={{ color: C.muted, fontSize: "0.75rem" }}>{o.client_phone}</span></td>
                    <td style={{ padding: "12px 8px" }}>{o.payment_method} {o.points_used > 0 && <span style={{ color: C.gold }}>({o.points_used} pts)</span>}</td>
                    <td style={{ padding: "12px 8px", color: C.green, fontWeight: "bold" }}>{Number(o.total_fcfa).toLocaleString()} F</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{ padding: "4px 8px", borderRadius: 6, background: `${C.border}` }}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: CLIENTS */}
        {activeTab === "clients" && (
          <div>
            <h3 style={{ color: C.gold, marginBottom: 20 }}>Clients & Portefeuilles</h3>
            {wallets.map(w => (
              <div key={w.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px", color: "#fff" }}>{w.profiles?.prenom} {w.profiles?.nom}</h4>
                  <p style={{ margin: 0, color: C.muted, fontSize: "0.85rem" }}>{w.profiles?.telephone} • {w.points_achetes + w.points_gagnes} pts</p>
                </div>
                <button onClick={() => setOctroiModal(w.id)} style={{ background: `${C.gold}22`, border: `1px solid ${C.gold}`, borderRadius: 8, padding: "8px 12px", color: C.gold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Gift size={14}/> Octroyer Pts
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {octroiModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setOctroiModal(null)}>
          <div style={{ background: "#111", borderRadius: 20, padding: 24, width: "100%", maxWidth: 400, border: `1px solid ${C.gold}` }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: C.gold, margin: "0 0 16px" }}>Octroyer des points</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: C.muted, fontSize: "0.8rem", marginBottom: 4 }}>Points acquis (n'expirent jamais)</label>
              <input type="number" value={octroiForm.points_achetes} onChange={e => setOctroiForm({...octroiForm, points_achetes: e.target.value})} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: "#fff", padding: 10, borderRadius: 8, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: C.muted, fontSize: "0.8rem", marginBottom: 4 }}>Points gagnés (expirent)</label>
              <input type="number" value={octroiForm.points_gagnes} onChange={e => setOctroiForm({...octroiForm, points_gagnes: e.target.value})} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: "#fff", padding: 10, borderRadius: 8, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: C.muted, fontSize: "0.8rem", marginBottom: 4 }}>Motif</label>
              <input type="text" value={octroiForm.note} onChange={e => setOctroiForm({...octroiForm, note: e.target.value})} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: "#fff", padding: 10, borderRadius: 8, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleOctroi} style={{ flex: 1, background: C.gold, border: "none", borderRadius: 10, padding: 12, color: "#000", fontWeight: "bold", cursor: "pointer" }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
