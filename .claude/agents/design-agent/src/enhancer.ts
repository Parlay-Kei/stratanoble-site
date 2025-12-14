/**
 * Design Enhancer
 * Generates enhanced component code with modern improvements
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import {
  ScreenAnalysis,
  EnhancedComponent,
  ComponentFile,
} from './types.js';
import { directCutsDesignSystem } from './design-system.js';

export class DesignEnhancer {
  private anthropic: Anthropic;
  private projectPath: string;

  constructor(apiKey: string, projectPath: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.projectPath = projectPath;
  }

  /**
   * Enhance a single component based on analysis
   */
  async enhanceComponent(
    component: ComponentFile,
    analysis: ScreenAnalysis
  ): Promise<EnhancedComponent> {
    const systemPrompt = this.buildEnhancementSystemPrompt();
    const userPrompt = this.buildEnhancementUserPrompt(component, analysis);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return this.parseEnhancementResponse(content.text, component);
  }

  /**
   * Build system prompt for enhancement
   */
  private buildEnhancementSystemPrompt(): string {
    return `You are an expert React/TypeScript developer and UI/UX designer. Your job is to enhance React components to be more modern, polished, and aligned with the Direct Cuts design system.

## Your Enhancement Philosophy

1. **Visual Polish**: Add subtle shadows, gradients, and refined spacing
2. **Micro-interactions**: Include hover states, transitions, and feedback
3. **Modern Patterns**: Use contemporary UI patterns (glassmorphism accents, smooth animations)
4. **Accessibility**: Ensure proper contrast, focus states, ARIA labels
5. **Performance**: Use efficient patterns (memo, lazy loading where appropriate)
6. **Type Safety**: Maintain strong TypeScript typing

## Direct Cuts Design System

${JSON.stringify(directCutsDesignSystem, null, 2)}

## Enhancement Guidelines

### Colors
- Primary: bg-[#E63946] (brand red) for CTAs and accents
- Backgrounds: bg-[#1A1A1A], bg-[#2D2D2D], bg-[#3D3D3D]
- Text: text-white (primary), text-gray-400 (secondary)
- Gold for ratings: text-yellow-400

### Animations (use framer-motion if complex, CSS for simple)
- Hover scale: hover:scale-[1.02] transition-transform
- Fade in: animate-fadeIn
- Slide up: animate-slideUp
- Button press: active:scale-95

### Modern Touches
- Subtle shadows: shadow-lg shadow-black/50
- Glassmorphism: bg-white/5 backdrop-blur-sm
- Gradient overlays for images
- Smooth border radius: rounded-2xl, rounded-3xl

### Component Structure
- Use semantic HTML (section, article, nav, etc.)
- Add proper aria-labels
- Include loading and empty states
- Handle errors gracefully

## Output Format

Respond with:
1. The complete enhanced component code in a code block
2. A list of changes made
3. Any new dependencies needed

\`\`\`tsx
// Enhanced component code here
\`\`\`

**Changes Made:**
- Change 1
- Change 2
...

**New Dependencies:**
- dependency1 (if any)
`;
  }

  /**
   * Build user prompt for enhancement
   */
  private buildEnhancementUserPrompt(
    component: ComponentFile,
    analysis: ScreenAnalysis
  ): string {
    const issuesList = analysis.issues
      .map(i => `- [${i.severity}] ${i.description}: ${i.suggestedFix}`)
      .join('\n');

    const improvementsList = analysis.improvements
      .map(i => `- [${i.impact}] ${i.title}: ${i.implementation}`)
      .join('\n');

    return `Enhance this ${component.type} component for the Direct Cuts barber booking app:

**Component:** ${component.name}
**Current Score:** ${analysis.score}/100

## Current Code

\`\`\`tsx
${component.content}
\`\`\`

## Issues to Fix

${issuesList || 'No critical issues identified.'}

## Suggested Improvements

${improvementsList || 'Apply general modern design enhancements.'}

## Requirements

1. Fix all identified issues
2. Apply the suggested improvements
3. Ensure the component follows the Direct Cuts design system
4. Add appropriate animations and micro-interactions
5. Maintain all existing functionality
6. Use TypeScript best practices
7. Keep the same file structure and exports

Generate the complete enhanced component code.`;
  }

  /**
   * Parse enhancement response
   */
  private parseEnhancementResponse(text: string, component: ComponentFile): EnhancedComponent {
    // Extract code block
    const codeMatch = text.match(/```(?:tsx|typescript|jsx)?\n([\s\S]*?)```/);
    const enhancedCode = codeMatch ? codeMatch[1].trim() : component.content;

    // Extract changes
    const changesMatch = text.match(/\*\*Changes Made:\*\*\n([\s\S]*?)(?=\*\*New Dependencies:|$)/);
    const changesText = changesMatch ? changesMatch[1] : '';
    const changes = changesText
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(Boolean);

    // Extract dependencies
    const depsMatch = text.match(/\*\*New Dependencies:\*\*\n([\s\S]*?)$/);
    const depsText = depsMatch ? depsMatch[1] : '';
    const newDependencies = depsText
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(Boolean);

    return {
      name: component.name,
      originalPath: component.path,
      enhancedCode,
      changes,
      newDependencies,
    };
  }

  /**
   * Generate a completely new modern component
   */
  async generateNewComponent(
    name: string,
    description: string,
    type: 'page' | 'component'
  ): Promise<EnhancedComponent> {
    const systemPrompt = `You are an expert React/TypeScript developer creating components for Direct Cuts, a modern barber booking app.

Design System:
${JSON.stringify(directCutsDesignSystem, null, 2)}

Create production-ready components with:
- Modern UI patterns (cards, smooth animations, micro-interactions)
- Full TypeScript typing
- Tailwind CSS styling matching the design system
- Responsive design (mobile-first)
- Accessibility best practices
- Loading and error states where appropriate

Output the complete component code in a tsx code block.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Create a new ${type} component called "${name}".

Description: ${description}

Requirements:
1. Follow the Direct Cuts design system exactly
2. Use dark theme with #E63946 red accents
3. Include smooth animations and transitions
4. Make it fully responsive
5. Add proper TypeScript interfaces
6. Include any necessary sub-components inline

Provide the complete component code.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const codeMatch = content.text.match(/```(?:tsx|typescript)?\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : '';

    return {
      name,
      originalPath: '',
      enhancedCode: code,
      changes: ['Generated new component'],
      newDependencies: [],
    };
  }

  /**
   * Apply enhancements to file (write to disk)
   */
  async applyEnhancement(enhancement: EnhancedComponent, outputPath?: string): Promise<string> {
    const targetPath = outputPath || enhancement.originalPath;
    
    // Create backup
    if (fs.existsSync(targetPath)) {
      const backupPath = targetPath.replace(/\.(tsx|jsx)$/, '.backup.$1');
      fs.copyFileSync(targetPath, backupPath);
    }

    // Write enhanced code
    fs.writeFileSync(targetPath, enhancement.enhancedCode, 'utf-8');
    
    return targetPath;
  }

  /**
   * Generate enhancement report
   */
  generateReport(enhancements: EnhancedComponent[]): string {
    const lines: string[] = [
      '# Design Enhancement Report',
      '',
      `**Generated:** ${new Date().toISOString()}`,
      `**Components Enhanced:** ${enhancements.length}`,
      '',
      '---',
      '',
    ];

    for (const enhancement of enhancements) {
      lines.push(`## ${enhancement.name}`);
      lines.push('');
      lines.push(`**Path:** \`${enhancement.originalPath}\``);
      lines.push('');
      lines.push('### Changes');
      for (const change of enhancement.changes) {
        lines.push(`- ${change}`);
      }
      lines.push('');
      if (enhancement.newDependencies.length > 0) {
        lines.push('### New Dependencies');
        for (const dep of enhancement.newDependencies) {
          lines.push(`- ${dep}`);
        }
        lines.push('');
      }
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }
}

export default DesignEnhancer;
