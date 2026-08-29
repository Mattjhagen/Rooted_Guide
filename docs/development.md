## Rooted Development Guide

## Prerequisites

- Node.js 22+ (current LTS)
- npm 10+
- iOS Simulator (Xcode) or Android Emulator
- Expo CLI 57+

## Installation

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Available Commands

### Development

```bash
npm start              # Start Expo dev server
npm run ios            # Open iOS simulator
npm run android        # Open Android emulator
npm run web            # Open web browser
```

### Quality Checks

```bash
npm run typecheck      # TypeScript type checking
npm run lint           # ESLint
npm run lint:fix       # Auto-fix lint issues
npm run format         # Format code with Prettier
npm run format:check   # Check formatting
npm test               # Run Jest tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### Combined Check

```bash
# Run all checks (recommended before commit)
npm run typecheck && npm run lint && npm run format:check && npm test
```

## Project Structure

See [architecture.md](./architecture.md) for detailed structure.

## Testing

Tests are located in `src/__tests__/` and use Jest with React Native Testing Library.

```bash
# Run all tests
npm test

# Run specific test file
npm test -- VerseRef.test.ts

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Code Style

- **TypeScript:** Strict mode enabled, no `@ts-ignore`
- **Linting:** ESLint with Expo config + Prettier
- **Formatting:** Prettier with 100-character line width
- **Naming:**
  - Components: PascalCase (`Composer.tsx`)
  - Hooks: camelCase with `use` prefix (`useGuide.ts`)
  - Files: Match export name
  - Interfaces: PascalCase, no `I` prefix

## Path Aliases

The project uses TypeScript path aliases:

```typescript
import { BibleBook } from '@/domain/models';
import { useGuide } from '@/features/guide/useGuide';
import { Composer } from '@/ui/components';
```

`@/` maps to `src/` directory.

## Adding New Features

1. **Domain Model** - Define entities in `src/domain/models/`
2. **Repository Interface** - Define data access in `src/domain/repositories/`
3. **Infrastructure** - Implement interface in `src/infrastructure/`
4. **Feature Logic** - Create hooks in `src/features/`
5. **UI Components** - Build components in `src/ui/components/`
6. **Screen** - Compose in `app/` screens
7. **Tests** - Add tests in `src/__tests__/`

## Accessibility

All UI components must support:

- Screen reader labels (`accessibilityLabel`)
- Semantic roles (`accessibilityRole`)
- Dynamic Type (no fixed font sizes)
- Minimum 44pt touch targets
- Sufficient color contrast (WCAG AA)

## Performance

- Use `React.memo()` for expensive components
- Use `useMemo()` and `useCallback()` for expensive calculations
- Profile with React DevTools before optimizing

## Debugging

### React Native Debugger

```bash
# Enable debug menu
# iOS: Cmd+D in simulator
# Android: Cmd+M in emulator
```

### Logs

```bash
# View logs
npx expo start --clear

# iOS logs
xcrun simctl spawn booted log stream --predicate 'process == "Expo"'

# Android logs
adb logcat *:S ReactNative:V ReactNativeJS:V
```

## Common Issues

### Metro bundler cache

```bash
npm start -- --clear
rm -rf node_modules/.cache
```

### Simulator not responding

```bash
# Reset iOS simulator
xcrun simctl erase all

# Restart Android emulator
adb reboot
```

### Type errors after dependency update

```bash
npm run typecheck
rm -rf node_modules
npm install
```

## CI/CD

GitHub Actions runs on every push and PR:

- Type checking
- Linting
- Format checking
- Tests with coverage

See `.github/workflows/ci.yml` for configuration.

## Environment Variables

**Current:** No environment variables required (uses mock implementations)

**Future:** Environment configuration will be added when connecting to:

- Production AI gateway
- Authentication service
- Cloud sync service

## Deployment

**Current:** Not yet configured (Prompt 2 is foundation only)

**Future:** Deployment will be configured in later prompts:

- Expo Application Services (EAS)
- App Store Connect (iOS)
- Google Play Console (Android)
