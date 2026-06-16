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
import { supabase } from "./supabase"
import { Sparkles, Gift } from "lucide-react"
import WhatsAppButton from "./components/WhatsAppButton"
import Shop from "./components/Shop"
import { getSiteSettings } from "./supabase"

const getRoute = (path) => {
  // Decode, trim, remove trailing slashes, lowercase for matching
  const p = decodeURIComponent(path).trim().replace(/\/+$/, "").toLowerCase();
  if (!p || p === "/" || p === "") return "home";

  if (p === "/galerie" || p === "/gallery") return "gallery";

  if (p === "/nos services" || p === "/nos-services" || p === "/services") return "services";

  if (p === "/espaceclient" || p === "/espace-client" || p === "/espace client") return "portal";

  if (p === "/reservation" || p === "/booking") return "booking";

  if (p === "/parrainage" || p === "/affiliate") return "affiliate";

  if (p === "/boutique" || p === "/shop") return "boutique";

  // Admin route: /admin or /admin/anything
  if (p === "/admin" || p.startsWith("/admin/")) return "admin";

  return "home";
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(getRoute(window.location.pathname));
  const [preSelectedService, setPreSelectedService] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [referralUrlCode, setReferralUrlCode] = useState("");
  const [siteSettings, setSiteSettings] = useState({ allow_specialist_selection: true, whatsapp: '+241077004073', site_name: 'The Alpha Beauty' });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getRoute(window.location.pathname));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("popstate", handleLocationChange);

    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    // Load user from localStorage first (fast)
    const cachedUser = localStorage.getItem("current_user");
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (e) {}
    }

    // Then verify with Supabase
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          loadSupabaseProfile(session.user);
        } else {
          setAuthLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          loadSupabaseProfile(session.user);
        } else {
          setCurrentUser(null);
          localStorage.removeItem("current_user");
          setAuthLoading(false);
        }
      });

      return () => { subscription.unsubscribe(); };
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load site settings
    getSiteSettings().then(s => {
      if (s) {
        setSiteSettings(s);
        // Apply dynamic favicon
        if (s.favicon_url) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
          link.href = s.favicon_url;
        }
      }
    }).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      setReferralUrlCode(refCode);
      window.history.pushState({}, "", `/reservation?ref=${refCode}`);
    }
  }, []);

  const loadSupabaseProfile = async (authUser) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profile) {
        setCurrentUser(profile);
        localStorage.setItem("current_user", JSON.stringify(profile));
      } else {
        const fallbackUser = {
          id: authUser.id,
          name: authUser.user_metadata?.name || "Client",
          email: authUser.email,
          phone: authUser.user_metadata?.phone || "",
          role: authUser.user_metadata?.role || "client"
        };
        setCurrentUser(fallbackUser);
        localStorage.setItem("current_user", JSON.stringify(fallbackUser));
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("current_user", JSON.stringify(user));
  };

  const handleLogout = async () => {
    if (supabase) { await supabase.auth.signOut(); }
    setCurrentUser(null);
    localStorage.removeItem("current_user");
    window.history.pushState({}, "", "/");
  };

  const handleSelectService = (service) => {
    setPreSelectedService(service);
    window.history.pushState({}, "", "/reservation");
  };

  const handleGoToPortal = () => {
    window.history.pushState({}, "", "/EspaceClient");
  };

  // ── PAGE ADMIN (/admin/) ──────────────────────────────────────────────────
  if (currentRoute === "admin") {
    // Pendant le chargement de l'auth, afficher un ecran de chargement minimal
    if (authLoading) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0b0b0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d4af37",
          flexDirection: "column",
          gap: "16px"
        }}>
          <Sparkles size={32} style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>Verification de la session...</span>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
      );
    }

    return (
      <div style={{ background: "#0b0b0b", minHeight: "100vh" }}>
        {currentUser && (currentUser.role === "admin" || currentUser.role === "superadmin") ? (
          <Admin currentUser={currentUser} onLogout={handleLogout} />
        ) : currentUser && currentUser.role === "gerant" ? (
          <GerantDashboard currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    );
  }

  // ── PAGES PUBLIQUES ───────────────────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg-color)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Bandeau promotionnel */}
      <div style={{
        background: "linear-gradient(90deg, #aa771c 0%, #121212 50%, #aa771c 100%)",
        color: "var(--light-gold)",
        fontSize: "0.8rem",
        fontWeight: "600",
        letterSpacing: "0.08em",
        textAlign: "center",
        padding: "8px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        position: "relative",
        zIndex: 1001,
      }}>
        <Gift size={14} />
        <span>{siteSettings?.promo_banner || "PROGRAMME FIDÉLITÉ : Accumulez des points à chaque visite et bénéficiez de réductions exclusives. Code parrainage = -10%."}</span>
        <Sparkles size={12} />
      </div>

      <Navbar
        currentRoute={currentRoute}
        currentUser={currentUser}
        onLogout={handleLogout}
        openPortalModal={handleGoToPortal}
      />

      <main style={{ flex: 1 }}>
        {currentRoute === "home" && (
          <Hero onBookNow={() => window.history.pushState({}, "", "/reservation")} />
        )}
        {currentRoute === "services" && (
          <Services onSelectService={handleSelectService} />
        )}
        {currentRoute === "gallery" && <Gallery />}
        {currentRoute === "booking" && (
          <Booking
            preSelectedService={preSelectedService}
            currentUser={currentUser}
            siteSettings={siteSettings}
            onBookingSuccess={() => {
              setPreSelectedService(null);
              if (currentUser && currentUser.role !== "admin" && currentUser.role !== "superadmin") {
                window.history.pushState({}, "", "/EspaceClient");
              } else {
                window.history.pushState({}, "", "/");
              }
            }}
          />
        )}
        {currentRoute === "boutique" && <Shop currentUser={currentUser} />}
        {currentRoute === "affiliate" && (
          <Affiliate onGoToPortal={handleGoToPortal} />
        )}
        {currentRoute === "portal" && (
          <Portal currentUser={currentUser} onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
