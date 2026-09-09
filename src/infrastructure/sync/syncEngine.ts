import { supabase } from './supabaseClient';
import { createDBAdapter } from '../persistence/dbAdapter';

export class SyncEngine {
  /**
   * Pull user data down from Supabase into local SQLite database
   */
  static async syncDown(userId: string, db: any): Promise<void> {
    if (!userId || userId === 'local_offline_user') return;

    const dbAdapter = createDBAdapter(db);

    try {
      // 1. Sync Bookmarks
      const { data: remoteBookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId);

      if (remoteBookmarks && remoteBookmarks.length > 0) {
        for (const bm of remoteBookmarks) {
          dbAdapter.exec(
            `INSERT OR REPLACE INTO bookmarks (id, book, chapter, verse, created_at)
             VALUES ('${bm.id}', '${bm.book}', ${bm.chapter}, ${bm.verse}, '${bm.created_at}');`
          );
        }
      }

      // 2. Sync Highlights
      const { data: remoteHighlights } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', userId);

      if (remoteHighlights && remoteHighlights.length > 0) {
        for (const hl of remoteHighlights) {
          dbAdapter.exec(
            `INSERT OR REPLACE INTO highlights (id, book, chapter, verse, color, created_at)
             VALUES ('${hl.id}', '${hl.book}', ${hl.chapter}, ${hl.verse}, '${hl.color}', '${hl.created_at}');`
          );
        }
      }

      // 3. Sync Reflections
      const { data: remoteReflections } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId);

      if (remoteReflections && remoteReflections.length > 0) {
        for (const r of remoteReflections) {
          const contentEscaped = r.content.replace(/'/g, "''");
          const bookVal = r.book ? `'${r.book}'` : 'NULL';
          const chVal = r.chapter ?? 'NULL';
          const vVal = r.verse ?? 'NULL';

          dbAdapter.exec(
            `INSERT OR REPLACE INTO reflections (id, module_id, kind, content, book, chapter, verse, created_at, updated_at, deleted_at)
             VALUES ('${r.id}', NULL, '${r.kind}', '${contentEscaped}', ${bookVal}, ${chVal}, ${vVal}, '${r.created_at}', '${r.updated_at}', ${r.deleted_at ? `'${r.deleted_at}'` : 'NULL'});`
          );
        }
      }

      // 4. Sync Daily Sessions
      const { data: remoteSessions } = await supabase
        .from('daily_sessions')
        .select('*')
        .eq('user_id', userId);

      if (remoteSessions && remoteSessions.length > 0) {
        for (const s of remoteSessions) {
          const completedAtVal = s.completed_at ? `'${s.completed_at}'` : 'NULL';
          const nextAvailVal = s.next_devotional_available_at
            ? `'${s.next_devotional_available_at}'`
            : 'NULL';
          const lastModVal = s.last_module ? `'${s.last_module}'` : 'NULL';

          dbAdapter.exec(
            `INSERT OR REPLACE INTO daily_sessions (id, date, started_at, completed_at, next_devotional_available_at, last_module, created_at, updated_at)
             VALUES ('${s.id}', '${s.date}', '${s.started_at}', ${completedAtVal}, ${nextAvailVal}, ${lastModVal}, '${s.created_at}', '${s.updated_at}');`
          );
        }
      }
    } catch (error) {
      console.warn('SyncDown warning (offline or unconfigured Supabase):', error);
    }
  }

  /**
   * Push local SQLite data up to Supabase
   */
  static async syncUp(userId: string, db: any): Promise<void> {
    if (!userId || userId === 'local_offline_user') return;

    const dbAdapter = createDBAdapter(db);

    try {
      // 1. Sync Bookmarks Up
      const localBookmarks = dbAdapter.getAll<{
        id: string;
        book: string;
        chapter: number;
        verse: number;
        created_at: string;
      }>('SELECT * FROM bookmarks');

      if (localBookmarks.length > 0) {
        const payload = localBookmarks.map((bm) => ({
          id: bm.id,
          user_id: userId,
          book: bm.book,
          chapter: bm.chapter,
          verse: bm.verse,
          created_at: bm.created_at,
        }));
        await supabase.from('bookmarks').upsert(payload, { onConflict: 'id' });
      }

      // 2. Sync Highlights Up
      const localHighlights = dbAdapter.getAll<{
        id: string;
        book: string;
        chapter: number;
        verse: number;
        color: string;
        created_at: string;
      }>('SELECT * FROM highlights');

      if (localHighlights.length > 0) {
        const payload = localHighlights.map((hl) => ({
          id: hl.id,
          user_id: userId,
          book: hl.book,
          chapter: hl.chapter,
          verse: hl.verse,
          color: hl.color,
          created_at: hl.created_at,
        }));
        await supabase.from('highlights').upsert(payload, { onConflict: 'id' });
      }

      // 3. Sync Reflections Up
      const localReflections = dbAdapter.getAll<{
        id: string;
        kind: string;
        content: string;
        book?: string;
        chapter?: number;
        verse?: number;
        created_at: string;
        updated_at: string;
        deleted_at?: string;
      }>('SELECT * FROM reflections');

      if (localReflections.length > 0) {
        const payload = localReflections.map((rf) => ({
          id: rf.id,
          user_id: userId,
          kind: rf.kind,
          content: rf.content,
          book: rf.book || null,
          chapter: rf.chapter || null,
          verse: rf.verse || null,
          created_at: rf.created_at,
          updated_at: rf.updated_at,
          deleted_at: rf.deleted_at || null,
        }));
        await supabase.from('reflections').upsert(payload, { onConflict: 'id' });
      }
    } catch (error) {
      console.warn('SyncUp warning (offline or unconfigured Supabase):', error);
    }
  }
}
