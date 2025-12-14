/**
 * Component Analyzer
 * Analyzes Figma components and generates React/Tailwind code
 */

import {
  FigmaNode,
  FigmaFrameNode,
  FigmaTextNode,
  FigmaVectorNode,
  FigmaColor,
  FigmaPaint,
  FigmaEffect,
  FigmaTypeStyle,
  ComponentAnalysis,
  ScreenAnalysis,
} from './types.js';
import { rgbaToHex } from './token-extractor.js';

/**
 * Convert Figma color to Tailwind class
 */
function colorToTailwind(color: FigmaColor, prefix: 'bg' | 'text' | 'border' = 'bg'): string {
  const hex = rgbaToHex(color).toLowerCase();
  
  // Map common colors to Tailwind
  const colorMap: Record<string, string> = {
    '#ffffff': 'white',
    '#000000': 'black',
    '#e63946': 'brand-red',
    '#1a1a1a': 'surface-primary',
    '#2d2d2d': 'surface-secondary',
    '#3d3d3d': 'surface-elevated',
    '#ffd700': 'gold',
    '#9ca3af': 'gray-400',
    '#6b7280': 'gray-500',
    '#4b5563': 'gray-600',
    '#374151': 'gray-700',
    '#1f2937': 'gray-800',
    '#111827': 'gray-900',
    '#ef4444': 'red-500',
    '#22c55e': 'green-500',
    '#3b82f6': 'blue-500',
  };

  const mappedColor = colorMap[hex];
  if (mappedColor) {
    return `${prefix}-${mappedColor}`;
  }

  // Return arbitrary value for unknown colors
  return `${prefix}-[${hex}]`;
}

/**
 * Convert Figma font weight to Tailwind class
 */
function fontWeightToTailwind(weight: number): string {
  const weightMap: Record<number, string> = {
    100: 'font-thin',
    200: 'font-extralight',
    300: 'font-light',
    400: 'font-normal',
    500: 'font-medium',
    600: 'font-semibold',
    700: 'font-bold',
    800: 'font-extrabold',
    900: 'font-black',
  };
  return weightMap[weight] || 'font-normal';
}

/**
 * Convert Figma font size to Tailwind class
 */
function fontSizeToTailwind(size: number): string {
  const sizeMap: Record<number, string> = {
    12: 'text-xs',
    14: 'text-sm',
    16: 'text-base',
    18: 'text-lg',
    20: 'text-xl',
    24: 'text-2xl',
    30: 'text-3xl',
    36: 'text-4xl',
    48: 'text-5xl',
    60: 'text-6xl',
  };
  
  // Find closest match
  const sizes = Object.keys(sizeMap).map(Number);
  const closest = sizes.reduce((prev, curr) =>
    Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
  );
  
  return sizeMap[closest] || `text-[${size}px]`;
}

/**
 * Convert Figma border radius to Tailwind class
 */
function borderRadiusToTailwind(radius: number | [number, number, number, number]): string {
  if (Array.isArray(radius)) {
    // Check if all corners are the same
    if (radius.every((r) => r === radius[0])) {
      return borderRadiusToTailwind(radius[0]);
    }
    // Different corners - use arbitrary values
    return `rounded-[${radius[0]}px_${radius[1]}px_${radius[2]}px_${radius[3]}px]`;
  }

  const radiusMap: Record<number, string> = {
    0: 'rounded-none',
    2: 'rounded-sm',
    4: 'rounded',
    6: 'rounded-md',
    8: 'rounded-lg',
    12: 'rounded-xl',
    16: 'rounded-2xl',
    24: 'rounded-3xl',
    9999: 'rounded-full',
  };

  // Find closest match
  const radii = Object.keys(radiusMap).map(Number);
  const closest = radii.reduce((prev, curr) =>
    Math.abs(curr - radius) < Math.abs(prev - radius) ? curr : prev
  );

  if (Math.abs(closest - radius) <= 2) {
    return radiusMap[closest];
  }
  return `rounded-[${radius}px]`;
}

/**
 * Convert Figma spacing to Tailwind class
 */
function spacingToTailwind(value: number, prefix: 'p' | 'm' | 'gap' | 'w' | 'h'): string {
  // Tailwind spacing scale (in pixels)
  const scale: Record<number, string> = {
    0: '0',
    1: 'px',
    2: '0.5',
    4: '1',
    6: '1.5',
    8: '2',
    10: '2.5',
    12: '3',
    14: '3.5',
    16: '4',
    20: '5',
    24: '6',
    28: '7',
    32: '8',
    36: '9',
    40: '10',
    44: '11',
    48: '12',
    56: '14',
    64: '16',
    80: '20',
    96: '24',
  };

  // Find closest match
  const values = Object.keys(scale).map(Number);
  const closest = values.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );

  if (Math.abs(closest - value) <= 2) {
    return `${prefix}-${scale[closest]}`;
  }
  return `${prefix}-[${value}px]`;
}

/**
 * Convert Figma shadow to Tailwind class
 */
