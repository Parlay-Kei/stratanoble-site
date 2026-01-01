/**
 * Design Token Extractor
 * Extracts design tokens (colors, typography, spacing, etc.) from Figma files
 */

import {
  FigmaNode,
  FigmaFrameNode,
  FigmaTextNode,
  FigmaColor,
  FigmaPaint,
  FigmaEffect,
  FigmaTypeStyle,
  ExtractedColor,
  ExtractedTypography,
  ExtractedSpacing,
  ExtractedBorderRadius,
  ExtractedShadow,
  DesignTokens,
} from './types.js';

/**
 * Convert Figma RGBA color to hex string
 */
export function rgbaToHex(color: FigmaColor): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert hex color to Figma RGBA
 */
export function hexToRgba(hex: string): FigmaColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
    a: 1,
  };
}

/**
 * Check if two colors are similar (within threshold)
 */
function colorsAreSimilar(color1: FigmaColor, color2: FigmaColor, threshold = 0.05): boolean {
  return (
    Math.abs(color1.r - color2.r) < threshold &&
    Math.abs(color1.g - color2.g) < threshold &&
    Math.abs(color1.b - color2.b) < threshold
  );
}

/**
 * Extract colors from a node and its children
 */
function extractColorsFromNode(
  node: FigmaNode,
  colors: Map<string, ExtractedColor>,
  parentPath: string = ''
): void {
  const nodePath = parentPath ? `${parentPath} > ${node.name}` : node.name;

  // Extract fill colors
  if ('fills' in node && Array.isArray(node.fills)) {
    for (const fill of node.fills) {
      if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
        const hex = rgbaToHex(fill.color);
        if (colors.has(hex)) {
          const existing = colors.get(hex)!;
          existing.usage.push(nodePath);
          existing.nodeIds.push(node.id);
        } else {
          colors.set(hex, {
            name: suggestColorName(fill.color),
            hex,
            rgba: fill.color,
            usage: [nodePath],
            nodeIds: [node.id],
          });
        }
      }
    }
  }

  // Extract stroke colors
  if ('strokes' in node && Array.isArray(node.strokes)) {
    for (const stroke of node.strokes) {
      if (stroke.type === 'SOLID' && stroke.color && stroke.visible !== false) {
        const hex = rgbaToHex(stroke.color);
        if (colors.has(hex)) {
          const existing = colors.get(hex)!;
          existing.usage.push(`${nodePath} (stroke)`);
          existing.nodeIds.push(node.id);
        } else {
          colors.set(hex, {
            name: suggestColorName(stroke.color),
            hex,
            rgba: stroke.color,
            usage: [`${nodePath} (stroke)`],
            nodeIds: [node.id],
          });
        }
      }
    }
  }

  // Recurse into children
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractColorsFromNode(child, colors, nodePath);
    }
  }
}

/**
 * Suggest a semantic name for a color
 */
function suggestColorName(color: FigmaColor): string {
  const { r, g, b } = color;
  
  // Check for common colors
  if (r > 0.8 && g < 0.3 && b < 0.3) return 'red';
  if (r < 0.3 && g > 0.7 && b < 0.3) return 'green';
  if (r < 0.3 && g < 0.3 && b > 0.7) return 'blue';
  if (r > 0.9 && g > 0.9 && b > 0.9) return 'white';
  if (r < 0.1 && g < 0.1 && b < 0.1) return 'black';
  if (Math.abs(r - g) < 0.1 && Math.abs(g - b) < 0.1) {
    if (r > 0.5) return 'gray-light';
    return 'gray-dark';
  }
  if (r > 0.8 && g > 0.6 && b < 0.3) return 'orange';
  if (r > 0.8 && g > 0.8 && b < 0.3) return 'yellow';
  if (r > 0.5 && g < 0.3 && b > 0.5) return 'purple';
  if (r > 0.8 && g < 0.5 && b > 0.5) return 'pink';
  
  return 'color';
}

/**
 * Extract typography from a node and its children
 */
function extractTypographyFromNode(
  node: FigmaNode,
  typography: Map<string, ExtractedTypography>,
  parentPath: string = ''
): void {
  const nodePath = parentPath ? `${parentPath} > ${node.name}` : node.name;

  if (node.type === 'TEXT' && 'style' in node && node.style) {
    const style = node.style as FigmaTypeStyle;
    const key = `${style.fontFamily}-${style.fontSize}-${style.fontWeight}`;
    
    if (typography.has(key)) {
      const existing = typography.get(key)!;
      existing.usage.push(nodePath);
      existing.nodeIds.push(node.id);
    } else {
      typography.set(key, {
        name: suggestTypographyName(style),
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeightPx,
        letterSpacing: style.letterSpacing,
        usage: [nodePath],
        nodeIds: [node.id],
      });
    }
  }

  // Recurse into children
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractTypographyFromNode(child, typography, nodePath);
    }
  }
}

