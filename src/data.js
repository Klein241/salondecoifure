export const servicesList = [
  {
    id: "soins-simple",
    name: "Soins Simple",
    price: 10000,
    duration: "45 min",
    category: "Visage & Corps",
    description: "Nettoyage de peau doux, hydratation intense et massage facial relaxant.",
    benefits: ["Détend le corps et l'esprit en profondeur", "Hydrate l'épiderme"]
  },
  {
    id: "soins-complet",
    name: "Soins Complet",
    price: 15000,
    duration: "90 min",
    category: "Visage & Corps",
    description: "Traitement complet incluant gommage en profondeur, bain de vapeur, extraction, modelage ciblé et masque régénérant.",
    benefits: ["Élimine les impuretés et cellules mortes", "Favorise le renouvellement cellulaire"]
  },
  {
    id: "soins-eclaircissant",
    name: "Soins Éclaircissant",
    price: 20000,
    duration: "75 min",
    category: "Teint & Éclat",
    description: "Traitement intensif anti-tâches formulé pour unifier le teint, raviver l'éclat naturel et clarifier la peau.",
    benefits: ["Ravive l'éclat naturel de votre peau", "Atténue les hyperpigmentations"]
  },
  {
    id: "soins-entre-jambes",
    name: "Soins Entre Jambes",
    price: 15000,
    duration: "60 min",
    category: "Soins Spécifiques",
    description: "Soin ciblé, apaisant et clarifiant conçu spécialement pour le confort et l'esthétique des zones sensibles.",
    benefits: ["Adoucit et hydrate la zone ciblée", "Réduit les irritations post-épilation"]
  }
];

export const staffList = [
  { id: "mariama", name: "Mariama", role: "Spécialiste Soins Visage", rating: 4.9, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
  { id: "charlotte", name: "Charlotte", role: "Experte Esthétique", rating: 4.8, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" },
  { id: "karen", name: "Karen", role: "Massothérapeute Professionnelle", rating: 5.0, avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150" }
];

export const galleryItems = [
  { id: 1, title: "Soin Visage Hydratant", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600", category: "Visage" },
  { id: 2, title: "Massage aux Pierres Chaudes", image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600", category: "Massages" },
  { id: 3, title: "Soin Éclaircissant Teint", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600", category: "Visage" },
  { id: 4, title: "Espace Détente & SPA", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600", category: "Salon" },
  { id: 5, title: "Soins Corps Aromathérapie", image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600", category: "Corps" },
  { id: 6, title: "Masque Visage Or", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600", category: "Visage" }
];

// Helper functions for mock backend state
export const getStoredData = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(stored);
};

export const setStoredData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};
