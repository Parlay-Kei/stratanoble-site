#!/usr/bin/env tsx

/**
 * Generate Work Sample Graphics for LinkedIn Service Page
 * Creates branded PNG images using Playwright
 */

import { chromium } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';

const OUTPUT_DIR = './proof-packs/work-samples';

// Strata Noble brand colors
const BRAND = {
  primary: '#1a365d',      // Deep navy
  secondary: '#2c5282',    // Medium blue
  accent: '#38a169',       // Green
  light: '#e2e8f0',        // Light gray
  white: '#ffffff',
  text: '#1a202c'
};

async function generateImage(html: string, filename: string, width = 1200, height = 900): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width, height } });

  await page.setContent(html, { waitUntil: 'networkidle' });

  const outputPath = path.join(OUTPUT_DIR, filename);
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await page.screenshot({ path: outputPath, type: 'png' });

  await browser.close();
  console.log(`Created: ${outputPath}`);
  return outputPath;
}

// Work Sample 1: Pipeline Blueprint
const pipelineBlueprintHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%);
      color: ${BRAND.white};
      padding: 60px;
      min-height: 100vh;
    }
    .container { max-width: 1080px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 50px; }
    .logo { font-size: 14px; letter-spacing: 3px; opacity: 0.8; margin-bottom: 10px; }
    h1 { font-size: 42px; font-weight: 700; margin-bottom: 10px; }
    .subtitle { font-size: 18px; opacity: 0.9; }
    .pipeline { display: flex; justify-content: space-between; align-items: center; margin: 40px 0; }
    .stage {
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      padding: 25px 20px;
      text-align: center;
      width: 18%;
      backdrop-filter: blur(10px);
    }
    .stage-icon { font-size: 36px; margin-bottom: 12px; }
    .stage-title { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
    .stage-desc { font-size: 11px; opacity: 0.8; line-height: 1.4; }
    .arrow { font-size: 28px; opacity: 0.6; }
    .metrics {
      display: flex;
      justify-content: center;
      gap: 60px;
      margin-top: 50px;
      padding-top: 40px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
    .metric { text-align: center; }
    .metric-value { font-size: 48px; font-weight: 700; color: ${BRAND.accent}; }
    .metric-label { font-size: 14px; opacity: 0.8; margin-top: 5px; }
    .footer {
      text-align: center;
      margin-top: 50px;
      font-size: 12px;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">STRATA NOBLE</div>
      <h1>Pipeline Blueprint</h1>
      <div class="subtitle">Lead-to-Customer Journey Map</div>
    </div>

    <div class="pipeline">
      <div class="stage">
        <div class="stage-icon">📥</div>
        <div class="stage-title">CAPTURE</div>
        <div class="stage-desc">Forms, calls, SMS, email intake</div>
      </div>
      <div class="arrow">→</div>
      <div class="stage">
        <div class="stage-icon">🔄</div>
        <div class="stage-title">QUALIFY</div>
        <div class="stage-desc">Auto-score & route leads</div>
      </div>
      <div class="arrow">→</div>
      <div class="stage">
        <div class="stage-icon">📧</div>
        <div class="stage-title">NURTURE</div>
        <div class="stage-desc">Follow-up sequences</div>
      </div>
      <div class="arrow">→</div>
      <div class="stage">
        <div class="stage-icon">📅</div>
        <div class="stage-title">BOOK</div>
        <div class="stage-desc">Calendar scheduling</div>
      </div>
      <div class="arrow">→</div>
      <div class="stage">
        <div class="stage-icon">✅</div>
        <div class="stage-title">CLOSE</div>
        <div class="stage-desc">Convert & deliver</div>
      </div>
    </div>

    <div class="metrics">
      <div class="metric">
        <div class="metric-value">73%</div>
        <div class="metric-label">Lead Response Rate</div>
      </div>
      <div class="metric">
        <div class="metric-value">2.4x</div>
        <div class="metric-label">Booking Increase</div>
      </div>
      <div class="metric">
        <div class="metric-value">48hr</div>
        <div class="metric-label">Avg. Time to Book</div>
      </div>
    </div>

    <div class="footer">
      strataNoble.com • Pipeline Systems for Service Businesses
    </div>
  </div>
</body>
</html>
`;

// Work Sample 2: CRM Stage Map
const crmStageMapHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${BRAND.white};
      color: ${BRAND.text};
      padding: 50px;
      min-height: 100vh;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${BRAND.light};
    }
    .logo { color: ${BRAND.primary}; font-weight: 700; font-size: 18px; }
    h1 { font-size: 32px; color: ${BRAND.primary}; }
    .stages { display: flex; gap: 15px; }
    .stage-col {
      flex: 1;
      background: ${BRAND.light};
      border-radius: 8px;
      padding: 15px;
    }
    .stage-header {
      background: ${BRAND.primary};
      color: white;
      padding: 12px 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      font-weight: 600;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
    }
    .stage-count {
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
    }
    .card {
      background: white;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      font-size: 12px;
    }
    .card-name { font-weight: 600; margin-bottom: 4px; }
    .card-detail { color: #666; font-size: 11px; }
    .card-tag {
      display: inline-block;
      background: ${BRAND.accent};
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 9px;
      margin-top: 6px;
    }
    .card-tag.hot { background: #e53e3e; }
    .card-tag.warm { background: #dd6b20; }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #999;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">STRATA NOBLE</div>
      <h1>CRM Pipeline Stages</h1>
    </div>

    <div class="stages">
      <div class="stage-col">
        <div class="stage-header">
          NEW LEADS <span class="stage-count">12</span>
        </div>
        <div class="card">
          <div class="card-name">Sarah M.</div>
          <div class="card-detail">Haircut inquiry • 2h ago</div>
          <span class="card-tag hot">HOT</span>
        </div>
        <div class="card">
          <div class="card-name">James T.</div>
          <div class="card-detail">Fade + beard • 5h ago</div>
          <span class="card-tag warm">WARM</span>
        </div>
        <div class="card">
          <div class="card-name">Mike R.</div>
          <div class="card-detail">Web form • 1d ago</div>
        </div>
      </div>

      <div class="stage-col">
        <div class="stage-header">
          CONTACTED <span class="stage-count">8</span>
        </div>
        <div class="card">
          <div class="card-name">David L.</div>
          <div class="card-detail">Called back • awaiting</div>
          <span class="card-tag warm">WARM</span>
        </div>
        <div class="card">
          <div class="card-name">Chris P.</div>
          <div class="card-detail">SMS sent • no reply</div>
        </div>
      </div>

      <div class="stage-col">
        <div class="stage-header">
          BOOKED <span class="stage-count">6</span>
        </div>
        <div class="card">
          <div class="card-name">Alex K.</div>
          <div class="card-detail">Tomorrow 2pm</div>
          <span class="card-tag">CONFIRMED</span>
        </div>
        <div class="card">
          <div class="card-name">Ryan S.</div>
          <div class="card-detail">Fri 10am</div>
          <span class="card-tag">CONFIRMED</span>
        </div>
      </div>

      <div class="stage-col">
        <div class="stage-header">
          COMPLETED <span class="stage-count">24</span>
        </div>
        <div class="card">
          <div class="card-name">Tom B.</div>
          <div class="card-detail">$45 • 5-star review</div>
          <span class="card-tag">REPEAT</span>
        </div>
        <div class="card">
          <div class="card-name">Nick H.</div>
          <div class="card-detail">$65 • tipped $15</div>
        </div>
      </div>
    </div>

    <div class="footer">
      Sample CRM view • Strata Noble Pipeline Systems
    </div>
  </div>
</body>
</html>
`;

// Work Sample 3: Automation Flow
const automationFlowHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f7fafc;
      color: ${BRAND.text};
      padding: 50px;
      min-height: 100vh;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 50px; }
    .logo { color: ${BRAND.primary}; font-weight: 700; font-size: 14px; letter-spacing: 2px; margin-bottom: 10px; }
    h1 { font-size: 36px; color: ${BRAND.primary}; margin-bottom: 8px; }
    .subtitle { color: #666; font-size: 16px; }
    .flow { position: relative; }
    .flow-line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 3px;
      background: ${BRAND.light};
      transform: translateX(-50%);
    }
    .step {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      position: relative;
    }
    .step:nth-child(odd) { flex-direction: row; }
    .step:nth-child(even) { flex-direction: row-reverse; }
    .step-content {
      width: 45%;
      background: white;
      border-radius: 10px;
      padding: 20px 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .step-icon {
      width: 50px;
      height: 50px;
      background: ${BRAND.primary};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    .step-title { font-weight: 700; font-size: 16px; color: ${BRAND.primary}; margin-bottom: 6px; }
    .step-desc { font-size: 13px; color: #666; line-height: 1.5; }
    .step-time {
      font-size: 11px;
      color: ${BRAND.accent};
      font-weight: 600;
      margin-top: 8px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #999;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">STRATA NOBLE</div>
      <h1>Lead Follow-Up Automation</h1>
      <div class="subtitle">From inquiry to booked appointment</div>
    </div>

    <div class="flow">
      <div class="flow-line"></div>

      <div class="step">
        <div class="step-content">
          <div class="step-title">📥 New Lead Arrives</div>
          <div class="step-desc">Form submission, phone call, or SMS inquiry detected and logged automatically.</div>
          <div class="step-time">⚡ Instant</div>
        </div>
        <div class="step-icon">1</div>
        <div style="width:45%"></div>
      </div>

      <div class="step">
        <div style="width:45%"></div>
        <div class="step-icon">2</div>
        <div class="step-content">
          <div class="step-title">📧 Immediate Response</div>
          <div class="step-desc">Personalized SMS/email sent within 60 seconds with booking link and intro.</div>
          <div class="step-time">⏱️ Under 1 minute</div>
        </div>
      </div>

      <div class="step">
        <div class="step-content">
          <div class="step-title">🔔 Follow-Up #1</div>
          <div class="step-desc">If no response, friendly reminder sent. "Still interested in booking?"</div>
          <div class="step-time">⏱️ 4 hours later</div>
        </div>
        <div class="step-icon">3</div>
        <div style="width:45%"></div>
      </div>

      <div class="step">
        <div style="width:45%"></div>
        <div class="step-icon">4</div>
        <div class="step-content">
          <div class="step-title">📅 Booking Confirmed</div>
          <div class="step-desc">Calendar invite sent, reminder scheduled for 24h and 1h before appointment.</div>
          <div class="step-time">✅ Done</div>
        </div>
      </div>
    </div>

    <div class="footer">
      Automated sequences • Zero manual follow-up required • strataNoble.com
    </div>
  </div>
</body>
</html>
`;

async function main() {
  console.log('Generating work sample graphics...\n');

  await generateImage(pipelineBlueprintHTML, 'pipeline-blueprint.png', 1200, 800);
  await generateImage(crmStageMapHTML, 'crm-stage-map.png', 1200, 700);
  await generateImage(automationFlowHTML, 'automation-flow.png', 1000, 900);

  console.log('\nAll work samples generated!');
  console.log(`Output directory: ${path.resolve(OUTPUT_DIR)}`);
}

main().catch(console.error);
