import fs from 'fs';

async function testFile(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const regex = /https:\/\/images\.unsplash\.com\/[^\s"'\\]+/g;
  const urls = [...new Set(content.match(regex) || [])];
  console.log(`\n=== Testing ${urls.length} URLs from ${file} ===`);
  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'HEAD' });
      const status = res.status;
      if (status !== 200) {
        console.log(`❌ [${status}] ${u}`);
      } else {
        console.log(`✅ [200] ${u.slice(0, 70)}`);
      }
    } catch (e) {
      console.log(`⚠️ [ERR] ${e.message} ${u.slice(0, 70)}`);
    }
  }
}

async function main() {
  await testFile('d1/update-burgys-gabon.sql');
  await testFile('d1/seed-pizzas-feu-de-dieu.sql');
  await testFile('src/components/BurgysFastFoodView.jsx');
  await testFile('src/components/PizzasFeuDeDieuView.jsx');
}

main();
