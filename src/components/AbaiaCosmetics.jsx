import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"

const WHATSAPP = "237698548016"
const GOLD = "#B8860B"
const CREAM = "#FDF6EC"
const DARK = "#1C1C1C"
const LS_PANIER = "abaia_panier_v3"

const DEFAULT_CATALOGUE = [
  { categorie_id:"lait-corps",  categorie_nom:"Lait Pour le Corps",  icon:"🧴", produits:[
    { id:"lc1",nom:"Lait hydratant",          prix:5000, ordre:1 },
    { id:"lc2",nom:"Lait teint caramel",       prix:6500, ordre:2 },
    { id:"lc3",nom:"Lait teint clair",         prix:7500, ordre:3 },
    { id:"lc4",nom:"Lait teint métisse",      prix:10000, ordre:4 },
    { id:"lc5",nom:"Lait teint blanchissant", prix:15000, ordre:5 },
  ]},
  { categorie_id:"gel-douche",  categorie_nom:"Gel Douches",         icon:"🚿", produits:[
    { id:"gd1",nom:"Gel douche Perfect Glow", prix:4000,ordre:1 },
    { id:"gd2",nom:"Gel douche métisse",       prix:6500,ordre:2 },
    { id:"gd3",nom:"Gel douche blanchissant", prix:8000,ordre:3 },
  ]},
  { categorie_id:"creme-visage",categorie_nom:"Crème Visage",        icon:"✨", produits:[
    { id:"cv1",nom:"Crème visage hydratant",            prix:2500,ordre:1 },
    { id:"cv2",nom:"Crème visage teint caramel",        prix:3000,ordre:2 },
    { id:"cv3",nom:"Crème visage teint clair",          prix:3500,ordre:3 },
    { id:"cv4",nom:"Crème visage teint métisse",       prix:4000,ordre:4 },
    { id:"cv5",nom:"Crème visage teint blanchissant",  prix:5000,ordre:5 },
  ]},
  { categorie_id:"gommage",     categorie_nom:"Gommage",             icon:"💎", produits:[
    { id:"g1",nom:"Gommage éclat",        prix:5000,ordre:1 },
    { id:"g2",nom:"Gommage au café",       prix:5000,ordre:2 },
    { id:"g3",nom:"Gommage blanchissant", prix:8000,ordre:3 },
  ]},
  { categorie_id:"gamme",       categorie_nom:"Gamme des Produits",  icon:"👑", produits:[
    { id:"gp1",nom:"Gamme nature",        prix:16000,ordre:1 },
    { id:"gp2",nom:"Gamme caramel",       prix:24000,ordre:2 },
    { id:"gp3",nom:"Gamme éclat",         prix:27000,ordre:3 },
    { id:"gp4",nom:"Gamme métisse",      prix:31000,ordre:4 },
    { id:"gp5",nom:"Gamme blanchissant", prix:38000,ordre:5 },
  ]},
  { categorie_id:"glow-oil",    categorie_nom:"Les Glow Oil",        icon:"🌟", produits:[
    { id:"go1",nom:"Huile clarifiante",     prix:4000,ordre:1 },
    { id:"go2",nom:"Huile éclaircissante",  prix:5000,ordre:2 },
    { id:"go3",nom:"Huile métisse",         prix:6000,ordre:3 },
  ]},
]

const CAT_ICONS={"lait-corps":"🧴","gel-douche":"🚿","creme-visage":"✨","gommage":"💎","gamme":"👑","glow-oil":"🌟"}
const fmt = p => Number.isFinite(p) ? new Intl.NumberFormat("fr-FR").format(p)+" FCFA" : "—"

// ── Supabase helpers ─────────────────────────────────────────────────────────
async function fetchCatalogue() {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.from("abaia_products").select("*").eq("active",true).order("categorie_id").order("ordre")
    if (error) throw error
    const bycat = {}
    for (const p of data) {
      if (!bycat[p.categorie_id]) bycat[p.categorie_id] = { categorie_id:p.categorie_id, categorie_nom:p.categorie_nom, icon:CAT_ICONS[p.categorie_id]||p.icon||"✨", produits:[] }
      bycat[p.categorie_id].produits.push({ id:p.id, nom:p.nom, prix:p.prix, ordre:p.ordre, image_url:p.image_url||null })
    }
    return Object.values(bycat)
  } catch(e) { console.warn("fetchCatalogue:", e.message); return null }
}

async function fetchSettings() {
  if (!supabase) return {}
  try {
    const { data, error } = await supabase.from("abaia_settings").select("key,value")
    if (error) throw error
    return Object.fromEntries(data.map(r=>[r.key,r.value]))
  } catch(e) { return {} }
}

async function upsertProduct(id, changes) {
  if (!supabase) return false
  const { error } = await supabase.from("abaia_products").update(changes).eq("id",id)
  return !error
}
async function softDelete(id) {
  if (!supabase) return false
  const { error } = await supabase.from("abaia_products").update({active:false}).eq("id",id)
  return !error
}
async function insertProduct(row) {
  if (!supabase) return {...row,id:"local_"+Date.now()}
  const { data, error } = await supabase.from("abaia_products").insert(row).select().single()
  return error ? null : data
}
async function upsertSettings(obj) {
  if (!supabase) return false
  const rows = Object.entries(obj).map(([key,value])=>({key,value}))
  const { error } = await supabase.from("abaia_settings").upsert(rows)
  return !error
}

// ── Upload image to Supabase Storage ─────────────────────────────────────────
async function uploadImage(file, path) {
  if (!supabase) return null
  try {
    const { error: upErr } = await supabase.storage.from("abaia").upload(path, file, { upsert:true, contentType:file.type })
    if (upErr) throw upErr
    const { data } = supabase.storage.from("abaia").getPublicUrl(path)
    return data.publicUrl
  } catch(e) { console.error("Upload error:", e.message); return null }
}

