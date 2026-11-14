import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate SVG Icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="tomato" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="50%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#e11d48"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#f43f5e" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background rounded rectangle for maskable icon -->
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>

  <!-- Tomato Body with Glow -->
  <g filter="url(#shadow)">
    <!-- Main Tomato Body -->
    <path d="M256 160 C170 160 110 220 110 310 C110 400 180 440 256 440 C332 440 402 400 402 310 C402 220 342 160 256 160 Z" fill="url(#tomato)"/>
    <!-- Subtle 3D Highlight -->
    <path d="M256 180 C200 180 150 225 145 285 C140 230 190 190 256 185 Z" fill="#ffffff" opacity="0.25"/>
  </g>

  <!-- Green Stem & Leaves -->
  <!-- Stem -->
  <path d="M256 165 C256 130 262 105 280 90 C265 95 252 115 248 160 Z" fill="url(#leaf)"/>
  <!-- Left Leaf -->
  <path d="M256 160 C215 130 160 135 145 155 C175 165 220 160 256 160 Z" fill="url(#leaf)"/>
  <!-- Right Leaf -->
  <path d="M256 160 C297 130 352 135 367 155 C337 165 292 160 256 160 Z" fill="url(#leaf)"/>
  <!-- Center Leaf -->
  <path d="M256 160 C240 120 256 85 270 80 C270 115 265 145 256 160 Z" fill="url(#leaf)"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon, 'utf8');

// 2. Pure Node.js PNG Generator
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  let c = 0 ^ (-1);
  for (let i = 0; i < body.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ body[i]) & 0xFF];
  }
  crc.writeUInt32BE((c ^ (-1)) >>> 0);
  return Buffer.concat([len, body, crc]);
}

function drawTomatoPng(size) {
  const width = size;
  const height = size;
  const buffer = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = size / 2;
  const cy = size / 2 + size * 0.05;
  const r = size * 0.35;
  const cornerRadius = size * 0.22;

  for (let y = 0; y < height; y++) {
    buffer[offset++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      // Rounded background mask
      let insideBg = true;
      const dx = Math.abs(x - cx) - (cx - cornerRadius);
      const dy = Math.abs(y - cx) - (cx - cornerRadius);
      if (dx > 0 && dy > 0) {
        if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
          insideBg = false;
        }
      }

      if (!insideBg) {
        // Transparent
        buffer[offset++] = 0;
        buffer[offset++] = 0;
        buffer[offset++] = 0;
        buffer[offset++] = 0;
        continue;
      }

      // Default dark slate background
      let pr = 15;
      let pg = 15;
      let pb = 18;
      let pa = 255;

      // Stem / Leaves check
      const lx = x - cx;
      const ly = y - (cy - r * 0.85);

      // Simple leafy cap
      if (ly < 0 && ly > -size * 0.25 && Math.abs(lx) < size * 0.22) {
        const leafDist = (lx * lx) / (size * size * 0.035) + (ly * ly) / (size * size * 0.015);
        if (leafDist < 1.0) {
          pr = 16;
          pg = 185;
          pb = 129; // Emerald green leaf
        }
      }

      // Tomato body: slightly flattened ellipse
      const tdx = (x - cx) / (r * 1.05);
      const tdy = (y - cy) / (r * 0.95);
      const distSq = tdx * tdx + tdy * tdy;

      if (distSq <= 1.0) {
        // Rose/Red gradient
        const grad = (y - (cy - r)) / (r * 2);
        pr = Math.floor(251 - grad * 30);
        pg = Math.floor(113 - grad * 80);
        pb = Math.floor(133 - grad * 60);

        // Subtle specular highlight on top left
        const hx = (x - (cx - r * 0.35)) / (r * 0.4);
        const hy = (y - (cy - r * 0.35)) / (r * 0.3);
        if (hx * hx + hy * hy < 0.8) {
          pr = Math.min(255, pr + 45);
          pg = Math.min(255, pg + 45);
          pb = Math.min(255, pb + 45);
        }
      }

      buffer[offset++] = pr;
      buffer[offset++] = pg;
      buffer[offset++] = pb;
      buffer[offset++] = pa;
    }
  }

  const compressed = zlib.deflateSync(buffer, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Generate PNG icons
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), drawTomatoPng(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), drawTomatoPng(512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), drawTomatoPng(180));

console.log('Successfully generated PWA icons in public/: icon.svg, icon-192.png, icon-512.png, apple-touch-icon.png');
