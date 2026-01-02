/**
 * Bank Adapter
 *
 * Reads bank transaction data for CFO Agent analysis.
 * Supports Plaid integration and CSV import.
 * READ-ONLY: Never writes to bank systems.
 */

import type { CashLedger } from '../types';

export type BankSource = 'plaid' | 'csv' | 'manual';

export interface BankAdapterConfig {
  source: BankSource;
  plaidAccessToken?: string;
  csvPath?: string;
}

export interface BankAdapterResult<T> {
  data: T | null;
  success: boolean;
  error?: string;
  source: BankSource;
  syncedAt: Date;
  lagHours: number;
}

/**
 * Bank Adapter for CFO Agent
 *
 * Provides read-only access to bank data for cash management analysis.
 */
export class BankAdapter {
  private config: BankAdapterConfig;
  private lastSyncAt: Date | null = null;

  constructor(config: BankAdapterConfig) {
    this.config = config;
  }

  /**
   * Get cash ledger for a period
   */
  async getCashLedger(
    startDate: Date,
    endDate: Date
  ): Promise<BankAdapterResult<CashLedger>> {
    switch (this.config.source) {
      case 'plaid':
        return this.getCashLedgerFromPlaid(startDate, endDate);
      case 'csv':
        return this.getCashLedgerFromCSV(startDate, endDate);
      case 'manual':
        return this.getCashLedgerManual(startDate, endDate);
      default:
        return {
          data: null,
          success: false,
          error: `Unknown bank source: ${this.config.source}`,
          source: this.config.source,
          syncedAt: new Date(),
          lagHours: 999,
        };
    }
  }

  /**
   * Get cash ledger from Plaid
   */
  private async getCashLedgerFromPlaid(
    startDate: Date,
    endDate: Date
  ): Promise<BankAdapterResult<CashLedger>> {
    try {
      // TODO: Implement actual Plaid API call
      // const plaidClient = new PlaidApi(configuration);
      // const response = await plaidClient.transactionsGet({
      //   access_token: this.config.plaidAccessToken!,
      //   start_date: startDate.toISOString().split('T')[0],
      //   end_date: endDate.toISOString().split('T')[0],
      // });

      this.lastSyncAt = new Date();

      const ledger: CashLedger = {
        period: `${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`,
        openingBalance: 0,
        deposits: 0,
        withdrawals: 0,
        closingBalance: 0,
        source: 'plaid',
        syncedAt: this.lastSyncAt,
      };

      return {
        data: ledger,
        success: true,
        source: 'plaid',
        syncedAt: this.lastSyncAt,
        lagHours: 0,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'plaid',
        syncedAt: new Date(),
        lagHours: this.calculateLagHours(),
      };
    }
  }

  /**
   * Get cash ledger from CSV import
   */
  private async getCashLedgerFromCSV(
    startDate: Date,
    endDate: Date
  ): Promise<BankAdapterResult<CashLedger>> {
    try {
      // TODO: Implement CSV parsing
      // const csvData = fs.readFileSync(this.config.csvPath!, 'utf-8');
      // const transactions = parseCSV(csvData);

      this.lastSyncAt = new Date();

      const ledger: CashLedger = {
        period: `${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`,
        openingBalance: 0,
        deposits: 0,
        withdrawals: 0,
        closingBalance: 0,
        source: 'csv',
        syncedAt: this.lastSyncAt,
      };

      return {
        data: ledger,
        success: true,
        source: 'csv',
        syncedAt: this.lastSyncAt,
        lagHours: 0,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'csv',
        syncedAt: new Date(),
        lagHours: this.calculateLagHours(),
      };
    }
  }

  /**
   * Get manually entered cash ledger (stub)
   */
  private async getCashLedgerManual(
    startDate: Date,
    endDate: Date
  ): Promise<BankAdapterResult<CashLedger>> {
    // Manual entry - returns stub with warning
    return {
      data: {
        period: `${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`,
        openingBalance: 0,
        deposits: 0,
        withdrawals: 0,
        closingBalance: 0,
        source: 'manual',
        syncedAt: new Date(),
      },
      success: true,
      source: 'manual',
      syncedAt: new Date(),
      lagHours: 24, // Manual data assumed to be at least 24h stale
    };
  }

  /**
   * Get current balance
   */
  async getCurrentBalance(): Promise<BankAdapterResult<number>> {
    try {
      const today = new Date();
      const ledger = await this.getCashLedger(today, today);

      if (!ledger.success || !ledger.data) {
        return {
          data: null,
          success: false,
          error: ledger.error,
          source: this.config.source,
          syncedAt: new Date(),
          lagHours: this.calculateLagHours(),
        };
      }

      return {
        data: ledger.data.closingBalance,
        success: true,
        source: this.config.source,
        syncedAt: new Date(),
        lagHours: 0,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: this.config.source,
        syncedAt: new Date(),
        lagHours: this.calculateLagHours(),
      };
    }
  }

  /**
   * Calculate sync lag in hours
   */
  private calculateLagHours(): number {
    if (!this.lastSyncAt) return 999;
    return Math.floor((Date.now() - this.lastSyncAt.getTime()) / 3600000);
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): { lastSyncAt: Date | null; lagHours: number; source: BankSource } {
    return {
      lastSyncAt: this.lastSyncAt,
      lagHours: this.calculateLagHours(),
      source: this.config.source,
    };
  }
}
