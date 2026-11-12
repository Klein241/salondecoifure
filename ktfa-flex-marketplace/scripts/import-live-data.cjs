const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const WRANGLER_BIN = path.join(ROOT_DIR, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const WRANGLER_CMD = `node "${WRANGLER_BIN}"`;
const DB_NAME = 'ktfa-flex-db';

const rawSettings = fs.readFileSync(path.join(ROOT_DIR, 'ktfa_live_settings.json'), 'utf-8');
const settings = JSON.parse(rawSettings);

console.log('🔄 Préparation de la migration des données vers ktfa-flex-db...');

let sqlStatements = [];

// 1. Ajouter la colonne images si elle manque
sqlStatements.push(`ALTER TABLE posters ADD COLUMN images TEXT;`);

// 2. Nettoyer les posters pour réinjecter le catalogue complet et propre
sqlStatements.push(`DELETE FROM posters;`);

// 3. Injecter chaque article
const posters = settings.custom_posters || [];
console.log(`📦 Nombre d'articles à migrer : ${posters.length}`);

for (const p of posters) {
  const id = p.id;
  const title = (p.title || '').replace(/'/g, "''");
  const category = (p.category || 'Général').replace(/'/g, "''");
  const format = (p.format || 'Standard').replace(/'/g, "''");
  const dimensions = (p.dimensions || '').replace(/'/g, "''");
  const price_fcfa = parseInt(p.price_fcfa, 10) || 0;
  const price_eur = parseInt(p.price_eur, 10) || Math.round(price_fcfa / 655);
  const installment_months = parseInt(p.installment_months, 10) || 4;
  const monthly_fcfa = parseInt(p.monthly_fcfa, 10) || Math.round(price_fcfa / installment_months);
  const rating = parseFloat(p.rating) || 5.0;
  const reviews_count = parseInt(p.reviews_count, 10) || 0;
  const badge = (p.badge || '').replace(/'/g, "''");
  const badge_color = (p.badge_color || '').replace(/'/g, "''");
  const image_url = (p.image_url || '').replace(/'/g, "''");
  const description = (p.description || '').replace(/'/g, "''");
  const features = JSON.stringify(p.features || []).replace(/'/g, "''");
  const images = JSON.stringify(p.images || [p.image_url || '']).replace(/'/g, "''");
  const popular = p.popular ? 1 : 0;

  sqlStatements.push(`
    INSERT INTO posters (
      id, title, category, format, dimensions, price_fcfa, price_eur,
      installment_months, monthly_fcfa, rating, reviews_count, badge, badge_color,
      image_url, images, description, features, popular
    ) VALUES (
      '${id}', '${title}', '${category}', '${format}', '${dimensions}', ${price_fcfa}, ${price_eur},
      ${installment_months}, ${monthly_fcfa}, ${rating}, ${reviews_count}, '${badge}', '${badge_color}',
      '${image_url}', '${images}', '${description}', '${features}', ${popular}
    );
  `);
}

// 4. Injecter les réglages
const settingsEntries = Object.entries(settings).filter(([k]) => k !== 'custom_posters');
for (const [key, val] of settingsEntries) {
  if (val !== undefined && val !== null) {
    const strVal = (typeof val === 'object' ? JSON.stringify(val) : String(val)).replace(/'/g, "''");
    sqlStatements.push(`INSERT OR REPLACE INTO settings (key, value) VALUES ('${key}', '${strVal}');`);
  }
}

const migrationSqlFile = path.join(ROOT_DIR, 'd1', 'restore_live_data.sql');
fs.writeFileSync(migrationSqlFile, sqlStatements.join('\n'), 'utf-8');
console.log(`✅ Fichier SQL généré : ${migrationSqlFile}`);

// Exécution sur remote D1
try {
  console.log(`🚀 Exécution sur la base D1 ${DB_NAME}...`);
  execSync(`${WRANGLER_CMD} d1 execute ${DB_NAME} --remote --file=./d1/restore_live_data.sql -y`, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false' }
  });
  console.log('🎉 Migration des 22 articles et des paramètres terminée avec succès !');
} catch (e) {
  console.error('Erreur migration:', e.message);
}
