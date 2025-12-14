/**
 * Figma API Client
 * Handles all communication with Figma's REST API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  FigmaFileResponse,
  FigmaNodesResponse,
  FigmaImagesResponse,
  FigmaCommentsResponse,
  FigmaProjectsResponse,
  FigmaProjectFilesResponse,
  FigmaVersionsResponse,
  FigmaImageFillsResponse,
} from './types.js';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

export interface FigmaClientConfig {
  accessToken: string;
  timeout?: number;
}

export class FigmaAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'FigmaAPIError';
  }
}

export class FigmaClient {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(config: FigmaClientConfig) {
    this.accessToken = config.accessToken;
    
    this.client = axios.create({
      baseURL: FIGMA_API_BASE,
      timeout: config.timeout || 30000,
      headers: {
        'X-Figma-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          throw new FigmaAPIError(
            `Figma API Error: ${error.response.statusText}`,
            error.response.status,
            error.response.data
          );
        }
        throw new FigmaAPIError(`Network Error: ${error.message}`);
      }
    );
  }

  /**
   * Get a Figma file by key
   */
  async getFile(
    fileKey: string,
    options?: {
      version?: string;
      ids?: string[];
      depth?: number;
      geometry?: 'paths' | 'bounds';
      plugin_data?: string;
      branch_data?: boolean;
    }
  ): Promise<FigmaFileResponse> {
    const params = new URLSearchParams();
    
    if (options?.version) params.append('version', options.version);
    if (options?.ids) params.append('ids', options.ids.join(','));
    if (options?.depth) params.append('depth', options.depth.toString());
    if (options?.geometry) params.append('geometry', options.geometry);
    if (options?.plugin_data) params.append('plugin_data', options.plugin_data);
    if (options?.branch_data) params.append('branch_data', 'true');

    const url = `/files/${fileKey}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.client.get<FigmaFileResponse>(url);
    return response.data;
  }

  /**
   * Get specific nodes from a file
   */
  async getFileNodes(
    fileKey: string,
    nodeIds: string[],
    options?: {
      version?: string;
      depth?: number;
      geometry?: 'paths' | 'bounds';
      plugin_data?: string;
    }
  ): Promise<FigmaNodesResponse> {
    const params = new URLSearchParams();
    params.append('ids', nodeIds.join(','));
    
    if (options?.version) params.append('version', options.version);
    if (options?.depth) params.append('depth', options.depth.toString());
    if (options?.geometry) params.append('geometry', options.geometry);
    if (options?.plugin_data) params.append('plugin_data', options.plugin_data);

    const response = await this.client.get<FigmaNodesResponse>(
      `/files/${fileKey}/nodes?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Export images from a file
   */
  async getImages(
    fileKey: string,
    nodeIds: string[],
    options?: {
      scale?: number;
      format?: 'jpg' | 'png' | 'svg' | 'pdf';
      svg_include_id?: boolean;
      svg_include_node_id?: boolean;
      svg_simplify_stroke?: boolean;
      use_absolute_bounds?: boolean;
      version?: string;
    }
  ): Promise<FigmaImagesResponse> {
    const params = new URLSearchParams();
    params.append('ids', nodeIds.join(','));
    
    if (options?.scale) params.append('scale', options.scale.toString());
    if (options?.format) params.append('format', options.format);
    if (options?.svg_include_id) params.append('svg_include_id', 'true');
    if (options?.svg_include_node_id) params.append('svg_include_node_id', 'true');
    if (options?.svg_simplify_stroke) params.append('svg_simplify_stroke', 'true');
    if (options?.use_absolute_bounds) params.append('use_absolute_bounds', 'true');
    if (options?.version) params.append('version', options.version);

    const response = await this.client.get<FigmaImagesResponse>(
      `/images/${fileKey}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get image fills for a file
   */
  async getImageFills(fileKey: string): Promise<FigmaImageFillsResponse> {
    const response = await this.client.get<FigmaImageFillsResponse>(
      `/files/${fileKey}/images`
    );
    return response.data;
  }

  /**
   * Get comments on a file
   */
  async getComments(
    fileKey: string,
    options?: {
      as_md?: boolean;
    }
  ): Promise<FigmaCommentsResponse> {
    const params = new URLSearchParams();
    if (options?.as_md) params.append('as_md', 'true');

    const url = `/files/${fileKey}/comments${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.client.get<FigmaCommentsResponse>(url);
    return response.data;
  }

  /**
   * Post a comment on a file
   */
  async postComment(
    fileKey: string,
    message: string,
    options?: {
      client_meta?: { x: number; y: number } | { node_id: string; node_offset: { x: number; y: number } };
      comment_id?: string;
    }
  ): Promise<any> {
    const body: any = { message };
    if (options?.client_meta) body.client_meta = options.client_meta;
    if (options?.comment_id) body.comment_id = options.comment_id;

    const response = await this.client.post(`/files/${fileKey}/comments`, body);
    return response.data;
  }

  /**
   * Get team projects
   */
  async getTeamProjects(teamId: string): Promise<FigmaProjectsResponse> {
    const response = await this.client.get<FigmaProjectsResponse>(
      `/teams/${teamId}/projects`
    );
    return response.data;
  }

  /**
   * Get project files
   */
  async getProjectFiles(
    projectId: string,
    options?: {
      branch_data?: boolean;
    }
  ): Promise<FigmaProjectFilesResponse> {
    const params = new URLSearchParams();
    if (options?.branch_data) params.append('branch_data', 'true');

    const url = `/projects/${projectId}/files${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.client.get<FigmaProjectFilesResponse>(url);
    return response.data;
  }

  /**
   * Get file versions
   */
  async getFileVersions(
    fileKey: string,
    options?: {
      page_size?: number;
      before?: number;
      after?: number;
    }
  ): Promise<FigmaVersionsResponse> {
    const params = new URLSearchParams();
    if (options?.page_size) params.append('page_size', options.page_size.toString());
    if (options?.before) params.append('before', options.before.toString());
    if (options?.after) params.append('after', options.after.toString());

    const url = `/files/${fileKey}/versions${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.client.get<FigmaVersionsResponse>(url);
    return response.data;
  }

  /**
   * Get component sets
   */
  async getFileComponentSets(fileKey: string): Promise<any> {
    const response = await this.client.get(`/files/${fileKey}/component_sets`);
    return response.data;
  }

  /**
   * Get file components
   */
  async getFileComponents(fileKey: string): Promise<any> {
    const response = await this.client.get(`/files/${fileKey}/components`);
    return response.data;
  }

  /**
   * Get file styles
   */
  async getFileStyles(fileKey: string): Promise<any> {
    const response = await this.client.get(`/files/${fileKey}/styles`);
    return response.data;
  }

  /**
   * Utility: Extract file key from Figma URL
   */
  static extractFileKey(url: string): string | null {
    // Handle various Figma URL formats
    const patterns = [
      /figma\.com\/file\/([a-zA-Z0-9]+)/,
      /figma\.com\/design\/([a-zA-Z0-9]+)/,
      /figma\.com\/proto\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    // If it's already just a key
    if (/^[a-zA-Z0-9]+$/.test(url)) {
      return url;
    }

    return null;
  }

  /**
   * Utility: Extract node ID from Figma URL
   */
  static extractNodeId(url: string): string | null {
    const match = url.match(/node-id=([^&]+)/);
    if (match) {
      // Decode URL-encoded node ID (e.g., 1%3A2 -> 1:2)
      return decodeURIComponent(match[1]);
    }
    return null;
  }
}

export default FigmaClient;
