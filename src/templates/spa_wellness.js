export default {
  name: "Spa & Bien-etre",
  icon: "heart",
  sections: ["hero", "services", "gallery", "booking", "reviews", "contact"],
  defaultTheme: {
    "--bg-color": "#0a1a15",
    "--panel-bg": "rgba(15, 30, 25, 0.8)",
    "--panel-border": "rgba(100, 180, 140, 0.2)",
    "--primary-gold": "#64B48C",
    "--light-gold": "#A0D8B8",
    "--dark-gold": "#2E7D5A",
    "--text-primary": "#f0f5f2",
    "--text-secondary": "#90b0a0",
    "--gold-grad": "linear-gradient(135deg, #64B48C 0%, #A0D8B8 50%, #2E7D5A 100%)",
    "--gold-text-grad": "linear-gradient(135deg, #64B48C 0%, #A0D8B8 50%, #2E7D5A 100%)",
    "--font-serif": "'Lora', Georgia, serif",
    "--font-sans": "'Quicksand', system-ui, sans-serif",
    mode: "dark"
  },
  navLinks: [
    { id: "home", label: "Accueil" },
    { id: "services", label: "Soins" },
    { id: "gallery", label: "Ambiance" },
    { id: "booking", label: "Reservation" },
    { id: "contact", label: "Contact" }
  ],
  heroTitle: "Harmonie &",
  heroSubtitle: "Serenite",
  heroDescription: "Un sanctuaire de bien-etre ou corps et esprit retrouvent l equilibre."
}
