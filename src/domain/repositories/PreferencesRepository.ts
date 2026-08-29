import { ReaderPreferences, AccountPreferences } from '../models';

/**
 * Repository interface for persisting user preferences
 */
export interface PreferencesRepository {
  /**
   * Get reader preferences
   */
  getReaderPreferences(): Promise<ReaderPreferences>;

  /**
   * Update reader preferences
   */
  updateReaderPreferences(prefs: Partial<ReaderPreferences>): Promise<void>;

  /**
   * Get account preferences
   */
  getAccountPreferences(): Promise<AccountPreferences>;

  /**
   * Update account preferences
   */
  updateAccountPreferences(prefs: Partial<AccountPreferences>): Promise<void>;
}
