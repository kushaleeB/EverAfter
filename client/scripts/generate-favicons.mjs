/**
 * Generates raster favicon assets from public/favicon.svg
 * Run: node scripts/generate-favicons.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
const svg = readFileSync(resolve(publicDir, 'favicon.svg'));

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

for (const { name, size } of sizes) {
  const buffer = await sharp(svg, { density: Math.max(72, Math.round((size / 512) * 600)) })
    .resize(size, size)
    .png()
    .toBuffer();
  writeFileSync(resolve(publicDir, name), buffer);
  console.log(`Wrote ${name}`);
}

const png32 = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
const ico = await toIco([png32]);
writeFileSync(resolve(publicDir, 'favicon.ico'), ico);
console.log('Wrote favicon.ico');
