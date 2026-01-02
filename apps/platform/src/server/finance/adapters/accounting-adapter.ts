/**
 * Accounting Adapter
 *
 * Interface for accounting system data (QuickBooks, Xero).
 * Stub implementation for Phase 2 integration.
 * READ-ONLY: Never writes to accounting systems.
 */

import type { AccountingData } from '../types';

export type AccountingSource = 'quickbooks' | 'xero' | 'manual' | 'stub';

export interface AccountingAdapterConfig {
  source: AccountingSource;
  quickbooksConfig?: {
    realmId: string;
    accessToken: string;
  };
  xeroConfig?: {
    tenantId: string;
    accessToken: string;
  };
}

export interface AccountingAdapterResult<T> {
  data: T | null;
  success: boolean;
  error?: string;
  source: AccountingSource;
  syncedAt: Date | null;
  lagHours: number;
  isStub: boolean;
  warnings: string[];
}

/**
 * Accounting Adapter for CFO Agent
 *
 * Provides read-only access to accounting system data.
 * Currently a stub - returns empty data with quality warnings.
 */
export class AccountingAdapter {
  private config: AccountingAdapterConfig;
  private lastSyncAt: Date | null = null;

  constructor(config: AccountingAdapterConfig) {
    this.config = config;
  }

  /**
   * Get trial balance for a period
   */
  async getTrialBalance(
    periodEnd: Date
  ): Promise<AccountingAdapterResult<Record<string, number>>> {
    if (this.config.source === 'stub') {
      return this.getStubTrialBalance();
    }

    switch (this.config.source) {
      case 'quickbooks':
        return this.getQuickBooksTrialBalance(periodEnd);
      case 'xero':
        return this.getXeroTrialBalance(periodEnd);
      default:
        return this.getStubTrialBalance();
    }
  }

  /**
   * Get P&L summary for a period
   */
  async getPnLSummary(
    startDate: Date,
    endDate: Date
  ): Promise<AccountingAdapterResult<AccountingData['pnlSummary']>> {
    if (this.config.source === 'stub') {
      return this.getStubPnL();
    }

    // TODO: Implement actual accounting API calls
    return this.getStubPnL();
  }

  /**
   * Get balance sheet as of a date
   */
  async getBalanceSheet(
    asOfDate: Date
  ): Promise<AccountingAdapterResult<AccountingData['balanceSheet']>> {
    if (this.config.source === 'stub') {
      return this.getStubBalanceSheet();
    }

    // TODO: Implement actual accounting API calls
    return this.getStubBalanceSheet();
  }

  /**
   * Get AR aging report
   */
  async getARaging(
    asOfDate: Date
  ): Promise<AccountingAdapterResult<Record<string, number>>> {
    if (this.config.source === 'stub') {
      return this.getStubARAging();
    }

    // TODO: Implement actual accounting API calls
    return this.getStubARAging();
  }

  /**
   * Get AP aging report
   */
  async getAPaging(
    asOfDate: Date
  ): Promise<AccountingAdapterResult<Record<string, number>>> {
    if (this.config.source === 'stub') {
      return this.getStubAPAging();
    }

    // TODO: Implement actual accounting API calls
    return this.getStubAPAging();
  }

  /**
   * Get complete accounting data for a period
   */
  async getAccountingData(
    startDate: Date,
    endDate: Date
  ): Promise<AccountingAdapterResult<AccountingData>> {
    const [trialBalance, pnl, balanceSheet, arAging, apAging] = await Promise.all([
      this.getTrialBalance(endDate),
      this.getPnLSummary(startDate, endDate),
      this.getBalanceSheet(endDate),
      this.getARaging(endDate),
      this.getAPaging(endDate),
    ]);

    const warnings = [
      ...trialBalance.warnings,
      ...pnl.warnings,
      ...balanceSheet.warnings,
      ...arAging.warnings,
      ...apAging.warnings,
    ];

    const isStub = trialBalance.isStub || pnl.isStub || balanceSheet.isStub;

    const data: AccountingData = {
      period: `${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`,
      trialBalance: trialBalance.data || {},
      pnlSummary: pnl.data || {
        revenue: 0,
        cogs: 0,
        grossProfit: 0,
        operatingExpenses: 0,
        netIncome: 0,
      },
      balanceSheet: balanceSheet.data || {
        assets: 0,
        liabilities: 0,
        equity: 0,
      },
      arAging: arAging.data || {},
      apAging: apAging.data || {},
      source: this.config.source,
      syncedAt: isStub ? null : new Date(),
    };

    return {
      data,
      success: true,
      source: this.config.source,
      syncedAt: isStub ? null : new Date(),
      lagHours: isStub ? 999 : 0,
      isStub,
      warnings,
    };
  }

  // =============================================================================
  // STUB IMPLEMENTATIONS
  // =============================================================================

  private getStubTrialBalance(): AccountingAdapterResult<Record<string, number>> {
    return {
      data: {},
      success: true,
      source: 'stub',
      syncedAt: null,
      lagHours: 999,
      isStub: true,
      warnings: ['Accounting system not connected - trial balance unavailable'],
    };
  }

  private getStubPnL(): AccountingAdapterResult<AccountingData['pnlSummary']> {
    return {
      data: {
        revenue: 0,
        cogs: 0,
        grossProfit: 0,
        operatingExpenses: 0,
        netIncome: 0,
      },
      success: true,
      source: 'stub',
      syncedAt: null,
      lagHours: 999,
      isStub: true,
      warnings: ['Accounting system not connected - P&L unavailable'],
    };
  }

  private getStubBalanceSheet(): AccountingAdapterResult<AccountingData['balanceSheet']> {
    return {
      data: {
        assets: 0,
        liabilities: 0,
        equity: 0,
      },
      success: true,
      source: 'stub',
      syncedAt: null,
      lagHours: 999,
      isStub: true,
      warnings: ['Accounting system not connected - balance sheet unavailable'],
    };
  }

  private getStubARAging(): AccountingAdapterResult<Record<string, number>> {
    return {
      data: {},
      success: true,
      source: 'stub',
      syncedAt: null,
      lagHours: 999,
      isStub: true,
      warnings: ['Accounting system not connected - AR aging unavailable'],
    };
  }

  private getStubAPAging(): AccountingAdapterResult<Record<string, number>> {
    return {
      data: {},
      success: true,
      source: 'stub',
      syncedAt: null,
      lagHours: 999,
      isStub: true,
      warnings: ['Accounting system not connected - AP aging unavailable'],
    };
  }

  // =============================================================================
  // QUICKBOOKS IMPLEMENTATIONS (TODO)
  // =============================================================================

  private async getQuickBooksTrialBalance(
    periodEnd: Date
  ): Promise<AccountingAdapterResult<Record<string, number>>> {
    // TODO: Implement QuickBooks API integration
    return this.getStubTrialBalance();
  }

  // =============================================================================
  // XERO IMPLEMENTATIONS (TODO)
  // =============================================================================

  private async getXeroTrialBalance(
    periodEnd: Date
  ): Promise<AccountingAdapterResult<Record<string, number>>> {
    // TODO: Implement Xero API integration
    return this.getStubTrialBalance();
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): {
    lastSyncAt: Date | null;
    lagHours: number;
    source: AccountingSource;
    isConnected: boolean;
  } {
    return {
      lastSyncAt: this.lastSyncAt,
      lagHours: this.lastSyncAt
        ? Math.floor((Date.now() - this.lastSyncAt.getTime()) / 3600000)
        : 999,
      source: this.config.source,
      isConnected: this.config.source !== 'stub',
    };
  }
}
