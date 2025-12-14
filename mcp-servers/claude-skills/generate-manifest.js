const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

async function generateManifest() {
  console.log('Generating skills manifest...\n');
  
  const manifestPath = path.join(__dirname, 'skills-manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  
  let updated = false;
  
  for (const skill of manifest.skills) {
    const skillPath = path.join(__dirname, skill.path);
    
    try {
      const content = await fs.readFile(skillPath, 'utf8');
      const hash = 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
      
      if (skill.hash !== hash) {
        console.log(`Updating hash for ${skill.name}:`);
        console.log(`  Old: ${skill.hash}`);
        console.log(`  New: ${hash}\n`);
        
        skill.hash = hash;
        updated = true;
      } else {
        console.log(`✓ ${skill.name} hash unchanged\n`);
      }
    } catch (error) {
      console.error(`Error processing ${skill.name}:`, error.message);
    }
  }
  
  if (updated) {
    manifest.lastUpdated = new Date().toISOString();
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✓ Manifest updated successfully');
    console.log('  File:', manifestPath);
  } else {
    console.log('No changes needed');
  }
}

generateManifest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
