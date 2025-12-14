/**
 * Figma API Types
 * Based on Figma REST API v1
 */

// ============================================
// Core Figma Node Types
// ============================================

export type NodeType =
  | 'DOCUMENT'
  | 'CANVAS'
  | 'FRAME'
  | 'GROUP'
  | 'VECTOR'
  | 'BOOLEAN_OPERATION'
  | 'STAR'
  | 'LINE'
  | 'ELLIPSE'
  | 'REGULAR_POLYGON'
  | 'RECTANGLE'
  | 'TEXT'
  | 'SLICE'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE'
  | 'STICKY'
  | 'SHAPE_WITH_TEXT'
  | 'CONNECTOR'
  | 'SECTION';

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaVector {
  x: number;
  y: number;
}

export interface FigmaRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaPaint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  blendMode?: string;
  gradientHandlePositions?: FigmaVector[];
  gradientStops?: Array<{
    position: number;
    color: FigmaColor;
  }>;
  scaleMode?: string;
  imageRef?: string;
}

export interface FigmaEffect {
  type: 'INNER_SHADOW' | 'DROP_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible: boolean;
  radius: number;
  color?: FigmaColor;
  blendMode?: string;
  offset?: FigmaVector;
  spread?: number;
}

export interface FigmaTypeStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  fontWeight: number;
  fontSize: number;
  textAlignHorizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED';
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
  letterSpacing: number;
  lineHeightPx: number;
  lineHeightPercent?: number;
  lineHeightPercentFontSize?: number;
  lineHeightUnit: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
}

export interface FigmaConstraint {
  type: 'SCALE' | 'WIDTH' | 'HEIGHT';
  value: number;
}

export interface FigmaLayoutConstraint {
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
}

// ============================================
// Figma Node Structure
// ============================================

export interface FigmaBaseNode {
  id: string;
  name: string;
  type: NodeType;
  visible?: boolean;
  pluginData?: Record<string, string>;
  sharedPluginData?: Record<string, Record<string, string>>;
}

export interface FigmaSceneNode extends FigmaBaseNode {
  locked?: boolean;
  exportSettings?: FigmaExportSetting[];
  blendMode?: string;
  preserveRatio?: boolean;
  layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
  layoutGrow?: number;
  constraints?: FigmaLayoutConstraint;
  transitionNodeID?: string;
  transitionDuration?: number;
  transitionEasing?: string;
  opacity?: number;
  absoluteBoundingBox?: FigmaRectangle;
  absoluteRenderBounds?: FigmaRectangle;
  effects?: FigmaEffect[];
  size?: FigmaVector;
  relativeTransform?: number[][];
  isMask?: boolean;
}

export interface FigmaFrameNode extends FigmaSceneNode {
  type: 'FRAME' | 'GROUP' | 'COMPONENT' | 'COMPONENT_SET' | 'INSTANCE';
  children?: FigmaNode[];
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
  itemSpacing?: number;
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE';
  clipsContent?: boolean;
  background?: FigmaPaint[];
  backgroundColor?: FigmaColor;
}

export interface FigmaTextNode extends FigmaSceneNode {
  type: 'TEXT';
  characters: string;
  style?: FigmaTypeStyle;
  characterStyleOverrides?: number[];
  styleOverrideTable?: Record<number, Partial<FigmaTypeStyle>>;
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
}

export interface FigmaVectorNode extends FigmaSceneNode {
  type: 'VECTOR' | 'BOOLEAN_OPERATION' | 'STAR' | 'LINE' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'RECTANGLE';
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  strokeCap?: 'NONE' | 'ROUND' | 'SQUARE' | 'LINE_ARROW' | 'TRIANGLE_ARROW';
  strokeJoin?: 'MITER' | 'BEVEL' | 'ROUND';
  strokeDashes?: number[];
  fillGeometry?: any[];
  strokeGeometry?: any[];
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
}

export interface FigmaComponentNode extends FigmaFrameNode {
  type: 'COMPONENT';
  componentPropertyDefinitions?: Record<string, FigmaComponentPropertyDefinition>;
}

export interface FigmaInstanceNode extends FigmaFrameNode {
  type: 'INSTANCE';
  componentId: string;
  componentProperties?: Record<string, FigmaComponentProperty>;
}

export type FigmaNode = 
  | FigmaFrameNode 
  | FigmaTextNode 
  | FigmaVectorNode 
  | FigmaComponentNode 
  | FigmaInstanceNode
  | FigmaSceneNode;

// ============================================
// Component Properties
// ============================================

export interface FigmaComponentPropertyDefinition {
  type: 'BOOLEAN' | 'INSTANCE_SWAP' | 'TEXT' | 'VARIANT';
  defaultValue: boolean | string;
  variantOptions?: string[];
}

export interface FigmaComponentProperty {
  type: 'BOOLEAN' | 'INSTANCE_SWAP' | 'TEXT';
  value: boolean | string;
}

// ============================================
// Export Settings
// ============================================

export interface FigmaExportSetting {
  suffix: string;
  format: 'JPG' | 'PNG' | 'SVG' | 'PDF';
  constraint: FigmaConstraint;
}

// ============================================
// File & Document Types
// ============================================

