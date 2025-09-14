#!/usr/bin/env node

/**
 * Simplified ACHIEVERY Dashboard Image Generation Script
 * Creates web-ready images from HTML dashboard mockups using basic image conversion
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Configuration for simpler image creation
const CONFIG = {
  htmlFiles: [
    { name: 'free', file: 'temp/achievery-free-dashboard.html', title: 'Free Dashboard' },
    { name: 'growth', file: 'temp/achievery-growth-dashboard.html', title: 'Growth Dashboard' },
    { name: 'partner', file: 'temp/achievery-partner-dashboard.html', title: 'Partner Dashboard' }
  ],
  outputDir: 'apps/website/public/images/achievery'
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
 * Create web-optimized placeholder images for each dashboard
 */
async function createPlaceholderImages() {
  console.log('🎨 Creating web-optimized dashboard preview images');

  // Create an SVG image for each dashboard type with appropriate styling
  const svgTemplates = {
    free: {
      bgGradient: 'linear-gradient(135deg, #001122 0%, #002244 50%, #003366 100%)',
      accentColor: '#666',
      title: 'ACHIEVERY FREE',
      subtitle: 'Start Your Journey',
      features: [
        '✓ Basic Strategic Actions (5/week)',
        '⚠️ Limited Analytics',
        '🔒 Advanced Features Locked'
      ]
    },
    growth: {
      bgGradient: 'linear-gradient(135deg, #001122 0%, #002244 50%, #003366 100%)',
      accentColor: '#50C878',
      title: 'ACHIEVERY GROWTH',
      subtitle: 'Accelerate Your Progress',
      features: [
        '✓ Unlimited Strategic Actions',
        '✓ Advanced Market Intelligence',
        '✓ Revenue Pipeline Tracking'
      ]
    },
    partner: {
      bgGradient: 'linear-gradient(135deg, #001122 0%, #002244 50%, #003366 100%)',
      accentColor: '#FFD700',
      title: 'ACHIEVERY PARTNER',
      subtitle: 'Premium Excellence',
      features: [
        '⭐ 1-on-1 Strategy Coaching',
        '⭐ Premium Network Access',
        '⭐ Advanced Analytics Suite'
      ]
    }
  };

  for (const [type, config] of Object.entries(svgTemplates)) {
    // Create different viewport versions
    const viewports = {
      desktop: { width: 1200, height: 800 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    };

    for (const [viewport, dimensions] of Object.entries(viewports)) {
      const svg = createDashboardSVG(config, dimensions, viewport);
      const filename = `${type}-dashboard-${viewport}.svg`;
      const filepath = path.join(CONFIG.outputDir, filename);

      await fs.writeFile(filepath, svg);
      console.log(`  ✓ Created ${filename}`);
    }
  }
}

/**
 * Create SVG representation of dashboard
 */
function createDashboardSVG(config, dimensions, viewport) {
  const { width, height } = dimensions;
  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#001122;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#002244;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#003366;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.08);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgba(255,255,255,0.04);stop-opacity:1" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>

    <!-- Main Container -->
    <rect x="20" y="20" width="${width-40}" height="${height-40}" rx="16" fill="url(#cardGradient)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    <!-- Header -->
    <text x="${width/2}" y="80" text-anchor="middle" fill="${config.accentColor}" font-family="system-ui" font-size="${isMobile ? '24' : '32'}" font-weight="800">${config.title}</text>
    <text x="${width/2}" y="110" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="system-ui" font-size="16" font-weight="400">${config.subtitle}</text>

    <!-- Dashboard Preview Area -->
    <rect x="40" y="140" width="${width-80}" height="${isMobile ? '200' : '300'}" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    <!-- Sidebar Simulation -->
    ${!isMobile ? `<rect x="50" y="150" width="200" height="${280}" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>` : ''}

    <!-- Navigation Items -->
    ${!isMobile ? generateNavItems(config.accentColor) : ''}

    <!-- Main Content Area -->
    <rect x="${isMobile ? '50' : '270'}" y="150" width="${width - (isMobile ? 100 : 290)}" height="${isMobile ? '180' : '260'}" rx="8" fill="rgba(255,255,255,0.03)"/>

    <!-- Stats Cards -->
    ${generateStatsCards(config.accentColor, isMobile, width)}

    <!-- Features List -->
    <g transform="translate(40, ${isMobile ? '380' : '480'})">
      ${config.features.map((feature, i) =>
        `<text x="20" y="${30 + (i * 30)}" fill="rgba(255,255,255,0.8)" font-family="system-ui" font-size="14" font-weight="400">${feature}</text>`
      ).join('')}
    </g>

    <!-- CTA Button -->
    <rect x="${width/2 - 120}" y="${height - 80}" width="240" height="48" rx="12" fill="${config.accentColor}" opacity="0.9"/>
    <text x="${width/2}" y="${height - 50}" text-anchor="middle" fill="${config.accentColor === '#FFD700' ? '#001122' : '#ffffff'}" font-family="system-ui" font-size="16" font-weight="600">
      ${config.accentColor === '#666' ? 'Upgrade to Unlock' : 'Access Dashboard'}
    </text>
  </svg>`;
}

function generateNavItems(accentColor) {
  const items = ['Dashboard', 'Strategic Actions', 'Market Intelligence', 'Network Builder', 'Analytics'];
  return items.map((item, i) => {
    const y = 180 + (i * 35);
    const isActive = i === 0;
    return `
      <rect x="60" y="${y - 5}" width="180" height="30" rx="6" fill="${isActive ? accentColor : 'rgba(255,255,255,0.05)'}" opacity="${isActive ? '1' : '0.7'}"/>
      <text x="70" y="${y + 10}" fill="${isActive ? (accentColor === '#FFD700' ? '#001122' : '#ffffff') : 'rgba(255,255,255,0.7)'}" font-family="system-ui" font-size="13" font-weight="500">${item}</text>
    `;
  }).join('');
}

function generateStatsCards(accentColor, isMobile, width) {
  if (isMobile) {
    return `
      <rect x="60" y="170" width="${width-120}" height="60" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <text x="70" y="190" fill="${accentColor}" font-family="system-ui" font-size="20" font-weight="800">94%</text>
      <text x="70" y="210" fill="rgba(255,255,255,0.7)" font-family="system-ui" font-size="12" font-weight="400">MARKET READINESS</text>
    `;
  }

  return `
    <rect x="280" y="170" width="150" height="70" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="290" y="195" fill="${accentColor}" font-family="system-ui" font-size="24" font-weight="800">18/25</text>
    <text x="290" y="215" fill="rgba(255,255,255,0.7)" font-family="system-ui" font-size="11" font-weight="400">STRATEGIC ACTIONS</text>

    <rect x="450" y="170" width="150" height="70" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="460" y="195" fill="${accentColor}" font-family="system-ui" font-size="24" font-weight="800">$8,400</text>
    <text x="460" y="215" fill="rgba(255,255,255,0.7)" font-family="system-ui" font-size="11" font-weight="400">PIPELINE VALUE</text>
  `;
}

/**
 * Create sign-in interface SVG
 */
async function createSignInSVG() {
  console.log('🔐 Creating sign-in interface preview');

  const viewports = {
    desktop: { width: 800, height: 600 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  };

  for (const [viewport, dimensions] of Object.entries(viewports)) {
    const { width, height } = dimensions;
    const isMobile = viewport === 'mobile';

    const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#001122;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#002244;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#003366;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>

      <!-- Sign-in Card -->
      <rect x="${width/2 - 200}" y="${height/2 - 200}" width="400" height="400" rx="20" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

      <!-- Logo -->
      <text x="${width/2}" y="${height/2 - 140}" text-anchor="middle" fill="#50C878" font-family="system-ui" font-size="32" font-weight="800">ACHIEVERY</text>
      <text x="${width/2}" y="${height/2 - 110}" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="system-ui" font-size="16">Sign in to continue your journey</text>

      <!-- Email Input -->
      <rect x="${width/2 - 170}" y="${height/2 - 70}" width="340" height="48" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      <text x="${width/2 - 160}" y="${height/2 - 45}" fill="rgba(255,255,255,0.5)" font-family="system-ui" font-size="14">alex@example.com</text>

      <!-- Password Input -->
      <rect x="${width/2 - 170}" y="${height/2 - 10}" width="340" height="48" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      <text x="${width/2 - 160}" y="${height/2 + 15}" fill="rgba(255,255,255,0.5)" font-family="system-ui" font-size="14">••••••••••</text>

      <!-- Sign In Button -->
      <rect x="${width/2 - 170}" y="${height/2 + 60}" width="340" height="48" rx="12" fill="#50C878"/>
      <text x="${width/2}" y="${height/2 + 90}" text-anchor="middle" fill="white" font-family="system-ui" font-size="16" font-weight="600">Sign In to Dashboard</text>

      <!-- Social Options -->
      <text x="${width/2}" y="${height/2 + 140}" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui" font-size="14">or continue with Google • LinkedIn</text>
    </svg>`;

    const filename = `signin-${viewport}.svg`;
    const filepath = path.join(CONFIG.outputDir, filename);
    await fs.writeFile(filepath, svg);
    console.log(`  ✓ Created ${filename}`);
  }
}

