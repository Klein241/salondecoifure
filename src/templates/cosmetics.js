export default {
  name: "Cosmetique / E-commerce",
  icon: "flask",
  sections: ["hero", "products", "about", "gallery", "contact", "shop"],
  defaultTheme: {
    "--bg-color": "#FFF8F0",
    "--panel-bg": "rgba(255, 248, 240, 0.92)",
    "--panel-border": "rgba(197, 165, 90, 0.2)",
    "--primary-gold": "#C5A55A",
    "--light-gold": "#E8D5A3",
    "--dark-gold": "#8B7332",
    "--text-primary": "#1a1a1a",
    "--text-secondary": "#6b6b6b",
    "--gold-grad": "linear-gradient(135deg, #C5A55A 0%, #E8D5A3 30%, #8B7332 70%, #E8D5A3 85%, #C5A55A 100%)",
    "--gold-text-grad": "linear-gradient(135deg, #C5A55A 0%, #E8D5A3 50%, #8B7332 100%)",
    "--font-serif": "'Cormorant Garamond', Georgia, serif",
    "--font-sans": "'Poppins', system-ui, sans-serif",
    mode: "light"
  },
  navLinks: [
    { id: "home", label: "Accueil" },
    { id: "products", label: "Produits" },
    { id: "about", label: "A Propos" },
    { id: "gallery", label: "Galerie" },
    { id: "contact", label: "Contact" }
  ],
  heroTitle: "Elevez Votre",
  heroSubtitle: "Eclat Naturel",
  heroDescription: "Decouvrez nos produits cosmetiques naturels, concus pour sublimer votre beaute."
}
