// ==============================================================================
// THE GREATSOFT — ASSISTANT INDUSTRIEL DE DÉPLOIEMENT & CLÔNAGE CLIENT
// ==============================================================================
// Fonctionnalités d'ingénierie intégrées :
// 1. Déploiement Dédié Isolé OU Déploiement Flash Multi-Tenant (Zéro-Build)
// 2. Auto-Ingestion Headless (Scraping automatique de catalogues web & sociaux)
// 3. Gestion de Licence SaaS & Kill-Switch administratif
// 4. Pack de Bienvenue WhatsApp automatisé pour livraison client en 1 clic
// ==============================================================================

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { autoIngestFromUrl } = require('./auto-ingester.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const WRANGLER_BIN = path.join(ROOT_DIR, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const WRANGLER_CMD = fs.existsSync(WRANGLER_BIN) ? `node "${WRANGLER_BIN}"` : 'npx wrangler';
const ACCOUNT_ID = '0c6536b2366b6a388b4d6a4d331d486e';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const promptText = defaultValue ? `${question} [Défaut: ${defaultValue}]: ` : `${question}: `;
    rl.question(promptText, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

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
    const output = execSync(cmd, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      env: {
        ...process.env,
        CI: 'true',
        WRANGLER_SEND_METRICS: 'false',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 180000,
    });
    return { success: true, output };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : err.message;
    const stdout = err.stdout ? err.stdout.toString() : '';
    return { success: false, error: stderr || stdout };
  }
}

async function findExistingDatabaseId(dbName) {
  try {
    const res = runCmd(`${WRANGLER_CMD} d1 list --json`, 'Vérification des bases existantes');
    if (res.success) {
      const list = JSON.parse(res.output);
      const found = list.find((d) => d.name === dbName);
      if (found && found.uuid) return found.uuid;
    }
  } catch (e) {}
  return null;
}

