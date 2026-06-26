const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'src', 'components', 'AbaiaCosmetics.jsx');
let content = fs.readFileSync(file, 'utf8');

const t1 = 'if(url){ setSettings(s=>({...s,hero_image:url})); t("Bannière mise à jour !") }';
const r1 = [
  'if(url){',
  '      const newSettings = {...settings, hero_image:url};',
  '      setSettings(newSettings);',
  '      upsertSettings({hero_image:url});',
  '      localStorage.setItem("abaia_siteinfo",JSON.stringify(newSettings));',
  '      t("Bannière mise à jour et sauvegardée !");',
  '    }'
].join('\n');

content = content.replace(t1, r1);

const t2 = 'imgBox:{width:"48px",height:"48px",borderRadius:"8px",background:"rgba(184,134,11,0.08)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,cursor:"pointer",border:"1px dashed rgba(184,134,11,0.2)"},';
const r2 = 'imgBox:{width:"48px",height:"48px",borderRadius:"8px",background:"rgba(184,134,11,0.08)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,cursor:"pointer",border:"1px dashed rgba(184,134,11,0.2)",position:"relative"},';

content = content.replace(t2, r2);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched successfully');