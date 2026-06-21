import { useState, useEffect } from "react"

const WHATSAPP = "237698548016"
const GOLD = "#B8860B"
const CREAM = "#FDF6EC"
const DARK = "#1C1C1C"

// ─── Données par défaut ───────────────────────────────────────────────────────
const DEFAULT_CATALOGUE = [
  { id:"lait-corps", categorie:"Lait Pour le Corps", icon:"🧴", produits:[
    { id:"lc1", nom:"Lait hydratant", prix:5000 },
    { id:"lc2", nom:"Lait teint caramel", prix:6500 },
    { id:"lc3", nom:"Lait teint clair", prix:7500 },
    { id:"lc4", nom:"Lait teint métisse", prix:10000 },
    { id:"lc5", nom:"Lait teint blanchissant", prix:15000 },
  ]},
  { id:"gel-douche", categorie:"Gel Douches", icon:"🚿", produits:[
    { id:"gd1", nom:"Gel douche Perfect Glow", prix:4000 },
    { id:"gd2", nom:"Gel douche métisse", prix:6500 },
    { id:"gd3", nom:"Gel douche blanchissant", prix:8000 },
  ]},
  { id:"creme-visage", categorie:"Crème Visage", icon:"✨", produits:[
    { id:"cv1", nom:"Crème visage hydratant", prix:2500 },
    { id:"cv2", nom:"Crème visage teint caramel", prix:3000 },
    { id:"cv3", nom:"Crème visage teint clair", prix:3500 },
    { id:"cv4", nom:"Crème visage teint métisse", prix:4000 },
    { id:"cv5", nom:"Crème visage teint blanchissant", prix:5000 },
  ]},
  { id:"gommage", categorie:"Gommage", icon:"💎", produits:[
    { id:"g1", nom:"Gommage éclat", prix:5000 },
    { id:"g2", nom:"Gommage au café", prix:5000 },
    { id:"g3", nom:"Gommage blanchissant", prix:8000 },
  ]},
  { id:"gamme", categorie:"Gamme des Produits", icon:"👑", produits:[
    { id:"gp1", nom:"Gamme nature", prix:16000 },
    { id:"gp2", nom:"Gamme caramel", prix:24000 },
    { id:"gp3", nom:"Gamme éclat", prix:27000 },
    { id:"gp4", nom:"Gamme métisse", prix:31000 },
    { id:"gp5", nom:"Gamme blanchissant", prix:38000 },
  ]},
  { id:"glow-oil", categorie:"Les Glow Oil", icon:"🌟", produits:[
    { id:"go1", nom:"Huile clarifiante", prix:4000 },
    { id:"go2", nom:"Huile éclaircissante", prix:5000 },
    { id:"go3", nom:"Huile métisse", prix:6000 },
  ]},
]

const fmt = (p) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA"
const LS_KEY = "abaia_catalogue_v2"
const LS_PANIER = "abaia_panier_v2"

function loadCatalogue() {
  try { const s = localStorage.getItem(LS_KEY); if (s) return JSON.parse(s) } catch(e) {}
  return DEFAULT_CATALOGUE
}
function saveCatalogue(c) { localStorage.setItem(LS_KEY, JSON.stringify(c)) }

