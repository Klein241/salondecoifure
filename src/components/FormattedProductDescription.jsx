import React from 'react';

/**
 * Analyse et structure intelligemment une description brute de produit
 * pour extraire les puces, les sections clés (Bienfaits, Composition, Mode d'emploi, etc.)
 * et les paragraphes, même si le texte a été collé sans sauts de ligne ou avec des tirets inline.
 */
export function parseProductDescription(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];
  let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Détection des sections courantes et des titres de section (ex: "Bienfaits :", "Composition :", "Mode d'emploi :", etc.)
  const knownKeywords = [
    'Bienfaits', 'Composition', 'Ingrédients', 'Actifs', 'Actifs clés',
    'Mode d[\'’]utilisation', 'Conseils? d[\'’]utilisation', 'Conseils?', 'Utilisation',
    'Précautions? d[\'’]emploi', 'Précautions?', 'Avertissements?',
    'Contenance', 'Format', 'Volume', 'Poids',
    'Fabriqué par', 'Fabrication', 'Origine',
    'Contacts?', 'Service client', 'Commande',
    'Points forts', 'Avantages', 'Caractéristiques',
    'À utiliser de préférence avant fin', 'Expiration', 'Conservation', 'DLUO'
  ].join('|');

  const sectionRegex = new RegExp(`(?:^|\\s+)(${knownKeywords})\\s*:`, 'gi');
  text = text.replace(sectionRegex, (match, sec) => `\n\n###SEC###:${sec.trim()}###:\n`);

  // Remplacer les tirets / puces inline " - " ou " • " par des sauts de ligne avec puce
  text = text.replace(/([^\n])\s+[-•*]\s+/g, '$1\n- ');

  const lines = text.split('\n');
  const blocks = [];
  let currentList = null;

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line) {
      if (currentList && currentList.length > 0) {
        blocks.push({ type: 'list', items: currentList });
        currentList = null;
      }
      continue;
    }

    // Marqueur de section explicite
    const secMatch = line.match(/^###SEC###:([^#]+)###:$/);
    if (secMatch) {
      if (currentList && currentList.length > 0) {
        blocks.push({ type: 'list', items: currentList });
        currentList = null;
      }
      blocks.push({ type: 'heading', title: secMatch[1].trim() + ' :' });
      continue;
    }

    // Puce explicite : tiret, puce Unicode, astérisque, ou chiffre (1. 2.)
    const bulletMatch = line.match(/^[-•*]\s+(.*)$/) || line.match(/^(\d+[\.\)])\s+(.*)$/);
    if (bulletMatch) {
      const content = bulletMatch[2] ? `${bulletMatch[1]} ${bulletMatch[2]}` : bulletMatch[1];
      if (!currentList) currentList = [];
      currentList.push(content.trim());
      continue;
    }

    // Ligne normale
    if (currentList && currentList.length > 0) {
      blocks.push({ type: 'list', items: currentList });
      currentList = null;
    }

    // Détecter un titre générique court finissant par ":" (ex: "Astuce beauté :")
    if (/^[A-ZÀ-ÖØ-ß][A-Za-zÀ-öø-ÿ0-9'’\s]{2,35}\s*:$/.test(line)) {
      blocks.push({ type: 'heading', title: line });
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
  }

  if (currentList && currentList.length > 0) {
    blocks.push({ type: 'list', items: currentList });
  }

  return blocks;
}

/**
 * Composant de rendu visuel haute fidélité pour les descriptions de produits
 * Respecte à 100% les listes à puces, retours à la ligne et sections.
 */
export function FormattedProductDescription({ description, isDarkMode = true, className = '' }) {
  if (!description) return null;

  const blocks = parseProductDescription(description);

  if (blocks.length === 0) return null;

  return (
    <div className={`space-y-2 text-left ${className}`}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <div key={index} className="pt-2 pb-0.5 first:pt-0">
              <span className={`inline-flex items-center gap-1.5 text-xs font-black tracking-wide uppercase ${
                isDarkMode ? 'text-amber-300' : 'text-amber-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                {block.title}
              </span>
            </div>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={index} className="space-y-1.5 my-1 pl-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2.5 text-xs leading-relaxed">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-transform ${
                      isDarkMode
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                        : 'bg-amber-600'
                    }`}
                  />
                  <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={index}
            className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export default FormattedProductDescription;