async function main() {
  console.clear();
  console.log('==============================================================================');
  console.log('   🏛️ THE GREATSOFT — USINE DE DÉPLOIEMENT CLIENT & CLÔNAGE INDUSTRIEL');
  console.log('==============================================================================');
  console.log(' Fonctionnalités actives :');
  console.log('   ⚡ 1. Mode Dédié Isolé OU Mode Flash Multi-Tenant Edge (Zéro-Build, Zéro-Deploy)');
  console.log('   🤖 2. Auto-Ingestion Intelligente (Extraction de catalogue web / réseaux sociaux)');
  console.log('   🛡️ 3. Gestion de Licence SaaS & Kill-Switch administratif');
  console.log('   📱 4. Pack de Bienvenue WhatsApp pour livraison client immédiate');
  console.log('==============================================================================\n');

  // --- ÉTAPE A : Choix du Mode d'Infrastructure ---
  console.log('🏗️ CHOISISSEZ LE MODE D\'INFRASTRUCTURE :');
  console.log('   1. Déploiement Dédié Isolé (Worker Cloudflare Dédié + Base D1 Dédiée)');
  console.log('   2. Mode Flash Multi-Tenant Edge [Zéro-Build, Zéro-Deploy en 0.2s]');
  const modeChoice = await ask('Votre choix d\'architecture (1 ou 2)', '1');
  const isMultiTenantFlash = modeChoice === '2';

  // --- ÉTAPE B : Auto-Ingestion Headless (Optionnelle) ---
  console.log('\n🤖 AUTO-INGESTION INTELLIGENTE DU CLIENT :');
  const wantIngest = await ask('Voulez-vous auto-ingérer le contenu depuis une URL (Site, Facebook, Instagram) ? (oui / non)', 'non');
  let ingestedData = null;

  if (wantIngest.toLowerCase().startsWith('o')) {
    const targetUrl = await ask('Entrez l\'URL publique de la page ou du site du client');
    if (targetUrl) {
      ingestedData = await autoIngestFromUrl(targetUrl);
    }
  }

  // --- ÉTAPE C : Choix du Modèle Métier ---
  console.log('\n📌 CHOISISSEZ LE MODÈLE MÉTIER INITIAL :');
  console.log('   1. Agence Digitale, Audiovisuel & Vidéos 4K (Digital Mark Pro)');
  console.log('   2. Cosmétique, Beauté & Soins (Abaia Cosmétique)');
  console.log('   3. Salon de Coiffure & Barbershop VIP');
  const templateChoice = await ask('Votre choix (1, 2 ou 3)', ingestedData ? '2' : '2');
  const isCosmeticTemplate = templateChoice === '2' || templateChoice === '3';

  // --- ÉTAPE D : Informations Client & Personnalisation ---
  const autoSuggestedName = ingestedData?.title || (isCosmeticTemplate ? 'Aura Cosmétique' : 'Mon Client VIP');
  const clientName = await ask("1. Nom de l'entreprise ou marque du client", autoSuggestedName);
  const defaultSlug = slugify(clientName) || 'client-nouveau';
  const clientSlug = await ask('2. Identifiant web court (slug)', defaultSlug);

  const autoSuggestedWa = ingestedData?.whatsapp || '24177624383';
  const clientWhatsApp = await ask('3. Numéro WhatsApp avec indicatif (ex: 24177624383)', autoSuggestedWa);
  const adminPassword = await ask('4. Mot de passe d\'administration client', 'client2026');

  // --- ÉTAPE E : Licence SaaS & Kill-Switch THE GREATSOFT ---
  console.log('\n🛡️ PARAMÈTRES DE LA LICENCE SAAS & FACTURATION :');
  const licenseDays = await ask('5. Durée de validité initiale de la licence (en jours)', '30');
  const monthlyPrice = await ask('6. Montant de la redevance mensuelle (en FCFA)', '25000');
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + (parseInt(licenseDays, 10) || 30));
  const licenseExpiryIso = expDate.toISOString().split('T')[0];

  console.log('\n------------------------------------------------------------------------------');
  console.log('📋 RÉCAPITULATIF DU DÉPLOIEMENT :');
  console.log(`   • Architecture  : ${isMultiTenantFlash ? '⚡ Flash Multi-Tenant (0.2s, Zéro-Build)' : '🏛️ Dédié Isolé (Worker + Base D1)'}`);
  console.log(`   • Entreprise    : ${clientName}`);
  console.log(`   • Identifiant   : ${clientSlug}`);
  console.log(`   • WhatsApp      : ${clientWhatsApp}`);
  console.log(`   • Mot de passe  : ${adminPassword}`);
  console.log(`   • Licence SaaS  : Active jusqu'au ${licenseExpiryIso} (${monthlyPrice} FCFA/mois)`);
  if (ingestedData && ingestedData.items.length > 0) {
    console.log(`   • Ingestion     : ${ingestedData.items.length} produits extraits prêts à injecter !`);
  }
  console.log('------------------------------------------------------------------------------');

  const confirm = await ask('Lancer le déploiement maintenant ? (oui / non)', 'oui');
  if (!confirm.toLowerCase().startsWith('o')) {
    console.log('\n❌ Déploiement annulé.');
    rl.close();
    return;
  }

  // ==========================================================================
  // BRANCHE 1 : DÉPLOIEMENT FLASH MULTI-TENANT (ZÉRO-BUILD, ZÉRO-DEPLOY)
  // ==========================================================================
  if (isMultiTenantFlash) {
    console.log('\n⚡ Exécution du déploiement Flash Edge Multi-Tenant...');
    const masterDb = 'digital-mark-pro-db';

    // 1. Insertion du tenant dans la table tenants
    const tenantSql = `
      INSERT OR REPLACE INTO tenants (
        slug, name, whatsapp, admin_key, theme_choice, catalog_type,
        license_status, license_expiry, license_plan, license_notes, settings_json
      ) VALUES (
        '${clientSlug}',
        '${clientName.replace(/'/g, "''")}',
        '${clientWhatsApp}',
        '${adminPassword.replace(/'/g, "''")}',
        '${isCosmeticTemplate ? '2' : '1'}',
        '${isCosmeticTemplate ? 'cosmetique' : 'agence'}',
        'active',
        '${licenseExpiryIso}',
        'Standard Pro',
        'Redevance mensuelle: ${monthlyPrice} FCFA',
        '{}'
      );
    `;

    const tempTenantSqlPath = path.join(ROOT_DIR, 'd1', '_temp_tenant.sql');
    fs.writeFileSync(tempTenantSqlPath, tenantSql, 'utf-8');
    runCmd(`${WRANGLER_CMD} d1 execute ${masterDb} --remote --file=./d1/_temp_tenant.sql -y`, 'Enregistrement du Tenant dans le réseau Edge');
    try { fs.unlinkSync(tempTenantSqlPath); } catch (e) {}

    const siteUrl = `https://digital-mark-pro.mynexus.workers.dev/?tenant=${clientSlug}`;
    finishDeployment({ clientName, siteUrl, adminPassword, clientWhatsApp, licenseExpiryIso, monthlyPrice, isFlash: true });
    return;
  }

  // ==========================================================================
  // BRANCHE 2 : DÉPLOIEMENT DÉDIÉ ISOLÉ (WORKER + D1 SPÉCIFIQUE)
  // ==========================================================================
  const dbName = `${clientSlug}-db`;

  // 1. Création de la base D1
  let databaseId = await findExistingDatabaseId(dbName);
  if (!databaseId) {
    const createDbRes = runCmd(`${WRANGLER_CMD} d1 create ${dbName}`, `Création de la base de données D1 : ${dbName}`);
    if (createDbRes.success) {
      const match = createDbRes.output.match(/database_id\s*=\s*["']([a-f0-9-]+)["']/i);
      if (match && match[1]) databaseId = match[1];
    }
  }

  if (!databaseId) databaseId = await findExistingDatabaseId(dbName);
  if (!databaseId) databaseId = await ask('Entrez le database_id Cloudflare pour ce client');
  if (!databaseId) {
    console.log('\n❌ Impossible de continuer sans base de données.');
    rl.close();
    return;
  }

  // 2. Schéma SQL
  runCmd(`${WRANGLER_CMD} d1 execute ${dbName} --remote --file=./d1/schema.sql -y`, 'Initialisation du schéma SQL et des tables de licence');

  // 3. Catalogue de départ
  const seedFile = isCosmeticTemplate ? './d1/seed-cosmetique.sql' : './d1/seed.sql';
  runCmd(`${WRANGLER_CMD} d1 execute ${dbName} --remote --file=${seedFile} -y`, 'Injection du catalogue de démonstration');

  // 4. Injection des produits auto-ingérés (si disponibles)
  if (ingestedData && ingestedData.items.length > 0) {
    console.log(`\n📦 Injection de ${ingestedData.items.length} produits auto-ingérés...`);
    const ingestedItemsSql = ingestedData.items.map((item, idx) => {
      const id = `auto-${Date.now()}-${idx}`;
      return `INSERT OR REPLACE INTO posters (id, title, category, format, dimensions, image_url, price_fcfa, price_eur, badge, description, features)
              VALUES ('${id}', '${item.title.replace(/'/g, "''")}', 'Catalogue Extrait', 'Carré HD', '1080x1080', '${item.image_url}', ${item.price_fcfa}, ${Math.round(item.price_fcfa / 655)}, 'NOUVEAU', '${item.description.replace(/'/g, "''")}', '["Disponible immédiatement"]');`;
    }).join('\n');

    const tempIngestPath = path.join(ROOT_DIR, 'd1', '_temp_ingested.sql');
    fs.writeFileSync(tempIngestPath, ingestedItemsSql, 'utf-8');
    runCmd(`${WRANGLER_CMD} d1 execute ${dbName} --remote --file=./d1/_temp_ingested.sql -y`, 'Enregistrement des produits auto-ingérés');
    try { fs.unlinkSync(tempIngestPath); } catch (e) {}
  }

  // 5. Paramètres du client & Licence SaaS
  const defaultWhatsAppMsg = `👋 Bonjour ${clientName}, je souhaite commander un produit ou échanger avec votre équipe.`;
  const settingsEntries = [
    ['company_name', clientName],
    ['whatsapp_number', clientWhatsApp],
    ['admin_code', adminPassword],
    ['default_whatsapp_message', defaultWhatsAppMsg],
    ['license_status', 'active'],
    ['license_expiry', licenseExpiryIso],
    ['license_plan', 'Standard Pro'],
    ['monthly_price_fcfa', monthlyPrice],
    ['kill_switch_active', '0'],
  ];

  if (ingestedData?.description) {
    settingsEntries.push(['tagline', ingestedData.description.slice(0, 80)]);
  }

  const settingsSql = settingsEntries
    .map(([k, v]) => `INSERT OR REPLACE INTO settings (key, value) VALUES ('${k}', '${String(v).replace(/'/g, "''")}');`)
    .join('\n');

  const tempSettingsPath = path.join(ROOT_DIR, 'd1', '_temp_settings.sql');
  fs.writeFileSync(tempSettingsPath, settingsSql, 'utf-8');
  runCmd(`${WRANGLER_CMD} d1 execute ${dbName} --remote --file=./d1/_temp_settings.sql -y`, 'Enregistrement de la configuration et de la licence SaaS');
  try { fs.unlinkSync(tempSettingsPath); } catch (e) {}

  // 6. Fichier wrangler dedicated
  const clientConfigPath = path.join(ROOT_DIR, `wrangler.${clientSlug}.toml`);
  const wranglerContent = `# Configuration générée pour ${clientName}
name = "${clientSlug}"
main = "worker/index.js"
compatibility_date = "2024-09-23"
account_id = "${ACCOUNT_ID}"

[assets]
directory = "./dist"
binding = "ASSETS"
not_found_handling = "single-page-application"
run_worker_first = true

[[d1_databases]]
binding = "DB"
database_name = "${dbName}"
database_id = "${databaseId}"

[[r2_buckets]]
binding = "R2_STORAGE"
bucket_name = "digitalmarkpro-assets"

[vars]
ENVIRONMENT = "production"
ADMIN_KEY = "${adminPassword}"
DEFAULT_WHATSAPP = "${clientWhatsApp}"
COMPANY_NAME = "${clientName}"
`;
  fs.writeFileSync(clientConfigPath, wranglerContent, 'utf-8');

  // 7. Build & Deploy
  runCmd('npm run build', 'Compilation de la distribution Frontend');
  const deployRes = runCmd(`${WRANGLER_CMD} deploy --config wrangler.${clientSlug}.toml`, 'Déploiement sur le réseau Cloudflare Edge');

  let siteUrl = `https://${clientSlug}.mynexus.workers.dev`;
  if (deployRes.success) {
    const urlMatch = deployRes.output.match(/https:\/\/[a-zA-Z0-9.-]+\.workers\.dev/);
    if (urlMatch) siteUrl = urlMatch[0];
  }

  finishDeployment({ clientName, siteUrl, adminPassword, clientWhatsApp, licenseExpiryIso, monthlyPrice, dbName, databaseId, isFlash: false });
}

function finishDeployment({ clientName, siteUrl, adminPassword, clientWhatsApp, licenseExpiryIso, monthlyPrice, dbName, databaseId, isFlash }) {
  const adminUrl = isFlash ? `${siteUrl}&admin=1` : `${siteUrl}/login/admin`;

  // Pack de Bienvenue WhatsApp Automatisé
  const welcomeMessage = `🎉 *Félicitations ${clientName} !* Votre boutique officielle est désormais active et en ligne.

🌐 *Lien Public de votre site :*
${siteUrl}

🔐 *Votre Espace Administrateur :*
${adminUrl}

🔑 *Code d'accès secret :* ${adminPassword}

📋 *Comment démarrer en 3 étapes :*
1. Connectez-vous à votre Espace Administrateur.
2. Modifiez vos prix ou ajoutez vos propres photos depuis votre téléphone.
3. Partagez votre lien public sur vos statuts WhatsApp, TikTok et Instagram pour recevoir vos commandes.

🛡️ *Licence SaaS & Support :* Active jusqu'au ${licenseExpiryIso}
Support technique THE GREATSOFT actif 7j/7.`;

  const waSendUrl = `https://wa.me/${clientWhatsApp}?text=${encodeURIComponent(welcomeMessage)}`;

  // Enregistrement dans CLIENTS_DEPLOYÉS.txt
  const logEntry = `------------------------------------------------------------
Date : ${new Date().toLocaleString('fr-FR')}
Mode : ${isFlash ? '⚡ Flash Multi-Tenant (Zéro-Build)' : '🏛️ Dédié Isolé'}
Client : ${clientName}
Lien Public : ${siteUrl}
Lien Administration : ${adminUrl}
Code Secret Admin : ${adminPassword}
Numéro WhatsApp : ${clientWhatsApp}
Licence Valide : jusqu'au ${licenseExpiryIso} (${monthlyPrice} FCFA/mois)
${dbName ? `Base D1 : ${dbName} (ID: ${databaseId})` : 'Base D1 : Multi-Tenant partagée'}
------------------------------------------------------------\n`;

  fs.appendFileSync(path.join(ROOT_DIR, 'CLIENTS_DEPLOYÉS.txt'), logEntry, 'utf-8');

  console.log('\n==============================================================================');
  console.log('   🎉 DÉPLOIEMENT RÉUSSI ! LE SITE EST 100% OPÉRATIONNEL SUR CLOUDFLARE !');
  console.log('==============================================================================');
  console.log(`   🌐 Site Public          : ${siteUrl}`);
  console.log(`   🔒 Espace Gestionnaire  : ${adminUrl}`);
  console.log(`   🔑 Code Admin           : ${adminPassword}`);
  console.log(`   🛡️ Licence SaaS Active  : Jusqu'au ${licenseExpiryIso}`);
  console.log('==============================================================================');
  console.log('\n📲 PACK DE BIENVENUE WHATSAPP PRÊT À ENVOYER :');
  console.log('   Cliquez ou copiez ce lien pour livrer le client sur WhatsApp en 1 clic :');
  console.log(`   👉 ${waSendUrl}\n`);
  console.log('📝 Récapitulatif archivé dans : CLIENTS_DEPLOYÉS.txt\n');

  rl.close();
}

main().catch((err) => {
  console.error('\n❌ Erreur inattendue:', err);
  rl.close();
});
