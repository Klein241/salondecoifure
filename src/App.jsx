import React, { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Services from "./components/Services"
import Gallery from "./components/Gallery"
import Booking from "./components/Booking"
import Affiliate from "./components/Affiliate"
import Portal from "./components/Portal"
import Admin from "./components/Admin"
import AdminLogin from "./components/AdminLogin"
import GerantDashboard from "./components/GerantDashboard"
import Footer from "./components/Footer"
import WhatsAppButton from "./components/WhatsAppButton"
import Shop from "./components/Shop"
import SuperAdmin from "./components/SuperAdmin"
import SuperAdminLogin from "./components/SuperAdminLogin"
import ThemeInjector from "./components/ThemeInjector"
import AbaiaCosmetics from "./components/AbaiaCosmetics"
import { supabase } from "./supabase"
import { getSiteSettings } from "./supabase"
import { Sparkles } from "lucide-react"
import { useTenant, resolveTenantInnerPath } from "./TenantContext"

// ─── Inner route resolver (path relative to tenant slug) ─────────────────────
function getInnerRoute(innerPath) {
  const p = decodeURIComponent(innerPath).trim().replace(/\/+$/, "").toLowerCase()
  if (!p || p === "/" || p === "") return "home"
  if (p === "/galerie" || p === "/gallery") return "gallery"
  if (p === "/nos-services" || p === "/services") return "services"
  if (p === "/espaceclient" || p === "/espace-client") return "portal"
  if (p === "/reservation" || p === "/booking") return "booking"
  if (p === "/parrainage" || p === "/affiliate") return "affiliate"
  if (p === "/boutique" || p === "/shop") return "boutique"
  if (p === "/admin" || p.startsWith("/admin/")) return "admin"
  return "home"
}

// ─── SuperAdmin wrapper ───────────────────────────────────────────────────────
function SuperAdminApp() {
  const [superUser, setSuperUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const cached = localStorage.getItem("superadmin_user")
    if (cached) { try { setSuperUser(JSON.parse(cached)) } catch(e){} }
    setAuthLoading(false)
  }, [])

  const handleLogin = (user) => {
    setSuperUser(user)
    localStorage.setItem("superadmin_user", JSON.stringify(user))
  }

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    setSuperUser(null)
    localStorage.removeItem("superadmin_user")
    window.history.pushState({}, "", "/")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  if (authLoading) return <LoadingScreen />
  if (!superUser || superUser.role !== "superadmin") return <SuperAdminLogin onLoginSuccess={handleLogin} />
  return <SuperAdmin superAdminUser={superUser} onLogout={handleLogout} />
}

