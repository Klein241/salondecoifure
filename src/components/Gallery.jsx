import React, { useState, useEffect, useCallback } from "react"
import { getGalleryImages } from "../supabase"
import { Sparkles, ImageOff, MessageCircle, ChevronLeft, ChevronRight, X, Images, ZoomIn } from "lucide-react"

const WHATSAPP_NUMBER = "241077004073"

// Regroupe les images par group_id
function buildGroups(items) {
  const map = {}
  items.forEach(item => {
    const key = item.group_id || item.id
    if (!map[key]) {
      map[key] = {
        groupId: key,
        title: item.title,
        description: item.description,
        category: item.category,
        created_at: item.created_at,
        images: []
      }
    }
    map[key].images.push(item)
  })
  return Object.values(map).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export default function Gallery({ isTab = false }) {
  const [activeFilter, setActiveFilter] = useState("Tous")
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [slideIdx, setSlideIdx] = useState(0)

  useEffect(() => {
    getGalleryImages().then(data => {
      setGalleryItems(data || [])
      setLoading(false)
    }).catch(() => {
      setGalleryItems([])
      setLoading(false)
    })
  }, [])

  const groups = buildGroups(galleryItems)
  const allCategories = ["Tous", ...new Set(groups.map(g => g.category).filter(Boolean))]
  const filteredGroups = activeFilter === "Tous"
    ? groups
    : groups.filter(g => g.category === activeFilter)

  const openGroup = (group) => {
    setSelectedGroup(group)
    setSlideIdx(0)
    document.body.style.overflow = "hidden"
  }

  const closeGroup = useCallback(() => {
    setSelectedGroup(null)
    document.body.style.overflow = ""
  }, [])

  const prevSlide = useCallback((e) => {
    e && e.stopPropagation()
    setSlideIdx(p => selectedGroup ? (p - 1 + selectedGroup.images.length) % selectedGroup.images.length : 0)
  }, [selectedGroup])

  const nextSlide = useCallback((e) => {
    e && e.stopPropagation()
    setSlideIdx(p => selectedGroup ? (p + 1) % selectedGroup.images.length : 0)
  }, [selectedGroup])

  useEffect(() => {
    const onKey = (e) => {
      if (!selectedGroup) return
      if (e.key === "Escape") closeGroup()
      if (e.key === "ArrowRight") nextSlide()
      if (e.key === "ArrowLeft") prevSlide()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedGroup, closeGroup, nextSlide, prevSlide])

  const handleWhatsApp = (group) => {
    const title = group.title
    const msg = encodeURIComponent(
      `Bonjour ! Je suis interesse(e) par la prestation "${title}" que j ai vue dans votre galerie. Pouvez-vous me donner plus d informations et les tarifs ? Merci !`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank")
  }

  return (
    <section
      id="gallery"
      style={{ padding: isTab ? "20px 0" : "100px 24px", background: isTab ? "transparent" : "#0b0b0b", position: "relative" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        {!isTab && (
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <span style={{ fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600", display: "block", marginBottom: "8px" }}>
              NOTRE INSPIRATION
            </span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "16px" }}>
              Galerie &amp; <span className="gold-text">Creations</span>
            </h2>
            <div style={{ width: "80px", height: "2px", background: "var(--gold-grad)", margin: "0 auto 24px" }} />
            <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
              Cliquez sur une creation pour voir toutes les photos et contacter notre equipe.
            </p>
          </div>
        )}

        {/* Filters */}
        {allCategories.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", marginBottom: "40px" }}>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={activeFilter === cat ? "btn-gold" : "btn-outline"}
                style={{ padding: "6px 18px", fontSize: "0.75rem", borderRadius: "30px" }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)" }}>
            <Sparkles size={36} style={{ animation: "spin 1s linear infinite", color: "var(--primary-gold)" }} />
            <p style={{ marginTop: "16px" }}>Chargement de la galerie...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && galleryItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-secondary)" }}>
            <ImageOff size={56} style={{ opacity: 0.3, marginBottom: "20px" }} />
            <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>La galerie est vide pour l instant.</p>
            <p style={{ fontSize: "0.85rem" }}>L administrateur peut ajouter des photos depuis le backoffice.</p>
          </div>
        )}

        {/* Group Grid */}
        {!loading && filteredGroups.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {filteredGroups.map(group => {
              const cover = group.images[0]
              const count = group.images.length
              return (
                <div
                  key={group.groupId}
                  className="gallery-card-container"
                  onClick={() => openGroup(group)}
                  style={{ position: "relative", borderRadius: "12px", overflow: "hidden", height: "360px", border: "1px solid rgba(212,175,55,0.12)", cursor: "pointer" }}
                >
                  {/* Cover image */}
                  <div
                    className="gallery-image"
                    style={{
                      width: "100%", height: "100%",
                      backgroundImage: `url(${cover.image_url || cover.image})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)"
                    }}
                  />

                  {/* Multi-image badge */}
                  {count > 1 && (
                    <div style={{
                      position: "absolute", top: "14px", right: "14px",
                      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
                      border: "1px solid rgba(212,175,55,0.4)",
                      borderRadius: "20px", padding: "4px 10px",
                      display: "flex", alignItems: "center", gap: "5px",
                      fontSize: "0.72rem", color: "#fff", fontWeight: "600"
                    }}>
                      <Images size={13} style={{ color: "var(--primary-gold)" }} />
                      {count} photos
                    </div>
                  )}

                  {/* Overlay */}
                  <div
                    className="gallery-overlay"
                    style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(11,11,11,0.92) 0%, rgba(11,11,11,0.3) 55%, transparent 100%)",
                      display: "flex", flexDirection: "column", justifyContent: "flex-end",
                      padding: "22px", opacity: 0, transition: "opacity 0.35s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <Sparkles size={11} style={{ color: "var(--primary-gold)" }} />
                      <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--primary-gold)" }}>
                        {group.category}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#fff", marginBottom: "10px" }}>{group.title}</h3>
                    {group.description && (
                      <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.75)", marginBottom: "12px", lineHeight: 1.4 }}>{group.description}</p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <ZoomIn size={12} /> Voir {count > 1 ? "les " + count + " photos" : "la photo"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div
          onClick={closeGroup}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(5,5,5,0.96)", backdropFilter: "blur(16px)",
            zIndex: 10000, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            animation: "fadeBg 0.3s ease"
          }}
        >
          {/* Top bar */}
          <div
            style={{
              position: "absolute", top: 0, left: 0, right: 0,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "20px 28px",
              background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
              zIndex: 10010
            }}
          >
            <div>
              <span style={{ fontSize: "0.68rem", color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {selectedGroup.category}
              </span>
              <h3 style={{ fontSize: "1.2rem", color: "#fff", fontWeight: "700", marginTop: "2px" }}>{selectedGroup.title}</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                {slideIdx + 1} / {selectedGroup.images.length}
              </span>
              <button
                onClick={closeGroup}
                style={{
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff", cursor: "pointer", width: "42px", height: "42px",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main image */}
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", maxWidth: "92%", zIndex: 10005 }}>
            <img
              key={slideIdx}
              src={selectedGroup.images[slideIdx].image_url || selectedGroup.images[slideIdx].image}
              alt={selectedGroup.title}
              style={{
                maxWidth: "88vw", maxHeight: "62vh",
                objectFit: "contain", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.8)",
                animation: "scaleUp 0.3s cubic-bezier(0.16,1,0.3,1)"
              }}
            />

            {/* Thumbnails strip */}
            {selectedGroup.images.length > 1 && (
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", maxWidth: "80vw", paddingBottom: "4px" }}>
                {selectedGroup.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={e => { e.stopPropagation(); setSlideIdx(i) }}
                    style={{
                      width: "60px", height: "60px", flexShrink: 0,
                      borderRadius: "6px", overflow: "hidden", cursor: "pointer",
                      border: i === slideIdx ? "2px solid var(--primary-gold)" : "2px solid rgba(255,255,255,0.1)",
                      transition: "border-color 0.2s", opacity: i === slideIdx ? 1 : 0.55
                    }}
                  >
                    <img
                      src={img.image_url || img.image}
                      alt={`thumb-${i}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* WhatsApp CTA */}
            <button
              onClick={e => { e.stopPropagation(); handleWhatsApp(selectedGroup) }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                border: "none", borderRadius: "50px",
                padding: "14px 32px", cursor: "pointer",
                fontSize: "0.95rem", fontWeight: "700", color: "#fff",
                boxShadow: "0 8px 28px rgba(37,211,102,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              className="whatsapp-cta-btn"
            >
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Je suis interesse(e)
            </button>
          </div>

          {/* Navigation arrows */}
          {selectedGroup.images.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                style={{
                  position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", cursor: "pointer", width: "50px", height: "50px",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 10008, transition: "all 0.2s"
                }}
                className="nav-arrow"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                onClick={nextSlide}
                style={{
                  position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", cursor: "pointer", width: "50px", height: "50px",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 10008, transition: "all 0.2s"
                }}
                className="nav-arrow"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeBg { from{opacity:0} to{opacity:1} }
        @keyframes scaleUp { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .gallery-card-container { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .gallery-card-container:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .gallery-card-container:hover .gallery-image { transform: scale(1.07); }
        .gallery-card-container:hover .gallery-overlay { opacity: 1 !important; }
        .nav-arrow:hover { background: rgba(212,175,55,0.18) !important; color: var(--primary-gold) !important; border-color: var(--primary-gold) !important; }
        .whatsapp-cta-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 12px 36px rgba(37,211,102,0.5) !important; }
      `}</style>
    </section>
  )
}