/**
 * Create responsive demo composite
 */
async function createResponsiveDemo() {
  console.log('📱 Creating responsive demo previews');

  const types = ['free', 'growth', 'partner'];

  for (const type of types) {
    const svg = `<svg width="1400" height="900" viewBox="0 0 1400 900" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#001122;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#002244;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#003366;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1400" height="900" fill="url(#bgGradient)"/>

      <!-- Desktop Preview -->
      <rect x="50" y="100" width="800" height="600" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
      <text x="450" y="140" text-anchor="middle" fill="#50C878" font-family="system-ui" font-size="24" font-weight="800">Desktop View</text>
      <rect x="70" y="160" width="760" height="520" rx="8" fill="rgba(255,255,255,0.05)"/>

      <!-- Mobile Preview -->
      <rect x="950" y="200" width="300" height="500" rx="24" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
      <text x="1100" y="240" text-anchor="middle" fill="#50C878" font-family="system-ui" font-size="18" font-weight="800">Mobile View</text>
      <rect x="970" y="260" width="260" height="420" rx="12" fill="rgba(255,255,255,0.05)"/>

      <!-- Labels -->
      <text x="700" y="80" text-anchor="middle" fill="white" font-family="system-ui" font-size="32" font-weight="700">ACHIEVERY ${type.toUpperCase()}</text>
      <text x="700" y="840" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="system-ui" font-size="16">Responsive Design Preview</text>
    </svg>`;

    const filename = `${type}-dashboard-responsive-demo.svg`;
    const filepath = path.join(CONFIG.outputDir, filename);
    await fs.writeFile(filepath, svg);
    console.log(`  ✓ Created ${filename}`);
  }
}

