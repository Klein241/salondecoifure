import React, { useState, useEffect } from "react";
import { getAppointments } from "../supabase";
import { getFideliteSettings } from "../fidelite";
import { getAllTransactions, getOrdersAdmin } from "../fidelite";
import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck } from "lucide-react";

const C = {
  bg: "#0b0b0b", card: "#111", border: "#222", text: "#e0e0e0", muted: "#666",
  gold: "#d4af37", green: "#22c55e", red: "#ef4444", orange: "#f97316"
};

export default function TresorerieWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [apps, txs, settings, orders] = await Promise.all([
        getAppointments(),
        getAllTransactions(),
        getFideliteSettings(),
        getOrdersAdmin()
      ]);

      // 1. CA Brut = RDV confirmés + Commandes
      const confirmedApps = apps.filter(a => a.status === "Confirmé" || a.status === "Terminé");
      const caApps = confirmedApps.reduce((acc, a) => acc + Number(a.price), 0);
      const caOrders = orders.filter(o => o.status !== "cancelled").reduce((acc, o) => acc + Number(o.total_fcfa), 0);
      const caBrut = caApps + caOrders;

      // 2. Réductions accordées = pts utilisés * valeur point
      // On filtre les transactions de type déduction (boutique et service)
      const deductions = txs.filter(t => t.type === "deduction_service" || t.type === "deduction_boutique");
      // le montant_fcfa est stocké en négatif pour les déductions
      const totalReductions = deductions.reduce((acc, t) => acc + Math.abs(t.montant_fcfa), 0);

      // 3. CA Net
      const caNet = caBrut - totalReductions;

      // 4. Taux de risque
      const tauxReel = caBrut > 0 ? (totalReductions / caBrut) * 100 : 0;
      const R = Number(settings.reduction_max_acceptable_pct) || 40;

      setData({
        caBrut,
        totalReductions,
        caNet,
        tauxReel,
        plafondMax: R
      });
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div style={{ color: C.muted, padding: 20 }}>Chargement de la trésorerie...</div>;
  if (!data) return null;

  const seuilOrange = data.plafondMax * 0.9;
  let risqueColor = C.green;
  let Icon = ShieldCheck;
  let statusText = "Contrôle OK";

  if (data.tauxReel >= data.plafondMax) {
    risqueColor = C.red;
    Icon = AlertTriangle;
    statusText = "DANGER : PERTE";
  } else if (data.tauxReel >= seuilOrange) {
    risqueColor = C.orange;
    Icon = AlertTriangle;
    statusText = "ATTENTION";
  }

  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={{ color: C.gold, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <TrendingUp size={20} /> Tableau de Bord Trésorerie
      </h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <p style={{ margin: "0 0 8px", color: C.muted, fontSize: "0.8rem", textTransform: "uppercase" }}>CA Brut (Global)</p>
          <p style={{ margin: 0, color: "#fff", fontSize: "1.5rem", fontWeight: "bold" }}>
            {data.caBrut.toLocaleString("fr-FR")} F
          </p>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <p style={{ margin: "0 0 8px", color: C.muted, fontSize: "0.8rem", textTransform: "uppercase" }}>Réductions (Crédits)</p>
          <p style={{ margin: 0, color: C.orange, fontSize: "1.5rem", fontWeight: "bold" }}>
            - {data.totalReductions.toLocaleString("fr-FR")} F
          </p>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <p style={{ margin: "0 0 8px", color: C.muted, fontSize: "0.8rem", textTransform: "uppercase" }}>CA Net (Encaissé)</p>
          <p style={{ margin: 0, color: C.green, fontSize: "1.5rem", fontWeight: "bold" }}>
            {data.caNet.toLocaleString("fr-FR")} F
          </p>
        </div>

        <div style={{ background: `${risqueColor}11`, border: `1px solid ${risqueColor}55`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <p style={{ margin: 0, color: risqueColor, fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "bold" }}>Risque Trésorerie</p>
            <Icon size={18} color={risqueColor} />
          </div>
          <p style={{ margin: "0 0 4px", color: "#fff", fontSize: "1.5rem", fontWeight: "bold" }}>
            {data.tauxReel.toFixed(1)}% <span style={{ fontSize: "0.8rem", color: C.muted, fontWeight: "normal" }}>/ {data.plafondMax}% max</span>
          </p>
          <p style={{ margin: 0, color: risqueColor, fontSize: "0.8rem", fontWeight: "bold" }}>
            {statusText}
          </p>
        </div>
      </div>
    </div>
  );
}
