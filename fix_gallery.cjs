const fs = require("fs");
let c = fs.readFileSync("src/components/Admin.jsx", "utf8");

// Fix: the ternary ) : ( needs a fragment wrapper around batch bar + grid
// Find the exact ternary pattern before the batch bar
const TERNARY = ") : (\n              {/* Batch move bar */}";
const TERNARY_FIXED = ") : (\n              <>\n              {/* Batch move bar */}";
c = c.replace(TERNARY, TERNARY_FIXED);
console.log("Fragment open:", c.includes("<>\n              {/* Batch move bar */}"));

// Now find the closing div of the grid and add </> before )}
// The grid ends with:  </div>\n            )}\n
// We need:             </div>\n              </>\n            )}\n
// Find the gallery grid closing - it ends after the galleryImages.map section
const GRID_CLOSE = "          )}\n\n        {/* TAB 6:";
const GRID_CLOSE_FIXED = "          </>\n          )}\n\n        {/* TAB 6:";
c = c.replace(GRID_CLOSE, GRID_CLOSE_FIXED);
console.log("Fragment close:", c.includes("</>\n          )}\n\n        {/* TAB 6:"));

fs.writeFileSync("src/components/Admin.jsx", c, "utf8");
console.log("Done. Lines:", c.split("\n").length);

