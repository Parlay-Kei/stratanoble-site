#!/usr/bin/env node
/**
 * Skill validation utility
 * Validates skill files for completeness and correctness
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILLS_ROOT = path.resolve(__dirname, '../../skills');
const MANIFEST_PATH = path.resolve(__dirname, '../../skills/manifest.json');

async function validateManifest() {
  console.log('Validating manifest...');
  
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf-8');
    const manifest = JSON.parse(content);
    
    const errors = [];
    
    // Check required fields
    if (!manifest.version) errors.push('Missing version');
    if (!manifest.skills) errors.push('Missing skills object');
    
    // Validate each skill
    for (const [skillId, skill] of Object.entries(manifest.skills)) {
      if (!skill.name) errors.push(`${skillId}: Missing name`);
      if (!skill.description) errors.push(`${skillId}: Missing description`);
      if (!skill.version) errors.push(`${skillId}: Missing version`);
      
      // Check if skill file exists
      const skillPath = path.join(SKILLS_ROOT, skillId, 'SKILL.md');
      try {
        await fs.access(skillPath);
      } catch {
        errors.push(`${skillId}: SKILL.md file not found at ${skillPath}`);
      }
      
      // Validate progressive disclosure levels if present
      if (skill.levels) {
        const levels = Object.keys(skill.levels);
        if (levels.length === 0) {
          errors.push(`${skillId}: levels defined but empty`);
        }
        
        for (const level of levels) {
          const config = skill.levels[level];
          if (!config.maxSize) {
            errors.push(`${skillId}: level ${level} missing maxSize`);
          }
          if (!config.description) {
            errors.push(`${skillId}: level ${level} missing description`);
          }
        }
      }
    }
    
    if (errors.length > 0) {
      console.error('❌ Validation failed:');
      errors.forEach(err => console.error(`  - ${err}`));
      return false;
    }
    
    console.log(`✅ Manifest valid (${Object.keys(manifest.skills).length} skills)`);
    return true;
  } catch (err) {
    console.error('❌ Failed to validate manifest:', err.message);
    return false;
  }
}

async function validateSkillFiles() {
  console.log('\nValidating skill files...');
  
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'));
  const errors = [];
  
  for (const skillId of Object.keys(manifest.skills)) {
    const skillPath = path.join(SKILLS_ROOT, skillId, 'SKILL.md');
    
    try {
      const content = await fs.readFile(skillPath, 'utf-8');
      
      // Check minimum content length
      if (content.length < 100) {
        errors.push(`${skillId}: SKILL.md too short (${content.length} chars)`);
      }
      
      // Check for markdown structure
      if (!content.includes('#')) {
        errors.push(`${skillId}: No markdown headings found`);
      }
      
    } catch (err) {
      errors.push(`${skillId}: Cannot read SKILL.md - ${err.message}`);
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Skill file validation failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    return false;
  }
  
  console.log(`✅ All skill files valid`);
  return true;
}

async function main() {
  console.log('ANX Skills Validator\n');
  
  const manifestValid = await validateManifest();
  const filesValid = await validateSkillFiles();
  
  if (manifestValid && filesValid) {
    console.log('\n✅ All validations passed');
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed');
    process.exit(1);
  }
}

main();
