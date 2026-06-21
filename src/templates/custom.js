export default {
  name: "Site Personnalise (No-Code)",
  icon: "settings",
  description: "Creez n importe quel type de site. Definissez vos propres sections, couleurs et contenus.",
  sections: ["hero", "services", "gallery", "booking", "shop", "contact", "about", "blog", "portfolio", "menu", "reviews"],
  allSectionsAvailable: true,
  defaultTheme: {
    "--bg-color": "#0f0f0f",
    "--panel-bg": "rgba(20, 20, 20, 0.8)",
    "--panel-border": "rgba(255,255,255,0.1)",
    "--primary-gold": "#6C63FF",
    "--light-gold": "#A29BFE",
    "--dark-gold": "#4834d4",
    "--text-primary": "#f5f5f5",
    "--text-secondary": "#a0a0a0",
    "--gold-grad": "linear-gradient(135deg, #6C63FF 0%, #A29BFE 50%, #4834d4 100%)",
    "--gold-text-grad": "linear-gradient(135deg, #6C63FF 0%, #A29BFE 50%, #4834d4 100%)",
    "--font-serif": "'Inter', system-ui, sans-serif",
    "--font-sans": "'Inter', system-ui, sans-serif",
    mode: "dark"
  },
  navLinks: [
    { id: "home", label: "Accueil" },
    { id: "services", label: "Services" },
    { id: "contact", label: "Contact" }
  ],
  heroTitle: "Votre Titre",
  heroSubtitle: "Ici",
  heroDescription: "Decrivez votre activite en quelques mots.",
  customizable: {
    businessType: "",       // Libre: "Pharmacie", "Agence", "ONG", etc.
    activeSections: ["hero", "services", "contact"],
    navLinks: [],
    heroText: {}
  }
}
