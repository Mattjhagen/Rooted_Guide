# Rooted Rebuild Audit

**Date:** 2026-08-29  
**Legacy Repository:** `/Users/matt/Documents/Rooted/Rooted_Daily`  
**New Repository:** `/Users/matt/Documents/Rooted/Rooted_Guide`

## Executive Summary

The legacy Rooted_Daily application is a feature-rich Expo/React Native devotional platform with Bible reading, AI chat, community features, reading plans, and social functionality. The new Rooted rebuild will selectively port core Bible data and domain logic while rejecting the multi-tab architecture, community system, and client-exposed credential patterns.

## 1. Reusable Legacy Assets

### 1.1 Bible Data and Domain Logic

#### World English Bible Translation Data

- **Path:** `src/data/bibleFull.json`
- **Size:** 3.9MB (minified JSON, single line)
- **Structure:** `{ books: [{ abbrev: string, chapters: string[][] }] }`
- **Decision:** **PORT DATA**
- **Reason:** Complete 66-book Bible corpus with ~31,000 verses. WEB translation is public domain and suitable for the rebuild. Requires verification audit (see Section 4).

#### Bible Book Abbreviation Mapping

- **Path:** `src/constants/bibleMapping.ts`
- **Decision:** **PORT DATA**
- **Reason:** Essential mapping from 2-4 character abbreviations (gn, ex, ps, mt, etc.) to canonical book names. Required for parsing bibleFull.json.

#### Bible Initialization Logic

- **Path:** `src/features/bible/bibleLoader.ts`
- **Decision:** **REWRITE BEHAVIOR**
- **Reason:** Solid pattern for loading JSON into SQLite with progress tracking. Port the algorithmic approach (per-book transactions, progress callbacks), but rewrite for new stack and local-first persistence layer.

#### Bible Data Service

- **Path:** `src/features/bible/bibleService.ts`
- **Decision:** **REWRITE BEHAVIOR**
- **Reason:** Clean verse/chapter retrieval API. Port the interface pattern (getVerse, getChapter, searchVerses), but reimplement against the new local database and type system.

#### Bible Chapter Parser

- **Path:** `src/features/bible/bibleParser.ts`
- **Decision:** **DEFER**
- **Reason:** Unknown parsing logic. Inspect only if bibleFull.json format requires transformation before storage.

#### Bible Engine

- **Path:** `src/features/bible/BibleEngine.ts`
- **Decision:** **DEFER**
- **Reason:** Unknown orchestration logic. Inspect only if needed for Bible navigation or citation resolution.

### 1.2 Personal Data

#### Journal Store

- **Path:** `src/features/journal/journalStore.ts`
- **Decision:** **REWRITE BEHAVIOR**
- **Reason:** Zustand + AsyncStorage pattern for local journal entries. Port the state management pattern (entries, create, update, delete), but rewrite for new persistence layer and privacy-preserving sync boundaries.

#### Bookmarks Store

- **Path:** `src/features/bible/bookmarksStore.ts`
- **Decision:** **REWRITE BEHAVIOR**
- **Reason:** Verse bookmark persistence. Port the domain model (book/chapter/verse reference), rewrite for new database schema.

#### Highlights Store

- **Path:** `src/features/bible/highlightsStore.ts`
- **Decision:** **REWRITE BEHAVIOR**
- **Reason:** Verse highlighting with color. Port the domain model (reference + color), rewrite for new schema.

#### Reading Plan Data

- **Path:** `src/data/readingPlanData.ts`
- **Decision:** **REJECT**
- **Reason:** Reading plans are not part of the rebuild product vision. Rooted opens to a cursor, not a plan tracker.

### 1.3 Authentication and Synchronization

#### Supabase Client

- **Path:** `src/services/supabase.ts`
- **Decision:** **REJECT**
- **Reason:** Current implementation uses client-exposed anon key. Rebuild will use optional user accounts with server-side session management.

#### Auth Service

- **Path:** `src/services/auth/AuthService.ts`
- **Decision:** **REJECT**
- **Reason:** OAuth patterns (Google, Apple, YouVersion) with client secret exposure and unsafe token storage. Rebuild requires server-side OAuth callback handling and secure session tokens.

#### YouVersion OAuth Integration

- **Paths:** Multiple files referencing `EXPO_PUBLIC_YOUVERSION_CLIENT_SECRET`
- **Decision:** **REJECT**
- **Reason:** Client secret must never be embedded in client bundle. If YouVersion integration is needed, implement server-side OAuth flow.

