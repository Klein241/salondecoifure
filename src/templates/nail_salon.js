export default {
  name: "Onglerie / Nail Art",
  icon: "hand",
  sections: ["hero", "services", "gallery", "booking", "shop", "reviews"],
  defaultTheme: {
    "--bg-color": "#1a0a1a",
    "--panel-bg": "rgba(30, 15, 30, 0.8)",
    "--panel-border": "rgba(220, 150, 200, 0.2)",
    "--primary-gold": "#DC96C8",
    "--light-gold": "#F0C8E0",
    "--dark-gold": "#A0507A",
    "--text-primary": "#f5f0f5",
    "--text-secondary": "#b0a0b0",
    "--gold-grad": "linear-gradient(135deg, #DC96C8 0%, #F0C8E0 50%, #A0507A 100%)",
    "--gold-text-grad": "linear-gradient(135deg, #DC96C8 0%, #F0C8E0 50%, #A0507A 100%)",
    "--font-serif": "'Italiana', Georgia, serif",
    "--font-sans": "'Nunito', system-ui, sans-serif",
    mode: "dark"
  },
  navLinks: [
    { id: "home", label: "Accueil" },
    { id: "services", label: "Prestations" },
    { id: "gallery", label: "Creations" },
    { id: "booking", label: "Rendez-vous" },
    { id: "boutique", label: "Boutique" }
  ],
  heroTitle: "L Art du",
  heroSubtitle: "Nail Design",
  heroDescription: "Des ongles sublimes qui revelent votre personnalite."
}
