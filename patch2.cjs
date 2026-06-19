const fs = require("fs");
const f = "src/components/Admin.jsx";
let c = fs.readFileSync(f, "utf8");
console.log("Before:", c.length);

// 4. Select mode button before gallery add button
const old4 = `              <button
                onClick={() => setShowGalleryForm(true)}
                className="btn-gold"
                style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}
              >
                <Plus size={16} /> Ajouter une image
              </button>
            </div>`;
const new4 = `              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => { setGallerySelectMode(m => !m); setSelectedGalleryIds([]); }} style={{ padding: "9px 14px", background: gallerySelectMode ? "rgba(212,175,55,0.15)" : "transparent", border: "1px solid rgba(212,175,55,0.45)", borderRadius: "8px", color: "var(--primary-gold)", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>{gallerySelectMode ? "\u2715 Annuler" : "\u2611 S\u00e9lectionner"}</button>
                <button onClick={() => setShowGalleryForm(true)} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}><Plus size={16} /> Ajouter une image</button>
              </div>
            </div>`;
if (c.includes('onClick={() => setShowGalleryForm(true)}')) {
  c = c.replace(old4, new4);
  console.log("4-select btn:", c.includes("\u2611"));
} else { console.log("4: not found"); }

// 5. Dynamic product categories
const old5 = `{["Soin", "Maquillage", "Parfum", "Cheveux", "Corps", "Accessoire"].map(c => <option key={c} value={c}>{c}</option>)}`;
const new5 = `{productCats.map(pcat => <option key={pcat} value={pcat}>{pcat}</option>)}`;
c = c.replace(old5, new5);
console.log("5-prod cats:", c.includes("productCats.map"));

// 6. Add batch select bar before gallery grid
const GRID_ANCHOR = 'display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))"';
const gridIdx = c.indexOf(GRID_ANCHOR);
if (gridIdx !== -1) {
  const divStart = c.lastIndexOf("<div", gridIdx);
  const batchBar = `{/* Batch move bar */}
              {gallerySelectMode && selectedGalleryIds.length > 0 && (
                <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--primary-gold)", fontWeight: 600 }}>{selectedGalleryIds.length} image(s) s\u00e9lectionn\u00e9e(s)</span>
                  <select value={moveToCatId} onChange={e => setMoveToCatId(e.target.value)} style={{ padding: "6px 10px", background: "#121212", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", fontSize: "0.8rem" }}>
                    <option value="">-- D\u00e9placer vers --</option>
                    {galleryCategories.filter(cat => !cat.parent_id).map(parent => (<React.Fragment key={parent.id}><option value={parent.id}>{parent.name}</option>{galleryCategories.filter(sub => sub.parent_id === parent.id).map(sub => (<option key={sub.id} value={sub.id}>&nbsp;\u221f {sub.name}</option>))}</React.Fragment>))}
                  </select>
                  <button onClick={async () => { if (!moveToCatId) return; for (const id of selectedGalleryIds) { await updateGalleryImage(id, { subcategory_id: moveToCatId }); } setSelectedGalleryIds([]); setGallerySelectMode(false); setMoveToCatId(""); const imgs = await getGalleryImages(); setGalleryImages(imgs || []); }} className="btn-gold" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>\u2713 Appliquer</button>
                  <button onClick={() => { setSelectedGalleryIds([]); setGallerySelectMode(false); }} style={{ padding: "6px 12px", background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "var(--text-secondary)", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}>Annuler</button>
                </div>
              )}
              `;
  c = c.substring(0, divStart) + batchBar + c.substring(divStart);
  console.log("6-batch bar: added");
} else { console.log("6: grid anchor not found"); }

