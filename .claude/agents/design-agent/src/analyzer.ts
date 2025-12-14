/**
 * Design Analyzer
 * Analyzes React/Tailwind components for design issues and improvements
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import {
  ScreenAnalysis,
  DesignIssue,
  DesignImprovement,
  ComponentFile,
  DesignAuditReport,
  DesignSystemAudit,
  Recommendation,
} from './types.js';
import { directCutsDesignSystem } from './design-system.js';

export class DesignAnalyzer {
  private anthropic: Anthropic;
  private projectPath: string;
  private referenceImages: string[];

  constructor(apiKey: string, projectPath: string, referenceImagesPath?: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.projectPath = projectPath;
    this.referenceImages = [];

    if (referenceImagesPath && fs.existsSync(referenceImagesPath)) {
      this.referenceImages = fs.readdirSync(referenceImagesPath)
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
        .map(f => path.join(referenceImagesPath, f));
    }
  }

  /**
   * Discover all component files in the project
   */
  async discoverComponents(): Promise<ComponentFile[]> {
    const srcPath = path.join(this.projectPath, 'src');
    const files: ComponentFile[] = [];

    // Find all TSX/JSX files
    const patterns = [
      path.join(srcPath, 'pages', '**/*.tsx'),
      path.join(srcPath, 'components', '**/*.tsx'),
      path.join(srcPath, 'pages', '**/*.jsx'),
      path.join(srcPath, 'components', '**/*.jsx'),
    ];

    for (const pattern of patterns) {
      const matches = await glob(pattern.replace(/\\/g, '/'));
      for (const filePath of matches) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const name = path.basename(filePath, path.extname(filePath));
        const type = filePath.includes('pages') ? 'page' : 'component';
        
        files.push({
          path: filePath,
          name,
          content,
          type: type as 'page' | 'component',
        });
      }
    }

    return files;
  }

  /**
   * Analyze a single component for design issues
   */
  async analyzeComponent(component: ComponentFile): Promise<ScreenAnalysis> {
    const systemPrompt = this.buildAnalysisSystemPrompt();
    const userPrompt = this.buildAnalysisUserPrompt(component);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return this.parseAnalysisResponse(content.text, component);
  }

  /**
   * Build the system prompt for analysis
   */
  private buildAnalysisSystemPrompt(): string {
    return `You are an expert UI/UX designer and React/Tailwind developer specializing in modern mobile-first applications. You're analyzing components for a barber booking app called "Direct Cuts" with a dark theme and red accent color (#E63946).

Your job is to:
1. Identify design issues (color consistency, spacing, typography, accessibility)
2. Suggest modern improvements (animations, micro-interactions, visual polish)
3. Ensure adherence to the design system
4. Rate the overall design quality

Design System Reference:
${JSON.stringify(directCutsDesignSystem, null, 2)}

Output your analysis as JSON with this structure:
{
  "score": <0-100>,
  "issues": [
    {
      "severity": "critical|major|minor|suggestion",
      "category": "color|typography|spacing|layout|accessibility|consistency|ux",
      "description": "...",
      "location": "line number or element description",
      "currentValue": "current problematic value",
      "suggestedFix": "specific fix with Tailwind classes"
    }
  ],
  "improvements": [
    {
      "category": "visual|ux|animation|responsive|accessibility|modern",
      "title": "...",
      "description": "...",
      "impact": "high|medium|low",
      "effort": "easy|medium|complex",
      "implementation": "specific code or Tailwind classes to add"
    }
  ]
}`;
  }

  /**
   * Build user prompt for component analysis
   */
  private buildAnalysisUserPrompt(component: ComponentFile): string {
    return `Analyze this ${component.type} component for design quality and improvements:

**Component:** ${component.name}
**Path:** ${component.path}

\`\`\`tsx
${component.content}
\`\`\`

Consider:
1. Does it follow the Direct Cuts design system (dark theme, #E63946 red, proper spacing)?
2. Are there accessibility issues (contrast, touch targets, labels)?
3. Is the code using consistent Tailwind patterns?
4. What modern enhancements would elevate this design?
5. Are there any UX improvements needed?

Provide your analysis as JSON.`;
  }

  /**
   * Parse the analysis response
   */
  private parseAnalysisResponse(text: string, component: ComponentFile): ScreenAnalysis {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        name: component.name,
        filePath: component.path,
        currentCode: component.content,
        issues: [],
        improvements: [],
        score: 50,
      };
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: component.name,
        filePath: component.path,
        currentCode: component.content,
        issues: parsed.issues || [],
        improvements: parsed.improvements || [],
        score: parsed.score || 50,
      };
    } catch (e) {
      return {
        name: component.name,
        filePath: component.path,
        currentCode: component.content,
        issues: [],
        improvements: [],
        score: 50,
      };
    }
  }

  /**
   * Analyze the entire project's design system consistency
   */
  async analyzeDesignSystemConsistency(components: ComponentFile[]): Promise<DesignSystemAudit> {
    // Collect all Tailwind classes used across components
    const allClasses = new Set<string>();
    const colorClasses: string[] = [];
    const typographyClasses: string[] = [];
    const spacingClasses: string[] = [];

    for (const component of components) {
      const classMatches = component.content.matchAll(/className="([^"]+)"/g);
      for (const match of classMatches) {
        const classes = match[1].split(/\s+/);
        for (const cls of classes) {
          allClasses.add(cls);
          if (cls.match(/^(bg-|text-|border-)/)) colorClasses.push(cls);
          if (cls.match(/^(text-|font-|leading-|tracking-)/)) typographyClasses.push(cls);
          if (cls.match(/^(p-|m-|gap-|space-)/)) spacingClasses.push(cls);
        }
      }
    }

    // Calculate consistency scores
    const uniqueColors = new Set(colorClasses);
    const uniqueTypography = new Set(typographyClasses);
    const uniqueSpacing = new Set(spacingClasses);

    // More unique values = less consistency
    const colorConsistency = Math.max(0, 100 - (uniqueColors.size - 10) * 5);
    const typographyConsistency = Math.max(0, 100 - (uniqueTypography.size - 8) * 5);
    const spacingConsistency = Math.max(0, 100 - (uniqueSpacing.size - 10) * 5);

    // Component reuse (check for repeated patterns)
    const componentImports = components.flatMap(c => 
      [...c.content.matchAll(/import.*from ['"].*components/g)]
    );
    const componentReuse = Math.min(100, componentImports.length * 10);

    const issues: string[] = [];
    
    // Check for common issues
    if (colorClasses.some(c => c.includes('[#'))) {
      issues.push('Using arbitrary color values instead of design tokens');
    }
    if (!colorClasses.some(c => c.includes('brand-red') || c.includes('E63946'))) {
      issues.push('Brand red color (#E63946) not consistently used');
    }
    if (uniqueSpacing.size > 15) {
      issues.push('Too many unique spacing values - consider consolidating');
    }

    return {
      colorConsistency,
      typographyConsistency,
      spacingConsistency,
      componentReuse,
      issues,
    };
  }

  /**
   * Generate prioritized recommendations
   */
  generateRecommendations(analyses: ScreenAnalysis[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const issueGroups = new Map<string, { screens: string[]; count: number }>();

    // Group issues by description
    for (const analysis of analyses) {
      for (const issue of analysis.issues) {
        const key = issue.description;
        if (!issueGroups.has(key)) {
          issueGroups.set(key, { screens: [], count: 0 });
        }
        const group = issueGroups.get(key)!;
        group.screens.push(analysis.name);
        group.count++;
      }
    }

    // Convert to recommendations, sorted by frequency
    let priority = 1;
    const sortedIssues = [...issueGroups.entries()].sort((a, b) => b[1].count - a[1].count);

    for (const [description, data] of sortedIssues.slice(0, 10)) {
      recommendations.push({
        priority: priority++,
        title: description.slice(0, 50) + (description.length > 50 ? '...' : ''),
        description,
        screens: data.screens,
        estimatedImpact: data.count > 3 ? 'High - affects multiple screens' : 'Medium',
      });
    }

    // Add improvement recommendations
    const improvementCounts = new Map<string, number>();
    for (const analysis of analyses) {
      for (const improvement of analysis.improvements) {
        const key = improvement.category;
        improvementCounts.set(key, (improvementCounts.get(key) || 0) + 1);
      }
    }

    if (improvementCounts.get('animation') || 0 > 2) {
      recommendations.push({
        priority: priority++,
        title: 'Add micro-interactions and animations',
        description: 'Multiple screens would benefit from subtle animations for state changes, loading, and transitions.',
        screens: analyses.filter(a => a.improvements.some(i => i.category === 'animation')).map(a => a.name),
        estimatedImpact: 'High - improves perceived quality',
      });
    }

    return recommendations;
  }

  /**
   * Run full design audit
   */
  async runFullAudit(): Promise<DesignAuditReport> {
    console.log('🔍 Discovering components...');
    const components = await this.discoverComponents();
    console.log(`   Found ${components.length} components\n`);

    console.log('📊 Analyzing design system consistency...');
    const designSystemAudit = await this.analyzeDesignSystemConsistency(components);
    console.log('   Done\n');

    console.log('🎨 Analyzing individual components...');
    const screenAnalyses: ScreenAnalysis[] = [];
    
    for (const component of components) {
      process.stdout.write(`   Analyzing ${component.name}...`);
      try {
        const analysis = await this.analyzeComponent(component);
        screenAnalyses.push(analysis);
        console.log(` Score: ${analysis.score}/100`);
      } catch (error) {
        console.log(' Error');
      }
    }

    console.log('\n📋 Generating recommendations...');
    const recommendations = this.generateRecommendations(screenAnalyses);

    const overallScore = screenAnalyses.length > 0
      ? Math.round(screenAnalyses.reduce((sum, a) => sum + a.score, 0) / screenAnalyses.length)
      : 0;

    return {
      timestamp: new Date().toISOString(),
      projectName: 'Direct Cuts',
      overallScore,
      screens: screenAnalyses,
      designSystem: designSystemAudit,
      recommendations,
    };
  }
}

export default DesignAnalyzer;