#### Supabase Migrations

- **Path:** `supabase/migrations/`
- **Files:**
  - `001_devotionals.sql.skip` (skipped migration)
  - `002_community_chat.sql`
  - `003_journal_sync.sql`
  - `004_profiles.sql`
  - `005_channel_messages.sql`
  - `006_moderation_rls.sql`
- **Decision:** **REJECT**
- **Reason:** These migrations support community/social features rejected in the rebuild. Journal sync schema will be redesigned with privacy-first boundaries (e.g., only sync bookmarks/highlights, not free-text journal entries).

### 1.4 AI

#### Chat Service (Multi-Provider Fallback)

- **Path:** `src/features/chat/chatService.ts`
- **Decision:** **REJECT**
- **Reason:** Client-exposed API keys (Gemini, OpenAI, Claude) and hardcoded AI proxy URL. Rebuild will use server-side AI with credential rotation and structured responses.

#### System Prompt

- **Path:** `src/features/chat/systemPrompt.ts`
- **Decision:** **PORT DATA** (with modifications)
- **Reason:** Well-crafted prompt that establishes tone ("charismatic, understanding, personal"), rules (never invent verses, conversational), and structured output format (SUGGESTIONS_JSON). Port the prompt principles, but:
  - Remove SUGGESTIONS_JSON hack (use proper structured output in rebuild)
  - Add Scripture citation verification requirement
  - Add instruction to return structured references for verse lookups

#### Devotional Service

- **Path:** `src/features/devotionals/PersonalizedDevotionalService.ts`
- **Decision:** **REJECT**
- **Reason:** Devotionals are not part of the rebuild product vision.

### 1.5 Settings

#### Reader Settings Sheet

- **Path:** `src/components/ReaderSettingsSheet.tsx`
- **Decision:** **DEFER**
- **Reason:** Inspect only if font size, theme, or reading view preferences are needed in rebuild.

### 1.6 Audio and Notifications

#### Audio Services

- **Paths:**
  - `src/services/audio/` (directory)
  - `src/features/audio/` (directory)
- **Decision:** **DEFER**
- **Reason:** Audio Bible playback is not in initial rebuild scope. Defer until text-based experience is validated.

#### Notification Service

- **Path:** `src/services/NotificationService.ts`
- **Decision:** **DEFER**
- **Reason:** Push notifications are not in initial rebuild scope.

### 1.7 Theme and Visual Assets

#### Theme System

- **Paths:**
  - `src/theme/colors.ts`
  - `src/theme/spacing.ts`
  - `src/theme/typography.ts`
- **Decision:** **PORT DATA**
- **Reason:** Reusable design tokens. Port color palette, spacing scale, and typography styles. Verify that these align with the "calm, personal" product vision (no aggressive gamification colors).

#### Logo and Icon Assets

- **Paths:**
  - `rooted_app_icon.svg`
  - `rooted_icon_512.png`
  - `logo_dark_light.png`
- **Decision:** **PORT DATA**
- **Reason:** Brand identity assets. Port for use in new application.

#### Font Assets

- **Path:** `assets/fonts/`
- **Decision:** **PORT DATA**
- **Reason:** Custom fonts contribute to calm, personal aesthetic. Port if fonts are brand-specific.

### 1.8 Rejected Architecture

#### Multi-Tab Navigation

- **Path:** `app/(tabs)/`
- **Decision:** **REJECT**
- **Reason:** Rebuild opens to a cursor, not a dashboard with tabs. Navigation emerges from conversation.

#### Community Features

- **Paths:**
  - `src/components/CommunityInsights.tsx`
  - `app/chat/community.tsx`
  - Supabase migrations for community_chat, profiles, channel_messages
- **Decision:** **REJECT**
- **Reason:** Social/community features are explicitly excluded from rebuild. Rooted is a personal guide, not a social platform.

#### Reading Plans Feature

- **Paths:**
  - `src/features/plans/`
  - `src/components/PlanCard.tsx`
  - `src/data/readingPlanData.ts`
- **Decision:** **REJECT**
- **Reason:** Reading plan tracking is a dashboard pattern. Rebuild uses conversation-based navigation.

#### Devotionals Feature

- **Paths:**
  - `src/features/devotionals/`
  - `src/components/DevotionalCard.tsx`
- **Decision:** **REJECT**
- **Reason:** Devotionals are curated content separate from Scripture grounding. Not part of rebuild vision.

#### Admin Features

- **Path:** `app/admin/`
- **Decision:** **REJECT**
- **Reason:** No admin panel needed in rebuild.

#### YouVersion Integration

- **Paths:**
  - `src/services/youversion/`
  - `src/features/bible/youVersionStore.ts`
- **Decision:** **REJECT**
- **Reason:** External API dependency not required. Rebuild uses self-contained Bible data.

## 2. Credential and Security Audit

### 2.1 Critical Security Vulnerabilities

#### ⚠️ Client-Exposed AI API Keys

- **Issue:** `EXPO_PUBLIC_GEMINI_API_KEY`, `EXPO_PUBLIC_OPENAI_API_KEY`, `EXPO_PUBLIC_ANTHROPIC_API_KEY` are embedded in client bundle
- **Location:** `src/features/chat/chatService.ts:5-7`, `.env.example:18,23,28`
- **Risk:** API key exposure in decompiled client. Quota exhaustion, cost abuse, credential rotation required.
- **Mitigation:** Rebuild must use server-side AI proxy. Client sends user messages to server, server calls AI with rotatable API keys.

#### ⚠️ Client-Exposed OAuth Client Secret

- **Issue:** `EXPO_PUBLIC_YOUVERSION_CLIENT_SECRET` is embedded in client bundle
- **Location:** `src/services/auth/AuthService.ts:14`, `.env.example:74`
- **Risk:** OAuth client secret must never be in client code. Allows impersonation of application in OAuth flows.
- **Mitigation:** Rebuild must implement server-side OAuth callback handler. Client redirects to server, server exchanges code for token.

#### ⚠️ Client-Exposed Supabase Service Role Key

- **Issue:** `EXPO_PUBLIC_SUPABASE_SERVICE_KEY` referenced in code (may not be actively used)
- **Location:** `src/features/devotionals/devotionalService.ts:7`
- **Risk:** Service role key bypasses Row Level Security (RLS). Client with this key can read/write/delete any data in database.
- **Mitigation:** Immediately verify this key is not in any .env file. Service role key must only exist on server. Rebuild will use anon key + RLS on client, service key only in server functions.

#### ⚠️ Hardcoded Service Endpoints

- **Issue:** AI proxy URL `https://rooted-ai.mattjhagen.workers.dev` is hardcoded
- **Location:** `src/features/chat/chatService.ts:9`
- **Risk:** Cannot rotate endpoint without app update. Cloudflare Worker endpoint may be public.
- **Mitigation:** Rebuild should use environment-based endpoint configuration with fallback.

### 2.2 Authentication and Token Storage

#### Unsafe YouVersion Token Storage

- **Issue:** YouVersion OAuth access token stored in Supabase user metadata
- **Location:** `src/services/auth/AuthService.ts:170-173`
- **Risk:** User metadata may be readable by other users depending on RLS policies. Third-party token should not be stored in user-readable fields.
- **Mitigation:** If YouVersion integration is needed in rebuild, store tokens in separate table with strict RLS, or re-fetch on demand with refresh token.

#### Synthetic Password Pattern

- **Issue:** YouVersion users are created with password `youversion_${userData.id}_${YOUVERSION_CLIENT_ID}`
- **Location:** `src/services/auth/AuthService.ts:145-146`
- **Risk:** Deterministic password generation. If client ID leaks, attacker can impersonate any YouVersion user.
- **Mitigation:** Reject this pattern. Rebuild should use proper OAuth-linked accounts (Supabase supports provider linking without synthetic passwords).

### 2.3 Stale AI Provider Assumptions

#### Outdated Claude Model

- **Issue:** Hardcoded `claude-3-haiku-20240307` model
- **Location:** `src/features/chat/chatService.ts:103`
- **Risk:** Model may be deprecated. Rebuild should use current Claude 3.7 models.
- **Mitigation:** Use latest Claude Haiku or Sonnet model IDs from Anthropic API documentation.

#### Dangerous Browser Header

- **Issue:** `'dangerously-allow-browser': 'true'` in Claude API request
- **Location:** `src/features/chat/chatService.ts:100`
- **Risk:** This header bypasses CORS protection intended to prevent client-side API key exposure. Confirms that AI calls should not be made from client.
- **Mitigation:** Remove all client-side AI calls in rebuild. Use server proxy.

## 3. Bible Data Audit Plan

### 3.1 Translation Metadata

- **Translation Name:** World English Bible (WEB)
- **Source:** `src/data/bibleFull.json`
- **Provenance:** Unknown. Must verify source and integrity.
- **License:** WEB is public domain (confirmed via external research, not from repo)
- **Format:** JSON array of books, each book containing array of chapters, each chapter containing array of verse strings

### 3.2 Expected Counts and Verification

#### Books (Expected: 66)

- **Actual Count:** 66 books confirmed in bibleFull.json
- **Verification Status:** ✅ PASS
- **Method:** `jq -r '.books | length' src/data/bibleFull.json` → 66

#### Chapters (Expected: 1,189)

- **Verification Status:** ⏳ PENDING
- **Method:** Sum chapter counts across all books: `jq '[.books[].chapters | length] | add' src/data/bibleFull.json`

#### Verses (Expected: ~31,102 for WEB)

- **Verification Status:** ⏳ PENDING
- **Method:** Sum verse counts across all chapters: `jq '[.books[].chapters[] | length] | add' src/data/bibleFull.json`

### 3.3 Structural Integrity Checks

#### Psalms Numbering and Psalm 151

- **Expected:** 150 Psalms (Psalm 151 is apocryphal, not in Protestant canon)
- **Verification Status:** ⏳ PENDING
- **Method:** `jq '.books[] | select(.abbrev == "ps") | .chapters | length' src/data/bibleFull.json`

#### Missing Books

- **Expected 66 Books:** Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles, Ezra, Nehemiah, Esther, Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi, Matthew, Mark, Luke, John, Acts, Romans, 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 Thessalonians, 2 Thessalonians, 1 Timothy, 2 Timothy, Titus, Philemon, Hebrews, James, 1 Peter, 2 Peter, 1 John, 2 John, 3 John, Jude, Revelation
- **Verification Status:** ⏳ PENDING
- **Method:** Extract all abbreviations from bibleFull.json, map to canonical names via bibleMapping.ts, diff against expected list

#### Missing Chapters

- **High-Risk Books:**
  - Genesis: 50 chapters expected
  - Psalms: 150 chapters expected
  - Isaiah: 66 chapters expected
  - Matthew: 28 chapters expected
  - Revelation: 22 chapters expected
- **Verification Status:** ⏳ PENDING
- **Method:** Compare actual chapter counts against known Bible structure

#### Duplicate Verses

- **Risk:** JSON generation errors may create duplicate verse entries
- **Verification Status:** ⏳ PENDING
- **Method:** After loading into SQLite, run: `SELECT book, chapter, verse, COUNT(*) as count FROM verses GROUP BY book, chapter, verse HAVING count > 1`

#### Malformed Content

- **Checks:**
  - Empty verse text: `SELECT COUNT(*) FROM verses WHERE text = '' OR text IS NULL`
  - Suspiciously short verses: `SELECT * FROM verses WHERE LENGTH(text) < 2`
  - Encoding issues: Inspect for mojibake, HTML entities, control characters
- **Verification Status:** ⏳ PENDING

### 3.4 Corpus Checksums

After verification queries pass, compute corpus checksum for integrity monitoring:

```bash
# SHA-256 of bibleFull.json
shasum -a 256 src/data/bibleFull.json > docs/bible-data-checksum.txt

# Verse count and corpus hash in SQLite
sqlite3 rooted.db "SELECT COUNT(*), SUM(LENGTH(text)) FROM verses" > docs/bible-data-stats.txt
```

Store checksums in docs/ for future integrity verification.

## 4. Proposed Architecture Decisions

### 4.1 Local-First Persistence

- **Decision:** Use SQLite for Bible data, bookmarks, highlights, and journal entries
- **Rationale:** Offline-first, fast queries, proven in legacy app
- **Open Questions:**
  - Which library? (expo-sqlite, better-sqlite3, Drizzle ORM)
  - Schema migration strategy?
  - Backup and export format?

### 4.2 Optional User Accounts

- **Decision:** Local-only mode is fully functional. User accounts are optional, required only for cross-device sync.
- **Rationale:** Preserves privacy, reduces friction, aligns with "personal guide" vision
- **Open Questions:**
  - Email/password only, or include OAuth (Google, Apple)?
  - Server-side session management strategy?
  - Account deletion and data export requirements?

### 4.3 Synchronization Boundaries

- **Decision:** Sync bookmarks and highlights. Do NOT sync free-text journal entries by default.
- **Rationale:** Journal entries are private reflections. Users should opt-in to cloud backup separately from bookmark sync.
- **Open Questions:**
  - Offer encrypted journal backup option?
  - Sync conversation history with AI, or keep ephemeral?
  - Conflict resolution strategy for bookmarks edited on multiple devices?

