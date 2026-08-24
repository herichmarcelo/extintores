const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Usar o icon.svg existente no public
const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
const svgIcon = fs.readFileSync(svgPath, 'utf-8');

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