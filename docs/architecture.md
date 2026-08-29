# Plumb Line Architecture

**Repository:** Rooted_Guide  
**Application:** Plumb Line

## Overview

Plumb Line is built with a clean, feature-oriented architecture that maintains clear boundaries between UI, domain logic, persistence, and external services.

## Directory Structure

```
Rooted_Guide/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Main guide screen
├── src/
│   ├── domain/              # Core business logic (framework-agnostic)
│   │   ├── models/          # Domain entities and value objects
│   │   ├── repositories/    # Data access interfaces
│   │   └── services/        # External service interfaces
│   ├── features/            # Feature-specific logic
│   │   └── guide/           # Guide conversation feature
│   ├── infrastructure/      # Technical implementations
│   │   ├── adapters/        # Mock implementations and test fixtures
│   │   └── persistence/     # Database implementations (future)
│   ├── ui/                  # Presentation layer
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks (future)
│   │   └── theme/           # Design system tokens
│   └── __tests__/           # Test files
├── docs/                    # Documentation
└── assets/                  # Static assets
```

## Architectural Layers

### 1. Domain Layer (`src/domain/`)

**Purpose:** Framework-agnostic core business logic

**Contents:**

- **Models:** TypeScript interfaces and enums for domain entities
  - `BibleBook`, `VerseRef`, `Verse`
  - `GuideThread`, `GuideTurn`, `ScriptureCitation`
  - `Note`, `Bookmark`, `Highlight`
  - `Preferences`

- **Repositories:** Interfaces for data access
  - `BibleRepository` - Scripture text access
  - `GuideThreadRepository` - Conversation persistence
  - `NotesRepository` - User notes
  - `BookmarkRepository` - Verse bookmarks
  - `HighlightRepository` - Verse highlights
  - `PreferencesRepository` - User preferences

- **Services:** Interfaces for external services
  - `GuideGateway` - AI-powered guide (interface only in Prompt 2)
  - `AuthGateway` - Authentication (interface only in Prompt 2)
  - `SyncGateway` - Cloud sync (interface only in Prompt 2)

**Rules:**

- No framework dependencies (React, Expo, etc.)
- No direct database access
- Only interfaces and pure TypeScript

### 2. Features Layer (`src/features/`)

**Purpose:** Use cases and feature-specific logic

**Contents:**

- `guide/` - Guide conversation logic
  - `useGuide.ts` - React hook for conversation state

**Rules:**

- May depend on domain layer
- May use React hooks
- Orchestrates repositories and services
- No direct UI rendering

### 3. Infrastructure Layer (`src/infrastructure/`)

**Purpose:** Technical implementations of domain interfaces

**Contents:**

- `adapters/` - Implementations
  - `MockGuideGateway` - Deterministic mock AI responses
  - `MockBibleRepository` - In-memory Bible repository
  - `testFixtures.ts` - Test Scripture corpus

**Future:**

- `persistence/` - SQLite implementations
- `network/` - HTTP clients and API adapters

**Rules:**

- Implements domain interfaces
- Contains framework-specific code
- Handles persistence, network, platform APIs

### 4. UI Layer (`src/ui/`)

**Purpose:** Presentation and user interaction

**Contents:**

- `components/` - Reusable React Native components
  - `Composer` - Multiline text input with submit
  - `GuideMessage` - User/guide message bubble
  - `CitationCard` - Scripture citation display
- `theme/` - Design system tokens
  - `colors.ts` - Light/dark color palettes
  - `spacing.ts` - Spacing scale
  - `typography.ts` - Text styles

**Rules:**

- Only UI and presentation logic
- Depends on domain models for types
- Uses features hooks for business logic
- No direct repository or service access

### 5. App Layer (`app/`)

**Purpose:** Expo Router screens and navigation

**Contents:**

- `_layout.tsx` - Root layout with StatusBar
- `index.tsx` - Main guide screen (cursor → conversation)

**Rules:**

- Minimal logic (composition only)
- Wires together features and UI components
- Manages navigation and routing

## Dependency Rules

```
app/          →  ui/  →  features/  →  domain/
                 ↓         ↓            ↑
            infrastructure/ ───────────┘
```

- **Domain** has no dependencies on other layers
- **Features** depend only on domain
- **Infrastructure** implements domain interfaces
- **UI** depends on domain (types) and features (hooks)
- **App** composes UI, features, and infrastructure

## Data Flow

### 1. User Input → Guide Response

```
User types → Composer.onSubmit()
           → useGuide.sendMessage()
           → GuideGateway.sendMessage()
           → MockGuideGateway (deterministic response)
           → GuideTurn added to state
           → GuideMessage renders turn
           → CitationCard loads verse from BibleRepository
```

### 2. Citation Resolution

```
GuideTurn.citations → CitationCard
                   → BibleRepository.getVerse()
                   → MockBibleRepository (test fixture)
                   → Verse displayed
```

## Testing Strategy

- **Unit tests:** Domain model validation, mock implementations
- **Hook tests:** `useGuide` state management
- **Integration tests:** Full cursor→response→citation flow
- **Component tests:** UI components in isolation (future)

## Provisional Decisions

These decisions are intentionally temporary for Prompt 2:

1. **Mock implementations** - Real database and AI will be added later
2. **Test fixture corpus** - Production Bible data in Prompt 3
3. **Single-screen navigation** - Multi-screen navigation in later prompts
4. **No authentication** - Auth implementation in dedicated prompt
5. **No cloud sync** - Sync implementation after local persistence is stable

## Future Capabilities by Prompt

- **Prompt 3:** Production Bible corpus import and verification
- **Prompt 4:** Local SQLite persistence for notes/bookmarks/highlights
- **Prompt 5:** Server-side AI gateway with structured responses
- **Prompt 6:** Verse reader and multi-screen navigation
- **Prompt 7:** User accounts and authentication
- **Prompt 8:** Cloud sync for bookmarks/highlights (not journal)
- **Prompt 9:** Full accessibility audit and polish
- **Prompt 10:** Production deployment and monitoring
