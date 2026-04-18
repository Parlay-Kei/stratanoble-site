const sharp = require('sharp');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#2D6A4F" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="#0E1A2B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0E1A2B"/>
      <stop offset="100%" stop-color="#070F1A"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(600, 240) scale(1.1)">
    <circle cx="0" cy="0" r="80" fill="none" stroke="#6B7B8C" stroke-width="2" opacity="0.8"/>
    <circle cx="0" cy="0" r="68" fill="none" stroke="#B8D4C2" stroke-width="1.5" opacity="0.6"/>
    <rect x="-30" y="-15" width="60" height="8" rx="4" fill="#B8D4C2"/>
    <rect x="-35" y="-3" width="70" height="8" rx="4" fill="#5A9B6B"/>
    <rect x="-40" y="9" width="80" height="8" rx="4" fill="#2C3E50"/>
  </g>
  <text x="600" y="420" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="60" font-weight="700" fill="#FFFFFF">
    Strata Noble
  </text>
  <text x="600" y="475" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#B8C4D0">
    Better systems. Better business.
  </text>
  <text x="600" y="540" text-anchor="middle" font-family="'Courier New', monospace" font-size="16" fill="#5A9B6B" letter-spacing="4">
    REVENUE PIPELINE INFRASTRUCTURE
  </text>
</svg>`;

const outPath = path.resolve(__dirname, '..', 'public', 'img', 'og-image.png');

sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(outPath)
  .then(() => {
    console.log('Wrote', outPath);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
