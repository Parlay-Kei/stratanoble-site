import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

async function fixCurrentErrors() {
  console.log('🔧 Fixing current lint errors...\n');

  try {
    // 1. Run ESLint with auto-fix
    console.log('📝 Running ESLint auto-fix...');
    try {
      execSync('cd apps/website && npm run lint -- --fix', { stdio: 'inherit' });
      console.log('✅ ESLint auto-fix completed');
    } catch (error) {
      console.log('⚠️  Some lint errors remain, attempting manual fixes...');
    }

    // 2. Fix the prefer-const error in campaigns/route.ts if it exists
    const campaignsFile = 'apps/website/src/app/api/cold-calling/campaigns/route.ts';
    try {
      const stats = await fs.stat(campaignsFile);
      if (stats.isFile()) {
        let content = await fs.readFile(campaignsFile, 'utf-8');
        if (content.includes('let campaigns =')) {
          content = content.replace(/let campaigns =/g, 'const campaigns =');
          await fs.writeFile(campaignsFile, content, 'utf-8');
          console.log('✅ Fixed prefer-const error in campaigns/route.ts');
        }
      }
    } catch (error) {
      // File doesn't exist or no errors to fix
      console.log('ℹ️  No prefer-const errors found in campaigns route');
    }

    // 3. Run lint again to check if errors are fixed
    console.log('\n📋 Running final lint check...');
    try {
      execSync('cd apps/website && npm run lint', { stdio: 'inherit' });
      console.log('\n✅ All lint errors fixed!');
    } catch (error) {
      console.log('\n⚠️  Some lint errors still remain. Run the auto-fix agent:');
      console.log('  npm run agents trigger lint-error');
    }

    console.log('\n📦 Changes are ready to be committed.');
    console.log('\nNext steps:');
    console.log('  git add .');
    console.log('  git commit -m "fix: resolve ESLint errors"');
    console.log('  git push origin main');

  } catch (error) {
    console.error('❌ Error fixing lint issues:', error.message);
    process.exit(1);
  }
}

fixCurrentErrors();
