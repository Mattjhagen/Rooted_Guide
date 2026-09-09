import { supabase } from './supabaseClient';
import { db } from '../../infrastructure/db/sqlite'; // Assuming expo-sqlite is exported from here

// This sync engine uses a simple last-write-wins (LWW) strategy.
// In a full production app, you might use WatermelonDB or a more complex CRDT,
// but for our single-user multi-device setup, timestamp comparison is sufficient.

export class SyncEngine {
  
  static async syncDown(userId: string) {
    if (!userId) return;
    
    try {
      console.log('Starting Sync Down...');
      // Fetch latest reflections
      const { data: remoteReflections, error: refError } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId);
        
      if (!refError && remoteReflections) {
        // Upsert into local SQLite
        remoteReflections.forEach((ref) => {
          db.runSync(
            `INSERT INTO reflections (id, kind, content, book, chapter, verse, created_at, updated_at, deleted_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET 
             content = excluded.content,
             updated_at = excluded.updated_at,
             deleted_at = excluded.deleted_at
             WHERE excluded.updated_at > reflections.updated_at`,
             [ref.id, ref.kind, ref.content, ref.book, ref.chapter, ref.verse, ref.created_at, ref.updated_at, ref.deleted_at]
          );
        });
      }
      
      console.log('Sync Down Complete');
    } catch (e) {
      console.error('Sync Down Error:', e);
    }
  }

  static async syncUp(userId: string) {
    if (!userId) return;
    
    try {
      console.log('Starting Sync Up...');
      // 1. Get all local reflections that have been updated since last sync
      // For a robust implementation, you should track a `last_synced_at` timestamp in AsyncStorage
      // and only query `WHERE updated_at > last_synced_at`.
      
      const localReflections = db.getAllSync('SELECT * FROM reflections');
      
      if (localReflections.length > 0) {
        const { error } = await supabase
          .from('reflections')
          .upsert(
            localReflections.map((r: any) => ({
              id: r.id,
              user_id: userId,
              kind: r.kind,
              content: r.content,
              book: r.book,
              chapter: r.chapter,
              verse: r.verse,
              created_at: r.created_at,
              updated_at: r.updated_at,
              deleted_at: r.deleted_at
            })),
            { onConflict: 'id' }
          );
          
        if (error) console.error('Error syncing reflections up:', error);
      }
      
      console.log('Sync Up Complete');
    } catch (e) {
      console.error('Sync Up Error:', e);
    }
  }
}
