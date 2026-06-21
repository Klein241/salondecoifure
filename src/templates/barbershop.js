export default {
  name: "Barbershop",
  icon: "scissors",
  sections: ["hero", "services", "team", "gallery", "booking", "reviews"],
  defaultTheme: {
    "--bg-color": "#111111",
    "--panel-bg": "rgba(20, 20, 20, 0.85)",
    "--panel-border": "rgba(200, 160, 60, 0.15)",
    "--primary-gold": "#C8A03C",
    "--light-gold": "#E8D080",
    "--dark-gold": "#8B6914",
    "--text-primary": "#f0f0f0",
    "--text-secondary": "#999999",
    "--gold-grad": "linear-gradient(135deg, #C8A03C 0%, #E8D080 50%, #8B6914 100%)",
    "--gold-text-grad": "linear-gradient(135deg, #C8A03C 0%, #E8D080 50%, #8B6914 100%)",
    "--font-serif": "'Oswald', sans-serif",
    "--font-sans": "'Roboto', system-ui, sans-serif",
    mode: "dark"
  },
  navLinks: [
    { id: "home", label: "Accueil" },
    { id: "services", label: "Coupes" },
    { id: "team", label: "Barbiers" },
    { id: "gallery", label: "Galerie" },
    { id: "booking", label: "Reservation" }
  ],
  heroTitle: "Style &",
  heroSubtitle: "Precision",
  heroDescription: "L art de la coupe masculine. Precision, style et savoir-faire traditionnel."
}