// ── PANIER ───────────────────────────────────────────────────────────────────
function PanierDrawer({ panier, setPanier, onClose }) {
  const total = panier.reduce((s,i)=>s+i.prix*i.qty,0)
  const [sent, setSent] = useState(false)
  const upd = (id,d) => setPanier(p=>{ const n=p.map(i=>i.id===id?{...i,qty:i.qty+d}:i).filter(i=>i.qty>0); localStorage.setItem(LS_PANIER,JSON.stringify(n)); return n })
  const rm  = (id)   => setPanier(p=>{ const n=p.filter(i=>i.id!==id); localStorage.setItem(LS_PANIER,JSON.stringify(n)); return n })
  const cmd = () => {
    const txt = panier.map(i=>`• ${i.nom} ×${i.qty} = ${fmt(i.prix*i.qty)}`).join("\n")
    const m = encodeURIComponent(`Bonjour Abaïa Cosmétique\n\nCommande :\n${txt}\n\nTOTAL : ${fmt(total)}\n\nMerci 🙏`)
    window.open(`https://wa.me/${WHATSAPP}?text=${m}`,"_blank")
    setPanier([]); localStorage.removeItem(LS_PANIER); setSent(true)
    setTimeout(()=>{ setSent(false); onClose() },2500)
  }
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",justifyContent:"flex-end"}} onClick={onClose}>
      <div style={{width:"min(420px,100vw)",background:CREAM,height:"100%",overflowY:"auto",padding:"28px 24px",display:"flex",flexDirection:"column",boxShadow:"-8px 0 60px rgba(184,134,11,0.15)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"28px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.7rem",color:GOLD}}>Mon Panier</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:"1.4rem",cursor:"pointer",color:"#999"}}>✕</button>
        </div>
        {sent ? (
          <div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:"3rem",marginBottom:"16px"}}>✅</div><p style={{fontWeight:700,color:GOLD,fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem"}}>Commande envoyée !</p></div>
        ) : panier.length===0 ? (
          <div style={{textAlign:"center",padding:"60px 20px",color:"#bbb"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>🛒</div><p>Votre panier est vide</p></div>
        ) : (
          <>
            <div style={{flex:1,overflowY:"auto"}}>
              {panier.map(item=>(
                <div key={item.id} style={{display:"flex",gap:"12px",padding:"14px 0",borderBottom:"1px solid rgba(197,165,90,0.1)",alignItems:"center"}}>
                  <div style={{width:"52px",height:"52px",borderRadius:"10px",background:"rgba(184,134,11,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
                    {item.image_url ? <img src={item.image_url} alt={item.nom} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{fontSize:"1.5rem"}}>{item.icon||"✨"}</span>}
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:600,fontSize:"0.87rem",color:DARK,marginBottom:"4px"}}>{item.nom}</p>
                    <p style={{fontSize:"0.77rem",color:"#999"}}>{fmt(item.prix)} × {item.qty} = <strong style={{color:GOLD}}>{fmt(item.prix*item.qty)}</strong></p>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
                    <button onClick={()=>upd(item.id,-1)} style={{width:"26px",height:"26px",borderRadius:"50%",border:`1px solid rgba(184,134,11,0.3)`,background:"transparent",color:GOLD,cursor:"pointer",fontSize:"1rem",lineHeight:1}}>−</button>
                    <span style={{fontWeight:700,minWidth:"18px",textAlign:"center",fontSize:"0.9rem"}}>{item.qty}</span>
                    <button onClick={()=>upd(item.id,+1)} style={{width:"26px",height:"26px",borderRadius:"50%",border:`1px solid rgba(184,134,11,0.3)`,background:"transparent",color:GOLD,cursor:"pointer",fontSize:"1rem",lineHeight:1}}>+</button>
                    <button onClick={()=>rm(item.id)} style={{background:"none",border:"none",color:"#dc3545",cursor:"pointer",marginLeft:"4px"}}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:"20px",padding:"18px",background:"white",borderRadius:"14px",border:"1px solid rgba(184,134,11,0.12)",boxShadow:"0 4px 20px rgba(184,134,11,0.08)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                <span style={{fontWeight:600,color:DARK}}>Total</span>
                <span style={{fontWeight:800,color:GOLD,fontSize:"1.2rem",fontFamily:"'Cormorant Garamond',serif"}}>{fmt(total)}</span>
              </div>
              <button onClick={cmd} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${GOLD},#8B6914)`,border:"none",borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.9rem",cursor:"pointer"}}>Commander via WhatsApp</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── ADMIN ────────────────────────────────────────────────────────────────────
function AbaiaAdmin({ onBack }) {
  const [catalogue, setCatalogue] = useState([])
  const [settings,  setSettings]  = useState({})
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState("dashboard")
  const [toast,     setToast]     = useState(null)
  const [showAdd,   setShowAdd]   = useState(null)
  const [newProd,   setNewProd]   = useState({nom:"",prix:""})
  const [busyId,    setBusyId]    = useState(null)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const fileRef = useRef(null)
  const heroRef = useRef(null)

  const t = (msg,type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(()=>{
    (async()=>{
      setLoading(true)
      const [cat,sets] = await Promise.all([fetchCatalogue(),fetchSettings()])
      setCatalogue(cat||DEFAULT_CATALOGUE)
      const lss=(()=>{try{return JSON.parse(localStorage.getItem("abaia_siteinfo")||"{}")}catch(e){return{}}})()
      setSettings({...lss,...sets})
      setLoading(false)
    })()
  },[])

  const totalProds = catalogue.reduce((s,c)=>s+c.produits.length,0)
  const allPrix    = catalogue.flatMap(c=>c.produits.map(p=>p.prix))
  const prixMoyen  = allPrix.length ? Math.round(allPrix.reduce((a,b)=>a+b,0)/allPrix.length) : 0

  const handlePrix = async(id,prix)=>{ setBusyId(id); const ok=await upsertProduct(id,{prix:parseInt(prix)||0}); setCatalogue(c=>c.map(cat=>({...cat,produits:cat.produits.map(p=>p.id===id?{...p,prix:parseInt(prix)||p.prix}:p)}))); ok?t("Prix mis à jour"):t("Erreur","err"); setBusyId(null) }
  const handleNom  = async(id,nom) =>{ const ok=await upsertProduct(id,{nom}); if(ok){setCatalogue(c=>c.map(cat=>({...cat,produits:cat.produits.map(p=>p.id===id?{...p,nom}:p)}))); t("Nom mis à jour")} }
  const handleDel  = async(id)     =>{ if(!window.confirm("Supprimer ?")) return; const ok=await softDelete(id); if(ok){setCatalogue(c=>c.map(cat=>({...cat,produits:cat.produits.filter(p=>p.id!==id)}))); t("Supprimé")} }
  const handleAdd  = async(catId)  =>{
    if(!newProd.nom||!newProd.prix){t("Nom et prix requis","err");return}
    const catInfo=catalogue.find(c=>c.categorie_id===catId)
    const row={categorie_id:catId,categorie_nom:catInfo?.categorie_nom||catId,icon:catInfo?.icon||"✨",nom:newProd.nom,prix:parseInt(newProd.prix)||0,ordre:99}
    const added=await insertProduct(row)
    if(!added){t("Erreur","err");return}
    setCatalogue(c=>c.map(cat=>cat.categorie_id===catId?{...cat,produits:[...cat.produits,{id:added.id,nom:added.nom,prix:added.prix,ordre:added.ordre,image_url:null}]}:cat))
    setNewProd({nom:"",prix:""}); setShowAdd(null); t("Produit ajouté !")
  }
  const handleImageUpload = async(id,file)=>{
    if(!file) return
    setBusyId(id)
    const url = await uploadImage(file,`products/${id}_${Date.now()}`)
    if(url){
      await upsertProduct(id,{image_url:url})
      setCatalogue(c=>c.map(cat=>({...cat,produits:cat.produits.map(p=>p.id===id?{...p,image_url:url}:p)})))
      t("Photo mise à jour !")
    } else {
      t("Erreur upload (vérifier bucket 'abaia' dans Supabase Storage)","err")
    }
    setBusyId(null)
  }
  const handleHeroUpload = async(file)=>{
    if(!file) return
    const url = await uploadImage(file,`hero_${Date.now()}`)
    if(url){
      const newSettings = {...settings, hero_image:url};
      setSettings(newSettings);
      upsertSettings({hero_image:url});
      localStorage.setItem("abaia_siteinfo",JSON.stringify(newSettings));
      t("Bannière mise à jour et sauvegardée !");
    }
    else t("Erreur upload","err")
  }
  const handleSaveSettings = async()=>{ await upsertSettings(settings); localStorage.setItem("abaia_siteinfo",JSON.stringify(settings)); t("Paramètres sauvegardés !") }

  const S = {
    page:  {minHeight:"100vh",background:`linear-gradient(160deg,${CREAM} 0%,#F0DEC8 100%)`,fontFamily:"'Poppins',system-ui,sans-serif",color:DARK},
    header:{background:`linear-gradient(135deg,${DARK} 0%,#2C1F0E 100%)`,minHeight:"64px",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 30px rgba(0,0,0,0.25)",borderBottom:`1px solid rgba(184,134,11,0.25)`,flexWrap:"wrap"},
    logo:  {fontFamily:"'Cormorant Garamond',serif",fontSize:"1.05rem",fontWeight:700,background:`linear-gradient(135deg,${GOLD},#E8D5A3)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
    navBtn:(a)=>({padding:"7px 18px",borderRadius:"20px",border:a?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.78rem",fontWeight:600,background:a?`linear-gradient(135deg,${GOLD},#8B6914)`:"rgba(255,255,255,0.06)",color:a?"#fff":"#bbb",transition:"all 0.2s",whiteSpace:"nowrap"}),
    card:  {background:"#fff",borderRadius:"20px",padding:"24px",boxShadow:"0 8px 40px rgba(184,134,11,0.08),0 2px 8px rgba(0,0,0,0.04)",marginBottom:"20px",border:"1px solid rgba(197,165,90,0.12)"},
    input: {width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(197,165,90,0.3)",fontSize:"0.85rem",outline:"none",color:DARK,background:"#fff",boxSizing:"border-box"},
    btnG:  {padding:"11px 22px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${GOLD},#8B6914)`,color:"#fff",fontWeight:700,fontSize:"0.82rem",cursor:"pointer"},
    btnD:  {padding:"6px 10px",borderRadius:"8px",border:"none",background:"rgba(220,53,69,0.08)",color:"#dc3545",fontWeight:600,fontSize:"0.78rem",cursor:"pointer"},
    row:   {display:"flex",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(197,165,90,0.08)",gap:"8px",flexWrap:"wrap"},
    prI:   {width:"90px",padding:"7px 10px",borderRadius:"8px",border:"1px solid rgba(197,165,90,0.25)",fontSize:"0.85rem",fontWeight:700,color:GOLD,textAlign:"right",outline:"none",background:"rgba(253,246,236,0.8)"},
    lbl:   {display:"block",marginBottom:"6px",fontSize:"0.73rem",color:"#999",textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600},
    imgBox:{width:"48px",height:"48px",borderRadius:"8px",background:"rgba(184,134,11,0.08)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,cursor:"pointer",border:"1px dashed rgba(184,134,11,0.2)",position:"relative"},
  }

  if(loading) return <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:"2.5rem",marginBottom:"12px"}}>✨</div><p style={{color:GOLD,fontFamily:"'Cormorant Garamond',serif",fontSize:"1.1rem"}}>Chargement...</p></div></div>

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",minHeight:"64px"}}>
          <span style={S.logo}>Abaïa Admin</span>
          {/* Desktop nav - hidden on mobile via CSS */}
          <nav className="abaia-nav-desktop" style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {[["dashboard","Tableau de Bord"],["catalogue","Catalogue"],["boutique","Boutique"],["commandes","Commandes"],["infos","Paramètres"]].map(([id,label])=>(
              <button key={id} style={{padding:"7px 16px",borderRadius:"20px",border:tab===id?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.76rem",fontWeight:600,background:tab===id?`linear-gradient(135deg,${GOLD},#8B6914)`:"rgba(255,255,255,0.06)",color:tab===id?"#fff":"#bbb",transition:"all 0.2s",whiteSpace:"nowrap"}} onClick={()=>setTab(id)}>{label}</button>
            ))}
            <button onClick={onBack} style={{padding:"7px 16px",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.76rem",fontWeight:600,background:"rgba(255,255,255,0.06)",color:"#bbb",whiteSpace:"nowrap"}}>← Retour</button>
          </nav>
          {/* Mobile hamburger - shown on mobile via CSS */}
          <button className="abaia-burger" onClick={()=>setMenuOpen(!menuOpen)} style={{background:"none",border:"none",cursor:"pointer",padding:"8px",display:"none",flexDirection:"column",gap:"5px"}}>
            <span style={{width:"22px",height:"2px",background:GOLD,borderRadius:"2px",transition:"all 0.3s",transform:menuOpen?"rotate(45deg) translate(5px,5px)":"none"}}/>
            <span style={{width:"22px",height:"2px",background:GOLD,borderRadius:"2px",transition:"all 0.3s",opacity:menuOpen?0:1}}/>
            <span style={{width:"22px",height:"2px",background:GOLD,borderRadius:"2px",transition:"all 0.3s",transform:menuOpen?"rotate(-45deg) translate(5px,-5px)":"none"}}/>
          </button>
        </div>
        {/* Mobile nav dropdown */}
        {menuOpen && (
          <nav className="abaia-nav-mobile" style={{width:"100%",display:"flex",flexDirection:"column",gap:"6px",padding:"8px 0 14px"}}>
            {[["dashboard","Tableau de Bord"],["catalogue","Catalogue"],["boutique","Boutique"],["commandes","Commandes"],["infos","Paramètres"]].map(([id,label])=>(
              <button key={id} style={{padding:"10px 16px",borderRadius:"12px",border:tab===id?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.82rem",fontWeight:600,background:tab===id?`linear-gradient(135deg,${GOLD},#8B6914)`:"rgba(255,255,255,0.06)",color:tab===id?"#fff":"#bbb",width:"100%",textAlign:"center"}} onClick={()=>{setTab(id);setMenuOpen(false)}}>{label}</button>
            ))}
            <button onClick={()=>{setMenuOpen(false);onBack()}} style={{padding:"10px 16px",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.82rem",fontWeight:600,background:"rgba(255,255,255,0.06)",color:"#bbb",width:"100%",textAlign:"center"}}>← Retour au site</button>
          </nav>
        )}
      </header>

      {toast&&<div style={{position:"fixed",top:"74px",right:"20px",zIndex:9999,padding:"12px 22px",borderRadius:"12px",background:toast.type==="err"?"#dc3545":`linear-gradient(135deg,${GOLD},#8B6914)`,color:"#fff",fontWeight:600,fontSize:"0.85rem",boxShadow:"0 8px 30px rgba(0,0,0,0.2)"}}>{toast.type==="err"?"❌":"✅"} {toast.msg}</div>}

      <div style={{maxWidth:"1060px",margin:"0 auto",padding:"32px 20px"}}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.2rem",fontWeight:700,color:DARK,marginBottom:"8px"}}>Tableau de Bord</h2>
            <p style={{color:"#aaa",fontSize:"0.82rem",marginBottom:"28px"}}>Bienvenue dans la console administrative Abaïa Cosmétique</p>
            <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginBottom:"28px"}}>
              {[["📦","Produits",totalProds,GOLD],["🏷️","Catégories",catalogue.length,"#7B5A00"],["💰","Prix moyen",fmt(prixMoyen),"#5A4A00"],["📈","Prix max",fmt(Math.max(...allPrix,0)),"#6B3A00"]].map(([icon,label,val,color])=>(
                <div key={label} style={{background:"#fff",borderRadius:"16px",padding:"20px 16px",textAlign:"center",border:"1px solid rgba(184,134,11,0.1)",boxShadow:"0 4px 20px rgba(184,134,11,0.06)",flex:1,minWidth:"120px"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"8px"}}>{icon}</div>
                  <div style={{fontWeight:800,color,fontSize:"1rem",fontFamily:"'Cormorant Garamond',serif",marginBottom:"4px"}}>{val}</div>
                  <div style={{fontSize:"0.68rem",color:"#bbb",textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem",fontWeight:700,color:DARK,marginBottom:"16px"}}>Aperçu du Catalogue</h3>
              {catalogue.map(cat=>{
                const pct = totalProds?Math.round((cat.produits.length/totalProds)*100):0
                return(
                  <div key={cat.categorie_id} style={{marginBottom:"14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.84rem",marginBottom:"5px"}}>
                      <span style={{fontWeight:600}}>{cat.icon} {cat.categorie_nom}</span>
                      <span style={{color:"#aaa"}}>{cat.produits.length} produits</span>
                    </div>
                    <div style={{height:"6px",background:"rgba(197,165,90,0.1)",borderRadius:"3px"}}><div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${GOLD},#D4A017)`,borderRadius:"3px"}}/></div>
                  </div>
                )
              })}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:"14px"}}>
              {[["📦","Gérer le catalogue","Modifier prix, photos, produits","catalogue"],["ℹ️","Informations du site","Nom, slogan, bannière","infos"],["📱","WhatsApp Business","Voir les commandes",null]].map(([icon,title,desc,navTo])=>(
                <div key={title} style={{...S.card,marginBottom:0,cursor:"pointer",transition:"transform 0.2s,box-shadow 0.2s"}} onClick={()=>navTo?setTab(navTo):window.open(`https://wa.me/${WHATSAPP}`,"_blank")} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(184,134,11,0.15)"}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 40px rgba(184,134,11,0.08),0 2px 8px rgba(0,0,0,0.04)"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"10px"}}>{icon}</div>
                  <p style={{fontWeight:700,color:DARK,marginBottom:"4px",fontSize:"0.9rem"}}>{title}</p>
                  <p style={{fontSize:"0.75rem",color:"#aaa"}}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATALOGUE */}
        {tab==="catalogue"&&(
          <div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.2rem",fontWeight:700,color:DARK,marginBottom:"8px"}}>Catalogue Produits</h2>
            <p style={{color:"#aaa",fontSize:"0.82rem",marginBottom:"28px"}}>Cliquez sur un nom ou prix pour modifier — cliquez sur la photo pour changer l'image</p>
            {catalogue.map(cat=>(
              <div key={cat.categorie_id} style={S.card}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"18px",paddingBottom:"14px",borderBottom:"1px solid rgba(197,165,90,0.1)"}}>
                  <span style={{fontSize:"1.5rem",background:"rgba(184,134,11,0.08)",borderRadius:"10px",padding:"8px",lineHeight:1}}>{cat.icon}</span>
                  <div>
                    <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",fontWeight:700,color:DARK}}>{cat.categorie_nom}</h3>
                    <span style={{fontSize:"0.72rem",color:"#bbb"}}>{cat.produits.length} produits</span>
                  </div>
                </div>
                {cat.produits.map(p=>(
                  <div key={p.id} style={S.row}>
                    {/* Photo thumbnail — click to upload */}
                    <label style={S.imgBox} title="Cliquer pour changer la photo">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.nom} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : <span style={{fontSize:"1.3rem"}}>{cat.icon}</span>}
                      <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleImageUpload(p.id,e.target.files[0])}}/>
                      {busyId===p.id&&<div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"8px"}}><span style={{fontSize:"0.7rem",color:GOLD}}>⏳</span></div>}
                    </label>
                    <input defaultValue={p.nom} onBlur={e=>{if(e.target.value!==p.nom)handleNom(p.id,e.target.value)}} style={{flex:1,padding:"7px 10px",border:"1px solid transparent",borderRadius:"8px",fontSize:"0.85rem",color:DARK,background:"transparent",outline:"none",transition:"border 0.2s"}} onFocus={e=>{e.target.style.border="1px solid rgba(197,165,90,0.4)";e.target.style.background="#fff"}} onBlurCapture={e=>{e.target.style.border="1px solid transparent";e.target.style.background="transparent"}}/>
                    <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                      <input type="number" defaultValue={p.prix} onBlur={e=>{if(parseInt(e.target.value)!==p.prix)handlePrix(p.id,e.target.value)}} style={S.prI}/>
                      <span style={{fontSize:"0.7rem",color:"#bbb",whiteSpace:"nowrap"}}>FCFA</span>
                    </div>
                    <button onClick={()=>handleDel(p.id)} style={S.btnD}>🗑</button>
                  </div>
                ))}
                {showAdd===cat.categorie_id?(
                  <div style={{marginTop:"14px",padding:"14px",background:"rgba(184,134,11,0.04)",borderRadius:"12px",border:"1px dashed rgba(184,134,11,0.2)"}}>
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"flex-end"}}>
                      <div style={{flex:2,minWidth:"140px"}}><label style={S.lbl}>Nom</label><input placeholder="Ex: Lait teint doré" value={newProd.nom} onChange={e=>setNewProd(p=>({...p,nom:e.target.value}))} style={S.input}/></div>
                      <div style={{flex:1,minWidth:"100px"}}><label style={S.lbl}>Prix FCFA</label><input type="number" placeholder="5000" value={newProd.prix} onChange={e=>setNewProd(p=>({...p,prix:e.target.value}))} style={S.input}/></div>
                      <button onClick={()=>handleAdd(cat.categorie_id)} style={S.btnG}>+ Ajouter</button>
                      <button onClick={()=>setShowAdd(null)} style={{...S.btnD,padding:"11px 16px"}}>Annuler</button>
                    </div>
                  </div>
                ):(
                  <button onClick={()=>{setShowAdd(cat.categorie_id);setNewProd({nom:"",prix:""})}} style={{marginTop:"12px",width:"100%",background:"none",border:"1px dashed rgba(184,134,11,0.2)",color:GOLD,borderRadius:"10px",padding:"9px 16px",cursor:"pointer",fontSize:"0.78rem"}}>+ Ajouter un produit</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BOUTIQUE */}
        {tab==="boutique"&&(
          <div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.2rem",fontWeight:700,color:DARK,marginBottom:"8px"}}>Boutique</h2>
            <div style={{...S.card,textAlign:"center",padding:"50px 40px"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"14px"}}>🛒</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.5rem",color:DARK,marginBottom:"8px"}}>Boutique synchronisée</h3>
              <p style={{color:"#aaa",fontSize:"0.85rem"}}>Les produits du catalogue sont affichés dans la boutique du site avec leurs photos.</p>
              <p style={{fontSize:"0.82rem",color:"#888",marginTop:"12px"}}>Les commandes arrivent via <strong style={{color:"#25D366"}}>WhatsApp</strong> au {settings.whatsapp||"+237 6 98 54 80 16"}</p>
            </div>
          </div>
        )}

        {/* COMMANDES */}
        {tab==="commandes"&&(
          <div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.2rem",fontWeight:700,color:DARK,marginBottom:"8px"}}>Commandes</h2>
            <div style={S.card}>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",fontWeight:700,color:DARK,marginBottom:"16px"}}>Comment ça marche</h3>
              {[["1","Le client parcourt le catalogue ou la boutique","🛍️"],["2","Il clique « Commander via WhatsApp »","📱"],["3","Un message avec le détail complet est envoyé","✉️"],["4","Vous confirmez et gérez la livraison","✅"]].map(([n,txt,icon])=>(
                <div key={n} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 0",borderBottom:"1px solid rgba(197,165,90,0.08)"}}>
                  <div style={{width:"32px",height:"32px",borderRadius:"50%",background:`linear-gradient(135deg,${GOLD},#8B6914)`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.85rem",flexShrink:0}}>{n}</div>
                  <span style={{fontSize:"0.85rem",color:DARK,flex:1}}>{txt}</span>
                  <span>{icon}</span>
                </div>
              ))}
            </div>
            <div style={{...S.card,textAlign:"center"}}>
              <p style={{color:"#888",marginBottom:"14px",fontSize:"0.85rem"}}>Numéro actif : <strong style={{color:GOLD}}>{settings.whatsapp||"+237 6 98 54 80 16"}</strong></p>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" style={{display:"inline-block",padding:"12px 24px",background:`linear-gradient(135deg,${GOLD},#8B6914)`,borderRadius:"10px",color:"#fff",fontWeight:700,textDecoration:"none",fontSize:"0.85rem"}}>Ouvrir WhatsApp Business</a>
            </div>
          </div>
        )}

        {/* PARAMETRES */}
        {tab==="infos"&&(
          <div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.2rem",fontWeight:700,color:DARK,marginBottom:"8px"}}>Paramètres du Site</h2>
            <p style={{color:"#aaa",fontSize:"0.82rem",marginBottom:"28px"}}>Modifiez les informations et la bannière affichées sur votre site</p>

            {/* Hero image upload */}
            <div style={S.card}>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",fontWeight:700,color:DARK,marginBottom:"16px"}}>Bannière d'accueil</h3>
              <div style={{borderRadius:"14px",overflow:"hidden",marginBottom:"14px",maxHeight:"220px",background:"rgba(184,134,11,0.06)",border:"1px solid rgba(184,134,11,0.15)"}}>
                {settings.hero_image
                  ? <img src={settings.hero_image} alt="Hero" style={{width:"100%",objectFit:"cover",maxHeight:"220px"}}/>
                  : <div style={{height:"180px",display:"flex",alignItems:"center",justifyContent:"center",color:"#bbb"}}><div style={{textAlign:"center"}}><div style={{fontSize:"2rem",marginBottom:"8px"}}>🖼️</div><p style={{fontSize:"0.82rem"}}>Aucune bannière</p></div></div>}
              </div>
              <label style={{display:"inline-block",padding:"10px 20px",background:`linear-gradient(135deg,${GOLD},#8B6914)`,borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.82rem",cursor:"pointer"}}>
                📁 Changer la bannière
                <input ref={heroRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleHeroUpload(e.target.files[0])}}/>
              </label>
            </div>

            {/* Infos */}
            <div style={S.card}>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",fontWeight:700,color:DARK,marginBottom:"18px"}}>Informations</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"18px"}}>
                {[["nom","Nom de la marque","Abaïa Cosmétique"],["slogan","Slogan","Élevez Votre Éclat Naturel"],["whatsapp","Numéro WhatsApp","+237 6 98 54 80 16"],["email","Email","contact@abaia.com"],["adresse","Adresse","Cameroun"]].map(([key,label,ph])=>(
                  <div key={key}><label style={S.lbl}>{label}</label><input value={settings[key]||""} placeholder={ph} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))} style={S.input}/></div>
                ))}
                <div style={{gridColumn:"1/-1"}}><label style={S.lbl}>Description</label><textarea value={settings.description||""} rows={4} onChange={e=>setSettings(s=>({...s,description:e.target.value}))} style={{...S.input,resize:"vertical"}}/></div>
              </div>
              <button onClick={handleSaveSettings} style={{...S.btnG,marginTop:"20px"}}>💾 Sauvegarder</button>
            </div>

            {/* Aperçu */}
            <div style={S.card}>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",fontWeight:700,color:DARK,marginBottom:"14px"}}>Aperçu</h3>
              <div style={{background:CREAM,borderRadius:"12px",padding:"24px",textAlign:"center",border:"1px solid rgba(197,165,90,0.15)"}}>
                <p style={{fontSize:"0.66rem",letterSpacing:"0.4em",color:GOLD,textTransform:"uppercase",marginBottom:"8px"}}>— Cosmétique de Luxe —</p>
                <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.5rem",fontWeight:700,background:`linear-gradient(135deg,${GOLD},#7B5A00)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:"6px"}}>{settings.nom||"Abaïa Cosmétique"}</h1>
                <p style={{fontStyle:"italic",color:"#5A5040",fontSize:"0.95rem"}}>{settings.slogan||"Élevez Votre Éclat Naturel"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}
        .abaia-burger{display:none!important}
        @media(max-width:768px){
          .abaia-nav-desktop{display:none!important}
          .abaia-burger{display:flex!important}
        }
      `}</style>
    </div>
  )
}

// ── SITE PUBLIC PREMIUM ───────────────────────────────────────────────────────
function AbaiaSite() {
  const [catalogue, setCatalogue] = useState(DEFAULT_CATALOGUE)
  const [settings,  setSettings]  = useState({})
  const [panier,    setPanier]    = useState(()=>{try{return JSON.parse(localStorage.getItem(LS_PANIER)||"[]")}catch(e){return[]}})
  const [showPan,   setShowPan]   = useState(false)
  const [scrolled,  setScrolled]  = useState(false)
  const [sect,      setSect]      = useState("accueil")
  const [search,    setSearch]    = useState("")
  const [catFlt,    setCatFlt]    = useState("all")
  const [heroLoaded,setHeroLoaded]= useState(false)

  useEffect(()=>{
    let link=document.querySelector("link[rel~='icon']")
    if(!link){link=document.createElement("link");link.rel="icon";document.head.appendChild(link)}
    link.href='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23FDF6EC"/><text y=".9em" font-size="75" x="12">✨</text></svg>'
    document.title="Abaïa Cosmétique — Élevez Votre Éclat Naturel"
    ;(async()=>{
      const[cat,sets]=await Promise.all([fetchCatalogue(),fetchSettings()])
      if(cat&&cat.length)setCatalogue(cat)
      const lss=(()=>{try{return JSON.parse(localStorage.getItem("abaia_siteinfo")||"{}")}catch(e){return{}}})()
      setSettings({...lss,...sets})
    })()
    const h=()=>setScrolled(window.scrollY>60)
    window.addEventListener("scroll",h)
    return()=>{window.removeEventListener("scroll",h);document.title="Hosanne Platform"}
  },[])

  const totalItems=panier.reduce((s,i)=>s+i.qty,0)
  const addToCart=(p,catNom,icon)=>{
    setPanier(prev=>{
      const ex=prev.find(i=>i.id===p.id)
      const next=ex?prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...prev,{...p,catNom,icon,qty:1}]
      localStorage.setItem(LS_PANIER,JSON.stringify(next));return next
    })
  }
  const wa=msg=>window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Bonjour Abaïa Cosmétique\n"+msg+"\n\nMerci 🙏")}`,"_blank")
  const go=id=>{setSect(id);document.getElementById("ab-"+id)?.scrollIntoView({behavior:"smooth"})}

  const allProds=catalogue.flatMap(cat=>cat.produits.map(p=>({...p,catId:cat.categorie_id,catNom:cat.categorie_nom,icon:cat.icon})))
  const filtered=allProds.filter(p=>(!search||p.nom.toLowerCase().includes(search.toLowerCase()))&&(catFlt==="all"||p.catId===catFlt))
  const nm=settings.nom||"Abaïa Cosmétique"
  const sl=settings.slogan||"Élevez Votre Éclat Naturel"
  const heroImg=settings.hero_image||"/abaia_hero.png"
  const prodsImg=settings.products_image||"/abaia_products.png"

  return(
    <div style={{minHeight:"100vh",background:CREAM,fontFamily:"'Poppins',system-ui,sans-serif",color:DARK,overflowX:"hidden"}}>

      {/* NAVBAR */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:scrolled?"rgba(253,246,236,0.97)":"rgba(253,246,236,0.9)",backdropFilter:"blur(20px)",height:"68px",padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:scrolled?"1px solid rgba(184,134,11,0.15)":"1px solid transparent",boxShadow:scrolled?"0 4px 30px rgba(184,134,11,0.08)":"none",transition:"all 0.3s"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.55rem",fontWeight:700,background:`linear-gradient(135deg,${GOLD},#8B6914,#E8D5A3)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"0.02em"}}>{nm}</div>
        <div className="abaia-site-nav" style={{display:"flex",gap:"20px",alignItems:"center"}}>
          {[["accueil","Accueil"],["catalogue","Catalogue"],["boutique","Boutique"],["apropos","À Propos"]].map(([id,label])=>(
            <span key={id} onClick={()=>go(id)} style={{fontSize:"0.82rem",fontWeight:500,cursor:"pointer",color:sect===id?GOLD:"#5A5040",borderBottom:sect===id?`2px solid ${GOLD}`:"2px solid transparent",paddingBottom:"2px",transition:"all 0.2s"}}>{label}</span>
          ))}
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <a href="/abaia/admin/" style={{fontSize:"0.72rem",color:"#aaa",textDecoration:"none",padding:"6px 10px",borderRadius:"20px",border:"1px solid rgba(197,165,90,0.2)"}}>⚙️</a>
          <button onClick={()=>setShowPan(true)} style={{position:"relative",padding:"9px 20px",borderRadius:"30px",background:`linear-gradient(135deg,${GOLD},#8B6914)`,border:"none",color:"#fff",fontWeight:700,fontSize:"0.82rem",cursor:"pointer",boxShadow:"0 4px 16px rgba(184,134,11,0.3)",display:"flex",alignItems:"center",gap:"7px"}}>
            🛒 Panier
            {totalItems>0&&<span style={{background:"#8B4513",borderRadius:"50%",minWidth:"19px",height:"19px",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"0.68rem",fontWeight:800}}>{totalItems}</span>}
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION PREMIUM ── */}
      <section id="ab-accueil" style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",overflow:"hidden"}}>
        {/* Background hero image */}
        <div style={{position:"absolute",inset:0,zIndex:0}}>
          <img src={heroImg} alt="Abaïa Cosmétique" onLoad={()=>setHeroLoaded(true)} style={{width:"100%",height:"100%",objectFit:"cover",transition:"opacity 1s",opacity:heroLoaded?1:0}}/>
          <div style={{position:"absolute",inset:0,background:`linear-gradient(105deg, rgba(28,20,8,0.75) 0%, rgba(28,20,8,0.5) 50%, rgba(184,134,11,0.08) 100%)`}}/>
        </div>
        {/* Content */}
        <div style={{position:"relative",zIndex:1,maxWidth:"700px",padding:"120px 40px 80px",color:"#fff"}}>
          <p style={{fontSize:"0.7rem",letterSpacing:"0.6em",color:GOLD,textTransform:"uppercase",fontWeight:700,marginBottom:"18px"}}>— Cosmétique de Luxe Naturel —</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(3.5rem,8vw,6.5rem)",fontWeight:700,lineHeight:1.05,marginBottom:"18px",background:`linear-gradient(135deg,#FFFFFF 0%,${GOLD} 50%,#E8D5A3 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.3))"}}>{nm}</h1>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.1rem,2.5vw,1.5rem)",fontStyle:"italic",color:"rgba(255,255,255,0.85)",marginBottom:"32px"}}>{sl}</p>
          <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
            <button onClick={()=>go("boutique")} style={{padding:"14px 32px",borderRadius:"30px",border:"none",background:`linear-gradient(135deg,${GOLD},#8B6914)`,color:"#fff",fontWeight:700,fontSize:"0.9rem",cursor:"pointer",boxShadow:"0 8px 30px rgba(184,134,11,0.4)",letterSpacing:"0.05em"}}>Découvrir la Boutique ↓</button>
            <button onClick={()=>wa("Je souhaite plus d'informations sur vos produits.")} style={{padding:"14px 28px",borderRadius:"30px",background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",color:"#fff",border:"1px solid rgba(255,255,255,0.3)",fontWeight:600,fontSize:"0.88rem",cursor:"pointer"}}>Nous Contacter</button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div style={{position:"absolute",bottom:"32px",left:"50%",transform:"translateX(-50%)",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",cursor:"pointer"}} onClick={()=>go("catalogue")}>
          <span style={{fontSize:"0.68rem",letterSpacing:"0.2em",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>Défiler</span>
          <div style={{width:"1px",height:"40px",background:`linear-gradient(${GOLD},transparent)`}}/>
        </div>
      </section>

      {/* ── PRODUITS VEDETTES ── */}
      <section style={{padding:"60px 20px",maxWidth:"1200px",margin:"0 auto"}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.8rem,4vw,2.5rem)",textAlign:"center",marginBottom:"8px",background:`linear-gradient(135deg,${GOLD},#7B5A00)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Nos Produits Vedettes</h2>
        <p style={{textAlign:"center",color:"#aaa",fontSize:"0.78rem",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"36px"}}>Les incontournables de la gamme</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"20px"}}>
          {allProds.slice(0,6).map(p=>(
            <div key={p.id} style={{background:"#fff",borderRadius:"18px",overflow:"hidden",boxShadow:"0 4px 20px rgba(184,134,11,0.07)",border:"1px solid rgba(197,165,90,0.12)",transition:"transform 0.2s,box-shadow 0.2s",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(184,134,11,0.15)"}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 20px rgba(184,134,11,0.07)"}}>
              <div style={{height:"180px",background:`linear-gradient(135deg,rgba(184,134,11,0.07),rgba(232,213,163,0.12))`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.nom} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <div style={{textAlign:"center"}}><span style={{fontSize:"3rem",display:"block",marginBottom:"8px"}}>{p.icon}</span><p style={{fontSize:"0.68rem",color:"#bbb",letterSpacing:"0.15em"}}>Photo à venir</p></div>}
              </div>
              <div style={{padding:"16px"}}>
                <p style={{fontSize:"0.65rem",color:GOLD,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,marginBottom:"4px"}}>{p.catNom}</p>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.05rem",color:DARK,marginBottom:"10px",lineHeight:1.3}}>{p.nom}</h3>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:800,color:GOLD,fontSize:"1rem"}}>{fmt(p.prix)}</span>
                  <button onClick={()=>addToCart(p,p.catNom,p.icon)} style={{padding:"8px 14px",borderRadius:"8px",background:`linear-gradient(135deg,${GOLD},#D4A017)`,border:"none",color:"#fff",fontWeight:700,fontSize:"0.72rem",cursor:"pointer"}}>+ Panier</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:"32px"}}>
          <button onClick={()=>go("boutique")} style={{padding:"12px 32px",borderRadius:"30px",border:`1px solid rgba(184,134,11,0.35)`,background:"transparent",color:GOLD,fontWeight:600,fontSize:"0.85rem",cursor:"pointer",letterSpacing:"0.05em"}}>Voir tous les produits →</button>
        </div>
      </section>

      {/* ── CATALOGUE TARIFAIRE ── */}
      <section id="ab-catalogue" style={{padding:"80px 20px",background:`linear-gradient(135deg,rgba(232,213,163,0.12),${CREAM})`}}>
        <div style={{maxWidth:"1200px",margin:"0 auto"}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2rem,5vw,3rem)",textAlign:"center",marginBottom:"8px",background:`linear-gradient(135deg,${GOLD},#7B5A00)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Grille Tarifaire</h2>
          <p style={{textAlign:"center",color:"#aaa",fontSize:"0.78rem",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"48px"}}>Nourrit • Sublime • Révèle</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"20px"}}>
            {catalogue.map(cat=>(
              <div key={cat.categorie_id} style={{background:"rgba(255,252,245,0.95)",borderRadius:"18px",border:"1px solid rgba(197,165,90,0.18)",padding:"22px",boxShadow:"0 4px 20px rgba(184,134,11,0.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
                  <span style={{fontSize:"1.4rem",background:"rgba(184,134,11,0.08)",borderRadius:"10px",padding:"8px",lineHeight:1}}>{cat.icon}</span>
                  <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.15rem",fontWeight:700,color:DARK}}>{cat.categorie_nom}</h3>
                </div>
                {cat.produits.map(p=>(
                  <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(197,165,90,0.08)"}}>
                    <span style={{fontSize:"0.84rem",color:"#5A5040",display:"flex",alignItems:"center",gap:"6px"}}><span style={{color:GOLD,fontSize:"0.6rem"}}>✦</span>{p.nom}</span>
                    <span style={{fontWeight:700,color:GOLD,fontSize:"0.9rem",whiteSpace:"nowrap"}}>{fmt(p.prix)}</span>
                  </div>
                ))}
                <button onClick={()=>wa(`Je suis intéressé(e) par votre gamme : *${cat.categorie_nom}*`)} style={{marginTop:"14px",width:"100%",padding:"9px",background:`linear-gradient(135deg,${GOLD},#D4A017)`,border:"none",borderRadius:"8px",color:"#fff",fontWeight:700,fontSize:"0.75rem",cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.05em"}}>Commander cette gamme</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOUTIQUE ── */}
      <section id="ab-boutique" style={{padding:"80px 20px",background:CREAM}}>
        <div style={{maxWidth:"1200px",margin:"0 auto"}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2rem,5vw,3rem)",textAlign:"center",marginBottom:"8px",background:`linear-gradient(135deg,${GOLD},#7B5A00)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Boutique</h2>
          <p style={{textAlign:"center",color:"#aaa",fontSize:"0.78rem",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"32px"}}>Ajoutez au panier • Commandez via WhatsApp</p>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"28px",alignItems:"center"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un produit..." style={{flex:1,minWidth:"180px",padding:"11px 20px",border:"1px solid rgba(197,165,90,0.22)",borderRadius:"30px",fontSize:"0.84rem",outline:"none",color:DARK,background:"rgba(255,252,245,0.9)"}}/>
            {[["all","Tous"],...catalogue.map(c=>[c.categorie_id,c.icon+" "+c.categorie_nom.split(" ")[0]])].map(([id,label])=>(
              <button key={id} onClick={()=>setCatFlt(id)} style={{padding:"8px 14px",borderRadius:"30px",cursor:"pointer",border:"1px solid rgba(184,134,11,0.25)",fontSize:"0.75rem",background:catFlt===id?GOLD:"transparent",color:catFlt===id?"#fff":GOLD,fontWeight:catFlt===id?700:400,transition:"all 0.2s"}}>{label}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"16px"}}>
            {filtered.map(p=>(
              <div key={p.id} style={{background:"#fff",borderRadius:"16px",border:"1px solid rgba(197,165,90,0.15)",overflow:"hidden",boxShadow:"0 4px 16px rgba(184,134,11,0.05)",transition:"all 0.2s",display:"flex",flexDirection:"column"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 8px 30px rgba(184,134,11,0.12)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(184,134,11,0.05)"}>
                <div style={{height:"160px",background:`linear-gradient(135deg,rgba(184,134,11,0.06),rgba(232,213,163,0.1))`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.nom} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <div style={{textAlign:"center"}}><span style={{fontSize:"2.5rem",display:"block",marginBottom:"6px"}}>{p.icon}</span><p style={{fontSize:"0.65rem",color:"#ccc"}}>Photo à venir</p></div>}
                </div>
                <div style={{padding:"14px 16px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                  <div>
                    <p style={{fontSize:"0.62rem",color:GOLD,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,marginBottom:"4px"}}>{p.catNom}</p>
                    <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",color:DARK,marginBottom:"8px",lineHeight:1.3}}>{p.nom}</h3>
                    <p style={{fontWeight:800,color:GOLD,fontSize:"1rem",marginBottom:"12px"}}>{fmt(p.prix)}</p>
                  </div>
                  <button onClick={()=>addToCart(p,p.catNom,p.icon)} style={{width:"100%",padding:"9px",borderRadius:"8px",background:`linear-gradient(135deg,${GOLD},#D4A017)`,border:"none",color:"#fff",fontWeight:700,fontSize:"0.75rem",cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.05em"}}>+ Ajouter au panier</button>
                </div>
              </div>
            ))}
          </div>
          {!filtered.length&&<div style={{textAlign:"center",padding:"60px",color:"#aaa"}}><div style={{fontSize:"2.5rem",marginBottom:"12px"}}>🔍</div><p>Aucun produit trouvé</p></div>}
        </div>
      </section>

      {/* ── À PROPOS ── */}
      <section id="ab-apropos" style={{padding:"80px 20px",background:`linear-gradient(135deg,rgba(232,213,163,0.1),${CREAM})`}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"40px",alignItems:"center"}}>
          <div>
            <p style={{fontSize:"0.68rem",letterSpacing:"0.4em",color:GOLD,textTransform:"uppercase",fontWeight:700,marginBottom:"14px"}}>— Notre Histoire —</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2rem,4vw,3rem)",color:DARK,marginBottom:"20px",lineHeight:1.2}}>À Propos d'<span style={{background:`linear-gradient(135deg,${GOLD},#7B5A00)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Abaïa</span></h2>
            <p style={{fontSize:"0.95rem",lineHeight:1.85,color:"#5A5040",marginBottom:"24px"}}>{settings.description||"Abaïa Cosmétique propose une gamme complète de soins de beauté naturels. Nos formules enrichies nourrissent, hydratent et unifient le teint pour un résultat lumineux et naturel."}</p>
            <div style={{display:"flex",gap:"32px",flexWrap:"wrap"}}>
              {[["6","Gammes"],["25+","Produits"],["100%","Naturel"]].map(([n,l])=>(
                <div key={l}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.2rem",fontWeight:700,background:`linear-gradient(135deg,${GOLD},#7B5A00)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{n}</div>
                  <div style={{fontSize:"0.7rem",color:"#bbb",letterSpacing:"0.12em",textTransform:"uppercase",marginTop:"4px"}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{borderRadius:"24px",overflow:"hidden",boxShadow:"0 20px 60px rgba(184,134,11,0.15)",border:"1px solid rgba(197,165,90,0.15)"}}>
            <img src={prodsImg} alt="Produits Abaïa" style={{width:"100%",height:"340px",objectFit:"cover",display:"block"}}/>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:DARK,padding:"60px 28px 40px",color:"#fff"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"40px",marginBottom:"40px"}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.6rem",background:`linear-gradient(135deg,${GOLD},#E8D5A3)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:"10px"}}>{nm}</div>
            <p style={{fontSize:"0.82rem",color:"#888",fontStyle:"italic",lineHeight:1.7}}>{sl}</p>
          </div>
          <div>
            <h4 style={{fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:GOLD,marginBottom:"14px",fontWeight:700}}>Catalogue</h4>
            {catalogue.slice(0,4).map(cat=><p key={cat.categorie_id} style={{fontSize:"0.82rem",color:"#888",marginBottom:"6px",cursor:"pointer"}} onClick={()=>go("catalogue")}>{cat.categorie_nom}</p>)}
          </div>
          <div>
            <h4 style={{fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:GOLD,marginBottom:"14px",fontWeight:700}}>Contact</h4>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" style={{fontSize:"0.82rem",color:"#25D366",textDecoration:"none",display:"block",marginBottom:"6px"}}>{settings.whatsapp||"+237 6 98 54 80 16"}</a>
            {settings.email&&<p style={{fontSize:"0.82rem",color:"#888"}}>{settings.email}</p>}
            {settings.adresse&&<p style={{fontSize:"0.82rem",color:"#888",marginTop:"6px"}}>{settings.adresse}</p>}
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:"20px",textAlign:"center"}}>
          <p style={{fontSize:"0.66rem",color:"#555"}}>© 2025 {nm} — Tous droits réservés</p>
        </div>
      </footer>

      {showPan&&<PanierDrawer panier={panier} setPanier={setPanier} onClose={()=>setShowPan(false)}/>}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
        @media(max-width:768px){
          .abaia-site-nav{display:none!important}
        }
      `}</style>
    </div>
  )
}

export default function AbaiaCosmetics() {
  const path = window.location.pathname
  if (path.includes("/admin")) return <AbaiaAdmin onBack={()=>{ window.history.pushState({},"","/abaia/"); window.location.reload() }}/>
  return <AbaiaSite />
}