/**
 * Suggest a semantic name for typography
 */
function suggestTypographyName(style: FigmaTypeStyle): string {
  const { fontSize, fontWeight } = style;
  
  let size = 'base';
  if (fontSize >= 32) size = '3xl';
  else if (fontSize >= 24) size = '2xl';
  else if (fontSize >= 20) size = 'xl';
  else if (fontSize >= 18) size = 'lg';
  else if (fontSize >= 16) size = 'base';
  else if (fontSize >= 14) size = 'sm';
  else if (fontSize >= 12) size = 'xs';
  else size = '2xs';

  let weight = 'regular';
  if (fontWeight >= 700) weight = 'bold';
  else if (fontWeight >= 600) weight = 'semibold';
  else if (fontWeight >= 500) weight = 'medium';

  return `text-${size}-${weight}`;
}

/**
 * Extract spacing values from a node and its children
 */
function extractSpacingFromNode(
  node: FigmaNode,
  spacing: Map<number, ExtractedSpacing>,
  parentPath: string = ''
): void {
  const nodePath = parentPath ? `${parentPath} > ${node.name}` : node.name;

  if ('paddingLeft' in node || 'paddingTop' in node || 'itemSpacing' in node) {
    const frameNode = node as FigmaFrameNode;
    
    const spacingValues = [
      frameNode.paddingLeft,
      frameNode.paddingRight,
      frameNode.paddingTop,
      frameNode.paddingBottom,
      frameNode.itemSpacing,
      frameNode.horizontalPadding,
      frameNode.verticalPadding,
    ].filter((v): v is number => typeof v === 'number' && v > 0);

    for (const value of spacingValues) {
      if (spacing.has(value)) {
        const existing = spacing.get(value)!;
        if (!existing.usage.includes(nodePath)) {
          existing.usage.push(nodePath);
          existing.nodeIds.push(node.id);
        }
      } else {
        spacing.set(value, {
          value,
          usage: [nodePath],
          nodeIds: [node.id],
        });
      }
    }
  }

  // Recurse into children
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractSpacingFromNode(child, spacing, nodePath);
    }
  }
}

/**
 * Extract border radius values from a node and its children
 */
function extractBorderRadiusFromNode(
  node: FigmaNode,
  radii: Map<string, ExtractedBorderRadius>,
  parentPath: string = ''
): void {
  const nodePath = parentPath ? `${parentPath} > ${node.name}` : node.name;

  if ('cornerRadius' in node || 'rectangleCornerRadii' in node) {
    const frameNode = node as FigmaFrameNode;
    
    let value: number | [number, number, number, number] | undefined;
    
    if (frameNode.rectangleCornerRadii) {
      value = frameNode.rectangleCornerRadii;
    } else if (typeof frameNode.cornerRadius === 'number' && frameNode.cornerRadius > 0) {
      value = frameNode.cornerRadius;
    }

    if (value !== undefined) {
      const key = Array.isArray(value) ? value.join(',') : value.toString();
      
      if (radii.has(key)) {
        const existing = radii.get(key)!;
        existing.usage.push(nodePath);
        existing.nodeIds.push(node.id);
      } else {
        radii.set(key, {
          value,
          usage: [nodePath],
          nodeIds: [node.id],
        });
      }
    }
  }

  // Recurse into children
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractBorderRadiusFromNode(child, radii, nodePath);
    }
  }
}

/**
 * Extract shadow effects from a node and its children
 */
function extractShadowsFromNode(
  node: FigmaNode,
  shadows: Map<string, ExtractedShadow>,
  parentPath: string = ''
): void {
  const nodePath = parentPath ? `${parentPath} > ${node.name}` : node.name;

  if ('effects' in node && Array.isArray(node.effects)) {
    for (const effect of node.effects) {
      if (
        (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') &&
        effect.visible &&
        effect.color
      ) {
        const key = `${effect.type}-${rgbaToHex(effect.color)}-${effect.offset?.x || 0}-${effect.offset?.y || 0}-${effect.radius}`;
        
        if (shadows.has(key)) {
          const existing = shadows.get(key)!;
          existing.usage.push(nodePath);
          existing.nodeIds.push(node.id);
        } else {
          shadows.set(key, {
            type: effect.type,
            color: rgbaToHex(effect.color),
            offset: effect.offset || { x: 0, y: 0 },
            blur: effect.radius,
            spread: effect.spread || 0,
            usage: [nodePath],
            nodeIds: [node.id],
          });
        }
      }
    }
  }

  // Recurse into children
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractShadowsFromNode(child, shadows, nodePath);
    }
  }
}

