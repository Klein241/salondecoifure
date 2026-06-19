const fs = require("fs");
let c = fs.readFileSync("src/components/Admin.jsx", "utf8");

// A: import updateGalleryImage
c = c.replace(
  "addGalleryImage, deleteGalleryImage, getGalleryImages, getGalleryCategories, addGalleryCategory, deleteGalleryCategory,",
  "addGalleryImage, updateGalleryImage, deleteGalleryImage, getGalleryImages, getGalleryCategories, addGalleryCategory, deleteGalleryCategory,"
);
console.log("A import:", c.includes("updateGalleryImage,"));

// B: Add states
const OLD_S = "const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'Soin', image_url: '', in_stock: true, payable_with_credits: false, credit_discount_pct: 20 });";
const ADD_S = "\n  const [productCats, setProductCats] = useState(['Soin', 'Maquillage', 'Parfum', 'Cheveux', 'Corps', 'Accessoire']);\n  const [newProductCat, setNewProductCat] = useState('');\n  const [gallerySelectMode, setGallerySelectMode] = useState(false);\n  const [selectedGalleryIds, setSelectedGalleryIds] = useState([]);\n  const [moveToCatId, setMoveToCatId] = useState('');\n  const [editingImageId, setEditingImageId] = useState(null);\n  const [editingImageCatId, setEditingImageCatId] = useState('');";
c = c.replace(OLD_S, OLD_S + ADD_S);
console.log("B states:", c.includes("gallerySelectMode"));

// C: Fix subcategory dropdown
const startLabel = c.indexOf("Sous-categorie (optionnel)");
if (startLabel !== -1) {
  const blockOpen = c.lastIndexOf("{galleryCategories.length > 0 && (", startLabel);
  const closePattern = "</div>\n                  )}";
  const blockClose = c.indexOf(closePattern, startLabel) + closePattern.length;
  const newDropdown = `{galleryCategories.length > 0 && (\n                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>\n                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Categorie / Sous-categorie :</label>\n                      <select value={selectedUploadCat} onChange={e => setSelectedUploadCat(e.target.value)} style={{ padding: "10px", background: "#121212", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }}>\n                        <option value="">-- Aucune --</option>\n                        {galleryCategories.filter(cat => !cat.parent_id).map(parent => (\n                          <React.Fragment key={parent.id}>\n                            <option value={parent.id}>{parent.name}</option>\n                            {galleryCategories.filter(sub => sub.parent_id === parent.id).map(sub => (\n                              <option key={sub.id} value={sub.id}>{\u00a0\u00a0\u221f }{sub.name}</option>\n                            ))}\n                          </React.Fragment>\n                        ))}\n                      </select>\n                    </div>\n                  )}`;
  c = c.substring(0, blockOpen) + newDropdown + c.substring(blockClose);
  console.log("C dropdown: fixed");
} else { console.log("C: label not found"); }

// D: Product category select dynamic
c = c.replace(
  `{["Soin", "Maquillage", "Parfum", "Cheveux", "Corps", "Accessoire"].map(c => <option key={c} value={c}>{c}</option>)}`,
  `{productCats.map(pcat => <option key={pcat} value={pcat}>{pcat}</option>)}`
);
console.log("D prod cats:", c.includes("productCats.map"));

// E: Add select mode button next to + Ajouter button in gallery header
c = c.replace(
  `<button onClick={() => setShowGalleryForm(true)} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px" }}>`,
  `<button onClick={() => { setGallerySelectMode(m => !m); setSelectedGalleryIds([]); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "transparent", border: "1px solid rgba(212,175,55,0.5)", borderRadius: "8px", color: "var(--primary-gold)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>{gallerySelectMode ? "\u2715 Annuler" : "\u2611 S\u00e9lectionner"}</button>\n                <button onClick={() => setShowGalleryForm(true)} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px" }}>`
);
console.log("E select btn:", c.includes("Sélectionner"));

// F: Add batch bar before gallery grid
const gridAnchor = 'galleryImages.map(img => (';
const gridIdx = c.indexOf(gridAnchor);
if (gridIdx !== -1) {
  const gridDivStart = c.lastIndexOf('<div style={{ display: "grid"', gridIdx);
  const batchBar = `{gallerySelectMode && selectedGalleryIds.length > 0 && (\n                <div style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>\n                  <span style={{ fontSize: "0.82rem", color: "var(--primary-gold)", fontWeight: 600 }}>{selectedGalleryIds.length} image(s)</span>\n                  <select value={moveToCatId} onChange={e => setMoveToCatId(e.target.value)} style={{ padding: "6px 10px", background: "#121212", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", fontSize: "0.8rem" }}>\n                    <option value="">-- D\u00e9placer vers --</option>\n                    {galleryCategories.filter(cat => !cat.parent_id).map(parent => (<React.Fragment key={parent.id}><option value={parent.id}>{parent.name}</option>{galleryCategories.filter(sub => sub.parent_id === parent.id).map(sub => (<option key={sub.id} value={sub.id}>&nbsp;\u221f {sub.name}</option>))}</React.Fragment>))}\n                  </select>\n                  <button onClick={async () => { if (!moveToCatId) return; for (const id of selectedGalleryIds) { await updateGalleryImage(id, { subcategory_id: moveToCatId }); } setSelectedGalleryIds([]); setGallerySelectMode(false); setMoveToCatId(""); const imgs = await getGalleryImages(); setGalleryImages(imgs || []); setSuccessMsg("Images d\u00e9plac\u00e9es !"); }} className="btn-gold" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>\u2713 Appliquer</button>\n                  <button onClick={() => { setSelectedGalleryIds([]); setGallerySelectMode(false); }} style={{ padding: "6px 12px", background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "var(--text-secondary)", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}>Annuler</button>\n                </div>\n              )}\n              `;
  c = c.substring(0, gridDivStart) + batchBar + c.substring(gridDivStart);
  console.log("F batch bar: added");
} else { console.log("F: grid not found"); }

