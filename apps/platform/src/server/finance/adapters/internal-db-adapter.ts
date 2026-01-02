/**
 * Internal DB Adapter
 *
 * Reads business data from Supabase for CFO Agent analysis.
 * Provides GMV, appointments, customers, and promos data.
 * READ-ONLY: Never modifies business tables.
 */

import type { InternalMetrics, Segment } from '../types';

export interface InternalDBAdapterConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
}

export interface InternalDBAdapterResult<T> {
  data: T | null;
  success: boolean;
  error?: string;
  syncedAt: Date;
  lagMinutes: number;
}

/**
 * Internal DB Adapter for CFO Agent
 *
 * Provides read-only access to internal business data.
 */
export class InternalDBAdapter {
  private config: InternalDBAdapterConfig;
  private lastSyncAt: Date | null = null;

  constructor(config: InternalDBAdapterConfig) {
    this.config = config;
  }

  /**
   * Get segment configuration
   */
  async getSegment(segmentId: string): Promise<InternalDBAdapterResult<Segment>> {
    try {
      // TODO: Implement actual Supabase query
      // const { data, error } = await supabase
      //   .from('finance.segments')
      //   .select('*')
      //   .eq('segment_id', segmentId)
      //   .single();

      this.lastSyncAt = new Date();

      // Return Direct Cuts marketplace default for now
      const segment: Segment = {
        segmentId: 'direct_cuts_marketplace',
        type: 'marketplace',
        merchantOfRecord: false,
        financePolicyVersion: 'v1',
        currency: 'USD',
        enabled: true,
        updatedAt: new Date(),
      };

      return {
        data: segment,
        success: true,
        syncedAt: this.lastSyncAt,
        lagMinutes: 0,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        syncedAt: new Date(),
        lagMinutes: this.calculateLagMinutes(),
      };
    }
  }

  /**
   * Get all enabled segments
   */
  async getSegments(): Promise<InternalDBAdapterResult<Segment[]>> {
    try {
      // TODO: Implement actual Supabase query
      this.lastSyncAt = new Date();

      const segments: Segment[] = [
        {
          segmentId: 'direct_cuts_marketplace',
          type: 'marketplace',
          merchantOfRecord: false,
          financePolicyVersion: 'v1',
          currency: 'USD',
          enabled: true,
          updatedAt: new Date(),
        },
      ];

      return {
        data: segments,
        success: true,
        syncedAt: this.lastSyncAt,
        lagMinutes: 0,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        syncedAt: new Date(),
        lagMinutes: this.calculateLagMinutes(),
      };
    }
  }

  /**
   * Get internal metrics for a period
   */
  async getInternalMetrics(
    segmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<InternalDBAdapterResult<InternalMetrics>> {
    try {
      // TODO: Implement actual Supabase queries for:
      // - appointments (completed, cancelled, no-show, gmv, platform_take)
      // - customers (new, returning, churned)
      // - promos (service_discounts, fee_waivers, total_value)

      this.lastSyncAt = new Date();

      const metrics: InternalMetrics = {
        period: `${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`,
        appointments: {
          completed: 0,
          cancelled: 0,
          noShow: 0,
          gmv: 0,
          platformTake: 0,
        },
        customers: {
          new: 0,
          returning: 0,
          churned: 0,
        },
        promos: {
          serviceDiscounts: 0,
          feeWaivers: 0,
          totalValue: 0,
        },
        syncedAt: this.lastSyncAt,
      };

      return {
        data: metrics,
        success: true,
        syncedAt: this.lastSyncAt,
        lagMinutes: 0,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        syncedAt: new Date(),
        lagMinutes: this.calculateLagMinutes(),
      };
    }
  }

  /**
   * Get GMV breakdown for a period
   */
  async getGMVBreakdown(
    segmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<InternalDBAdapterResult<{
    totalGMV: number;
    platformTake: number;
    payoutAmount: number;
    promoDeductions: number;
  }>> {
    try {
      // TODO: Implement actual Supabase query
      this.lastSyncAt = new Date();

      return {
        data: {
          totalGMV: 0,
          platformTake: 0,
          payoutAmount: 0,
          promoDeductions: 0,
        },
        success: true,
        syncedAt: this.lastSyncAt,
        lagMinutes: 0,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        syncedAt: new Date(),
        lagMinutes: this.calculateLagMinutes(),
      };
    }
  }

  /**
   * Get customer cohort data
   */
  async getCohortData(
    segmentId: string,
    cohortMonth: string
  ): Promise<InternalDBAdapterResult<{
    cohortSize: number;
    retentionDay7: number;
    retentionDay30: number;
    retentionDay90: number;
    ltv: number;
  }>> {
    try {
      // TODO: Implement actual Supabase query
      this.lastSyncAt = new Date();

      return {
        data: {
          cohortSize: 0,
          retentionDay7: 0,
          retentionDay30: 0,
          retentionDay90: 0,
          ltv: 0,
        },
        success: true,
        syncedAt: this.lastSyncAt,
        lagMinutes: 0,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        syncedAt: new Date(),
        lagMinutes: this.calculateLagMinutes(),
      };
    }
  }

  /**
   * Calculate sync lag in minutes
   */
  private calculateLagMinutes(): number {
    if (!this.lastSyncAt) return 999;
    return Math.floor((Date.now() - this.lastSyncAt.getTime()) / 60000);
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): { lastSyncAt: Date | null; lagMinutes: number } {
    return {
      lastSyncAt: this.lastSyncAt,
      lagMinutes: this.calculateLagMinutes(),
    };
  }
}
