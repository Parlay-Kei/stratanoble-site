import * as SQLite from 'expo-sqlite';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SQLite database setup
const db = SQLite.openDatabase('achievery.db');

export interface OfflineAction {
  id: string;
  user_id: string;
  dream_id: string | null;
  original_text: string;
  category: 'learning' | 'building' | 'connecting';
  phase: 'explore' | 'build' | 'launch';
  logged_date: string;
  created_at: string;
  synced: boolean;
  sync_attempts: number;
  last_sync_attempt?: string;
}

export interface SyncResult {
  success: boolean;
  synced_count: number;
  failed_count: number;
  errors: string[];
}

class OfflineSyncManager {
  private initialized = false;

  /**
   * Initialize SQLite tables for offline storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          // Create offline actions table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS offline_actions (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              dream_id TEXT,
              original_text TEXT NOT NULL,
              category TEXT NOT NULL,
              phase TEXT NOT NULL,
              logged_date TEXT NOT NULL,
              created_at TEXT NOT NULL,
              synced INTEGER DEFAULT 0,
              sync_attempts INTEGER DEFAULT 0,
              last_sync_attempt TEXT
            );
          `);

          // Create sync metadata table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS sync_metadata (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );
          `);

          // Create index for faster queries
          tx.executeSql(`
            CREATE INDEX IF NOT EXISTS idx_offline_actions_synced 
            ON offline_actions(synced, sync_attempts);
          `);

          tx.executeSql(`
            CREATE INDEX IF NOT EXISTS idx_offline_actions_user_date 
            ON offline_actions(user_id, logged_date);
          `);
        },
        (error) => {
          console.error('Failed to initialize offline sync tables:', error);
          reject(error);
        },
        () => {
          console.log('Offline sync tables initialized successfully');
          this.initialized = true;
          resolve();
        }
      );
    });
  }

  /**
   * Store action locally when offline
   */
  async storeActionLocally(action: Omit<OfflineAction, 'synced' | 'sync_attempts'>): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT INTO offline_actions 
             (id, user_id, dream_id, original_text, category, phase, logged_date, created_at, synced, sync_attempts)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
            [
              action.id,
              action.user_id,
              action.dream_id,
              action.original_text,
              action.category,
              action.phase,
              action.logged_date,
              action.created_at,
            ]
          );
        },
        (error) => {
          console.error('Failed to store action locally:', error);
          reject(error);
        },
        () => {
          console.log('Action stored locally:', action.id);
          resolve();
        }
      );
    });
  }

  /**
   * Get all unsynced actions
   */
  async getUnsyncedActions(): Promise<OfflineAction[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM offline_actions WHERE synced = 0 ORDER BY created_at ASC',
          [],
          (_, { rows }) => {
            const actions: OfflineAction[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              actions.push({
                ...row,
                synced: Boolean(row.synced),
              });
            }
            resolve(actions);
          },
          (_, error) => {
            console.error('Failed to get unsynced actions:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * Get all local actions for a specific date
   */
  async getLocalActions(userId: string, date: string): Promise<OfflineAction[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM offline_actions WHERE user_id = ? AND logged_date = ? ORDER BY created_at DESC',
          [userId, date],
          (_, { rows }) => {
            const actions: OfflineAction[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              actions.push({
                ...row,
                synced: Boolean(row.synced),
              });
            }
            resolve(actions);
          },
          (_, error) => {
            console.error('Failed to get local actions:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * Mark action as synced
   */
  async markActionSynced(actionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE offline_actions SET synced = 1 WHERE id = ?',
            [actionId]
          );
        },
        (error) => {
          console.error('Failed to mark action as synced:', error);
          reject(error);
        },
        () => resolve()
      );
    });
  }

  /**
   * Increment sync attempt counter
   */
  async incrementSyncAttempt(actionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `UPDATE offline_actions 
             SET sync_attempts = sync_attempts + 1, 
                 last_sync_attempt = datetime('now') 
             WHERE id = ?`,
            [actionId]
          );
        },
        (error) => {
          console.error('Failed to increment sync attempt:', error);
          reject(error);
        },
        () => resolve()
      );
    });
  }

  /**
   * Sync unsynced actions to Supabase
   */
  async syncToSupabase(): Promise<SyncResult> {
    console.log('Starting sync to Supabase...');
    
    const result: SyncResult = {
      success: true,
      synced_count: 0,
      failed_count: 0,
      errors: [],
    };

    try {
      const unsyncedActions = await this.getUnsyncedActions();
      console.log(`Found ${unsyncedActions.length} unsynced actions`);

      if (unsyncedActions.length === 0) {
        return result;
      }

      for (const action of unsyncedActions) {
        try {
          await this.incrementSyncAttempt(action.id);

          // Skip actions that have failed too many times
          if (action.sync_attempts >= 3) {
            console.log(`Skipping action ${action.id} - too many failed attempts`);
            result.failed_count++;
            result.errors.push(`Action ${action.id} has exceeded maximum sync attempts`);
            continue;
          }

          // Sync to Supabase
          const { error } = await supabase
            .from('user_actions')
            .insert({
              id: action.id,
              user_id: action.user_id,
              dream_id: action.dream_id,
              original_text: action.original_text,
              category: action.category,
              phase: action.phase,
              logged_date: action.logged_date,
              created_at: action.created_at,
            });

          if (error) {
            console.error(`Failed to sync action ${action.id}:`, error);
            result.failed_count++;
            result.errors.push(`Action ${action.id}: ${error.message}`);
          } else {
            await this.markActionSynced(action.id);
            result.synced_count++;
            console.log(`Successfully synced action ${action.id}`);
          }
        } catch (actionError) {
          console.error(`Error processing action ${action.id}:`, actionError);
          result.failed_count++;
          result.errors.push(`Action ${action.id}: ${actionError}`);
        }
      }

      // Update last sync timestamp
      await this.updateSyncMetadata('last_sync_attempt', new Date().toISOString());

      if (result.failed_count > 0) {
        result.success = false;
      }

      console.log(`Sync completed: ${result.synced_count} synced, ${result.failed_count} failed`);
      return result;

    } catch (error) {
      console.error('Sync process failed:', error);
      result.success = false;
      result.errors.push(`Sync process error: ${error}`);
      return result;
    }
  }

  /**
   * Clean up old synced actions (older than 30 days)
   */
  async cleanupOldActions(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString();

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'DELETE FROM offline_actions WHERE synced = 1 AND created_at < ?',
            [cutoffDate]
          );
        },
        (error) => {
          console.error('Failed to cleanup old actions:', error);
          reject(error);
        },
        () => {
          console.log('Old synced actions cleaned up');
          resolve();
        }
      );
    });
  }

  /**
   * Store sync metadata
   */
  async updateSyncMetadata(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) 
             VALUES (?, ?, datetime('now'))`,
            [key, value]
          );
        },
        (error) => {
          console.error('Failed to update sync metadata:', error);
          reject(error);
        },
        () => resolve()
      );
    });
  }

  /**
   * Get sync metadata
   */
  async getSyncMetadata(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT value FROM sync_metadata WHERE key = ?',
          [key],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0).value);
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Failed to get sync metadata:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    total_actions: number;
    synced_actions: number;
    pending_actions: number;
    failed_actions: number;
    last_sync: string | null;
  }> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT 
             COUNT(*) as total_actions,
             SUM(CASE WHEN synced = 1 THEN 1 ELSE 0 END) as synced_actions,
             SUM(CASE WHEN synced = 0 AND sync_attempts < 3 THEN 1 ELSE 0 END) as pending_actions,
             SUM(CASE WHEN synced = 0 AND sync_attempts >= 3 THEN 1 ELSE 0 END) as failed_actions
           FROM offline_actions`,
          [],
          async (_, { rows }) => {
            const stats = rows.item(0);
            const lastSync = await this.getSyncMetadata('last_sync_attempt');
            
            resolve({
              total_actions: stats.total_actions || 0,
              synced_actions: stats.synced_actions || 0,
              pending_actions: stats.pending_actions || 0,
              failed_actions: stats.failed_actions || 0,
              last_sync: lastSync,
            });
          },
          (_, error) => {
            console.error('Failed to get sync stats:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

// Export singleton instance
export const offlineSyncManager = new OfflineSyncManager();

// Helper functions for easy action logging
export const logActionOffline = async (
  userId: string,
  dreamId: string | null,
  originalText: string,
  category: 'learning' | 'building' | 'connecting',
  phase: 'explore' | 'build' | 'launch'
): Promise<string> => {
  const actionId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const action: Omit<OfflineAction, 'synced' | 'sync_attempts'> = {
    id: actionId,
    user_id: userId,
    dream_id: dreamId,
    original_text: originalText,
    category,
    phase,
    logged_date: today,
    created_at: now,
  };

  await offlineSyncManager.storeActionLocally(action);
  
  // Try to sync immediately if online
  const isOnline = await checkNetworkConnectivity();
  if (isOnline) {
    // Don't await - sync in background
    offlineSyncManager.syncToSupabase().catch(console.error);
  }

  return actionId;
};

// Network connectivity check
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Simple connectivity check
    const response = await fetch('https://httpbin.org/status/200', {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Background sync setup
export const setupBackgroundSync = () => {
  // Set up periodic sync when app becomes active
  const handleAppStateChange = async (nextAppState: string) => {
    if (nextAppState === 'active') {
      const isOnline = await checkNetworkConnectivity();
      if (isOnline) {
        console.log('App became active and online - triggering sync');
        offlineSyncManager.syncToSupabase().catch(console.error);
      }
    }
  };

  // Note: In a real implementation, you'd use AppState from react-native
  // AppState.addEventListener('change', handleAppStateChange);
  
  return () => {
    // AppState.removeEventListener('change', handleAppStateChange);
  };
};