/**
 * Main function to extract all design tokens from a Figma document
 */
export function extractDesignTokens(
  document: FigmaNode,
  fileKey: string,
  fileName: string
): DesignTokens {
  const colors = new Map<string, ExtractedColor>();
  const typography = new Map<string, ExtractedTypography>();
  const spacing = new Map<number, ExtractedSpacing>();
  const borderRadius = new Map<string, ExtractedBorderRadius>();
  const shadowsMap = new Map<string, ExtractedShadow>();

  // Extract from document
  extractColorsFromNode(document, colors);
  extractTypographyFromNode(document, typography);
  extractSpacingFromNode(document, spacing);
  extractBorderRadiusFromNode(document, borderRadius);
  extractShadowsFromNode(document, shadowsMap);

  // Sort colors by usage count (most used first)
  const sortedColors = Array.from(colors.values()).sort(
    (a, b) => b.usage.length - a.usage.length
  );

  // Sort typography by font size (largest first)
  const sortedTypography = Array.from(typography.values()).sort(
    (a, b) => b.fontSize - a.fontSize
  );

  // Sort spacing by value
  const sortedSpacing = Array.from(spacing.values()).sort(
    (a, b) => a.value - b.value
  );

  // Sort border radius by value
  const sortedBorderRadius = Array.from(borderRadius.values()).sort((a, b) => {
    const aVal = Array.isArray(a.value) ? a.value[0] : a.value;
    const bVal = Array.isArray(b.value) ? b.value[0] : b.value;
    return aVal - bVal;
  });

  // Sort shadows by blur radius
  const sortedShadows = Array.from(shadowsMap.values()).sort(
    (a, b) => a.blur - b.blur
  );

  return {
    colors: sortedColors,
    typography: sortedTypography,
    spacing: sortedSpacing,
    borderRadius: sortedBorderRadius,
    shadows: sortedShadows,
    extractedAt: new Date().toISOString(),
    fileKey,
    fileName,
  };
}

/**
 * Generate Tailwind config from extracted tokens
 */
export function generateTailwindConfig(tokens: DesignTokens): string {
  const colorEntries = tokens.colors
    .slice(0, 20) // Top 20 colors
    .map((c, i) => `        '${c.name}-${i}': '${c.hex}',`)
    .join('\n');

  const spacingEntries = tokens.spacing
    .map((s) => `        '${s.value}': '${s.value}px',`)
    .join('\n');

  const radiusEntries = tokens.borderRadius
    .filter((r) => !Array.isArray(r.value))
    .map((r) => `        '${r.value}': '${r.value}px',`)
    .join('\n');

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${colorEntries}
      },
      spacing: {
${spacingEntries}
      },
      borderRadius: {
${radiusEntries}
      },
    },
  },
};`;
}

/**
 * Generate CSS variables from extracted tokens
 */
export function generateCSSVariables(tokens: DesignTokens): string {
  const lines = [':root {'];

  // Colors
  lines.push('  /* Colors */');
  tokens.colors.slice(0, 20).forEach((c, i) => {
    lines.push(`  --color-${c.name}-${i}: ${c.hex};`);
  });

  // Typography
  lines.push('\n  /* Typography */');
  tokens.typography.forEach((t, i) => {
    lines.push(`  --font-size-${i}: ${t.fontSize}px;`);
    lines.push(`  --font-weight-${i}: ${t.fontWeight};`);
    lines.push(`  --line-height-${i}: ${t.lineHeight}px;`);
  });

  // Spacing
  lines.push('\n  /* Spacing */');
  tokens.spacing.forEach((s) => {
    lines.push(`  --spacing-${s.value}: ${s.value}px;`);
  });

  // Border radius
  lines.push('\n  /* Border Radius */');
  tokens.borderRadius.filter((r) => !Array.isArray(r.value)).forEach((r) => {
    lines.push(`  --radius-${r.value}: ${r.value}px;`);
  });

  lines.push('}');
  return lines.join('\n');
}

export default {
  extractDesignTokens,
  generateTailwindConfig,
  generateCSSVariables,
  rgbaToHex,
  hexToRgba,
};