// ─── ADMIN PANEL ABAÏA ───────────────────────────────────────────────────────
function AbaiaAdmin({ onBack }) {
  const [catalogue, setCatalogue] = useState(loadCatalogue)
  const [activeTab, setActiveTab] = useState("produits")
  const [editItem, setEditItem] = useState(null)
  const [toast, setToast] = useState(null)
  const [siteInfo, setSiteInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem("abaia_siteinfo") || "{}") } catch(e) { return {} }
  })
  const [showAddProduit, setShowAddProduit] = useState(null)
  const [newProduit, setNewProduit] = useState({ nom: "", prix: "" })

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500) }

  const updatePrix = (catId, prodId, newPrix) => {
    const updated = catalogue.map(cat =>
      cat.id === catId ? { ...cat, produits: cat.produits.map(p =>
        p.id === prodId ? { ...p, prix: parseInt(newPrix) || p.prix } : p
      )} : cat
    )
    setCatalogue(updated); saveCatalogue(updated)
  }

  const updateNom = (catId, prodId, newNom) => {
    const updated = catalogue.map(cat =>
      cat.id === catId ? { ...cat, produits: cat.produits.map(p =>
        p.id === prodId ? { ...p, nom: newNom } : p
      )} : cat
    )
    setCatalogue(updated); saveCatalogue(updated)
  }

  const deleteProduit = (catId, prodId) => {
    const updated = catalogue.map(cat =>
      cat.id === catId ? { ...cat, produits: cat.produits.filter(p => p.id !== prodId) } : cat
    )
    setCatalogue(updated); saveCatalogue(updated); showToast("Produit supprimé")
  }

  const addProduit = (catId) => {
    if (!newProduit.nom || !newProduit.prix) return
    const updated = catalogue.map(cat =>
      cat.id === catId ? { ...cat, produits: [...cat.produits, {
        id: "p_" + Date.now(), nom: newProduit.nom, prix: parseInt(newProduit.prix) || 0
      }]} : cat
    )
    setCatalogue(updated); saveCatalogue(updated)
    setNewProduit({ nom: "", prix: "" }); setShowAddProduit(null)
    showToast("Produit ajouté !")
  }

  const saveSiteInfo = () => {
    localStorage.setItem("abaia_siteinfo", JSON.stringify(siteInfo))
    showToast("Informations sauvegardées !")
  }

  const resetCatalogue = () => {
    if (!window.confirm("Remettre les prix par défaut ?")) return
    setCatalogue(DEFAULT_CATALOGUE); saveCatalogue(DEFAULT_CATALOGUE)
    showToast("Catalogue réinitialisé")
  }

  const s = {
    page: { minHeight:"100vh", background: CREAM, fontFamily:"'Poppins',system-ui,sans-serif" },
    header: { background: DARK, padding:"0 32px", display:"flex", alignItems:"center",
      justifyContent:"space-between", height:"60px", position:"sticky", top:0, zIndex:100 },
    headerTitle: { color: GOLD, fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", fontWeight:700 },
    tab: (a) => ({
      padding:"8px 20px", borderRadius:"8px", border:"none", cursor:"pointer",
      fontSize:"0.82rem", fontWeight:"600",
      background: a ? GOLD : "rgba(255,255,255,0.08)",
      color: a ? DARK : "#aaa", transition:"all 0.2s"
    }),
    card: { background:"#fff", borderRadius:"16px", padding:"24px",
      boxShadow:"0 4px 20px rgba(0,0,0,0.06)", marginBottom:"20px",
      border:"1px solid rgba(197,165,90,0.15)" },
    input: { width:"100%", padding:"10px 14px", borderRadius:"8px",
      border:"1px solid rgba(197,165,90,0.3)", fontSize:"0.88rem",
      outline:"none", color: DARK, background:"#fff" },
    btnGold: { padding:"10px 22px", borderRadius:"8px", border:"none",
      background:`linear-gradient(135deg,${GOLD},#8B6914)`,
      color:"#fff", fontWeight:700, fontSize:"0.82rem", cursor:"pointer" },
    btnDanger: { padding:"6px 12px", borderRadius:"6px", border:"none",
      background:"rgba(220,53,69,0.1)", color:"#dc3545",
      fontWeight:600, fontSize:"0.78rem", cursor:"pointer" },
    row: { display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"10px 0", borderBottom:"1px solid rgba(197,165,90,0.1)" },
    priceInput: { width:"120px", padding:"6px 10px", borderRadius:"6px",
      border:"1px solid rgba(197,165,90,0.3)", fontSize:"0.85rem",
      fontWeight:700, color: GOLD, textAlign:"right", outline:"none" },
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.headerTitle}>⚙️ Admin — Abaïa Cosmétique</span>
        <div style={{ display:"flex", gap:"8px" }}>
          {[["produits","📦 Produits"],["infos","ℹ️ Infos Site"],["commandes","📋 Commandes"]].map(([id,label]) => (
            <button key={id} style={s.tab(activeTab===id)} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
          <button onClick={onBack}
            style={{ ...s.tab(false), border:"1px solid rgba(255,255,255,0.15)" }}>← Site</button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:"70px", right:"20px", zIndex:9999,
          padding:"12px 20px", borderRadius:"10px",
          background: toast.type==="error" ? "#dc3545" : `linear-gradient(135deg,${GOLD},#8B6914)`,
          color:"#fff", fontWeight:600, fontSize:"0.85rem",
          boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast.type==="error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"32px 20px" }}>

        {/* ── ONGLET PRODUITS ──────────────────────────────────────────── */}
        {activeTab === "produits" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", color: DARK }}>
                Gestion du Catalogue
              </h2>
              <button onClick={resetCatalogue} style={{ ...s.btnDanger, padding:"8px 16px" }}>
                🔄 Réinitialiser
              </button>
            </div>
            <p style={{ color:"#888", marginBottom:"24px", fontSize:"0.85rem" }}>
              Modifiez les noms et prix directement. Les changements sont sauvegardés automatiquement.
            </p>
            {catalogue.map(cat => (
              <div key={cat.id} style={s.card}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
                  <span style={{ fontSize:"1.4rem" }}>{cat.icon}</span>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", color: DARK }}>{cat.categorie}</h3>
                  <span style={{ marginLeft:"auto", fontSize:"0.75rem", color:"#888" }}>{cat.produits.length} produits</span>
                </div>
                {cat.produits.map(p => (
                  <div key={p.id} style={s.row}>
                    <input value={p.nom}
                      onChange={e => updateNom(cat.id, p.id, e.target.value)}
                      style={{ ...s.input, width:"auto", flex:1, marginRight:"12px",
                        border:"1px solid transparent", padding:"6px 8px",
                        borderRadius:"6px", background:"transparent" }}
                      onFocus={e => e.target.style.border="1px solid rgba(197,165,90,0.4)"}
                      onBlur={e => { e.target.style.border="1px solid transparent"; showToast("Nom mis à jour") }} />
                    <div style={{ display:"flex", alignItems:"center", gap:"4px", marginRight:"8px" }}>
                      <input type="number" value={p.prix}
                        onChange={e => updatePrix(cat.id, p.id, e.target.value)}
                        style={s.priceInput}
                        onBlur={() => showToast("Prix mis à jour")} />
                      <span style={{ fontSize:"0.72rem", color:"#888" }}>FCFA</span>
                    </div>
                    <button onClick={() => deleteProduit(cat.id, p.id)} style={s.btnDanger}>🗑</button>
                  </div>
                ))}

                {/* Add product to this category */}
                {showAddProduit === cat.id ? (
                  <div style={{ marginTop:"12px", padding:"12px", background:"rgba(184,134,11,0.05)",
                    borderRadius:"8px", border:"1px dashed rgba(184,134,11,0.3)" }}>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      <input placeholder="Nom du produit" value={newProduit.nom}
                        onChange={e => setNewProduit(p => ({...p, nom: e.target.value}))}
                        style={{ ...s.input, flex:2, minWidth:"160px" }} />
                      <input type="number" placeholder="Prix FCFA" value={newProduit.prix}
                        onChange={e => setNewProduit(p => ({...p, prix: e.target.value}))}
                        style={{ ...s.input, flex:1, minWidth:"100px" }} />
                      <button onClick={() => addProduit(cat.id)} style={s.btnGold}>+ Ajouter</button>
                      <button onClick={() => setShowAddProduit(null)}
                        style={{ ...s.btnDanger, padding:"10px 14px" }}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddProduit(cat.id)}
                    style={{ marginTop:"10px", background:"none", border:"1px dashed rgba(184,134,11,0.3)",
                      color: GOLD, borderRadius:"8px", padding:"8px 16px",
                      cursor:"pointer", fontSize:"0.8rem", width:"100%" }}>
                    + Ajouter un produit à cette catégorie
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ONGLET INFOS SITE ────────────────────────────────────────── */}
        {activeTab === "infos" && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", color: DARK, marginBottom:"24px" }}>
              Informations du Site
            </h2>
            <div style={s.card}>
              {[
                ["Nom de la marque", "nom", "Abaïa Cosmétique"],
                ["Slogan", "slogan", "Élevez Votre Éclat Naturel"],
                ["WhatsApp", "whatsapp", "+237 6 98 54 80 16"],
                ["Email de contact", "email", "contact@abaia.com"],
                ["Adresse", "adresse", "Votre adresse"],
                ["Description", "description", "Cosmétique naturelle de luxe..."],
              ].map(([label, key, placeholder]) => (
                <div key={key} style={{ marginBottom:"20px" }}>
                  <label style={{ display:"block", marginBottom:"6px", fontSize:"0.78rem",
                    color:"#888", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</label>
                  {key === "description" ? (
                    <textarea value={siteInfo[key] || ""} placeholder={placeholder}
                      onChange={e => setSiteInfo(i => ({...i, [key]: e.target.value}))}
                      rows={3} style={{ ...s.input, resize:"vertical" }} />
                  ) : (
                    <input value={siteInfo[key] || ""} placeholder={placeholder}
                      onChange={e => setSiteInfo(i => ({...i, [key]: e.target.value}))}
                      style={s.input} />
                  )}
                </div>
              ))}
              <button onClick={saveSiteInfo} style={s.btnGold}>💾 Sauvegarder</button>
            </div>
          </div>
        )}

        {/* ── ONGLET COMMANDES ─────────────────────────────────────────── */}
        {activeTab === "commandes" && (
          <div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", color: DARK, marginBottom:"24px" }}>
              Commandes WhatsApp
            </h2>
            <div style={{ ...s.card, textAlign:"center", padding:"60px 40px" }}>
              <div style={{ fontSize:"3rem", marginBottom:"16px" }}>📱</div>
              <p style={{ color:"#5A5040", marginBottom:"8px", fontSize:"1rem" }}>
                Les commandes sont gérées via WhatsApp
              </p>
              <p style={{ color:"#888", fontSize:"0.85rem", marginBottom:"24px" }}>
                Numéro actuel : <strong style={{ color: GOLD }}>{siteInfo.whatsapp || "+237 6 98 54 80 16"}</strong>
              </p>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
                style={{ ...s.btnGold, textDecoration:"none", display:"inline-block" }}>
                Ouvrir WhatsApp Business
              </a>
            </div>
            <div style={s.card}>
              <h3 style={{ fontSize:"1rem", fontWeight:700, marginBottom:"12px", color: DARK }}>
                📊 Statistiques catalogue
              </h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
                {[
                  ["Catégories", catalogue.length.toString(), "🏷️"],
                  ["Produits total", catalogue.reduce((s,c) => s+c.produits.length, 0).toString(), "📦"],
                  ["Prix min", fmt(Math.min(...catalogue.flatMap(c => c.produits.map(p => p.prix)))), "💰"],
                ].map(([label, val, icon]) => (
                  <div key={label} style={{ textAlign:"center", padding:"16px",
                    background:"rgba(184,134,11,0.05)", borderRadius:"10px",
                    border:"1px solid rgba(184,134,11,0.1)" }}>
                    <div style={{ fontSize:"1.5rem", marginBottom:"6px" }}>{icon}</div>
                    <div style={{ fontWeight:700, color: GOLD, fontSize:"1.2rem" }}>{val}</div>
                    <div style={{ fontSize:"0.72rem", color:"#888" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SHOP PANIER ─────────────────────────────────────────────────────────────
function AbaiaPanier({ panier, setPanier, onClose }) {
  const total = panier.reduce((s,i) => s + i.prix * i.qty, 0)
  const [sent, setSent] = useState(false)

  const retirer = (id) => setPanier(p => {
    const n = p.map(i => i.id === id ? {...i, qty: i.qty - 1} : i).filter(i => i.qty > 0)
    localStorage.setItem(LS_PANIER, JSON.stringify(n)); return n
  })
  const ajouter = (id) => setPanier(p => {
    const n = p.map(i => i.id === id ? {...i, qty: i.qty + 1} : i)
    localStorage.setItem(LS_PANIER, JSON.stringify(n)); return n
  })
  const vider = (id) => setPanier(p => {
    const n = p.filter(i => i.id !== id)
    localStorage.setItem(LS_PANIER, JSON.stringify(n)); return n
  })

  const commander = () => {
    if (panier.length === 0) return
    const txt = panier.map(i => `▸ ${i.nom} ×${i.qty} = ${fmt(i.prix * i.qty)}`).join("\n")
    const msg = encodeURIComponent(`Bonjour Abaïa Cosmétique 👋\n\nMa commande :\n${txt}\n\n━━━━\nTOTAL : ${fmt(total)}\n\nMerci de confirmer 🙏`)
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank")
    setSent(true); setPanier([]); localStorage.removeItem(LS_PANIER)
    setTimeout(() => { setSent(false); onClose() }, 2000)
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:9999,
      display:"flex", justifyContent:"flex-end" }} onClick={onClose}>
      <div style={{ width:"min(400px,100vw)", background: CREAM, height:"100%",
        overflowY:"auto", padding:"24px", display:"flex", flexDirection:"column",
        boxShadow:"-4px 0 40px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", color: GOLD }}>
            🛒 Mon Panier
          </h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"1.4rem", cursor:"pointer", color:"#888" }}>✕</button>
        </div>
        {sent ? (
          <div style={{ textAlign:"center", padding:"40px", color: GOLD }}>
            <div style={{ fontSize:"3rem", marginBottom:"16px" }}>✅</div>
            <p style={{ fontWeight:700 }}>Commande envoyée via WhatsApp !</p>
          </div>
        ) : panier.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#888" }}>
            <div style={{ fontSize:"3rem", marginBottom:"12px" }}>🛒</div>
            <p>Votre panier est vide</p>
          </div>
        ) : (
          <>
            <div style={{ flex:1, overflowY:"auto" }}>
              {panier.map(item => (
                <div key={item.id} style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"14px 0",
                  borderBottom:"1px solid rgba(197,165,90,0.15)" }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600, fontSize:"0.88rem", marginBottom:"4px" }}>{item.nom}</p>
                    <p style={{ fontSize:"0.78rem", color:"#888" }}>
                      {fmt(item.prix)} × {item.qty} = <strong style={{ color: GOLD }}>{fmt(item.prix * item.qty)}</strong>
                    </p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    <button onClick={() => retirer(item.id)}
                      style={{ width:"28px", height:"28px", borderRadius:"50%", border:`1px solid rgba(184,134,11,0.3)`,
                        background:"transparent", color: GOLD, cursor:"pointer", fontSize:"1rem", lineHeight:1 }}>−</button>
                    <span style={{ fontWeight:700, minWidth:"20px", textAlign:"center" }}>{item.qty}</span>
                    <button onClick={() => ajouter(item.id)}
                      style={{ width:"28px", height:"28px", borderRadius:"50%", border:`1px solid rgba(184,134,11,0.3)`,
                        background:"transparent", color: GOLD, cursor:"pointer", fontSize:"1rem", lineHeight:1 }}>+</button>
                    <button onClick={() => vider(item.id)}
                      style={{ background:"none", border:"none", color:"#cc4444", cursor:"pointer", fontSize:"1rem", marginLeft:"4px" }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:"20px", padding:"16px",
              background:"rgba(184,134,11,0.06)", borderRadius:"12px",
              border:"1px solid rgba(184,134,11,0.15)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"14px" }}>
                <span style={{ fontWeight:600 }}>Total</span>
                <span style={{ fontWeight:800, color: GOLD, fontSize:"1.1rem" }}>{fmt(total)}</span>
              </div>
              <button onClick={commander}
                style={{ width:"100%", padding:"14px",
                  background:`linear-gradient(135deg,${GOLD},#8B6914)`,
                  border:"none", borderRadius:"10px", color:"#fff",
                  fontWeight:700, fontSize:"0.9rem", cursor:"pointer" }}>
                📱 Commander via WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function AbaiaCosmetics() {
  const path = window.location.pathname

  // Route admin
  if (path.includes("/admin")) {
    return <AbaiaAdmin onBack={() => { window.history.pushState({}, "", "/abaia/"); window.location.reload() }} />
  }

  return <AbaiaMain />
}

function AbaiaMain() {
  const [catalogue, setCatalogue] = useState(loadCatalogue)
  const [panier, setPanier] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_PANIER) || "[]") } catch(e) { return [] }
  })
  const [siteInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem("abaia_siteinfo") || "{}") } catch(e) { return {} }
  })
  const [showPanier, setShowPanier] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("accueil")
  const [searchShop, setSearchShop] = useState("")
  const [activeCat, setActiveCat] = useState("all")

  useEffect(() => {
    setCatalogue(loadCatalogue())
    // Set Abaia favicon
    let link = document.querySelector("link[rel~='icon']")
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
    link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23FDF6EC"/><text y=".9em" font-size="75" x="12">✨</text></svg>'
    document.title = 'Abaïa Cosmétique — Élevez Votre Éclat Naturel'
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", h)
    return () => {
      window.removeEventListener("scroll", h)
      document.title = 'Hosanne Platform'
    }
  }, [])

  const totalItems = panier.reduce((s,i) => s + i.qty, 0)

  const ajouterPanier = (produit, catNom) => {
    setPanier(prev => {
      const ex = prev.find(i => i.id === produit.id)
      const next = ex
        ? prev.map(i => i.id === produit.id ? {...i, qty: i.qty + 1} : i)
        : [...prev, { ...produit, catNom, qty: 1 }]
      localStorage.setItem(LS_PANIER, JSON.stringify(next))
      return next
    })
  }

  const cmdWa = (msg) => {
    const m = encodeURIComponent(`Bonjour Abaïa Cosmétique 👋\n${msg}\n\nMerci 🙏`)
    window.open(`https://wa.me/${WHATSAPP}?text=${m}`, "_blank")
  }

  const scrollTo = (id) => {
    setActiveSection(id)
    document.getElementById("ab-" + id)?.scrollIntoView({ behavior:"smooth" })
  }

  // All products flat for shop
  const allProduits = catalogue.flatMap(cat => cat.produits.map(p => ({ ...p, catId: cat.id, catNom: cat.categorie, icon: cat.icon })))
  const shopFiltered = allProduits.filter(p => {
    const mS = !searchShop || p.nom.toLowerCase().includes(searchShop.toLowerCase())
    const mC = activeCat === "all" || p.catId === activeCat
    return mS && mC
  })

  const navLinks = [
    ["accueil","Accueil"], ["catalogue","Catalogue"], ["boutique","Boutique"], ["apropos","À Propos"]
  ]

  return (
    <div style={{ minHeight:"100vh", background: CREAM, fontFamily:"'Poppins',system-ui,sans-serif",
      color: DARK, overflowX:"hidden" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:1000,
        background: scrolled ? "rgba(253,246,236,0.97)" : "rgba(253,246,236,0.9)",
        backdropFilter:"blur(20px)", height:"68px", padding:"0 32px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom: scrolled ? "1px solid rgba(184,134,11,0.15)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 30px rgba(184,134,11,0.08)" : "none",
        transition:"all 0.3s" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", fontWeight:700,
          background:`linear-gradient(135deg,${GOLD},#8B6914,#E8D5A3)`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          {siteInfo.nom || "Abaïa"}
        </div>
        <div style={{ display:"flex", gap:"28px", alignItems:"center" }}>
          {navLinks.map(([id,label]) => (
            <span key={id} onClick={() => scrollTo(id)} style={{
              fontSize:"0.83rem", fontWeight:"500", cursor:"pointer",
              color: activeSection===id ? GOLD : "#5A5040",
              borderBottom: activeSection===id ? `1px solid ${GOLD}` : "1px solid transparent",
              paddingBottom:"2px", transition:"all 0.2s" }}>{label}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
          {/* Admin link */}
          <a href="/abaia/admin/" style={{ fontSize:"0.75rem", color:"#888",
            textDecoration:"none", padding:"6px 12px", borderRadius:"20px",
            border:"1px solid rgba(197,165,90,0.2)", transition:"all 0.2s" }}>⚙️</a>
          {/* Panier */}
          <button onClick={() => setShowPanier(true)}
            style={{ position:"relative", padding:"8px 18px", borderRadius:"30px",
              background:`linear-gradient(135deg,${GOLD},#8B6914)`,
              border:"none", color:"#fff", fontWeight:700,
              fontSize:"0.82rem", cursor:"pointer",
              boxShadow:"0 4px 16px rgba(184,134,11,0.25)", display:"flex", alignItems:"center", gap:"6px" }}>
            🛒 Panier
            {totalItems > 0 && (
              <span style={{ background:"#8B4513", borderRadius:"50%",
                minWidth:"18px", height:"18px", display:"inline-flex",
                alignItems:"center", justifyContent:"center",
                fontSize:"0.68rem", fontWeight:800 }}>{totalItems}</span>
            )}
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="ab-accueil" style={{ minHeight:"100vh", display:"flex",
        flexDirection:"column", alignItems:"center", justifyContent:"center",
        textAlign:"center", padding:"120px 20px 80px", position:"relative",
        background:"radial-gradient(ellipse at 50% 0%, rgba(232,213,163,0.4) 0%, transparent 65%), #FDF6EC" }}>
        {[{s:"15%",l:"5%",w:"300px",o:.3},{s:"10%",l:"80%",w:"250px",o:.2},{s:"60%",l:"70%",w:"350px",o:.15}].map((c,i) => (
          <div key={i} style={{ position:"absolute", top:c.s, left:c.l, width:c.w, height:c.w,
            borderRadius:"50%", background:`radial-gradient(circle,rgba(184,134,11,${c.o}),transparent)`,
            filter:"blur(60px)", pointerEvents:"none" }} />
        ))}
        <p style={{ fontSize:"0.72rem", letterSpacing:"0.5em", color: GOLD,
          textTransform:"uppercase", fontWeight:700, marginBottom:"16px" }}>— Cosmétique de Luxe Naturel —</p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(3.5rem,9vw,7rem)", fontWeight:700,
          background:`linear-gradient(135deg,${GOLD} 0%,#D4A017 40%,#7B5A00 70%,#E8D5A3 100%)`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          lineHeight:1.05, marginBottom:"14px" }}>
          {siteInfo.nom || "Abaïa"}
        </h1>
        <p style={{ fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(1.1rem,3vw,1.6rem)", fontStyle:"italic",
          color:"#5A5040", marginBottom:"40px" }}>
          {siteInfo.slogan || "Élevez Votre Éclat Naturel"}
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", justifyContent:"center", marginBottom:"44px" }}>
          {["✦ Nettoie en douceur","💧 Hydrate en profondeur","🌿 Unifie le teint","☀️ Apporte éclat"].map(b => (
            <span key={b} style={{ padding:"7px 18px", borderRadius:"30px",
              background:"rgba(184,134,11,0.1)", border:"1px solid rgba(184,134,11,0.2)",
              fontSize:"0.82rem", color:"#5A5040" }}>{b}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", justifyContent:"center" }}>
          <button onClick={() => scrollTo("boutique")}
            style={{ padding:"13px 30px", borderRadius:"30px", border:"none",
              background:`linear-gradient(135deg,${GOLD},#8B6914)`,
              color:"#fff", fontWeight:700, fontSize:"0.88rem", cursor:"pointer",
              boxShadow:"0 6px 24px rgba(184,134,11,0.3)", letterSpacing:"0.05em" }}>
            Voir la Boutique ↓
          </button>
          <button onClick={() => cmdWa("Je souhaite avoir plus d'informations sur vos produits.")}
            style={{ padding:"13px 28px", borderRadius:"30px",
              background:"transparent", color: GOLD,
              border:`1px solid rgba(184,134,11,0.4)`,
              fontWeight:600, fontSize:"0.88rem", cursor:"pointer" }}>
            📞 Nous Contacter
          </button>
        </div>
      </section>

      {/* ── CATALOGUE ────────────────────────────────────────────────────── */}
      <section id="ab-catalogue" style={{ padding:"80px 20px", maxWidth:"1200px", margin:"0 auto" }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,5vw,3rem)",
          textAlign:"center", marginBottom:"8px",
          background:`linear-gradient(135deg,${GOLD},#7B5A00)`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          Grille Tarifaire
        </h2>
        <p style={{ textAlign:"center", color:"#888", fontSize:"0.82rem",
          letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:"48px" }}>
          Nourrit • Sublime • Révèle — Tous types de peaux
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"20px" }}>
          {catalogue.map(cat => (
            <div key={cat.id} style={{ background:"rgba(255,252,245,0.95)", borderRadius:"16px",
              border:"1px solid rgba(197,165,90,0.2)", padding:"22px",
              boxShadow:"0 4px 20px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
                <span style={{ fontSize:"1.4rem", background:"rgba(184,134,11,0.1)",
                  borderRadius:"10px", padding:"8px", lineHeight:1 }}>{cat.icon}</span>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:"1.2rem", fontWeight:700, color: DARK }}>{cat.categorie}</h3>
              </div>
              {cat.produits.map(p => (
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between",
                  padding:"7px 0", borderBottom:"1px solid rgba(197,165,90,0.1)" }}>
                  <span style={{ fontSize:"0.85rem", color:"#5A5040",
                    display:"flex", alignItems:"center", gap:"6px" }}>
                    <span style={{ color: GOLD, fontSize:"0.65rem" }}>✦</span>{p.nom}
                  </span>
                  <span style={{ fontWeight:700, color: GOLD, fontSize:"0.9rem", whiteSpace:"nowrap" }}>{fmt(p.prix)}</span>
                </div>
              ))}
              <button onClick={() => cmdWa(`Je suis intéressé(e) par votre gamme : *${cat.categorie}*`)}
                style={{ marginTop:"14px", width:"100%", padding:"9px",
                  background:`linear-gradient(135deg,${GOLD},#D4A017)`,
                  border:"none", borderRadius:"8px", color:"#fff",
                  fontWeight:700, fontSize:"0.78rem", cursor:"pointer",
                  letterSpacing:"0.05em", textTransform:"uppercase" }}>
                📱 Commander
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOUTIQUE ─────────────────────────────────────────────────────── */}
      <section id="ab-boutique" style={{ padding:"80px 20px",
        background:"linear-gradient(135deg,rgba(232,213,163,0.12),rgba(253,246,236,1))" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,5vw,3rem)",
            textAlign:"center", marginBottom:"8px",
            background:`linear-gradient(135deg,${GOLD},#7B5A00)`,
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Boutique
          </h2>
          <p style={{ textAlign:"center", color:"#888", fontSize:"0.82rem",
            letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:"32px" }}>
            Ajoutez à votre panier et commandez via WhatsApp
          </p>
          {/* Search + filtres */}
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"24px", alignItems:"center" }}>
            <input value={searchShop} onChange={e => setSearchShop(e.target.value)}
              placeholder="🔍 Rechercher..."
              style={{ flex:1, minWidth:"180px", padding:"10px 16px",
                border:"1px solid rgba(197,165,90,0.25)", borderRadius:"30px",
                fontSize:"0.85rem", outline:"none", color: DARK, background:"rgba(255,252,245,0.9)" }} />
            {[["all","Tous"], ...catalogue.map(c => [c.id, c.icon + " " + c.categorie.split(" ")[0]])].map(([id,label]) => (
              <button key={id} onClick={() => setActiveCat(id)}
                style={{ padding:"8px 16px", borderRadius:"30px", cursor:"pointer",
                  border:"1px solid rgba(184,134,11,0.3)", fontSize:"0.78rem",
                  background: activeCat===id ? GOLD : "transparent",
                  color: activeCat===id ? "#fff" : GOLD,
                  fontWeight: activeCat===id ? 700 : 400, transition:"all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"18px" }}>
            {shopFiltered.map(p => (
              <div key={p.id} style={{ background:"rgba(255,252,245,0.95)", borderRadius:"14px",
                border:"1px solid rgba(197,165,90,0.2)", padding:"20px",
                boxShadow:"0 4px 16px rgba(0,0,0,0.04)",
                display:"flex", flexDirection:"column", justifyContent:"space-between",
                transition:"all 0.2s" }}>
                <div>
                  <div style={{ fontSize:"1.8rem", textAlign:"center", marginBottom:"10px" }}>{p.icon}</div>
                  <p style={{ fontSize:"0.68rem", color: GOLD, letterSpacing:"0.1em",
                    textTransform:"uppercase", fontWeight:700, marginBottom:"4px" }}>{p.catNom}</p>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                    fontSize:"1.05rem", color: DARK, marginBottom:"10px", lineHeight:1.3 }}>{p.nom}</h3>
                  <p style={{ fontWeight:800, color: GOLD, fontSize:"1rem", marginBottom:"14px" }}>{fmt(p.prix)}</p>
                </div>
                <button onClick={() => ajouterPanier(p, p.catNom)}
                  style={{ width:"100%", padding:"9px", borderRadius:"8px",
                    background:`linear-gradient(135deg,${GOLD},#D4A017)`,
                    border:"none", color:"#fff", fontWeight:700,
                    fontSize:"0.78rem", cursor:"pointer", letterSpacing:"0.05em",
                    textTransform:"uppercase" }}>
                  + Ajouter au panier
                </button>
              </div>
            ))}
          </div>
          {shopFiltered.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px", color:"#888" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:"12px" }}>🔍</div>
              <p>Aucun produit pour "{searchShop}"</p>
            </div>
          )}
        </div>
      </section>

      {/* ── À PROPOS ─────────────────────────────────────────────────────── */}
      <section id="ab-apropos" style={{ padding:"80px 20px" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,5vw,3rem)",
            marginBottom:"24px",
            background:`linear-gradient(135deg,${GOLD},#7B5A00)`,
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            À Propos d'Abaïa
          </h2>
          <p style={{ fontSize:"1rem", lineHeight:1.85, color:"#5A5040", marginBottom:"24px" }}>
            <strong style={{ color: GOLD }}>{siteInfo.nom || "Abaïa Cosmétique"}</strong> propose une gamme complète
            de soins de beauté naturels, conçus pour sublimer tous les types de peaux.
            {siteInfo.description ? " " + siteInfo.description : " Nos formules enrichies nourrissent, hydratent et unifient le teint pour un résultat lumineux et naturel."}
          </p>
          <div style={{ display:"flex", gap:"40px", justifyContent:"center", flexWrap:"wrap" }}>
            {[["6","Gammes"],["25+","Produits"],["100%","Naturel"]].map(([n,l]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.5rem",
                  fontWeight:700, background:`linear-gradient(135deg,${GOLD},#7B5A00)`,
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{n}</div>
                <div style={{ fontSize:"0.72rem", color:"#888", letterSpacing:"0.12em",
                  textTransform:"uppercase", marginTop:"4px" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{ background: DARK, padding:"48px 32px", textAlign:"center" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem",
          background:`linear-gradient(135deg,${GOLD},#E8D5A3)`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          marginBottom:"10px" }}>{siteInfo.nom || "Abaïa Cosmétique"}</div>
        <p style={{ fontSize:"0.82rem", color:"#888", fontStyle:"italic", marginBottom:"16px" }}>
          {siteInfo.slogan || "Élevez Votre Éclat Naturel"}
        </p>
        <p style={{ fontSize:"0.8rem", color:"#666" }}>
          📱 <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
            style={{ color: GOLD, textDecoration:"none" }}>
            Commander via WhatsApp — {siteInfo.whatsapp || "+237 6 98 54 80 16"}
          </a>
        </p>
        <p style={{ fontSize:"0.68rem", color:"#444", marginTop:"20px" }}>
          © 2025 {siteInfo.nom || "Abaïa Cosmétique"} — Tous droits réservés
        </p>
      </footer>

      {/* Panier modal */}
      {showPanier && <AbaiaPanier panier={panier} setPanier={setPanier} onClose={() => setShowPanier(false)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  )
}
