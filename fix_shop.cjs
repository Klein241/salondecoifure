const fs = require("fs");
let c = fs.readFileSync("src/components/Shop.jsx", "utf8");

// Replace the entire corrupted handleDirectOrder function
const oldFn = c.substring(c.indexOf("  const handleDirectOrder"), c.indexOf("\n  };\n", c.indexOf("const handleDirectOrder")) + 5);
console.log("OLD FN:", oldFn.substring(0, 200));

const newFn = `  const handleDirectOrder = (product) => {
    if (product.in_stock === false) return;
    const wa = (settings.whatsapp || \"+241077004073\").replace(/\\D/g, \"\");
    const imgUrl = product.image_url || (product.images && product.images[0]);
    const imgLine = imgUrl ? \`\\n\\n\u{1F4F8} Photo du produit :\\n\${imgUrl}\` : "";
    const msg = encodeURIComponent(
      \`Bonjour \${settings.site_name} !\\n\\nJe souhaite commander :\\n  \u2022 \${product.name} x1 = \${Number(product.price).toLocaleString("fr-FR")} FCFA\${imgLine}\\n\\nTotal : \${Number(product.price).toLocaleString("fr-FR")} FCFA\\n\\nMerci de confirmer ma commande. \u{1F64F}\`
    );
    window.open(\`https://wa.me/\${wa}?text=\${msg}\`, "_blank");
  };`;

c = c.replace(oldFn, newFn);
console.log("Fixed:", c.includes("Photo du produit"));
fs.writeFileSync("src/components/Shop.jsx", c, "utf8");
console.log("Saved");

