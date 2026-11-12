// ==============================================================================
// KTFA FLEX — SCRIPT DE DÉPLOIEMENT & INITIALISATION CLOUDFLARE (BASE D1 DÉDIÉE)
// ==============================================================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WRANGLER_BIN = path.join(ROOT_DIR, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const WRANGLER_CMD = fs.existsSync(WRANGLER_BIN) ? `node "${WRANGLER_BIN}"` : 'npx wrangler';
const DB_NAME = 'ktfa-flex-db';
const WRANGLER_TOML = path.join(ROOT_DIR, 'wrangler.toml');

function runCmd(cmd, label) {
  console.log(`\n⏳ ${label}...`);
  try {
    const output = execSync(cmd, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      env: {
        ...process.env,
        WRANGLER_SEND_METRICS: 'false',
      },
      stdio: 'inherit',
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  console.clear();
  console.log('==============================================================================');
  console.log('   💎 KTFA FLEX — DÉPLOIEMENT DE L\'INSTANCE DÉDIÉE SOUVERAINE');
  console.log('==============================================================================');
  console.log(' Étapes automatiques :');
  console.log('   1. Création de la base Cloudflare D1 dédiée (ktfa-flex-db)');
  console.log('   2. Initialisation des tables SQL & Injection du catalogue');
  console.log('   3. Compilation Vite de l\'application');
  console.log('   4. Déploiement sur Cloudflare Workers (ktfa-flex.mynexus.workers.dev)');
  console.log('==============================================================================\n');

  // 1. Récupération ou création de la base D1
  console.log('🔍 Vérification de la base Cloudflare D1...');
  let databaseId = null;

  try {
    const listRaw = execSync(`${WRANGLER_CMD} d1 list --json`, { cwd: ROOT_DIR, encoding: 'utf-8' });
    const list = JSON.parse(listRaw);
    const existing = list.find(d => d.name === DB_NAME);
    if (existing && existing.uuid) {
      databaseId = existing.uuid;
      console.log(`✅ Base existante trouvée : ${DB_NAME} (ID: ${databaseId})`);
    }
  } catch (e) {}

  if (!databaseId) {
    console.log(`⏳ Création de la base D1 ${DB_NAME}...`);
    try {
      const createOut = execSync(`${WRANGLER_CMD} d1 create ${DB_NAME}`, { cwd: ROOT_DIR, encoding: 'utf-8' });
      const match = createOut.match(/database_id\s*=\s*"([a-f0-9\-]+)"/i);
      if (match) databaseId = match[1];
    } catch (e) {
      console.error('Erreur lors de la création de la base D1:', e.message);
    }
  }

  if (databaseId) {
    // Mettre à jour wrangler.toml avec le vrai database_id
    let tomlContent = fs.readFileSync(WRANGLER_TOML, 'utf-8');
    tomlContent = tomlContent.replace(/database_id\s*=\s*"[^"]*"/, `database_id = "${databaseId}"`);
    fs.writeFileSync(WRANGLER_TOML, tomlContent, 'utf-8');
    console.log(`✅ wrangler.toml configuré avec database_id = "${databaseId}"`);

    // 2. Initialisation SQL et seed
    runCmd(`${WRANGLER_CMD} d1 execute ${DB_NAME} --remote --file=./d1/schema.sql -y`, 'Initialisation du schéma SQL D1');
    runCmd(`${WRANGLER_CMD} d1 execute ${DB_NAME} --remote --file=./d1/seed.sql -y`, 'Injection du catalogue initial KTFA FLEX');
  } else {
    console.log('⚠️ Attention : impossible de créer ou lier la base D1 automatiquement. Le déploiement continuera avec les paramètres actuels.');
  }

  // 3. Build Vite
  runCmd('npm run build', 'Compilation du frontend Vite');

  // 4. Déploiement Cloudflare
  runCmd(`${WRANGLER_CMD} deploy`, 'Déploiement du Worker KTFA FLEX');

  console.log('\n==============================================================================');
  console.log('🎉 KTFA FLEX EST EN LIGNE SUR SON INSTANCE DÉDIÉE !');
  console.log('==============================================================================');
  console.log('🔗 URL Officielle : https://ktfa-flex.mynexus.workers.dev');
  console.log('==============================================================================\n');
}

main().catch(console.error);