// ─── Tenant site wrapper ──────────────────────────────────────────────────────
function TenantApp() {
  const { tenant, tenantId, navigateTo, loading: tenantLoading } = useTenant()
  const [innerRoute, setInnerRoute] = useState(getInnerRoute(resolveTenantInnerPath()))
  const [preSelectedService, setPreSelectedService] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [referralUrlCode, setReferralUrlCode] = useState("")
  const [siteSettings, setSiteSettings] = useState({
    allow_specialist_selection: false,
    whatsapp: "+241077004073",
    site_name: tenant?.name || "Alpha Beauty",
    promo_banner: "",
    promo_banner_active: true
  })

  useEffect(() => {
    const handleLocationChange = () => {
      setInnerRoute(getInnerRoute(resolveTenantInnerPath()))
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    window.addEventListener("popstate", handleLocationChange)
    return () => window.removeEventListener("popstate", handleLocationChange)
  }, [])

  useEffect(() => {
    const cached = localStorage.getItem("current_user")
    if (cached) { try { setCurrentUser(JSON.parse(cached)) } catch(e){} }
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) loadSupabaseProfile(session.user)
        else setAuthLoading(false)
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session?.user) loadSupabaseProfile(session.user)
        else { setCurrentUser(null); localStorage.removeItem("current_user"); setAuthLoading(false) }
      })
      return () => subscription.unsubscribe()
    } else {
      setAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    getSiteSettings(tenantId).then(s => { if (s) setSiteSettings(s) }).catch(() => {})
    const params = new URLSearchParams(window.location.search)
    const refCode = params.get("ref")
    if (refCode) {
      setReferralUrlCode(refCode)
      navigateTo("/reservation?ref=" + refCode)
    }
  }, [tenantId])

  const loadSupabaseProfile = async (authUser) => {
    try {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle()
      const u = profile || { id: authUser.id, name: authUser.user_metadata?.name || "Client", email: authUser.email, phone: authUser.user_metadata?.phone || "", role: authUser.user_metadata?.role || "client" }
      setCurrentUser(u)
      localStorage.setItem("current_user", JSON.stringify(u))
    } catch(e) { console.error(e) }
    finally { setAuthLoading(false) }
  }

  const handleLoginSuccess = (user) => { setCurrentUser(user); localStorage.setItem("current_user", JSON.stringify(user)) }

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    setCurrentUser(null)
    localStorage.removeItem("current_user")
    navigateTo("/")
  }

  const handleSelectService = (service) => { setPreSelectedService(service); navigateTo("/reservation") }
  const handleGoToPortal = () => navigateTo("/EspaceClient")
  const openPortalModal = () => navigateTo("/EspaceClient")

  if (tenantLoading || authLoading) return <LoadingScreen />

  // ── ADMIN ROUTE ──
  if (innerRoute === "admin") {
    return (
      <div style={{ background: "#0b0b0b", minHeight: "100vh" }}>
        {currentUser && (currentUser.role === "admin" || currentUser.role === "superadmin") ? (
          <Admin currentUser={currentUser} onLogout={handleLogout} tenantId={tenantId} />
        ) : currentUser && currentUser.role === "gerant" ? (
          <GerantDashboard currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    )
  }

  // ── PORTAL ROUTE ──
  if (innerRoute === "portal") {
    return (
      <div style={{ background: "var(--bg-color)", minHeight: "100vh" }}>
        <Navbar currentRoute="portal" currentUser={currentUser} onLogout={handleLogout} openPortalModal={openPortalModal} navigateTo={navigateTo} siteSettings={siteSettings} />
        <Portal currentUser={currentUser} onLoginSuccess={handleLoginSuccess} referralCode={referralUrlCode} />
        <Footer siteSettings={siteSettings} navigateTo={navigateTo} />
        <WhatsAppButton phone={siteSettings?.whatsapp} />
      </div>
    )
  }

  // ── PUBLIC PAGES ──
  return (
    <div style={{ background: "var(--bg-color)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Promo Banner */}
      {siteSettings?.promo_banner_active !== false && siteSettings?.promo_banner && (
        <div className="promo-banner" style={{ background: "linear-gradient(90deg,#BF953F,#FCF6BA,#B38728)", color: "#0b0b0b", padding: "8px 16px", textAlign: "center", fontSize: "0.82rem", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.9rem" }}>✦</span>
          <span>{siteSettings.promo_banner}</span>
          <span style={{ fontSize: "0.9rem" }}>✦</span>
        </div>
      )}

      <Navbar currentRoute={innerRoute} currentUser={currentUser} onLogout={handleLogout} openPortalModal={openPortalModal} navigateTo={navigateTo} siteSettings={siteSettings} />

      <main style={{ flex: 1 }}>
        {innerRoute === "home" && (
          <Hero onBookNow={() => navigateTo("/reservation")} onGalleryClick={() => navigateTo("/galerie")} onSelectService={handleSelectService} tenantId={tenantId} siteSettings={siteSettings} />
        )}
        {innerRoute === "services" && (
          <div style={{ paddingTop: "80px" }}>
            <Services onSelectService={handleSelectService} tenantId={tenantId} />
          </div>
        )}
        {innerRoute === "gallery" && (
          <div style={{ paddingTop: "80px" }}>
            <Gallery tenantId={tenantId} />
          </div>
        )}
        {innerRoute === "booking" && (
          <div style={{ paddingTop: "80px" }}>
            <Booking currentUser={currentUser} preSelectedService={preSelectedService} siteSettings={siteSettings} referralCode={referralUrlCode} tenantId={tenantId} />
          </div>
        )}
        {innerRoute === "affiliate" && (
          <div style={{ paddingTop: "80px" }}>
            <Affiliate currentUser={currentUser} tenantId={tenantId} />
          </div>
        )}
        {innerRoute === "boutique" && (
          <div style={{ paddingTop: "80px" }}>
            <Shop currentUser={currentUser} onLoginRequired={openPortalModal} tenantId={tenantId} />
          </div>
        )}
        {innerRoute === "home" && (
          <div id="services">
            <Services onSelectService={handleSelectService} tenantId={tenantId} />
          </div>
        )}
        {innerRoute === "home" && <div id="gallery"><Gallery tenantId={tenantId} /></div>}
        {innerRoute === "home" && (
          <div id="booking">
            <Booking currentUser={currentUser} preSelectedService={preSelectedService} siteSettings={siteSettings} referralCode={referralUrlCode} tenantId={tenantId} />
          </div>
        )}
        {innerRoute === "home" && (
          <div id="affiliate">
            <Affiliate currentUser={currentUser} tenantId={tenantId} />
          </div>
        )}
      </main>

      <Footer siteSettings={siteSettings} navigateTo={navigateTo} />
      <WhatsAppButton phone={siteSettings?.whatsapp} />
    </div>
  )
}

// ─── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", color: "#D4AF37" }}>
      <Sparkles size={32} style={{ animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: "0.85rem", opacity: 0.6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Chargement...</span>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

// ─── Root App — dispatches between SuperAdmin and Tenant ──────────────────────
// ─── Error Boundary ───────────────────────────────────────────────────────────
import { Component } from "react"
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(e) { return { hasError: true, error: e } }
  componentDidCatch(e, info) { console.error("ErrorBoundary caught:", e, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "#0b0b0b",
          color: "#f5f5f5", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ color: "#D4AF37", marginBottom: "8px" }}>Une erreur est survenue</h2>
          <p style={{ color: "#888", marginBottom: "24px" }}>
            {this.state.error?.message || "L'application a rencontré un problème inattendu."}
          </p>
          <button onClick={() => window.location.reload()}
            style={{ padding: "12px 28px", background: "linear-gradient(135deg,#D4AF37,#AA771C)",
              border: "none", borderRadius: "30px", color: "#0b0b0b",
              fontWeight: "700", cursor: "pointer", fontSize: "0.9rem" }}>
            Rafraîchir la page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}


export default function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const h = () => setPath(window.location.pathname)
    window.addEventListener("popstate", h)
    return () => window.removeEventListener("popstate", h)
  }, [])

  // SuperAdmin routes
  if (path.startsWith("/superadmin")) {
    return (
      <>
        <ThemeInjector />
        <SuperAdminApp />
      </>
    )
  }

    // Abaia Cosmetique dedicated site
  if (path.startsWith("/abaia")) {
    return <AbaiaCosmetics />
  }

  // All other routes = tenant site
  return (
    <>
      <ThemeInjector />
      <TenantApp />
    </>
  )
}
