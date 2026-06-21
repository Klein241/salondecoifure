import { useState, useEffect, useCallback } from "react"
import { supabase } from "../supabase"

const WHATSAPP = "237698548016"
const GOLD = "#B8860B"
const CREAM = "#FDF6EC"
const DARK = "#1C1C1C"
const LS_PANIER = "abaia_panier_v3"

// ─── Catalogue fallback (localStorage/défaut) ─────────────────────────────────
const DEFAULT_CATALOGUE = [
  { categorie_id:"lait-corps", categorie_nom:"Lait Pour le Corps", icon:"🧴", produits:[
    { id:"lc1", nom:"Lait hydratant",           prix:5000, ordre:1 },
    { id:"lc2", nom:"Lait teint caramel",        prix:6500, ordre:2 },
    { id:"lc3", nom:"Lait teint clair",          prix:7500, ordre:3 },
    { id:"lc4", nom:"Lait teint métisse",       prix:10000, ordre:4 },
    { id:"lc5", nom:"Lait teint blanchissant",  prix:15000, ordre:5 },
  ]},
  { categorie_id:"gel-douche", categorie_nom:"Gel Douches", icon:"🚿", produits:[
    { id:"gd1", nom:"Gel douche Perfect Glow",  prix:4000, ordre:1 },
    { id:"gd2", nom:"Gel douche métisse",        prix:6500, ordre:2 },
    { id:"gd3", nom:"Gel douche blanchissant",  prix:8000, ordre:3 },
  ]},
  { categorie_id:"creme-visage", categorie_nom:"Crème Visage", icon:"✨", produits:[
    { id:"cv1", nom:"Crème visage hydratant",             prix:2500, ordre:1 },
    { id:"cv2", nom:"Crème visage teint caramel",         prix:3000, ordre:2 },
    { id:"cv3", nom:"Crème visage teint clair",           prix:3500, ordre:3 },
    { id:"cv4", nom:"Crème visage teint métisse",         prix:4000, ordre:4 },
    { id:"cv5", nom:"Crème visage teint blanchissant",    prix:5000, ordre:5 },
  ]},
  { categorie_id:"gommage", categorie_nom:"Gommage", icon:"💎", produits:[
    { id:"g1", nom:"Gommage éclat",         prix:5000, ordre:1 },
    { id:"g2", nom:"Gommage au café",        prix:5000, ordre:2 },
    { id:"g3", nom:"Gommage blanchissant",  prix:8000, ordre:3 },
  ]},
  { categorie_id:"gamme", categorie_nom:"Gamme des Produits", icon:"👑", produits:[
    { id:"gp1", nom:"Gamme nature",       prix:16000, ordre:1 },
    { id:"gp2", nom:"Gamme caramel",      prix:24000, ordre:2 },
    { id:"gp3", nom:"Gamme éclat",        prix:27000, ordre:3 },
    { id:"gp4", nom:"Gamme métisse",     prix:31000, ordre:4 },
    { id:"gp5", nom:"Gamme blanchissant",prix:38000, ordre:5 },
  ]},
  { categorie_id:"glow-oil", categorie_nom:"Les Glow Oil", icon:"🌟", produits:[
    { id:"go1", nom:"Huile clarifiante",      prix:4000, ordre:1 },
    { id:"go2", nom:"Huile éclaircissante",   prix:5000, ordre:2 },
    { id:"go3", nom:"Huile métisse",          prix:6000, ordre:3 },
  ]},
]

const CAT_ICONS = {
  "lait-corps":"🧴","gel-douche":"🚿","creme-visage":"✨",
  "gommage":"💎","gamme":"👑","glow-oil":"🌟"
}

const fmt = (p) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA"

// ─── Supabase helpers ─────────────────────────────────────────────────────────
async function fetchCatalogue() {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from("abaia_products")
      .select("*")
      .eq("active", true)
      .order("categorie_id")
      .order("ordre")
    if (error) throw error
    // Regrouper par catégorie
    const bycat = {}
    for (const p of data) {
      if (!bycat[p.categorie_id]) {
        bycat[p.categorie_id] = {
          categorie_id: p.categorie_id,
          categorie_nom: p.categorie_nom,
          icon: CAT_ICONS[p.categorie_id] || p.icon || "✨",
          produits: []
        }
      }
      bycat[p.categorie_id].produits.push({ id: p.id, nom: p.nom, prix: p.prix, ordre: p.ordre })
    }
    return Object.values(bycat)
  } catch (e) {
    console.warn("Supabase fetchCatalogue fallback:", e.message)
    return null
  }
}

async function fetchSettings() {
  if (!supabase) return {}
  try {
    const { data, error } = await supabase.from("abaia_settings").select("key,value")
    if (error) throw error
    return Object.fromEntries(data.map(r => [r.key, r.value]))
  } catch (e) {
    console.warn("Supabase fetchSettings fallback:", e.message)
    return {}
  }
}

