import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const svgPath = path.resolve('../frontend/public/super-city-logo.svg');
const pngPath = path.resolve('./public/super-city-logo.png');

async function convert() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer)
      .resize({ width: 240 }) // scale down for email
      .png()
      .toFile(pngPath);
    console.log('Successfully converted SVG to PNG for email template!');
  } catch (err) {
    console.error('Error converting:', err);
  }
}
convert();