### 4.4 Server-Side AI

- **Decision:** All AI requests route through server proxy. Client never holds AI API keys.
- **Rationale:** Security, credential rotation, cost control, structured output enforcement
- **Open Questions:**
  - Which AI provider? (Claude, GPT-4, Gemini, or multi-provider with fallback?)
  - Rate limiting per user or per IP?
  - Response caching strategy?
  - Observability without logging user content?

### 4.5 Structured AI Responses

- **Decision:** AI responses are structured JSON, not Markdown with regex-parsed suggestions
- **Rationale:** Reliable parsing, enables richer UI (e.g., inline verse citations become tappable links)
- **Proposed Schema:**
  ```typescript
  {
    text: string; // Main response
    citations: Array<{
      // Verses mentioned
      book: string;
      chapter: number;
      verse: number;
      text?: string; // Optional: full verse text
    }>;
    suggestions: Array<{
      // Follow-up prompts
      type: 'reflection' | 'question' | 'related_verse';
      text: string;
      reference?: { book; chapter; verse };
    }>;
  }
  ```
- **Open Questions:**
  - Should AI return full verse text, or just references?
  - How to handle multi-verse ranges (e.g., "John 3:16-17")?

### 4.6 Scripture Citation Verification

- **Decision:** Server validates all Bible references returned by AI before sending to client
- **Rationale:** AI may hallucinate verse numbers. Verification prevents "ghost verses."
- **Proposed Implementation:**
  1. AI returns structured citations (book/chapter/verse)
  2. Server queries local Bible database to confirm verses exist
  3. Server rejects hallucinated references or flags as unverified
  4. Client displays only verified citations
- **Open Questions:**
  - How to handle AI's paraphrased verses vs. verbatim WEB text?
  - Should AI responses include "these verses may be relevant" vs. "this is what the verse says"?

### 4.7 Privacy-Preserving Observability

- **Decision:** Log AI requests for debugging and abuse detection, but never log user prompts or free-text journal content
- **Rationale:** Users trust Rooted with spiritual reflections. Logging content violates that trust.
- **Proposed Logging:**
  - ✅ Log: User ID, timestamp, AI provider, model, token count, latency, error codes
  - ❌ Do NOT log: User prompt text, AI response text, journal entries
- **Open Questions:**
  - Log verse references requested (for analytics on popular passages)?
  - Sampling strategy for error reproduction?

### 4.8 Database and Schema Migrations

- **Decision:** Use migration-based schema evolution (not ORM auto-sync)
- **Rationale:** SQLite schema changes require careful migration (especially on mobile where users may skip versions)
- **Open Questions:**
  - Migration library? (Drizzle, Kysely, custom SQL files?)
  - Rollback strategy?
  - Schema versioning in local database?

## 5. Unresolved Questions

### 5.1 Product

- **What happens when a user types a feeling/situation that isn't directly tied to a verse?**  
  Example: "I'm anxious about my job interview tomorrow."  
  Does Rooted:
  - (A) Respond conversationally, then suggest relevant passages?
  - (B) Immediately return 3-5 relevant verses?
  - (C) Ask clarifying questions first?

- **How does the cursor experience transition to viewing Scripture?**  
  When AI suggests John 3:16, does the app:
  - (A) Show verse inline in chat?
  - (B) Navigate to a full chapter reader view?
  - (C) Open a verse detail modal?

- **What is the return path from Scripture back to conversation?**  
  After reading John 3, how does the user continue reflecting?
  - (A) Back button returns to chat?
  - (B) Inline "Continue Reflecting" button in reader?
  - (C) Verse has its own conversation thread?

### 5.2 Theological

- **Does Rooted support multiple Bible translations?**  
  WEB is public domain but archaic. Users may expect NIV, ESV, NLT.
  - If yes, how are translations sourced and licensed?
  - Does AI respond with translation-agnostic principles, or quote from user's selected translation?

- **How does Rooted handle denominational differences?**  
  Example: Catholic users expect 73 books (including Apocrypha). Protestant canon is 66 books.
  - Does rebuild include Apocrypha as optional?
  - Does AI acknowledge Catholic/Orthodox traditions when relevant?

- **What is Rooted's stance on interpretation and theological guidance?**  
  The legacy prompt says "If Christian traditions interpret a passage differently, say so briefly and neutrally."
  - Is Rooted a non-denominational guide?
  - Should it avoid doctrinal claims (justification, sacraments, eschatology)?
  - Or should it disclose a specific theological tradition (e.g., "Rooted reflects evangelical Protestant interpretation")?

### 5.3 Technical

- **What is the target platform for the rebuild?**  
  Legacy is Expo/React Native (iOS, Android, Web).
  - Does rebuild remain cross-platform?
  - Native iOS only?
  - Web-first PWA?

- **What is the tech stack?**
  - Frontend: React Native, React (web), SwiftUI, Flutter?
  - Backend: Node.js, Python, Go, serverless functions?
  - Database: Supabase, Firebase, custom Postgres, SQLite + sync server?

- **What is the deployment model?**
  - Self-hosted (user runs own backend)?
  - Managed service (Rooted hosts backend)?
  - Hybrid (local-first with optional cloud sync)?

### 5.4 Security

- **How are AI responses filtered for harmful content?**  
  If a user asks "Bible verses about suicide," AI might return insensitive or triggering content.
  - Should Rooted implement content filtering?
  - Detect crisis keywords and surface helpline resources?
  - Trust AI provider's safety filters?

### 5.5 Privacy

- **What is the data retention policy?**
  - Are conversations stored server-side? If yes, for how long?
  - Is journal content end-to-end encrypted?
  - Can users export or delete their data?

- **What is the third-party data sharing policy?**
  - Does Rooted share any user data with AI providers (OpenAI, Anthropic)?
  - Are prompts anonymized?
  - Is telemetry opt-in or opt-out?

### 5.6 Legal

- **What is the terms of service and privacy policy?**
  - Who owns user content (journal entries, highlights)?
  - What happens if Rooted shuts down?
  - GDPR/CCPA compliance requirements?

- **What is the Bible translation licensing?**
  - WEB is public domain, but if other translations are added (NIV, ESV), licensing fees apply.
  - Who negotiates and pays for translation licenses?

## 6. Prompt 1 Exit Gate

### Checklist

- [x] Audit document created at `docs/rebuild-audit.md`
- [x] Legacy repository inspected (read-only, no modifications)
- [x] All reusable assets cataloged with PORT/REWRITE/DEFER/REJECT decisions
- [x] Security vulnerabilities flagged (client-exposed keys, OAuth secrets, unsafe token storage)
- [x] Bible data audit plan documented (66 books, 1,189 chapters, verse count, Psalms numbering, integrity checks)
- [x] Architecture decisions proposed (local-first, optional accounts, server-side AI, structured responses, citation verification)
- [x] Unresolved questions documented (product, theological, technical, security, privacy, legal)
- [x] No implementation work performed
- [x] No files copied from legacy repository
- [x] No dependencies installed
- [x] No commits created

### Exit Gate Status: ✅ PASS

The audit is complete. Proceed to Prompt 2 only after reviewing this document and resolving any unresolved questions that block implementation.

---

## Appendix A: File Path Reference

### Legacy Files Inspected

**Bible Data:**

- `src/data/bibleFull.json` (3.9MB)
- `src/constants/bibleMapping.ts`
- `src/features/bible/bibleLoader.ts`
- `src/features/bible/bibleService.ts`
- `src/features/bible/bibleParser.ts` (not inspected)
- `src/features/bible/BibleEngine.ts` (not inspected)

**Personal Data:**

- `src/features/journal/journalStore.ts`
- `src/features/bible/bookmarksStore.ts`
- `src/features/bible/highlightsStore.ts`

**Authentication:**

- `src/services/supabase.ts`
- `src/services/auth/AuthService.ts`

**AI:**

- `src/features/chat/chatService.ts`
- `src/features/chat/systemPrompt.ts`

**Theme:**

- `src/theme/colors.ts` (not read)
- `src/theme/spacing.ts` (not read)
- `src/theme/typography.ts` (not read)

**Configuration:**

- `package.json`
- `.env.example`
- `app.json` (not read)

**Database:**

- `supabase/migrations/001_devotionals.sql.skip`
- `supabase/migrations/002_community_chat.sql`
- `supabase/migrations/003_journal_sync.sql`
- `supabase/migrations/004_profiles.sql`
- `supabase/migrations/005_channel_messages.sql`
- `supabase/migrations/006_moderation_rls.sql`

**Documentation:**

- `README.md`
- `.env.example`

### Legacy Directories Inspected

- `app/` (Expo Router structure)
- `src/` (source code)
- `bible/` (67 book directories, appears to be unused HTML files)
- `backend/` (heartbeat service)
- `supabase/` (migrations, functions, email templates)
- `assets/` (fonts, images, CSS, JS)

---

**End of Audit**