export interface FigmaDocument {
  id: string;
  name: string;
  type: 'DOCUMENT';
  children: FigmaCanvasNode[];
}

export interface FigmaCanvasNode extends FigmaBaseNode {
  type: 'CANVAS';
  children: FigmaNode[];
  backgroundColor: FigmaColor;
  prototypeStartNodeID?: string;
  flowStartingPoints?: Array<{
    nodeId: string;
    name: string;
  }>;
}

export interface FigmaFile {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl?: string;
  version: string;
  document: FigmaDocument;
  components: Record<string, FigmaComponentMetadata>;
  componentSets: Record<string, FigmaComponentSetMetadata>;
  schemaVersion: number;
  styles: Record<string, FigmaStyle>;
  mainFileKey?: string;
}

export interface FigmaComponentMetadata {
  key: string;
  name: string;
  description: string;
  documentationLinks?: Array<{ uri: string }>;
  remote?: boolean;
  componentSetId?: string;
}

export interface FigmaComponentSetMetadata {
  key: string;
  name: string;
  description: string;
  documentationLinks?: Array<{ uri: string }>;
  remote?: boolean;
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  remote?: boolean;
  description?: string;
}

// ============================================
// API Response Types
// ============================================

export interface FigmaFileResponse {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl?: string;
  version: string;
  document: FigmaDocument;
  components: Record<string, FigmaComponentMetadata>;
  componentSets: Record<string, FigmaComponentSetMetadata>;
  schemaVersion: number;
  styles: Record<string, FigmaStyle>;
}

export interface FigmaNodesResponse {
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
  version: string;
  nodes: Record<string, {
    document: FigmaNode;
    components: Record<string, FigmaComponentMetadata>;
    schemaVersion: number;
    styles: Record<string, FigmaStyle>;
  }>;
}

export interface FigmaImagesResponse {
  err: string | null;
  images: Record<string, string | null>;
}

export interface FigmaImageFillsResponse {
  err: string | null;
  meta: {
    images: Record<string, string>;
  };
}

export interface FigmaCommentsResponse {
  comments: FigmaComment[];
}

export interface FigmaComment {
  id: string;
  uuid?: string;
  file_key: string;
  parent_id?: string;
  user: FigmaUser;
  created_at: string;
  resolved_at?: string;
  message: string;
  client_meta?: FigmaVector | FigmaFrameOffset;
  order_id?: string;
}

export interface FigmaFrameOffset {
  node_id: string;
  node_offset: FigmaVector;
}

export interface FigmaUser {
  id: string;
  handle: string;
  img_url: string;
  email?: string;
}

export interface FigmaProjectsResponse {
  name: string;
  projects: FigmaProject[];
}

export interface FigmaProject {
  id: number;
  name: string;
}

export interface FigmaProjectFilesResponse {
  name: string;
  files: FigmaProjectFile[];
}

export interface FigmaProjectFile {
  key: string;
  name: string;
  thumbnail_url?: string;
  last_modified: string;
}

export interface FigmaVersionsResponse {
  versions: FigmaVersion[];
  pagination: {
    prev_page?: string;
    next_page?: string;
  };
}

export interface FigmaVersion {
  id: string;
  created_at: string;
  label?: string;
  description?: string;
  user: FigmaUser;
  thumbnail_url?: string;
}

// ============================================
// Extracted Design Token Types
// ============================================

export interface ExtractedColor {
  name: string;
  hex: string;
  rgba: FigmaColor;
  usage: string[];
  nodeIds: string[];
}

export interface ExtractedTypography {
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  usage: string[];
  nodeIds: string[];
}

export interface ExtractedSpacing {
  value: number;
  usage: string[];
  nodeIds: string[];
}

export interface ExtractedBorderRadius {
  value: number | [number, number, number, number];
  usage: string[];
  nodeIds: string[];
}

export interface ExtractedShadow {
  type: 'DROP_SHADOW' | 'INNER_SHADOW';
  color: string;
  offset: FigmaVector;
  blur: number;
  spread: number;
  usage: string[];
  nodeIds: string[];
}

export interface DesignTokens {
  colors: ExtractedColor[];
  typography: ExtractedTypography[];
  spacing: ExtractedSpacing[];
  borderRadius: ExtractedBorderRadius[];
  shadows: ExtractedShadow[];
  extractedAt: string;
  fileKey: string;
  fileName: string;
}

// ============================================
// Component Analysis Types
// ============================================

export interface ComponentAnalysis {
  id: string;
  name: string;
  type: NodeType;
  bounds: FigmaRectangle;
  styles: {
    fills: FigmaPaint[];
    strokes: FigmaPaint[];
    effects: FigmaEffect[];
    typography?: FigmaTypeStyle;
  };
  layout?: {
    mode: string;
    padding: { top: number; right: number; bottom: number; left: number };
    gap: number;
    alignment: { primary: string; counter: string };
  };
  children: ComponentAnalysis[];
  tailwindClasses: string[];
  reactCode?: string;
}

export interface ScreenAnalysis {
  name: string;
  nodeId: string;
  dimensions: { width: number; height: number };
  components: ComponentAnalysis[];
  colorPalette: ExtractedColor[];
  typography: ExtractedTypography[];
  exportUrl?: string;
}
