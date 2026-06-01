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
import Footer from "./components/Footer"
import { supabase } from "./supabase"
import { Sparkles, Gift } from "lucide-react"
import WhatsAppButton from "./components/WhatsAppButton"

const getRoute = (path) => {
  const p = decodeURIComponent(path).trim().replace(/\/+$/, "");
  if (!p || p === "/" || p === "") return "home";
  
  if (p === "/galerie" || p === "/gallery") return "gallery";
  
  if (p === "/nos services" || p === "/nos-services" || p === "/services" || p === "/nos%20services") return "services";
  
  if (p === "/espaceclient" || p === "/espace-client" || p === "/espace client" || p.toLowerCase() === "/espaceclient") return "portal";
  
  if (p === "/reservation" || p === "/booking" || p === "/ reservation") return "booking";
  
  if (p === "/parrainage" || p === "/affiliate") return "affiliate";
  
  if (p === "/admin") return "admin";
  
  return "home"; // Fallback
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(getRoute(window.location.pathname));
  const [preSelectedService, setPreSelectedService] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [referralUrlCode, setReferralUrlCode] = useState("");

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getRoute(window.location.pathname));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("popstate", handleLocationChange);
    
    // Intercept pushState to handle route changes reactively
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
    // Check if user is logged in (localStorage fallback)
    const cachedUser = localStorage.getItem("current_user");
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }

    // Supabase Auth Session listener
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          loadSupabaseProfile(session.user);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          loadSupabaseProfile(session.user);
        } else {
          setCurrentUser(null);
          localStorage.removeItem("current_user");
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    // Check for referral code in URL parameters
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      setReferralUrlCode(refCode);
      // Automatically redirect to booking if referred
      window.history.pushState({}, "", `/reservation?ref=${refCode}`);
    }
  }, []);

  const loadSupabaseProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
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
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("current_user", JSON.stringify(user));
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
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

  if (currentRoute === "admin") {
    return (
      <div style={{ background: "#0b0b0b", minHeight: "100vh" }}>
        {currentUser && currentUser.role === "admin" ? (
          <Admin currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-color)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Banner (Mother's Day Promotion) */}
      <div
        style={{
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
        }}
      >
        <Gift size={14} />
        <span>SPÉCIAL FÊTE DES MÈRES : Célébrons les mamans d'Alibadeng ! Obtenez -10% de réduction en utilisant un code parrainage.</span>
        <Sparkles size={12} />
      </div>

      {/* Navigation */}
      <Navbar
        currentRoute={currentRoute}
        currentUser={currentUser}
        onLogout={handleLogout}
        openPortalModal={handleGoToPortal}
      />

      {/* Main Content Sections - Conditionally Rendered */}
      <main style={{ flex: 1 }}>
        {currentRoute === "home" && (
          <Hero onBookNow={() => window.history.pushState({}, "", "/reservation")} />
        )}
        
        {currentRoute === "services" && (
          <Services onSelectService={handleSelectService} />
        )}
        
        {currentRoute === "gallery" && (
          <Gallery />
        )}
        
        {currentRoute === "booking" && (
          <Booking
            preSelectedService={preSelectedService}
            currentUser={currentUser}
            onBookingSuccess={() => {
              setPreSelectedService(null);
              if (currentUser && currentUser.role !== "admin") {
                window.history.pushState({}, "", "/EspaceClient");
              } else {
                window.history.pushState({}, "", "/");
              }
            }}
          />
        )}
        
        {currentRoute === "affiliate" && (
          <Affiliate onGoToPortal={handleGoToPortal} />
        )}

        {currentRoute === "portal" && (
          <Portal currentUser={currentUser} onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </div>
  );
}