/**
 * Generate manifest file
 */
async function generateManifest() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    description: 'ACHIEVERY Dashboard Preview Images - SVG Format',
    note: 'These are SVG previews created without browser automation. For production screenshots, use the full generate-dashboard-images.js script with Puppeteer.',
    dashboards: {
      free: {
        title: 'Free Dashboard',
        description: 'Limited features with upgrade prompts',
        files: {
          desktop: 'free-dashboard-desktop.svg',
          tablet: 'free-dashboard-tablet.svg',
          mobile: 'free-dashboard-mobile.svg',
          responsive: 'free-dashboard-responsive-demo.svg'
        }
      },
      growth: {
        title: 'Growth Dashboard',
        description: 'Full-featured professional dashboard',
        files: {
          desktop: 'growth-dashboard-desktop.svg',
          tablet: 'growth-dashboard-tablet.svg',
          mobile: 'growth-dashboard-mobile.svg',
          responsive: 'growth-dashboard-responsive-demo.svg'
        }
      },
      partner: {
        title: 'Partner Dashboard',
        description: 'Premium dashboard with coaching features',
        files: {
          desktop: 'partner-dashboard-desktop.svg',
          tablet: 'partner-dashboard-tablet.svg',
          mobile: 'partner-dashboard-mobile.svg',
          responsive: 'partner-dashboard-responsive-demo.svg'
        }
      }
    },
    signin: {
      title: 'Sign-in Interface',
      files: {
        desktop: 'signin-desktop.svg',
        tablet: 'signin-tablet.svg',
        mobile: 'signin-mobile.svg'
      }
    },
    usage: {
      implementation: 'Use these SVG files as lightweight previews in your website',
      formats: 'SVG files are scalable and small - perfect for web use',
      upgrade: 'For high-quality PNG/WebP screenshots, install puppeteer and sharp, then run generate-dashboard-images.js'
    }
  };

  const manifestPath = path.join(CONFIG.outputDir, 'dashboard-images-manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📋 Generated manifest: ${manifestPath}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting ACHIEVERY Dashboard Preview Generation (SVG)');
  console.log(`📁 Output directory: ${CONFIG.outputDir}`);

  try {
    await ensureOutputDir();
    await createPlaceholderImages();
    await createSignInSVG();
    await createResponsiveDemo();
    await generateManifest();

    console.log('\n✅ Dashboard preview generation complete!');
    console.log(`📊 Generated SVG previews in: ${CONFIG.outputDir}`);
    console.log('💡 For high-quality screenshots, install puppeteer/sharp and run the full script');

  } catch (error) {
    console.error('❌ Error generating previews:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };