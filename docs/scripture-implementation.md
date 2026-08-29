# Scripture Engine Implementation

**Date:** 2026-08-29  
**Translation:** World English Bible (WEB)  
**Edition:** engwebp (2020 stable text edition)  
**Canon:** 66-book Protestant

---

## Official Corpus Provenance

### Source Details

| Attribute           | Value                                                              |
| ------------------- | ------------------------------------------------------------------ |
| **Source URL**      | https://eBible.org/Scriptures/engwebp_usfm.zip                     |
| **Archive SHA-256** | `2d2dc7b443a4cf398dfe05d1001195887c74a80b388003358ccc8a6bfc1c5c07` |
| **Format**          | USFM (Unified Standard Format Markers)                             |
| **Source Date**     | 2026-08-26                                                         |
| **Import Date**     | 2026-08-29                                                         |

### Verification

Official corpus downloaded directly from eBible.org and verified via SHA-256 checksum.
Audit documentation: `docs/bible-corpus-audit.md`

---

## Database Schema

### Version

Schema Version: 1

### Tables

- **schema_version** - Tracks schema version for migrations
- **translation_metadata** - Stores translation provenance and metadata
- **books** - 66 canonical books with order and testament
- **verses** - Complete verse text with book/chapter/verse coordinates

### Indexes

- `idx_verses_book_chapter` - Fast chapter lookup
- `idx_verses_book_chapter_verse` - Fast verse lookup
- `idx_books_canonical_order` - Canonical book ordering

### FTS Capability

**Status:** Not enabled in initial import  
**Fallback:** Indexed LIKE search available  
**Future:** FTS5 can be added if expo-sqlite supports it in production builds

---

## Final Counts

### Source-Level (Official USFM)

| Metric                            | Value   |
| --------------------------------- | ------- |
| **Raw Verse Markers (`\v`)**     | 31,103  |
| **Books**                         | 66      |
| **Chapters**                      | 1,189   |

### Normalized Database (User-Visible)

| Metric            | Value   |
| ----------------- | ------- |
| **Verses**        | 31,098  |
| **Books**         | 66      |
| **Chapters**      | 1,189   |
| **Database Size** | 5.01 MB |

### Reconciliation

**31,103 raw markers - 5 empty = 31,098 final verses**

The official engwebp USFM source contains **31,103** `\v` verse markers. However, **5 verses** contain only footnotes with no actual text and are correctly excluded by the parser:

- Luke 17:36 (textual variant note)
- Acts 8:37 (textual variant note)
- Acts 15:34 (textual variant note)
- Acts 24:7 (textual variant note)
- Romans 16:25 (versification note)

These are textually uncertain verses omitted by WEB following critical Greek manuscripts (Nestle-Aland, UBS). The parser correctly strips footnote-only content, resulting in the final count of 31,098 verses.

---

## Import Procedure

### Command

```bash
node scripts/import-scripture.js
```

### Process

1. Download official engwebp_usfm.zip from eBible.org
2. Verify SHA-256 checksum
3. Extract 66 USFM book files
4. Parse USFM, strip markup, extract verse text
5. Create SQLite database with versioned schema
6. Insert books and verses in canonical order
7. Validate counts

### Deterministic Rebuild

The import script can be re-run at any time to rebuild the database from the official source. The process is deterministic given the same USFM source.

---

## Attribution

### In-App Attribution

World English Bible attribution is provided in appropriate UI locations per audit requirements:

- Translation name: "World English Bible (WEB)"
- Edition: "2020 stable text edition (engwebp)"
- Status: Public Domain
- Source: eBible.org

---

## Database Seeding on First Launch

### Mechanism

The app uses **SQLiteProvider with assetSource** (Expo SDK 57) to automatically seed the database on first launch:

```typescript
<SQLiteProvider
  databaseName="bible.db"
  assetSource={{ assetId: require('../assets/bible.db') }}
>
  {children}
</SQLiteProvider>
```

**Location:** `app/_layout.tsx` (app root)

### First Launch Behavior

1. SQLiteProvider detects the database doesn't exist in the app's document directory
2. Automatically imports from the bundled `assets/bible.db` using the asset ID
3. Copies to the app's SQLite document directory
4. Opens and provides the database via `useSQLiteContext()`

### Subsequent Launch Behavior

- Existing database is preserved by default (`forceOverwrite: false`)
- No re-import occurs
- User data (future: bookmarks, notes) is safe across app restarts
- App updates preserve the existing database

### Repository Access

Components access the database through the `useBibleRepository()` hook:

```typescript
import { useBibleRepository } from '@/infrastructure/adapters';

function MyComponent() {
  const bibleRepo = useBibleRepository();
  // Use repository methods...
}
```

---

## Offline Operation

The complete Scripture text is bundled in the `assets/bible.db` SQLite database. The app functions fully offline after installation. No network requests are required for Scripture access.

---

## Integration Points

### Repository

**Production:** `SQLiteBibleRepository` (implements `BibleRepository` interface)  
**Testing:** `MockBibleRepository` (uses small test fixtures)

### Citation Resolution

Existing Guide Thread citation lookup now resolves against the SQLite repository, providing access to the full WEB corpus.

### Mock AI Responses

The mock AI gateway continues to provide placeholder guidance responses. Citations in those responses now resolve to real Scripture text.

---

## Limitations and Future Work

### Current Limitations

1. **FTS5 Search:** Full-text search falls back to LIKE queries. FTS5 can be enabled if verified in production Expo builds.
2. **No Cross-References:** Cross-reference data from USFM is stripped. Could be preserved in future schema version.
3. **No Strong's Numbers:** Strong's concordance data is stripped. Could be preserved for advanced study features.

### Deferred Work

- [ ] Enable FTS5 if expo-sqlite supports it in production
- [ ] Add cross-reference data preservation
- [ ] Add Strong's concordance preservation (if desired for study features)
- [ ] Periodic updates from eBible.org for translation revisions

---

## Testing

### Test Suites

1. **MockBibleRepository.test.ts** - Mock implementation tests
2. **MockGuideGateway.test.ts** - Mock AI gateway tests
3. **VerseRef.test.ts** - Reference validation tests
4. **useGuide.test.ts** - Guide hook tests
5. **scripture-integrity.test.ts** - Corpus integrity regression tests
6. **database-initialization.test.ts** - Database seeding and bundling tests

### Scripture Integrity Tests (Automated Regression)

The `scripture-integrity.test.ts` suite provides automated verification of the verse count reconciliation:

**Official USFM Source:**
- ✓ 66 canonical book files present
- ✓ Exactly 31,103 raw verse markers (`\v`) in source
- ✓ Exactly 5 verses become empty after parser normalization
- ✓ All 5 empty verses contain only footnotes (no user-visible text)

**Normalized SQLite Database:**
- ✓ Database exists in app assets directory
- ✓ Exactly 31,098 normalized verses (displayable text)
- ✓ Exactly 66 books
- ✓ Exactly 1,189 chapters
- ✓ Psalms has exactly 150 chapters (no Psalm 151)
- ✓ No Psalm 151 verses present
- ✓ No HTML markup in verse text
- ✓ The 5 empty verse references are correctly excluded

**Reconciliation:**
- ✓ 31,103 - 5 = 31,098 (equation verified)

### Running Tests

```bash
npm test
# Result: 6 test suites, 53 tests passed
```

**Coverage:**
- Verse count reconciliation enforced by automated tests
- Database seeding and clean-install behavior verified
- All 12 database initialization scenarios tested

---

**Implementation Complete**  
Prompt 3B validated and ready for production use.
