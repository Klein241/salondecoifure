export default {
  name: "Restaurant / Traiteur",
  icon: "utensils",
  sections: ["hero", "menu", "gallery", "booking", "reviews", "contact"],
  defaultTheme: {
    "--bg-color": "#1a0f0a",
    "--panel-bg": "rgba(30, 20, 15, 0.85)",
    "--panel-border": "rgba(200, 120, 60, 0.2)",
    "--primary-gold": "#C8783C",
    "--light-gold": "#E8B080",
    "--dark-gold": "#8B4A14",
    "--text-primary": "#f5f0e8",
    "--text-secondary": "#b0a090",
    "--gold-grad": "linear-gradient(135deg, #C8783C 0%, #E8B080 50%, #8B4A14 100%)",
    "--gold-text-grad": "linear-gradient(135deg, #C8783C 0%, #E8B080 50%, #8B4A14 100%)",
    "--font-serif": "'Cormorant Infant', Georgia, serif",
    "--font-sans": "'Source Sans Pro', system-ui, sans-serif",
    mode: "dark"
  },
  navLinks: [
    { id: "home", label: "Accueil" },
    { id: "menu", label: "Menu" },
    { id: "gallery", label: "Galerie" },
    { id: "booking", label: "Reserver" },
    { id: "contact", label: "Contact" }
  ],
  heroTitle: "Saveurs",
  heroSubtitle: "Authentiques",
  heroDescription: "Une experience culinaire inoubliable, entre tradition et innovation."
}
