/**
 * Design Agent Types
 */

export interface DesignSystem {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  borderRadius: BorderRadiusToken[];
  shadows: ShadowToken[];
  components: ComponentPattern[];
}

export interface ColorToken {
  name: string;
  value: string;
  usage: string;
  tailwind: string;
}

export interface TypographyToken {
  name: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  tailwind: string;
}

export interface SpacingToken {
  name: string;
  value: string;
  tailwind: string;
}

export interface BorderRadiusToken {
  name: string;
  value: string;
  tailwind: string;
}

export interface ShadowToken {
  name: string;
  value: string;
  tailwind: string;
}

export interface ComponentPattern {
  name: string;
  description: string;
  baseClasses: string;
  variants: Record<string, string>;
}

export interface ScreenAnalysis {
  name: string;
  filePath: string;
  screenshot?: string;
  currentCode: string;
  issues: DesignIssue[];
  improvements: DesignImprovement[];
  score: number;
}

export interface DesignIssue {
  severity: 'critical' | 'major' | 'minor' | 'suggestion';
  category: 'color' | 'typography' | 'spacing' | 'layout' | 'accessibility' | 'consistency' | 'ux';
  description: string;
  location: string;
  currentValue?: string;
  suggestedFix: string;
}

export interface DesignImprovement {
  category: 'visual' | 'ux' | 'animation' | 'responsive' | 'accessibility' | 'modern';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'complex';
  implementation: string;
}

export interface EnhancedComponent {
  name: string;
  originalPath: string;
  enhancedCode: string;
  changes: string[];
  newDependencies: string[];
}

export interface DesignAuditReport {
  timestamp: string;
  projectName: string;
  overallScore: number;
  screens: ScreenAnalysis[];
  designSystem: DesignSystemAudit;
  recommendations: Recommendation[];
}

export interface DesignSystemAudit {
  colorConsistency: number;
  typographyConsistency: number;
  spacingConsistency: number;
  componentReuse: number;
  issues: string[];
}

export interface Recommendation {
  priority: number;
  title: string;
  description: string;
  screens: string[];
  estimatedImpact: string;
}

export interface AgentConfig {
  projectPath: string;
  designSystemPath: string;
  referenceImagesPath: string;
  outputPath: string;
  anthropicApiKey: string;
  autoApply: boolean;
  verbose: boolean;
}

export interface ComponentFile {
  path: string;
  name: string;
  content: string;
  type: 'page' | 'component' | 'layout';
}
