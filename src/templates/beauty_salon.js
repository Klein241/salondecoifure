export default {
  name: "Salon de Beaute / Institut",
  icon: "sparkles",
  sections: ["hero", "services", "gallery", "booking", "shop", "affiliate", "reviews"],
  defaultTheme: {
    "--bg-color": "#0b0b0b",
    "--panel-bg": "rgba(18, 18, 18, 0.75)",
    "--panel-border": "rgba(212, 175, 55, 0.15)",
    "--primary-gold": "#D4AF37",
    "--light-gold": "#F7E7CE",
    "--dark-gold": "#AA771C",
    "--text-primary": "#f5f5f5",
    "--text-secondary": "#a0a0a0",
    "--gold-grad": "linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 70%, #FBF5B7 85%, #AA771C 100%)",
    "--gold-text-grad": "linear-gradient(135deg, #e5c060 0%, #fef8cc 50%, #b88d2f 100%)",
    "--font-serif": "'Playfair Display', Georgia, serif",
    "--font-sans": "'Inter', system-ui, -apple-system, sans-serif",
    mode: "dark"
  },
  navLinks: [
    { id: "home", label: "Accueil" },
    { id: "services", label: "Soins" },
    { id: "gallery", label: "Galerie" },
    { id: "booking", label: "Reservation" },
    { id: "boutique", label: "Boutique" }
  ],
  heroTitle: "Sublimez Votre",
  heroSubtitle: "Eclat Naturel",
  heroDescription: "Plongez dans un univers de detente absolue, de raffinement et de soins esthetiques d exception."
}
