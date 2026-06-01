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
import PortalModal from "./components/PortalModal"
import { getStoredData } from "./data"
import { supabase } from "./supabase"
import { Sparkles, Gift } from "lucide-react"
import WhatsAppButton from "./components/WhatsAppButton"

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [preSelectedService, setPreSelectedService] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [referralUrlCode, setReferralUrlCode] = useState("");
  const [isAdminRoute, setIsAdminRoute] = useState(
    window.location.pathname === "/admin" || window.location.pathname === "/admin/"
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(window.location.pathname === "/admin" || window.location.pathname === "/admin/");
    };
    window.addEventListener("popstate", handleLocationChange);
    
    // Intercept pushState to handle route changes reactively
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };
    
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
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

    // Check for referral code in URL parameters
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      setReferralUrlCode(refCode);
      // Automatically scroll to booking if referred
      setTimeout(() => {
        const bookingSec = document.getElementById("booking");
        if (bookingSec) {
          bookingSec.scrollIntoView({ behavior: "smooth" });
        }
      }, 800);
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
    if (window.location.pathname === "/admin" || window.location.pathname === "/admin/") {
      window.history.pushState({}, "", "/");
    } else {
      setActiveSection("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectService = (service) => {
    setPreSelectedService(service);
    setActiveSection("booking");
    const bookingSec = document.getElementById("booking");
    if (bookingSec) {
      bookingSec.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGoToPortal = () => {
    if (currentUser) {
      setActiveSection("portal");
      const portalSec = document.getElementById("portal");
      if (portalSec) {
        portalSec.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setIsPortalOpen(true);
    }
  };

  if (isAdminRoute) {
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
    <div style={{ background: "var(--bg-color)", minHeight: "100vh" }}>
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
        activeSection={activeSection}
        setActiveSection={(section) => {
          if (section === "admin") {
            window.history.pushState({}, "", "/admin");
          } else {
            setActiveSection(section);
          }
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        openPortalModal={() => setIsPortalOpen(true)}
      />

      {/* Main Content Sections */}
      <Hero onBookNow={() => handleSelectService(null)} />
      
      <Services onSelectService={handleSelectService} />
      
      <Gallery />
      
      <Booking
        preSelectedService={preSelectedService}
        currentUser={currentUser}
        onBookingSuccess={() => {
          setPreSelectedService(null);
          // if logged in client, refresh their view
          if (currentUser && currentUser.role !== "admin") {
            setActiveSection("portal");
          }
        }}
      />
      
      <Affiliate onGoToPortal={handleGoToPortal} />

      {/* Portal view if logged in as client */}
      {currentUser && currentUser.role === "client" && (
        <Portal currentUser={currentUser} onLoginSuccess={handleLoginSuccess} />
      )}



      {/* Footer */}
      <Footer />

      {/* Portal Pop-up Modal */}
      <PortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </div>
  );
}
