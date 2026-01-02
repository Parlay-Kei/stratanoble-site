/**
 * CFO Agent Data Adapters
 *
 * Swappable adapters for external data sources.
 * All adapters implement consistent interfaces for data quality tracking.
 */

export * from './stripe-adapter';
export * from './bank-adapter';
export * from './internal-db-adapter';
export * from './accounting-adapter';