function shadowToTailwind(effects: FigmaEffect[]): string {
  const shadows = effects.filter(
    (e) => (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') && e.visible
  );

  if (shadows.length === 0) return '';

  const shadow = shadows[0];
  const blur = shadow.radius;

  if (blur <= 3) return 'shadow-sm';
  if (blur <= 6) return 'shadow';
  if (blur <= 10) return 'shadow-md';
  if (blur <= 15) return 'shadow-lg';
  if (blur <= 25) return 'shadow-xl';
  return 'shadow-2xl';
}

/**
 * Convert Figma layout mode to Tailwind flex classes
 */
function layoutToTailwind(node: FigmaFrameNode): string[] {
  const classes: string[] = [];

  if (node.layoutMode === 'HORIZONTAL') {
    classes.push('flex', 'flex-row');
  } else if (node.layoutMode === 'VERTICAL') {
    classes.push('flex', 'flex-col');
  }

  // Primary axis alignment
  if (node.primaryAxisAlignItems) {
    const alignMap: Record<string, string> = {
      MIN: 'justify-start',
      CENTER: 'justify-center',
      MAX: 'justify-end',
      SPACE_BETWEEN: 'justify-between',
    };
    if (alignMap[node.primaryAxisAlignItems]) {
      classes.push(alignMap[node.primaryAxisAlignItems]);
    }
  }

  // Counter axis alignment
  if (node.counterAxisAlignItems) {
    const alignMap: Record<string, string> = {
      MIN: 'items-start',
      CENTER: 'items-center',
      MAX: 'items-end',
      BASELINE: 'items-baseline',
    };
    if (alignMap[node.counterAxisAlignItems]) {
      classes.push(alignMap[node.counterAxisAlignItems]);
    }
  }

  // Item spacing (gap)
  if (node.itemSpacing && node.itemSpacing > 0) {
    classes.push(spacingToTailwind(node.itemSpacing, 'gap'));
  }

  return classes;
}

/**
 * Analyze a Figma node and generate Tailwind classes
 */
export function analyzeNode(node: FigmaNode, depth: number = 0): ComponentAnalysis {
  const classes: string[] = [];
  
  // Dimensions
  if (node.absoluteBoundingBox) {
    const { width, height } = node.absoluteBoundingBox;
    if (width > 0) classes.push(spacingToTailwind(width, 'w'));
    if (height > 0) classes.push(spacingToTailwind(height, 'h'));
  }

  // Background fills
  if ('fills' in node && Array.isArray(node.fills)) {
    const solidFill = node.fills.find((f) => f.type === 'SOLID' && f.visible !== false);
    if (solidFill?.color) {
      classes.push(colorToTailwind(solidFill.color, 'bg'));
    }
  }

  // Border/strokes
  if ('strokes' in node && Array.isArray(node.strokes)) {
    const solidStroke = node.strokes.find((s) => s.type === 'SOLID' && s.visible !== false);
    if (solidStroke?.color) {
      classes.push(colorToTailwind(solidStroke.color, 'border'));
      if ('strokeWeight' in node && node.strokeWeight) {
        classes.push(`border-${node.strokeWeight}`);
      }
    }
  }

  // Border radius
  if ('cornerRadius' in node && node.cornerRadius) {
    classes.push(borderRadiusToTailwind(node.cornerRadius));
  } else if ('rectangleCornerRadii' in node && node.rectangleCornerRadii) {
    classes.push(borderRadiusToTailwind(node.rectangleCornerRadii));
  }

  // Shadows
  if ('effects' in node && Array.isArray(node.effects)) {
    const shadowClass = shadowToTailwind(node.effects);
    if (shadowClass) classes.push(shadowClass);
  }

  // Layout (flexbox)
  if ('layoutMode' in node) {
    classes.push(...layoutToTailwind(node as FigmaFrameNode));
  }

  // Padding
  if ('paddingLeft' in node || 'paddingTop' in node) {
    const frameNode = node as FigmaFrameNode;
    
    // Check if all padding is the same
    const paddings = [
      frameNode.paddingTop,
      frameNode.paddingRight,
      frameNode.paddingBottom,
      frameNode.paddingLeft,
    ].filter((p): p is number => typeof p === 'number');

    if (paddings.length === 4 && paddings.every((p) => p === paddings[0]) && paddings[0] > 0) {
      classes.push(spacingToTailwind(paddings[0], 'p'));
    } else {
      if (frameNode.paddingTop && frameNode.paddingTop > 0) {
        classes.push(spacingToTailwind(frameNode.paddingTop, 'p').replace('p-', 'pt-'));
      }
      if (frameNode.paddingRight && frameNode.paddingRight > 0) {
        classes.push(spacingToTailwind(frameNode.paddingRight, 'p').replace('p-', 'pr-'));
      }
      if (frameNode.paddingBottom && frameNode.paddingBottom > 0) {
        classes.push(spacingToTailwind(frameNode.paddingBottom, 'p').replace('p-', 'pb-'));
      }
      if (frameNode.paddingLeft && frameNode.paddingLeft > 0) {
        classes.push(spacingToTailwind(frameNode.paddingLeft, 'p').replace('p-', 'pl-'));
      }
    }
  }

  // Text styling
  if (node.type === 'TEXT') {
    const textNode = node as FigmaTextNode;
    
    if (textNode.style) {
      classes.push(fontSizeToTailwind(textNode.style.fontSize));
      classes.push(fontWeightToTailwind(textNode.style.fontWeight));
    }

    // Text color
    if (textNode.fills) {
      const solidFill = textNode.fills.find((f) => f.type === 'SOLID' && f.visible !== false);
      if (solidFill?.color) {
        classes.push(colorToTailwind(solidFill.color, 'text'));
      }
    }
  }

  // Opacity
  if ('opacity' in node && typeof node.opacity === 'number' && node.opacity < 1) {
    const opacityPercent = Math.round(node.opacity * 100);
    classes.push(`opacity-${opacityPercent}`);
  }

  // Analyze children
  const children: ComponentAnalysis[] = [];
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      children.push(analyzeNode(child, depth + 1));
    }
  }

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    bounds: node.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 },
    styles: {
      fills: 'fills' in node ? (node.fills as FigmaPaint[]) || [] : [],
      strokes: 'strokes' in node ? (node.strokes as FigmaPaint[]) || [] : [],
      effects: 'effects' in node ? (node.effects as FigmaEffect[]) || [] : [],
      typography: node.type === 'TEXT' ? (node as FigmaTextNode).style : undefined,
    },
    layout:
      'layoutMode' in node
        ? {
            mode: (node as FigmaFrameNode).layoutMode || 'NONE',
            padding: {
              top: (node as FigmaFrameNode).paddingTop || 0,
              right: (node as FigmaFrameNode).paddingRight || 0,
              bottom: (node as FigmaFrameNode).paddingBottom || 0,
              left: (node as FigmaFrameNode).paddingLeft || 0,
            },
            gap: (node as FigmaFrameNode).itemSpacing || 0,
            alignment: {
              primary: (node as FigmaFrameNode).primaryAxisAlignItems || 'MIN',
              counter: (node as FigmaFrameNode).counterAxisAlignItems || 'MIN',
            },
          }
        : undefined,
    children,
    tailwindClasses: classes,
  };
}

