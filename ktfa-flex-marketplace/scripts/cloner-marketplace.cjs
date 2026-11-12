// ==============================================================================
// THE GREATSOFT — USINE DE CLÔNAGE 1-CLIC DE MARKETPLACES CLOUDFLARE
// ==============================================================================

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WRANGLER_BIN = path.join(ROOT_DIR, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const WRANGLER_CMD = fs.existsSync(WRANGLER_BIN) ? `node "${WRANGLER_BIN}"` : 'npx wrangler';
const ACCOUNT_ID = '0c6536b2366b6a388b4d6a4d331d486e';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

function runCmd(cmd, label) {
  console.log(`\n⏳ ${label}...`);
  try {
    const cleanEnv = { ...process.env, WRANGLER_SEND_METRICS: 'false' };
    delete cleanEnv.CI; // IMPORTANT: Évite le piège non-interactif Cloudflare API Token
    const output = execSync(cmd, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      env: cleanEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 300000,
    });
    return { success: true, output };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : err.message;
    const stdout = err.stdout ? err.stdout.toString() : '';
    return { success: false, error: stderr || stdout };
  }
}

// Support CLI flags (ex: node scripts/cloner-marketplace.cjs --name="GOTAM" --slug="gotam")
function getCliArg(flag) {
  const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
  return arg ? arg.split('=')[1].replace(/^["']|["']$/g, '').trim() : null;
}

async function main() {
  console.log('==============================================================================');
  console.log('   💎 CLÔNEUR INDUSTRIEL DE MARKETPLACES & COMMERCE ÉCHELONNÉ');
  console.log('==============================================================================\n');

  let clientName = getCliArg('name');
  let clientSlug = getCliArg('slug');
  let clientWhatsApp = getCliArg('whatsapp') || '237694473414';
  let adminPassword = getCliArg('pin') || '2026';

  let rl = null;
  if (!clientName) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q, def = '') => new Promise((res) => rl.question(def ? `${q} [${def}]: ` : `${q}: `, (ans) => res(ans.trim() || def)));
    clientName = await ask("1. Nom de l'enseigne du client", "GOTAM");
    clientSlug = await ask("2. Identifiant web court (slug)", slugify(clientName));
    clientWhatsApp = await ask("3. Numéro WhatsApp avec indicatif", clientWhatsApp);
    adminPassword = await ask("4. Code PIN d'administration client", adminPassword);
    rl.close();
  }

  if (!clientSlug) clientSlug = slugify(clientName) || 'marketplace-client';

  console.log('\n------------------------------------------------------------------------------');
  console.log('📋 RÉCAPITULATIF DU NOUVEAU CLONE :');
  console.log(`   • Nom        : ${clientName}`);
  console.log(`   • Slug       : ${clientSlug}`);
  console.log(`   • WhatsApp   : ${clientWhatsApp}`);
  console.log(`   • Code PIN   : ${adminPassword}`);
  console.log(`   • Base D1    : ${clientSlug}-db`);
  console.log(`   • URL prévue : https://${clientSlug}.mynexus.workers.dev`);
  console.log('------------------------------------------------------------------------------\n');

  // 1. Création de la Base Cloudflare D1
  const dbName = `${clientSlug}-db`;
  const createDbRes = runCmd(`${WRANGLER_CMD} d1 create ${dbName}`, `Création de la base Cloudflare D1 (${dbName})`);
  let databaseId = null;

  if (createDbRes.success) {
    const match = createDbRes.output.match(/database_id\s*=\s*"([a-f0-9\-]+)"/i);
    if (match) databaseId = match[1];
  }

  if (!databaseId) {
    console.log('⚠️ Recherche dans la liste D1...');
    const listRes = runCmd(`${WRANGLER_CMD} d1 list --json`, 'Récupération de la liste D1');
    if (listRes.success) {
      try {
        const list = JSON.parse(listRes.output);
        const item = list.find((d) => d.name === dbName);
        if (item) databaseId = item.uuid;
      } catch (e) {}
    }
  }

  if (!databaseId) {
    console.error(`\n❌ Impossible de récupérer le database_id pour ${dbName}. Erreur:`, createDbRes.error);
    process.exit(1);
  }
  console.log(`✅ Base D1 prête. ID: ${databaseId}`);

  // 2. Initialisation des Tables (Schema)
  const schemaRes = runCmd(`${WRANGLER_CMD} d1 execute ${dbName} --remote --file=./d1/schema.sql -y`, 'Initialisation du schéma SQL (tables)');
  if (!schemaRes.success) {
    console.error('Erreur schéma D1:', schemaRes.error);
  }

  // 3. Injection du catalogue par défaut (Seed)
  const seedRes = runCmd(`${WRANGLER_CMD} d1 execute ${dbName} --remote --file=./d1/seed.sql -y`, 'Injection du catalogue initial');
  if (!seedRes.success) {
    console.error('Erreur seed D1:', seedRes.error);
  }

  // 4. Personnalisation des paramètres du client (Nom, WhatsApp, PIN, Titres)
  const customSql = `
    INSERT OR REPLACE INTO settings (key, value) VALUES
    ('company_name', '${clientName.replace(/'/g, "''")}'),
    ('hero_title', '${clientName.replace(/'/g, "''")}'),
    ('tagline', 'Marketplace & Paiement Échelonné — Achetez Malin, Payez à Votre Rythme'),
    ('whatsapp_number', '${clientWhatsApp}'),
    ('phone_display', '${clientWhatsApp}'),
    ('admin_code', '${adminPassword}'),
    ('promo_banner_text', '💎 ${clientName.replace(/'/g, "''")} : Facilité de paiement échelonné en 3x et 4x sur tout le catalogue ! Inscription rapide et validation sous 24h.');
  `;
  const tempSqlPath = path.join(ROOT_DIR, `temp_${clientSlug}.sql`);
  fs.writeFileSync(tempSqlPath, customSql, 'utf-8');
  runCmd(`${WRANGLER_CMD} d1 execute ${dbName} --remote --file="./temp_${clientSlug}.sql" -y`, 'Personnalisation des paramètres');
  try { fs.unlinkSync(tempSqlPath); } catch (e) {}

  // 5. Génération du fichier de configuration wrangler.<clientSlug>.toml avec D1 + R2 + ASSETS
  const wranglerConfig = `name = "${clientSlug}"
main = "worker/index.js"
compatibility_date = "2024-09-23"
account_id = "${ACCOUNT_ID}"

# Cloudflare Workers Static Assets (Front-end SPA Vite)
[assets]
directory = "./dist"
binding = "ASSETS"
not_found_handling = "single-page-application"
run_worker_first = true

# Cloudflare D1 Database dédiée
[[d1_databases]]
binding = "DB"
database_name = "${dbName}"
database_id = "${databaseId}"

# Cloudflare R2 Storage (Vidéos, Affiches, Médias Uploadés)
[[r2_buckets]]
binding = "R2_STORAGE"
bucket_name = "digitalmarkpro-assets"

[vars]
ENVIRONMENT = "production"
ADMIN_KEY = "${adminPassword}"
DEFAULT_WHATSAPP = "${clientWhatsApp}"
COMPANY_NAME = "${clientName}"
`;

  const configPath = path.join(ROOT_DIR, `wrangler.${clientSlug}.toml`);
  fs.writeFileSync(configPath, wranglerConfig, 'utf-8');
  console.log(`✅ Fichier de configuration généré : wrangler.${clientSlug}.toml`);

  // 6. Compilation du frontend Vite (dist)
  runCmd('npm run build', 'Compilation du frontend Vite');

  // 7. Déploiement sur Cloudflare Workers
  const deployRes = runCmd(`${WRANGLER_CMD} deploy --config=wrangler.${clientSlug}.toml`, `Déploiement du Worker (${clientSlug})`);

  if (deployRes.success) {
    console.log('\n==============================================================================');
    console.log('🎉 NOUVELLE MARKETPLACE DÉPLOYÉE AVEC SUCCÈS !');
    console.log('==============================================================================');
    console.log(`🔗 URL Publique : https://${clientSlug}.mynexus.workers.dev`);
    console.log(`🔐 URL Admin    : https://${clientSlug}.mynexus.workers.dev/login/admin`);
    console.log(`🗄️ Base D1      : ${dbName} (ID: ${databaseId})`);
    console.log(`☁️ Stockage R2  : digitalmarkpro-assets`);
    console.log(`📱 WhatsApp     : ${clientWhatsApp}`);
    console.log(`🔑 PIN Admin    : ${adminPassword}`);
    console.log('==============================================================================\n');
  } else {
    console.error('\n⚠️ Le déploiement a rencontré une erreur:', deployRes.error);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
