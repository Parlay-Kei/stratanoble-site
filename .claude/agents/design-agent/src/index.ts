/**
 * Design Agent - Main Entry Point
 * Exports all modules for programmatic use
 */

export { DesignAnalyzer } from './analyzer.js';
export { DesignEnhancer } from './enhancer.js';
export { directCutsDesignSystem } from './design-system.js';
export * from './types.js';

// Re-export for convenience
import { DesignAnalyzer } from './analyzer.js';
import { DesignEnhancer } from './enhancer.js';

export interface DesignAgentConfig {
  apiKey: string;
  projectPath: string;
  referenceImagesPath?: string;
}

/**
 * Main Design Agent class that orchestrates analysis and enhancement
 */
export class DesignAgent {
  private analyzer: DesignAnalyzer;
  private enhancer: DesignEnhancer;
  private config: DesignAgentConfig;

  constructor(config: DesignAgentConfig) {
    this.config = config;
    this.analyzer = new DesignAnalyzer(
      config.apiKey,
      config.projectPath,
      config.referenceImagesPath
    );
    this.enhancer = new DesignEnhancer(config.apiKey, config.projectPath);
  }

  /**
   * Run full design audit
   */
  async audit() {
    return this.analyzer.runFullAudit();
  }

  /**
   * Discover all components
   */
  async discoverComponents() {
    return this.analyzer.discoverComponents();
  }

  /**
   * Analyze a specific component
   */
  async analyzeComponent(componentPath: string) {
    const components = await this.analyzer.discoverComponents();
    const component = components.find(c => c.path === componentPath);
    if (!component) {
      throw new Error(`Component not found: ${componentPath}`);
    }
    return this.analyzer.analyzeComponent(component);
  }

  /**
   * Enhance a component based on its analysis
   */
  async enhanceComponent(componentPath: string) {
    const components = await this.analyzer.discoverComponents();
    const component = components.find(c => c.path === componentPath);
    if (!component) {
      throw new Error(`Component not found: ${componentPath}`);
    }
    const analysis = await this.analyzer.analyzeComponent(component);
    return this.enhancer.enhanceComponent(component, analysis);
  }

  /**
   * Generate a new component
   */
  async generateComponent(name: string, description: string, type: 'page' | 'component' = 'component') {
    return this.enhancer.generateNewComponent(name, description, type);
  }

  /**
   * Run full autonomous enhancement pipeline
   */
  async runAutonomousPipeline(options: { applyChanges?: boolean; maxComponents?: number } = {}) {
    const { applyChanges = false, maxComponents = 10 } = options;

    // Step 1: Audit
    const report = await this.audit();

    // Step 2: Prioritize components needing work
    const prioritized = report.screens
      .filter(s => s.score < 80)
      .sort((a, b) => a.score - b.score)
      .slice(0, maxComponents);

    // Step 3: Enhance each
    const components = await this.discoverComponents();
    const enhancements = [];

    for (const screen of prioritized) {
      // Match by filePath to ensure we get the correct component even if names collide
      const component = components.find(c => c.path === screen.filePath);
      if (!component) continue;

      try {
        const enhancement = await this.enhancer.enhanceComponent(component, screen);
        enhancements.push(enhancement);

        if (applyChanges) {
          await this.enhancer.applyEnhancement(enhancement);
        }
      } catch (error) {
        console.error(`Failed to enhance ${screen.name}:`, error);
      }
    }

    return {
      report,
      enhancements,
      applied: applyChanges,
    };
  }
}

export default DesignAgent;
