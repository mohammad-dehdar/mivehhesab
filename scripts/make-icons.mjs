// One-off: renders the app icon (a citrus slice on the brand blue) to the PNG
// sizes Android / iOS need. Run: node scripts/make-icons.mjs
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const BLUE = "#3D7BFF";

/** `inset` = fraction of the canvas kept clear around the slice (maskable needs ~20%). */
function svg({ size, inset, rounded }) {
  const c = size / 2;
  const r = (size / 2) * (1 - inset);
  const segments = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const x = c + Math.cos(a) * r * 0.78;
    const y = c + Math.sin(a) * r * 0.78;
    return `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="${BLUE}" stroke-width="${r * 0.07}" stroke-linecap="round"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${rounded ? size * 0.22 : 0}" fill="${BLUE}"/>
    <circle cx="${c}" cy="${c}" r="${r}" fill="#FFFFFF"/>
    <circle cx="${c}" cy="${c}" r="${r * 0.86}" fill="#FFB020"/>
    ${segments}
    <circle cx="${c}" cy="${c}" r="${r * 0.12}" fill="#FFFFFF"/>
  </svg>`;
}

const out = "public/icons";
mkdirSync(out, { recursive: true });

const jobs = [
  ["icon-192.png", 192, { inset: 0.18, rounded: true }],
  ["icon-512.png", 512, { inset: 0.18, rounded: true }],
  ["maskable-512.png", 512, { inset: 0.3, rounded: false }],
  ["apple-touch-icon.png", 180, { inset: 0.18, rounded: false }],
];

for (const [name, size, opts] of jobs) {
  await sharp(Buffer.from(svg({ size, ...opts })))
    .png()
    .toFile(`${out}/${name}`);
  console.log(`${out}/${name}`);
}
