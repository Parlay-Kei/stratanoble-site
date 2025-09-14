#!/usr/bin/env node

/**
 * ACHIEVERY Preview Page Performance Testing Script
 * Tests loading performance, image optimization, and user experience metrics
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_URL = 'http://localhost:8080/achievery-preview';
const PERFORMANCE_TARGETS = {
  firstContentfulPaint: 1800, // 1.8s
  largestContentfulPaint: 2500, // 2.5s
  timeToInteractive: 3900, // 3.9s
  cumulativeLayoutShift: 0.1
};

async function testPerformance() {
  console.log('🚀 Testing ACHIEVERY Preview Page Performance...');
  console.log(`📍 Target URL: ${TEST_URL}`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Enable performance monitoring
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.includes('achievery') && url.includes('image')) {
        console.log(`📷 Loading image: ${url.split('/').pop()}`);
      }
      route.continue();
    });

    console.log('⏱️  Starting page load test...');

    // Navigate to page and measure load time
    const startTime = Date.now();
    await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    console.log(`✅ Page loaded in ${loadTime}ms`);

    // Collect Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Import web vitals
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/web-vitals@3';
        script.onload = () => {
          const results = {};

          webVitals.getFCP((metric) => { results.fcp = metric.value; });
          webVitals.getLCP((metric) => { results.lcp = metric.value; });
          webVitals.getTTFB((metric) => { results.ttfb = metric.value; });
          webVitals.getCLS((metric) => { results.cls = metric.value; });

          // Give metrics time to collect
          setTimeout(() => resolve(results), 2000);
        };
        document.head.appendChild(script);
      });
    });

    // Test image loading
    console.log('🖼️  Testing image optimization...');

    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map(img => ({
        src: img.src,
        loaded: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        loading: img.loading
      }));
    });

    // Test responsive behavior
    console.log('📱 Testing responsive behavior...');

    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1200, height: 800, name: 'Desktop' }
    ];

    const responsiveResults = {};
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      const layoutMetrics = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight
      }));

      responsiveResults[viewport.name] = layoutMetrics;
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}): ${layoutMetrics.scrollHeight}px height`);
    }

    // Generate performance report
    const report = {\n      timestamp: new Date().toISOString(),\n      url: TEST_URL,\n      loadTime,\n      webVitals: metrics,\n      images: {\n        total: imageMetrics.length,\n        loaded: imageMetrics.filter(img => img.loaded).length,\n        lazy: imageMetrics.filter(img => img.loading === 'lazy').length\n      },\n      responsive: responsiveResults,\n      performance: {\n        passed: {\n          loadTime: loadTime < 5000,\n          fcp: metrics.fcp < PERFORMANCE_TARGETS.firstContentfulPaint,\n          lcp: metrics.lcp < PERFORMANCE_TARGETS.largestContentfulPaint,\n          cls: metrics.cls < PERFORMANCE_TARGETS.cumulativeLayoutShift\n        }\n      }\n    };\n\n    console.log('\\n📊 Performance Report:');\n    console.log('========================');\n    console.log(`🕐 Load Time: ${loadTime}ms ${loadTime < 5000 ? '✅' : '❌'}`);\n    console.log(`🎨 First Contentful Paint: ${metrics.fcp?.toFixed(0)}ms ${(metrics.fcp < PERFORMANCE_TARGETS.firstContentfulPaint) ? '✅' : '❌'}`);\n    console.log(`🖼️  Largest Contentful Paint: ${metrics.lcp?.toFixed(0)}ms ${(metrics.lcp < PERFORMANCE_TARGETS.largestContentfulPaint) ? '✅' : '❌'}`);\n    console.log(`📐 Cumulative Layout Shift: ${metrics.cls?.toFixed(3)} ${(metrics.cls < PERFORMANCE_TARGETS.cumulativeLayoutShift) ? '✅' : '❌'}`);\n    console.log(`🖼️  Images: ${report.images.loaded}/${report.images.total} loaded, ${report.images.lazy} lazy`);\n    \n    // Save detailed report\n    const reportPath = path.join(__dirname, '../performance-report.json');\n    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));\n    console.log(`\\n💾 Detailed report saved to: ${reportPath}`);\n\n    console.log('\\n🎉 Performance testing complete!');\n    \n  } catch (error) {\n    console.error('❌ Performance test failed:', error);\n  } finally {\n    await browser.close();\n  }\n}\n\n// Run performance test\ntestPerformance().catch(console.error);