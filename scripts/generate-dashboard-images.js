#!/usr/bin/env node

/**
 * ACHIEVERY Dashboard Image Generation Script
 *
 * Converts HTML dashboard mockups to high-quality web-ready images
 * Supports multiple formats, responsive viewports, and optimization
 *
 * Usage: node scripts/generate-dashboard-images.js
 */

const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  // Input HTML files
  htmlFiles: [
    { name: 'free', file: 'temp/achievery-free-dashboard.html', title: 'Free Dashboard' },
    { name: 'growth', file: 'temp/achievery-growth-dashboard.html', title: 'Growth Dashboard' },
    { name: 'partner', file: 'temp/achievery-partner-dashboard.html', title: 'Partner Dashboard' }
  ],

  // Output directory
  outputDir: 'apps/website/public/images/achievery',

  // Viewport configurations
  viewports: {
    desktop: { width: 1400, height: 900, deviceScaleFactor: 2 },
    tablet: { width: 768, height: 1024, deviceScaleFactor: 2 },
    mobile: { width: 375, height: 812, deviceScaleFactor: 3 }
  },

  // Image quality settings
  quality: {
    png: { compressionLevel: 6, quality: 95 },
    webp: { quality: 85, effort: 6 },
    jpg: { quality: 90, progressive: true }
  },

  // Animation delays
  delays: {
    pageLoad: 2000,
    animationSettle: 1500
  }
};

/**
 * Ensure output directory exists
 */
async function ensureOutputDir() {
  try {
    await fs.access(CONFIG.outputDir);
  } catch {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    console.log(`✓ Created output directory: ${CONFIG.outputDir}`);
  }
}

/**
 * Wait for animations to complete
 */
async function waitForAnimations(page) {
  // Wait for CSS animations and transitions
  await page.evaluate(() => {
    return new Promise(resolve => {
      let animationsRunning = 0;

      // Count running animations
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.animationName !== 'none' ||
            computedStyle.transitionProperty !== 'none') {
          animationsRunning++;
        }
      });

      // Wait a bit longer if animations are running
      setTimeout(resolve, animationsRunning > 0 ? 2000 : 500);
    });
  });
}

/**
 * Capture dashboard screenshot
 */
