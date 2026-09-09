import { SyncEngine } from '@/infrastructure/sync/syncEngine';
import { supabase } from '@/infrastructure/sync/supabaseClient';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/infrastructure/sync/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('SyncEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips sync for local offline user', async () => {
    const mockDb = {};
    await SyncEngine.syncDown('local_offline_user', mockDb);
    await SyncEngine.syncUp('local_offline_user', mockDb);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('handles syncDown gracefully when Supabase returns remote bookmarks', async () => {
    const mockExec = jest.fn();
    const mockDb = { execSync: mockExec };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'bm-1',
              book: 'John',
              chapter: 3,
              verse: 16,
              created_at: '2026-09-08T00:00:00Z',
            },
          ],
        }),
      }),
    });

    await SyncEngine.syncDown('user_123', mockDb);

    expect(supabase.from).toHaveBeenCalledWith('bookmarks');
    expect(mockExec).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO bookmarks')
    );
  });
});
