export default {
  name: "Studio Photo / Video",
  icon: "camera",
  sections: ["hero", "portfolio", "services", "booking", "reviews", "contact"],
  defaultTheme: {
    "--bg-color": "#0e0e0e",
    "--panel-bg": "rgba(20, 20, 20, 0.85)",
    "--panel-border": "rgba(180, 180, 180, 0.15)",
    "--primary-gold": "#E0E0E0",
    "--light-gold": "#FFFFFF",
    "--dark-gold": "#999999",
    "--text-primary": "#f5f5f5",
    "--text-secondary": "#888888",
    "--gold-grad": "linear-gradient(135deg, #E0E0E0 0%, #FFFFFF 50%, #999999 100%)",
    "--gold-text-grad": "linear-gradient(135deg, #E0E0E0 0%, #FFFFFF 50%, #999999 100%)",
    "--font-serif": "'Bodoni Moda', Georgia, serif",
    "--font-sans": "'Montserrat', system-ui, sans-serif",
    mode: "dark"
  },
  navLinks: [
    { id: "home", label: "Accueil" },
    { id: "portfolio", label: "Portfolio" },
    { id: "services", label: "Prestations" },
    { id: "booking", label: "Reservation" },
    { id: "contact", label: "Contact" }
  ],
  heroTitle: "Capturez",
  heroSubtitle: "L Instant",
  heroDescription: "Des images qui racontent votre histoire avec emotion et creativite."
}
