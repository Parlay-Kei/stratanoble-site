import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

class AutoFixLintAgent {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
  }

  async execute() {
    console.log('🔧 Auto-Fix Lint Agent activated...\n');

    try {
      // Run lint with --fix flag
      console.log('📝 Attempting automatic fixes...');
      try {
        execSync('npm run lint -- --fix', {
          cwd: path.join(process.cwd(), 'apps', 'website'),
          stdio: 'inherit'
        });
      } catch (e) {
        // Continue even if there are errors, we'll try to fix them
        console.log('⚠️  Lint errors detected, attempting fixes...');
      }

      // Get remaining errors
      let lintOutput = '';
      try {
        execSync('npm run lint', {
          cwd: path.join(process.cwd(), 'apps', 'website'),
          encoding: 'utf-8',
          stdio: 'pipe'
        });
      } catch (error) {
        lintOutput = error.stdout || error.stderr || '';
      }

      // Parse lint output
      const errors = this.parseLintOutput(lintOutput);

      if (errors.length === 0) {
        console.log('✅ No lint errors found!');
        return;
      }

      console.log(`Found ${errors.length} lint errors to fix\n`);

      // Apply additional fixes
      await this.fixEscapeCharacters(errors);
      await this.fixConsoleStatements(errors);
      await this.fixConstErrors(errors);
      await this.fixHookDependencies(errors);

      console.log('\n✅ Auto-fix complete!');
      console.log(`📊 Fixed ${this.fixedFiles.length} files`);
      
      if (this.errors.length > 0) {
        console.log(`⚠️  ${this.errors.length} errors require manual review`);
        this.errors.forEach(err => console.log(`   - ${err}`));
      }

    } catch (error) {
      console.error('❌ Auto-fix failed:', error.message);
      process.exit(1);
    }
  }

  parseLintOutput(output) {
    const errorRegex = /(.+\.tsx?)[\r\n]+(\d+):(\d+)\s+(Warning|Error):\s+(.+?)\s+([\w-]+)/g;
    const errors = [];
    let match;

    while ((match = errorRegex.exec(output)) !== null) {
      errors.push({
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        severity: match[4],
        message: match[5],
        rule: match[6]
      });
    }

    return errors;
  }

  async fixEscapeCharacters(errors) {
    const escapeErrors = errors.filter(e => e.rule === 'react/no-unescaped-entities');
    const fileGroups = this.groupByFile(escapeErrors);

    for (const [file, fileErrors] of Object.entries(fileGroups)) {
      try {
        let content = await fs.readFile(file, 'utf-8');
        let modified = false;

        // Sort errors by line number (descending) to avoid offset issues
        fileErrors.sort((a, b) => b.line - a.line);

        for (const error of fileErrors) {
          const lines = content.split('\n');
          const lineIndex = error.line - 1;
          
          if (lineIndex >= 0 && lineIndex < lines.length) {
            let line = lines[lineIndex];
            
            // Fix apostrophes and quotes
            line = line.replace(/'/g, '&apos;');
            line = line.replace(/"/g, '&quot;');
            
            lines[lineIndex] = line;
            content = lines.join('\n');
            modified = true;
          }
        }

        if (modified) {
          await fs.writeFile(file, content, 'utf-8');
          this.fixedFiles.push(file);
          console.log(`✅ Fixed escape characters in ${path.basename(file)}`);
        }
      } catch (error) {
        this.errors.push(`Failed to fix ${file}: ${error.message}`);
      }
    }
  }

  async fixConsoleStatements(errors) {
    const consoleErrors = errors.filter(e => e.rule === 'no-console');
    const fileGroups = this.groupByFile(consoleErrors);

    for (const [file, fileErrors] of Object.entries(fileGroups)) {
      try {
        let content = await fs.readFile(file, 'utf-8');
        let modified = false;

        // Only fix in non-development files
        if (!file.includes('page.tsx') && !file.includes('test.')) {
          fileErrors.sort((a, b) => b.line - a.line);

          for (const error of fileErrors) {
            const lines = content.split('\n');
            const lineIndex = error.line - 1;
            
            if (lineIndex >= 0 && lineIndex < lines.length) {
              let line = lines[lineIndex];
              
              // Remove console statements
              if (line.includes('console.log') || 
                  line.includes('console.error') || 
                  line.includes('console.warn')) {
                lines[lineIndex] = `// ${line.trim()} // Auto-removed by lint agent`;
                modified = true;
              }
            }
          }

          if (modified) {
            content = lines.join('\n');
            await fs.writeFile(file, content, 'utf-8');
            this.fixedFiles.push(file);
            console.log(`✅ Removed console statements in ${path.basename(file)}`);
          }
        }
      } catch (error) {
        this.errors.push(`Failed to fix console in ${file}: ${error.message}`);
      }
    }
  }

  async fixConstErrors(errors) {
    const constErrors = errors.filter(e => e.rule === 'prefer-const');
    
    for (const error of constErrors) {
      try {
        const content = await fs.readFile(error.file, 'utf-8');
        const lines = content.split('\n');
        const lineIndex = error.line - 1;
        
        if (lineIndex >= 0 && lineIndex < lines.length) {
          let line = lines[lineIndex];
          
          // Replace 'let' with 'const'
          line = line.replace(/\blet\b/, 'const');
          
          lines[lineIndex] = line;
          await fs.writeFile(error.file, lines.join('\n'), 'utf-8');
          this.fixedFiles.push(error.file);
          console.log(`✅ Fixed const error in ${path.basename(error.file)}`);
        }
      } catch (err) {
        this.errors.push(`Failed to fix const in ${error.file}: ${err.message}`);
      }
    }
  }

  async fixHookDependencies(errors) {
    const hookErrors = errors.filter(e => e.rule === 'react-hooks/exhaustive-deps');
    
    // These require manual review, so just log them
    if (hookErrors.length > 0) {
      console.log('\n⚠️  React Hook dependency warnings found (require manual review):');
      hookErrors.forEach(error => {
        console.log(`   ${path.basename(error.file)}:${error.line} - ${error.message}`);
      });
    }
  }

  groupByFile(errors) {
    return errors.reduce((acc, error) => {
      if (!acc[error.file]) acc[error.file] = [];
      acc[error.file].push(error);
      return acc;
    }, {});
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const agent = new AutoFixLintAgent();
  agent.execute().catch(console.error);
}

export default AutoFixLintAgent;