// 7. Add checkbox overlay + edit button to each image card
const OLD_CARD_START = `<div key={img.id} className="glass-panel" style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", position: "relative" }}>`;
const NEW_CARD_START = `<div key={img.id} className="glass-panel" onClick={() => { if (gallerySelectMode) setSelectedGalleryIds(prev => prev.includes(img.id) ? prev.filter(i => i !== img.id) : [...prev, img.id]); }} style={{ padding: 0, overflow: "hidden", border: gallerySelectMode && selectedGalleryIds.includes(img.id) ? "2px solid var(--primary-gold)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", position: "relative", cursor: gallerySelectMode ? "pointer" : "default" }}>
                    {gallerySelectMode && (<div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, width: 22, height: 22, borderRadius: 4, background: selectedGalleryIds.includes(img.id) ? "var(--primary-gold)" : "rgba(0,0,0,0.6)", border: "2px solid var(--primary-gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>{selectedGalleryIds.includes(img.id) && <Check size={12} color="#000" />}</div>)}`;
c = c.replace(OLD_CARD_START, NEW_CARD_START);
console.log("7-checkbox:", c.includes("gallerySelectMode && selectedGalleryIds.includes(img.id)"));

// 8. Add Edit button + show subcategory name on card
const OLD_DELETE_BTN = `<button
                          onClick={() => handleDeleteGalleryImage(img.id, img.image_url || img.image)}
                          style={{ background: "none", border: "none", color: "#FF4500", cursor: "pointer", flexShrink: 0, marginLeft: "8px" }}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>`;
const NEW_DELETE_BTN = `<button onClick={ev => { ev.stopPropagation(); setEditingImageId(editingImageId === img.id ? null : img.id); setEditingImageCatId(img.subcategory_id || ""); }} style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer", flexShrink: 0 }} title="Changer cat\u00e9gorie"><Edit size={14} /></button>
                        <button onClick={ev => { ev.stopPropagation(); handleDeleteGalleryImage(img.id, img.image_url || img.image); }} style={{ background: "none", border: "none", color: "#FF4500", cursor: "pointer", flexShrink: 0 }} title="Supprimer"><Trash2 size={16} /></button>`;
c = c.replace(OLD_DELETE_BTN, NEW_DELETE_BTN);
console.log("8-edit btn:", c.includes("Changer cat"));

// 9. Show subcategory label + inline edit form
const OLD_CAT_SPAN = `<span style={{ fontSize: "0.7rem", color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{img.category}</span>`;
const NEW_CAT_SPAN = `<span style={{ fontSize: "0.7rem", color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {img.subcategory_id ? ((galleryCategories.find(cat => cat.id === img.subcategory_id) || {}).name || img.category) : img.category}
                          </span>
                          {editingImageId === img.id && (
                            <div style={{ marginTop: "8px", display: "flex", gap: "5px" }} onClick={e => e.stopPropagation()}>
                              <select value={editingImageCatId} onChange={e => setEditingImageCatId(e.target.value)} style={{ flex: 1, padding: "4px 6px", background: "#121212", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "4px", fontSize: "0.73rem" }}>
                                <option value="">-- Aucune --</option>
                                {galleryCategories.filter(cat => !cat.parent_id).map(parent => (<React.Fragment key={parent.id}><option value={parent.id}>{parent.name}</option>{galleryCategories.filter(sub => sub.parent_id === parent.id).map(sub => (<option key={sub.id} value={sub.id}>&nbsp;\u221f {sub.name}</option>))}</React.Fragment>))}
                              </select>
                              <button onClick={async () => { await updateGalleryImage(img.id, { subcategory_id: editingImageCatId || null }); setEditingImageId(null); const imgs = await getGalleryImages(); setGalleryImages(imgs || []); }} style={{ background: "var(--primary-gold)", border: "none", borderRadius: "4px", color: "#000", cursor: "pointer", padding: "4px 8px", fontSize: "0.73rem", fontWeight: 700 }}>OK</button>
                              <button onClick={() => setEditingImageId(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "4px", color: "var(--text-secondary)", cursor: "pointer", padding: "4px 7px", fontSize: "0.73rem" }}>\u2715</button>
                            </div>
                          )}`;
c = c.replace(OLD_CAT_SPAN, NEW_CAT_SPAN);
console.log("9-inline edit:", c.includes("editingImageId === img.id"));

fs.writeFileSync(f, c, "utf8");
console.log("\nDone. Size:", c.length, "Lines:", c.split("\n").length);
