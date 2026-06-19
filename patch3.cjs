const fs = require("fs");
let c = fs.readFileSync("src/components/Admin.jsx", "utf8");
console.log("Before:", c.split("\n").length, "lines");

// Fix 4: select btn - find and replace by position
const idx4 = c.indexOf("setShowGalleryForm(true)");
const btnStart = c.lastIndexOf("<button", idx4);
const btnEnd = c.indexOf("</div>", idx4) + 6;
const newBtns = `<div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => { setGallerySelectMode(m => !m); setSelectedGalleryIds([]); }} style={{ padding: "9px 14px", background: gallerySelectMode ? "rgba(212,175,55,0.15)" : "transparent", border: "1px solid rgba(212,175,55,0.45)", borderRadius: "8px", color: "var(--primary-gold)", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>{gallerySelectMode ? "\u2715 Annuler" : "\u2611 S\u00e9lectionner"}</button>
                <button onClick={() => setShowGalleryForm(true)} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}><Plus size={16} /> Ajouter une image</button>
              </div>`;
c = c.substring(0, btnStart) + newBtns + c.substring(btnEnd);
console.log("4-select:", c.includes("\u2611 S\u00e9lectionner"));

// Fix 8: Edit btn before delete - find delete button by position
const idx8 = c.indexOf("handleDeleteGalleryImage(img.id, img.image_url || img.image)");
const delStart = c.lastIndexOf("<button", idx8);
const delEnd = c.indexOf("</button>", idx8) + 9;
const newDel = `<button onClick={ev => { ev.stopPropagation(); setEditingImageId(editingImageId === img.id ? null : img.id); setEditingImageCatId(img.subcategory_id || ""); }} style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer", flexShrink: 0 }} title="Modifier cat\u00e9gorie"><Edit size={14} /></button>
                        <button onClick={ev => { ev.stopPropagation(); handleDeleteGalleryImage(img.id, img.image_url || img.image); }} style={{ background: "none", border: "none", color: "#FF4500", cursor: "pointer", flexShrink: 0 }} title="Supprimer"><Trash2 size={16} /></button>`;
c = c.substring(0, delStart) + newDel + c.substring(delEnd);
console.log("8-edit+del:", c.includes("Modifier cat\u00e9gorie"));

fs.writeFileSync("src/components/Admin.jsx", c, "utf8");
console.log("Done. Lines:", c.split("\n").length);

