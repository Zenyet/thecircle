// Icon generator script - creates ◉ style icons
// Run: node scripts/generate-icons.cjs

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const center = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.15;
  const strokeWidth = size * 0.08;

  // Clear with transparent background
  ctx.clearRect(0, 0, size, size);

  // Draw outer circle (ring)
  ctx.beginPath();
  ctx.arc(center, center, outerRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#3b82f6'; // blue-500
  ctx.lineWidth = strokeWidth;
  ctx.stroke();

  // Draw inner dot
  ctx.beginPath();
  ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#3b82f6'; // blue-500
  ctx.fill();

  return canvas.toBuffer('image/png');
}

// Generate icons
const assetsDir = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const sizes = [16, 48, 128];

sizes.forEach(size => {
  const buffer = generateIcon(size);
  fs.writeFileSync(path.join(assetsDir, `icon-${size}.png`), buffer);
});

console.log('Icons generated successfully!');
