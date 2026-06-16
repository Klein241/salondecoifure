import React, { useState, useEffect } from "react";
import { getStockMovements, adjustStock } from "../fidelite";
import { getProducts } from "../supabase";
import { Package, AlertTriangle, ArrowRight, ArrowLeft, RotateCcw, Save, X, RefreshCw } from "lucide-react";

const C = {
  bg: "#0b0b0b", card: "#111", border: "#222", text: "#e0e0e0", muted: "#666",
  gold: "#d4af37", green: "#22c55e", red: "#ef4444", orange: "#f97316"
};

export default function StockManager({ currentUser }) {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState("entree"); // entree, sortie_ajustement, correction
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [p, m] = await Promise.all([getProducts(), getStockMovements()]);
    setProducts(p.filter(x => x.stock_enabled !== false)); // only products with stock enabled (or default)
    setMovements(m);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!selectedProduct || !qty || qty <= 0) return;
    const result = await adjustStock(
      selectedProduct.id,
      selectedProduct.name,
      Number(qty),
      formType,
      note,
      currentUser?.id
    );
    if (result.success) {
      setShowModal(false);
      setQty("");
      setNote("");
      setSelectedProduct(null);
      loadData();
    }
  };

  if (loading) return <div style={{ color: C.muted, padding: 20 }}>Chargement du stock...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ color: C.gold, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Package size={20} /> Gestion des Stocks
        </h3>
        <button onClick={loadData} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <RefreshCw size={14} /> Rafraîchir
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 30 }}>
        {products.map(p => {
          const s = p.stock_quantity || 0;
          const thr = p.stock_alert_threshold || 5;
          let statusColor = C.green;
          if (s <= 0) statusColor = C.red;
          else if (s <= thr) statusColor = C.orange;

          return (
            <div key={p.id} style={{ background: C.card, border: `1px solid ${statusColor}44`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#fff" }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: C.muted }}>Seuil: {thr}</p>
                </div>
                <div style={{
                  background: `${statusColor}22`, color: statusColor, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 8, fontSize: "1.1rem"
                }}>
                  {s}
                </div>
              </div>

              {s <= 0 ? (
                <p style={{ margin: "0 0 12px", color: C.red, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertTriangle size={14} /> RUPTURE DE STOCK
                </p>
              ) : s <= thr ? (
                <p style={{ margin: "0 0 12px", color: C.orange, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertTriangle size={14} /> STOCK FAIBLE
                </p>
              ) : <div style={{ height: 26 }} />}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setSelectedProduct(p); setFormType("entree"); setShowModal(true); }} style={{
                  flex: 1, background: `${C.green}22`, border: "none", borderRadius: 8, padding: "8px", color: C.green, cursor: "pointer", fontSize: "0.8rem", display: "flex", justifyContent: "center", alignItems: "center", gap: 4
                }}>
                  <ArrowRight size={14} /> Entrée
                </button>
                <button onClick={() => { setSelectedProduct(p); setFormType("sortie_ajustement"); setShowModal(true); }} style={{
                  flex: 1, background: `${C.orange}22`, border: "none", borderRadius: 8, padding: "8px", color: C.orange, cursor: "pointer", fontSize: "0.8rem", display: "flex", justifyContent: "center", alignItems: "center", gap: 4
                }}>
                  <ArrowLeft size={14} /> Sortie
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h4 style={{ color: "#fff", marginBottom: 16 }}>Historique des mouvements</h4>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textAlign: "left" }}>
              <th style={{ padding: "10px 8px" }}>Date</th>
              <th style={{ padding: "10px 8px" }}>Produit</th>
              <th style={{ padding: "10px 8px" }}>Type</th>
              <th style={{ padding: "10px 8px", textAlign: "right" }}>Quantité</th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>Ancien → Nouveau</th>
              <th style={{ padding: "10px 8px" }}>Auteur / Note</th>
            </tr>
          </thead>
          <tbody>
            {movements.slice(0, 50).map(m => {
              const colors = {
                entree: C.green, sortie_vente: C.blue, sortie_ajustement: C.orange, correction: C.gold
              };
              const col = colors[m.movement_type] || C.muted;
              const sign = (m.movement_type === "entree" || m.movement_type === "correction") ? "+" : "-";
              return (
                <tr key={m.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 8px", color: C.muted }}>{new Date(m.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 8px", color: "#fff" }}>{m.product_name}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ background: `${col}22`, color: col, padding: "2px 6px", borderRadius: 4, fontSize: "0.75rem" }}>
                      {m.movement_type.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right", color: col, fontWeight: "bold" }}>
                    {sign}{m.quantity}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center", color: C.muted }}>
                    {m.quantity_before} → <span style={{ color: "#fff" }}>{m.quantity_after}</span>
                  </td>
                  <td style={{ padding: "12px 8px", color: C.muted }}>
                    {m.profiles ? `${m.profiles.prenom} ${m.profiles.nom}` : "Système"}
                    {m.note && <div style={{ fontSize: "0.75rem", fontStyle: "italic" }}>{m.note}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, width: "100%", maxWidth: 400 }}>
            <h3 style={{ color: "#fff", margin: "0 0 16px" }}>Mouvement de stock</h3>
            <p style={{ margin: "0 0 16px", color: C.gold, fontWeight: "bold" }}>{selectedProduct?.name}</p>
            
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { id: "entree", label: "Entrée" },
                { id: "sortie_ajustement", label: "Sortie (perte, etc)" },
                { id: "correction", label: "Correction (+)" }
              ].map(t => (
                <button key={t.id} onClick={() => setFormType(t.id)} style={{
                  flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${formType === t.id ? C.gold : C.border}`,
                  background: formType === t.id ? `${C.gold}22` : "transparent", color: formType === t.id ? C.gold : C.muted,
                  cursor: "pointer", fontSize: "0.8rem"
                }}>{t.label}</button>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: C.muted, fontSize: "0.8rem", marginBottom: 4 }}>Quantité</label>
              <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} style={{
                width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: "#fff", padding: "10px", borderRadius: 8, boxSizing: "border-box"
              }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: C.muted, fontSize: "0.8rem", marginBottom: 4 }}>Note / Motif</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} style={{
                width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: "#fff", padding: "10px", borderRadius: 8, boxSizing: "border-box"
              }} placeholder="Ex: Livraison fournisseur..." />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSave} style={{
                flex: 1, background: C.gold, border: "none", borderRadius: 8, padding: 12, fontWeight: "bold", cursor: "pointer",
                display: "flex", justifyContent: "center", alignItems: "center", gap: 6
              }}>
                <Save size={16} /> Enregistrer
              </button>
              <button onClick={() => setShowModal(false)} style={{
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", color: C.muted, cursor: "pointer"
              }}>
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
