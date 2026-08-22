// Renders the brand SVG into PNG files (run once, files are committed).
//   node scripts/generate-png.mjs
import sharp from "sharp";
import { readFileSync } from "fs";

const svg = readFileSync("scripts/logo-black.svg");

// Large white-background logo for general use (downloadable at /logo.png)
await sharp(svg, { density: 300 })
  .resize(1200)
  .flatten({ background: "#ffffff" })
  .png()
  .toFile("public/logo.png");
console.log("✓ public/logo.png (1200px, white bg)");

// Transparent favicon for the browser tab
await sharp(svg, { density: 300 })
  .resize(256)
  .png()
  .toFile("src/app/icon.png");
console.log("✓ src/app/icon.png (256px, transparent)");