async function updateProduct(id, changes) {
  if (!supabase) return false
  const { error } = await supabase.from("abaia_products").update(changes).eq("id", id)
  return !error
}

async function deleteProduct(id) {
  if (!supabase) return false
  const { error } = await supabase.from("abaia_products").update({ active: false }).eq("id", id)
  return !error
}

async function addProduct(produit) {
  if (!supabase) return null
  const { data, error } = await supabase.from("abaia_products").insert(produit).select().single()
  if (error) { console.error(error); return null }
  return data
}

async function saveSetting(key, value) {
  if (!supabase) return false
  const { error } = await supabase.from("abaia_settings").upsert({ key, value })
  return !error
}

async function saveAllSettings(settings) {
  if (!supabase) return false
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value }))
  const { error } = await supabase.from("abaia_settings").upsert(rows)
  return !error
}

// ─── PANIER ───────────────────────────────────────────────────────────────────
function AbaiaPanier({ panier, setPanier, onClose }) {
  const total = panier.reduce((s,i) => s + i.prix * i.qty, 0)
  const [sent, setSent] = useState(false)

  const update = (id, delta) => setPanier(p => {
    const next = p.map(i => i.id === id ? {...i, qty: i.qty + delta} : i).filter(i => i.qty > 0)
    localStorage.setItem(LS_PANIER, JSON.stringify(next)); return next
  })
  const remove = (id) => setPanier(p => {
    const next = p.filter(i => i.id !== id)
    localStorage.setItem(LS_PANIER, JSON.stringify(next)); return next
  })
  const commander = () => {
    if (!panier.length) return
    const txt = panier.map(i => `▸ ${i.nom} ×${i.qty} = ${fmt(i.prix * i.qty)}`).join("\n")
    const msg = encodeURIComponent(`Bonjour Abaïa Cosmétique 👋\n\nMa commande :\n${txt}\n\n━━━━\nTOTAL : ${fmt(total)}\n\nMerci de confirmer 🙏`)
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank")
    setPanier([]); localStorage.removeItem(LS_PANIER)
    setSent(true); setTimeout(() => { setSent(false); onClose() }, 2000)
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:9999,
      display:"flex", justifyContent:"flex-end" }} onClick={onClose}>
      <div style={{ width:"min(400px,100vw)", background: CREAM, height:"100%",
        overflowY:"auto", padding:"24px", display:"flex", flexDirection:"column",
        boxShadow:"-4px 0 40px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", color: GOLD }}>🛒 Mon Panier</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"1.4rem", cursor:"pointer", color:"#888" }}>✕</button>
        </div>
        {sent ? (
          <div style={{ textAlign:"center", padding:"40px", color: GOLD }}>
            <div style={{ fontSize:"3rem", marginBottom:"16px" }}>✅</div>
            <p style={{ fontWeight:700 }}>Commande envoyée via WhatsApp !</p>
          </div>
        ) : !panier.length ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#888" }}>
            <div style={{ fontSize:"3rem", marginBottom:"12px" }}>🛒</div>
            <p>Votre panier est vide</p>
          </div>
        ) : (
          <>
            <div style={{ flex:1, overflowY:"auto" }}>
              {panier.map(item => (
                <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"14px 0", borderBottom:"1px solid rgba(197,165,90,0.15)" }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600, fontSize:"0.88rem", marginBottom:"4px" }}>{item.nom}</p>
                    <p style={{ fontSize:"0.78rem", color:"#888" }}>
                      {fmt(item.prix)} × {item.qty} = <strong style={{ color: GOLD }}>{fmt(item.prix*item.qty)}</strong>
                    </p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    <button onClick={() => update(item.id,-1)} style={{ width:"28px", height:"28px", borderRadius:"50%", border:`1px solid rgba(184,134,11,0.3)`, background:"transparent", color: GOLD, cursor:"pointer", fontSize:"1rem" }}>−</button>
                    <span style={{ fontWeight:700, minWidth:"20px", textAlign:"center" }}>{item.qty}</span>
                    <button onClick={() => update(item.id,+1)} style={{ width:"28px", height:"28px", borderRadius:"50%", border:`1px solid rgba(184,134,11,0.3)`, background:"transparent", color: GOLD, cursor:"pointer", fontSize:"1rem" }}>+</button>
                    <button onClick={() => remove(item.id)} style={{ background:"none", border:"none", color:"#cc4444", cursor:"pointer", fontSize:"1rem", marginLeft:"4px" }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:"20px", padding:"16px", background:"rgba(184,134,11,0.06)", borderRadius:"12px", border:"1px solid rgba(184,134,11,0.15)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"14px" }}>
                <span style={{ fontWeight:600 }}>Total</span>
                <span style={{ fontWeight:800, color: GOLD, fontSize:"1.1rem" }}>{fmt(total)}</span>
              </div>
              <button onClick={commander} style={{ width:"100%", padding:"14px", background:`linear-gradient(135deg,${GOLD},#8B6914)`, border:"none", borderRadius:"10px", color:"#fff", fontWeight:700, fontSize:"0.9rem", cursor:"pointer" }}>
                📱 Commander via WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AbaiaAdmin({ onBack }) {
  const [catalogue, setCatalogue] = useState([])
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("produits")
  const [toast, setToast] = useState(null)
  const [showAdd, setShowAdd] = useState(null)
  const [newProd, setNewProd] = useState({ nom:"", prix:"", categorie_id:"", categorie_nom:"", icon:"✨", ordre:99 })
  const [saving, setSaving] = useState({})

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    (async () => {
      setLoading(true)
      const [cat, sets] = await Promise.all([fetchCatalogue(), fetchSettings()])
      setCatalogue(cat || DEFAULT_CATALOGUE)
      const lsSets = (() => { try { return JSON.parse(localStorage.getItem("abaia_siteinfo") || "{}") } catch(e) { return {} } })()
      setSettings({ ...lsSets, ...sets })
      setLoading(false)
    })()
  }, [])

  const handleUpdatePrix = async (id, prix) => {
    setSaving(s => ({...s, [id]: true}))
    const ok = supabase ? await updateProduct(id, { prix: parseInt(prix) || 0 }) : true
    if (!ok) showToast("Erreur mise à jour prix", "error")
    else {
      // Update local state
      setCatalogue(c => c.map(cat => ({...cat, produits: cat.produits.map(p => p.id === id ? {...p, prix: parseInt(prix) || 0} : p)})))
      showToast("Prix mis à jour ✓")
    }
    setSaving(s => ({...s, [id]: false}))
  }

  const handleUpdateNom = async (id, nom) => {
    const ok = supabase ? await updateProduct(id, { nom }) : true
    if (ok) { setCatalogue(c => c.map(cat => ({...cat, produits: cat.produits.map(p => p.id === id ? {...p, nom} : p)}))); showToast("Nom mis à jour ✓") }
    else showToast("Erreur", "error")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return
    const ok = supabase ? await deleteProduct(id) : true
    if (ok) { setCatalogue(c => c.map(cat => ({...cat, produits: cat.produits.filter(p => p.id !== id)}))); showToast("Produit supprimé") }
    else showToast("Erreur suppression", "error")
  }

  const handleAdd = async (catId) => {
    if (!newProd.nom || !newProd.prix) { showToast("Nom et prix requis", "error"); return }
    const catInfo = catalogue.find(c => c.categorie_id === catId)
    const row = { categorie_id: catId, categorie_nom: catInfo?.categorie_nom || catId, icon: catInfo?.icon || "✨", nom: newProd.nom, prix: parseInt(newProd.prix) || 0, ordre: newProd.ordre }
    let added
    if (supabase) {
      added = await addProduct(row)
      if (!added) { showToast("Erreur ajout produit", "error"); return }
    } else {
      added = { ...row, id: "local_" + Date.now() }
    }
    setCatalogue(c => c.map(cat => cat.categorie_id === catId ? { ...cat, produits: [...cat.produits, { id: added.id, nom: added.nom, prix: added.prix, ordre: added.ordre }] } : cat))
    setNewProd({ nom:"", prix:"", categorie_id:"", categorie_nom:"", icon:"✨", ordre:99 })
    setShowAdd(null)
    showToast("Produit ajouté !")
  }

  const handleSaveSettings = async () => {
    setSaving(s => ({...s, settings: true}))
    const ok = await saveAllSettings(settings)
    localStorage.setItem("abaia_siteinfo", JSON.stringify(settings))
    setSaving(s => ({...s, settings: false}))
    showToast(ok ? "Paramètres sauvegardés !" : "Sauvegardé localement (Supabase non configuré)")
  }

  const s = {
    page: { minHeight:"100vh", background: CREAM, fontFamily:"'Poppins',system-ui,sans-serif" },
    header: { background: DARK, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"60px", position:"sticky", top:0, zIndex:100, flexWrap:"wrap", gap:"8px" },
    tab: (a) => ({ padding:"8px 16px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"0.8rem", fontWeight:600, background: a ? GOLD : "rgba(255,255,255,0.08)", color: a ? DARK : "#aaa", transition:"all 0.2s" }),
    card: { background:"#fff", borderRadius:"16px", padding:"20px", boxShadow:"0 4px 20px rgba(0,0,0,0.06)", marginBottom:"20px", border:"1px solid rgba(197,165,90,0.15)" },
    input: { width:"100%", padding:"10px 14px", borderRadius:"8px", border:"1px solid rgba(197,165,90,0.3)", fontSize:"0.88rem", outline:"none", color: DARK, background:"#fff", boxSizing:"border-box" },
    btnGold: { padding:"10px 20px", borderRadius:"8px", border:"none", background:`linear-gradient(135deg,${GOLD},#8B6914)`, color:"#fff", fontWeight:700, fontSize:"0.82rem", cursor:"pointer" },
    btnDanger: { padding:"6px 10px", borderRadius:"6px", border:"none", background:"rgba(220,53,69,0.1)", color:"#dc3545", fontWeight:600, fontSize:"0.78rem", cursor:"pointer" },
    row: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(197,165,90,0.1)", gap:"8px", flexWrap:"wrap" },
    priceInput: { width:"110px", padding:"6px 10px", borderRadius:"6px", border:"1px solid rgba(197,165,90,0.3)", fontSize:"0.85rem", fontWeight:700, color: GOLD, textAlign:"right", outline:"none" },
  }

  if (loading) return (
    <div style={{ ...s.page, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"2.5rem", marginBottom:"12px", animation:"spin 1s linear infinite" }}>✨</div>
        <p style={{ color: GOLD }}>Chargement depuis Supabase...</p>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ color: GOLD, fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", fontWeight:700 }}>
          ⚙️ Admin — Abaïa Cosmétique {supabase ? "🟢" : "🟡 (local)"}
        </span>
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
          {[["produits","📦 Produits"],["infos","ℹ️ Infos Site"],["stats","📊 Stats"]].map(([id,label]) => (
            <button key={id} style={s.tab(activeTab===id)} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
          <button onClick={onBack} style={s.tab(false)}>← Site</button>
        </div>
      </div>

      {toast && (
        <div style={{ position:"fixed", top:"70px", right:"20px", zIndex:9999, padding:"12px 20px",
          borderRadius:"10px", background: toast.type==="error" ? "#dc3545" : `linear-gradient(135deg,${GOLD},#8B6914)`,
          color:"#fff", fontWeight:600, fontSize:"0.85rem", boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast.type==="error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"28px 16px" }}>

        {/* ── PRODUITS ─────────────────────────────────────────────── */}
        {activeTab === "produits" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", color: DARK }}>
                📦 Catalogue {supabase ? <span style={{ fontSize:"0.8rem", color:"#4caf50", fontFamily:"sans-serif" }}>● Supabase</span> : <span style={{ fontSize:"0.8rem", color:"#ff9800", fontFamily:"sans-serif" }}>● Local</span>}
              </h2>
            </div>
            {!supabase && (
              <div style={{ padding:"12px 16px", background:"rgba(255,152,0,0.1)", border:"1px solid rgba(255,152,0,0.3)", borderRadius:"8px", marginBottom:"20px", fontSize:"0.82rem", color:"#e65100" }}>
                ⚠️ Supabase non configuré — les données ne sont stockées que localement. Exécutez la migration SQL pour activer la persistance.
              </div>
            )}
            {catalogue.map(cat => (
              <div key={cat.categorie_id} style={s.card}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
                  <span style={{ fontSize:"1.3rem" }}>{cat.icon}</span>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", color: DARK }}>{cat.categorie_nom}</h3>
                  <span style={{ marginLeft:"auto", fontSize:"0.72rem", color:"#888" }}>{cat.produits.length} produits</span>
                </div>
                {cat.produits.map(p => (
                  <div key={p.id} style={s.row}>
                    <input defaultValue={p.nom}
                      onBlur={e => { if (e.target.value !== p.nom) handleUpdateNom(p.id, e.target.value) }}
                      style={{ flex:1, padding:"6px 8px", border:"1px solid transparent", borderRadius:"6px", fontSize:"0.85rem", color: DARK, background:"transparent", outline:"none", minWidth:"120px" }}
                      onFocus={e => e.target.style.border="1px solid rgba(197,165,90,0.4)"}
                      onBlurCapture={e => e.target.style.border="1px solid transparent"} />
                    <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                      <input type="number" defaultValue={p.prix}
                        onBlur={e => { if (parseInt(e.target.value) !== p.prix) handleUpdatePrix(p.id, e.target.value) }}
                        style={s.priceInput} />
                      <span style={{ fontSize:"0.7rem", color:"#888", whiteSpace:"nowrap" }}>FCFA</span>
                      {saving[p.id] && <span style={{ fontSize:"0.7rem", color: GOLD }}>⏳</span>}
                    </div>
                    <button onClick={() => handleDelete(p.id)} style={s.btnDanger}>🗑</button>
                  </div>
                ))}
                {showAdd === cat.categorie_id ? (
                  <div style={{ marginTop:"12px", padding:"12px", background:"rgba(184,134,11,0.04)", borderRadius:"8px", border:"1px dashed rgba(184,134,11,0.3)" }}>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      <input placeholder="Nom du produit" value={newProd.nom}
                        onChange={e => setNewProd(p => ({...p, nom: e.target.value}))}
                        style={{ ...s.input, flex:2, minWidth:"140px" }} />
                      <input type="number" placeholder="Prix FCFA" value={newProd.prix}
                        onChange={e => setNewProd(p => ({...p, prix: e.target.value}))}
                        style={{ ...s.input, flex:1, minWidth:"100px" }} />
                      <button onClick={() => handleAdd(cat.categorie_id)} style={s.btnGold}>+ Ajouter</button>
                      <button onClick={() => setShowAdd(null)} style={s.btnDanger}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setShowAdd(cat.categorie_id); setNewProd({ nom:"", prix:"", ordre:cat.produits.length+1 }) }}
                    style={{ marginTop:"10px", background:"none", border:"1px dashed rgba(184,134,11,0.25)", color: GOLD, borderRadius:"8px", padding:"7px 16px", cursor:"pointer", fontSize:"0.78rem", width:"100%" }}>
                    + Ajouter un produit
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── INFOS SITE ────────────────────────────────────────────── */}
        {activeTab === "infos" && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", color: DARK, marginBottom:"20px" }}>ℹ️ Informations du Site</h2>
            <div style={s.card}>
              {[["nom","Nom de la marque","Abaïa Cosmétique"],["slogan","Slogan","Élevez Votre Éclat Naturel"],["whatsapp","WhatsApp","+237 6 98 54 80 16"],["email","Email","contact@abaia.com"],["adresse","Adresse","Cameroun"],["description","Description",""]]
                .map(([key,label,placeholder]) => (
                <div key={key} style={{ marginBottom:"18px" }}>
                  <label style={{ display:"block", marginBottom:"6px", fontSize:"0.74rem", color:"#888", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</label>
                  {key === "description" ? (
                    <textarea value={settings[key] || ""} rows={3} placeholder={placeholder}
                      onChange={e => setSettings(s => ({...s, [key]: e.target.value}))}
                      style={{ ...s.input, resize:"vertical" }} />
                  ) : (
                    <input value={settings[key] || ""} placeholder={placeholder}
                      onChange={e => setSettings(s => ({...s, [key]: e.target.value}))}
                      style={s.input} />
                  )}
                </div>
              ))}
              <button onClick={handleSaveSettings} style={s.btnGold} disabled={saving.settings}>
                {saving.settings ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
              </button>
            </div>
          </div>
        )}

        {/* ── STATS ────────────────────────────────────────────────── */}
        {activeTab === "stats" && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", color: DARK, marginBottom:"20px" }}>📊 Statistiques</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"16px", marginBottom:"24px" }}>
              {[
                ["🏷️", "Catégories", catalogue.length],
                ["📦", "Produits total", catalogue.reduce((s,c) => s+c.produits.length, 0)],
                ["💰", "Prix moyen", fmt(Math.round(catalogue.flatMap(c=>c.produits.map(p=>p.prix)).reduce((a,b,_,arr)=>a+b/arr.length,0)))],
                ["📉", "Prix min", fmt(Math.min(...catalogue.flatMap(c=>c.produits.map(p=>p.prix))))],
                ["📈", "Prix max", fmt(Math.max(...catalogue.flatMap(c=>c.produits.map(p=>p.prix))))],
                ["🗄️", "Stockage", supabase ? "Supabase ✓" : "Local"],
              ].map(([icon,label,val]) => (
                <div key={label} style={{ ...s.card, textAlign:"center", padding:"20px", marginBottom:0 }}>
                  <div style={{ fontSize:"1.6rem", marginBottom:"8px" }}>{icon}</div>
                  <div style={{ fontWeight:700, color: GOLD, fontSize:"1rem", marginBottom:"4px" }}>{val}</div>
                  <div style={{ fontSize:"0.72rem", color:"#888" }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={s.card}>
              <h3 style={{ fontSize:"1rem", fontWeight:700, color: DARK, marginBottom:"16px" }}>Répartition par catégorie</h3>
              {catalogue.map(cat => {
                const total = catalogue.reduce((s,c) => s+c.produits.length, 0)
                const pct = Math.round((cat.produits.length / total) * 100)
                return (
                  <div key={cat.categorie_id} style={{ marginBottom:"10px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.82rem", marginBottom:"4px" }}>
                      <span>{cat.icon} {cat.categorie_nom}</span>
                      <span style={{ color: GOLD }}>{cat.produits.length} produits ({pct}%)</span>
                    </div>
                    <div style={{ height:"6px", background:"rgba(197,165,90,0.1)", borderRadius:"3px" }}>
                      <div style={{ width:`${pct}%`, height:"100%", background: GOLD, borderRadius:"3px", transition:"width 0.5s ease" }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={s.card}>
              <h3 style={{ fontSize:"1rem", fontWeight:700, color: DARK, marginBottom:"12px" }}>📱 Commandes WhatsApp</h3>
              <p style={{ color:"#888", fontSize:"0.85rem" }}>Numéro actif : <strong style={{ color: GOLD }}>{settings.whatsapp || "+237 6 98 54 80 16"}</strong></p>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
                style={{ display:"inline-block", marginTop:"12px", ...s.btnGold, textDecoration:"none" }}>
                Ouvrir WhatsApp Business ↗
              </a>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from {transform:rotate(0deg)} to {transform:rotate(360deg)} }`}</style>
    </div>
  )
}

// ─── SITE PRINCIPAL ───────────────────────────────────────────────────────────
function AbaiaMain() {
  const [catalogue, setCatalogue] = useState(DEFAULT_CATALOGUE)
  const [settings, setSettings] = useState({})
  const [panier, setPanier] = useState(() => { try { return JSON.parse(localStorage.getItem(LS_PANIER) || "[]") } catch(e) { return [] } })
  const [showPanier, setShowPanier] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("accueil")
  const [searchShop, setSearchShop] = useState("")
  const [activeCat, setActiveCat] = useState("all")
  const [sbLoading, setSbLoading] = useState(true)

  useEffect(() => {
    // Set Abaia branding
    let link = document.querySelector("link[rel~='icon']")
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link) }
    link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23FDF6EC"/><text y=".9em" font-size="75" x="12">✨</text></svg>'
    document.title = "Abaïa Cosmétique — Élevez Votre Éclat Naturel"

    // Load from Supabase
    ;(async () => {
      const [cat, sets] = await Promise.all([fetchCatalogue(), fetchSettings()])
      if (cat && cat.length) setCatalogue(cat)
      const lsSets = (() => { try { return JSON.parse(localStorage.getItem("abaia_siteinfo") || "{}") } catch(e) { return {} } })()
      setSettings({ ...lsSets, ...sets })
      setSbLoading(false)
    })()

    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", h)
    return () => {
      window.removeEventListener("scroll", h)
      document.title = "Hosanne Platform"
    }
  }, [])

  const totalItems = panier.reduce((s,i) => s + i.qty, 0)

  const ajouterPanier = (produit, catNom) => {
    setPanier(prev => {
      const ex = prev.find(i => i.id === produit.id)
      const next = ex ? prev.map(i => i.id === produit.id ? {...i, qty:i.qty+1} : i) : [...prev, {...produit, catNom, qty:1}]
      localStorage.setItem(LS_PANIER, JSON.stringify(next)); return next
    })
  }

  const cmdWa = (msg) => {
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Bonjour Abaïa Cosmétique 👋\n" + msg + "\n\nMerci 🙏")}`, "_blank")
  }

  const scrollTo = (id) => {
    setActiveSection(id)
    document.getElementById("ab-" + id)?.scrollIntoView({ behavior:"smooth" })
  }

  const allProduits = catalogue.flatMap(cat => cat.produits.map(p => ({...p, catId: cat.categorie_id, catNom: cat.categorie_nom, icon: cat.icon})))
  const shopFiltered = allProduits.filter(p => {
    const mS = !searchShop || p.nom.toLowerCase().includes(searchShop.toLowerCase())
    const mC = activeCat === "all" || p.catId === activeCat
    return mS && mC
  })

  const nm = settings.nom || "Abaïa Cosmétique"
  const sl = settings.slogan || "Élevez Votre Éclat Naturel"

  return (
    <div style={{ minHeight:"100vh", background: CREAM, fontFamily:"'Poppins',system-ui,sans-serif", color: DARK, overflowX:"hidden" }}>

      {/* NAVBAR */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:1000, background: scrolled ? "rgba(253,246,236,0.97)" : "rgba(253,246,236,0.9)", backdropFilter:"blur(20px)", height:"68px", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom: scrolled ? "1px solid rgba(184,134,11,0.15)" : "1px solid transparent", boxShadow: scrolled ? "0 4px 30px rgba(184,134,11,0.08)" : "none", transition:"all 0.3s" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontWeight:700, background:`linear-gradient(135deg,${GOLD},#8B6914,#E8D5A3)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{nm}</div>
        <div style={{ display:"flex", gap:"20px", alignItems:"center" }}>
          {[["accueil","Accueil"],["catalogue","Catalogue"],["boutique","Boutique"],["apropos","À Propos"]].map(([id,label]) => (
            <span key={id} onClick={() => scrollTo(id)} style={{ fontSize:"0.82rem", fontWeight:500, cursor:"pointer", color: activeSection===id ? GOLD : "#5A5040", borderBottom: activeSection===id ? `1px solid ${GOLD}` : "1px solid transparent", paddingBottom:"2px", transition:"all 0.2s" }}>{label}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
          <a href="/abaia/admin/" style={{ fontSize:"0.75rem", color:"#888", textDecoration:"none", padding:"6px 10px", borderRadius:"20px", border:"1px solid rgba(197,165,90,0.2)" }}>⚙️</a>
          <button onClick={() => setShowPanier(true)} style={{ position:"relative", padding:"8px 16px", borderRadius:"30px", background:`linear-gradient(135deg,${GOLD},#8B6914)`, border:"none", color:"#fff", fontWeight:700, fontSize:"0.82rem", cursor:"pointer", boxShadow:"0 4px 16px rgba(184,134,11,0.25)", display:"flex", alignItems:"center", gap:"6px" }}>
            🛒 Panier
            {totalItems > 0 && <span style={{ background:"#8B4513", borderRadius:"50%", minWidth:"18px", height:"18px", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:"0.68rem", fontWeight:800 }}>{totalItems}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="ab-accueil" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 20px 80px", background:"radial-gradient(ellipse at 50% 0%,rgba(232,213,163,0.4) 0%,transparent 65%),#FDF6EC" }}>
        <p style={{ fontSize:"0.72rem", letterSpacing:"0.5em", color: GOLD, textTransform:"uppercase", fontWeight:700, marginBottom:"16px" }}>— Cosmétique de Luxe Naturel —</p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(3.5rem,9vw,7rem)", fontWeight:700, background:`linear-gradient(135deg,${GOLD} 0%,#D4A017 40%,#7B5A00 70%,#E8D5A3 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1.05, marginBottom:"14px" }}>{nm}</h1>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.1rem,3vw,1.5rem)", fontStyle:"italic", color:"#5A5040", marginBottom:"40px" }}>{sl}</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", justifyContent:"center", marginBottom:"44px" }}>
          {["✦ Nettoie en douceur","💧 Hydrate en profondeur","🌿 Unifie le teint","☀️ Apporte éclat"].map(b => (
            <span key={b} style={{ padding:"7px 18px", borderRadius:"30px", background:"rgba(184,134,11,0.1)", border:"1px solid rgba(184,134,11,0.2)", fontSize:"0.82rem", color:"#5A5040" }}>{b}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", justifyContent:"center" }}>
          <button onClick={() => scrollTo("boutique")} style={{ padding:"13px 28px", borderRadius:"30px", border:"none", background:`linear-gradient(135deg,${GOLD},#8B6914)`, color:"#fff", fontWeight:700, fontSize:"0.88rem", cursor:"pointer", boxShadow:"0 6px 24px rgba(184,134,11,0.3)", letterSpacing:"0.05em" }}>Voir la Boutique ↓</button>
          <button onClick={() => cmdWa("Je souhaite avoir plus d'informations sur vos produits.")} style={{ padding:"13px 28px", borderRadius:"30px", background:"transparent", color: GOLD, border:`1px solid rgba(184,134,11,0.4)`, fontWeight:600, fontSize:"0.88rem", cursor:"pointer" }}>📞 Nous Contacter</button>
        </div>
      </section>

      {/* CATALOGUE */}
      <section id="ab-catalogue" style={{ padding:"80px 20px", maxWidth:"1200px", margin:"0 auto" }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,5vw,3rem)", textAlign:"center", marginBottom:"8px", background:`linear-gradient(135deg,${GOLD},#7B5A00)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Grille Tarifaire</h2>
        <p style={{ textAlign:"center", color:"#888", fontSize:"0.82rem", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:"48px" }}>Nourrit • Sublime • Révèle</p>
        {sbLoading && !supabase ? null : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"20px" }}>
            {catalogue.map(cat => (
              <div key={cat.categorie_id} style={{ background:"rgba(255,252,245,0.95)", borderRadius:"16px", border:"1px solid rgba(197,165,90,0.2)", padding:"22px", boxShadow:"0 4px 20px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
                  <span style={{ fontSize:"1.4rem", background:"rgba(184,134,11,0.1)", borderRadius:"10px", padding:"8px", lineHeight:1 }}>{cat.icon}</span>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", fontWeight:700, color: DARK }}>{cat.categorie_nom}</h3>
                </div>
                {cat.produits.map(p => (
                  <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(197,165,90,0.1)" }}>
                    <span style={{ fontSize:"0.85rem", color:"#5A5040", display:"flex", alignItems:"center", gap:"6px" }}><span style={{ color: GOLD, fontSize:"0.65rem" }}>✦</span>{p.nom}</span>
                    <span style={{ fontWeight:700, color: GOLD, fontSize:"0.9rem", whiteSpace:"nowrap" }}>{fmt(p.prix)}</span>
                  </div>
                ))}
                <button onClick={() => cmdWa(`Je suis intéressé(e) par votre gamme : *${cat.categorie_nom}*`)}
                  style={{ marginTop:"14px", width:"100%", padding:"9px", background:`linear-gradient(135deg,${GOLD},#D4A017)`, border:"none", borderRadius:"8px", color:"#fff", fontWeight:700, fontSize:"0.78rem", cursor:"pointer", letterSpacing:"0.05em", textTransform:"uppercase" }}>📱 Commander</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BOUTIQUE */}
      <section id="ab-boutique" style={{ padding:"80px 20px", background:"linear-gradient(135deg,rgba(232,213,163,0.12),rgba(253,246,236,1))" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,5vw,3rem)", textAlign:"center", marginBottom:"8px", background:`linear-gradient(135deg,${GOLD},#7B5A00)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Boutique</h2>
          <p style={{ textAlign:"center", color:"#888", fontSize:"0.82rem", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:"32px" }}>Ajoutez au panier • Commandez via WhatsApp</p>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"24px", alignItems:"center" }}>
            <input value={searchShop} onChange={e => setSearchShop(e.target.value)} placeholder="🔍 Rechercher..." style={{ flex:1, minWidth:"180px", padding:"10px 16px", border:"1px solid rgba(197,165,90,0.25)", borderRadius:"30px", fontSize:"0.85rem", outline:"none", color: DARK, background:"rgba(255,252,245,0.9)" }} />
            {[["all","Tous"],...catalogue.map(c => [c.categorie_id, c.icon+" "+c.categorie_nom.split(" ")[0]])].map(([id,label]) => (
              <button key={id} onClick={() => setActiveCat(id)} style={{ padding:"8px 14px", borderRadius:"30px", cursor:"pointer", border:"1px solid rgba(184,134,11,0.3)", fontSize:"0.75rem", background: activeCat===id ? GOLD : "transparent", color: activeCat===id ? "#fff" : GOLD, fontWeight: activeCat===id ? 700 : 400, transition:"all 0.2s" }}>{label}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"16px" }}>
            {shopFiltered.map(p => (
              <div key={p.id} style={{ background:"rgba(255,252,245,0.95)", borderRadius:"14px", border:"1px solid rgba(197,165,90,0.2)", padding:"18px", boxShadow:"0 4px 16px rgba(0,0,0,0.04)", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:"1.8rem", textAlign:"center", marginBottom:"8px" }}>{p.icon}</div>
                  <p style={{ fontSize:"0.65rem", color: GOLD, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:700, marginBottom:"4px" }}>{p.catNom}</p>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", color: DARK, marginBottom:"8px", lineHeight:1.3 }}>{p.nom}</h3>
                  <p style={{ fontWeight:800, color: GOLD, fontSize:"1rem", marginBottom:"12px" }}>{fmt(p.prix)}</p>
                </div>
                <button onClick={() => ajouterPanier(p, p.catNom)} style={{ width:"100%", padding:"9px", borderRadius:"8px", background:`linear-gradient(135deg,${GOLD},#D4A017)`, border:"none", color:"#fff", fontWeight:700, fontSize:"0.78rem", cursor:"pointer", letterSpacing:"0.05em", textTransform:"uppercase" }}>+ Ajouter au panier</button>
              </div>
            ))}
          </div>
          {!shopFiltered.length && <div style={{ textAlign:"center", padding:"60px", color:"#888" }}><div style={{ fontSize:"2.5rem", marginBottom:"12px" }}>🔍</div><p>Aucun produit trouvé</p></div>}
        </div>
      </section>

      {/* À PROPOS */}
      <section id="ab-apropos" style={{ padding:"80px 20px" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,5vw,3rem)", marginBottom:"24px", background:`linear-gradient(135deg,${GOLD},#7B5A00)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>À Propos d'Abaïa</h2>
          <p style={{ fontSize:"1rem", lineHeight:1.85, color:"#5A5040", marginBottom:"24px" }}>
            <strong style={{ color: GOLD }}>{nm}</strong> propose une gamme complète de soins de beauté naturels.
            {settings.description ? " " + settings.description : " Nos formules enrichies nourrissent, hydratent et unifient le teint pour un résultat lumineux et naturel."}
          </p>
          <div style={{ display:"flex", gap:"40px", justifyContent:"center", flexWrap:"wrap" }}>
            {[["6","Gammes"],["25+","Produits"],["100%","Naturel"]].map(([n,l]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.5rem", fontWeight:700, background:`linear-gradient(135deg,${GOLD},#7B5A00)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{n}</div>
                <div style={{ fontSize:"0.72rem", color:"#888", letterSpacing:"0.12em", textTransform:"uppercase", marginTop:"4px" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: DARK, padding:"48px 24px", textAlign:"center" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", background:`linear-gradient(135deg,${GOLD},#E8D5A3)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:"10px" }}>{nm}</div>
        <p style={{ fontSize:"0.82rem", color:"#888", fontStyle:"italic", marginBottom:"16px" }}>{sl}</p>
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" style={{ fontSize:"0.8rem", color: GOLD, textDecoration:"none" }}>
          📱 {settings.whatsapp || "+237 6 98 54 80 16"}
        </a>
        <p style={{ fontSize:"0.68rem", color:"#444", marginTop:"20px" }}>© 2025 {nm} — Tous droits réservés</p>
      </footer>

      {showPanier && <AbaiaPanier panier={panier} setPanier={setPanier} onClose={() => setShowPanier(false)} />}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Poppins:wght@300;400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0} html{scroll-behavior:smooth}`}</style>
    </div>
  )
}

// ─── COMPOSANT ROOT ───────────────────────────────────────────────────────────
export default function AbaiaCosmetics() {
  const path = window.location.pathname
  if (path.includes("/admin")) {
    return <AbaiaAdmin onBack={() => { window.history.pushState({}, "", "/abaia/"); window.location.reload() }} />
  }
  return <AbaiaMain />
}
