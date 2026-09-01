import { SQLiteReflectionRepository } from '@/infrastructure/persistence/SQLiteReflectionRepository';
import { ReflectionKind } from '@/domain/models/Reflection';

describe('SQLiteReflectionRepository', () => {
  let db: any;
  let repository: SQLiteReflectionRepository;

  beforeEach(() => {
    db = {
      getFirstSync: jest.fn(),
      getAllSync: jest.fn(),
      runSync: jest.fn(),
      execSync: jest.fn(),
    };
    repository = new SQLiteReflectionRepository(db);
  });

  describe('saveDraft', () => {
    it('creates new draft if none exists', async () => {
      db.getFirstSync.mockReturnValue(null);

      const result = await repository.saveDraft(
        'module_123',
        'reflection' as ReflectionKind,
        'My reflection'
      );

      expect(db.runSync).toHaveBeenCalled();
      expect(result.moduleId).toBe('module_123');
      expect(result.kind).toBe('reflection');
      expect(result.content).toBe('My reflection');
    });

    it('updates existing draft', async () => {
      const existingDraft = {
        id: 'reflection_123',
        module_id: 'module_123',
        kind: 'reflection',
        content: 'Old content',
        book: null,
        chapter: null,
        verse: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.getFirstSync.mockReturnValue(existingDraft);

      const result = await repository.saveDraft(
        'module_123',
        'reflection' as ReflectionKind,
        'Updated content'
      );

      expect(db.runSync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reflections'),
        expect.arrayContaining(['Updated content'])
      );
      expect(result.content).toBe('Updated content');
    });
  });

  describe('getModuleDraft', () => {
    it('returns most recent draft for module', async () => {
      const draft = {
        id: 'reflection_123',
        module_id: 'module_123',
        kind: 'reflection',
        content: 'Draft content',
        book: null,
        chapter: null,
        verse: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.getFirstSync.mockReturnValue(draft);

      const result = await repository.getModuleDraft('module_123');

      expect(result).not.toBeNull();
      expect(result?.content).toBe('Draft content');
      expect(db.getFirstSync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY updated_at DESC'),
        ['module_123']
      );
    });

    it('returns null if no draft exists', async () => {
      db.getFirstSync.mockReturnValue(null);

      const result = await repository.getModuleDraft('module_123');

      expect(result).toBeNull();
    });
  });

  describe('deleteReflection', () => {
    it('soft deletes reflection', async () => {
      await repository.deleteReflection('reflection_123');

      expect(db.runSync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reflections SET deleted_at'),
        expect.arrayContaining([expect.any(String), 'reflection_123'])
      );
    });
  });
});