async function captureScreenshot(page, htmlFile, viewport, viewportName) {
  const filePath = path.resolve(htmlFile.file);
  const url = `file://${filePath}`;

  console.log(`📸 Capturing ${htmlFile.name} dashboard (${viewportName})`);

  // Set viewport
  await page.setViewport(viewport);

  // Navigate to page
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Wait for page load
  await page.waitForTimeout(CONFIG.delays.pageLoad);

  // Handle upgrade overlay for free dashboard
  if (htmlFile.name === 'free') {
    await page.evaluate(() => {
      const overlay = document.querySelector('.upgrade-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    });
  }

  // Wait for animations
  await waitForAnimations(page);
  await page.waitForTimeout(CONFIG.delays.animationSettle);

  // Take screenshot
  const screenshot = await page.screenshot({
    type: 'png',
    fullPage: true,
    captureBeyondViewport: false
  });

  return screenshot;
}

/**
 * Process and save images in multiple formats
 */
async function processAndSaveImages(screenshotBuffer, baseName, viewportName) {
  const baseFilename = `${baseName}-dashboard-${viewportName}`;

  // Create Sharp instance
  const image = sharp(screenshotBuffer);
  const metadata = await image.metadata();

  console.log(`  📐 Original: ${metadata.width}x${metadata.height}`);

  // Resize for optimal web dimensions
  let targetWidth = metadata.width;
  if (viewportName === 'desktop' && metadata.width > 1200) {
    targetWidth = 1200;
  } else if (viewportName === 'tablet' && metadata.width > 768) {
    targetWidth = 768;
  } else if (viewportName === 'mobile' && metadata.width > 375) {
    targetWidth = 375;
  }

  const resizedImage = targetWidth < metadata.width ?
    image.resize(targetWidth, null, { withoutEnlargement: true }) :
    image;

  // Save PNG (high quality)
  const pngPath = path.join(CONFIG.outputDir, `${baseFilename}.png`);
  await resizedImage
    .clone()
    .png(CONFIG.quality.png)
    .toFile(pngPath);
  console.log(`  ✓ PNG: ${pngPath}`);

  // Save WebP (optimized)
  const webpPath = path.join(CONFIG.outputDir, `${baseFilename}.webp`);
  await resizedImage
    .clone()
    .webp(CONFIG.quality.webp)
    .toFile(webpPath);
  console.log(`  ✓ WebP: ${webpPath}`);

  // Save JPG for fallback
  const jpgPath = path.join(CONFIG.outputDir, `${baseFilename}.jpg`);
  await resizedImage
    .clone()
    .jpeg(CONFIG.quality.jpg)
    .toFile(jpgPath);
  console.log(`  ✓ JPG: ${jpgPath}`);

  return {
    png: pngPath,
    webp: webpPath,
    jpg: jpgPath,
    dimensions: { width: targetWidth }
  };
}

/**
 * Create composite mobile + desktop demo image
 */
async function createMobileDesktopComposite(desktopImages, mobileImages) {
  console.log('🎨 Creating mobile+desktop composite images');

  for (const dashboardType of ['free', 'growth', 'partner']) {
    const desktopPath = desktopImages[dashboardType].png;
    const mobilePath = mobileImages[dashboardType].png;

    if (!desktopPath || !mobilePath) continue;

    try {
      // Load images
      const desktop = sharp(desktopPath);
      const mobile = sharp(mobilePath);

      const desktopMeta = await desktop.metadata();
      const mobileMeta = await mobile.metadata();

      // Resize mobile to fit nicely with desktop
      const mobileHeight = Math.min(mobileMeta.height, desktopMeta.height * 0.8);
      const mobileResized = mobile.resize(null, Math.floor(mobileHeight));
      const mobileResizedMeta = await mobileResized.metadata();

      // Create composite canvas
      const canvasWidth = desktopMeta.width + mobileResizedMeta.width + 60; // 60px gap
      const canvasHeight = Math.max(desktopMeta.height, mobileResizedMeta.height) + 40; // 40px padding

      // Create background
      const background = sharp({
        create: {
          width: canvasWidth,
          height: canvasHeight,
          channels: 4,
          background: { r: 0, g: 17, b: 34, alpha: 1 }
        }
      });

      // Compose images
      const composite = background.composite([
        {
          input: await desktop.toBuffer(),
          left: 20,
          top: Math.floor((canvasHeight - desktopMeta.height) / 2)
        },
        {
          input: await mobileResized.toBuffer(),
          left: desktopMeta.width + 40,
          top: Math.floor((canvasHeight - mobileResizedMeta.height) / 2)
        }
      ]);

      // Save composite
      const compositeName = `${dashboardType}-dashboard-responsive-demo`;
      const compositePngPath = path.join(CONFIG.outputDir, `${compositeName}.png`);
      const compositeWebpPath = path.join(CONFIG.outputDir, `${compositeName}.webp`);

      await composite.png(CONFIG.quality.png).toFile(compositePngPath);
      await composite.webp(CONFIG.quality.webp).toFile(compositeWebpPath);

      console.log(`  ✓ Composite: ${compositeName}`);

    } catch (error) {
      console.warn(`  ⚠️ Could not create composite for ${dashboardType}:`, error.message);
    }
  }
}

/**
 * Create sign-in interface mockup
 */
async function createSignInMockup(page) {
  console.log('🔐 Creating sign-in interface mockup');

  const signInHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ACHIEVERY - Sign In</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #001122 0%, #002244 50%, #003366 100%);
            min-height: 100vh;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .signin-container {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 48px;
            width: 100%;
            max-width: 450px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .logo {
            font-size: 32px;
            font-weight: 800;
            color: #50C878;
            text-align: center;
            margin-bottom: 12px;
        }

        .subtitle {
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
            font-size: 16px;
            margin-bottom: 40px;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            color: rgba(255, 255, 255, 0.9);
        }

        .form-input {
            width: 100%;
            padding: 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: white;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .form-input:focus {
            outline: none;
            border-color: #50C878;
            box-shadow: 0 0 0 3px rgba(80, 200, 120, 0.1);
            background: rgba(255, 255, 255, 0.15);
        }

        .form-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        .signin-button {
            width: 100%;
            background: linear-gradient(135deg, #50C878, #40B068);
            color: white;
            padding: 16px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 24px rgba(80, 200, 120, 0.3);
            margin-bottom: 24px;
        }

        .signin-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(80, 200, 120, 0.4);
        }

        .divider {
            text-align: center;
            margin: 32px 0;
            position: relative;
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
        }

        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
            z-index: 1;
        }

        .divider span {
            background: rgba(0, 17, 34, 0.9);
            padding: 0 16px;
            position: relative;
            z-index: 2;
        }

        .social-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .social-button {
            width: 100%;
            padding: 14px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        .social-button:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .footer-links {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-links a {
            color: #50C878;
            text-decoration: none;
            font-size: 14px;
            margin: 0 8px;
        }

        .footer-links a:hover {
            text-decoration: underline;
        }

        @media (max-width: 480px) {
            .signin-container {
                padding: 32px 24px;
            }
        }
    </style>
</head>
<body>
    <div class="signin-container">
        <div class="logo">ACHIEVERY</div>
        <div class="subtitle">Sign in to continue your journey</div>

        <form>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" placeholder="Enter your email address" value="alex@example.com">
            </div>

            <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" placeholder="Enter your password" value="••••••••">
            </div>

            <button type="submit" class="signin-button">Sign In to Dashboard</button>
        </form>

        <div class="divider">
            <span>or continue with</span>
        </div>

        <div class="social-buttons">
            <button class="social-button">
                <span>📧</span>
                Continue with Google
            </button>
            <button class="social-button">
                <span>💼</span>
                Continue with LinkedIn
            </button>
        </div>

        <div class="footer-links">
            <a href="#">Forgot Password?</a>
            <span style="color: rgba(255,255,255,0.3);">·</span>
            <a href="#">Create Account</a>
            <span style="color: rgba(255,255,255,0.3);">·</span>
            <a href="#">Privacy Policy</a>
        </div>
    </div>
</body>
</html>`;

  // Create temporary sign-in HTML file
  const tempSignInPath = path.resolve('temp/achievery-signin.html');
  await fs.writeFile(tempSignInPath, signInHtml);

  // Capture sign-in screenshots
  for (const [viewportName, viewport] of Object.entries(CONFIG.viewports)) {
    await page.setViewport(viewport);
    await page.goto(`file://${tempSignInPath}`, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1000);

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true
    });

    await processAndSaveImages(screenshot, 'signin', viewportName);
  }

  // Clean up temp file
  try {
    await fs.unlink(tempSignInPath);
  } catch (error) {
    console.warn('Could not remove temp sign-in file:', error.message);
  }
}

/**
 * Generate manifest file with image metadata
 */
async function generateManifest(allImages) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    description: 'ACHIEVERY Dashboard Screenshots - Web Optimized',
    dashboards: {},
    usage: {
      desktop: 'Use for large screens and marketing pages',
      tablet: 'Use for medium screens and responsive layouts',
      mobile: 'Use for mobile devices and app previews',
      responsiveDemo: 'Use to showcase cross-device compatibility'
    },
    formats: {
      png: 'High quality, supports transparency',
      webp: 'Modern format, smaller file size',
      jpg: 'Universal fallback format'
    }
  };

  // Add image metadata
  for (const [dashboardType, images] of Object.entries(allImages)) {
    if (!images) continue;

    manifest.dashboards[dashboardType] = {};

    for (const [viewportName, imageData] of Object.entries(images)) {
      if (imageData && imageData.dimensions) {
        manifest.dashboards[dashboardType][viewportName] = {
          width: imageData.dimensions.width,
          formats: {
            png: path.relative(CONFIG.outputDir, imageData.png),
            webp: path.relative(CONFIG.outputDir, imageData.webp),
            jpg: path.relative(CONFIG.outputDir, imageData.jpg)
          }
        };
      }
    }
  }

  const manifestPath = path.join(CONFIG.outputDir, 'dashboard-images-manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📋 Generated manifest: ${manifestPath}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting ACHIEVERY Dashboard Image Generation');
  console.log(`📁 Output directory: ${CONFIG.outputDir}`);

  try {
    // Setup
    await ensureOutputDir();

    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // Store all generated images for manifest
    const allImages = {
      desktop: {},
      tablet: {},
      mobile: {}
    };

    // Generate dashboard screenshots
    for (const htmlFile of CONFIG.htmlFiles) {
      console.log(`\n🎯 Processing ${htmlFile.title}`);

      for (const [viewportName, viewport] of Object.entries(CONFIG.viewports)) {
        const screenshot = await captureScreenshot(page, htmlFile, viewport, viewportName);
        const imageData = await processAndSaveImages(screenshot, htmlFile.name, viewportName);

        if (!allImages[viewportName]) allImages[viewportName] = {};
        allImages[viewportName][htmlFile.name] = imageData;
      }
    }

    // Generate sign-in mockup
    console.log('\n🔐 Creating sign-in interface');
    await createSignInMockup(page);

    // Create responsive demos
    console.log('\n🎨 Creating responsive demo composites');
    await createMobileDesktopComposite(allImages.desktop, allImages.mobile);

    // Generate manifest
    await generateManifest(allImages);

    // Cleanup
    await browser.close();

    console.log('\n✅ Dashboard image generation complete!');
    console.log(`📊 Generated images in: ${CONFIG.outputDir}`);
    console.log('📋 Check dashboard-images-manifest.json for usage details');

  } catch (error) {
    console.error('❌ Error generating dashboard images:', error);
    process.exit(1);
  }
}

// Auto-install dependencies if needed
async function checkDependencies() {
  const requiredPackages = ['puppeteer', 'sharp'];
  const missing = [];

  for (const pkg of requiredPackages) {
    try {
      require.resolve(pkg);
    } catch {
      missing.push(pkg);
    }
  }

  if (missing.length > 0) {
    console.log(`📦 Installing missing dependencies: ${missing.join(', ')}`);
    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
      const install = spawn('npm', ['install', ...missing], { stdio: 'inherit' });
      install.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`npm install failed with code ${code}`));
      });
    });
  }
}

// Execute if run directly
if (require.main === module) {
  checkDependencies()
    .then(() => main())
    .catch(console.error);
}

module.exports = { main, CONFIG };