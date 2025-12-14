/**
 * Design Agent CLI
 * Command-line interface for the autonomous design agent
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

import { DesignAnalyzer } from './analyzer.js';
import { DesignEnhancer } from './enhancer.js';
import { ScreenAnalysis, EnhancedComponent } from './types.js';

const program = new Command();

// Get API key from environment
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

program
  .name('design-agent')
  .description('Autonomous AI design agent for Direct Cuts')
  .version('1.0.0');

// ============================================
// Analyze Command
// ============================================

program
  .command('analyze')
  .description('Analyze current design and identify issues')
  .option('-p, --project <path>', 'Project path', process.cwd())
  .option('-o, --output <path>', 'Output report path', './design-audit.json')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    if (!ANTHROPIC_API_KEY) {
      console.error(chalk.red('Error: ANTHROPIC_API_KEY environment variable is required'));
      process.exit(1);
    }

    console.log(chalk.bold.cyan('\n🎨 Direct Cuts Design Agent - Analysis\n'));
    console.log(chalk.gray(`Project: ${options.project}\n`));

    const analyzer = new DesignAnalyzer(
      ANTHROPIC_API_KEY,
      options.project,
      path.join(options.project, 'output_images')
    );

    try {
      const report = await analyzer.runFullAudit();

      // Display summary
      console.log(chalk.bold('\n📊 Analysis Summary\n'));
      console.log(`Overall Score: ${getScoreColor(report.overallScore)}${report.overallScore}/100${chalk.reset()}`);
      console.log(`Components Analyzed: ${report.screens.length}`);
      console.log(`Total Issues: ${report.screens.reduce((sum, s) => sum + s.issues.length, 0)}`);
      console.log(`Total Improvements: ${report.screens.reduce((sum, s) => sum + s.improvements.length, 0)}`);

      // Design system consistency
      console.log(chalk.bold('\n🎯 Design System Consistency\n'));
      console.log(`Color Consistency: ${getScoreColor(report.designSystem.colorConsistency)}${report.designSystem.colorConsistency}%${chalk.reset()}`);
      console.log(`Typography Consistency: ${getScoreColor(report.designSystem.typographyConsistency)}${report.designSystem.typographyConsistency}%${chalk.reset()}`);
      console.log(`Spacing Consistency: ${getScoreColor(report.designSystem.spacingConsistency)}${report.designSystem.spacingConsistency}%${chalk.reset()}`);
      console.log(`Component Reuse: ${getScoreColor(report.designSystem.componentReuse)}${report.designSystem.componentReuse}%${chalk.reset()}`);

      if (report.designSystem.issues.length > 0) {
        console.log(chalk.yellow('\nIssues:'));
        for (const issue of report.designSystem.issues) {
          console.log(chalk.yellow(`  ⚠ ${issue}`));
        }
      }

      // Top recommendations
      console.log(chalk.bold('\n📋 Top Recommendations\n'));
      for (const rec of report.recommendations.slice(0, 5)) {
        console.log(`${chalk.cyan(`#${rec.priority}`)} ${rec.title}`);
        console.log(chalk.gray(`   Impact: ${rec.estimatedImpact}`));
        console.log(chalk.gray(`   Screens: ${rec.screens.join(', ')}\n`));
      }

      // Component breakdown
      if (options.verbose) {
        console.log(chalk.bold('\n📁 Component Breakdown\n'));
        for (const screen of report.screens) {
          const scoreColor = getScoreColor(screen.score);
          console.log(`${scoreColor}●${chalk.reset()} ${screen.name}: ${screen.score}/100`);
          console.log(chalk.gray(`  Issues: ${screen.issues.length}, Improvements: ${screen.improvements.length}`));
        }
      }

      // Save report
      fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
      console.log(chalk.green(`\n✅ Full report saved to ${options.output}\n`));

    } catch (error) {
      console.error(chalk.red('Analysis failed:'), error);
      process.exit(1);
    }
  });

// ============================================
// Enhance Command
// ============================================

program
  .command('enhance')
  .description('Enhance components with modern design improvements')
  .option('-p, --project <path>', 'Project path', process.cwd())
  .option('-c, --component <name>', 'Specific component to enhance')
  .option('-a, --all', 'Enhance all components', false)
  .option('--auto-apply', 'Automatically apply changes', false)
  .option('--dry-run', 'Show changes without applying', false)
  .action(async (options) => {
    if (!ANTHROPIC_API_KEY) {
      console.error(chalk.red('Error: ANTHROPIC_API_KEY environment variable is required'));
      process.exit(1);
    }

    console.log(chalk.bold.cyan('\n🚀 Direct Cuts Design Agent - Enhancement\n'));

    const analyzer = new DesignAnalyzer(ANTHROPIC_API_KEY, options.project);
    const enhancer = new DesignEnhancer(ANTHROPIC_API_KEY, options.project);

    try {
      // Discover components
      const spinner = ora('Discovering components...').start();
      const components = await analyzer.discoverComponents();
      spinner.succeed(`Found ${components.length} components`);

      // Filter if specific component requested
      let targetComponents = components;
      if (options.component) {
        targetComponents = components.filter(c => 
          c.name.toLowerCase().includes(options.component.toLowerCase())
        );
        if (targetComponents.length === 0) {
          console.log(chalk.yellow(`No components found matching "${options.component}"`));
          return;
        }
      }

      // If not --all, let user select
      if (!options.all && !options.component) {
        const choices = components.map(c => ({
          name: `${c.name} (${c.type})`,
          value: c.path,
        }));

        const { selected } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selected',
            message: 'Select components to enhance:',
            choices,
            pageSize: 15,
          },
        ]);

        targetComponents = components.filter(c => selected.includes(c.path));
      }

      if (targetComponents.length === 0) {
        console.log(chalk.yellow('No components selected'));
        return;
      }

      console.log(chalk.cyan(`\nEnhancing ${targetComponents.length} component(s)...\n`));

      const enhancements: EnhancedComponent[] = [];

      for (const component of targetComponents) {
        const componentSpinner = ora(`Analyzing ${component.name}...`).start();
        
        try {
          // Analyze first
          const analysis = await analyzer.analyzeComponent(component);
          componentSpinner.text = `Enhancing ${component.name}...`;
          
          // Enhance
          const enhancement = await enhancer.enhanceComponent(component, analysis);
          enhancements.push(enhancement);
          
          componentSpinner.succeed(`${component.name} enhanced (${enhancement.changes.length} changes)`);

          // Show changes
          if (options.dryRun || !options.autoApply) {
            console.log(chalk.gray('  Changes:'));
            for (const change of enhancement.changes.slice(0, 5)) {
              console.log(chalk.gray(`    - ${change}`));
            }
            if (enhancement.changes.length > 5) {
              console.log(chalk.gray(`    ... and ${enhancement.changes.length - 5} more`));
            }
          }

        } catch (error) {
          componentSpinner.fail(`Failed to enhance ${component.name}`);
          console.error(chalk.red(`  Error: ${error}`));
        }
      }

      // Apply changes if not dry run
      if (!options.dryRun && enhancements.length > 0) {
        if (options.autoApply) {
          console.log(chalk.cyan('\nApplying changes...\n'));
          for (const enhancement of enhancements) {
            await enhancer.applyEnhancement(enhancement);
            console.log(chalk.green(`✅ Applied: ${enhancement.name}`));
          }
        } else {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'Apply these enhancements?',
              default: false,
            },
          ]);

          if (confirm) {
            for (const enhancement of enhancements) {
              await enhancer.applyEnhancement(enhancement);
              console.log(chalk.green(`✅ Applied: ${enhancement.name}`));
            }
          } else {
            // Save to output directory instead
            const outputDir = path.join(options.project, 'enhanced-components');
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }
            
            for (const enhancement of enhancements) {
              const outputPath = path.join(outputDir, `${enhancement.name}.tsx`);
              fs.writeFileSync(outputPath, enhancement.enhancedCode);
              console.log(chalk.blue(`📄 Saved: ${outputPath}`));
            }
          }
        }
      }

      // Generate report
      const report = enhancer.generateReport(enhancements);
      const reportPath = path.join(options.project, 'enhancement-report.md');
      fs.writeFileSync(reportPath, report);
      console.log(chalk.green(`\n📋 Report saved to ${reportPath}\n`));

    } catch (error) {
      console.error(chalk.red('Enhancement failed:'), error);
      process.exit(1);
    }
  });

// ============================================
// Generate Command
// ============================================

program
  .command('generate')
  .description('Generate new components from description')
  .option('-p, --project <path>', 'Project path', process.cwd())
  .option('-n, --name <name>', 'Component name')
  .option('-d, --description <desc>', 'Component description')
  .option('-t, --type <type>', 'Component type (page|component)', 'component')
  .action(async (options) => {
    if (!ANTHROPIC_API_KEY) {
      console.error(chalk.red('Error: ANTHROPIC_API_KEY environment variable is required'));
      process.exit(1);
    }

    console.log(chalk.bold.cyan('\n✨ Direct Cuts Design Agent - Generate\n'));

    const enhancer = new DesignEnhancer(ANTHROPIC_API_KEY, options.project);

    // Interactive mode if no name provided
    let name = options.name;
    let description = options.description;
    let type = options.type;

    if (!name || !description) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Component name:',
          default: name,
          validate: (input: string) => input.length > 0 || 'Name is required',
        },
        {
          type: 'list',
          name: 'type',
          message: 'Component type:',
          choices: ['component', 'page'],
          default: type,
        },
        {
          type: 'input',
          name: 'description',
          message: 'Describe the component:',
          default: description,
          validate: (input: string) => input.length > 10 || 'Please provide a detailed description',
        },
      ]);

      name = answers.name;
      type = answers.type;
      description = answers.description;
    }

    const spinner = ora(`Generating ${name}...`).start();

    try {
      const component = await enhancer.generateNewComponent(name, description, type as 'page' | 'component');
      spinner.succeed(`Generated ${name}`);

      // Determine output path
      const componentDir = type === 'page' 
        ? path.join(options.project, 'src', 'pages')
        : path.join(options.project, 'src', 'components');
      
      if (!fs.existsSync(componentDir)) {
        fs.mkdirSync(componentDir, { recursive: true });
      }

      const outputPath = path.join(componentDir, `${name}.tsx`);
      fs.writeFileSync(outputPath, component.enhancedCode);

      console.log(chalk.green(`\n✅ Component created: ${outputPath}\n`));

      // Preview
      console.log(chalk.bold('Preview:'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(component.enhancedCode.slice(0, 1000));
      if (component.enhancedCode.length > 1000) {
        console.log(chalk.gray('\n... (truncated)'));
      }
      console.log(chalk.gray('─'.repeat(50)));

    } catch (error) {
      spinner.fail('Generation failed');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// ============================================
// Auto-Enhance Command (Full Pipeline)
// ============================================

program
  .command('auto')
  .description('Run full autonomous design enhancement pipeline')
  .option('-p, --project <path>', 'Project path', process.cwd())
  .option('--apply', 'Apply changes automatically', false)
  .action(async (options) => {
    if (!ANTHROPIC_API_KEY) {
      console.error(chalk.red('Error: ANTHROPIC_API_KEY environment variable is required'));
      process.exit(1);
    }

    console.log(chalk.bold.magenta('\n🤖 Direct Cuts Autonomous Design Agent\n'));
    console.log(chalk.gray('Running full enhancement pipeline...\n'));

    const analyzer = new DesignAnalyzer(ANTHROPIC_API_KEY, options.project);
    const enhancer = new DesignEnhancer(ANTHROPIC_API_KEY, options.project);

    try {
      // Step 1: Analyze
      console.log(chalk.bold.cyan('Phase 1: Analysis'));
      console.log(chalk.gray('─'.repeat(40)));
      
      const report = await analyzer.runFullAudit();
      
      console.log(`\nOverall Score: ${getScoreColor(report.overallScore)}${report.overallScore}/100${chalk.reset()}`);

      // Step 2: Prioritize
      console.log(chalk.bold.cyan('\nPhase 2: Prioritization'));
      console.log(chalk.gray('─'.repeat(40)));

      // Find components that need the most work
      const prioritizedScreens = report.screens
        .filter(s => s.score < 80)
        .sort((a, b) => a.score - b.score);

      console.log(`\nComponents needing enhancement: ${prioritizedScreens.length}`);
      for (const screen of prioritizedScreens.slice(0, 5)) {
        console.log(chalk.yellow(`  - ${screen.name}: ${screen.score}/100`));
      }

      if (prioritizedScreens.length === 0) {
        console.log(chalk.green('\n✅ All components meet quality threshold!\n'));
        return;
      }

      // Step 3: Enhance
      console.log(chalk.bold.cyan('\nPhase 3: Enhancement'));
      console.log(chalk.gray('─'.repeat(40)));

      const components = await analyzer.discoverComponents();
      const enhancements: EnhancedComponent[] = [];

      for (const screen of prioritizedScreens.slice(0, 10)) {
        const component = components.find(c => c.name === screen.name);
        if (!component) continue;

        const spinner = ora(`Enhancing ${screen.name}...`).start();
        
        try {
          const enhancement = await enhancer.enhanceComponent(component, screen);
          enhancements.push(enhancement);
          spinner.succeed(`${screen.name} (${enhancement.changes.length} changes)`);
        } catch (error) {
          spinner.fail(`${screen.name}`);
        }
      }

      // Step 4: Apply or Save
      console.log(chalk.bold.cyan('\nPhase 4: Output'));
      console.log(chalk.gray('─'.repeat(40)));

      if (options.apply) {
        for (const enhancement of enhancements) {
          await enhancer.applyEnhancement(enhancement);
          console.log(chalk.green(`✅ Applied: ${enhancement.name}`));
        }
      } else {
        const outputDir = path.join(options.project, 'enhanced-components');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        for (const enhancement of enhancements) {
          const outputPath = path.join(outputDir, `${enhancement.name}.tsx`);
          fs.writeFileSync(outputPath, enhancement.enhancedCode);
          console.log(chalk.blue(`📄 ${enhancement.name} → ${outputPath}`));
        }
      }

      // Generate final report
      const reportMd = enhancer.generateReport(enhancements);
      const reportPath = path.join(options.project, 'auto-enhancement-report.md');
      fs.writeFileSync(reportPath, reportMd);

      // Summary
      console.log(chalk.bold.green('\n✨ Enhancement Complete!\n'));
      console.log(`Components enhanced: ${enhancements.length}`);
      console.log(`Total changes: ${enhancements.reduce((sum, e) => sum + e.changes.length, 0)}`);
      console.log(`Report: ${reportPath}`);
      console.log();

    } catch (error) {
      console.error(chalk.red('\nPipeline failed:'), error);
      process.exit(1);
    }
  });

// ============================================
// Helper Functions
// ============================================

function getScoreColor(score: number): string {
  if (score >= 80) return chalk.green;
  if (score >= 60) return chalk.yellow;
  return chalk.red;
}

// Run CLI
program.parse();
