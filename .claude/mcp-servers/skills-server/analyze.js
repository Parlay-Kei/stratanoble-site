#!/usr/bin/env node
/**
 * Skill Auto-Updater
 * Monitors skill usage and suggests optimizations
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANALYTICS_PATH = path.resolve(__dirname, 'analytics.json');
const MANIFEST_PATH = path.resolve(__dirname, '../../skills/manifest.json');

async function analyzeUsage() {
  console.log('📊 Analyzing skill usage patterns...\n');

  try {
    const analytics = JSON.parse(await fs.readFile(ANALYTICS_PATH, 'utf-8'));
    const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'));

    const insights = [];

    // Top used skills
    const sorted = Object.entries(analytics.usage)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5);

    console.log('🔥 Top 5 Most Used Skills:');
    sorted.forEach(([id, data], i) => {
      console.log(`  ${i + 1}. ${manifest.skills[id]?.name || id} (${data.count} uses)`);
      
      // Analyze level distribution
      const levels = data.levels || {};
      const total = Object.values(levels).reduce((sum, n) => sum + n, 0);
      
      if (total > 10) {
        const l1 = (levels['1'] || 0) / total;
        const l2 = (levels['2'] || 0) / total;
        const l3 = (levels['3'] || 0) / total;
        
        console.log(`     Level distribution: L1=${(l1*100).toFixed(0)}% L2=${(l2*100).toFixed(0)}% L3=${(l3*100).toFixed(0)}%`);
        
        // Suggest optimizations
        if (l1 > 0.7) {
          insights.push({
            skill: id,
            type: 'size_optimization',
            message: `Level 1 used ${(l1*100).toFixed(0)}% of the time - consider if L2/L3 are needed`,
          });
        }
        
        if (l3 > 0.5) {
          insights.push({
            skill: id,
            type: 'detail_needed',
            message: `Level 3 used ${(l3*100).toFixed(0)}% of the time - users need deep detail`,
          });
        }
      }
    });

    console.log('\n');

    // Unused skills
    const allSkills = Object.keys(manifest.skills);
    const usedSkills = Object.keys(analytics.usage);
    const unused = allSkills.filter(id => !usedSkills.includes(id));

    if (unused.length > 0) {
      console.log('💤 Unused Skills:');
      unused.forEach(id => {
        console.log(`  - ${manifest.skills[id]?.name || id}`);
        insights.push({
          skill: id,
          type: 'unused',
          message: 'Consider archiving or promoting this skill',
        });
      });
      console.log('\n');
    }

    // Recently used
    const recent = Object.entries(analytics.usage)
      .filter(([, data]) => Date.now() - data.lastUsed < 24 * 60 * 60 * 1000)
      .sort(([, a], [, b]) => b.lastUsed - a.lastUsed);

    if (recent.length > 0) {
      console.log('🕐 Recently Used (Last 24h):');
      recent.forEach(([id, data]) => {
        const time = new Date(data.lastUsed).toLocaleString();
        console.log(`  - ${manifest.skills[id]?.name || id} (${time})`);
      });
      console.log('\n');
    }

    // Recommendations
    if (insights.length > 0) {
      console.log('💡 Recommendations:\n');
      insights.forEach(insight => {
        console.log(`[${insight.type.toUpperCase()}] ${manifest.skills[insight.skill]?.name || insight.skill}`);
        console.log(`  ${insight.message}\n`);
      });
    }

    // Summary stats
    console.log('📈 Summary:');
    console.log(`  Total Skills: ${allSkills.length}`);
    console.log(`  Used Skills: ${usedSkills.length}`);
    console.log(`  Unused Skills: ${unused.length}`);
    console.log(`  Total Invocations: ${Object.values(analytics.usage).reduce((sum, s) => sum + s.count, 0)}`);
    
    const avgUsesPerSkill = Object.values(analytics.usage).reduce((sum, s) => sum + s.count, 0) / usedSkills.length;
    console.log(`  Avg Uses/Skill: ${avgUsesPerSkill.toFixed(1)}`);

  } catch (err) {
    console.error('❌ Analysis failed:', err.message);
    
    if (err.code === 'ENOENT' && err.path?.includes('analytics.json')) {
      console.log('\n💡 No analytics data yet. Use the server for a while and run this again.');
    }
  }
}

async function main() {
  console.log('ANX Skills Auto-Updater\n');
  await analyzeUsage();
}

main();
