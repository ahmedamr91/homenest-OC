// Processes the official brand image into all site assets.
//   node scripts/process-brand.mjs
import sharp from "sharp";

const SRC = "brand/logo-original.png";
const NEAR_WHITE = 235;

async function makeTransparent(inputBuf) {
  const { data, info } = await sharp(inputBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += info.channels) {
    const r = out[i], g = out[i + 1], b = out[i + 2];
    const brightness = (r + g + b) / 3;
    if (brightness > NEAR_WHITE) {
      out[i + 3] = 0; // white → fully transparent
    } else if (brightness > 180 && info.channels === 4) {
      // soften anti-aliased edges
      out[i + 3] = Math.round((255 - brightness) * (255 / 75));
    }
  }
  return { data: out, info };
}

function recolorToCream(rawData) {
  const out = Buffer.from(rawData);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] > 0) {
      out[i] = 250;   // #FAF6F0 cream
      out[i + 1] = 246;
      out[i + 2] = 240;
    }
  }
  return out;
}

// 1) Trim surrounding white space
const trimmed = await sharp(SRC).trim().toBuffer();

// 2) Transparent master (black artwork, alpha background)
const { data, info } = await makeTransparent(trimmed);
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile("public/brand-logo.png");
console.log(`✓ public/brand-logo.png (${info.width}×${info.height}, transparent)`);

// 3) Cream version for dark sidebar
const cream = recolorToCream(data);
await sharp(cream, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile("public/brand-logo-cream.png");
console.log("✓ public/brand-logo-cream.png");

// 4) Favicon (256px transparent)
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize(256, null, { fit: "inside" })
  .png()
  .toFile("src/app/icon.png");
console.log("✓ src/app/icon.png (favicon)");

// 5) Large white-background version for downloads
await sharp(trimmed)
  .resize(1200, null, { fit: "inside" })
  .flatten({ background: "#ffffff" })
  .png()
  .toFile("public/logo.png");
console.log("✓ public/logo.png (1200px, white bg)");
