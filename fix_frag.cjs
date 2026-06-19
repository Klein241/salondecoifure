const fs = require("fs");
let c = fs.readFileSync("src/components/Admin.jsx", "utf8");

// Exact pattern from inspection (CRLF before batch bar, LF inside)
const OLD = ") : (\r\n              {/* Batch move bar */}\n              {gallerySelectMode";
const NEW = ") : (\r\n              <>\r\n              {/* Batch move bar */}\n              {gallerySelectMode";
c = c.replace(OLD, NEW);
console.log("Open fragment:", c.includes("<>\r\n              {/* Batch move bar"));

// Find the end of the gallery grid to close the fragment
// Look for the pattern after the grid closing div
const GRID_END_MARK = "</div>\r\n            )}\r\n\r\n        {/* TAB 6";
if (c.includes(GRID_END_MARK)) {
  c = c.replace(GRID_END_MARK, "</div>\r\n              </>\r\n            )}\r\n\r\n        {/* TAB 6");
  console.log("Close fragment: true");
} else {
  // Try alternative - find after gallery images .map closing
  const idx = c.indexOf("galleryImages.map");
  const afterGrid = c.indexOf("</div>\r\n            )}", idx);
  if (afterGrid !== -1) {
    c = c.substring(0, afterGrid + 6) + "\r\n              </>" + c.substring(afterGrid + 6);
    console.log("Close fragment (alt): inserted at", afterGrid);
  } else {
    console.log("Close fragment: PATTERN NOT FOUND");
    // Show context
    const i2 = c.indexOf("TAB 6");
    console.log("TAB 6 context:", JSON.stringify(c.substring(i2-80, i2+20)));
  }
}

fs.writeFileSync("src/components/Admin.jsx", c, "utf8");
console.log("Done. Lines:", c.split("\n").length);

