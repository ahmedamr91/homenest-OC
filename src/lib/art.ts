// Generates elegant SVG product art from the product's color variants,
// so every product looks designed even without photography.

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function productArt(
  hexes: string[],
  seed = 0,
  label?: string
): string {
  const c1 = hexes[0] || "#D6C3A5";
  const c2 = hexes[1] || shade(c1, -30);
  const c3 = shade(hexes[2] || c2, -50);
  const bgA = "#F5EFE6";
  const bgB = "#EDE3D4";
  const gid = `g${seed}${Math.abs(c1.charCodeAt(1))}`;

  // deterministic pseudo-random from seed
  const rnd = (i: number) => {
    const x = Math.sin(seed * 99.7 + i * 37.3) * 10000;
    return x - Math.floor(x);
  };

  const blobs = Array.from({ length: 3 }, (_, i) => {
    const cx = 80 + rnd(i) * 240;
    const cy = 90 + rnd(i + 10) * 220;
    const r = 40 + rnd(i + 20) * 90;
    const fill = [c1, c2, c3][i % 3];
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="0.55"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 400 400">
<defs>
<linearGradient id="${gid}bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${bgA}"/><stop offset="100%" stop-color="${bgB}"/>
</linearGradient>
<linearGradient id="${gid}v" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="${shade(c1, 25)}"/><stop offset="100%" stop-color="${c2}"/>
</linearGradient>
</defs>
<rect width="400" height="400" fill="url(#${gid}bg)"/>
<g opacity="0.35">${blobs}</g>
<g filter="none">
<path d="M170 150 h60 l14 60 a44 44 0 0 1 -88 0 z" fill="url(#${gid}v)" stroke="${c3}" stroke-width="3"/>
<path d="M186 118 a14 12 0 0 1 28 0 v34 h-28 z" fill="${c2}" stroke="${c3}" stroke-width="3"/>
<path d="M158 262 h84" stroke="${c3}" stroke-width="4" stroke-linecap="round"/>
</g>
${
    label
      ? `<text x="200" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="17" fill="#57504a">${esc(
          label
        )}</text>`
      : ""
  }
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
