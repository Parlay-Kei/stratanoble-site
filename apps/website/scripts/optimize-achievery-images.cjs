const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ACHIEVERY_IMAGES_DIR = path.join(__dirname, '../public/images/achievery');

async function optimizeImages() {
  console.log('🎨 Optimizing ACHIEVERY image assets...');

  if (!fs.existsSync(ACHIEVERY_IMAGES_DIR)) {
    console.error('❌ ACHIEVERY images directory not found:', ACHIEVERY_IMAGES_DIR);
    return;
  }

  const imageFiles = fs.readdirSync(ACHIEVERY_IMAGES_DIR).filter(file =>
    file.endsWith('.svg') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
  );

  console.log(`📁 Found ${imageFiles.length} image files to optimize`);

  for (const file of imageFiles) {
    const inputPath = path.join(ACHIEVERY_IMAGES_DIR, file);
    const fileName = path.parse(file).name;
    const webpPath = path.join(ACHIEVERY_IMAGES_DIR, `${fileName}.webp`);

    try {
      // For SVG files, we'll convert to PNG first, then WebP
      if (file.endsWith('.svg')) {
        const pngPath = path.join(ACHIEVERY_IMAGES_DIR, `${fileName}.png`);

        // Convert SVG to PNG (1200px width for high quality)
        await sharp(inputPath)
          .resize(1200, null, {
            withoutEnlargement: true,
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png({ quality: 90, compressionLevel: 6 })
          .toFile(pngPath);

        // Convert PNG to WebP
        await sharp(pngPath)
          .webp({ quality: 85, effort: 6 })
          .toFile(webpPath);

        console.log(`✅ ${file} → ${fileName}.png + ${fileName}.webp`);
      } else {
        // For other image formats, convert directly to WebP
        await sharp(inputPath)
          .webp({ quality: 85, effort: 6 })
          .toFile(webpPath);

        console.log(`✅ ${file} → ${fileName}.webp`);
      }
    } catch (error) {
      console.error(`❌ Failed to optimize ${file}:`, error.message);
    }
  }

  console.log('🎉 Image optimization complete!');
  console.log('\n📊 Next.js will automatically serve WebP versions to supporting browsers.');
  console.log('💡 Use next/image component for automatic optimization and lazy loading.');
}

// Run optimization
optimizeImages().catch(console.error);