import React, { useState, useEffect } from "react"
import { Sparkles, Phone, MapPin, ArrowRight, Images, ShoppingBag, X, ChevronLeft, ChevronRight } from "lucide-react"
import { getGalleryImages, getProducts, getHeroBanners } from "../supabase"

function buildGroups(items) {
  const map = {}
  items.forEach(item => {
    const key = item.group_id || item.id
    if (!map[key]) map[key] = { groupId: key, title: item.title, images: [item], category: item.category }
    else map[key].images.push(item)
  })
  return Object.values(map).slice(0, 4)
}

export default function Hero({ onBookNow, onGalleryClick, tenantId = null, siteSettings = null }) {
  const [groups, setGroups] = useState([])
  const [products, setProducts] = useState([])
  const [heroLightbox, setHeroLightbox] = useState(null)
  const [heroLbIdx, setHeroLbIdx] = useState(0)
  const [banners, setBanners] = useState([])
  const [activeBannerIdx, setActiveBannerIdx] = useState(0)

  useEffect(() => {
    getGalleryImages(tenantId).then(data => setGroups(buildGroups(data || []))).catch(() => {})
    getProducts(tenantId).then(data => setProducts((data || []).slice(0, 4))).catch(() => {})
    getHeroBanners(tenantId).then(data => setBanners(data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners])

  const displayBanners = banners.length > 0 ? banners : [{ id: 'default', image_url: '/gallery/salon_accueil.jpg', title: 'The Alpha Beauty' }]

  useEffect(() => {
    if (!heroLightbox) return
    const handler = (e) => {
      if (e.key === "ArrowRight") setHeroLbIdx(i => (i + 1) % heroLightbox.images.length)
      if (e.key === "ArrowLeft") setHeroLbIdx(i => (i - 1 + heroLightbox.images.length) % heroLightbox.images.length)
      if (e.key === "Escape") setHeroLightbox(null)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [heroLightbox])

  return (
    <section
      id="home"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px", background: "radial-gradient(circle at top right, rgba(212, 175, 55, 0.08) 0%, #0b0b0b 70%)", position: "relative", overflow: "hidden" }}
    >
      {/* Background blobs */}
      <div style={{ position: "absolute", top: "10%", left: "-5%", width: "300px", height: "300px", background: "rgba(212,175,55,0.03)", filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "-5%", width: "400px", height: "400px", background: "rgba(212,175,55,0.05)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none" }} />

      {/* Main hero grid */}
      <div style={{ maxWidth: "1200px", width: "100%", display: "grid", gridTemplateColumns: "1fr", gap: "48px", alignItems: "center" }} className="hero-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} style={{ color: "var(--primary-gold)" }} />
            <span style={{ fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600" }}>L'EXCELLENCE DE LA BEAUTE</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: "1.1", fontFamily: "var(--font-serif)" }}>
            Sublimez Votre <br />
            <span className="gold-text">Eclat Naturel</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "540px" }}>
            Bienvenue chez <strong>The Alpha Beauty</strong>. Plongez dans un univers de detente absolue, de raffinement et de soins esthetiques d exception.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", margin: "12px 0 24px" }}>
            <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(212,175,55,0.1)" }}>
              <MapPin size={20} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
              <div><h4 style={{ fontSize: "0.85rem" }}>Adresse</h4><p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Alibadeng au Transfo</p></div>
            </div>
            <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(212,175,55,0.1)" }}>
              <Phone size={20} style={{ color: "var(--primary-gold)", flexShrink: 0 }} />
              <div><h4 style={{ fontSize: "0.85rem" }}>Contact</h4><p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>077 00 40 73 / 062 88 70 94</p></div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <button onClick={onBookNow} className="btn-gold" style={{ padding: "16px 36px" }}>Prendre Rendez-vous</button>
            <a href="#services" className="btn-outline" style={{ padding: "16px 36px", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Decouvrir nos soins</a>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }} className="hero-image-container">
          <div style={{ position: "absolute", width: "80%", height: "80%", background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)", zIndex: 0 }} />
          <div className="glass-panel" style={{ padding: "12px", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: "1px solid rgba(212,175,55,0.25)", zIndex: 1, maxWidth: "420px", width: "100%", overflow: "hidden" }}>
            <div style={{ position: "relative", width: "100%", height: "450px", borderRadius: "8px", overflow: "hidden", background: "#0c0c0c" }}>
              {displayBanners.map((b, idx) => (
                <div
                  key={b.id}
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: activeBannerIdx === idx ? 1 : 0,
                    transition: "opacity 0.8s ease-in-out",
                    zIndex: activeBannerIdx === idx ? 2 : 1,
                    pointerEvents: activeBannerIdx === idx ? "auto" : "none"
                  }}
                >
                  <img
                    src={b.image_url}
                    alt={b.title || "The Alpha Beauty"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {b.title && b.id !== 'default' && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent)", padding: "20px 16px", zIndex: 3 }}>
                      <h3 style={{ color: "#fff", fontSize: "1rem", fontWeight: "700", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{b.title}</h3>
                    </div>
                  )}
                </div>
              ))}

              {displayBanners.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveBannerIdx(i => (i - 1 + displayBanners.length) % displayBanners.length); }}
                    style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveBannerIdx(i => (i + 1) % displayBanners.length); }}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
                  >
                    <ChevronRight size={18} />
                  </button>

                  <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 10 }}>
                    {displayBanners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setActiveBannerIdx(idx); }}
                        style={{ width: "8px", height: "8px", borderRadius: "50%", border: "none", padding: 0, background: activeBannerIdx === idx ? "var(--primary-gold)" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "background 0.3s ease" }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery preview section */}
      {groups.length > 0 && (
        <div style={{ maxWidth: "1200px", width: "100%", marginTop: "60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Images size={18} style={{ color: "var(--primary-gold)" }} />
              <span style={{ fontSize: "0.85rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600" }}>Nos Creations</span>
            </div>
            <button
              onClick={() => { const el = document.getElementById("gallery"); if (el) el.scrollIntoView({ behavior: "smooth" }); if (onGalleryClick) onGalleryClick(); }}
              style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: "600" }}
            >
              Voir toute la galerie <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {groups.map(g => {
              const img = g.images[0]
              return (
                <div
                  key={g.groupId}
                  onClick={() => { setHeroLightbox(g); setHeroLbIdx(0); }}
                  className="hero-gallery-card"
                  style={{ position: "relative", borderRadius: "10px", overflow: "hidden", height: "180px", cursor: "pointer", border: "1px solid rgba(212,175,55,0.12)" }}
                >
                  <div style={{ width: "100%", height: "100%", backgroundImage: `url(${img.image_url || img.image})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.5s ease" }} className="hero-gallery-img" />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)", display: "flex", alignItems: "flex-end", padding: "12px" }}>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{g.category}</span>
                      <p style={{ fontSize: "0.88rem", fontWeight: "700", color: "#fff", marginTop: "2px" }}>{g.title}</p>
                      {g.images.length > 1 && <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>{g.images.length} photos</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}


      {/* Products preview */}
      {products.length > 0 && (
        <div style={{ maxWidth: "1200px", width: "100%", marginTop: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShoppingBag size={18} style={{ color: "var(--primary-gold)" }} />
              <span style={{ fontSize: "0.85rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600" }}>Nos Produits</span>
            </div>
            <div onClick={() => { window.history.pushState({}, "", "/boutique"); window.dispatchEvent(new PopStateEvent("popstate")); }} style={{ cursor: "pointer", color: "var(--primary-gold)", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: "600", textDecoration: "none" }}>Voir la boutique <ArrowRight size={14} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {products.map(p => (
              <div key={p.id} onClick={() => { window.history.pushState({}, "", "/boutique"); window.dispatchEvent(new PopStateEvent("popstate")); }} style={{ textDecoration: "none", position: "relative", borderRadius: "10px", overflow: "hidden", height: "220px", border: "1px solid rgba(212,175,55,0.12)", display: "block", cursor: "pointer" }} className="hero-gallery-card">
                <div style={{ width: "100%", height: "100%", backgroundImage: `url(${p.image_url || ''})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.5s ease" }} className="hero-gallery-img" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)", display: "flex", alignItems: "flex-end", padding: "14px" }}>
                  <div>
                    {p.category && <span style={{ fontSize: "0.65rem", color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.category}</span>}
                    <p style={{ fontSize: "0.88rem", fontWeight: "700", color: "#fff", marginTop: "2px" }}>{p.name}</p>
                    <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--primary-gold)" }}>{Number(p.price).toLocaleString('fr-FR')} F</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Lightbox */}
      {heroLightbox && (() => {
        const imgs = heroLightbox.images;
        const cur = imgs[heroLbIdx];
        if (!cur) return null;
        return (
          <div onClick={() => setHeroLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <button onClick={() => setHeroLightbox(null)} style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", zIndex: 10 }}><X size={28} /></button>
            <div onClick={e => e.stopPropagation()} style={{ maxWidth: "800px", width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ position: "relative" }}>
                <img src={cur.image_url || cur.image} alt={heroLightbox.title} style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }} />
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setHeroLbIdx(i => (i - 1 + imgs.length) % imgs.length)} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 40, height: 40, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={20} /></button>
                    <button onClick={() => setHeroLbIdx(i => (i + 1) % imgs.length)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 40, height: 40, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={20} /></button>
                  </>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "#fff", fontWeight: 700 }}>{heroLightbox.title}</h3>
                {imgs.length > 1 && <span style={{ fontSize: "0.72rem", color: "var(--primary-gold)" }}>{heroLbIdx + 1} / {imgs.length}</span>}
              </div>
              {imgs.length > 1 && (
                <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                  {imgs.map((img, i) => (
                    <img key={i} src={img.image_url || img.image} alt={'thumb-'+i} onClick={() => setHeroLbIdx(i)} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: heroLbIdx === i ? "2px solid var(--primary-gold)" : "2px solid transparent", opacity: heroLbIdx === i ? 1 : 0.5, flexShrink: 0 }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <style>{`
        @media (min-width: 992px) { .hero-grid { grid-template-columns: 1.2fr 0.8fr !important; } }
        .hero-gallery-card:hover .hero-gallery-img { transform: scale(1.06); }
      `}</style>
    </section>
  )
}
