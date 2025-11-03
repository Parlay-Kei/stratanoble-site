import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import chalk from 'chalk';

const execAsync = promisify(exec);

async function autoFixLint() {
  console.log(chalk.cyan('🔧 Auto-Fixing Lint Errors...\n'));

  try {
    // Run ESLint with --fix flag
    console.log(chalk.blue('Running ESLint --fix...'));
    const { stdout } = await execAsync('cd apps/website && npx eslint . --fix', {
      maxBuffer: 10 * 1024 * 1024
    });
    
    console.log(chalk.green('✅ Auto-fix complete!\n'));
    
  } catch (error) {
    // Some issues may remain after auto-fix
    console.log(chalk.yellow('⚠️  Auto-fix completed with some remaining issues\n'));
  }

  // Fix specific known issues
  await fixPreferConstError();

  // Run lint again to see what's left
  console.log(chalk.blue('📋 Checking remaining issues...\n'));
  try {
    await execAsync('cd apps/website && npm run lint');
    console.log(chalk.green('\n✅ All lint errors fixed!'));
  } catch (error) {
    const errorMatch = error.stdout?.match(/(\d+) error/);
    const warningMatch = error.stdout?.match(/(\d+) warning/);
    
    const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
    const warnings = warningMatch ? parseInt(warningMatch[1]) : 0;

    if (errors === 0) {
      console.log(chalk.green(`\n✅ All errors fixed! (${warnings} warnings remain)`));
    } else {
      console.log(chalk.red(`\n⚠️  ${errors} error(s) still need manual fixing`));
      console.log(chalk.gray('Run: npm run lint to see details\n'));
    }
  }
}

async function fixPreferConstError() {
  const file = 'apps/website/src/app/api/cold-calling/campaigns/route.ts';
  
  try {
    let content = await fs.readFile(file, 'utf-8');
    
    // Replace 'let campaigns' with 'const campaigns' if it exists
    if (content.includes('let campaigns =')) {
      content = content.replace(/let campaigns =/g, 'const campaigns =');
      await fs.writeFile(file, content);
      console.log(chalk.green('✅ Fixed prefer-const error in campaigns/route.ts'));
    }
  } catch (error) {
    // File may not exist or already fixed
  }
}

autoFixLint();
