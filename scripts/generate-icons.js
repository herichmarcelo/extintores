const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG do ícone (extintor simplificado)
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#B11226" rx="80"/>
  <circle cx="256" cy="200" r="80" fill="#ffffff"/>
  <rect x="236" y="200" width="40" height="200" fill="#ffffff"/>
  <rect x="196" y="360" width="120" height="40" fill="#ffffff" rx="8"/>
  <path d="M256 120 L256 80" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
  <path d="M336 200 L376 200" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
  <path d="M176 200 L136 200" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
</svg>
`;

const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  try {
    for (const size of sizes) {
      const svgBuffer = Buffer.from(svgIcon);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, `icon-${size}x${size}.png`));
      
      console.log(`✅ Gerado icon-${size}x${size}.png`);
    }
    
    // Gerar também favicon.ico
    const svgBuffer = Buffer.from(svgIcon);
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    
    console.log('✅ Gerado favicon-32x32.png');
    console.log('✅ Gerado favicon-16x16.png');
    
    console.log('\n🎉 Ícones gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons();