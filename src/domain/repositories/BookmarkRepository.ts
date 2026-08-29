import { Bookmark, VerseRef } from '../models';

/**
 * Repository interface for persisting bookmarks
 */
export interface BookmarkRepository {
  /**
   * Get all bookmarks
   */
  getAllBookmarks(): Promise<Bookmark[]>;

  /**
   * Check if a verse is bookmarked
   */
  isBookmarked(ref: VerseRef): Promise<boolean>;

  /**
   * Add a bookmark
   */
  addBookmark(ref: VerseRef): Promise<Bookmark>;

  /**
   * Remove a bookmark
   */
  removeBookmark(id: string): Promise<void>;
}