/**
 * Generate React component code from analysis
 */
export function generateReactComponent(analysis: ComponentAnalysis, componentName?: string): string {
  const name = componentName || toPascalCase(analysis.name);
  const classes = analysis.tailwindClasses.join(' ');

  const childrenCode = analysis.children
    .map((child) => {
      if (child.type === 'TEXT') {
        const textClasses = child.tailwindClasses.join(' ');
        // Get text content if available
        return `      <span className="${textClasses}">{/* ${child.name} */}</span>`;
      }
      
      const childClasses = child.tailwindClasses.join(' ');
      if (child.children.length === 0) {
        return `      <div className="${childClasses}">{/* ${child.name} */}</div>`;
      }
      
      const nestedChildren = child.children
        .map((nested) => {
          const nestedClasses = nested.tailwindClasses.join(' ');
          return `        <div className="${nestedClasses}">{/* ${nested.name} */}</div>`;
        })
        .join('\n');
      
      return `      <div className="${childClasses}">\n${nestedChildren}\n      </div>`;
    })
    .join('\n');

  return `import React from 'react';

interface ${name}Props {
  className?: string;
}

export const ${name}: React.FC<${name}Props> = ({ className = '' }) => {
  return (
    <div className={\`${classes} \${className}\`}>
${childrenCode || '      {/* Content */}'}
    </div>
  );
};

export default ${name};
`;
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^./, (char) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Analyze a full screen/frame
 */
export function analyzeScreen(
  node: FigmaNode,
  name: string,
  nodeId: string
): ScreenAnalysis {
  const analysis = analyzeNode(node);
  
  // Extract unique colors from this screen
  const colorSet = new Map<string, { hex: string; rgba: FigmaColor; usage: string[] }>();
  
  function extractColors(comp: ComponentAnalysis, path: string = '') {
    const currentPath = path ? `${path} > ${comp.name}` : comp.name;
    
    for (const fill of comp.styles.fills) {
      if (fill.type === 'SOLID' && fill.color) {
        const hex = rgbaToHex(fill.color);
        if (!colorSet.has(hex)) {
          colorSet.set(hex, { hex, rgba: fill.color, usage: [currentPath] });
        } else {
          colorSet.get(hex)!.usage.push(currentPath);
        }
      }
    }
    
    for (const child of comp.children) {
      extractColors(child, currentPath);
    }
  }
  
  extractColors(analysis);
  
  const colors = Array.from(colorSet.values()).map((c) => ({
    name: 'extracted',
    hex: c.hex,
    rgba: c.rgba,
    usage: c.usage,
    nodeIds: [],
  }));

  return {
    name,
    nodeId,
    dimensions: {
      width: analysis.bounds.width,
      height: analysis.bounds.height,
    },
    components: [analysis],
    colorPalette: colors,
    typography: [],
  };
}

export default {
  analyzeNode,
  analyzeScreen,
  generateReactComponent,
};
