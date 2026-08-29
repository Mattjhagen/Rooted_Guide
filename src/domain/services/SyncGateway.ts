/**
 * Sync status for a data type
 */
export interface SyncStatus {
  lastSyncedAt: Date | null;
  status: 'idle' | 'syncing' | 'error';
  error?: string;
}

/**
 * Gateway interface for cloud synchronization
 * Production implementation will sync bookmarks/highlights (not journal entries by default)
 *
 * NOTE: This is an interface definition only. Do not implement sync in Prompt 2.
 */
export interface SyncGateway {
  /**
   * Sync bookmarks with cloud
   */
  syncBookmarks(): Promise<void>;

  /**
   * Sync highlights with cloud
   */
  syncHighlights(): Promise<void>;

  /**
   * Get sync status
   */
  getSyncStatus(): Promise<SyncStatus>;

  /**
   * Subscribe to sync status changes
   */
  onSyncStatusChange(callback: (status: SyncStatus) => void): () => void;
}
