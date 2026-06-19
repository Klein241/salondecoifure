import React, { useState, useEffect, useCallback } from "react"
import { getGalleryImages, getGalleryCategories } from "../supabase"
import { Sparkles, ImageOff, MessageCircle, ChevronLeft, ChevronRight, X, Images, ZoomIn, FolderOpen, ChevronDown } from "lucide-react"

const WHATSAPP_NUMBER = "241077004073"

function buildGroups(items) {
  const map = {}
  items.forEach(item => {
    const key = item.group_id || item.id
    if (!map[key]) {
      map[key] = {
        groupId: key,
        title: item.title,
        category: item.category,
        subcategory_id: item.subcategory_id || null,
        description: item.description,
        images: [item],
        created_at: item.created_at
      }
    } else {
      map[key].images.push(item)
    }
  })
  return Object.values(map).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export default function Gallery() {
  const [allGroups, setAllGroups] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCat, setActiveCat] = useState(null)      // null = toutes
  const [activeSubCat, setActiveSubCat] = useState(null) // null = toutes sous-cat
  const [lightbox, setLightbox] = useState(null)         // { group, imgIndex }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getGalleryImages(), getGalleryCategories()])
      .then(([imgs, cats]) => {
        setAllGroups(buildGroups(imgs || []))
        setCategories(cats || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Navigation lightbox
  const handleKey = useCallback((e) => {
    if (!lightbox) return
    if (e.key === "ArrowRight") setLightbox(prev => {
      const next = (prev.imgIndex + 1) % prev.group.images.length
      return { ...prev, imgIndex: next }
    })
    if (e.key === "ArrowLeft") setLightbox(prev => {
      const prev2 = (prev.imgIndex - 1 + prev.group.images.length) % prev.group.images.length
      return { ...prev, imgIndex: prev2 }
    })
    if (e.key === "Escape") setLightbox(null)
  }, [lightbox])

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  // Filtrage
  const topCats = categories.filter(c => !c.parent_id)
  const subCats = activeCat ? categories.filter(c => c.parent_id === activeCat) : []

  const displayed = allGroups.filter(g => {
    if (activeSubCat) return g.subcategory_id === activeSubCat
    if (activeCat) {
      const subIds = categories.filter(c => c.parent_id === activeCat).map(c => c.id)
      if (subIds.length > 0) return subIds.includes(g.subcategory_id)
      return true // cat without subcats: show all
    }
    return true
  })

  const openGroup = (group) => setLightbox({ group, imgIndex: 0 })
  const lightImg = lightbox ? lightbox.group.images[lightbox.imgIndex] : null

  return (
    <section id="gallery" style={{ padding: "100px 24px 80px", background: "#0b0b0b", minHeight: "80vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Sparkles size={16} style={{ color: "var(--primary-gold)" }} />
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600" }}>NOS REALISATIONS</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontFamily: "var(--font-serif)", marginBottom: "8px" }}>
            Galerie <span className="gold-text">Alpha Beauty</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>{allGroups.length} creation{allGroups.length !== 1 ? "s" : ""} publiee{allGroups.length !== 1 ? "s" : ""}</p>
          <div style={{ width: "60px", height: "2px", background: "var(--gold-grad)", margin: "16px auto 0" }} />
        </div>

        {/* Category Filters */}
        {topCats.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "12px" }}>
              <button
                onClick={() => { setActiveCat(null); setActiveSubCat(null); }}
                style={{ padding: "8px 18px", borderRadius: "20px", border: activeCat === null ? "1px solid var(--primary-gold)" : "1px solid rgba(255,255,255,0.12)", background: activeCat === null ? "rgba(212,175,55,0.12)" : "transparent", color: activeCat === null ? "var(--primary-gold)" : "var(--text-secondary)", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
              >
                Toutes
              </button>
              {topCats.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCat(cat.id === activeCat ? null : cat.id); setActiveSubCat(null); }}
                  style={{ padding: "8px 18px", borderRadius: "20px", border: activeCat === cat.id ? "1px solid var(--primary-gold)" : "1px solid rgba(255,255,255,0.12)", background: activeCat === cat.id ? "rgba(212,175,55,0.12)" : "transparent", color: activeCat === cat.id ? "var(--primary-gold)" : "var(--text-secondary)", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <FolderOpen size={13} />
                  {cat.name}
                  {categories.filter(c => c.parent_id === cat.id).length > 0 && <ChevronDown size={12} />}
                </button>
              ))}
            </div>
            {/* Subcategory row */}
            {activeCat && subCats.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <button
                  onClick={() => setActiveSubCat(null)}
                  style={{ padding: "5px 14px", borderRadius: "20px", border: activeSubCat === null ? "1px solid rgba(212,175,55,0.5)" : "1px solid rgba(255,255,255,0.07)", background: activeSubCat === null ? "rgba(212,175,55,0.07)" : "transparent", color: activeSubCat === null ? "var(--primary-gold)" : "var(--text-secondary)", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  Tout voir
                </button>
                {subCats.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubCat(sub.id === activeSubCat ? null : sub.id)}
                    style={{ padding: "5px 14px", borderRadius: "20px", border: activeSubCat === sub.id ? "1px solid rgba(212,175,55,0.5)" : "1px solid rgba(255,255,255,0.07)", background: activeSubCat === sub.id ? "rgba(212,175,55,0.07)" : "transparent", color: activeSubCat === sub.id ? "var(--primary-gold)" : "var(--text-secondary)", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
            <Images size={36} style={{ opacity: 0.3, marginBottom: "12px" }} />
            <p>Chargement de la galerie...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
            <ImageOff size={40} style={{ opacity: 0.25, marginBottom: "16px" }} />
            <p>Aucune creation dans cette categorie pour le moment.</p>
          </div>
        ) : (
          <div style={{ columns: "3 280px", columnGap: "16px" }}>
            {displayed.map(group => {
              const cover = group.images[0]
              return (
                <div
                  key={group.groupId}
                  className="gallery-card"
                  onClick={() => openGroup(group)}
                  style={{ breakInside: "avoid", marginBottom: "16px", borderRadius: "10px", overflow: "hidden", cursor: "pointer", position: "relative", border: "1px solid rgba(212,175,55,0.08)" }}
                >
                  <img
                    src={cover.image_url || cover.image}
                    alt={group.title}
                    loading="lazy"
                    style={{ width: "100%", display: "block", transition: "transform 0.4s ease" }}
                    className="gallery-img"
                  />
                  <div className="gallery-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%)", opacity: 0, transition: "opacity 0.3s", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "14px" }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{group.category}</span>
                    <p style={{ fontSize: "0.9rem", fontWeight: "700", color: "#fff", marginTop: "3px" }}>{group.title}</p>
                    {group.images.length > 1 && <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>{group.images.length} photos</span>}
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <span style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px", color: "rgba(255,255,255,0.8)" }}><ZoomIn size={12} /> Voir</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && lightImg && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}><X size={28} /></button>

          <div onClick={e => e.stopPropagation()} style={{ maxWidth: "900px", width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <img src={lightImg.image_url || lightImg.image} alt={lightbox.group.title} style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }} />
              {lightbox.group.images.length > 1 && (
                <>
                  <button onClick={() => setLightbox(prev => ({ ...prev, imgIndex: (prev.imgIndex - 1 + prev.group.images.length) % prev.group.images.length }))} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "40px", height: "40px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={20} /></button>
                  <button onClick={() => setLightbox(prev => ({ ...prev, imgIndex: (prev.imgIndex + 1) % prev.group.images.length }))} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "40px", height: "40px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={20} /></button>
                </>
              )}
            </div>

            {/* Info + CTA */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "#fff", fontWeight: "700" }}>{lightbox.group.title}</h3>
                {lightbox.group.description && <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px" }}>{lightbox.group.description}</p>}
                {lightbox.group.images.length > 1 && (
                  <span style={{ fontSize: "0.72rem", color: "var(--primary-gold)" }}>{lightbox.imgIndex + 1} / {lightbox.group.images.length}</span>
                )}
              </div>
              <a
                href={(() => { const imgUrl = lightImg.image_url || lightImg.image; const txt = encodeURIComponent(`Bonjour ! Je suis interesse(e) par la prestation "${lightbox.group.title}" vue dans votre galerie.\n\n📸 Merci de me recontacter !`); return `https://wa.me/${WHATSAPP_NUMBER}?text=${txt}`; })()}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#25D366", borderRadius: "8px", color: "#fff", fontWeight: "700", fontSize: "0.85rem", textDecoration: "none" }}
                onClick={e => e.stopPropagation()}
              >
                <MessageCircle size={16} /> Je suis interesse(e)
              </a>
            </div>

            {/* Thumbnails */}
            {lightbox.group.images.length > 1 && (
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                {lightbox.group.images.map((img, i) => (
                  <img
                    key={i}
                    src={img.image_url || img.image}
                    alt={"thumb-" + i}
                    onClick={() => setLightbox(prev => ({ ...prev, imgIndex: i }))}
                    style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", border: lightbox.imgIndex === i ? "2px solid var(--primary-gold)" : "2px solid transparent", opacity: lightbox.imgIndex === i ? 1 : 0.55, transition: "all 0.2s", flexShrink: 0 }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .gallery-card:hover .gallery-overlay { opacity: 1 !important; }
        .gallery-card:hover .gallery-img { transform: scale(1.04); }
      `}</style>
    </section>
  )
}