// G: Add checkbox + edit button on each image card
const oldTitle = `<p style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: "2px" }}>{img.title}</p>
                          <span style={{ fontSize: "0.7rem", color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{img.category}</span>`;
const newTitle = `<p style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: "2px" }}>{img.title}</p>
                          <span style={{ fontSize: "0.7rem", color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {img.subcategory_id ? ((galleryCategories.find(cat => cat.id === img.subcategory_id) || {}).name || img.category) : img.category}
                          </span>
                          {editingImageId === img.id && (
                            <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                              <select value={editingImageCatId} onChange={e => setEditingImageCatId(e.target.value)} style={{ flex: 1, padding: "4px 6px", background: "#121212", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "4px", fontSize: "0.75rem" }}>
                                <option value="">-- Aucune --</option>
                                {galleryCategories.filter(cat => !cat.parent_id).map(parent => (<React.Fragment key={parent.id}><option value={parent.id}>{parent.name}</option>{galleryCategories.filter(sub => sub.parent_id === parent.id).map(sub => (<option key={sub.id} value={sub.id}>&nbsp;\u221f {sub.name}</option>))}</React.Fragment>))}
                              </select>
                              <button onClick={async (ev) => { ev.stopPropagation(); await updateGalleryImage(img.id, { subcategory_id: editingImageCatId || null }); setEditingImageId(null); const imgs = await getGalleryImages(); setGalleryImages(imgs || []); setSuccessMsg("Catégorie mise à jour !"); }} style={{ background: "var(--primary-gold)", border: "none", borderRadius: "4px", color: "#000", cursor: "pointer", padding: "4px 8px", fontSize: "0.75rem", fontWeight: 700 }}>OK</button>
                              <button onClick={ev => { ev.stopPropagation(); setEditingImageId(null); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "4px", color: "var(--text-secondary)", cursor: "pointer", padding: "4px 8px", fontSize: "0.75rem" }}>\u2715</button>
                            </div>
                          )}`;
c = c.replace(oldTitle, newTitle);
console.log("G edit inline:", c.includes("editingImageId === img.id"));

// H: Add Edit button next to Delete button in image cards
c = c.replace(
  `<button\n                          onClick={() => handleDeleteGalleryImage(img.id, img.image_url || img.image)}\n                          style={{ background: "none", border: "none", color: "#FF4500", cursor: "pointer", flexShrink: 0, marginLeft: "8px" }}\n                          title="Supprimer"\n                        >\n                          <Trash2 size={16} />\n                        </button>`,
  `<button onClick={ev => { ev.stopPropagation(); setEditingImageId(img.id === editingImageId ? null : img.id); setEditingImageCatId(img.subcategory_id || ""); }} style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer", flexShrink: 0 }} title="Modifier catégorie"><Edit size={14} /></button>\n                        <button onClick={ev => { ev.stopPropagation(); handleDeleteGalleryImage(img.id, img.image_url || img.image); }} style={{ background: "none", border: "none", color: "#FF4500", cursor: "pointer", flexShrink: 0 }} title="Supprimer"><Trash2 size={16} /></button>`
);
console.log("H edit btn:", c.includes("setEditingImageId(img.id === editingImageId"));

// I: Add select checkbox overlay on image card
c = c.replace(
  `<div key={img.id} className="glass-panel" style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", position: "relative" }}>`,
  `<div key={img.id} className="glass-panel" onClick={() => { if (gallerySelectMode) setSelectedGalleryIds(prev => prev.includes(img.id) ? prev.filter(i => i !== img.id) : [...prev, img.id]); }} style={{ padding: 0, overflow: "hidden", border: gallerySelectMode && selectedGalleryIds.includes(img.id) ? "2px solid var(--primary-gold)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", position: "relative", cursor: gallerySelectMode ? "pointer" : "default" }}>\n                    {gallerySelectMode && (<div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, width: 22, height: 22, borderRadius: 4, background: selectedGalleryIds.includes(img.id) ? "var(--primary-gold)" : "rgba(0,0,0,0.6)", border: "2px solid var(--primary-gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>{selectedGalleryIds.includes(img.id) && <Check size={12} color="#000" />}</div>)}`
);
console.log("I checkbox:", c.includes("gallerySelectMode && selectedGalleryIds.includes"));

fs.writeFileSync("src/components/Admin.jsx", c, "utf8");
console.log("\nAll patches done. Lines:", c.split("\n").length);
